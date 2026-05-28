import { Head, usePage } from '@inertiajs/react';

export default function SEOHead({ seo = {}, schema, breadcrumbs }) {
    const { url, props } = usePage();
    const appUrl = props.ziggy?.url || '';
    const title = seo?.title || 'Fenta Computer';
    const description = seo?.description || 'Service laptop, gadget, dan solusi IT.';
    const canonical = seo?.canonical || `${appUrl}${url}`.replace(/\/$/, '');
    const ogType = seo?.og_type || 'website';
    const ogImage = seo?.og_image || '';

    const breadcrumbSchema = breadcrumbs?.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': breadcrumbs.map((item, i) => ({
            '@type': 'ListItem',
            'position': i + 1,
            'name': item.name,
            'item': item.url,
        })),
    } : null;

    return (
        <Head title={title}>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonical} />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}
            {schema && (
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            )}
            {breadcrumbSchema && (
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            )}
        </Head>
    );
}
