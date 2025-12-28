import { 
    faltas, docentes, editandoFaltaId,
    salvarFaltas, getProximoId
} from '../utils/storage.js';
import { formatarData, getDocenteById } from '../utils/helpers.js';

// Carregar faltas
export function carregarFaltas() {
    const tbody = document.getElementById('faltasTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    const mesFiltro = document.getElementById('filtroMes')?.value;
    const anoFiltro = document.getElementById('filtroAno')?.value;
    const docenteFiltro = document.getElementById('filtroDocente')?.value;
    
    const faltasFiltradas = faltas.filter(falta => {
        const data = new Date(falta.data);
        const mes = data.getMonth() + 1;
        const ano = data.getFullYear();
        const mesStr = mes.toString().padStart(2, '0');
        const anoStr = ano.toString();
        
        return (!mesFiltro || mesStr === mesFiltro) &&
               (!anoFiltro || anoStr === anoFiltro) &&
               (!docenteFiltro || falta.docenteId.toString() === docenteFiltro);
    });
    
    faltasFiltradas.forEach(falta => {
        const docente = getDocenteById(falta.docenteId);
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
    
    salvarFaltas();
}

// Mostrar modal de falta
export function showAddFaltaModal() {
    editandoFaltaId = null;
    document.getElementById('faltaModalTitle').textContent = 'Registrar Falta';
    document.getElementById('salvarFaltaBtn').textContent = 'Salvar';
    
    const modal = new bootstrap.Modal(document.getElementById('addFaltaModal'));
    document.getElementById('faltaForm').reset();
    document.getElementById('faltaData').valueAsDate = new Date();
    modal.show();
}

// Carregar disciplinas e cursos baseado no docente selecionado
export function carregarDisciplinasCursos() {
    const docenteId = parseInt(document.getElementById('docenteSelect').value);
    const disciplinaSelect = document.getElementById('disciplinaSelect');
    const cursoSelect = document.getElementById('cursoSelect');
    
    if (!docenteId || !disciplinaSelect || !cursoSelect) return;
    
    disciplinaSelect.innerHTML = '<option value="">Selecione uma disciplina</option>';
    cursoSelect.innerHTML = '<option value="">Selecione um curso</option>';
    
    const docente = docentes.find(d => d.id === docenteId);
    if (docente) {
        docente.disciplinas.forEach(disciplina => {
            const option = document.createElement('option');
            option.value = disciplina;
            option.textContent = disciplina;
            disciplinaSelect.appendChild(option);
        });
        
        docente.cursos.forEach(curso => {
            const option = document.createElement('option');
            option.value = curso;
            option.textContent = curso;
            cursoSelect.appendChild(option);
        });
    }
}

// Editar falta
export function editarFalta(id) {
    editandoFaltaId = id;
    const falta = faltas.find(f => f.id === id);
    
    if (!falta) return;
    
    document.getElementById('faltaModalTitle').textContent = 'Editar Falta';
    document.getElementById('salvarFaltaBtn').textContent = 'Atualizar';
    
    document.getElementById('docenteSelect').value = falta.docenteId;
    carregarDisciplinasCursos();
    
    setTimeout(() => {
        document.getElementById('disciplinaSelect').value = falta.disciplina;
        document.getElementById('cursoSelect').value = falta.curso;
        document.getElementById('quantidadeFaltas').value = falta.quantidadeFaltas;
        document.getElementById('justificativaSelect').value = falta.justificativa || '';
        document.getElementById('faltaData').value = falta.data;
        document.getElementById('faltaHorarioInicio').value = falta.horarioInicio;
        document.getElementById('faltaHorarioFim').value = falta.horarioFim;
        document.getElementById('faltaObservacoes').value = falta.observacoes || '';
    }, 100);
    
    const modal = new bootstrap.Modal(document.getElementById('addFaltaModal'));
    modal.show();
}

// Salvar falta
export function salvarFalta() {
    const docenteId = parseInt(document.getElementById('docenteSelect').value);
    const disciplina = document.getElementById('disciplinaSelect').value;
    const curso = document.getElementById('cursoSelect').value;
    const quantidadeFaltas = parseInt(document.getElementById('quantidadeFaltas').value);
    const justificativa = document.getElementById('justificativaSelect').value;
    const data = document.getElementById('faltaData').value;
    const horarioInicio = document.getElementById('faltaHorarioInicio').value;
    const horarioFim = document.getElementById('faltaHorarioFim').value;
    const observacoes = document.getElementById('faltaObservacoes').value;
    
    // Validações
    if (!docenteId || !disciplina || !curso || !quantidadeFaltas || !data || !horarioInicio || !horarioFim) {
        alert('Por favor, preencha todos os campos obrigatórios!');
        return;
    }
    
    // Salvar ou editar
    if (editandoFaltaId) {
        const index = faltas.findIndex(f => f.id === editandoFaltaId);
        faltas[index] = {
            ...faltas[index],
            docenteId: docenteId,
            disciplina: disciplina,
            curso: curso,
            quantidadeFaltas: quantidadeFaltas,
            justificativa: justificativa,
            observacoes: observacoes,
            data: data,
            horarioInicio: horarioInicio,
            horarioFim: horarioFim,
            status: justificativa ? 'justificada' : 'não justificada'
        };
    } else {
        const novaFalta = {
            id: getProximoId(faltas),
            docenteId: docenteId,
            disciplina: disciplina,
            curso: curso,
            quantidadeFaltas: quantidadeFaltas,
            justificativa: justificativa,
            observacoes: observacoes,
            data: data,
            horarioInicio: horarioInicio,
            horarioFim: horarioFim,
            status: justificativa ? 'justificada' : 'não justificada'
        };
        faltas.push(novaFalta);
    }
    
    carregarFaltas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addFaltaModal'));
    modal.hide();
    
    alert(editandoFaltaId ? 'Falta atualizada com sucesso!' : 'Falta registrada com sucesso!');
    editandoFaltaId = null;
}

// Excluir falta
export function excluirFalta(id) {
    if (confirm('Tem certeza que deseja excluir este registro de falta?')) {
        const index = faltas.findIndex(f => f.id === id);
        faltas.splice(index, 1);
        carregarFaltas();
        alert('Falta excluída com sucesso!');
    }
}

// Filtrar faltas
export function filtrarFaltas() {
    carregarFaltas();
}

// Limpar filtros
export function limparFiltros() {
    document.getElementById('filtroMes').value = '';
    document.getElementById('filtroAno').value = '';
    document.getElementById('filtroDocente').value = '';
    carregarFaltas();
}

// Exportar para uso global
window.showAddFaltaModal = showAddFaltaModal;
window.carregarDisciplinasCursos = carregarDisciplinasCursos;
window.editarFalta = editarFalta;
window.salvarFalta = salvarFalta;
window.excluirFalta = excluirFalta;
window.filtrarFaltas = filtrarFaltas;
window.limparFiltros = limparFiltros;