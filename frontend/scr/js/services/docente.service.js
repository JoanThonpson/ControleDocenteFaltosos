import { 
    docentes, editandoDocenteId,
    salvarDocentes, getProximoId
} from '../utils/storage.js';
import { carregarSelectsDisciplinas, carregarSelectsCursos } from './config.service.js';
import { validarNovaDisciplina, validarNovoCurso } from '../utils/validators.js';
import { carregarFaltas } from './falta.service.js';

// Carregar docentes
export function carregarDocentes() {
    const tbody = document.getElementById('docentesTableBody');
    const select = document.getElementById('docenteSelect');
    const filtroSelect = document.getElementById('filtroDocente');
    
    if (!tbody || !select || !filtroSelect) return;
    
    tbody.innerHTML = '';
    select.innerHTML = '<option value="">Selecione um docente</option>';
    filtroSelect.innerHTML = '<option value="">Todos os docentes</option>';
    
    docentes.forEach(docente => {
        // Adicionar à tabela
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
        
        // Adicionar ao select de faltas
        const option = document.createElement('option');
        option.value = docente.id;
        option.textContent = docente.nome;
        select.appendChild(option);
        
        // Adicionar ao filtro
        const filtroOption = document.createElement('option');
        filtroOption.value = docente.id;
        filtroOption.textContent = docente.nome;
        filtroSelect.appendChild(filtroOption);
    });
    
    salvarDocentes();
}

// Mostrar modal de docente
export function showAddDocenteModal() {
    editandoDocenteId = null;
    document.getElementById('docenteModalTitle').textContent = 'Cadastrar Docente';
    document.getElementById('salvarDocenteBtn').textContent = 'Salvar';
    
    const modal = new bootstrap.Modal(document.getElementById('addDocenteModal'));
    document.getElementById('docenteForm').reset();
    document.getElementById('novaDisciplinaInput').classList.add('hidden');
    document.getElementById('novoCursoInput').classList.add('hidden');
    modal.show();
}

// Editar docente
export function editarDocente(id) {
    editandoDocenteId = id;
    const docente = docentes.find(d => d.id === id);
    
    if (!docente) return;
    
    document.getElementById('docenteModalTitle').textContent = 'Editar Docente';
    document.getElementById('salvarDocenteBtn').textContent = 'Atualizar';
    
    document.getElementById('docenteNome').value = docente.nome;
    document.getElementById('docenteDisciplinaSelect').value = docente.disciplinas[0] || '';
    document.getElementById('docenteCursoSelect').value = docente.cursos[0] || '';
    document.getElementById('docenteAulas').value = docente.aulas;
    document.getElementById('novaDisciplinaInput').classList.add('hidden');
    document.getElementById('novoCursoInput').classList.add('hidden');
    
    const modal = new bootstrap.Modal(document.getElementById('addDocenteModal'));
    modal.show();
}

// Salvar docente
export function salvarDocente() {
    const nome = document.getElementById('docenteNome').value.trim();
    let disciplina = document.getElementById('docenteDisciplinaSelect').value;
    let curso = document.getElementById('docenteCursoSelect').value;
    const aulas = parseFloat(document.getElementById('docenteAulas').value);
    
    // Validar disciplina
    if (disciplina === 'nova_disciplina') {
        disciplina = document.getElementById('novaDisciplinaInput').value.trim();
        if (!validarNovaDisciplina(disciplina)) return;
        // Adicionar nova disciplina será feito no config.service.js
    }
    
    // Validar curso
    if (curso === 'novo_curso') {
        curso = document.getElementById('novoCursoInput').value.trim();
        if (!validarNovoCurso(curso)) return;
        // Adicionar novo curso será feito no config.service.js
    }
    
    // Validações básicas
    if (!nome) {
        alert('Por favor, digite o nome do docente!');
        return;
    }
    if (!disciplina || disciplina === 'nova_disciplina') {
        alert('Por favor, selecione ou digite uma disciplina válida!');
        return;
    }
    if (!curso || curso === 'novo_curso') {
        alert('Por favor, selecione ou digite um curso válido!');
        return;
    }
    if (!aulas || aulas <= 0) {
        alert('Por favor, digite uma quantidade válida de aulas!');
        return;
    }
    
    // Adicionar ou editar
    if (editandoDocenteId) {
        const index = docentes.findIndex(d => d.id === editandoDocenteId);
        const docente = docentes[index];
        
        if (!docente.disciplinas.includes(disciplina)) {
            docente.disciplinas.push(disciplina);
        }
        if (!docente.cursos.includes(curso)) {
            docente.cursos.push(curso);
        }
        
        docentes[index] = {
            ...docente,
            nome: nome,
            aulas: aulas
        };
    } else {
        const novoDocente = {
            id: getProximoId(docentes),
            nome: nome,
            disciplinas: [disciplina],
            cursos: [curso],
            aulas: aulas
        };
        docentes.push(novoDocente);
    }
    
    carregarDocentes();
    carregarFaltas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDocenteModal'));
    modal.hide();
    
    alert(editandoDocenteId ? 'Docente atualizado com sucesso!' : 'Docente cadastrado com sucesso!');
    editandoDocenteId = null;
}

// Excluir docente
export function excluirDocente(id) {
    if (!confirm('Tem certeza que deseja excluir este docente?')) return;
    
    // Verificar se há faltas associadas
    const faltasAssociadas = faltas.filter(f => f.docenteId === id);
    if (faltasAssociadas.length > 0) {
        if (!confirm(`Este docente possui ${faltasAssociadas.length} falta(s) registrada(s). Deseja excluir mesmo assim?`)) {
            return;
        }
    }
    
    const index = docentes.findIndex(d => d.id === id);
    docentes.splice(index, 1);
    
    // Remover faltas associadas
    faltas = faltas.filter(f => f.docenteId !== id);
    
    carregarDocentes();
    carregarFaltas();
    alert('Docente excluído com sucesso!');
}

// Toggle nova disciplina
export function toggleNovaDisciplina() {
    const select = document.getElementById('docenteDisciplinaSelect');
    const input = document.getElementById('novaDisciplinaInput');
    
    if (select.value === 'nova_disciplina') {
        input.classList.remove('hidden');
        input.value = '';
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = '';
    }
}

// Toggle novo curso
export function toggleNovoCurso() {
    const select = document.getElementById('docenteCursoSelect');
    const input = document.getElementById('novoCursoInput');
    
    if (select.value === 'novo_curso') {
        input.classList.remove('hidden');
        input.value = '';
        input.focus();
    } else {
        input.classList.add('hidden');
        input.value = '';
    }
}

// Exportar para uso global
window.showAddDocenteModal = showAddDocenteModal;
window.editarDocente = editarDocente;
window.salvarDocente = salvarDocente;
window.excluirDocente = excluirDocente;
window.toggleNovaDisciplina = toggleNovaDisciplina;
window.toggleNovoCurso = toggleNovoCurso;