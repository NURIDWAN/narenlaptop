import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import { Copy, ImagePlus, LoaderCircle, Search, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export default function ImageField({ label = 'Gambar', value, onChange, placeholder = '/storage/media/image.jpg' }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [media, setMedia] = useState([]);

    async function upload(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const { data } = await axios.post('/admin/media/upload', formData);
            if (data?.url) onChange(data.url);
        } finally {
            setUploading(false);
            if (inputRef.current) inputRef.current.value = '';
        }
    }

    async function fetchMedia(keyword = '') {
        setLoading(true);
        try {
            const { data } = await axios.get('/admin/media/picker', { params: { search: keyword } });
            setMedia(data?.items || []);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (!open) return;
        fetchMedia(search);
    }, [open, search]);

    function normalizeUrl(rawUrl = '') {
        if (!rawUrl) return '';
        if (rawUrl.startsWith('/')) return rawUrl;

        try {
            const parsed = new URL(rawUrl);
            if (parsed.pathname.startsWith('/storage/')) {
                return `${parsed.pathname}${parsed.search || ''}`;
            }
        } catch {
            // keep original value when URL parsing fails
        }

        return rawUrl;
    }

    function pick(url) {
        onChange(normalizeUrl(url));
        setOpen(false);
    }

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <div className="flex min-h-44 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                {value ? (
                    <img src={normalizeUrl(value)} alt="" className="h-full w-full object-cover" />
                ) : (
                    <span className="text-sm text-muted-foreground">Belum ada gambar</span>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => inputRef.current?.click()}>
                    {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                    {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
                    Pilih dari Media
                </Button>
                {value && (
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => onChange('')}>
                        <Trash2 className="size-4" />
                        Hapus
                    </Button>
                )}
            </div>
            <Input value={value || ''} onChange={(event) => onChange(normalizeUrl(event.target.value))} placeholder={placeholder} />
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={upload} />

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Pilih Gambar dari Media</DialogTitle>
                    </DialogHeader>
                    <div className="relative">
                        <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                        <Input className="pl-9" placeholder="Cari media..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    {loading ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">Memuat media...</div>
                    ) : media.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted-foreground">Media tidak ditemukan.</div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                            {media.map((item) => (
                                <button key={item.id} type="button" onClick={() => pick(item.url)} className="group overflow-hidden rounded-lg border text-left transition hover:border-blue-400">
                                    <img src={item.url} alt={item.alt || item.filename} className="aspect-square w-full object-cover" loading="lazy" />
                                    <div className="flex items-center justify-between p-2">
                                        <span className="truncate text-xs text-muted-foreground">{item.filename}</span>
                                        <span className="text-[10px] font-semibold text-blue-600 opacity-0 transition group-hover:opacity-100">Pilih</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-muted-foreground">Tip: Anda bisa klik ikon <Copy className="inline size-3" /> di Media Library untuk copy URL manual.</p>
                </DialogContent>
            </Dialog>
        </div>
    );
}
