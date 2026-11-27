export type Voucher = { name: string; code: string; off: string; until: string; status: "Active" | "Used" | "Expired" };

export const VOUCHERS: Voucher[] = [
  { name: "Voucher Individual Only", code: "CODE1111", off: "80% OFF", until: "12/11/2026 10:11", status: "Active" },
  { name: "SNTKDEDVD", code: "ANTRUONG98", off: "10% OFF", until: "12/10/2026 17:47", status: "Active" },
  { name: "WorldCup2026", code: "WCSM2026", off: "10% OFF", until: "11/28/2026 11:45", status: "Active" },
  { name: "Welcome back", code: "WELCOME10", off: "10% OFF", until: "01/15/2027 23:59", status: "Used" },
  { name: "Summer Posture", code: "SUMMER26", off: "20% OFF", until: "08/31/2026 23:59", status: "Expired" },
];

/** extra sample vouchers for the "many vouchers" preview case */
export const MORE_VOUCHERS: Voucher[] = [
  { name: "Lunar New Year", code: "TET2027", off: "30% OFF", until: "02/20/2027 23:59", status: "Active" },
  { name: "Black Friday", code: "BLACKFRI", off: "25% OFF", until: "11/30/2026 23:59", status: "Active" },
  { name: "Refer a friend", code: "FRIEND15", off: "15% OFF", until: "03/31/2027 23:59", status: "Active" },
  { name: "Desk Health Week", code: "DESK20", off: "20% OFF", until: "12/20/2026 23:59", status: "Active" },
  { name: "Student", code: "STUDENT5", off: "5% OFF", until: "06/30/2027 23:59", status: "Active" },
];

/** "80% OFF" → 0.8 */
export const voucherRate = (v: Voucher) => (parseInt(v.off, 10) || 0) / 100;
/** vouchers named "… Individual Only" only apply to the Individual plan */
export const voucherFits = (v: Voucher, planId: string) => !/individual only/i.test(v.name) || planId === "individual";
/** "12/11/2026 10:11" → "Dec 11, 2026" */
export const voucherUntil = (v: Voucher) => {
  const [mm, dd, rest] = v.until.split("/");
  return new Date(`${rest.slice(0, 4)}-${mm}-${dd}T00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
