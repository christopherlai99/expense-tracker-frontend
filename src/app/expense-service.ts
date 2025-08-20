import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Expense, ExpenseFilter } from './view-expenses/view-expenses';

interface AddExpenseResponse {
  expense: Expense;
}

type ExpensesResponse = {
  expenses: Expense[],
  totalRecord: number,
}

interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'https://localhost:7256/api/expense-tracker';

  constructor(private http: HttpClient) { }

  getExpenses(filter: ExpenseFilter): Observable<ExpensesResponse> {
    return this.http.post<ExpensesResponse>(`${this.apiUrl}/get-expense`, filter).pipe(
      map(res => res ?? {
        expenses: [],
        totalRecord: 0,
      })
    );
  }

  addExpense(expense: Expense): Observable<Expense> {
    return this.http.post<AddExpenseResponse>(`${this.apiUrl}/add-expense`, expense).pipe(
      map(res => res.expense)
    );
  }

  deleteExpense(id: number): Observable<boolean> {
    return this.http.post<DeleteExpenseResponse>(`${this.apiUrl}/delete-expense/${id}`, {}).pipe(
      map(res => res.success)
    );
  }
}