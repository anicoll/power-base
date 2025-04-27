import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Property } from '../model/property.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  data: Array<Property> = [];

  constructor(private http: HttpClient) {}

  getData(): Observable<Array<Property>> {
    return this.http.get<Array<Property>>('http://localhost:8000/properties');
  }
}
