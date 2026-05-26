import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Eye, Search, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function Index({ messages, filters = {} }) {
    const [search, setSearch] = useState(filters.search || '');

    function applyFilters(patch) {
        router.get('/admin/messages', { ...filters, ...patch }, { preserveState: true, replace: true });
    }

    function handleSearch(e) {
        e.preventDefault();
        applyFilters({ search, page: undefined });
    }

    function handleDelete(id) {
        if (!confirm('Hapus pesan ini?')) return;
        router.delete(`/admin/messages/${id}`, { preserveScroll: true });
    }

    return (
        <AdminLayout title="Pesan Masuk">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9 w-56" placeholder="Cari nama/email..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={filters.status || ''} onChange={e => applyFilters({ status: e.target.value || undefined, page: undefined })}>
                        <option value="">Semua</option>
                        <option value="unread">Belum Dibaca</option>
                        <option value="read">Sudah Dibaca</option>
                    </select>
                </form>
                <span className="text-muted-foreground text-sm">{messages.total} pesan</span>
            </div>

            <Card className="mt-4 overflow-hidden p-0">
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Nama</th>
                                    <th className="px-4 py-3 font-medium">Kontak</th>
                                    <th className="px-4 py-3 font-medium">Pesan</th>
                                    <th className="px-4 py-3 font-medium">Tanggal</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {messages.data.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Tidak ada pesan.</td></tr>}
                                {messages.data.map(msg => (
                                    <tr key={msg.id} className={`transition ${!msg.read_at ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'}`}>
                                        <td className="px-4 py-3 font-medium">{msg.name}</td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            <span className="block">{msg.email || '-'}</span>
                                            {msg.phone && <span className="block text-xs">{msg.phone}</span>}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">{msg.message}</td>
                                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{new Date(msg.created_at).toLocaleDateString('id-ID')}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant={msg.read_at ? 'secondary' : 'default'}>{msg.read_at ? 'Dibaca' : 'Baru'}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Button asChild variant="ghost" size="icon" className="size-8"><Link href={`/admin/messages/${msg.id}`}><Eye className="size-4" /></Link></Button>
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => handleDelete(msg.id)}><Trash2 className="size-4" /></Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {messages.last_page > 1 && <Pagination links={messages.links} />}
        </AdminLayout>
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
