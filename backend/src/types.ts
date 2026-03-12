export type UserRole = "patient" | "doctor";

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export type ConsultationStatus = "pending" | "doctor_replied" | "completed";

export interface ChatMessage {
  id: string;
  consultationId: string;
  sender: "patient" | "doctor" | "ai";
  content: string;
  timestamp: string;
}

export interface Consultation {
  id: string;
  patientId: string;
  patientName: string;
  symptoms: string;
  status: ConsultationStatus;
  createdAt: string;
}

export interface JwtPayload {
  userId: string;
  role: UserRole;
}
