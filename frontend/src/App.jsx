import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import { UIProvider } from './context/UIContext';
import './styles/App.css';
import Landing from './screens/Landing';
import Login from './screens/Login';
import Registar from './screens/Registar';
import Painel from './screens/Painel';
import Definicoes from './screens/Definicoes';
import Funcionalidades from './screens/Funcionalidades';
import Perfil from './screens/Perfil';
import Receitas from './screens/Receitas';
import Despesas from './screens/Despesas';
import Carteira from './screens/Carteira';
import Relatorios from './screens/Relatorios';
import Calculadora from './screens/Calculadora';
import Layout from './components/Layout/Layout';

const ProtectedRoute = ({ children }) => {
  const { user } = useBudget();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <UIProvider>
      <BudgetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registar />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/profile" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Painel /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><Carteira /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><Receitas /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><Despesas /></ProtectedRoute>} />
            <Route path="/calculator" element={<ProtectedRoute><Calculadora /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Definicoes /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><Relatorios /></ProtectedRoute>} />
          </Routes>
        </Router>
      </BudgetProvider>
    </UIProvider>
  );
}

export default App;
