# Web Note Sederhana dengan Clerk Login

Aplikasi web note sederhana dengan autentikasi Clerk, tampilan minimalis mobile-friendly, dan hosting di Netlify dengan database Neon PostgreSQL.

## Fitur

- ✅ Autentikasi dengan Clerk
- ✅ Tampilan minimalis dan mobile-friendly
- ✅ CRUD operations untuk notes
- ✅ Serverless functions di Netlify
- ✅ Database Neon PostgreSQL
- ✅ Responsive design
- ✅ Keyboard shortcuts
- ✅ Loading states
- ✅ Error handling

## Teknologi Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Autentikasi**: Clerk
- **Backend**: Netlify Serverless Functions
- **Database**: Neon PostgreSQL
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
├── netlify.toml           # Konfigurasi Netlify
├── package.json           # Dependencies dan scripts
└── README.md             # Dokumentasi
```

## Setup dan Konfigurasi

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/web-note-clerk.git
cd web-note-clerk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Clerk

1. Buat akun di [Clerk](https://clerk.com)
2. Buat aplikasi baru
3. Copy **Publishable Key** dan **Secret Key**
4. Update `js/auth.js` dengan publishable key Anda:
   ```javascript
   this.clerk = new Clerk('YOUR_CLERK_PUBLISHABLE_KEY');
   ```

### 4. Setup Neon Database

1. Buat akun di [Neon](https://neon.tech)
2. Buat project dan database baru
3. Copy **connection string**
4. Setup environment variable di Netlify:
   ```
   DATABASE_URL=your_neon_connection_string
   ```

### 5. Setup Environment Variables di Netlify

Tambahkan environment variables berikut di Netlify dashboard:

```
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

### 6. Deploy ke Netlify

1. Connect repository ke Netlify
2. Setup build settings:
   - Build command: `npm run build`
   - Publish directory: `.`
3. Tambahkan environment variables
4. Deploy!

## Penggunaan Lokal

Untuk menjalankan aplikasi secara lokal:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## API Endpoints

Serverless functions tersedia di:

- `POST /.netlify/functions/create-note` - Membuat note baru
- `GET /.netlify/functions/read-notes` - Mengambil semua notes user
- `PUT /.netlify/functions/update-note` - Update note existing
- `DELETE /.netlify/functions/delete-note` - Hapus note

## Keyboard Shortcuts

- `Ctrl/Cmd + N` - Fokus ke form buat note baru
- `Ctrl/Cmd + S` - Simpan note (saat di modal edit)
- `Escape` - Tutup modal

## Database Schema

```sql
CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_created_at ON notes(created_at DESC);
```

## Konfigurasi Environment Variables

### Untuk Development

Buat file `.env` di root directory:

```
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_connection_string
```

### Untuk Production (Netlify)

Setup di Netlify dashboard > Site settings > Environment variables:

```
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_neon_connection_string
NODE_ENV=production
```

## Troubleshooting

### Clerk Authentication Error

- Pastikan publishable key sudah benar di `js/auth.js`
- Cek CORS settings di Clerk dashboard
- Pastikan domain sudah di-whitelist di Clerk

### Database Connection Error

- Cek DATABASE_URL di environment variables
- Pastikan Neon database aktif dan accessible
- Cek SSL settings untuk production

### Serverless Functions Error

- Cek logs di Netlify dashboard
- Pastikan semua dependencies terinstall
- Cek environment variables di Netlify

## Kontribusi

1. Fork repository
2. Buat branch fitur baru (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## Lisensi

MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## Kontak

Jika ada pertanyaan atau masalah, silakan buat issue di GitHub repository.

---

**Happy note-taking!** 📝