import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PgService } from '../../services/pg.service';
import { PG } from '../../models/pg.model';
import { PgFormComponent } from './pg-form/pg-form.component';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  pgs: PG[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  displayedColumns: string[] = ['title', 'location', 'priceRange', 'actions'];

  constructor(
    private pgService: PgService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadPGs();
  }

  loadPGs(): void {
    this.loading = true;
    this.error = null;
    
    this.pgService.getPGs().subscribe(
      (pgs) => {
        this.pgs = pgs;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading PGs:', error);
        this.error = 'Failed to load PG listings. Please try again later.';
        this.loading = false;
        this.snackBar.open('Failed to load PG listings', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  openAddPGDialog(): void {
    const dialogRef = this.dialog.open(PgFormComponent, {
      width: '800px',
      data: { mode: 'add' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.createPG(result);
      }
    });
  }

  openEditPGDialog(pg: PG): void {
    const dialogRef = this.dialog.open(PgFormComponent, {
      width: '800px',
      data: { mode: 'edit', pg: pg }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.updatePG(pg.id, result);
      }
    });
  }

  createPG(pg: PG): void {
    this.loading = true;
    this.pgService.createPG(pg).subscribe(
      (newPG) => {
        this.pgs.push(newPG);
        this.loading = false;
        this.snackBar.open('PG created successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      (error) => {
        console.error('Error creating PG:', error);
        this.loading = false;
        this.snackBar.open('Failed to create PG', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  updatePG(id: string, pg: PG): void {
    this.loading = true;
    this.pgService.updatePG(id, pg).subscribe(
      (updatedPG) => {
        const index = this.pgs.findIndex(p => p.id === id);
        if (index !== -1) {
          this.pgs[index] = updatedPG;
        }
        this.loading = false;
        this.snackBar.open('PG updated successfully', 'Close', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
      },
      (error) => {
        console.error('Error updating PG:', error);
        this.loading = false;
        this.snackBar.open('Failed to update PG', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  deletePG(id: string): void {
    if (confirm('Are you sure you want to delete this PG? This action cannot be undone.')) {
      this.loading = true;
      this.pgService.deletePG(id).subscribe(
        () => {
          this.pgs = this.pgs.filter(pg => pg.id !== id);
          this.loading = false;
          this.snackBar.open('PG deleted successfully', 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        (error) => {
          console.error('Error deleting PG:', error);
          this.loading = false;
          this.snackBar.open('Failed to delete PG', 'Close', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
        }
      );
    }
  }
}
