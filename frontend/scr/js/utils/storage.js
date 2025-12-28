// Gerenciamento de dados no localStorage
export let disciplinas = [];
export let cursos = [];
export let justificativas = [];
export let docentes = [];
export let faltas = [];
export let usuarios = [];
export let currentUser = null;
export let isAdmin = false;
export let isGestor = false;
export let editandoFaltaId = null;
export let editandoDocenteId = null;
export let usuarioResetSenha = null;

// Inicializar sistema
export function inicializarSistema() {
    // Carregar dados do localStorage ou usar valores padrão
    usuarios = JSON.parse(localStorage.getItem('sistema_faltas_usuarios')) || [
        {
            id: 1,
            nome: "Administrador Sistema",
            cpf: "123.456.789-00",
            password: hashPassword("admin123"),
            tipo: "admin",
            dataCriacao: new Date().toISOString(),
            ativo: true
        }
    ];

    disciplinas = JSON.parse(localStorage.getItem('sistema_faltas_disciplinas')) || [
        "Matemática", "Português", "História", "Geografia", 
        "Ciências", "Inglês", "Educação Física", "Artes"
    ];

    cursos = JSON.parse(localStorage.getItem('sistema_faltas_cursos')) || [
        "Ensino Fundamental", "Ensino Médio", "Educação Infantil", "EJA"
    ];

    justificativas = JSON.parse(localStorage.getItem('sistema_faltas_justificativas')) || [
        "Consulta médica",
        "Problemas de saúde",
        "Assuntos particulares",
        "Atestado médico",
        "Licença saúde",
        "Compromisso familiar"
    ];

    docentes = JSON.parse(localStorage.getItem('sistema_faltas_docentes')) || [
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

    faltas = JSON.parse(localStorage.getItem('sistema_faltas_faltas')) || [
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

// Funções de hash de senha
export function hashPassword(password) {
    return btoa(unescape(encodeURIComponent(password)));
}

export function verifyPassword(inputPassword, storedHash) {
    return hashPassword(inputPassword) === storedHash;
}

// Salvar dados no localStorage
export function salvarUsuarios() {
    localStorage.setItem('sistema_faltas_usuarios', JSON.stringify(usuarios));
}

export function salvarDisciplinas() {
    localStorage.setItem('sistema_faltas_disciplinas', JSON.stringify(disciplinas));
}

export function salvarCursos() {
    localStorage.setItem('sistema_faltas_cursos', JSON.stringify(cursos));
}

export function salvarJustificativas() {
    localStorage.setItem('sistema_faltas_justificativas', JSON.stringify(justificativas));
}

export function salvarDocentes() {
    localStorage.setItem('sistema_faltas_docentes', JSON.stringify(docentes));
}

export function salvarFaltas() {
    localStorage.setItem('sistema_faltas_faltas', JSON.stringify(faltas));
}

// Atualizar todos os dados
export function salvarTodosDados() {
    salvarUsuarios();
    salvarDisciplinas();
    salvarCursos();
    salvarJustificativas();
    salvarDocentes();
    salvarFaltas();
}