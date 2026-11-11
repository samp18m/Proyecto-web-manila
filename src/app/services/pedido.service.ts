import { Injectable } from '@angular/core';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly STORAGE_KEY = 'manila-pedido';

  private productos: Producto[] = this.cargarDesdeStorage();

  private cargarDesdeStorage(): Producto[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) as Producto[] : [];
    } catch {
      return [];
    }
  }

  private guardarEnStorage(): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.productos));
  }

  getProductos(): Producto[] {
    return this.productos.map(p => ({ ...p }));
  }

  agregarProducto(producto: Producto): void {
    const indice = this.productos.findIndex(
      p => p.id === producto.id && p.tipo === producto.tipo
    );

    if (indice >= 0) {
      this.productos[indice].cantidad += (producto.cantidad || 1);
    } else {
      this.productos.push({
        ...producto,
        cantidad: producto.cantidad || 1
      });
    }

    this.guardarEnStorage();
  }

  actualizarCantidad(id: string, tipo: string, cantidad: number): void {
    const indice = this.productos.findIndex(
      p => p.id === id && p.tipo === tipo
    );

    if (indice >= 0) {
      this.productos[indice].cantidad = cantidad;

      if (this.productos[indice].cantidad <= 0) {
        this.productos.splice(indice, 1);
      }

      this.guardarEnStorage();
    }
  }

  eliminarProducto(id: string, tipo: string): void {
    this.productos = this.productos.filter(
      p => !(p.id === id && p.tipo === tipo)
    );

    this.guardarEnStorage();
  }

  limpiarPedido(): void {
    this.productos = [];
    this.guardarEnStorage();
  }
}