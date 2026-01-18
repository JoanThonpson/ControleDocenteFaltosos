// js/app.js -- Arquivo principal do sistema de controle de faltas docentes
console.log('Sistema iniciando...');

// ========== VARIÁVEIS GLOBAIS PARA CONTROLE ==========
let docenteEditandoId = null; // Para controlar edição de docente
let faltaEditandoId = null;   // Para controlar edição de falta

// ========== INICIALIZAÇÃO ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado');
    
    // 1. Verificar autenticação
    if (!verificarAutenticacao()) {
        return;
    }
    
    // 2. Configurar interface
    configurarInterface();
    
    // 3. Configurar eventos
    configurarEventos();
    
    // 4. Carregar justificativas se estiver na aba
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab && activeTab.getAttribute('href') === '#justificativas') {
        setTimeout(() => carregarJustificativas(), 100);
    }
    
    console.log('Sistema pronto!');
});

// ========== FUNÇÕES PRINCIPAIS ==========

function verificarAutenticacao() {
    // Tentar pegar do SistemaStorage primeiro
    let usuario = null;
    
    if (window.SistemaStorage && typeof SistemaStorage.getUsuarioAtual === 'function') {
        console.log('Verificando autenticação via SistemaStorage');
        usuario = SistemaStorage.getUsuarioAtual();
    }
    
    // Se não encontrou no SistemaStorage, tentar localStorage antigo
    if (!usuario) {
        console.log('Tentando localStorage antigo...');
        const authData = localStorage.getItem('sistema_faltas_auth');
        if (authData) {
            try {
                usuario = JSON.parse(authData);
                // Migrar para SistemaStorage
                if (window.SistemaStorage) {
                    SistemaStorage.setUsuarioAtual(usuario);
                }
            } catch (e) {
                console.error('Erro ao parsear authData:', e);
            }
        }
    }
    
    // Se ainda não tem usuário, redirecionar para login
    if (!usuario) {
        console.log('Usuário não autenticado, redirecionando...');
        window.location.href = 'login.html';
        return false;
    }
    
    console.log('Usuário autenticado:', usuario);
    
    // Mostrar informação do usuário
    const userInfo = document.getElementById('userInfo');
    if (userInfo) {
        userInfo.textContent = `${usuario.name} (Administrador)`;
    }
    
    return true;
}

function configurarInterface() {
    // Configurar datas
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
    
    // Atualizar tabelas
    atualizarTabelaDocentes();
    atualizarTabelaFaltas();
    atualizarEstatisticas();
    
    // Atualizar filtro de anos dinamicamente
    atualizarFiltroAnos();
}

function configurarEventos() {
    console.log('Configurando eventos...');
    
    // Botão Sair
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        SistemaStorage.logout();
        window.location.href = 'login.html';
    });
    
    // Botão Configurações
    document.getElementById('configBtn')?.addEventListener('click', function() {
        showConfigModal();
    });
    
    // Botão Limpar Filtros
    const limparFiltrosBtn = document.getElementById('limparFiltrosBtn');
    if (limparFiltrosBtn) {
        limparFiltrosBtn.addEventListener('click', function() {
            document.getElementById('filtroMes').value = '';
            document.getElementById('filtroAno').value = '';
            document.getElementById('filtroDocente').value = '';
            atualizarTabelaFaltas();
            console.log('✅ Filtros limpos!');
        });
    }
    
    // Filtros
    document.getElementById('filtroMes')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroAno')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroDocente')?.addEventListener('change', atualizarTabelaFaltas);
    
    // Botão salvar falta
    const salvarFaltaBtn = document.getElementById('salvarFaltaBtn');
    if (salvarFaltaBtn) {
        console.log('Configurando botão salvarFaltaBtn...');
        salvarFaltaBtn.onclick = salvarFalta;
    } else {
        console.error('❌ Botão salvarFaltaBtn não encontrado!');
    }
    
    // Botão salvar docente
    const salvarDocenteBtn = document.getElementById('salvarDocenteBtn');
    if (salvarDocenteBtn) {
        console.log('Configurando botão salvarDocenteBtn...');
        salvarDocenteBtn.onclick = salvarDocente;
    } else {
        console.error('❌ Botão salvarDocenteBtn não encontrado!');
    }
    
    // Botões de configurações
    document.getElementById('btnNovaDisciplina')?.addEventListener('click', abrirModalAdicionarDisciplina);
    document.getElementById('btnNovoCurso')?.addEventListener('click', abrirModalAdicionarCurso);
    document.getElementById('btnNovaJustificativa')?.addEventListener('click', abrirModalAdicionarJustificativa);
    
    // Botões de salvar nas configurações
    document.getElementById('salvarDisciplinaBtn')?.addEventListener('click', salvarDisciplina);
    document.getElementById('salvarCursoBtn')?.addEventListener('click', salvarCurso);
    document.getElementById('salvarJustificativaBtn')?.addEventListener('click', salvarJustificativa);
    
    // Busca nas configurações
    document.getElementById('buscaDisciplina')?.addEventListener('input', filtrarDisciplinas);
    document.getElementById('buscaCurso')?.addEventListener('input', filtrarCursos);
    document.getElementById('buscaJustificativaConfig')?.addEventListener('input', filtrarJustificativasConfig);
    
    // Observar mudanças de aba para carregar justificativas
    const tabs = document.querySelectorAll('a[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            if (e.target.getAttribute('href') === '#justificativas') {
                console.log('Aba de justificativas aberta, carregando...');
                setTimeout(() => {
                    carregarJustificativas();
                }, 100);
            }
        });
    });
    
    console.log('Eventos configurados com sucesso!');
}

