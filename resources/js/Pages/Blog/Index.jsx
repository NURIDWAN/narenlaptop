import { Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock3, Link2, NotebookText } from 'lucide-react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';

export default function BlogIndex({ articles, categories = [], selectedCategory = '', seo }) {
    const items = articles.data || [];
    const featured = items[0];
    const rest = items.slice(1);
    const activeCategory = categories.find((category) => category.slug === selectedCategory);

    return (
        <FrontendLayout>
            <SEOHead seo={seo} />

            <section className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Insights & News</p>
                        <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl">
                            {activeCategory?.name || 'Artikel'}
                        </h1>
                        <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                            {seo?.description || 'Artikel terbaru seputar teknologi, service laptop, dan tips perawatan perangkat.'}
                        </p>
                    </div>

                    {categories.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-2">
                            <FilterPill active={!selectedCategory} onClick={() => router.get('/blog')} label="All" />
                            {categories.map((category) => (
                                <FilterPill
                                    key={category.id}
                                    active={selectedCategory === category.slug}
                                    onClick={() => router.get('/blog', { category: category.slug }, { preserveScroll: true, preserveState: true })}
                                    label={category.name}
                                />
                            ))}
                        </div>
                    )}

                    {featured && (
                        <Link href={`/blog/${featured.slug}`} className="mt-10 block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 transition hover:-translate-y-1 hover:shadow-2xl">
                            <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                                <div className="order-2 p-6 sm:p-8 lg:order-1">
                                    <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                        Featured Guide
                                    </div>
                                    <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                                        {featured.title}
                                    </h2>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600">
                                        {featured.excerpt}
                                    </p>
                                    <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                        <MetaItem icon={CalendarDays} label={formatDate(featured.published_at)} />
                                        <MetaItem icon={Clock3} label={`${featured.reading_time || 1} menit baca`} />
                                    </div>
                                    <div className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-600">
                                        Baca artikel <ArrowRight className="h-4 w-4" />
                                    </div>
                                </div>
                                <div className="order-1 bg-slate-100 lg:order-2">
                                    {featured.thumbnail ? (
                                        <img src={featured.thumbnail} alt={featured.title} className="h-full min-h-72 w-full object-cover" loading="eager" />
                                    ) : (
                                        <div className="flex min-h-72 items-center justify-center text-slate-300">
                                            <Link2 className="h-16 w-16" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Link>
                    )}

                    <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {rest.map((article) => (
                            <Link key={article.id} href={`/blog/${article.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                <div className="overflow-hidden bg-slate-100">
                                    {article.thumbnail ? (
                                        <img src={article.thumbnail} alt={article.title} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                                    ) : (
                                        <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                                            <Link2 className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                                        {article.category?.name || 'Artikel'}
                                    </p>
                                    <h2 className="mt-3 text-lg font-semibold text-slate-950 transition group-hover:text-blue-700">
                                        {article.title}
                                    </h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">
                                        {article.excerpt}
                                    </p>
                                    <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
                                        <span>{formatDate(article.published_at)}</span>
                                        <span>{article.reading_time || 1} menit baca</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-950">Stay in the Loop</h2>
                                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                                    Ikuti artikel terbaru seputar teknologi, service, dan tips perawatan laptop.
                                </p>
                            </div>
                            <a href="/kontak" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                                <NotebookText className="h-4 w-4" />
                                Kontak Kami
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </FrontendLayout>
    );
}

function FilterPill({ label, active, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                active
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
        >
            {label}
        </button>
    );
}

function MetaItem({ icon: Icon, label }) {
    return (
        <span className="inline-flex items-center gap-2">
            <Icon className="h-4 w-4 text-slate-400" />
            {label}
        </span>
    );
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}
