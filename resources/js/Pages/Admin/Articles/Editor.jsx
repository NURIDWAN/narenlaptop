import { router } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import RichTextEditor from '@/Components/Editor/RichTextEditor';
import { LuSave } from 'react-icons/lu';
import { useState } from 'react';

export default function ArticleEditor({ article, categories = [] }) {
    const controlClass = 'mt-1 w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100';

    const [form, setForm] = useState({
        title: article.title || '',
        slug: article.slug || '',
        excerpt: article.excerpt || '',
        content: article.content || '',
        thumbnail: article.thumbnail || '',
        thumbnail_file: null,
        category_id: article.category_id || '',
        status: article.status || 'draft',
        published_at: article.published_at || '',
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        meta_keywords: (article.meta_keywords || []).join(', '),
        og_image: article.og_image || '',
        schema_type: article.schema_type || 'Article',
    });
    const [saving, setSaving] = useState(false);

    function save(event) {
        event.preventDefault();
        setSaving(true);
        const payload = {
            ...form,
            category_id: form.category_id || null,
            meta_keywords: form.meta_keywords.split(',').map((keyword) => keyword.trim()).filter(Boolean),
        };
        const options = { onFinish: () => setSaving(false), preserveScroll: true };
        article.id
            ? router.post(`/admin/articles/${article.id}`, { ...payload, _method: 'put' }, { ...options, forceFormData: true })
            : router.post('/admin/articles', payload, { ...options, forceFormData: true });
    }

    return (
        <AdminLayout title={article.id ? `Edit: ${article.title}` : 'Buat Artikel'}>
            <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_360px]">
                <section className="space-y-5">
                    <Panel title="Konten Artikel">
                        <Field label="Judul" value={form.title} onChange={(value) => setForm({ ...form, title: value })} required />
                        <Field label="Slug" value={form.slug} onChange={(value) => setForm({ ...form, slug: value })} placeholder="otomatis-dari-judul" />
                        <RichTextEditor value={form.content} onChange={(value) => setForm({ ...form, content: value })} />
                        <Textarea label="Excerpt" value={form.excerpt} onChange={(value) => setForm({ ...form, excerpt: value })} />
                    </Panel>
                </section>
                <aside className="space-y-5">
                    <Panel title="Publikasi">
                        <label className="block text-sm font-medium text-slate-700">
                            Kategori
                            <select className={controlClass} value={form.category_id} onChange={(event) => setForm({ ...form, category_id: event.target.value })}>
                                <option value="">Tanpa kategori</option>
                                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                            </select>
                        </label>
                        <label className="block text-sm font-medium text-slate-700">
                            Status
                            <select className={controlClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="scheduled">Scheduled</option>
                            </select>
                        </label>
                        <Field label="Thumbnail URL (opsional)" value={form.thumbnail} onChange={(value) => setForm({ ...form, thumbnail: value })} />
                        <label className="block text-sm font-medium text-slate-700">
                            Upload Thumbnail
                            <input
                                type="file"
                                accept="image/*"
                                className={controlClass}
                                onChange={(event) => setForm({ ...form, thumbnail_file: event.target.files?.[0] || null })}
                            />
                        </label>
                        {(form.thumbnail_file || form.thumbnail) && (
                            <div className="overflow-hidden rounded-lg border border-slate-200">
                                <img
                                    src={form.thumbnail_file ? URL.createObjectURL(form.thumbnail_file) : form.thumbnail}
                                    alt="Preview thumbnail"
                                    className="aspect-video w-full object-cover"
                                />
                            </div>
                        )}
                    </Panel>
                    <Panel title="SEO Otomatis">
                        <Field label="Meta title" value={form.meta_title} onChange={(value) => setForm({ ...form, meta_title: value })} />
                        <Textarea label="Meta description" value={form.meta_description} onChange={(value) => setForm({ ...form, meta_description: value })} rows={3} />
                        <Field label="Keywords" value={form.meta_keywords} onChange={(value) => setForm({ ...form, meta_keywords: value })} placeholder="keyword 1, keyword 2" />
                        <Field label="OG image URL" value={form.og_image} onChange={(value) => setForm({ ...form, og_image: value })} />
                        <label className="block text-sm font-medium text-slate-700">
                            Schema
                            <select className={controlClass} value={form.schema_type} onChange={(event) => setForm({ ...form, schema_type: event.target.value })}>
                                <option value="Article">Article</option>
                                <option value="HowTo">HowTo</option>
                                <option value="FAQPage">FAQPage</option>
                            </select>
                        </label>
                    </Panel>
                    <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                        <LuSave className="h-4 w-4" />
                        {saving ? 'Menyimpan...' : 'Simpan Artikel'}
                    </button>
                </aside>
            </form>
        </AdminLayout>
    );
}

function Panel({ title, children }) {
    return (
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-950">{title}</h2>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

function Field({ label, value, onChange, ...props }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <input
                {...props}
                className="mt-1 w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}

function Textarea({ label, value, onChange, rows = 4 }) {
    return (
        <label className="block text-sm font-medium text-slate-700">
            {label}
            <textarea
                rows={rows}
                className="mt-1 w-full rounded-lg border-0 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}
