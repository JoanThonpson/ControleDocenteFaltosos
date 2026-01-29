// js/app.js -- Arquivo principal do sistema de controle de faltas docentes
console.log('Sistema iniciando...');

// ========== VARIÁVEIS GLOBAIS PARA CONTROLE ==========
let docenteEditandoId = null; // Para controlar edição de docente
let faltaEditandoId = null;   // Para controlar edição de falta
let filtroStatusAtual = 'todos'; // 'todos', 'ativos', 'inativos'
let buscaAtual = ''; // Termo de busca atual

// ========== FUNÇÕES AUXILIARES PARA FILTRO ==========

// Função para obter datas do filtro atual
function getDatasFiltroAtual() {
    const dataInicio = document.getElementById('dataInicio')?.value || '';
    const dataFim = document.getElementById('dataFim')?.value || '';
    return { dataInicio, dataFim };
}

// Função para verificar se há filtro ativo
function filtroAtivo() {
    const { dataInicio, dataFim } = getDatasFiltroAtual();
    return !!(dataInicio || dataFim); // Retorna true se qualquer data estiver preenchida
}

// Função para filtrar faltas por período
function getFaltasFiltradasPorPeriodo(dataInicio, dataFim) {
    // Se não houver datas, retorna todas as faltas
    if (!dataInicio && !dataFim) {
        return SistemaStorage.faltas;
    }
    
    return SistemaStorage.faltas.filter(falta => {
        if (!falta.data) return false;
        
        const dataFalta = new Date(falta.data);
        
        // Filtro com data início E data fim
        if (dataInicio && dataFim) {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            return dataFalta >= inicio && dataFalta <= fim;
        }
        
        // Filtro apenas com data início
        if (dataInicio && !dataFim) {
            const inicio = new Date(dataInicio);
            return dataFalta >= inicio;
        }
        
        // Filtro apenas com data fim
        if (!dataInicio && dataFim) {
            const fim = new Date(dataFim);
            return dataFalta <= fim;
        }
        
        return true;
    });
}

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
    
    // 4. Configurar observador de abas
    configurarObservadorAbas();
    
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
    atualizarEstatisticasCompletas();
    carregarResumoFaltasPorDocente(); // Carrega sem filtro inicialmente
    
    // Atualizar filtro de anos dinamicamente
    atualizarFiltroAnos();
    
    // Definir filtro "Todos" como ativo inicialmente
    setFiltroAtivo('todos');
}

// ========== CONFIGURAR EVENTOS ==========

function configurarEventos() {
    console.log('Configurando eventos...');
    
    // Botão Sair
    document.getElementById('logoutBtn')?.addEventListener('click', function() {
        SistemaStorage.logout();
        window.location.href = 'login.html';
    });
    
    // Botão Configurações
    document.getElementById('configBtn')?.addEventListener('click', function() {
    mostrarModalConfiguracoes();
    });
    
    // Botão Limpar Filtros
    document.getElementById('limparFiltrosBtn')?.addEventListener('click', function() {
        document.getElementById('filtroMes').value = '';
        document.getElementById('filtroAno').value = '';
        document.getElementById('filtroDocente').value = '';
        atualizarTabelaFaltas();
        console.log('✅ Filtros limpos!');
    });
    
    // Filtros
    document.getElementById('filtroMes')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroAno')?.addEventListener('change', atualizarTabelaFaltas);
    document.getElementById('filtroDocente')?.addEventListener('change', atualizarTabelaFaltas);
    
    // Botão salvar falta
    document.getElementById('salvarFaltaBtn')?.addEventListener('click', salvarFalta);
    
    // Botão salvar docente
    document.getElementById('salvarDocenteBtn')?.addEventListener('click', salvarDocente);
    
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
    
    // ========== FILTROS DE DOCENTES ==========
    
    // Botão Limpar Busca
    document.getElementById('limparBuscaBtn')?.addEventListener('click', function() {
        document.getElementById('buscaDocente').value = '';
        buscaAtual = '';
        atualizarTabelaDocentes();
    });
    
    // Busca em tempo real
    document.getElementById('buscaDocente')?.addEventListener('input', function() {
        buscaAtual = this.value.trim();
        atualizarTabelaDocentes();
    });
    
    // Filtro: Todos
    document.getElementById('filtroTodos')?.addEventListener('click', function() {
        setFiltroAtivo('todos');
        filtroStatusAtual = 'todos';
        atualizarTabelaDocentes();
    });
    
    // Filtro: Ativos
    document.getElementById('filtroAtivos')?.addEventListener('click', function() {
        setFiltroAtivo('ativos');
        filtroStatusAtual = 'ativos';
        atualizarTabelaDocentes();
    });
    
    // Filtro: Inativos
    document.getElementById('filtroInativos')?.addEventListener('click', function() {
        setFiltroAtivo('inativos');
        filtroStatusAtual = 'inativos';
        atualizarTabelaDocentes();
    });
    
    // ========== BOTÕES DO CONTROLE ADMINISTRATIVO ==========
    
    // Botão aplicar filtro de estatísticas
    document.getElementById('aplicarFiltroBtn')?.addEventListener('click', aplicarFiltroEstatisticas);
    
    // Botão gerar relatório PDF
    document.getElementById('gerarRelatorioPDFBtn')?.addEventListener('click', gerarRelatorioDocentes);
    
    // Botão limpar busca de justificativas
    document.getElementById('limparBuscaJustificativa')?.addEventListener('click', function() {
        document.getElementById('buscaJustificativa').value = '';
        carregarJustificativas();
    });
    
    console.log('Eventos configurados com sucesso!');
}

