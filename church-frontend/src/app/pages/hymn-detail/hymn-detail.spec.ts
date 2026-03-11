import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HymnDetail } from './hymn-detail';

describe('HymnDetail', () => {
  let component: HymnDetail;
  let fixture: ComponentFixture<HymnDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HymnDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HymnDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
