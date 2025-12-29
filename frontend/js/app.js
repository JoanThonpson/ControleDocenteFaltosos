// js/app.js - Ponto de entrada do sistema
import { inicializarSistema, state, salvarTodosDados } from './js/utils/storage.js';
import { formatarData, formatarCPF, getDocenteById } from './js/utils/helpers.js';

// Importar serviços
import AuthService from './js/services/auth.service.js';
import { 
    carregarDocentes, showAddDocenteModal, salvarDocente, 
    excluirDocente, toggleNovaDisciplina, toggleNovoCurso 
} from './js/services/docente.service.js';
import { 
    carregarFaltas, showAddFaltaModal, salvarFalta, 
    excluirFalta, carregarDisciplinasCursos, filtrarFaltas, limparFiltros 
} from './js/services/falta.service.js';
import { 
    carregarJustificativas, showAddJustificativaModal, salvarJustificativa,
    excluirJustificativa, filtrarJustificativas 
} from './js/services/config.service.js';

import { 
    showGerenciarUsuariosModal, showAddUsuarioModal, salvarUsuario,
    resetarSenhaUsuario, confirmarResetSenha, excluirUsuario 
} from './js/services/usuario.service.js';

import { 
    aplicarFiltroEstatisticas, carregarEstatisticas,
    gerarRelatorioFaltas, gerarRelatorioDocentes 
} from './js/services/relatorio.service.js';

// Inicializar quando o DOM carregar
document.addEventListener('DOMContentLoaded', async function() {
    console.log('Sistema inicializando...');
    
    try {
        // 1. Inicializar sistema (storage, dados iniciais)
        inicializarSistema();
        
        // 2. Configurar usuário atual
        await configurarUsuario();
        
        // 3. Configurar todos os event listeners
        configurarEventListeners();
        
        // 4. Carregar dados iniciais
        carregarDadosIniciais();
        
        // 5. Configurar permissões
        configurarPermissoes();
        
        console.log('Sistema inicializado com sucesso!');
    } catch (error) {
        console.error('Erro ao inicializar sistema:', error);
        alert('Erro ao carregar o sistema. Tente novamente.');
    }
});

// Configurar usuário atual
async function configurarUsuario() {
    const user = AuthService.getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    state.currentUser = user;
    state.isAdmin = user.type === 'admin';
    state.isGestor = user.type === 'gestor';
    
    // Atualizar UI com informações do usuário
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        let tipoUsuario = 'Usuário';
        if (state.isAdmin) tipoUsuario = 'Administrador';
        if (state.isGestor) tipoUsuario = 'Gestor';
        
        userInfo.textContent = `${user.name} (${tipoUsuario})`;
    }
}

// Configurar todos os event listeners
function configurarEventListeners() {
    // Botões da navbar
    document.getElementById('logoutBtn')?.addEventListener('click', () => AuthService.logout());
    document.getElementById('configBtn')?.addEventListener('click', () => showConfigModal());
    document.getElementById('gerenciarUsuariosBtn')?.addEventListener('click', () => showGerenciarUsuariosModal());
    
    // Aba Faltas
    document.getElementById('addFaltaBtn')?.addEventListener('click', () => showAddFaltaModal());
    document.getElementById('filtroMes')?.addEventListener('change', () => filtrarFaltas());
    document.getElementById('filtroAno')?.addEventListener('change', () => filtrarFaltas());
    document.getElementById('filtroDocente')?.addEventListener('change', () => filtrarFaltas());
    document.getElementById('limparFiltrosBtn')?.addEventListener('click', () => limparFiltros());
    document.getElementById('docenteSelect')?.addEventListener('change', () => carregarDisciplinasCursos());
    document.getElementById('salvarFaltaBtn')?.addEventListener('click', () => salvarFalta());
    
    // Aba Docentes
    document.getElementById('addDocenteBtn')?.addEventListener('click', () => showAddDocenteModal());
    document.getElementById('docenteDisciplinaSelect')?.addEventListener('change', () => toggleNovaDisciplina());
    document.getElementById('docenteCursoSelect')?.addEventListener('change', () => toggleNovoCurso());
    document.getElementById('salvarDocenteBtn')?.addEventListener('click', () => salvarDocente());
    
    // Aba Justificativas
    document.getElementById('addJustificativaBtn')?.addEventListener('click', () => showAddJustificativaModal());
    document.getElementById('buscaJustificativa')?.addEventListener('input', () => filtrarJustificativas());
    document.getElementById('salvarJustificativaBtn')?.addEventListener('click', () => salvarJustificativa());
    
    // Aba Controle Administrativo
    document.getElementById('aplicarFiltroBtn')?.addEventListener('click', () => aplicarFiltroEstatisticas());
    document.getElementById('gerarRelatorioExcelBtn')?.addEventListener('click', () => gerarRelatorioFaltas());
    document.getElementById('gerarRelatorioPDFBtn')?.addEventListener('click', () => gerarRelatorioDocentes());
    
    // Modais de Configuração
    document.getElementById('addDisciplinaBtn')?.addEventListener('click', () => showAddDisciplinaModal());
    document.getElementById('addCursoBtn')?.addEventListener('click', () => showAddCursoModal());
    document.getElementById('salvarDisciplinaBtn')?.addEventListener('click', () => salvarDisciplina());
    document.getElementById('salvarCursoBtn')?.addEventListener('click', () => salvarCurso());
    document.getElementById('buscaDisciplina')?.addEventListener('input', () => filtrarDisciplinas());
    document.getElementById('buscaCurso')?.addEventListener('input', () => filtrarCursos());
    
    // Modais de Usuários
    document.getElementById('addUsuarioBtn')?.addEventListener('click', () => showAddUsuarioModal());
    document.getElementById('salvarUsuarioBtn')?.addEventListener('click', () => salvarUsuario());
    document.getElementById('confirmarResetSenhaBtn')?.addEventListener('click', () => confirmarResetSenha());
    
    // Configurar datas padrão
    const hoje = new Date();
    document.getElementById('dataInicio')?.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    document.getElementById('dataFim')?.value = hoje.toISOString().split('T')[0];
}

