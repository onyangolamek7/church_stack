import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tithe } from './tithe';

describe('Tithe', () => {
  let component: Tithe;
  let fixture: ComponentFixture<Tithe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tithe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tithe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
