import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import {
  formatDate,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  PopStateEvent,
} from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import PerfectScrollbar from 'perfect-scrollbar';
import $ from 'jquery';
import { filter, interval, Observable, Subscription, switchMap } from 'rxjs';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { DataService } from '../../shared/data.service';
import { Gauge } from '../../model/gauge.model';
import { LineGraph } from '../../model/line-graph.model';
import { Property } from '../../model/property.model';
import { AmberPrice } from '../../model/amber.model';

// import { formatDate } from '@angular/common';
// import { RouterOutlet } from '@angular/router';
// import { GaugeComponent } from './gauge/gauge.component';
// import { DataService } from './shared/data.service';
// import { interval, Observable, Subscription, switchMap } from 'rxjs';
// import { LineGraphComponent } from './line-graph/line-graph.component';
// import { Property } from './model/property.model';
// import { Gauge } from './model/gauge.model';
// import { AmberPrice } from './model/amber.model';
// import { LineGraph } from './model/line-graph.model';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
  standalone: false,
})
export class AdminLayoutComponent implements OnInit {
  private _router: Subscription = new Subscription();
  private lastPoppedUrl: string | undefined;
  private yScrollStack: number[] = [];
  private inverterSub: Subscription | undefined;
  private pricesSub: Subscription | undefined;
  batterySoc: Gauge = new Gauge();
  batteryCharge: Gauge = new Gauge();
  solarGeneration: Gauge = new Gauge();
  powerDischarge: Gauge = new Gauge();
  homeUsage: Gauge = new Gauge();

  priceGraph: LineGraph = new LineGraph();
  forecastPriceGraph: LineGraph = new LineGraph();
  title = 'Power Base';

  constructor(
    public location: Location,
    private router: Router,
  ) {}

  ngOnInit() {
    const isWindows = navigator.platform.indexOf('Win') > -1 ? true : false;

    if (
      isWindows &&
      !document
        .getElementsByTagName('body')[0]
        .classList.contains('sidebar-mini')
    ) {
      // if we are on windows OS we activate the perfectScrollbar function

      document
        .getElementsByTagName('body')[0]
        .classList.add('perfect-scrollbar-on');
    } else {
      document
        .getElementsByTagName('body')[0]
        .classList.remove('perfect-scrollbar-off');
    }
    const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
    const elemSidebar = <HTMLElement>(
      document.querySelector('.sidebar .sidebar-wrapper')
    );

    this.location.subscribe((ev: PopStateEvent) => {
      this.lastPoppedUrl = ev.url;
    });
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationStart) {
        if (event.url != this.lastPoppedUrl)
          this.yScrollStack.push(window.scrollY);
      } else if (event instanceof NavigationEnd) {
        if (event.url == this.lastPoppedUrl) {
          this.lastPoppedUrl = undefined;
          window.scrollTo(0, this.yScrollStack.pop() || 0);
        } else window.scrollTo(0, 0);
      }
    });
    this._router = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        elemMainPanel.scrollTop = 0;
        elemSidebar.scrollTop = 0;
      });
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      let ps = new PerfectScrollbar(elemMainPanel);
      ps = new PerfectScrollbar(elemSidebar);
    }
  }

  ngOnDestroy(): void {
    if (this.inverterSub) {
      this.inverterSub.unsubscribe();
    }
    if (this.pricesSub) {
      this.pricesSub.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.runOnRouteChange();
  }

  runOnRouteChange(): void {
    if (window.matchMedia(`(min-width: 960px)`).matches && !this.isMac()) {
      const elemMainPanel = <HTMLElement>document.querySelector('.main-panel');
      const ps = new PerfectScrollbar(elemMainPanel);
      ps.update();
    }
  }
  isMac(): boolean {
    let bool = false;
    if (
      navigator.platform.toUpperCase().indexOf('MAC') >= 0 ||
      navigator.platform.toUpperCase().indexOf('IPAD') >= 0
    ) {
      bool = true;
    }
    return bool;
  }
}
