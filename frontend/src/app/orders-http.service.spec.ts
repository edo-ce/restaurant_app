import { TestBed } from '@angular/core/testing';

import { OrdersHttpService } from './orders-http.service';

describe('OrdersHttpService', () => {
  let service: OrdersHttpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdersHttpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
