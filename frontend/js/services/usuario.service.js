import { state, salvarUsuarios, hashPassword } from '../utils/storage.js';
import { formatarCPF } from '../utils/helpers.js';
import { validarUsuario } from '../utils/validators.js';

// Mostrar modal de gerenciar usuários
export function showGerenciarUsuariosModal() {
    if (!state.isAdmin) return;
    const modal = new bootstrap.Modal(document.getElementById('gerenciarUsuariosModal'));
    carregarUsuariosTable();
    modal.show();
}

// Mostrar modal de adicionar usuário
export function showAddUsuarioModal() {
    const modal = new bootstrap.Modal(document.getElementById('addUsuarioModal'));
    document.getElementById('usuarioForm').reset();
    modal.show();
}

// Carregar tabela de usuários
export function carregarUsuariosTable() {
    const tbody = document.getElementById('usuariosTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    state.usuarios.forEach(usuario => {
        const dataCriacao = new Date(usuario.dataCriacao).toLocaleDateString('pt-BR');
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome}</td>
            <td>${formatarCPF(usuario.cpf)}</td>
            <td>
                <span class="badge ${usuario.tipo === 'admin' ? 'bg-danger' : usuario.tipo === 'gestor' ? 'bg-warning' : 'bg-primary'}">
                    ${usuario.tipo === 'admin' ? 'Administrador' : usuario.tipo === 'gestor' ? 'Gestor' : 'Usuário'}
                </span>
            </td>
            <td>${dataCriacao}</td>
            <td>
                <button class="btn btn-warning btn-sm me-1" onclick="resetarSenhaUsuario(${usuario.id})"
                    ${usuario.cpf === state.currentUser?.cpf ? 'disabled' : ''}>
                    <i class="fas fa-key"></i> Resetar Senha
                </button>
                <button class="btn btn-danger btn-sm" onclick="excluirUsuario(${usuario.id})"
                    ${usuario.cpf === state.currentUser?.cpf ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Salvar usuário
export function salvarUsuario() {
    const nome = document.getElementById('usuarioNome').value;
    const cpf = document.getElementById('usuarioCpf').value.replace(/\D/g, '');
    const senha = document.getElementById('usuarioSenha').value;
    const tipo = document.getElementById('usuarioTipo').value;

    if (!validarUsuario(nome, cpf, senha, tipo)) return;

    // Verificar se CPF já existe
    if (state.usuarios.find(u => u.cpf.replace(/\D/g, '') === cpf)) {
        alert('Este CPF já está cadastrado!');
        return;
    }

    const novoUsuario = {
        id: state.usuarios.length > 0 ? Math.max(...state.usuarios.map(u => u.id)) + 1 : 1,
        nome: nome,
        cpf: cpf,
        password: hashPassword(senha),
        tipo: tipo,
        dataCriacao: new Date().toISOString(),
        ativo: true
    };

    state.usuarios.push(novoUsuario);
    salvarUsuarios();
    
    alert('Usuário criado com sucesso!');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('addUsuarioModal'));
    modal.hide();
    carregarUsuariosTable();
}

// Resetar senha de usuário
export function resetarSenhaUsuario(id) {
    state.usuarioResetSenha = state.usuarios.find(u => u.id === id);
    if (state.usuarioResetSenha) {
        const modal = new bootstrap.Modal(document.getElementById('resetSenhaModal'));
        document.getElementById('novaSenha').value = '';
        document.getElementById('confirmNovaSenha').value = '';
        modal.show();
    }
}

// Confirmar reset de senha
export function confirmarResetSenha() {
    const novaSenha = document.getElementById('novaSenha').value;
    const confirmNovaSenha = document.getElementById('confirmNovaSenha').value;

    if (novaSenha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres!');
        return;
    }

    if (novaSenha !== confirmNovaSenha) {
        alert('As senhas não coincidem!');
        return;
    }

    if (state.usuarioResetSenha) {
        state.usuarioResetSenha.password = hashPassword(novaSenha);
        salvarUsuarios();
        alert(`Senha do usuário ${state.usuarioResetSenha.nome} resetada com sucesso!`);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('resetSenhaModal'));
        modal.hide();
        carregarUsuariosTable();
        state.usuarioResetSenha = null;
    }
}

// Excluir usuário
export function excluirUsuario(id) {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    const index = state.usuarios.findIndex(u => u.id === id);
    if (index !== -1) {
        state.usuarios.splice(index, 1);
        salvarUsuarios();
        alert('Usuário excluído com sucesso!');
        carregarUsuariosTable();
    }
}

// Exportar para uso global
window.showGerenciarUsuariosModal = showGerenciarUsuariosModal;
window.showAddUsuarioModal = showAddUsuarioModal;
window.salvarUsuario = salvarUsuario;
window.resetarSenhaUsuario = resetarSenhaUsuario;
window.confirmarResetSenha = confirmarResetSenha;
window.excluirUsuario = excluirUsuario;