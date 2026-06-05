import { Head, Link, usePage } from '@inertiajs/react';
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp, FaYoutube } from 'react-icons/fa';
import { LuChevronUp, LuMenu, LuSearch, LuX } from 'react-icons/lu';
import { SiShopee } from 'react-icons/si';
import { useState } from 'react';

function useOrganizationSchema(settings) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': settings.site_name || 'Naren Laptop',
        'url': window?.location?.origin || '',
        ...(settings.email && { email: settings.email }),
        ...(settings.whatsapp_number && { telephone: `+${settings.whatsapp_number}` }),
        ...(settings.address && { address: { '@type': 'PostalAddress', 'streetAddress': settings.address } }),
        ...(settings.site_logo && { logo: settings.site_logo }),
    };

    if (settings.business_hours) {
        schema.openingHours = settings.business_hours;
    }

    const sameAs = [settings.social_instagram, settings.social_facebook, settings.social_tiktok, settings.social_youtube, settings.social_shopee].filter(Boolean);
    if (sameAs.length) schema.sameAs = sameAs;

    return schema;
}

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

export default function FrontendLayout({ children }) {
    const { settings = {}, navigation = {} } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [whatsappOpen, setWhatsappOpen] = useState(false);
    const siteName = settings.site_name || 'Naren Laptop';
    const whatsapp = String(settings.whatsapp_number || '6281234567890').replace(/\D/g, '');
    const whatsappMessage = String(settings.whatsapp_message_default || 'Halo, saya ingin konsultasi.');
    const whatsappUrl = `https://wa.me/${whatsapp}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`;
    const headerMenus = navigation.header || [];
    const footerMenus = navigation.footer || [];
    const orgSchema = useOrganizationSchema(settings);
    const mapEmbedUrl = normalizeGoogleMapsEmbedUrl(settings.google_maps_embed);
    const socialLinks = [
        { key: 'instagram', label: 'Instagram', url: settings.social_instagram, icon: FaInstagram },
        { key: 'facebook', label: 'Facebook', url: settings.social_facebook, icon: FaFacebookF },
        { key: 'tiktok', label: 'TikTok', url: settings.social_tiktok, icon: FaTiktok },
        { key: 'youtube', label: 'YouTube', url: settings.social_youtube, icon: FaYoutube },
        { key: 'shopee', label: 'Shopee', url: settings.social_shopee, icon: SiShopee },
    ].filter((item) => item.url);

    const navbarColor = settings.navbar_color || '#061329';

    const rootStyle = {
        '--primary': settings.primary_color || '#061329',
        '--accent': settings.section_accent_color || '#BE974E',
        '--ring': settings.section_accent_color || '#BE974E',
        '--navbar-color': navbarColor,
        '--section-bg-light': settings.section_bg_light || '#f8f5ec',
        '--section-bg-dark': settings.section_bg_dark || '#061329',
        '--section-text-light': settings.section_text_light || '#1f2937',
        '--section-text-dark': settings.section_text_dark || '#f1f5f9',
        '--section-accent': settings.section_accent_color || '#BE974E',
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950" style={rootStyle}>
            <Head>
                <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
            </Head>
            <header className="sticky top-0 z-40 border-b border-primary/10 bg-white/90 shadow-sm shadow-slate-200/50 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-3 text-lg font-bold tracking-normal text-primary lg:text-xl">
                        {settings.site_logo && (settings.logo_display_mode || 'logo_text') !== 'text_only' && (
                            <img src={settings.site_logo} alt={siteName} className="h-10 w-10 rounded-lg object-cover sm:h-12 sm:w-12" />
                        )}
                        {(settings.logo_display_mode || 'logo_text') !== 'logo_only' && (
                            <span>{siteName}</span>
                        )}
                        {!settings.site_logo && (settings.logo_display_mode || 'logo_text') === 'logo_only' && (
                            <span>{siteName}</span>
                        )}
                    </Link>
                    <nav className="hidden items-center gap-9 text-sm font-medium text-slate-700 md:flex">
                        {headerMenus.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>
                    <div className="flex items-center text-primary">
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-primary/5 md:hidden"
                            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                        >
                            {mobileMenuOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="border-t border-primary/10 bg-white px-4 py-3 shadow-lg shadow-slate-200/50 md:hidden">
                        <nav className="space-y-1">
                            {headerMenus.map((item) => (
                                <MobileNavItem key={item.id} item={item} onNavigate={() => setMobileMenuOpen(false)} />
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main>{children}</main>

            <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
                {whatsappOpen && (
                    <div className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40 sm:w-96">
                        <div className="flex items-start justify-between gap-4 bg-primary px-4 py-3 text-white">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent/90">WhatsApp</p>
                                <p className="mt-1 text-sm font-semibold">{siteName}</p>
                            </div>
                            <button
                                type="button"
                                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:bg-white/10"
                                aria-label="Tutup pop up WhatsApp"
                                onClick={() => setWhatsappOpen(false)}
                            >
                                <LuX className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="space-y-3 p-4">
                            <p className="text-sm leading-6 text-slate-600">
                                {settings.whatsapp_popup_text || 'Ada pertanyaan? Kirim pesan lewat WhatsApp dan tim kami akan merespons secepatnya.'}
                            </p>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-white transition hover:brightness-95"
                            >
                                <FaWhatsapp className="h-4 w-4" />
                                Chat Sekarang
                            </a>
                        </div>
                    </div>
                )}
                <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl shadow-emerald-600/30 transition hover:scale-105"
                    aria-label={whatsappOpen ? 'Tutup pop up WhatsApp' : 'Buka pop up WhatsApp'}
                    onClick={() => setWhatsappOpen((open) => !open)}
                >
                    {whatsappOpen ? <LuChevronUp className="h-6 w-6" /> : <FaWhatsapp className="h-7 w-7" />}
                </button>
            </div>

            <footer className="border-t border-white/10 text-slate-300" style={{ backgroundColor: navbarColor }}>
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm sm:px-6 md:grid-cols-4 lg:px-8">
                    <div>
                        <p className="text-base font-bold text-white">{siteName}</p>
                        <p className="mt-3 max-w-xs text-xs leading-6 text-slate-400">{settings.footer_tagline || 'Premium laptop solutions.'}</p>
                        {socialLinks.length > 0 && (
                            <div className="mt-5 flex flex-wrap gap-2">
                                {socialLinks.map((item) => {
                                    const Icon = item.icon;

                                    return (
                                        <a
                                            key={item.key}
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={item.label}
                                            title={item.label}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-accent hover:bg-accent hover:text-white"
                                        >
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                        <p className="mt-8 text-xs text-slate-500">© {new Date().getFullYear()} {siteName}</p>
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-white">Explore</p>
                        {footerMenus.length > 0 && (
                            <nav className="space-y-2">
                                {footerMenus.map((item) => (
                                    <a key={item.id} href={item.url} className="block text-xs text-slate-400 transition hover:text-accent" target={item.open_in_new_tab ? '_blank' : undefined} rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}>
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        )}
                        {footerMenus.length === 0 && (
                            <>
                                <p className="font-semibold text-white">Kontak</p>
                                <p className="mt-2 text-slate-400">{settings.email || 'halo@example.com'}</p>
                            </>
                        )}
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-white">Contact</p>
                        <p className="text-xs text-slate-400">+{whatsapp}</p>
                        <p className="mt-2 text-xs text-slate-400">{settings.email || 'halo@example.com'}</p>
                        <p className="mt-2 text-xs leading-5 text-slate-400">{settings.address || 'Jl. Teknologi Premium No. 1'}</p>
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-white">Location</p>
                        {mapEmbedUrl ? (
                            <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
                                <iframe
                                    src={mapEmbedUrl}
                                    title="Lokasi"
                                    className="h-32 w-full"
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                />
                            </div>
                        ) : (
                            <div className="flex h-28 items-center justify-center rounded-lg bg-white/5 text-accent">
                                <LuSearch className="h-5 w-5" />
                            </div>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavItem({ item }) {
    const hasChildren = item.children && item.children.length > 0;
    const props = item.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    if (!hasChildren) {
        return (
            <a href={item.url} className="transition hover:text-accent" {...props}>
                {item.label}
                {item.badge && <span className="ml-1 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{item.badge}</span>}
            </a>
        );
    }

    return (
        <div className="group relative">
            <a href={item.url} className="transition hover:text-accent" {...props}>
                {item.label}
                {item.badge && <span className="ml-1 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{item.badge}</span>}
            </a>
            <div className="invisible absolute left-0 top-full z-50 min-w-44 rounded-xl border border-primary/10 bg-white py-2 opacity-0 shadow-2xl shadow-slate-300/40 transition group-hover:visible group-hover:opacity-100">
                {item.children.map((child) => (
                    <a key={child.id} href={child.url} className="block px-4 py-2 text-sm text-slate-700 transition hover:bg-accent/10 hover:text-primary" target={child.open_in_new_tab ? '_blank' : undefined}>
                        {child.label}
                    </a>
                ))}
            </div>
        </div>
    );
}

function MobileNavItem({ item, onNavigate }) {
    const hasChildren = item.children && item.children.length > 0;
    const props = item.open_in_new_tab ? { target: '_blank', rel: 'noopener noreferrer' } : {};

    if (!hasChildren) {
        return (
            <a
                href={item.url}
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 transition hover:bg-accent/10 hover:text-primary"
                onClick={onNavigate}
                {...props}
            >
                {item.label}
                {item.badge && <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{item.badge}</span>}
            </a>
        );
    }

    return (
        <details className="rounded-lg border border-primary/10 bg-white">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-medium text-slate-700">
                <span>
                    {item.label}
                    {item.badge && <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{item.badge}</span>}
                </span>
                <span className="text-xs text-slate-400">▼</span>
            </summary>
            <div className="space-y-1 px-2 pb-2">
                {item.children.map((child) => (
                    <a
                        key={child.id}
                        href={child.url}
                        className="flex min-h-10 items-center rounded-md px-3 text-sm text-slate-700 transition hover:bg-accent/10 hover:text-primary"
                        target={child.open_in_new_tab ? '_blank' : undefined}
                        onClick={onNavigate}
                    >
                        {child.label}
                    </a>
                ))}
            </div>
        </details>
    );
}
