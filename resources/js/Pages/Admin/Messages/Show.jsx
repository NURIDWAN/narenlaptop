import { Link, router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Trash2 } from 'lucide-react';

export default function Show({ message }) {
    function handleDelete() {
        if (!confirm('Hapus pesan ini?')) return;
        router.delete(`/admin/messages/${message.id}`);
    }

    return (
        <AdminLayout title="Detail Pesan">
            <div className="mx-auto max-w-2xl space-y-4">
                <div className="flex items-center justify-between">
                    <Button asChild variant="ghost" size="sm">
                        <Link href="/admin/messages"><ArrowLeft className="size-4" /> Kembali</Link>
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleDelete}>
                        <Trash2 className="size-4" /> Hapus
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">{message.name}</CardTitle>
                        <p className="text-muted-foreground text-sm">
                            {message.email}{message.phone ? ` • ${message.phone}` : ''}
                        </p>
                        <p className="text-muted-foreground text-xs">{new Date(message.created_at).toLocaleString('id-ID')}</p>
                    </CardHeader>
                    <CardContent>
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.message}</p>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
