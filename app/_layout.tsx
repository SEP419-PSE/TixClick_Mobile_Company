import { Stack } from "expo-router";
import "./global.css";
import { AuthProvider } from '../app/context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
