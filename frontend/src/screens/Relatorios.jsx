import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card, Button } from '../components/ui';
import {
    FileText,
    Download,
    Printer,
    Trash2,
    Eye,
    Filter,
    Calendar,
    ArrowUpRight,
    ArrowDownLeft,
    CheckSquare,
    Square,
    FileSpreadsheet,
    TrendingUp,
    TrendingDown,
    BarChart3,
    X,
    ChevronDown,
    AlertTriangle,
    CheckCircle,
    Database,
    Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/formatters';
import api from '../services/api';

// Filtros de período
const PERIODOS = [
    { value: 'dia', label: 'Hoje' },
    { value: 'semana', label: 'Esta Semana' },
    { value: 'mes', label: 'Este Mês' },
    { value: 'ano', label: 'Este Ano' },
    { value: 'todos', label: 'Todos' },
];

const TIPOS_RELATORIO = [
    { value: 'geral', label: 'Relatório Geral', icon: <BarChart3 size={16} /> },
    { value: 'receitas', label: 'Só Receitas', icon: <TrendingUp size={16} /> },
    { value: 'despesas', label: 'Só Despesas', icon: <TrendingDown size={16} /> },
];

// Utilitários de data
const isInPeriod = (dateStr, periodo) => {
    const date = new Date(dateStr);
    const now = new Date();
    const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
    switch (periodo) {
        case 'dia': return date >= startOfDay(now);
        case 'semana': {
            const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
            return date >= weekAgo;
        }
        case 'mes': return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        case 'ano': return date.getFullYear() === now.getFullYear();
        default: return true;
    }
};

const Relatorios = () => {
    const { transactions, activities, user } = useBudget();
    const printRef = useRef();

    const [periodo, setPeriodo] = useState('mes');
    const [tipoRelatorio, setTipoRelatorio] = useState('geral');
    const [relatoriosSalvos, setRelatoriosSalvos] = useState([]);
    const [selecionados, setSelecionados] = useState([]);
    const [showPreview, setShowPreview] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [filterOpen, setFilterOpen] = useState(false);
    const [gerandoRelatorio, setGerandoRelatorio] = useState(false);
    const [carregandoRelatorios, setCarregandoRelatorios] = useState(true);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // ── Carregar relatórios guardados do "banco de dados" ao montar ──
    useEffect(() => {
        const carregar = async () => {
            try {
                const res = await api.get('/reports');
                setRelatoriosSalvos(res.data || []);
            } catch (err) {
                console.error('Erro ao carregar relatórios:', err);
            } finally {
                setCarregandoRelatorios(false);
            }
        };
        carregar();
    }, []);

    // Filtrar transações pelo período selecionado
    const transacoesFiltradas = useMemo(() => {
        let filtered = transactions.filter(t => isInPeriod(t.data, periodo));
        if (tipoRelatorio === 'receitas') filtered = filtered.filter(t => t.tipo === 'receita');
        if (tipoRelatorio === 'despesas') filtered = filtered.filter(t => t.tipo === 'despesa');
        return filtered.sort((a, b) => new Date(b.data) - new Date(a.data));
    }, [transactions, periodo, tipoRelatorio]);

    const totalReceitas = transacoesFiltradas.filter(t => t.tipo === 'receita').reduce((s, t) => s + parseFloat(t.valor), 0);
    const totalDespesas = transacoesFiltradas.filter(t => t.tipo === 'despesa').reduce((s, t) => s + parseFloat(t.valor), 0);
    const saldoLiquido = totalReceitas - totalDespesas;

    // Actividades do sistema filtradas
    const actividadesFiltradas = useMemo(() =>
        (activities || []).filter(a => isInPeriod(a.data, periodo)),
        [activities, periodo]
    );

    // ── Gerar e guardar relatório no banco de dados ──────────────────
    const gerarRelatorio = useCallback(async (formato) => {
        setGerandoRelatorio(true);
        try {
            // Payload que espelha exactamente a tabela `relatorios` do MySQL
            const payload = {
                nome: `Relatório ${TIPOS_RELATORIO.find(t => t.value === tipoRelatorio)?.label} — ${PERIODOS.find(p => p.value === periodo)?.label}`,
                tipo: tipoRelatorio,
                periodo: PERIODOS.find(p => p.value === periodo)?.label,
                periodo_valor: periodo,
                formato: formato.toUpperCase(),
                total_receitas: totalReceitas,
                total_despesas: totalDespesas,
                saldo_liquido: saldoLiquido,
                total_transacoes: transacoesFiltradas.length,
                total_actividades: actividadesFiltradas.length,
                dados_json: JSON.stringify(transacoesFiltradas), // snapshot completo
                id_usuario: user?.id_usuario || 1,
                // Aliases para a UI (compatibilidade com o state local)
                totalReceitas,
                totalDespesas,
                saldo: saldoLiquido,
                transacoes: transacoesFiltradas.length,
                actividades: actividadesFiltradas.length,
                dados: transacoesFiltradas,
            };

            // POST → INSERT INTO relatorios
            const res = await api.post('/reports', payload);
            const novoRelatorio = res.data;

            setRelatoriosSalvos(prev => [novoRelatorio, ...prev]);
            setSuccessMsg(`Relatório em ${formato.toUpperCase()} guardado com sucesso!`);
            setTimeout(() => setSuccessMsg(''), 4000);

            // Acção de download / impressão
            if (formato === 'pdf') handlePrint();
            else if (formato === 'excel') exportarCSV({ ...payload, geradoEm: new Date().toISOString() });
        } catch (err) {
            console.error('Erro ao guardar relatório:', err);
            setErrorMsg('Erro ao guardar o relatório. Tente novamente.');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setGerandoRelatorio(false);
        }
    }, [tipoRelatorio, periodo, totalReceitas, totalDespesas, saldoLiquido, transacoesFiltradas, actividadesFiltradas, user]);

    // Exportar CSV (Excel compatível)
    const exportarCSV = (relatorio) => {
        const BOM = '\uFEFF';
        const linhas = [
            ['Real Balance — ' + relatorio.nome],
            ['Gerado em:', new Date(relatorio.geradoEm).toLocaleString('pt-PT')],
            ['Período:', relatorio.periodo],
            ['Utilizador:', user?.nome_completo || ''],
            [],
            ['Data', 'Descrição', 'Categoria', 'Tipo', 'Valor (Kz)'],
            ...relatorio.dados.map(t => [
                new Date(t.data).toLocaleDateString('pt-PT'),
                t.descricao,
                t.nome_categoria || '',
                t.tipo === 'receita' ? 'Receita' : 'Despesa',
                parseFloat(t.valor).toFixed(2)
            ]),
            [],
            ['Total Receitas', '', '', '', totalReceitas.toFixed(2)],
            ['Total Despesas', '', '', '', totalDespesas.toFixed(2)],
            ['Saldo Líquido', '', '', '', saldoLiquido.toFixed(2)],
        ];
        const csvContent = BOM + linhas.map(row => row.join(';')).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio_${Date.now()}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Impressão / PDF via browser
    const handlePrint = () => {
        const printContent = document.getElementById('print-area');
        if (!printContent) return;
        const win = window.open('', '_blank');
        win.document.write(`
            <html><head>
            <title>Relatório Real Balance</title>
            <style>
                body { font-family: Arial, sans-serif; color: #111; background: #fff; padding: 40px; }
                h1 { color: #10b981; font-size: 24px; margin-bottom: 4px; }
                h2 { font-size: 16px; color: #333; margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 24px; }
                th { background: #10b981; color: white; padding: 10px 14px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; }
                td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
                tr:nth-child(even) td { background: #f9fafb; }
                .receita { color: #10b981; font-weight: bold; }
                .despesa { color: #ef4444; font-weight: bold; }
                .summary { display: flex; gap: 32px; margin-top: 32px; }
                .summary-card { padding: 16px 24px; border: 1px solid #e5e7eb; border-radius: 12px; flex: 1; }
                .summary-label { font-size: 10px; text-transform: uppercase; color: #6b7280; letter-spacing: 0.1em; }
                .summary-value { font-size: 22px; font-weight: 900; margin-top: 4px; }
                .footer { margin-top: 40px; font-size: 10px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 12px; }
            </style></head><body>
            ${printContent.innerHTML}
            </body></html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 500);
    };

    const toggleSelect = (id) => {
        setSelecionados(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };
    const toggleSelectAll = () => {
        setSelecionados(prev =>
            prev.length === relatoriosSalvos.length
                ? []
                : relatoriosSalvos.map(r => r.id_relatorio)
        );
    };

    // DELETE em lote → DELETE FROM relatorios WHERE id_relatorio IN (?)
    const eliminarSelecionados = async () => {
        try {
            await api.post('/reports/batch-delete', { ids: selecionados });
            setRelatoriosSalvos(prev => prev.filter(r => !selecionados.includes(r.id_relatorio)));
            setSelecionados([]);
            setShowDeleteConfirm(false);
            setSuccessMsg(`${selecionados.length} relatório(s) eliminado(s) com sucesso.`);
            setTimeout(() => setSuccessMsg(''), 3000);
        } catch (err) {
            console.error('Erro ao eliminar:', err);
            setErrorMsg('Erro ao eliminar. Tente novamente.');
            setTimeout(() => setErrorMsg(''), 3000);
            setShowDeleteConfirm(false);
        }
    };

    const periodoLabel = PERIODOS.find(p => p.value === periodo)?.label;
    const tipoLabel = TIPOS_RELATORIO.find(t => t.value === tipoRelatorio)?.label;

    return (
        <div className="space-y-10">
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Relatórios</h1>
                    <p className="text-slate-400 font-medium tracking-tight">
                        Análise automática e exportação detalhada das suas finanças.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Período */}
                    <div className="relative">
                        <button
                            onClick={() => setFilterOpen(!filterOpen)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-black rounded-xl hover:border-emerald-500/40 transition-all uppercase tracking-widest"
                        >
                            <Filter size={14} />
                            {periodoLabel}
                            <ChevronDown size={12} className={`transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {filterOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: -6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -6 }}
                                    className="absolute top-full mt-2 right-0 bg-slate-900 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden min-w-[160px]"
                                >
                                    {PERIODOS.map(p => (
                                        <button
                                            key={p.value}
                                            onClick={() => { setPeriodo(p.value); setFilterOpen(false); }}
                                            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold transition-colors ${periodo === p.value ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                        >
                                            <Calendar size={12} />
                                            {p.label}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Tipo */}
                    <select
                        value={tipoRelatorio}
                        onChange={e => setTipoRelatorio(e.target.value)}
                        className="px-4 py-2.5 bg-slate-900/80 border border-white/10 text-slate-300 text-xs font-black rounded-xl hover:border-emerald-500/40 transition-all uppercase tracking-widest outline-none cursor-pointer"
                    >
                        {TIPOS_RELATORIO.map(t => (
                            <option key={t.value} value={t.value} className="bg-slate-900 normal-case">{t.label}</option>
                        ))}
                    </select>
                </div>
            </header>

            {/* Alerta de Sucesso */}
            <AnimatePresence>
                {successMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-bold"
                    >
                        <CheckCircle size={18} />
                        {successMsg}
                        <span className="ml-auto text-xs flex items-center gap-1.5 text-emerald-500/60">
                            <Database size={11} /> Guardado no Banco de Dados
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {errorMsg && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold"
                    >
                        <AlertTriangle size={18} />
                        {errorMsg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="money-gradient border-none p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center"><TrendingUp size={20} /></div>
                            <p className="text-[11px] font-black uppercase tracking-[0.15em] opacity-70">Total Receitas</p>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight">{formatCurrency(totalReceitas)}</h3>
                        <p className="text-[10px] opacity-60 mt-1 font-bold">{transacoesFiltradas.filter(t => t.tipo === 'receita').length} entradas · {periodoLabel}</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </Card>

                <Card className="bg-red-500/10 border-red-500/20 p-6 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-red-400"><TrendingDown size={20} /></div>
                            <p className="text-[11px] font-black text-red-400 uppercase tracking-[0.15em]">Total Despesas</p>
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-red-400">{formatCurrency(totalDespesas)}</h3>
                        <p className="text-[10px] text-red-400/60 mt-1 font-bold">{transacoesFiltradas.filter(t => t.tipo === 'despesa').length} saídas · {periodoLabel}</p>
                    </div>
                </Card>

                <Card className={`border-white/10 p-6 relative overflow-hidden ${saldoLiquido >= 0 ? 'bg-slate-900/60' : 'bg-red-900/20'}`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${saldoLiquido >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                <BarChart3 size={20} />
                            </div>
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em]">Saldo Líquido</p>
                        </div>
                        <h3 className={`text-3xl font-black tracking-tight ${saldoLiquido >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(saldoLiquido)}</h3>
                        <p className="text-[10px] text-slate-500 mt-1 font-bold">{transacoesFiltradas.length} transações · {periodoLabel}</p>
                    </div>
                </Card>
            </div>

            {/* Botões de Acção Principal */}
            <Card className="border-white/5 bg-slate-900/40 p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest">Gerar & Exportar Relatório</h3>
                        <p className="text-xs text-slate-500 mt-1 font-medium">
                            {tipoLabel} · {periodoLabel} · {transacoesFiltradas.length} transações
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={() => setShowPreview(true)}
                            variant="secondary"
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                        >
                            <Eye size={16} /> Pré-visualizar
                        </Button>
                        <Button
                            onClick={() => gerarRelatorio('pdf')}
                            disabled={gerandoRelatorio}
                            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 text-xs font-black uppercase tracking-wider"
                        >
                            <FileText size={16} />
                            {gerandoRelatorio ? 'Gerando...' : 'PDF'}
                        </Button>
                        <Button
                            onClick={() => gerarRelatorio('excel')}
                            disabled={gerandoRelatorio}
                            className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider"
                        >
                            <FileSpreadsheet size={16} />
                            {gerandoRelatorio ? 'Gerando...' : 'Excel'}
                        </Button>
                        <Button
                            onClick={handlePrint}
                            variant="ghost"
                            className="flex items-center gap-2 text-xs font-black uppercase tracking-wider"
                        >
                            <Printer size={16} /> Imprimir
                        </Button>
                    </div>
                </div>
            </Card>

            {/* Tabela de Transações */}
            <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <div className="w-1 h-6 bg-emerald-500 rounded-full"></div>
                        Detalhe de Transações
                        <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg ml-2">
                            {transacoesFiltradas.length}
                        </span>
                    </h2>
                </div>

                <Card className="!p-0 overflow-hidden border-white/5 bg-slate-900/40">
                    {transacoesFiltradas.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Data</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Descrição</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Categoria</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Tipo</th>
                                        <th className="px-6 py-4 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {transacoesFiltradas.map(t => (
                                        <tr key={t.id_transacao} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4 text-sm font-bold text-slate-400 whitespace-nowrap">
                                                {new Date(t.data).toLocaleDateString('pt-PT')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-200">{t.descricao}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                                    {t.nome_categoria || '—'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider
                                                    ${t.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-400'}`}>
                                                    {t.tipo === 'receita' ? <ArrowUpRight size={10} /> : <ArrowDownLeft size={10} />}
                                                    {t.tipo === 'receita' ? 'Receita' : 'Despesa'}
                                                </span>
                                            </td>
                                            <td className={`px-6 py-4 text-right font-black ${t.tipo === 'receita' ? 'text-emerald-500' : 'text-red-400'}`}>
                                                {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="border-t border-white/10 bg-white/[0.02]">
                                        <td colSpan={4} className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Balanço do Período</td>
                                        <td className={`px-6 py-4 text-right text-lg font-black ${saldoLiquido >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
                                            {saldoLiquido >= 0 ? '+' : ''}{formatCurrency(saldoLiquido)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <FileText className="mx-auto text-slate-700 mb-4 opacity-40" size={48} />
                            <p className="text-slate-500 font-bold">Nenhuma transação para o período selecionado.</p>
                            <p className="text-[10px] text-slate-600 mt-1 font-bold uppercase tracking-widest">Tente mudar o filtro de período.</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Registo de Actividades do Sistema */}
            {actividadesFiltradas.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-secondary rounded-full"></div>
                            Actividades do Sistema
                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg ml-2">
                                {actividadesFiltradas.length}
                            </span>
                        </h2>
                    </div>
                    <Card className="!p-0 overflow-hidden border-white/5 bg-slate-900/40">
                        <div className="divide-y divide-white/5">
                            {actividadesFiltradas.slice(0, 20).map((act, i) => (
                                <div key={i} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${act.tipo === 'receita' ? 'bg-emerald-500/10 text-emerald-500' :
                                        act.tipo === 'despesa' ? 'bg-red-500/10 text-red-400' :
                                            'bg-slate-500/10 text-slate-400'}`}>
                                        {act.tipo === 'receita' ? <ArrowUpRight size={14} /> :
                                            act.tipo === 'despesa' ? <ArrowDownLeft size={14} /> :
                                                <FileText size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-200 truncate">{act.descricao}</p>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{act.tela || 'Sistema'}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap">
                                        {new Date(act.data).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {/* Relatórios Guardados */}
            {relatoriosSalvos.length > 0 && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                            Relatórios Gerados
                            <span className="text-xs font-bold text-slate-500 bg-white/5 px-2 py-1 rounded-lg ml-2">
                                {relatoriosSalvos.length}
                            </span>
                        </h2>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleSelectAll}
                                className="text-[10px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest"
                            >
                                {selecionados.length === relatoriosSalvos.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                            </button>
                            {selecionados.length > 0 && (
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all text-xs font-black uppercase tracking-widest"
                                >
                                    <Trash2 size={14} /> Eliminar ({selecionados.length})
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {relatoriosSalvos.map(r => (
                            <Card
                                key={r.id}
                                className={`border transition-all group ${selecionados.includes(r.id) ? 'border-red-500/40 bg-red-500/5' : 'border-white/5 bg-slate-900/40 hover:border-white/10'}`}
                            >
                                <div className="flex items-center gap-4">
                                    <button onClick={() => toggleSelect(r.id)} className="text-slate-500 hover:text-white transition-colors flex-shrink-0">
                                        {selecionados.includes(r.id) ? <CheckSquare size={18} className="text-red-400" /> : <Square size={18} />}
                                    </button>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.formato === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                        {r.formato === 'PDF' ? <FileText size={18} /> : <FileSpreadsheet size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-200 text-sm truncate">{r.nome}</p>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${r.formato === 'PDF' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{r.formato}</span>
                                            <span className="text-[10px] text-slate-500">{r.transacoes} transações</span>
                                            <span className="text-[10px] text-slate-600">·</span>
                                            <span className="text-[10px] text-slate-500">{new Date(r.geradoEm).toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                    <div className="hidden group-hover:flex items-center gap-2">
                                        <div className="text-right mr-4">
                                            <p className="text-xs font-black text-emerald-400">{formatCurrency(r.totalReceitas)}</p>
                                            <p className="text-xs font-black text-red-400">-{formatCurrency(r.totalDespesas)}</p>
                                        </div>
                                        <button
                                            onClick={() => r.formato === 'PDF' ? handlePrint() : exportarCSV(r)}
                                            className="w-8 h-8 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center"
                                            title="Descarregar"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => { setSelecionados([r.id]); setShowDeleteConfirm(true); }}
                                            className="w-8 h-8 rounded-lg bg-red-500/5 text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Área de Impressão (hidden) */}
            <div id="print-area" style={{ display: 'none' }}>
                <h1>Real Balance — Relatório Financeiro</h1>
                <h2>{tipoLabel} · {periodoLabel}</h2>
                <p>Utilizador: {user?.nome_completo} · Gerado em: {new Date().toLocaleString('pt-PT')}</p>
                <div className="summary">
                    <div className="summary-card">
                        <div className="summary-label">Total Receitas</div>
                        <div className="summary-value" style={{ color: '#10b981' }}>{formatCurrency(totalReceitas)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">Total Despesas</div>
                        <div className="summary-value" style={{ color: '#ef4444' }}>{formatCurrency(totalDespesas)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">Saldo Líquido</div>
                        <div className="summary-value" style={{ color: saldoLiquido >= 0 ? '#10b981' : '#ef4444' }}>{formatCurrency(saldoLiquido)}</div>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Descrição</th>
                            <th>Categoria</th>
                            <th>Tipo</th>
                            <th>Valor (Kz)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transacoesFiltradas.map(t => (
                            <tr key={t.id_transacao}>
                                <td>{new Date(t.data).toLocaleDateString('pt-PT')}</td>
                                <td>{t.descricao}</td>
                                <td>{t.nome_categoria || '—'}</td>
                                <td className={t.tipo === 'receita' ? 'receita' : 'despesa'}>{t.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}</td>
                                <td className={t.tipo === 'receita' ? 'receita' : 'despesa'}>{t.tipo === 'receita' ? '+' : '-'}{parseFloat(t.valor).toFixed(2)} Kz</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="footer">Real Balance · Relatório gerado automaticamente · {new Date().toLocaleString('pt-PT')}</p>
            </div>

            {/* Modal de Pré-visualização — Folha Branca */}
            <AnimatePresence>
                {showPreview && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        {/* Backdrop cinzento escuro */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#1a1a2e]/95 backdrop-blur-md"
                            onClick={() => setShowPreview(false)}
                        />

                        {/* Container do modal */}
                        <motion.div
                            initial={{ scale: 0.94, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.94, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                            className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-2xl overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.7)]"
                        >
                            {/* Barra de ferramentas (dark) */}
                            <div className="flex-shrink-0 flex items-center justify-between bg-[#0f172a] px-6 py-4 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    {/* Dot controls estilo macOS */}
                                    <button onClick={() => setShowPreview(false)} className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors" title="Fechar" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-50" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-500 opacity-50" />
                                    <span className="ml-3 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        Pré-visualização · {tipoLabel} · {periodoLabel}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { gerarRelatorio('pdf'); setShowPreview(false); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/15 border border-red-500/25 text-red-400 hover:bg-red-500/25 transition-all text-[10px] font-black uppercase tracking-wider"
                                    >
                                        <FileText size={12} /> PDF
                                    </button>
                                    <button
                                        onClick={() => { gerarRelatorio('excel'); setShowPreview(false); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/25 transition-all text-[10px] font-black uppercase tracking-wider"
                                    >
                                        <FileSpreadsheet size={12} /> Excel
                                    </button>
                                    <button
                                        onClick={handlePrint}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-wider"
                                    >
                                        <Printer size={12} /> Imprimir
                                    </button>
                                    <button
                                        onClick={() => { setShowPreview(false); setTimeout(() => setShowDeleteConfirm(true), 100); setSelecionados([]); }}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/20 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-[10px] font-black uppercase tracking-wider"
                                        title="Eliminar este relatório após gerar"
                                    >
                                        <Trash2 size={12} /> Eliminar
                                    </button>
                                </div>
                            </div>

                            {/* Área de scroll — fundo cinzento tipo "mesa" */}
                            <div className="flex-1 overflow-y-auto bg-[#e8ecf0] px-6 py-8">

                                {/* Folha A4 branca */}
                                <div className="w-full mx-auto bg-white shadow-[0_8px_40px_rgba(0,0,0,0.25)] rounded-sm overflow-hidden"
                                    style={{ minHeight: '700px' }}>

                                    {/* Topo verde — Cabeçalho tipo carta profissional */}
                                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-10 py-8 flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center">
                                                    <BarChart3 className="text-white" size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-emerald-100 uppercase tracking-[0.3em]">Real Balance</p>
                                                    <p className="text-[9px] text-emerald-200/70 tracking-wider">Gestão Financeira Pessoal</p>
                                                </div>
                                            </div>
                                            <h1 className="text-2xl font-black text-white tracking-tight">{tipoLabel}</h1>
                                            <p className="text-emerald-100/80 text-sm mt-1 font-medium">Período: {periodoLabel}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="bg-white/15 rounded-xl px-5 py-3 backdrop-blur-sm border border-white/20">
                                                <p className="text-[9px] text-emerald-100/60 uppercase tracking-[0.2em] font-black">Gerado em</p>
                                                <p className="text-white font-black text-sm mt-0.5">{new Date().toLocaleDateString('pt-PT')}</p>
                                                <p className="text-emerald-100/60 text-[10px] mt-0.5">{new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</p>
                                                <div className="border-t border-white/20 mt-2 pt-2">
                                                    <p className="text-[9px] text-emerald-100/60 uppercase tracking-widest font-black">Utilizador</p>
                                                    <p className="text-white font-bold text-xs mt-0.5">{user?.nome_completo || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Linha decorativa */}
                                    <div className="h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-transparent" />

                                    {/* Corpo do documento */}
                                    <div className="px-10 py-8 space-y-8">

                                        {/* Cards de Resumo */}
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                                <span className="w-4 h-px bg-emerald-500 inline-block" />
                                                Resumo Financeiro
                                            </p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {[
                                                    { label: 'Total Receitas', value: totalReceitas, color: '#10b981', bg: '#f0fdf4', border: '#bbf7d0', count: transacoesFiltradas.filter(t => t.tipo === 'receita').length, icon: '↑' },
                                                    { label: 'Total Despesas', value: totalDespesas, color: '#ef4444', bg: '#fef2f2', border: '#fecaca', count: transacoesFiltradas.filter(t => t.tipo === 'despesa').length, icon: '↓' },
                                                    { label: 'Saldo Líquido', value: saldoLiquido, color: saldoLiquido >= 0 ? '#10b981' : '#ef4444', bg: saldoLiquido >= 0 ? '#f0fdf4' : '#fef2f2', border: saldoLiquido >= 0 ? '#bbf7d0' : '#fecaca', count: transacoesFiltradas.length, icon: '=' },
                                                ].map(s => (
                                                    <div key={s.label} style={{ backgroundColor: s.bg, borderColor: s.border }} className="p-4 rounded-xl border">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em]">{s.label}</p>
                                                            <span style={{ color: s.color }} className="text-xs font-black">{s.icon}</span>
                                                        </div>
                                                        <p style={{ color: s.color }} className="text-xl font-black tracking-tight">{formatCurrency(s.value)}</p>
                                                        <p className="text-[10px] text-gray-400 font-bold mt-1">{s.count} transações</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Separador */}
                                        <div className="border-t border-gray-100" />

                                        {/* Tabela de transações */}
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 flex items-center gap-2">
                                                <span className="w-4 h-px bg-emerald-500 inline-block" />
                                                Detalhe de Transações
                                                {transacoesFiltradas.length > 10 && (
                                                    <span className="text-[8px] text-gray-400 normal-case font-normal ml-1">(mostrando 10 de {transacoesFiltradas.length})</span>
                                                )}
                                            </p>

                                            {transacoesFiltradas.length > 0 ? (
                                                <div className="rounded-xl overflow-hidden border border-gray-100">
                                                    <table className="w-full text-left text-[11px]">
                                                        <thead>
                                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                                <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px]">Data</th>
                                                                <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px]">Descrição</th>
                                                                <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px]">Categoria</th>
                                                                <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px]">Tipo</th>
                                                                <th className="px-4 py-3 font-black text-gray-400 uppercase tracking-widest text-[9px] text-right">Valor</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {transacoesFiltradas.slice(0, 10).map((t, i) => (
                                                                <tr key={t.id_transacao} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                                                                    <td className="px-4 py-3 text-gray-500 font-semibold whitespace-nowrap">
                                                                        {new Date(t.data).toLocaleDateString('pt-PT')}
                                                                    </td>
                                                                    <td className="px-4 py-3">
                                                                        <p className="font-bold text-gray-800">{t.descricao}</p>
                                                                    </td>
                                                                    <td className="px-4 py-3 text-gray-400 font-semibold">{t.nome_categoria || '—'}</td>
                                                                    <td className="px-4 py-3">
                                                                        <span style={{
                                                                            backgroundColor: t.tipo === 'receita' ? '#dcfce7' : '#fee2e2',
                                                                            color: t.tipo === 'receita' ? '#15803d' : '#dc2626',
                                                                        }} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                                            {t.tipo === 'receita' ? '↑ Receita' : '↓ Despesa'}
                                                                        </span>
                                                                    </td>
                                                                    <td className={`px-4 py-3 text-right font-black ${t.tipo === 'receita' ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                        {t.tipo === 'receita' ? '+' : '-'}{formatCurrency(t.valor)}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                        {/* Totais */}
                                                        <tfoot>
                                                            <tr className="bg-gray-50 border-t-2 border-gray-200">
                                                                <td colSpan={4} className="px-4 py-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                                    Balanço do Período
                                                                </td>
                                                                <td className={`px-4 py-3 text-right font-black text-base ${saldoLiquido >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                                    {saldoLiquido >= 0 ? '+' : ''}{formatCurrency(saldoLiquido)}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
                                                    <FileText className="mx-auto text-gray-300 mb-3" size={36} />
                                                    <p className="text-gray-400 font-bold text-sm">Sem transações para este período</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Rodapé da folha */}
                                        <div className="border-t border-gray-100 pt-6 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                                                    <BarChart3 size={10} className="text-white" />
                                                </div>
                                                <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Real Balance · Relatório Gerado Automaticamente</p>
                                            </div>
                                            <p className="text-[9px] text-gray-300 font-bold">
                                                {new Date().toLocaleString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Sombra inferior decorativa */}
                                <div className="h-6 w-[96%] mx-auto bg-black/10 rounded-b-xl blur-md -mt-2" />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Confirmação de Eliminação */}
            <AnimatePresence>
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            onClick={() => setShowDeleteConfirm(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border border-red-500/20 p-8 rounded-[2rem] shadow-2xl">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                                <AlertTriangle className="text-red-400" size={24} />
                            </div>
                            <h3 className="text-xl font-black text-white text-center mb-2">Confirmar Eliminação</h3>
                            <p className="text-slate-400 text-center text-sm mb-8">
                                Tem certeza que deseja eliminar <span className="text-red-400 font-black">{selecionados.length}</span> relatório(s)?
                                Esta acção é irreversível.
                            </p>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="flex-1">Cancelar</Button>
                                <Button onClick={eliminarSelecionados} className="flex-1 bg-red-500 hover:bg-red-600 text-white border-none">
                                    Eliminar
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Relatorios;
