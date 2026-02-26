export const formatCurrency = (amount) => {
    const value = amount ?? 0;
    const formatted = parseFloat(value).toLocaleString('pt-PT', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return `${formatted} Kz`;
};

export const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-AO');
};
