import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── FONTS & RESET ─────────────────────────────────────────────────────────── */
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,700;1,500&family=DM+Sans:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{min-height:100%;background:#F5F6FA}
body{-webkit-font-smoothing:antialiased}
input,button,textarea{font-family:inherit}
::selection{background:rgba(33,20,95,0.15)}
`;

/* ─── PALETA ────────────────────────────────────────────────────────────────── */
const C = {
  bg: "#F5F6FA",
  white: "#FFFFFF",
  dark: "#21145F",
  night: "#0E0A35",
  accent: "#1A428A",
  gold: "#FFCC00",
  body: "#3B3D5C",
  muted: "rgba(33,20,95,0.42)",
  line: "rgba(33,20,95,0.10)",
  lineStrong: "rgba(33,20,95,0.18)",
};

/* ─── CREST ──────────────────────────────────────────────────────────────────── */
function Crest({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="6" fill={C.dark} />
      <rect
        x="3" y="3" width="34" height="34" rx="4"
        stroke="rgba(255,255,255,0.12)" strokeWidth="1"
      />
      <text
        x="20" y="27" textAnchor="middle"
        style={{ fontFamily: "Playfair Display,serif", fontSize: "18px", fontStyle: "italic" }}
        fill={C.white}
      >
        P
      </text>
    </svg>
  );
}

/* ─── HEADER ─────────────────────────────────────────────────────────────────── */
function Header() {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "rgba(245,246,250,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: `1px solid ${C.line}`,
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 2rem",
          height: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Crest size={38} />
          <div>
            <p
              style={{
                fontFamily: "Playfair Display,serif",
                fontSize: "0.92rem",
                color: C.dark,
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "0.01em",
              }}
            >
              La Presentación
            </p>
            <p
              style={{
                fontFamily: "DM Sans,sans-serif",
                fontSize: "0.6rem",
                color: C.accent,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Admisiones 2027
            </p>
          </div>
        </div>
        <a
          href="/admisiones"
          style={{
            fontFamily: "DM Sans,sans-serif",
            fontSize: "0.73rem",
            fontWeight: 500,
            color: C.muted,
            textDecoration: "none",
            letterSpacing: "0.06em",
            border: `1px solid ${C.line}`,
            borderRadius: "999px",
            padding: "0.38rem 0.95rem",
            transition: "color 0.15s",
          }}
        >
          ← Admisiones
        </a>
      </div>
    </header>
  );
}

/* ─── LANDING ────────────────────────────────────────────────────────────────── */
function Landing() {
  const [chosen, setChosen] = useState("");

  const paths = [
    {
      id: "openhouse",
      label: "Visita Open House",
      desc: "Recorre el colegio, conoce a los docentes y resuelve tus dudas. Sin pago ni documentos.",
      badge: "Sin requisitos",
    },
    {
      id: "admision",
      label: "Proceso de Admisión",
      desc: "Inicia formalmente la inscripción del aspirante con pago de derechos y carga de documentos.",
      badge: "Requiere pago",
    },
    {
      id: "ambos",
      label: "Open House + Admisión",
      desc: "Reserva tu visita e inicia el proceso formal en un solo registro.",
      badge: "Experiencia completa",
    },
  ];

  const handleStart = () => {
  if (!chosen) return;
  window.location.href = `/admisiones/registro?tipo=${chosen}`;
};

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "64px",
      }}
    >
      <style>{FONTS}</style>
      <Header />

      {/* Hero */}
      <div
        style={{
          width: "100%",
          background: `linear-gradient(160deg, ${C.night} 0%, ${C.dark} 100%)`,
          padding: "5rem 2rem 4.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          borderBottom: `1px solid rgba(255,255,255,0.07)`,
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.05 }}
        >
          <p
            style={{
              fontFamily: "DM Sans,sans-serif",
              fontWeight: 500,
              fontSize: "0.62rem",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
              marginBottom: "2rem",
            }}
          >
            Girardota · Antioquia · Colombia
          </p>
          <h1
            style={{
              fontFamily: "Playfair Display,serif",
              fontWeight: 500,
              fontSize: "clamp(2.6rem,5.5vw,4.5rem)",
              color: C.white,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
            }}
          >
            Aquí comienza
            <br />
            <em style={{ color: C.gold }}>un camino en familia.</em>
          </h1>
          <p
            style={{
              fontFamily: "DM Sans,sans-serif",
              fontWeight: 300,
              fontSize: "1rem",
              color: "rgba(255,255,255,0.6)",
              lineHeight: 1.75,
              maxWidth: "460px",
              margin: "0 auto",
            }}
          >
            Reserva tu lugar en el Open House, inicia el proceso de admisión o haz ambas cosas en un solo registro.
          </p>
        </motion.div>
      </div>

      {/* Opciones de camino */}
      <div style={{ width: "100%", maxWidth: "780px", padding: "3.5rem 2rem 5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.75rem" }}>
          <div style={{ flex: 1, height: "1px", background: C.line }} />
          <p
            style={{
              fontFamily: "DM Sans,sans-serif",
              fontSize: "0.6rem",
              fontWeight: 500,
              color: C.muted,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            Elige tu camino
          </p>
          <div style={{ flex: 1, height: "1px", background: C.line }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "2.5rem" }}>
          {paths.map((p, i) => (
            <motion.button
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.08 + i * 0.06 }}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.997 }}
              onClick={() => setChosen(p.id)}
              style={{
                all: "unset",
                cursor: "pointer",
                display: "grid",
                gridTemplateColumns: "1fr auto",
                alignItems: "center",
                gap: "1.5rem",
                background: C.white,
                border: `1.5px solid ${chosen === p.id ? C.accent : C.line}`,
                borderRadius: "14px",
                padding: "1.4rem 1.6rem",
                transition: "all 0.18s",
                boxShadow:
                  chosen === p.id
                    ? "0 0 0 3px rgba(26,66,138,0.08), 0 8px 32px rgba(33,20,95,0.10)"
                    : "0 2px 8px rgba(33,20,95,0.04)",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.45rem" }}>
                  <p
                    style={{
                      fontFamily: "Playfair Display,serif",
                      fontSize: "1.1rem",
                      color: chosen === p.id ? C.dark : C.body,
                      fontWeight: 500,
                    }}
                  >
                    {p.label}
                  </p>
                  <span
                    style={{
                      fontFamily: "DM Sans,sans-serif",
                      fontSize: "0.58rem",
                      fontWeight: 600,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: chosen === p.id ? C.accent : C.muted,
                      border: `1px solid ${chosen === p.id ? C.accent : "rgba(33,20,95,0.15)"}`,
                      borderRadius: "999px",
                      padding: "0.18rem 0.55rem",
                      transition: "all 0.18s",
                    }}
                  >
                    {p.badge}
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "DM Sans,sans-serif",
                    fontSize: "0.82rem",
                    color: C.muted,
                    lineHeight: 1.6,
                    textAlign: "left",
                  }}
                >
                  {p.desc}
                </p>
              </div>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  flexShrink: 0,
                  border: `2px solid ${chosen === p.id ? C.accent : C.line}`,
                  background: chosen === p.id ? C.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.18s",
                }}
              >
                {chosen === p.id && (
                  <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path
                      d="M1 3.5L3 5.5L8 1"
                      stroke={C.white}
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Info de pago si eligió admisión o ambos */}
        <AnimatePresence>
          {(chosen === "admision" || chosen === "ambos") && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "2.5rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  background: C.night,
                  borderRadius: "14px",
                  border: `1px solid rgba(255,255,255,0.07)`,
                  padding: "1.75rem 2rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "2.5rem",
                    flexWrap: "wrap",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "DM Sans,sans-serif",
                        fontSize: "0.58rem",
                        color: "rgba(255,255,255,0.35)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Derechos de admisión
                    </p>
                    <p
                      style={{
                        fontFamily: "Playfair Display,serif",
                        fontSize: "2.4rem",
                        color: C.white,
                        lineHeight: 1,
                      }}
                    >
                      $40.000
                    </p>
                  </div>
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <p
                      style={{
                        fontFamily: "DM Sans,sans-serif",
                        fontSize: "0.58rem",
                        color: "rgba(255,255,255,0.35)",
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                        marginBottom: "0.4rem",
                      }}
                    >
                      Pago
                    </p>
                    <p
                      style={{
                        fontFamily: "DM Sans,sans-serif",
                        fontSize: "0.82rem",
                        color: "rgba(255,255,255,0.55)",
                        lineHeight: 1.65,
                      }}
                    >
                      Cuenta de ahorros Bancolombia{" "}
                      <span style={{ color: C.white, fontWeight: 500 }}>
                        No. 399000000000
                      </span>{" "}
                      — Instituto Parroquial Nuestra Señora de la Presentación
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    height: "1px",
                    background: "rgba(255,255,255,0.07)",
                    marginBottom: "1.25rem",
                  }}
                />
                <p
                  style={{
                    fontFamily: "DM Sans,sans-serif",
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.35)",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    marginBottom: "0.75rem",
                  }}
                >
                  Documentos requeridos
                </p>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
                    gap: "0.4rem",
                  }}
                >
                  {[
                    "Comprobante de pago",
                    "Registro civil",
                    "Último informe académico",
                    "Ficha de seguimiento u hoja de vida",
                    "Paz y salvo del colegio anterior",
                  ].map((d) => (
                    <div key={d} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div
                        style={{
                          width: "3px",
                          height: "3px",
                          borderRadius: "50%",
                          background: C.gold,
                          flexShrink: 0,
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "DM Sans,sans-serif",
                          fontSize: "0.78rem",
                          color: "rgba(255,255,255,0.4)",
                        }}
                      >
                        {d}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {chosen === "openhouse" && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: "2.5rem" }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              style={{ overflow: "hidden" }}
            >
              <div
                style={{
                  background: "rgba(26,66,138,0.06)",
                  borderRadius: "12px",
                  border: `1px solid rgba(26,66,138,0.15)`,
                  padding: "1.1rem 1.4rem",
                }}
              >
                <p
                  style={{
                    fontFamily: "DM Sans,sans-serif",
                    fontSize: "0.85rem",
                    color: C.accent,
                    lineHeight: 1.65,
                  }}
                >
                  Solo necesitas completar el formulario. Sin pago, sin documentos — tu lugar en el Open House queda reservado de inmediato.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón de comenzar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}
        >
          <motion.button
            whileHover={chosen ? { scale: 1.03 } : {}}
            whileTap={chosen ? { scale: 0.97 } : {}}
            onClick={handleStart}
            style={{
              all: "unset",
              cursor: chosen ? "pointer" : "default",
              background: chosen ? C.dark : "rgba(33,20,95,0.08)",
              color: chosen ? C.white : "rgba(33,20,95,0.25)",
              fontFamily: "DM Sans,sans-serif",
              fontWeight: 600,
              fontSize: "0.85rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              padding: "1rem 2.5rem",
              borderRadius: "999px",
              transition: "all 0.2s",
              boxShadow: chosen ? "0 12px 36px rgba(33,20,95,0.22)" : "none",
            }}
          >
            Comenzar registro →
          </motion.button>
          {!chosen && (
            <p style={{ fontFamily: "DM Sans,sans-serif", fontSize: "0.78rem", color: C.muted }}>
              Selecciona un camino para continuar
            </p>
          )}
        </motion.div>

        {/* Cita */}
        <div style={{ marginTop: "4rem", paddingTop: "2rem", borderTop: `1px solid ${C.line}` }}>
          <p
            style={{
              fontFamily: "Playfair Display,serif",
              fontStyle: "italic",
              fontSize: "0.88rem",
              color: C.muted,
              letterSpacing: "0.01em",
            }}
          >
            "Educar es caminar juntos: un solo camino, una sola familia."
          </p>
        </div>
      </div>
    </div>
  );
}

export default Landing;