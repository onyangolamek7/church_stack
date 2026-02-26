import { TestBed } from '@angular/core/testing';

import { Tithe } from './tithe';

describe('Tithe', () => {
  let service: Tithe;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Tithe);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
