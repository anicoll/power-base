import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BatteryBarChartComponent } from './battery/battery-bar-chart.component';
import {HomeUsageComponent} from "./home-usage/home-usage.component"
import { InverterComponent } from './inverter/inverter.component';
import { DataService } from './shared/data.service';
import { interval, Observable, Subscription, switchMap } from 'rxjs';
import { Property } from './model/property.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BatteryBarChartComponent, InverterComponent, HomeUsageComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private pollingSubscription: Subscription | undefined;

  title = 'Power Base';
  data: any;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.pollingSubscription = interval(10000)
      .pipe(switchMap(() => this.fetchData()))
      .subscribe({
        next: (data) => {
          this.data = data;
        },
        error: (err) => console.error('Error fetching properties:', err),
      });
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  fetchData(): Observable<Array<Property>> {
    return this.dataService.getData();
  }
}
