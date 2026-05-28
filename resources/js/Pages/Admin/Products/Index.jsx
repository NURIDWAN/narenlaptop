import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from '@/Components/Editor/RichTextEditor';
import ImageField from '@/components/admin/ImageField';
import { LuPenLine, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useEffect, useMemo, useState } from 'react';

export default function ProductsIndex({ products, categories = [] }) {
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState(null);
    const items = products.data || [];

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return items;
        return items.filter((item) => {
            const haystack = [item.name, item.category?.name, stripHtml(item.description), item.badge, item.price, item.discount_price].join(' ').toLowerCase();
            return haystack.includes(q);
        });
    }, [items, search]);

    function handleDelete(id) {
        if (!confirm('Hapus produk ini?')) return;
        router.delete(`/admin/products/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Produk">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative">
                    <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                    <Input className="w-64 pl-9" placeholder="Cari produk..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <Button size="sm" onClick={() => setEditing('new')}><LuPlus className="size-4" /> Tambah</Button>
            </div>

            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Produk</th>
                                    <th className="px-4 py-3 font-medium">Kategori</th>
                                    <th className="px-4 py-3 font-medium">Harga</th>
                                    <th className="px-4 py-3 font-medium">Harga Diskon</th>
                                    <th className="px-4 py-3 font-medium">Urutan</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Belum ada produk.</td>
                                    </tr>
                                )}
                                {filtered.map((product) => (
                                    <tr key={product.id} className="transition hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                {(product.images?.[0] || product.image) ? (
                                                    <img src={product.images?.[0] || product.image} alt={product.name} className="h-12 w-16 rounded-md object-cover" />
                                                ) : (
                                                    <div className="h-12 w-16 rounded-md bg-muted" />
                                                )}
                                                <div className="min-w-0">
                                                    <span className="font-medium text-foreground">{product.name}</span>
                                                    <span className="text-muted-foreground mt-1 block max-w-xl truncate text-xs">{stripHtml(product.description) || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.category?.name || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.price || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.discount_price || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.order}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={product.is_active ? 'default' : 'secondary'}>{product.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditing(product.id)}>
                                                    <LuPenLine className="size-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(product.id)}>
                                                    <LuTrash2 className="size-4" />
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

            <ProductFormModal
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                data={editing === 'new' ? null : items.find((item) => item.id === editing)}
                categories={categories}
            />
        </AdminLayout>
    );
}

function ProductFormModal({ open, onOpenChange, data, categories = [] }) {
    const isEdit = !!data;
    const initialImages = normalizeImages(data);
    const form = useForm({
        name: data?.name || '',
        category_id: data?.category_id || '',
        description: data?.description || '',
        price: data?.price || '',
        discount_price: data?.discount_price || '',
        badge: data?.badge || '',
        image: initialImages[0] || '',
        images: initialImages,
        image_file: null,
        cta_url: data?.cta_url || '',
        order: data?.order || 0,
        is_active: data?.is_active ?? true,
    });

    useEffect(() => {
        if (!open) return;
        const images = normalizeImages(data);
        form.setData({
            name: data?.name || '',
            category_id: data?.category_id || '',
            description: data?.description || '',
            price: data?.price || '',
            discount_price: data?.discount_price || '',
            badge: data?.badge || '',
            image: images[0] || '',
            images,
            image_file: null,
            cta_url: data?.cta_url || '',
            order: data?.order || 0,
            is_active: data?.is_active ?? true,
        });
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

    function submit(e) {
        e.preventDefault();
        const cleanedImages = form.data.images.map((value) => value.trim()).filter(Boolean);
        form.transform((data) => ({
            ...data,
            ...(isEdit ? { _method: 'put' } : {}),
            category_id: data.category_id || '',
            images: cleanedImages,
            image: cleanedImages[0] || '',
        }));
        const options = { preserveScroll: true, onSuccess: close, forceFormData: true };
        if (isEdit) form.post(`/admin/products/${data.id}`, options);
        else form.post('/admin/products', options);
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
                    <DialogTitle>{isEdit ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
                    <DialogDescription>Data aktif bisa dipakai oleh section Produk mode database.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nama Produk" value={form.data.name} onChange={(v) => form.setData('name', v)} required />
                    <label className="space-y-2">
                        <Label>Kategori Produk</Label>
                        <select
                            className="border-input bg-background h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={form.data.category_id || ''}
                            onChange={(event) => form.setData('category_id', event.target.value)}
                        >
                            <option value="">Tanpa kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>{category.name}</option>
                            ))}
                        </select>
                        {form.errors.category_id && <p className="text-xs text-red-600">{form.errors.category_id}</p>}
                    </label>
                    <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <RichTextEditor value={form.data.description} onChange={(v) => form.setData('description', v)} minHeightClass="min-h-44" />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <Field label="Harga" value={form.data.price} onChange={(v) => form.setData('price', v)} placeholder="Rp 12.000.000" />
                        <Field label="Harga Diskon" value={form.data.discount_price} onChange={(v) => form.setData('discount_price', v)} placeholder="Rp 10.999.000" />
                        <Field label="Badge" value={form.data.badge} onChange={(v) => form.setData('badge', v)} placeholder="Best Seller" />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label>Gambar Produk</Label>
                            <Button type="button" variant="outline" size="sm" onClick={addImage}>
                                <LuPlus className="size-4" />
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
                                        onChange={(v) => updateImage(index, v)}
                                        placeholder="/storage/media/produk.jpg"
                                    />
                                    {form.errors[`images.${index}`] && (
                                        <p className="mt-2 text-xs text-red-600">{form.errors[`images.${index}`]}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                        {form.errors.images && <p className="text-xs text-red-600">{form.errors.images}</p>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="URL CTA" value={form.data.cta_url} onChange={(v) => form.setData('cta_url', v)} placeholder="/kontak" />
                        <Field label="Urutan" type="number" value={form.data.order} onChange={(v) => form.setData('order', Number(v) || 0)} />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.data.is_active} onChange={(e) => form.setData('is_active', e.target.checked)} />
                        Aktif
                    </label>

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

function stripHtml(content = '') {
    return String(content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeImages(data) {
    if (!data) return [''];
    if (Array.isArray(data.images) && data.images.length) {
        return data.images.filter(Boolean);
    }
    if (data.image) return [data.image];
    return [''];
}
