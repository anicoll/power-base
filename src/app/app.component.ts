import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BatteryBarChartComponent } from "./battery/battery-bar-chart.component";
import { InverterComponent } from "./inverter/inverter.component";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BatteryBarChartComponent, InverterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'Power Base';

  private http = inject(HttpClient);

  constructor() {
    this.getData();
  }
  getData() {
    // this.http.get('https://jsonplaceholder.typicode.com/todos/1').subscribe((response) => console.log(response));
  }
}
