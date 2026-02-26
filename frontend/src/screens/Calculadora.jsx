import React, { useState, useEffect } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Button, Card, Input } from '../components/ui';
import {
    Calculator,
    TrendingUp,
    Target,
    PieChart,
    ArrowRight,
    Plus,
    Info,
    RefreshCw,
    Wallet,
    Zap,
    Briefcase,
    Calendar,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';

const Calculadora = () => {
    const { balance, transactions } = useBudget();
    const [activeTab, setActiveTab] = useState('ratios'); // 'ratios', 'projections', 'goals'

    // States for simulations
    const [income, setIncome] = useState(0);
    const [monthlySavings, setMonthlySavings] = useState(0);
    const [years, setYears] = useState(1);
    const [interestRate, setInterestRate] = useState(5);
    const [initialCapital, setInitialCapital] = useState(0);
    const [goalAmount, setGoalAmount] = useState(0);
    const [goalDeadline, setGoalDeadline] = useState(12);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // 50/30/20 Rule Calculations
    const needs = income * 0.5;
    const wants = income * 0.3;
    const savings = income * 0.2;

    // Projection Calculation
    const calculateProjection = () => {
        let total = parseFloat(initialCapital) || 0;
        const monthlyRate = interestRate / 100 / 12;
        const totalMonths = years * 12;

        for (let i = 0; i < totalMonths; i++) {
            total = (total + parseFloat(monthlySavings)) * (1 + monthlyRate);
        }
        return total;
    };

    // Goal Calculation
    const monthlyNeeded = goalAmount > 0 ? (goalAmount / goalDeadline) : 0;

    const useRealData = () => {
        setIncome(balance.total_income || 0);
        setMonthlySavings(balance.total_balance / 12 || 0);
        if (activeTab === 'projections') {
            setInitialCapital(balance.total_balance || 0);
        }
    };

    return (
        <div className="space-y-10 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                        <Calculator size={36} className="text-secondary" />
                        Calculadora Orçamental
                    </h1>
                    <p className="text-slate-400 font-medium tracking-tight">
                        Simule o seu futuro financeiro e planeie os seus próximos passos.
                    </p>
                </div>
                <Button
                    variant="secondary"
                    onClick={useRealData}
                    className="flex items-center gap-2 border-white/10 hover:border-emerald-500/30 transition-all font-bold"
                >
                    <RefreshCw size={18} /> Usar Meus Dados Reais
                </Button>
            </header>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900/40 border-white/5 p-6 border-l-4 border-l-emerald-500">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Rendimento Mensal (Base)</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black text-white">{formatCurrency(income)}</h3>
                    </div>
                </Card>
                <Card className="bg-slate-900/40 border-white/5 p-6 border-l-4 border-l-secondary">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Taxa de Poupança Est.</p>
                    <h3 className="text-2xl font-black text-white">{income > 0 ? ((monthlySavings / income) * 100).toFixed(1) : 0}%</h3>
                </Card>
                <Card className="bg-slate-900/40 border-white/5 p-6 border-l-4 border-l-blue-500">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Património Atual</p>
                    <h3 className="text-2xl font-black text-white">{formatCurrency(balance.total_balance)}</h3>
                </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-950/40 rounded-2xl w-fit border border-white/5">
                {[
                    { id: 'ratios', label: 'Rácios 50/30/20', icon: <PieChart size={16} /> },
                    { id: 'projections', label: 'Projecção Futura', icon: <TrendingUp size={16} /> },
                    { id: 'goals', label: 'Calculadora de Metas', icon: <Target size={16} /> }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${activeTab === tab.id
                            ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                            : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'ratios' && (
                    <motion.div
                        key="ratios"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid lg:grid-cols-12 gap-10"
                    >
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-8 bg-slate-900/60 border-white/10">
                                <h3 className="text-xl font-black text-white mb-6">Ajustar Rendimento</h3>
                                <div className="space-y-6">
                                    <Input
                                        label="Rendimento Mensal (Kz)"
                                        type="number"
                                        step="10"
                                        value={income}
                                        onChange={(e) => setIncome(parseFloat(e.target.value) || 0)}
                                        icon={<Wallet />}
                                    />
                                    <div className="p-4 rounded-xl bg-secondary/5 border border-secondary/20 flex gap-4">
                                        <Info className="text-secondary shrink-0" size={20} />
                                        <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                            A regra **50/30/20** é um guia clássico: 50% para Necessidades, 30% para Desejos e 20% para Poupança/Investimento.
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-8">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div className="space-y-4">
                                    <div className={`p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 relative overflow-hidden group hover:border-emerald-500/30 transition-all`}>
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-6">
                                            <Zap size={24} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">50% Necessidades</p>
                                        <h4 className="text-2xl font-black text-white">{formatCurrency(needs)}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold mt-2">Renda, Contas, Alimentação</p>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Zap size={64} />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{ width: '50%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={`p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 relative overflow-hidden group hover:border-blue-500/30 transition-all`}>
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center mb-6">
                                            <Briefcase size={24} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">30% Desejos</p>
                                        <h4 className="text-2xl font-black text-white">{formatCurrency(wants)}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold mt-2">Lazer, Subscrições, Estilo</p>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Briefcase size={64} />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{ width: '30%' }}></div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className={`p-6 rounded-[2rem] bg-slate-900/40 border border-white/5 relative overflow-hidden group hover:border-secondary/30 transition-all`}>
                                        <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center mb-6">
                                            <TrendingUp size={24} />
                                        </div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">20% Poupança</p>
                                        <h4 className="text-2xl font-black text-white">{formatCurrency(savings)}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold mt-2">Investimentos, Reserva</p>
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <TrendingUp size={64} />
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full bg-secondary" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <Card className="mt-8 p-10 bg-slate-900/40 border-white/5 relative overflow-hidden">
                                <h4 className="text-lg font-black text-white mb-4">Análise de Sustentabilidade</h4>
                                <p className="text-slate-400 font-medium leading-relaxed max-w-2xl">
                                    Baseado no seu rendimento atual, se conseguir manter os seus custos fixos em **{formatCurrency(needs)}**, terá um excedente de capital que, investido mensalmente, pode acelerar a sua liberdade financeira em vários anos.
                                </p>
                                <Button
                                    onClick={() => setShowSuggestions(true)}
                                    className="mt-8 bg-emerald-500 hover:bg-emerald-600 text-white border-none font-black px-8"
                                >
                                    Ver Sugestões de Orçamento
                                </Button>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'projections' && (
                    <motion.div
                        key="projections"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid lg:grid-cols-12 gap-10"
                    >
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-8 bg-slate-900/60 border-white/10 space-y-8">
                                <h3 className="text-xl font-black text-white">Configurar Projecção</h3>
                                <Input
                                    label="Capital Inicial (Kz)"
                                    type="number"
                                    step="10"
                                    value={initialCapital}
                                    onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 0)}
                                    icon={<Wallet />}
                                />
                                <Input
                                    label="Poupança Mensal (Kz)"
                                    type="number"
                                    step="10"
                                    value={monthlySavings}
                                    onChange={(e) => setMonthlySavings(parseFloat(e.target.value) || 0)}
                                    icon={<Wallet />}
                                />
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                                        Período (Anos) <span>{years} Anos</span>
                                    </label>
                                    <input
                                        type="range" min="1" max="30"
                                        value={years} onChange={(e) => setYears(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-secondary"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                                        Taxa de Juro Anual (%) <span>{interestRate}%</span>
                                    </label>
                                    <input
                                        type="range" min="1" max="25"
                                        value={interestRate} onChange={(e) => setInterestRate(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-8">
                            <Card className="money-gradient p-12 border-none text-white relative overflow-hidden h-full flex flex-col justify-center">
                                <div className="relative z-10 text-center">
                                    <p className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-4">Património Estimado em {years} anos</p>
                                    <h2 className="text-6xl md:text-7xl font-black tracking-tighter mb-8">
                                        {formatCurrency(calculateProjection())}
                                    </h2>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase opacity-60">Total Investido</p>
                                            <p className="text-xl font-black">{formatCurrency(initialCapital + (monthlySavings * years * 12))}</p>
                                        </div>
                                        <div className="px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                                            <p className="text-[10px] font-black uppercase opacity-60">Juros Acumulados</p>
                                            <p className="text-xl font-black text-emerald-300">+{formatCurrency(calculateProjection() - (initialCapital + (monthlySavings * years * 12)))}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                                    <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 blur-[100px] rounded-full"></div>
                                    <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-emerald-400/10 blur-[100px] rounded-full"></div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'goals' && (
                    <motion.div
                        key="goals"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="grid lg:grid-cols-12 gap-10"
                    >
                        <div className="lg:col-span-4 space-y-6">
                            <Card className="p-8 bg-slate-900/60 border-white/10 space-y-8">
                                <h3 className="text-xl font-black text-white">Definir Objetivo</h3>
                                <Input
                                    label="Quanto deseja atingir? (Kz)"
                                    type="number"
                                    step="10"
                                    value={goalAmount}
                                    onChange={(e) => setGoalAmount(parseFloat(e.target.value) || 0)}
                                    placeholder="Ex: 5.000.000"
                                    icon={<Target />}
                                />
                                <Input
                                    label="Prazo (Meses)"
                                    type="number"
                                    value={goalDeadline}
                                    onChange={(e) => setGoalDeadline(parseInt(e.target.value) || 1)}
                                    placeholder="Ex: 24 meses"
                                    icon={<Calendar />}
                                />
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5">
                                    <p className="text-xs text-slate-500 font-medium mb-1 uppercase tracking-widest font-black">Meta Diária</p>
                                    <p className="text-xl font-black text-white">{formatCurrency(monthlyNeeded / 30)} / dia</p>
                                </div>
                            </Card>
                        </div>

                        <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
                            <Card className="p-10 bg-slate-900/40 border-white/5 flex flex-col justify-between">
                                <div>
                                    <div className="w-14 h-14 rounded-2xl bg-secondary/10 text-secondary flex items-center justify-center mb-8">
                                        <TrendingUp size={28} />
                                    </div>
                                    <h4 className="text-3xl font-black text-white mb-2 italic">A Sua Missão</h4>
                                    <p className="text-slate-400 font-medium leading-relaxed">
                                        Para atingir o seu objetivo de **{formatCurrency(goalAmount)}** em **{goalDeadline} meses**, precisa de poupar mensalmente:
                                    </p>
                                </div>
                                <div className="mt-10">
                                    <h2 className="text-5xl font-black text-secondary tracking-tighter group hover:scale-105 transition-transform cursor-default">
                                        {formatCurrency(monthlyNeeded)}
                                    </h2>
                                    <p className="text-xs text-slate-500 uppercase font-black tracking-widest mt-2">Por Mês</p>
                                </div>
                            </Card>

                            <div className="space-y-6">
                                <Card className="p-8 bg-slate-900/40 border-white/5 border-l-4 border-l-emerald-500">
                                    <h5 className="text-sm font-black text-white uppercase tracking-widest mb-4">Viabilidade</h5>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center text-xs font-bold text-slate-400">
                                            <span>Capacidade Atual</span>
                                            <span>{Math.min(100, (balance.total_income > 0 ? (monthlyNeeded / balance.total_income) * 100 : 0)).toFixed(1)}% do Rendo</span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${monthlyNeeded > balance.total_income * 0.5 ? 'bg-red-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${Math.min(100, (balance.total_income > 0 ? (monthlyNeeded / balance.total_income) * 100 : 0))}%` }}
                                            ></div>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium">
                                            {monthlyNeeded > balance.total_income * 0.3
                                                ? "⚠️ Este objetivo exige um corte agressivo nos seus gastos actuais."
                                                : "✅ Este objetivo parece realista e sustentável."}
                                        </p>
                                    </div>
                                </Card>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showSuggestions && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowSuggestions(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-900 border border-white/10 p-10 rounded-[2.5rem] w-full max-w-2xl relative z-10 shadow-2xl"
                        >
                            <h2 className="text-3xl font-black text-white mb-6 flex items-center gap-3">
                                <Zap className="text-secondary" /> Sugestões para Angola
                            </h2>
                            <div className="space-y-6">
                                <section className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <h4 className="font-black text-emerald-400 uppercase text-xs tracking-widest mb-2">Reserva de Emergência</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Devido à inflação e instabilidade económica, a sua reserva deve cobrir entre **6 a 12 meses** de custos fixos. Guarde este valor numa conta de fácil acesso, mas separada do dia-a-dia.
                                    </p>
                                </section>
                                <section className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-2xl">
                                    <h4 className="font-black text-blue-400 uppercase text-xs tracking-widest mb-2">Consumo Consciente</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Priorize compras em mercados locais para frescos e granel. Evite subscrições em moeda estrangeira que flutuam com o câmbio. Converta "Desejos" em investimento mal receba o salário.
                                    </p>
                                </section>
                                <section className="p-6 bg-secondary/5 border border-secondary/10 rounded-2xl">
                                    <h4 className="font-black text-secondary uppercase text-xs tracking-widest mb-2">Investimento Local</h4>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Considere Títulos do Tesouro (Obrigações e Bilhetes de Tesouro) para proteger o seu capital. Use a Calculadora de Metas para planear a compra da sua casa ou terreno, evitando dívidas de consumo.
                                    </p>
                                </section>
                            </div>
                            <Button
                                variant="secondary"
                                onClick={() => setShowSuggestions(false)}
                                className="w-full mt-10 font-black h-12 rounded-xl"
                            >
                                Percebi, vamos ao Plano!
                            </Button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Calculadora;
