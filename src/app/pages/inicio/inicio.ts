import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {
  platoEstrella: any = null;
  bebidaEstrella: any = null;
  cargando = true;
  mensaje = '';

  fotosRestaurante = [
    '/manila-restaurante.jpg',
    '/manila-comida.jpg',
    '/manila-bebiba.jpg'
  ];

  async ngOnInit() {
    try {
      const [platoRes, bebidaRes] = await Promise.all([
        fetch('https://www.themealdb.com/api/json/v1/1/search.php?s='),
        fetch('https://www.thecocktaildb.com/api/json/v1/1/search.php?s=margarita')
      ]);

      const platoData = await platoRes.json();
      const bebidaData = await bebidaRes.json();

      const plato = platoData.meals?.[0];
      const bebida = bebidaData.drinks?.[0];

      this.platoEstrella = plato ? {
        id: plato.idMeal,
        nombre: plato.strMeal,
        imagen: plato.strMealThumb,
        categoria: plato.strCategory,
        origen: plato.strArea
      } : null;

      this.bebidaEstrella = bebida ? {
        id: bebida.idDrink,
        nombre: bebida.strDrink,
        imagen: bebida.strDrinkThumb,
        categoria: bebida.strCategory,
        tipo: bebida.strAlcoholic
      } : null;

      if (!this.bebidaEstrella) {
        this.bebidaEstrella = {
          nombre: 'Margarita',
          imagen: '/manila-bebiba.jpg',
          categoria: 'Bebida destacada',
          tipo: 'Sin datos'
        };
      }

    } catch {
      this.mensaje = 'No se pudo cargar la información destacada.';
      this.bebidaEstrella = {
        nombre: 'Bebida estrella',
        imagen: '/manila-bebiba.jpg',
        categoria: 'Bebida destacada',
        tipo: 'Sin datos'
      };
    } finally {
      this.cargando = false;
    }
  }
}