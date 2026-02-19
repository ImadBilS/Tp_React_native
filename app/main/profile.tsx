import { View, Text, StyleSheet, Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace("/auth/sign-in");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text> 
        </View>
        <Text style={styles.email}>
          {user?.primaryEmailAddress?.emailAddress || "Utilisateur inconnu"}
        </Text>
      </View>

      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    backgroundColor: "#f9f9f9", 
    justifyContent: "center" 
  },
  card: { 
    backgroundColor: "white", 
    padding: 30, 
    borderRadius: 12, 
    alignItems: "center", 
    marginBottom: 40, 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 4, 
    elevation: 3 
  },
  avatar: { 
    width: 80, 
    height: 80, 
    backgroundColor: "#e8f5e9", 
    borderRadius: 40, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 15 
  },
  avatarText: { fontSize: 40 },
  email: { fontSize: 16, fontWeight: "600", color: "#333" },
  logoutButton: { 
    borderColor: "#d9534f", 
    borderWidth: 1, 
    padding: 15, 
    borderRadius: 12, 
    alignItems: "center" 
  },
  logoutText: { color: "#d9534f", fontSize: 16, fontWeight: "bold" },
});