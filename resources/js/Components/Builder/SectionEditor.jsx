import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import RichTextEditor from '@/Components/Editor/RichTextEditor';
import { LuImagePlus, LuPlus, LuTrash2, LuX } from 'react-icons/lu';
import { useRef, useState } from 'react';
import axios from 'axios';

export default function SectionEditor({ type, settings, onChange, builderData = {} }) {
    const editors = {
        slider: SliderEditor,
        about_hero: AboutHeroEditor,
        hero: HeroEditor,
        about: AboutEditor,
        journey: JourneyEditor,
        values: ValuesEditor,
        expertise: ExpertiseEditor,
        services: ServicesEditor,
        products: ProductsEditor,
        booking_service: BookingServiceEditor,
        stats: StatsEditor,
        testimonials: TestimonialsEditor,
        gallery: GalleryEditor,
        image_compare: ImageCompareEditor,
        cta: CtaEditor,
        faq: FAQEditor,
        contact: ContactEditor,
        blog_list: BlogListEditor,
        rich_text: RichTextSectionEditor,
        custom_html: CustomHtmlEditor,
        pricing: PricingEditor,
        team: TeamEditor,
        google_reviews: GoogleReviewsEditor,
        location: LocationEditor,
        sell_laptop: SellLaptopEditor,
    };
    const Editor = editors[type] || GenericEditor;
    return <Editor settings={settings} onChange={onChange} builderData={builderData} />;
}

function Field({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <Input type={type} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} />
        </label>
    );
}

function TextareaField({ label, value, onChange, rows = 3, placeholder = '' }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea
                rows={rows}
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </label>
    );
}

function RangeField({ label, value, onChange, min = 0, max = 1, step = 0.1, suffix = '' }) {
    return (
        <label className="space-y-2">
            <span className="flex items-center justify-between gap-3">
                <Label>{label}</Label>
                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{value}{suffix}</span>
            </span>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                className="w-full accent-primary"
                value={value ?? min}
                onChange={(e) => onChange(parseFloat(e.target.value))}
            />
        </label>
    );
}

function ImageField({ label, value, onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const form = new FormData();
            form.append('file', file);
            const { data } = await axios.post('/admin/media/upload', form);
            onChange(data.url);
        } catch {
            alert('Gagal upload gambar.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            {value && (
                <div className="relative inline-block">
                    <img src={value} alt="" className="h-20 rounded-md border object-cover" />
                    <button type="button" onClick={() => onChange('')} className="absolute -right-2 -top-2 rounded-full bg-destructive p-0.5 text-white shadow">
                        <LuX className="size-3" />
                    </button>
                </div>
            )}
            <div className="flex gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
                    <LuImagePlus className="size-4" />
                    {uploading ? 'Uploading...' : 'Pilih Gambar'}
                </Button>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </div>
        </div>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <select
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </label>
    );
}

function SourceSelector({ settings, onChange, description, children }) {
    const source = settings.source || 'manual';
    const set = (patch) => onChange({ ...settings, ...patch });

    return (
        <SectionGroup title="Sumber Konten" description={description}>
            <SelectField
                label="Mode"
                value={source}
                onChange={(value) => set({ source: value })}
                options={[
                    { value: 'manual', label: 'Manual' },
                    { value: 'database', label: 'Database' },
                ]}
            />
            {source === 'database' && children}
        </SectionGroup>
    );
}