// ========== FUNÇÕES DE TABELA ==========

function atualizarTabelaDocentes() {
    const tbody = document.getElementById('docentesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const docentes = SistemaStorage.docentes;
    
    docentes.forEach(docente => {
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
    
    // Atualizar selects de docentes
    atualizarSelectsDocentes();
}

function atualizarSelectsDocentes() {
    const select = document.getElementById('docenteSelect');
    const filtro = document.getElementById('filtroDocente');
    
    if (select) {
        select.innerHTML = '<option value="">Selecione um docente</option>';
        SistemaStorage.docentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            select.appendChild(option);
        });
    }
    
    if (filtro) {
        filtro.innerHTML = '<option value="">Todos os docentes</option>';
        SistemaStorage.docentes.forEach(docente => {
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            filtro.appendChild(option);
        });
    }
}

function atualizarTabelaFaltas() {
    const tbody = document.getElementById('faltasTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const faltas = SistemaStorage.faltas;
    
    if (faltas.length === 0) {
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
    const faltasOrdenadas = [...faltas].sort((a, b) => 
        new Date(b.data) - new Date(a.data)
    );
    
    // Aplicar filtros
    const mesFiltro = document.getElementById('filtroMes')?.value;
    const anoFiltro = document.getElementById('filtroAno')?.value;
    const docenteFiltro = document.getElementById('filtroDocente')?.value;
    
    faltasOrdenadas.forEach(falta => {
        // Verificar filtros
        if (mesFiltro) {
            const mes = new Date(falta.data).getMonth() + 1;
            if (mes.toString().padStart(2, '0') !== mesFiltro) return;
        }
        
        if (anoFiltro) {
            const ano = new Date(falta.data).getFullYear();
            if (ano.toString() !== anoFiltro) return;
        }
        
        if (docenteFiltro) {
            if (falta.docenteId.toString() !== docenteFiltro) return;
        }
        
        const docente = SistemaStorage.getDocentePorId(falta.docenteId) || 
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
            <td>${falta.justificada ? (falta.justificativa || 'Sim') : 'Não'}</td>
            <td>${falta.observacoes || 'Sem observações'}</td>
            <td>
                <span class="badge ${falta.justificada ? 'badge-justificada' : 'badge-falta'}">
                    ${falta.justificada ? 'Justificada' : 'Não Justificada'}
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
    
    const totalDocentes = SistemaStorage.docentes.length;
    const totalFaltas = SistemaStorage.faltas.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = SistemaStorage.faltas
        .filter(f => f.justificada)
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    container.innerHTML = `
        <p><strong>Total de Docentes:</strong> ${totalDocentes}</p>
        <p><strong>Total de Faltas:</strong> ${totalFaltas}</p>
        <p><strong>Faltas Justificadas:</strong> ${faltasJustificadas}</p>
        <p><strong>Faltas Não Justificadas:</strong> ${totalFaltas - faltasJustificadas}</p>
    `;
}

// ========== FUNÇÕES AUXILIARES ==========

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// ========== FUNÇÕES GLOBAIS ==========

// ========== FUNÇÕES DE DOCENTE ==========

// Modal Docente
window.mostrarModalDocente = function() {
    abrirModalDocente();
};

function abrirModalDocente(id = null) {
    docenteEditandoId = id;
    
    // Resetar formulário
    const form = document.getElementById('docenteForm');
    const modalTitle = document.getElementById('docenteModalTitle');
    
    if (form) {
        form.reset();
        
        // Configurar título baseado no modo
        if (modalTitle) {
            modalTitle.textContent = id ? 'Editar Docente' : 'Cadastrar Docente';
        }
        
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
        
        // Se for edição, carregar dados do docente
        if (id) {
            const docente = SistemaStorage.getDocentePorId(id);
            if (docente) {
                document.getElementById('docenteNome').value = docente.nome || '';
                document.getElementById('docenteAulas').value = docente.aulas || 20;
                
                // Preencher disciplina (primeira disciplina)
                if (docente.disciplinas && docente.disciplinas.length > 0) {
                    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
                    if (disciplinaSelect) {
                        disciplinaSelect.value = docente.disciplinas[0];
                    }
                }
                
                // Preencher curso (primeiro curso)
                if (docente.cursos && docente.cursos.length > 0) {
                    const cursoSelect = document.getElementById('docenteCursoSelect');
                    if (cursoSelect) {
                        cursoSelect.value = docente.cursos[0];
                    }
                }
            }
        }
    }
    
    // Carregar selects com dados do SistemaStorage
    carregarSelectsModalDocente();
    
    // Mostrar modal
    const modalElement = document.getElementById('addDocenteModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function carregarSelectsModalDocente() {
    // Carregar disciplinas no select do modal de docente
    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
    if (disciplinaSelect) {
        const selectedValue = disciplinaSelect.value;
        disciplinaSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        // Adicionar disciplinas do SistemaStorage
        SistemaStorage.getDisciplinasOrdenadas().forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            disciplinaSelect.appendChild(option);
        });
        
        // Adicionar opção de nova disciplina
        const novaOption = document.createElement('option');
        novaOption.value = 'nova_disciplina';
        novaOption.textContent = '+ Nova Disciplina';
        disciplinaSelect.appendChild(novaOption);
        
        // Restaurar seleção se existir
        if (selectedValue && SistemaStorage.disciplinas.includes(selectedValue)) {
            disciplinaSelect.value = selectedValue;
        }
    }
    
    // Carregar cursos no select do modal de docente
    const cursoSelect = document.getElementById('docenteCursoSelect');
    if (cursoSelect) {
        const selectedValue = cursoSelect.value;
        cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
        
        // Adicionar cursos do SistemaStorage
        SistemaStorage.getCursosOrdenados().forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            cursoSelect.appendChild(option);
        });
        
        // Adicionar opção de novo curso
        const novaOption = document.createElement('option');
        novaOption.value = 'novo_curso';
        novaOption.textContent = '+ Novo Curso';
        cursoSelect.appendChild(novaOption);
        
        // Restaurar seleção se existir
        if (selectedValue && SistemaStorage.cursos.includes(selectedValue)) {
            cursoSelect.value = selectedValue;
        }
    }
}

// Função para salvar docente
function salvarDocente() {
    console.log('Executando salvarDocente()...', { editando: docenteEditandoId });
    
    const nome = document.getElementById('docenteNome')?.value.trim();
    const disciplinaSelect = document.getElementById('docenteDisciplinaSelect');
    const cursoSelect = document.getElementById('docenteCursoSelect');
    const aulas = parseInt(document.getElementById('docenteAulas')?.value) || 20;
    
    // Determinar disciplina (selecionada ou nova)
    let disciplina = '';
    if (disciplinaSelect.value === 'nova_disciplina') {
        const novaDisciplina = document.getElementById('novaDisciplinaInput')?.value.trim();
        if (!novaDisciplina) {
            alert('Digite o nome da nova disciplina!');
            return;
        }
        disciplina = novaDisciplina;
        // Adicionar ao sistema se não existir
        SistemaStorage.adicionarDisciplina(novaDisciplina);
    } else {
        disciplina = disciplinaSelect.value;
    }
    
    // Determinar curso (selecionado ou novo)
    let curso = '';
    if (cursoSelect.value === 'novo_curso') {
        const novoCurso = document.getElementById('novoCursoInput')?.value.trim();
        if (!novoCurso) {
            alert('Digite o nome do novo curso!');
            return;
        }
        curso = novoCurso;
        // Adicionar ao sistema se não existir
        SistemaStorage.adicionarCurso(novoCurso);
    } else {
        curso = cursoSelect.value;
    }
    
    // Validações
    if (!nome) {
        alert('Digite o nome do docente!');
        return;
    }
    if (!disciplina) {
        alert('Selecione ou digite uma disciplina!');
        return;
    }
    if (!curso) {
        alert('Selecione ou digite um curso!');
        return;
    }
    if (aulas <= 0) {
        alert('A quantidade de aulas deve ser maior que zero!');
        return;
    }
    
    // Criar objeto docente
    const dadosDocente = {
        nome: nome,
        disciplinas: [disciplina],
        cursos: [curso],
        aulas: aulas
    };
    
    let sucesso = false;
    let mensagem = '';
    
    if (docenteEditandoId) {
        // Modo edição
        console.log('Atualizando docente ID:', docenteEditandoId);
        sucesso = SistemaStorage.atualizarDocente(docenteEditandoId, dadosDocente);
        mensagem = sucesso ? `✅ Docente "${nome}" atualizado com sucesso!` : '❌ Erro ao atualizar docente!';
    } else {
        // Modo criação
        console.log('Criando novo docente...');
        const id = SistemaStorage.adicionarDocente(dadosDocente);
        sucesso = !!id;
        mensagem = sucesso ? `✅ Docente "${nome}" cadastrado com ID ${id}!` : '❌ Erro ao salvar docente!';
    }
    
    if (sucesso) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDocenteModal'));
        if (modal) modal.hide();
        
        // Resetar variável de edição
        docenteEditandoId = null;
        
        // Atualizar interface
        atualizarTabelaDocentes();
        
        alert(mensagem);
    } else {
        alert(mensagem);
    }
}

// Funções para selects dinâmicos
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

// Editar/Excluir Docente
window.editarDocente = function(id) {
    const docente = SistemaStorage.getDocentePorId(id);
    if (docente) {
        abrirModalDocente(id);
    } else {
        alert('❌ Docente não encontrado!');
    }
};

function docenteTemFaltas(id) {
    return SistemaStorage.faltas.some(f => f.docenteId === id);
}

window.excluirDocente = function(id) {
    const docente = SistemaStorage.getDocentePorId(id);
    if (!docente) return;
    
    // Verificar se docente tem faltas registradas
    if (docenteTemFaltas(id)) {
        alert(`❌ Não é possível excluir o docente "${docente.nome}"!\n\nExistem faltas registradas para este docente. Primeiro exclua as faltas associadas.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o docente "${docente.nome}"?`)) {
        if (SistemaStorage.removerDocente(id)) {
            atualizarTabelaDocentes();
            atualizarTabelaFaltas(); // Atualizar também faltas
            alert('✅ Docente excluído com sucesso!');
        } else {
            alert('❌ Erro ao excluir docente.');
        }
    }
};

// ========== FUNÇÕES DE FALTA ==========

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
        
        // Configurar justificativa como "Não"
        const faltaJustificada = document.getElementById('faltaJustificada');
        if (faltaJustificada) faltaJustificada.value = 'nao';
        
        // Esconder campo de justificativa
        const justificativaContainer = document.getElementById('justificativaContainer');
        if (justificativaContainer) justificativaContainer.classList.add('hidden');
    }
    
    // Carregar selects com dados do SistemaStorage
    carregarSelectsModalFalta();
    
    // Mostrar modal
    const modalElement = document.getElementById('addFaltaModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function carregarSelectsModalFalta() {
    // Carregar disciplinas
    const disciplinaSelect = document.getElementById('disciplinaSelect');
    if (disciplinaSelect) {
        disciplinaSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
        SistemaStorage.getDisciplinasOrdenadas().forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            disciplinaSelect.appendChild(option);
        });
    }
    
    // Carregar cursos
    const cursoSelect = document.getElementById('cursoSelect');
    if (cursoSelect) {
        cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
        SistemaStorage.getCursosOrdenados().forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            cursoSelect.appendChild(option);
        });
    }
    
    // Carregar justificativas
    const justificativaSelect = document.getElementById('justificativaSelect');
    if (justificativaSelect) {
        justificativaSelect.innerHTML = '<option value="">Selecione uma justificativa</option>';
        SistemaStorage.getJustificativasOrdenadas().forEach(justificativa => {
            const option = document.createElement('option');
            option.value = justificativa;
            option.textContent = justificativa;
            justificativaSelect.appendChild(option);
        });
    }
}

