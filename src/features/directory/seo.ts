// SEO ของ directory (D4 — CLAUDE.md §10): JSON-LD helpers + content generator
// หน้าจังหวัด/หมวดต้องมีย่อหน้าคอนเทนต์จริง ≥150 คำจากข้อมูลจริง ไม่ใช่ list เปล่า (กัน thin content)

import type { Shop, ShopImage } from "@prisma/client";
import { SITE_URL } from "@/config/site";
import type { ShopCategory } from "@/config/shopCategories";
import { getCategoryLabel } from "@/config/categories";
import { shopPath } from "./paths";

/** URL เต็มจาก path ภายใน — encode segment ไทยให้เป็นรูปที่ crawler ใช้จริง */
export function absoluteUrl(path: string): string {
  return SITE_URL + path.split("/").map(encodeURIComponent).join("/");
}

// ---------- JSON-LD ----------

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function localBusinessJsonLd(shop: Shop & { images: ShopImage[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: shop.name,
    description: shop.description,
    url: absoluteUrl(shopPath(shop)),
    ...(shop.phone ? { telephone: shop.phone } : {}),
    address: {
      "@type": "PostalAddress",
      ...(shop.address ? { streetAddress: shop.address } : {}),
      ...(shop.district ? { addressLocality: `อำเภอ${shop.district}` } : {}),
      addressRegion: shop.province,
      addressCountry: "TH",
    },
    ...(shop.lat != null && shop.lng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: shop.lat,
            longitude: shop.lng,
          },
        }
      : {}),
    ...(shop.openHours ? { openingHours: shop.openHours } : {}),
    ...(shop.images.length ? { image: shop.images.map((i) => i.url) } : {}),
  };
}

// ---------- Content generator (ย่อหน้า ≥150 คำจากข้อมูลจริง + template ≥3 แบบสลับ) ----------

/** hash คงที่จาก string — ใช้เลือก template ให้หน้าเดิมได้ข้อความเดิมเสมอ (ไม่สุ่มต่อ render) */
function stableIndex(key: string, choices: number): number {
  let sum = 0;
  for (let i = 0; i < key.length; i++) sum = (sum + key.charCodeAt(i) * 31) % 9973;
  return sum % choices;
}

function listThai(items: string[], max = 6): string {
  const shown = items.slice(0, max);
  if (shown.length <= 1) return shown.join("");
  return `${shown.slice(0, -1).join(" ")} และ${shown[shown.length - 1]}`;
}

/** คำแนะนำการเลือกใช้บริการรายหมวด — คอนเทนต์จริงประจำหมวด (ไม่ผูกกับจังหวัด) */
const CATEGORY_GUIDE: Record<string, string> = {
  "fertilizer-chem":
    "ก่อนซื้อปุ๋ยหรือเคมีเกษตร ควรตรวจสอบทะเบียนปุ๋ย-วัตถุอันตรายบนฉลากทุกครั้ง เทียบราคาต่อกระสอบจากหลายร้าน และเลือกสูตรปุ๋ยให้ตรงกับระยะการเจริญเติบโตของพืช ร้านที่ดีมักให้คำแนะนำการใช้และอัตราผสมได้ถูกต้อง",
  seeds:
    "การเลือกซื้อเมล็ดพันธุ์ควรดูวันหมดอายุและอัตราความงอกบนซอง เลือกพันธุ์ที่เหมาะกับฤดูปลูกและสภาพดินในพื้นที่ หากซื้อจำนวนมากควรทดสอบความงอกก่อนปลูกจริง และเก็บเมล็ดในที่แห้งเย็นเสมอ",
  machinery:
    "ก่อนตัดสินใจซื้อเครื่องจักรกลเกษตร ควรสอบถามเงื่อนไขการรับประกัน ศูนย์บริการและอะไหล่ในพื้นที่ เทียบราคาทั้งเครื่องใหม่และมือสอง และทดลองเครื่องก่อนรับของทุกครั้ง โดยเฉพาะรถไถและเครื่องยนต์การเกษตร",
  "parts-repair":
    "งานซ่อมบำรุงเครื่องจักรเกษตรควรเลือกร้านที่มีอะไหล่แท้หรืออะไหล่เทียบคุณภาพดี สอบถามค่าแรงและระยะเวลาซ่อมก่อนตกลง การบำรุงรักษาตามรอบ เช่น เปลี่ยนถ่ายน้ำมันเครื่องและไส้กรอง ช่วยยืดอายุเครื่องจักรได้มาก",
  "general-supplies":
    "ร้านวัสดุเกษตรทั่วไปมักมีสินค้าหลากหลายทั้งปุ๋ย ยา เมล็ดพันธุ์ และอุปกรณ์ การซื้อจากร้านใกล้บ้านช่วยประหยัดค่าขนส่งและได้คำแนะนำที่ตรงกับสภาพพื้นที่ ควรเทียบราคาสินค้าหลักที่ใช้ประจำสัก 2-3 ร้านก่อนเลือกร้านประจำ",
  "produce-buyer":
    "ก่อนขายผลผลิตให้จุดรับซื้อ ควรโทรเช็คราคารับซื้อหน้าลานของวันนั้น สอบถามเกณฑ์การวัดความชื้นและการหักสิ่งเจือปน เทียบราคาจากหลายจุดรับซื้อ และตรวจสอบตาชั่งให้เห็นตัวเลขชัดเจนทุกครั้ง",
};

