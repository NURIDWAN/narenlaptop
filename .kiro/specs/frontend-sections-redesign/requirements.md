# Dokumen Kebutuhan: Redesign Frontend Sections

## Pendahuluan

Dokumen ini mendefinisikan kebutuhan untuk merancang ulang seluruh section frontend website Naren Laptop agar lebih modern, menarik secara visual, dan profesional. Redesign mencakup 25 tipe section yang dirender melalui `SectionRenderer.jsx`. Perubahan bersifat non-breaking — interface props/data yang ada tetap dipertahankan, hanya tampilan visual dan interaksi yang diperbarui.

## Glosarium

- **Section**: Komponen React yang merender satu blok konten pada halaman frontend
- **SectionRenderer**: File tunggal (`SectionRenderer.jsx`) yang berisi seluruh definisi section dan logika routing tipe section
- **Glassmorphism**: Teknik desain menggunakan backdrop-blur, transparansi, dan border halus untuk efek kaca
- **Micro-interaction**: Animasi kecil dan halus yang memberikan feedback visual saat user berinteraksi (hover, focus, scroll)
- **Visual_Hierarchy**: Pengaturan ukuran, warna, dan spacing elemen agar mata pengguna diarahkan ke informasi terpenting terlebih dahulu
- **Section_Accent**: Variabel CSS (`--section-accent`) yang menentukan warna aksen per section
- **Framer_Motion**: Library animasi React yang sudah digunakan di project untuk transisi dan scroll-triggered animations
- **Tailwind_CSS**: Framework utility-first CSS yang digunakan untuk styling seluruh komponen
- **Page_Builder**: Sistem di backend yang memungkinkan admin menyusun halaman dari section-section secara dinamis

## Kebutuhan

### Kebutuhan 1: Modernisasi Visual Section Hero

**User Story:** Sebagai pengunjung website, saya ingin melihat hero section yang memukau dan modern, sehingga saya langsung mendapat kesan profesional terhadap brand Naren Laptop.

#### Acceptance Criteria

1. WHEN halaman dimuat, THE Hero SHALL menampilkan efek background animasi (gradient mesh atau animated blobs) yang halus tanpa mengganggu keterbacaan teks
2. WHEN user melihat Hero, THE Hero SHALL menampilkan visual hierarchy yang jelas dengan judul besar, subtitle, highlight badges, dan CTA buttons dalam tata letak yang terstruktur
3. WHEN hero image tersedia, THE Hero SHALL menampilkan gambar dalam frame modern dengan efek glassmorphism pada floating badges
4. WHEN user hover pada CTA button, THE Hero SHALL menampilkan micro-interaction berupa perubahan skala, bayangan, dan pergeseran warna yang halus
5. THE Hero SHALL mempertahankan kompatibilitas penuh dengan props settings yang ada (title, subtitle, highlights, cta_url, background_image, support_label, rating_label)

### Kebutuhan 2: Modernisasi Section Slider

**User Story:** Sebagai pengunjung website, saya ingin melihat slider/carousel yang smooth dan interaktif, sehingga saya tertarik menjelajahi konten yang ditampilkan.

#### Acceptance Criteria

1. WHEN slide berganti, THE Slider SHALL menampilkan transisi yang smooth menggunakan animasi crossfade atau slide dengan easing yang natural
2. WHEN user berinteraksi dengan navigasi slider, THE Slider SHALL memberikan feedback visual berupa perubahan state pada indicator dots dan tombol navigasi
3. THE Slider SHALL menampilkan overlay gradient yang lebih sophisticated dengan text positioning yang optimal untuk keterbacaan
4. THE Slider SHALL mempertahankan kompatibilitas penuh dengan props data slides dan settings yang ada

### Kebutuhan 3: Modernisasi Section About & About Hero

**User Story:** Sebagai pengunjung website, saya ingin halaman tentang kami terlihat menarik dan informatif, sehingga saya lebih percaya dengan brand tersebut.

#### Acceptance Criteria

1. WHEN halaman about dimuat, THE About_Hero SHALL menampilkan layout yang lebih dramatis dengan efek parallax ringan atau gradient overlay pada gambar
2. WHEN user scroll ke section about, THE About SHALL menampilkan animasi masuk yang staggered antara teks dan gambar
3. THE About SHALL menggunakan dekorasi visual modern seperti garis aksen, dot patterns, atau subtle geometric shapes sebagai elemen pendukung
4. THE About SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, description, image)

### Kebutuhan 4: Modernisasi Section Journey & Values

**User Story:** Sebagai pengunjung website, saya ingin melihat perjalanan dan nilai perusahaan yang ditampilkan secara visual menarik, sehingga saya memahami identitas brand dengan baik.

#### Acceptance Criteria

