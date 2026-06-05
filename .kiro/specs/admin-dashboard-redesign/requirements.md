# Dokumen Persyaratan (Requirements)

## Pendahuluan

Fitur ini mencakup redesain dashboard admin website Naren Laptop agar lebih modern dan fungsional, penambahan fitur CRUD user (manajemen pengguna), serta penambahan tombol akses cepat ke halaman pesan kontak langsung dari dashboard. Tujuannya adalah meningkatkan pengalaman pengelolaan website bagi admin dengan antarmuka yang lebih menarik dan lengkap.

## Glosarium

- **Dashboard**: Halaman utama panel admin yang menampilkan ringkasan statistik, data terbaru, dan pintasan navigasi.
- **Admin_Panel**: Kumpulan halaman yang hanya dapat diakses oleh pengguna yang sudah login dan terverifikasi, digunakan untuk mengelola konten website.
- **User_Manager**: Modul dalam Admin_Panel yang bertanggung jawab untuk mengelola data pengguna (CRUD).
- **Contact_Widget**: Komponen di Dashboard yang menampilkan informasi pesan kontak dan menyediakan akses cepat ke halaman pesan.
- **Stat_Card**: Komponen kartu di Dashboard yang menampilkan satu metrik statistik dengan ikon dan label.
- **Quick_Action**: Tombol pintasan di Dashboard untuk navigasi cepat ke halaman-halaman penting dalam Admin_Panel.
- **User**: Entitas pengguna yang memiliki atribut name, email, dan password untuk mengakses Admin_Panel.

## Persyaratan

### Persyaratan 1: Redesain Tampilan Dashboard

**User Story:** Sebagai admin, saya ingin dashboard yang lebih modern dan informatif, sehingga saya dapat melihat status website secara menyeluruh dengan cepat.

#### Acceptance Criteria

1. WHEN admin mengakses halaman Dashboard, THE Dashboard SHALL menampilkan kartu statistik untuk total halaman, halaman tayang, total artikel, artikel tayang, total produk, total layanan, total pesan masuk, dan total pengguna terdaftar.
2. WHEN admin mengakses halaman Dashboard, THE Dashboard SHALL menampilkan grafik atau visualisasi tren pesan masuk dalam 7 hari terakhir.
3. THE Dashboard SHALL menampilkan section "Aktivitas Terbaru" yang berisi 5 halaman terakhir dan 5 artikel terakhir yang diperbarui beserta status dan tanggal pembaruan.
4. THE Dashboard SHALL menampilkan section "Pintasan Cepat" yang berisi tombol navigasi ke halaman kelola halaman, artikel, produk, layanan, media, pengguna, pengaturan, dan lihat website.
5. WHILE pengguna belum login atau belum terverifikasi, THE Admin_Panel SHALL menolak akses ke Dashboard dan mengarahkan ke halaman login.
6. THE Dashboard SHALL menggunakan layout responsif yang menyesuaikan tampilan untuk layar mobile, tablet, dan desktop.
7. WHEN data statistik berhasil dimuat, THE Stat_Card SHALL menampilkan angka dengan format yang mudah dibaca menggunakan pemisah ribuan untuk angka di atas 999.

### Persyaratan 2: CRUD Manajemen Pengguna

**User Story:** Sebagai admin, saya ingin dapat mengelola pengguna (membuat, melihat, mengubah, dan menghapus), sehingga saya dapat mengontrol siapa saja yang memiliki akses ke Admin_Panel.

#### Acceptance Criteria

