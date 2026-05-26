import { Head } from '@inertiajs/react';

export default function SEOHead({ seo = {}, schema }) {
    const title = seo?.title || 'Fenta Computer';
    const description = seo?.description || 'Service laptop, gadget, dan solusi IT.';

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            {seo?.og_image && <meta property="og:image" content={seo.og_image} />}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {schema && (
                <script type="application/ld+json">
                    {JSON.stringify(schema)}
                </script>
            )}
        </Head>
    );
}
