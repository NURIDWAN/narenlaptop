import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';

export default function ProductCategoriesIndex({ categories, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, reset } = useForm({
        name: '',
        slug: '',
        description: '',
        meta_title: '',
        meta_description: '',
    });

    function applyFilters(patch) {
        router.get('/admin/product-categories', { ...filters, ...patch }, { preserveState: true, replace: true });
    }

    function handleSearch(event) {
        event.preventDefault();
        applyFilters({ search, page: undefined });
    }

    function edit(category) {
        setEditingId(category.id);
        setData({
            name: category.name || '',
            slug: category.slug || '',
            description: category.description || '',
            meta_title: category.meta_title || '',
            meta_description: category.meta_description || '',
        });
    }

    function clear() {
        setEditingId(null);
        reset();
    }

    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: clear };

        if (editingId) {
            put(`/admin/product-categories/${editingId}`, options);
            return;
        }

        post('/admin/product-categories', options);
    }

    function remove(category) {
        if (!confirm(`Hapus kategori "${category.name}"? Produk terkait akan jadi tanpa kategori.`)) return;
        router.delete(`/admin/product-categories/${category.id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Kategori Produk">
            <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold">{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
                        <p className="text-sm text-slate-500">Kategori dipakai untuk mengelompokkan produk dan filter section produk.</p>
                    </div>

                    <Field label="Nama" value={data.name} onChange={(value) => setData('name', value)} required />
                    <Field label="Slug (opsional)" value={data.slug} onChange={(value) => setData('slug', value)} placeholder="otomatis-dari-nama" />
                    <Textarea label="Deskripsi" value={data.description} onChange={(value) => setData('description', value)} rows={3} />
                    <Field label="Meta title" value={data.meta_title} onChange={(value) => setData('meta_title', value)} />
                    <Textarea label="Meta description" value={data.meta_description} onChange={(value) => setData('meta_description', value)} rows={3} />

                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <LuPlus className="size-4" />
                            {editingId ? 'Simpan' : 'Tambah'}
                        </Button>
                        {editingId && <Button type="button" variant="outline" onClick={clear}>Batal</Button>}
                    </div>
                </form>

                <div className="space-y-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative w-full">
                            <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                            <Input className="pl-9" placeholder="Cari nama atau slug..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </div>
                        <Button type="submit" variant="outline">Cari</Button>
                    </form>

                    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                                <tr>
                                    <th className="px-4 py-3">Kategori</th>
                                    <th className="px-4 py-3">Slug</th>
                                    <th className="px-4 py-3 text-center">Produk</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {categories.data.map((category) => (
                                    <tr key={category.id}>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-950">{category.name}</p>
                                            <p className="mt-1 text-xs text-slate-500">{category.description || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">{category.slug}</td>
                                        <td className="px-4 py-3 text-center text-slate-600">{category.products_count}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button type="button" variant="outline" size="icon" onClick={() => edit(category)}>
                                                    <LuPencil className="size-4" />
                                                </Button>
                                                <Button type="button" variant="outline" size="icon" onClick={() => remove(category)}>
                                                    <LuTrash2 className="size-4 text-red-600" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {categories.data.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">Belum ada kategori produk.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {categories.last_page > 1 && (
                        <div className="flex flex-wrap justify-center gap-1">
                            {categories.links.map((link, index) => (
                                <Button
                                    key={index}
                                    variant={link.active ? 'default' : 'outline'}
                                    size="sm"
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                >
                                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
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

function Textarea({ label, value, onChange, rows = 4 }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea
                rows={rows}
                className="border-input bg-background min-h-20 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}
