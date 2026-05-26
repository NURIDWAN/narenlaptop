import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import axios from 'axios';
import {
    Bold,
    Code,
    Heading1,
    Heading2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Minus,
    Quote,
    Redo,
    Table as TableIcon,
    Undo,
    Underline as UnderlineIcon,
} from 'lucide-react';

export default function RichTextEditor({
    value = '',
    onChange,
    minHeightClass = 'min-h-80',
    allowHtmlToggle = true,
}) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                link: false,
                underline: false,
            }),
            Underline,
            LinkExtension.configure({ openOnClick: false }),
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: value,
        onUpdate: ({ editor: currentEditor }) => onChange?.(currentEditor.getHTML()),
    });

    async function uploadImage() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file || !editor) return;
            const form = new FormData();
            form.append('file', file);

            try {
                const { data } = await axios.post('/admin/media/upload', form);
                if (data?.url) {
                    editor.chain().focus().setImage({ src: data.url }).run();
                }
            } catch {
                alert('Upload gambar gagal.');
            }
        };
    }

    function promptLink() {
        if (!editor) return;
        const currentHref = editor.getAttributes('link').href || '';
        const url = window.prompt('URL link', currentHref);
        if (url === null) return;
        if (url.trim() === '') {
            editor.chain().focus().unsetLink().run();
            return;
        }
        editor.chain().focus().setLink({ href: url.trim() }).run();
    }

    function promptImageUrl() {
        if (!editor) return;
        const src = window.prompt('URL gambar');
        if (src && src.trim()) {
            editor.chain().focus().setImage({ src: src.trim() }).run();
        }
    }

    if (!editor) return null;

    const actions = [
        { icon: Undo, title: 'Undo', action: () => editor.chain().focus().undo().run() },
        { icon: Redo, title: 'Redo', action: () => editor.chain().focus().redo().run() },
        'sep',
        { icon: Heading1, title: 'Heading 2', active: editor.isActive('heading', { level: 2 }), action: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
        { icon: Heading2, title: 'Heading 3', active: editor.isActive('heading', { level: 3 }), action: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
        'sep',
        { icon: Bold, title: 'Bold', active: editor.isActive('bold'), action: () => editor.chain().focus().toggleBold().run() },
        { icon: Italic, title: 'Italic', active: editor.isActive('italic'), action: () => editor.chain().focus().toggleItalic().run() },
        { icon: UnderlineIcon, title: 'Underline', active: editor.isActive('underline'), action: () => editor.chain().focus().toggleUnderline().run() },
        { icon: Quote, title: 'Blockquote', active: editor.isActive('blockquote'), action: () => editor.chain().focus().toggleBlockquote().run() },
        { icon: Code, title: 'Code Block', active: editor.isActive('codeBlock'), action: () => editor.chain().focus().toggleCodeBlock().run() },
        'sep',
        { icon: List, title: 'Bullet List', active: editor.isActive('bulletList'), action: () => editor.chain().focus().toggleBulletList().run() },
        { icon: ListOrdered, title: 'Ordered List', active: editor.isActive('orderedList'), action: () => editor.chain().focus().toggleOrderedList().run() },
        { icon: Minus, title: 'Horizontal Rule', action: () => editor.chain().focus().setHorizontalRule().run() },
        'sep',
        { icon: LinkIcon, title: 'Link', active: editor.isActive('link'), action: promptLink },
        { icon: ImageIcon, title: 'Upload Gambar', action: uploadImage },
        { icon: ImageIcon, title: 'Insert URL Gambar', action: promptImageUrl },
        'sep',
        { icon: TableIcon, title: 'Insert Table', active: editor.isActive('table'), action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    ];

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
                {actions.map((item, index) => {
                    if (item === 'sep') {
                        return <div key={index} className="mx-1 h-6 w-px bg-slate-200" />;
                    }
                    const Icon = item.icon;
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={item.action}
                            title={item.title}
                            className={`rounded-md border p-1.5 transition ${
                                item.active
                                    ? 'border-blue-300 bg-blue-100 text-blue-700'
                                    : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                        </button>
                    );
                })}
                {allowHtmlToggle && (
                    <>
                        <div className="mx-1 h-6 w-px bg-slate-200" />
                        <button
                            type="button"
                            title="Hapus format"
                            onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
                            className="rounded-md border border-transparent px-2 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                            Reset
                        </button>
                    </>
                )}
            </div>
            <div className={`${minHeightClass} rounded-lg border border-slate-300 bg-white p-4`}>
                <EditorContent editor={editor} className="tiptap" />
            </div>
        </div>
    );
}
