import { router, useForm } from '@inertiajs/react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AdminLayout from '@/Layouts/AdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LuChevronDown, LuExternalLink, LuGlobe, LuGripVertical, LuLink2, LuPenLine, LuPlus, LuTrash2 } from 'react-icons/lu';
import { useEffect, useState } from 'react';

export default function Index({ headerMenus, footerMenus, pages = [] }) {
    return (
        <AdminLayout title="Navigasi">
            <div className="mx-auto max-w-3xl space-y-6">
                <MenuSection title="Header Menu" location="header" items={headerMenus} pages={pages} />
                <MenuSection title="Footer Menu" location="footer" items={footerMenus} pages={pages} />
            </div>
        </AdminLayout>
    );
}

function MenuSection({ title, location, items, pages }) {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [orderedItems, setOrderedItems] = useState(items);
    const ids = orderedItems.map(item => String(item.id));

    function handleDelete(id) {
        if (!confirm('Hapus menu ini?')) return;
        router.delete(`/admin/navigation/${id}`, { preserveScroll: true });
    }

    function onDragEnd(event) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = orderedItems.findIndex(i => String(i.id) === active.id);
        const newIndex = orderedItems.findIndex(i => String(i.id) === over.id);
        const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
        setOrderedItems(newOrder);
        router.post('/admin/navigation/reorder', { items: newOrder.map(i => i.id) }, { preserveScroll: true });
    }

    // Sync when props change
    if (JSON.stringify(items.map(i => i.id)) !== JSON.stringify(orderedItems.map(i => i.id))) {
        setOrderedItems(items);
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between">
                <CardTitle className="text-base">{title}</CardTitle>
                <Button size="sm" onClick={() => setOpen(true)}>
                    <LuPlus className="size-4" /> Tambah
                </Button>
            </CardHeader>
            <CardContent className="space-y-2">
                {orderedItems.length === 0 && (
                    <p className="text-muted-foreground py-4 text-center text-sm">Belum ada menu.</p>
                )}

                <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                        {orderedItems.map((item) => (
                            <div key={item.id}>
                                <SortableMenuItem item={item} onDelete={handleDelete} onEdit={setEditing} />
                                {(item.children || []).map((child) => (
                                    <div key={child.id} className="ml-8 mt-1">
                                        <MenuItem item={child} onDelete={handleDelete} onEdit={setEditing} isChild />
                                    </div>
                                ))}
                            </div>
                        ))}
                    </SortableContext>
                </DndContext>
            </CardContent>

            <MenuDialog open={open} onOpenChange={setOpen} location={location} pages={pages} />
            <MenuDialog open={!!editing} onOpenChange={(nextOpen) => !nextOpen && setEditing(null)} location={location} pages={pages} data={editing} />
        </Card>
    );
}

function SortableMenuItem({ item, onDelete, onEdit }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: String(item.id) });
    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center justify-between rounded-lg border bg-background px-4 py-2.5">
            <div className="flex items-center gap-3">
                <button type="button" {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                    <LuGripVertical className="size-4" />
                </button>
                <MenuLabel item={item} />
            </div>
            <div className="flex items-center gap-1">
                {item.open_in_new_tab && <LuExternalLink className="text-muted-foreground size-3.5" />}
                <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(item)}>
                    <LuPenLine className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => onDelete(item.id)}>
                    <LuTrash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

function MenuItem({ item, onDelete, onEdit, isChild }) {
    return (
        <div className="flex items-center justify-between rounded-lg border bg-background px-4 py-2.5">
            <div className="flex items-center gap-3">
                <div className="w-4" />
                <MenuLabel item={item} />
            </div>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="size-7" onClick={() => onEdit(item)}>
                    <LuPenLine className="size-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="size-7 text-destructive" onClick={() => onDelete(item.id)}>
                    <LuTrash2 className="size-3.5" />
                </Button>
            </div>
        </div>
    );
}

function MenuLabel({ item }) {
    const isExternal = item.url?.startsWith('http');
    const isDropdown = (item.children?.length > 0 || item.url === '#');
    return (
        <div>
            <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{item.label}</span>
                {item.badge && <Badge variant="secondary" className="text-[10px]">{item.badge}</Badge>}
                {isDropdown && <Badge variant="outline" className="text-[10px] gap-0.5"><LuChevronDown className="size-2.5" />Dropdown</Badge>}
                {isExternal && <Badge variant="outline" className="text-[10px] gap-0.5"><LuGlobe className="size-2.5" />External</Badge>}
            </div>
            <p className="text-muted-foreground text-xs">{item.url === '#' ? `${item.children?.length || 0} sub-menu` : item.url}</p>
        </div>
    );
}

