import { useAuth } from "@clerk/clerk-expo";
import { Redirect, useRouter, useFocusEffect } from "expo-router";
import { useState, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, FlatList } from "react-native";
import { getMeals } from "../../../services/storage";
import { Meal } from "../../../types/food";

export default function HomeScreen() {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<Meal[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadMeals = async () => {
        const storedMeals = await getMeals();
        setMeals(storedMeals.reverse()); 
      };
      loadMeals();
    }, [])
  );

  if (!isSignedIn) {
    return <Redirect href="/auth/sign-in" />;
  }

  const renderItem = ({ item }: { item: Meal }) => {
    // --- SÉCURITÉ MAXIMALE ---
    // Si item.foods n'existe pas, on force un tableau vide []
    const foodsList = item.foods || []; 
    const totalCalories = foodsList.reduce((sum, food) => sum + (food.calories || 0), 0);

    return (
      <Pressable 
        style={styles.mealCard} 
        onPress={() => router.push(`/main/home/${item.id}`)}
      >
        <View style={styles.mealLeft}>
          <Text style={styles.mealType}>{item.type}</Text>
        </View>
        <View style={styles.mealRight}>
          <Text style={styles.mealCalories}>{Math.round(totalCalories)} kcal</Text>
          <Text style={styles.mealFoodCount}>
            {/* On utilise la variable sécurisée 'foodsList' pour éviter le plantage ! */}
            {foodsList.length} aliment{foodsList.length > 1 ? 's' : ''}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mes repas</Text>

      {meals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🍽️</Text>
          <Text style={styles.emptyTitle}>Aucun repas enregistré</Text>
          <Text style={styles.emptyText}>Commencez par ajouter un repas !</Text>
          
          <Pressable style={styles.fab} onPress={() => router.push("/main/add")}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={meals}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
          />
          <Pressable style={styles.fab} onPress={() => router.push("/main/add")}>
            <Text style={styles.fabText}>+</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", paddingTop: 50 },
  title: { fontSize: 18, fontWeight: "bold", textAlign: "center", marginBottom: 20, color: "#333" },
  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  mealCard: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "white", padding: 20, borderRadius: 12, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mealLeft: { justifyContent: "center" },
  mealType: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 4 },
  mealDate: { fontSize: 12, color: "#999" },
  mealRight: { alignItems: "flex-end", justifyContent: "center" },
  mealCalories: { fontSize: 16, fontWeight: "bold", color: "#4CAF50", marginBottom: 4 },
  mealFoodCount: { fontSize: 12, color: "#999" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20, marginTop: -50 },
  emptyIcon: { fontSize: 50, marginBottom: 15, opacity: 0.5 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", color: "#333", marginBottom: 5 },
  emptyText: { fontSize: 14, color: "#999" },
  fab: { position: "absolute", bottom: 30, right: 30, width: 60, height: 60, backgroundColor: "#4CAF50", borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 5 },
  fabText: { fontSize: 30, color: "white", fontWeight: "bold", marginTop: -2 },
});