import InputError from '@/Components/InputError';
import AppLogoIcon from '@/components/app-logo-icon';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CheckCircle2, Cpu, LockKeyhole, Mail, ShieldCheck, Wrench } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Log in" />

            <main className="min-h-screen bg-[#f7f8f5] text-slate-950">
                <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
                    <section className="relative hidden overflow-hidden bg-slate-950 text-white lg:block">
                        <img
                            src="https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1600&q=80"
                            alt="Meja kerja teknisi laptop"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-950/72" />
                        <div className="relative flex min-h-screen flex-col justify-between p-10">
                            <Link href="/" className="inline-flex w-fit items-center gap-3">
                                <span className="flex size-10 items-center justify-center rounded-lg bg-white text-slate-950">
                                    <AppLogoIcon className="size-6 fill-current" />
                                </span>
                                <span className="text-sm font-semibold">Toko Komputer</span>
                            </Link>

                            <div className="max-w-xl">
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                                    <ShieldCheck className="size-3.5" />
                                    Admin Control Center
                                </span>
                                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal xl:text-5xl">
                                    Kelola website service komputer dari satu dashboard.
                                </h1>
                                <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
                                    Masuk untuk mengatur halaman, layanan, artikel, media, navigasi, dan pesan pelanggan.
                                </p>
                            </div>

                            <div className="grid max-w-2xl gap-3 sm:grid-cols-3">
                                <Feature icon={Wrench} label="CRUD Layanan" />
                                <Feature icon={Cpu} label="Page Builder" />
                                <Feature icon={CheckCircle2} label="SEO Ready" />
                            </div>
                        </div>
                    </section>

                    <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
                        <div className="w-full max-w-md">
                            <div className="mb-8 flex items-center justify-between gap-4 lg:hidden">
                                <Link href="/" className="inline-flex items-center gap-3">
                                    <span className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                                        <AppLogoIcon className="size-6 fill-current" />
                                    </span>
                                    <span className="text-sm font-semibold">Toko Komputer</span>
                                </Link>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-slate-500">Admin Login</p>
                                    <h2 className="mt-2 text-2xl font-semibold tracking-normal">Masuk ke dashboard</h2>
                                    <p className="mt-2 text-sm leading-6 text-slate-500">
                                        Gunakan akun admin untuk mengelola konten website.
                                    </p>
                                </div>

                                {status && (
                                    <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                                        {status}
                                    </div>
                                )}

                                <form onSubmit={submit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                className="h-11 pl-10"
                                                autoComplete="username"
                                                autoFocus
                                                aria-invalid={Boolean(errors.email)}
                                                placeholder="admin@example.com"
                                                onChange={(event) => setData('email', event.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <Label htmlFor="password">Password</Label>
                                            {canResetPassword && (
                                                <Link
                                                    href={route('password.request')}
                                                    className="text-xs font-medium text-slate-600 hover:text-slate-950"
                                                >
                                                    Lupa password?
                                                </Link>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                value={data.password}
                                                className="h-11 pl-10"
                                                autoComplete="current-password"
                                                aria-invalid={Boolean(errors.password)}
                                                placeholder="Masukkan password"
                                                onChange={(event) => setData('password', event.target.value)}
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    <label className="flex items-center gap-3 text-sm text-slate-600">
                                        <Checkbox
                                            checked={data.remember}
                                            onCheckedChange={(checked) => setData('remember', Boolean(checked))}
                                        />
                                        Ingat sesi login
                                    </label>

                                    <Button type="submit" className="h-11 w-full" disabled={processing}>
                                        {processing ? 'Memproses...' : 'Masuk'}
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </form>
                            </div>

                            <p className="mt-5 text-center text-xs leading-5 text-slate-500">
                                Akses terbatas untuk admin. Aktivitas pengelolaan konten mengikuti akun yang sedang login.
                            </p>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function Feature({ icon: Icon, label }) {
    return (
        <div className="rounded-lg border border-white/10 bg-white/10 p-3">
            <Icon className="size-5 text-slate-100" />
            <p className="mt-3 text-sm font-medium text-white">{label}</p>
        </div>
    );
}
