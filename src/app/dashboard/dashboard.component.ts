import { Component, OnDestroy, OnInit } from '@angular/core';
import { interval, Observable, Subscription, switchMap } from 'rxjs';
import { Gauge } from '../model/gauge.model';
import { DataService } from '../shared/data.service';
import { Property } from '../model/property.model';
import { AmberPrice } from '../model/amber.model';
import { formatDate } from '@angular/common';
import { ChartEvent, Configuration } from 'ng-chartist';
import { BarChartData, BarChartOptions, Interpolation } from 'chartist';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private inverterSub: Subscription | undefined;
  private pricesSub: Subscription | undefined;
  batterySoc: Gauge = new Gauge();
  batteryCharge: Gauge = new Gauge();
  solarGeneration: Gauge = new Gauge();
  powerDischarge: Gauge = new Gauge();
  homeUsage: Gauge = new Gauge();

  chartEvents: ChartEvent = {
    draw: (data: any) => {
      data.element.animate({
        y2: <any>{
          dur: '0.5s',
          from: data.y1,
          to: data.y2,
          easing: 'easeOutQuad',
        },
      });
    },
  };

  priceGraph: Configuration & { title?: string } = {} as Configuration & {
    title?: string;
  };
  forecastPriceGraph: Configuration & { title?: string } =
    {} as Configuration & { title?: string };

  currentPrice: string = '';

  constructor(private dataService: DataService) {}
  ngOnDestroy(): void {
    if (this.inverterSub !== undefined) {
      this.inverterSub.unsubscribe();
    }
    if (this.pricesSub !== undefined) {
      this.pricesSub.unsubscribe();
    }
  }

  fetchInverterData(): Observable<Array<Property>> {
    return this.dataService.getInverterProperties();
  }

  fetchAmberPrices(): Observable<Array<AmberPrice>> {
    return this.dataService.getAmberPrices(getTimeString(-1), getTimeString(1));
  }

  setupGauges(data: Array<Property>): void {
    var batteryChargeProps: Array<Property> = [];
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === 'battery_level_soc') {
        this.batterySoc = buildBatterySOCGauge(data[i]);
        continue;
      }
      if (
        data[i].slug === 'battery_charging_power' ||
        data[i].slug === 'battery_discharging_power'
      ) {
        batteryChargeProps.push(data[i]);
        if (batteryChargeProps.length === 2) {
          this.batteryCharge = buildBatteryChargeGauge(batteryChargeProps);
          continue;
        }
        continue;
      }
      if (data[i].slug === 'total_active_power') {
        this.solarGeneration = buildSolarGeneration(data[i]);
        continue;
      }
      if (data[i].slug === 'total_active_power') {
        this.solarGeneration = buildSolarGeneration(data[i]);
        continue;
      }
      if (data[i].slug === 'total_export_active_power') {
        this.powerDischarge = buildPowerDischarge(data[i]);
        continue;
      }
      if (data[i].slug === 'total_load_active_power') {
        this.homeUsage = buildHomeUsage(data[i]);
        continue;
      }
    }
  }

  ngOnInit() {
    // ////////
    this.fetchInverterData().subscribe({
      next: (data) => {
        this.setupGauges(data);
      },
      error: (err) => console.error('Error fetching properties:', err),
    });
    this.fetchAmberPrices().subscribe({
      next: (data) => {
        this.priceGraph = buildPriceGraph(data, 'Current Prices');
        this.forecastPriceGraph = buildPriceGraph(
          data,
          'Forcecast Prices',
          true,
        );
        this.currentPrice = getCurrentPrices(data);
      },
      error: (err) => console.error('Error fetching amber prices:', err),
    });

    /////////////
    this.inverterSub = interval(10000)
      .pipe(switchMap(() => this.fetchInverterData()))
      .subscribe({
        next: (data) => {
          this.setupGauges(data);
        },
        error: (err) => console.error('Error fetching properties:', err),
      });

    this.pricesSub = interval(10000 * 6) // every minute as these dont change often.
      .pipe(switchMap(() => this.fetchAmberPrices()))
      .subscribe({
        next: (data) => {
          this.priceGraph = buildPriceGraph(data, 'Current Prices');
          this.forecastPriceGraph = buildPriceGraph(
            data,
            'Forcecast Prices',
            true,
          );
          this.currentPrice = getCurrentPrices(data);
        },
        error: (err) => console.error('Error fetching properties:', err),
      });
  }
}

function buildBatterySOCGauge(prop: Property): Gauge {
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
  return updatedGauge;
}

function buildSolarGeneration(prop: Property): Gauge {
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
  return updatedGauge;
}