window.toggleCampoJustificativa = function() {
    const faltaJustificada = document.getElementById('faltaJustificada');
    const justificativaContainer = document.getElementById('justificativaContainer');
    
    if (faltaJustificada && justificativaContainer) {
        if (faltaJustificada.value === 'sim') {
            justificativaContainer.classList.remove('hidden');
        } else {
            justificativaContainer.classList.add('hidden');
            // Limpar seleção
            const justificativaSelect = document.getElementById('justificativaSelect');
            if (justificativaSelect) justificativaSelect.value = '';
        }
    }
};

// Função para salvar falta
function salvarFalta() {
    console.log('Executando salvarFalta()...');
    
    const docenteId = parseInt(document.getElementById('docenteSelect')?.value) || 0;
    const disciplina = document.getElementById('disciplinaSelect')?.value;
    const curso = document.getElementById('cursoSelect')?.value;
    const quantidade = parseInt(document.getElementById('quantidadeFaltas')?.value) || 1;
    const faltaJustificada = document.getElementById('faltaJustificada')?.value === 'sim';
    const justificativa = faltaJustificada ? document.getElementById('justificativaSelect')?.value : '';
    const data = document.getElementById('faltaData')?.value;
    const horarioInicio = document.getElementById('faltaHorarioInicio')?.value;
    const horarioFim = document.getElementById('faltaHorarioFim')?.value;
    const observacoes = document.getElementById('faltaObservacoes')?.value;
    
    console.log('Dados da falta:', {
        docenteId, disciplina, curso, quantidade, faltaJustificada, 
        justificativa, data, horarioInicio, horarioFim, observacoes
    });
    
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
    if (faltaJustificada && !justificativa) {
        alert('Selecione uma justificativa!');
        return;
    }
    
    // Criar objeto falta
    const novaFalta = {
        docenteId: docenteId,
        disciplina: disciplina,
        curso: curso,
        quantidadeFaltas: quantidade,
        justificada: faltaJustificada,
        justificativa: justificativa || '',
        observacoes: observacoes || '',
        data: data,
        horarioInicio: horarioInicio,
        horarioFim: horarioFim
    };
    
    console.log('Nova falta a ser salva:', novaFalta);
    
    // Salvar usando SistemaStorage
    const id = SistemaStorage.adicionarFalta(novaFalta);
    
    if (id) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addFaltaModal'));
        if (modal) modal.hide();
        
        // Atualizar interface
        atualizarTabelaFaltas();
        atualizarEstatisticas();
        atualizarFiltroAnos();
        
        alert('✅ Falta registrada com sucesso!');
    } else {
        alert('❌ Erro ao salvar falta!');
    }
}

