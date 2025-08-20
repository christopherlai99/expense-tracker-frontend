import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MultiSelectDropdown } from '../multi-select-dropdown/multi-select-dropdown';
import { ExpenseService } from '../expense-service';
import { error } from 'console';
import { ChartConfiguration } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

export interface Expense {
  id: number;
  type: string;
  amount: number;
  category: string;
  expenseDate: Date;
  note?: string;
}

export interface ExpenseFilter {
  types?: string[];
  categories?: string[];
  months?: string[];
  notes?: string;
  startDate?: Date;
  endDate?: Date;
  pageSize: number;
  pageNo: number;
}

(Date.prototype as any).toYearMonth = function () {
  return this.toLocaleString().split(', ')[0].split('/').reverse().slice(0, 2).join('-')
}

@Component({
  selector: 'app-view-expenses',
  imports: [
    FormsModule, CommonModule, MultiSelectDropdown, NgChartsModule
  ],
  standalone: true,
  templateUrl: './view-expenses.html',
  styleUrl: './view-expenses.scss'
})
export class ViewExpenses implements OnInit {
  //add record
  activeTab: 'Expense' | 'Income' = 'Expense';
  exCategories: string[] = ['Food', 'Travel', 'Utility', 'Family', 'Other'];
  inCategories: string[] = ['Salary', 'Investment', 'Other'];
  categories: string[] = this.exCategories;

  //update record
  updateCategoryOption: string[] = this.exCategories;

  //filter
  typeOption: string[] = ['Expense', 'Income'];
  categoryOption: string[] = ['Food', 'Travel', 'Utility', 'Family', 'Salary', 'Investment', 'Other'];
  monthOption: string[] = [];
  selectedTypes: string[] = [];
  selectedCategories: string[] = [];
  selectedMonths: string[] = [];
  noteInput: string = '';