// Carregar dados iniciais
function carregarDadosIniciais() {
    carregarDocentes();
    carregarFaltas();
    carregarJustificativas();
    carregarEstatisticas();
}

// Configurar permissões
function configurarPermissoes() {
    const adminTab = document.getElementById('adminTabItem');
    const gerenciarUsuariosBtn = document.getElementById('gerenciarUsuariosBtn');
    
    if (state.isAdmin) {
        adminTab?.classList.remove('hidden');
        gerenciarUsuariosBtn?.classList.remove('hidden');
    } else if (state.isGestor) {
        adminTab?.classList.remove('hidden');
        gerenciarUsuariosBtn?.classList.add('hidden');
        document.getElementById('addDocenteBtn')?.classList.add('hidden');
    } else {
        adminTab?.classList.add('hidden');
        gerenciarUsuariosBtn?.classList.add('hidden');
    }
}

// Funções globais para modais (precisam estar disponíveis para onclick)
window.showConfigModal = function() {
    import('./services/config.service.js').then(module => {
        module.showConfigModal();
    });
};

window.showAddDisciplinaModal = function() {
    import('./services/config.service.js').then(module => {
        module.showAddDisciplinaModal();
    });
};

window.showAddCursoModal = function() {
    import('./services/config.service.js').then(module => {
        module.showAddCursoModal();
    });
};

window.salvarDisciplina = function() {
    import('./services/config.service.js').then(module => {
        module.salvarDisciplina();
    });
};

window.salvarCurso = function() {
    import('./services/config.service.js').then(module => {
        module.salvarCurso();
    });
};

window.filtrarDisciplinas = function() {
    import('./services/config.service.js').then(module => {
        module.filtrarDisciplinas();
    });
};

window.filtrarCursos = function() {
    import('./services/config.service.js').then(module => {
        module.filtrarCursos();
    });
};

window.excluirDisciplina = function(nome) {
    import('./services/config.service.js').then(module => {
        module.excluirDisciplina(nome);
    });
};

window.excluirCurso = function(nome) {
    import('./services/config.service.js').then(module => {
        module.excluirCurso(nome);
    });
};

// Funções para tabelas (editar/excluir)
window.editarDocente = function(id) {
    import('./services/docente.service.js').then(module => {
        module.editarDocente(id);
    });
};

window.excluirDocente = function(id) {
    import('./services/docente.service.js').then(module => {
        module.excluirDocente(id);
    });
};

window.editarFalta = function(id) {
    import('./services/falta.service.js').then(module => {
        module.editarFalta(id);
    });
};

window.excluirFalta = function(id) {
    import('./services/falta.service.js').then(module => {
        module.excluirFalta(id);
    });
};

window.excluirJustificativa = function(descricao) {
    import('./services/config.service.js').then(module => {
        module.excluirJustificativa(descricao);
    });
};

window.resetarSenhaUsuario = function(id) {
    import('./services/usuario.service.js').then(module => {
        module.resetarSenhaUsuario(id);
    });
};

window.excluirUsuario = function(id) {
    import('./services/usuario.service.js').then(module => {
        module.excluirUsuario(id);
    });
};

// Inicializar tooltips do Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});