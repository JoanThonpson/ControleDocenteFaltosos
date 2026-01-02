// js/main.js - Ponto de entrada do sistema modular
import { inicializarSistema, state, salvarTodosDados } from './utils/storage.js';
import AuthService from './services/auth.service.js';
import * as ConfigService from './services/config.service.js';
import * as DocenteService from './services/docente.service.js';
import * as FaltaService from './services/falta.service.js';
import * as RelatorioService from './services/relatorio.service.js';
import * as UsuarioService from './services/usuario.service.js';
import { formatarData, formatarCPF, getDocenteById } from './utils/helpers.js';

console.log('Sistema modular carregando...');

// Aguardar DOM e Bootstrap
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DOM carregado, inicializando sistema...');
    
    try {
        // 1. Inicializar sistema (carrega dados do localStorage)
        inicializarSistema();
        
        // 2. Verificar autenticação
        await verificarAutenticacao();
        
        // 3. Configurar interface
        configurarInterface();
        
        // 4. Carregar dados iniciais
        carregarDadosIniciais();
        
        // 5. Configurar eventos
        configurarEventos();
        
        console.log('Sistema modular inicializado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao inicializar sistema:', error);
        alert('Erro ao carregar o sistema. Recarregue a página.');
    }
});

// ========== FUNÇÕES DE INICIALIZAÇÃO ==========

async function verificarAutenticacao() {
    if (!AuthService.isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Atualizar estado com usuário atual
    const user = AuthService.getCurrentUser();
    state.currentUser = user;
    state.isAdmin = AuthService.isAdmin();
    state.isGestor = AuthService.isGestor();
    
    // Mostrar info do usuário
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        let tipo = 'Usuário';
        if (user.type === 'admin') tipo = 'Administrador';
        if (user.type === 'gestor') tipo = 'Gestor';
        userInfo.textContent = `${user.name} (${tipo})`;
    }
    
    // Configurar permissões
    setupPermissions();
}

function configurarInterface() {
    // Configurar datas padrão
    const hoje = new Date();
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    
    if (dataInicio) {
        dataInicio.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
            .toISOString().split('T')[0];
    }
    if (dataFim) {
        dataFim.value = hoje.toISOString().split('T')[0];
    }
    
    // Esconder botão "Gerenciar Usuários" do cabeçalho (será dentro de Configurações)
    const gerenciarBtn = document.getElementById('gerenciarUsuariosBtn');
    if (gerenciarBtn) {
        gerenciarBtn.style.display = 'none';
    }
    
    // Remover botão de Excel (manter apenas PDF)
    const excelBtn = document.getElementById('gerarRelatorioExcelBtn');
    if (excelBtn) {
        excelBtn.remove();
    }
}

function setupPermissions() {
    const adminTab = document.getElementById('adminTabItem');
    const addDocenteBtn = document.getElementById('addDocenteBtn');
    
    if (state.isGestor) {
        adminTab?.classList.remove('hidden');
        addDocenteBtn?.classList.add('hidden');
        // Ir para aba de controle se for gestor
        document.querySelector('[href="#controle"]')?.click();
    } else if (!state.isAdmin) {
        adminTab?.classList.add('hidden');
        addDocenteBtn?.classList.remove('hidden');
    } else {
        adminTab?.classList.remove('hidden');
        addDocenteBtn?.classList.remove('hidden');
    }
}

function carregarDadosIniciais() {
    console.log('Carregando dados iniciais...');
    
    // Carregar docentes e faltas
    DocenteService.carregarDocentes();
    FaltaService.carregarFaltas();
    
    // Carregar justificativas
    ConfigService.carregarJustificativas();
    
    // Carregar estatísticas se for admin/gestor
    if (state.isAdmin || state.isGestor) {
        RelatorioService.carregarEstatisticas();
    }
}

