# 🔌 OpenAI-Compatible Router — Setup & Prompt

Konfigurasi ini mengarahkan runtime ke sebuah router endpoint berformat **OpenAI-compatible (`/v1`)** yang berjalan di VPS Docker. Tidak ada dependensi tambahan yang diunduh; cukup atur environment di bawah lalu jalankan.

## 🎯 Target Endpoint

| Key            | Value                                            |
| -------------- | ------------------------------------------------ |
| API Base URL   | `https://xd-vps-production.up.railway.app/v1`     |
| API Key        | *(set via env — never commit)*                   |
| Model          | `main`                                           |
| Auth Scheme    | `Bearer`                                         |

## ⚙️ Environment Variables (PowerShell / CMD)

**PowerShell:**
```powershell
$env:ANTHROPIC_BASE_URL  = "https://xd-vps-production.up.railway.app/v1"
$env:ANTHROPIC_AUTH_TOKEN = "<your-router-token>"
$env:ANTHROPIC_MODEL      = "main"
$env:ANTHROPIC_API_KEY    = "<your-router-token>"
```

**CMD:**
```cmd
set ANTHROPIC_BASE_URL=https://xd-vps-production.up.railway.app/v1
set ANTHROPIC_AUTH_TOKEN=<your-router-token>
set ANTHROPIC_MODEL=main
set ANTHROPIC_API_KEY=<your-router-token>
```

> Jika runtime memakai konfigurasi persisten `settings.json`, tempatkan nilai yang sama di bagian `env` (jangan commit token).

## 🚀 Menjalankan

Setelah variabel di atas diset di sesi yang sama:

```bash
claude
```

Cek koneksi dengan request uji langsung ke router:

```powershell
curl.exe -s https://xd-vps-production.up.railway.app/v1/models `
  -H "Authorization: Bearer $env:ANTHROPIC_AUTH_TOKEN"
```

## 📝 Prompt Runtime (dipakai sebagai prompt utama)

> Kamu adalah asisten coding terminal yang andal. Seluruh request model dirutekan melalui endpoint OpenAI-compatible di `https://xd-vps-production.up.railway.app/v1` memakai model `main` dengan auth Bearer dari environment.
>
> Aturan kerja:
> 1. Jalankan tugas secara langsung tanpa basa-basi.
> 2. Prioritaskan penggunaan tool terminal (baca, tulis, edit, jalankan shell) daripada menjelaskan.
> 3. Jika perintah gagal, baca errornya, perbaiki, lalu ulangi.
> 4. Selesaikan sampai tuntas; jangan berhenti di tengah jalan kecuali ada blocker nyata.
> 5. Balas singkat dan padat dalam bahasa pengguna.

## ✅ Verifikasi

1. Endpoint `/v1/models` mengembalikan daftar model (harus memuat `main`).
2. Sesi berjalan tanpa error auth (401/403).
3. Setiap interaksi memakai model `main` sesuai log request.

---

_File konfigurasi runtime. Token hanya lewat env / secret store — jangan hardcode di Git._
