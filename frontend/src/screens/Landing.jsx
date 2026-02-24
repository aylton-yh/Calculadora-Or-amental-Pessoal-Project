import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui';
import { PieChart, Shield, TrendingUp, History, CreditCard, ArrowRight, DollarSign, Wallet, Percent } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import logo from '../assets/logo.png';
import '../styles/pages/Landing.css';

const Landing = () => {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-money/20 overflow-x-hidden relative">
            {/* Animated Background Mesh */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-money/10 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-50 h-50 bg-trust/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Floating Decorative Elements */}
            <div className="landing-floating-container">
                <FloatingIcon icon={<DollarSign size={40} />} top="15%" left="5%" delay={0} color="text-money/10" />
                <FloatingIcon icon={<Wallet size={32} />} top="65%" left="8%" delay={1} color="text-money/5" />
                <FloatingIcon icon={<Percent size={48} />} top="25%" right="10%" delay={0.5} color="text-trust/10" />
                <FloatingIcon icon={<TrendingUp size={36} />} top="75%" right="5%" delay={1.5} color="text-trust/5" />
            </div>

            {/* Sticky Glass Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-white/20 px-8 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3 group">
                        <div className="w-12 h-12 flex items-center justify-center shadow-lg shadow-money/20 group-hover:scale-110 transition-transform floating-money rounded-2xl overflow-hidden bg-white">
                            <img src={logo} alt="Real Balance Logo" className="w-full h-full object-cover" />
                        </div>
                        <div>
                            <span className="text-2xl font-black tracking-tight text-trust">Real <span className="text-money">Balance</span></span>
                            <div className="h-1.5 w-full bg-money/20 rounded-full mt-[-2px]"></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Link to="/login" className="hidden sm:block">
                            <Button variant="ghost" className="font-bold text-trust hover:text-money">Login</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="money-gradient px-8 shadow-xl shadow-money/20 border-none shimmer">Criar Conta</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            <header className="landing-header">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="landing-hero-badge"
                >
                    ✨ A primeira plataforma de gestão económica em Angola
                </motion.div>

                <motion.h1
                    style={{ y: y1 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-black text-trust leading-[1.1] mb-10 tracking-tighter"
                >
                    Domine as suas finanças com <span className="text-reveal drop-shadow-sm">Real Balance</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl md:text-2xl text-slate-500 mb-14 max-w-3xl mx-auto leading-relaxed font-medium"
                >
                    O sistema definitivo desenhado para a realidade angolana. Controle cada Kwanza, planeie os seus investimentos e conquiste a liberdade financeira.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-center items-center gap-6"
                >
                    <Link to="/register" className="w-full sm:w-auto">
                        <Button className="money-gradient px-12 py-7 text-xl rounded-3xl shadow-2xl shadow-money/40 border-none group shimmer w-full">
                            Começar Agora <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/funcionalidades" className="w-full sm:w-auto">
                        <Button variant="outline" className="px-12 py-7 text-xl rounded-3xl border-2 border-slate-200 hover:border-money hover:text-money transition-all backdrop-blur-sm bg-white/30 w-full font-black">
                            Ver Funcionalidades
                        </Button>
                    </Link>
                </motion.div>
            </header>

            {/* Features Section with Scroll Reveal */}
            <section className="py-40 px-6 relative z-10 bg-white/50 backdrop-blur-3xl border-y border-slate-100">
                <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">
                    <FeatureCard
                        index={0}
                        icon={<TrendingUp className="text-white" />}
                        title="Gestão de Receitas"
                        desc="Registe todos os seus ganhos e veja o seu saldo crescer com inteligência em tempo real."
                        color="from-emerald-500 to-emerald-600"
                    />
                    <FeatureCard
                        index={1}
                        icon={<PieChart className="text-white" />}
                        title="Controle de Despesas"
                        desc="Categorize os seus gastos com precisão e descubra minas de ouro na sua economia."
                        color="from-money to-teal-600"
                    />
                    <FeatureCard
                        index={2}
                        icon={<History className="text-white" />}
                        title="Histórico Detalhado"
                        desc="Acompanhe a sua evolução financeira com relatórios que impulsionam as suas decisões."
                        color="from-trust-light to-trust-DEFAULT"
                    />
                </div>
            </section>

            {/* Footer */}
            <footer className="py-24 text-center bg-white border-t border-slate-50 relative z-10">
                <div className="mb-10 flex flex-wrap justify-center gap-10 text-sm font-bold text-slate-400 capitalize">
                    <a href="#" className="hover:text-money transition-colors">Privacidade</a>
                    <a href="#" className="hover:text-money transition-colors">Termos</a>
                    <a href="#" className="hover:text-money transition-colors">Apoio</a>
                    <a href="#" className="hover:text-money transition-colors">FAQ</a>
                </div>
                <div className="max-w-md mx-auto px-6">
                    <p className="font-bold text-trust opacity-60 leading-relaxed">&copy; 2026 Real Balance. A primeira plataforma de gestão económica dedicada ao progresso de Angola.</p>
                </div>
            </footer>
        </div>
    );
};

const FloatingIcon = ({ icon, top, left, right, delay, color }) => (
    <motion.div
        animate={{
            y: [0, -20, 0],
            rotate: [0, 10, 0],
            opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
            duration: 5,
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        style={{ position: 'absolute', top, left, right }}
        className={`${color}`}
    >
        {icon}
    </motion.div>
);

const FeatureCard = ({ icon, title, desc, color, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.2 }}
        className="premium-card group hover:border-money/20"
    >
        <div className={`w-16 h-16 bg-gradient-to-br ${color} rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-emerald-200 group-hover:scale-110 transition-all duration-500 group-hover:rotate-6`}>
            {icon}
        </div>
        <h3 className="text-3xl font-black mb-6 text-trust tracking-tight">{title}</h3>
        <p className="text-slate-500 leading-relaxed font-bold text-lg opacity-80">{desc}</p>
    </motion.div>
);

export default Landing;
