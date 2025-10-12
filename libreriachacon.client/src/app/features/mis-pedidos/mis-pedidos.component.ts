// En features/mis-pedidos/mis-pedidos.component.ts
import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../core/models/pedido.model';
import { PedidoService } from '../../core/services/pedido.service';

// --- Imports de Standalone ---
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-mis-pedidos',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatIconModule, MatCardModule],
  templateUrl: './mis-pedidos.component.html',
  styleUrls: ['./mis-pedidos.component.css']
})
export class MisPedidosComponent implements OnInit {

  pedidos: Pedido[] = [];

  constructor(private pedidoService: PedidoService) { }

  ngOnInit(): void {
    this.pedidoService.getMisPedidos().subscribe(data => {
      this.pedidos = data;
    });
  }
}