  //chart
  isBrowser = false;
  monthlyChartLabels: string[] = [];
  monthlyChartData: any[] = [];
  categoryChartLabels: string[] = [];
  categoryChartData: any[] = [];
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    aspectRatio: 1,
    plugins: {
      legend: {
        display: true,
        position: 'right' as const,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            return `${label}: RM ${value.toFixed(2)}`;
          }
        }
      }
    }
  };

  constructor(private expenseService: ExpenseService, @Inject(PLATFORM_ID) private platformId: Object) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  setActiveTab(tab: 'Expense' | 'Income') {
    this.activeTab = tab;
    if (tab === 'Expense') {
      this.categories = this.exCategories;
    }
    else {
      this.categories = this.inCategories;
    }
  }

  onTypeSelectionChange(selectedItems: string[]) {
    this.selectedTypes = selectedItems;
  }

  onCategorySelectionChange(selectedItems: string[]) {
    this.selectedCategories = selectedItems;
  }

  onMonthSelectionChange(selectedItems: string[]) {
    this.selectedMonths = selectedItems;
  }

  addRecord(form: NgForm) {
    if (form.valid) {
      const newExpense: Expense = {
        id: 0,
        type: this.activeTab,
        amount: form.value.amount,
        category: form.value.category,
        expenseDate: form.value.date,
        note: form.value.note
      };

      this.pageNo = 1;
      this.expenseService.addExpense(newExpense).subscribe({
        next: addedRecord => {
          if(addedRecord) {
            Swal.fire('Success', 'Record added!')
            this.ngOnInit();
  
            form.reset();
          }
          else {
            Swal.fire('Failed', 'Record added failed.')
          }
        },
        error: (err) => {
          console.log('failed', err);
          Swal.fire('Failed', 'Record added failed.')
        },
        complete: () => {
          console.log('completed');
        }
      });
    }
  }

  editingId: number | null = null;
  editingExpense: Expense | null = null;

  startEdit(expense: Expense) {
    this.editingId = expense.id;
    this.editingExpense = { ...expense };
    this.updateCategoryOption = this.editingExpense.type === 'Income' ? this.inCategories : this.exCategories;
  }

  cancelEdit() {
    this.editingId = null;
    this.editingExpense = null;
  }

  onTypeChange(newType: string) {
    this.updateCategoryOption = newType === 'Income'
      ? this.inCategories
      : this.exCategories;
  
    if (this.editingExpense && !this.updateCategoryOption.includes(this.editingExpense.category)) {
      this.editingExpense.category = this.updateCategoryOption[0];
    }
  }
  
  updateRecord() {
    if(!this.editingExpense) return;

    const newExpense: Expense = {
      id: this.editingExpense.id,
      type: this.editingExpense.type,
      amount: this.editingExpense.amount,
      category: this.editingExpense.category,
      expenseDate: this.editingExpense.expenseDate,
      note: this.editingExpense.note
    };

    this.pageNo = 1;
    this.expenseService.updateExpense(newExpense).subscribe({
      next: updatedRecord => {
        if(updatedRecord) {
          Swal.fire('Success', 'Record updated!')
          this.ngOnInit();
          this.editingId = null;
          this.editingExpense = null;
        }
        else {
          Swal.fire('Failed', 'Record update failed.')
        }
      },
      error: (err) => {
        console.log('failed', err);
        Swal.fire('Failed', 'Record update failed.')
      },
      complete: () => {
        console.log('completed');
      }
    });
  }

  getMonthFilter() {
    const today = new Date()
    this.monthOption = []
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getTime())
      date.setMonth(today.getMonth() - i)
      this.monthOption.push((date as any).toYearMonth())
    }
  }

  async deleteRecord(id: number) {
    const { isConfirmed, isDenied, isDismissed, value } = await Swal.fire({
      text: 'Confirm Delete?',
      icon: 'question',
      confirmButtonText: 'Yes',
      confirmButtonColor: '#ff0000',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      cancelButtonColor: '#7f7f7f',
    })
    if (!isConfirmed) return;
    this.pageNo = 1;
    this.expenseService.deleteExpense(id).subscribe({
      next: (deleted) => {
        if(deleted) {
          Swal.fire('Success', 'Delete successfully!');
          this.ngOnInit();
        }
        else {
          Swal.fire('Failed', 'Record deleted failed.');
        }
      },
      error: (err) => {
        Swal.fire('Failed', 'Record deleted failed.');
        console.log('failed', err);
      },
      complete: () => {
        console.log('completed');
      }
    });
  }

  applyFilter(form: NgForm) {
    this.noteInput = form.value.note;
    // console.log(form.value.note);
    // console.log(this.selectedTypes);
    // console.log(this.selectedCategories);
    // console.log(this.selectedMonths);
    this.getExpenses();
  }

  expenses: Expense[] = [];
  barChartExpenses: Expense[] = [];
  pieChartExpenses: Expense[] = [];

  sortKey: keyof Expense | '' = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  async ngOnInit(): Promise<void> {
    this.pageNo = 1;
    await this.getExpenses();
    if (this.isBrowser) {
      this.initChart();
    }
  }

  //table
  pageNo: number = 1;
  pageSize: number = 10;
  totalRecords: number = 0;

  getExpenses(): Promise<void> {
    return new Promise((resolve, reject) => {
      const filter: ExpenseFilter = {
        types: this.selectedTypes,
        categories: this.selectedCategories,
        months: this.selectedMonths,
        notes: this.noteInput,
        pageNo: this.pageNo,
        pageSize: this.pageSize
      }
      this.expenseService.getExpenses(filter)
        .subscribe({
          next: (res) => {
            this.expenses = res.expenses;
            console.log('got response', this.expenses)
            this.totalRecords = res.totalRecord;
            this.getMonthFilter();
            resolve()
          },
          error: (err) => {
            console.error('Failed to get expenses:', err);
            reject(err)
          }
        });
    })
  }

  getBarChartExpenses(): Promise<void> {
    return new Promise((resolve, reject) => {
      const filter: ExpenseFilter = {
        startDate: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(),
        pageNo: 0,
        pageSize: 0
      }
      this.expenseService.getExpenses(filter)
        .subscribe({
          next: (res) => {
            console.log('bar chart', res)
            this.barChartExpenses = res.expenses;
            resolve()
          },
          error: (err) => {
            console.error('Failed to get expenses:', err);
            reject(err)
          }
        });
    })
  }

  getPieChartExpenses(): Promise<void> {
    return new Promise((resolve, reject) => {
      const currentMonth = (new Date() as any).toYearMonth();
      console.log('month', currentMonth)
      const filter: ExpenseFilter = {
        months: [currentMonth],
        //2025-08
        pageNo: 0,
        pageSize: 0
      }
      this.expenseService.getExpenses(filter)
        .subscribe({
          next: (res) => {
            console.log('pie chart', res)
            this.pieChartExpenses = res.expenses;
            resolve()
          },
          error: (err) => {
            console.error('Failed to get expenses:', err);
            reject(err)
          }
        });
    })
  }

  prevPage() {
    if (this.pageNo > 1) {
      this.pageNo--;
      this.getExpenses();
    }
  }

  nextPage() {
    if (this.pageNo < this.getTotalPages()) {
      this.pageNo++;
      this.getExpenses();
    }
  }

  onPageSizeChange() {
    this.pageNo = 1;
    this.getExpenses();
  }

  min(a: number, b: number): number { return Math.min(a, b); }

  getTotalPages(): number {
    return this.totalRecords;
    // return Math.ceil(this.totalRecords / this.pageSize);
  }

  // getExpenses(): void {
  //   this.expenses = this.dummyExpenses;
  // }

  sortBy(key: keyof Expense) {
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortDirection = 'asc';
    }

    this.expenses.sort((a, b) => {
      if (this.sortKey === '') {
        return 0;
      }

      const aValue = a[this.sortKey];
      const bValue = b[this.sortKey];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        return this.sortDirection === 'asc'
          ? aValue - bValue
          : bValue - aValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }
      return 0;
    });
  }

  getSortClass(key: keyof Expense) {
    if (this.sortKey === key) {
      return this.sortDirection === 'asc' ? 'asc' : 'desc';
    }
    return '';
  }

  //chart
  initChart() {
    this.calculateMonthlyData();
    this.calculateCategoryData();
  }

  //chart 1
  async calculateMonthlyData() {
    await this.getBarChartExpenses();
    const monthlyIncome: { [key: string]: number } = {};
    const monthlyExpense: { [key: string]: number } = {};

    const currentMonth = new Date();
    const months: string[] = [];

    for (let i = 2; i >= 0; i--) {
      const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short' });
      months.push(label);
      monthlyIncome[label] = 0;
      monthlyExpense[label] = 0;
    }

    this.barChartExpenses.forEach(e => {
      const transDate = new Date(e.expenseDate);
      const label = transDate.toLocaleString('default', { month: 'short' });
      if (!monthlyIncome[label]) monthlyIncome[label] = 0;
      if (!monthlyExpense[label]) monthlyExpense[label] = 0;

      if (e.type === 'Income') {
        monthlyIncome[label] += e.amount;
      } else {
        monthlyExpense[label] += e.amount;
      }
    });

    this.monthlyChartLabels = months;
    this.monthlyChartData = [
      { data: months.map(m => monthlyIncome[m] || 0), label: 'Income' },
      { data: months.map(m => monthlyExpense[m] || 0), label: 'Expense' }
    ];

    // this.monthlyChartData = { 
    //   labels: months,
    //   datasets: [
    //     { data: months.map(m => monthlyIncome[m] || 0), label: 'Income' },
    //     { data: months.map(m => monthlyExpense[m] || 0), label: 'Expense' }
    //   ]
    // };
  }

  //chart 2
  async calculateCategoryData() {
    await this.getPieChartExpenses();
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const categoryTotals: { [key: string]: number } = {};

    this.pieChartExpenses.forEach(e => {
      const transDate = new Date(e.expenseDate);
      if (e.type === 'Expense' && transDate.getMonth() === currentMonth && transDate.getFullYear() === currentYear) {
        if (!categoryTotals[e.category]) categoryTotals[e.category] = 0;
        categoryTotals[e.category] += e.amount;
      }
    });

    this.categoryChartLabels = Object.keys(categoryTotals);
    this.categoryChartData = [
      {
        data: Object.values(categoryTotals),
        label: 'Expenses',
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ],
        borderColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ],
        borderWidth: 1
      }
    ];
    console.log('data', this.expenses, this.categoryChartData[0].data)
  }
}
