import { Head, Link, usePage } from '@inertiajs/react';
import { LuChevronUp, LuMessageCircle, LuMenu, LuSearch, LuX } from 'react-icons/lu';
import { useState } from 'react';

function useOrganizationSchema(settings) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        'name': settings.site_name || 'Fenta Computer',
        'url': window?.location?.origin || '',
        ...(settings.email && { email: settings.email }),
        ...(settings.whatsapp_number && { telephone: `+${settings.whatsapp_number}` }),
        ...(settings.address && { address: { '@type': 'PostalAddress', 'streetAddress': settings.address } }),
        ...(settings.site_logo && { logo: settings.site_logo }),
    };

    if (settings.business_hours) {
        schema.openingHours = settings.business_hours;
    }

    const sameAs = [settings.social_instagram, settings.social_facebook, settings.social_tiktok, settings.social_youtube].filter(Boolean);
    if (sameAs.length) schema.sameAs = sameAs;

    return schema;
}

export default function FrontendLayout({ children }) {
    const { settings = {}, navigation = {} } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [whatsappOpen, setWhatsappOpen] = useState(false);
    const siteName = settings.site_name || 'Fenta Computer';
    const whatsapp = String(settings.whatsapp_number || '6281234567890').replace(/\D/g, '');
    const whatsappMessage = String(settings.whatsapp_message_default || 'Halo, saya ingin konsultasi.');
    const whatsappUrl = `https://wa.me/${whatsapp}${whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ''}`;
    const headerMenus = navigation.header || [];
    const footerMenus = navigation.footer || [];
    const orgSchema = useOrganizationSchema(settings);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <Head>
                <script type="application/ld+json">{JSON.stringify(orgSchema)}</script>
            </Head>
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#000411]/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="text-lg font-bold tracking-normal text-white lg:text-xl">
                        {settings.site_logo ? <img src={settings.site_logo} alt={siteName} className="h-12 w-auto object-contain sm:h-14" /> : siteName}
                    </Link>
                    <nav className="hidden items-center gap-9 text-sm font-medium text-slate-100 md:flex">
                        {headerMenus.map((item) => (
                            <NavItem key={item.id} item={item} />
                        ))}
                    </nav>
                    <div className="flex items-center text-white">
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-white/10 md:hidden"
                            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
                            onClick={() => setMobileMenuOpen((open) => !open)}
                        >
                            {mobileMenuOpen ? <LuX className="h-5 w-5" /> : <LuMenu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="border-t border-white/10 bg-[#000411] px-4 py-3 md:hidden">
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
                                <LuMessageCircle className="h-4 w-4" />
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
                    {whatsappOpen ? <LuChevronUp className="h-6 w-6" /> : <LuMessageCircle className="h-6 w-6" />}
                </button>
            </div>

            <footer className="border-t border-slate-200 bg-white">
                <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm text-slate-600 sm:px-6 md:grid-cols-4 lg:px-8">
                    <div>
                        <p className="text-base font-bold text-primary">{siteName}</p>
                        <p className="mt-3 max-w-xs text-xs leading-6">{settings.footer_tagline || 'Premium laptop solutions.'}</p>
                        <p className="mt-8 text-xs">© {new Date().getFullYear()} {siteName}</p>
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-slate-950">Explore</p>
                        {footerMenus.length > 0 && (
                            <nav className="space-y-2">
                                {footerMenus.map((item) => (
                                    <a key={item.id} href={item.url} className="block text-xs hover:text-primary/90" target={item.open_in_new_tab ? '_blank' : undefined} rel={item.open_in_new_tab ? 'noopener noreferrer' : undefined}>
                                        {item.label}
                                    </a>
                                ))}
                            </nav>
                        )}
                        {footerMenus.length === 0 && (
                            <>
                                <p className="font-semibold text-slate-950">Kontak</p>
                                <p className="mt-2">{settings.email || 'halo@example.com'}</p>
                            </>
                        )}
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-slate-950">Contact</p>
                        <p className="text-xs">+{whatsapp}</p>
                        <p className="mt-2 text-xs">{settings.email || 'halo@example.com'}</p>
                        <p className="mt-2 text-xs">{settings.address || 'Jl. Teknologi Premium No. 1'}</p>
                    </div>
                    <div>
                        <p className="mb-3 text-xs font-semibold text-slate-950">Location</p>
                        <div className="flex h-28 items-center justify-center rounded-lg bg-slate-100 text-primary">
                            <LuSearch className="h-5 w-5" />
                        </div>
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
            <div className="invisible absolute left-0 top-full z-50 min-w-44 rounded-xl border border-white/10 bg-[#000411] py-2 opacity-0 shadow-2xl shadow-black/30 transition group-hover:visible group-hover:opacity-100">
                {item.children.map((child) => (
                    <a key={child.id} href={child.url} className="block px-4 py-2 text-sm text-slate-100 transition hover:bg-white/5 hover:text-accent" target={child.open_in_new_tab ? '_blank' : undefined}>
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
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-100 transition hover:bg-white/5 hover:text-accent"
                onClick={onNavigate}
                {...props}
            >
                {item.label}
                {item.badge && <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-accent">{item.badge}</span>}
            </a>
        );
    }

    return (
        <details className="rounded-lg border border-white/10 bg-white/5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-medium text-slate-100">
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
                        className="flex min-h-10 items-center rounded-md px-3 text-sm text-slate-100 transition hover:bg-white/5 hover:text-accent"
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
