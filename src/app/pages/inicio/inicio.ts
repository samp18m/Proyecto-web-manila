import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class Inicio implements OnInit {

  plato: any = null;
  bebida: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    console.log('inicio ejecutado');

    this.http
      .get<any>('https://www.themealdb.com/api/json/v1/1/random.php')
      .subscribe(res => {
        this.plato = res.meals[0];
      });

    this.http
      .get<any>('https://www.thecocktaildb.com/api/json/v1/1/random.php')
      .subscribe(res => {
        this.bebida = res.drinks[0];
      });
  }
}