import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageField from '@/components/admin/ImageField';
import { LuArrowUpDown, LuPenLine, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';

export default function Index({ members, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');
    const [editing, setEditing] = useState(null);

    function applyFilters(patch) {
        router.get('/admin/team', { ...filters, ...patch }, { preserveState: true, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search, page: undefined });
    }

    function toggleSort(col) {
        const dir = filters.sort === col && filters.direction === 'asc' ? 'desc' : 'asc';
        applyFilters({ sort: col, direction: dir, page: undefined });
    }

    function handleDelete(id) {
        if (!confirm('Hapus anggota tim ini?')) return;
        router.delete(`/admin/team/${id}`, { preserveScroll: true });
    }

    const data = members.data || members;
    const paginated = !!members.links;

    return (
        <AdminLayout title="Tim">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9 w-56" placeholder="Cari nama/jabatan..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.active ?? ''} onChange={e => applyFilters({ active: e.target.value !== '' ? e.target.value : undefined, page: undefined })}>
                        <option value="">Semua</option>
                        <option value="1">Aktif</option>
                        <option value="0">Nonaktif</option>
                    </select>
                </form>
                <Button size="sm" onClick={() => setEditing('new')}><LuPlus className="size-4" /> Tambah</Button>
            </div>

            {editing && <MemberForm data={editing === 'new' ? null : data.find(m => m.id === editing)} onClose={() => setEditing(null)} />}

            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Foto</th>
                                    <SortHeader label="Nama" col="name" current={filters} onSort={toggleSort} />
                                    <SortHeader label="Jabatan" col="role" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <SortHeader label="Urutan" col="order" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data.</td></tr>}
                                {data.map(m => (
                                    <tr key={m.id} className="hover:bg-muted/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex size-9 items-center justify-center overflow-hidden rounded-lg bg-muted">
                                                {m.photo ? <img src={m.photo} alt={m.name} className="size-full object-cover" /> : <span className="text-xs font-bold text-muted-foreground">{m.name[0]}</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium">{m.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.role || '-'}</td>
                                        <td className="px-4 py-3"><Badge variant={m.is_active ? 'default' : 'secondary'}>{m.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                                        <td className="px-4 py-3 text-muted-foreground">{m.order}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(m.id)}><LuPenLine className="size-4" /></Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(m.id)}><LuTrash2 className="size-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {paginated && members.last_page > 1 && <Pagination links={members.links} />}
        </AdminLayout>
    );
}

function MemberForm({ data, onClose }) {
    const isEdit = !!data;
    const form = useForm({
        name: data?.name || '', role: data?.role || '', photo: data?.photo || '',
        bio: data?.bio || '', is_active: data?.is_active ?? true, order: data?.order || 0,
    });

    function submit(e) {
        e.preventDefault();
        if (isEdit) form.put(`/admin/team/${data.id}`, { preserveScroll: true, onSuccess: onClose });
        else form.post('/admin/team', { preserveScroll: true, onSuccess: onClose });
    }

    return (
        <Card className="mt-4 py-5">
            <CardContent className="px-5 py-0">
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2"><Label>Nama</Label><Input value={form.data.name} onChange={e => form.setData('name', e.target.value)} required /></div>
                        <div className="space-y-2"><Label>Jabatan</Label><Input value={form.data.role} onChange={e => form.setData('role', e.target.value)} /></div>
                    </div>
                    <ImageField label="Foto" value={form.data.photo} onChange={(value) => form.setData('photo', value)} placeholder="/storage/media/team.jpg" />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2 sm:col-span-2"><Label>Bio</Label><Input value={form.data.bio} onChange={e => form.setData('bio', e.target.value)} /></div>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-2"><Label>Urutan</Label><Input type="number" value={form.data.order} onChange={e => form.setData('order', parseInt(e.target.value))} /></div>
                            <div className="flex items-end"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.is_active} onChange={e => form.setData('is_active', e.target.checked)} />Aktif</label></div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={form.processing}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
                        <Button type="button" variant="ghost" size="sm" onClick={onClose}>Batal</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

function SortHeader({ label, col, current, onSort }) {
    const active = current.sort === col;
    return (
        <th className="px-4 py-3 font-medium">
            <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => onSort(col)}>
                {label}<LuArrowUpDown className={`size-3 ${active ? 'text-foreground' : 'text-muted-foreground/50'}`} />
            </button>
        </th>
    );
}

function Pagination({ links }) {
    return (
        <div className="mt-4 flex flex-wrap justify-center gap-1">
            {links.map((link, i) => (
                <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" disabled={!link.url} onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}>
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </Button>
            ))}
        </div>
    );
}