1. WHEN user scroll ke Journey section, THE Journey SHALL menampilkan stat cards dengan efek glassmorphism dan animasi counter yang lebih smooth
2. WHEN user scroll ke Values section, THE Values SHALL menampilkan cards dengan hover effect berupa gradient border dan icon yang beranimasi
3. THE Values SHALL menggunakan layout cards yang lebih kreatif dengan ukuran icon lebih besar dan spacing yang lebih generous
4. THE Journey SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, description, stats)
5. THE Values SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, items)

### Kebutuhan 5: Modernisasi Section Expertise

**User Story:** Sebagai pengunjung website, saya ingin section keahlian teknis terlihat premium dan meyakinkan, sehingga saya percaya akan kualitas layanan.

#### Acceptance Criteria

1. WHEN user scroll ke Expertise section, THE Expertise SHALL menampilkan layout two-column dengan gambar yang memiliki decorative frame modern
2. WHEN user melihat bullet points, THE Expertise SHALL menampilkan setiap bullet dengan animasi masuk staggered dan icon checkmark yang lebih stylish
3. THE Expertise SHALL menggunakan background pattern atau gradient yang lebih sophisticated dibanding flat dark color
4. THE Expertise SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, eyebrow, image, bullets)

### Kebutuhan 6: Modernisasi Section Services

**User Story:** Sebagai pengunjung website, saya ingin melihat layanan yang ditawarkan dalam tampilan cards yang modern dan mudah dipahami, sehingga saya cepat menemukan layanan yang dibutuhkan.

#### Acceptance Criteria

1. WHEN user scroll ke Services section, THE Services SHALL menampilkan service cards dengan desain modern menggunakan subtle gradient background atau glassmorphism
2. WHEN user hover pada service card, THE Services SHALL menampilkan efek hover yang distinctive berupa perubahan border glow, shadow elevation, dan slight scale
3. WHEN sub-services ditampilkan, THE Services SHALL menampilkan sub-service items dengan layout yang lebih compact dan visual yang lebih clean
4. THE Services SHALL mempertahankan fungsionalitas WhatsApp integration yang ada untuk sub-services
5. THE Services SHALL mempertahankan kompatibilitas dengan props settings dan data items yang ada

### Kebutuhan 7: Modernisasi Section Products

**User Story:** Sebagai pengunjung website, saya ingin melihat produk yang ditampilkan secara menarik seperti e-commerce modern, sehingga saya tertarik untuk membeli.

#### Acceptance Criteria

1. WHEN user scroll ke Products section, THE Products SHALL menampilkan product cards dengan desain modern yang menampilkan gambar lebih prominent dan badge yang stylish
2. WHEN user hover pada product card, THE Products SHALL menampilkan efek hover berupa image zoom, shadow depth increase, dan tombol aksi yang muncul atau berubah state
3. WHEN harga diskon tersedia, THE Products SHALL menampilkan harga dengan visual yang menonjolkan diskon (badge persentase atau strikethrough yang eye-catching)
4. THE Products SHALL mempertahankan fungsionalitas WhatsApp purchase link dan navigasi ke halaman produk
5. THE Products SHALL mempertahankan kompatibilitas dengan props settings dan data items yang ada

### Kebutuhan 8: Modernisasi Section Booking Service & Sell Laptop

**User Story:** Sebagai pengunjung website, saya ingin form booking dan jual laptop terlihat profesional dan mudah digunakan, sehingga saya nyaman mengisi data.

#### Acceptance Criteria

1. WHEN user melihat form section, THE Booking_Service SHALL menampilkan layout form yang modern dengan card-based design, spacing yang lebih generous, dan visual separasi yang jelas antara gambar dan form
2. WHEN user focus pada input field, THE Booking_Service SHALL menampilkan animasi focus yang lebih pronounced dengan label yang bergerak atau border yang berubah warna secara halus
3. WHEN form berhasil dikirim, THE Booking_Service SHALL menampilkan feedback sukses dengan animasi yang lebih celebratory
4. THE Sell_Laptop SHALL menggunakan pola desain yang sama dengan Booking_Service untuk konsistensi visual
5. THE Booking_Service SHALL mempertahankan fungsionalitas form submission dan WhatsApp redirect yang ada
6. THE Sell_Laptop SHALL mempertahankan fungsionalitas form submission dan WhatsApp redirect yang ada

### Kebutuhan 9: Modernisasi Section Stats

**User Story:** Sebagai pengunjung website, saya ingin melihat statistik pencapaian yang ditampilkan secara dramatis, sehingga saya terkesan dengan track record perusahaan.

#### Acceptance Criteria

