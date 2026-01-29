import { TestBed } from '@angular/core/testing';

import { OptometristService } from './optometrist.service';

describe('OptometristService', () => {
  let service: OptometristService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OptometristService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
