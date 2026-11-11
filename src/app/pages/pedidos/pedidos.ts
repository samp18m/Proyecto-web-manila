import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import jsPDF from 'jspdf';
import { Producto } from '../../models/producto';
import { Pedido } from '../../models/pedido';
import { Cliente} from '../../models/cliente';  


@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.html',
  styleUrl: './pedidos.css'
})

export class Pedidos implements OnInit {
  nombre = '';
  celular = '';
  direccion = '';


  productos: Producto[] = [];


  pedido!: Pedido;


  cargando = true;

  mensaje = '';



  async ngOnInit() {

    try {


      const [comidas, bebidas] = await Promise.all([

        this.cargarComidas(),

        this.cargarBebidas()

      ]);


      this.productos = [

        ...comidas,

        ...bebidas

      ];


    } catch {


      this.mensaje = 'No se pudieron cargar los productos.';


    } finally {


      this.cargando = false;


    }

  }



  async cargarComidas(): Promise<Producto[]> {


    const r = await fetch(

      'https://www.themealdb.com/api/json/v1/1/search.php?s='

    );


    const d = await r.json();



    return (d.meals || [])

      .slice(0, 6)

      .map((c: any) => ({


        id: c.idMeal,

        nombre: c.strMeal,

        imagen: c.strMealThumb,

        tipo: 'Comida',

        precio: 15000 + (Number(c.idMeal) % 30001),

        cantidad: 0


      }));

  }




  async cargarBebidas(): Promise<Producto[]> {


    const r = await fetch(

      'https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=Cocktail'

    );


    const d = await r.json();



    return (d.drinks || [])

      .slice(0, 6)

      .map((b: any) => ({


        id: b.idDrink,

        nombre: b.strDrink,

        imagen: b.strDrinkThumb,

        tipo: 'Bebida',

        precio: 8000 + (Number(b.idDrink) % 15001),

        cantidad: 0


      }));

  }




  get total(): number {


    return this.productos.reduce(

      (suma, p) => suma + (p.precio * p.cantidad),

      0

    );


  }





  confirmarPedido() {


    if (

      !this.nombre.trim() ||

      !this.celular.trim() ||

      !this.direccion.trim()

    ) {


      alert('Completa todos los datos del cliente.');

      return;

    }



    if (!this.productos.some(p => p.cantidad > 0)) {


      alert('Selecciona al menos un producto.');

      return;

    }



    this.pedido = {

      id: Date.now(),

      cliente: {
       nombre: this.nombre,
       celular: this.celular,
       direccion: this.direccion  
      },

      productos: this.productos.filter(

        p => p.cantidad > 0

      ),

      total: this.total,

      fecha: new Date()


      }

    this.generarPDF();


  }





  generarPDF() {


    const pdf = new jsPDF();


    const fecha = new Date()

      .toLocaleDateString('es-CO');



    const formato = (v: number) =>

      '$' + v.toLocaleString('es-CO');




    pdf.setFillColor(23, 59, 44);

    pdf.rect(0, 0, 210, 40, 'F');



    pdf.setTextColor(214, 168, 95);

    pdf.setFontSize(24);

    pdf.setFont('helvetica', 'bold');

    pdf.text(

      'MANILA',

      105,

      18,

      { align: 'center' }

    );



    pdf.setTextColor(255,255,255);

    pdf.setFontSize(16);

    pdf.text(

      'COMPROBANTE DE PEDIDO',

      105,

      30,

      { align:'center' }

    );



    pdf.setTextColor(0,0,0);

    pdf.setFontSize(12);



    pdf.text(

      'Fecha: ' + fecha,

      15,

      52

    );


    pdf.text(

      'Nombre: ' + this.nombre,

      15,

      64

    );


    pdf.text(

      'Celular: ' + this.celular,

      15,

      72

    );


    pdf.text(

      'Direccion: ' + this.direccion,

      15,

      80

    );



    let y = 100;



    pdf.setFont('helvetica','bold');



    pdf.text('Producto',15,y);

    pdf.text('Cant.',110,y);

    pdf.text('Precio',145,y);

    pdf.text(

      'Subtotal',

      185,

      y,

      {align:'right'}

    );



    y += 10;


    pdf.setFont('helvetica','normal');



    this.productos

      .filter(p => p.cantidad > 0)

      .forEach(p => {


        pdf.text(

          p.nombre.substring(0,35),

          15,

          y

        );


        pdf.text(

          String(p.cantidad),

          112,

          y

        );


        pdf.text(

          formato(p.precio),

          145,

          y

        );


        pdf.text(

          formato(p.precio * p.cantidad),

          185,

          y,

          {align:'right'}

        );


        y += 10;


      });



    y += 8;


    pdf.setFont('helvetica','bold');


    pdf.text(

      'TOTAL A PAGAR: ' + formato(this.total),

      15,

      y

    );



    pdf.save('Pedido_MANILA.pdf');


    alert('Pedido generado correctamente.');

  }


}