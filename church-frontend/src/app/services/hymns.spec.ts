import { TestBed } from '@angular/core/testing';

import { Hymns } from './hymns';

describe('Hymns', () => {
  let service: Hymns;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Hymns);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
