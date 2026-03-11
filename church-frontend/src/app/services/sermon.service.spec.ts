import { TestBed } from '@angular/core/testing';

import { SermonService } from './sermon.service';

describe('SermonService', () => {
  let service: SermonService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SermonService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
