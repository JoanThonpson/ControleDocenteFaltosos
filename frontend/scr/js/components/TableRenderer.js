// Componente para renderizar tabelas
export class TableRenderer {
    constructor(tableId, options = {}) {
        this.tableId = tableId;
        this.options = {
            pagination: options.pagination || false,
            search: options.search || false,
            sortable: options.sortable || false,
            pageSize: options.pageSize || 10,
            ...options
        };
        
        this.currentPage = 1;
        this.data = [];
        this.sortColumn = null;
        this.sortDirection = 'asc';
    }
    
    // Renderizar tabela
    render(data, columns) {
        this.data = data;
        this.columns = columns;
        
        const table = document.getElementById(this.tableId);
        if (!table) return;
        
        // Limpar tabela
        table.innerHTML = '';
        
        // Criar cabeçalho
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        columns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column.title;
            
            if (this.options.sortable && column.sortable !== false) {
                th.style.cursor = 'pointer';
                th.addEventListener('click', () => this.sortBy(column.key));
            }
            
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Criar corpo
        const tbody = document.createElement('tbody');
        
        // Filtrar dados para página atual
        const startIndex = (this.currentPage - 1) * this.options.pageSize;
        const endIndex = startIndex + this.options.pageSize;
        const pageData = data.slice(startIndex, endIndex);
        
        pageData.forEach(item => {
            const row = document.createElement('tr');
            
            columns.forEach(column => {
                const td = document.createElement('td');
                
                if (column.render) {
                    td.innerHTML = column.render(item);
                } else {
                    td.textContent = item[column.key] || '';
                }
                
                if (column.className) {
                    td.className = column.className;
                }
                
                row.appendChild(td);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        
        // Adicionar controles de paginação se habilitado
        if (this.options.pagination && data.length > this.options.pageSize) {
            this.renderPagination(table);
        }
        
        // Adicionar busca se habilitado
        if (this.options.search) {
            this.renderSearch(table);
        }
    }
    
    // Renderizar paginação
    renderPagination(table) {
        const totalPages = Math.ceil(this.data.length / this.options.pageSize);
        
        const paginationContainer = document.createElement('div');
        paginationContainer.className = 'table-pagination mt-3 d-flex justify-content-between align-items-center';
        
        // Informação da página
        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Página ${this.currentPage} de ${totalPages} (${this.data.length} itens)`;
        
        // Controles de navegação
        const nav = document.createElement('nav');
        const ul = document.createElement('ul');
        ul.className = 'pagination mb-0';
        
        // Botão anterior
        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${this.currentPage === 1 ? 'disabled' : ''}`;
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.href = '#';
        prevLink.textContent = '«';
        prevLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage > 1) {
                this.currentPage--;
                this.render(this.data, this.columns);
            }
        });
        prevLi.appendChild(prevLink);
        ul.appendChild(prevLi);
        
        // Números de página
        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === this.currentPage ? 'active' : ''}`;
            const link = document.createElement('a');
            link.className = 'page-link';
            link.href = '#';
            link.textContent = i;
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentPage = i;
                this.render(this.data, this.columns);
            });
            li.appendChild(link);
            ul.appendChild(li);
        }
        
        // Botão próximo
        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${this.currentPage === totalPages ? 'disabled' : ''}`;
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.href = '#';
        nextLink.textContent = '»';
        nextLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentPage < totalPages) {
                this.currentPage++;
                this.render(this.data, this.columns);
            }
        });
        nextLi.appendChild(nextLink);
        ul.appendChild(nextLi);
        
        nav.appendChild(ul);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nav);
        
        // Inserir após a tabela
        table.parentNode.appendChild(paginationContainer);
    }
    
    // Renderizar busca
    renderSearch(table) {
        const searchContainer = document.createElement('div');
        searchContainer.className = 'table-search mb-3';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'form-control';
        input.placeholder = 'Buscar...';
        input.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredData = this.originalData.filter(item => {
                return this.columns.some(column => {
                    const value = item[column.key];
                    return value && value.toString().toLowerCase().includes(searchTerm);
                });
            });
            this.data = filteredData;
            this.currentPage = 1;
            this.render(this.data, this.columns);
        });
        
        searchContainer.appendChild(input);
        
        // Inserir antes da tabela
        table.parentNode.insertBefore(searchContainer, table);
    }
    
    // Ordenar por coluna
    sortBy(columnKey) {
        if (this.sortColumn === columnKey) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = columnKey;
            this.sortDirection = 'asc';
        }
        
        this.data.sort((a, b) => {
            const aValue = a[columnKey];
            const bValue = b[columnKey];
            
            if (aValue < bValue) return this.sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return this.sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
        
        this.currentPage = 1;
        this.render(this.data, this.columns);
    }
    
    // Atualizar dados
    updateData(newData) {
        this.data = newData;
        this.currentPage = 1;
        this.render(this.data, this.columns);
    }
    
    // Limpar tabela
    clear() {
        const table = document.getElementById(this.tableId);
        if (table) {
            table.innerHTML = '';
        }
    }
}