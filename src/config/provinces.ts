// 77 จังหวัด + ภูมิภาค — ค่าคงที่ทางธุรกิจ แก้ที่นี่ที่เดียว
// เก็บชื่อจังหวัดภาษาไทยตรงๆ ใน DB (ตรงกับ Listing.province)

export type Region =
  | "เหนือ"
  | "ตะวันออกเฉียงเหนือ"
  | "กลาง"
  | "ตะวันออก"
  | "ตะวันตก"
  | "ใต้";

export type Province = {
  name: string;
  region: Region;
};

export const REGIONS: Region[] = [
  "เหนือ",
  "ตะวันออกเฉียงเหนือ",
  "กลาง",
  "ตะวันออก",
  "ตะวันตก",
  "ใต้",
];

export const PROVINCES: Province[] = [
  // เหนือ (9)
  { name: "เชียงราย", region: "เหนือ" },
  { name: "เชียงใหม่", region: "เหนือ" },
  { name: "น่าน", region: "เหนือ" },
  { name: "พะเยา", region: "เหนือ" },
  { name: "แพร่", region: "เหนือ" },
  { name: "แม่ฮ่องสอน", region: "เหนือ" },
  { name: "ลำปาง", region: "เหนือ" },
  { name: "ลำพูน", region: "เหนือ" },
  { name: "อุตรดิตถ์", region: "เหนือ" },
  // ตะวันออกเฉียงเหนือ (20)
  { name: "กาฬสินธุ์", region: "ตะวันออกเฉียงเหนือ" },
  { name: "ขอนแก่น", region: "ตะวันออกเฉียงเหนือ" },
  { name: "ชัยภูมิ", region: "ตะวันออกเฉียงเหนือ" },
  { name: "นครพนม", region: "ตะวันออกเฉียงเหนือ" },
  { name: "นครราชสีมา", region: "ตะวันออกเฉียงเหนือ" },
  { name: "บึงกาฬ", region: "ตะวันออกเฉียงเหนือ" },
  { name: "บุรีรัมย์", region: "ตะวันออกเฉียงเหนือ" },
  { name: "มหาสารคาม", region: "ตะวันออกเฉียงเหนือ" },
  { name: "มุกดาหาร", region: "ตะวันออกเฉียงเหนือ" },
  { name: "ยโสธร", region: "ตะวันออกเฉียงเหนือ" },
  { name: "ร้อยเอ็ด", region: "ตะวันออกเฉียงเหนือ" },
  { name: "เลย", region: "ตะวันออกเฉียงเหนือ" },
  { name: "ศรีสะเกษ", region: "ตะวันออกเฉียงเหนือ" },
  { name: "สกลนคร", region: "ตะวันออกเฉียงเหนือ" },
  { name: "สุรินทร์", region: "ตะวันออกเฉียงเหนือ" },
  { name: "หนองคาย", region: "ตะวันออกเฉียงเหนือ" },
  { name: "หนองบัวลำภู", region: "ตะวันออกเฉียงเหนือ" },
  { name: "อำนาจเจริญ", region: "ตะวันออกเฉียงเหนือ" },
  { name: "อุดรธานี", region: "ตะวันออกเฉียงเหนือ" },
  { name: "อุบลราชธานี", region: "ตะวันออกเฉียงเหนือ" },
  // กลาง (22)
  { name: "กรุงเทพมหานคร", region: "กลาง" },
  { name: "กำแพงเพชร", region: "กลาง" },
  { name: "ชัยนาท", region: "กลาง" },
  { name: "นครนายก", region: "กลาง" },
  { name: "นครปฐม", region: "กลาง" },
  { name: "นครสวรรค์", region: "กลาง" },
  { name: "นนทบุรี", region: "กลาง" },
  { name: "ปทุมธานี", region: "กลาง" },
  { name: "พระนครศรีอยุธยา", region: "กลาง" },
  { name: "พิจิตร", region: "กลาง" },
  { name: "พิษณุโลก", region: "กลาง" },
  { name: "เพชรบูรณ์", region: "กลาง" },
  { name: "ลพบุรี", region: "กลาง" },
  { name: "สมุทรปราการ", region: "กลาง" },
  { name: "สมุทรสงคราม", region: "กลาง" },
  { name: "สมุทรสาคร", region: "กลาง" },
  { name: "สระบุรี", region: "กลาง" },
  { name: "สิงห์บุรี", region: "กลาง" },
  { name: "สุโขทัย", region: "กลาง" },
  { name: "สุพรรณบุรี", region: "กลาง" },
  { name: "อ่างทอง", region: "กลาง" },
  { name: "อุทัยธานี", region: "กลาง" },
  // ตะวันออก (7)
  { name: "จันทบุรี", region: "ตะวันออก" },
  { name: "ฉะเชิงเทรา", region: "ตะวันออก" },
  { name: "ชลบุรี", region: "ตะวันออก" },
  { name: "ตราด", region: "ตะวันออก" },
  { name: "ปราจีนบุรี", region: "ตะวันออก" },
  { name: "ระยอง", region: "ตะวันออก" },
  { name: "สระแก้ว", region: "ตะวันออก" },
  // ตะวันตก (5)
  { name: "กาญจนบุรี", region: "ตะวันตก" },
  { name: "ตาก", region: "ตะวันตก" },
  { name: "ประจวบคีรีขันธ์", region: "ตะวันตก" },
  { name: "เพชรบุรี", region: "ตะวันตก" },
  { name: "ราชบุรี", region: "ตะวันตก" },
  // ใต้ (14)
  { name: "กระบี่", region: "ใต้" },
  { name: "ชุมพร", region: "ใต้" },
  { name: "ตรัง", region: "ใต้" },
  { name: "นครศรีธรรมราช", region: "ใต้" },
  { name: "นราธิวาส", region: "ใต้" },
  { name: "ปัตตานี", region: "ใต้" },
  { name: "พังงา", region: "ใต้" },
  { name: "พัทลุง", region: "ใต้" },
  { name: "ภูเก็ต", region: "ใต้" },
  { name: "ยะลา", region: "ใต้" },
  { name: "ระนอง", region: "ใต้" },
  { name: "สงขลา", region: "ใต้" },
  { name: "สตูล", region: "ใต้" },
  { name: "สุราษฎร์ธานี", region: "ใต้" },
];

export const PROVINCE_NAMES = PROVINCES.map((p) => p.name);

export function getProvincesByRegion(region: Region): Province[] {
  return PROVINCES.filter((p) => p.region === region);
}
