import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
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
import { LineGraph } from '../model/line-graph.model';

@Component({
  selector: 'app-line-graph',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './line-graph.component.html',
  styleUrl: './line-graph.component.css',
})

export class LineGraphComponent implements OnChanges {
  @Input() data: LineGraph = new LineGraph();
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
    this.chartOptions = newChartOptions(this.data);
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('Data received in LineGraphComponent', changes['data']);
    if (changes['data'] && changes['data'].currentValue) {
      const newData = changes['data'].currentValue;
      this.chartOptions = newChartOptions(newData);
    }
  }
}


function newChartOptions(data: LineGraph): {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
  dataLabels: ApexDataLabels;
  title: ApexTitleSubtitle;
  yaxis: ApexYAxis;
} {
  return {
    yaxis: {},
    chart: {
      height: 350,
      type: data.type,
      toolbar: {
        show: false,
      },
    },
    series: data.series,
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: 'smooth',
    },
    xaxis: data.xaxis,
    title: {
      text: data.title,
      align: 'left',
    },
    tooltip: {
      x: {
        format: 'dd/MM/yy HH:mm',
      },
    },
  };
}