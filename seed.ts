import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ISZ Now...");

  // ── Users ──
  const admin = await prisma.user.upsert({
    where: { email: "admin@isznow.com" },
    update: {},
    create: {
      name: "ISZ Admin",
      email: "admin@isznow.com",
      password: await bcrypt.hash("admin123", 10),
      role: "ADMIN",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@isznow.com" },
    update: {},
    create: {
      name: "Karim Boudiaf",
      email: "agent@isznow.com",
      password: await bcrypt.hash("agent123", 10),
      role: "AGENT",
      pointsBalance: 1000,
    },
  });

  // Extra mock agents so the admin table looks populated
  const mockAgents = [
    { name: "Amina Benali", email: "amina@isznow.com", points: 250 },
    { name: "Yacine Haddad", email: "yacine@isznow.com", points: 5400 },
    { name: "Sara Messaoudi", email: "sara@isznow.com", points: 0 },
  ];
  const hashed = await bcrypt.hash("agent123", 10);
  for (const m of mockAgents) {
    await prisma.user.upsert({
      where: { email: m.email },
      update: {},
      create: { name: m.name, email: m.email, password: hashed, role: "AGENT", pointsBalance: m.points },
    });
  }

  // ── Services ──
  const services = [
    { slug: "cv", nameAr: "منشئ السيرة الذاتية", nameFr: "Générateur de CV", descriptionAr: "سيرة ذاتية احترافية جاهزة للطباعة", descriptionFr: "CV professionnel prêt à imprimer", category: "career", pointsCost: 20, templateType: "CV" as const },
    { slug: "research", nameAr: "بحث مدرسي", nameFr: "Recherche scolaire", descriptionAr: "بحث مدرسي منظم بمقدمة وخاتمة ومراجع", descriptionFr: "Exposé scolaire structuré", category: "education", pointsCost: 30, templateType: "RESEARCH" as const },
    { slug: "invoice", nameAr: "منشئ الفواتير", nameFr: "Générateur de factures", descriptionAr: "فاتورة احترافية مع حساب الرسوم", descriptionFr: "Facture professionnelle avec TVA", category: "business", pointsCost: 15, templateType: "INVOICE" as const },
    { slug: "letter", nameAr: "الرسائل الإدارية", nameFr: "Courriers administratifs", descriptionAr: "طلبات وشكاوى ورسائل رسمية", descriptionFr: "Demandes, réclamations et lettres officielles", category: "admin", pointsCost: 10, templateType: "LETTER" as const },
  ];
  const created = [];
  for (const s of services) {
    created.push(await prisma.service.upsert({ where: { slug: s.slug }, update: {}, create: s }));
  }

  // ── Recharge cards ──
  const batchExists = await prisma.rechargeBatch.findFirst({ where: { packName: "Seed Pack" } });
  if (!batchExists) {
    await prisma.rechargeBatch.create({
      data: {
        packName: "Seed Pack",
        points: 4000,
        priceDzd: 1500,
        quantity: 5,
        createdById: admin.id,
        cards: {
          create: [
            "123456789012",
            "234567890123",
            "345678901234",
            "456789012345",
            "567890123456",
          ].map((code) => ({ code, points: 4000, priceDzd: 1500 })),
        },
      },
    });
  }

  // ── Mock documents for the agent so the dashboard looks populated ──
  const hasDocs = await prisma.document.count({ where: { userId: agent.id } });
  if (hasDocs === 0) {
    const [cv, research, invoice, letter] = created;
    const mockDocs = [
      { svc: cv, input: { fullName: "Mohamed Ali", jobTitle: "Développeur Web" }, text: "# Mohamed Ali\n**Développeur Web**\n\n## Profil\nDéveloppeur passionné.\n\n## Compétences\n- React\n- Node.js", hoursAgo: 2 },
      { svc: letter, input: { subject: "Demande de congé" }, text: "**Objet :** Demande de congé\n\nMadame, Monsieur,\n\nJe sollicite un congé annuel.\n\nCordialement.", hoursAgo: 26 },
      { svc: research, input: { subject: "الطاقة الشمسية" }, text: "# الطاقة الشمسية\n\n## المقدمة\nالطاقة الشمسية مصدر متجدد.\n\n## الخاتمة\nمستقبل واعد.", hoursAgo: 50 },
      { svc: invoice, input: { buyer: "SARL Bensalem" }, text: "# FACTURE\n\n**Client :** SARL Bensalem\n\n**Total TTC :** 11 900 DZD", hoursAgo: 75 },
    ];
    for (const d of mockDocs) {
      await prisma.document.create({
        data: {
          userId: agent.id,
          serviceId: d.svc.id,
          inputData: d.input,
          outputContent: d.text,
          status: "COMPLETED",
          language: "fr",
          pointsCharged: d.svc.pointsCost,
          createdAt: new Date(Date.now() - d.hoursAgo * 3600 * 1000),
        },
      });
    }
  }

  console.log("Done.");
  console.log("Admin : admin@isznow.com / admin123");
  console.log("Agent : agent@isznow.com / agent123 (1000 points)");
  console.log("Cards : 123456789012, 234567890123, 345678901234, 456789012345, 567890123456 (4000 pts each)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
