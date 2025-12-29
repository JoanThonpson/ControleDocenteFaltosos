import { state } from './storage.js';

export function validarNovaDisciplina(nome) {
    if (!nome.trim()) {
        alert('Por favor, digite o nome da disciplina!');
        return false;
    }
    
    const nomeNormalizado = nome.trim().toLowerCase();
    const existe = state.disciplinas.some(d => d.trim().toLowerCase() === nomeNormalizado);
    
    if (existe) {
        alert('Esta disciplina já está cadastrada!');
        return false;
    }
    
    return true;
}

export function validarNovoCurso(nome) {
    if (!nome.trim()) {
        alert('Por favor, digite o nome do curso!');
        return false;
    }
    
    const nomeNormalizado = nome.trim().toLowerCase();
    const existe = state.cursos.some(c => c.trim().toLowerCase() === nomeNormalizado);
    
    if (existe) {
        alert('Este curso já está cadastrada!');
        return false;
    }
    
    return true;
}

export function validarNovaJustificativa(descricao) {
    if (!descricao.trim()) {
        alert('Por favor, digite a descrição da justificativa!');
        return false;
    }
    
    const descricaoNormalizada = descricao.trim().toLowerCase();
    const existe = state.justificativas.some(j => j.trim().toLowerCase() === descricaoNormalizada);
    
    if (existe) {
        alert('Esta justificativa já está cadastrada!');
        return false;
    }
    
    return true;
}

export function validarUsuario(nome, cpf, senha, tipo) {
    if (!nome.trim()) {
        alert('Por favor, digite o nome completo!');
        return false;
    }
    
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) {
        alert('CPF deve ter 11 dígitos!');
        return false;
    }
    
    if (senha.length < 6) {
        alert('Senha deve ter pelo menos 6 caracteres!');
        return false;
    }
    
    if (!tipo) {
        alert('Por favor, selecione o tipo de usuário!');
        return false;
    }
    
    return true;
}