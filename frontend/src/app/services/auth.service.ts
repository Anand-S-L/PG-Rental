import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Check token validity on service initialization
    this.checkTokenValidity();
  }

  login(username: string, password: string): Observable<boolean> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { username, password })
      .pipe(
        tap(response => {
          localStorage.setItem('token', response.token);
          this.isAuthenticatedSubject.next(true);
        }),
        map(() => true),
        catchError(() => {
          this.isAuthenticatedSubject.next(false);
          return of(false);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private checkTokenValidity(): void {
    if (!this.hasToken()) {
      this.isAuthenticatedSubject.next(false);
      return;
    }

    // For our simple implementation, just check if token exists
    // In a real app, we would validate the token with the server
    this.isAuthenticatedSubject.next(true);
  }
}
