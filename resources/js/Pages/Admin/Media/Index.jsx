import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Search, Trash2, Upload } from 'lucide-react';
import { useCallback, useState } from 'react';

export default function Index({ media, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const uploadForm = useForm({ files: [] });

    function handleSearch(e) {
        e.preventDefault();
        router.get('/admin/media', { search }, { preserveState: true });
    }

    function handleUpload(e) {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        const formData = new FormData();
        files.forEach((f) => formData.append('files[]', f));
        router.post('/admin/media', formData, { forceFormData: true, preserveScroll: true });
        e.target.value = '';
    }

    function handleDelete(id) {
        if (!confirm('Hapus file ini?')) return;
        router.delete(`/admin/media/${id}`, { preserveScroll: true });
    }

    const copyUrl = useCallback((url) => {
        navigator.clipboard.writeText(url);
    }, []);

    return (
        <AdminLayout title="Media Library">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9" placeholder="Cari file..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button type="submit" variant="outline" size="sm">Cari</Button>
                </form>
                <label className="cursor-pointer">
                    <Button asChild variant="default" size="sm">
                        <span><Upload className="size-4" /> Upload</span>
                    </Button>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
            </div>

            {media.data.length === 0 && (
                <div className="mt-10 text-center text-sm text-muted-foreground">
                    Belum ada media. Upload file untuk memulai.
                </div>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {media.data.map((item) => (
                    <Card key={item.id} className="group relative overflow-hidden p-0">
                        <CardContent className="p-0">
                            <img src={item.url} alt={item.alt || item.filename} className="aspect-square w-full object-cover" loading="lazy" />
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 to-transparent opacity-0 transition group-hover:opacity-100">
                                <div className="flex w-full items-center justify-between p-2">
                                    <span className="truncate text-xs text-white">{item.filename}</span>
                                    <div className="flex gap-1">
                                        <Button size="icon" variant="ghost" className="size-7 text-white hover:bg-white/20" onClick={() => copyUrl(item.url)}>
                                            <Copy className="size-3.5" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="size-7 text-white hover:bg-red-500/80" onClick={() => handleDelete(item.id)}>
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {media.last_page > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                    {media.links.filter(l => l.url).map((link, i) => (
                        <Button key={i} variant={link.active ? 'default' : 'outline'} size="sm" onClick={() => router.get(link.url, {}, { preserveState: true })}>
                            <span dangerouslySetInnerHTML={{ __html: link.label }} />
                        </Button>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
}
