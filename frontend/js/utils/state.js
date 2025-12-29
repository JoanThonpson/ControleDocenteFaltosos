// Estado global centralizado do sistema
export const state = {
    // Arrays de configuração
    disciplinas: [],
    cursos: [],
    justificativas: [],
    
    // Dados principais
    usuarios: [],
    docentes: [],
    faltas: [],
    
    // Estado da sessão
    currentUser: null,
    isAdmin: false,
    isGestor: false,
    
    // Estado de edição
    editandoFaltaId: null,
    editandoDocenteId: null,
    
    // Estado temporário (usado apenas no modal de resetar senha)
    usuarioResetSenha: null
};