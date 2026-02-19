import { Redirect, Stack } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";

export default function AuthLayout() {
  const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/main/home" />;
  }

  return (
    <Stack>
      {/* On utilise les vrais noms de tes fichiers ici ! */}
      <Stack.Screen name="sign-in" options={{ title: "Connexion" }} />
      <Stack.Screen name="sign-up" options={{ title: "Inscription" }} />
    </Stack>
  );
}