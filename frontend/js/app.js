// js/app.js - VERSÃO BÁSICA FUNCIONAL
console.log('Sistema iniciando...');

// Dados de exemplo
let sistemaDados = {
    docentes: [
        { id: 1, nome: "Professor Teste", disciplinas: ["Matemática"], cursos: ["Ensino Médio"], aulas: 20 }
    ],
    faltas: []
};

// Inicializar quando DOM carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    
    // Verificar se está autenticado
    const auth = localStorage.getItem('sistema_faltas_auth');
    if (!auth) {
        console.log('Não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Usuário autenticado:', JSON.parse(auth));
    
    // Mostrar informação do usuário
    try {
        const user = JSON.parse(auth);
        const userInfo = document.getElementById('userInfo');
        if (userInfo) {
            userInfo.textContent = `${user.name} (Administrador)`;
        }
    } catch (e) {
        console.error('Erro ao parsear usuário:', e);
    }
    
    // Carregar dados
    carregarDados();
    
    // Atualizar interface
    atualizarInterface();
    
    // Configurar eventos
    configurarEventos();
    
    console.log('Sistema pronto!');
});

// Carregar dados do localStorage
function carregarDados() {
    const dadosSalvos = localStorage.getItem('sistema_faltas_docentes');
    if (dadosSalvos) {
        sistemaDados.docentes = JSON.parse(dadosSalvos);
    }
    
    const faltasSalvas = localStorage.getItem('sistema_faltas_faltas');
    if (faltasSalvas) {
        sistemaDados.faltas = JSON.parse(faltasSalvas);
    }
    
    console.log('Dados carregados:', sistemaDados);
}

// Atualizar interface
function atualizarInterface() {
    // Atualizar tabela de docentes
    atualizarTabelaDocentes();
    
    // Atualizar tabela de faltas
    atualizarTabelaFaltas();
    
    // Atualizar select de docentes
    atualizarSelectsDocentes();
    
    // Atualizar estatísticas
    atualizarEstatisticas();
}

// Atualizar tabela de docentes
function atualizarTabelaDocentes() {
    const tbody = document.getElementById('docentesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    sistemaDados.docentes.forEach(docente => {
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
        tbody.appendChild(tr);
    });
}

// Atualizar selects de docentes
function atualizarSelectsDocentes() {
    const select = document.getElementById('docenteSelect');
    const filtro = document.getElementById('filtroDocente');
    
    if (select) {
        select.innerHTML = '<option value="">Selecione um docente</option>';
        sistemaDados.docentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            select.appendChild(option);
        });
    }
    
    if (filtro) {
        filtro.innerHTML = '<option value="">Todos os docentes</option>';
        sistemaDados.docentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            filtro.appendChild(option);
        });
    }
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const container = document.getElementById('estatisticas');
    if (!container) return;
    
    const totalDocentes = sistemaDados.docentes.length;
    const totalFaltas = sistemaDados.faltas.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = sistemaDados.faltas
        .filter(f => f.status === 'justificada')
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    container.innerHTML = `
        <p><strong>Total de Docentes:</strong> ${totalDocentes}</p>
        <p><strong>Total de Faltas:</strong> ${totalFaltas}</p>
        <p><strong>Faltas Justificadas:</strong> ${faltasJustificadas}</p>
        <p><strong>Faltas Não Justificadas:</strong> ${totalFaltas - faltasJustificadas}</p>
    `;
}

// Configurar eventos
function configurarEventos() {
    // Botão Sair
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('sistema_faltas_auth');
            window.location.href = 'login.html';
        });
    }
    
    // Botão Configurações
    const configBtn = document.getElementById('configBtn');
    if (configBtn) {
        configBtn.addEventListener('click', function() {
            alert('⚙️ Configurações - Em desenvolvimento');
        });
    }
    
    // Botão Nova Falta
    const addFaltaBtn = document.getElementById('addFaltaBtn');
    if (addFaltaBtn) {
        addFaltaBtn.addEventListener('click', function() {
            abrirModalFalta();
        });
    }
    
    // Botão Novo Docente
    const addDocenteBtn = document.getElementById('addDocenteBtn');
    if (addDocenteBtn) {
        addDocenteBtn.addEventListener('click', function() {
            abrirModalDocente();
        });
    }
    
    // Botão Limpar Filtros
    const limparBtn = document.getElementById('limparFiltrosBtn');
    if (limparBtn) {
        limparBtn.addEventListener('click', function() {
            document.getElementById('filtroMes').value = '';
            document.getElementById('filtroAno').value = '';
            document.getElementById('filtroDocente').value = '';
            atualizarTabelaFaltas();
        });
    }
    
    // Filtros
    const filtroMes = document.getElementById('filtroMes');
    const filtroAno = document.getElementById('filtroAno');
    const filtroDocente = document.getElementById('filtroDocente');
    
    if (filtroMes) filtroMes.addEventListener('change', atualizarTabelaFaltas);
    if (filtroAno) filtroAno.addEventListener('change', atualizarTabelaFaltas);
    if (filtroDocente) filtroDocente.addEventListener('change', atualizarTabelaFaltas);
}

