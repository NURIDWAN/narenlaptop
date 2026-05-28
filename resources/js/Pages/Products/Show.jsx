import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CheckCircle2, Laptop, MessageCircle, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';

export default function ProductShow({ product, relatedProducts = [], seo, schema, breadcrumbs }) {
    const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
    const [activeImage, setActiveImage] = useState(images[0] || '');
    const { settings = {} } = usePage().props;
    const whatsapp = settings.whatsapp_number || '6281234567890';
    const whatsappText = encodeURIComponent(`Halo, saya ingin konsultasi produk "${product.name}"`);

    return (
        <FrontendLayout>
            <SEOHead seo={seo} schema={schema} breadcrumbs={breadcrumbs} />

            <article className="bg-slate-50">
                <section className="border-b border-slate-200 bg-white">
                    <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-14">
                        <div>
                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                                {activeImage ? (
                                    <img src={activeImage} alt={product.name} className="aspect-[4/3] w-full object-cover" loading="eager" />
                                ) : (
                                    <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                                        <Laptop className="h-20 w-20" />
                                    </div>
                                )}
                            </div>
                            {images.length > 1 && (
                                <div className="mt-3 grid grid-cols-4 gap-3">
                                    {images.map((image, index) => (
                                        <button
                                            key={`${image}-${index}`}
                                            type="button"
                                            onClick={() => setActiveImage(image)}
                                            className={`overflow-hidden rounded-lg border bg-slate-100 transition ${activeImage === image ? 'border-primary ring-2 ring-primary/20' : 'border-slate-200 hover:border-primary/40'}`}
                                            aria-label={`Buka gambar produk ${index + 1}`}
                                        >
                                            <img src={image} alt={`${product.name} ${index + 1}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col justify-center">
                            <Link href="/produk" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/90">
                                <ArrowLeft className="h-4 w-4" />
                                Semua produk
                            </Link>
                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {product.badge && <span className="rounded-full bg-accent/30 px-3 py-1 text-xs font-semibold text-primary/90">{product.badge}</span>}
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Produk</span>
                            </div>
                            <h1 className="mt-4 break-words text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl">{product.name}</h1>
                            <div className="mt-6">
                                {product.discount_price && product.price && <p className="text-base text-slate-400 line-through">{product.price}</p>}
                                {(product.discount_price || product.price) && <p className="text-2xl font-bold text-primary">{product.discount_price || product.price}</p>}
                            </div>
                            {product.description && (
                                <div
                                    className="prose prose-slate mt-6 max-w-none prose-p:leading-7 prose-a:text-primary"
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            )}
                            <div className="mt-8 flex flex-wrap gap-3">
                                <a href={`https://wa.me/${whatsapp}?text=${whatsappText}`} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
                                    <MessageCircle className="h-4 w-4" />
                                    Konsultasi WhatsApp
                                </a>
                                <a href="/kontak" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:border-primary/40 hover:text-primary/90">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Tanya Ketersediaan
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {relatedProducts.length > 0 && (
                    <section className="py-14 sm:py-16">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h2 className="text-3xl font-bold tracking-normal text-slate-950">Produk Terkait</h2>
                                    <p className="mt-2 text-sm leading-7 text-slate-500">Pilihan lain yang mungkin sesuai kebutuhan Anda.</p>
                                </div>
                                <Link href="/produk" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary/90 sm:inline-flex">
                                    Lihat Semua <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {relatedProducts.map((related) => (
                                    <Link key={related.id} href={`/produk/${related.slug}`} className="group overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg">
                                        <div className="relative overflow-hidden rounded-lg bg-slate-100">
                                            {related.image ? (
                                                <img src={related.image} alt={related.name} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                                            ) : (
                                                <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                                                    <Laptop className="h-10 w-10" />
                                                </div>
                                            )}
                                        </div>
                                        <h3 className="mt-4 line-clamp-2 text-base font-semibold text-slate-950 group-hover:text-primary/90">{related.name}</h3>
                                        {(related.discount_price || related.price) && <p className="mt-4 text-sm font-bold text-primary">{related.discount_price || related.price}</p>}
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
