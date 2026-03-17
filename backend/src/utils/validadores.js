// Arquivo: ControleDocenteFaltosos/backend/src/utils/validadores.js
// Função: Funções de validação (CPF, etc)

function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Validação simplificada (depois implementamos completa)
  return true;
}

module.exports = {
  validarCPF
};