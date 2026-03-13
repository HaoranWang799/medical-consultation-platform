import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ConsultationProvider } from "./context/ConsultationContext";
import { Toaster } from "sonner";

export default function App() {
  return (
    <AuthProvider>
      <ConsultationProvider>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </ConsultationProvider>
    </AuthProvider>
  );
}