1. WHEN user scroll ke Stats section, THE Stats SHALL menampilkan stat items dengan animasi counter yang lebih dramatis dan efek visual yang impactful
2. THE Stats SHALL menggunakan background gradient yang lebih complex dengan pattern overlay untuk depth
3. WHEN stat cards terlihat, THE Stats SHALL menampilkan cards dengan efek glassmorphism yang kuat dan border subtle
4. THE Stats SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, items)

### Kebutuhan 10: Modernisasi Section Testimonials

**User Story:** Sebagai pengunjung website, saya ingin melihat testimoni pelanggan yang ditampilkan secara menarik dan terpercaya, sehingga saya yakin dengan kualitas layanan.

#### Acceptance Criteria

1. WHEN testimonials ditampilkan, THE Testimonials SHALL menggunakan layout carousel yang lebih modern dengan cards yang memiliki depth dan dimensi
2. WHEN slide berganti, THE Testimonials SHALL menampilkan transisi yang lebih elegant dengan efek fade dan slight movement
3. WHEN user melihat testimonial card, THE Testimonials SHALL menampilkan quote styling yang lebih distinctive dengan decorative elements
4. THE Testimonials SHALL mempertahankan fungsionalitas auto-play dan navigasi manual yang ada
5. THE Testimonials SHALL mempertahankan kompatibilitas dengan props settings dan data items yang ada

### Kebutuhan 11: Modernisasi Section Gallery & Image Compare

**User Story:** Sebagai pengunjung website, saya ingin melihat galeri dan perbandingan gambar yang ditampilkan secara profesional, sehingga saya bisa menilai kualitas kerja.

#### Acceptance Criteria

1. WHEN user scroll ke Gallery, THE Gallery SHALL menampilkan masonry layout dengan efek hover berupa overlay info, zoom, atau subtle glow
2. WHEN user berinteraksi dengan image compare, THE Image_Compare SHALL menampilkan before/after labels dengan styling yang lebih modern dan decorative frame
3. THE Gallery SHALL menggunakan spacing dan border-radius yang konsisten dengan design system keseluruhan
4. THE Gallery SHALL mempertahankan kompatibilitas dengan props settings dan data images yang ada
5. THE Image_Compare SHALL mempertahankan kompatibilitas dengan props settings yang ada (before_image, after_image, labels)

### Kebutuhan 12: Modernisasi Section CTA & FAQ

**User Story:** Sebagai pengunjung website, saya ingin CTA yang mencolok dan FAQ yang mudah dibaca, sehingga saya terdorong untuk bertindak dan menemukan jawaban pertanyaan saya.

#### Acceptance Criteria

1. WHEN user scroll ke CTA section, THE CTA SHALL menampilkan gradient background yang lebih vibrant dengan decorative elements dan tombol yang sangat menonjol
2. WHEN user hover pada CTA button, THE CTA SHALL menampilkan micro-interaction yang eye-catching berupa glow effect atau pulse animation
3. WHEN user klik FAQ item, THE FAQ SHALL menampilkan accordion expand/collapse dengan animasi smooth dan rotasi icon indicator
4. WHEN FAQ item terbuka, THE FAQ SHALL menampilkan konten jawaban dengan typography yang nyaman dibaca dan spacing yang generous
5. THE CTA SHALL mempertahankan kompatibilitas dengan props settings yang ada
6. THE FAQ SHALL mempertahankan kompatibilitas dengan props settings yang ada

### Kebutuhan 13: Modernisasi Section Contact

**User Story:** Sebagai pengunjung website, saya ingin form kontak yang terlihat profesional dan mengundang untuk dihubungi, sehingga saya tidak ragu mengirim pesan.

#### Acceptance Criteria

1. WHEN user scroll ke Contact section, THE Contact SHALL menampilkan layout yang lebih modern dengan form yang memiliki glassmorphism effect yang lebih kuat
2. WHEN user melihat contact info, THE Contact SHALL menampilkan info kontak dengan icon cards yang modern dan hover states yang distinctive
3. WHEN map tersedia, THE Contact SHALL menampilkan map dengan frame rounded yang lebih stylish dan integrasi visual yang mulus dengan section
4. THE Contact SHALL mempertahankan fungsionalitas form submission dan WhatsApp redirect yang ada
5. THE Contact SHALL mempertahankan kompatibilitas dengan props settings dan data yang ada

### Kebutuhan 14: Modernisasi Section Blog List

**User Story:** Sebagai pengunjung website, saya ingin melihat artikel blog yang ditampilkan secara menarik, sehingga saya tertarik membaca konten yang disediakan.

#### Acceptance Criteria

