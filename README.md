# FiscalScape — Interactive Fiscal Research Companion

UI statis untuk mendampingi penelitian **Posisi dan Keberlanjutan Fiskal Indonesia di antara Ekonomi Asia Terpilih: Analisis Konvergensi, Klasterisasi, dan Fungsi Reaksi Fiskal, 2014–2024**.

Website hanya merender keluaran penelitian yang telah dibekukan. Browser tidak mengestimasi ulang konvergensi, K-Means, PCA, atau Fiscal Reaction Function. Cabang regional WEO/Fiscal Monitor dan cabang respons GFS S13 tetap terpisah; integrasi dilakukan pada tingkat bukti.

## Pratinjau lokal

Dari direktori `web/`:

```sh
python3 -m http.server 8000
```

Buka `http://localhost:8000`. Jangan membuka `index.html` melalui `file://` karena browser membatasi pemuatan JSON lokal.

Apache ECharts 5.6 dimuat dari jsDelivr. Jika CDN tidak tersedia, area grafik menampilkan pesan fallback. Untuk deployment offline, unduh ECharts dan ganti sumber skrip di `index.html`.

## Data dan validasi

JSON deployment di `data/generated/` tidak boleh diedit manual. Dari root repositori:

```sh
python3 scripts/web/validate_web_data.py
python3 scripts/web/validate_ui_contract.py
```

`pages/methodology.html` menjelaskan desain, sampel, metode, komparabilitas lintas sumber, dan batasan ilmiah.

Tombol **Kamus data** pada bagian Data & Metode membuka tampilan interaktif dari `data/generated/data_dictionary.json`, lengkap dengan pencarian dan filter istilah umum/dataset.

Stage 03 menambahkan visual QA dan polish tanpa mengubah arah desain: offset anchor untuk header sticky, skip link yang hanya muncul saat fokus, menu mobile dengan dukungan Escape, formatter angka Indonesia terpusat, chart responsif, forest plot terkelompok, dan transisi naratif antarmodul. Screenshot final tersedia di `../docs/web/screenshots/stage03/`.
