#!/usr/bin/env python3
"""Deploy dist/claude to a Linux VPS over SSH. Secrets via env only."""
from __future__ import annotations

import hashlib
import os
import stat
import sys
import time
from pathlib import Path

import paramiko

ROOT = Path(__file__).resolve().parents[1]
BIN = ROOT / "dist" / "claude"


def require(name: str) -> str:
    v = os.environ.get(name, "").strip()
    if not v:
        raise SystemExit(f"missing env {name}")
    return v


def main() -> None:
    host = require("DEPLOY_HOST")
    port = int(os.environ.get("DEPLOY_PORT", "22"))
    user = require("DEPLOY_USER")
    password = os.environ.get("DEPLOY_PASS", "")
    key_path = os.environ.get("DEPLOY_SSH_KEY", "")
    token = require("ANTHROPIC_AUTH_TOKEN")
    if not BIN.is_file():
        raise SystemExit(f"missing binary {BIN}")

    data = BIN.read_bytes()
    sha = hashlib.sha256(data).hexdigest()
    print(f"local sha256={sha} size={len(data)}")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    kwargs = {"hostname": host, "port": port, "username": user, "timeout": 30}
    if key_path:
        kwargs["key_filename"] = key_path
    elif password:
        kwargs["password"] = password
    else:
        raise SystemExit("set DEPLOY_SSH_KEY or DEPLOY_PASS")
    client.connect(**kwargs)

    def run(cmd: str, check: bool = True) -> str:
        _i, o, e = client.exec_command(cmd)
        out = o.read().decode()
        err = e.read().decode()
        code = o.channel.recv_exit_status()
        if check and code != 0:
            raise SystemExit(f"cmd failed ({code}): {cmd}\n{out}\n{err}")
        return out + err

    remote_dir = "/opt/claude-code"
    remote_bin = f"{remote_dir}/claude"
    env_file = "/etc/claude-code-router.env"
    wrapper = "/usr/local/bin/claude"
    stamp = time.strftime("%Y%m%d%H%M%S")

    run(f"mkdir -p {remote_dir}")
    run(
        f"if [ -f {remote_bin} ]; then cp -a {remote_bin} {remote_bin}.bak.{stamp}; fi",
        check=False,
    )

    sftp = client.open_sftp()
    tmp = f"{remote_bin}.new"
    print(f"uploading to {tmp} ...")
    sftp.put(str(BIN), tmp)
    sftp.chmod(tmp, 0o755)
    sftp.close()

    run(f"mv {tmp} {remote_bin}")
    run(f"echo '{sha}  {remote_bin}' | sha256sum -c -")

    env_body = (
        "ANTHROPIC_BASE_URL=https://xd-vps-production.up.railway.app/v1\n"
        "ANTHROPIC_MODEL=main\n"
        f"ANTHROPIC_AUTH_TOKEN={token}\n"
        f"ANTHROPIC_API_KEY={token}\n"
        "USE_BUILTIN_RIPGREP=0\n"
    )
    # write via sftp to avoid shell quoting issues
    sftp = client.open_sftp()
    with sftp.file(env_file, "w") as f:
        f.write(env_body)
    sftp.chmod(env_file, 0o600)
    wrap = (
        "#!/bin/bash\n"
        "set -a\n"
        f". {env_file}\n"
        "set +a\n"
        f'exec {remote_bin} "$@"\n'
    )
    with sftp.file(wrapper, "w") as f:
        f.write(wrap)
    sftp.chmod(wrapper, 0o755)
    sftp.close()

    run("command -v rg >/dev/null || (apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y ripgrep)", check=False)
    print(run("claude --version"))
    print(run("claude --help | head -n 8"))
    # light router smoke
    print(run('claude -p "Reply with exactly: OK" --output-format text', check=False)[:500])
    client.close()
    print(f"OK deployed. rollback: cp -a {remote_bin}.bak.{stamp} {remote_bin}")


if __name__ == "__main__":
    main()
