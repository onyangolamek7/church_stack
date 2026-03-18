import { TestBed } from '@angular/core/testing';

import { AuthIntializer } from './auth-intializer';

describe('AuthIntializer', () => {
  let service: AuthIntializer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthIntializer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
