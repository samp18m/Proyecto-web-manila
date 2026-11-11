
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

interface Objetivo {
  nombre: string;
  imagen: string;
}

interface CartaJuego {
  id: number;
  tipo: 'plato' | 'bebida' | 'vacia';
  descubierta: boolean;
  encontrada: boolean;
}

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.html',
  styleUrl: './juego.css'
})
export class Juego implements OnInit {

  private readonly API_COMIDAS =
    'https://www.themealdb.com/api/json/v1/1/random.php';

  private readonly API_BEBIDAS =
    'https://www.thecocktaildb.com/api/json/v1/1/random.php';

  platoObjetivo: Objetivo | null = null;

  bebidaObjetivo: Objetivo | null = null;

  cartas: CartaJuego[] = [];

  cargando = true;

  encontradoPlato = false;

  encontradoBebida = false;

  juegoTerminado = false;

  bloqueado = false;

  intentos = 0;

  mensaje = '';

  aviso = '';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.iniciarJuego();
  }

  // OBTENER PLATO Y BEBIDA ALEATORIOS
  async iniciarJuego(): Promise<void> {

    this.cargando = true;

    this.encontradoPlato = false;
    this.encontradoBebida = false;

    this.juegoTerminado = false;
    this.bloqueado = false;

    this.intentos = 0;
    this.mensaje = '';
    this.aviso = '';

    this.cartas = [];

    this.platoObjetivo = null;
    this.bebidaObjetivo = null;

    this.cdr.markForCheck();

    try {

      const [respuestaPlato, respuestaBebida] =
        await Promise.all([

          fetch(this.API_COMIDAS),

          fetch(this.API_BEBIDAS)

        ]);

      if (!respuestaPlato.ok || !respuestaBebida.ok) {
        throw new Error('No se pudieron consultar las APIs');
      }

      const [datosPlato, datosBebida] =
        await Promise.all([

          respuestaPlato.json(),

          respuestaBebida.json()

        ]);

      const plato = datosPlato.meals?.[0];

      const bebida = datosBebida.drinks?.[0];

      if (!plato || !bebida) {
        throw new Error('No se encontraron imágenes');
      }

      this.platoObjetivo = {

        nombre: plato.strMeal,

        imagen: plato.strMealThumb

      };

      this.bebidaObjetivo = {

        nombre: bebida.strDrink,

        imagen: bebida.strDrinkThumb

      };

    } catch (error) {

      console.error('Error al obtener imágenes:', error);

      // IMÁGENES LOCALES DE RESPALDO
      this.platoObjetivo = {

        nombre: 'Plato MANILA',

        imagen: '/manila-comida.jpg'

      };

      this.bebidaObjetivo = {

        nombre: 'Bebida MANILA',

        imagen: '/manila-bebiba.jpg'

      };

      this.aviso =
        'Se utilizaron las imágenes locales de MANILA.';

    }

    // CREAR TABLERO ALEATORIO
    this.crearTablero();

    this.cargando = false;

    this.cdr.markForCheck();

  }

  // MEZCLAR POSICIONES
  private mezclar<T>(lista: T[]): T[] {

    const resultado = [...lista];

    for (let i = resultado.length - 1; i > 0; i--) {

      const j = Math.floor(Math.random() * (i + 1));

      [resultado[i], resultado[j]] =
        [resultado[j], resultado[i]];

    }

    return resultado;
  }

  // CREAR MATRIZ 4 X 4
  private crearTablero(): void {

    const posiciones = this.mezclar(

      Array.from({ length: 16 }, (_, i) => i)

    );

    const posicionPlato = posiciones[0];

    const posicionBebida = posiciones[1];

    this.cartas = Array.from(

      { length: 16 },

      (_, i): CartaJuego => ({

        id: i,

        tipo:
          i === posicionPlato
            ? 'plato'
            : i === posicionBebida
              ? 'bebida'
              : 'vacia',

        descubierta: false,

        encontrada: false

      })

    );

  }

  // SELECCIONAR TARJETA
  seleccionarCarta(carta: CartaJuego): void {

    if (
      this.cargando ||
      this.bloqueado ||
      this.juegoTerminado ||
      carta.descubierta ||
      carta.encontrada
    ) {
      return;
    }

    this.intentos++;

    carta.descubierta = true;

    // SI ENCUENTRA EL PLATO
    if (carta.tipo === 'plato') {

      carta.encontrada = true;

      this.encontradoPlato = true;

      this.mensaje = '¡Encontraste el plato!';

    }

    // SI ENCUENTRA LA BEBIDA
    else if (carta.tipo === 'bebida') {

      carta.encontrada = true;

      this.encontradoBebida = true;

      this.mensaje = '¡Encontraste la bebida!';

    }

    // SI SELECCIONA UNA CASILLA VACÍA
    else {

      this.bloqueado = true;

      this.mensaje = '¡Sigue intentando!';

      setTimeout(() => {

        carta.descubierta = false;

        this.bloqueado = false;

        this.mensaje = '';

        this.cdr.markForCheck();

      }, 700);

    }

    // COMPROBAR SI TERMINÓ
    if (
      this.encontradoPlato &&
      this.encontradoBebida
    ) {

      this.juegoTerminado = true;

      this.mensaje =
        '¡Felicidades! Encontraste el combo MANILA.';

    }

    this.cdr.markForCheck();

  }

  // REINICIAR JUEGO
  reiniciarJuego(): void {

    this.iniciarJuego();

  }

}
