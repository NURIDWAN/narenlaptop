import { router, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function ServicesIndex({ services }) {
    const [editingId, setEditingId] = useState(null);
    const { data, setData, post, put, processing, reset } = useForm({
        title: '',
        description: '',
        icon: '',
        order: 0,
        is_active: true,
    });

    function edit(service) {
        setEditingId(service.id);
        setData({
            title: service.title || '',
            description: service.description || '',
            icon: service.icon || '',
            order: service.order || 0,
            is_active: Boolean(service.is_active),
        });
    }

    function clear() {
        setEditingId(null);
        reset();
    }

    function submit(event) {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: clear };

        editingId ? put(`/admin/services/${editingId}`, options) : post('/admin/services', options);
    }

    return (
        <AdminLayout title="Layanan">
            <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
                <form onSubmit={submit} className="space-y-4 rounded-lg border bg-white p-4 shadow-sm">
                    <div>
                        <h2 className="text-lg font-semibold">{editingId ? 'Edit Layanan' : 'Tambah Layanan'}</h2>
                        <p className="text-sm text-slate-500">Data aktif bisa dipakai oleh section Layanan mode database.</p>
                    </div>
                    <Field label="Nama Layanan" value={data.title} onChange={(value) => setData('title', value)} required />
                    <Textarea label="Deskripsi" value={data.description} onChange={(value) => setData('description', value)} />
                    <div className="grid gap-3 md:grid-cols-2">
                        <Field label="Icon" value={data.icon} onChange={(value) => setData('icon', value)} placeholder="wrench" />
                        <Field label="Urutan" type="number" value={data.order} onChange={(value) => setData('order', value)} />
                    </div>
                    <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={data.is_active} onChange={(event) => setData('is_active', event.target.checked)} />
                        Aktif
                    </label>
                    <div className="flex gap-2">
                        <Button type="submit" disabled={processing}>
                            <Plus className="size-4" />
                            {editingId ? 'Simpan' : 'Tambah'}
                        </Button>
                        {editingId && <Button type="button" variant="outline" onClick={clear}>Batal</Button>}
                    </div>
                </form>

                <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Layanan</th>
                                <th className="px-4 py-3">Urutan</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {services.data.map((service) => (
                                <tr key={service.id}>
                                    <td className="px-4 py-3">
                                        <button type="button" onClick={() => edit(service)} className="text-left">
                                            <span className="font-medium text-slate-950">{service.title}</span>
                                            <span className="mt-1 block max-w-xl text-xs leading-5 text-slate-500">{service.description || '-'}</span>
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{service.order}</td>
                                    <td className="px-4 py-3">
                                        <span className={`rounded px-2 py-1 text-xs font-semibold ${service.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'}`}>
                                            {service.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={() => edit(service)}>Edit</Button>
                                            <Button type="button" variant="outline" size="icon" onClick={() => router.delete(`/admin/services/${service.id}`, { preserveScroll: true })}>
                                                <Trash2 className="size-4 text-red-600" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {services.data.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-10 text-center text-sm text-slate-500">Belum ada layanan.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}

function Field({ label, value, onChange, ...props }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <Input {...props} value={value ?? ''} onChange={(event) => onChange(event.target.value)} />
        </label>
    );
}

function Textarea({ label, value, onChange }) {
    return (
        <label className="space-y-2">
            <Label>{label}</Label>
            <textarea
                className="border-input bg-background min-h-24 w-full rounded-md border px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                value={value || ''}
                onChange={(event) => onChange(event.target.value)}
            />
        </label>
    );
}
