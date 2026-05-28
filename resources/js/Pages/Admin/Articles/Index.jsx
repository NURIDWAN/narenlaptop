import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LuArrowUpDown, LuFilePlus2, LuPencil, LuSearch, LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';

export default function ArticlesIndex({ articles, filters = {}, categories = [] }) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(patch) {
        router.get('/admin/articles', { ...filters, ...patch }, { preserveState: true, replace: true });
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
        if (!confirm('Hapus artikel ini?')) return;
        router.delete(`/admin/articles/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Artikel">
            {/* Toolbar */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
                    <div className="relative">
                        <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9 w-56" placeholder="Cari judul..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.status || ''} onChange={e => applyFilters({ status: e.target.value || undefined, page: undefined })}>
                        <option value="">Semua Status</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                    </select>
                    {categories.length > 0 && (
                        <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.category_id || ''} onChange={e => applyFilters({ category_id: e.target.value || undefined, page: undefined })}>
                            <option value="">Semua Kategori</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}
                </form>
                <div className="flex gap-2">
                    <Button asChild variant="outline">
                        <Link href="/admin/article-categories">Kelola Kategori</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/admin/articles/create"><LuFilePlus2 className="size-4" /> Buat Artikel</Link>
                    </Button>
                </div>
            </div>

            {/* Table */}
            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <SortHeader label="Judul" col="title" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 font-medium">Kategori</th>
                                    <SortHeader label="Status" col="status" current={filters} onSort={toggleSort} />
                                    <SortHeader label="Views" col="view_count" current={filters} onSort={toggleSort} />
                                    <SortHeader label="Diperbarui" col="updated_at" current={filters} onSort={toggleSort} />
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {articles.data.length === 0 && (
                                    <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada data.</td></tr>
                                )}
                                {articles.data.map(article => (
                                    <tr key={article.id} className="hover:bg-muted/30 transition">
                                        <td className="px-4 py-3">
                                            <span className="font-medium">{article.title}</span>
                                            <span className="mt-0.5 block text-xs text-muted-foreground">/blog/{article.slug}</span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{article.category?.name || '-'}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={article.status === 'published' ? 'default' : article.status === 'scheduled' ? 'outline' : 'secondary'}>{article.status}</Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{article.view_count || 0}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{new Date(article.updated_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/admin/articles/${article.id}/edit`}><LuPencil className="size-4" /></Link></Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(article.id)}><LuTrash2 className="size-4" /></Button>
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
            {articles.last_page > 1 && <Pagination links={articles.links} />}
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