function SourceToggle({ value, onChange }) {
    return (
        <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Label className="text-xs">Sumber Data:</Label>
            <div className="flex gap-1">
                <button type="button" onClick={() => onChange('manual')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${value !== 'database' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>Manual</button>
                <button type="button" onClick={() => onChange('database')} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${value === 'database' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted'}`}>Database</button>
            </div>
        </div>
    );
}

function SectionGroup({ title, description, children }) {
    return (
        <div className="space-y-3">
            <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
                {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

function HeroEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Variasi" description="Pilih tampilan hero yang berbeda.">
                <SelectField
                    label="Variasi Hero"
                    value={settings.variant || 'default'}
                    onChange={(v) => set('variant', v)}
                    options={[
                        { value: 'default', label: 'Default — 2 kolom dengan gambar' },
                        { value: 'centered', label: 'Centered — Teks tengah + background image' },
                        { value: 'minimal', label: 'Minimal — Gradient tanpa gambar' },
                    ]}
                />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Konten" description="Headline utama yang pertama dilihat pengunjung.">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} required />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="CTA Utama">
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Teks CTA" value={settings.cta_text} onChange={(v) => set('cta_text', v)} placeholder="Hubungi Kami" />
                    <Field label="URL CTA" value={settings.cta_url} onChange={(v) => set('cta_url', v)} placeholder="/kontak" />
                </div>
            </SectionGroup>
            <SectionGroup title="CTA Sekunder">
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Teks" value={settings.secondary_text} onChange={(v) => set('secondary_text', v)} placeholder="Pelajari" />
                    <Field label="URL" value={settings.secondary_url} onChange={(v) => set('secondary_url', v)} placeholder="#layanan" />
                </div>
            </SectionGroup>
            <SectionGroup title="CTA Ketiga">
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Teks" value={settings.tertiary_text} onChange={(v) => set('tertiary_text', v)} placeholder="Booking Service" />
                    <Field label="URL" value={settings.tertiary_url} onChange={(v) => set('tertiary_url', v)} placeholder="#booking-service" />
                </div>
            </SectionGroup>
            <Separator />
            <SectionGroup title="Badge Rating & Support" description="Teks badge kecil di atas gambar hero.">
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Label Rating" value={settings.rating_label} onChange={(v) => set('rating_label', v)} placeholder="Rating" />
                    <Field label="Teks Rating" value={settings.rating_text} onChange={(v) => set('rating_text', v)} placeholder="4.9/5 pelanggan" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Label Support" value={settings.support_label} onChange={(v) => set('support_label', v)} placeholder="Support" />
                    <Field label="Teks Support" value={settings.support_text} onChange={(v) => set('support_text', v)} placeholder="Fast response team" />
                </div>
            </SectionGroup>
            <Separator />
            <SectionGroup title="Background">
                <ImageField label="Gambar Background" value={settings.background_image} onChange={(v) => set('background_image', v)} />
                <RangeField label="Overlay Opacity" value={settings.overlay_opacity ?? 0.5} onChange={(v) => set('overlay_opacity', v)} />
            </SectionGroup>
        </div>
    );
}

function AboutHeroEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} rows={2} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Gambar">
                <ImageField label="Gambar Hero" value={settings.image} onChange={(v) => set('image', v)} />
            </SectionGroup>
        </div>
    );
}

function SliderEditor({ settings, onChange, builderData = {} }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    const sliderCount = builderData.sliders?.length || 0;

    function updateItem(index, key, val) {
        set('items', items.map((item, i) => i === index ? { ...item, [key]: val } : item));
    }
    function addItem() {
        set('items', [...items, { title: '', subtitle: '', image: '', badge: '', cta_text: '', cta_url: '' }]);
    }
    function removeItem(index) {
        set('items', items.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul Section" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle Section" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Mode database mengambil slide aktif dari menu Slider.">
                <Field label="Jumlah Slide" type="number" value={settings.limit || 5} onChange={(v) => set('limit', v)} />
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    {sliderCount} slider tersedia di database. Hanya slider aktif yang tampil di halaman publik.
                </p>
            </SourceSelector>
            {(settings.source || 'manual') !== 'database' && (
                <>
                    <Separator />
                    <SectionGroup title="Slide Manual">
                        {items.map((item, i) => (
                            <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">Slide #{i + 1}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                        <LuTrash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Judul" value={item.title} onChange={(v) => updateItem(i, 'title', v)} />
                                    <Field label="Badge" value={item.badge} onChange={(v) => updateItem(i, 'badge', v)} />
                                </div>
                                <TextareaField label="Subtitle" value={item.subtitle} onChange={(v) => updateItem(i, 'subtitle', v)} rows={2} />
                                <ImageField label="Gambar" value={item.image} onChange={(v) => updateItem(i, 'image', v)} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Teks CTA" value={item.cta_text} onChange={(v) => updateItem(i, 'cta_text', v)} />
                                    <Field label="URL CTA" value={item.cta_url} onChange={(v) => updateItem(i, 'cta_url', v)} />
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addItem}>
                            <LuPlus className="size-4" />
                            Tambah Slide
                        </Button>
                    </SectionGroup>
                </>
            )}
        </div>
    );
}

function JourneyEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.stats || [];

    function updateItem(index, key, val) {
        set('stats', items.map((item, i) => i === index ? { ...item, [key]: val } : item));
    }

    function addItem() {
        set('stats', [...items, { value: '0', label: '' }]);
    }

    function removeItem(index) {
        set('stats', items.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Konten">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} rows={2} />
                <TextareaField label="Deskripsi" value={settings.description} onChange={(v) => set('description', v)} rows={4} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Statistik">
                {items.map((item, i) => (
                    <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Stat #{i + 1}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                <LuTrash2 className="size-4" />
                            </Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Angka" value={item.value} onChange={(v) => updateItem(i, 'value', v)} placeholder="10+" />
                            <Field label="Label" value={item.label} onChange={(v) => updateItem(i, 'label', v)} placeholder="Tahun pengalaman" />
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}>
                    <LuPlus className="size-4" />
                    Tambah Statistik
                </Button>
            </SectionGroup>
        </div>
    );
}

function ValuesEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];

    function updateItem(index, key, val) {
        set('items', items.map((item, i) => i === index ? { ...item, [key]: val } : item));
    }

    function addItem() {
        set('items', [...items, { title: '', description: '' }]);
    }

    function removeItem(index) {
        set('items', items.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} rows={2} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Nilai">
                {items.map((item, i) => (
                    <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Nilai #{i + 1}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                <LuTrash2 className="size-4" />
                            </Button>
                        </div>
                        <Field label="Nama Nilai" value={item.title} onChange={(v) => updateItem(i, 'title', v)} placeholder="Inovasi" />
                        <TextareaField label="Deskripsi" value={item.description} onChange={(v) => updateItem(i, 'description', v)} rows={2} />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}>
                    <LuPlus className="size-4" />
                    Tambah Nilai
                </Button>
            </SectionGroup>
        </div>
    );
}

function ExpertiseEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const bullets = settings.bullets || [];

    function updateBullet(index, value) {
        set('bullets', bullets.map((item, i) => (i === index ? value : item)));
    }

    function addBullet() {
        set('bullets', [...bullets, '']);
    }

    function removeBullet(index) {
        set('bullets', bullets.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Konten">
                <Field label="Eyebrow" value={settings.eyebrow} onChange={(v) => set('eyebrow', v)} placeholder="Keahlian Teknis" />
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} rows={2} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Media">
                <ImageField label="Gambar" value={settings.image} onChange={(v) => set('image', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Bullet List">
                {bullets.map((bullet, index) => (
                    <div key={index} className="flex gap-2">
                        <Input value={bullet} onChange={(e) => updateBullet(index, e.target.value)} placeholder="Sertifikasi servis..." />
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeBullet(index)} className="text-destructive hover:text-destructive">
                            <LuTrash2 className="size-4" />
                        </Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addBullet}>
                    <LuPlus className="size-4" />
                    Tambah Bullet
                </Button>
            </SectionGroup>
        </div>
    );
}

function ServicesEditor({ settings, onChange, builderData = {} }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    const serviceCount = builderData.services?.length || 0;

    function updateItem(index, key, val) {
        const updated = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
        set('items', updated);
    }
    function addItem() { set('items', [...items, { title: '', description: '', image: '', cta_text: '', cta_url: '' }]); }
    function removeItem(index) { set('items', items.filter((_, i) => i !== index)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Mode database mengambil layanan aktif dari menu Layanan.">
                <Field label="Jumlah Layanan" type="number" value={settings.limit || 6} onChange={(v) => set('limit', v)} />
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    {serviceCount} layanan tersedia di database. Hanya layanan aktif yang tampil di halaman publik.
                </p>
            </SourceSelector>
            {(settings.source || 'manual') !== 'database' && (
                <>
                    <Separator />
                    <SectionGroup title="Layanan Manual" description="Tambahkan layanan satu per satu.">
                        {items.map((item, i) => (
                            <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">Layanan #{i + 1}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                        <LuTrash2 className="size-4" />
                                    </Button>
                                </div>
                                <Field label="Nama Layanan" value={item.title} onChange={(v) => updateItem(i, 'title', v)} />
                                <TextareaField label="Deskripsi" value={item.description} onChange={(v) => updateItem(i, 'description', v)} rows={2} />
                                <ImageField label="Foto Layanan" value={item.image} onChange={(v) => updateItem(i, 'image', v)} />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Teks Tombol" value={item.cta_text} onChange={(v) => updateItem(i, 'cta_text', v)} placeholder="Selengkapnya" />
                                    <Field label="URL Tombol" value={item.cta_url} onChange={(v) => updateItem(i, 'cta_url', v)} placeholder="/kontak" />
                                </div>
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addItem}>
                            <LuPlus className="size-4" />
                            Tambah Layanan
                        </Button>
                    </SectionGroup>
                </>
            )}
        </div>
    );
}

function ProductsEditor({ settings, onChange, builderData = {} }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    const categories = builderData.productCategories || [];
    const selectedCategoryId = String(settings.category_id || '');
    const productCount = (builderData.products || [])
        .filter((product) => product.is_active && (!selectedCategoryId || String(product.category_id || '') === selectedCategoryId))
        .length;

    function updateItem(index, key, val) {
        set('items', items.map((item, i) => i === index ? { ...item, [key]: val } : item));
    }
    function addItem() {
        set('items', [...items, { name: '', description: '', price: '', badge: '', image: '', cta_url: '' }]);
    }
    function removeItem(index) {
        set('items', items.filter((_, i) => i !== index));
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul Section" value={settings.title} onChange={(v) => set('title', v)} placeholder="Produk Unggulan" />
                <TextareaField label="Subtitle Section" value={settings.subtitle} onChange={(v) => set('subtitle', v)} placeholder="Teks singkat di bawah judul section produk." />
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Teks Link" value={settings.link_text} onChange={(v) => set('link_text', v)} placeholder="Lihat Semua" />
                    <Field label="URL Link" value={settings.link_url} onChange={(v) => set('link_url', v)} placeholder="/produk" />
                </div>
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Mode database mengambil produk aktif dari menu Produk.">
                <div className="grid gap-3 md:grid-cols-2">
                    <SelectField
                        label="Kategori Produk"
                        value={settings.category_id || ''}
                        onChange={(v) => set('category_id', v)}
                        options={[
                            { value: '', label: 'Semua kategori' },
                            ...categories.map((category) => ({ value: String(category.id), label: category.name })),
                        ]}
                    />
                    <Field label="Jumlah Produk" type="number" value={settings.limit || 8} onChange={(v) => set('limit', v)} />
                </div>
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    {productCount} produk tersedia untuk pilihan ini. Hanya produk aktif yang tampil di halaman publik.
                </p>
                {categories.length === 0 && (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                        Belum ada kategori produk. Section tetap bisa menampilkan semua produk.
                    </p>
                )}
            </SourceSelector>
            {(settings.source || 'manual') !== 'database' && (
                <>
                    <Separator />
                    <SectionGroup title="Produk Manual">
                        {items.map((item, i) => (
                            <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">Produk #{i + 1}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                        <LuTrash2 className="size-4" />
                                    </Button>
                                </div>
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Nama Produk" value={item.name} onChange={(v) => updateItem(i, 'name', v)} />
                                    <Field label="Badge" value={item.badge} onChange={(v) => updateItem(i, 'badge', v)} placeholder="Best Seller" />
                                </div>
                                <TextareaField label="Deskripsi" value={item.description} onChange={(v) => updateItem(i, 'description', v)} rows={2} />
                                <div className="grid gap-3 md:grid-cols-2">
                                    <Field label="Harga" value={item.price} onChange={(v) => updateItem(i, 'price', v)} placeholder="Rp 12.000.000" />
                                    <Field label="URL CTA" value={item.cta_url} onChange={(v) => updateItem(i, 'cta_url', v)} placeholder="/kontak" />
                                </div>
                                <ImageField label="Gambar Produk" value={item.image} onChange={(v) => updateItem(i, 'image', v)} />
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addItem}>
                            <LuPlus className="size-4" />
                            Tambah Produk
                        </Button>
                    </SectionGroup>
                </>
            )}
        </div>
    );
}

function BookingServiceEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Daftar Layanan" description="Satu layanan per baris, tampil sebagai chip di atas form.">
                <TextareaField
                    label="Layanan"
                    value={(settings.services || []).join('\n')}
                    onChange={(v) => set('services', v.split('\n').map((item) => item.trim()).filter(Boolean))}
                    rows={5}
                    placeholder="Install Ulang OS&#10;Upgrade SSD/RAM"
                />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Form Booking">
                <ImageField label="Gambar Service" value={settings.image} onChange={(v) => set('image', v)} />
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Judul Form" value={settings.card_title} onChange={(v) => set('card_title', v)} placeholder="Booking Service" />
                    <Field label="Judul Badge" value={settings.badge_title} onChange={(v) => set('badge_title', v)} placeholder="Teknisi Tersertifikasi" />
                </div>
                <TextareaField label="Subtitle Form" value={settings.card_subtitle} onChange={(v) => set('card_subtitle', v)} rows={2} />
                <TextareaField label="Subtitle Badge" value={settings.badge_subtitle} onChange={(v) => set('badge_subtitle', v)} rows={2} />
            </SectionGroup>
        </div>
    );
}

function ImageCompareEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Gambar" description="Isi URL before dan after untuk slider perbandingan.">
                <div className="grid gap-3 md:grid-cols-2">
                    <ImageField label="Gambar Before" value={settings.before_image} onChange={(v) => set('before_image', v)} />
                    <Field label="Label Before" value={settings.before_label} onChange={(v) => set('before_label', v)} placeholder="Sebelum" />
                    <ImageField label="Gambar After" value={settings.after_image} onChange={(v) => set('after_image', v)} />
                    <Field label="Label After" value={settings.after_label} onChange={(v) => set('after_label', v)} placeholder="Sesudah" />
                </div>
                <RangeField label="Posisi Awal Slider" value={settings.initial_position ?? 50} onChange={(v) => set('initial_position', v)} min={0} max={100} step={1} suffix="%" />
            </SectionGroup>
        </div>
    );
}

function FAQEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];

    function updateItem(index, key, val) {
        const updated = items.map((item, i) => i === index ? { ...item, [key]: val } : item);
        set('items', updated);
    }
    function addItem() { set('items', [...items, { question: '', answer: '' }]); }
    function removeItem(index) { set('items', items.filter((_, i) => i !== index)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Pertanyaan" description="FAQ akan tampil sebagai accordion di halaman publik.">
                {items.map((item, i) => (
                    <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">FAQ #{i + 1}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive">
                                <LuTrash2 className="size-4" />
                            </Button>
                        </div>
                        <Field label="Pertanyaan" value={item.question} onChange={(v) => updateItem(i, 'question', v)} />
                        <TextareaField label="Jawaban" value={item.answer} onChange={(v) => updateItem(i, 'answer', v)} rows={2} />
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}>
                    <LuPlus className="size-4" />
                    Tambah FAQ
                </Button>
            </SectionGroup>
        </div>
    );
}

function ContactEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} placeholder="Hubungi Kami" />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Gunakan data kontak dari Pengaturan Website saat mode database aktif.">
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Section akan mengambil email, WhatsApp, dan alamat dari menu Pengaturan.
                </p>
            </SourceSelector>
            <Separator />
            <SectionGroup title="Map">
                <Field
                    label="Override Map Embed URL"
                    value={settings.map_embed_url}
                    onChange={(v) => set('map_embed_url', v)}
                    placeholder="https://www.google.com/maps/embed?pb=... atau kode iframe Google Maps"
                />
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    Kosongkan untuk memakai Google Maps Embed dari Pengaturan. Isi field ini jika section ini butuh map berbeda.
                </p>
            </SectionGroup>
        </div>
    );
}

function BlogListEditor({ settings, onChange, builderData = {} }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const categories = builderData.articleCategories || [];

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} placeholder="Artikel Terbaru" />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Artikel database hanya menampilkan artikel berstatus published.">
                <div className="grid gap-3 md:grid-cols-2">
                    <SelectField
                        label="Ambil Artikel"
                        value={settings.article_source || 'latest'}
                        onChange={(v) => set('article_source', v)}
                        options={[
                            { value: 'latest', label: 'Artikel terbaru' },
                            { value: 'category', label: 'Kategori tertentu' },
                        ]}
                    />
                    <Field label="Jumlah Artikel" type="number" value={settings.limit || 3} onChange={(v) => set('limit', v)} />
                </div>
                {(settings.article_source || 'latest') === 'category' && (
                    <SelectField
                        label="Kategori"
                        value={settings.category_id || ''}
                        onChange={(v) => set('category_id', v)}
                        options={[
                            { value: '', label: 'Pilih kategori' },
                            ...categories.map((category) => ({ value: String(category.id), label: category.name })),
                        ]}
                    />
                )}
                {categories.length === 0 && (
                    <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                        Belum ada kategori artikel. Mode artikel terbaru tetap bisa digunakan.
                    </p>
                )}
            </SourceSelector>
        </div>
    );
}

function RichTextSectionEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul Section" value={settings.title} onChange={(v) => set('title', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Konten">
                <RichTextEditor
                    value={settings.content_html || ''}
                    onChange={(value) => set('content_html', value)}
                    minHeightClass="min-h-64"
                />
            </SectionGroup>
        </div>
    );
}

function CtaEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Konten">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Deskripsi" value={settings.description} onChange={(v) => set('description', v)} />
                <Field label="Teks Tombol" value={settings.cta_text} onChange={(v) => set('cta_text', v)} />
                {(settings.source || 'manual') !== 'database' && (
                    <Field label="URL Tombol" value={settings.cta_url} onChange={(v) => set('cta_url', v)} />
                )}
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Mode database memakai nomor WhatsApp dari Pengaturan Website sebagai URL tombol.">
                <p className="rounded-md bg-muted px-3 py-2 text-xs leading-5 text-muted-foreground">
                    URL tombol akan otomatis diarahkan ke WhatsApp jika nomor tersedia.
                </p>
            </SourceSelector>
        </div>
    );
}

function CustomHtmlEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-4">
            <TextareaField label="HTML" value={settings.html} onChange={(v) => set('html', v)} rows={8} placeholder="<section>...</section>" />
            <p className="text-xs leading-5 text-muted-foreground">
                Gunakan hanya untuk kebutuhan khusus. Pastikan HTML sudah aman dan tidak memuat script berbahaya.
            </p>
        </div>
    );
}

function AboutEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Konten">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
                <TextareaField label="Deskripsi" value={settings.description} onChange={(v) => set('description', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Gambar">
                <ImageField label="Gambar" value={settings.image} onChange={(v) => set('image', v)} />
            </SectionGroup>
        </div>
    );
}

function StatsEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    function updateItem(i, key, val) { set('items', items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)); }
    function addItem() { set('items', [...items, { value: '0', label: '' }]); }
    function removeItem(i) { set('items', items.filter((_, idx) => idx !== i)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Statistik">
                {items.map((item, i) => (
                    <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive"><LuTrash2 className="size-4" /></Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Angka" value={item.value} onChange={(v) => updateItem(i, 'value', v)} placeholder="100+" />
                            <Field label="Label" value={item.label} onChange={(v) => updateItem(i, 'label', v)} placeholder="Pelanggan" />
                        </div>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}><LuPlus className="size-4" /> Tambah</Button>
            </SectionGroup>
        </div>
    );
}

function TestimonialsEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    function updateItem(i, key, val) { set('items', items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)); }
    function addItem() { set('items', [...items, { name: '', content: '', role: '', rating: 5 }]); }
    function removeItem(i) { set('items', items.filter((_, idx) => idx !== i)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceToggle value={settings.source} onChange={(v) => set('source', v)} />
            {settings.source === 'database' ? (
                <p className="text-xs text-muted-foreground rounded-lg border border-dashed p-4 text-center">Data diambil dari menu <strong>Testimoni</strong> (Admin → Testimoni). Kelola data di sana.</p>
            ) : (
                <SectionGroup title="Testimoni">
                    {items.map((item, i) => (
                        <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive"><LuTrash2 className="size-4" /></Button>
                            </div>
                            <Field label="Nama" value={item.name} onChange={(v) => updateItem(i, 'name', v)} />
                            <Field label="Jabatan/Peran" value={item.role} onChange={(v) => updateItem(i, 'role', v)} />
                            <TextareaField label="Isi Testimoni" value={item.content} onChange={(v) => updateItem(i, 'content', v)} rows={2} />
                            <RangeField label="Rating" value={item.rating || 5} onChange={(v) => updateItem(i, 'rating', v)} min={1} max={5} step={1} suffix="⭐" />
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addItem}><LuPlus className="size-4" /> Tambah Testimoni</Button>
                </SectionGroup>
            )}
        </div>
    );
}

function GalleryEditor({ settings, onChange, builderData = {} }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const images = settings.images || [];
    const media = builderData.media || [];
    const selectedMediaIds = normalizeIds(settings.media_ids);
    function updateImage(i, key, val) { set('images', images.map((img, idx) => idx === i ? { ...img, [key]: val } : img)); }
    function addImage() { set('images', [...images, { url: '', caption: '' }]); }
    function removeImage(i) { set('images', images.filter((_, idx) => idx !== i)); }
    function toggleMedia(id) {
        const normalizedId = Number(id);
        const next = selectedMediaIds.includes(normalizedId)
            ? selectedMediaIds.filter((item) => item !== normalizedId)
            : [...selectedMediaIds, normalizedId];
        set('media_ids', next);
    }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceSelector settings={settings} onChange={onChange} description="Mode database mengambil gambar dari Media Library.">
                <div className="grid gap-3 md:grid-cols-2">
                    <SelectField
                        label="Ambil Gambar"
                        value={settings.media_source || 'latest'}
                        onChange={(v) => set('media_source', v)}
                        options={[
                            { value: 'latest', label: 'Media terbaru' },
                            { value: 'selected', label: 'Media dipilih' },
                        ]}
                    />
                    <Field label="Jumlah Gambar" type="number" value={settings.limit || 6} onChange={(v) => set('limit', v)} />
                </div>
                {(settings.media_source || 'latest') === 'selected' && (
                    <div className="grid max-h-72 gap-3 overflow-y-auto rounded-lg border p-3 md:grid-cols-2">
                        {media.map((item) => (
                            <label key={item.id} className="flex cursor-pointer gap-3 rounded-md border bg-background p-2 text-sm">
                                <input type="checkbox" checked={selectedMediaIds.includes(Number(item.id))} onChange={() => toggleMedia(item.id)} />
                                <img src={item.url} alt={item.alt || item.filename} className="h-14 w-20 rounded object-cover" />
                                <span className="min-w-0">
                                    <span className="block truncate font-medium">{item.filename}</span>
                                    <span className="text-xs text-muted-foreground">ID {item.id}</span>
                                </span>
                            </label>
                        ))}
                        {media.length === 0 && (
                            <p className="text-sm text-muted-foreground">Belum ada gambar di Media Library.</p>
                        )}
                    </div>
                )}
            </SourceSelector>
            {(settings.source || 'manual') !== 'database' && (
                <>
                    <Separator />
                    <SectionGroup title="Gambar Manual" description="Tambahkan URL gambar galeri.">
                        {images.map((img, i) => (
                            <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeImage(i)} className="text-destructive hover:text-destructive"><LuTrash2 className="size-4" /></Button>
                                </div>
                                <ImageField label="Gambar" value={img.url} onChange={(v) => updateImage(i, 'url', v)} />
                                <Field label="Caption" value={img.caption} onChange={(v) => updateImage(i, 'caption', v)} />
                            </div>
                        ))}
                        <Button type="button" variant="outline" onClick={addImage}><LuPlus className="size-4" /> Tambah Gambar</Button>
                    </SectionGroup>
                </>
            )}
        </div>
    );
}

function normalizeIds(value) {
    if (typeof value === 'string') {
        value = value.split(',');
    }

    if (!Array.isArray(value)) {
        return [];
    }

    return value.map((id) => Number(id)).filter(Boolean);
}

function PricingEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const items = settings.items || [];
    function updateItem(i, key, val) { set('items', items.map((item, idx) => idx === i ? { ...item, [key]: val } : item)); }
    function addItem() { set('items', [...items, { name: '', price: '', description: '', features: [], featured: false, cta_text: '', cta_url: '' }]); }
    function removeItem(i) { set('items', items.filter((_, idx) => idx !== i)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Paket Harga">
                {items.map((item, i) => (
                    <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-muted-foreground">Paket #{i + 1}</span>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(i)} className="text-destructive hover:text-destructive"><LuTrash2 className="size-4" /></Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Nama Paket" value={item.name} onChange={(v) => updateItem(i, 'name', v)} />
                            <Field label="Harga" value={item.price} onChange={(v) => updateItem(i, 'price', v)} placeholder="Rp 150.000" />
                        </div>
                        <Field label="Deskripsi" value={item.description} onChange={(v) => updateItem(i, 'description', v)} />
                        <TextareaField label="Fitur (satu per baris)" value={(item.features || []).join('\n')} onChange={(v) => updateItem(i, 'features', v.split('\n').filter(Boolean))} rows={3} placeholder="Bersih debu&#10;Ganti thermal paste&#10;Cek hardware" />
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label="Teks Tombol" value={item.cta_text} onChange={(v) => updateItem(i, 'cta_text', v)} placeholder="Pilih Paket" />
                            <Field label="URL Tombol" value={item.cta_url} onChange={(v) => updateItem(i, 'cta_url', v)} />
                        </div>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={!!item.featured} onChange={(e) => updateItem(i, 'featured', e.target.checked)} />
                            Tandai sebagai rekomendasi
                        </label>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={addItem}><LuPlus className="size-4" /> Tambah Paket</Button>
            </SectionGroup>
        </div>
    );
}

function TeamEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    const members = settings.members || [];
    function updateMember(i, key, val) { set('members', members.map((m, idx) => idx === i ? { ...m, [key]: val } : m)); }
    function addMember() { set('members', [...members, { name: '', role: '', photo: '' }]); }
    function removeMember(i) { set('members', members.filter((_, idx) => idx !== i)); }

    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SourceToggle value={settings.source} onChange={(v) => set('source', v)} />
            {settings.source === 'database' ? (
                <p className="text-xs text-muted-foreground rounded-lg border border-dashed p-4 text-center">Data diambil dari menu <strong>Tim</strong> (Admin → Tim). Kelola data di sana.</p>
            ) : (
                <SectionGroup title="Anggota Tim">
                    {members.map((m, i) => (
                        <div key={i} className="space-y-3 rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMember(i)} className="text-destructive hover:text-destructive"><LuTrash2 className="size-4" /></Button>
                            </div>
                            <Field label="Nama" value={m.name} onChange={(v) => updateMember(i, 'name', v)} />
                            <Field label="Jabatan" value={m.role} onChange={(v) => updateMember(i, 'role', v)} />
                            <ImageField label="Foto" value={m.photo} onChange={(v) => updateMember(i, 'photo', v)} />
                        </div>
                    ))}
                    <Button type="button" variant="outline" onClick={addMember}><LuPlus className="size-4" /> Tambah Anggota</Button>
                </SectionGroup>
            )}
        </div>
    );
}

function LocationEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Konten">
                <Field label="Eyebrow" value={settings.eyebrow} onChange={(v) => set('eyebrow', v)} placeholder="Temukan Kami" />
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Info Lokasi" description="Kosongkan untuk ambil dari Pengaturan website.">
                <TextareaField label="Alamat" value={settings.address} onChange={(v) => set('address', v)} placeholder="Otomatis dari settings" />
                <TextareaField label="Jam Operasional" value={settings.hours} onChange={(v) => set('hours', v)} placeholder="Senin – Minggu: 09.30 – 19.30 WIB" />
                <Field label="Catatan Jam" value={settings.hours_note} onChange={(v) => set('hours_note', v)} placeholder="Buka setiap hari termasuk hari libur" />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Embed & Link">
                <TextareaField label="Google Maps Embed URL" value={settings.map_embed} onChange={(v) => set('map_embed', v)} placeholder="Kosongkan untuk ambil dari settings, atau isi URL/kode iframe Google Maps" />
                <Field label="Instagram URL" value={settings.instagram_url} onChange={(v) => set('instagram_url', v)} placeholder="Kosongkan untuk ambil dari settings" />
            </SectionGroup>
        </div>
    );
}

function GoogleReviewsEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Konten" description="Judul opsional di atas widget.">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <Field label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Embed Trustindex" description="Paste kode embed dari dashboard Trustindex (https://www.trustindex.io). Kode biasanya berupa tag <script> atau <div>.">
                <TextareaField label="Kode Embed" value={settings.embed_code} onChange={(v) => set('embed_code', v)} rows={5} placeholder='<script src="https://cdn.trustindex.io/loader.js?..."></script>' />
            </SectionGroup>
        </div>
    );
}

function SellLaptopEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-5">
            <SectionGroup title="Header">
                <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
                <TextareaField label="Subtitle" value={settings.subtitle} onChange={(v) => set('subtitle', v)} />
            </SectionGroup>
            <Separator />
            <SectionGroup title="Gambar">
                <ImageField label="Gambar Section" value={settings.image} onChange={(v) => set('image', v)} />
            </SectionGroup>
        </div>
    );
}

function GenericEditor({ settings, onChange }) {
    const set = (key, val) => onChange({ ...settings, [key]: val });
    return (
        <div className="space-y-4">
            <Field label="Judul" value={settings.title} onChange={(v) => set('title', v)} />
            <TextareaField label="Deskripsi" value={settings.description} onChange={(v) => set('description', v)} />
        </div>
    );
}
