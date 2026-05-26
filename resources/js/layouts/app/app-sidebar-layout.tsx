import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden bg-slate-100/80">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                <div className="min-h-[calc(100svh-4rem)] bg-gradient-to-b from-slate-100/70 to-slate-200/50">
                    {children}
                </div>
            </AppContent>
        </AppShell>
    );
}
