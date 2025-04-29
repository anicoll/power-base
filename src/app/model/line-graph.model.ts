import { ChartType } from 'ng-apexcharts';

export class LineGraph {

  type: ChartType = 'line';
  title: string = 'default title';
  series: ApexAxisChartSeries = [];
  xaxis: ApexXAxis = {};
}
