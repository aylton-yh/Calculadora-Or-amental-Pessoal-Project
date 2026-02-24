import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [balance, setBalance] = useState({ balance: 0, total_income: 0, total_expense: 0 });
    const [loading, setLoading] = useState(false);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const fetchData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const [transRes, catRes, balRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/categories'),
                api.get('/transactions/balance')
            ]);
            setTransactions(transRes.data);
            setCategories(catRes.data);
            setBalance(balRes.data);
        } catch (err) {
            console.error('Error fetching data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    return (
        <BudgetContext.Provider value={{
            user, login, logout, transactions, categories, balance, loading, fetchData
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

export const useBudget = () => useContext(BudgetContext);
