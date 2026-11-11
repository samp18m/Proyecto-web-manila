import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comida } from '../../models/comida';
import { PedidoService } from '../../services/pedido.service';

interface SeccionCategoria {
  categoria: string;
  comidas: Comida[];
}

@Component({
  selector: 'app-comidas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comidas.html',
  styleUrl: './comidas.css'
})
export class Comidas implements OnInit {

  private readonly API = 'https://www.themealdb.com/api/json/v1/1';
  private preciosAsignados = new Map<string, number>();

  busqueda = '';
  ingrediente = '';

  comidas: Comida[] = [];
  secciones: SeccionCategoria[] = [];

  cargando = false;
  mensaje = '';
  vista: 'categorias' | 'resultados' = 'categorias';

  constructor(
    private cdr: ChangeDetectorRef,
    private pedidoService: PedidoService
  ) {}

  ngOnInit(): void {
    this.cargarPorCategorias();
  }

  private async obtenerDatos(url: string): Promise<any> {
    const controller = new AbortController();
    const tiempo = setTimeout(() => controller.abort(), 15000);

    try {
      const respuesta = await fetch(url, { signal: controller.signal });

      if (!respuesta.ok) {
        throw new Error('Error al consultar la API');
      }

      return await respuesta.json();
    } finally {
      clearTimeout(tiempo);
    }
  }

  private generarPrecio(id: string): number {
    const existente = this.preciosAsignados.get(id);

    if (existente !== undefined) {
      return existente;
    }

    const precio = (Math.floor(Math.random() * 19) + 12) * 1000;
    this.preciosAsignados.set(id, precio);

    return precio;
  }

  private extraerIngredientes(item: any): string[] {
    const ingredientes: string[] = [];

    for (let i = 1; i <= 20; i++) {
      const nombre = String(item[`strIngredient${i}`] || '').trim();
      const cantidad = String(item[`strMeasure${i}`] || '').trim();

      if (nombre) {
        ingredientes.push(cantidad ? `${nombre} - ${cantidad}` : nombre);
      }
    }

    return ingredientes;
  }

  private crearComida(item: any, categoria?: string): Comida {
    return {
      idMeal: item.idMeal,
      strMeal: item.strMeal,
      strMealThumb: item.strMealThumb,
      categoria: categoria || item.strCategory || 'Otras',
      ingredientes: this.extraerIngredientes(item),
      mostrarIngredientes: false,
      precio: this.generarPrecio(String(item.idMeal))
    };
  }

  async cargarPorCategorias(): Promise<void> {
    this.cargando = true;
    this.mensaje = '';
    this.vista = 'categorias';
    this.comidas = [];
    this.secciones = [];
    this.cdr.markForCheck();

    try {
      const dataCategorias = await this.obtenerDatos(`${this.API}/categories.php`);
      const categorias = dataCategorias.categories || [];

      if (categorias.length === 0) {
        throw new Error('No se encontraron categorías');
      }

      const resultados: SeccionCategoria[] = new Array(categorias.length);
      let siguiente = 0;

      const trabajadores = Array.from(
        { length: Math.min(3, categorias.length) },
        async () => {
          while (true) {
            const indice = siguiente++;

            if (indice >= categorias.length) break;

            const categoria = categorias[indice].strCategory;

            try {
              const data = await this.obtenerDatos(
                `${this.API}/filter.php?c=${encodeURIComponent(categoria)}`
              );

              const comidasCategoria: Comida[] = (data.meals || []).map((item: any) =>
                this.crearComida(item, categoria)
              );

              resultados[indice] = {
                categoria,
                comidas: comidasCategoria
              };
            } catch (error) {
              console.error(`Error en categoría ${categoria}:`, error);
              resultados[indice] = {
                categoria,
                comidas: []
              };
            }
          }
        }
      );

      await Promise.all(trabajadores);

      this.secciones = resultados.filter(seccion => seccion.comidas.length > 0);

      if (this.secciones.length === 0) {
        this.mensaje = 'No se pudieron cargar las comidas. Intenta nuevamente.';
      }
    } catch (error) {
      console.error('Error general:', error);
      this.mensaje = 'No se pudieron cargar las categorías de comidas.';
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async buscarPorNombre(): Promise<void> {
    if (!this.busqueda.trim()) {
      await this.cargarPorCategorias();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.vista = 'resultados';
    this.comidas = [];
    this.cdr.markForCheck();

    try {
      const url = `${this.API}/search.php?s=${encodeURIComponent(this.busqueda.trim())}`;
      const data = await this.obtenerDatos(url);

      this.comidas = (data.meals || []).map((item: any) => this.crearComida(item));

      if (this.comidas.length === 0) {
        this.mensaje = 'No se encontraron comidas con ese nombre.';
      }
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar comidas por nombre.';
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async buscarPorIngrediente(): Promise<void> {
    if (!this.ingrediente.trim()) {
      await this.cargarPorCategorias();
      return;
    }

    this.cargando = true;
    this.mensaje = '';
    this.vista = 'resultados';
    this.comidas = [];
    this.cdr.markForCheck();

    try {
      const ingredienteNormalizado = this.ingrediente.trim().toLowerCase().replace(/\s+/g, '_');
      const url = `${this.API}/filter.php?i=${encodeURIComponent(ingredienteNormalizado)}`;
      const data = await this.obtenerDatos(url);

      this.comidas = (data.meals || []).map((item: any) => this.crearComida(item));

      if (this.comidas.length === 0) {
        this.mensaje = 'No se encontraron comidas con ese ingrediente.';
      }
    } catch (error) {
      console.error(error);
      this.mensaje = 'Error al buscar por ingrediente.';
    } finally {
      this.cargando = false;
      this.cdr.markForCheck();
    }
  }

  async verIngredientes(comida: Comida): Promise<void> {
    if (comida.ingredientes.length > 0) {
      comida.mostrarIngredientes = !comida.mostrarIngredientes;
      this.cdr.markForCheck();
      return;
    }

    comida.mostrarIngredientes = true;

    try {
      const data = await this.obtenerDatos(`${this.API}/lookup.php?i=${comida.idMeal}`);
      const detalle = data.meals?.[0];

      if (!detalle) {
        throw new Error('No se encontró el detalle');
      }

      comida.ingredientes = this.extraerIngredientes(detalle);

      if (comida.ingredientes.length === 0) {
        comida.ingredientes = ['No hay ingredientes disponibles.'];
      }
    } catch (error) {
      console.error(error);
      comida.ingredientes = ['No se pudieron cargar los ingredientes.'];
    } finally {
      this.cdr.markForCheck();
    }
  }

  agregarAPedido(comida: Comida): void {
    this.pedidoService.agregarProducto({
      id: comida.idMeal,
      nombre: comida.strMeal,
      imagen: comida.strMealThumb,
      tipo: 'Comida',
      precio: comida.precio,
      cantidad: 1
    });

    this.mensaje = `${comida.strMeal} agregada al pedido.`;
    this.cdr.markForCheck();
  }

  limpiarBusqueda(): void {
    this.busqueda = '';
    this.ingrediente = '';
    this.mensaje = '';
    this.cargarPorCategorias();
  }
}