// Atualizar tabela de faltas
function atualizarTabelaFaltas() {
    const tbody = document.getElementById('faltasTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (sistemaDados.faltas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="11" class="text-center text-muted py-4">
                    <i class="fas fa-clipboard-list fa-2x mb-2"></i>
                    <p class="mb-0">Nenhuma falta registrada</p>
                    <small>Clique em "Nova Falta" para adicionar</small>
                </td>
            </tr>
        `;
        return;
    }
    
    // Ordenar por data (mais recente primeiro)
    const faltasOrdenadas = [...sistemaDados.faltas].sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    );
    
    faltasOrdenadas.forEach(falta => {
        const docente = sistemaDados.docentes.find(d => d.id === falta.docenteId) || 
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

// Função para formatar data
function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// ========== FUNÇÕES GLOBAIS ==========

// Logout
window.AuthService = {
    logout: function() {
        localStorage.removeItem('sistema_faltas_auth');
        window.location.href = 'login.html';
    }
};

// Modal Docente
window.mostrarModalDocente = function() {
    abrirModalDocente();
};

function abrirModalDocente() {
    // Resetar formulário
    const form = document.getElementById('docenteForm');
    if (form) form.reset();
    
    // Mostrar modal
    const modalElement = document.getElementById('addDocenteModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Modal Falta
window.mostrarModalFalta = function() {
    abrirModalFalta();
};

function abrirModalFalta() {
    // Resetar formulário
    const form = document.getElementById('faltaForm');
    if (form) {
        form.reset();
        // Data padrão = hoje
        const hoje = new Date().toISOString().split('T')[0];
        const dataInput = document.getElementById('faltaData');
        if (dataInput) dataInput.value = hoje;
    }
    
    // Mostrar modal
    const modalElement = document.getElementById('addFaltaModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Justificativas
window.showAddJustificativaModal = function() {
    const modalElement = document.getElementById('addJustificativaModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// Relatórios
window.aplicarFiltroEstatisticas = function() {
    atualizarEstatisticas();
    alert('📊 Filtro aplicado às estatísticas!');
};

window.gerarRelatorioDocentes = function() {
    alert('📈 Relatório PDF - Em desenvolvimento');
};

// Editar/Excluir
window.editarDocente = function(id) {
    const docente = sistemaDados.docentes.find(d => d.id === id);
    if (docente) {
        alert(`✏️ Editar docente: ${docente.nome}\n\nEm desenvolvimento...`);
    }
};

window.excluirDocente = function(id) {
    const docente = sistemaDados.docentes.find(d => d.id === id);
    if (!docente) return;
    
    if (confirm(`Tem certeza que deseja excluir o docente "${docente.nome}"?`)) {
        sistemaDados.docentes = sistemaDados.docentes.filter(d => d.id !== id);
        localStorage.setItem('sistema_faltas_docentes', JSON.stringify(sistemaDados.docentes));
        atualizarInterface();
        alert('✅ Docente excluído com sucesso!');
    }
};

window.editarFalta = function(id) {
    const falta = sistemaDados.faltas.find(f => f.id === id);
    if (falta) {
        alert(`✏️ Editar falta do docente ID ${falta.docenteId}\n\nEm desenvolvimento...`);
    }
};

window.excluirFalta = function(id) {
    const falta = sistemaDados.faltas.find(f => f.id === id);
    if (!falta) return;
    
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
        sistemaDados.faltas = sistemaDados.faltas.filter(f => f.id !== id);
        localStorage.setItem('sistema_faltas_faltas', JSON.stringify(sistemaDados.faltas));
        atualizarTabelaFaltas();
        atualizarEstatisticas();
        alert('✅ Falta excluída com sucesso!');
    }
};

// Funções para selects dinâmicos
// Funções para selects dinâmicos - CORRIGIDAS
window.toggleNovaDisciplina = function() {
    const select = document.getElementById('docenteDisciplinaSelect');
    const input = document.getElementById('novaDisciplinaInput');
    if (select && input) {
        if (select.value === 'nova_disciplina') {
            input.classList.remove('hidden');
            setTimeout(() => input.focus(), 100);
        } else {
            input.classList.add('hidden');
            input.value = '';
        }
    }
};

window.toggleNovoCurso = function() {
    const select = document.getElementById('docenteCursoSelect');
    const input = document.getElementById('novoCursoInput');
    if (select && input) {
        if (select.value === 'novo_curso') {
            input.classList.remove('hidden');
            setTimeout(() => input.focus(), 100);
        } else {
            input.classList.add('hidden');
            input.value = '';
        }
    }
};

// Função para abrir modal de docente corrigida
function abrirModalDocente() {
    // Resetar formulário
    const form = document.getElementById('docenteForm');
    if (form) {
        form.reset();
        document.getElementById('docenteAulas').value = 20;
        
        // Resetar campos extras
        const novaDisciplinaInput = document.getElementById('novaDisciplinaInput');
        const novoCursoInput = document.getElementById('novoCursoInput');
        
        if (novaDisciplinaInput) {
            novaDisciplinaInput.classList.add('hidden');
            novaDisciplinaInput.value = '';
        }
        if (novoCursoInput) {
            novoCursoInput.classList.add('hidden');
            novoCursoInput.value = '';
        }
    }
    
    // Mostrar modal
    const modalElement = document.getElementById('addDocenteModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

// Função para salvar docente CORRIGIDA
function salvarDocente() {
    const nome = document.getElementById('docenteNome')?.value.trim();
    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
    const disciplinaInput = document.getElementById('novaDisciplinaInput');
    const cursoSelect = document.getElementById('docenteCursoSelect');
    const cursoInput = document.getElementById('novoCursoInput');
    const aulas = parseInt(document.getElementById('docenteAulas')?.value) || 0;
    
    let disciplina = disciplinaSelect?.value;
    let curso = cursoSelect?.value;
    
    console.log('Disciplina selecionada:', disciplina);
    console.log('Curso selecionado:', curso);
    
    // Se selecionou "nova disciplina"
    if (disciplina === 'nova_disciplina') {
        disciplina = disciplinaInput?.value.trim();
        console.log('Nova disciplina digitada:', disciplina);
        
        if (!disciplina) {
            alert('❌ Digite o nome da nova disciplina!');
            return;
        }
        
        // Adicionar nova disciplina à lista
        const disciplinaOption = document.createElement('option');
        disciplinaOption.value = disciplina;
        disciplinaOption.textContent = disciplina;
        disciplinaSelect.insertBefore(disciplinaOption, disciplinaSelect.lastChild);
    }
    
    // Se selecionou "novo curso"
    if (curso === 'novo_curso') {
        curso = cursoInput?.value.trim();
        console.log('Novo curso digitado:', curso);
        
        if (!curso) {
            alert('❌ Digite o nome do novo curso!');
            return;
        }
        
        // Adicionar novo curso à lista
        const cursoOption = document.createElement('option');
        cursoOption.value = curso;
        cursoOption.textContent = curso;
        cursoSelect.insertBefore(cursoOption, cursoSelect.lastChild);
    }
    
    // Validações
    if (!nome) {
        alert('❌ Digite o nome do docente!');
        return;
    }
    if (!disciplina || disciplina === 'nova_disciplina') {
        alert('❌ Selecione ou digite uma disciplina válida!');
        return;
    }
    if (!curso || curso === 'novo_curso') {
        alert('❌ Selecione ou digite um curso válido!');
        return;
    }
    if (aulas <= 0) {
        alert('❌ Digite uma quantidade válida de aulas!');
        return;
    }
    
    console.log('Criando novo docente:', { nome, disciplina, curso, aulas });
    
    // Criar novo docente
    const novoDocente = {
        id: sistemaDados.docentes.length > 0 ? 
            Math.max(...sistemaDados.docentes.map(d => d.id)) + 1 : 1,
        nome: nome,
        disciplinas: [disciplina],
        cursos: [curso],
        aulas: aulas
    };
    
    sistemaDados.docentes.push(novoDocente);
    localStorage.setItem('sistema_faltas_docentes', JSON.stringify(sistemaDados.docentes));
    
    console.log('Docente salvo:', novoDocente);
    console.log('Todos os docentes:', sistemaDados.docentes);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocenteModal'));
    if (modal) modal.hide();
    
    // Atualizar interface
    atualizarInterface();
    
    alert('✅ Docente cadastrado com sucesso!');
}

// Configurar botões de salvar nos modais
document.addEventListener('DOMContentLoaded', function() {
    // Botão salvar docente
    const salvarDocenteBtn = document.getElementById('salvarDocenteBtn');
    if (salvarDocenteBtn) {
        salvarDocenteBtn.addEventListener('click', salvarDocente);
    }
    
    // Botão salvar falta
    const salvarFaltaBtn = document.getElementById('salvarFaltaBtn');
    if (salvarFaltaBtn) {
        salvarFaltaBtn.addEventListener('click', salvarFalta);
    }
    
    // Botão salvar justificativa
    const salvarJustificativaBtn = document.getElementById('salvarJustificativaBtn');
    if (salvarJustificativaBtn) {
        salvarJustificativaBtn.addEventListener('click', salvarJustificativa);
    }
});

// Função para salvar docente
function salvarDocente() {
    const nome = document.getElementById('docenteNome')?.value.trim();
    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
    const disciplinaInput = document.getElementById('novaDisciplinaInput');
    const cursoSelect = document.getElementById('docenteCursoSelect');
    const cursoInput = document.getElementById('novoCursoInput');
    const aulas = parseInt(document.getElementById('docenteAulas')?.value) || 0;
    
    let disciplina = disciplinaSelect?.value;
    let curso = cursoSelect?.value;
    
    // Se selecionou "nova disciplina"
    if (disciplina === 'nova_disciplina') {
        disciplina = disciplinaInput?.value.trim();
        if (!disciplina) {
            alert('Digite o nome da nova disciplina!');
            return;
        }
    }
    
    // Se selecionou "novo curso"
    if (curso === 'novo_curso') {
        curso = cursoInput?.value.trim();
        if (!curso) {
            alert('Digite o nome do novo curso!');
            return;
        }
    }
    
    // Validações
    if (!nome) {
        alert('Digite o nome do docente!');
        return;
    }
    if (!disciplina || disciplina === 'nova_disciplina') {
        alert('Selecione ou digite uma disciplina!');
        return;
    }
    if (!curso || curso === 'novo_curso') {
        alert('Selecione ou digite um curso!');
        return;
    }
    if (aulas <= 0) {
        alert('Digite uma quantidade válida de aulas!');
        return;
    }
    
    // Criar novo docente
    const novoDocente = {
        id: sistemaDados.docentes.length > 0 ? 
            Math.max(...sistemaDados.docentes.map(d => d.id)) + 1 : 1,
        nome: nome,
        disciplinas: [disciplina],
        cursos: [curso],
        aulas: aulas
    };
    
    sistemaDados.docentes.push(novoDocente);
    localStorage.setItem('sistema_faltas_docentes', JSON.stringify(sistemaDados.docentes));
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocenteModal'));
    if (modal) modal.hide();
    
    // Atualizar interface
    atualizarInterface();
    
    alert('✅ Docente cadastrado com sucesso!');
}

// Função para salvar falta
function salvarFalta() {
    const docenteId = parseInt(document.getElementById('docenteSelect')?.value) || 0;
    const disciplina = document.getElementById('disciplinaSelect')?.value;
    const curso = document.getElementById('cursoSelect')?.value;
    const quantidade = parseInt(document.getElementById('quantidadeFaltas')?.value) || 1;
    const justificativa = document.getElementById('justificativaSelect')?.value;
    const data = document.getElementById('faltaData')?.value;
    const horarioInicio = document.getElementById('faltaHorarioInicio')?.value;
    const horarioFim = document.getElementById('faltaHorarioFim')?.value;
    const observacoes = document.getElementById('faltaObservacoes')?.value;
    
    // Validações
    if (!docenteId) {
        alert('Selecione um docente!');
        return;
    }
    if (!disciplina) {
        alert('Selecione uma disciplina!');
        return;
    }
    if (!curso) {
        alert('Selecione um curso!');
        return;
    }
    if (quantidade <= 0) {
        alert('A quantidade deve ser maior que zero!');
        return;
    }
    if (!data) {
        alert('Selecione uma data!');
        return;
    }
    if (!horarioInicio || !horarioFim) {
        alert('Preencha os horários!');
        return;
    }
    
    // Criar nova falta
    const novaFalta = {
        id: sistemaDados.faltas.length > 0 ? 
            Math.max(...sistemaDados.faltas.map(f => f.id)) + 1 : 1,
        docenteId: docenteId,
        disciplina: disciplina,
        curso: curso,
        quantidadeFaltas: quantidade,
        justificativa: justificativa || '',
        observacoes: observacoes || '',
        data: data,
        horarioInicio: horarioInicio,
        horarioFim: horarioFim,
        status: justificativa ? 'justificada' : 'não justificada'
    };
    
    sistemaDados.faltas.push(novaFalta);
    localStorage.setItem('sistema_faltas_faltas', JSON.stringify(sistemaDados.faltas));
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFaltaModal'));
    if (modal) modal.hide();
    
    // Atualizar interface
    atualizarTabelaFaltas();
    atualizarEstatisticas();
    
    alert('✅ Falta registrada com sucesso!');
}

// Função para salvar justificativa
function salvarJustificativa() {
    const descricao = document.getElementById('novaJustificativaDescricao')?.value.trim();
    
    if (!descricao) {
        alert('Digite a descrição da justificativa!');
        return;
    }
    
    // Aqui você pode adicionar à lista de justificativas
    alert(`Justificativa "${descricao}" salva!\n\n(Implemente a lógica de armazenamento)`);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addJustificativaModal'));
    if (modal) modal.hide();
}