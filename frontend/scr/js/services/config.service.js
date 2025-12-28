import { 
    disciplinas, cursos, justificativas,
    salvarDisciplinas, salvarCursos, salvarJustificativas
} from '../utils/storage.js';
import { 
    validarNovaDisciplina, 
    validarNovoCurso, 
    validarNovaJustificativa 
} from '../utils/validators.js';

// Carregar justificativas
export function carregarJustificativas() {
    const lista = document.getElementById('listaJustificativas');
    const select = document.getElementById('justificativaSelect');
    
    if (!lista || !select) return;
    
    // Carregar lista na aba
    lista.innerHTML = '';
    justificativas.sort().forEach(justificativa => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center config-item';
        item.innerHTML = `
            <span>${justificativa}</span>
            <button class="btn btn-danger btn-sm" onclick="excluirJustificativa('${justificativa}')" 
                    ${podeExcluirJustificativa(justificativa) ? '' : 'disabled'}>
                <i class="fas fa-trash"></i>
            </button>
        `;
        lista.appendChild(item);
    });
    
    // Carregar select no modal de falta
    select.innerHTML = '<option value="">Selecione uma justificativa</option>';
    justificativas.sort().forEach(justificativa => {
        const option = document.createElement('option');
        option.value = justificativa;
        option.textContent = justificativa;
        select.appendChild(option);
    });
    
    salvarJustificativas();
}

// Carregar selects de disciplinas
export function carregarSelectsDisciplinas() {
    const selectDocente = document.getElementById('docenteDisciplinaSelect');
    
    if (!selectDocente) return;
    
    selectDocente.innerHTML = '<option value="">Selecione uma disciplina</option>';
    disciplinas.sort().forEach(disciplina => {
        const option = document.createElement('option');
        option.value = disciplina;
        option.textContent = disciplina;
        selectDocente.appendChild(option);
    });
    
    const novaOption = document.createElement('option');
    novaOption.value = 'nova_disciplina';
    novaOption.textContent = '+ Nova Disciplina';
    selectDocente.appendChild(novaOption);
}

// Carregar selects de cursos
export function carregarSelectsCursos() {
    const selectDocente = document.getElementById('docenteCursoSelect');
    
    if (!selectDocente) return;
    
    selectDocente.innerHTML = '<option value="">Selecione um curso</option>';
    cursos.sort().forEach(curso => {
        const option = document.createElement('option');
        option.value = curso;
        option.textContent = curso;
        selectDocente.appendChild(option);
    });
    
    const novaOption = document.createElement('option');
    novaOption.value = 'novo_curso';
    novaOption.textContent = '+ Novo Curso';
    selectDocente.appendChild(novaOption);
}

// Mostrar modal de configurações
export function showConfigModal() {
    const modal = new bootstrap.Modal(document.getElementById('configModal'));
    carregarListaDisciplinas();
    carregarListaCursos();
    modal.show();
}

// Carregar lista de disciplinas
export function carregarListaDisciplinas() {
    const lista = document.getElementById('listaDisciplinas');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    disciplinas.sort().forEach(disciplina => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center config-item';
        item.innerHTML = `
            <span>${disciplina}</span>
            <button class="btn btn-danger btn-sm" onclick="excluirDisciplina('${disciplina}')" 
                    ${podeExcluirDisciplina(disciplina) ? '' : 'disabled'}>
                <i class="fas fa-trash"></i>
            </button>
        `;
        lista.appendChild(item);
    });
}

// Carregar lista de cursos
export function carregarListaCursos() {
    const lista = document.getElementById('listaCursos');
    if (!lista) return;
    
    lista.innerHTML = '';
    
    cursos.sort().forEach(curso => {
        const item = document.createElement('div');
        item.className = 'list-group-item d-flex justify-content-between align-items-center config-item';
        item.innerHTML = `
            <span>${curso}</span>
            <button class="btn btn-danger btn-sm" onclick="excluirCurso('${curso}')"
                    ${podeExcluirCurso(curso) ? '' : 'disabled'}>
                <i class="fas fa-trash"></i>
            </button>
        `;
        lista.appendChild(item);
    });
}

