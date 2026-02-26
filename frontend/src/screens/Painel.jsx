import React from 'react';
import { useBudget } from '../context/BudgetContext';
import { Card } from '../components/ui';
import {
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Wallet,
    Calendar,
    LogIn,
    Settings,
    CreditCard,
    Activity
} from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useUI } from '../context/UIContext';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';

const getActivityIcon = (tipo) => {
    switch (tipo) {
        case 'receita': return <ArrowUpRight size={18} />;
        case 'despesa': return <ArrowDownLeft size={18} />;
        case 'login': return <LogIn size={18} />;
        case 'conta': return <CreditCard size={18} />;
        default: return <Activity size={18} />;
    }
};

const getActivityColor = (tipo) => {
    switch (tipo) {
        case 'receita': return 'bg-emerald-500/10 text-emerald-500';
        case 'despesa': return 'bg-red-500/10 text-red-400';
        case 'login': return 'bg-blue-500/10 text-blue-400';
        case 'conta': return 'bg-amber-500/10 text-amber-400';
        default: return 'bg-slate-500/10 text-slate-400';
    }
};

const Painel = () => {
    const { user, balance, transactions, categories, accounts, logout, activities } = useBudget();
    const { startProcessing, stopProcessing } = useUI();

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const handleLogout = () => {
        startProcessing('Encerrando sua sessão...');
        setTimeout(() => {
            logout();
            stopProcessing();
        }, 1000);
    };

    // 1. Saldo em contas (total de quanto eu tenho em todas as minhas contas)
    const totalEmContas = accounts.reduce((acc, curr) => acc + curr.saldo, 0);

    // 2. Receitas Mensais (total de quanto eu tenho em receitas no mês atual)
    const totalReceitasMensais = transactions
        .filter(t => {
            const date = new Date(t.data);
            return t.tipo === 'receita' && (date.getMonth() + 1) === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + parseFloat(t.valor), 0);

    // 3. Despesas Mensais (total de quanto gasto na despesas no mês atual)
    const totalDespesasMensais = transactions
        .filter(t => {
            const date = new Date(t.data);
            return t.tipo === 'despesa' && (date.getMonth() + 1) === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((acc, t) => acc + parseFloat(t.valor), 0);

    // 4. Patrimonio total (deve somar todas as receitas que eu ganho total)
    const totalReceitasAcumuladas = transactions
        .filter(t => t.tipo === 'receita')
        .reduce((acc, t) => acc + parseFloat(t.valor), 0);

    // Calcular totais por categoria para o gráfico
    const totaisPorCategoria = transactions.reduce((acc, t) => {
        acc[t.id_categoria] = (acc[t.id_categoria] || 0) + parseFloat(t.valor);
        return acc;
    }, {});

    // Processar dados para o gráfico (últimos 6 meses)
    const getChartData = () => {
        const months = [];
        const now = new Date();

        for (let i = 5; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                month: d.getMonth() + 1,
                year: d.getFullYear(),
                name: d.toLocaleDateString('pt-PT', { month: 'short' }).replace('.', '')
            });
        }

        // Calcular totais por mês
        let currentBalance = totalEmContas;
        const data = months.map(m => {
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.data);
                return (tDate.getMonth() + 1) === m.month && tDate.getFullYear() === m.year;
            });

            const entradas = monthTransactions
                .filter(t => t.tipo === 'receita')
                .reduce((acc, t) => acc + parseFloat(t.valor), 0);

            const saidas = monthTransactions
                .filter(t => t.tipo === 'despesa')
                .reduce((acc, t) => acc + parseFloat(t.valor), 0);

            return {
                name: m.name.charAt(0).toUpperCase() + m.name.slice(1),
                entradas,
                saidas,
                net: entradas - saidas,
                month: m.month,
                year: m.year
            };
        });

        // Ajustar patrimônio retroactivamente a partir do saldo actual
        // O último mês no array 'data' é o mês actual.
        for (let i = data.length - 1; i >= 0; i--) {
            data[i].patrimonio = currentBalance;
            currentBalance -= data[i].net;
        }

        return data;
    };

    const chartData = getChartData();

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Painel de Controle</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Bem-vindo de volta, <span className="text-emerald-500">{user?.nome_completo || user?.nome_usuario}</span>. Veja seu resumo financeiro.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-xl text-white text-xs font-black shadow-lg shadow-emerald-500/20">
                        <Calendar size={14} /> {new Date().toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </header>

            {/* Resumo de Saldos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <BalanceCard title="Saldo em Contas" amount={totalEmContas} icon={<Wallet />} color="money-gradient shadow-emerald-500/10" />
                <BalanceCard title="Receitas Mensais" amount={totalReceitasMensais} icon={<ArrowUpRight />} color="bg-slate-900 border border-white/5 text-white" />
                <BalanceCard title="Despesas Mensais" amount={totalDespesasMensais} icon={<ArrowDownLeft />} color="bg-slate-900 border border-white/5 text-white" />
                <BalanceCard title="Patrimônio Total" amount={totalReceitasAcumuladas} icon={<Plus />} color="bg-slate-900 border border-white/5 text-secondary" />
            </div>

            {/* Gráfico de Evolução Financeira */}
            <div className="space-y-6">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-secondary rounded-full"></div>
                        Evolução Patrimonial (Entradas vs Saídas)
                    </h2>
                </div>
                <Card className="bg-slate-900/40 border-white/5 p-8 h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorPat" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }}
                                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }}
                                itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                                labelStyle={{ color: '#fff', fontWeight: 'black', marginBottom: '8px' }}
                            />
                            <Area type="monotone" dataKey="entradas" stroke="#10b981" fillOpacity={1} fill="url(#colorIn)" strokeWidth={3} name="Entradas" />
                            <Area type="monotone" dataKey="saidas" stroke="#ef4444" fillOpacity={1} fill="url(#colorOut)" strokeWidth={3} name="Saídas" />
                            <Area type="monotone" dataKey="patrimonio" stroke="#f59e0b" fillOpacity={1} fill="url(#colorPat)" strokeWidth={4} name="Património" />
                        </AreaChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                            Actividades recentes
                        </h2>
                    </div>

                    <Card className="!p-0 overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="divide-y divide-white/5 max-h-[480px] overflow-y-auto">
                            {activities.length > 0 ? (
                                activities.map((act, i) => (
                                    <div key={act.id || i} className="p-5 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ${getActivityColor(act.tipo)}`}>
                                                {getActivityIcon(act.tipo)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-200 tracking-tight text-sm">{act.descricao}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{act.tela}</span>
                                                    <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                    <span className="text-[10px] text-slate-500 font-bold">
                                                        {new Date(act.data).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        {act.valor && (
                                            <p className={`text-sm font-black flex-shrink-0 ${act.tipo === 'receita' ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {act.tipo === 'receita' ? '+' : '-'}{formatCurrency(act.valor)}
                                            </p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-slate-950/20">
                                    <Activity className="mx-auto text-slate-700 mb-4 opacity-40" size={48} />
                                    <p className="text-slate-500 font-bold">Nenhuma actividade registada ainda.</p>
                                    <p className="text-[10px] text-slate-600 mt-1 font-bold uppercase tracking-widest">As suas acções aparecerão aqui.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <div className="space-y-8">
                    <div className="px-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            Resumo de Saldos
                        </h2>
                    </div>

                    <Card className="border-white/5 bg-slate-900/40">
                        <div className="space-y-10">
                            {/* Resumo Rápido de Contas */}
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Suas Contas</h3>
                                {accounts.map(acc => (
                                    <div key={acc.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-emerald-500/30 transition-all">
                                        <span className="text-xs font-bold text-slate-300">{acc.nome}</span>
                                        <span className="text-xs font-black text-white">{formatCurrency(acc.saldo)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Seção de Despesas Mensais por Categoria */}
                            {categories.filter(c => c.tipo === 'despesa' && (totaisPorCategoria[c.id_categoria] || 0) > 0).length > 0 && (
                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">Gastos p/ Categoria</h3>
                                    <div className="space-y-6">
                                        {categories
                                            .filter(c => c.tipo === 'despesa' && (totaisPorCategoria[c.id_categoria] || 0) > 0)
                                            .sort((a, b) => (totaisPorCategoria[b.id_categoria] || 0) - (totaisPorCategoria[a.id_categoria] || 0))
                                            .slice(0, 3)
                                            .map(c => {
                                                const valor = totaisPorCategoria[c.id_categoria] || 0;
                                                const percentagem = balance.total_expense > 0 ? (valor / balance.total_expense) * 100 : 0;
                                                return (
                                                    <div key={c.id_categoria} className="space-y-2.5">
                                                        <div className="flex justify-between items-end">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-200">{c.nome}</span>
                                                                <span className="text-[10px] text-slate-500 font-bold">{formatCurrency(valor)}</span>
                                                            </div>
                                                            <span className="text-[10px] font-black text-red-400">
                                                                {percentagem.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-red-500 rounded-full transition-all duration-1000" style={{ width: `${percentagem}%` }}></div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

const BalanceCard = ({ title, amount, icon, color }) => (
    <div className={`p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${color}`}>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-[11px] font-black uppercase tracking-[0.1em] opacity-60 mb-1">{title}</p>
                <h3 className="text-2xl font-black tracking-tight">{formatCurrency(amount)}</h3>
            </div>
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md group-hover:rotate-12 transition-transform shadow-lg border border-white/10">
                {React.cloneElement(icon, { size: 20 })}
            </div>
        </div>
        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
    </div>
);

export default Painel;
