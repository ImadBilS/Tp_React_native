export interface Food {
  id: string;
  name: string;
  brand: string;
  calories: number;
  proteins: number;
  carbohydrates: number;
  fat: number;
  image?: string;
  dateAdded: string;
}

export type MealType = "Petit-déjeuner" | "Déjeuner" | "Dîner" | "Snack";

export interface Meal {
  id: string;
  type: MealType;
  date: string;
  foods: Food[];
}
