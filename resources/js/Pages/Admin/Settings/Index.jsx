import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { LuImagePlus, LuSave, LuX } from 'react-icons/lu';
import { useRef, useState } from 'react';

const groups = [
    {
        title: 'Umum',
        description: 'Identitas website',
        fields: [
            { key: 'site_name', label: 'Nama Website' },
            { key: 'site_logo', label: 'Logo Website', type: 'image' },
            { key: 'favicon', label: 'Favicon', type: 'image' },
            { key: 'primary_color', label: 'Warna Utama', placeholder: '#040B20' },
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
            { key: 'google_maps_embed', label: 'Embed Google Maps', multiline: true },
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
];

export default function Index({ settings }) {
    const [form, setForm] = useState(
        Object.fromEntries(groups.flatMap(g => g.fields).map(f => [f.key, settings[f.key] || '']))
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
                                            value={form[field.key] || ''}
                                            onChange={(e) => set(field.key, e.target.value)}
                                            placeholder={field.placeholder || ''}
                                        />
                                    )}
                                </div>
                            ))}
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
            setError('Gagal upload gambar. Gunakan file JPG, PNG, WebP, GIF, atau SVG maksimal 5MB.');
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    return (
        <div className="space-y-3">
            {value && (
                <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                    <img src={value} alt="" className="h-16 w-16 rounded-md border bg-white object-contain p-1" />
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

            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
