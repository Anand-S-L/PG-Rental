import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PgService } from '../../services/pg.service';
import { PG } from '../../models/pg.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-pg-detail',
  templateUrl: './pg-detail.component.html',
  styleUrls: ['./pg-detail.component.css']
})
export class PgDetailComponent implements OnInit {
  pg: PG | null = null;
  loading: boolean = true;
  error: string | null = null;
  currentImageIndex: number = 0;
  sanitizedMapUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pgService: PgService,
    private snackBar: MatSnackBar,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadPGDetails(id);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadPGDetails(id: string): void {
    this.loading = true;
    this.error = null;
    
    this.pgService.getPGById(id).subscribe(
      (pg) => {
        this.pg = pg;
        this.loading = false;
        
        if (pg.mapEmbedUrl) {
          this.sanitizedMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(pg.mapEmbedUrl);
        }
      },
      (error) => {
        console.error('Error loading PG details:', error);
        this.error = 'Failed to load PG details. Please try again later.';
        this.loading = false;
        this.snackBar.open('Failed to load PG details', 'Close', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    );
  }

  nextImage(): void {
    if (this.pg && this.pg.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.pg.images.length;
    }
  }

  prevImage(): void {
    if (this.pg && this.pg.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex - 1 + this.pg.images.length) % this.pg.images.length;
    }
  }

  goToImage(index: number): void {
    if (this.pg && index >= 0 && index < this.pg.images.length) {
      this.currentImageIndex = index;
    }
  }

  getCurrentImageUrl(): string {
    if (this.pg && this.pg.images && this.pg.images.length > 0) {
      return this.pg.images[this.currentImageIndex];
    }
    return 'https://via.placeholder.com/800x400?text=No+Image+Available';
  }
}
