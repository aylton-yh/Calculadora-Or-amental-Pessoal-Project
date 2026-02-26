import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const BudgetContext = createContext();

const safeParse = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error(`Error parsing localStorage key "${key}":`, e);
        return fallback;
    }
};

export const BudgetProvider = ({ children }) => {
    const [user, setUser] = useState(() => safeParse('user', null));
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [balance, setBalance] = useState({ balance: 0, total_income: 0, total_expense: 0 });
    const [accounts, setAccounts] = useState([
        { id: 1, nome: 'Carteira Principal', tipo: 'Numerário', saldo: 0 },
        { id: 2, nome: 'Conta Bancária (BFA)', tipo: 'Banco', saldo: 0 },
    ]);
    const [loading, setLoading] = useState(false);

    // Sistema de actividades globais (log de tudo que acontece no sistema)
    const [activities, setActivities] = useState(() => safeParse('rb_activities', []));

    // Registar uma actividade no log global
    const logActivity = useCallback((descricao, tipo = 'sistema', tela = 'Sistema', extra = {}) => {
        const newActivity = {
            id: Date.now(),
            descricao,
            tipo,         // 'receita' | 'despesa' | 'sistema' | 'conta' | 'login'
            tela,         // 'Receitas' | 'Despesas' | 'Carteira' | 'Painel' | 'Login' etc.
            data: new Date().toISOString(),
            ...extra,
        };
        setActivities(prev => {
            const updated = [newActivity, ...prev].slice(0, 500); // max 500 entradas
            localStorage.setItem('rb_activities', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const normalizeUser = (userData) => {
        if (!userData) return null;
        return {
            id: userData.id_usuario,
            name: userData.nome_completo,
            username: userData.nome_usuario,
            email: userData.email,
            contact: userData.contacto,
            gender: userData.sexo === 'M' ? 'male' : userData.sexo === 'F' ? 'female' : userData.sexo,
            marital_status: userData.estado_civil,
            id_number: userData.BI,
            address: userData.endereço,
            photo: userData.foto_perfil,
            currency: userData.moeda_padrao,
            language: userData.idioma,
            theme: userData.tema_sistema,
            created_at: userData.criado_em
        };
    };

    const normalizeAccount = (acc) => ({
        id: acc.id_conta,
        nome: acc.nome_conta,
        tipo: acc.tipo_conta,
        banco: acc.banco,
        saldo: parseFloat(acc.saldo_atual),
        cor: acc.cor_tema
    });

    const login = (userData, token) => {
        const normalized = normalizeUser(userData);
        if (token) localStorage.setItem('token', token);
        
        try {
            localStorage.setItem('user', JSON.stringify(normalized));
        } catch (e) {
            console.error('Falha ao guardar usuário no localStorage (provavelmente foto muito grande):', e);
            // Se falhar o localStorage, ainda assim atualizamos o estado em memória
        }
        
        setUser(normalized);

        if (token) {
            // Registar login como actividade somente se houver token (novo login)
            const loginAct = {
                id: Date.now(),
                descricao: `Login efectuado por ${normalized?.name || normalized?.username || 'Usuário'}`,
                tipo: 'login',
                tela: 'Login',
                data: new Date().toISOString(),
            };
            setActivities(prev => {
                const updated = [loginAct, ...prev].slice(0, 500);
                localStorage.setItem('rb_activities', JSON.stringify(updated));
                return updated;
            });
        }
    };

    const logout = () => {
        if (user) {
            const logoutAct = {
                id: Date.now(),
                descricao: `Sessão encerrada por ${user.name || user.username}`,
                tipo: 'sistema',
                tela: 'Sistema',
                data: new Date().toISOString(),
            };
            setActivities(prev => {
                const updated = [logoutAct, ...prev].slice(0, 500);
                localStorage.setItem('rb_activities', JSON.stringify(updated));
                return updated;
            });
        }
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const updateAccountBalance = (accountId, newBalance) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === accountId ? { ...acc, saldo: parseFloat(newBalance) } : acc
        ));
    };

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [transRes, catRes, accRes, statsRes] = await Promise.all([
                api.get('/finance/transactions'),
                api.get('/finance/categories'),
                api.get('/finance/accounts'),
                api.get('/finance/stats')
            ]);
            setTransactions(transRes.data);
            setCategories(catRes.data);
            setAccounts(accRes.data.map(normalizeAccount));

            setBalance({
                balance: statsRes.data.total_balance || 0,
                total_income: statsRes.data.monthly_income || 0,
                total_expense: statsRes.data.monthly_expense || 0,
                income_change: 0,
                expense_change: 0
            });
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    // Aplicar tema ao documento sempre que o utilizador mudar

    const addTransaction = async (data) => {
        setLoading(true);
        try {
            await api.post('/finance/transactions', data);
            await fetchData(); // Refresh all data
            return { success: true };
        } catch (err) {
            console.error('Erro ao adicionar transação', err);
            return { success: false, message: 'Erro ao registar transação.' };
        } finally {
            setLoading(false);
        }
    };

    const deleteTransaction = async (id) => {
        setLoading(true);
        try {
            await api.delete(`/finance/transactions/${id}`);
            await fetchData(); // Refresh all data
            return { success: true };
        } catch (err) {
            console.error('Erro ao eliminar transação', err);
            return { success: false, message: 'Erro ao eliminar transação.' };
        } finally {
            setLoading(false);
        }
    };

    const updatePreferences = async (prefs) => {
        setLoading(true);
        try {
            const res = await api.put('/auth/preferences', prefs);
            const updatedUser = normalizeUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            return { success: true, message: res.data.message };
        } catch (err) {
            console.error('Erro ao guardar preferências', err);
            return { success: false, message: 'Erro ao guardar preferências.' };
        } finally {
            setLoading(false);
        }
    };

    const addCategory = async (data) => {
        // Optimistic UI: Add category immediately to state
        const tempId = Date.now();
        const newCat = { id_categoria: tempId, ...data };

        setCategories(prev => [...prev, newCat]);

        try {
            const res = await api.post('/finance/categories', data);
            // Replace temporary category with real one from server
            setCategories(prev => prev.map(cat =>
                cat.id_categoria === tempId ? res.data : cat
            ));
            return { success: true };
        } catch (err) {
            console.error('Erro ao adicionar categoria', err);
            // Rollback on error
            setCategories(prev => prev.filter(cat => cat.id_categoria !== tempId));
            return {
                success: false,
                message: err.response?.data?.message || 'Erro ao comunicar com o servidor. Verifique a sua ligação.'
            };
        }
    };

    return (
        <BudgetContext.Provider value={{
            user, login, logout,
            transactions, categories, balance,
            accounts, setAccounts, updateAccountBalance,
            loading, fetchData,
            activities, logActivity,
            updatePreferences, addTransaction, deleteTransaction,
            addCategory
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => useContext(BudgetContext);
