import AsyncStorage from "@react-native-async-storage/async-storage";
import { Meal, Food } from "../types/food";

const MEALS_KEY = "mes_repas_v3";
const DRAFT_KEY = "brouillon_repas";
export const getMeals = async (): Promise<Meal[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(MEALS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    return [];
  }
};

export const saveMeal = async (meal: Meal) => {
  try {
    const currentMeals = await getMeals();
    await AsyncStorage.setItem(
      MEALS_KEY,
      JSON.stringify([...currentMeals, meal]),
    );
  } catch (e) {
    console.error("Erreur de sauvegarde du repas :", e);
  }
};

// --- GESTION DU BROUILLON (Page Ajouter) ---
export const getDraftFoods = async (): Promise<Food[]> => {
  try {
    const json = await AsyncStorage.getItem(DRAFT_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    return [];
  }
};

export const addFoodToDraft = async (food: Food) => {
  try {
    const currentDraft = await getDraftFoods();
    await AsyncStorage.setItem(
      DRAFT_KEY,
      JSON.stringify([...currentDraft, food]),
    );
  } catch (e) {
    console.error("Erreur d'ajout au brouillon :", e);
  }
};

export const clearDraft = async () => {
  try {
    await AsyncStorage.removeItem(DRAFT_KEY);
  } catch (e) {
    console.error("Erreur nettoyage brouillon :", e);
  }
};
