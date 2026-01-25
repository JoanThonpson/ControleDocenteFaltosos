// js/utils/storage.js
// ============================================
// SISTEMA DE DADOS CENTRALIZADO
// ============================================

console.log('Storage inicializado...');

// ========== DADOS DO SISTEMA ==========
const SistemaStorage = {
    // Arrays principais
    disciplinas: [],
    cursos: [],
    justificativas: [],
    docentes: [],
    faltas: [],
    
    // Estado da sessão
    usuarioAtual: null,
    
    // ========== INICIALIZAÇÃO ==========
    inicializar: function() {
        console.log('Inicializando sistema de dados...');
        
        // Carregar dados do localStorage ou usar padrão
        this.carregarTodos();
        
        // Se for primeira execução, criar dados padrão
        if (this.disciplinas.length === 0) {
            this.criarDadosPadrao();
        }
        
        console.log('Sistema de dados pronto:', {
            disciplinas: this.disciplinas.length,
            cursos: this.cursos.length,
            justificativas: this.justificativas.length,
            docentes: this.docentes.length,
            faltas: this.faltas.length
        });
    },
    
    // ========== DADOS PADRÃO ==========
    criarDadosPadrao: function() {
        console.log('Criando dados padrão...');
        
        // Disciplinas padrão
        this.disciplinas = [
            "Matemática",
            "Português", 
            "História",
            "Geografia",
            "Ciências",
            "Inglês"
        ];
        
        // Cursos padrão
        this.cursos = [
            "Ensino Fundamental",
            "Ensino Médio",
            "Educação Infantil"
        ];
        
        // Justificativas padrão
        this.justificativas = [
            "Consulta médica",
            "Problemas de saúde",
            "Assuntos particulares",
            "Atestado médico",
            "Licença saúde"
        ];
        
        // Docentes padrão (com dados reais que você tinha)
        this.docentes = [
            { 
                id: 1, 
                nome: "Emerson Israel Mendes", 
                disciplinas: ["Matemática"], 
                cursos: ["Ensino Médio"], 
                aulas: 13.5 
            },
            { 
                id: 2, 
                nome: "Ulrias Fagner Santos Nascimento", 
                disciplinas: ["Português"], 
                cursos: ["Ensino Médio"], 
                aulas: 162 
            },
            { 
                id: 3, 
                nome: "Laura Lucia Da Silva Amorim", 
                disciplinas: ["História"], 
                cursos: ["Ensino Fundamental"], 
                aulas: 90 
            }
        ];
        
        // Faltas padrão
        this.faltas = [
            { 
                id: 1, 
                docenteId: 1, 
                disciplina: "Matemática", 
                curso: "Ensino Médio", 
                quantidadeFaltas: 1,
                justificada: true,
                justificativa: "Consulta médica",
                observacoes: "Apresentou atestado médico",
                data: "2024-01-15", 
                horarioInicio: "08:00", 
                horarioFim: "09:30"
            }
        ];
        
        // Salvar tudo
        this.salvarTodos();
    },
    
    // ========== OPERAÇÕES DE ARMAZENAMENTO ==========
    
    // Carregar todos os dados do localStorage
    carregarTodos: function() {
        this.disciplinas = this.carregar('disciplinas') || [];
        this.cursos = this.carregar('cursos') || [];
        this.justificativas = this.carregar('justificativas') || [];
        this.docentes = this.carregar('docentes') || [];
        this.faltas = this.carregar('faltas') || [];
    },
    
    // Salvar todos os dados no localStorage
    salvarTodos: function() {
        this.salvar('disciplinas', this.disciplinas);
        this.salvar('cursos', this.cursos);
        this.salvar('justificativas', this.justificativas);
        this.salvar('docentes', this.docentes);
        this.salvar('faltas', this.faltas);
    },
    
    // Métodos auxiliares de localStorage
    carregar: function(chave) {
        const dados = localStorage.getItem(`sistema_faltas_${chave}`);
        return dados ? JSON.parse(dados) : null;
    },
    
    salvar: function(chave, dados) {
        localStorage.setItem(`sistema_faltas_${chave}`, JSON.stringify(dados));
    },
    
    // ========== OPERAÇÕES DE DISCIPLINAS ==========
    adicionarDisciplina: function(nome) {
        if (!nome.trim()) return false;
        
        const nomeNormalizado = nome.trim();
        const existe = this.disciplinas.some(d => 
            d.toLowerCase() === nomeNormalizado.toLowerCase()
        );
        
        if (existe) {
            console.log(`Disciplina "${nome}" já existe`);
            return false;
        }
        
        this.disciplinas.push(nomeNormalizado);
        this.disciplinas.sort();
        this.salvar('disciplinas', this.disciplinas);
        console.log(`Disciplina "${nome}" adicionada`);
        return true;
    },
    
    removerDisciplina: function(nome) {
        const index = this.disciplinas.indexOf(nome);
        if (index === -1) return false;
        
        // Verificar se disciplina está em uso
        const emUsoDocentes = this.docentes.some(d => 
            d.disciplinas.includes(nome)
        );
        const emUsoFaltas = this.faltas.some(f => 
            f.disciplina === nome
        );
        
        if (emUsoDocentes || emUsoFaltas) {
            console.log(`Disciplina "${nome}" está em uso e não pode ser removida`);
            return false;
        }
        
        this.disciplinas.splice(index, 1);
        this.salvar('disciplinas', this.disciplinas);
        console.log(`Disciplina "${nome}" removida`);
        return true;
    },
    
    // ========== OPERAÇÕES DE CURSOS ==========
    adicionarCurso: function(nome) {
        if (!nome.trim()) return false;
        
        const nomeNormalizado = nome.trim();
        const existe = this.cursos.some(c => 
            c.toLowerCase() === nomeNormalizado.toLowerCase()
        );
        
        if (existe) {
            console.log(`Curso "${nome}" já existe`);
            return false;
        }
        
        this.cursos.push(nomeNormalizado);
        this.cursos.sort();
        this.salvar('cursos', this.cursos);
        console.log(`Curso "${nome}" adicionado`);
        return true;
    },
    
    removerCurso: function(nome) {
        const index = this.cursos.indexOf(nome);
        if (index === -1) return false;
        
        // Verificar se curso está em uso
        const emUsoDocentes = this.docentes.some(d => 
            d.cursos.includes(nome)
        );
        const emUsoFaltas = this.faltas.some(f => 
            f.curso === nome
        );
        
        if (emUsoDocentes || emUsoFaltas) {
            console.log(`Curso "${nome}" está em uso e não pode ser removida`);
            return false;
        }
        
        this.cursos.splice(index, 1);
        this.salvar('cursos', this.cursos);
        console.log(`Curso "${nome}" removido`);
        return true;
    },
    
    // ========== OPERAÇÕES DE JUSTIFICATIVAS ==========
    adicionarJustificativa: function(descricao) {
        if (!descricao.trim()) return false;
        
        const descricaoNormalizada = descricao.trim();
        const existe = this.justificativas.some(j => 
            j.toLowerCase() === descricaoNormalizada.toLowerCase()
        );
        
        if (existe) {
            console.log(`Justificativa "${descricao}" já existe`);
            return false;
        }
        
        this.justificativas.push(descricaoNormalizada);
        this.justificativas.sort();
        this.salvar('justificativas', this.justificativas);
        console.log(`Justificativa "${descricao}" adicionada`);
        return true;
    },
    
    removerJustificativa: function(descricao) {
        const index = this.justificativas.indexOf(descricao);
        if (index === -1) return false;
        
        // Verificar se justificativa está em uso
        const emUsoFaltas = this.faltas.some(f => 
            f.justificativa === descricao
        );
        
        if (emUsoFaltas) {
            console.log(`Justificativa "${descricao}" está em uso e não pode ser removida`);
            return false;
        }
        
        this.justificativas.splice(index, 1);
        this.salvar('justificativas', this.justificativas);
        console.log(`Justificativa "${descricao}" removida`);
        return true;
    },
    
    // ========== OPERAÇÕES DE DOCENTES ==========
    adicionarDocente: function(docente) {
        // Gerar ID único
        docente.id = this.gerarProximoId('docentes');
        this.docentes.push(docente);
        this.salvar('docentes', this.docentes);
        console.log(`Docente "${docente.nome}" adicionado`, docente);
        return docente.id;
    },
    
    atualizarDocente: function(id, dadosAtualizados) {
        const index = this.docentes.findIndex(d => d.id === id);
        if (index === -1) return false;
        
        this.docentes[index] = { ...this.docentes[index], ...dadosAtualizados };
        this.salvar('docentes', this.docentes);
        console.log(`Docente ID ${id} atualizado`, this.docentes[index]);
        return true;
    },
    
    removerDocente: function(id) {
        const index = this.docentes.findIndex(d => d.id === id);
        if (index === -1) return false;
        
        // Verificar se docente tem faltas
        if (this.docenteEmUso(id)) {
            console.log(`Docente ID ${id} está em uso (tem faltas registradas)`);
            return false;
        }
        
        const docente = this.docentes[index];
        this.docentes.splice(index, 1);
        this.salvar('docentes', this.docentes);
        console.log(`Docente "${docente.nome}" removido`);
        return true;
    },
    
    getDocentePorId: function(id) {
        return this.docentes.find(d => d.id === id) || null;
    },
    
    // ========== OPERAÇÕES DE FALTAS ==========
    adicionarFalta: function(falta) {
        // Gerar ID único
        falta.id = this.gerarProximoId('faltas');
        this.faltas.push(falta);
        this.salvar('faltas', this.faltas);
        console.log(`Falta adicionada para docente ID ${falta.docenteId}`, falta);
        return falta.id;
    },
    
    atualizarFalta: function(id, dadosAtualizados) {
        const index = this.faltas.findIndex(f => f.id === id);
        if (index === -1) return false;
        
        this.faltas[index] = { ...this.faltas[index], ...dadosAtualizados };
        this.salvar('faltas', this.faltas);
        console.log(`Falta ID ${id} atualizada`, this.faltas[index]);
        return true;
    },
    
    removerFalta: function(id) {
        const index = this.faltas.findIndex(f => f.id === id);
        if (index === -1) return false;
        
        const falta = this.faltas[index];
        this.faltas.splice(index, 1);
        this.salvar('faltas', this.faltas);
        console.log(`Falta ID ${id} removida`);
        return true;
    },
    
    // ========== MÉTODOS AUXILIARES ==========
    gerarProximoId: function(tipo) {
        const lista = this[tipo];
        if (lista.length === 0) return 1;
        return Math.max(...lista.map(item => item.id || 0)) + 1;
    },
    
    // Obter lista ordenada
    getDisciplinasOrdenadas: function() {
        return [...this.disciplinas].sort();
    },
    
    getCursosOrdenados: function() {
        return [...this.cursos].sort();
    },
    
    getJustificativasOrdenadas: function() {
        return [...this.justificativas].sort();
    },

    // MÉTODOS PARA OBTER DADOS ESPECÍFICOS DO DOCENTE
    getDisciplinasPorDocente: function(id) {
    const docente = this.getDocentePorId(id);
    return docente ? docente.disciplinas || [] : [];
    },

    getCursosPorDocente: function(id) {
    const docente = this.getDocentePorId(id);
    return docente ? docente.cursos || [] : [];
    },
    
    // Verificar uso
    disciplinaEmUso: function(nome) {
        return this.docentes.some(d => d.disciplinas.includes(nome)) ||
               this.faltas.some(f => f.disciplina === nome);
    },
    
    cursoEmUso: function(nome) {
        return this.docentes.some(d => d.cursos.includes(nome)) ||
               this.faltas.some(f => f.curso === nome);
    },
    
    justificativaEmUso: function(descricao) {
        return this.faltas.some(f => f.justificativa === descricao);
    },
    
    // Novo método para verificar se docente tem faltas
    docenteEmUso: function(id) {
        return this.faltas.some(f => f.docenteId === id);
    },
    
    // ========== AUTENTICAÇÃO ==========
    setUsuarioAtual: function(usuario) {
        this.usuarioAtual = usuario;
        localStorage.setItem('sistema_faltas_usuario_atual', JSON.stringify(usuario));
    },
    
    getUsuarioAtual: function() {
        if (!this.usuarioAtual) {
            const usuarioSalvo = localStorage.getItem('sistema_faltas_usuario_atual');
            this.usuarioAtual = usuarioSalvo ? JSON.parse(usuarioSalvo) : null;
        }
        return this.usuarioAtual;
    },
    
    logout: function() {
        this.usuarioAtual = null;
        localStorage.removeItem('sistema_faltas_usuario_atual');
    },
    
    // ========== EXPORTAÇÃO ==========
    exportarDados: function() {
        return {
            disciplinas: this.disciplinas,
            cursos: this.cursos,
            justificativas: this.justificativas,
            docentes: this.docentes,
            faltas: this.faltas
        };
    }
};

// Inicializar automaticamente
SistemaStorage.inicializar();

// Exportar para uso global
window.SistemaStorage = SistemaStorage;
console.log('SistemaStorage disponível globalmente');