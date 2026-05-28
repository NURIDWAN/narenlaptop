import { Head, Link } from '@inertiajs/react';
import {
    LuArrowUpRight,
    LuFileText,
    LuGlobe2,
    LuInbox,
    LuLayoutTemplate,
    LuNewspaper,
    LuPenLine,
    LuPlus,
    LuTrendingUp,
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
    messages: number;
};

type RecentItem = {
    id: number;
    title: string;
    slug: string;
    status: string;
    updated_at?: string;
};

export default function Dashboard({
    stats,
    recentPages = [],
    recentArticles = [],
}: {
    stats: Stats;
    recentPages: RecentItem[];
    recentArticles: RecentItem[];
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <StatCard icon={LuLayoutTemplate} label="Halaman" value={stats.pages} accent="bg-primary/10 text-primary" />
                    <StatCard icon={LuGlobe2} label="Published" value={stats.publishedPages} accent="bg-emerald-500/10 text-emerald-600" />
                    <StatCard icon={LuNewspaper} label="Artikel" value={stats.articles} accent="bg-violet-500/10 text-violet-600" />
                    <StatCard icon={LuFileText} label="Artikel Live" value={stats.publishedArticles} accent="bg-amber-500/10 text-amber-600" />
                    <StatCard icon={LuInbox} label="Pesan" value={stats.messages} accent="bg-rose-500/10 text-rose-600" />
                </div>

                {/* Main Content */}
                <div className="grid gap-6 lg:grid-cols-5">
                    {/* Recent Pages */}
                    <Card className="lg:col-span-2">
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
                    <Card className="lg:col-span-2">
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

                    {/* Quick Actions */}
                    <Card className="lg:col-span-1">
                        <CardHeader>
                            <CardTitle className="text-base">Pintasan</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <QuickLink href="/admin/pages" label="Kelola Halaman" icon={LuLayoutTemplate} />
                            <QuickLink href="/admin/articles" label="Kelola Artikel" icon={LuNewspaper} />
                            <QuickLink href="/" label="Lihat Website" icon={LuGlobe2} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
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
                    <p className="text-2xl font-bold leading-none">{value}</p>
                    <p className="text-muted-foreground mt-1 text-xs">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function RecentRow({ item, editPath, publicPath }: { item: RecentItem; editPath: string; publicPath: string }) {
    return (
        <div className="hover:bg-accent/50 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 transition">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">/{item.slug}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'} className="text-[10px]">
                    {item.status === 'published' ? 'Live' : 'Draft'}
                </Badge>
                <Button asChild variant="ghost" size="icon" className="size-7">
                    <Link href={editPath}>
                        <LuPenLine className="size-3.5" />
                    </Link>
                </Button>
                {item.status === 'published' && (
                    <Button asChild variant="ghost" size="icon" className="size-7">
                        <Link href={publicPath}>
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
