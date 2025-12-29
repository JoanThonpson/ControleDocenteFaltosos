// js/app.js - VERSÃO SIMPLIFICADA SEM MÓDULOS
console.log('App.js carregado - Sistema iniciando...');

// Aguardar DOM e Bootstrap
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sistema DOM carregado');
    
    // 1. Verificar autenticação
    verificarAutenticacao();
    
    // 2. Configurar interface
    configurarInterface();
    
    // 3. Carregar dados iniciais
    carregarDadosIniciais();
    
    // 4. Configurar eventos
    configurarEventos();
    
    console.log('Sistema pronto!');
});

function verificarAutenticacao() {
    const authData = localStorage.getItem('sistema_faltas_auth');
    if (!authData) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const user = JSON.parse(authData);
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            let tipo = 'Usuário';
            if (user.type === 'admin') tipo = 'Administrador';
            if (user.type === 'gestor') tipo = 'Gestor';
            userInfo.textContent = `${user.name} (${tipo})`;
        }
        
        // Mostrar/ocultar elementos baseado no tipo
        const adminTab = document.getElementById('adminTabItem');
        const gerenciarBtn = document.getElementById('gerenciarUsuariosBtn');
        
        if (user.type === 'admin') {
            adminTab?.classList.remove('hidden');
            gerenciarBtn?.classList.remove('hidden');
        } else if (user.type === 'gestor') {
            adminTab?.classList.remove('hidden');
            gerenciarBtn?.classList.add('hidden');
            document.getElementById('addDocenteBtn')?.classList.add('hidden');
        } else {
            adminTab?.classList.add('hidden');
            gerenciarBtn?.classList.add('hidden');
        }
        
    } catch (e) {
        console.error('Erro na autenticação:', e);
        window.location.href = 'login.html';
    }
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
}

function carregarDadosIniciais() {
    console.log('Carregando dados iniciais...');
    
    // Carregar dados do localStorage
    carregarDadosLocalStorage();
    
    // Atualizar tabelas
    atualizarTabelas();
}

function carregarDadosLocalStorage() {
    // Carregar dados básicos do localStorage
    const carregarDado = (chave, padrao) => {
        const dados = localStorage.getItem(chave);
        return dados ? JSON.parse(dados) : padrao;
    };
    
    // Dados padrão
    const dadosPadrao = {
        disciplinas: ["Matemática", "Português", "História", "Geografia"],
        cursos: ["Ensino Fundamental", "Ensino Médio"],
        justificativas: ["Consulta médica", "Problemas de saúde"],
        docentes: [
            { id: 1, nome: "Docente Teste", disciplinas: ["Matemática"], cursos: ["Ensino Médio"], aulas: 20 }
        ],
        faltas: []
    };
    
    window.sistemaDados = {
        disciplinas: carregarDado('sistema_faltas_disciplinas', dadosPadrao.disciplinas),
        cursos: carregarDado('sistema_faltas_cursos', dadosPadrao.cursos),
        justificativas: carregarDado('sistema_faltas_justificativas', dadosPadrao.justificativas),
        docentes: carregarDado('sistema_faltas_docentes', dadosPadrao.docentes),
        faltas: carregarDado('sistema_faltas_faltas', dadosPadrao.faltas)
    };
}

