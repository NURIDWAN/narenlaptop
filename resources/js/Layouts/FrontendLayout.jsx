import { Link, usePage } from '@inertiajs/react';
import { Menu, Search, X } from 'lucide-react';
import { useState } from 'react';

export default function FrontendLayout({ children }) {
    const { settings = {}, navigation = {} } = usePage().props;
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const siteName = settings.site_name || 'Fenta Computer';
    const whatsapp = settings.whatsapp_number || '6281234567890';
    const headerMenus = navigation.header || [];
    const footerMenus = navigation.footer || [];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-950">
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="text-lg font-bold tracking-normal text-primary lg:text-xl">
                        {settings.site_logo ? <img src={settings.site_logo} alt={siteName} className="h-12 w-auto object-contain sm:h-14" /> : siteName}
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
                            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </button>
                    </div>
                </div>
                {mobileMenuOpen && (
                    <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
                        <nav className="space-y-1">
                            {headerMenus.map((item) => (
                                <MobileNavItem key={item.id} item={item} onNavigate={() => setMobileMenuOpen(false)} />
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            <main>{children}</main>

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
                            <Search className="h-5 w-5" />
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
            <a href={item.url} className="transition hover:text-primary/90" {...props}>
                {item.label}
                {item.badge && <span className="ml-1 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-primary/90">{item.badge}</span>}
            </a>
        );
    }

    return (
        <div className="group relative">
            <a href={item.url} className="transition hover:text-primary/90" {...props}>
                {item.label}
                {item.badge && <span className="ml-1 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-primary/90">{item.badge}</span>}
            </a>
            <div className="invisible absolute left-0 top-full z-50 min-w-40 rounded-lg border border-slate-200 bg-white py-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                {item.children.map((child) => (
                    <a key={child.id} href={child.url} className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary/90" target={child.open_in_new_tab ? '_blank' : undefined}>
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
                className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-primary"
                onClick={onNavigate}
                {...props}
            >
                {item.label}
                {item.badge && <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-primary/90">{item.badge}</span>}
            </a>
        );
    }

    return (
        <details className="rounded-lg border border-slate-200 bg-slate-50/70">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-medium text-slate-700">
                <span>
                    {item.label}
                    {item.badge && <span className="ml-2 rounded bg-accent/30 px-1.5 py-0.5 text-[10px] font-semibold text-primary/90">{item.badge}</span>}
                </span>
                <span className="text-xs text-slate-400">▼</span>
            </summary>
            <div className="space-y-1 px-2 pb-2">
                {item.children.map((child) => (
                    <a
                        key={child.id}
                        href={child.url}
                        className="flex min-h-10 items-center rounded-md px-3 text-sm text-slate-600 transition hover:bg-white hover:text-primary"
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
