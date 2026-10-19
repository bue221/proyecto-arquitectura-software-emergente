import { ImageResponse } from "next/og";

export const alt = "RutaCO — Itinerarios aéreos en Colombia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card — slate / emerald travel brand. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "linear-gradient(145deg, #0f172a 0%, #064e3b 55%, #059669 100%)",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 999,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
            }}
          >
            ✈
          </div>
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Ruta<span style={{ color: "#6ee7b7" }}>CO</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Itinerarios aéreos sobre Colombia
          </div>
          <div style={{ fontSize: 28, color: "#cbd5e1", lineHeight: 1.35, maxWidth: 820 }}>
            Studio con mapa libre, planes en destino y checklist de maleta. Solo habla con el API
            Gateway.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#a7f3d0",
          }}
        >
          <span>BOG · MDE · CLO · CTG · BAQ</span>
          <span style={{ color: "#94a3b8" }}>Microservicios · Event-driven · Next.js</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