window.editarFalta = function(id) {
    const falta = SistemaStorage.faltas.find(f => f.id === id);
    if (falta) {
        alert(`✏️ Editar falta ID: ${falta.id}\n\nDocente ID: ${falta.docenteId}\nDisciplina: ${falta.disciplina}\nCurso: ${falta.curso}\nData: ${falta.data}\n\nFuncionalidade em desenvolvimento...`);
    }
};

window.excluirFalta = function(id) {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
        if (SistemaStorage.removerFalta(id)) {
            atualizarTabelaFaltas();
            atualizarEstatisticas();
            atualizarFiltroAnos();
            alert('✅ Falta excluída com sucesso!');
        } else {
            alert('❌ Erro ao excluir falta.');
        }
    }
};

// ========== FUNÇÕES DE JUSTIFICATIVAS ==========

// Função para carregar justificativas (na aba de justificativas)
function carregarJustificativas() {
    const lista = document.getElementById('listaJustificativas');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const justificativas = SistemaStorage.getJustificativasOrdenadas();
    
    if (justificativas.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted">
                <i class="fas fa-file-alt fa-2x mb-2"></i>
                <p class="mb-0">Nenhuma justificativa cadastrada</p>
                <small>Clique em "Nova Justificativa" para adicionar</small>
            </div>
        `;
        return;
    }
    
    justificativas.forEach(justificativa => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span><i class="fas fa-file-alt text-muted me-2"></i>${justificativa}</span>
        `;
        lista.appendChild(item);
    });
    
    // Configurar busca após carregar itens
    configurarBuscaJustificativas();
}

