import { Link } from '@inertiajs/react';
import { LuArrowRight, LuCalendarDays, LuClock3, LuCopy, LuEye, LuLink2, LuMessageCircle, LuFileText, LuShare2, LuUser } from 'react-icons/lu';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';

export default function Article({ article, relatedArticles = [], schema, seo, breadcrumbs }) {
    const publishedDate = formatDate(article.published_at);
    const whatsappNumber = '6281234567890';
    const whatsappText = encodeURIComponent(`Halo, saya ingin konsultasi tentang artikel "${article.title}"`);
    const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
    const thumbnailUrl = normalizeMediaUrl(article.thumbnail);
    const contentHtml = normalizeArticleContent(article.content);

    return (
        <FrontendLayout>
            <SEOHead seo={seo} schema={schema} breadcrumbs={breadcrumbs} />

            <article className="bg-slate-50">
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                        <div className="mx-auto max-w-5xl text-center">
                            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-semibold">
                                <span className="rounded-full bg-accent/30 px-3 py-1 text-primary/90">{article.category?.name || 'Artikel'}</span>
                                {article.schema_type && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{article.schema_type}</span>}
                            </div>
                            <h1 className="mt-5 break-words text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                {article.title}
                            </h1>
                            {article.excerpt && <p className="mx-auto mt-5 max-w-3xl break-words text-base leading-8 text-slate-600 sm:text-lg">{article.excerpt}</p>}

                            <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500">
                                <MetaItem icon={LuUser} label={article.author?.name || 'Lumina Tech'} />
                                <MetaItem icon={LuCalendarDays} label={publishedDate} />
                                <MetaItem icon={LuClock3} label={`${article.reading_time || 1} menit baca`} />
                                <MetaItem icon={LuEye} label={`${formatNumber(article.view_count || 0)} views`} />
                            </div>

                            <div className="mt-8 flex flex-wrap justify-center gap-3">
                                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
                                    <LuMessageCircle className="h-4 w-4" />
                                    Konsultasi
                                </a>
                                <a href="#related" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary/90">
                                    <LuFileText className="h-4 w-4" />
                                    Baca Terkait
                                </a>
                            </div>
                        </div>

                        <div className="relative mx-auto mt-10 max-w-4xl">
                            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                                {thumbnailUrl ? (
                                    <img src={thumbnailUrl} alt={article.title} className="aspect-[16/9] max-h-[420px] w-full object-cover" loading="eager" />
                                ) : (
                                    <div className="flex aspect-[16/9] max-h-[420px] items-center justify-center bg-gradient-to-br from-slate-100 to-primary/5 text-slate-300">
                                        <LuLink2 className="h-20 w-20" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-5 right-5 hidden max-w-sm rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur sm:block">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Artikel</p>
                                <p className="mt-1 line-clamp-2 break-words text-sm font-semibold text-slate-950">{article.title}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-10 sm:py-14">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                <div
                                    className="article-content"
                                    dangerouslySetInnerHTML={{ __html: contentHtml }}
                                />
                            </div>

                            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                                    <LuShare2 className="h-4 w-4 text-slate-400" />
                                    Bagikan artikel
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0 sm:justify-end">
                                    <ShareButton
                                        label="Copy Link"
                                        icon={LuCopy}
                                        onClick={() => navigator.clipboard?.writeText(articleUrl)}
                                    />
                                    <ShareButton
                                        label="WhatsApp"
                                        icon={LuMessageCircle}
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`}
                                    />
                                    <ShareButton
                                        label="Facebook"
                                        icon={LuShare2}
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-5">
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ringkasan</p>
                                <div className="mt-4 space-y-3 text-sm text-slate-600">
                                    <SidebarItem label="Kategori" value={article.category?.name || 'Artikel'} />
                                    <SidebarItem label="Penulis" value={article.author?.name || 'Lumina Tech'} />
                                    <SidebarItem label="Tanggal" value={publishedDate} />
                                    <SidebarItem label="Durasi baca" value={`${article.reading_time || 1} menit`} />
                                </div>
                            </div>

                            <div className="rounded-3xl border border-accent/35 bg-accent/15 p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">Butuh Bantuan</p>
                                <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">Konsultasi sebelum service</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    Kirim gejala perangkat Anda dan tim kami akan bantu arahan awal sebelum pengerjaan.
                                </p>
                                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                                    <LuMessageCircle className="h-4 w-4" />
                                    Chat WhatsApp
                                </a>
                            </div>
                        </aside>
                    </div>
                </section>

                {relatedArticles.length > 0 && (
                    <section id="related" className="border-t border-slate-200 bg-slate-50 py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-tight text-slate-950">Artikel Terkait</h2>
                                    <p className="mt-2 text-sm leading-7 text-slate-500">Artikel lain yang relevan dengan topik ini.</p>
                                </div>
                                <Link href="/blog" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary/90 sm:inline-flex">
                                    Lihat Blog <LuArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {relatedArticles.map((related) => (
                                    <RelatedArticleCard key={related.id} article={related} />
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </FrontendLayout>
    );
}

function RelatedArticleCard({ article }) {
    const thumbnailUrl = normalizeMediaUrl(article.thumbnail);

    return (
        <Link href={`/blog/${article.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
            <div className="overflow-hidden bg-slate-100">
                {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt={article.title} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                        <LuLink2 className="h-10 w-10" />
                    </div>
                )}
            </div>
            <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                    {article.category?.name || 'Artikel'}
                </div>
                <h3 className="mt-3 line-clamp-2 break-words text-lg font-semibold text-slate-950 transition group-hover:text-primary/90">{article.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{article.excerpt}</p>
            </div>
        </Link>
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

function ShareButton({ label, icon: Icon, href, onClick }) {
    const sharedClass = 'inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:bg-accent/15 hover:text-primary/90';

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={sharedClass}>
                <Icon className="h-4 w-4" />
                {label}
            </a>
        );
    }

    return (
        <button type="button" onClick={onClick} className={sharedClass}>
            <Icon className="h-4 w-4" />
            {label}
        </button>
    );
}

function SidebarItem({ label, value }) {
    return (
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
            <span className="text-slate-400">{label}</span>
            <span className="text-right font-medium text-slate-950">{value}</span>
        </div>
    );
}

function formatDate(value) {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

function formatNumber(value) {
    return new Intl.NumberFormat('id-ID').format(Number(value) || 0);
}

function normalizeMediaUrl(value) {
    const url = String(value || '').trim();
    if (!url) return '';
    if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url;
    if (url.startsWith('/')) return url;
    if (url.startsWith('storage/')) return `/${url}`;
    return `/${url.replace(/^\/+/, '')}`;
}

function normalizeArticleContent(value) {
    const content = String(value || '').trim();
    if (!content) return '';
    if (/<[a-z][\s\S]*>/i.test(content)) return content;

    return content
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
        .join('');
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
