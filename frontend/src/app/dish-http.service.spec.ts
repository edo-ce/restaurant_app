import { TestBed } from '@angular/core/testing';

import { DishHttpService } from './dish-http.service';

describe('DishHttpService', () => {
  let service: DishHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DishHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
