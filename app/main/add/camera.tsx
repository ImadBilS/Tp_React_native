import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef } from 'react';
import { Button, StyleSheet, Text, View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { getProductByBarcode } from '../../../services/openfoodfact';
import { addFoodToDraft} from '../../../services/storage';
import { Food } from '../../../types/food';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const isProcessing = useRef(false); 
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Nous avons besoin de ton autorisation pour utiliser la caméra</Text>
        <Button onPress={requestPermission} title="Autoriser la caméra" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    // Si le verrou est déjà activé (un scan est en cours), on ignore les flashs suivants
    if (isProcessing.current) return;
    
    // On ferme le verrou instantanément
    isProcessing.current = true;
    
    console.log(`📸 Code flashé : ${data}. Recherche en cours...`);

    try {
      const product = await getProductByBarcode(data);

      if (product) {
        const newFood: Food = {
          id: data + Date.now().toString(),
          name: product.product_name || "Nom inconnu",
          brand: product.brands || "Marque inconnue",
          calories: product.nutriments?.["energy-kcal_100g"],
          proteins: product.nutriments?.["proteins_100g"],
          carbohydrates: product.nutriments?.["carbohydrates_100g"],
          fat: product.nutriments?.["fat_100g"],
          image: product.image_front_url,
          dateAdded: new Date().toISOString(),
        };

        // On sauvegarde directement en silence
        await addFoodToDraft(newFood);
        
        // Et on redirige instantanément vers l'accueil !
        router.replace("/main/home");

      } else {
        Alert.alert(
          "Introuvable",
          "Cet aliment n'est pas répertorié dans la base de données.",
          [
              { text: "Réessayer", onPress: () => { isProcessing.current = false; } }, // On rouvre le verrou pour réessayer
              { text: "Retour", onPress: () => router.back() }
          ]
        );
      }
    } catch (error) {
      console.error("❌ Erreur :", error);
      isProcessing.current = false; // On rouvre le verrou en cas de plantage réseau
    }
  };

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>Retour</Text>
          </Pressable>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  message: { textAlign: 'center', paddingBottom: 10 },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'transparent', flexDirection: 'row', margin: 20 },
  closeButton: { alignSelf: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
  closeButtonText: { fontSize: 18, color: 'white', fontWeight: 'bold' },
});