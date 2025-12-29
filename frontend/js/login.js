// js/login.js - VERSÃO SEM MÓDULOS
(function() {
    console.log('Login carregado (sem módulos)');
    
    // Inicializar quando DOM carregar
    document.addEventListener('DOMContentLoaded', function() {
        console.log('DOM carregado');
        inicializarLogin();
    });
    
    function inicializarLogin() {
        // Configurar funções globais
        window.handleCpfLogin = handleCpfLogin;
        window.handleAdminLogin = handleAdminLogin;
        window.voltarParaSelecao = voltarParaSelecao;
        window.togglePassword = togglePassword;
        
        console.log('Login inicializado');
    }
    
    // Função de login CPF
    async function handleCpfLogin() {
        console.log('Tentando login CPF...');
        
        const cpf = document.getElementById('cpf')?.value || '';
        const password = document.getElementById('passwordCpf')?.value || '';
        
        if (!cpf || !password) {
            alert('Preencha CPF e senha!');
            return;
        }
        
        // SIMULAÇÃO - REMOVER DEPOIS
        alert('Login CPF seria processado...\nCPF: ' + cpf);
        
        // Para teste, redireciona direto
        setTimeout(() => {
            // Quando login for bem-sucedido:
            window.location.href = 'http://127.0.0.1:5500/sistema.html';
            // OU
            window.location.href = './sistema.html';
        }, 500);
    }
    
    // Função de login Admin
    async function handleAdminLogin() {
        console.log('Tentando login Admin...');
        
        const password = document.getElementById('passwordAdmin')?.value || '';
        
        if (password === 'admin123') {
            alert('Login Admin bem-sucedido! Redirecionando...');
            
            // Salvar no localStorage
            localStorage.setItem('sistema_faltas_auth', JSON.stringify({
                name: 'Administrador',
                type: 'admin'
            }));
            
            setTimeout(() => {
                window.location.href = 'sistema.html';
            }, 500);
        } else {
            alert('Senha admin incorreta! Use: admin123');
        }
    }
    
    // Funções auxiliares
    function voltarParaSelecao() {
        const select = document.getElementById('tipoAcessoSelect');
        if (select) select.value = '';
        
        const formContainer = document.getElementById('formContainer');
        if (formContainer) formContainer.innerHTML = '';
        
        hideError();
    }
    
    function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        if (!input) return;
        
        const button = input.parentNode.querySelector('button');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
    
    function showError(message) {
        const statusDiv = document.getElementById('loginStatus');
        const errorMessage = document.getElementById('errorMessage');
        
        if (statusDiv && errorMessage) {
            errorMessage.textContent = message;
            statusDiv.style.display = 'block';
        } else {
            alert(message);
        }
    }
    
    function hideError() {
        const statusDiv = document.getElementById('loginStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }
})();