type ProvinceContentData = {
  province: string;
  shopCount: number;
  categoriesHere: { category: ShopCategory; count: number }[];
  districts: string[];
};

/** ย่อหน้าคอนเทนต์หน้าจังหวัด — ประกอบจากข้อมูลจริง: จำนวนร้าน หมวดเด่น อำเภอที่มีร้าน */
export function provinceContent(data: ProvinceContentData): string[] {
  const { province, shopCount, categoriesHere, districts } = data;
  const catBreakdown = listThai(
    categoriesHere.map((c) => `${c.category.label} (${c.count} ร้าน)`),
  );
  const districtList = listThai(districts.map((d) => `อ.${d}`));
  const topCategory = categoriesHere[0]?.category;

  const intros = [
    `รวมรายชื่อร้านค้าและตัวแทนจำหน่ายสินค้าเกษตรในจังหวัด${province}ทั้งหมด ${shopCount} ร้าน พร้อมเบอร์โทรศัพท์ ที่อยู่ เวลาเปิดทำการ และช่องทางติดต่อทาง LINE เพื่อให้เกษตรกรและผู้สนใจค้นหาร้านใกล้บ้านได้สะดวก โทรเช็คสินค้าและราคาได้ก่อนเดินทางไปถึงหน้าร้านจริง`,
    `กำลังมองหาร้านเกษตรในจังหวัด${province}อยู่หรือเปล่า? หน้านี้รวบรวมร้านค้าเกษตรในพื้นที่ไว้ ${shopCount} ร้าน ครบทั้งข้อมูลติดต่อ ที่ตั้ง และเวลาเปิด-ปิด กดโทรหาร้านได้ทันทีจากมือถือ หรือกดดูแผนที่เพื่อนำทางไปยังหน้าร้านได้เลย`,
    `ฐานข้อมูลร้านค้าเกษตรจังหวัด${province}ของ TaladKaset ตอนนี้มีร้านอยู่ในระบบ ${shopCount} ร้าน อัปเดตข้อมูลโดยทีมงานร่วมกับเจ้าของร้านในพื้นที่ แต่ละร้านมีเบอร์โทร ที่อยู่ และเวลาเปิดทำการให้ครบ เช็คก่อนออกเดินทางได้ทุกเมื่อ`,
  ];

  const parts = [intros[stableIndex(province, intros.length)]];

  const detail: string[] = [];
  if (categoriesHere.length > 0)
    detail.push(`แบ่งตามประเภทร้านได้เป็น ${catBreakdown}`);
  if (districts.length > 0)
    detail.push(
      `ครอบคลุมพื้นที่${districts.length > 1 ? ` ${districts.length} อำเภอ ได้แก่` : ""} ${districtList}`,
    );
  if (detail.length) parts.push(detail.join(" ") + " เลือกดูรายหมวดหรือรายอำเภอได้จากรายการด้านบน");

  if (topCategory && CATEGORY_GUIDE[topCategory.value])
    parts.push(CATEGORY_GUIDE[topCategory.value]);

  parts.push(
    `หากคุณเป็นเจ้าของร้านเกษตรในจังหวัด${province}ที่ยังไม่มีชื่อในหน้านี้ สามารถลงทะเบียนร้านค้ากับ TaladKaset ได้ฟรี เพื่อให้ลูกค้าในพื้นที่ค้นหาร้านของคุณเจอทั้งจากหน้านี้และจาก Google`,
  );

  return parts;
}

