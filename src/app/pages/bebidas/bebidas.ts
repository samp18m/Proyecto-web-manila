import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bebidas.html',
  styleUrl: './bebidas.css'
})
export class Bebidas implements OnInit {
  busqueda = '';
  ingrediente = '';
  tipo = '';
  categoria = '';
  bebidas: any[] = [];
  cargando = false;
  mensaje = '';

  async ngOnInit() {
    this.cargarBebidas();
  }

  crearBebida(b: any) {
    return {
      ...b,
      precio: 8000 + Math.floor(Math.random() * 12000),
      ingredientes: [],
      mostrarIngredientes: false
    };
  }

  async consultar(url: string) {
    const res = await fetch(url);
    return await res.json();
  }

  async cargarBebidas() {
    this.cargando = true;
    this.mensaje = '';

    try {
      const url = 'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail';
      const datos = await this.consultar(url);
      this.bebidas = (datos.drinks || []).slice(0, 9).map((b: any) => this.crearBebida(b));
    } catch {
      this.mensaje = 'No fue posible cargar las bebidas.';
    }

    this.cargando = false;
  }

  async buscarPorNombre() {
    if (!this.busqueda.trim()) return this.cargarBebidas();

    this.cargando = true;
    this.mensaje = '';

    try {
      const datos = await this.consultar(
        `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(this.busqueda)}`
      );
      this.bebidas = (datos.drinks || []).map((b: any) => this.crearBebida(b));
      if (this.bebidas.length === 0) this.mensaje = 'No se encontraron bebidas.';
    } catch {
      this.mensaje = 'Error al buscar la bebida.';
    }

    this.cargando = false;
  }

  async buscarPorIngrediente() {
    if (!this.ingrediente.trim()) return this.cargarBebidas();

    this.cargando = true;
    this.mensaje = '';

    try {
      const datos = await this.consultar(
        `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(this.ingrediente)}`
      );
      this.bebidas = (datos.drinks || []).map((b: any) => this.crearBebida(b));
      if (this.bebidas.length === 0) this.mensaje = 'No se encontraron bebidas con ese ingrediente.';
    } catch {
      this.mensaje = 'Error al buscar por ingrediente.';
    }

    this.cargando = false;
  }

  limpiarBusqueda() {
    this.busqueda = '';
    this.ingrediente = '';
    this.tipo = '';
    this.categoria = '';
    this.cargarBebidas();
  }

  async verIngredientes(bebida: any) {
    if (bebida.ingredientes.length > 0) {
      bebida.mostrarIngredientes = !bebida.mostrarIngredientes;
      return;
    }

    const datos = await this.consultar(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${bebida.idDrink}`
    );

    const detalle = datos.drinks?.[0];
    bebida.ingredientes = [];

    for (let i = 1; i <= 15; i++) {
      const ing = detalle[`strIngredient${i}`];
      const med = detalle[`strMeasure${i}`];
      if (ing && ing.trim()) bebida.ingredientes.push(`${ing} - ${med || 'Cantidad no especificada'}`);
    }

    bebida.mostrarIngredientes = true;
  }
}