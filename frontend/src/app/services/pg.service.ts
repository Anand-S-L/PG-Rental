import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PG, PGFilter } from '../models/pg.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PgService {
  private apiUrl = `${environment.apiUrl}/api/pgs`;

  constructor(private http: HttpClient) { }

  // Get all PGs with optional filtering
  getPGs(filter?: PGFilter): Observable<PG[]> {
    let url = this.apiUrl;
    
    if (filter) {
      const params = new URLSearchParams();
      
      if (filter.location) {
        params.append('location', filter.location);
      }
      
      if (filter.minPrice) {
        params.append('minPrice', filter.minPrice.toString());
      }
      
      if (filter.maxPrice) {
        params.append('maxPrice', filter.maxPrice.toString());
      }
      
      if (filter.roomType) {
        params.append('roomType', filter.roomType);
      }
      
      if (filter.amenities && filter.amenities.length > 0) {
        filter.amenities.forEach(amenity => {
          params.append('amenities', amenity);
        });
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }
    
    return this.http.get<PG[]>(url);
  }

  // Get a single PG by ID
  getPGById(id: string): Observable<PG> {
    return this.http.get<PG>(`${this.apiUrl}/${id}`);
  }

  // Create a new PG
  createPG(pg: PG): Observable<PG> {
    return this.http.post<PG>(this.apiUrl, pg);
  }

  // Update an existing PG
  updatePG(id: string, pg: PG): Observable<PG> {
    return this.http.put<PG>(`${this.apiUrl}/${id}`, pg);
  }

  // Delete a PG
  deletePG(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
