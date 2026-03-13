import bcrypt from "bcryptjs";
import { prisma } from "./prisma.js";

export async function ensureDefaultUsers(): Promise<void> {
  const doctorEmail = "doctor@example.com";
  const patientEmail = "patient@example.com";

  const [doctor, patient] = await Promise.all([
    prisma.user.findUnique({ where: { email_role: { email: doctorEmail, role: "doctor" } } }),
    prisma.user.findUnique({ where: { email_role: { email: patientEmail, role: "patient" } } }),
  ]);

  if (!doctor) {
    await prisma.user.create({
      data: {
        id: "doctor-1",
        name: "张医生",
        email: doctorEmail,
        password: await bcrypt.hash("doctor123", 10),
        role: "doctor",
        phone: "13800000001",
        hospital: "上海市第一人民医院",
        department: "内科",
        title: "主治医师",
        bio: "擅长常见慢性病管理与线上健康咨询。",
      },
    });
  }

  if (!patient) {
    await prisma.user.create({
      data: {
        id: "patient-1",
        name: "李明",
        email: patientEmail,
        password: await bcrypt.hash("patient123", 10),
        role: "patient",
        phone: "13800000002",
        gender: "男",
        birthDate: "1995-03-10",
        allergies: "青霉素",
        medicalHistory: "轻度过敏性鼻炎",
      },
    });
  }
}