// Busca de justificativas
function configurarBuscaJustificativas() {
    const buscaInput = document.getElementById('buscaJustificativa');
    if (buscaInput) {
        buscaInput.addEventListener('input', function() {
            const termo = this.value.toLowerCase();
            const itens = document.querySelectorAll('#listaJustificativas .list-group-item');
            
            itens.forEach(item => {
                const texto = item.querySelector('span')?.textContent.toLowerCase() || '';
                item.style.display = texto.includes(termo) ? 'flex' : 'none';
            });
        });
    }
}

// ========== FUNÇÕES DE CONFIGURAÇÕES ==========

window.showConfigModal = function() {
    // Carregar listas antes de abrir
    carregarListaDisciplinas();
    carregarListaCursos();
    carregarListaJustificativasConfig();
    
    // Mostrar modal
    const modalElement = document.getElementById('configModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

// Disciplinas
function carregarListaDisciplinas() {
    const lista = document.getElementById('listaDisciplinas');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const disciplinas = SistemaStorage.getDisciplinasOrdenadas();
    
    if (disciplinas.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="fas fa-book fa-2x mb-2"></i>
                <p class="mb-0">Nenhuma disciplina cadastrada</p>
            </div>
        `;
        return;
    }
    
    disciplinas.forEach(disciplina => {
        const emUso = SistemaStorage.disciplinaEmUso(disciplina);
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${disciplina}</span>
            <div>
                <button class="btn btn-warning btn-sm me-1" onclick="editarDisciplina('${disciplina}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirDisciplina('${disciplina}')"
                        ${emUso ? 'disabled title="Esta disciplina está em uso"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });
}

function abrirModalAdicionarDisciplina() {
    document.getElementById('novaDisciplinaNome').value = '';
    const modal = new bootstrap.Modal(document.getElementById('addDisciplinaModal'));
    modal.show();
}

function salvarDisciplina() {
    const nome = document.getElementById('novaDisciplinaNome')?.value.trim();
    
    if (!nome) {
        alert('❌ Digite o nome da disciplina!');
        return;
    }
    
    if (SistemaStorage.adicionarDisciplina(nome)) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDisciplinaModal'));
        if (modal) modal.hide();
        
        // Atualizar lista
        carregarListaDisciplinas();
        atualizarSelectsDisciplinas();
        
        alert(`✅ Disciplina "${nome}" adicionada com sucesso!`);
    } else {
        alert(`❌ A disciplina "${nome}" já existe!`);
    }
}

function atualizarSelectsDisciplinas() {
    // Atualizar select no modal de docente
    const selectDocente = document.getElementById('docenteDisciplinaSelect');
    if (selectDocente) {
        const selectedValue = selectDocente.value;
        selectDocente.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        SistemaStorage.getDisciplinasOrdenadas().forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            selectDocente.appendChild(option);
        });
        
        // Adicionar opção de nova disciplina
        const novaOption = document.createElement('option');
        novaOption.value = 'nova_disciplina';
        novaOption.textContent = '+ Nova Disciplina';
        selectDocente.appendChild(novaOption);
        
        // Restaurar seleção se ainda existir
        if (selectedValue && SistemaStorage.disciplinas.includes(selectedValue)) {
            selectDocente.value = selectedValue;
        }
    }
    
    // Atualizar select no modal de falta
    const selectFalta = document.getElementById('disciplinaSelect');
    if (selectFalta) {
        const selectedValue = selectFalta.value;
        selectFalta.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        SistemaStorage.getDisciplinasOrdenadas().forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            selectFalta.appendChild(option);
        });
        
        // Restaurar seleção se ainda existir
        if (selectedValue && SistemaStorage.disciplinas.includes(selectedValue)) {
            selectFalta.value = selectedValue;
        }
    }
}

window.editarDisciplina = function(nomeAtual) {
    const novoNome = prompt(`Editar disciplina:\n\nNome atual: ${nomeAtual}\n\nDigite o novo nome:`, nomeAtual);
    
    if (!novoNome || novoNome.trim() === nomeAtual) return;
    
    const novoNomeTrim = novoNome.trim();
    
    // Verificar se o novo nome já existe
    const existe = SistemaStorage.disciplinas.some(d => 
        d.toLowerCase() === novoNomeTrim.toLowerCase() && d !== nomeAtual
    );
    
    if (existe) {
        alert(`❌ A disciplina "${novoNomeTrim}" já existe!`);
        return;
    }
    
    // Atualizar em todos os lugares
    const index = SistemaStorage.disciplinas.indexOf(nomeAtual);
    if (index !== -1) {
        SistemaStorage.disciplinas[index] = novoNomeTrim;
        SistemaStorage.salvar('disciplinas', SistemaStorage.disciplinas);
    }
    
    // Atualizar docentes
    SistemaStorage.docentes.forEach(docente => {
        const disciplinaIndex = docente.disciplinas.indexOf(nomeAtual);
        if (disciplinaIndex !== -1) {
            docente.disciplinas[disciplinaIndex] = novoNomeTrim;
        }
    });
    SistemaStorage.salvar('docentes', SistemaStorage.docentes);
    
    // Atualizar faltas
    SistemaStorage.faltas.forEach(falta => {
        if (falta.disciplina === nomeAtual) {
            falta.disciplina = novoNomeTrim;
        }
    });
    SistemaStorage.salvar('faltas', SistemaStorage.faltas);
    
    // Atualizar interface
    carregarListaDisciplinas();
    atualizarSelectsDisciplinas();
    atualizarTabelaDocentes();
    atualizarTabelaFaltas();
    
    alert(`✅ Disciplina atualizada de "${nomeAtual}" para "${novoNomeTrim}"!`);
};

window.excluirDisciplina = function(nome) {
    if (SistemaStorage.disciplinaEmUso(nome)) {
        alert(`❌ Não é possível excluir a disciplina "${nome}"!\n\nEla está sendo utilizada por docentes ou faltas.`);
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir a disciplina "${nome}"?`)) {
        return;
    }
    
    if (SistemaStorage.removerDisciplina(nome)) {
        carregarListaDisciplinas();
        atualizarSelectsDisciplinas();
        alert(`✅ Disciplina "${nome}" excluída com sucesso!`);
    } else {
        alert(`❌ Erro ao excluir disciplina "${nome}".`);
    }
};

function filtrarDisciplinas() {
    const busca = document.getElementById('buscaDisciplina')?.value.toLowerCase() || '';
    const itens = document.querySelectorAll('#listaDisciplinas .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span')?.textContent.toLowerCase() || '';
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// Cursos
function carregarListaCursos() {
    const lista = document.getElementById('listaCursos');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const cursos = SistemaStorage.getCursosOrdenados();
    
    if (cursos.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="fas fa-graduation-cap fa-2x mb-2"></i>
                <p class="mb-0">Nenhum curso cadastrado</p>
            </div>
        `;
        return;
    }
    
    cursos.forEach(curso => {
        const emUso = SistemaStorage.cursoEmUso(curso);
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${curso}</span>
            <div>
                <button class="btn btn-warning btn-sm me-1" onclick="editarCurso('${curso}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirCurso('${curso}')"
                        ${emUso ? 'disabled title="Este curso está em uso"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });
}

function abrirModalAdicionarCurso() {
    document.getElementById('novoCursoNome').value = '';
    const modal = new bootstrap.Modal(document.getElementById('addCursoModal'));
    modal.show();
}

function salvarCurso() {
    const nome = document.getElementById('novoCursoNome')?.value.trim();
    
    if (!nome) {
        alert('❌ Digite o nome do curso!');
        return;
    }
    
    if (SistemaStorage.adicionarCurso(nome)) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCursoModal'));
        if (modal) modal.hide();
        
        // Atualizar lista
        carregarListaCursos();
        atualizarSelectsCursos();
        
        alert(`✅ Curso "${nome}" adicionado com sucesso!`);
    } else {
        alert(`❌ O curso "${nome}" já existe!`);
    }
}

function atualizarSelectsCursos() {
    // Atualizar select no modal de docente
    const selectDocente = document.getElementById('docenteCursoSelect');
    if (selectDocente) {
        const selectedValue = selectDocente.value;
        selectDocente.innerHTML = '<option value="">Selecione um curso</option>';
        
        SistemaStorage.getCursosOrdenados().forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            selectDocente.appendChild(option);
        });
        
        // Adicionar opção de novo curso
        const novaOption = document.createElement('option');
        novaOption.value = 'novo_curso';
        novaOption.textContent = '+ Novo Curso';
        selectDocente.appendChild(novaOption);
        
        // Restaurar seleção se ainda existir
        if (selectedValue && SistemaStorage.cursos.includes(selectedValue)) {
            selectDocente.value = selectedValue;
        }
    }
    
    // Atualizar select no modal de falta
    const selectFalta = document.getElementById('cursoSelect');
    if (selectFalta) {
        const selectedValue = selectFalta.value;
        selectFalta.innerHTML = '<option value="">Selecione um curso</option>';
        
        SistemaStorage.getCursosOrdenados().forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            selectFalta.appendChild(option);
        });
        
        // Restaurar seleção se ainda existir
        if (selectedValue && SistemaStorage.cursos.includes(selectedValue)) {
            selectFalta.value = selectedValue;
        }
    }
}

window.editarCurso = function(nomeAtual) {
    const novoNome = prompt(`Editar curso:\n\nNome atual: ${nomeAtual}\n\nDigite o novo nome:`, nomeAtual);
    
    if (!novoNome || novoNome.trim() === nomeAtual) return;
    
    const novoNomeTrim = novoNome.trim();
    
    const existe = SistemaStorage.cursos.some(c => 
        c.toLowerCase() === novoNomeTrim.toLowerCase() && c !== nomeAtual
    );
    
    if (existe) {
        alert(`❌ O curso "${novoNomeTrim}" já existe!`);
        return;
    }
    
    const index = SistemaStorage.cursos.indexOf(nomeAtual);
    if (index !== -1) {
        SistemaStorage.cursos[index] = novoNomeTrim;
        SistemaStorage.salvar('cursos', SistemaStorage.cursos);
    }
    
    SistemaStorage.docentes.forEach(docente => {
        const cursoIndex = docente.cursos.indexOf(nomeAtual);
        if (cursoIndex !== -1) {
            docente.cursos[cursoIndex] = novoNomeTrim;
        }
    });
    SistemaStorage.salvar('docentes', SistemaStorage.docentes);
    
    SistemaStorage.faltas.forEach(falta => {
        if (falta.curso === nomeAtual) {
            falta.curso = novoNomeTrim;
        }
    });
    SistemaStorage.salvar('faltas', SistemaStorage.faltas);
    
    carregarListaCursos();
    atualizarSelectsCursos();
    atualizarTabelaDocentes();
    atualizarTabelaFaltas();
    
    alert(`✅ Curso atualizado de "${nomeAtual}" para "${novoNomeTrim}"!`);
};

window.excluirCurso = function(nome) {
    if (SistemaStorage.cursoEmUso(nome)) {
        alert(`❌ Não é possível excluir o curso "${nome}"!\n\nEle está sendo utilizado por docentes ou faltas.`);
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) {
        return;
    }
    
    if (SistemaStorage.removerCurso(nome)) {
        carregarListaCursos();
        atualizarSelectsCursos();
        alert(`✅ Curso "${nome}" excluído com sucesso!`);
    } else {
        alert(`❌ Erro ao excluir curso "${nome}".`);
    }
};

function filtrarCursos() {
    const busca = document.getElementById('buscaCurso')?.value.toLowerCase() || '';
    const itens = document.querySelectorAll('#listaCursos .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span')?.textContent.toLowerCase() || '';
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// Justificativas (configurações)
function carregarListaJustificativasConfig() {
    const lista = document.getElementById('listaJustificativasConfig');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    const justificativas = SistemaStorage.getJustificativasOrdenadas();
    
    if (justificativas.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="fas fa-file-alt fa-2x mb-2"></i>
                <p class="mb-0">Nenhuma justificativa cadastrada</p>
            </div>
        `;
        return;
    }
    
    justificativas.forEach(justificativa => {
        const emUso = SistemaStorage.justificativaEmUso(justificativa);
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <span>${justificativa}</span>
            <div>
                <button class="btn btn-warning btn-sm me-1" onclick="editarJustificativaConfig('${justificativa}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirJustificativaConfig('${justificativa}')"
                        ${emUso ? 'disabled title="Esta justificativa está em uso"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });
}

function abrirModalAdicionarJustificativa() {
    document.getElementById('novaJustificativaDescricao').value = '';
    const modal = new bootstrap.Modal(document.getElementById('addJustificativaModal'));
    modal.show();
}

function salvarJustificativa() {
    const descricao = document.getElementById('novaJustificativaDescricao')?.value.trim();
    
    if (!descricao) {
        alert('❌ Digite a descrição da justificativa!');
        return;
    }
    
    if (SistemaStorage.adicionarJustificativa(descricao)) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addJustificativaModal'));
        if (modal) modal.hide();
        
        // Atualizar lista
        carregarListaJustificativasConfig();
        atualizarSelectsJustificativas();
        
        alert(`✅ Justificativa "${descricao}" adicionada com sucesso!`);
    } else {
        alert(`❌ A justificativa "${descricao}" já existe!`);
    }
}

function atualizarSelectsJustificativas() {
    const selectFalta = document.getElementById('justificativaSelect');
    if (selectFalta) {
        const selectedValue = selectFalta.value;
        selectFalta.innerHTML = '<option value="">Selecione uma justificativa</option>';
        
        SistemaStorage.getJustificativasOrdenadas().forEach(justificativa => {
            const option = document.createElement('option');
            option.value = justificativa;
            option.textContent = justificativa;
            selectFalta.appendChild(option);
        });
        
        if (selectedValue && SistemaStorage.justificativas.includes(selectedValue)) {
            selectFalta.value = selectedValue;
        }
    }
}

window.editarJustificativaConfig = function(descricaoAtual) {
    const novaDescricao = prompt(`Editar justificativa:\n\nDescrição atual: ${descricaoAtual}\n\nDigite a nova descrição:`, descricaoAtual);
    
    if (!novaDescricao || novaDescricao.trim() === descricaoAtual) return;
    
    const novaDescricaoTrim = novaDescricao.trim();
    
    const existe = SistemaStorage.justificativas.some(j => 
        j.toLowerCase() === novaDescricaoTrim.toLowerCase() && j !== descricaoAtual
    );
    
    if (existe) {
        alert(`❌ A justificativa "${novaDescricaoTrim}" já existe!`);
        return;
    }
    
    const index = SistemaStorage.justificativas.indexOf(descricaoAtual);
    if (index !== -1) {
        SistemaStorage.justificativas[index] = novaDescricaoTrim;
        SistemaStorage.salvar('justificativas', SistemaStorage.justificativas);
    }
    
    SistemaStorage.faltas.forEach(falta => {
        if (falta.justificativa === descricaoAtual) {
            falta.justificativa = novaDescricaoTrim;
        }
    });
    SistemaStorage.salvar('faltas', SistemaStorage.faltas);
    
    carregarListaJustificativasConfig();
    carregarJustificativas();
    atualizarSelectsJustificativas();
    atualizarTabelaFaltas();
    
    alert(`✅ Justificativa atualizada de "${descricaoAtual}" para "${novaDescricaoTrim}"!`);
};

window.excluirJustificativaConfig = function(descricao) {
    if (SistemaStorage.justificativaEmUso(descricao)) {
        alert(`❌ Não é possível excluir a justificativa "${descricao}"!\n\nEla está sendo utilizada em registros de faltas.`);
        return;
    }
    
    if (!confirm(`Tem certeza que deseja excluir a justificativa "${descricao}"?`)) {
        return;
    }
    
    if (SistemaStorage.removerJustificativa(descricao)) {
        carregarListaJustificativasConfig();
        carregarJustificativas();
        atualizarSelectsJustificativas();
        alert(`✅ Justificativa "${descricao}" excluída com sucesso!`);
    } else {
        alert(`❌ Erro ao excluir justificativa "${descricao}".`);
    }
};

function filtrarJustificativasConfig() {
    const busca = document.getElementById('buscaJustificativaConfig')?.value.toLowerCase() || '';
    const itens = document.querySelectorAll('#listaJustificativasConfig .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span')?.textContent.toLowerCase() || '';
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// ========== FILTRO DE ANO DINÂMICO ==========

function atualizarFiltroAnos() {
    const select = document.getElementById('filtroAno');
    if (!select) return;
    
    // Extrair anos únicos das faltas
    const anosUnicos = new Set();
    SistemaStorage.faltas.forEach(falta => {
        if (falta.data) {
            const ano = new Date(falta.data).getFullYear();
            anosUnicos.add(ano);
        }
    });
    
    // Converter para array e ordenar do mais recente
    const anos = Array.from(anosUnicos).sort((a, b) => b - a);
    
    // Salvar seleção atual
    const selecaoAtual = select.value;
    
    // Limpar e reconstruir opções
    select.innerHTML = '<option value="">Todos os anos</option>';
    
    // Adicionar anos dinâmicos
    anos.forEach(ano => {
        const option = document.createElement('option');
        option.value = ano;
        option.textContent = ano;
        select.appendChild(option);
    });
    
    // Restaurar seleção se ainda existir
    if (selecaoAtual && Array.from(select.options).some(opt => opt.value === selecaoAtual)) {
        select.value = selecaoAtual;
    }
}

// ========== OUTRAS FUNÇÕES GLOBAIS ==========

window.AuthService = {
    logout: function() {
        SistemaStorage.logout();
        window.location.href = 'login.html';
    }
};

window.aplicarFiltroEstatisticas = function() {
    atualizarEstatisticas();
    alert('📊 Filtro aplicado às estatísticas!');
};

window.gerarRelatorioDocentes = function() {
    alert('📈 Relatório PDF - Em desenvolvimento');
};

console.log('Sistema de Configurações carregado!');