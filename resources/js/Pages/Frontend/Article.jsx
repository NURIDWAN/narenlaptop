import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock3, Copy, Eye, Link2, MessageCircle, NotebookText, Share2, User } from 'lucide-react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';

export default function Article({ article, relatedArticles = [], schema, seo }) {
    const publishedDate = formatDate(article.published_at);
    const whatsappNumber = '6281234567890';
    const whatsappText = encodeURIComponent(`Halo, saya ingin konsultasi tentang artikel "${article.title}"`);
    const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

    return (
        <FrontendLayout>
            <SEOHead seo={seo} schema={schema} />

            <article className="bg-slate-50">
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:py-12">
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">{article.category?.name || 'Artikel'}</span>
                                {article.schema_type && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{article.schema_type}</span>}
                            </div>
                            <h1 className="mt-4 max-w-3xl break-words text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                                {article.title}
                            </h1>
                            {article.excerpt && <p className="mt-5 max-w-2xl break-words text-base leading-8 text-slate-600">{article.excerpt}</p>}

                            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                <MetaItem icon={User} label={article.author?.name || 'Lumina Tech'} />
                                <MetaItem icon={CalendarDays} label={publishedDate} />
                                <MetaItem icon={Clock3} label={`${article.reading_time || 1} menit baca`} />
                                <MetaItem icon={Eye} label={`${formatNumber(article.view_count || 0)} views`} />
                            </div>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
                                    <MessageCircle className="h-4 w-4" />
                                    Konsultasi
                                </a>
                                <a href="#related" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700">
                                    <NotebookText className="h-4 w-4" />
                                    Baca Terkait
                                </a>
                            </div>

                            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2 text-sm font-semibold text-slate-950">
                                    <Share2 className="h-4 w-4 text-slate-400" />
                                    Bagikan artikel
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <ShareButton
                                        label="Copy Link"
                                        icon={Copy}
                                        onClick={() => navigator.clipboard?.writeText(articleUrl)}
                                    />
                                    <ShareButton
                                        label="WhatsApp"
                                        icon={MessageCircle}
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`${article.title} ${articleUrl}`)}`}
                                    />
                                    <ShareButton
                                        label="Facebook"
                                        icon={Share2}
                                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="relative">
                            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                                {article.thumbnail ? (
                                    <img src={article.thumbnail} alt={article.title} className="aspect-[4/3] w-full object-cover" loading="eager" />
                                ) : (
                                    <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 text-slate-300">
                                        <Link2 className="h-20 w-20" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-5 right-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Artikel</p>
                                <p className="mt-1 line-clamp-2 break-words text-sm font-semibold text-slate-950">{article.title}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-10 sm:py-14">
                    <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                            <div
                                className="prose prose-slate prose-headings:break-words prose-headings:tracking-tight prose-p:break-words prose-li:break-words prose-a:text-blue-600 prose-img:rounded-2xl prose-img:shadow-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: article.content || '' }}
                            />
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

                            <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Butuh Bantuan</p>
                                <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950">Konsultasi sebelum service</h2>
                                <p className="mt-3 text-sm leading-7 text-slate-600">
                                    Kirim gejala perangkat Anda dan tim kami akan bantu arahan awal sebelum pengerjaan.
                                </p>
                                <a href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
                                    <MessageCircle className="h-4 w-4" />
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
                                <Link href="/blog" className="hidden items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 sm:inline-flex">
                                    Lihat Blog <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="mt-8 grid gap-5 md:grid-cols-3">
                                {relatedArticles.map((related) => (
                                    <Link key={related.id} href={`/blog/${related.slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
                                        <div className="overflow-hidden bg-slate-100">
                                            {related.thumbnail ? (
                                                <img src={related.thumbnail} alt={related.title} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                                            ) : (
                                                <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                                                    <Link2 className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                                                {related.category?.name || 'Artikel'}
                                            </div>
                                            <h3 className="mt-3 line-clamp-2 break-words text-lg font-semibold text-slate-950 transition group-hover:text-blue-700">{related.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-slate-600 line-clamp-3">{related.excerpt}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </article>
        </FrontendLayout>
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
    const sharedClass = 'inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700';

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
