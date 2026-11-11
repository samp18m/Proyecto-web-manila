
import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Bebida } from '../../models/bebida';

@Component({
  selector: 'app-bebidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bebidas.html',
  styleUrl: './bebidas.css'
})
export class Bebidas implements OnInit {

  private readonly API =
    'https://www.thecocktaildb.com/api/json/v1/1';

  private catalogo: Bebida[] = [];

  private preciosAsignados = new Map<string, number>();

  bebidas: Bebida[] = [];

  busquedaNombre = '';
  busquedaIngrediente = '';

  tipoSeleccionado = '';
  categoriaSeleccionada = '';

  cargando = false;
  mensaje = '';

  progresoCarga = 0;
  totalLetras = 26;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarBebidas();
  }

  // CONSULTAR API
  private async obtenerDatos(url: string): Promise<any> {

    const controller = new AbortController();

    const tiempo = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {

      const respuesta = await fetch(url, {
        signal: controller.signal
      });

      if (!respuesta.ok) {
        throw new Error('Error al consultar TheCocktailDB');
      }

      return await respuesta.json();

    } finally {
      clearTimeout(tiempo);
    }
  }

  // GENERAR PRECIO ALEATORIO
  private generarPrecio(id: string): number {

    const existente = this.preciosAsignados.get(id);

    if (existente !== undefined) {
      return existente;
    }

    const precio =
      (Math.floor(Math.random() * 18) + 8) * 1000;

    this.preciosAsignados.set(id, precio);

    return precio;
  }

  // EXTRAER INGREDIENTES
  private extraerIngredientes(item: any): string[] {

    const ingredientes: string[] = [];

    for (let i = 1; i <= 15; i++) {

      const nombre = String(
        item[`strIngredient${i}`] || ''
      ).trim();

      const cantidad = String(
        item[`strMeasure${i}`] || ''
      ).trim();

      if (nombre) {

        ingredientes.push(
          cantidad
            ? `${nombre} - ${cantidad}`
            : nombre
        );

      }
    }

    return ingredientes;
  }

  // CONVERTIR DATOS DE API A ENTIDAD BEBIDA
  private crearBebida(item: any): Bebida {

    return {

      idDrink: String(item.idDrink),

      strDrink: item.strDrink,

      strDrinkThumb: item.strDrinkThumb,

      strCategory: item.strCategory || 'Sin categoría',

      strAlcoholic: item.strAlcoholic || 'No especificado',

      ingredientes: this.extraerIngredientes(item),

      mostrarIngredientes: false,

      precio: this.generarPrecio(String(item.idDrink))

    };
  }

  // CARGAR CATÁLOGO POR LETRAS
  async cargarBebidas(): Promise<void> {

    this.cargando = true;
    this.mensaje = '';
    this.progresoCarga = 0;

    this.catalogo = [];
    this.bebidas = [];

    this.cdr.markForCheck();

    const letras = 'abcdefghijklmnopqrstuvwxyz'.split('');

    const resultados: any[] = [];

    let siguiente = 0;
    let errores = 0;

    try {

      // Máximo cuatro solicitudes simultáneas
      const trabajadores = Array.from(
        { length: 4 },
        async () => {

          while (true) {

            const indice = siguiente++;

            if (indice >= letras.length) {
              break;
            }

            const letra = letras[indice];

            try {

              const data = await this.obtenerDatos(
                `${this.API}/search.php?f=${letra}`
              );

              if (data.drinks) {
                resultados.push(...data.drinks);
              }

            } catch (error) {

              errores++;

              console.warn(
                `No se pudo consultar la letra ${letra}`,
                error
              );

            } finally {

              this.progresoCarga++;

              this.cdr.markForCheck();

            }
          }
        }
      );

      await Promise.all(trabajadores);

      // ELIMINAR BEBIDAS REPETIDAS
      const bebidasUnicas = new Map<string, any>();

      resultados.forEach(item => {

        if (item.idDrink) {
          bebidasUnicas.set(
            String(item.idDrink),
            item
          );
        }

      });

      // CREAR ENTIDADES
      this.catalogo = Array.from(
        bebidasUnicas.values()
      ).map(item => this.crearBebida(item));

      this.aplicarFiltros();

      if (this.catalogo.length === 0) {

        this.mensaje =
          'No se pudieron cargar las bebidas. Intenta nuevamente.';

      } else if (errores > 0) {

        this.mensaje =
          'Algunas consultas no respondieron. Se muestran las bebidas disponibles.';

      }

    } catch (error) {

      console.error('Error al cargar bebidas:', error);

      this.mensaje =
        'Ocurrió un error al cargar el catálogo.';

    } finally {

      this.cargando = false;

      this.cdr.markForCheck();

    }
  }

  // BUSCAR CÓCTEL POR NOMBRE
  buscarPorNombre(): void {

    this.aplicarFiltros();

  }

  // BUSCAR POR INGREDIENTE
  buscarPorIngrediente(): void {

    this.aplicarFiltros();

  }

  // APLICAR TODOS LOS FILTROS
  aplicarFiltros(): void {

    const nombre = this.normalizar(
      this.busquedaNombre
    );

    const ingrediente = this.normalizar(
      this.busquedaIngrediente
    );

    const tipo = this.normalizar(
      this.tipoSeleccionado
    );

    const categoria = this.normalizar(
      this.categoriaSeleccionada
    );

    this.bebidas = this.catalogo.filter(bebida => {

      // FILTRO POR NOMBRE
      const coincideNombre =
        !nombre ||
        this.normalizar(bebida.strDrink).includes(nombre);

      // FILTRO POR INGREDIENTE
      const coincideIngrediente =
        !ingrediente ||
        bebida.ingredientes.some(ing => {

          const nombreIngrediente = ing
            .split(' - ')[0];

          return this.normalizar(
            nombreIngrediente
          ).includes(ingrediente);

        });

      // FILTRO POR TIPO
      const coincideTipo =
        !tipo ||
        this.normalizar(bebida.strAlcoholic) === tipo;

      // FILTRO POR CATEGORÍA
      const coincideCategoria =
        !categoria ||
        this.normalizar(bebida.strCategory) === categoria;

      return (
        coincideNombre &&
        coincideIngrediente &&
        coincideTipo &&
        coincideCategoria
      );

    });

    if (this.bebidas.length === 0) {

      this.mensaje =
        'No se encontraron bebidas con esos filtros.';

    } else {

      this.mensaje = '';

    }

    this.cdr.markForCheck();
  }

  // NORMALIZAR TEXTO PARA LAS BÚSQUEDAS
  private normalizar(texto: string): string {

    return texto
      .trim()
      .toLowerCase()
      .replace(/_/g, ' ');
  }

  // MOSTRAR U OCULTAR INGREDIENTES
  verIngredientes(bebida: Bebida): void {

    bebida.mostrarIngredientes =
      !bebida.mostrarIngredientes;

    this.cdr.markForCheck();
  }

  // LIMPIAR TODOS LOS FILTROS
  limpiarFiltros(): void {

    this.busquedaNombre = '';
    this.busquedaIngrediente = '';

    this.tipoSeleccionado = '';
    this.categoriaSeleccionada = '';

    this.mensaje = '';

    this.aplicarFiltros();
  }

}
