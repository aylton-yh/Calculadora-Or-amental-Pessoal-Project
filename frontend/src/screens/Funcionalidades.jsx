import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import {
    TrendingUp,
    PieChart,
    History,
    Globe,
    Bell,
    ArrowLeft,
    CheckCircle2,
    Lock,
    ArrowRight,
    ChevronRight,
    Search,
    Download
} from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';

const Funcionalidades = () => {
    const navigate = useNavigate();
    const features = [
        {
            icon: <TrendingUp />,
            title: "Gestão de Receitas",
            desc: "Acompanhe cada entrada em tempo real com gráficos de alta performance e projeções inteligentes.",
            benefit: "Visualize o seu patrimônio crescendo com clareza.",
            color: "text-emerald-500",
            bg: "bg-emerald-500/10"
        },
        {
            icon: <PieChart />,
            title: "Controle de Despesas",
            desc: "Categorize os seus gastos automaticamente e identifique para onde o seu dinheiro está a ir.",
            benefit: "Corte gastos desnecessários com precisão.",
            color: "text-secondary",
            bg: "bg-secondary/10"
        },
        {
            icon: <History />,
            title: "Histórico Analítico",
            desc: "Pesquise e filtre transações passadas com facilidade. Exportação de dados em segundos.",
            benefit: "Controlo total sobre o seu passado financeiro.",
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            icon: <Globe />,
            title: "Ecossistema Multi-moeda",
            desc: "Suporte nativo para AKZ, USD e EUR com taxas de câmbio actualizadas.",
            benefit: "Ideal para investidores globais em Angola.",
            color: "text-purple-400",
            bg: "bg-purple-400/10"
        },
        {
            icon: <Lock />,
            title: "Segurança Imbatível",
            desc: "Criptografia de nível militar para garantir que os seus dados financeiros nunca saiam do seu controlo.",
            benefit: "Privacidade absoluta e tranquilidade total.",
            color: "text-rose-400",
            bg: "bg-rose-400/10"
        },
        {
            icon: <Bell />,
            title: "Alertas Adaptativos",
            desc: "Receba notificações sobre limites de orçamento e metas de poupança directamente no seu dispositivo.",
            benefit: "Mantenha a sua disciplina financeira no topo.",
            color: "text-amber-400",
            bg: "bg-amber-400/10"
        }
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-emerald-500/20 pb-20 font-sans relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 blur-[150px] rounded-full"></div>
            </div>

            {/* Navbar */}
            <nav className="sticky top-0 z-50 px-8 py-5 border-b border-white/5 bg-slate-950/60 backdrop-blur-xl">
                <div className="w-full flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center p-2 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tight text-white">Real <span className="text-emerald-500">Balance</span></span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/" className="text-xs font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest hidden sm:block">
                            Início
                        </Link>
                        <Link to="/register">
                            <Button className="money-gradient px-6 h-10 text-sm rounded-xl border-none shadow-lg shadow-emerald-500/20">
                                Começar Agora
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="w-full px-10 pt-32 pb-20 text-center relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-[1.1]">
                        Ferramentas de <span className="text-transparent bg-clip-text money-gradient">Elite</span> para a sua Gestão
                    </h1>
                    <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-3xl mx-auto">
                        Desenvolvemos cada funcionalidade com um único propósito: dar-lhe o poder absoluto sobre o seu destino financeiro em Angola.
                    </p>
                </motion.div>
            </header>

            {/* Features Grid */}
            <main className="w-full px-10 grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 rounded-[2.5rem] bg-slate-900/40 border border-white/5 backdrop-blur-xl group hover:border-emerald-500/30 transition-all cursor-default"
                    >
                        <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg`}>
                            {React.cloneElement(f.icon, { size: 28 })}
                        </div>
                        <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{f.title}</h3>
                        <p className="text-slate-400 font-medium leading-relaxed mb-8 h-20 overflow-hidden">{f.desc}</p>
                        <div className="flex items-start gap-3 pt-6 border-t border-white/5 line-clamp-2">
                            <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                            <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest leading-normal">{f.benefit}</span>
                        </div>
                    </motion.div>
                ))}
            </main>

            {/* Final CTA */}
            <div className="w-full px-10 mt-32 relative z-10">
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="relative overflow-hidden p-12 md:p-20 rounded-[3.5rem] bg-gradient-to-br from-emerald-600 to-emerald-800 text-center"
                >
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-3xl rounded-full -mr-48 -mt-48"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-950/20 blur-2xl rounded-full -ml-32 -mb-32"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black mb-10 leading-[1.1] text-white tracking-tighter">
                            Pronto para o próximo <br className="hidden md:block" /> nível financeiro?
                        </h2>
                        <Button
                            className="bg-white text-emerald-700 hover:bg-slate-50 text-xl h-20 px-14 rounded-2xl font-black shadow-2xl hover:scale-105 transition-all border-none group"
                            onClick={() => navigate('/register')}
                        >
                            Criar Minha Conta Grátis <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
                        </Button>
                    </div>
                </motion.section>
            </div>

            <footer className="mt-32 py-12 text-center relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-black text-[10px] uppercase tracking-[0.2em]">
                    <ArrowLeft size={14} /> Voltar à página inicial
                </Link>
            </footer>
        </div>
    );
};

export default Funcionalidades;
