import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  private productListRefreshSource = new Subject<void>();

  productListRefresh$ = this.productListRefreshSource.asObservable();

  triggerProductListRefresh() {
    this.productListRefreshSource.next();
  }
}
