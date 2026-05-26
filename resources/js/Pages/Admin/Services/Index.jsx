import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowUpDown, PenLine, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ServicesIndex({ services, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editing, setEditing] = useState(null);
    const items = services.data || [];

    function applyFilters(patch) {
        router.get('/admin/services', { ...filters, ...patch }, { preserveState: true, replace: true });
    }

    function handleSearch(event) {
        event.preventDefault();
        applyFilters({ search, page: undefined });
    }

    function toggleSort(col) {
        const dir = filters.sort === col && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: col, direction: dir, page: undefined });
    }

    function handleDelete(id) {
        if (!confirm('Hapus layanan ini?')) return;
        router.delete(`/admin/services/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Layanan">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="w-56 pl-9" placeholder="Cari layanan..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.active ?? ''} onChange={(e) => applyFilters({ active: e.target.value !== '' ? e.target.value : undefined, page: undefined })}>
                        <option value="">Semua</option>
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                    </select>
                </form>
                <Button size="sm" onClick={() => setEditing('new')}><Plus className="size-4" /> Tambah</Button>
            </div>

            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <SortHeader label="Layanan" col="title" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 font-medium">Icon</th>
                                    <SortHeader label="Urutan" col="order" current={filters} onSort={toggleSort} />
                                    <SortHeader label="Status" col="is_active" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Belum ada layanan.</td>
                                    </tr>
                                )}
                                {items.map((service) => (
                                    <tr key={service.id} className="transition hover:bg-muted/30">
                                        <td className="px-4 py-3">
                                            <span className="font-medium text-foreground">{service.title}</span>
                                            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-5">{service.description || '-'}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{service.icon || '-'}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{service.order}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={service.is_active ? 'default' : 'secondary'}>{service.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => setEditing(service.id)}>
                                                    <PenLine className="size-4" />
                                                </Button>
                                                <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(service.id)}>
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

            {services.last_page > 1 && <Pagination links={services.links} />}

            <ServiceFormModal
                open={!!editing}
                onOpenChange={(open) => !open && setEditing(null)}
                data={editing === 'new' ? null : items.find((item) => item.id === editing)}
            />
        </AdminLayout>
    );
}

function ServiceFormModal({ open, onOpenChange, data }) {
    const isEdit = !!data;
    const form = useForm({
        title: data?.title || '',
        description: data?.description || '',
        icon: data?.icon || '',
        order: data?.order || 0,
        is_active: data?.is_active ?? true,
    });

    useEffect(() => {
        if (!open) return;
        form.setData({
            title: data?.title || '',
            description: data?.description || '',
            icon: data?.icon || '',
            order: data?.order || 0,
            is_active: data?.is_active ?? true,
        });
    }, [open, data?.id]);

    function close() {
        onOpenChange(false);
        form.reset();
        form.clearErrors();
    }

    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: close };
        if (isEdit) {
            form.put(`/admin/services/${data.id}`, options);
            return;
        }
        form.post('/admin/services', options);
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
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
                    <DialogDescription>Data aktif bisa dipakai oleh section Layanan mode database.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <Field label="Nama Layanan" value={form.data.title} onChange={(value) => form.setData('title', value)} required />
                    <Textarea label="Deskripsi" value={form.data.description} onChange={(value) => form.setData('description', value)} />

                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Icon" value={form.data.icon} onChange={(value) => form.setData('icon', value)} placeholder="wrench" />
                        <Field label="Urutan" type="number" value={form.data.order} onChange={(value) => form.setData('order', Number(value) || 0)} />
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={form.data.is_active} onChange={(event) => form.setData('is_active', event.target.checked)} />
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

function SortHeader({ label, col, current, onSort }) {
    const active = current.sort === col;
    return (
        <th className="px-4 py-3 font-medium">
            <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => onSort(col)}>
                {label}
                <ArrowUpDown className={`size-3 ${active ? 'text-foreground' : 'text-muted-foreground/50'}`} />
            </button>
        </th>
    );
}

function Pagination({ links }) {
    return (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
            {links.map((link, i) => (
                <Button
                    key={i}
                    variant={link.active ? 'default' : 'outline'}
                    size="sm"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </div>
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

function Textarea({ label, value, onChange }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea
                className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}
