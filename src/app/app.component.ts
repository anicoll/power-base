import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BatteryBarChartComponent } from "./battery/battery-bar-chart.component";
import { InverterComponent } from "./inverter/inverter.component";
import { DataService } from './shared/data.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BatteryBarChartComponent, InverterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Power Base';
  data: any;




  constructor(private dataService: DataService) {
    this.fetchData();
  }
  fetchData() {
    this.data = this.dataService.getData();
    console.log("retrieved data")
  }
}