// Configurar observador de abas
function configurarObservadorAbas() {
    const tabs = document.querySelectorAll('a[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', function(e) {
            const targetTab = e.target.getAttribute('href');
            console.log('Aba aberta:', targetTab);
            
            setTimeout(() => {
                if (targetTab === '#justificativas') {
                    console.log('Carregando justificativas...');
                    carregarJustificativas();
                } else if (targetTab === '#controle') {
                    console.log('Carregando estatísticas...');
                    atualizarEstatisticasCompletas();
                    // Adicione esta linha:
                    carregarResumoFaltasPorDocente();
                }
            }, 100);
        });
    });
}

// ========== FUNÇÕES DE NAVEGAÇÃO ==========

// Modal Docente
window.mostrarModalDocente = function() {
    abrirModalDocenteAvancado();
};

// Modal Falta
window.mostrarModalFalta = function() {
    abrirModalFalta();
};

// Modal Configurações
function mostrarModalConfiguracoes() {
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
}

// ========== FUNÇÕES DE TABELA ==========

function atualizarTabelaDocentes() {
    const tbody = document.getElementById('docentesTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const docentes = SistemaStorage.docentes;
    
    // Aplicar filtros
    const docentesFiltrados = docentes.filter(docente => {
        // Filtro por status
        if (filtroStatusAtual === 'ativos' && !docente.ativo) return false;
        if (filtroStatusAtual === 'inativos' && docente.ativo) return false;
        
        // Filtro por busca (nome)
        if (buscaAtual) {
            const nomeNormalizado = docente.nome.toLowerCase();
            const buscaNormalizada = buscaAtual.toLowerCase();
            return nomeNormalizado.includes(buscaNormalizada);
        }
        
        return true;
    });
    
    // Atualizar contador
    atualizarContadorDocentes(docentesFiltrados.length, docentes.length);
    
    if (docentesFiltrados.length === 0) {
        let mensagem = '';
        if (buscaAtual) {
            mensagem = `Nenhum docente encontrado para "${buscaAtual}"`;
        } else if (filtroStatusAtual === 'ativos') {
            mensagem = 'Nenhum docente ativo encontrado';
        } else if (filtroStatusAtual === 'inativos') {
            mensagem = 'Nenhum docente inativo encontrado';
        } else {
            mensagem = 'Nenhum docente cadastrado';
        }
        
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-user-slash fa-2x mb-2"></i>
                    <p class="mb-0">${mensagem}</p>
                    ${!buscaAtual ? '<small>Clique em "Novo Docente" para adicionar</small>' : ''}
                </td>
            </tr>
        `;
        
        // Atualizar selects de docentes (apenas ativos para faltas)
        atualizarSelectsDocentes();
        return;
    }
    
    // Ordenar por nome
    const docentesOrdenados = [...docentesFiltrados].sort((a, b) => 
        a.nome.localeCompare(b.nome)
    );
    
    docentesOrdenados.forEach(docente => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${docente.id}</td>
            <td>${docente.nome}</td>
            <td>${docente.disciplinas.join(', ')}</td>
            <td>${docente.cursos.join(', ')}</td>
            <td>${docente.aulas}</td>
            <td>
                ${docente.ativo ? 
                    '<span class="badge bg-success"><i class="fas fa-check-circle me-1"></i> Ativo</span>' : 
                    '<span class="badge bg-secondary"><i class="fas fa-times-circle me-1"></i> Inativo</span>'}
            </td>
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

// Função para atualizar selects de docentes
function atualizarSelectsDocentes() {
    const select = document.getElementById('docenteSelect');
    const filtro = document.getElementById('filtroDocente');
    
    if (select) {
        select.innerHTML = '<option value="">Selecione um docente</option>';
        SistemaStorage.docentes.forEach(docente => {
            // Apenas docentes ATIVOS para novas faltas
            if (docente.ativo) {
                const option = document.createElement('option');
                option.value = docente.id;
                option.textContent = docente.nome;
                select.appendChild(option);
            }
        });
    }
    
    if (filtro) {
        filtro.innerHTML = '<option value="">Todos os docentes</option>';
        SistemaStorage.docentes.forEach(docente => {
            // Para filtro de faltas, mostrar todos os docentes (ativos e inativos)
            const option = document.createElement('option');
            option.value = docente.id;
            option.textContent = docente.nome;
            filtro.appendChild(option);
        });
    }
}

// Função para atualizar contador
function atualizarContadorDocentes(mostrando, total) {
    const totalMostrado = document.getElementById('totalMostrado');
    const totalGeral = document.getElementById('totalGeral');
    
    if (totalMostrado && totalGeral) {
        totalMostrado.textContent = mostrando;
        totalGeral.textContent = total;
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

// ========== FUNÇÕES AUXILIARES ==========

function formatarData(dataString) {
    if (!dataString) return '';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
}

// Função para definir botão de filtro ativo
function setFiltroAtivo(filtro) {
    const btnTodos = document.getElementById('filtroTodos');
    const btnAtivos = document.getElementById('filtroAtivos');
    const btnInativos = document.getElementById('filtroInativos');
    
    // Remover classe active de todos
    btnTodos?.classList.remove('active');
    btnAtivos?.classList.remove('active');
    btnInativos?.classList.remove('active');
    
    // Adicionar classe active ao botão correto
    switch(filtro) {
        case 'todos':
            btnTodos?.classList.add('active');
            break;
        case 'ativos':
            btnAtivos?.classList.add('active');
            break;
        case 'inativos':
            btnInativos?.classList.add('active');
            break;
    }
}

// ========== FUNÇÕES DE JUSTIFICATIVAS ==========

function carregarJustificativas() {
    const lista = document.getElementById('listaJustificativas');
    const buscaInput = document.getElementById('buscaJustificativa');
    
    if (!lista) {
        console.error('Elemento #listaJustificativas não encontrado!');
        return;
    }
    
    lista.innerHTML = '';
    
    const justificativas = SistemaStorage.getJustificativasOrdenadas();
    
    if (justificativas.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="fas fa-file-alt fa-2x mb-2"></i>
                <p class="mb-0">Nenhuma justificativa cadastrada</p>
                <small>Vá em <strong>Configurações → Justificativas</strong> para adicionar</small>
            </div>
        `;
        return;
    }
    
    // Filtrar por busca se houver termo
    const termoBusca = buscaInput?.value.toLowerCase() || '';
    const justificativasFiltradas = justificativas.filter(j => 
        j.toLowerCase().includes(termoBusca)
    );
    
    if (justificativasFiltradas.length === 0) {
        lista.innerHTML = `
            <div class="list-group-item text-center text-muted py-4">
                <i class="fas fa-search fa-2x mb-2"></i>
                <p class="mb-0">Nenhuma justificativa encontrada para "${termoBusca}"</p>
            </div>
        `;
        return;
    }
    
    justificativasFiltradas.forEach(justificativa => {
        const emUso = SistemaStorage.justificativaEmUso(justificativa);
        const quantidadeUso = SistemaStorage.faltas.filter(f => 
            f.justificativa === justificativa
        ).length;
        
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        item.innerHTML = `
            <div>
                <i class="fas fa-file-alt text-primary me-2"></i>
                <span class="fw-bold">${justificativa}</span>
                <div class="small text-muted">
                    ${quantidadeUso} ${quantidadeUso === 1 ? 'falta registrada' : 'faltas registradas'} com esta justificativa
                </div>
            </div>
            <div class="badge bg-${emUso ? 'success' : 'secondary'}">
                ${emUso ? 'Em uso' : 'Não utilizada'}
            </div>
        `;
        lista.appendChild(item);
    });
    
    // Configurar busca em tempo real
    if (buscaInput) {
        buscaInput.addEventListener('input', carregarJustificativas);
    }
}

// ========== FUNÇÕES DE CONTROLE ADMINISTRATIVO ==========

function atualizarEstatisticasCompletas() {
    const container = document.getElementById('estatisticas');
    if (!container) return;
    
    const totalDocentes = SistemaStorage.docentes.length;
    const docentesAtivos = SistemaStorage.docentes.filter(d => d.ativo !== false).length;
    const totalFaltas = SistemaStorage.faltas.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = SistemaStorage.faltas
        .filter(f => f.justificada)
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">📊 Estatísticas Gerais</h6>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Total de Docentes:</span>
                            <strong>${totalDocentes}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Docentes Ativos:</span>
                            <strong class="text-success">${docentesAtivos}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Docentes Inativos:</span>
                            <strong class="text-secondary">${totalDocentes - docentesAtivos}</strong>
                        </div>
                        <hr>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Total de Faltas:</span>
                            <strong>${totalFaltas}</strong>
                        </div>
                        <div class="d-flex justify-content-between mb-2">
                            <span>Faltas Justificadas:</span>
                            <strong class="text-success">${faltasJustificadas}</strong>
                        </div>
                        <div class="d-flex justify-content-between">
                            <span>Faltas Não Justificadas:</span>
                            <strong class="text-danger">${totalFaltas - faltasJustificadas}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-body">
                        <h6 class="card-title">📈 Últimas Faltas Registradas</h6>
                        ${SistemaStorage.faltas.length === 0 ? 
                            '<p class="text-muted">Nenhuma falta registrada</p>' : 
                            SistemaStorage.faltas
                                .sort((a, b) => new Date(b.data) - new Date(a.data))
                                .slice(0, 3)
                                .map(falta => {
                                    const docente = SistemaStorage.getDocentePorId(falta.docenteId);
                                    return `
                                        <div class="mb-2 p-2 border rounded">
                                            <small class="d-block">${formatarData(falta.data)}</small>
                                            <strong>${docente?.nome || 'Docente não encontrado'}</strong>
                                            <span class="badge ${falta.justificada ? 'bg-success' : 'bg-danger'} float-end">
                                                ${falta.justificada ? 'Justificada' : 'Não Justificada'}
                                            </span>
                                        </div>
                                    `;
                                }).join('')
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
}

function aplicarFiltroEstatisticas() {
    console.log('Aplicando filtro de estatísticas...');
    
    const dataInicio = document.getElementById('dataInicio')?.value;
    const dataFim = document.getElementById('dataFim')?.value;
    
    // Se não houver datas, usar todos os dados
    if (!dataInicio && !dataFim) {
        atualizarEstatisticasCompletas();
        alert('📊 Exibindo todas as estatísticas (sem filtro de data)');
        return;
    }
    
    // Validar datas
    if (dataInicio && dataFim && dataInicio > dataFim) {
        alert('❌ Data de início não pode ser maior que data de fim!');
        return;
    }
    
    // Filtrar faltas por data
    const faltasFiltradas = SistemaStorage.faltas.filter(falta => {
        if (!falta.data) return false;
        
        const dataFalta = new Date(falta.data);
        
        if (dataInicio && dataFim) {
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            return dataFalta >= inicio && dataFalta <= fim;
        } else if (dataInicio) {
            const inicio = new Date(dataInicio);
            return dataFalta >= inicio;
        } else if (dataFim) {
            const fim = new Date(dataFim);
            return dataFalta <= fim;
        }
        
        return true;
    });
    
    // Calcular estatísticas filtradas
    const totalDocentes = SistemaStorage.docentes.length;
    const totalFaltas = faltasFiltradas.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = faltasFiltradas
        .filter(f => f.justificada)
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    const container = document.getElementById('estatisticas');
    if (container) {
        container.innerHTML = `
            <div class="alert alert-info">
                <i class="fas fa-filter me-2"></i>
                <strong>Estatísticas Filtradas:</strong>
                ${dataInicio ? `De ${formatarData(dataInicio)}` : ''}
                ${dataFim ? `até ${formatarData(dataFim)}` : ''}
            </div>
            <p><strong>Total de Docentes:</strong> ${totalDocentes}</p>
            <p><strong>Total de Faltas (no período):</strong> ${totalFaltas}</p>
            <p><strong>Faltas Justificadas:</strong> ${faltasJustificadas}</p>
            <p><strong>Faltas Não Justificadas:</strong> ${totalFaltas - faltasJustificadas}</p>
            <hr>
            <small class="text-muted">
                <i class="fas fa-info-circle me-1"></i>
                ${faltasFiltradas.length} registro(s) encontrado(s)
            </small>
        `;
    }
    // Carregar resumo de faltas por docente com filtro

    carregarResumoFaltasPorDocente(true);
    
    alert('📊 Filtro aplicado às estatísticas e à tabela de resumo!');
}

// ========== FUNÇÕES DE DOCENTE ==========

// Função para abrir modal de docente com múltiplas disciplinas/cursos
function abrirModalDocenteAvancado(id = null) {
    docenteEditandoId = id;
    
    // Se for edição, carregar dados
    if (id) {
        const docente = SistemaStorage.getDocentePorId(id);
        if (docente) {
            // Preencher dados básicos
            document.getElementById('docenteNome').value = docente.nome || '';
            document.getElementById('docenteAulas').value = docente.aulas || 20;
            
            // Preencher checkbox de status
            const docenteAtivoCheckbox = document.getElementById('docenteAtivo');
            if (docenteAtivoCheckbox) {
                docenteAtivoCheckbox.checked = docente.ativo !== false;
            }
            
            // Carregar disciplinas dinamicamente
            carregarDisciplinasDoDocente(docente.disciplinas || []);
            
            // Carregar cursos dinamicamente
            carregarCursosDoDocente(docente.cursos || []);
        }
    } else {
        // Novo docente - limpar tudo
        document.getElementById('docenteNome').value = '';
        document.getElementById('docenteAulas').value = 20;
        
        // Checkbox marcado por padrão para novos docentes
        const docenteAtivoCheckbox = document.getElementById('docenteAtivo');
        if (docenteAtivoCheckbox) {
            docenteAtivoCheckbox.checked = true;
        }
        
        document.getElementById('listaDisciplinasDocente').innerHTML = '';
        document.getElementById('listaCursosDocente').innerHTML = '';
        
        // Adicionar uma disciplina e curso vazios por padrão
        adicionarNovaDisciplinaDocente();
        adicionarNovoCursoDocente();
    }
    
    // Configurar título
    const modalTitle = document.getElementById('docenteModalTitle');
    if (modalTitle) {
        modalTitle.textContent = id ? 'Editar Docente' : 'Cadastrar Docente';
    }
    
        // Mostrar modal
    const modalElement = document.getElementById('addDocenteModal');
    if (modalElement) {
        // Verificar se já existe instância
        let modal = bootstrap.Modal.getInstance(modalElement);
        
        if (!modal) {
            // Criar nova instância
            modal = new bootstrap.Modal(modalElement);
        }
        
        modal.show();
    }
}

// Funções auxiliares para o modal avançado
function carregarDisciplinasDoDocente(disciplinas) {
    const container = document.getElementById('listaDisciplinasDocente');
    if (!container) return;
    
    container.innerHTML = '';
    
    disciplinas.forEach((disciplina, index) => {
        const item = criarItemDisciplinaDocente(disciplina, index);
        container.appendChild(item);
    });
    
    // Se não houver disciplinas, adicionar uma vazia
    if (disciplinas.length === 0) {
        adicionarNovaDisciplinaDocente();
    }
}

function carregarCursosDoDocente(cursos) {
    const container = document.getElementById('listaCursosDocente');
    if (!container) return;
    
    container.innerHTML = '';
    
    cursos.forEach((curso, index) => {
        const item = criarItemCursoDocente(curso, index);
        container.appendChild(item);
    });
    
    // Se não houver cursos, adicionar um vazio
    if (cursos.length === 0) {
        adicionarNovoCursoDocente();
    }
}

function criarItemDisciplinaDocente(disciplina = '', index) {
    const div = document.createElement('div');
    div.className = 'disciplina-item mb-2';
    div.innerHTML = `
        <div class="input-group">
            <select class="form-select disciplina-select" data-index="${index}">
                <option value="">Selecione uma disciplina</option>
                ${SistemaStorage.getDisciplinasOrdenadas().map(d => 
                    `<option value="${d}" ${d === disciplina ? 'selected' : ''}>${d}</option>`
                ).join('')}
                <option value="nova_disciplina">+ Nova Disciplina</option>
            </select>
            <input type="text" class="form-control nova-disciplina-input ${disciplina && !SistemaStorage.disciplinas.includes(disciplina) ? '' : 'hidden'}" 
                   placeholder="Digite nova disciplina" value="${disciplina && !SistemaStorage.disciplinas.includes(disciplina) ? disciplina : ''}">
            <button type="button" class="btn btn-outline-danger" onclick="removerDisciplinaDocente(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return div;
}

function criarItemCursoDocente(curso = '', index) {
    const div = document.createElement('div');
    div.className = 'curso-item mb-2';
    div.innerHTML = `
        <div class="input-group">
            <select class="form-select curso-select" data-index="${index}">
                <option value="">Selecione um curso</option>
                ${SistemaStorage.getCursosOrdenados().map(c => 
                    `<option value="${c}" ${c === curso ? 'selected' : ''}>${c}</option>`
                ).join('')}
                <option value="novo_curso">+ Novo Curso</option>
            </select>
            <input type="text" class="form-control novo-curso-input ${curso && !SistemaStorage.cursos.includes(curso) ? '' : 'hidden'}" 
                   placeholder="Digite novo curso" value="${curso && !SistemaStorage.cursos.includes(curso) ? curso : ''}">
            <button type="button" class="btn btn-outline-danger" onclick="removerCursoDocente(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    return div;
}

// Funções globais para o modal
window.adicionarNovaDisciplinaDocente = function() {
    const container = document.getElementById('listaDisciplinasDocente');
    if (!container) return;
    
    const index = container.querySelectorAll('.disciplina-item').length;
    const item = criarItemDisciplinaDocente('', index);
    container.appendChild(item);
    
    // Configurar evento de change
    const select = item.querySelector('.disciplina-select');
    if (select) {
        select.addEventListener('change', function() {
            const novaInput = this.nextElementSibling;
            if (this.value === 'nova_disciplina') {
                novaInput.classList.remove('hidden');
                novaInput.focus();
            } else {
                novaInput.classList.add('hidden');
                novaInput.value = '';
            }
        });
    }
};

window.adicionarNovoCursoDocente = function() {
    const container = document.getElementById('listaCursosDocente');
    if (!container) return;
    
    const index = container.querySelectorAll('.curso-item').length;
    const item = criarItemCursoDocente('', index);
    container.appendChild(item);
    
    // Configurar evento de change
    const select = item.querySelector('.curso-select');
    if (select) {
        select.addEventListener('change', function() {
            const novaInput = this.nextElementSibling;
            if (this.value === 'novo_curso') {
                novaInput.classList.remove('hidden');
                novaInput.focus();
            } else {
                novaInput.classList.add('hidden');
                novaInput.value = '';
            }
        });
    }
};

window.removerDisciplinaDocente = function(index) {
    const container = document.getElementById('listaDisciplinasDocente');
    if (!container) return;
    
    const itens = container.querySelectorAll('.disciplina-item');
    if (itens.length <= 1) {
        alert('O docente deve ter pelo menos uma disciplina!');
        return;
    }
    
    if (index >= 0 && index < itens.length) {
        itens[index].remove();
        
        // Reindexar itens restantes
        const novosItens = container.querySelectorAll('.disciplina-item');
        novosItens.forEach((item, newIndex) => {
            const select = item.querySelector('.disciplina-select');
            const btn = item.querySelector('.btn-outline-danger');
            if (select) select.dataset.index = newIndex;
            if (btn) btn.setAttribute('onclick', `removerDisciplinaDocente(${newIndex})`);
        });
    }
};

window.removerCursoDocente = function(index) {
    const container = document.getElementById('listaCursosDocente');
    if (!container) return;
    
    const itens = container.querySelectorAll('.curso-item');
    if (itens.length <= 1) {
        alert('O docente deve ter pelo menos um curso!');
        return;
    }
    
    if (index >= 0 && index < itens.length) {
        itens[index].remove();
        
        // Reindexar itens restantes
        const novosItens = container.querySelectorAll('.curso-item');
        novosItens.forEach((item, newIndex) => {
            const select = item.querySelector('.curso-select');
            const btn = item.querySelector('.btn-outline-danger');
            if (select) select.dataset.index = newIndex;
            if (btn) btn.setAttribute('onclick', `removerCursoDocente(${newIndex})`);
        });
    }
};

// Função para salvar docente
function salvarDocente() {
    console.log('Executando salvarDocente()...', { editando: docenteEditandoId });
    
    const nome = document.getElementById('docenteNome')?.value.trim();
    const aulas = parseInt(document.getElementById('docenteAulas')?.value) || 20;
    const ativo = document.getElementById('docenteAtivo')?.checked;
    
    // VALIDAÇÃO BÁSICA
    if (!nome) {
        alert('❌ Digite o nome do docente!');
        return;
    }
    
    // COLETAR DISCIPLINAS DOS CAMPOS DINÂMICOS
    const disciplinas = [];
    const disciplinaItens = document.querySelectorAll('#listaDisciplinasDocente .disciplina-item');
    disciplinaItens.forEach(item => {
        const select = item.querySelector('.disciplina-select');
        const input = item.querySelector('.nova-disciplina-input');
        
        if (select && select.value === 'nova_disciplina' && input && input.value.trim()) {
            // Nova disciplina digitada
            disciplinas.push(input.value.trim());
        } else if (select && select.value && select.value !== 'nova_disciplina') {
            // Disciplina selecionada da lista
            disciplinas.push(select.value);
        }
    });
    
    // VALIDAÇÃO DE DISCIPLINAS
    if (disciplinas.length === 0) {
        alert('❌ O docente deve ter pelo menos uma disciplina!');
        return;
    }
    
    // COLETAR CURSOS DOS CAMPOS DINÂMICOS
    const cursos = [];
    const cursoItens = document.querySelectorAll('#listaCursosDocente .curso-item');
    cursoItens.forEach(item => {
        const select = item.querySelector('.curso-select');
        const input = item.querySelector('.novo-curso-input');
        
        if (select && select.value === 'novo_curso' && input && input.value.trim()) {
            // Novo curso digitado
            cursos.push(input.value.trim());
        } else if (select && select.value && select.value !== 'novo_curso') {
            // Curso selecionado da lista
            cursos.push(select.value);
        }
    });
    
    // VALIDAÇÃO DE CURSOS
    if (cursos.length === 0) {
        alert('❌ O docente deve ter pelo menos um curso!');
        return;
    }
    
    // Criar objeto docente COM CAMPO ATIVO
    const dadosDocente = {
        nome: nome,
        disciplinas: disciplinas,
        cursos: cursos,
        aulas: aulas,
        ativo: ativo !== false // true se marcado, false se desmarcado
    };
    
    console.log('Dados do docente a salvar:', dadosDocente);
    
    // SALVAR OU ATUALIZAR
    let resultado = false;
    
    if (docenteEditandoId) {
        // EDITAR DOCENTE EXISTENTE
        resultado = SistemaStorage.atualizarDocente(docenteEditandoId, dadosDocente);
        if (resultado) {
            alert(`✅ Docente "${nome}" atualizado com sucesso!`);
        }
    } else {
        // NOVO DOCENTE
        const id = SistemaStorage.adicionarDocente(dadosDocente);
        resultado = !!id;
        if (resultado) {
            alert(`✅ Docente "${nome}" cadastrado com sucesso!`);
        }
    }
    
    if (resultado) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDocenteModal'));
        if (modal) modal.hide();
        
        // Atualizar interface
        atualizarTabelaDocentes();
        atualizarEstatisticasCompletas();
        
        // Adicionar disciplinas/cursos novos ao sistema global
        disciplinas.forEach(disciplina => {
            if (!SistemaStorage.disciplinas.includes(disciplina)) {
                SistemaStorage.adicionarDisciplina(disciplina);
            }
        });
        
        cursos.forEach(curso => {
            if (!SistemaStorage.cursos.includes(curso)) {
                SistemaStorage.adicionarCurso(curso);
            }
        });
        
    } else {
        alert('❌ Erro ao salvar docente!');
    }
}

// ========== FUNÇÕES DE FALTA ==========

function abrirModalFalta() {
  faltaEditandoId = null;
    
    // Resetar título
    document.getElementById('faltaModalTitle').textContent = 'Registrar Falta';

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
        // Verificar se já existe instância
        let modal = bootstrap.Modal.getInstance(modalElement);
        
        if (!modal) {
            // Criar nova instância
            modal = new bootstrap.Modal(modalElement);
        }
        
        modal.show();
    }
}

