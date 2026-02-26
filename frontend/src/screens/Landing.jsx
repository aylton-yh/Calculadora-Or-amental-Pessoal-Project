import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { PieChart, TrendingUp, History, ArrowRight, DollarSign, Wallet, Percent, Shield, Zap } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/logo.png';

const Landing = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 100]);
    const y2 = useTransform(scrollY, [0, 500], [0, -100]);

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/20 overflow-x-hidden relative font-sans">
            {/* Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Sticky Glass Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-5 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
                <div className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-3 group cursor-pointer">
                        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center p-2.5 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-white group-hover:text-emerald-500 transition-colors">Real <span className="text-emerald-500">Balance</span></span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest hidden sm:block">
                            Login
                        </Link>
                        <Link to="/register">
                            <Button className="money-gradient px-8 h-12 rounded-xl border-none shadow-lg shadow-emerald-500/20 group">
                                Começar Grátis <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={16} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-48 pb-32 px-6 flex flex-col items-center text-center z-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-[0.2em] mb-10"
                >
                    ✨ A revolução financeira em Angola
                </motion.div>

                <motion.h1
                    style={{ y: y1 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.05] mb-10 tracking-tighter max-w-5xl"
                >
                    Domine o seu dinheiro com <span className="text-transparent bg-clip-text money-gradient">Inteligência</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-400 mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
                >
                    O sistema definitivo para controlar cada Kwanza, planear o futuro e conquistar liberdade real. Simples, moderno e seguro.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full max-w-lg"
                >
                    <Link to="/register" className="w-full">
                        <Button className="money-gradient px-12 h-16 text-xl rounded-2xl shadow-2xl shadow-emerald-500/40 border-none group w-full">
                            Criar Conta <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/funcionalidades" className="w-full">
                        <Button variant="secondary" className="px-12 h-16 text-xl rounded-2xl w-full border border-white/5 bg-white/5 backdrop-blur-md">
                            Explorar
                        </Button>
                    </Link>
                </motion.div>
            </header>

            {/* Features Stats */}
            <section className="py-24 px-6 relative z-10">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<TrendingUp className="text-emerald-500" />}
                        title="Receitas sob Controle"
                        desc="Visualize o seu crescimento financeiro com gráficos de alta performance em tempo real."
                    />
                    <FeatureCard
                        icon={<PieChart className="text-secondary" />}
                        title="Gestão de Gastos"
                        desc="Categorize cada despesa automaticamente e identifique onde pode poupar mais."
                    />
                    <FeatureCard
                        icon={<Shield className="text-blue-400" />}
                        title="Segurança de Elite"
                        desc="Os seus dados são protegidos com os mais altos padrões de criptografia financeira."
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5 relative z-10 bg-slate-950/40">
                <div className="w-full px-10 flex flex-col items-center">
                    <div className="flex items-center gap-3 mb-10 opacity-50">
                        <div className="w-8 h-8 money-gradient rounded-lg flex items-center justify-center p-1.5">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain brightness-0 invert" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white italic">Real Balance</span>
                    </div>
                    <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-12">
                        <a href="#" className="hover:text-emerald-500 transition-colors">Privacidade</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Termos</a>
                        <a href="#" className="hover:text-emerald-500 transition-colors">Suporte</a>
                    </div>
                    <p className="text-xs font-bold text-slate-600 text-center max-w-md italic">
                        &copy; 2026 Real Balance. Acompanhando o progresso económico de Angola.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl group hover:border-emerald-500/30 transition-all cursor-default"
    >
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-xl">
            {React.cloneElement(icon, { size: 32 })}
        </div>
        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{title}</h3>
        <p className="text-slate-400 leading-relaxed font-medium">{desc}</p>
    </motion.div>
);

const ChevronRight = ({ className, size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 18 15 12 9 6"></polyline></svg>
);

export default Landing;