function MenuDialog({ open, onOpenChange, location, pages, data = null }) {
    const isEdit = Boolean(data);
    const [linkType, setLinkType] = useState(typeFromMenu(data));
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const form = useForm({ location, label: '', url: '', open_in_new_tab: false, badge: '', children: [] });

    useEffect(() => {
        if (!open) return;

        const type = typeFromMenu(data);
        setLinkType(type);
        setErrors({});
        setProcessing(false);
        form.setData({
            location,
            label: data?.label || '',
            url: data?.url || '',
            open_in_new_tab: data?.open_in_new_tab ?? false,
            badge: data?.badge || '',
            children: (data?.children || []).map((child) => ({
                id: child.id,
                label: child.label,
                url: child.url,
            })),
        });
    }, [open, data?.id, location]);

    function selectPage(slug) {
        const url = slug === 'beranda' ? '/' : `/${slug}`;
        const page = pages.find(p => p.slug === slug);
        form.setData({ ...form.data, url, label: form.data.label || page?.title || '' });
    }

    function addChild(slug) {
        if (!slug) return;
        const page = pages.find(p => p.slug === slug);
        if (!page) return;
        const url = slug === 'beranda' ? '/' : `/${slug}`;
        if (form.data.children.find(c => c.url === url)) return;
        form.setData('children', [...form.data.children, { label: page.title, url }]);
    }

    function removeChild(index) {
        form.setData('children', form.data.children.filter((_, i) => i !== index));
    }

    function reset() {
        form.reset();
        setErrors({});
        setProcessing(false);
        setLinkType('page');
    }

    function submit(e) {
        e.preventDefault();
        const payload = {
            ...form.data,
            location,
            children: linkType === 'dropdown' ? form.data.children : [],
            open_in_new_tab: linkType !== 'dropdown' ? form.data.open_in_new_tab : false,
        };

        if (linkType === 'dropdown') {
            payload.url = '#';
        }

        setProcessing(true);
        setErrors({});

        router.post(isEdit ? `/admin/navigation/${data.id}` : '/admin/navigation', {
            ...payload,
            ...(isEdit ? { _method: 'put' } : {}),
        }, {
            preserveScroll: true,
            onSuccess: () => { reset(); onOpenChange(false); },
            onError: setErrors,
            onFinish: () => setProcessing(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEdit ? 'Edit Menu' : 'Tambah Menu'}</DialogTitle>
                    <DialogDescription>Pilih tipe menu lalu isi detail.</DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    {/* Type */}
                    <div className="flex gap-1">
                        <TypeBtn active={linkType === 'page'} onClick={() => setLinkType('page')} icon={LuLink2} label="Halaman" />
                        <TypeBtn active={linkType === 'external'} onClick={() => setLinkType('external')} icon={LuGlobe} label="External" />
                        <TypeBtn active={linkType === 'dropdown'} onClick={() => setLinkType('dropdown')} icon={LuChevronDown} label="Dropdown" />
                    </div>

                    {/* Page */}
                    {linkType === 'page' && (
                        <div className="space-y-2">
                            <Label>Halaman</Label>
                            <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={pages.find(p => (p.slug === 'beranda' ? '/' : `/${p.slug}`) === form.data.url)?.slug || ''} onChange={e => selectPage(e.target.value)}>
                                <option value="">— Pilih halaman —</option>
                                {pages.map(p => <option key={p.id} value={p.slug}>{p.title} ({p.slug === 'beranda' ? '/' : `/${p.slug}`})</option>)}
                            </select>
                            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
                        </div>
                    )}

                    {/* External */}
                    {linkType === 'external' && (
                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input value={form.data.url} onChange={e => form.setData('url', e.target.value)} placeholder="https://..." required />
                            {errors.url && <p className="text-xs text-destructive">{errors.url}</p>}
                        </div>
                    )}

                    {/* Dropdown children */}
                    {linkType === 'dropdown' && (
                        <div className="space-y-3">
                            <div className="space-y-2">
                                <Label>Isi Dropdown</Label>
                                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value="" onChange={e => addChild(e.target.value)}>
                                    <option value="">+ Tambah halaman...</option>
                                    {pages.filter(p => !form.data.children.find(c => c.url === (p.slug === 'beranda' ? '/' : `/${p.slug}`))).map(p => (
                                        <option key={p.id} value={p.slug}>{p.title}</option>
                                    ))}
                                </select>
                            </div>
                            {form.data.children.length > 0 && (
                                <div className="space-y-1 rounded-md border p-2">
                                    {form.data.children.map((child, i) => (
                                        <div key={i} className="flex items-center justify-between rounded px-3 py-1.5 hover:bg-muted/50">
                                            <span className="text-sm">{child.label} <span className="text-muted-foreground text-xs">{child.url}</span></span>
                                            <Button type="button" variant="ghost" size="icon" className="size-6 text-destructive" onClick={() => removeChild(i)}><LuTrash2 className="size-3" /></Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {form.data.children.length === 0 && <p className="text-xs text-muted-foreground">Tambahkan halaman yang muncul saat dropdown dibuka.</p>}
                            {errors.children && <p className="text-xs text-destructive">{errors.children}</p>}
                        </div>
                    )}

                    {/* Label & Badge */}
                    <div className="grid gap-3 grid-cols-2">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input value={form.data.label} onChange={e => form.setData('label', e.target.value)} placeholder={linkType === 'dropdown' ? 'Nama dropdown' : 'Label menu'} required />
                            {errors.label && <p className="text-xs text-destructive">{errors.label}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Badge</Label>
                            <Input value={form.data.badge} onChange={e => form.setData('badge', e.target.value)} placeholder="Opsional" />
                        </div>
                    </div>

                    {linkType !== 'dropdown' && (
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={form.data.open_in_new_tab} onChange={e => form.setData('open_in_new_tab', e.target.checked)} />
                            Buka di tab baru
                        </label>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Batal</Button>
                        <Button type="submit" disabled={processing || (linkType === 'dropdown' && form.data.children.length === 0)}>{isEdit ? 'Simpan' : 'Tambah'}</Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function typeFromMenu(item) {
    if (!item) return 'page';
    if ((item.children || []).length > 0 || item.url === '#') return 'dropdown';
    if (item.url?.startsWith('http')) return 'external';
    return 'page';
}

function TypeBtn({ active, onClick, icon: Icon, label }) {
    return (
        <button type="button" onClick={onClick} className={"inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition " + (active ? 'bg-primary text-primary-foreground shadow-sm' : 'border text-muted-foreground hover:bg-muted')}>
            <Icon className="size-3" /> {label}
        </button>
    );
}
