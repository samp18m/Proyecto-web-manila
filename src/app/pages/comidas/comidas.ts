import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comida } from '../../models/comida';

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comidas.html',
  styleUrl: './comidas.css'
})
export class Comidas implements OnInit {

  busqueda = '';
  ingrediente = '';

  comidas: Comida[] = [];

  cargando = false;
  mensaje = '';

  ngOnInit() {
    this.cargarComidas();
  }


  crearComida(item: any): Comida {

    return {
      idMeal: item.idMeal,
      strMeal: item.strMeal,
      strMealThumb: item.strMealThumb,
      ingredientes: [],
      mostrarIngredientes: false,
      precio: this.generarPrecio(item.idMeal)
    };

  }


  generarPrecio(id: string): number {

    return 12000 + (Number(id) % 18000);

  }


  async cargarComidas() {

    this.cargando = true;
    this.mensaje = '';

    try {

      const res = await fetch(
        'https://www.themealdb.com/api/json/v1/1/search.php?s='
      );

      const data = await res.json();

      this.comidas = (data.meals || [])
        .slice(0, 9)
        .map((item: any) => this.crearComida(item));


    } catch {

      this.mensaje = 'No se pudieron cargar las comidas.';

    }


    this.cargando = false;

  }


  async buscarPorNombre() {

    if (!this.busqueda.trim()) {
      return this.cargarComidas();
    }


    this.cargando = true;
    this.mensaje = '';


    try {

      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(this.busqueda)}`
      );


      const data = await res.json();


      this.comidas = (data.meals || [])
        .map((item: any) => this.crearComida(item));


      if (this.comidas.length === 0) {
        this.mensaje = 'No se encontraron comidas.';
      }


    } catch {

      this.mensaje = 'Error al buscar comidas.';

    }


    this.cargando = false;

  }


  async buscarPorIngrediente() {

    if (!this.ingrediente.trim()) {
      return this.cargarComidas();
    }


    this.cargando = true;
    this.mensaje = '';


    try {


      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(this.ingrediente)}`
      );


      const data = await res.json();


      this.comidas = (data.meals || [])
        .map((item: any) => this.crearComida(item));


      if (this.comidas.length === 0) {
        this.mensaje = 'No se encontraron comidas con ese ingrediente.';
      }


    } catch {

      this.mensaje = 'Error al buscar por ingrediente.';

    }


    this.cargando = false;

  }



  async verIngredientes(comida: Comida) {


    if (comida.ingredientes.length > 0) {

      comida.mostrarIngredientes =
        !comida.mostrarIngredientes;

      return;

    }


    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${comida.idMeal}`
    );


    const data = await res.json();


    const detalle = data.meals?.[0];


    comida.ingredientes = [];


    for (let i = 1; i <= 20; i++) {


      const ing = detalle[`strIngredient${i}`];

      const med = detalle[`strMeasure${i}`];


      if (ing && ing.trim()) {

        comida.ingredientes.push(
          `${ing} - ${med || 'Cantidad no especificada'}`
        );

      }

    }


    comida.mostrarIngredientes = true;

  }



  limpiarBusqueda() {

    this.busqueda = '';
    this.ingrediente = '';

    this.cargarComidas();

  }

}