import { View, Text, StyleSheet, Pressable } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const router = useRouter();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Nous avons besoin de votre permission pour utiliser la caméra afin de scanner les aliments.</Text>
        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Accorder la permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Pressable style={styles.closeButton} onPress={() => router.back()}>
            <Text style={styles.closeButtonText}>Retour</Text>
          </Pressable>
          <View style={styles.scanTarget} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", backgroundColor: "black" },
  text: { textAlign: "center", margin: 20, fontSize: 16, color: "white" },
  button: { backgroundColor: "#007BFF", padding: 15, borderRadius: 5, marginHorizontal: 20, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
  camera: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "transparent", justifyContent: "space-between", padding: 20 },
  closeButton: { alignSelf: "flex-start", marginTop: 40, backgroundColor: "rgba(0,0,0,0.5)", padding: 10, borderRadius: 5 },
  closeButtonText: { color: "white", fontWeight: "bold" },
  scanTarget: { alignSelf: "center", marginBottom: "50%", width: 250, height: 250, borderWidth: 2, borderColor: "#007BFF", borderRadius: 10 },
});