/**
 * Table component for Monochrome Edge UI Components
 */

import { BaseComponent, ComponentConfig } from './base';
import { TableProps } from '../types';
import { cx } from '../utils';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any, index: number) => string | HTMLElement;
}

export interface TableConfig extends ComponentConfig, TableProps {
  columns?: TableColumn[];
  data?: any[];
}

export class Table extends BaseComponent<HTMLTableElement, TableConfig> {
  private theadElement?: HTMLTableSectionElement;
  private tbodyElement?: HTMLTableSectionElement;
  private tfootElement?: HTMLTableSectionElement;
  private sortColumn?: string;
  private sortDirection: 'asc' | 'desc' = 'asc';
  private selectedRows: Set<number> = new Set();
  private currentPage = 1;
  private pageSize = 10;

  protected getDefaultConfig(): Partial<TableConfig> {
    return {
      striped: false,
      hoverable: true,
      bordered: true,
      compact: false,
      sortable: false,
      selectable: false,
      loading: false,
      columns: [],
      data: []
    };
  }

  protected init(): void {
    // Ensure we have a table element
    if (this.element.tagName !== 'TABLE') {
      const table = document.createElement('table');
      table.innerHTML = this.element.innerHTML;
      this.element.parentNode?.replaceChild(table, this.element);
      this.element = table;
    }

    // Set initial properties
    this.render();

    // Build table if data provided
    if (this.config.columns && this.config.data) {
      this.buildTable();
    }
  }

  protected render(): void {
    const {
      striped,
      hoverable,
      bordered,
      compact,
      loading,
      className
    } = this.config;

    // Build class names
    const classes = cx(
      'table',
      striped && 'table-striped',
      hoverable && 'table-hover',
      bordered && 'table-bordered',
      compact && 'table-compact',
      loading && 'table-loading',
      className
    );

    // Apply classes
    this.element.className = classes;

    // Set attributes
    this.element.setAttribute('role', 'table');
  }

  private buildTable(): void {
    // Clear existing content
    this.element.innerHTML = '';

    // Create thead
    this.createHeader();

    // Create tbody
    this.createBody();

    // Create tfoot if needed
    if (this.config.footer) {
      this.createFooter();
    }

    // Add loading overlay
    if (this.config.loading) {
      this.showLoading();
    }
  }

  private createHeader(): void {
    if (!this.config.columns) return;

    this.theadElement = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Add selection checkbox column
    if (this.config.selectable) {
      const selectAllTh = document.createElement('th');
      selectAllTh.className = 'table-select-column';

      const selectAllCheckbox = document.createElement('input');
      selectAllCheckbox.type = 'checkbox';
      selectAllCheckbox.className = 'table-select-all';
      selectAllCheckbox.addEventListener('change', (e) => {
        this.handleSelectAll((e.target as HTMLInputElement).checked);
      });

      selectAllTh.appendChild(selectAllCheckbox);
      headerRow.appendChild(selectAllTh);
    }

    // Add column headers
    this.config.columns.forEach(column => {
      const th = document.createElement('th');
      th.className = 'table-header-cell';

      if (column.align) {
        th.style.textAlign = column.align;
      }

      if (column.width) {
        th.style.width = typeof column.width === 'number'
          ? `${column.width}px`
          : column.width;
      }

      if (column.sortable || this.config.sortable) {
        th.classList.add('table-sortable');
        th.setAttribute('role', 'button');
        th.setAttribute('tabindex', '0');

        const sortButton = document.createElement('button');
        sortButton.className = 'table-sort-button';
        sortButton.innerHTML = `
          ${column.label}
          <span class="table-sort-icon">
            ${this.sortColumn === column.key
              ? (this.sortDirection === 'asc' ? '▲' : '▼')
              : '⬍'}
          </span>
        `;

        sortButton.addEventListener('click', () => this.handleSort(column.key));
        th.appendChild(sortButton);
      } else {
        th.textContent = column.label;
      }

      headerRow.appendChild(th);
    });

    this.theadElement.appendChild(headerRow);
    this.element.appendChild(this.theadElement);
  }

