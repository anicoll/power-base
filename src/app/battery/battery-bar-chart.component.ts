import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../model/property.model';

@Component({
  selector: 'app-battery-bar-chart',
  imports: [CommonModule],
  templateUrl: './battery-bar-chart.component.html',
  styleUrl: './battery-bar-chart.component.css',
})
export class BatteryBarChartComponent {
  @Input() data: Array<Property> = [];
  percentage: number = 100;

  constructor() { }

  ngOnChanges() {
    console.log('Data received in BatteryBarChartComponent:', this.data);
    this.percentage = this.getBatteryPercentage(this.data);
  }

  getBatteryPercentage(data: Array<Property>): number {
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === "battery_level_soc") {
        return parseFloat(data[i].value);
      }
    }
    return 0; // Default value if not found
  }



}
