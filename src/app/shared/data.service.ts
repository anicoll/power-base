import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../model/property.model';
import { AmberPrice } from '../model/amber.model';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}

  getInverterProperties(): Observable<Array<Property>> {
    return this.http.get<Array<Property>>(
      'http://192.168.10.18:8000/properties',
    );
  }

  getAmberPrices(from: string, to: string): Observable<Array<AmberPrice>> {
    return this.http.get<Array<AmberPrice>>(
      `http://192.168.10.18:8000/amber/prices/${from}/${to}`,
    );
  }
}
