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
// Configurar eventos do formulário CPF
function configurarFormularioCPF() {
    setTimeout(() => {
        const form = document.getElementById('loginFormCpf');
        const cpfInput = document.getElementById('cpf');
        
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                fazerLoginCPF(); // ✅ NOVA FUNÇÃO
            });
        }
        
        if (cpfInput) {
            cpfInput.focus();
            
            // Adicionar máscara de CPF
            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 3) {
                    value = value.replace(/^(\d{3})(\d)/, '$1.$2');
                }
                if (value.length > 6) {
                    value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
                }
                if (value.length > 9) {
                    value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
                }
                if (value.length > 11) {
                    value = value.substring(0, 14);
                }
                
                e.target.value = value;
            });
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


// Função para fazer login Admin/Usuário
function fazerLoginAdmin() {
    const senha = document.getElementById('passwordAdmin')?.value || '';
    
    console.log('Tentando login Admin com senha:', senha);
    
    // Usar SistemaStorage para autenticação
    if (typeof SistemaStorage !== 'undefined') {
        // Tentar autenticar como Master (admin)
        const usuario = SistemaStorage.autenticarUsuario('admin', senha);
        
        if (usuario) {
            console.log('✅ Login Master bem-sucedido:', usuario.nome);
            
            // Salvar usuário no SistemaStorage
            SistemaStorage.setUsuarioAtual(usuario);
            
            // Também salvar no localStorage para compatibilidade
            localStorage.setItem('sistema_faltas_auth', JSON.stringify({
                id: usuario.id,
                name: usuario.nome,
                type: usuario.master ? 'master' : 'admin',
                perfil_id: usuario.perfil_id,
                loginTime: new Date().toISOString()
            }));
            
            console.log('✅ Autenticação salva');
            
            // Redirecionar
            setTimeout(() => {
                console.log('Redirecionando para sistema.html...');
                window.location.href = 'sistema.html';
            }, 300);
            
            return;
        }
        
        alert('❌ Senha incorreta para administrador!');
        console.log('Senha incorreta para admin');
        
    } else {
        console.error('SistemaStorage não disponível!');
        alert('❌ Erro no sistema. Recarregue a página.');
    }
}

// Função para fazer login com CPF (usuários normais)
function fazerLoginCPF() {
    const cpf = document.getElementById('cpf')?.value || '';
    const senha = document.getElementById('passwordCpf')?.value || '';
    
    console.log('Tentando login CPF:', cpf);
    
    // Validar CPF básico
    if (!cpf || cpf.length < 11) {
        alert('❌ Digite um CPF válido!');
        return;
    }
    
    if (!senha) {
        alert('❌ Digite a senha!');
        return;
    }
    
    // Usar SistemaStorage para autenticação
    if (typeof SistemaStorage !== 'undefined') {
        // Tentar autenticar com CPF
        const usuario = SistemaStorage.autenticarUsuario(cpf, senha);
        
        if (usuario) {
            console.log('✅ Login bem-sucedido:', usuario.nome);
            
            // Verificar se usuário está ativo
            if (!usuario.ativo) {
                alert('❌ Usuário inativo! Contate o administrador.');
                return;
            }
            
            // Salvar usuário no SistemaStorage
            SistemaStorage.setUsuarioAtual(usuario);
            
            // Salvar no localStorage para compatibilidade
            localStorage.setItem('sistema_faltas_auth', JSON.stringify({
                id: usuario.id,
                name: usuario.nome,
                type: usuario.master ? 'master' : 'usuario',
                perfil_id: usuario.perfil_id,
                perfil_nome: SistemaStorage.getNomePerfil(usuario.perfil_id),
                loginTime: new Date().toISOString()
            }));
            
            console.log('✅ Usuário autenticado:', usuario);
            
            // Redirecionar
            setTimeout(() => {
                console.log('Redirecionando para sistema.html...');
                window.location.href = 'sistema.html';
            }, 300);
            
        } else {
            alert('❌ CPF ou senha incorretos!');
            console.log('Autenticação falhou para CPF:', cpf);
        }
        
    } else {
        console.error('SistemaStorage não disponível!');
        alert('❌ Erro no sistema. Recarregue a página.');
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