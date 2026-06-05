import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LuArrowUpDown, LuFilePlus2, LuPencil, LuSearch, LuSparkles, LuTrash2 } from 'react-icons/lu';
import { useState } from 'react';
import axios from 'axios';

export default function ArticlesIndex({ articles, filters = {}, categories = [], aiArticleSettings = {} }) {
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
                    <GenerateArticleModal categories={categories} aiArticleSettings={aiArticleSettings} />
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

function GenerateArticleModal({ categories = [], aiArticleSettings = {} }) {
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState('');
    const [mainKeyword, setMainKeyword] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [brief, setBrief] = useState('');
    const [wordCount, setWordCount] = useState(aiArticleSettings.ai_article_word_count || '1000');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleGenerate(e) {
        e.preventDefault();
        if (!topic.trim()) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('/admin/articles/generate', {
                topic: topic.trim(),
                main_keyword: mainKeyword.trim() || null,
                category_id: categoryId || null,
                brief: brief.trim() || null,
                word_count: wordCount ? Number(wordCount) : null,
            });
            setOpen(false);
            setTopic('');
            setMainKeyword('');
            setCategoryId('');
            setBrief('');
            setWordCount(aiArticleSettings.ai_article_word_count || '1000');
            router.visit(`/admin/articles/${data.id}/edit`);
        } catch (err) {
            setError(err.response?.data?.error || 'Gagal generate. Coba lagi.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline"><LuSparkles className="size-4" /> Generate AI</Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleGenerate}>
                    <DialogHeader>
                        <DialogTitle>Generate Artikel dengan AI</DialogTitle>
                        <DialogDescription>Masukkan topik atau keyword, AI akan membuat artikel lengkap secara otomatis.</DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-3">
                        <Input
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Topik: Cara merawat baterai laptop agar awet"
                            disabled={loading}
                            autoFocus
                        />
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                                value={mainKeyword}
                                onChange={(e) => setMainKeyword(e.target.value)}
                                placeholder="Keyword utama"
                                disabled={loading}
                            />
                            <Input
                                type="number"
                                min="500"
                                max="2500"
                                value={wordCount}
                                onChange={(e) => setWordCount(e.target.value)}
                                placeholder="Target kata"
                                disabled={loading}
                            />
                        </div>
                        {categories.length > 0 && (
                            <select
                                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={categoryId}
                                onChange={(e) => setCategoryId(e.target.value)}
                                disabled={loading}
                            >
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        )}
                        <textarea
                            rows={4}
                            className="border-input bg-background w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            value={brief}
                            onChange={(e) => setBrief(e.target.value)}
                            placeholder="Brief tambahan: poin yang wajib dibahas, sudut pandang artikel, atau hal yang perlu dihindari"
                            disabled={loading}
                        />
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>Batal</Button>
                        <Button type="submit" disabled={loading || !topic.trim()}>
                            {loading ? 'Generating...' : 'Generate Artikel'}
                        </Button>
                    </DialogFooter>
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
