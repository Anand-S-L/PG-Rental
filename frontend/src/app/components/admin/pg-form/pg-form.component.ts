import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PG, RoomType } from '../../../models/pg.model';

interface DialogData {
  mode: 'add' | 'edit';
  pg?: PG;
}

@Component({
  selector: 'app-pg-form',
  templateUrl: './pg-form.component.html',
  styleUrls: ['./pg-form.component.css']
})
export class PgFormComponent implements OnInit {
  pgForm: FormGroup;
  formTitle: string;
  isEditMode: boolean;
  
  // Common amenities for selection
  commonAmenities: string[] = [
    'WiFi', 'AC', 'TV', 'Geyser', 'Refrigerator', 'Washing Machine', 
    'Power Backup', 'Parking', 'Security', 'CCTV', 'Food', 'Gym',
    'Swimming Pool', 'Housekeeping', 'Laundry'
  ];
  
  // Common room types
  roomTypes: string[] = [
    'Single Room', 'Double Sharing', 'Triple Sharing', 'Four Sharing',
    'Deluxe Room', 'Premium Room', 'Studio Apartment'
  ];

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<PgFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.isEditMode = data.mode === 'edit';
    this.formTitle = this.isEditMode ? 'Edit PG' : 'Add New PG';
    
    this.pgForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      location: ['', Validators.required],
      address: ['', Validators.required],
      priceRange: ['', Validators.required],
      amenities: [[], Validators.required],
      roomTypes: this.fb.array([]),
      images: this.fb.array([this.createImageControl()]),
      mapEmbedUrl: [''],
      contactNumber: ['', Validators.pattern('^[0-9]{10}$')],
      contactEmail: ['', Validators.email]
    });
    
    // Add at least one room type by default
    this.addRoomType();
    
    if (this.isEditMode && data.pg) {
      this.populateForm(data.pg);
    }
  }

  ngOnInit(): void {
  }
  
  get roomTypesArray(): FormArray {
    return this.pgForm.get('roomTypes') as FormArray;
  }
  
  get imagesArray(): FormArray {
    return this.pgForm.get('images') as FormArray;
  }
  
  createRoomTypeControl(): FormGroup {
    return this.fb.group({
      type: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      availability: [0, [Validators.required, Validators.min(0)]],
      description: ['']
    });
  }
  
  createImageControl(): FormGroup {
    return this.fb.group({
      url: ['', Validators.required]
    });
  }
  
  addRoomType(): void {
    this.roomTypesArray.push(this.createRoomTypeControl());
  }
  
  removeRoomType(index: number): void {
    if (this.roomTypesArray.length > 1) {
      this.roomTypesArray.removeAt(index);
    }
  }
  
  addImage(): void {
    this.imagesArray.push(this.createImageControl());
  }
  
  removeImage(index: number): void {
    if (this.imagesArray.length > 1) {
      this.imagesArray.removeAt(index);
    }
  }
  
  populateForm(pg: PG): void {
    this.pgForm.patchValue({
      title: pg.title,
      description: pg.description,
      location: pg.location,
      address: pg.address,
      priceRange: pg.priceRange,
      amenities: pg.amenities,
      mapEmbedUrl: pg.mapEmbedUrl || '',
      contactNumber: pg.contactNumber || '',
      contactEmail: pg.contactEmail || ''
    });
    
    // Clear default room types and add from PG data
    this.roomTypesArray.clear();
    if (pg.roomTypes && pg.roomTypes.length > 0) {
      pg.roomTypes.forEach(roomType => {
        this.roomTypesArray.push(this.fb.group({
          type: [roomType.type, Validators.required],
          price: [roomType.price, [Validators.required, Validators.min(0)]],
          availability: [roomType.availability, [Validators.required, Validators.min(0)]],
          description: [roomType.description || '']
        }));
      });
    } else {
      this.addRoomType(); // Add default if none exists
    }
    
    // Clear default images and add from PG data
    this.imagesArray.clear();
    if (pg.images && pg.images.length > 0) {
      pg.images.forEach(imageUrl => {
        this.imagesArray.push(this.fb.group({
          url: [imageUrl, Validators.required]
        }));
      });
    } else {
      this.addImage(); // Add default if none exists
    }
  }
  
  onSubmit(): void {
    if (this.pgForm.valid) {
      const formValue = this.pgForm.value;
      
      // Transform image form array to array of URLs
      const images = formValue.images.map((image: { url: string }) => image.url);
      
      const pgData: PG = {
        ...formValue,
        images: images,
        id: this.isEditMode && this.data.pg ? this.data.pg.id : ''  // Keep ID for edit mode
      };
      
      this.dialogRef.close(pgData);
    } else {
      // Mark all fields as touched to trigger validation messages
      this.markFormGroupTouched(this.pgForm);
    }
  }
  
  // Helper method to mark all controls in a form group as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(control => {
          if (control instanceof FormGroup) {
            this.markFormGroupTouched(control);
          } else {
            control.markAsTouched();
          }
        });
      }
    });
  }
  
  onNoClick(): void {
    this.dialogRef.close();
  }
}
