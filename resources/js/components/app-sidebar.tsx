import { Link } from '@inertiajs/react';
import { BookOpen, FileText, FolderGit2, Image, Images, Inbox, LayoutGrid, Menu, Newspaper, Settings, ShoppingBag, Star, Users, Wrench } from 'lucide-react';
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
            { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
        ],
    },
    {
        title: 'Konten',
        items: [
            { title: 'Halaman', href: '/admin/pages', icon: FileText },
            { title: 'Artikel', href: '/admin/articles', icon: Newspaper },
            { title: 'Slider', href: '/admin/sliders', icon: Images },
            { title: 'Produk', href: '/admin/products', icon: ShoppingBag },
            { title: 'Testimoni', href: '/admin/testimonials', icon: Star },
            { title: 'Tim', href: '/admin/team', icon: Users },
            { title: 'Media', href: '/admin/media', icon: Image },
        ],
    },
    {
        title: 'Operasional',
        items: [
            { title: 'Pesan', href: '/admin/messages', icon: Inbox },
        ],
    },
    {
        title: 'Sistem',
        items: [
            { title: 'Navigasi', href: '/admin/navigation', icon: Menu },
            { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
        ],
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: FolderGit2,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
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
