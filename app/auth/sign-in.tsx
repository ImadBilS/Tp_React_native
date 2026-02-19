import { useSignIn, useAuth } from "@clerk/clerk-expo"; 
import { Link, useRouter, Redirect } from "expo-router"; 
import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from "react-native";

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn } = useAuth(); 
  const router = useRouter();
  
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");

  if (isSignedIn) {
    return <Redirect href="/main/home" />;
  }

  const onSignInPress = async () => {
    if (!isLoaded) return;
    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/main/home");
      }
    } catch (err) {
      console.error("Erreur de connexion", err);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        {/* LOGO NutriTrack selon la maquette */}
        <Text style={styles.brandName}>NutriTrack</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor="#aaa"
            onChangeText={(email) => setEmailAddress(email)}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Mot de passe"
            placeholderTextColor="#aaa"
            secureTextEntry={true}
            onChangeText={(pwd) => setPassword(pwd)}
          />

          <Pressable style={styles.button} onPress={onSignInPress}>
            <Text style={styles.buttonText}>Se connecter</Text>
          </Pressable>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Pas encore de compte ? </Text>
          <Link href="/auth/sign-up">
            <Text style={styles.link}>S'inscrire</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff" 
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 30,
  },
  brandName: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#4CAF50", // Le vert NutriTrack
    textAlign: "center",
    marginBottom: 5 
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 40,
  },
  form: {
    width: "100%",
  },
  input: { 
    backgroundColor: "#F5F5F5", // Gris très clair comme la maquette
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0"
  },
  button: { 
    backgroundColor: "#4CAF50", 
    padding: 18, 
    borderRadius: 12, 
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3
  },
  buttonText: { 
    color: "white", 
    fontWeight: "bold", 
    fontSize: 16 
  },
  footerContainer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 30 
  },
  footerText: { 
    color: "#888",
    fontSize: 14
  },
  link: { 
    color: "#4CAF50", 
    fontWeight: "bold",
    fontSize: 14 
  },
});