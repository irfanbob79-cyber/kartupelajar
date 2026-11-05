import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Profil Sekolah
  const existingSchool = await prisma.schoolProfile.findFirst();
  let school = existingSchool;
  if (!existingSchool) {
    school = await prisma.schoolProfile.create({
      data: {
        schoolName: "SMK NEGERI 1 LABUHAN MARINGGAI",
        npsn: "10806050",
        address: "Jl. Raya Maringgai No. 1, Desa Maringgai, Kec. Labuhan Maringgai, Kab. Lampung Timur",
        phone: "(0725) 7654321",
        website: "smkn1labuhanmaringgai.sch.id",
        principalName: "Drs. H. Ahmad Dahlan, M.Pd.",
        principalNip: "19750817 200003 1 004",
        academicYear: "2026/2027",
        cityIssued: "Labuhan Maringgai",
      },
    });
    console.log("School profile created:", school.schoolName);
  }

  // 2. Jurusan
  const majorsData = [
    {
      code: "DKV",
      name: "Desain Komunikasi Visual",
      themeColor: "#1E40AF", // Blue
      accentColor: "#F59E0B", // Amber
    },
    {
      code: "TSM",
      name: "Teknik Sepeda Motor",
      themeColor: "#C2410C", // Orange Red
      accentColor: "#4B5563", // Gray
    },
    {
      code: "PBS",
      name: "Perbankan Syariah",
      themeColor: "#065F46", // Emerald
      accentColor: "#D97706", // Gold
    },
    {
      code: "TKJ",
      name: "Teknik Komputer & Jaringan",
      themeColor: "#0F766E", // Teal
      accentColor: "#0284C7", // Sky
    },
  ];

  const majorsMap = new Map();
  for (const item of majorsData) {
    const major = await prisma.major.upsert({
      where: { code: item.code },
      update: item,
      create: item,
    });
    majorsMap.set(item.code, major);
    console.log(`Major ready: [${major.code}] ${major.name}`);
  }

  // 3. Data Siswa Contoh
  const sampleStudents = [
    {
      nis: "2425001",
      nisn: "0078912345",
      fullName: "ANDI PRATAMA",
      birthPlace: "Lampung Timur",
      birthDate: "14 Mei 2008",
      gender: "L",
      address: "Jl. Lintas Pantai Timur No. 12, Labuhan Maringgai",
      majorId: majorsMap.get("DKV")?.id,
      validUntil: "Juli 2027",
      status: "AKTIF",
    },
    {
      nis: "2425002",
      nisn: "0078912346",
      fullName: "SITI NURHALIZA",
      birthPlace: "Bandar Lampung",
      birthDate: "22 Agustus 2008",
      gender: "P",
      address: "Dusun Sukamaju RT 02/01, Desa Karang Anyar",
      majorId: majorsMap.get("PBS")?.id,
      validUntil: "Juli 2027",
      status: "AKTIF",
    },
    {
      nis: "2425003",
      nisn: "0078912347",
      fullName: "BAYU ADITYA RAMADHAN",
      birthPlace: "Metro",
      birthDate: "03 November 2007",
      gender: "L",
      address: "Jl. Raya Muara Gading Mas No. 45",
      majorId: majorsMap.get("TSM")?.id,
      validUntil: "Juli 2027",
      status: "AKTIF",
    },
    {
      nis: "2425004",
      nisn: "0078912348",
      fullName: "PUTRI AYU LESTARI",
      birthPlace: "Lampung Timur",
      birthDate: "19 Januari 2008",
      gender: "P",
      address: "Kecamatan Labuhan Maringgai, Lampung Timur",
      majorId: majorsMap.get("TKJ")?.id,
      validUntil: "Juli 2027",
      status: "AKTIF",
    },
  ];

  for (const st of sampleStudents) {
    if (st.majorId) {
      await prisma.student.upsert({
        where: { nis: st.nis },
        update: st,
        create: st,
      });
      console.log(`Student ready: ${st.nis} - ${st.fullName}`);
    }
  }

  // 4. Default Card Template
  const existingTemplate = await prisma.cardTemplate.findFirst({
    where: { isDefault: true },
  });

  if (!existingTemplate) {
    await prisma.cardTemplate.create({
      data: {
        name: "Template Standar Nasional CR80",
        orientation: "PORTRAIT",
        isDefault: true,
        frontConfig: JSON.stringify({
          showLogoLeft: true,
          showLogoRight: true,
          showBarcode: true,
          showSloganBadge: true,
        }),
        backConfig: JSON.stringify({
          showRules: true,
          showSignature: true,
          showStamp: true,
          showQrCode: true,
        }),
      },
    });
    console.log("Default card template created.");
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

