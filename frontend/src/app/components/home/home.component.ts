import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PgService } from '../../services/pg.service';
import { PG, PGFilter } from '../../models/pg.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  pgs: PG[] = [];
  loading: boolean = true;
  error: string | null = null;
  
  // Filter options
  locations: string[] = [];
  amenities: string[] = [];
  roomTypes: string[] = [];
  
  filterForm: FormGroup;
  
  constructor(
    private pgService: PgService,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.formBuilder.group({
      location: [''],
      minPrice: [''],
      maxPrice: [''],
      roomType: [''],
      amenities: [[]]
    });
  }

  ngOnInit(): void {
    this.loadPGs();
  }

  loadPGs(filter?: PGFilter): void {
    this.loading = true;
    this.error = null;
    
    this.pgService.getPGs(filter).subscribe(
      (pgs) => {
        this.pgs = pgs;
        this.extractFilterOptions(pgs);
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

  applyFilters(): void {
    const filter: PGFilter = {};
    const formValue = this.filterForm.value;
    
    if (formValue.location) {
      filter.location = formValue.location;
    }
    
    if (formValue.minPrice) {
      filter.minPrice = +formValue.minPrice;
    }
    
    if (formValue.maxPrice) {
      filter.maxPrice = +formValue.maxPrice;
    }
    
    if (formValue.roomType) {
      filter.roomType = formValue.roomType;
    }
    
    if (formValue.amenities && formValue.amenities.length > 0) {
      filter.amenities = formValue.amenities;
    }
    
    this.loadPGs(filter);
  }

  resetFilters(): void {
    this.filterForm.reset({
      location: '',
      minPrice: '',
      maxPrice: '',
      roomType: '',
      amenities: []
    });
    this.loadPGs();
  }

  private extractFilterOptions(pgs: PG[]): void {
    // Extract unique locations
    this.locations = [...new Set(pgs.map(pg => pg.location))];
    
    // Extract unique amenities
    const allAmenities = pgs.flatMap(pg => pg.amenities);
    this.amenities = [...new Set(allAmenities)];
    
    // Extract unique room types
    const allRoomTypes = pgs.flatMap(pg => pg.roomTypes.map(room => room.type));
    this.roomTypes = [...new Set(allRoomTypes)];
  }
}
