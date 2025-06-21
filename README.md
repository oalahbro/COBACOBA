# 📱 WA-PENGELUARAN

Bot WhatsApp untuk manajemen pengeluaran harian, income bulanan, dan target tabungan berbasis Google Spreadsheet.

## ✨ Fitur

* ✅ Catat pengeluaran via chat WhatsApp
* 📅 Ringkasan pengeluaran harian
* 💰 Income bulanan + hitung otomatis pengeluaran maksimal harian
* ⚠️ Peringatan jika pengeluaran harian melebihi batas
* 📂 Hapus pengeluaran via reply nomor urut
* 📂 Data tersimpan rapi di Google Spreadsheet

## 🚀 Cara Install & Jalankan

1. **Clone repository**

```bash
git clone https://github.com/oalahbro/WA-PENGELUARAN.git
cd WA-PENGELUARAN
```

2. **Install dependencies**

```bash
npm install
```

3. **Setup Google Sheets**

   * Buat Spreadsheet baru → buat sheet **Transaksi** & **Income**
   * Buat credential `service_account.json` untuk akses Google Sheets
   * Format header sheet **Transaksi**:

```
ID | Timestamp | User | Kategori | Nominal | Deskripsi
```

* Format header sheet **Income**:

```
User | BulanAwal | IncomeBulan | TargetTabungan | MaxHarian
```

4. **Buat file `.env`**

```
GOOGLE_SHEET_ID=<ID Spreadsheet>
```

5. **Jalankan bot**

```bash
node index.js
```

6. **Scan QR → Login WhatsApp**

---

## 🔧 Perintah

| Perintah                                     | Keterangan                                           |
| -------------------------------------------- | ---------------------------------------------------- |
| `+kategori nominal deskripsi`                | Catat pengeluaran. Contoh: `+makan siang 25000 ayam` |
| `ringkasan hari ini`                         | Lihat pengeluaran hari ini                           |
| `set income nominal_income nominal_tabungan` | Atur income bulanan + target tabungan                |
| `hapus pengeluaran`                          | Lihat daftar pengeluaran → reply nomor untuk hapus   |

---

## 📂 Repository

[https://github.com/oalahbro/WA-PENGELUARAN](https://github.com/oalahbro/WA-PENGELUARAN)

## 🧑‍💻 Author

Made with ❤️ by [oalahbro](https://github.com/oalahbro)
