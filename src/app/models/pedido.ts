import { Producto } from './producto';
import { Cliente } from './cliente';

export interface Pedido {
  id: number;
  cliente: Cliente;
  productos: Producto[];
  total: number;
  fecha: Date;
}