function atualizarTabelas() {
    // Atualizar tabela de docentes
    const tbodyDocentes = document.getElementById('docentesTableBody');
    const selectDocente = document.getElementById('docenteSelect');
    const filtroDocente = document.getElementById('filtroDocente');
    
    if (tbodyDocentes) {
        tbodyDocentes.innerHTML = '';
        selectDocente.innerHTML = '<option value="">Selecione um docente</option>';
        filtroDocente.innerHTML = '<option value="">Todos os docentes</option>';
        
        window.sistemaDados.docentes.forEach(docente => {
            // Tabela
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${docente.nome}</td>
                <td>${docente.disciplinas.join(', ')}</td>
                <td>${docente.cursos.join(', ')}</td>
                <td>${docente.aulas}</td>
                <td>
                    <button class="btn btn-warning btn-sm me-1" onclick="editarDocente(${docente.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="excluirDocente(${docente.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbodyDocentes.appendChild(tr);
            
            // Selects
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            selectDocente.appendChild(option);
            
            const filtroOption = document.createElement('option');
            filtroOption.value = docente.id;
            filtroOption.textContent = docente.nome;
            filtroDocente.appendChild(filtroOption);
        });
    }
    
    // Atualizar tabela de faltas
    atualizarTabelaFaltas();
    
    // Atualizar estatísticas
    atualizarEstatisticas();
}

function atualizarTabelaFaltas() {
    const tbody = document.getElementById('faltasTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    window.sistemaDados.faltas.forEach(falta => {
        const docente = window.sistemaDados.docentes.find(d => d.id === falta.docenteId) || 
                       { nome: 'Docente não encontrado' };
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${docente.nome}</td>
            <td>${falta.disciplina}</td>
            <td>${falta.curso}</td>
            <td>${formatarData(falta.data)}</td>
            <td>${falta.horarioInicio}</td>
            <td>${falta.horarioFim}</td>
            <td>${falta.quantidadeFaltas}</td>
            <td>${falta.justificativa || 'Sem justificativa'}</td>
            <td>${falta.observacoes || 'Sem observações'}</td>
            <td>
                <span class="badge ${falta.status === 'justificada' ? 'badge-justificada' : 'badge-falta'}">
                    ${falta.status === 'justificada' ? 'Justificada' : 'Não Justificada'}
                </span>
            </td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="editarFalta(${falta.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirFalta(${falta.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function atualizarEstatisticas() {
    const container = document.getElementById('estatisticas');
    if (!container) return;
    
    const totalDocentes = window.sistemaDados.docentes.length;
    const totalFaltas = window.sistemaDados.faltas.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = window.sistemaDados.faltas
        .filter(f => f.status === 'justificada')
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    container.innerHTML = `
        <p><strong>Total de Docentes:</strong> ${totalDocentes}</p>
        <p><strong>Total de Faltas:</strong> ${totalFaltas}</p>
        <p><strong>Faltas Justificadas:</strong> ${faltasJustificadas}</p>
        <p><strong>Faltas Não Justificadas:</strong> ${totalFaltas - faltasJustificadas}</p>
    `;
}

function configurarEventos() {
    // Botão Sair
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        localStorage.removeItem('sistema_faltas_auth');
        window.location.href = 'login.html';
    });
    
    // Botão Configurações
    document.getElementById('configBtn')?.addEventListener('click', function() {
        alert('Configurações - Em desenvolvimento');
    });
    
    // Botão Nova Falta
    document.getElementById('addFaltaBtn')?.addEventListener('click', function() {
        mostrarModalFalta();
    });
    
    // Botão Novo Docente
    document.getElementById('addDocenteBtn')?.addEventListener('click', function() {
        mostrarModalDocente();
    });
    
    // Botões de filtro
    document.getElementById('filtroMes')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroAno')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroDocente')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('limparFiltrosBtn')?.addEventListener('click', function() {
        document.getElementById('filtroMes').value = '';
        document.getElementById('filtroAno').value = '';
        document.getElementById('filtroDocente').value = '';
        atualizarTabelaFaltas();
    });
    
    // Botão Aplicar Filtro (estatísticas)
    document.getElementById('aplicarFiltroBtn')?.addEventListener('click', atualizarEstatisticas);
    
    // Botões de relatório
    document.getElementById('gerarRelatorioExcelBtn')?.addEventListener('click', function() {
        alert('Relatório Excel - Em desenvolvimento');
    });
    
    document.getElementById('gerarRelatorioPDFBtn')?.addEventListener('click', function() {
        alert('Relatório PDF - Em desenvolvimento');
    });
}

// Funções auxiliares
function formatarData(data) {
    if (!data) return '';
    return new Date(data).toLocaleDateString('pt-BR');
}

// Funções globais para onclick
window.mostrarModalFalta = function() {
    // Resetar formulário
    document.getElementById('faltaForm')?.reset();
    document.getElementById('faltaData').valueAsDate = new Date();
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('addFaltaModal'));
    modal.show();
};

window.mostrarModalDocente = function() {
    // Resetar formulário
    document.getElementById('docenteForm')?.reset();
    
    // Carregar selects
    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
    const cursoSelect = document.getElementById('docenteCursoSelect');
    
    if (disciplinaSelect) {
        disciplinaSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
        window.sistemaDados.disciplinas.forEach(d => {
            const option = document.createElement('option');
            option.value = d;
            option.textContent = d;
            disciplinaSelect.appendChild(option);
        });
    }
    
    if (cursoSelect) {
        cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
        window.sistemaDados.cursos.forEach(c => {
            const option = document.createElement('option');
            option.value = c;
            option.textContent = c;
            cursoSelect.appendChild(option);
        });
    }
    
    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('addDocenteModal'));
    modal.show();
};

// Funções placeholder para onclick
window.editarDocente = function(id) {
    alert(`Editar docente ${id} - Em desenvolvimento`);
};

window.excluirDocente = function(id) {
    if (confirm('Tem certeza que deseja excluir este docente?')) {
        window.sistemaDados.docentes = window.sistemaDados.docentes.filter(d => d.id !== id);
        localStorage.setItem('sistema_faltas_docentes', JSON.stringify(window.sistemaDados.docentes));
        atualizarTabelas();
        alert('Docente excluído!');
    }
};

window.editarFalta = function(id) {
    alert(`Editar falta ${id} - Em desenvolvimento`);
};

window.excluirFalta = function(id) {
    if (confirm('Tem certeza que deseja excluir esta falta?')) {
        window.sistemaDados.faltas = window.sistemaDados.faltas.filter(f => f.id !== id);
        localStorage.setItem('sistema_faltas_faltas', JSON.stringify(window.sistemaDados.faltas));
        atualizarTabelaFaltas();
        atualizarEstatisticas();
        alert('Falta excluída!');
    }
};