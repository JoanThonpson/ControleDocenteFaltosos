// js/app.js - ATUALIZADO PARA USAR SistemaStorage
console.log('Sistema iniciando...');

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
}

// Função para fazer login Admin - ATUALIZADA
function fazerLoginAdmin() {
    const senha = document.getElementById('passwordAdmin')?.value || '';
    
    console.log('Tentando login com senha:', senha);
    
    if (senha === 'admin123') {
        console.log('Senha correta! Fazendo login...');
        
        // Criar objeto usuário
        const usuario = {
            name: 'Administrador',
            type: 'admin',
            loginTime: new Date().toISOString()
        };
        
        // Salvar usando SistemaStorage (se disponível)
        if (window.SistemaStorage) {
            console.log('Usando SistemaStorage para salvar login');
            SistemaStorage.setUsuarioAtual(usuario);
        } else {
            // Fallback para localStorage direto
            console.log('SistemaStorage não disponível, usando localStorage');
            localStorage.setItem('sistema_faltas_auth', JSON.stringify(usuario));
        }
        
        console.log('Autenticação salva');
        
        // Pequeno delay antes de redirecionar
        setTimeout(() => {
            console.log('Redirecionando para sistema.html...');
            window.location.href = 'sistema.html';
        }, 300);
        
    } else {
        alert('❌ Senha incorreta! Use: admin123');
        console.log('Senha incorreta');
    }
}

function configurarEventos() {
    // Botão Sair
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        SistemaStorage.logout();
        window.location.href = 'login.html';
    });
    
    // Botão Configurações
    document.getElementById('configBtn')?.addEventListener('click', function() {
        alert('⚙️ Configurações - Em desenvolvimento');
    });
    
    // Botão Nova Falta
    document.getElementById('addFaltaBtn')?.addEventListener('click', function() {
        abrirModalFalta();
    });
    
    // Botão Novo Docente
    document.getElementById('addDocenteBtn')?.addEventListener('click', function() {
        abrirModalDocente();
    });
    
    // Botão Limpar Filtros
    document.getElementById('limparFiltrosBtn')?.addEventListener('click', function() {
        document.getElementById('filtroMes').value = '';
        document.getElementById('filtroAno').value = '';
        document.getElementById('filtroDocente').value = '';
        atualizarTabelaFaltas();
    });
    
    // Filtros
    document.getElementById('filtroMes')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroAno')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroDocente')?.addEventListener('change', atualizarTabelaFaltas);
    
    // Botão salvar falta
    const salvarFaltaBtn = document.getElementById('salvarFaltaBtn');
    if (salvarFaltaBtn) {
        salvarFaltaBtn.addEventListener('click', salvarFalta);
    }
    
    // Botão salvar docente
    const salvarDocenteBtn = document.getElementById('salvarDocenteBtn');
    if (salvarDocenteBtn) {
        salvarDocenteBtn.addEventListener('click', salvarDocente);
    }
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

// Modal Docente
window.mostrarModalDocente = function() {
    abrirModalDocente();
};

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

// Toggle campo de justificativa
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

// Função para salvar docente (já existente, manter)
function salvarDocente() {
    // ... manter código existente do salvarDocente ...
}

// Função para salvar falta (NOVA)
function salvarFalta() {
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
    
    // Salvar usando SistemaStorage
    SistemaStorage.adicionarFalta(novaFalta);
    
    // Fechar modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFaltaModal'));
    if (modal) modal.hide();
    
    // Atualizar interface
    atualizarTabelaFaltas();
    atualizarEstatisticas();
    
    alert('✅ Falta registrada com sucesso!');
}

// ========== FUNÇÕES GLOBAIS (para onclick no HTML) ==========

// Logout
window.AuthService = {
    logout: function() {
        SistemaStorage.logout();
        window.location.href = 'login.html';
    }
};

// Editar/Excluir Docente
window.editarDocente = function(id) {
    const docente = SistemaStorage.getDocentePorId(id);
    if (docente) {
        alert(`✏️ Editar docente: ${docente.nome}\n\nID: ${docente.id}\nDisciplinas: ${docente.disciplinas.join(', ')}\nCursos: ${docente.cursos.join(', ')}\nAulas: ${docente.aulas}\n\nFuncionalidade em desenvolvimento...`);
    }
};

window.excluirDocente = function(id) {
    const docente = SistemaStorage.getDocentePorId(id);
    if (!docente) return;
    
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

// Editar/Excluir Falta
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
            alert('✅ Falta excluída com sucesso!');
        } else {
            alert('❌ Erro ao excluir falta.');
        }
    }
};

// Justificativas
window.showAddJustificativaModal = function() {
    alert('📄 Modal de Justificativas - Em desenvolvimento\n\nPara a FASE 3 (Configurações)');
};

// Configurações
window.showConfigModal = function() {
    alert('⚙️ Modal de Configurações - Em desenvolvimento\n\nPara a FASE 3 (Configurações)');
};

// Relatórios
window.aplicarFiltroEstatisticas = function() {
    atualizarEstatisticas();
    alert('📊 Filtro aplicado às estatísticas!');
};

window.gerarRelatorioDocentes = function() {
    alert('📈 Relatório PDF - Em desenvolvimento');
};

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
            <span>${justificativa}</span>
            <div>
                <button class="btn btn-warning btn-sm me-1" onclick="editarJustificativa('${justificativa}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirJustificativa('${justificativa}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });
}

// Funções para justificativas (placeholder)
window.editarJustificativa = function(descricao) {
    alert(`✏️ Editar justificativa: "${descricao}"\n\nPara a FASE 3 (Configurações)`);
};

window.excluirJustificativa = function(descricao) {
    if (confirm(`Excluir a justificativa "${descricao}"?`)) {
        alert(`🗑️ Justificativa "${descricao}" excluída (em desenvolvimento)\n\nPara a FASE 3 (Configurações)`);
    }
};

// Toggle campo de justificativa no modal de falta
window.toggleCampoJustificativa = function() {
    const faltaJustificada = document.getElementById('faltaJustificada');
    const justificativaContainer = document.getElementById('justificativaContainer');
    
    if (faltaJustificada && justificativaContainer) {
        if (faltaJustificada.value === 'sim') {
            justificativaContainer.classList.remove('hidden');
            // Carregar justificativas no select
            const justificativaSelect = document.getElementById('justificativaSelect');
            if (justificativaSelect && justificativaSelect.options.length <= 1) {
                justificativaSelect.innerHTML = '<option value="">Selecione uma justificativa</option>';
                SistemaStorage.getJustificativasOrdenadas().forEach(justificativa => {
                    const option = document.createElement('option');
                    option.value = justificativa;
                    option.textContent = justificativa;
                    justificativaSelect.appendChild(option);
                });
            }
        } else {
            justificativaContainer.classList.add('hidden');
            // Limpar seleção
            const justificativaSelect = document.getElementById('justificativaSelect');
            if (justificativaSelect) justificativaSelect.value = '';
        }
    }
};

// Carregar justificativas quando a aba for aberta
document.addEventListener('DOMContentLoaded', function() {
    // Observar mudanças de aba
    const tabs = document.querySelectorAll('a[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            if (e.target.getAttribute('href') === '#justificativas') {
                console.log('Aba de justificativas aberta, carregando...');
                carregarJustificativas();
            }
        });
    });
    
    // Também carregar se já estiver na aba de justificativas
    const activeTab = document.querySelector('.nav-link.active');
    if (activeTab && activeTab.getAttribute('href') === '#justificativas') {
        setTimeout(() => carregarJustificativas(), 100);
    }
});

console.log('Funções globais carregadas!');