  private createBody(): void {
    if (!this.config.columns || !this.config.data) return;

    this.tbodyElement = document.createElement('tbody');

    // Get paginated data
    const paginatedData = this.getPaginatedData();

    if (paginatedData.length === 0) {
      // Show empty state
      const emptyRow = document.createElement('tr');
      const emptyCell = document.createElement('td');
      emptyCell.className = 'table-empty';
      emptyCell.colSpan = this.config.columns.length + (this.config.selectable ? 1 : 0);
      emptyCell.textContent = this.config.emptyText || 'No data available';
      emptyRow.appendChild(emptyCell);
      this.tbodyElement.appendChild(emptyRow);
    } else {
      // Add data rows
      paginatedData.forEach((row, index) => {
        const tr = this.createRow(row, index);
        this.tbodyElement.appendChild(tr);
      });
    }

    this.element.appendChild(this.tbodyElement);
  }

  private createRow(rowData: any, index: number): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.className = 'table-row';

    // Add selection checkbox
    if (this.config.selectable) {
      const selectTd = document.createElement('td');
      selectTd.className = 'table-select-column';

      const selectCheckbox = document.createElement('input');
      selectCheckbox.type = 'checkbox';
      selectCheckbox.className = 'table-select-row';
      selectCheckbox.checked = this.selectedRows.has(index);
      selectCheckbox.addEventListener('change', (e) => {
        this.handleSelectRow(index, (e.target as HTMLInputElement).checked);
      });

      selectTd.appendChild(selectCheckbox);
      tr.appendChild(selectTd);
    }

    // Add data cells
    this.config.columns?.forEach(column => {
      const td = document.createElement('td');
      td.className = 'table-cell';

      if (column.align) {
        td.style.textAlign = column.align;
      }

      const value = rowData[column.key];

      if (column.render) {
        const rendered = column.render(value, rowData, index);
        if (typeof rendered === 'string') {
          td.innerHTML = rendered;
        } else {
          td.appendChild(rendered);
        }
      } else {
        td.textContent = value != null ? String(value) : '';
      }

      tr.appendChild(td);
    });

    // Add row click handler if provided
    if (this.config.onRowClick) {
      tr.style.cursor = 'pointer';
      tr.addEventListener('click', () => {
        if (this.config.onRowClick) {
          this.config.onRowClick(rowData, index);
        }
      });
    }

