import { ImageResponse } from "next/og";

export const dynamic = "force-static";

/** Open Graph / Twitter card. English text only (the default OG font has no Devanagari glyphs). */
export async function GET() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "#f7fafc", padding: 72, fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#0a7f5a", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 30, borderRadius: 9, background: "#fff", display: "flex" }} />
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, color: "#0f172a" }}>saral</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 700, color: "#0f172a", lineHeight: 1.05, letterSpacing: -2 }}>Appointments on WhatsApp.</div>
          <div style={{ fontSize: 84, fontWeight: 700, color: "#0a7f5a", lineHeight: 1.05, letterSpacing: -2 }}>Made Saral.</div>
        </div>
        <div style={{ fontSize: 30, color: "#475569" }}>WhatsApp AI appointment assistant for clinics and hospitals</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
