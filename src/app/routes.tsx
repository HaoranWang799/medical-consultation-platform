import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/layout/RootLayout";
import { LoginPage } from "./components/pages/LoginPage";
import { HomePage } from "./components/pages/HomePage";
import { SymptomsPage } from "./components/pages/SymptomsPage";
import { AIChatPage } from "./components/pages/AIChatPage";
import { ConsultationListPage } from "./components/pages/ConsultationListPage";
import { ConsultationChatPage } from "./components/pages/ConsultationChatPage";
import { DoctorDashboardPage } from "./components/pages/DoctorDashboardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LoginPage },
      { path: "home", Component: HomePage },
      { path: "symptoms", Component: SymptomsPage },
      { path: "ai-chat", Component: AIChatPage },
      { path: "consultations", Component: ConsultationListPage },
      { path: "consultation/:id", Component: ConsultationChatPage },
      { path: "doctor", Component: DoctorDashboardPage },
    ],
  },
]);
