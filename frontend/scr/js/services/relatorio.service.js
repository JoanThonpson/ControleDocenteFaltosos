import { docentes, faltas } from '../utils/storage.js';
import { formatarData } from '../utils/helpers.js';

// Aplicar filtro nas estatísticas
export function aplicarFiltroEstatisticas() {
    carregarEstatisticas();
}

// Carregar estatísticas
export function carregarEstatisticas() {
    const container = document.getElementById('estatisticas');
    if (!container) return;
    
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    let faltasFiltradas = faltas;
    
    if (dataInicio && dataFim) {
        faltasFiltradas = faltas.filter(falta => {
            const dataFalta = new Date(falta.data);
            const inicio = new Date(dataInicio);
            const fim = new Date(dataFim);
            return dataFalta >= inicio && dataFalta <= fim;
        });
    }
    
    const totalFaltas = faltasFiltradas.reduce((sum, falta) => sum + falta.quantidadeFaltas, 0);
    const faltasJustificadas = faltasFiltradas.filter(f => f.status === 'justificada')
        .reduce((sum, falta) => sum + falta.quantidadeFaltas, 0);
    const totalDocentes = docentes.length;

    container.innerHTML = `
        <p><strong>Total de Docentes:</strong> ${totalDocentes}</p>
        <p><strong>Total de Faltas:</strong> ${totalFaltas}</p>
        <p><strong>Faltas Justificadas:</strong> ${faltasJustificadas}</p>
        <p><strong>Faltas Não Justificadas:</strong> ${totalFaltas - faltasJustificadas}</p>
        ${dataInicio && dataFim ? `<p class="text-muted"><small>Período: ${formatarData(dataInicio)} à ${formatarData(dataFim)}</small></p>` : ''}
    `;
}

// Gerar relatório de faltas em Excel
export function gerarRelatorioFaltas() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione a data início e data fim para gerar o relatório!');
        return;
    }
    
    let faltasFiltradas = faltas.filter(falta => {
        const dataFalta = new Date(falta.data);
        const inicio = new Date(dataInicio);
        const fim = new Date(dataFim);
        return dataFalta >= inicio && dataFalta <= fim;
    });
    
    if (faltasFiltradas.length === 0) {
        alert('Não há faltas registradas no período selecionado!');
        return;
    }
    
    const cabecalhos = [
        'Nome Completo do Docente',
        'Disciplina Ministrada', 
        'Curso/Modalidade',
        'Total de Faltas Registradas',
        'Justificativa Apresentada',
        'Observações Adicionais',
        'Data da Ocorrência',
        'Horário de Início da Aula',
        'Horário de Término da Aula',
        'Situação da Falta'
    ];
    
    const dados = faltasFiltradas.map(falta => {
        const docente = docentes.find(d => d.id === falta.docenteId);
        return [
            docente ? docente.nome : 'Não encontrado',
            falta.disciplina,
            falta.curso,
            falta.quantidadeFaltas,
            falta.justificativa || 'Sem justificativa',
            falta.observacoes || 'Sem observações',
            formatarData(falta.data),
            falta.horarioInicio,
            falta.horarioFim,
            falta.status === 'justificada' ? 'Justificada' : 'Não Justificada'
        ];
    });
    
    const ws = XLSX.utils.aoa_to_sheet([cabecalhos, ...dados]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório de Faltas");
    
    const nomeArquivo = `Relatorio_Faltas_${dataInicio}_a_${dataFim}.xlsx`;
    XLSX.writeFile(wb, nomeArquivo);
}

// Gerar relatório de docentes em PDF
export function gerarRelatorioDocentes() {
    const dataInicio = document.getElementById('dataInicio').value;
    const dataFim = document.getElementById('dataFim').value;
    
    if (!dataInicio || !dataFim) {
        alert('Por favor, selecione a data início e data fim para gerar o relatório!');
        return;
    }
    
    const dados = docentes.map(docente => {
        const faltasDocente = faltas.filter(f => 
            f.docenteId === docente.id && 
            new Date(f.data) >= new Date(dataInicio) && 
            new Date(f.data) <= new Date(dataFim)
        );
        
        const faltasJustificadas = faltasDocente.filter(f => f.status === 'justificada')
            .reduce((sum, falta) => sum + falta.quantidadeFaltas, 0);
        const faltasNaoJustificadas = faltasDocente.filter(f => f.status === 'não justificada')
            .reduce((sum, falta) => sum + falta.quantidadeFaltas, 0);
        const totalFaltas = faltasJustificadas + faltasNaoJustificadas;
        
        return {
            'Docente': docente.nome,
            'Disciplinas': docente.disciplinas.join(', '),
            'Cursos': docente.cursos.join(', '),
            'Total de Aulas no Mês': docente.aulas,
            'Faltas Justificadas': faltasJustificadas,
            'Faltas Não Justificadas': faltasNaoJustificadas,
            'Total de Faltas': totalFaltas
        };
    });
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text('RELATÓRIO DE DOCENTES', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Período: ${formatarData(dataInicio)} à ${formatarData(dataFim)}`, 105, 28, { align: 'center' });
    
    let y = 45;
    doc.setFontSize(8);
    doc.text('DOCENTES', 15, y);
    doc.text('DISCIPLINAS', 50, y);
    doc.text('CURSOS', 90, y);
    doc.text('TOTAL AULAS', 120, y);
    doc.text('JUSTIF.', 140, y);
    doc.text('NÃO JUSTIF.', 155, y);
    doc.text('TOTAL FALTAS', 175, y);
    
    y += 6;
    doc.line(15, y, 195, y);
    y += 10;
    
    doc.setFontSize(7);
    dados.forEach((linha, index) => {
        if (y > 270) {
            doc.addPage();
            y = 20;
        }
        
        doc.text(linha.Docente.substring(0, 20), 15, y);
        doc.text(linha.Disciplinas.substring(0, 25), 50, y);
        doc.text(linha.Cursos.substring(0, 20), 90, y);
        doc.text(linha['Total de Aulas no Mês'].toString(), 120, y);
        doc.text(linha['Faltas Justificadas'].toString(), 140, y);
        doc.text(linha['Faltas Não Justificadas'].toString(), 155, y);
        doc.text(linha['Total de Faltas'].toString(), 175, y);
        
        y += 8;
        
        if (index < dados.length - 1) {
            doc.line(15, y, 195, y);
            y += 5;
        }
    });
    
    const nomeArquivo = `Relatorio_Docentes_${dataInicio}_a_${dataFim}.pdf`;
    doc.save(nomeArquivo);
}

// Exportar para uso global
window.aplicarFiltroEstatisticas = aplicarFiltroEstatisticas;
window.gerarRelatorioFaltas = gerarRelatorioFaltas;
window.gerarRelatorioDocentes = gerarRelatorioDocentes;