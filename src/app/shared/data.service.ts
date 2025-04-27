import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Property } from '../model/property.model';


@Injectable({
  providedIn: 'root',
})

export class DataService {
  private pollingSubscription: Subscription | undefined;
  data: Array<Property> = [];

  constructor(private http: HttpClient) {
    this.http.get<Array<Property>>('http://localhost:8000/properties').subscribe
      ({
        next: (data) => {
          this.data = data
        },
        error: (err) => console.error('Error fetching properties:', err)
      });

  }

  ngOnInit(): void {
    this.pollingSubscription = interval(10000).pipe(
      switchMap(() => this.http.get<Array<Property>>('http://localhost:8000/properties'))
    ).subscribe({
      next: (data) => {
        this.data = data
      },
      error: (err) => console.error('Error fetching properties:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  getData(): Array<Property> {
    return this.data
  }
}

