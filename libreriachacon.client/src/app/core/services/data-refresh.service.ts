// En src/app/core/services/data-refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataRefreshService {
  // Un 'Subject' es como un canal de radio. Podemos enviar mensajes a través de él.
  private productListRefreshSource = new Subject<void>();

  // Exponemos el canal como un Observable para que los componentes puedan "sintonizarlo".
  productListRefresh$ = this.productListRefreshSource.asObservable();

  // Método que los componentes usarán para "emitir" una notificación de actualización.
  triggerProductListRefresh() {
    this.productListRefreshSource.next();
  }
}
