import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { LuImagePlus, LuSave, LuX } from 'react-icons/lu';
import { useRef, useState } from 'react';

const GEMINI_FREE_MODELS = [
    { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
    { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash-Lite' },
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-2.0-flash-lite', label: 'Gemini 2.0 Flash-Lite' },
];

const CUSTOM_MODEL = '__custom__';

const groups = [
    {
        title: 'Umum',
        description: 'Identitas website',
        fields: [
            { key: 'site_name', label: 'Nama Website' },
            { key: 'site_logo', label: 'Logo Website', type: 'image' },
            { key: 'favicon', label: 'Favicon', type: 'image' },
            { key: 'logo_display_mode', label: 'Mode Tampilan Logo', type: 'select', options: [
                { value: 'logo_text', label: 'Logo + Nama Website' },
                { value: 'logo_only', label: 'Logo Saja' },
                { value: 'text_only', label: 'Nama Website Saja' },
            ]},
            { key: 'primary_color', label: 'Warna Utama', placeholder: '#061329' },
            { key: 'navbar_color', label: 'Warna Navbar', placeholder: '#061329' },
        ],
    },
    {
        title: 'Warna Section',
        description: 'Warna default untuk section halaman. Bisa di-override per section di Page Builder.',
        fields: [
            { key: 'section_bg_light', label: 'Background Section Terang', placeholder: '#f8f5ec' },
            { key: 'section_bg_dark', label: 'Background Section Gelap', placeholder: '#061329' },
            { key: 'section_text_light', label: 'Teks di Background Terang', placeholder: '#1f2937' },
            { key: 'section_text_dark', label: 'Teks di Background Gelap', placeholder: '#f1f5f9' },
            { key: 'section_accent_color', label: 'Warna Aksen Section', placeholder: '#BE974E' },
        ],
    },
    {
        title: 'Kontak',
        description: 'Informasi kontak dan lokasi',
        fields: [
            { key: 'email', label: 'Email' },
            { key: 'whatsapp_number', label: 'Nomor WhatsApp', placeholder: '6281234567890' },
            { key: 'whatsapp_message_default', label: 'Pesan Default WA' },
            { key: 'address', label: 'Alamat' },
            { key: 'google_maps_embed', label: 'Embed Google Maps', multiline: true, placeholder: 'https://www.google.com/maps/embed?pb=... atau kode iframe Google Maps' },
        ],
    },
    {
        title: 'Sosial Media',
        description: 'Link profil sosial media',
        fields: [
            { key: 'social_instagram', label: 'Instagram' },
            { key: 'social_facebook', label: 'Facebook' },
            { key: 'social_tiktok', label: 'TikTok' },
            { key: 'social_youtube', label: 'YouTube' },
            { key: 'social_shopee', label: 'Shopee' },
        ],
    },
    {
        title: 'SEO & Verifikasi',
        description: 'Google Search Console dan pengaturan SEO',
        fields: [
            { key: 'google_site_verification', label: 'Google Site Verification', placeholder: 'Kode verifikasi dari Google Search Console' },
            { key: 'business_hours', label: 'Jam Operasional', placeholder: 'Mo-Fr 08:00-17:00, Sa 09:00-15:00' },
            { key: 'robots_txt', label: 'Robots.txt (custom)', multiline: true, placeholder: 'User-agent: *\nAllow: /' },
        ],
    },
    {
        title: 'Analytics & Scripts',
        description: 'Tracking ID dan custom scripts',
        fields: [
            { key: 'ga_tracking_id', label: 'Google Analytics ID', placeholder: 'G-XXXXXXX' },
            { key: 'gtm_id', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX' },
            { key: 'header_scripts', label: 'Header Scripts', multiline: true },
            { key: 'footer_scripts', label: 'Footer Scripts', multiline: true },
        ],
    },
    {
        key: 'ai',
        title: 'Gemini AI',
        description: 'Pengaturan Gemini API untuk generate artikel otomatis',
        fields: [
            { key: 'ai_base_url', label: 'Base URL API', placeholder: 'https://generativelanguage.googleapis.com/v1beta/openai', defaultValue: 'https://generativelanguage.googleapis.com/v1beta/openai' },
            { key: 'ai_api_key', label: 'API Key', placeholder: 'Gemini API key dari Google AI Studio' },
            { key: 'ai_model', label: 'Model', type: 'gemini-model', placeholder: 'gemini-2.5-flash', defaultValue: 'gemini-2.5-flash' },
        ],
    },
    {
        title: 'AI Article Quality',
        description: 'Default kualitas konten untuk generate artikel panjang edukatif',
        fields: [
            { key: 'ai_article_word_count', label: 'Target Jumlah Kata', type: 'number', placeholder: '1000', defaultValue: '1000' },
            { key: 'ai_article_tone', label: 'Gaya Bahasa', placeholder: 'edukatif dan mudah dipahami', defaultValue: 'edukatif dan mudah dipahami' },
            { key: 'ai_article_audience', label: 'Target Pembaca', placeholder: 'pemilik laptop dan gadget non-teknis', defaultValue: 'pemilik laptop dan gadget non-teknis' },
            { key: 'ai_article_brand_context', label: 'Konteks Brand', multiline: true, placeholder: 'Naren Laptop adalah layanan service laptop dan gadget...', defaultValue: 'Naren Laptop adalah layanan service laptop dan gadget yang membantu pelanggan memahami masalah perangkat, opsi perbaikan, dan cara perawatan dengan bahasa yang jelas.' },
            { key: 'ai_article_cta', label: 'CTA Artikel', multiline: true, placeholder: 'Ajak pembaca konsultasi atau menghubungi tim service.', defaultValue: 'Ajak pembaca berkonsultasi dengan Naren Laptop jika membutuhkan diagnosis atau bantuan service.' },
            { key: 'ai_article_internal_links', label: 'Internal Link', multiline: true, placeholder: '/blog\n/produk\n/kontak', defaultValue: '/blog\n/produk\n/kontak' },
            { key: 'ai_article_prompt_notes', label: 'Instruksi Tambahan', multiline: true, placeholder: 'Contoh: hindari istilah teknis berlebihan, gunakan contoh kasus umum.' },
        ],
    },
];

export default function Index({ settings }) {
    const [form, setForm] = useState(
        Object.fromEntries(groups.flatMap(g => g.fields).map(f => [f.key, settings[f.key] || f.defaultValue || '']))
    );
    const [saving, setSaving] = useState(false);

    function set(key, val) {
        setForm(prev => ({ ...prev, [key]: val }));
    }

    function save(e) {
        e.preventDefault();
        setSaving(true);
        router.put('/admin/settings', { settings: form }, { preserveScroll: true, onFinish: () => setSaving(false) });
    }

    return (
        <AdminLayout title="Pengaturan">
            <form onSubmit={save} className="mx-auto max-w-3xl space-y-6">
                {groups.map((group) => (
                    <Card key={group.title}>
                        <CardHeader>
                            <CardTitle className="text-base">{group.title}</CardTitle>
                            <CardDescription>{group.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {group.fields.map((field) => (
                                <div key={field.key} className="space-y-2">
                                    <Label htmlFor={field.key}>{field.label}</Label>
                                    {field.type === 'image' ? (
                                        <ImageSettingField
                                            id={field.key}
                                            value={form[field.key] || ''}
                                            onChange={(value) => set(field.key, value)}
                                        />
                                    ) : field.type === 'select' ? (
                                        <select
                                            id={field.key}
                                            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            value={form[field.key] || field.options?.[0]?.value || ''}
                                            onChange={(e) => set(field.key, e.target.value)}
                                        >
                                            {field.options?.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                    ) : field.type === 'gemini-model' ? (
                                        <GeminiModelField
                                            id={field.key}
                                            value={form[field.key] || ''}
                                            onChange={(value) => set(field.key, value)}
                                        />
                                    ) : field.multiline ? (
                                        <textarea
                                            id={field.key}
                                            rows={3}
                                            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                            value={form[field.key] || ''}
                                            onChange={(e) => set(field.key, e.target.value)}
                                            placeholder={field.placeholder || ''}
                                        />
                                    ) : (
                                        <Input
                                            id={field.key}
                                            type={field.type === 'number' ? 'number' : 'text'}
                                            value={form[field.key] || ''}
                                            onChange={(e) => set(field.key, e.target.value)}
                                            placeholder={field.placeholder || ''}
                                        />
                                    )}
                                </div>
                            ))}
                            {group.key === 'ai' && (
                                <VerifyAiButton baseUrl={form.ai_base_url} apiKey={form.ai_api_key} model={form.ai_model} />
                            )}
                        </CardContent>
                    </Card>
                ))}

                <Button type="submit" disabled={saving} className="w-full">
                    <LuSave className="size-4" />
                    {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
            </form>
        </AdminLayout>
    );
}

function GeminiModelField({ id, value, onChange }) {
    const isFreeModel = GEMINI_FREE_MODELS.some((model) => model.value === value);
    const isCustom = value && !isFreeModel;

    return (
        <div className="space-y-2">
            <select
                id={id}
                className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={(isCustom || value === '') ? CUSTOM_MODEL : value}
                onChange={(e) => onChange(e.target.value === CUSTOM_MODEL ? '' : e.target.value)}
            >
                {GEMINI_FREE_MODELS.map((model) => (
                    <option key={model.value} value={model.value}>{model.label}</option>
                ))}
                <option value={CUSTOM_MODEL}>Model custom</option>
            </select>
            {(isCustom || value === '') && (
                <Input
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Masukkan ID model Gemini"
                />
            )}
        </div>
    );
}

function VerifyAiButton({ baseUrl, apiKey, model }) {
    const [status, setStatus] = useState(null); // null | 'loading' | 'ok' | 'error'
    const [message, setMessage] = useState('');

    async function verify() {
        if (!baseUrl || !apiKey || !model) {
            setStatus('error');
            setMessage('Isi semua field AI (Base URL, API Key, Model) terlebih dahulu.');
            return;
        }

        setStatus('loading');
        setMessage('');
        try {
            const { data } = await axios.post('/admin/settings/verify-ai', { base_url: baseUrl, api_key: apiKey, model });
            setStatus(data.ok ? 'ok' : 'error');
            setMessage(data.message);
        } catch (err) {
            setStatus('error');
            const errMsg = err.response?.data?.message || err.message || 'Gagal menghubungi server.';
            setMessage(errMsg);
        }
    }

    return (
        <div className="space-y-2 pt-2">
            <Button type="button" variant="outline" onClick={verify} disabled={status === 'loading'}>
                {status === 'loading' ? 'Menghubungkan...' : 'Verifikasi Koneksi AI'}
            </Button>
            {message && (
                <p className={`text-sm font-medium ${status === 'ok' ? 'text-green-600' : 'text-destructive'}`}>
                    {status === 'ok' ? '✓' : '✗'} {message}
                </p>
            )}
        </div>
    );
}

function ImageSettingField({ id, value, onChange }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    async function upload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/admin/media/upload', formData);
            onChange(data.url);
        } catch {
            setError('Gagal upload gambar. Gunakan file JPG, PNG, WebP, GIF, SVG, atau ICO maksimal 5MB.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-3">
            {value && (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border bg-white p-1">
                        <img src={value} alt="Preview" className="max-h-full max-w-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-muted-foreground">{value}</p>
                        <Button type="button" variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={() => onChange('')}>
                            <LuX className="size-4" />
                            Hapus gambar
                        </Button>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                    id={id}
                    value={value || ''}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder="/storage/media/logo.png"
                />
                <Button type="button" variant="outline" disabled={uploading} onClick={() => inputRef.current?.click()}>
                    <LuImagePlus className="size-4" />
                    {uploading ? 'Uploading...' : 'Upload'}
                </Button>
            </div>

            <input ref={inputRef} type="file" accept="image/*,.ico" className="hidden" onChange={upload} />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