1. WHEN articles ditampilkan, THE Blog_List SHALL menampilkan article cards dengan desain modern yang menampilkan thumbnail lebih prominent dan metadata yang well-organized
2. WHEN user hover pada article card, THE Blog_List SHALL menampilkan efek hover yang smooth berupa image overlay, title color change, dan shadow elevation
3. THE Blog_List SHALL menggunakan typography hierarchy yang lebih jelas antara category, title, excerpt, dan reading time
4. THE Blog_List SHALL mempertahankan kompatibilitas dengan props settings dan articles data yang ada

### Kebutuhan 15: Modernisasi Section Pricing & Team

**User Story:** Sebagai pengunjung website, saya ingin melihat paket harga dan tim yang ditampilkan secara profesional, sehingga saya mudah memilih layanan dan mengenal tim.

#### Acceptance Criteria

1. WHEN pricing plans ditampilkan, THE Pricing SHALL menampilkan cards dengan desain modern yang membedakan paket populer secara visual menggunakan gradient border atau glow effect
2. WHEN team members ditampilkan, THE Team SHALL menampilkan cards dengan foto yang lebih besar, hover effect modern, dan social presence indicators
3. WHEN user hover pada pricing card, THE Pricing SHALL menampilkan efek hover berupa elevation dan subtle border color change
4. THE Pricing SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, items with featured flag)
5. THE Team SHALL mempertahankan kompatibilitas dengan props settings dan data members yang ada

### Kebutuhan 16: Modernisasi Section Location & Google Reviews

**User Story:** Sebagai pengunjung website, saya ingin melihat informasi lokasi dan review Google yang ditampilkan secara informatif dan modern, sehingga saya mudah menemukan toko dan mempercayai reputasinya.

#### Acceptance Criteria

1. WHEN Location section ditampilkan, THE Location SHALL menggunakan layout yang lebih modern dengan info cards yang memiliki icon styling yang lebih refined
2. WHEN Google Reviews ditampilkan, THE Google_Reviews SHALL memiliki wrapper section yang konsisten dengan design system dan heading yang well-styled
3. THE Location SHALL mempertahankan kompatibilitas dengan props settings yang ada (address, hours, map_embed, instagram_url)
4. THE Google_Reviews SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, embed_code)

### Kebutuhan 17: Modernisasi Section Rich Text & Generic

**User Story:** Sebagai pengunjung website, saya ingin konten teks dan section generik terlihat rapi dan profesional, sehingga semua informasi mudah dibaca.

#### Acceptance Criteria

1. WHEN Rich Text section ditampilkan, THE Rich_Text SHALL menggunakan prose styling yang lebih refined dengan typography yang nyaman dibaca dan spacing yang optimal
2. WHEN Generic section ditampilkan, THE Generic SHALL menggunakan styling minimal yang konsisten dengan design system keseluruhan
3. THE Rich_Text SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, content_html)
4. THE Generic SHALL mempertahankan kompatibilitas dengan props settings yang ada (title, subtitle, description)

### Kebutuhan 18: Konsistensi Design System

**User Story:** Sebagai developer, saya ingin seluruh section mengikuti design system yang konsisten, sehingga website terlihat kohesif dan mudah dimaintain.

#### Acceptance Criteria

1. THE SectionRenderer SHALL menggunakan spacing scale yang konsisten di seluruh section (py-16/20/24 sebagai base padding)
2. THE SectionRenderer SHALL menggunakan border-radius scale yang konsisten (rounded-xl untuk cards, rounded-2xl/3xl untuk containers besar)
3. THE SectionRenderer SHALL menggunakan shadow scale yang konsisten (shadow-sm untuk cards resting, shadow-lg/xl untuk hover dan elevated elements)
4. THE SectionRenderer SHALL menggunakan variabel CSS tema yang ada (--section-accent, --navbar-color) secara konsisten di seluruh section
5. THE SectionRenderer SHALL mempertahankan responsive behavior yang baik di semua breakpoint (mobile, tablet, desktop)

### Kebutuhan 19: Performa dan Aksesibilitas

**User Story:** Sebagai pengunjung website, saya ingin halaman tetap cepat dimuat dan dapat diakses oleh semua orang, sehingga pengalaman browsing saya tidak terganggu.

#### Acceptance Criteria

1. THE SectionRenderer SHALL mempertahankan penggunaan lazy loading pada gambar yang tidak berada di viewport awal
2. THE SectionRenderer SHALL memastikan animasi menggunakan `viewport: { once: true }` agar tidak diulang saat scroll
3. THE SectionRenderer SHALL memastikan semua elemen interaktif memiliki aria-labels dan kontras warna yang memadai
4. IF animasi terlalu berat bagi perangkat user, THEN THE SectionRenderer SHALL menggunakan `prefers-reduced-motion` media query untuk mengurangi atau menonaktifkan animasi
5. THE SectionRenderer SHALL mempertahankan semantic HTML structure (heading hierarchy, landmark regions, proper button/link usage)
