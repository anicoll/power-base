import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeUsageComponent } from './home-usage.component';

describe('HomeUsageComponent', () => {
  let component: HomeUsageComponent;
  let fixture: ComponentFixture<HomeUsageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeUsageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
