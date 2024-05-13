import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService {
  private empleadosUrl = 'https://jsonplaceholder.typicode.com/users'; 
     
  private dataSubject = new BehaviorSubject<any>(null);
  data$ = this.dataSubject.asObservable();

  constructor( private http:HttpClient) { }

  sendData(data: any) {
    this.dataSubject.next(data);
  }

  getEmployeeList(): Observable<any[]> {
    return this.http.get(this.empleadosUrl)
      .pipe(
        tap(data => console.log('Fetched employees:', data)), 
        catchError((error: HttpErrorResponse) => {
          console.error('Error fetching employees:', error);
          return of([]);
        }),
        map(data => data as any[]) 
      );
  }

  addEmployee(data: any): Observable<any> {
    console.log("Datos del empleado a agregar:", data);
    return this.http.post<any>(this.empleadosUrl, data).pipe(
      tap((response: any) => console.log("Respuesta del servidor:", response)),
      catchError(this.handleError<any>('addEmployee'))
    );
  }

  updateEmployee(id: number, data: any): Observable<any> {
    const url = `${this.empleadosUrl}/${id}`;
    return this.http.put<any>(url, data).pipe(
      tap(_ => console.log(`Updated employee with id=${id}`)),
      catchError(this.handleError<any>('updateEmployee'))
    );
  }


  deleteEmployee(id: number): Observable<any> {
    const url = `${this.empleadosUrl}/${id}`;
    return this.http.delete<any>(url).pipe(
      tap(_ => console.log(`Deleted employee with id=${id}`)),
      catchError((error) => {
        console.error('Error deleting employee:', error);
        return throwError('Unable to delete employee. Please try again later.');
      })
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return throwError(result as T);
    };
  }
}