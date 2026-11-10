import { Routes } from '@angular/router';
import { Inicio } from './pages/inicio/inicio';
import { Comidas } from './pages/comidas/comidas';
import { Bebidas } from './pages/bebidas/bebidas';
import { Pedidos } from './pages/pedidos/pedidos';
import { Juego } from './pages/juego/juego';

export const routes: Routes = [
  { path: '', component: Inicio },
  { path: 'comidas', component: Comidas },
  { path: 'bebidas', component: Bebidas },
  { path: 'pedidos', component: Pedidos },
  { path: 'juego', component: Juego },
  { path: '**', redirectTo: '' }
];