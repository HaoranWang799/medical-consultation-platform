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
      },
    });
  }
}
