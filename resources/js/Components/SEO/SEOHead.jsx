import { Head, usePage } from '@inertiajs/react';

export default function SEOHead({ seo = {}, schema, breadcrumbs }) {
    const { url, props } = usePage();
    const appUrl = props.ziggy?.url || '';
    const siteName = props.settings?.site_name || 'Naren Laptop';
    const title = seo?.title || siteName;
    const description = seo?.description || 'Service laptop, gadget, dan solusi IT terpercaya.';
    const canonical = seo?.canonical || `${appUrl}${url}`.replace(/\/$/, '');
    const ogType = seo?.og_type || 'website';
    const ogImage = seo?.og_image || '';
    const keywords = seo?.keywords || '';
    const robots = seo?.robots || 'index, follow';
    const publishedTime = seo?.published_time || '';
    const modifiedTime = seo?.modified_time || '';
    const author = seo?.author || '';

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
            <meta name="robots" content={robots} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={canonical} />

            {/* Open Graph */}
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="id_ID" />
            <meta property="og:url" content={canonical} />
            <meta property="og:type" content={ogType} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            {ogImage && <meta property="og:image" content={ogImage} />}
            {ogImage && <meta property="og:image:alt" content={title} />}

            {/* Article-specific OG */}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
            {author && <meta property="article:author" content={author} />}

            {/* Twitter Card */}
            <meta name="twitter:card" content={ogImage ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {ogImage && <meta name="twitter:image" content={ogImage} />}

            {/* Structured Data */}
            {schema && (
                <script type="application/ld+json">{JSON.stringify(schema)}</script>
            )}
            {breadcrumbSchema && (
                <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
            )}
        </Head>
    );
}
