import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Expense, ExpenseFilter } from './view-expenses/view-expenses';

type ExpensesResponse = {
  expenses: Expense[],
  totalRecord: number,
}

interface UpdateExpenseResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private apiUrl = 'https://chris-expense-tracker-376869617387.asia-southeast1.run.app/api/expense-tracker';

  constructor(private http: HttpClient) { }

  getExpenses(filter: ExpenseFilter): Observable<ExpensesResponse> {
    return this.http.post<ExpensesResponse>(`${this.apiUrl}/get-expense`, filter).pipe(
      map(res => res ?? {
        expenses: [],
        totalRecord: 0,
      })
    );
  }

  addExpense(expense: Expense): Observable<boolean> {
    return this.http.post<UpdateExpenseResponse>(`${this.apiUrl}/add-expense`, expense).pipe(
      map(res => res.success)
    );
  }

  updateExpense(expense: Expense): Observable<boolean> {
    return this.http.post<UpdateExpenseResponse>(`${this.apiUrl}/update-expense`, expense).pipe(
      map(res => res.success)
    );
  }

  deleteExpense(id: number): Observable<boolean> {
    return this.http.post<UpdateExpenseResponse>(`${this.apiUrl}/delete-expense/${id}`, {}).pipe(
      map(res => res.success)
    );
  }
}