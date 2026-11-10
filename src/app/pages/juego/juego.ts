import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-juego',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './juego.html',
  styleUrl: './juego.css'
})
export class Juego implements OnInit {
  cartas: any[] = [];
  seleccionadas: any[] = [];
  movimientos = 0;
  parejas = 0;
  bloqueado = false;
  terminado = false;

  ngOnInit() {
    this.nuevaPartida();
  }

  nuevaPartida() {
    const imagenes = [
  'https://www.themealdb.com/images/media/meals/58oia61564916529.jpg',
  'https://www.themealdb.com/images/media/meals/llcbn01574260722.jpg',
  'https://www.themealdb.com/images/media/meals/wxywrq1468235067.jpg',
  'https://www.themealdb.com/images/media/meals/1529446137.jpg',
  'https://www.thecocktaildb.com/images/media/drink/5noda61589575158.jpg',
  'https://www.thecocktaildb.com/images/media/drink/metwgh1606770327.jpg',
  'https://www.thecocktaildb.com/images/media/drink/tqpvqp1472668328.jpg',
  'https://www.thecocktaildb.com/images/media/drink/vrwquq1478252802.jpg'
];

    this.cartas = [];
    for (let i = 0; i < 8; i++) {
      this.cartas.push(
        { id: i, pareja: i, imagen: imagenes[i], abierta: false, encontrada: false },
        { id: i + 8, pareja: i, imagen: imagenes[i], abierta: false, encontrada: false }
      );
    }

    this.cartas.sort(() => Math.random() - 0.5);
    this.seleccionadas = [];
    this.movimientos = 0;
    this.parejas = 0;
    this.bloqueado = false;
    this.terminado = false;
  }

  seleccionar(carta: any) {
    if (this.bloqueado || carta.abierta || carta.encontrada) return;

    carta.abierta = true;
    this.seleccionadas.push(carta);

    if (this.seleccionadas.length === 2) {
      this.movimientos++;
      const [a, b] = this.seleccionadas;

      if (a.pareja === b.pareja && a.imagen !== b.imagen) {
        a.encontrada = true;
        b.encontrada = true;
        this.parejas++;
        this.seleccionadas = [];

        if (this.parejas === 8) this.terminado = true;
      } else {
        this.bloqueado = true;
        setTimeout(() => {
          a.abierta = false;
          b.abierta = false;
          this.seleccionadas = [];
          this.bloqueado = false;
        }, 1000);
      }
    }
  }
}