    return tr;
  }

  private createFooter(): void {
    if (!this.config.footer) return;

    this.tfootElement = document.createElement('tfoot');

    if (typeof this.config.footer === 'string') {
      const footerRow = document.createElement('tr');
      const footerCell = document.createElement('td');
      footerCell.colSpan = (this.config.columns?.length || 0) + (this.config.selectable ? 1 : 0);
      footerCell.innerHTML = this.config.footer;
      footerRow.appendChild(footerCell);
      this.tfootElement.appendChild(footerRow);
    } else {
      this.tfootElement.appendChild(this.config.footer);
    }

    this.element.appendChild(this.tfootElement);
  }

  private handleSort(columnKey: string): void {
    if (this.sortColumn === columnKey) {
      // Toggle direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }

    // Sort data
    this.sortData();

    // Rebuild table
    this.buildTable();

    // Emit event
    this.emit('monochrome:table-sort', {
      table: this,
      column: columnKey,
      direction: this.sortDirection
    });
  }

  private sortData(): void {
    if (!this.sortColumn || !this.config.data) return;

    this.config.data.sort((a, b) => {
      const aVal = a[this.sortColumn!];
      const bVal = b[this.sortColumn!];

      let comparison = 0;

      if (aVal == null) return 1;
      if (bVal == null) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        comparison = aVal - bVal;
      } else {
        comparison = String(aVal).localeCompare(String(bVal));
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  private handleSelectAll(checked: boolean): void {
    if (checked) {
      // Select all rows on current page
      const pageData = this.getPaginatedData();
      pageData.forEach((_, index) => {
        this.selectedRows.add(index);
      });
    } else {
      // Deselect all
      this.selectedRows.clear();
    }

    // Update row checkboxes
    this.updateRowSelections();

    // Emit event
    this.emit('monochrome:table-select-all', {
      table: this,
      selected: checked
    });
  }

  private handleSelectRow(index: number, checked: boolean): void {
    if (checked) {
      this.selectedRows.add(index);
    } else {
      this.selectedRows.delete(index);
    }

    // Update select all checkbox
    this.updateSelectAllCheckbox();

    // Emit event
    this.emit('monochrome:table-select-row', {
      table: this,
      index,
      selected: checked
    });
  }

  private updateRowSelections(): void {
    const checkboxes = this.tbodyElement?.querySelectorAll<HTMLInputElement>('.table-select-row');
    checkboxes?.forEach((checkbox, index) => {
      checkbox.checked = this.selectedRows.has(index);
    });
  }

  private updateSelectAllCheckbox(): void {
    const selectAllCheckbox = this.theadElement?.querySelector<HTMLInputElement>('.table-select-all');
    if (selectAllCheckbox) {
      const pageData = this.getPaginatedData();
      const allSelected = pageData.length > 0 && pageData.every((_, index) => this.selectedRows.has(index));
      const someSelected = pageData.some((_, index) => this.selectedRows.has(index));

      selectAllCheckbox.checked = allSelected;
      selectAllCheckbox.indeterminate = someSelected && !allSelected;
    }
  }

  private getPaginatedData(): any[] {
    if (!this.config.data) return [];

    if (!this.config.pagination) {
      return this.config.data;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    return this.config.data.slice(start, end);
  }

  private showLoading(): void {
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'table-loading-overlay';
    loadingOverlay.innerHTML = '<div class="table-loading-spinner"></div>';
    this.element.appendChild(loadingOverlay);
  }

  private hideLoading(): void {
    const loadingOverlay = this.element.querySelector('.table-loading-overlay');
    if (loadingOverlay) {
      loadingOverlay.remove();
    }
  }

  /**
   * Set table data
   */
  setData(data: any[]): void {
    this.config.data = data;
    this.selectedRows.clear();
    this.currentPage = 1;
    this.buildTable();
  }

  /**
   * Get selected rows
   */
  getSelectedRows(): any[] {
    if (!this.config.data) return [];

    return Array.from(this.selectedRows).map(index => this.config.data![index]);
  }

  /**
   * Clear selection
   */
  clearSelection(): void {
    this.selectedRows.clear();
    this.updateRowSelections();
    this.updateSelectAllCheckbox();
  }

  /**
   * Set loading state
   */
  setLoading(loading: boolean): void {
    this.config.loading = loading;

    if (loading) {
      this.addClass('table-loading');
      this.showLoading();
    } else {
      this.removeClass('table-loading');
      this.hideLoading();
    }
  }

  /**
   * Go to page
   */
  goToPage(page: number): void {
    if (!this.config.data || !this.config.pagination) return;

    const totalPages = Math.ceil(this.config.data.length / this.pageSize);

    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.buildTable();

      // Emit event
      this.emit('monochrome:table-page-change', {
        table: this,
        page: this.currentPage
      });
    }
  }

  /**
   * Static factory method
   */
  static create(config?: Partial<TableConfig>): Table {
    const element = document.createElement('table');
    return new Table(element, config || {});
  }

  /**
   * Initialize all tables on page
   */
  static initAll(selector = '[data-monochrome="table"]'): Table[] {
    const tables: Table[] = [];

    document.querySelectorAll<HTMLTableElement>(selector).forEach(element => {
      const config: Partial<TableConfig> = {
        striped: element.dataset.striped === 'true',
        hoverable: element.dataset.hoverable !== 'false',
        bordered: element.dataset.bordered !== 'false',
        compact: element.dataset.compact === 'true',
        sortable: element.dataset.sortable === 'true',
        selectable: element.dataset.selectable === 'true'
      };

      tables.push(new Table(element, config));
    });

    return tables;
  }
}

export default Table;
