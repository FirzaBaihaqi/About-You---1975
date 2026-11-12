# About You — Terminal Lyrics

Program Python untuk menampilkan lirik lagu *About You* (The 1975) langsung di terminal VS Code dengan animasi ketik (*typewriter effect*) per huruf yang **disinkronkan dengan ritme vokal asli pada video YouTube resmi** ([tGv7CUutzqU](https://www.youtube.com/watch?v=tGv7CUutzqU)).

Lirik dimulai dari bagian bridge vokal Carly Holt dengan titik acuan `00:00.00` (timestamp `03:01.86` pada video).

### Kelebihan Ritme Presisi (Word/Syllable Cadence):
- **Kata-kata cepat** (seperti *"There was something about you"*, *"on a"*, *"in the"*) muncul mengalir dengan cepat.
- **Kata-kata bernada panjang / ditahan** (seperti *"traaa-in"*, *"re-mem-ber"*, *"youuuuu"*) mengetik melambat sesuai panjang nafas dan nada penyanyi.
- **Jeda nafas dan ketukan drum** pada baris *"Do you think I have forgotten... about you?"* tertahan di layar secara alami sebelum melanjutkan frase berikutnya.

## Cara Menjalankan

Buka video YouTube pada menit **03:01.86**, lalu jalankan di terminal VS Code:

```bash
python karaoke.py
```

Lirik akan langsung muncul mengikuti tempo dan panjang pendek vokal tanpa teks tambahan apapun.

### Opsi Tambahan

- Menambahkan jeda waktu sebelum lirik dimulai (misal 0.5 detik):
  ```bash
  python karaoke.py --delay 0.5
  ```
- Menggunakan pembacaan file LRC standar:
  ```bash
  python karaoke.py --standard-lrc
  ```
- Menggunakan file `.lrc` lain:
  ```bash
  python karaoke.py nama_file.lrc
  ```

## Menjalankan Tes

```bash
python -m unittest -v
```
