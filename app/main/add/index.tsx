import { View, Text, StyleSheet, Pressable, FlatList, Alert, TextInput, ActivityIndicator, Image, ScrollView} from "react-native";
import { useState, useCallback } from "react";
import { useRouter, useFocusEffect } from "expo-router";
import { MealType, Food, Meal } from "../../../types/food";
import { getDraftFoods, clearDraft, saveMeal, addFoodToDraft } from "../../../services/storage";
import { searchProductsByName } from "../../../services/openfoodfact"; 
import AsyncStorage from "@react-native-async-storage/async-storage";

const MEAL_TYPES: MealType[] = ['Petit-déjeuner', 'Déjeuner', 'Dîner', 'Snack'];

export default function AddMealScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<MealType>('Snack');
  const [draftFoods, setDraftFoods] = useState<Food[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const loadDraft = async () => {
        const foods = await getDraftFoods();
        setDraftFoods(foods);
      };
      loadDraft();
    }, [])
  );

  // --- FONCTION DE RECHERCHE ---
  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setIsSearching(true);
    const results = await searchProductsByName(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // --- AJOUTER UN RÉSULTAT AU BROUILLON ---
  const handleAddSearchResult = async (product: any) => {
    const newFood: Food = {
      id: product.id || Date.now().toString(),
      name: product.product_name || "Nom inconnu",
      brand: product.brands || "Marque inconnue",
      calories: product.nutriments?.["energy-kcal_100g"] || 0,
      proteins: product.nutriments?.proteins_100g || 0,
      carbohydrates: product.nutriments?.carbohydrates_100g || 0,
      fat: product.nutriments?.fat_100g || 0,
      image: product.image_front_url,
      dateAdded: new Date().toISOString(),
    };

    await addFoodToDraft(newFood);
    setDraftFoods(prev => [...prev, newFood]);
    setSearchQuery("");
    setSearchResults([]);
  };

  // --- RETIRER UN ALIMENT DU BROUILLON ---
  const handleRemoveFromDraft = async (indexToRemove: number) => {
    const updatedDraft = draftFoods.filter((_, index) => index !== indexToRemove);
    setDraftFoods(updatedDraft);
    await AsyncStorage.setItem('brouillon_repas', JSON.stringify(updatedDraft));
  };

  // --- VALIDER LE REPAS ---
  const handleValidateMeal = async () => {
    if (draftFoods.length === 0) {
      Alert.alert("Oups !", "Ajoute au moins un aliment avant de valider.");
      return;
    }

    const newMeal: Meal = {
      id: Date.now().toString(),
      type: selectedType,
      date: new Date().toISOString(),
      foods: draftFoods,
    };

    await saveMeal(newMeal);
    await clearDraft();
    router.push("/main/home");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Type de repas</Text>
      <View style={styles.typeContainer}>
        {MEAL_TYPES.map((type) => (
          <Pressable
            key={type}
            style={[styles.typeButton, selectedType === type && styles.typeButtonActive]}
            onPress={() => setSelectedType(type)}
          >
            <Text style={[styles.typeText, selectedType === type && styles.typeTextActive]}>{type}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Rechercher un aliment</Text>
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Rechercher un produit..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <Pressable style={styles.scanButton} onPress={() => router.push("/main/add/camera")}>
          <Text style={styles.scanButtonText}>[| |]</Text>
        </Pressable>
      </View>

      <View style={{ zIndex: 10 }}> 
        {isSearching ? (
          <ActivityIndicator size="small" color="#4CAF50" style={{ marginTop: 10 }} />
        ) : searchResults.length > 0 ? (
          <View style={styles.searchResultsWrapper}>
            <ScrollView 
              style={styles.resultsScrollView} 
              nestedScrollEnabled={true} 
            >
              {searchResults.map((product, index) => (
                <View key={index} style={styles.searchResultItem}>
                  {product.image_front_url ? (
                    <Image source={{ uri: product.image_front_url }} style={styles.resultImage} />
                  ) : (
                    <View style={styles.resultImagePlaceholder} />
                  )}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName} numberOfLines={1}>
                      {product.product_name || "Inconnu"}
                    </Text>
                    <Text style={styles.foodBrand}>
                      {product.brands || "Inconnu"} - {Math.round(product.nutriments?.["energy-kcal_100g"] || 0)} kcal
                    </Text>
                  </View>
                  <Pressable style={styles.addButton} onPress={() => handleAddSearchResult(product)}>
                    <Text style={styles.addButtonText}>+</Text>
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Aliments ajoutés ({draftFoods.length})</Text>
      <FlatList
        data={draftFoods}
        keyExtractor={(item, index) => item.id + index}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun aliment ajouté.</Text>}
        renderItem={({ item, index }) => (
          <View style={styles.foodItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{item.name}</Text>
              <Text style={styles.foodBrand}>{item.brand} - {Math.round(item.calories || 0)} kcal</Text>
            </View>
            <Pressable style={styles.removeButton} onPress={() => handleRemoveFromDraft(index)}>
              <Text style={styles.removeButtonText}>x</Text>
            </Pressable>
          </View>
        )}
        style={styles.list}
      />

      <Pressable style={styles.validateButton} onPress={handleValidateMeal}>
        <Text style={styles.validateButtonText}>Valider le repas</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9", padding: 20, paddingTop: 50 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10, marginTop: 20 },
  typeContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  typeButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "white", borderWidth: 1, borderColor: "#ddd" },
  typeButtonActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  typeText: { color: "#333", fontSize: 14 },
  typeTextActive: { color: "white", fontWeight: "bold" },
  
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchInput: { flex: 1, backgroundColor: "white", padding: 15, borderRadius: 10, borderWidth: 1, borderColor: "#ddd", fontSize: 16 },
  scanButton: { backgroundColor: "#4CAF50", padding: 15, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  scanButtonText: { color: "white", fontWeight: "bold", fontSize: 16 },

  searchResultsWrapper: { backgroundColor: "white", borderRadius: 10, marginTop: 10, borderWidth: 1, borderColor: "#ddd", maxHeight: 200 },
  resultsScrollView: { padding: 10 },
  searchResultsContainer: { backgroundColor: "white", borderRadius: 10, marginTop: 10, padding: 10, borderWidth: 1, borderColor: "#ddd", maxHeight: 200 },
  searchResultItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#eee" },
  resultImage: { width: 30, height: 30, borderRadius: 15, marginRight: 10 },
  resultImagePlaceholder: { width: 30, height: 30, borderRadius: 15, marginRight: 10, backgroundColor: "#eee" },
  addButton: { backgroundColor: "#e8f5e9", width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  addButtonText: { color: "#4CAF50", fontWeight: "bold", fontSize: 18, marginTop: -2 },

  list: { flex: 1, marginTop: 10 },
  foodItem: { backgroundColor: "white", padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderWidth: 1, borderColor: "#eee" },
  foodName: { fontSize: 14, fontWeight: "bold", color: "#333" },
  foodBrand: { fontSize: 12, color: "#777", marginTop: 4 },
  emptyText: { color: "#aaa", fontStyle: "italic", textAlign: "center", marginTop: 20 },
  
  removeButton: { backgroundColor: "#ffebee", width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  removeButtonText: { color: "#F44336", fontWeight: "bold", fontSize: 16, marginTop: -2 },

  validateButton: { backgroundColor: "#4CAF50", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10 },
  validateButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});