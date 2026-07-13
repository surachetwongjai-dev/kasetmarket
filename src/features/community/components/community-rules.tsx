// กติกาชุมชนสั้นๆ (C2) — แสดงหน้าตั้งกระทู้ + ลิงก์จาก hub

const RULES = [
  "สุภาพ ให้เกียรติกัน ไม่โจมตีส่วนตัว",
  "ตั้งกระทู้ตรงหมวด เขียนหัวข้อให้ชัด",
  "ห้ามสแปม/โฆษณาขายของ (ลงประกาศได้ที่หน้าประกาศ)",
  "ไม่โพสข้อมูลเท็จ/หลอกลวง หรือเนื้อหาผิดกฎหมาย",
  "เจอเนื้อหาไม่เหมาะสม กดปุ่ม 🚩 รายงานได้เลย",
];

export function CommunityRules() {
  return (
    <div className="rounded-xl border border-border bg-muted/40 p-4">
      <p className="text-sm font-semibold text-primary-dk">กติกาชุมชน</p>
      <ol className="mt-2 flex list-inside list-decimal flex-col gap-1 text-sm text-muted-foreground">
        {RULES.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ol>
    </div>
  );
}