function carregarSelectsModalFalta(docenteId = null) {
    // Carregar disciplinas (todas ou apenas do docente)
    const disciplinaSelect = document.getElementById('disciplinaSelect');
    if (disciplinaSelect) {
        disciplinaSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
        
        let disciplinas = [];
        if (docenteId) {
            // Apenas disciplinas do docente selecionado
            disciplinas = SistemaStorage.getDisciplinasPorDocente(docenteId);
        } else {
            // Todas as disciplinas do sistema (modo padrão)
            disciplinas = SistemaStorage.getDisciplinasOrdenadas();
        }
        
        disciplinas.forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            disciplinaSelect.appendChild(option);
        });
        
        // Se houver apenas uma disciplina, selecione-a automaticamente
        if (disciplinas.length === 1) {
            setTimeout(() => {
                disciplinaSelect.value = disciplinas[0];
            }, 100);
        }
    }
    
    // Carregar cursos (todas ou apenas do docente)
    const cursoSelect = document.getElementById('cursoSelect');
    if (cursoSelect) {
        cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
        
        let cursos = [];
        if (docenteId) {
            // Apenas cursos do docente selecionado
            cursos = SistemaStorage.getCursosPorDocente(docenteId);
        } else {
            // Todos os cursos do sistema (modo padrão)
            cursos = SistemaStorage.getCursosOrdenados();
        }
        
        cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            cursoSelect.appendChild(option);
        });
        
        // Se houver apenas um curso, selecione-o automaticamente
        if (cursos.length === 1) {
            setTimeout(() => {
                cursoSelect.value = cursos[0];
            }, 100);
        }
    }
    
    // Carregar justificativas (sempre todas)
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

