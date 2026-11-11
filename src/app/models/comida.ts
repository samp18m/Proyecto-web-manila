export interface Comida {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  categoria: string;
  ingredientes: string[];
  mostrarIngredientes: boolean;
  precio: number;
}