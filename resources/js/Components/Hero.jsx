import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Hero({ auth }) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 300], [0, -50]);
    const y2 = useTransform(scrollY, [0, 300], [0, -100]);

    useEffect(() => {
        const updateMousePosition = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', updateMousePosition);
        return () => window.removeEventListener('mousemove', updateMousePosition);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -15 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const titleVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 1,
                ease: [0.25, 0.46, 0.45, 0.94],
                staggerChildren: 0.1
            }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 50, rotateX: -90 },
        visible: {
            opacity: 1,
            y: 0,
            rotateX: 0,
            transition: {
                duration: 0.6,
                ease: [0.25, 0.46, 0.45, 0.94]
            }
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                type: "spring",
                stiffness: 100
            }
        },
        hover: {
            scale: 1.05,
            y: -2,
            boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        tap: {
            scale: 0.95,
            transition: {
                duration: 0.1
            }
        }
    };

    const featureVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.9 },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        },
        hover: {
            y: -5,
            scale: 1.02,
            transition: {
                duration: 0.2
            }
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-primary/40 to-slate-800">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
            
            {/* Floating Elements */}
            <motion.div
                className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-xl"
                animate={{
                    y: [0, -20, 0],
                    x: [0, 10, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute right-20 top-40 h-32 w-32 rounded-full bg-accent/25 blur-xl"
                animate={{
                    y: [0, 20, 0],
                    x: [0, -15, 0],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />
            <motion.div
                className="absolute bottom-20 left-1/4 h-24 w-24 rounded-full bg-primary/30 blur-xl"
                animate={{
                    y: [0, -15, 0],
                    x: [0, 20, 0],
                }}
                transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Navigation */}
            <motion.nav
                className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-4 sm:p-6 lg:px-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-xl font-bold text-white sm:text-2xl">
                    TechStore
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="inline-flex h-10 items-center px-3 text-sm text-white transition-colors hover:text-accent sm:px-4 sm:text-base"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="inline-flex h-10 items-center px-3 text-sm text-white transition-colors hover:text-accent sm:px-4 sm:text-base"
                            >
                                Masuk
                            </Link>
                            <Link
                                href={route('register')}
                                className="inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm text-white transition-colors hover:bg-primary/90 sm:px-6 sm:text-base"
                            >
                                Daftar
                            </Link>
                        </>
                    )}
                </div>
            </motion.nav>

            {/* Hero Content */}
            <div className="relative z-10 flex min-h-[calc(100vh-100px)] items-center justify-center px-4 sm:px-6">
                <motion.div
                    className="text-center max-w-4xl mx-auto"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1
                        className="mb-6 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl"
                        variants={itemVariants}
                    >
                        Teknologi
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {" "}Terdepan
                        </span>
                        <br />
                        untuk Masa Depan
                    </motion.h1>

                    <motion.p
                        className="mx-auto mb-8 max-w-2xl text-xl leading-relaxed text-slate-300 md:text-2xl"
                        variants={itemVariants}
                    >
                        Temukan koleksi lengkap komputer, laptop, dan aksesoris teknologi terbaru dengan harga terbaik dan kualitas terjamin.
                    </motion.p>

                    <motion.div
                        className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4"
                        variants={itemVariants}
                    >
                        <motion.button
                            className="w-full rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-4 font-semibold text-slate-950 shadow-lg transition-shadow hover:shadow-xl sm:w-auto sm:px-8"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                        >
                            Jelajahi Produk
                        </motion.button>
                        
                        <motion.button
                            className="w-full rounded-xl border-2 border-white/30 px-6 py-4 font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto sm:px-8"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                        >
                            Hubungi Kami
                        </motion.button>
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 md:mt-16 md:grid-cols-3 md:gap-6"
                        variants={itemVariants}
                    >
                        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Kualitas Terjamin</h3>
                            <p className="text-sm text-slate-400">Produk original dengan garansi resmi</p>
                        </div>

                        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Harga Kompetitif</h3>
                            <p className="text-sm text-slate-400">Harga terbaik dengan kualitas premium</p>
                        </div>

                        <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                                <svg className="h-6 w-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-white mb-2">Pengiriman Cepat</h3>
                            <p className="text-sm text-slate-400">Pengiriman ke seluruh Indonesia</p>
                        </div>
                    </motion.div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.6 }}
            >
                <motion.div
                    className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <motion.div
                        className="w-1 h-3 bg-white/60 rounded-full mt-2"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                </motion.div>
            </motion.div>
        </div>
    );
}
