// js/utils/storage.js
// Estado global centralizado do sistema - ATUALIZADO COM DADOS DO MODELO
export const state = {
    // Arrays de configuração - INICIALIZADOS VAZIOS (serão carregados)
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
    
    // Estado temporário
    usuarioResetSenha: null
};

// Funções de hash de senha (MANTIDAS DO MODELO)
export function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
}

export function verifyPassword(inputPassword, storedHash) {
    return hashPassword(inputPassword) === storedHash;
}

// Inicializar sistema - ATUALIZADO COM DADOS DO MODELO
export function inicializarSistema() {
    console.log('Inicializando sistema de storage com dados do modelo...');
    
    // Carregar ou inicializar cada tipo de dado com dados do modelo
    carregarOuInicializar('sistema_faltas_usuarios', 'usuarios', getUsuariosPadrao());
    carregarOuInicializar('sistema_faltas_disciplinas', 'disciplinas', getDisciplinasPadrao());
    carregarOuInicializar('sistema_faltas_cursos', 'cursos', getCursosPadrao());
    carregarOuInicializar('sistema_faltas_justificativas', 'justificativas', getJustificativasPadrao());
    carregarOuInicializar('sistema_faltas_docentes', 'docentes', getDocentesPadrao());
    carregarOuInicializar('sistema_faltas_faltas', 'faltas', getFaltasPadrao());
    
    console.log('Sistema de storage inicializado!', {
        usuarios: state.usuarios.length,
        disciplinas: state.disciplinas.length,
        cursos: state.cursos.length,
        justificativas: state.justificativas.length,
        docentes: state.docentes.length,
        faltas: state.faltas.length
    });
}

// Dados padrão ATUALIZADOS com base no modelo monolítico
function getUsuariosPadrao() {
    return [
        {
            id: 1,
            nome: "Administrador Sistema",
            cpf: "123.456.789-00",
            password: hashPassword("admin123"), // SENHA: admin123
            tipo: "admin",
            dataCriacao: new Date().toISOString(),
            ativo: true
        },
        {
            id: 2,
            nome: "Gestor Teste",
            cpf: "987.654.321-00",
            password: hashPassword("gestor123"), // SENHA: gestor123
            tipo: "gestor",
            dataCriacao: new Date().toISOString(),
            ativo: true
        },
        {
            id: 3,
            nome: "Usuário Teste",
            cpf: "111.222.333-44",
            password: hashPassword("user123"), // SENHA: user123
            tipo: "user",
            dataCriacao: new Date().toISOString(),
            ativo: true
        }
    ];
}

function getDisciplinasPadrao() {
    return [
        "Matemática", "Português", "História", "Geografia", 
        "Ciências", "Inglês", "Educação Física", "Artes"
    ];
}

function getCursosPadrao() {
    return [
        "Ensino Fundamental", "Ensino Médio", "Educação Infantil", "EJA"
    ];
}

function getJustificativasPadrao() {
    return [
        "Consulta médica",
        "Problemas de saúde",
        "Assuntos particulares",
        "Atestado médico",
        "Licença saúde",
        "Compromisso familiar"
    ];
}

function getDocentesPadrao() {
    return [
        { 
            id: 1, 
            nome: "Emerson Israel Mendes", 
            disciplinas: ["Matemática", "Física"], 
            cursos: ["Ensino Médio", "Pré-vestibular"], 
            aulas: 13.5 
        },
        { 
            id: 2, 
            nome: "Ulrias Fagner Santos Nascimento", 
            disciplinas: ["Português", "Literatura"], 
            cursos: ["Ensino Médio"], 
            aulas: 162 
        },
        { 
            id: 3, 
            nome: "Laura Lucia Da Silva Amorim", 
            disciplinas: ["História"], 
            cursos: ["Ensino Fundamental", "Ensino Médio"], 
            aulas: 90 
        }
    ];
}

function getFaltasPadrao() {
    return [
        { 
            id: 1, 
            docenteId: 1, 
            disciplina: "Matemática", 
            curso: "Ensino Médio", 
            quantidadeFaltas: 1,
            justificativa: "Consulta médica",
            observacoes: "Apresentou atestado médico",
            data: "2024-01-15", 
            horarioInicio: "08:00", 
            horarioFim: "09:30", 
            status: "justificada" 
        }
    ];
}

// Função auxiliar para carregar ou usar valor padrão
function carregarOuInicializar(chaveStorage, propriedadeState, valorPadrao) {
    const dadosSalvos = localStorage.getItem(chaveStorage);
    if (dadosSalvos) {
        state[propriedadeState] = JSON.parse(dadosSalvos);
        console.log(`Carregados ${state[propriedadeState].length} ${propriedadeState} do localStorage`);
    } else {
        state[propriedadeState] = valorPadrao;
        localStorage.setItem(chaveStorage, JSON.stringify(valorPadrao));
        console.log(`Inicializados ${valorPadrao.length} ${propriedadeState} padrão`);
    }
}

// Funções de salvamento individual (MANTIDAS)
export function salvarUsuarios() {
    localStorage.setItem('sistema_faltas_usuarios', JSON.stringify(state.usuarios));
}

export function salvarDisciplinas() {
    localStorage.setItem('sistema_faltas_disciplinas', JSON.stringify(state.disciplinas));
}

export function salvarCursos() {
    localStorage.setItem('sistema_faltas_cursos', JSON.stringify(state.cursos));
}

export function salvarJustificativas() {
    localStorage.setItem('sistema_faltas_justificativas', JSON.stringify(state.justificativas));
}

export function salvarDocentes() {
    localStorage.setItem('sistema_faltas_docentes', JSON.stringify(state.docentes));
}

export function salvarFaltas() {
    localStorage.setItem('sistema_faltas_faltas', JSON.stringify(state.faltas));
}

// Salvar todos os dados de uma vez
export function salvarTodosDados() {
    salvarUsuarios();
    salvarDisciplinas();
    salvarCursos();
    salvarJustificativas();
    salvarDocentes();
    salvarFaltas();
    console.log('Todos os dados salvos no localStorage');
}

// Funções auxiliares para obter dados
export function getDocenteById(id) {
    return state.docentes.find(d => d.id === id) || 
           { nome: 'Docente não encontrado', disciplinas: [], cursos: [], aulas: 0 };
}

export function getProximoId(lista) {
    if (state[lista].length === 0) return 1;
    return Math.max(...state[lista].map(item => item.id)) + 1;
}