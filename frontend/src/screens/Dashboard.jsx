import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBudget } from '../context/BudgetContext';
import { Button, Card, Input } from '../components/ui';
import { Plus, ArrowUpRight, ArrowDownLeft, Wallet, Calendar, TrendingUp } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useUI } from '../context/UIContext';
import api from '../services/api';
import logo from '../assets/logo.png';
import '../styles/pages/Dashboard.css';

const Dashboard = () => {
    const { user, balance, transactions, categories, fetchData, logout } = useBudget();
    const { startProcessing, stopProcessing } = useUI();
    const [showAdd, setShowAdd] = useState(false);
    const [amount, setAmount] = useState('');
    const [desc, setDesc] = useState('');
    const [type, setType] = useState('expense');
    const [catId, setCatId] = useState('');

    const handleLogout = () => {
        startProcessing('Encerrando sua sessão...');
        setTimeout(() => {
            logout();
            stopProcessing();
        }, 1000);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        startProcessing('Processando a sua transação...');
        try {
            await api.post('/transactions', { amount, description: desc, type, category_id: catId, date: new Date().toISOString() });
            await fetchData();
            setShowAdd(false);
            setAmount(''); setDesc(''); setCatId('');
        } catch (err) {
            console.error(err);
        } finally {
            stopProcessing();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="dashboard-nav">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
                            <img src={logo} alt="RB" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black text-trust">Real <span className="text-money">Balance</span></span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/profile" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-bold text-trust">{user?.name}</p>
                                <p className="text-xs text-slate-400">@{user?.username || 'usuário'}</p>
                            </div>
                            <div className="w-10 h-10 bg-money/10 rounded-full flex items-center justify-center text-money font-bold overflow-hidden border-2 border-white shadow-sm">
                                {user?.photo ? (
                                    <img src={user.photo} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user?.name?.[0]
                                )}
                            </div>
                        </Link>
                        <Button variant="ghost" className="text-red-500 hover:bg-red-50 text-xs font-bold" onClick={handleLogout}>Sair</Button>
                    </div>
                </div>
            </nav>

            <div className="dashboard-container">
                <header className="mb-10">
                    <h1 className="text-4xl font-black text-trust mb-2">Painel de Controle</h1>
                    <p className="text-slate-500 font-medium">Gerencie seu fluxo de caixa e impulsione sua riqueza.</p>
                </header>

                {/* Balance Overview */}
                <div className="balance-grid">
                    <BalanceCard title="Saldo Total" amount={balance.balance} icon={<Wallet />} color="money-gradient" />
                    <BalanceCard title="Receitas Mensais" amount={balance.total_income} icon={<ArrowUpRight />} color="bg-white text-trust border-b-4 border-money" />
                    <BalanceCard title="Despesas Mensais" amount={balance.total_expense} icon={<ArrowDownLeft />} color="bg-white text-trust border-b-4 border-red-500" />
                </div>

                <div className="activity-section">
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-black text-trust">Atividade Recente</h2>
                            <Button onClick={() => setShowAdd(!showAdd)} className="money-gradient flex items-center gap-2 px-6 py-2.5 rounded-xl shadow-lg shadow-money/20">
                                <Plus size={18} /> Novo Lançamento
                            </Button>
                        </div>

                        {showAdd && (
                            <Card className="animate-in fade-in slide-in-from-top-4 duration-300 border-2 border-money/20 p-8 rounded-[2rem] shadow-2xl">
                                <form onSubmit={handleAdd} className="grid md:grid-cols-2 gap-6">
                                    <Input
                                        label="Valor do Investimento/Gasto (Kz)"
                                        type="number"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        required
                                        icon={<TrendingUp size={20} />}
                                    />
                                    <Input
                                        label="O que foi?"
                                        placeholder="Ex: Salário, Aluguel..."
                                        value={desc}
                                        onChange={(e) => setDesc(e.target.value)}
                                        required
                                        icon={<Plus size={20} />}
                                    />

                                    <Select
                                        label="Fluxo"
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        icon={type === 'income' ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                                    >
                                        <option value="expense">📉 Saída (Despesa)</option>
                                        <option value="income">📈 Entrada (Receita)</option>
                                    </Select>

                                    <Select
                                        label="Categoria"
                                        value={catId}
                                        onChange={(e) => setCatId(e.target.value)}
                                        required
                                        icon={<Wallet size={20} />}
                                    >
                                        <option value="">Selecionar...</option>
                                        {categories.filter(c => c.type === type).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </Select>

                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="rounded-xl font-bold">Cancelar</Button>
                                        <Button type="submit" className="money-gradient px-10 rounded-xl shadow-lg">Confirmar Transação</Button>
                                    </div>
                                </form>
                            </Card>
                        )}

                        <div className="space-y-4">
                            {transactions.length > 0 ? (
                                transactions.map(t => (
                                    <div key={t.id} className="transaction-card">
                                        <div className="flex items-center gap-5">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-money/10 text-money' : 'bg-red-50 text-red-500'}`}>
                                                {t.type === 'income' ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-trust text-lg">{t.description}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                                        <Calendar size={12} /> {formatDate(t.date)}
                                                    </span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${t.type === 'income' ? 'bg-money/10 text-money' : 'bg-red-50 text-red-500'}`}>
                                                        {t.category_name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className={`text-xl font-black ${t.type === 'income' ? 'text-money' : 'text-red-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                                    <p className="text-slate-400 font-bold">Nenhuma transação encontrada.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-trust">Distribuição</h2>
                        <Card className="distribution-card">
                            <div className="space-y-6">
                                {categories.map(c => (
                                    <div key={c.id} className="group cursor-default">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="font-bold text-trust group-hover:text-money transition-colors">{c.name}</span>
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${c.type === 'income' ? 'bg-money/10 text-money' : 'bg-red-50 text-red-500'}`}>
                                                {c.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                        </div>
                                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full transition-all duration-1000 ${c.type === 'income' ? 'bg-money' : 'bg-red-400'}`} style={{ width: '45%' }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

const BalanceCard = ({ title, amount, icon, color }) => (
    <div className={`p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${color}`}>
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-sm font-bold uppercase tracking-wider opacity-70 mb-1">{title}</p>
                <h3 className="text-3xl font-black">{formatCurrency(amount)}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md group-hover:rotate-12 transition-transform shadow-lg">
                {icon}
            </div>
        </div>
        {/* Decorative background shape */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
    </div>
);

export default Dashboard;
