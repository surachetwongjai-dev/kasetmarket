// features/shipping — เช็คค่าขนส่งทุกค่าย (PLAN-PHASE2.md กลุ่ม S / S1)

export { ShippingCalculator } from "./components/shipping-calculator";
export { SHIPPING_BASE, shippingAbsoluteUrl } from "./paths";
export {
  quoteAll,
  servicePrice,
  volumetricKg,
  chargeableKg,
  type QuoteRow,
  type Dimensions,
} from "./calc";