function configurarEventos() {
    console.log('Configurando eventos do sistema...');
    
    // Botão Sair
    document.getElementById('logoutBtn')?.addEventListener('click', AuthService.logout);
    
    // Botão Configurações
    document.getElementById('configBtn')?.addEventListener('click', ConfigService.showConfigModal);
    
    // Botão Nova Falta
    document.getElementById('addFaltaBtn')?.addEventListener('click', FaltaService.showAddFaltaModal);
    
    // Botão Novo Docente
    document.getElementById('addDocenteBtn')?.addEventListener('click', DocenteService.showAddDocenteModal);
    
    // Botões de filtro de faltas
    document.getElementById('filtroMes')?.addEventListener('change', FaltaService.filtrarFaltas);
    document.getElementById('filtroAno')?.addEventListener('change', FaltaService.filtrarFaltas);
    document.getElementById('filtroDocente')?.addEventListener('change', FaltaService.filtrarFaltas);
    document.getElementById('limparFiltrosBtn')?.addEventListener('click', FaltaService.limparFiltros);
    
    // Botão Nova Justificativa
    document.getElementById('addJustificativaBtn')?.addEventListener('click', ConfigService.showAddJustificativaModal);
    
    // Botão Aplicar Filtro (estatísticas)
    document.getElementById('aplicarFiltroBtn')?.addEventListener('click', RelatorioService.aplicarFiltroEstatisticas);
    
    // Botão Gerar Relatório PDF
    document.getElementById('gerarRelatorioPDFBtn')?.addEventListener('click', RelatorioService.gerarRelatorioDocentes);
    
    // Busca em justificativas
    document.getElementById('buscaJustificativa')?.addEventListener('input', ConfigService.filtrarJustificativas);
}

// ========== EXPORTAÇÕES PARA USO GLOBAL (para onclick no HTML) ==========

// Configurações
window.showConfigModal = ConfigService.showConfigModal;
window.showAddJustificativaModal = ConfigService.showAddJustificativaModal;
window.showAddDisciplinaModal = ConfigService.showAddDisciplinaModal;
window.showAddCursoModal = ConfigService.showAddCursoModal;
window.salvarDisciplina = ConfigService.salvarDisciplina;
window.salvarCurso = ConfigService.salvarCurso;
window.salvarJustificativa = ConfigService.salvarJustificativa;
window.filtrarJustificativas = ConfigService.filtrarJustificativas;
window.filtrarDisciplinas = ConfigService.filtrarDisciplinas;
window.filtrarCursos = ConfigService.filtrarCursos;
window.excluirDisciplina = ConfigService.excluirDisciplina;
window.excluirCurso = ConfigService.excluirCurso;
window.excluirJustificativa = ConfigService.excluirJustificativa;

// Docentes
window.showAddDocenteModal = DocenteService.showAddDocenteModal;
window.editarDocente = DocenteService.editarDocente;
window.salvarDocente = DocenteService.salvarDocente;
window.excluirDocente = DocenteService.excluirDocente;
window.toggleNovaDisciplina = DocenteService.toggleNovaDisciplina;
window.toggleNovoCurso = DocenteService.toggleNovoCurso;

// Faltas
window.showAddFaltaModal = FaltaService.showAddFaltaModal;
window.carregarDisciplinasCursos = FaltaService.carregarDisciplinasCursos;
window.editarFalta = FaltaService.editarFalta;
window.salvarFalta = FaltaService.salvarFalta;
window.excluirFalta = FaltaService.excluirFalta;
window.filtrarFaltas = FaltaService.filtrarFaltas;
window.limparFiltros = FaltaService.limparFiltros;

// Relatórios
window.aplicarFiltroEstatisticas = RelatorioService.aplicarFiltroEstatisticas;
window.gerarRelatorioDocentes = RelatorioService.gerarRelatorioDocentes;

// Usuários (serão acessados via ConfigService agora)
window.showGerenciarUsuariosModal = UsuarioService.showGerenciarUsuariosModal;
window.showAddUsuarioModal = UsuarioService.showAddUsuarioModal;
window.salvarUsuario = UsuarioService.salvarUsuario;
window.resetarSenhaUsuario = UsuarioService.resetarSenhaUsuario;
window.confirmarResetSenha = UsuarioService.confirmarResetSenha;
window.excluirUsuario = UsuarioService.excluirUsuario;

// Helper functions
window.formatarData = formatarData;
window.formatarCPF = formatarCPF;

console.log('Main.js carregado e pronto!');