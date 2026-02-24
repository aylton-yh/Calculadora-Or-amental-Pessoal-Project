export const formatCurrency = (amount, currency = 'AOA') => {
    const symbol = currency === 'USD' ? '$' : 'Kz';
    return `${symbol} ${parseFloat(amount).toLocaleString('pt-AO', { minimumFractionDigits: 2 })}`;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-AO');
};
