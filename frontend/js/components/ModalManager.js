// Gerenciador de modais
export function inicializarModais() {
    console.log('Modais inicializados');
    
    // Configurar eventos de todos os modais
    configurarEventosModais();
    
    // Inicializar tooltips (se usar Bootstrap tooltips)
    inicializarTooltips();
}

// Configurar eventos de modais
function configurarEventosModais() {
    // Evento quando modal é aberto
    const modais = document.querySelectorAll('.modal');
    modais.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function () {
            console.log(`Modal ${this.id} aberto`);
        });
        
        modal.addEventListener('hidden.bs.modal', function () {
            console.log(`Modal ${this.id} fechado`);
            limparFormularioModal(this.id);
        });
    });
}

// Inicializar tooltips
function inicializarTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Limpar formulário quando modal é fechado
function limparFormularioModal(modalId) {
    switch(modalId) {
        case 'addFaltaModal':
            document.getElementById('faltaForm')?.reset();
            editandoFaltaId = null;
            break;
        case 'addDocenteModal':
            document.getElementById('docenteForm')?.reset();
            editandoDocenteId = null;
            break;
        case 'addUsuarioModal':
            document.getElementById('usuarioForm')?.reset();
            break;
        case 'resetSenhaModal':
            document.getElementById('novaSenha').value = '';
            document.getElementById('confirmNovaSenha').value = '';
            usuarioResetSenha = null;
            break;
        case 'addDisciplinaModal':
            document.getElementById('novaDisciplinaNome').value = '';
            break;
        case 'addCursoModal':
            document.getElementById('novoCursoNome').value = '';
            break;
        case 'addJustificativaModal':
            document.getElementById('novaJustificativaDescricao').value = '';
            break;
    }
}

// Validar formulário antes de submeter
export function validarFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return false;
    
    const requiredInputs = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('is-invalid');
            isValid = false;
        } else {
            input.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Mostrar erro no formulário
export function mostrarErroFormulario(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    campo.classList.add('is-invalid');
    
    let feedback = campo.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        campo.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = mensagem;
}

// Limpar erros do formulário
export function limparErrosFormulario(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    
    const invalidInputs = form.querySelectorAll('.is-invalid');
    invalidInputs.forEach(input => {
        input.classList.remove('is-invalid');
    });
    
    const feedbacks = form.querySelectorAll('.invalid-feedback');
    feedbacks.forEach(feedback => {
        feedback.remove();
    });
}

// Focar no primeiro campo do modal
export function focarPrimeiroCampo(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const primeiroInput = modal.querySelector('input, select, textarea');
    if (primeiroInput) {
        setTimeout(() => {
            primeiroInput.focus();
        }, 300);
    }
}

// Configurar auto-save (para modais com formulários longos)
export function configurarAutoSave(modalId, callback, intervalo = 30000) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const inputs = modal.querySelectorAll('input, select, textarea');
    let timeoutId;
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (typeof callback === 'function') {
                    callback();
                }
            }, intervalo);
        });
    });
}