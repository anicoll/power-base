import { Component, ViewChild } from '@angular/core';
import {
  NgApexchartsModule,
  ApexTitleSubtitle,
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexYAxis,
  ApexStroke,
  ApexXAxis,
  ApexTooltip,
} from 'ng-apexcharts';

@Component({
  selector: 'app-line-graph',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './line-graph.component.html',
  styleUrl: './line-graph.component.css',
})
export class LineGraphComponent {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions: {
    series: ApexAxisChartSeries;
    chart: ApexChart;
    xaxis: ApexXAxis;
    stroke: ApexStroke;
    tooltip: ApexTooltip;
    dataLabels: ApexDataLabels;
    title: ApexTitleSubtitle;
    yaxis: ApexYAxis;
  };

  constructor() {
    this.chartOptions = {
      yaxis: {},
      chart: {
        height: 350,
        type: 'line',
        toolbar: {
          show: false,
        },
      },
      series: [
        {
          name: 'Sample Data',
          data: [30, 40, 35, 50, 49, 60, 70],
        },
      ],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth',
      },
      xaxis: {
        type: 'datetime',
        categories: [
          '2018-09-19T00:00:00.000Z',
          '2018-09-19T01:30:00.000Z',
          '2018-09-19T02:30:00.000Z',
          '2018-09-19T03:30:00.000Z',
          '2018-09-19T04:30:00.000Z',
          '2018-09-19T05:30:00.000Z',
          '2018-09-19T06:30:00.000Z',
        ],
      },
      title: {
        text: 'Line Graph',
        align: 'left',
      },
      tooltip: {
        x: {
          format: 'dd/MM/yy HH:mm',
        },
      },
    };
  }
}
