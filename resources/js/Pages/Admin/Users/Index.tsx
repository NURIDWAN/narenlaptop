import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { LuPencil, LuPlus, LuSearch, LuTrash2 } from 'react-icons/lu';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface PaginatedData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface UserIndexProps {
    users: PaginatedData<UserItem>;
    filters: { search?: string };
}

function formatDate(dateString: string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateString));
}

export default function Index({ users, filters = {} }: UserIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        router.get(route('admin.users.index'), { search: search || undefined }, { preserveState: true, replace: true });
    }

    function handleDelete(user: UserItem) {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;
        router.delete(route('admin.users.destroy', user.id), { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Pengguna', href: route('admin.users.index') }]}>
            <Head title="Pengguna" />

            <div className="space-y-4 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <LuSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                            <Input
                                className="w-56 pl-9"
                                placeholder="Cari nama atau email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button type="submit" variant="outline" size="sm">
                            Cari
                        </Button>
                    </form>

                    <Button asChild size="sm">
                        <Link href={route('admin.users.create')}>
                            <LuPlus className="size-4" />
                            Tambah Pengguna
                        </Link>
                    </Button>
                </div>

                {/* Table */}
                <Card className="overflow-hidden p-0">
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="border-b bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium">Nama</th>
                                        <th className="px-4 py-3 text-left font-medium">Email</th>
                                        <th className="px-4 py-3 text-left font-medium">Bergabung</th>
                                        <th className="px-4 py-3 text-right font-medium">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="text-muted-foreground px-4 py-8 text-center">
                                                Tidak ada pengguna ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-muted/30 transition">
                                            <td className="px-4 py-3 font-medium">{user.name}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    <Button asChild variant="ghost" size="icon" className="size-8">
                                                        <Link href={route('admin.users.edit', user.id)} title="Edit">
                                                            <LuPencil className="size-4" />
                                                        </Link>
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8 text-destructive"
                                                        onClick={() => handleDelete(user)}
                                                        title="Hapus"
                                                    >
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

                {/* Pagination */}
                {users.last_page > 1 && <Pagination links={users.links} />}
            </div>
        </AppLayout>
    );
}

function Pagination({ links }: { links: PaginationLink[] }) {
    return (
        <div className="flex flex-wrap justify-center gap-1">
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
