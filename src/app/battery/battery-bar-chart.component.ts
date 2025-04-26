import { Component, Input, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-battery-bar-chart',
  imports: [CommonModule],
  templateUrl: './battery-bar-chart.component.html',
  styleUrl: './battery-bar-chart.component.css',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BatteryBarChartComponent implements OnInit, OnDestroy {
  percentage: number = 100;
  private pollingSubscription: Subscription | undefined;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(5000).pipe(
      switchMap(() => this.http.get('http://localhost:3000/battery'))
    ).subscribe({
      next: (data) => {
        console.log(data)
        // if (data.level !== undefined) {
        //   this.percentage = data.level;
        // } else {
        //   console.error('Invalid data format from server:', data);
        // }
      },
      error: (err) => console.error('Error fetching battery level:', err)
    });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  get barStyle() {
    let backgroundColor = 'green';
    if (this.percentage < 20) {
      backgroundColor = 'red';
    } else if (this.percentage <= 50) {
      backgroundColor = 'orange';
    }
    return { 'background-color': backgroundColor };
  }
}
