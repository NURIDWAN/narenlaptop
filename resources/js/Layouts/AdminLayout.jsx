import AppLayout from '@/layouts/app-layout';

export default function AdminLayout({ title, children }) {
    return (
        <AppLayout breadcrumbs={[{ title, href: window.location.pathname }]}>
            <div className="admin-form-flat p-4 md:p-6">
                <div className="space-y-6 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 md:p-4">
                    {children}
                </div>
            </div>
        </AppLayout>
    );
}