function buildPowerDischarge(prop: Property): Gauge {
  const updatedGauge = new Gauge();
  updatedGauge.gaugeType = 'semi';
  updatedGauge.gaugeValue = parseFloat(prop.value);
  updatedGauge.gaugeMin = 0;
  updatedGauge.gaugeMax = 7;
  updatedGauge.gaugeLabel = 'Export Power';
  updatedGauge.gaugeAppendText = prop.unit_of_measurement;

  return updatedGauge;
}

function buildHomeUsage(prop: Property): Gauge {
  const updatedGauge = new Gauge();
  updatedGauge.gaugeType = 'semi';
  updatedGauge.gaugeValue = parseFloat(prop.value);
  updatedGauge.gaugeMin = 0;
  updatedGauge.gaugeMax = 20;
  updatedGauge.gaugeLabel = 'Home Usage';
  updatedGauge.gaugeAppendText = prop.unit_of_measurement;

  return updatedGauge;
}

function buildBatteryChargeGauge(props: Array<Property>): Gauge {
  const updatedGauge = new Gauge();
  var isDischarging: boolean = false;
  for (let i = 0; i < props.length; i++) {
    var v = props[i].value;
    if (props[i].slug === 'battery_discharging_power') {
      if (v !== '0.0000') {
        isDischarging = true;
      }
    }
    updatedGauge.gaugeValue += parseFloat(v);
  }

  updatedGauge.gaugeType = 'semi';
  updatedGauge.gaugeMin = 0;
  updatedGauge.gaugeMax = 6.6;
  updatedGauge.gaugeLabel = isDischarging
    ? 'Battery Discharge Power'
    : 'Battery Charge Power';
  updatedGauge.gaugeAppendText = 'KW';
  updatedGauge.gaugeThresholds = {
    '0': { color: 'green', bgOpacity: 0.3 },
    '3': { color: 'orange', bgOpacity: 0.3 },
    '5': { color: 'red', bgOpacity: 0.3 },
  };
  return updatedGauge;
}

function getTimeString(days: number = 0): string {
  const date = new Date();
  if (days !== 0) {
    date.setDate(date.getDate() + days);
  }

  return formatDate(date, "yyyy-MM-dd'T'HH:mm:ss'Z'", 'en-AU', 'UTC');
}

function getCurrentPrices(data: AmberPrice[]): string {
  var feedinPrice: AmberPrice = {} as AmberPrice;
  var generalPrice: AmberPrice = {} as AmberPrice;
  const currentDate = new Date();
  data.forEach((price) => {
    const startTime = new Date(price.startTime);
    const endTime = new Date(price.endTime);
    if (startTime <= currentDate && endTime >= currentDate) {
      if (price.channelType === 'general') {
        generalPrice = price;
      } else if (price.channelType === 'feedIn') {
        feedinPrice = price;
      }
    }
  });

  return (
    Math.round(feedinPrice.perKwh * -1) +
    ' / ' +
    Math.round(generalPrice.perKwh)
  );
}

function buildPriceGraph(
  prices: Array<AmberPrice>,
  title: string,
  forecast: boolean = false,
): Configuration {
  var config: Configuration = {
    title: title,
    type: 'Bar',
    data: {} as BarChartData,
    options: {
      height: 400,
      axisX: {
        showGrid: false,
      },
      chartPadding: { top: 0, right: 0, bottom: 0, left: 0 },
      lineSmooth: Interpolation.cardinal({
        tension: 0,
      }),
    } as BarChartOptions,
  } as Configuration;

  var generalPrices = prices.filter((price) => {
    if (price.channelType === 'general' && price.forecast === forecast) {
      return price;
    }
    return;
  });
  var feedinPrices = prices.filter((price) => {
    if (price.channelType === 'feedIn' && price.forecast === forecast) {
      return price;
    }
    return;
  });

  generalPrices = generalPrices.sort((a, b) => {
    return new Date(a.startTime) > new Date(b.startTime) ? 1 : -1;
  });

  feedinPrices = feedinPrices.sort((a, b) => {
    return new Date(a.startTime) > new Date(b.startTime) ? 1 : -1;
  });
  // if (forecast) {
  //   generalPrices = generalPrices.slice(0, 24);
  //   feedinPrices = feedinPrices.slice(0, 24);
  // } else {
  //   generalPrices = generalPrices.slice(-24);
  //   feedinPrices = feedinPrices.slice(-24);
  // }

  config.data.series = [
    generalPrices.map((price) => {
      return Math.round(price.perKwh) / 100;
    }),
    feedinPrices.map((price) => {
      return Math.round(price.perKwh * -1) / 100;
    }),
  ];
  config.data.labels = generalPrices.map((price) => {
    var date = formatDate(
      price.startTime,
      'HH:mm',
      'en-AU',
      'Australia/Adelaide',
    );
    return date;
  });

  return config;
}
