// Componente para gerenciar filtros
export class FilterManager {
    constructor(containerId, filtersConfig) {
        this.containerId = containerId;
        this.filtersConfig = filtersConfig;
        this.activeFilters = {};
        this.onFilterChange = null;
    }
    
    // Inicializar filtros
    init() {
        const container = document.getElementById(this.containerId);
        if (!container) return;
        
        container.innerHTML = '';
        
        this.filtersConfig.forEach(filter => {
            const filterElement = this.createFilterElement(filter);
            container.appendChild(filterElement);
        });
        
        // Adicionar botão de limpar filtros
        const clearButton = this.createClearButton();
        container.appendChild(clearButton);
    }
    
    // Criar elemento de filtro
    createFilterElement(filter) {
        const wrapper = document.createElement('div');
        wrapper.className = `filter-group ${filter.className || ''}`;
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = filter.label;
        wrapper.appendChild(label);
        
        let input;
        
        switch (filter.type) {
            case 'select':
                input = document.createElement('select');
                input.className = 'form-select filter-select';
                input.id = filter.id;
                
                // Adicionar opção padrão
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = filter.placeholder || 'Todos';
                input.appendChild(defaultOption);
                
                // Adicionar opções
                filter.options.forEach(option => {
                    const opt = document.createElement('option');
                    opt.value = option.value;
                    opt.textContent = option.label;
                    input.appendChild(opt);
                });
                break;
                
            case 'date':
                input = document.createElement('input');
                input.type = 'date';
                input.className = 'form-control filter-date';
                input.id = filter.id;
                if (filter.placeholder) input.placeholder = filter.placeholder;
                break;
                
            case 'text':
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'form-control filter-text';
                input.id = filter.id;
                if (filter.placeholder) input.placeholder = filter.placeholder;
                break;
                
            case 'number':
                input = document.createElement('input');
                input.type = 'number';
                input.className = 'form-control filter-number';
                input.id = filter.id;
                if (filter.min !== undefined) input.min = filter.min;
                if (filter.max !== undefined) input.max = filter.max;
                if (filter.placeholder) input.placeholder = filter.placeholder;
                break;
                
            case 'range':
                input = document.createElement('input');
                input.type = 'range';
                input.className = 'form-range filter-range';
                input.id = filter.id;
                if (filter.min !== undefined) input.min = filter.min;
                if (filter.max !== undefined) input.max = filter.max;
                if (filter.step !== undefined) input.step = filter.step;
                break;
        }
        
        if (input) {
            input.addEventListener('change', (e) => this.onFilterInputChange(filter.id, e.target.value));
            wrapper.appendChild(input);
        }
        
        return wrapper;
    }
    
    // Criar botão de limpar filtros
    createClearButton() {
        const wrapper = document.createElement('div');
        wrapper.className = 'filter-clear d-flex align-items-end';
        
        const button = document.createElement('button');
        button.className = 'btn btn-outline-secondary w-100';
        button.innerHTML = '<i class="fas fa-times"></i> Limpar Filtros';
        button.addEventListener('click', () => this.clearFilters());
        
        wrapper.appendChild(button);
        return wrapper;
    }
    
    // Evento quando filtro é alterado
    onFilterInputChange(filterId, value) {
        if (value === '') {
            delete this.activeFilters[filterId];
        } else {
            this.activeFilters[filterId] = value;
        }
        
        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilters);
        }
    }
    
    // Limpar todos os filtros
    clearFilters() {
        this.activeFilters = {};
        
        // Resetar todos os inputs
        this.filtersConfig.forEach(filter => {
            const input = document.getElementById(filter.id);
            if (input) {
                if (filter.type === 'select') {
                    input.value = '';
                } else {
                    input.value = '';
                }
            }
        });
        
        if (this.onFilterChange) {
            this.onFilterChange(this.activeFilters);
        }
    }
    
    // Obter filtros ativos
    getActiveFilters() {
        return this.activeFilters;
    }
    
    // Aplicar filtros a uma lista de dados
    applyFilters(data) {
        return data.filter(item => {
            return Object.keys(this.activeFilters).every(filterId => {
                const filterValue = this.activeFilters[filterId];
                const itemValue = item[filterId];
                
                if (filterValue === undefined || filterValue === '') {
                    return true;
                }
                
                if (itemValue === undefined) {
                    return false;
                }
                
                // Diferentes tipos de comparação
                if (typeof filterValue === 'string') {
                    return itemValue.toString().toLowerCase().includes(filterValue.toLowerCase());
                }
                
                if (typeof filterValue === 'number') {
                    return itemValue === filterValue;
                }
                
                return itemValue == filterValue;
            });
        });
    }
    
    // Configurar callback para quando filtros mudam
    setOnFilterChange(callback) {
        this.onFilterChange = callback;
    }
    
    // Restaurar filtros salvos
    restoreFilters(savedFilters) {
        if (!savedFilters) return;
        
        this.activeFilters = savedFilters;
        
        // Restaurar valores dos inputs
        Object.keys(savedFilters).forEach(filterId => {
            const input = document.getElementById(filterId);
            if (input) {
                input.value = savedFilters[filterId];
            }
        });
    }
    
    // Salvar filtros atuais
    saveFilters() {
        return JSON.parse(JSON.stringify(this.activeFilters));
    }
}