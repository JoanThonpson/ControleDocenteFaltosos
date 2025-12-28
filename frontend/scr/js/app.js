// Arquivo principal que importa todos os módulos
import { inicializarSistema } from './utils/storage.js';
import { formatarData, formatarCPF } from './utils/helpers.js';
import { carregarDados, setupPermissions } from './services/auth.service.js';
import { inicializarModais } from './components/ModalManager.js';

// Configura eventos iniciais
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar sistema
    inicializarSistema();
    
    // Configurar datas padrão
    const hoje = new Date();
    const dataInicio = document.getElementById('dataInicio');
    const dataFim = document.getElementById('dataFim');
    
    if (dataInicio && dataFim) {
        dataInicio.value = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        dataFim.value = hoje.toISOString().split('T')[0];
    }
    
    // Inicializar modais
    inicializarModais();
    
    // Configurar evento de mudança de tipo de acesso
    const tipoAcesso = document.getElementById('tipoAcesso');
    if (tipoAcesso) {
        tipoAcesso.addEventListener('change', mudarTipoAcesso);
    }
});

// Funções globais necessárias pelo HTML
window.mudarTipoAcesso = function() {
    const tipo = document.getElementById('tipoAcesso').value;
    if (tipo === 'admin') {
        document.getElementById('loginCpf').classList.add('hidden');
        document.getElementById('loginAdmin').classList.remove('hidden');
    } else {
        document.getElementById('loginCpf').classList.remove('hidden');
        document.getElementById('loginAdmin').classList.add('hidden');
    }
};

// Exportar funções globais para uso em outros módulos
export { formatarData, formatarCPF };