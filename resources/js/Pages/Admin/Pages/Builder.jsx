import { router } from '@inertiajs/react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '@/Layouts/AdminLayout';
import SectionEditor from '@/Components/Builder/SectionEditor';
import SectionPreview from '@/Components/Builder/SectionPreview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    BookOpen,
    ChevronDown,
    ChevronRight,
    Code2,
    CalendarCheck,
    Eye,
    FileText,
    GripVertical,
    HelpCircle,
    Image,
    Images,
    LayoutGrid,
    Megaphone,
    MessageCircle,
    MousePointerClick,
    Pencil,
    Plus,
    Save,
    ShoppingBag,
    Sparkles,
    ShieldCheck,
    Star,
    Trash2,
    Users,
    Wrench,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const defaults = {
    slider: { title: 'Slider Utama', subtitle: '', source: 'database', limit: 5, items: [{ title: 'Judul Slider', subtitle: 'Deskripsi singkat slider', image: '', cta_text: 'Selengkapnya', cta_url: '/kontak' }] },
    about_hero: {
        title: 'Tentang Lumina Tech',
        subtitle: 'Menghadirkan standar baru dalam solusi laptop premium dan layanan teknis terpercaya.',
        image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80',
    },
    hero: { title: 'Judul Hero', subtitle: 'Subjudul halaman', cta_text: 'Hubungi Kami', cta_url: '/kontak', secondary_text: 'Lihat Layanan', secondary_url: '#layanan', tertiary_text: 'Booking Service', tertiary_url: '#booking-service', background_image: '', overlay_opacity: 0.5 },
    about: { title: 'Tentang Kami', subtitle: '', description: 'Ceritakan keunggulan dan pengalaman bisnis Anda.', image: '' },
    journey: {
        title: 'Perjalanan Kami',
        subtitle: 'Berawal dari workshop kecil hingga menjadi destinasi premium.',
        description: 'Kami membangun reputasi lewat ketelitian, komunikasi yang transparan, dan layanan yang konsisten.',
        stats: [{ value: '10+', label: 'Tahun pengalaman' }, { value: '50k+', label: 'Klien puas' }],
    },
    values: {
        title: 'Nilai Inti Kami',
        subtitle: 'Fondasi yang membangun setiap layanan dan produk Lumina Tech.',
        items: [
            { title: 'Inovasi', description: 'Solusi efisien dengan pendekatan modern.' },
            { title: 'Kualitas', description: 'Komponen premium dan pengerjaan yang rapi.' },
            { title: 'Kepercayaan', description: 'Transparansi penuh pada layanan dan data.' },
        ],
    },
    expertise: {
        eyebrow: 'Keahlian Teknis',
        title: 'Presisi di Setiap Perbaikan',
        subtitle: 'Tim teknisi kami menangani diagnostik hardware kompleks dengan presisi tinggi.',
        image: 'https://images.unsplash.com/photo-1581092919535-7146c82b93bd?auto=format&fit=crop&w=1200&q=80',
        bullets: ['Sertifikasi servis multi-brand', 'Diagnosa mikro-elektronik lanjutan', 'Prosedur keamanan data enterprise'],
    },
    services: { title: 'Layanan', subtitle: '', source: 'database', limit: 6, items: [{ title: 'Service Laptop', description: 'Deskripsi layanan' }] },
    products: {
        title: 'Produk Unggulan',
        subtitle: '',
        source: 'database',
        limit: 8,
        category_id: '',
        link_text: 'Lihat Semua',
        link_url: '/produk',
        items: [
            { name: 'Lumina Pro 16"', description: 'M2 Max, 32GB RAM, 1TB SSD. Performa tanpa kompromi.', price: 'Rp 42.999.000', badge: 'New Arrival', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80', cta_url: '/kontak' },
            { name: 'XPS Ultra 13', description: 'i7 13th Gen, 16GB RAM, OLED Display.', price: 'Rp 28.500.000', badge: 'Best Seller', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80', cta_url: '/kontak' },
            { name: 'ThinkPad Carbon G9', description: 'i7, 11th Gen, 16GB RAM. Kondisi 98% mulus.', price: 'Rp 14.500.000', badge: 'Pre-Owned', image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80', cta_url: '/kontak' },
        ],
    },
    booking_service: {
        title: 'Layanan Service Kami',
        subtitle: 'Solusi cepat dan tepat untuk setiap masalah laptop Anda.',
        image: 'https://images.unsplash.com/photo-1581092921461-39b9d08a9b21?auto=format&fit=crop&w=1200&q=80',
        card_title: 'Booking Service',
        card_subtitle: 'Isi form di bawah ini untuk mengatur jadwal perbaikan laptop Anda.',
        badge_title: 'Teknisi Tersertifikasi',
        badge_subtitle: 'Pengerjaan transparan, cepat, dan bergaransi.',
        services: ['Install Ulang OS', 'Upgrade SSD/RAM', 'Service Motherboard', 'Ganti LCD', 'Cleaning Hardware', 'Ganti Keyboard', 'Data Recovery'],
    },
    stats: { title: '', subtitle: '', items: [{ value: '500+', label: 'Pelanggan Puas' }, { value: '10+', label: 'Tahun Pengalaman' }] },
    testimonials: { title: 'Testimoni', subtitle: 'Apa kata pelanggan kami', items: [{ name: 'Pelanggan', content: 'Pelayanan sangat memuaskan!', role: '', rating: 5 }] },
    gallery: { title: 'Galeri', subtitle: '', images: [{ url: '', caption: '' }] },
    image_compare: { title: 'Sebelum dan Sesudah', subtitle: '', before_image: '', after_image: '', before_label: 'Sebelum', after_label: 'Sesudah', initial_position: 50 },
    cta: { title: 'Butuh Bantuan?', description: 'Ajak pengunjung menghubungi tim.', cta_text: 'Hubungi Kami', cta_url: '/kontak' },
    faq: { title: 'FAQ', items: [{ question: 'Pertanyaan?', answer: 'Jawaban.' }] },
    contact: { title: 'Hubungi Kami', subtitle: 'Kirim pesan untuk konsultasi.', map_embed_url: '' },
    blog_list: { title: 'Artikel Terbaru', subtitle: '' },
    rich_text: { title: 'Konten Tambahan', content_html: '<p>Tulis konten di sini.</p>' },
    custom_html: { html: '<section class="py-12"><div class="mx-auto max-w-5xl px-4">Custom HTML</div></section>' },
    pricing: { title: 'Harga Layanan', subtitle: '', items: [{ name: 'Paket Basic', price: 'Rp 100.000', description: '', features: ['Bersih debu', 'Cek hardware'], featured: false, cta_text: 'Pilih', cta_url: '' }] },
    team: { title: 'Tim Kami', subtitle: '', members: [{ name: 'Nama', role: 'Teknisi', photo: '' }] },
};

const sectionMeta = {
    slider: { label: 'Slider', description: 'Carousel slide dari CRUD Slider atau input manual.', icon: Images, category: 'dynamic', dataKey: 'sliders', sourceLabel: 'CRUD Slider' },
    hero: { label: 'Hero', description: 'Banner utama, headline, CTA, dan background.', icon: Sparkles, category: 'static' },
    about: { label: 'Tentang', description: 'Profil singkat bisnis dan value proposition.', icon: FileText, category: 'static' },
    about_hero: { label: 'About Hero', description: 'Judul center dengan gambar besar.', icon: Sparkles, category: 'static' },
    journey: { label: 'Perjalanan', description: 'Cerita bisnis dan statistik ringkas.', icon: LayoutGrid, category: 'static' },
    values: { label: 'Nilai Inti', description: 'Tiga kartu nilai perusahaan.', icon: ShieldCheck, category: 'static' },
    expertise: { label: 'Keahlian Teknis', description: 'Section gelap dengan gambar dan checklist.', icon: Wrench, category: 'static' },
    services: { label: 'Layanan', description: 'Data dari CRUD Layanan atau input manual.', icon: Wrench, category: 'dynamic', dataKey: 'services', sourceLabel: 'CRUD Layanan' },
    products: { label: 'Produk Unggulan', description: 'Data dari CRUD Produk atau input manual.', icon: ShoppingBag, category: 'dynamic', dataKey: 'products', sourceLabel: 'CRUD Produk' },
    booking_service: { label: 'Booking Service', description: 'Daftar layanan dan form booking service.', icon: CalendarCheck, category: 'static' },
    stats: { label: 'Statistik', description: 'Angka pencapaian dan metric penting.', icon: LayoutGrid, category: 'static' },
    image_compare: { label: 'Image Compare', description: 'Slider before-after interaktif.', icon: Image, category: 'static' },
    cta: { label: 'CTA', description: 'Ajakan aksi dengan tombol utama atau WhatsApp dari pengaturan.', icon: Megaphone, category: 'dynamic', sourceLabel: 'Settings' },
    faq: { label: 'FAQ', description: 'Pertanyaan dan jawaban accordion.', icon: HelpCircle, category: 'static' },
    pricing: { label: 'Pricing', description: 'Tabel harga atau paket layanan.', icon: MousePointerClick, category: 'static' },
    custom_html: { label: 'Custom HTML', description: 'Blok HTML khusus untuk kebutuhan bebas.', icon: Code2, category: 'static' },
    testimonials: { label: 'Testimoni', description: 'Data dari CRUD Testimoni atau input manual.', icon: Star, category: 'dynamic', sourceLabel: 'CRUD Testimoni' },
    team: { label: 'Tim', description: 'Data dari CRUD Tim atau input manual.', icon: Users, category: 'dynamic', sourceLabel: 'CRUD Tim' },
    gallery: { label: 'Galeri', description: 'Gambar dari Media Library atau input manual.', icon: Images, category: 'dynamic', dataKey: 'media', sourceLabel: 'Media Library' },
    blog_list: { label: 'Blog List', description: 'Artikel terbaru dari database.', icon: BookOpen, category: 'dynamic', dataKey: 'articleCategories', sourceLabel: 'Artikel' },
    rich_text: { label: 'Rich Text', description: 'Konten visual dengan editor lengkap.', icon: FileText, category: 'static' },
    contact: { label: 'Kontak', description: 'Form kontak, data dari Pengaturan.', icon: MessageCircle, category: 'dynamic', sourceLabel: 'Settings' },
};

export default function Builder({ page, sectionTypes, builderData = {} }) {
    const [form, setForm] = useState({
        title: page.title || '',
        slug: page.slug || '',
        status: page.status || 'draft',
        meta_title: page.meta_title || '',
        meta_description: page.meta_description || '',
        meta_og_image: page.meta_og_image || '',
    });
    const [sections, setSections] = useState((page.sections || []).map((section) => ({ ...section, clientId: String(section.id) })));
    const [saving, setSaving] = useState(false);
    const [addSectionOpen, setAddSectionOpen] = useState(false);

    const title = page.id ? `Edit: ${page.title}` : 'Buat Halaman';
    const sectionIds = useMemo(() => sections.map((section) => section.clientId), [sections]);

    function addSection(type) {
        setSections((items) => [
            ...items,
            { clientId: crypto.randomUUID(), type, settings: defaults[type] || { title: readableType(type) }, is_visible: true },
        ]);
    }

    function updateSection(clientId, patch) {
        setSections((items) => items.map((item) => item.clientId === clientId ? { ...item, ...patch } : item));
    }

    function removeSection(clientId) {
        setSections((items) => items.filter((item) => item.clientId !== clientId));
    }

    function onDragEnd(event) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        setSections((items) => {
            const oldIndex = items.findIndex((item) => item.clientId === active.id);
            const newIndex = items.findIndex((item) => item.clientId === over.id);
            return arrayMove(items, oldIndex, newIndex);
        });
    }

    function save(event) {
        event.preventDefault();
        setSaving(true);
        const payload = { ...form, sections };
        const options = { onFinish: () => setSaving(false), preserveScroll: true };
        page.id ? router.put(`/admin/pages/${page.id}`, payload, options) : router.post('/admin/pages', payload, options);
    }

    return (
        <AdminLayout title={title}>
            <form onSubmit={save} className="space-y-6">
                <div className="sticky top-16 z-20 -mx-4 border-b bg-background/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
                                <Badge variant={form.status === 'published' ? 'default' : 'secondary'}>{form.status}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Susun section, isi konten visual, lalu simpan untuk publish atau preview.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <PageSettingsDialog form={form} setForm={setForm} />
                            <Button type="submit" disabled={saving}>
                                <Save className="size-4" />
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </Button>
                            {page.id && (
                                <Button asChild variant="outline">
                                    <a href={`/admin/pages/${page.id}`}>
                                        <Eye className="size-4" />
                                        Preview
                                    </a>
                                </Button>
                            )}
                            <Button asChild variant="ghost">
                                <a href="/admin/pages">Kembali</a>
                            </Button>
                        </div>
                    </div>
                </div>

                <main className="space-y-4">
                    <Card>
                        <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <h2 className="text-lg font-semibold">Section Halaman</h2>
                                <p className="text-sm text-muted-foreground">
                                    {sections.length} section tersusun, {sections.filter((section) => section.is_visible).length} aktif ditampilkan.
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Badge variant="outline">{sections.length} total</Badge>
                                <Badge variant="outline">{sections.filter((section) => section.is_visible).length} visible</Badge>
                                {sections.length > 0 && (
                                    <Button type="button" size="sm" onClick={() => setAddSectionOpen(true)}>
                                        <Plus className="size-4" />
                                        Tambah Section
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-4">
                                {sections.map((section, index) => (
                                    <SortableSection key={section.clientId} section={section} index={index} onUpdate={updateSection} onRemove={removeSection} builderData={builderData} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>

                    {sections.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="flex min-h-72 flex-col items-center justify-center p-10 text-center">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <Plus className="size-5 text-muted-foreground" />
                                </div>
                                <h3 className="mt-4 text-base font-semibold">Belum ada section</h3>
                                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                                    Pilih Hero, Layanan, FAQ, atau section lain untuk mulai menyusun halaman.
                                </p>
                                <Button type="button" className="mt-5" onClick={() => setAddSectionOpen(true)}>
                                    <Plus className="size-4" />
                                    Tambah Section
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </main>

                <AddSectionDialog
                    open={addSectionOpen}
                    onOpenChange={setAddSectionOpen}
                    sectionTypes={sectionTypes}
                    builderData={builderData}
                    onAdd={(type) => {
                        addSection(type);
                        setAddSectionOpen(false);
                    }}
                />
            </form>
        </AdminLayout>
    );
}

function PageSettingsDialog({ form, setForm }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline">
                    <Pencil className="size-4" />
                    Informasi Halaman
                </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Informasi Halaman</DialogTitle>
                    <DialogDescription>
                        Atur data dasar, status publish, dan metadata SEO halaman.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold">Data Halaman</h3>
                            <p className="mt-1 text-xs text-muted-foreground">Dipakai untuk judul admin dan URL publik.</p>
                        </div>
                        <Field label="Judul" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
                        <Field label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} placeholder="otomatis-dari-judul" />
                        <label className="space-y-2">
                            <Label>Status</Label>
                            <select className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </label>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-semibold">SEO</h3>
                            <p className="mt-1 text-xs text-muted-foreground">Opsional. Jika kosong, judul halaman tetap dipakai.</p>
                        </div>
                        <Field label="Meta title" value={form.meta_title} onChange={(value) => setForm({ ...form, meta_title: value })} />
                        <Textarea label="Meta description" value={form.meta_description} onChange={(value) => setForm({ ...form, meta_description: value })} />
                        <Field label="OG image URL" value={form.meta_og_image} onChange={(value) => setForm({ ...form, meta_og_image: value })} />
                    </div>
                </div>

                <DialogFooter>
                    <p className="text-xs text-muted-foreground">
                        Perubahan disimpan permanen setelah klik tombol Simpan di header builder.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function AddSectionDialog({ open, onOpenChange, sectionTypes, builderData = {}, onAdd }) {
    const staticTypes = sectionTypes.filter((t) => (sectionMeta[t]?.category || 'static') === 'static');
    const dynamicTypes = sectionTypes.filter((t) => sectionMeta[t]?.category === 'dynamic');

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Tambah Section</DialogTitle>
                    <DialogDescription>
                        Pilih blok konten. Section database akan otomatis terhubung ke data CRUD yang tersedia.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {dynamicTypes.length > 0 && (
                        <div>
                            <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Database / CRUD</h3>
                                <Badge variant="secondary">{dynamicTypes.length} section</Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                {dynamicTypes.map((type) => (
                                    <SectionLibraryButton key={type} type={type} builderData={builderData} onClick={() => onAdd(type)} />
                                ))}
                            </div>
                        </div>
                    )}
                    <div>
                        <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Manual</h3>
                            <Badge variant="outline">{staticTypes.length} section</Badge>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            {staticTypes.map((type) => (
                                <SectionLibraryButton key={type} type={type} builderData={builderData} onClick={() => onAdd(type)} />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

function SectionLibraryButton({ type, builderData = {}, onClick }) {
    const meta = sectionMeta[type] || { label: readableType(type), description: 'Section konten umum.', icon: FileText };
    const Icon = meta.icon;
    const isDynamic = meta.category === 'dynamic';
    const count = meta.dataKey ? builderData[meta.dataKey]?.length : null;

    return (
        <button
            type="button"
            onClick={onClick}
            className="group flex min-h-28 w-full flex-col overflow-hidden rounded-lg border text-left transition hover:border-primary/30 hover:shadow-sm"
        >
            <SectionPreview type={type} />
            <span className="flex flex-1 items-start gap-3 p-3">
                <span className="rounded-md border bg-background p-1.5">
                    <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{meta.label}</span>
                        <Badge variant={isDynamic ? 'secondary' : 'outline'} className="text-[10px]">{isDynamic ? 'Database' : 'Manual'}</Badge>
                    </span>
                    <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">{meta.description}</span>
                </span>
                <Plus className="mt-1 size-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
            </span>
        </button>
    );
}

function SortableSection({ section, index, onUpdate, onRemove, builderData }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: section.clientId });
    const style = { transform: CSS.Transform.toString(transform), transition };
    const [open, setOpen] = useState(true);
    const meta = sectionMeta[section.type] || { label: readableType(section.type), icon: FileText };
    const Icon = meta.icon;
    const summary = sectionSummary(section);

    return (
        <Card ref={setNodeRef} style={style} className="gap-0 overflow-hidden py-0">
            <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Button type="button" variant="outline" size="icon" {...attributes} {...listeners} className="cursor-grab">
                        <GripVertical className="size-4" />
                    </Button>
                    <button type="button" onClick={() => setOpen(!open)} className="flex min-w-0 items-center gap-3 text-left">
                        <span className="hidden rounded-md border bg-muted p-2 sm:inline-flex">
                            <Icon className="size-4" />
                        </span>
                        <span className="min-w-0">
                            <span className="flex items-center gap-2">
                                {open ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                                <span className="truncate text-sm font-semibold">{index + 1}. {meta.label}</span>
                            </span>
                            <span className="mt-1 block truncate text-xs text-muted-foreground">{summary}</span>
                        </span>
                    </button>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Checkbox checked={section.is_visible} onCheckedChange={(checked) => onUpdate(section.clientId, { is_visible: Boolean(checked) })} />
                        <span className="hidden sm:inline">{section.is_visible ? 'Visible' : 'Hidden'}</span>
                    </label>
                    <Button type="button" variant="destructive" size="icon" onClick={() => onRemove(section.clientId)}>
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            </div>
            {open && (
                <>
                    <Separator />
                    <div className="p-4">
                        <SectionEditor type={section.type} settings={section.settings || {}} onChange={(newSettings) => onUpdate(section.clientId, { settings: newSettings })} builderData={builderData} />
                    </div>
                </>
            )}
        </Card>
    );
}

function Field({ label, value, onChange, ...props }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <Input {...props} value={value || ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}

function Textarea({ label, value, onChange, rows = 4 }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea rows={rows} className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50" value={value || ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}

function sectionSummary(section) {
    const settings = section.settings || {};
    const source = settings.source === 'database' ? 'Database' : 'Manual';
    const summary = settings.title || settings.subtitle || settings.description || settings.html || 'Belum ada ringkasan konten.';

    return `${source}: ${summary}`;
}

function readableType(type) {
    return String(type).split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
