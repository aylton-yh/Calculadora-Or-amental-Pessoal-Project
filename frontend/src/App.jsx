import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BudgetProvider, useBudget } from './context/BudgetContext';
import './styles/App.css';
import Landing from './screens/Landing';
import Login from './screens/Login';
import Register from './screens/Register';
import Dashboard from './screens/Dashboard';
import Settings from './screens/Settings';
import Funcionalidades from './screens/Funcionalidades';
import Profile from './screens/Profile';

const ProtectedRoute = ({ children }) => {
  const { user } = useBudget();
  return user ? children : <Navigate to="/login" />;
};

import { UIProvider } from './context/UIContext';

function App() {
  return (
    <UIProvider>
      <BudgetProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/funcionalidades" element={<Funcionalidades />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          </Routes>
        </Router>
      </BudgetProvider>
    </UIProvider>
  );
}

export default App;
