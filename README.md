# MISI SAJAK 3D: Pengembaraan Dunia Puisi

Permainan penerokaan 3D pendidikan berasaskan pelayar web untuk murid Tahun 5 sekolah rendah mempelajari **Sajak Bahasa Melayu** melalui pengalaman mengembara di empat buah alam:

1. **Kampung Puisi** – Pengenalan definisi, ciri-ciri sajak, dan pengumpulan 3 Buku Sajak Bercahaya.
2. **Hutan Makna** – Meneroka rangkap, baris, tema, persoalan, dan maksud rangkap melalui sajak asli *"Permata di Taman Ilmu"*.
3. **Tasik Irama & Pavilion Ajaib** – Makmal interaktif intonasi, tekanan suara, jeda (`/` dan `//`), serta **Misi Dengarkan Sajak** bersama Penjaga Sajak (pemain video 16:9 `sajak.mp4` + 5 soalan penghayatan).
4. **Gunung Puisi** – Cabaran Puncak 10 soalan pilihan berganda dengan penerangan lengkap dan sijil penghargaan (PNG).

---

## Teknologi Percuma & Sumber Terbuka
- **Three.js** (grafik 3D WebGL dengan model prosedur & tekstur terbina dalam kod)
- **React + TypeScript + Vite**
- **Tailwind CSS**
- **Web Audio API, Web Speech API & Aset Media Tempatan** (muzik latar *Canggung Instrumental* berulang dan video *sajak.mp4* di dalam `public/assets/aistudio/`)
- **localStorage** (simpanan kemajuan murid secara tempatan tanpa akaun atau pangkalan data)

---

## Cara Menjalankan Secara Tempatan (Local)

```bash
npm install
npm run dev
```

Buka pelayar web pada `http://localhost:3000`.

---

## Cara Mengeksport & Menghoskan di GitHub Pages

Projek ini telah dikonfigurasikan dengan `base: './'` di dalam `vite.config.ts` supaya semua aset berfungsi dengan sempurna di bawah mana-mana sub-laluan GitHub Pages.

### Langkah 1: Bina Fail Produksi
```bash
npm run build
```
Semua fail statik sedia untuk dihoskan akan dijana di dalam folder `dist/`.

### Langkah 2: Terbitkan ke GitHub Pages
Anda boleh memilih salah satu daripada cara berikut:

**Pilihan A — Menggunakan `gh-pages`:**
```bash
npx gh-pages -d dist
```

**Pilihan B — GitHub Actions (Automatik setiap kali `push` ke `main`):**
1. Muat naik kod sumber projek ini ke repositori GitHub anda.
2. Di GitHub, pergi ke **Settings → Pages → Build and deployment** dan pilih **GitHub Actions** (atau muat naik isi kandungan folder `dist/` ke cabang `gh-pages`).
3. Tapak permainan anda boleh diakses terus melalui `https://<nama-pengguna>.github.io/<nama-repositori>/`.
