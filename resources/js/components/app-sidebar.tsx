import { Link } from '@inertiajs/react';
import { LuBookOpen, LuFileText, LuFolderGit2, LuImage, LuInbox, LuLayoutGrid, LuMenu, LuNewspaper, LuSettings, LuShoppingBag, LuStar, LuTag, LuUsers, LuWrench } from 'react-icons/lu';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavGroups: { title: string; items: NavItem[] }[] = [
    {
        title: 'Overview',
        items: [
            { title: 'Dashboard', href: '/dashboard', icon: LuLayoutGrid },
        ],
    },
    {
        title: 'Konten',
        items: [
            { title: 'Halaman', href: '/admin/pages', icon: LuFileText },
            { title: 'Slider', href: '/admin/sliders', icon: LuImage },
            { title: 'Artikel', href: '/admin/articles', icon: LuNewspaper },
            { title: 'Kategori Artikel', href: '/admin/article-categories', icon: LuTag },
            { title: 'Layanan', href: '/admin/services', icon: LuWrench },
            { title: 'Kategori Produk', href: '/admin/product-categories', icon: LuTag },
            { title: 'Produk', href: '/admin/products', icon: LuShoppingBag },
            { title: 'Testimoni', href: '/admin/testimonials', icon: LuStar },
            { title: 'Tim', href: '/admin/team', icon: LuUsers },
            { title: 'Media', href: '/admin/media', icon: LuImage },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { title: 'Pesan', href: '/admin/messages', icon: LuInbox },
        ],
    },
    {
        title: 'Sistem',
        items: [
            { title: 'Navigasi', href: '/admin/navigation', icon: LuMenu },
            { title: 'Pengaturan', href: '/admin/settings', icon: LuSettings },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: LuFolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: LuBookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={mainNavGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
