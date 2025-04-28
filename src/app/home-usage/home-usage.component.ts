import { Component, Input } from '@angular/core';
import { Property } from '../model/property.model';

@Component({
  selector: 'app-home-usage',
  imports: [],
  templateUrl: './home-usage.component.html',
  styleUrl: './home-usage.component.css',
})
export class HomeUsageComponent {
  @Input() data: Array<Property> = [];
  value: string = '0';
  unit: string = 'KWh';
  size: number = 100;

  ngOnChanges() {
    console.log('Data received in HomeUsageComponent');
    var res = this.getHomeUsage(this.data);
    this.value = res[0];
    this.unit = res[1];
  }

  getHomeUsage(data: Array<Property>): [string, string] {
    var dcPower: string = '0';
    var unit: string = '';
    for (let i = 0; i < data.length; i++) {
      if (data[i].slug === 'total_load_active_power') {
        dcPower = data[i].value;
        unit = data[i].unit_of_measurement;
        return [dcPower, unit];
      }
    }
    return ['0', 'w']; // Default value if not found
  }
}
