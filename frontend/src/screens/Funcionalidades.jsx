import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui';
import {
    TrendingUp,
    PieChart,
    History,
    Shield,
    Globe,
    Bell,
    ArrowLeft,
    CheckCircle2,
    Zap,
    Lock,
    Smartphone,
    ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/pages/Funcionalidades.css';

const Funcionalidades = () => {
    const navigate = useNavigate();
    const features = [
        {
            icon: <TrendingUp className="text-emerald-500" />,
            title: "Gestão de Receitas",
            desc: "Acompanhe cada entrada em tempo real com gráficos intuitivos e projeções inteligentes.",
            benefit: "Visualize seu patrimônio crescendo dia após dia.",
            color: "bg-emerald-50"
        },
        {
            icon: <PieChart className="text-money" />,
            title: "Controle de Despesas",
            desc: "Categorize seus gastos automaticamente e identifique para onde seu dinheiro está indo.",
            benefit: "Corte gastos desnecessários com precisão cirúrgica.",
            color: "bg-money/5"
        },
        {
            icon: <History className="text-trust-light" />,
            title: "Histórico Abrangente",
            desc: "Pesquise e filtre suas transações passadas. Exportação de relatórios em um clique.",
            benefit: "Nunca mais perca o rastro de um pagamento.",
            color: "bg-amber-50"
        },
        {
            icon: <Globe className="text-blue-500" />,
            title: "Multi-moeda",
            desc: "Suporte completo para Kwanza (AOA), Dólar (USD) e Euro (EUR) com conversão automática.",
            benefit: "Ideal para quem investe ou viaja internacionalmente.",
            color: "bg-blue-50"
        },
        {
            icon: <Lock className="text-slate-700" />,
            title: "Segurança de Elite",
            desc: "Criptografia de ponta a ponta e autenticação segura para proteger seus dados financeiros.",
            benefit: "Privacidade total para suas informações sensíveis.",
            color: "bg-slate-100"
        },
        {
            icon: <Bell className="text-amber-500" />,
            title: "Alertas Inteligentes",
            desc: "Notificações personalizadas sobre vencimentos e limites de gastos por categoria.",
            benefit: "Evite multas e mantenha-se dentro do orçamento.",
            color: "bg-orange-50"
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 selection:bg-money/20 pb-20">
            {/* Header */}
            <nav className="bg-white border-b border-slate-100 px-6 py-6 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 money-gradient rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-xl font-black text-trust">Real <span className="text-money">Balance</span></span>
                    </Link>
                    <Link to="/register">
                        <Button className="money-gradient px-6 shadow-lg shadow-money/20 border-none">Criar Conta Grátis</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="features-hero">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-5xl md:text-6xl font-black text-trust mb-6 leading-tight">
                        Tudo o que você precisa para <span className="text-money">vencer financeiramente</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-medium leading-relaxed">
                        Explora as ferramentas exclusivas do Real Balance desenhadas para elevar o teu controlo financeiro ao próximo nível.
                    </p>
                </motion.div>
            </header>

            {/* Features Grid */}
            <main className="features-grid">
                {features.map((f, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card group hover:scale-[1.02] transition-all duration-500"
                    >
                        <div className={`w-16 h-16 rounded-[1.5rem] ${f.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-lg shadow-money/10`}>
                            {f.icon}
                        </div>
                        <h3 className="text-2xl font-black text-trust mb-4">{f.title}</h3>
                        <p className="text-slate-500 font-medium leading-relaxed mb-6">{f.desc}</p>
                        <div className="flex items-start gap-2 pt-6 border-t border-slate-50">
                            <CheckCircle2 size={18} className="text-money mt-0.5" />
                            <span className="text-sm font-bold text-slate-700">{f.benefit}</span>
                        </div>
                    </motion.div>
                ))}
            </main>

            {/* Secondary CTA */}
            <div className="max-w-7xl mx-auto px-6 pb-24 mt-24">
                <motion.section
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="features-cta-section"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>

                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight text-white">
                            Pronto para transformar sua <br /> vida financeira?
                        </h2>
                        <Button
                            className="bg-white text-money hover:bg-slate-50 text-xl px-12 py-8 rounded-full font-black shadow-2xl hover:scale-110 transition-all border-none"
                            onClick={() => navigate('/register')}
                        >
                            Começar agora gratuitamente <ArrowRight className="ml-2" />
                        </Button>
                    </div>
                </motion.section>
            </div>

            <footer className="py-12 text-center text-slate-400 font-bold border-t border-slate-100 mx-6">
                © 2024 Real Balance - Gestão financeira premium em Angola
                <br />
                <Link to="/" className="inline-flex items-center gap-2 mt-4 hover:text-money transition-colors">
                    <ArrowLeft size={16} /> Voltar ao início
                </Link>
            </footer>
        </div>
    );
};

export default Funcionalidades;