// Filtrar justificativas
export function filtrarJustificativas() {
    const busca = document.getElementById('buscaJustificativa').value.toLowerCase();
    const itens = document.querySelectorAll('#listaJustificativas .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span').textContent.toLowerCase();
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// Filtrar disciplinas
export function filtrarDisciplinas() {
    const busca = document.getElementById('buscaDisciplina').value.toLowerCase();
    const itens = document.querySelectorAll('#listaDisciplinas .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span').textContent.toLowerCase();
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// Filtrar cursos
export function filtrarCursos() {
    const busca = document.getElementById('buscaCurso').value.toLowerCase();
    const itens = document.querySelectorAll('#listaCursos .list-group-item');
    
    itens.forEach(item => {
        const texto = item.querySelector('span').textContent.toLowerCase();
        item.style.display = texto.includes(busca) ? 'flex' : 'none';
    });
}

// Mostrar modal de nova disciplina
export function showAddDisciplinaModal() {
    const modal = new bootstrap.Modal(document.getElementById('addDisciplinaModal'));
    document.getElementById('novaDisciplinaNome').value = '';
    modal.show();
}

// Mostrar modal de novo curso
export function showAddCursoModal() {
    const modal = new bootstrap.Modal(document.getElementById('addCursoModal'));
    document.getElementById('novoCursoNome').value = '';
    modal.show();
}

// Mostrar modal de nova justificativa
export function showAddJustificativaModal() {
    const modal = new bootstrap.Modal(document.getElementById('addJustificativaModal'));
    document.getElementById('novaJustificativaDescricao').value = '';
    modal.show();
}

// Salvar disciplina
export function salvarDisciplina() {
    const nome = document.getElementById('novaDisciplinaNome').value.trim();
    
    if (!validarNovaDisciplina(nome)) return;
    
    disciplinas.push(nome);
    salvarDisciplinas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addDisciplinaModal'));
    modal.hide();
    
    carregarListaDisciplinas();
    carregarSelectsDisciplinas();
    alert('Disciplina cadastrada com sucesso!');
}

// Salvar curso
export function salvarCurso() {
    const nome = document.getElementById('novoCursoNome').value.trim();
    
    if (!validarNovoCurso(nome)) return;
    
    cursos.push(nome);
    salvarCursos();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addCursoModal'));
    modal.hide();
    
    carregarListaCursos();
    carregarSelectsCursos();
    alert('Curso cadastrada com sucesso!');
}

// Salvar justificativa
export function salvarJustificativa() {
    const descricao = document.getElementById('novaJustificativaDescricao').value.trim();
    
    if (!validarNovaJustificativa(descricao)) return;
    
    justificativas.push(descricao);
    salvarJustificativas();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addJustificativaModal'));
    modal.hide();
    
    carregarJustificativas();
    alert('Justificativa cadastrada com sucesso!');
}

// Verificar se pode excluir disciplina
export function podeExcluirDisciplina(nome) {
    const faltasComDisciplina = faltas.filter(f => f.disciplina === nome);
    const docentesComDisciplina = docentes.filter(d => d.disciplinas.includes(nome));
    
    return faltasComDisciplina.length === 0 && docentesComDisciplina.length === 0;
}

// Verificar se pode excluir curso
export function podeExcluirCurso(nome) {
    const faltasComCurso = faltas.filter(f => f.curso === nome);
    const docentesComCurso = docentes.filter(d => d.cursos.includes(nome));
    
    return faltasComCurso.length === 0 && docentesComCurso.length === 0;
}

// Verificar se pode excluir justificativa
export function podeExcluirJustificativa(descricao) {
    const faltasComJustificativa = faltas.filter(f => f.justificativa === descricao);
    return faltasComJustificativa.length === 0;
}

// Excluir disciplina
export function excluirDisciplina(nome) {
    if (!podeExcluirDisciplina(nome)) {
        const faltasCount = faltas.filter(f => f.disciplina === nome).length;
        const docentesCount = docentes.filter(d => d.disciplinas.includes(nome)).length;
        
        alert(`Não é possível excluir "${nome}"!\n\nEsta disciplina está sendo utilizada por:\n• ${docentesCount} docente(s)\n• ${faltasCount} registro(s) de faltas\n\nPara excluir, primeiro remova todas as referências.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a disciplina "${nome}"?`)) {
        const index = disciplinas.indexOf(nome);
        disciplinas.splice(index, 1);
        salvarDisciplinas();
        carregarListaDisciplinas();
        carregarSelectsDisciplinas();
        alert('Disciplina excluída com sucesso!');
    }
}

// Excluir curso
export function excluirCurso(nome) {
    if (!podeExcluirCurso(nome)) {
        const faltasCount = faltas.filter(f => f.curso === nome).length;
        const docentesCount = docentes.filter(d => d.cursos.includes(nome)).length;
        
        alert(`Não é possível excluir "${nome}"!\n\nEste curso está sendo utilizado por:\n• ${docentesCount} docente(s)\n• ${faltasCount} registro(s) de faltas\n\nPara excluir, primeiro remova todas as referências.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir o curso "${nome}"?`)) {
        const index = cursos.indexOf(nome);
        cursos.splice(index, 1);
        salvarCursos();
        carregarListaCursos();
        carregarSelectsCursos();
        alert('Curso excluído com sucesso!');
    }
}

// Excluir justificativa
export function excluirJustificativa(descricao) {
    if (!podeExcluirJustificativa(descricao)) {
        const faltasCount = faltas.filter(f => f.justificativa === descricao).length;
        alert(`Não é possível excluir "${descricao}"!\n\nEsta justificativa está sendo utilizada em ${faltasCount} registro(s) de faltas.\n\nPara excluir, primeiro remova todas as referências.`);
        return;
    }
    
    if (confirm(`Tem certeza que deseja excluir a justificativa "${descricao}"?`)) {
        const index = justificativas.indexOf(descricao);
        justificativas.splice(index, 1);
        salvarJustificativas();
        carregarJustificativas();
        alert('Justificativa excluída com sucesso!');
    }
}

// Exportar para uso global
window.showConfigModal = showConfigModal;
window.showAddJustificativaModal = showAddJustificativaModal;
window.showAddDisciplinaModal = showAddDisciplinaModal;
window.showAddCursoModal = showAddCursoModal;
window.salvarDisciplina = salvarDisciplina;
window.salvarCurso = salvarCurso;
window.salvarJustificativa = salvarJustificativa;
window.filtrarJustificativas = filtrarJustificativas;
window.filtrarDisciplinas = filtrarDisciplinas;
window.filtrarCursos = filtrarCursos;
window.excluirDisciplina = excluirDisciplina;
window.excluirCurso = excluirCurso;
window.excluirJustificativa = excluirJustificativa;