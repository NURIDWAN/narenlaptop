import { Head, Link } from '@inertiajs/react';
import {
    LuArrowUpRight,
    LuBarChart3,
    LuFileText,
    LuGlobe2,
    LuImage,
    LuInbox,
    LuLayoutTemplate,
    LuNewspaper,
    LuPenLine,
    LuPlus,
    LuSettings,
    LuShoppingBag,
    LuUsers,
    LuWrench,
} from 'react-icons/lu';
import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

type Stats = {
    pages: number;
    publishedPages: number;
    articles: number;
    publishedArticles: number;
    products: number;
    services: number;
    messages: number;
    users: number;
};

type RecentItem = {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at?: string;
};

type RecentMessage = {
    id: number;
    name: string;
    message: string;
    created_at: string;
    read_at: string | null;
};

/**
 * Format number with Indonesian thousands separator (titik).
 * e.g., 1000 → "1.000", 1000000 → "1.000.000"
 */
function formatNumber(value: number): string {
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export default function Dashboard({
    stats,
    messageTrend = [],
    recentPages = [],
    recentArticles = [],
    recentMessages = [],
    unreadMessages = 0,
}: {
    stats: Stats;
    messageTrend: Array<{ date: string; count: number }>;
    recentPages: RecentItem[];
    recentArticles: RecentItem[];
    recentMessages: RecentMessage[];
    unreadMessages: number;
}) {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Selamat Pagi' : hour < 17 ? 'Selamat Siang' : 'Selamat Malam';

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />

            <div className="space-y-8 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{greeting} 👋</h1>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Berikut ringkasan konten website Anda hari ini.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild size="sm">
                            <Link href="/admin/pages/create">
                                <LuPlus className="size-4" />
                                Halaman Baru
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                            <Link href="/admin/articles/create">
                                <LuPenLine className="size-4" />
                                Tulis Artikel
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard icon={LuLayoutTemplate} label="Total Halaman" value={stats.pages} accent="bg-primary/10 text-primary" />
                    <StatCard icon={LuGlobe2} label="Halaman Tayang" value={stats.publishedPages} accent="bg-emerald-500/10 text-emerald-600" />
                    <StatCard icon={LuNewspaper} label="Total Artikel" value={stats.articles} accent="bg-violet-500/10 text-violet-600" />
                    <StatCard icon={LuFileText} label="Artikel Tayang" value={stats.publishedArticles} accent="bg-amber-500/10 text-amber-600" />
                    <StatCard icon={LuInbox} label="Pesan Masuk" value={stats.messages} accent="bg-rose-500/10 text-rose-600" />
                    <StatCard icon={LuShoppingBag} label="Produk" value={stats.products} accent="bg-sky-500/10 text-sky-600" />
                    <StatCard icon={LuWrench} label="Layanan" value={stats.services} accent="bg-teal-500/10 text-teal-600" />
                    <StatCard icon={LuUsers} label="Pengguna" value={stats.users} accent="bg-indigo-500/10 text-indigo-600" />
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Recent Pages */}
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Halaman Terbaru</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/pages">Lihat Semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-1 px-3">
                            {recentPages.length === 0 && <Empty />}
                            {recentPages.map((item) => (
                                <RecentRow key={item.id} item={item} editPath={`/admin/pages/${item.id}/edit`} publicPath={item.slug === 'beranda' ? '/' : `/${item.slug}`} />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Articles */}
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle className="text-base">Artikel Terbaru</CardTitle>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/admin/articles">Lihat Semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-1 px-3">
                            {recentArticles.length === 0 && <Empty />}
                            {recentArticles.map((item) => (
                                <RecentRow key={item.id} item={item} editPath={`/admin/articles/${item.id}/edit`} publicPath={`/blog/${item.slug}`} />
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Message Trend Chart */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <CardTitle className="text-base">Tren Pesan 7 Hari Terakhir</CardTitle>
                        <LuBarChart3 className="text-muted-foreground size-4" />
                    </CardHeader>
                    <CardContent>
                        <MessageTrendChart data={messageTrend} />
                    </CardContent>
                </Card>

                {/* Contact Widget */}
                <Card>
                    <CardHeader className="flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CardTitle className="text-base">Pesan Kontak</CardTitle>
                            {unreadMessages > 0 && (
                                <Badge variant="destructive" className="text-[10px]">
                                    {unreadMessages} belum dibaca
                                </Badge>
                            )}
                        </div>
                        <Button asChild variant="ghost" size="sm">
                            <Link href={route('admin.messages.index')}>Lihat Pesan</Link>
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-1 px-3">
                        {recentMessages.length === 0 && <Empty />}
                        {recentMessages.map((msg) => (
                            <Link
                                key={msg.id}
                                href={route('admin.messages.show', msg.id)}
                                className="hover:bg-accent/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium">
                                        {msg.name}
                                        {!msg.read_at && (
                                            <span className="bg-primary ml-2 inline-block size-2 rounded-full" />
                                        )}
                                    </p>
                                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                                        {msg.message}
                                    </p>
                                </div>
                                <span className="text-muted-foreground shrink-0 text-xs">
                                    {new Intl.DateTimeFormat('id-ID', {
                                        day: '2-digit',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    }).format(new Date(msg.created_at))}
                                </span>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Pintasan Cepat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                            <QuickLink href="/admin/pages" label="Kelola Halaman" icon={LuLayoutTemplate} />
                            <QuickLink href="/admin/articles" label="Kelola Artikel" icon={LuNewspaper} />
                            <QuickLink href="/admin/products" label="Kelola Produk" icon={LuShoppingBag} />
                            <QuickLink href="/admin/services" label="Kelola Layanan" icon={LuWrench} />
                            <QuickLink href="/admin/media" label="Media" icon={LuImage} />
                            <QuickLink href="/admin/users" label="Pengguna" icon={LuUsers} />
                            <QuickLink href="/admin/settings" label="Pengaturan" icon={LuSettings} />
                            <QuickLink href="/" label="Lihat Website" icon={LuGlobe2} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

/**
 * Returns abbreviated Indonesian day name from a date string.
 */
function getDayLabel(dateStr: string): string {
    const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const d = new Date(dateStr);
    return days[d.getDay()];
}

function MessageTrendChart({ data }: { data: Array<{ date: string; count: number }> }) {
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    if (data.length === 0) {
        return <p className="text-muted-foreground py-4 text-center text-sm">Belum ada data tren.</p>;
    }

    return (
        <div className="flex items-end gap-2 sm:gap-3" style={{ height: '160px' }}>
            {data.map((item) => {
                const heightPercent = (item.count / maxCount) * 100;
                return (
                    <div key={item.date} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                            {item.count}
                        </span>
                        <div className="relative w-full flex-1">
                            <div
                                className="bg-primary/80 hover:bg-primary absolute bottom-0 w-full rounded-t transition-colors"
                                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                title={`${item.date}: ${item.count} pesan`}
                            />
                        </div>
                        <span className="text-muted-foreground text-[10px] font-medium sm:text-xs">
                            {getDayLabel(item.date)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function StatCard({ icon: Icon, label, value, accent }: { icon: typeof LuLayoutTemplate; label: string; value: number; accent: string }) {
    return (
        <Card className="gap-4 py-5">
            <CardContent className="flex items-center gap-4 px-5 py-0">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${accent}`}>
                    <Icon className="size-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold leading-none">{formatNumber(value)}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function RecentRow({ item, editPath, publicPath }: { item: RecentItem; editPath: string; publicPath: string }) {
    const updatedLabel = item.updated_at ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(item.updated_at)) : '';

    return (
        <div className="hover:bg-accent/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-xs">
                    <span>/{item.slug}</span>
                    {updatedLabel && <span className="text-muted-foreground/70">• {updatedLabel}</span>}
                </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                    {item.status === 'published' ? 'Tayang' : 'Draf'}
                </Badge>
                <Button asChild variant="ghost" size="icon" className="size-7">
                    <Link href={editPath} title="Edit">
                        <LuPenLine className="size-3.5" />
                    </Link>
                </Button>
                {item.status === 'published' && (
                    <Button asChild variant="ghost" size="icon" className="size-7">
                        <Link href={publicPath} title="Lihat di website">
                            <LuArrowUpRight className="size-3.5" />
                        </Link>
                    </Button>
                )}
            </div>
        </div>
    );
}

function QuickLink({ href, label, icon: Icon }: { href: string; label: string; icon: typeof LuLayoutTemplate }) {
    return (
        <Button asChild variant="outline" className="w-full justify-start" size="sm">
            <Link href={href}>
                <Icon className="size-4" />
                {label}
            </Link>
        </Button>
    );
}

function Empty() {
    return <p className="text-muted-foreground px-3 py-4 text-center text-sm">Belum ada data.</p>;
}
