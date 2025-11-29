# Rencana Pembuatan Web Note Sederhana

## Overview
Membuat aplikasi web note sederhana dengan autentikasi Clerk, tampilan minimalis mobile-friendly, dan hosting di Netlify dengan database Neon.

## Teknologi Stack
- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Autentikasi**: Clerk
- **Backend**: Netlify Serverless Functions
- **Database**: Neon (PostgreSQL)
- **Hosting**: Netlify

## Struktur Proyek
```
clerkauth/
├── index.html              # Halaman utama
├── css/
│   └── style.css          # Stylesheet minimalis dan mobile-friendly
├── js/
│   ├── auth.js            # Logika autentikasi Clerk
│   ├── notes.js           # Logika CRUD notes
│   └── app.js             # Logika utama aplikasi
├── netlify/
│   └── functions/
│       ├── create-note.js # Serverless function untuk create
│       ├── read-notes.js  # Serverless function untuk read
│       ├── update-note.js # Serverless function untuk update
│       └── delete-note.js # Serverless function untuk delete
└── netlify.toml           # Konfigurasi Netlify
```

## Database Schema (Neon)
```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Arsitektur Aplikasi

### Flow Autentikasi
1. User membuka aplikasi
2. Cek status autentikasi dengan Clerk
3. Jika belum login, tampilkan form login
4. Jika sudah login, tampilkan dashboard notes

### Flow CRUD Notes
1. **Create**: User input judul dan konten → Kirim ke serverless function → Simpan ke Neon
2. **Read**: Request ke serverless function → Ambil data dari Neon → Tampilkan di UI
3. **Update**: User edit note → Kirim ke serverless function → Update di Neon
4. **Delete**: User konfirmasi delete → Kirim ke serverless function → Hapus dari Neon

## UI/UX Design
- **Minimalis**: Fokus pada konten, tanpa elemen yang tidak perlu
- **Mobile-first**: Desain responsif untuk mobile dan desktop
- **Komponen Utama**:
  - Header dengan tombol login/logout
  - List notes dengan preview
  - Form create/edit note
  - Modal konfirmasi delete

## API Endpoints (Netlify Functions)
- `/.netlify/functions/create-note` - POST: Membuat note baru
- `/.netlify/functions/read-notes` - GET: Mengambil semua notes user
- `/.netlify/functions/update-note` - PUT: Update note existing
- `/.netlify/functions/delete-note` - DELETE: Hapus note

## Environment Variables
- `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key (server-side)
- `DATABASE_URL` - Neon database connection string

## Deployment Strategy
1. Setup repository di GitHub
2. Connect dengan Netlify
3. Setup environment variables di Netlify
4. Auto-deploy pada push ke main branch

## Prioritas Pengembangan
1. Setup struktur dasar dan autentikasi Clerk
2. Database dan serverless functions
3. Frontend untuk CRUD operations
4. Testing dan optimasi mobile
5. Deployment ke Netlify