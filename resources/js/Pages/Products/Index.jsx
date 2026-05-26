import { Link, router } from '@inertiajs/react';
import { ArrowRight, Laptop, Search, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';

export default function ProductIndex({ products, filters = {}, seo }) {
    const items = products.data || [];
    const [search, setSearch] = useState(filters.search || '');

    function submit(event) {
        event.preventDefault();
        router.get('/produk', { search: search.trim() || undefined }, { preserveScroll: true, preserveState: true });
    }

    return (
        <FrontendLayout>
            <SEOHead seo={seo} />

            <section className="bg-slate-50">
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Katalog Produk</p>
                            <h1 className="mt-4 text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">Semua Produk</h1>
                            <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-500 sm:text-base">
                                Pilihan laptop dan perangkat unggulan yang siap membantu kebutuhan kerja, belajar, dan bisnis.
                            </p>
                        </div>

                        <form onSubmit={submit} className="flex w-full gap-2 sm:max-w-sm">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                                    placeholder="Cari produk..."
                                />
                            </div>
                            <button type="submit" className="inline-flex h-11 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700">
                                Cari
                            </button>
                        </form>
                    </div>

                    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {items.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>

                    {items.length === 0 && (
                        <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                            Produk tidak ditemukan.
                        </div>
                    )}

                    {products.last_page > 1 && <Pagination links={products.links} />}
                </div>
            </section>
        </FrontendLayout>
    );
}

function ProductCard({ product }) {
    return (
        <Link href={`/produk/${product.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg">
            <div className="relative overflow-hidden rounded-lg bg-slate-100">
                {product.image ? (
                    <img src={product.image} alt={product.name} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                ) : (
                    <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                        <Laptop className="h-10 w-10" />
                    </div>
                )}
                {product.badge && <span className="absolute left-3 top-3 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-semibold text-white">{product.badge}</span>}
            </div>
            <h2 className="mt-4 line-clamp-2 break-words text-base font-semibold text-slate-950 transition group-hover:text-blue-700">{product.name}</h2>
            {product.description && (
                <div
                    className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500 [&_p]:m-0"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                />
            )}
            <div className="mt-5 flex items-center justify-between gap-3">
                <div>
                    {product.discount_price && product.price && <p className="text-[11px] text-slate-400 line-through">{product.price}</p>}
                    {(product.discount_price || product.price) && <p className="text-sm font-bold text-blue-600">{product.discount_price || product.price}</p>}
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                    <ShoppingCart className="h-4 w-4" />
                </span>
            </div>
        </Link>
    );
}

function Pagination({ links }) {
    return (
        <div className="mt-10 flex flex-wrap justify-center gap-2">
            {links.map((link, index) => (
                <button
                    key={index}
                    type="button"
                    disabled={!link.url}
                    onClick={() => link.url && router.get(link.url, {}, { preserveScroll: true, preserveState: true })}
                    className={`inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition ${
                        link.active
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50'
                    }`}
                >
                    <span dangerouslySetInnerHTML={{ __html: link.label }} />
                </button>
            ))}
        </div>
    );
}
