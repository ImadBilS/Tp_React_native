import { View, Text, StyleSheet, Image, Pressable, ScrollView, Alert } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMeals } from "../../../services/storage";
import { Meal, Food } from "../../../types/food";

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);

  useEffect(() => {
    const fetchMeal = async () => {
      const meals = await getMeals();
      const foundMeal = meals.find((m) => m.id === id);
      if (foundMeal) setMeal(foundMeal);
    };
    fetchMeal();
  }, [id]);

  const handleDelete = async () => {
    Alert.alert("Supprimer", "Voulez-vous vraiment supprimer ce repas ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          const meals = await getMeals();
          const updatedMeals = meals.filter((m) => m.id !== id);
          await AsyncStorage.setItem("mes_repas_v3", JSON.stringify(updatedMeals));
          router.back(); 
        }
      }
    ]);
  };

  if (!meal) {
    return (
      <View style={styles.center}>
        <Text>Chargement du repas...</Text>
      </View>
    );
  }

  // --- CALCULS DES TOTAUX ---
  const foods = meal.foods || [];
  const totalCals = foods.reduce((s, f) => s + (f.calories || 0), 0);
  const totalProts = foods.reduce((s, f) => s + (f.proteins || 0), 0);
  const totalCarbs = foods.reduce((s, f) => s + (f.carbohydrates || 0), 0);
  const totalFats = foods.reduce((s, f) => s + (f.fat || 0), 0);

  const formattedDate = new Date(meal.date).toISOString().split('T')[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: "Détail du repas" }} />

      <View style={styles.header}>
        <Text style={styles.mealType}>{meal.type}</Text>
        <Text style={styles.mealDate}>{formattedDate}</Text>
      </View>

      <Text style={styles.sectionTitle}>Total nutritionnel</Text>
      <View style={styles.macrosCard}>
        <View style={[styles.macroPill, { borderColor: "#4CAF50" }]}>
          <Text style={[styles.macroValue, { color: "#4CAF50" }]}>{Math.round(totalCals)} kcal</Text>
          <Text style={styles.macroLabel}>Calories</Text>
        </View>
        <View style={[styles.macroPill, { borderColor: "#2196F3" }]}>
          <Text style={[styles.macroValue, { color: "#2196F3" }]}>{totalProts.toFixed(1)}g</Text>
          <Text style={styles.macroLabel}>Protéines</Text>
        </View>
        <View style={[styles.macroPill, { borderColor: "#FF9800" }]}>
          <Text style={[styles.macroValue, { color: "#FF9800" }]}>{totalCarbs.toFixed(1)}g</Text>
          <Text style={styles.macroLabel}>Glucides</Text>
        </View>
        <View style={[styles.macroPill, { borderColor: "#F44336" }]}>
          <Text style={[styles.macroValue, { color: "#F44336" }]}>{totalFats.toFixed(1)}g</Text>
          <Text style={styles.macroLabel}>Lipides</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Aliments ({foods.length})</Text>
      {foods.map((food, index) => (
        <View key={food.id + index} style={styles.foodCard}>
          <View style={styles.foodHeader}>
            {food.image ? (
              <Image source={{ uri: food.image }} style={styles.foodImage} />
            ) : (
              <View style={styles.placeholderImage} />
            )}
            <View style={styles.foodInfo}>
              <Text style={styles.foodName} numberOfLines={1}>{food.name}</Text>
              <Text style={styles.foodBrand} numberOfLines={1}>{food.brand}</Text>
            </View>
          </View>

          <View style={styles.foodMacros}>
            <View style={[styles.smallPill, { borderColor: "#4CAF50" }]}>
              <Text style={[styles.smallPillValue, { color: "#4CAF50" }]}>{Math.round(food.calories || 0)} kcal</Text>
              <Text style={styles.smallPillLabel}>Calories</Text>
            </View>
            <View style={[styles.smallPill, { borderColor: "#2196F3" }]}>
              <Text style={[styles.smallPillValue, { color: "#2196F3" }]}>{Number(food.proteins || 0).toFixed(1)}g</Text>
              <Text style={styles.smallPillLabel}>Protéines</Text>
            </View>
            <View style={[styles.smallPill, { borderColor: "#FF9800" }]}>
              <Text style={[styles.smallPillValue, { color: "#FF9800" }]}>{Number(food.carbohydrates || 0).toFixed(1)}g</Text>
              <Text style={styles.smallPillLabel}>Glucides</Text>
            </View>
            <View style={[styles.smallPill, { borderColor: "#F44336" }]}>
              <Text style={[styles.smallPillValue, { color: "#F44336" }]}>{Number(food.fat || 0).toFixed(1)}g</Text>
              <Text style={styles.smallPillLabel}>Lipides</Text>
            </View>
          </View>
        </View>
      ))}

      <Pressable style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Supprimer ce repas</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20 },
  header: { marginBottom: 20 },
  mealType: { fontSize: 24, fontWeight: "bold", color: "#333" },
  mealDate: { fontSize: 14, color: "#999", marginTop: 4 },
  
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 10, marginTop: 10 },
  
  macrosCard: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  macroPill: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: "center", marginHorizontal: 2 },
  macroValue: { fontSize: 12, fontWeight: "bold", marginBottom: 2 },
  macroLabel: { fontSize: 9, color: "#999", textTransform: "uppercase" },

  foodCard: { backgroundColor: "white", padding: 15, borderRadius: 12, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  foodHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  foodImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15 },
  placeholderImage: { width: 50, height: 50, borderRadius: 8, marginRight: 15, backgroundColor: "#eee" },
  foodInfo: { flex: 1 },
  foodName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  foodBrand: { fontSize: 12, color: "#777", marginTop: 2 },
  
  foodMacros: { flexDirection: "row", justifyContent: "space-between" },
  smallPill: { flex: 1, borderWidth: 1, borderRadius: 6, paddingVertical: 4, alignItems: "center", marginHorizontal: 2 },
  smallPillValue: { fontSize: 10, fontWeight: "bold" },
  smallPillLabel: { fontSize: 8, color: "#999" },

  deleteButton: { backgroundColor: "#F44336", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 30 },
  deleteButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },
});