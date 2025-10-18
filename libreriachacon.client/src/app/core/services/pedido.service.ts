import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CartItem } from '../models/cart-item.model';
import { Pedido } from '../models/pedido.model'; 


@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private apiUrl = '/api/pedidos';

  constructor(private http: HttpClient) { }

  crearPedido(items: CartItem[]): Observable<any> {
    // Mapeamos los items del carrito al formato que espera el DTO del backend
    const pedidoDto = {
      items: items.map(item => ({
        productoId: item.producto.id,
        cantidad: item.cantidad
      }))
    };
    return this.http.post(this.apiUrl, pedidoDto);
  }
  getMisPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiUrl}/mis-pedidos`);
  }
  // Obtiene TODOS los pedidos (para Admin/Operador)
  getAllPedidos(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  // Actualiza el estado de un pedido
  updatePedidoStatus(pedidoId: number, nuevoEstado: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${pedidoId}/estado`, { estado: nuevoEstado });
  }

  getFacturaPdf(pedidoId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${pedidoId}/factura`, { responseType: 'blob' });
  }
}
