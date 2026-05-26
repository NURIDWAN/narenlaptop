import FrontendLayout from '@/Layouts/FrontendLayout';
import SEOHead from '@/Components/SEO/SEOHead';
import SectionRenderer from '@/Components/Sections/SectionRenderer';

export default function Page({ page, sections = [], latestArticles = [], seo, preview = false }) {
    return (
        <FrontendLayout>
            <SEOHead seo={seo} />
            {preview && (
                <div className="bg-amber-100 px-4 py-3 text-center text-sm font-medium text-amber-900">
                    Preview draft: {page.title}
                </div>
            )}
            {sections.map((section) => (
                <SectionRenderer key={section.id || `${section.type}-${section.order}`} section={section} latestArticles={latestArticles} />
            ))}
        </FrontendLayout>
    );
}
