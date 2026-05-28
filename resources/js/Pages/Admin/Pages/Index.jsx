import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LuArrowUpDown, LuEye, LuFilePlus2, LuPencil, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';

export default function PagesIndex({ pages, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(patch) {
        router.get('/admin/pages', { ...filters, ...patch }, { preserveState: true, replace: true });
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
        if (!confirm('Hapus halaman ini?')) return;
        router.delete(`/admin/pages/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Halaman">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9 w-64" placeholder="Cari judul..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.status || ''} onChange={e => applyFilters({ status: e.target.value || undefined, page: undefined })}>
                        <option value="">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                </form>
                <Button asChild>
                    <Link href="/admin/pages/create"><LuFilePlus2 className="size-4" /> Buat Halaman</Link>
                </Button>
            </div>

            {/* Table */}
            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <SortHeader label="Judul" col="title" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 font-medium">Slug</th>
                                    <SortHeader label="Status" col="status" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 font-medium">Sections</th>
                                    <SortHeader label="Diperbarui" col="updated_at" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pages.data.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data.</td></tr>
                                )}
                                {pages.data.map(page => (
                                    <tr key={page.id} className="hover:bg-muted/30 transition">
                                        <td className="px-4 py-3 font-medium">{page.title}</td>
                                        <td className="px-4 py-3 text-muted-foreground">/{page.slug}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>{page.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{page.sections_count}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(page.updated_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/admin/pages/${page.id}`}><LuEye className="size-4" /></Link></Button>
                                                <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/admin/pages/${page.id}/edit`}><LuPencil className="size-4" /></Link></Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(page.id)}><LuTrash2 className="size-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pages.last_page > 1 && <Pagination links={pages.links} />}
        </AdminLayout>
    );
}

function SortHeader({ label, col, current, onSort }) {
    const active = current.sort === col;
    return (
        <th className="px-4 py-3 font-medium">
            <button type="button" className="inline-flex items-center gap-1 hover:text-foreground" onClick={() => onSort(col)}>
                {label}
                <LuArrowUpDown className={`size-3 ${active ? 'text-foreground' : 'text-muted-foreground/50'}`} />
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
