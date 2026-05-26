import '../css/app.css';
import './bootstrap';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            [`./Pages/${name}.tsx`, `./Pages/${name}.jsx`],
            import.meta.glob('./Pages/**/*.{tsx,jsx}'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        function Root() {
            const showMessages = (pageProps?: Record<string, unknown>) => {
                const flash = (pageProps?.flash ?? {}) as
                    | { success?: string; error?: string }
                    | undefined;
                const errors = (pageProps?.errors ?? {}) as Record<
                    string,
                    string
                >;

                if (flash?.success) toast.success(flash.success);
                if (flash?.error) toast.error(flash.error);

                const firstError = Object.values(errors).find(Boolean);
                if (firstError) toast.error(firstError);
            };

            useEffect(() => {
                showMessages(props.initialPage.props as Record<string, unknown>);

                const removeSuccessListener = router.on('success', (event) => {
                    showMessages(
                        event.detail.page.props as Record<string, unknown>,
                    );
                });

                return () => {
                    removeSuccessListener();
                };
            }, []);

            return (
                <TooltipProvider delayDuration={0}>
                    <App {...props} />
                    <Toaster />
                </TooltipProvider>
            );
        }

        root.render(<Root />);
    },
    progress: {
        color: '#4B5563',
    },
});
