import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BatteryBarComponent } from './battery-bar/battery-bar.component';
import { GaugeComponent } from './gauge/gauge.component';
import { HomeUsageComponent } from './home-usage/home-usage.component';
import { InverterComponent } from './inverter/inverter.component';
import { DataService } from './shared/data.service';
import { interval, Observable, Subscription, switchMap } from 'rxjs';
import { Property } from './model/property.model';
import { Gauge } from './model/gauge.model';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    BatteryBarComponent,
    InverterComponent,
    HomeUsageComponent,
    GaugeComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private pollingSubscription: Subscription | undefined;
  batterySoc: Gauge = new Gauge();
  batteryCharge: Gauge = new Gauge();
  title = 'Power Base';
  data: Array<Property> = [];

  constructor(private dataService: DataService) {
    dataService.getData().subscribe({
      next: (data) => {
        this.data = data;
        this.setupGauges(this.data);
      },
    });
  }

  setupGauges(data: Array<Property>): void {
    var batteryChargeProps: Array<Property> = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === 'battery_level_soc') {
        this.buildBatterySOCGauge(data[i]);
        continue;
      }
      if (data[i].slug === 'battery_charging_power' || data[i].slug === 'battery_discharging_power') {
        batteryChargeProps.push(data[i]);
        if (batteryChargeProps.length === 2) {
          this.buildBatteryChargeGauge(batteryChargeProps);
          continue
        }
        continue;
      }
    }
  }

  ngOnInit(): void {
    this.pollingSubscription = interval(10000)
      .pipe(switchMap(() => this.fetchData()))
      .subscribe({
        next: (data) => {
          this.data = data;
          this.setupGauges(data);
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

  buildBatterySOCGauge(prop: Property): void {
    const updatedbatterySoc = new Gauge();
    updatedbatterySoc.gaugeType = 'full';
    updatedbatterySoc.gaugeValue = parseFloat(prop.value);
    updatedbatterySoc.gaugeMin = 0;
    updatedbatterySoc.gaugeMax = 100;
    updatedbatterySoc.gaugeLabel = 'Battery SOC %';
    updatedbatterySoc.gaugeThresholds = {
      '0': { color: 'red', bgOpacity: 0.3 },
      '40': { color: 'orange', bgOpacity: 0.3 },
      '70': { color: 'green', bgOpacity: 0.3 },
    };
    this.batterySoc = updatedbatterySoc;
  }

  buildBatteryChargeGauge(props: Array<Property>): void {
    const updatedGauge = new Gauge();
    for (let i = 0; i < props.length; i++) {
      var v = props[i].value;
      if (props[i].slug === 'battery_discharging_power') {
        updatedGauge.gaugeValue += (-1 * parseFloat(props[i].value));
      } else
        updatedGauge.gaugeValue += parseFloat(props[i].value);
    }

    updatedGauge.gaugeType = 'semi';
    updatedGauge.gaugeMin = -6.6;
    updatedGauge.gaugeMax = 6.6;
    updatedGauge.gaugeLabel = 'Battery Dis/Charge Power';
    updatedGauge.gaugeAppendText = 'KW';
    updatedGauge.gaugeThresholds = {
      '-6': { color: 'red', bgOpacity: 0.3 },
      '-3': { color: 'orange', bgOpacity: 0.3 },
      '-2.9': { color: 'green', bgOpacity: 0.3 },
      // '0': { color: 'green', bgOpacity: 0.3 },
      '3': { color: 'orange', bgOpacity: 0.3 },
      '6': { color: 'red', bgOpacity: 0.3 },
    };
    this.batteryCharge = updatedGauge;
  }
}

