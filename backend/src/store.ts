import bcrypt from "bcryptjs";
import type { User, Consultation, ChatMessage } from "./types.js";

// In-memory stores
export const users = new Map<string, User>();
export const consultations = new Map<string, Consultation>();
export const messages = new Map<string, ChatMessage[]>(); // consultationId -> messages[]

// Seed with initial data
const doctorHash = bcrypt.hashSync("doctor123", 10);
const patientHash = bcrypt.hashSync("patient123", 10);

const doctor: User = {
  id: "doctor-1",
  name: "张医生",
  email: "doctor@example.com",
  passwordHash: doctorHash,
  role: "doctor",
  createdAt: "2026-01-01T00:00:00Z",
};

const patient: User = {
  id: "patient-1",
  name: "李明",
  email: "patient@example.com",
  passwordHash: patientHash,
  role: "patient",
  createdAt: "2026-01-01T00:00:00Z",
};

users.set(doctor.id, doctor);
users.set(patient.id, patient);

// Seed consultations
const seedConsultations: Consultation[] = [
  {
    id: "C20260301",
    patientId: "patient-1",
    patientName: "李明",
    symptoms: "持续头痛三天,伴有轻微发热和乏力感",
    status: "doctor_replied",
    createdAt: "2026-03-10 09:30",
  },
  {
    id: "C20260302",
    patientId: "patient-1",
    patientName: "王芳",
    symptoms: "胃部不适,饭后胀气,偶尔反酸",
    status: "pending",
    createdAt: "2026-03-11 14:20",
  },
  {
    id: "C20260303",
    patientId: "patient-1",
    patientName: "张伟",
    symptoms: "右膝关节疼痛,上下楼梯加重",
    status: "completed",
    createdAt: "2026-03-08 11:00",
  },
];

seedConsultations.forEach((c) => consultations.set(c.id, c));

// Seed messages
messages.set("C20260301", [
  { id: "m1", consultationId: "C20260301", sender: "patient", content: "医生你好,我持续头痛三天了,伴有轻微发热和乏力感。", timestamp: "2026-03-10 09:30" },
  { id: "m2", consultationId: "C20260301", sender: "doctor", content: "您好,请问体温具体是多少度?有没有其他症状,比如咳嗽、流鼻涕?", timestamp: "2026-03-10 10:15" },
  { id: "m3", consultationId: "C20260301", sender: "patient", content: "体温37.8度,有轻微咳嗽,没有流鼻涕。", timestamp: "2026-03-10 10:20" },
  { id: "m4", consultationId: "C20260301", sender: "doctor", content: "根据您的症状,建议先服用布洛芬退热,多喝水多休息。如果持续3天以上建议来院做血常规检查。", timestamp: "2026-03-10 10:30" },
]);

messages.set("C20260302", [
  { id: "m5", consultationId: "C20260302", sender: "patient", content: "胃部不适已经一周了,饭后胀气严重,偶尔有反酸的情况。", timestamp: "2026-03-11 14:20" },
]);

messages.set("C20260303", [
  { id: "m6", consultationId: "C20260303", sender: "patient", content: "右膝关节疼痛已有两周,上下楼梯时明显加重。", timestamp: "2026-03-08 11:00" },
  { id: "m7", consultationId: "C20260303", sender: "doctor", content: "建议做膝关节X光检查,暂时减少剧烈运动,可外用扶他林软膏。", timestamp: "2026-03-08 14:00" },
  { id: "m8", consultationId: "C20260303", sender: "patient", content: "好的,谢谢医生。", timestamp: "2026-03-08 14:10" },
]);
