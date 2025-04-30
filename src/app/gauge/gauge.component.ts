import { Component, SimpleChanges, OnChanges, Input } from '@angular/core';
import { NgxGaugeModule } from 'ngx-gauge';
import { Gauge, NgxGaugeType } from '../model/gauge.model';

@Component({
  selector: 'app-gauge',
  imports: [NgxGaugeModule],
  templateUrl: './gauge.component.html',
  styleUrls: ['./gauge.component.css'],
})
export class GaugeComponent implements OnChanges {
  @Input() data: Gauge = {} as Gauge;

  gaugeType: NgxGaugeType = 'full';
  gaugeValue: number = 0;
  gaugeLabel: string = '';
  gaugeAppendText: string = '';
  gaugeMin: number = 0;
  gaugeMax: number = 100;
  gaugeThick = 20;
  gaugeMarkers = {};
  gaugeThresholds: { [key: string]: { color: string; bgOpacity?: number } } =
    {};

  ngOnChanges(changes: SimpleChanges) {
    console.log('Data received in GaugeComponent');
    if (changes['data'] && changes['data'].currentValue) {
      const newData = changes['data'].currentValue;
      this.gaugeValue = newData.gaugeValue || 0;
      this.gaugeLabel = newData.gaugeLabel || '';
      this.gaugeAppendText = newData.gaugeAppendText || '';
      this.gaugeMin = newData.gaugeMin || 0;
      this.gaugeMax = newData.gaugeMax || 100;
      this.gaugeThick = newData.gaugeThick || 20;
      this.gaugeMarkers = newData.gaugeMarkers || {};
      this.gaugeThresholds = newData.gaugeThresholds || {};
      this.gaugeType = newData.gaugeType || 'full';
    }
  }
}
