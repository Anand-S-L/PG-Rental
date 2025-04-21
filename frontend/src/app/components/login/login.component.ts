import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading: boolean = false;
  hidePassword: boolean = true;
  returnUrl: string = '/admin';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to '/admin'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin';
    
    // Redirect to admin if already logged in
    this.authService.isAuthenticated$.subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate([this.returnUrl]);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.value;
    
    this.authService.login(username, password).subscribe(
      success => {
        if (success) {
          this.router.navigate([this.returnUrl]);
        } else {
          this.snackBar.open('Invalid username or password', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          this.loading = false;
        }
      },
      error => {
        console.error('Login error:', error);
        this.snackBar.open('Login failed. Please try again later.', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        this.loading = false;
      }
    );
  }
}
