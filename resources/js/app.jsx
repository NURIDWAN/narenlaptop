import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { Toaster, toast } from 'react-hot-toast';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Naren Laptop';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        function Root() {
            const flash = props.initialPage.props.flash || {};

            useEffect(() => {
                if (flash.success) toast.success(flash.success);
                if (flash.error) toast.error(flash.error);
            }, [flash.success, flash.error]);

            return (
                <>
                    <App {...props} />
                    <Toaster position="top-right" />
                </>
            );
        }

        root.render(<Root />);
    },
    progress: {
        color: '#4B5563',
    },
});
