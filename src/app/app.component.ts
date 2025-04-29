import { Component, OnInit, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BatteryBarComponent } from './battery-bar/battery-bar.component';
import { GaugeComponent } from './gauge/gauge.component';
import { HomeUsageComponent } from './home-usage/home-usage.component';
import { InverterComponent } from './inverter/inverter.component';
import { DataService } from './shared/data.service';
import { interval, Observable, Subscription, switchMap } from 'rxjs';
import { Property } from './model/property.model';
import { Gauge } from './model/gauge.model';
import { LineGraphComponent } from './line-graph/line-graph.component';
import { AmberPrice } from './model/amber.model';
import { LineGraph } from './model/line-graph.model';

function getTimeString(days: number = 0): string {
  const date = new Date();
  if (days !== 0) {
    date.setDate(date.getDate() + days);
  }

  return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss'Z'", 'en-AU', 'UTC');
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    BatteryBarComponent,
    InverterComponent,
    HomeUsageComponent,
    GaugeComponent,
    LineGraphComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  private inverterSub: Subscription | undefined;
  private pricesSub: Subscription | undefined;
  batterySoc: Gauge = new Gauge();
  batteryCharge: Gauge = new Gauge();
  solarGeneration: Gauge = new Gauge();
  priceGraph: LineGraph = new LineGraph();
  title = 'Power Base';
  properties: Array<Property> = [];
  amberPrices: Array<any> = [];

  constructor(private dataService: DataService) {
    this.fetchInverterData().subscribe({
      next: (data) => {
        this.properties = data;
        this.setupGauges(data);
      },
      error: (err) => console.error('Error fetching properties:', err),
    });
    this.fetchAmberPrices().subscribe({
      next: (data) => {
        this.amberPrices = data;
        this.priceGraph = buildLineGraphPrices(data)
      },
      error: (err) => console.error('Error fetching amber prices:', err),
    });
  }

  setupGauges(data: Array<Property>): void {
    var batteryChargeProps: Array<Property> = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === 'battery_level_soc') {
        this.buildBatterySOCGauge(data[i]);
        continue;
      }
      if (
        data[i].slug === 'battery_charging_power' ||
        data[i].slug === 'battery_discharging_power'
      ) {
        batteryChargeProps.push(data[i]);
        if (batteryChargeProps.length === 2) {
          this.buildBatteryChargeGauge(batteryChargeProps);
          continue;
        }
        continue;
      }
      if (data[i].slug === 'total_dc_power') {
        this.buildSolarGeneration(data[i]);
        continue;
      }
    }
  }

  ngOnInit(): void {
    this.inverterSub = interval(10000)
      .pipe(switchMap(() => this.fetchInverterData()))
      .subscribe({
        next: (data) => {
          this.properties = data;
          this.setupGauges(data);
        },
        error: (err) => console.error('Error fetching properties:', err),
      });

    this.pricesSub = interval(10000 * 6) // every minute as these dont change often.
      .pipe(switchMap(() => this.fetchAmberPrices()))
      .subscribe({
        next: (data) => {
          this.amberPrices = data;
          this.priceGraph = buildLineGraphPrices(data)
        },
        error: (err) => console.error('Error fetching properties:', err),
      });
  }

  ngOnDestroy(): void {
    if (this.inverterSub) {
      this.inverterSub.unsubscribe();
    }
  }

  fetchInverterData(): Observable<Array<Property>> {
    return this.dataService.getInverterProperties();
  }

  fetchAmberPrices(): Observable<Array<AmberPrice>> {
    return this.dataService.getAmberPrices(getTimeString(-1), getTimeString(1));
  }

  buildBatterySOCGauge(prop: Property): void {
    const updatedGauge = new Gauge();
    updatedGauge.gaugeType = 'full';
    updatedGauge.gaugeValue = parseFloat(prop.value);
    updatedGauge.gaugeMin = 0;
    updatedGauge.gaugeMax = 100;
    updatedGauge.gaugeLabel = 'Battery SOC';
    updatedGauge.gaugeAppendText = prop.unit_of_measurement;
    updatedGauge.gaugeThresholds = {
      '0': { color: 'red', bgOpacity: 0.3 },
      '40': { color: 'orange', bgOpacity: 0.3 },
      '70': { color: 'green', bgOpacity: 0.3 },
    };
    this.batterySoc = updatedGauge;
  }

  buildSolarGeneration(prop: Property): void {
    const updatedGauge = new Gauge();
    updatedGauge.gaugeType = 'semi';
    updatedGauge.gaugeValue = parseFloat(prop.value);
    updatedGauge.gaugeMin = 0;
    updatedGauge.gaugeMax = 7;
    updatedGauge.gaugeLabel = 'Solar Generation';
    updatedGauge.gaugeAppendText = prop.unit_of_measurement;
    updatedGauge.gaugeThresholds = {
      '0': { color: 'red' },
      '40': { color: 'orange' },
      '70': { color: 'green' },
    };
    this.solarGeneration = updatedGauge;
  }

  buildBatteryChargeGauge(props: Array<Property>): void {
    const updatedGauge = new Gauge();
    for (let i = 0; i < props.length; i++) {
      var v = props[i].value;
      if (props[i].slug === 'battery_discharging_power') {
        updatedGauge.gaugeValue += -1 * parseFloat(props[i].value);
      } else updatedGauge.gaugeValue += parseFloat(props[i].value);
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
function buildLineGraphPrices(prices: Array<AmberPrice>): LineGraph {

  const updates = new LineGraph();
  updates.type = "bar"
  updates.title = 'Amber Prices';
  prices = prices.sort((a, b) => {
    return new Date(a.startTime) > new Date(b.startTime) ? 1 : -1;
  });
  var generalPrices = prices.filter((price) => {
    if (price.channelType === 'general') {
      return price;
    } return
  });
  var feedinPrices = prices.filter((price) => {
    if (price.channelType === 'feedIn') {
      return price;
    } return
  });



  updates.series = [
    {
      name: 'Amber General Prices',
      data: generalPrices.map((price) => {
        return Math.round(price.perKwh) / 100
      }),
    },
  ];
  updates.series.push({
    name: 'Amber Feedin Prices',
    data: feedinPrices.map((price) => {
      return Math.round(price.perKwh * -1) / 100
    }),
  });
  updates.xaxis = {
    type: 'datetime',
    categories: generalPrices.map((price) => {
      return price.startTime
    }),
  }


  return updates

}
