// Seed รายการราคากลางเริ่มต้น (P1) — upsert ตาม slug รันซ้ำได้ไม่ duplicate ไม่แตะราคาที่กรอกไว้
// รัน: npx tsx scripts/seed-price-items.ts   (dev)  |  ผ่าน dotenv-cli -e .env.production-db (prod)
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

type Item = {
  slug: string;
  name: string;
  category: string; // ตรงกับ config/priceCategories.ts (value)
  unit: string;
  sourceName: string;
};

// order = ลำดับในอาเรย์ (จัดกลุ่มตามหมวดไว้แล้ว)
const ITEMS: Item[] = [
  // ── ข้าว-พืชไร่ ──
  { slug: "ข้าวเปลือกหอมมะลิ", name: "ข้าวเปลือกหอมมะลิ", category: "field-crops", unit: "บาท/ตัน", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "ข้าวเปลือกเหนียว", name: "ข้าวเปลือกเหนียว", category: "field-crops", unit: "บาท/ตัน", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "ข้าวเปลือกเจ้า-5", name: "ข้าวเปลือกเจ้า 5%", category: "field-crops", unit: "บาท/ตัน", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "มันสำปะหลัง", name: "มันสำปะหลัง (เชื้อแป้ง 25%)", category: "field-crops", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "ข้าวโพดเลี้ยงสัตว์", name: "ข้าวโพดเลี้ยงสัตว์ (ความชื้น 14.5%)", category: "field-crops", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "อ้อยโรงงาน", name: "อ้อยโรงงาน (10 ซีซีเอส)", category: "field-crops", unit: "บาท/ตัน", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "ยางแผ่นดิบ", name: "ยางแผ่นดิบ ชั้น 3", category: "field-crops", unit: "บาท/กก.", sourceName: "การยางแห่งประเทศไทย" },
  { slug: "ปาล์มน้ำมัน", name: "ปาล์มน้ำมัน (ทั้งทะลาย)", category: "field-crops", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  // ── ผัก ──
  { slug: "พริกขี้หนูสวน", name: "พริกขี้หนูสวน", category: "vegetables", unit: "บาท/กก.", sourceName: "ตลาดกลางสินค้าเกษตร" },
  { slug: "คะน้า", name: "คะน้า", category: "vegetables", unit: "บาท/กก.", sourceName: "ตลาดกลางสินค้าเกษตร" },
  { slug: "กะหล่ำปลี", name: "กะหล่ำปลี", category: "vegetables", unit: "บาท/กก.", sourceName: "ตลาดกลางสินค้าเกษตร" },
  { slug: "มะนาว", name: "มะนาว (เบอร์ 1-2)", category: "vegetables", unit: "บาท/ผล", sourceName: "ตลาดกลางสินค้าเกษตร" },
  { slug: "มะเขือเทศสีดา", name: "มะเขือเทศสีดา", category: "vegetables", unit: "บาท/กก.", sourceName: "ตลาดกลางสินค้าเกษตร" },
  // ── ผลไม้ ──
  { slug: "ทุเรียนหมอนทอง", name: "ทุเรียนหมอนทอง", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "มังคุด", name: "มังคุด", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "ลำไย", name: "ลำไย เกรด AA", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "กล้วยหอมทอง", name: "กล้วยหอมทอง", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "มะม่วงน้ำดอกไม้", name: "มะม่วงน้ำดอกไม้", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  { slug: "เงาะโรงเรียน", name: "เงาะโรงเรียน", category: "fruits", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  // ── ปศุสัตว์ ──
  { slug: "สุกรมีชีวิตหน้าฟาร์ม", name: "สุกรมีชีวิตหน้าฟาร์ม", category: "livestock", unit: "บาท/กก.", sourceName: "สมาคมผู้เลี้ยงสุกรแห่งชาติ" },
  { slug: "ไก่เนื้อหน้าฟาร์ม", name: "ไก่เนื้อหน้าฟาร์ม", category: "livestock", unit: "บาท/กก.", sourceName: "สมาคมผู้เลี้ยงไก่เนื้อ" },
  { slug: "ไข่ไก่คละหน้าฟาร์ม", name: "ไข่ไก่คละหน้าฟาร์ม", category: "livestock", unit: "บาท/ฟอง", sourceName: "เครือข่ายสหกรณ์ผู้เลี้ยงไก่ไข่" },
  { slug: "โคเนื้อมีชีวิต", name: "โคเนื้อมีชีวิต", category: "livestock", unit: "บาท/กก.", sourceName: "สำนักงานเศรษฐกิจการเกษตร" },
  // ── ประมง ──
  { slug: "ปลานิล", name: "ปลานิล (ขนาด 3 ตัว/กก.)", category: "fishery", unit: "บาท/กก.", sourceName: "กรมประมง" },
  { slug: "ปลาดุกบิ๊กอุย", name: "ปลาดุกบิ๊กอุย", category: "fishery", unit: "บาท/กก.", sourceName: "กรมประมง" },
  { slug: "กุ้งขาวแวนนาไม", name: "กุ้งขาวแวนนาไม (70 ตัว/กก.)", category: "fishery", unit: "บาท/กก.", sourceName: "กรมประมง" },
];

async function main() {
  let created = 0;
  let updated = 0;
  for (let i = 0; i < ITEMS.length; i++) {
    const it = ITEMS[i];
    const res = await prisma.priceItem.upsert({
      where: { slug: it.slug },
      create: { ...it, order: i + 1 },
      // ไม่แตะ active/entries ที่มีอยู่ (รันซ้ำแล้วราคาไม่หาย)
      update: { name: it.name, category: it.category, unit: it.unit, sourceName: it.sourceName, order: i + 1 },
    });
    if (res.createdAt.getTime() === res.updatedAt.getTime()) created++;
    else updated++;
  }
  const total = await prisma.priceItem.count();
  console.log(`seed ราคากลาง: สร้าง ~${created} · อัปเดต ~${updated} · รวมในระบบ ${total} รายการ`);
}

main().finally(() => prisma.$disconnect());
