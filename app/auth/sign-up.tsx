import { Text, TextInput, View, StyleSheet, Pressable, KeyboardAvoidingView, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { useSignUp } from "@clerk/clerk-expo";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({ emailAddress, password });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err) {
      console.error(err);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;
    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({ code });
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/main/home");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <View style={styles.innerContainer}>
          <Text style={styles.brandName}>Vérification</Text>
          <Text style={styles.subtitle}>Entrez le code reçu par email</Text>
          <TextInput
            style={styles.input}
            value={code}
            placeholder="Code de vérification"
            placeholderTextColor="#aaa"
            keyboardType="number-pad"
            onChangeText={setCode}
          />
          <Pressable style={styles.button} onPress={onVerifyPress}>
            <Text style={styles.buttonText}>Vérifier mon compte</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.innerContainer}>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            value={emailAddress}
            placeholder="Email"
            placeholderTextColor="#aaa"
            onChangeText={setEmailAddress}
          />
          <TextInput
            style={styles.input}
            value={password}
            placeholder="Mot de passe"
            placeholderTextColor="#aaa"
            secureTextEntry
            onChangeText={setPassword}
          />
          <Pressable style={styles.button} onPress={onSignUpPress}>
            <Text style={styles.buttonText}>S'inscrire</Text>
          </Pressable>
        </View>

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Déjà un compte ? </Text>
          <Link href="/auth/sign-in">
            <Text style={styles.link}>Se connecter</Text>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  innerContainer: { flex: 1, justifyContent: "center", paddingHorizontal: 30 },
  brandName: { fontSize: 32, fontWeight: "800", color: "#4CAF50", textAlign: "center", marginBottom: 5 },
  subtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 40 },
  form: { width: "100%" },
  input: { backgroundColor: "#F5F5F5", padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: "#E0E0E0" },
  button: { backgroundColor: "#4CAF50", padding: 18, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  footerContainer: { flexDirection: "row", justifyContent: "center", marginTop: 30 },
  footerText: { color: "#888", fontSize: 14 },
  link: { color: "#4CAF50", fontWeight: "bold", fontSize: 14 },
});