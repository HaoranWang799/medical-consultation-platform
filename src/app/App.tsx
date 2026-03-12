import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/AuthContext";
import { ConsultationProvider } from "./context/ConsultationContext";

export default function App() {
  return (
    <AuthProvider>
      <ConsultationProvider>
        <RouterProvider router={router} />
      </ConsultationProvider>
    </AuthProvider>
  );
}
