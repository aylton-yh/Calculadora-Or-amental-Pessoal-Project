import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from '../components/ui';
import {
    Plus,
    DollarSign,
    Calendar,
    FileText,
    ShoppingCart,
    Car,
    Heart,
    MoreHorizontal,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../utils/formatters';
import { useUI } from '../context/UIContext';
import { useBudget } from '../context/BudgetContext';
import IconRenderer from '../components/ui/IconRenderer';

const Despesas = () => {
    const { startProcessing, stopProcessing } = useUI();
    const {
        transactions,
        categories,
        balance,
        addTransaction,
        deleteTransaction,
        addCategory,
        fetchData,
        logActivity,
        loading: contextLoading
    } = useBudget();

    const [showAddForm, setShowAddForm] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    // Filtrar apenas despesas
    const expenses = transactions.filter(t => t.tipo === 'despesa');

    useEffect(() => {
        fetchData();
    }, []);

    const [formData, setFormData] = useState({
        id_categoria: '',
        descricao: '',
        data: new Date().toISOString().split('T')[0],
        valor: ''
    });


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        startProcessing('Registrando a sua despesa...');

        try {
            const res = await addTransaction({
                ...formData,
                tipo: 'despesa'
            });

            if (res.success) {
                setFormData({
                    id_categoria: '',
                    descricao: '',
                    data: new Date().toISOString().split('T')[0],
                    valor: ''
                });
                setShowAddForm(false);
            }
        } catch (err) {
            console.error('Error adding expense:', err);
        } finally {
            stopProcessing();
        }
    };

    const handleAddCategory = async () => {
        if (newCategoryName.trim()) {
            const res = await addCategory({
                nome: newCategoryName,
                icone: 'Plus',
                cor: 'red',
                tipo: 'despesa'
            });
            if (res.success) {
                logActivity(`Categoria de despesa criada: "${newCategoryName}"`, 'sistema', 'Despesas');
                setNewCategoryName('');
                setShowAddCategory(false);
            } else {
                alert(res.message);
            }
        }
    };

    const handleDeleteExpense = async (id) => {
        startProcessing('Eliminando despesa...');
        await deleteTransaction(id);
        stopProcessing();
    };

    const handleDeleteCategory = (id) => {
        // Implementar no futuro com a API
        console.log('Eliminar categoria', id);
    };

    const totalExpense = expenses.reduce((sum, expense) => sum + parseFloat(expense.valor || 0), 0);

    return (
        <div className="space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Minhas Despesas</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Controle seus gastos e mantenha sua saúde financeira.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setShowAddCategory(true)}
                        variant="secondary"
                        className="flex items-center gap-2"
                    >
                        <Plus size={18} /> Categoria
                    </Button>
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-red-500 hover:bg-red-600 text-white px-6 shadow-lg shadow-red-500/20 border-none"
                    >
                        <Plus size={18} /> Nova Despesa
                    </Button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    <Card className="bg-gradient-to-br from-red-500 to-red-700 border-none p-8 text-white relative overflow-hidden">
                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-black uppercase tracking-widest opacity-70 mb-2">Total Gasto</p>
                                <h2 className="text-5xl font-black tracking-tight">{formatCurrency(balance.total_expense)}</h2>
                                <div className="flex items-center gap-2 mt-4">
                                    <div className="px-2 py-1 rounded-md bg-white/10 text-[10px] font-black uppercase tracking-wider backdrop-blur-md">
                                        {expenses.length} Transações
                                    </div>
                                </div>
                            </div>
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                <DollarSign size={32} />
                            </div>
                        </div>
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                    </Card>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center px-1">
                            <h2 className="text-xl font-black text-white flex items-center gap-2">
                                <div className="w-1 h-6 bg-red-500 rounded-full"></div>
                                Histórico de Saídas
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {expenses.length > 0 ? (
                                expenses.map((expense) => (
                                    <Card key={expense.id_transacao} className="!p-5 hover:bg-white/[0.02] transition-colors border-white/5 bg-slate-900/40">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                                                    <IconRenderer
                                                        iconName={categories.find(c => c.id_categoria === parseInt(expense.id_categoria))?.icone}
                                                        size={18}
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-200">{expense.descricao}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                            {categories.find(c => c.id_categoria === parseInt(expense.id_categoria))?.nome || 'Geral'}
                                                        </span>

                                                        <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                                                        <span className="text-[10px] text-slate-500 font-bold">{new Date(expense.data).toLocaleDateString('pt-PT')}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <p className="text-xl font-black text-red-400">
                                                    -{formatCurrency(expense.valor)}
                                                </p>
                                                <button
                                                    onClick={() => handleDeleteExpense(expense.id_transacao)}
                                                    className="w-10 h-10 rounded-xl bg-red-500/5 text-red-500 hover:bg-red-500/10 transition-colors flex items-center justify-center group"
                                                >
                                                    <Trash2 size={18} className="transition-transform group-hover:scale-110" />
                                                </button>
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            ) : (
                                <Card className="py-20 text-center border-dashed border-white/5 bg-transparent">
                                    <DollarSign className="mx-auto text-slate-700 mb-4 opacity-50" size={48} />
                                    <p className="text-slate-500 font-bold">Nenhuma despesa registrada.</p>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-8">
                    <AnimatePresence>
                        {showAddForm && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card className="p-6 border-red-500/20 bg-slate-900 shadow-2xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-black text-white">Novo Gasto</h3>
                                        <button onClick={() => setShowAddForm(false)} className="text-slate-500 hover:text-white transition-colors">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <form onSubmit={handleAddExpense} className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Categoria</label>
                                            <select
                                                name="id_categoria"
                                                value={formData.id_categoria}
                                                onChange={handleInputChange}
                                                required
                                                className="premium-input appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-slate-900">Selecionar...</option>
                                                {categories.map(cat => (
                                                    <option key={cat.id_categoria_despesa} value={cat.id_categoria_despesa} className="bg-slate-900">{cat.nome}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <Input
                                            label="Descrição"
                                            name="descricao"
                                            value={formData.descricao}
                                            onChange={handleInputChange}
                                            placeholder="Ex: Aluguel"
                                            icon={<FileText />}
                                            required
                                        />

                                        <Input
                                            label="Data"
                                            name="data"
                                            type="date"
                                            value={formData.data}
                                            onChange={handleInputChange}
                                            icon={<Calendar />}
                                            required
                                        />

                                        <Input
                                            label="Valor (Kz)"
                                            name="valor"
                                            type="number"
                                            step="0.01"
                                            value={formData.valor}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            icon={<DollarSign />}
                                            required
                                        />

                                        <Button
                                            type="submit"
                                            className="w-full bg-red-500 hover:bg-red-600 text-white h-12 shadow-red-500/20 border-none"
                                        >
                                            Salvar Despesa
                                        </Button>
                                    </form>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <Card className="p-6 border-white/5 bg-slate-900/40">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Categorias de Gasto</h3>
                        <div className="space-y-4">
                            {categories.map(cat => (
                                <div key={cat.id_categoria} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group hover:border-red-500/30 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-red-500 transition-colors">
                                            <IconRenderer iconName={cat.icone} size={18} />
                                        </div>
                                        <span className="text-sm font-bold text-slate-300">{cat.nome}</span>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteCategory(cat.id_categoria_despesa)}
                                        className="w-8 h-8 rounded-lg bg-red-500/0 text-red-500/0 group-hover:bg-red-500/10 group-hover:text-red-500 transition-all flex items-center justify-center"
                                        title="Eliminar categoria"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Modal for Categories */}
            <AnimatePresence>
                {showAddCategory && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowAddCategory(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 p-8 rounded-[2rem] shadow-2xl"
                        >
                            <h3 className="text-2xl font-black text-white mb-6">Nova Categoria</h3>
                            <Input
                                label="Nome da Categoria"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="Educação, Lazer..."
                                icon={<Plus />}
                            />
                            <div className="flex gap-3 mt-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowAddCategory(false)}
                                    className="flex-1"
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleAddCategory}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none"
                                >
                                    Adicionar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Despesas;