type CategoryContentData = {
  province: string;
  category: ShopCategory;
  shopCount: number;
  districts: string[];
  featuredNames: string[];
};

/** ย่อหน้าคอนเทนต์หน้าจังหวัด×หมวด (หน้าดัก keyword หลัก) */
export function categoryContent(data: CategoryContentData): string[] {
  const { province, category, shopCount, districts, featuredNames } = data;
  const districtList = listThai(districts.map((d) => `อ.${d}`));

  const intros = [
    `รวมร้าน${category.label}ในจังหวัด${province}ไว้ ${shopCount} ร้าน พร้อมเบอร์โทรศัพท์ ที่อยู่ และเวลาเปิดทำการของแต่ละร้าน โทรสอบถามสินค้า ราคา และสต็อกได้โดยตรงก่อนเดินทาง ไม่ต้องเสียเที่ยว`,
    `ถ้าคุณกำลังหา${category.label}ในจังหวัด${province} หน้านี้รวบรวมร้านค้าและตัวแทนจำหน่ายในพื้นที่ไว้ ${shopCount} ร้าน แต่ละร้านมีข้อมูลติดต่อครบ ทั้งเบอร์โทรที่กดโทรได้ทันทีจากมือถือ ที่อยู่พร้อมลิงก์แผนที่ และเวลาเปิด-ปิดของร้าน`,
    `ตามหาร้าน${category.label}ใกล้บ้านในจังหวัด${province}? TaladKaset รวบรวมไว้ให้แล้ว ${shopCount} ร้าน อัปเดตโดยทีมงานร่วมกับเจ้าของร้านจริงในพื้นที่ เลือกดูรายละเอียด เบอร์โทร และแผนที่ของแต่ละร้านได้จากรายการด้านบน`,
  ];

  const parts = [intros[stableIndex(`${province}|${category.value}`, intros.length)]];

  const detail: string[] = [];
  if (districts.length > 0)
    detail.push(
      `ร้านในหมวดนี้กระจายอยู่ในพื้นที่ ${districtList} ของจังหวัด${province}`,
    );
  if (featuredNames.length > 0)
    detail.push(`ร้านแนะนำในหมวดนี้ เช่น ${listThai(featuredNames, 3)}`);
  if (detail.length) parts.push(detail.join(" "));

  if (CATEGORY_GUIDE[category.value]) parts.push(CATEGORY_GUIDE[category.value]);

  parts.push(
    `นอกจากรายชื่อร้านแล้ว ยังดูประกาศซื้อขาย${listThai(
      category.listingCategories.map(getCategoryLabel),
    )}จากเกษตรกรและผู้ขายในจังหวัด${province}ได้จากลิงก์ด้านล่าง หรืออ่านบทความความรู้เกษตรที่เกี่ยวข้องประกอบการตัดสินใจ ส่วนเจ้าของร้าน${category.label}ในจังหวัด${province}ที่ยังไม่มีชื่อบนหน้านี้ ลงทะเบียนร้านค้ากับ TaladKaset ได้ฟรี เพื่อให้ลูกค้าในพื้นที่ค้นหาร้านของคุณเจอง่ายขึ้น`,
  );

  return parts;
}
