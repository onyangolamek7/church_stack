import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TitheHistory } from './tithe-history';

describe('TitheHistory', () => {
  let component: TitheHistory;
  let fixture: ComponentFixture<TitheHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TitheHistory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TitheHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
