import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { Link, router, usePage } from '@inertiajs/react';
import { motion, useInView } from 'framer-motion';
import { LuArrowRight, LuCalendarDays, LuCheckCircle2, LuChevronLeft, LuChevronRight, LuCpu, LuHardDrive, LuLaptop, LuMail, LuMessageSquare, LuPhone, LuQuote, LuRotateCcw, LuSend, LuShieldCheck, LuShoppingCart, LuStar, LuWrench } from 'react-icons/lu';
import { useEffect, useRef, useState } from 'react';

const iconSet = [LuWrench, LuCpu, LuShieldCheck, LuStar, LuCheckCircle2, LuMessageSquare];

function normalizeGoogleMapsEmbedUrl(value = '') {
    const rawValue = String(value || '').trim();
    if (!rawValue) return '';

    const srcMatch = rawValue.match(/src=["']([^"']+)["']/i);
    const mapValue = (srcMatch?.[1] || rawValue).replaceAll('&amp;', '&').trim();

    if (mapValue.startsWith('!')) {
        return `https://www.google.com/maps/embed?pb=${mapValue}`;
    }

    if (mapValue.startsWith('pb=')) {
        return `https://www.google.com/maps/embed?${mapValue}`;
    }

    return mapValue;
}

function FadeIn({ children, className = '', delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function StaggerChildren({ children, className = '' }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function StaggerItem({ children, className = '' }) {
    return (
        <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function AnimatedStatValue({ value }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-60px' });
    const rawValue = String(value ?? '');
    const [displayValue, setDisplayValue] = useState(rawValue);

    useEffect(() => {
        const match = rawValue.match(/^(.*?)(\d[\d.,]*)(.*)$/);
        if (!match || !isInView) {
            if (!isInView) setDisplayValue(rawValue);
            return undefined;
        }

        const [, prefix, numericPart, suffix] = match;
        const target = Number(numericPart.replace(/[.,]/g, ''));
        if (Number.isNaN(target)) {
            setDisplayValue(rawValue);
            return undefined;
        }

        let frameId;
        const duration = 1500;
        const start = performance.now();

        const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - ((1 - progress) ** 3);
            const current = Math.round(target * eased);
            setDisplayValue(`${prefix}${current}${suffix}`);
            if (progress < 1) frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [isInView, rawValue]);

    return <span ref={ref}>{displayValue}</span>;
}

export default function SectionRenderer({ section, latestArticles = [] }) {
    const settings = section.settings || {};
    const data = section.data || {};

    if (section.type === 'hero') return <Hero settings={settings} />;
    if (section.type === 'about_hero') return <AboutHero settings={settings} />;
    if (section.type === 'slider') return <Slider settings={settings} data={data} />;
    if (section.type === 'about') return <About settings={settings} />;
    if (section.type === 'journey') return <Journey settings={settings} />;
    if (section.type === 'values') return <Values settings={settings} />;
    if (section.type === 'expertise') return <Expertise settings={settings} />;
    if (section.type === 'services') return <Services settings={settings} data={data} />;
    if (section.type === 'products') return <Products settings={settings} data={data} />;
    if (section.type === 'booking_service') return <BookingService settings={settings} />;
    if (section.type === 'stats') return <Stats settings={settings} />;
    if (section.type === 'testimonials') return <Testimonials settings={settings} data={data} />;
    if (section.type === 'gallery') return <Gallery settings={settings} data={data} />;
    if (section.type === 'image_compare') return <ImageCompare settings={settings} />;
    if (section.type === 'cta') return <CTA settings={settings} />;
    if (section.type === 'faq') return <FAQ settings={settings} />;
    if (section.type === 'contact') return <Contact settings={settings} data={data} />;
    if (section.type === 'blog_list') return <BlogList settings={settings} articles={data.articles || latestArticles} />;
    if (section.type === 'rich_text') return <RichText settings={settings} />;
    if (section.type === 'custom_html') return <section dangerouslySetInnerHTML={{ __html: settings.html || '' }} />;
    if (section.type === 'pricing') return <Pricing settings={settings} />;
    if (section.type === 'team') return <Team settings={settings} data={data} />;
    if (section.type === 'google_reviews') return <GoogleReviews settings={settings} />;
    if (section.type === 'location') return <Location settings={settings} />;

    return <Generic settings={settings} />;
}

/* ─── Slider ─── */
function Slider({ settings, data = {} }) {
    const slides = data.slides?.length ? data.slides : (settings.items || []);
    const [active, setActive] = useState(0);

    if (!slides.length) {
        return null;
    }

    const current = slides[active % slides.length] || slides[0];
    const goTo = (index) => setActive((index + slides.length) % slides.length);
    const backgroundImage = current.image || settings.background_image;

    return (
        <section className="relative overflow-hidden bg-slate-950 text-white">
            {backgroundImage ? (
                <img
                    src={backgroundImage}
                    alt={current.title || settings.title || 'Slider'}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading={active === 0 ? 'eager' : 'lazy'}
                />
            ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary/30 to-slate-900" />
            )}
            <div className="absolute inset-0 bg-slate-950/65" />

            <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-24 sm:px-6 lg:px-8">
                <FadeIn className="max-w-3xl">
                    {(current.badge || settings.title) && (
                        <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-accent/90 backdrop-blur">
                            {current.badge || settings.title}
                        </span>
                    )}
                    <h2 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
                        {current.title}
                    </h2>
                    {(current.subtitle || settings.subtitle) && (
                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                            {current.subtitle || settings.subtitle}
                        </p>
                    )}
                    {current.cta_url && (
                        <a
                            href={current.cta_url}
                            className="mt-9 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90"
                        >
                            {current.cta_text || 'Selengkapnya'}
                            <LuArrowRight className="h-4 w-4" />
                        </a>
                    )}
                </FadeIn>
            </div>

            {slides.length > 1 && (
                <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/15 bg-slate-950/50 px-3 py-2 backdrop-blur">
                    <button
                        type="button"
                        onClick={() => goTo(active - 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
                        aria-label="Slide sebelumnya"
                    >
                        <LuChevronLeft className="h-5 w-5" />
                    </button>
                    <div className="flex items-center gap-2">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.title || index}
                                type="button"
                                onClick={() => goTo(index)}
                                className={`h-2.5 rounded-full transition ${index === active ? 'w-8 bg-white' : 'w-2.5 bg-white/45 hover:bg-white/70'}`}
                                aria-label={`Buka slide ${index + 1}`}
                            />
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={() => goTo(active + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full text-white transition hover:bg-white/15"
                        aria-label="Slide berikutnya"
                    >
                        <LuChevronRight className="h-5 w-5" />
                    </button>
                </div>
            )}
        </section>
    );
}

/* ─── Hero ─── */
function Hero({ settings }) {
    const highlights = [
        settings.highlight_one || 'Garansi produk original',
        settings.highlight_two || 'Konsultasi gratis',
        settings.highlight_three || 'Dukungan after-sales cepat',
    ].filter(Boolean);

    return (
        <section className="relative overflow-hidden bg-slate-950 py-16 text-slate-100 sm:py-20 lg:py-24">
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -left-24 top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl"
                animate={{ y: [0, -16, 0], x: [0, 14, 0] }}
                transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
            />
            <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 bottom-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
                animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
            />

            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.55, ease: 'easeOut' }}
                >
                    <span className="inline-flex rounded-full border border-accent/35 bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                        Solusi teknologi terpercaya
                    </span>
                    <h1 className="mt-5 max-w-3xl text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {settings.title || 'Teknologi yang tepat untuk kerja yang cepat'}
                    </h1>
                    <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                        {settings.subtitle || 'Pilih laptop, desktop, dan aksesoris terbaik untuk produktivitas harian hingga kebutuhan profesional.'}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-2.5">
                        {highlights.map((item, index) => (
                            <motion.span
                                key={`${item}-${index}`}
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.12 + (index * 0.09), duration: 0.35 }}
                                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-slate-200"
                            >
                                {item}
                            </motion.span>
                        ))}
                    </div>
                    <div className="mt-8 flex flex-wrap gap-3">
                        {settings.cta_url && (
                            <a href={settings.cta_url} className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-xs font-semibold text-slate-950 shadow-lg shadow-accent/35 transition hover:-translate-y-0.5 hover:bg-accent/90">
                                {settings.cta_text || 'Hubungi Kami'}
                            </a>
                        )}
                        {settings.secondary_url && (
                            <a href={settings.secondary_url} className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-600 bg-slate-900/65 px-5 text-xs font-semibold text-slate-100 transition hover:border-accent/60 hover:bg-slate-800">
                                {settings.secondary_text || 'Pelajari'}
                            </a>
                        )}
                        {settings.tertiary_url && (
                            <a href={settings.tertiary_url} className="inline-flex h-11 items-center justify-center rounded-lg border border-primary/40 bg-primary/20 px-5 text-xs font-semibold text-accent/90 transition hover:bg-primary/30">
                                {settings.tertiary_text || 'Booking Service'}
                            </a>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                    className="relative"
                >
                    <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-accent/35 via-primary/10 to-transparent blur-2xl" />
                    <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
                        {settings.background_image ? (
                            <img src={settings.background_image} alt={settings.title || 'Hero'} className="aspect-[4/3] w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30 text-slate-300">
                                <LuLaptop className="h-20 w-20" />
                            </div>
                        )}
                    </div>
                    <motion.div
                        className="absolute -bottom-5 left-5 rounded-xl border border-slate-700 bg-slate-900/90 px-4 py-3 backdrop-blur"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.25, duration: 0.4 }}
                    >
                        <p className="text-[11px] uppercase tracking-wider text-accent">Support</p>
                        <p className="text-sm font-semibold text-white">Fast response team</p>
                    </motion.div>
                    <motion.div
                        className="absolute -right-4 top-6 rounded-xl border border-primary/35 bg-accent/20 px-4 py-3 backdrop-blur"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.35, duration: 0.4 }}
                    >
                        <p className="text-[11px] uppercase tracking-wider text-accent/90">Rating</p>
                        <p className="text-sm font-semibold text-white">4.9/5 pelanggan</p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

/* ─── About Hero ─── */
function AboutHero({ settings }) {
    return (
        <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                <FadeIn>
                    <h1 className="text-4xl font-extrabold tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
                        {settings.title || 'Tentang Kami'}
                    </h1>
                    {settings.subtitle && <p className="mx-auto mt-5 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base">{settings.subtitle}</p>}
                </FadeIn>
                <FadeIn delay={0.12}>
                    <div className="mx-auto mt-10 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
                        {settings.image ? (
                            <img src={settings.image} alt={settings.title || 'Tentang kami'} className="aspect-[16/10] w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[16/10] items-center justify-center bg-slate-100 text-slate-300">
                                <LuLaptop className="h-20 w-20" />
                            </div>
                        )}
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ─── About ─── */
function About({ settings }) {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
                <FadeIn>
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Tentang Kami</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mt-4 text-base leading-7 text-slate-600">{settings.subtitle}</p>}
                    {settings.description && <p className="mt-4 text-sm leading-7 text-slate-500">{settings.description}</p>}
                </FadeIn>
                {settings.image && (
                    <FadeIn delay={0.2}>
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-2xl bg-gradient-to-br from-accent/20 to-slate-100" />
                            <img src={settings.image} alt={settings.title || 'About'} className="relative rounded-2xl object-cover shadow-xl" loading="lazy" />
                        </div>
                    </FadeIn>
                )}
            </div>
        </section>
    );
}

/* ─── Journey ─── */
function Journey({ settings }) {
    const stats = settings.stats || [];

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                <FadeIn>
                    <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{settings.title || 'Perjalanan Kami'}</h2>
                    <div className="mt-6 space-y-4 text-sm leading-7 text-slate-600">
                        {settings.subtitle && <p>{settings.subtitle}</p>}
                        {settings.description && <p>{settings.description}</p>}
                    </div>
                </FadeIn>
                <StaggerChildren className="grid gap-4 sm:grid-cols-2">
                    {stats.map((item, index) => (
                        <StaggerItem key={index}>
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm">
                                <p className="text-3xl font-bold tracking-tight text-primary">{item.value}</p>
                                <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Values ─── */
function Values({ settings }) {
    const items = settings.items || [];

    return (
        <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{settings.title || 'Nilai Inti Kami'}</h2>
                    {settings.subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">{settings.subtitle}</p>}
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {items.map((item, index) => {
                        const Icon = [LuShieldCheck, LuCpu, LuStar][index % 3];
                        return (
                            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mt-5 text-lg font-semibold text-slate-950">{item.title}</h3>
                                <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ─── Expertise ─── */
function Expertise({ settings }) {
    return (
        <section className="bg-slate-950 py-16 text-white sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
                <FadeIn>
                    <div className="overflow-hidden rounded-2xl">
                        {settings.image ? (
                            <img src={settings.image} alt={settings.title || 'Keahlian teknis'} className="aspect-[4/3] w-full object-cover" />
                        ) : (
                            <div className="flex aspect-[4/3] items-center justify-center bg-white/5 text-white/20">
                                <LuWrench className="h-20 w-20" />
                            </div>
                        )}
                    </div>
                </FadeIn>
                <FadeIn delay={0.1}>
                    <div className="flex h-full flex-col justify-center">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-300">{settings.eyebrow || 'Keahlian Teknis'}</p>
                        <h2 className="mt-4 max-w-xl text-3xl font-bold tracking-normal text-white sm:text-4xl">{settings.title || 'Presisi di Setiap Perbaikan'}</h2>
                        {settings.subtitle && <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300">{settings.subtitle}</p>}
                        <ul className="mt-8 space-y-3">
                            {(settings.bullets || []).map((bullet, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm leading-7 text-slate-200">
                                    <LuCheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-accent" />
                                    <span>{bullet}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </FadeIn>
            </div>
        </section>
    );
}

/* ─── Services ─── */
function Services({ settings, data = {} }) {
    const items = data.items?.length ? data.items : (settings.items || []);

    const linkProps = (url) => {
        const href = String(url || '').trim();
        if (!href) return {};
        const external = /^https?:\/\//i.test(href);

        return {
            href,
            ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        };
    };

    return (
        <section id="layanan" className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">{settings.subtitle}</p>}
                </div>
                <StaggerChildren className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => {
                        const Icon = iconSet[index % iconSet.length];
                        const cta = linkProps(item.cta_url);
                        return (
                            <StaggerItem key={item.title || index}>
                                <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-200/80">
                                    {item.image ? (
                                        <img src={item.image} alt={item.title || 'Layanan'} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                                    ) : (
                                        <div className="mx-6 mt-6 flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-white">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="flex flex-1 flex-col p-6">
                                        <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                                        <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">{item.description}</p>
                                        {cta.href && (
                                            <a
                                                {...cta}
                                                className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-white transition hover:bg-primary/90"
                                            >
                                                {item.cta_text || 'Selengkapnya'}
                                                <LuArrowRight className="h-3.5 w-3.5" />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            </StaggerItem>
                        );
                    })}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Products ─── */
function Products({ settings, data = {} }) {
    const { settings: siteSettings = {} } = usePage().props;
    const items = data.items?.length ? data.items : (settings.items || []);
    const title = String(settings.title ?? '').trim() || 'Produk Unggulan';
    const subtitle = String(settings.subtitle ?? '').trim();
    const linkText = String(settings.link_text ?? '').trim() || 'Lihat Semua';
    const linkUrl = String(settings.link_url ?? '').trim() || '/produk';
    const whatsappNumber = String(siteSettings.whatsapp_number || '6281234567890').replace(/\D/g, '');

    const plainText = (value) => String(value || '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const productWhatsappUrl = (item, href) => {
        const productUrl = href.startsWith('http')
            ? href
            : `${typeof window !== 'undefined' ? window.location.origin : ''}${href}`;
        const details = [
            'Halo, saya ingin membeli produk berikut:',
            `Nama: ${plainText(item.name) || 'Produk'}`,
            item.discount_price || item.price ? `Harga: ${item.discount_price || item.price}` : null,
            item.description ? `Detail: ${plainText(item.description)}` : null,
            `Link produk: ${productUrl}`,
        ].filter(Boolean);

        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(details.join('\n'))}`;
    };

    return (
        <section id="produk" className="bg-slate-100 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{title}</h2>
                        {subtitle && <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">{subtitle}</p>}
                    </div>
                    <a href={linkUrl} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/90">
                        {linkText} <LuArrowRight className="h-3.5 w-3.5" />
                    </a>
                </div>
                <StaggerChildren className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, index) => {
                        const href = item.slug ? `/produk/${item.slug}` : (item.cta_url || linkUrl || '/kontak');

                        return (
                            <StaggerItem key={item.name || index}>
                                <article className="group h-full overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-300/60">
                                    <a href={href} className="block">
                                        <div className="relative overflow-hidden rounded-lg bg-slate-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name || 'Produk'} className="aspect-[4/3] w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                                            ) : (
                                                <div className="flex aspect-[4/3] items-center justify-center text-slate-300">
                                                    <LuLaptop className="h-10 w-10" />
                                                </div>
                                            )}
                                            {item.badge && (
                                                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="mt-4 break-words text-base font-semibold text-slate-950 transition group-hover:text-primary/90">{item.name}</h3>
                                    </a>
                                    {item.description && (
                                        <div
                                            className="mt-2 min-h-12 max-h-20 overflow-hidden text-xs leading-5 text-slate-500 [&_p]:m-0 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4"
                                            dangerouslySetInnerHTML={{ __html: item.description }}
                                        />
                                    )}
                                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            {item.discount_price && item.price && <p className="text-[11px] text-slate-400 line-through">{item.price}</p>}
                                            {(item.discount_price || item.price) && <p className="text-xs font-bold text-primary">{item.discount_price || item.price}</p>}
                                        </div>
                                        <a
                                            href={productWhatsappUrl(item, href)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-white transition hover:bg-primary/90"
                                            aria-label={`Beli ${item.name || 'produk'} sekarang via WhatsApp`}
                                        >
                                            <LuShoppingCart className="h-4 w-4" />
                                            <span>Beli Sekarang</span>
                                        </a>
                                    </div>
                                </article>
                            </StaggerItem>
                        );
                    })}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Booking Service ─── */
function BookingService({ settings }) {
    const [form, setForm] = useState({ name: '', phone: '', device: '', issue: '', date: '' });
    const [sent, setSent] = useState(false);
    const services = settings.services || [];

    function submit(event) {
        event.preventDefault();
        router.post('/kontak', {
            name: form.name,
            phone: form.phone,
            message: [
                `Booking service untuk: ${form.device || '-'}`,
                `Keluhan: ${form.issue || '-'}`,
                `Jadwal pilihan: ${form.date || '-'}`,
            ].join('\n'),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                setForm({ name: '', phone: '', device: '', issue: '', date: '' });
            },
        });
    }

    return (
        <section id="booking-service" className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{settings.title || 'Layanan Service Kami'}</h2>
                    {settings.subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">{settings.subtitle}</p>}
                </div>
                {services.length > 0 && (
                    <div className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-3">
                        {services.map((service, index) => {
                            const Icon = [LuHardDrive, LuCpu, LuWrench, LuLaptop, LuRotateCcw, LuShieldCheck][index % 6];
                            return (
                                <span key={service} className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm">
                                    <Icon className="h-3.5 w-3.5 text-slate-500" />
                                    {service}
                                </span>
                            );
                        })}
                    </div>
                )}
                <div className="mt-12 grid overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/80 lg:grid-cols-2 lg:gap-10 lg:p-10">
                    <div className="relative overflow-hidden rounded-2xl bg-slate-900">
                        {settings.image ? (
                            <img src={settings.image} alt={settings.title || 'Booking service'} className="h-full min-h-96 w-full object-cover opacity-90" loading="lazy" />
                        ) : (
                            <div className="flex min-h-96 items-center justify-center text-slate-600"><LuWrench className="h-16 w-16" /></div>
                        )}
                        {(settings.badge_title || settings.badge_subtitle) && (
                            <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/95 p-5 shadow-lg backdrop-blur">
                                <p className="text-base font-semibold text-slate-950">{settings.badge_title || 'Teknisi Tersertifikasi'}</p>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{settings.badge_subtitle || 'Pengerjaan transparan, cepat, dan bergaransi.'}</p>
                            </div>
                        )}
                    </div>
                    <form onSubmit={submit} className="mt-8 flex flex-col justify-center lg:mt-0">
                        <h3 className="text-3xl font-bold tracking-normal text-slate-950">{settings.card_title || 'Booking Service'}</h3>
                        {settings.card_subtitle && <p className="mt-3 text-sm leading-7 text-slate-500">{settings.card_subtitle}</p>}
                        {sent && <p className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-700">Permintaan booking berhasil dikirim.</p>}
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2 text-xs font-medium text-slate-600">
                                Nama Lengkap
                                <input className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/20" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                            </label>
                            <label className="space-y-2 text-xs font-medium text-slate-600">
                                Nomor WhatsApp
                                <input className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/20" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08xx-xxxx-xxxx" />
                            </label>
                        </div>
                        <label className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                            Merk & Tipe Laptop
                            <input className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/20" value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })} placeholder="Misal: MacBook Pro M1 2020" />
                        </label>
                        <label className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                            Keluhan / Masalah
                            <textarea className="min-h-28 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/20" value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} placeholder="Ceritakan masalah laptop Anda" required />
                        </label>
                        <label className="mt-4 space-y-2 text-xs font-medium text-slate-600">
                            Pilih Jadwal Kedatangan
                            <div className="relative">
                                <input type="date" className="h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition focus:border-primary/40 focus:bg-white focus:ring-4 focus:ring-primary/20" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
                                <LuCalendarDays className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            </div>
                        </label>
                        <button className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90">
                            Kirim Permintaan Booking
                            <LuSend className="h-4 w-4" />
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

/* ─── Stats ─── */
function Stats({ settings }) {
    const items = settings.items || [];
    return (
        <section className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/80 py-20 text-white">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
            </div>
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {settings.title && (
                    <div className="mb-12 text-center">
                        <h2 className="text-3xl font-bold tracking-tight">{settings.title}</h2>
                        {settings.subtitle && <p className="mt-3 text-accent/90">{settings.subtitle}</p>}
                    </div>
                )}
                <StaggerChildren className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {items.map((item, i) => (
                        <StaggerItem key={i}>
                            <div className="rounded-2xl bg-white/10 p-8 text-center backdrop-blur-sm">
                                <p className="text-4xl font-extrabold tracking-tight"><AnimatedStatValue value={item.value} /></p>
                                <p className="mt-2 text-sm font-medium text-accent/90">{item.label}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Testimonials ─── */
function Testimonials({ settings, data = {} }) {
    const items = data.items?.length ? data.items : (settings.items || []);
    const displayItems = items.length === 1 ? [items[0], items[0], items[0]] : items;
    const [active, setActive] = useState(0);

    if (!items.length) return null;

    const goTo = (index) => setActive((index + displayItems.length) % displayItems.length);

    useEffect(() => {
        const intervalId = window.setInterval(() => {
            setActive((prev) => (prev + 1) % displayItems.length);
        }, 4500);

        return () => window.clearInterval(intervalId);
    }, [displayItems.length]);

    return (
        <section className="bg-slate-50 py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">{settings.title || 'Kata Mereka'}</h2>
                    {settings.subtitle && <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-500">{settings.subtitle}</p>}
                </div>
                <div className="relative mt-10">
                    <div className="overflow-hidden">
                        <motion.div
                            className="flex"
                            animate={{ x: `-${active * 100}%` }}
                            transition={{ duration: 0.45, ease: 'easeOut' }}
                        >
                            {displayItems.map((item, i) => (
                                <div key={`${item.name || 'testimoni'}-${i}`} className="w-full flex-none px-1 sm:px-2">
                                    <blockquote className="mx-auto h-full max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                                        <LuQuote className="mb-4 h-5 w-5 text-slate-300" />
                                        <div className="flex gap-0.5 text-accent">
                                            {Array.from({ length: item.rating || 5 }).map((_, s) => <LuStar key={s} className="h-4 w-4 fill-current" />)}
                                        </div>
                                        <p className="mt-4 text-base leading-8 text-slate-600">"{item.content}"</p>
                                        <footer className="mt-6 flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary/5 text-sm font-bold text-primary">
                                                {item.photo ? <img src={item.photo} alt={item.name} className="h-full w-full object-cover" /> : (item.name || '?')[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-950">{item.name}</p>
                                                {item.role && <p className="text-xs text-slate-500">{item.role}</p>}
                                            </div>
                                        </footer>
                                    </blockquote>
                                </div>
                            ))}
                        </motion.div>
                    </div>

                    {displayItems.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={() => goTo(active - 1)}
                                className="absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:-left-3"
                                aria-label="Testimoni sebelumnya"
                            >
                                <LuChevronLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => goTo(active + 1)}
                                className="absolute right-0 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 sm:-right-3"
                                aria-label="Testimoni berikutnya"
                            >
                                <LuChevronRight className="h-4 w-4" />
                            </button>
                            {items.length > 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    {items.map((_, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => goTo(index)}
                                            className={`h-2.5 rounded-full transition ${index === (active % items.length) ? 'w-7 bg-primary' : 'w-2.5 bg-slate-300 hover:bg-slate-400'}`}
                                            aria-label={`Buka testimoni ${index + 1}`}
                                        />
                                    ))}
                                </div>
                            )}
                            {items.length === 1 && (
                                <div className="mt-6 flex items-center justify-center gap-2">
                                    <button
                                        type="button"
                                        className="h-2.5 w-7 rounded-full bg-primary"
                                        aria-label="Testimoni aktif"
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ─── Gallery ─── */
function Gallery({ settings, data = {} }) {
    const images = data.images?.length ? data.images : (settings.images || []);
    return (
        <section className="bg-slate-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Galeri</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                </div>
                <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3">
                    {images.map((img, i) => (
                        <div key={i} className="mb-4 break-inside-avoid overflow-hidden rounded-2xl">
                            <img src={img.url} alt={img.caption || `Gallery ${i + 1}`} className="w-full object-cover transition duration-300 hover:scale-105" loading="lazy" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ─── Image Compare ─── */
function ImageCompare({ settings }) {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Hasil Kerja</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                </div>
                <div className="relative mt-12 overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                    <ReactCompareSlider
                        position={settings.initial_position ?? 50}
                        itemOne={<ReactCompareSliderImage src={settings.before_image} alt={settings.before_label || 'Before'} loading="lazy" />}
                        itemTwo={<ReactCompareSliderImage src={settings.after_image} alt={settings.after_label || 'After'} loading="lazy" />}
                    />
                    <span className="absolute left-4 top-4 rounded-lg bg-slate-950/80 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{settings.before_label || 'Sebelum'}</span>
                    <span className="absolute right-4 top-4 rounded-lg bg-primary/90 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{settings.after_label || 'Sesudah'}</span>
                </div>
            </div>
        </section>
    );
}

/* ─── CTA ─── */
function CTA({ settings }) {
    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/80 py-20">
            <div className="absolute inset-0">
                <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-white/5" />
                <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/5" />
            </div>
            <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                <FadeIn>
                    <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{settings.title}</h2>
                    {settings.description && <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-accent/90">{settings.description}</p>}
                    {settings.cta_url && (
                        <a href={settings.cta_url} className="mt-10 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-sm font-semibold text-primary/90 shadow-lg transition hover:bg-primary/5 hover:shadow-xl">
                            {settings.cta_text || 'Selengkapnya'}
                            <LuArrowRight className="h-4 w-4" />
                        </a>
                    )}
                </FadeIn>
            </div>
        </section>
    );
}

/* ─── FAQ ─── */
function FAQ({ settings }) {
    return (
        <section className="bg-slate-50 py-24">
            <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">FAQ</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                </div>
                <StaggerChildren className="mt-12 space-y-4">
                    {(settings.items || []).map((item, index) => (
                        <StaggerItem key={index}>
                            <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition open:shadow-md">
                            <summary className="flex cursor-pointer items-center justify-between p-6 text-base font-semibold text-slate-950">
                                {item.question}
                                <span className="ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition group-open:rotate-45 group-open:bg-accent/25 group-open:text-primary">+</span>
                            </summary>
                            <div className="px-6 pb-6">
                                <p className="text-sm leading-relaxed text-slate-600">{item.answer}</p>
                            </div>
                        </details>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Contact ─── */
function Contact({ settings, data = {} }) {
    const { settings: siteSettings = {} } = usePage().props;
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [sent, setSent] = useState(false);
    const contactSettings = data.settings || {};
    const mapEmbedUrl = normalizeGoogleMapsEmbedUrl(settings.map_embed_url || contactSettings.google_maps_embed || siteSettings.google_maps_embed || '');
    const whatsappNumber = String(siteSettings.whatsapp_number || contactSettings.whatsapp_number || '6281234567890').replace(/\D/g, '');

    function whatsappUrl(payload) {
        const message = [
            'Halo, saya ingin menghubungi Naren Laptop.',
            `Nama: ${payload.name}`,
            payload.email ? `Email: ${payload.email}` : null,
            payload.phone ? `No. HP: ${payload.phone}` : null,
            `Pesan: ${payload.message}`,
        ].filter(Boolean).join('\n');

        return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    }

    function submit(event) {
        event.preventDefault();
        const submittedForm = { ...form };

        router.post('/kontak', form, {
            preserveScroll: true,
            onSuccess: () => {
                setSent(true);
                window.open(whatsappUrl(submittedForm), '_blank', 'noopener,noreferrer');
                setForm({ name: '', email: '', phone: '', message: '' });
            },
        });
    }

    return (
        <section id="kontak" className="relative overflow-hidden bg-slate-950 py-24 text-white">
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(190,151,78,0.3),transparent_60%)]" />
            </div>
            <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:px-8">
                <div className="lg:col-span-2">
                    <span className="text-sm font-semibold uppercase tracking-widest text-accent">Kontak</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight">{settings.title || 'Hubungi Kami'}</h2>
                    <p className="mt-4 leading-relaxed text-slate-400">{settings.subtitle}</p>
                    <div className="mt-8 space-y-4">
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20"><LuMail className="h-5 w-5 text-accent" /></div>
                            Kirim pesan melalui form
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20"><LuPhone className="h-5 w-5 text-accent" /></div>
                            Atau hubungi via WhatsApp
                        </div>
                    </div>
                    {mapEmbedUrl && (
                        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10">
                            <iframe
                                src={mapEmbedUrl}
                                title="Map lokasi"
                                className="h-64 w-full"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            />
                        </div>
                    )}
                </div>
                <form onSubmit={submit} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:col-span-3">
                    {sent && <p className="rounded-lg bg-green-500/20 px-4 py-2.5 text-sm font-medium text-green-300">✓ Pesan berhasil dikirim!</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <input className="rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-primary/20" placeholder="Nama" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                        <input className="rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-primary/20" placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                    </div>
                    <input className="w-full rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-primary/20" placeholder="No. HP" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    <textarea className="min-h-32 w-full rounded-xl border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-400 focus:border-primary focus:ring-primary/20" placeholder="Tulis pesan Anda..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
                    <button className="w-full rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90">Kirim Pesan</button>
                </form>
            </div>
        </section>
    );
}

/* ─── Blog List ─── */
function BlogList({ settings, articles }) {
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex items-end justify-between">
                    <div>
                        <span className="text-sm font-semibold uppercase tracking-widest text-primary">Blog</span>
                        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title || 'Artikel Terbaru'}</h2>
                        {settings.subtitle && <p className="mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                    </div>
                    <Link href="/blog" className="hidden items-center gap-1 text-sm font-semibold text-primary hover:text-primary/90 sm:inline-flex">
                        Lihat Semua <LuArrowRight className="h-4 w-4" />
                    </Link>
                </div>
                <StaggerChildren className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <StaggerItem key={article.id}>
                            <Link href={`/blog/${article.slug}`} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-primary/30 hover:shadow-lg block">
                            {article.thumbnail && <img src={article.thumbnail} alt={article.title} className="mb-5 aspect-video w-full rounded-xl object-cover" loading="lazy" />}
                            <span className="text-xs font-semibold uppercase tracking-wider text-primary">{article.reading_time} menit baca</span>
                            <h3 className="mt-3 text-lg font-semibold text-slate-950 transition group-hover:text-primary/90">{article.title}</h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{article.excerpt}</p>
                        </Link>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Rich Text ─── */
function RichText({ settings }) {
    if (!settings.content_html) {
        return null;
    }

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                {settings.title && (
                    <h2 className="mb-6 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                        {settings.title}
                    </h2>
                )}
                <div
                    className="prose prose-slate prose-headings:tracking-tight prose-a:text-primary prose-img:rounded-xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: settings.content_html }}
                />
            </div>
        </section>
    );
}

/* ─── Pricing ─── */
function Pricing({ settings }) {
    return (
        <section className="bg-slate-50 py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Harga</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                </div>
                <StaggerChildren className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {(settings.items || []).map((plan, i) => (
                        <StaggerItem key={i}>
                            <div className={`relative overflow-hidden rounded-2xl border p-8 transition ${plan.featured ? 'border-primary bg-white shadow-xl shadow-primary/20' : 'border-slate-200 bg-white shadow-sm hover:shadow-md'}`}>
                            {plan.featured && <div className="absolute right-0 top-0 rounded-bl-xl bg-primary px-4 py-1.5 text-xs font-semibold text-white">Populer</div>}
                            <h3 className="text-lg font-semibold text-slate-950">{plan.name}</h3>
                            {plan.description && <p className="mt-1 text-sm text-slate-500">{plan.description}</p>}
                            <p className="mt-6 text-4xl font-extrabold tracking-tight text-slate-950">{plan.price}</p>
                            <ul className="mt-8 space-y-3">
                                {(plan.features || []).map((f, fi) => (
                                    <li key={fi} className="flex items-start gap-3 text-sm text-slate-700">
                                        <LuCheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{f}
                                    </li>
                                ))}
                            </ul>
                            {plan.cta_url && (
                                <a href={plan.cta_url} className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${plan.featured ? 'bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90' : 'border border-slate-300 text-slate-700 hover:border-primary/35 hover:text-primary/90'}`}>
                                    {plan.cta_text || 'Pilih Paket'}
                                </a>
                            )}
                        </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Team ─── */
function Team({ settings, data = {} }) {
    const members = data.members?.length ? data.members : (settings.members || []);
    return (
        <section className="bg-white py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <span className="text-sm font-semibold uppercase tracking-widest text-primary">Tim</span>
                    <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                    {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">{settings.subtitle}</p>}
                </div>
                <StaggerChildren className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {members.map((m, i) => (
                        <StaggerItem key={i}>
                            <div className="group text-center">
                            <div className="relative mx-auto h-32 w-32 overflow-hidden rounded-2xl bg-slate-100">
                                {m.photo ? (
                                    <img src={m.photo} alt={m.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-110" loading="lazy" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-slate-300">{(m.name || '?')[0]}</div>
                                )}
                            </div>
                            <h3 className="mt-5 text-base font-semibold text-slate-950">{m.name}</h3>
                            {m.role && <p className="mt-1 text-sm text-slate-500">{m.role}</p>}
                        </div>
                        </StaggerItem>
                    ))}
                </StaggerChildren>
            </div>
        </section>
    );
}

/* ─── Location ─── */
function Location({ settings }) {
    const { settings: siteSettings = {} } = usePage().props;
    const address = settings.address || siteSettings.address || '';
    const hours = settings.hours || siteSettings.business_hours || '';
    const mapEmbed = normalizeGoogleMapsEmbedUrl(settings.map_embed || siteSettings.google_maps_embed || '');
    const instagramUrl = settings.instagram_url || siteSettings.social_instagram || '';

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
                <div>
                    {settings.eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">{settings.eyebrow}</p>}
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">{settings.title || 'Lokasi Kami'}</h2>
                    {settings.subtitle && <p className="mt-5 max-w-md text-sm leading-7 text-slate-500">{settings.subtitle}</p>}

                    <div className="mt-10 space-y-6">
                        {address && (
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-950">Alamat Lengkap</p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{address}</p>
                                </div>
                            </div>
                        )}
                        {hours && (
                            <div className="flex gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-950">Jam Operasional</p>
                                    <p className="mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{hours}</p>
                                    {settings.hours_note && <p className="mt-1 text-xs text-slate-400">{settings.hours_note}</p>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    {mapEmbed && (
                        <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                            <iframe src={mapEmbed} title="Lokasi" className="h-72 w-full sm:h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                        </div>
                    )}
                    {instagramUrl && (
                        <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-5 py-3.5 text-sm font-semibold text-white transition hover:opacity-90">
                            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                            Lihat Kami di Instagram
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}

/* ─── Google Reviews ─── */
function GoogleReviews({ settings }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!settings.embed_code || !containerRef.current) return;
        containerRef.current.innerHTML = settings.embed_code;
        const scripts = containerRef.current.querySelectorAll('script');
        scripts.forEach((oldScript) => {
            const newScript = document.createElement('script');
            if (oldScript.src) newScript.src = oldScript.src;
            else newScript.textContent = oldScript.textContent;
            newScript.async = true;
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }, [settings.embed_code]);

    return (
        <section className="bg-white py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {settings.title && (
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>
                        {settings.subtitle && <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500">{settings.subtitle}</p>}
                    </div>
                )}
                <div ref={containerRef} />
                {!settings.embed_code && <p className="text-center text-sm text-slate-400">Paste kode embed Trustindex di pengaturan section ini.</p>}
            </div>
        </section>
    );
}

/* ─── Generic ─── */
function Generic({ settings }) {
    return (
        <section className="bg-white py-20">
            <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
                {settings.title && <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{settings.title}</h2>}
                {(settings.subtitle || settings.description) && <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">{settings.subtitle || settings.description}</p>}
            </div>
        </section>
    );
}
