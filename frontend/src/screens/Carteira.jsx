import React, { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { Card, Button, Input } from '../components/ui';
import {
    Wallet as WalletIcon,
    ArrowUpCircle,
    ArrowDownCircle,
    Scale,
    Landmark,
    Plus,
    CreditCard,
    Trash2,
    X,
    Check
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';

const Carteira = () => {
    const { balance, transactions, accounts, setAccounts, updateAccountBalance } = useBudget();
    const [mesSelecionado, setMesSelecionado] = useState(new Date().getMonth() + 1);
    const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

    const [isAddingAccount, setIsAddingAccount] = useState(false);
    const [isEditingBalance, setIsEditingBalance] = useState(null); // id da conta sendo editada
    const [newAccount, setNewAccount] = useState({ nome: '', tipo: 'Numerário', saldo: '' });
    const [tempBalance, setTempBalance] = useState('');

    const handleAddAccount = (e) => {
        e.preventDefault();
        const nextId = accounts.length > 0 ? Math.max(...accounts.map(c => c.id)) + 1 : 1;

        setAccounts([...accounts, {
            ...newAccount,
            id: nextId,
            saldo: parseFloat(newAccount.saldo || 0)
        }]);
        setNewAccount({ nome: '', tipo: 'Numerário', saldo: '' });
        setIsAddingAccount(false);
    };

    const handleUpdateBalance = (e) => {
        e.preventDefault();
        updateAccountBalance(isEditingBalance, tempBalance);
        setIsEditingBalance(null);
        setTempBalance('');
    };

    // Filtrar transações por mês e ano selecionados
    const transacoesFiltradas = transactions.filter(t => {
        const data = new Date(t.data);
        return (data.getMonth() + 1) === mesSelecionado && data.getFullYear() === anoSelecionado;
    });

    const totalIncomeMes = transacoesFiltradas
        .filter(t => t.tipo === 'receita')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const totalExpenseMes = transacoesFiltradas
        .filter(t => t.tipo === 'despesa')
        .reduce((acc, curr) => acc + parseFloat(curr.valor), 0);

    const totalSaldoContas = accounts.reduce((acc, curr) => acc + curr.saldo, 0);

    const getIcon = (tipo) => {
        return tipo === 'Banco' ? <Landmark size={20} /> : <WalletIcon size={20} />;
    };

    const meses = [
        { value: 1, label: 'Janeiro' }, { value: 2, label: 'Fevereiro' }, { value: 3, label: 'Março' },
        { value: 4, label: 'Abril' }, { value: 5, label: 'Maio' }, { value: 6, label: 'Junho' },
        { value: 7, label: 'Julho' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Setembro' },
        { value: 10, label: 'Outubro' }, { value: 11, label: 'Novembro' }, { value: 12, label: 'Dezembro' }
    ];

    const anos = [2024, 2025, 2026];

    return (
        <div className="space-y-10 animate-fade-in">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Minha Carteira</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Visão detalhada de suas contas e fluxo financeiro.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/5">
                        <select
                            value={mesSelecionado}
                            onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-black text-slate-300 px-3 py-2 outline-none cursor-pointer hover:text-emerald-500 transition-colors uppercase tracking-widest"
                        >
                            {meses.map(m => <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>)}
                        </select>
                        <div className="w-px h-4 bg-white/10"></div>
                        <select
                            value={anoSelecionado}
                            onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
                            className="bg-transparent text-xs font-black text-slate-300 px-3 py-2 outline-none cursor-pointer hover:text-emerald-500 transition-colors uppercase tracking-widest"
                        >
                            {anos.map(y => <option key={y} value={y} className="bg-slate-900">{y}</option>)}
                        </select>
                    </div>
                </div>
            </header>

            {/* Grid de Estatísticas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Saldo em Contas"
                    value={totalSaldoContas}
                    icon={<WalletIcon />}
                    color="money-gradient shadow-emerald-500/10"
                />
                <StatCard
                    title="Entradas no Mês"
                    value={totalIncomeMes}
                    icon={<ArrowUpCircle />}
                    color="bg-slate-900 border border-white/10 text-emerald-500"
                />
                <StatCard
                    title="Saídas no Mês"
                    value={totalExpenseMes}
                    icon={<ArrowDownCircle />}
                    color="bg-slate-900 border border-white/10 text-red-500"
                />
                <StatCard
                    title="Resultado Mensal"
                    value={totalIncomeMes - totalExpenseMes}
                    icon={<Scale />}
                    color="bg-slate-900 border border-white/10 text-blue-400"
                />
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
                {/* Seção de Contas */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="px-1 flex justify-between items-center">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                            Minhas Contas
                        </h2>
                    </div>

                    <div className="space-y-4">
                        {accounts.map(acc => (
                            <Card
                                key={acc.id}
                                onClick={() => {
                                    setIsEditingBalance(acc.id);
                                    setTempBalance(acc.saldo.toString());
                                }}
                                className="bg-slate-900/40 border-white/5 hover:border-emerald-500/30 transition-all group flex items-center justify-between p-6 cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                                        {getIcon(acc.tipo)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white tracking-tight">{acc.nome}</p>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{acc.tipo}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-slate-200">{formatCurrency(acc.saldo)}</p>
                                    <p className="text-[9px] text-slate-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Clique para editar</p>
                                </div>
                            </Card>
                        ))}

                        <Button
                            onClick={() => setIsAddingAccount(true)}
                            variant="secondary"
                            className="w-full h-14 rounded-2xl border-dashed border-2 border-white/5 bg-transparent hover:bg-white/5 text-slate-500 hover:text-slate-300 font-bold"
                        >
                            + Adicionar Nova Conta
                        </Button>
                    </div>
                </div>

                {/* Resumo Detalhado */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="px-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            Transações: {meses.find(m => m.value === mesSelecionado)?.label} / {anoSelecionado}
                        </h2>
                    </div>

                    <Card className="bg-slate-900/40 border-white/5 min-h-[400px] flex flex-col overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descrição</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transacoesFiltradas.length > 0 ? (
                                        transacoesFiltradas.map(t => (
                                            <tr key={t.id_transacao} className="hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4 text-sm font-bold text-slate-400">{new Date(t.data).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-slate-200">{t.descricao}</p>
                                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{t.nome_categoria}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${t.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {t.tipo === 'receita' ? 'Depósito' : 'Retirada'}
                                                    </span>
                                                </td>
                                                <td className={`px-6 py-4 text-right font-black ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-red-400'}`}>
                                                    {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-20 text-center">
                                                <p className="text-slate-500 italic font-medium">Nenhuma transação encontrada para este período.</p>
                                                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-2">Tente mudar o mês ou o ano.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal: Adicionar Conta */}
            <AnimatePresence>
                {isAddingAccount && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsAddingAccount(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h2 className="text-2xl font-black text-white mb-6">Nova Conta</h2>
                            <form onSubmit={handleAddAccount} className="space-y-6">
                                <Input
                                    label="Nome da Conta"
                                    placeholder="Ex: Banco BAI"
                                    value={newAccount.nome}
                                    onChange={e => setNewAccount({ ...newAccount, nome: e.target.value })}
                                    required
                                />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Tipo de Conta</label>
                                    <select
                                        value={newAccount.tipo}
                                        onChange={e => setNewAccount({ ...newAccount, tipo: e.target.value })}
                                        className="premium-input appearance-none cursor-pointer"
                                    >
                                        <option value="Numerário" className="bg-slate-900">Numerário (Físico)</option>
                                        <option value="Banco" className="bg-slate-900">Bancária</option>
                                    </select>
                                </div>
                                <Input
                                    label="Saldo Inicial (Kz)"
                                    type="number"
                                    placeholder="0,00"
                                    value={newAccount.saldo}
                                    onChange={e => setNewAccount({ ...newAccount, saldo: e.target.value })}
                                    required
                                />
                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="secondary" onClick={() => setIsAddingAccount(false)} className="flex-1">Cancelar</Button>
                                    <Button type="submit" className="flex-1 money-gradient border-none">Criar Conta</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal: Editar Saldo */}
            <AnimatePresence>
                {isEditingBalance !== null && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsEditingBalance(null)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="relative w-full max-w-sm bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] shadow-2xl"
                        >
                            <h2 className="text-xl font-black text-white mb-2">Atualizar Saldo</h2>
                            <p className="text-xs text-slate-500 mb-6 uppercase font-black tracking-widest">
                                {accounts.find(c => c.id === isEditingBalance)?.nome}
                            </p>
                            <form onSubmit={handleUpdateBalance} className="space-y-6">
                                <Input
                                    label="Novo Valor em Posse (Kz)"
                                    type="number"
                                    step="0.01"
                                    autoFocus
                                    value={tempBalance}
                                    onChange={e => setTempBalance(e.target.value)}
                                    required
                                />
                                <div className="flex gap-3">
                                    <Button type="button" variant="secondary" onClick={() => setIsEditingBalance(null)} className="flex-1">Pular</Button>
                                    <Button type="submit" className="flex-1 money-gradient border-none">Confirmar</Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }) => (
    <div className={`p-8 rounded-[2.5rem] relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 ${color}`}>
        <div className="relative z-10">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform">
                {React.cloneElement(icon, { size: 24 })}
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{title}</p>
            <h3 className="text-3xl font-black tracking-tighter">{formatCurrency(value)}</h3>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16"></div>
    </div>
);

export default Carteira;