1. WHEN admin membuka halaman User_Manager, THE User_Manager SHALL menampilkan daftar semua pengguna dengan kolom nama, email, tanggal bergabung, dan tombol aksi (edit, hapus).
2. WHEN admin mengklik tombol "Tambah Pengguna", THE User_Manager SHALL menampilkan form dengan field nama, email, dan password untuk membuat pengguna baru.
3. WHEN admin mengirim form pembuatan pengguna dengan data valid, THE User_Manager SHALL menyimpan pengguna baru ke database dan menampilkan pesan sukses.
4. IF admin mengirim form pembuatan pengguna dengan email yang sudah terdaftar, THEN THE User_Manager SHALL menampilkan pesan error validasi "Email sudah digunakan".
5. IF admin mengirim form pembuatan pengguna dengan field yang kosong, THEN THE User_Manager SHALL menampilkan pesan error validasi untuk setiap field yang wajib diisi.
6. WHEN admin mengklik tombol edit pada pengguna tertentu, THE User_Manager SHALL menampilkan form edit dengan data pengguna yang sudah terisi (nama dan email) dan field password opsional.
7. WHEN admin mengirim form edit pengguna dengan data valid, THE User_Manager SHALL memperbarui data pengguna di database dan menampilkan pesan sukses.
8. IF admin mengubah email pengguna ke email yang sudah digunakan pengguna lain, THEN THE User_Manager SHALL menampilkan pesan error validasi "Email sudah digunakan".
9. WHEN admin mengklik tombol hapus pada pengguna tertentu, THE User_Manager SHALL menampilkan dialog konfirmasi sebelum menghapus pengguna.
10. WHEN admin mengkonfirmasi penghapusan pengguna, THE User_Manager SHALL menghapus pengguna dari database dan menampilkan pesan sukses.
11. IF admin mencoba menghapus akun milik sendiri, THEN THE User_Manager SHALL menolak penghapusan dan menampilkan pesan error "Tidak dapat menghapus akun sendiri".
12. THE User_Manager SHALL mendukung pencarian pengguna berdasarkan nama atau email.
13. THE User_Manager SHALL menampilkan daftar pengguna dengan paginasi sebanyak 15 item per halaman.

### Persyaratan 3: Tombol Akses Cepat ke Pesan Kontak di Dashboard

**User Story:** Sebagai admin, saya ingin tombol akses cepat ke halaman pesan kontak langsung dari dashboard, sehingga saya dapat melihat dan mengelola pesan masuk dengan cepat tanpa harus navigasi melalui menu.

#### Acceptance Criteria

1. WHEN admin mengakses halaman Dashboard, THE Contact_Widget SHALL menampilkan jumlah total pesan masuk dan jumlah pesan yang belum dibaca.
2. WHEN admin mengklik tombol "Lihat Pesan" pada Contact_Widget, THE Dashboard SHALL mengarahkan admin ke halaman daftar pesan kontak (admin.messages.index).
3. WHILE ada pesan yang belum dibaca, THE Contact_Widget SHALL menampilkan badge atau indikator visual yang menunjukkan jumlah pesan belum dibaca.
4. THE Contact_Widget SHALL menampilkan 3 pesan terbaru dengan informasi nama pengirim, subjek/ringkasan pesan, dan waktu pengiriman.
5. WHEN admin mengklik salah satu pesan di Contact_Widget, THE Dashboard SHALL mengarahkan admin ke halaman detail pesan tersebut (admin.messages.show).

### Persyaratan 4: Integrasi Statistik Pengguna dan Produk di Dashboard

**User Story:** Sebagai admin, saya ingin melihat statistik pengguna dan produk di dashboard, sehingga saya memiliki gambaran lengkap tentang semua aspek website.

#### Acceptance Criteria

1. WHEN admin mengakses halaman Dashboard, THE Dashboard SHALL menampilkan Stat_Card untuk total pengguna terdaftar dalam sistem.
2. WHEN admin mengakses halaman Dashboard, THE Dashboard SHALL menampilkan Stat_Card untuk total produk aktif.
3. WHEN admin mengakses halaman Dashboard, THE Dashboard SHALL menampilkan Stat_Card untuk total layanan yang tersedia.
4. THE Dashboard SHALL memuat data statistik dari backend melalui Inertia.js props tanpa melakukan request API terpisah.
