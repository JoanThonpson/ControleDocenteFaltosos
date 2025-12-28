import { 
    usuarios, currentUser, isAdmin, isGestor,
    hashPassword, verifyPassword, salvarUsuarios
} from '../utils/storage.js';
import { formatarCPF } from '../utils/helpers.js';
import { carregarDocentes } from './docente.service.js';
import { carregarFaltas } from './falta.service.js';
import { carregarJustificativas } from './config.service.js';

// Configurar eventos de login
export function configurarEventosLogin() {
    const loginFormCpf = document.getElementById('loginFormCpf');
    const loginFormAdmin = document.getElementById('loginFormAdmin');
    
    if (loginFormCpf) {
        loginFormCpf.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerLoginCpf();
        });
    }
    
    if (loginFormAdmin) {
        loginFormAdmin.addEventListener('submit', function(e) {
            e.preventDefault();
            fazerLoginAdmin();
        });
    }
}

// Login por CPF
export function fazerLoginCpf() {
    const cpf = document.getElementById('cpf').value.replace(/\D/g, '');
    const password = document.getElementById('passwordCpf').value;
    
    if (cpf.length !== 11) {
        alert('CPF deve ter 11 dígitos!');
        return;
    }
    
    const usuario = usuarios.find(u => u.cpf.replace(/\D/g, '') === cpf);
    
    if (!usuario) {
        alert('Usuário não encontrado!');
        return;
    }
    
    if (!verifyPassword(password, usuario.password)) {
        alert('Senha incorreta!');
        return;
    }
    
    currentUser = usuario;
    isAdmin = usuario.tipo === 'admin';
    isGestor = usuario.tipo === 'gestor';
    
    entrarSistema();
}

// Login administrador
export function fazerLoginAdmin() {
    const password = document.getElementById('passwordAdmin').value;
    
    if (password === 'admin123') {
        currentUser = {
            id: 0,
            nome: "Administrador",
            cpf: "admin",
            tipo: "admin"
        };
        isAdmin = true;
        isGestor = false;
        entrarSistema();
    } else {
        alert('Senha administrativa incorreta!');
    }
}

// Entrar no sistema
export function entrarSistema() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('mainSystem').classList.remove('hidden');
    
    let tipoUsuario = 'Usuário';
    if (isAdmin) tipoUsuario = 'Administrador';
    if (isGestor) tipoUsuario = 'Gestor';
    
    document.getElementById('userInfo').textContent = 
        `${currentUser.nome} (${tipoUsuario})`;
    
    if (isAdmin) {
        document.getElementById('gerenciarUsuariosBtn').classList.remove('hidden');
    }
    
    setupPermissions();
    carregarDados();
}

// Logout
export function logout() {
    currentUser = null;
    isAdmin = false;
    isGestor = false;
    document.getElementById('mainSystem').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    
    const loginFormCpf = document.getElementById('loginFormCpf');
    const loginFormAdmin = document.getElementById('loginFormAdmin');
    
    if (loginFormCpf) loginFormCpf.reset();
    if (loginFormAdmin) loginFormAdmin.reset();
}

// Configurar permissões
export function setupPermissions() {
    const adminTab = document.getElementById('adminTabItem');
    const addDocenteBtn = document.getElementById('addDocenteBtn');
    
    if (isGestor) {
        if (adminTab) adminTab.classList.remove('hidden');
        if (addDocenteBtn) addDocenteBtn.classList.add('hidden');
        const controleTab = document.querySelector('[href="#controle"]');
        if (controleTab) controleTab.click();
    } else if (!isAdmin) {
        if (adminTab) adminTab.classList.add('hidden');
        if (addDocenteBtn) addDocenteBtn.classList.remove('hidden');
    } else {
        if (adminTab) adminTab.classList.remove('hidden');
        if (addDocenteBtn) addDocenteBtn.classList.remove('hidden');
    }
}

// Carregar todos os dados
export function carregarDados() {
    carregarDocentes();
    carregarFaltas();
    carregarJustificativas();
    
    if (isAdmin || isGestor) {
        carregarEstatisticas();
    }
}

// Exportar para uso global
window.logout = logout;