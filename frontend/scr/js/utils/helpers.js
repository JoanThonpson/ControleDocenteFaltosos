// Funções auxiliares
import { formatarData } from './formatters.js';
import { formatarCPF } from './formatters.js';

// Formatar data
export function formatarData(data) {
    if (!data) return '';
    const date = new Date(data);
    return date.toLocaleDateString('pt-BR');
}

// Formatar CPF
export function formatarCPF(cpf) {
    if (!cpf) return '';
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return cpf;
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

// Obter docente por ID
export function getDocenteById(id) {
    const docente = docentes.find(d => d.id === id);
    return docente || { nome: 'Docente não encontrado', disciplinas: [], cursos: [], aulas: 0 };
}

// Obter próximo ID
export function getProximoId(lista) {
    if (lista.length === 0) return 1;
    return Math.max(...lista.map(item => item.id)) + 1;
}

// Validar CPF
export function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.length === 11;
}

// Validar senha
export function validarSenha(senha) {
    return senha.length >= 6;
}

// Gerar ID único
export function gerarId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}