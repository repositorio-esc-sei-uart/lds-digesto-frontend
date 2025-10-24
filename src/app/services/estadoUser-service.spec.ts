import { TestBed } from '@angular/core/testing';

import { EstadoUserService } from './estadoUser-service';

describe('EstadoService', () => {
  let service: EstadoUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstadoUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
