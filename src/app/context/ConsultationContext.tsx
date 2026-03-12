import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { api } from "../../lib/api";
import { useAuth } from "./AuthContext";

export type ConsultationStatus = "pending" | "doctor_replied" | "completed";

export interface ChatMessage {
  id: string;
  sender: "patient" | "doctor" | "ai";
  content: string;
  timestamp: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  symptoms: string;
  status: ConsultationStatus;
  createdAt: string;
  messages: ChatMessage[];
}

interface ConsultationContextType {
  consultations: Consultation[];
  isLoading: boolean;
  fetchConsultations: () => Promise<void>;
  refreshConsultation: (consultationId: string) => Promise<Consultation | null>;
  addConsultation: (symptoms: string, aiMessages: ChatMessage[]) => Promise<string>;
  addMessage: (consultationId: string, message: Omit<ChatMessage, "id">) => Promise<void>;
  updateStatus: (consultationId: string, status: ConsultationStatus) => Promise<void>;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchConsultations = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await api.get<Consultation[]>("/consultations");
      setConsultations(data);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // 登录后自动拉取咨询列表
  useEffect(() => {
    if (user) {
      fetchConsultations();
    } else {
      setConsultations([]);
    }
  }, [user, fetchConsultations]);

  const refreshConsultation = useCallback(async (consultationId: string): Promise<Consultation | null> => {
    try {
      const data = await api.get<Consultation>(`/consultations/${consultationId}`);
      setConsultations((prev) =>
        prev.map((c) => (c.id === consultationId ? data : c))
      );
      return data;
    } catch {
      return null;
    }
  }, []);

  const addConsultation = async (
    symptoms: string,
    aiMessages: ChatMessage[]
  ): Promise<string> => {
    const data = await api.post<Consultation>("/consultations", {
      symptoms,
      initialMessages: aiMessages,
    });
    setConsultations((prev) => [data, ...prev]);
    return data.id;
  };

  const addMessage = async (
    consultationId: string,
    message: Omit<ChatMessage, "id">
  ): Promise<void> => {
    const msg = await api.post<ChatMessage>(
      `/consultations/${consultationId}/messages`,
      { content: message.content }
    );
    setConsultations((prev) =>
      prev.map((c) =>
        c.id === consultationId
          ? { ...c, messages: [...(c.messages ?? []), msg] }
          : c
      )
    );
  };

  const updateStatus = async (
    consultationId: string,
    status: ConsultationStatus
  ): Promise<void> => {
    const updated = await api.patch<Consultation>(
      `/consultations/${consultationId}/status`,
      { status }
    );
    setConsultations((prev) =>
      prev.map((c) => (c.id === consultationId ? updated : c))
    );
  };

  return (
    <ConsultationContext.Provider
      value={{ consultations, isLoading, fetchConsultations, refreshConsultation, addConsultation, addMessage, updateStatus }}
    >
      {children}
    </ConsultationContext.Provider>
  );
}

export function useConsultations() {
  const ctx = useContext(ConsultationContext);
  if (!ctx) throw new Error("useConsultations must be used within ConsultationProvider");
  return ctx;
}
