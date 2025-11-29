# Panduan Setup Lengkap Web Note dengan Clerk dan Neon

## Langkah-langkah Setup

### 1. Persiapan Akun

#### Setup Clerk
1. Buka [Clerk Dashboard](https://dashboard.clerk.com)
2. Klik "Create Application"
3. Pilih tipe aplikasi: "Web Application"
4. Isi nama aplikasi: "Web Note Sederhana"
5. Pilih authentication providers (Email & Password minimum)
6. Copy **Publishable Key** dan **Secret Key**
7. Di sidebar, pilih "API Keys" untuk melihat keys

#### Setup Neon Database
1. Buka [Neon Console](https://console.neon.tech)
2. Sign up/sign in dengan akun Anda
3. Klik "Create a project"
4. Isi nama project: "web-note-app"
5. Pilih region yang dekat dengan target user
6. Copy **connection string** (akan digunakan sebagai DATABASE_URL)

### 2. Setup Environment Variables

#### Untuk Development Lokal
1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Isi file `.env` dengan credentials Anda:
   ```
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
   CLERK_SECRET_KEY=your_clerk_secret_key_here
   DATABASE_URL=your_neon_connection_string_here
   NODE_ENV=development
   ```

#### Untuk Production (Netlify)
1. Buka Netlify Dashboard
2. Pilih site Anda
3. Go to **Site settings** > **Environment variables**
4. Add variables:
   - `CLERK_SECRET_KEY`: your_clerk_secret_key_here
   - `DATABASE_URL`: your_neon_connection_string_here
   - `NODE_ENV`: production

### 3. Update Kode dengan Credentials Anda

#### Update Clerk Publishable Key
Buka file [`js/auth.js`](js/auth.js:15) dan update line ini:
```javascript
this.clerk = new Clerk('YOUR_CLERK_PUBLISHABLE_KEY');
```

Ganti dengan publishable key dari Clerk:
```javascript
this.clerk = new Clerk('your_clerk_publishable_key_here');
```

### 4. Setup Database Schema

#### Otomatis (Recommended)
Serverless functions akan otomatis membuat tabel saat pertama kali dijalankan. Tidak perlu setup manual.

#### Manual (Optional)
Jika ingin setup manual, jalankan query ini di Neon dashboard:

```sql
CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
```

### 5. Deploy ke Netlify

#### Opsi A: Deploy dari Git
1. Push kode ke GitHub/GitLab
2. Buka [Netlify](https://netlify.com)
3. Klik "Add new site" > "Import an existing project"
4. Connect ke repository Anda
5. Setup build settings:
   - Build command: `npm run build`
   - Publish directory: `.`
6. Add environment variables
7. Deploy!

#### Opsi B: Deploy Manual
1. Siapkan file ZIP dari project
2. Upload ke Netlify drag-and-drop
3. Setup environment variables
4. Deploy!

### 6. Testing

#### Test Autentikasi
1. Buka deployed app
2. Klik tombol login/signup
3. Test dengan email/password
4. Verifikasi user muncul di Clerk dashboard

#### Test CRUD Operations
1. **Create**: Buat note baru
2. **Read**: Lihat daftar notes
3. **Update**: Edit note yang ada
4. **Delete**: Hapus note

#### Test Mobile Responsiveness
1. Buka di mobile browser
2. Test semua fitur
3. Pastikan UI tetap nyaman digunakan

## Troubleshooting Guide

### Clerk Issues

#### "Invalid publishable key"
- Cek apakah key sudah benar di [`js/auth.js`](js/auth.js:15)
- Pastikan tidak ada typo
- Cek di Clerk dashboard apakah key masih aktif

#### "User not authenticated"
- Cek network tab di browser dev tools
- Pastikan Clerk script ter-load dengan benar
- Cek console untuk error messages

### Database Issues

#### "Connection refused"
- Cek DATABASE_URL di environment variables
- Pastikan Neon database aktif
- Cek SSL settings di connection string

#### "Table not found"
- Serverless functions akan otomatis membuat tabel
- Cek logs di Netlify untuk error messages
- Pastikan database connection berhasil

### Netlify Functions Issues

#### "Function timeout"
- Functions timeout setelah 10 detik
- Cek query performance
- Pastikan database connection optimal

#### "Module not found"
- Pastikan `pg` dependency terinstall
- Cek [`package.json`](package.json:7) dependencies
- Re-deploy setelah install dependencies

## Security Checklist

✅ **Clerk Keys**
- Publishable key hanya di client-side
- Secret key hanya di server-side (environment variables)
- Keys tidak di-commit ke repository

✅ **Database**
- Connection string menggunakan SSL
- User permissions minimal (hanya CRUD)
- No raw SQL injection vulnerabilities

✅ **Netlify**
- Environment variables ter-protect
- Functions menggunakan authentication
- CORS properly configured

## Performance Tips

1. **Database Indexing**: Sudah ada index di `user_id` dan `created_at`
2. **Connection Pooling**: PostgreSQL pool digunakan di functions
3. **Caching**: Static assets di-cache di browser
4. **Lazy Loading**: Clerk script di-load dari CDN

## Monitoring

### Clerk Dashboard
- Monitor user registrations
- Track authentication events
- Cek error rates

### Neon Dashboard
- Monitor database performance
- Track query execution times
- Cek connection pool usage

### Netlify Dashboard
- Monitor function invocations
- Track error logs
- Cek build/deploy status

## Next Steps

1. **Custom Domain**: Setup custom domain di Netlify
2. **Analytics**: Tambahkan analytics (Google Analytics, Plausible, dll)
3. **Backup**: Setup database backup schedule
4. **Rate Limiting**: Tambahkan rate limiting untuk API endpoints
5. **Rich Text**: Upgrade ke rich text editor (Quill, TinyMCE, dll)

## Dukungan

Jika mengalami masalah:
1. Cek troubleshooting guide di atas
2. Cek logs di Netlify dashboard
3. Buat issue di GitHub repository
4. Hubungi support Clerk/Neon jika perlu

---

**Selamat mencoba!** 🚀