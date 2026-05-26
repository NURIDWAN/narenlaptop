import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageField from '@/components/admin/ImageField';
import { PenLine, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Index({ sliders, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editing, setEditing] = useState(null);
    const items = sliders.data || [];

    function handleSearch(event) {
        event.preventDefault();
        router.get('/admin/sliders', { search }, { preserveState: true, replace: true });
    }

    function remove(id) {
        if (!confirm('Hapus slider ini?')) return;
        router.delete(`/admin/sliders/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Slider">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="w-64 pl-9" placeholder="Cari slider..." value={search} onChange={(event) => setSearch(event.target.value)} />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Cari</Button>
                </form>
                <Button type="button" size="sm" onClick={() => setEditing('new')}>
                    <Plus className="size-4" />
                    Tambah Slider
                </Button>
            </div>

            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Slider</th>
                                    <th className="px-4 py-3 font-medium">CTA</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Urutan</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-8 text-center text-muted-foreground">Belum ada slider.</td>
                                    </tr>
                                )}
                                {items.map((slider) => (
                                    <tr key={slider.id} className="hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {(slider.images?.[0] || slider.image) ? (
                                                    <img src={slider.images?.[0] || slider.image} alt={slider.title} className="h-14 w-20 rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-14 w-20 rounded-md bg-muted" />
                                                )}
                                                <div className="min-w-0">
                                                    <p className="font-medium">{slider.title}</p>
                                                    <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">{slider.subtitle || '-'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{slider.cta_text || '-'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={slider.is_active ? 'default' : 'secondary'}>{slider.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{slider.order}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditing(slider.id)}>
                                                    <PenLine className="size-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(slider.id)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {sliders.last_page > 1 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1">
                    {sliders.links.map((link, index) => (
                        <Button key={index} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    ))}
                </div>
            )}

            <SliderFormModal
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                data={editing === 'new' ? null : items.find((item) => item.id === editing)}
            />
        </AdminLayout>
    );
}

function SliderFormModal({ open, onOpenChange, data }) {
    const isEdit = Boolean(data);
    const initialImages = normalizeImages(data);
    const form = useForm({
        title: data?.title || '',
        subtitle: data?.subtitle || '',
        image: initialImages[0] || '',
        images: initialImages,
        badge: data?.badge || '',
        cta_text: data?.cta_text || '',
        cta_url: data?.cta_url || '',
        is_active: data?.is_active ?? true,
        order: data?.order || 0,
    });

    useEffect(() => {
        if (!open) return;
        const images = normalizeImages(data);
        form.setData({
            title: data?.title || '',
            subtitle: data?.subtitle || '',
            image: images[0] || '',
            images,
            badge: data?.badge || '',
            cta_text: data?.cta_text || '',
            cta_url: data?.cta_url || '',
            is_active: data?.is_active ?? true,
            order: data?.order || 0,
        });
        form.clearErrors();
    }, [open, data?.id]);

    function close() {
        onOpenChange(false);
        form.reset();
        form.clearErrors();
    }

    function addImage() {
        form.setData('images', [...form.data.images, '']);
    }

    function updateImage(index, value) {
        const next = [...form.data.images];
        next[index] = value;
        form.setData({
            ...form.data,
            images: next,
            image: next[0] || '',
        });
    }

    function removeImage(index) {
        const next = form.data.images.filter((_, i) => i !== index);
        const normalized = next.length ? next : [''];
        form.setData({
            ...form.data,
            images: normalized,
            image: normalized[0] || '',
        });
    }

    function submit(event) {
        event.preventDefault();
        const cleanedImages = form.data.images.map((value) => value.trim()).filter(Boolean);
        form.transform((data) => ({
            ...data,
            ...(isEdit ? { _method: 'put' } : {}),
            images: cleanedImages,
            image: cleanedImages[0] || '',
        }));
        const options = { preserveScroll: true, onSuccess: close };

        isEdit ? form.post(`/admin/sliders/${data.id}`, options) : form.post('/admin/sliders', options);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    close();
                    return;
                }
                onOpenChange(true);
            }}
        >
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Slider' : 'Tambah Slider'}</DialogTitle>
                    <DialogDescription>Satu slider bisa berisi beberapa gambar untuk rotasi di section slider.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Judul" value={form.data.title} onChange={(value) => form.setData('title', value)} required />
                        <Field label="Badge" value={form.data.badge} onChange={(value) => form.setData('badge', value)} placeholder="Promo Service" />
                    </div>
                    <Textarea label="Subtitle" value={form.data.subtitle} onChange={(value) => form.setData('subtitle', value)} />
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Teks CTA" value={form.data.cta_text} onChange={(value) => form.setData('cta_text', value)} placeholder="Konsultasi" />
                        <Field label="URL CTA" value={form.data.cta_url} onChange={(value) => form.setData('cta_url', value)} placeholder="/kontak" />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Urutan" type="number" value={form.data.order} onChange={(value) => form.setData('order', Number(value) || 0)} />
                        <label className="flex items-end gap-2 text-sm">
                            <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
                            Aktif
                        </label>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Gambar Slider</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addImage}>
                                <Plus className="size-4" />
                                Tambah Gambar
                            </Button>
                        </div>
                        <div className="space-y-3">
                            {form.data.images.map((image, index) => (
                                <div key={index} className="rounded-lg border border-slate-200 p-3">
                                    <div className="mb-2 flex items-center justify-between">
                                        <p className="text-xs font-medium text-slate-600">Gambar {index + 1}</p>
                                        {form.data.images.length > 1 && (
                                            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => removeImage(index)}>
                                                Hapus
                                            </Button>
                                        )}
                                    </div>
                                    <ImageField
                                        label=""
                                        value={image}
                                        onChange={(value) => updateImage(index, value)}
                                        placeholder="/storage/media/slider.jpg"
                                    />
                                    {form.errors[`images.${index}`] && (
                                        <p className="mt-2 text-xs text-red-600">{form.errors[`images.${index}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {form.errors.images && <p className="text-xs text-red-600">{form.errors.images}</p>}
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={form.processing}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={close}>Batal</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function Field({ label, value, onChange, ...props }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <Input {...props} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}

function normalizeImages(data) {
    if (!data) return [''];
    if (Array.isArray(data.images) && data.images.length) {
        return data.images.filter(Boolean);
    }
    if (data.image) return [data.image];
    return [''];
}

function Textarea({ label, value, onChange }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea
                rows={4}
                className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}
