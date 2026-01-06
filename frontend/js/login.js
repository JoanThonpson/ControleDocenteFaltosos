// js/login.js - VERSÃO CORRIGIDA
console.log('Login carregado');

document.addEventListener('DOMContentLoaded', function() {
    console.log('Login inicializado');
    
    // Inicializar dropdown
    const select = document.getElementById('tipoAcessoSelect');
    if (select) {
        select.value = '';
        select.addEventListener('change', function() {
            mostrarFormulario(this.value);
        });
    }
    
    // Exportar funções globais
    window.togglePassword = togglePassword;
});

// Mostrar formulário baseado no tipo
function mostrarFormulario(tipo) {
    const container = document.getElementById('formContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (tipo === 'cpf') {
        container.innerHTML = criarFormularioCPF();
        configurarFormularioCPF();
    } else if (tipo === 'admin') {
        container.innerHTML = criarFormularioAdmin();
        configurarFormularioAdmin();
    }
}

// Criar HTML do formulário CPF
function criarFormularioCPF() {
    return `
        <div class="mb-4">
            <h5 class="fw-bold text-center">
                <i class="fas fa-user me-2 text-primary"></i>
                Acesso Usuário
            </h5>
            <p class="text-muted text-center small">Digite seu CPF e senha</p>
        </div>
        
        <form id="loginFormCpf">
            <div class="mb-3">
                <label class="form-label fw-bold">CPF:</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user"></i></span>
                    <input type="text" id="cpf" class="form-control" placeholder="Digite seu CPF" required>
                </div>
            </div>
            
            <div class="mb-3">
                <label class="form-label fw-bold">Senha:</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-key"></i></span>
                    <input type="password" id="passwordCpf" class="form-control" placeholder="Digite sua senha" required>
                    <button type="button" class="btn btn-outline-secondary" onclick="togglePassword('passwordCpf')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" id="rememberMeCpf">
                    <label class="form-check-label" for="rememberMeCpf">Lembrar-me</label>
                </div>
            </div>
            
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary btn-lg">
                    <i class="fas fa-sign-in-alt me-2"></i> Entrar
                </button>
            </div>
        </form>
    `;
}

// Criar HTML do formulário Admin
function criarFormularioAdmin() {
    return `
        <div class="mb-4">
            <h5 class="fw-bold text-center">
                <i class="fas fa-user-shield me-2 text-warning"></i>
                Acesso Administrador
            </h5>
            <p class="text-muted text-center small">Acesso administrativo completo</p>
        </div>
        
        <form id="loginFormAdmin">
            <div class="mb-3">
                <label class="form-label fw-bold">Usuário Admin:</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-user-tie"></i></span>
                    <input type="text" class="form-control" value="admin" readonly>
                </div>
                <div class="form-text small">Usuário fixo para administradores</div>
            </div>
            
            <div class="mb-4">
                <label class="form-label fw-bold">Senha:</label>
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-key"></i></span>
                    <input type="password" id="passwordAdmin" class="form-control" placeholder="Digite a senha admin" required>
                    <button type="button" class="btn btn-outline-secondary" onclick="togglePassword('passwordAdmin')">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
            
            <div class="d-grid gap-2">
                <button type="submit" class="btn btn-warning btn-lg">
                    <i class="fas fa-sign-in-alt me-2"></i> Entrar como Admin
                </button>
            </div>
            
            <div class="mt-4 pt-3 border-top text-center">
                <div class="alert alert-light border">
                    <small class="text-muted">
                        <i class="fas fa-info-circle me-1"></i>
                        <strong>Senha padrão:</strong> admin123
                    </small>
                </div>
            </div>
        </form>
    `;
}

// Configurar eventos do formulário CPF
function configurarFormularioCPF() {
    setTimeout(() => {
        const form = document.getElementById('loginFormCpf');
        const cpfInput = document.getElementById('cpf');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const cpf = document.getElementById('cpf')?.value || '';
                const senha = document.getElementById('passwordCpf')?.value || '';
                
                if (!cpf || !senha) {
                    alert('Preencha CPF e senha!');
                    return;
                }
                
                alert('Login CPF em desenvolvimento. Use Admin para teste.');
            });
        }
        
        if (cpfInput) {
            cpfInput.focus();
        }
    }, 10);
}

// Configurar eventos do formulário Admin
function configurarFormularioAdmin() {
    setTimeout(() => {
        const form = document.getElementById('loginFormAdmin');
        const senhaInput = document.getElementById('passwordAdmin');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                fazerLoginAdmin();
            });
        }
        
        if (senhaInput) {
            senhaInput.focus();
        }
    }, 10);
}

// Função para fazer login Admin
function fazerLoginAdmin() {
    const senha = document.getElementById('passwordAdmin')?.value || '';
    
    console.log('Tentando login com senha:', senha);
    
    if (senha === 'admin123') {
        console.log('Senha correta! Fazendo login...');
        
        // Salvar autenticação
        localStorage.setItem('sistema_faltas_auth', JSON.stringify({
            name: 'Administrador',
            type: 'admin',
            loginTime: new Date().toISOString()
        }));
        
        console.log('Autenticação salva no localStorage');
        
        // Redirecionar após pequeno delay
        setTimeout(() => {
            console.log('Redirecionando para sistema.html...');
            window.location.href = 'sistema.html';
        }, 300);
        
    } else {
        alert('❌ Senha incorreta! Use: admin123');
        console.log('Senha incorreta');
    }
}

// Função para mostrar/ocultar senha
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) {
        console.log('Input não encontrado:', inputId);
        return;
    }
    
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
        console.log('Mostrando senha');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
        console.log('Ocultando senha');
    }
}