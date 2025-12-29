// Funções de formatação específicas
export function formatarData(data) {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
}

export function formatarCPF(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function formatarHora(hora) {
    if (!hora) return '';
    return hora.substring(0, 5);
}

export function formatarNumero(numero) {
    return new Intl.NumberFormat('pt-BR').format(numero);
}

export function formatarStatus(status) {
    const statusMap = {
        'justificada': 'Justificada',
        'não justificada': 'Não Justificada',
        'pendente': 'Pendente'
    };
    return statusMap[status] || status;
}