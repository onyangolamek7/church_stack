import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Hymns } from './hymns';

describe('Hymns', () => {
  let component: Hymns;
  let fixture: ComponentFixture<Hymns>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Hymns]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Hymns);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
