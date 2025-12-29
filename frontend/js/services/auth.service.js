// src/js/services/auth.service.js
import { state, hashPassword, verifyPassword } from '../utils/storage.js';

class AuthService {
    static STORAGE_KEY = 'sistema_faltas_auth';
    
    // Verificar se está autenticado
    static isAuthenticated() {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        return authData !== null;
    }
    
    // Obter dados do usuário atual
    static getCurrentUser() {
        const authData = localStorage.getItem(this.STORAGE_KEY);
        if (authData) {
            try {
                return JSON.parse(authData);
            } catch (e) {
                console.error('Erro ao parsear dados do usuário:', e);
                return null;
            }
        }
        return null;
    }
    
    // Login administrativo
    static async loginAdmin(password) {
        console.log('Tentando login administrativo...');
        
        // Validação simples - senha padrão admin123
        if (password === 'admin123') {
            // Criar dados do usuário admin
            const userData = {
                id: 0,
                name: 'Administrador',
                type: 'admin',
                permissions: ['all'],
                loginTime: new Date().toISOString()
            };
            
            // Salvar no localStorage
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
            
            return {
                success: true,
                message: 'Login realizado com sucesso!',
                user: userData
            };
        } else {
            return {
                success: false,
                message: 'Senha administrativa incorreta'
            };
        }
    }
    
    // Login por CPF (usuário/gestor)
    static async loginCpf(cpf, password) {
        console.log('Tentando login por CPF...', cpf);
        
        // Buscar usuário pelo CPF
        const usuario = state.usuarios.find(u => {
            const usuarioCpf = u.cpf.replace(/\D/g, '');
            return usuarioCpf === cpf;
        });
        
        if (!usuario) {
            return {
                success: false,
                message: 'Usuário não encontrado!'
            };
        }
        
        // Verificar senha
        if (!verifyPassword(password, usuario.password)) {
            return {
                success: false,
                message: 'Senha incorreta!'
            };
        }
        
        // Verificar se usuário está ativo
        if (usuario.ativo === false) {
            return {
                success: false,
                message: 'Usuário inativo!'
            };
        }
        
        // Criar dados da sessão
        const userData = {
            id: usuario.id,
            name: usuario.nome,
            cpf: usuario.cpf,
            type: usuario.tipo,
            permissions: this.getPermissionsByType(usuario.tipo),
            loginTime: new Date().toISOString()
        };
        
        // Salvar no localStorage
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
        
        return {
            success: true,
            message: 'Login realizado com sucesso!',
            user: userData
        };
    }
    
    // Obter permissões por tipo de usuário
    static getPermissionsByType(tipo) {
        const permissions = {
            'admin': ['all'],
            'gestor': ['view_faltas', 'view_docentes', 'view_justificativas', 'view_relatorios', 'config_system'],
            'user': ['view_faltas', 'add_faltas', 'edit_own_faltas', 'view_docentes', 'view_justificativas']
        };
        
        return permissions[tipo] || permissions['user'];
    }
    
    // Logout
    static logout() {
        localStorage.removeItem(this.STORAGE_KEY);
        window.location.href = 'login.html';
    }
    
    // Verificar permissões
    static hasPermission(permission) {
        const user = this.getCurrentUser();
        if (!user) return false;
        
        if (user.permissions.includes('all')) {
            return true;
        }
        
        return user.permissions.includes(permission);
    }
    
    // Verificar tipo de usuário
    static isAdmin() {
        const user = this.getCurrentUser();
        return user && user.type === 'admin';
    }
    
    static isGestor() {
        const user = this.getCurrentUser();
        return user && user.type === 'gestor';
    }
    
    static isUser() {
        const user = this.getCurrentUser();
        return user && user.type === 'user';
    }
}

export default AuthService;