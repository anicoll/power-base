import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../model/property.model';

@Component({
  selector: 'app-inverter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inverter.component.html',
  styleUrl: './inverter.component.css',
})
export class InverterComponent {
  @Input() data: Array<Property> = [];
  value: string = '0';
  unit: string = 'KWh';
  size: number = 100;

  ngOnChanges() {
    console.log('Data received in BatteryBarChartComponent');
    var res = this.getInverterOutput(this.data);
    this.value = res[0];
    this.unit = res[1];
  }

  getInverterOutput(data: Array<Property>): [string, string] {
    var dcPower: string = '0';
    var unit: string = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === 'total_dc_power') {
        dcPower = data[i].value;
        unit = data[i].unit_of_measurement;
        return [dcPower, unit];
      }
    }
    return ['0', 'w']; // Default value if not found
  }
}
