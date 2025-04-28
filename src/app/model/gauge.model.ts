export type NgxGaugeType = 'full' | 'arch' | 'semi'; // this is REQUIRED because the library fails to compile if just string is used.

export class Gauge {
  gaugeType: NgxGaugeType = 'semi';
  gaugeValue: number = 0;
  gaugeLabel: string = '';
  gaugeAppendText: string = '';
  gaugeMin: number = 0;
  gaugeMax: number = 100;
  gaugeThick: number = 20;
  gaugeMarkers: {} = {};
  gaugeThresholds: { [key: string]: { color: string; bgOpacity?: number } } =
    {};
}