// Função para salvar falta
function salvarFalta() {
    console.log('Executando salvarFalta()...', { editando: faltaEditandoId });
    
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
    const dadosFalta = {
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
    
    console.log('Dados a serem salvos:', dadosFalta);
    
    let resultado = false;
    let mensagem = '';
    
    if (faltaEditandoId) {
        // EDITAR FALTA EXISTENTE
        resultado = SistemaStorage.atualizarFalta(faltaEditandoId, dadosFalta);
        mensagem = resultado ? 
            '✅ Falta atualizada com sucesso!' : 
            '❌ Erro ao atualizar falta!';
    } else {
        // NOVA FALTA
        const id = SistemaStorage.adicionarFalta(dadosFalta);
        resultado = !!id;
        mensagem = resultado ? 
            '✅ Falta registrada com sucesso!' : 
            '❌ Erro ao salvar falta!';
    }
    
    if (resultado) {
        // Fechar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addFaltaModal'));
        if (modal) modal.hide();
        
        // Resetar ID de edição
        faltaEditandoId = null;
        
        // Resetar título do modal
        document.getElementById('faltaModalTitle').textContent = 'Registrar Falta';
        
        // Atualizar interface
        atualizarTabelaFaltas();
        atualizarEstatisticasCompletas();
        atualizarFiltroAnos();
        
        alert(mensagem);
    } else {
        alert(mensagem);
    }
}

// ========== FUNÇÕES DE CONFIGURAÇÕES ==========

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
    
    const modalElement = document.getElementById('addDisciplinaModal');
    if (modalElement) {
        // Verificar se já existe instância
        let modal = bootstrap.Modal.getInstance(modalElement);
        
        if (!modal) {
            // Criar nova instância
            modal = new bootstrap.Modal(modalElement);
        }
        
        modal.show();
    }
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

function carregarResumoFaltasPorDocente(usarFiltro = false) {
    const tbody = document.getElementById('tabelaResumoFaltas');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    // OBTER DADOS FILTRADOS OU TODOS
    let faltasParaAnalise = [];
    
    if (usarFiltro && filtroAtivo()) {
        const { dataInicio, dataFim } = getDatasFiltroAtual();
        faltasParaAnalise = getFaltasFiltradasPorPeriodo(dataInicio, dataFim);
    } else {
        faltasParaAnalise = SistemaStorage.faltas;
    }
    
    // Verificar se há dados para mostrar
    if (faltasParaAnalise.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-3">
                    <i class="fas fa-search me-2"></i>
                    Nenhuma falta encontrada ${usarFiltro && filtroAtivo() ? 'no período selecionado' : 'no sistema'}
                </td>
            </tr>
        `;
        return;
    }
    
    SistemaStorage.docentes.forEach(docente => {
        // USAR faltasParaAnalise (que pode estar filtrada)
        const faltasDocente = faltasParaAnalise.filter(f => f.docenteId === docente.id);
        const totalFaltas = faltasDocente.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
        const justificadas = faltasDocente
            .filter(f => f.justificada)
            .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
        const naoJustificadas = totalFaltas - justificadas;
        const percentual = totalFaltas > 0 ? Math.round((justificadas / totalFaltas) * 100) : 0;
        
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${docente.nome}</td>
            <td>${totalFaltas}</td>
            <td class="text-success">${justificadas}</td>
            <td class="text-danger">${naoJustificadas}</td>
            <td>
                <div class="progress" style="height: 20px;">
                    <div class="progress-bar bg-success" role="progressbar" 
                         style="width: ${percentual}%" aria-valuenow="${percentual}" 
                         aria-valuemin="0" aria-valuemax="100">
                        ${percentual}%
                    </div>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
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

// ========== FUNÇÕES GLOBAIS ==========

window.editarDocente = function(id) {
    const docente = SistemaStorage.getDocentePorId(id);
    if (docente) {
        abrirModalDocenteAvancado(id);
    } else {
        alert('❌ Docente não encontrado!');
    }
};

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
            atualizarTabelaFaltas();
            alert('✅ Docente excluído com sucesso!');
        } else {
            alert('❌ Erro ao excluir docente.');
        }
    }
};

window.editarFalta = function(id) {
    console.log('Editando falta ID:', id);
    
    const falta = SistemaStorage.faltas.find(f => f.id === id);
    if (!falta) {
        alert('❌ Falta não encontrada!');
        return;
    }
    
    faltaEditandoId = id;
    
    // Preencher formulário com dados da falta
    document.getElementById('docenteSelect').value = falta.docenteId;
    document.getElementById('disciplinaSelect').value = falta.disciplina;
    document.getElementById('cursoSelect').value = falta.curso;
    document.getElementById('quantidadeFaltas').value = falta.quantidadeFaltas;
    document.getElementById('faltaJustificada').value = falta.justificada ? 'sim' : 'nao';
    document.getElementById('faltaData').value = falta.data;
    document.getElementById('faltaHorarioInicio').value = falta.horarioInicio;
    document.getElementById('faltaHorarioFim').value = falta.horarioFim;
    document.getElementById('faltaObservacoes').value = falta.observacoes || '';
    
    // Configurar justificativa se necessário
    if (falta.justificada && falta.justificativa) {
        setTimeout(() => {
            document.getElementById('justificativaSelect').value = falta.justificativa;
            toggleCampoJustificativa(); // Atualizar visibilidade
        }, 100);
    } else {
        toggleCampoJustificativa();
    }
    
    // Atualizar título do modal
    const docente = SistemaStorage.getDocentePorId(falta.docenteId);
    document.getElementById('faltaModalTitle').textContent = `Editar Falta - ${docente?.nome || 'Docente'}`;
    
    // Carregar selects (caso não estejam carregados)
    carregarSelectsModalFalta();
    
    // Mostrar modal
    const modalElement = document.getElementById('addFaltaModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
};

window.excluirFalta = function(id) {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
        if (SistemaStorage.removerFalta(id)) {
            atualizarTabelaFaltas();
            atualizarEstatisticasCompletas();
            atualizarFiltroAnos();
            alert('✅ Falta excluída com sucesso!');
        } else {
            alert('❌ Erro ao excluir falta.');
        }
    }
};

window.toggleCampoJustificativa = function() {
    const faltaJustificada = document.getElementById('faltaJustificada');
    const justificativaContainer = document.getElementById('justificativaContainer');
    
    if (faltaJustificada && justificativaContainer) {
        if (faltaJustificada.value === 'sim') {
            justificativaContainer.classList.remove('hidden');
        } else {
            justificativaContainer.classList.add('hidden');
            const justificativaSelect = document.getElementById('justificativaSelect');
            if (justificativaSelect) justificativaSelect.value = '';
        }
    }
};

// Função auxiliar para verificar se docente tem faltas
function docenteTemFaltas(id) {
    return SistemaStorage.faltas.some(f => f.docenteId === id);
}

// ========== FUNÇÕES configuração ==========

window.showConfigModal = function() {
    mostrarModalConfiguracoes();
};

// Função para mostrar configurações
function mostrarModalConfiguracoes() {
    console.log('🔧 Abrindo modal de configurações...');
    
    // Carregar listas antes de abrir
    carregarListaDisciplinas();
    carregarListaCursos();
    carregarListaJustificativasConfig();
    
    // Mostrar modal
    const modalElement = document.getElementById('configModal');
    if (modalElement) {
        // Verificar se já existe uma instância do modal
        let modal = bootstrap.Modal.getInstance(modalElement);
        
        if (!modal) {
            // Criar nova instância
            modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });
        }
        
        // Limpar event listeners duplicados (se houver)
        modalElement.removeEventListener('hidden.bs.modal', limparModalConfiguracoes);
        
        // Adicionar event listener para limpeza quando fechar
        modalElement.addEventListener('hidden.bs.modal', limparModalConfiguracoes);
        
        // Mostrar modal
        modal.show();
    } else {
        console.error('❌ Modal de configurações não encontrado!');
        alert('Erro ao abrir configurações. Recarregue a página.');
    }
}

// Função para limpar o modal quando fechado
function limparModalConfiguracoes() {
    console.log('🧹 Limpando modal de configurações...');
    
    // Limpar busca dos inputs
    const buscaInputs = ['buscaDisciplina', 'buscaCurso', 'buscaJustificativaConfig'];
    buscaInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) input.value = '';
    });
    
    // Limpar filtros (se aplicável)
    filtrarDisciplinas();
    filtrarCursos();
    filtrarJustificativasConfig();
}

// Função para carregar justificativas na aba de configurações
function carregarListaJustificativasConfig() {
    const lista = document.getElementById('listaJustificativasConfig');
    if (!lista) {
        console.error('Elemento #listaJustificativasConfig não encontrado!');
        return;
    }
    
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
                <button class="btn btn-warning btn-sm me-1" onclick="editarJustificativaConfig('${justificativa.replace(/'/g, "\\'")}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirJustificativaConfig('${justificativa.replace(/'/g, "\\'")}')"
                        ${emUso ? 'disabled title="Esta justificativa está em uso"' : ''}>
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        lista.appendChild(item);
    });
}

// ========== FUNÇÕES DO RELATÓRIO ==========

function gerarRelatorioDocentes() {
    console.log('Gerando relatório de docentes...');
    
    // OBTER DADOS DO FILTRO
    const { dataInicio, dataFim } = getDatasFiltroAtual();
    const temFiltro = filtroAtivo();
    
    // OBTER FALTAS (FILTRADAS OU TODAS)
    const faltasParaRelatorio = temFiltro 
        ? getFaltasFiltradasPorPeriodo(dataInicio, dataFim)
        : SistemaStorage.faltas;
    
    // Coletar dados para o relatório
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const totalDocentes = SistemaStorage.docentes.length;
    const docentesAtivos = SistemaStorage.docentes.filter(d => d.ativo !== false).length;
    const docentesInativos = totalDocentes - docentesAtivos;
    
    // Usar faltasParaRelatorio em vez de SistemaStorage.faltas
    const totalFaltas = faltasParaRelatorio.reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    const faltasJustificadas = faltasParaRelatorio
        .filter(f => f.justificada)
        .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
    
    // CRIAR CABEÇALHO DO RELATÓRIO COM INFORMAÇÃO DO FILTRO
    let relatorio = `
        RELATÓRIO DE DOCENTES - SISTEMA DE CONTROLE DE FALTAS
        =====================================================
        Data do Relatório: ${dataAtual}
    `;
    
    // ADICIONAR INFORMAÇÃO DO PERÍODO DO FILTRO
    if (temFiltro) {
        const periodoTexto = dataInicio && dataFim 
            ? `Período: ${formatarData(dataInicio)} a ${formatarData(dataFim)}`
            : dataInicio 
                ? `A partir de: ${formatarData(dataInicio)}`
                : `Até: ${formatarData(dataFim)}`;
        
        relatorio += `        ${periodoTexto}\n`;
    }
    
    relatorio += `
        
        RESUMO GERAL:
        -------------
        • Total de Docentes: ${totalDocentes}
        • Docentes Ativos: ${docentesAtivos}
        • Docentes Inativos: ${docentesInativos}
        • Total de Faltas Registradas: ${totalFaltas} ${temFiltro ? '(no período)' : ''}
        • Faltas Justificadas: ${faltasJustificadas}
        • Faltas Não Justificadas: ${totalFaltas - faltasJustificadas}
        
        LISTA DE DOCENTES:
        ------------------
    `;
    
    // MODIFICAR cálculo das faltas por docente para usar dados filtrados
    SistemaStorage.docentes.forEach((docente, index) => {
        // USAR faltasParaRelatorio em vez de SistemaStorage.faltas
        const faltasDocente = faltasParaRelatorio
            .filter(f => f.docenteId === docente.id)
            .reduce((sum, f) => sum + f.quantidadeFaltas, 0);
        
        relatorio += `
        ${index + 1}. ${docente.nome}
           - Status: ${docente.ativo !== false ? 'ATIVO' : 'INATIVO'}
           - Disciplinas: ${docente.disciplinas.join(', ')}
           - Cursos: ${docente.cursos.join(', ')}
           - Aulas/Semana: ${docente.aulas}
           - Total de Faltas: ${faltasDocente} ${temFiltro ? '(no período)' : ''}
        `;
    });
    
    relatorio += `
        =====================================================
        Relatório gerado automaticamente pelo sistema.
    `;
    
    // Criar um popup com o relatório
    const janelaRelatorio = window.open('', '_blank');
    janelaRelatorio.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>Relatório de Docentes</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
                pre { background-color: #f8f9fa; padding: 20px; border-radius: 5px; border: 1px solid #dee2e6; white-space: pre-wrap; }
                .btn-print { padding: 10px 20px; background-color: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer; margin: 5px; }
                .btn-print:hover { background-color: #2980b9; }
            </style>
        </head>
        <body>
            <h1> Relatório de Docentes</h1>
            <pre>${relatorio}</pre>
            <button class="btn-print" onclick="window.print()">🖨️ Imprimir Relatório</button>
            <button class="btn-print" onclick="window.close()" style="background-color: #95a5a6;">✖️ Fechar</button>
        </body>
        </html>
    `);
    
    console.log('Relatório gerado com sucesso!');
    //alert('📄 Relatório gerado em nova janela!');
}

// ========== INICIALIZAÇÃO FINAL ==========
console.log('Sistema de Controle de Faltas carregado!');