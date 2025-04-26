import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inverter',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inverter.component.html',
  styleUrl: './inverter.component.css'
})
export class InverterComponent {
  value: string = "1.1";
  unit: string = "KWh";
  size: number = 100;

}
