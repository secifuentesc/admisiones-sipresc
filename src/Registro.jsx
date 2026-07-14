import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { guardarRegistro, subirArchivoADrive, verificarCorreoExistente } from "./api";

// ─── FONTS ────────────────────────────────────────────────────────────────────
const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Poppins:wght@300;400;500;600&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{-webkit-font-smoothing:antialiased;background:#F7F8FC}
input,button,textarea,select{font-family:inherit}
input[type=date]::-webkit-calendar-picker-indicator{opacity:0.5;cursor:pointer}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:rgba(33,20,95,0.15);border-radius:2px}
input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none}
`;

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  dark:    "#21145F",
  night:   "#0E0A35",
  accent:  "#1A428A",
  gold:    "#FFCC00",
  white:   "#FFFFFF",
  bg:      "#F7F8FC",
  body:    "#374151",
  muted:   "#9CA3AF",
  line:    "#E8EAF0",
  lineHov: "#C7CBE0",
  panel:   "#EEF2FF",
  success: "#10B981",
};

// ─── GRADOS ───────────────────────────────────────────────────────────────────
const GRADOS = [
  { id:"prejardín",  label:"Prejardín",  nivel:"Preescolar", edad:"Desde los 3 años" },
  { id:"jardín",     label:"Jardín",     nivel:"Preescolar", edad:"Desde los 4 años" },
  { id:"transición", label:"Transición", nivel:"Preescolar", edad:"Desde los 5 años" },
  { id:"primero",    label:"1°",         nivel:"Primaria",   edad:"" },
  { id:"segundo",    label:"2°",         nivel:"Primaria",   edad:"" },
  { id:"tercero",    label:"3°",         nivel:"Primaria",   edad:"" },
  { id:"cuarto",     label:"4°",         nivel:"Primaria",   edad:"" },
  { id:"quinto",     label:"5°",         nivel:"Primaria",   edad:"" },
  { id:"sexto",      label:"6°",         nivel:"Secundaria", edad:"" },
  { id:"séptimo",    label:"7°",         nivel:"Secundaria", edad:"" },
  { id:"octavo",     label:"8°",         nivel:"Secundaria", edad:"" },
  { id:"noveno",     label:"9°",         nivel:"Secundaria", edad:"" },
];

const NIVEL_COLOR = {
  Preescolar:  { bg:"#FFF7ED", accent:"#EA580C", text:"#9A3412" },
  Primaria:    { bg:"#ECFDF5", accent:"#059669", text:"#065F46" },
  Secundaria:  { bg:"#EEF2FF", accent:"#4F46E5", text:"#3730A3" },
};

const NIVEL_SHAPES = {
  Preescolar:  "preescolar",
  Primaria:    "primaria",
  Secundaria:  "secundaria",
  default:     "default",
};

// ─── ABSTRACT BACKGROUND ─────────────────────────────────────────────────────
const SHAPE_CONFIGS = {
  preescolar: {
    shapes: [
      { type:"circle", size:180, x:8, y:12, color:"#FFB3BA", opacity:0.35, dur:8 },
      { type:"circle", size:120, x:85, y:8, color:"#FFDFBA", opacity:0.4, dur:11 },
      { type:"circle", size:90,  x:15, y:70, color:"#B5F0E6", opacity:0.3, dur:9 },
      { type:"circle", size:200, x:75, y:65, color:"#E0BBE4", opacity:0.25, dur:13 },
      { type:"circle", size:60,  x:50, y:40, color:"#FFFFBA", opacity:0.45, dur:7 },
      { type:"circle", size:140, x:92, y:45, color:"#FFB3BA", opacity:0.2, dur:15 },
    ]
  },
  primaria: {
    shapes: [
      { type:"oval", size:160, x:10, y:15, color:"#A0C4FF", opacity:0.35, dur:10 },
      { type:"oval", size:100, x:80, y:10, color:"#CAFFBF", opacity:0.4, dur:8 },
      { type:"diamond", size:80, x:20, y:65, color:"#FFC6FF", opacity:0.3, dur:12 },
      { type:"oval", size:180, x:70, y:70, color:"#9BF6FF", opacity:0.25, dur:9 },
      { type:"diamond", size:60, x:55, y:30, color:"#FDFFB6", opacity:0.45, dur:14 },
      { type:"oval", size:120, x:88, y:50, color:"#A0C4FF", opacity:0.2, dur:11 },
    ]
  },
  secundaria: {
    shapes: [
      { type:"hex", size:120, x:8, y:10, color:"#818CF8", opacity:0.3, dur:12 },
      { type:"triangle", size:100, x:82, y:8, color:"#C084FC", opacity:0.35, dur:9 },
      { type:"hex", size:80, x:18, y:72, color:"#F472B6", opacity:0.25, dur:15 },
      { type:"triangle", size:140, x:72, y:68, color:"#6EE7B7", opacity:0.2, dur:10 },
      { type:"hex", size:60, x:50, y:35, color:"#FDE68A", opacity:0.4, dur:8 },
      { type:"triangle", size:100, x:90, y:48, color:"#818CF8", opacity:0.18, dur:13 },
    ]
  },
  default: {
    shapes: [
      { type:"circle", size:160, x:8, y:10, color:"#C7D2FE", opacity:0.3, dur:10 },
      { type:"circle", size:100, x:82, y:8, color:"#DDD6FE", opacity:0.35, dur:8 },
      { type:"circle", size:80, x:18, y:72, color:"#BFDBFE", opacity:0.25, dur:14 },
      { type:"circle", size:180, x:72, y:68, color:"#FEF08A", opacity:0.18, dur:11 },
      { type:"circle", size:60, x:50, y:35, color:"#C7D2FE", opacity:0.4, dur:9 },
    ]
  }
};

function AbstractShape({ shape, index }) {
  const floatY = [-12, 8, -8, 12, -6][index % 5];
  const floatX = [6, -8, 10, -6, 8][index % 5];
  const rotate = [0, 15, -10, 20, -15][index % 5];

  const shapeStyle = {
    position:"absolute",
    left:`${shape.x}%`,
    top:`${shape.y}%`,
    opacity: shape.opacity,
    pointerEvents:"none",
  };

  const renderShape = () => {
    const s = shape.size;
    if (shape.type === "circle") {
      return <div style={{ width:s, height:s, borderRadius:"50%", background:shape.color }} />;
    }
    if (shape.type === "oval") {
      return <div style={{ width:s, height:s*0.65, borderRadius:"50%", background:shape.color }} />;
    }
    if (shape.type === "diamond") {
      return <div style={{ width:s*0.7, height:s*0.7, background:shape.color, transform:"rotate(45deg)", borderRadius:"8px" }} />;
    }
    if (shape.type === "hex") {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={shape.color} />
        </svg>
      );
    }
    if (shape.type === "triangle") {
      return (
        <svg width={s} height={s} viewBox="0 0 100 100">
          <polygon points="50,5 95,90 5,90" fill={shape.color} rx="8" />
        </svg>
      );
    }
    return null;
  };

  return (
    <motion.div
      style={shapeStyle}
      animate={{
        y: [0, floatY, 0],
        x: [0, floatX, 0],
        rotate: [0, rotate, 0],
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: shape.dur,
        repeat: Infinity,
        ease: "easeInOut",
        delay: index * 0.8,
      }}
    >
      {renderShape()}
    </motion.div>
  );
}

function AbstractBackground({ nivel }) {
  const key = NIVEL_SHAPES[nivel] || "default";
  const config = SHAPE_CONFIGS[key];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, overflow:"hidden", pointerEvents:"none" }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={key}
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          exit={{ opacity:0 }}
          transition={{ duration:1.2 }}
          style={{ position:"absolute", inset:0 }}
        >
          {config.shapes.map((shape, i) => (
            <AbstractShape key={i} shape={shape} index={i} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({ stepIdx, totalSteps, tipoRegistro }) {
  const pct = totalSteps > 0 ? ((stepIdx + 1) / totalSteps) * 100 : 0;
  const stepLabel = totalSteps > 0
    ? `Paso ${stepIdx + 1} de ${totalSteps}`
    : "";

  return (
    <header style={{
      position:"fixed", top:0, left:0, right:0, zIndex:100,
      background:"rgba(255,255,255,0.96)",
      backdropFilter:"blur(20px)",
      WebkitBackdropFilter:"blur(20px)",
      boxShadow:"0 2px 24px rgba(14,10,53,0.08)",
      borderBottom:`1px solid ${C.line}`,
    }}>
      <div style={{
        maxWidth:"1200px", margin:"0 auto",
        padding:"0 1.5rem", height:"64px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <a href="https://admisiones.sipresc.co" style={{ display:"flex", alignItems:"center", gap:"12px", textDecoration:"none" }}>
          <div style={{
            fontFamily:"'CollegiateBlackFLF', serif",
            fontSize:"2rem", lineHeight:"0.82",
            color: C.dark,
          }}>P</div>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
            <span style={{
              fontFamily:"'Montserrat', sans-serif",
              fontSize:"0.68rem", fontWeight:800,
              letterSpacing:"0.26em", textTransform:"uppercase",
              color: C.dark,
            }}>La Presentación</span>
            <span style={{
              fontFamily:"'Montserrat', sans-serif",
              fontSize:"0.5rem", fontWeight:600,
              letterSpacing:"0.28em", textTransform:"uppercase",
              color: C.accent, opacity:0.75, marginTop:"3px",
            }}>Admisiones 2027</span>
          </div>
        </a>

        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          {tipoRegistro && (
            <span style={{
              fontFamily:"'Montserrat', sans-serif",
              fontSize:"0.6rem", fontWeight:700,
              letterSpacing:"0.16em", textTransform:"uppercase",
              color: C.accent,
              background: C.panel,
              padding:"0.3rem 0.8rem", borderRadius:"999px",
              display: window.innerWidth < 480 ? "none" : "inline",
            }}>
              {tipoRegistro === "openhouse" ? "Open House" : tipoRegistro === "admision" ? "Admisión" : "Open House + Admisión"}
            </span>
          )}
          {stepLabel && (
            <span style={{
              fontFamily:"'Montserrat', sans-serif",
              fontSize:"0.72rem", fontWeight:700,
              color: C.dark,
            }}>{stepLabel}</span>
          )}
          <a href="https://admisiones.sipresc.co" style={{
            fontFamily:"'Montserrat', sans-serif",
            fontSize:"0.68rem", fontWeight:600,
            color: C.muted, textDecoration:"none",
            letterSpacing:"0.06em",
            border:`1px solid ${C.line}`, borderRadius:"999px",
            padding:"0.38rem 0.9rem",
            transition:"color 0.15s",
          }}>← Volver</a>
        </div>
      </div>

      <div style={{ height:"3px", background: C.line }}>
        <motion.div
          animate={{ width:`${pct}%` }}
          transition={{ duration:0.5, ease:"easeOut" }}
          style={{
            height:"100%",
            background:`linear-gradient(90deg, ${C.accent}, ${C.gold})`,
          }}
        />
      </div>
    </header>
  );
}

// ─── UI COMPONENTS ────────────────────────────────────────────────────────────
function FInput({ label, type="text", value, onChange, placeholder, required, hint, maxLength, onBlur }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom:"1rem", width:"100%" }}>
      {label && (
        <p style={{
          fontFamily:"'Montserrat', sans-serif",
          fontSize:"0.62rem", fontWeight:700,
          color: foc ? C.accent : C.muted,
          letterSpacing:"0.18em", textTransform:"uppercase",
          marginBottom:"0.45rem", transition:"color 0.15s",
        }}>
          {label}{required && <span style={{ color:C.accent }}> *</span>}
        </p>
      )}
      <input
        type={type} 
        value={value} 
        onChange={onChange}
        placeholder={placeholder} 
        maxLength={maxLength}
        onFocus={()=>setFoc(true)} 
        onBlur={(e) => {
          setFoc(false);
          if (onBlur) onBlur(e);
        }}
        style={{
          width:"100%", background: C.white,
          border:`2px solid ${foc ? C.accent : C.line}`,
          borderRadius:"14px", padding:"0.9rem 1.1rem",
          fontFamily:"'Poppins', sans-serif", fontWeight:400,
          fontSize:"0.95rem", color: C.dark, outline:"none",
          transition:"border-color 0.15s, box-shadow 0.15s",
          boxShadow: foc ? `0 0 0 4px rgba(26,66,138,0.08)` : "none",
        }}
      />
      {hint && <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.72rem", color:C.muted, marginTop:"0.35rem" }}>{hint}</p>}
    </div>
  );
}
function FTextarea({ label, value, onChange, placeholder, rows=4, required }) {
  const [foc, setFoc] = useState(false);
  return (
    <div style={{ marginBottom:"1rem", width:"100%" }}>
      {label && (
        <p style={{
          fontFamily:"'Montserrat', sans-serif",
          fontSize:"0.62rem", fontWeight:700,
          color: foc ? C.accent : C.muted,
          letterSpacing:"0.18em", textTransform:"uppercase",
          marginBottom:"0.45rem", transition:"color 0.15s",
        }}>
          {label}{required && <span style={{ color:C.accent }}> *</span>}
        </p>
      )}
      <textarea
        rows={rows} value={value} onChange={onChange}
        placeholder={placeholder}
        onFocus={()=>setFoc(true)} onBlur={()=>setFoc(false)}
        style={{
          width:"100%", background: C.white,
          border:`2px solid ${foc ? C.accent : C.line}`,
          borderRadius:"14px", padding:"0.9rem 1.1rem",
          fontFamily:"'Poppins', sans-serif", fontWeight:400,
          fontSize:"0.95rem", color: C.dark, outline:"none",
          transition:"border-color 0.15s, box-shadow 0.15s",
          resize:"vertical",
          boxShadow: foc ? `0 0 0 4px rgba(26,66,138,0.08)` : "none",
        }}
      />
    </div>
  );
}

function FChoice({ title, sub, note, selected, onClick, disabled }) {
  return (
    <motion.button
      whileHover={!disabled ? { scale:1.005 } : {}}
      whileTap={!disabled ? { scale:0.997 } : {}}
      onClick={!disabled ? onClick : undefined}
      style={{
        all:"unset",
        display:"flex",
        alignItems:"center",
        gap:"1rem",
        width:"100%",
        maxWidth:"100%",
        textAlign:"left",
        cursor: disabled ? "default" : "pointer",
        background: selected ? C.panel : C.white,
        border:`2px solid ${selected ? C.accent : C.line}`,
        borderRadius:"16px",
        padding:"1.2rem 1.4rem",
        marginBottom:"0.65rem",
        transition:"all 0.18s",
        boxShadow: selected ? `0 0 0 4px rgba(26,66,138,0.08)` : "0 1px 6px rgba(33,20,95,0.04)",
        opacity: disabled ? 0.5 : 1,
        boxSizing:"border-box",
        overflow:"hidden",
      }}
    >
      <div style={{
        width:"22px", height:"22px", borderRadius:"50%", flexShrink:0,
        border:`2px solid ${selected ? C.accent : C.lineHov}`,
        background: selected ? C.accent : "transparent",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.18s",
      }}>
        {selected && (
          <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:C.white }} />
        )}
      </div>
      <div style={{
        flex:1,
        minWidth:0,
        wordWrap:"break-word",
        overflowWrap:"break-word",
        wordBreak:"break-word",
        hyphens:"auto",
      }}>
        <p style={{
          fontFamily:"'Montserrat', sans-serif",
          fontSize:"0.95rem",
          fontWeight:700,
          color: selected ? C.dark : C.body,
          maxWidth:"100%",
        }}>{title}</p>
        {sub && <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.8rem", color:C.muted, marginTop:"0.2rem", lineHeight:1.5 }}>{sub}</p>}
        {note && <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.75rem", color:C.accent, marginTop:"0.3rem", fontWeight:600 }}>{note}</p>}
      </div>
    </motion.button>
  );
}

function FChip({ label, selected, onClick, sub }) {
  return (
    <motion.button
      whileTap={{ scale:0.93 }}
      onClick={onClick}
      style={{
        all:"unset", cursor:"pointer",
        fontFamily:"'Montserrat', sans-serif",
        fontSize:"0.8rem", fontWeight:700,
        background: selected ? C.dark : C.white,
        border:`2px solid ${selected ? C.dark : C.line}`,
        color: selected ? C.white : C.body,
        borderRadius:"12px",
        padding: sub ? "0.6rem 1rem" : "0.5rem 1rem",
        transition:"all 0.15s",
        boxShadow: selected ? `0 4px 16px rgba(33,20,95,0.2)` : "none",
        display:"flex", flexDirection:"column", alignItems:"center", gap:"2px",
      }}
    >
      <span>{label}</span>
      {sub && <span style={{ fontSize:"0.58rem", fontWeight:500, opacity:0.7 }}>{sub}</span>}
    </motion.button>
  );
}

function FFile({ label, fieldKey, files, setFiles, required, maxMB = 30, datosAspirante }) {
  const id = `file-${fieldKey}`;
  const file = files[fieldKey];
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);

  useEffect(() => {
    if (files[`${fieldKey}_link`]) setUploaded(true);
  }, []);

  const handleChange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;

    if (f.size > maxMB * 1024 * 1024) {
      setError(`El archivo supera el límite de ${maxMB}MB. Por favor comprime el documento e intenta de nuevo.`);
      return;
    }

    const tiposValidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!tiposValidos.includes(f.type) && !f.name.match(/\.(pdf|jpg|jpeg|png)$/i)) {
      setError("Solo se permiten archivos PDF, JPG o PNG.");
      return;
    }

    setError("");
    setUploaded(false);
    setFiles(p => ({ ...p, [fieldKey]: f, [`${fieldKey}_link`]: null }));
    setUploading(true);

    try {
      const resultado = await subirArchivoADrive(f, fieldKey, datosAspirante);

      if (resultado.success) {
        setFiles(p => ({ ...p, [fieldKey]: f, [`${fieldKey}_link`]: resultado.link }));
        setUploaded(true);
        setError("");
      } else {
        setError("No se pudo subir el archivo. Toca aquí para intentar de nuevo.");
        setFiles(p => ({ ...p, [fieldKey]: null, [`${fieldKey}_link`]: null }));
        setUploaded(false);
      }
    } catch(e) {
      setError("Error de conexión. Toca aquí para intentar de nuevo.");
      setFiles(p => ({ ...p, [fieldKey]: null, [`${fieldKey}_link`]: null }));
      setUploaded(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: "1.2rem", background: C.white, border: `2px solid ${uploaded ? C.success : error ? "#EF4444" : uploading ? C.accent : C.line}`, borderRadius: "18px", padding: "1.4rem 1.5rem", transition: "border-color 0.2s, box-shadow 0.2s", boxShadow: uploaded ? "0 0 0 4px rgba(16,185,129,0.08)" : error ? "0 0 0 4px rgba(239,68,68,0.08)" : "0 1px 8px rgba(33,20,95,0.05)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
        <div style={{ width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0, background: uploaded ? C.success : error ? "#EF4444" : uploading ? C.accent : C.panel, display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
          {uploaded && <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M4 10l4 4 8-8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          {uploading && <span style={{ color: "#fff", fontSize: "0.7rem", fontWeight: 700 }}>...</span>}
          {!uploaded && !uploading && !error && (
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round">
              <path d="M6 2h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z" />
              <path d="M14 2v4h4" />
            </svg>
          )}
          {error && <span style={{ color: "#fff", fontSize: "1rem", fontWeight: 700 }}>!</span>}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "0.25rem" }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "1rem", fontWeight: 800, color: C.dark, lineHeight: 1.3 }}>{label}</p>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.55rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: required ? C.accent : C.muted, background: required ? C.panel : "#F3F4F6", padding: "0.18rem 0.55rem", borderRadius: "999px", border: required ? `1px solid rgba(26,66,138,0.2)` : "1px solid #E5E7EB" }}>{required ? "Requerido" : "Opcional"}</span>
          </div>

          {!file && !uploading && (
            <label htmlFor={id} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", background: C.bg, border: `2px dashed ${error ? "#EF4444" : C.line}`, borderRadius: "12px", padding: "0.8rem 1rem", transition: "border-color 0.15s" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round"><path d="M10 13V3m-4 4l4-4 4 4" /><path d="M3 17h14" /></svg>
              <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem", color: error ? "#EF4444" : C.muted }}>
                {error ? error : `Subir archivo — PDF, JPG o PNG · máx. ${maxMB}MB`}
              </span>
            </label>
          )}

          {uploading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: C.panel, border: `1.5px solid ${C.lineHov}`, borderRadius: "12px", padding: "0.75rem 1rem" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke={C.accent} strokeWidth="1.8" strokeLinecap="round"><path d="M10 13V3m-4 4l4-4 4 4" /><path d="M3 17h14" /></svg>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem", color: C.accent, fontWeight: 600 }}>Subiendo archivo, por favor espera...</p>
            </div>
          )}

          {uploaded && file && !uploading && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#F0FDF4", border: "1.5px solid #86EFAC", borderRadius: "12px", padding: "0.75rem 1rem" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2z" /><path d="M8 10h4M8 13h2" /></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#166534", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</p>
                <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.7rem", color: "#4ADE80" }}>✓ Guardado correctamente · {(file.size / 1024 / 1024).toFixed(1)} MB</p>
              </div>
              <button onClick={e => { e.preventDefault(); setFiles(p => ({ ...p, [fieldKey]: null, [`${fieldKey}_link`]: null })); setUploaded(false); setError(""); }} style={{ all: "unset", cursor: "pointer", color: "#86EFAC", fontSize: "1.2rem", lineHeight: 1, fontWeight: 700 }}>×</button>
            </div>
          )}
        </div>
      </div>
      <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleChange} />
    </div>
  );
}

// ─── SENDING SCREEN ──────────────────────────────────────────────────────────
const SENDING_MESSAGES = [
  "Estamos registrando la información de tu familia...",
  "Guardando los documentos en Drive...",
  "Casi listo, un momento más...",
  "Verificando que todo esté bien...",
  "Preparando la confirmación...",
];

function SendingScreen() {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % SENDING_MESSAGES.length);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 999,
        background: "linear-gradient(135deg, #0E0A35 0%, #21145F 60%, #0E0A35 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
      }}
    >
      <div style={{ position:"absolute", width:500, height:500, borderRadius:"50%", background:"rgba(26,66,138,0.18)", top:-150, left:-150, filter:"blur(60px)" }} />
      <div style={{ position:"absolute", width:400, height:400, borderRadius:"50%", background:"rgba(255,204,0,0.07)", bottom:-100, right:-100, filter:"blur(60px)" }} />

      <div style={{ position:"relative", zIndex:10, textAlign:"center", padding:"2rem", maxWidth:400, width:"100%" }}>
        <div style={{ position:"relative", width:140, height:140, margin:"0 auto 2.5rem" }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            style={{
              position:"absolute", inset:0, borderRadius:"50%",
              border:"1.5px solid rgba(255,204,0,0.15)",
            }}
          >
            <div style={{
              position:"absolute", top:-5, left:"50%", transform:"translateX(-50%)",
              width:10, height:10, borderRadius:"50%", background:"#FFCC00",
              boxShadow:"0 0 16px 4px rgba(255,204,0,0.6)",
            }} />
          </motion.div>

          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            style={{
              position:"absolute", inset:10, borderRadius:"50%",
              border:"1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div style={{
              position:"absolute", bottom:-4, left:"50%", transform:"translateX(-50%)",
              width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,0.3)",
            }} />
          </motion.div>

          <div style={{
            position:"absolute", inset:18, borderRadius:"50%",
            background:"radial-gradient(circle at 38% 32%, #1e1260, #0a0720)",
            boxShadow:"0 0 0 1px rgba(255,255,255,0.07), 0 24px 60px rgba(0,0,0,0.5)",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <motion.svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width:68, height:68, filter:"drop-shadow(0 6px 18px rgba(255,204,0,0.25))" }}
              animate={{ y: [0, -7, -3, -9, 0], rotate: [-4, 3, -2, 4, -4] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <defs>
                <radialGradient id="bg2" cx="40%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#3d2508"/>
                  <stop offset="100%" stopColor="#1a0e03"/>
                </radialGradient>
                <radialGradient id="hg2" cx="38%" cy="32%" r="60%">
                  <stop offset="0%" stopColor="#4a2e0a"/>
                  <stop offset="100%" stopColor="#1f1005"/>
                </radialGradient>
                <radialGradient id="wg2" cx="50%" cy="30%" r="70%">
                  <stop offset="0%" stopColor="rgba(220,235,255,0.92)"/>
                  <stop offset="100%" stopColor="rgba(180,210,255,0.45)"/>
                </radialGradient>
                <radialGradient id="sg2" cx="50%" cy="20%" r="70%">
                  <stop offset="0%" stopColor="#FFE066"/>
                  <stop offset="100%" stopColor="#E6A800"/>
                </radialGradient>
              </defs>
              <motion.ellipse cx="30" cy="36" rx="20" ry="11" fill="url(#wg2)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" transform="rotate(-15 30 36)"
                animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 0.12, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "52% 60%" }} />
              <motion.ellipse cx="24" cy="44" rx="13" ry="7" fill="rgba(200,225,255,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" transform="rotate(-10 24 44)"
                animate={{ scaleY: [1, 0.5, 1] }} transition={{ duration: 0.12, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "52% 60%" }} />
              <motion.ellipse cx="70" cy="36" rx="20" ry="11" fill="url(#wg2)" stroke="rgba(255,255,255,0.35)" strokeWidth="0.6" transform="rotate(15 70 36)"
                animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 0.12, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "48% 60%" }} />
              <motion.ellipse cx="76" cy="44" rx="13" ry="7" fill="rgba(200,225,255,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.4" transform="rotate(10 76 44)"
                animate={{ scaleY: [0.5, 1, 0.5] }} transition={{ duration: 0.12, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: "48% 60%" }} />
              <ellipse cx="50" cy="66" rx="15" ry="21" fill="url(#bg2)"/>
              <ellipse cx="45" cy="54" rx="5" ry="3" fill="rgba(255,255,255,0.08)" transform="rotate(-15 45 54)"/>
              <path d="M36,57 Q50,54 64,57 Q64,63 50,64 Q36,63 36,57Z" fill="url(#sg2)"/>
              <path d="M36,68 Q50,65 64,68 Q64,74 50,75 Q36,74 36,68Z" fill="url(#sg2)"/>
              <path d="M36,57 Q50,54 64,57 L64,59 Q50,56 36,59Z" fill="rgba(0,0,0,0.15)"/>
              <path d="M36,68 Q50,65 64,68 L64,70 Q50,67 36,70Z" fill="rgba(0,0,0,0.15)"/>
              <circle cx="50" cy="41" r="13" fill="url(#hg2)"/>
              <circle cx="44" cy="40" r="5" fill="rgba(255,255,255,0.95)"/>
              <circle cx="56" cy="40" r="5" fill="rgba(255,255,255,0.95)"/>
              <circle cx="44.5" cy="40.5" r="3" fill="#0E0A35"/>
              <circle cx="56.5" cy="40.5" r="3" fill="#0E0A35"/>
              <circle cx="43" cy="39" r="1.2" fill="rgba(255,255,255,0.9)"/>
              <circle cx="55" cy="39" r="1.2" fill="rgba(255,255,255,0.9)"/>
              <path d="M45,29 Q42,22 38,17" stroke="#3d2508" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <path d="M55,29 Q58,22 62,17" stroke="#3d2508" strokeWidth="2" strokeLinecap="round" fill="none"/>
              <circle cx="38" cy="16" r="3.5" fill="#FFCC00"/>
              <circle cx="62" cy="16" r="3.5" fill="#FFCC00"/>
              <circle cx="37.5" cy="15.5" r="1.2" fill="rgba(255,255,255,0.6)"/>
              <circle cx="61.5" cy="15.5" r="1.2" fill="rgba(255,255,255,0.6)"/>
              <path d="M38,68 Q30,72 26,78" stroke="#2a1a06" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <path d="M38,73 Q30,78 27,84" stroke="#2a1a06" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M62,68 Q70,72 74,78" stroke="#2a1a06" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
              <path d="M62,73 Q70,78 73,84" stroke="#2a1a06" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
              <path d="M50,86 Q49,90 50,94 Q51,90 50,86Z" fill="#2a1a06"/>
            </motion.svg>
          </div>
        </div>

        <h2 style={{
          fontFamily:"'Montserrat', sans-serif", fontWeight:900,
          fontSize:"1.75rem", color:"#fff", lineHeight:1.12,
          letterSpacing:"-0.025em", marginBottom:"0.5rem",
        }}>
          Guardando tu<br/><span style={{ color:"#FFCC00" }}>registro.</span>
        </h2>

        <AnimatePresence mode="wait">
          <motion.p
            key={msgIdx}
            initial={{ opacity:0, y:6 }}
            animate={{ opacity:1, y:0 }}
            exit={{ opacity:0, y:-6 }}
            transition={{ duration:0.4 }}
            style={{
              fontFamily:"'Poppins', sans-serif",
              fontSize:"0.83rem", color:"rgba(255,255,255,0.5)",
              fontWeight:300, lineHeight:1.7,
              minHeight:"2.5rem", marginBottom:"2rem",
            }}
          >
            {SENDING_MESSAGES[msgIdx]}
          </motion.p>
        </AnimatePresence>

        <div style={{ width:"100%", height:3, background:"rgba(255,255,255,0.07)", borderRadius:999, overflow:"hidden", marginBottom:"1.2rem" }}>
          <motion.div
            animate={{ width:["8%","45%","72%","88%","88%"] }}
            transition={{ duration:3.5, repeat:Infinity, ease:"easeInOut" }}
            style={{ height:"100%", background:"linear-gradient(90deg, #1A428A, #FFCC00)", borderRadius:999 }}
          />
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:7, marginTop:"1rem" }}>
          {[0,1,2].map(i => (
            <motion.div
              key={i}
              animate={{ scale:[1,1.5,1], background:["rgba(255,255,255,0.15)","#FFCC00","rgba(255,255,255,0.15)"] }}
              transition={{ duration:1.5, repeat:Infinity, delay:i*0.25, ease:"easeInOut" }}
              style={{ width:5, height:5, borderRadius:"50%", background:"rgba(255,255,255,0.2)" }}
            />
          ))}
        </div>

        <div style={{
          marginTop:"2.5rem",
          fontFamily:"'Montserrat', sans-serif",
          fontSize:"0.52rem", fontWeight:700,
          letterSpacing:"0.22em", textTransform:"uppercase",
          color:"rgba(255,255,255,0.2)",
          display:"flex", alignItems:"center", justifyContent:"center", gap:10,
        }}>
          <div style={{ width:24, height:1, background:"rgba(255,255,255,0.12)" }} />
          La Presentación · Admisiones 2027
          <div style={{ width:24, height:1, background:"rgba(255,255,255,0.12)" }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── STEP TITLE ───────────────────────────────────────────────────────────────
function StepTitle({ badge, title, sub }) {
  return (
    <div style={{ marginBottom:"2rem" }}>
      {badge && (
        <p style={{
          fontFamily:"'Montserrat', sans-serif",
          fontSize:"0.58rem", fontWeight:700,
          letterSpacing:"0.22em", textTransform:"uppercase",
          color: C.accent, marginBottom:"0.75rem",
        }}>{badge}</p>
      )}
      <h2 style={{
        fontFamily:"'Montserrat', sans-serif",
        fontWeight:800,
        fontSize:"clamp(1.7rem, 4vw, 2.4rem)",
        color: C.dark, lineHeight:1.15,
        letterSpacing:"-0.02em",
        marginBottom: sub ? "0.75rem" : 0,
      }}>{title}</h2>
      {sub && (
        <p style={{
          fontFamily:"'Poppins', sans-serif",
          fontSize:"0.92rem", color:C.muted, lineHeight:1.65,
        }}>{sub}</p>
      )}
    </div>
  );
}

// ─── STEPS ───────────────────────────────────────────────────────────────────

function StepTipo({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Admisiones 2027 · Open House 11 de julio"
        title="¿Cómo quieres comenzar?"
        sub="Elige el camino que mejor se adapta a tu familia."
      />
      <FChoice
        title="Asistir al Open House"
        sub="Visita el colegio el 11 de julio, conoce los espacios y el equipo. Sin costo, sin documentos."
        note="Solo necesitas reservar tu lugar"
        selected={data.tipoRegistro === "openhouse"}
        onClick={() => setData(p => ({ ...p, tipoRegistro:"openhouse" }))}
      />
      <FChoice
        title="Iniciar proceso de admisión"
        sub="Comienza formalmente la inscripción con pago de derechos y documentos requeridos."
        note="Derecho de admisión: $40.000"
        selected={data.tipoRegistro === "admision"}
        onClick={() => setData(p => ({ ...p, tipoRegistro:"admision" }))}
      />
      <AnimatePresence>
        {data.tipoRegistro === "admision" && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}
          >
            <div style={{
              background: C.night, borderRadius:"16px",
              padding:"1.4rem 1.6rem", marginTop:"0.5rem",
            }}>
              <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.58rem", fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.5rem" }}>Pago previo al registro</p>
              <p style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:900, fontSize:"2.2rem", color:C.white, lineHeight:1, marginBottom:"0.75rem" }}>$40.000</p>
              <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.8rem", color:"rgba(255,255,255,0.5)", lineHeight:1.6 }}>
                Cuenta de ahorros Bancolombia No. 39900005178 a nombre de <br/>
                <strong style={{ color:C.white }}>Instituto Parroquial Nuestra Señora de la Presentación</strong>
              </p>
              <div style={{ height:"1px", background:"rgba(255,255,255,0.08)", margin:"1rem 0" }} />
              <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.58rem", fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.6rem" }}>Ten listos estos documentos</p>
              {["Comprobante de pago","Registro civil del aspirante","Último informe académico","Ficha de seguimiento u hoja de vida","Paz y salvo del colegio anterior"].map(d => (
                <div key={d} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"0.35rem" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:C.gold, flexShrink:0 }} />
                  <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.78rem", color:"rgba(255,255,255,0.45)" }}>{d}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {data.tipoRegistro === "openhouse" && (
          <motion.div
            initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}
            exit={{ opacity:0, height:0 }} style={{ overflow:"hidden" }}
          >
            <div style={{
              background:"rgba(26,66,138,0.06)", borderRadius:"14px",
              border:`1px solid rgba(26,66,138,0.15)`,
              padding:"1rem 1.3rem", marginTop:"0.5rem",
            }}>
              <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color:C.accent, lineHeight:1.65 }}>
                Sin costo ni documentos. Tu lugar queda reservado de inmediato. Puedes iniciar el proceso de admisión después del Open House.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function StepPolitica({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Antes de continuar"
        title="Política de tratamiento de datos"
        sub="De conformidad con la ley 1581 de 2012 y el decreto 1377 de 2013, tus datos personales y los del aspirante serán almacenados en las bases de datos del Instituto Parroquial Nuestra Señora de la Presentación de Girardota, y podrán ser utilizados para fines académicos y administrativos."
      />
      <FChoice
        title="Estoy de acuerdo"
        sub="Autorizo el tratamiento de mis datos y los del estudiante que represento."
        selected={data.politicaAceptada === true}
        onClick={() => setData(p => ({ ...p, politicaAceptada:true }))}
      />
      <FChoice
        title="No estoy de acuerdo"
        selected={data.politicaAceptada === false}
        onClick={() => setData(p => ({ ...p, politicaAceptada:false }))}
      />
      {data.politicaAceptada === false && (
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          style={{
            background:"#FEF2F2", border:"1px solid #FECACA",
            borderRadius:"14px", padding:"1rem 1.3rem", marginTop:"0.5rem",
          }}
        >
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color:"#991B1B", lineHeight:1.65 }}>
            Para continuar con el registro es necesario aceptar la política de tratamiento de datos. Si tienes dudas, comunícate con nosotros al <strong>300 123 1212</strong>.
          </p>
        </motion.div>
      )}
    </>
  );
}

function StepCorreo({ data, setData, onProgressRestore, stepIdx, setStepIdx, setHijosRegistrados, setShowHijosModal }) {
  const [checking, setChecking] = useState(false);
  const showOwner = data.correo.includes("@");

  const handleBlur = async () => {
  console.log("🔵 handleBlur ejecutado");
  if (!data.correo) {
    console.log("⚠️ No hay correo");
    return;
  }
  console.log("🔵 Correo:", data.correo);
  setChecking(true);
  
  try {
    const saved = localStorage.getItem(`registro_${data.correo}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.stepIdx > 0) onProgressRestore(parsed);
    }
    
    console.log("🔍 Llamando a verificarCorreoExistente...");
    const resultado = await verificarCorreoExistente(data.correo);
    console.log("🔍 RESULTADO:", resultado);
    
    if (resultado.existe && resultado.registros.length > 0) {
      // ✅ FILTRAR: Solo registrar los que tienen tipo "openhouse"
      const registrosOpenHouse = resultado.registros.filter(
        r => r["Tipo de registro"] === "openhouse"
      );
      
      console.log("✅ Registros Open House encontrados:", registrosOpenHouse);
      
      if (registrosOpenHouse.length > 0) {
        setHijosRegistrados(registrosOpenHouse);
        setShowHijosModal(true);
      } else {
        console.log("ℹ️ No hay registros de Open House pendientes. El usuario ya completó el proceso.");
        // Opcional: mostrar mensaje al usuario
      }
    } else {
      console.log("❌ No se encontraron registros");
    }
  } catch(e) {
    console.error("❌ Error verificando correo:", e);
  } finally {
    setChecking(false);
  }
};

  return (
    <>
      <StepTitle badge="Tu correo" title="¿Cuál es el correo de la familia?" sub="Con este correo podrás consultar el estado de tu proceso en cualquier momento." />
      <FInput 
        label="Correo electrónico" 
        type="email" 
        value={data.correo} 
        onChange={e => setData(p => ({ ...p, correo: e.target.value }))}
        placeholder="familia@ejemplo.com" 
        required 
        hint="Asegúrate de que esté correcto — es el identificador principal del proceso." 
        onBlur={handleBlur}
      />
      {checking && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.78rem", color: C.muted }}>Verificando progreso guardado...</p>}
      {showOwner && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: "1.25rem", borderTop: `1px solid ${C.line}`, marginTop: "1rem" }}>
          <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", fontWeight: 800, color: C.dark, marginBottom: "0.25rem" }}>¿De quién es este correo?</p>
          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.78rem", color: C.muted, marginBottom: "1rem", lineHeight: 1.5 }}>Lo usaremos para pre-llenar los datos del acudiente correspondiente, así no tendrás que escribirlo dos veces.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { id: "papa", label: "Es el correo del papá" },
              { id: "mama", label: "Es el correo de la mamá" },
              { id: "otro", label: "Es de otro acudiente" },
            ].map(op => {
              const active = data.correoOwner === op.id;
              return (
                <motion.button key={op.id} whileTap={{ scale: 0.97 }} onClick={() => setData(p => ({ ...p, correoOwner: op.id }))}
                  style={{
                    all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "12px",
                    background: active ? C.panel : C.bg, border: `2px solid ${active ? C.accent : C.line}`,
                    borderRadius: "14px", padding: "0.9rem 1.1rem", transition: "all 0.15s",
                    boxShadow: active ? "0 0 0 4px rgba(26,66,138,0.07)" : "none",
                  }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", flexShrink: 0, border: `2px solid ${active ? C.accent : C.lineHov}`, background: active ? C.accent : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {active && <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: C.white }} />}
                  </div>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.88rem", fontWeight: 700, color: active ? C.dark : C.body }}>{op.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </>
  );
}
// 3 — ASPIRANTE
function StepAspirante({ data, setData }) {
  const [dia, setDia] = useState("");
  const [mes, setMes] = useState("");
  const [anio, setAnio] = useState("");

  useEffect(() => {
    if (data.fechaNacimiento) {
      const [y, m, d] = data.fechaNacimiento.split("-");
      setDia(d || "");
      setMes(m || "");
      setAnio(y || "");
    }
  }, [data.fechaNacimiento]);

  useEffect(() => {
    if (dia && mes && anio) {
      const fecha = `${anio}-${mes}-${dia}`;
      let edad = "";
      const hoy = new Date();
      const nac = new Date(fecha);
      let ed = hoy.getFullYear() - nac.getFullYear();
      const diffM = hoy.getMonth() - nac.getMonth();
      if (diffM < 0 || (diffM === 0 && hoy.getDate() < nac.getDate())) ed--;
      edad = ed.toString();
      setData(p => ({ ...p, fechaNacimiento: fecha, edad }));
    } else {
      setData(p => ({ ...p, fechaNacimiento: "", edad: "" }));
    }
  }, [dia, mes, anio]);

  const anioActual = new Date().getFullYear();
  const anios = Array.from({ length: 22 }, (_, i) => anioActual - i);
  const meses = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const dias = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, "0"));

  return (
    <>
      <StepTitle
        badge="Datos del aspirante"
        title="¿Cómo se llama el estudiante?"
        sub="Nombre completo tal como aparece en el registro civil."
      />
      <FInput label="Nombres" value={data.nombreAspirante} onChange={e=>setData(p=>({...p,nombreAspirante:e.target.value}))} placeholder="Ej. María José" required />
      <FInput label="Apellidos" value={data.apellidosAspirante} onChange={e=>setData(p=>({...p,apellidosAspirante:e.target.value}))} placeholder="Ej. Pérez Gómez" required />

      {/* Fecha de nacimiento con selectores independientes */}
      <div style={{ marginBottom: "1rem" }}>
        <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.62rem", fontWeight:700, color:C.muted, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:"0.45rem" }}>
          Fecha de nacimiento <span style={{ color: C.accent }}>*</span>
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 2fr 1.2fr", gap: "10px" }}>
          {/* Día */}
          <select
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            style={{
              width: "100%", background: C.white,
              border: `2px solid ${dia ? C.accent : C.line}`,
              borderRadius: "14px", padding: "0.9rem 1.1rem",
              fontFamily: "'Poppins', sans-serif", fontWeight: dia ? 600 : 400,
              fontSize: "0.95rem", color: dia ? C.dark : C.muted,
              outline: "none", cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: dia ? "0 0 0 4px rgba(26,66,138,0.08)" : "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", paddingRight: "2.8rem",
            }}
          >
            <option value="">Día</option>
            {dias.map(d => <option key={d} value={d}>{d}</option>)}
          </select>

          {/* Mes */}
          <select
            value={mes}
            onChange={(e) => setMes(e.target.value)}
            style={{
              width: "100%", background: C.white,
              border: `2px solid ${mes ? C.accent : C.line}`,
              borderRadius: "14px", padding: "0.9rem 1.1rem",
              fontFamily: "'Poppins', sans-serif", fontWeight: mes ? 600 : 400,
              fontSize: "0.95rem", color: mes ? C.dark : C.muted,
              outline: "none", cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: mes ? "0 0 0 4px rgba(26,66,138,0.08)" : "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", paddingRight: "2.8rem",
            }}
          >
            <option value="">Mes</option>
            {meses.map((nombre, i) => (
              <option key={nombre} value={String(i + 1).padStart(2, "0")}>{nombre}</option>
            ))}
          </select>

          {/* Año */}
          <select
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
            style={{
              width: "100%", background: C.white,
              border: `2px solid ${anio ? C.accent : C.line}`,
              borderRadius: "14px", padding: "0.9rem 1.1rem",
              fontFamily: "'Poppins', sans-serif", fontWeight: anio ? 600 : 400,
              fontSize: "0.95rem", color: anio ? C.dark : C.muted,
              outline: "none", cursor: "pointer",
              transition: "border-color 0.15s, box-shadow 0.15s",
              boxShadow: anio ? "0 0 0 4px rgba(26,66,138,0.08)" : "none",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", paddingRight: "2.8rem",
            }}
          >
            <option value="">Año</option>
            {anios.map(a => <option key={a} value={String(a)}>{a}</option>)}
          </select>
        </div>

        {dia && mes && anio && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: C.panel, borderRadius: "999px", padding: "0.28rem 0.85rem", marginTop: "0.5rem" }}>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.72rem", fontWeight: 700, color: C.accent }}>
              {dia} de {meses[parseInt(mes) - 1]} de {anio}
            </span>
          </div>
        )}
      </div>

      {data.edad && (
        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:C.panel, borderRadius:"999px", padding:"0.3rem 0.9rem", marginBottom:"0.5rem" }}>
          <span style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.72rem", fontWeight:700, color:C.accent }}>{data.edad} años</span>
        </div>
      )}
    </>
  );
}

// 4 — GRADO
function StepGrado({ data, setData }) {
  const niveles = ["Preescolar","Primaria","Secundaria"];
  const nColors = NIVEL_COLOR;

  return (
    <>
      <StepTitle
        badge="Grado"
        title="¿A qué grado aspira para 2027?"
      />
      {niveles.map(niv => {
        const nc = nColors[niv];
        return (
          <div key={niv} style={{ marginBottom:"1.5rem" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:"6px",
              background: nc.bg, borderRadius:"999px",
              padding:"0.28rem 0.85rem", marginBottom:"0.7rem",
            }}>
              <span style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:nc.text, letterSpacing:"0.16em", textTransform:"uppercase" }}>{niv}</span>
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
              {GRADOS.filter(g => g.nivel === niv).map(g => (
                <FChip
                  key={g.id}
                  label={g.label}
                  sub={g.edad || undefined}
                  selected={data.grado === g.id}
                  onClick={() => setData(p => ({ ...p, grado:g.id, nivelDetectado:g.nivel }))}
                />
              ))}
            </div>
          </div>
        );
      })}
      {data.nivelDetectado && (
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
          style={{
            background: NIVEL_COLOR[data.nivelDetectado]?.bg || C.panel,
            borderRadius:"14px", padding:"1rem 1.3rem",
            borderLeft:`4px solid ${NIVEL_COLOR[data.nivelDetectado]?.accent || C.accent}`,
          }}
        >
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color: NIVEL_COLOR[data.nivelDetectado]?.text || C.accent, lineHeight:1.65, fontStyle:"italic" }}>
            {data.nivelDetectado === "Preescolar" && "Queremos conocer cómo juega, se relaciona y descubre el mundo."}
            {data.nivelDetectado === "Primaria" && "Esta etapa forja hábitos, curiosidad y amor por aprender."}
            {data.nivelDetectado === "Secundaria" && "Nos interesa conocer sus intereses, habilidades y hábitos de estudio."}
          </p>
        </motion.div>
      )}
    </>
  );
}

// 5 — ESTUDIA ACTUAL (solo preescolar)
function StepEstudiaActual({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Contexto actual"
        title="¿El niño o niña estudia actualmente en algún colegio?"
      />
      <FChoice title="Sí, actualmente estudia" selected={data.estudiaActual === true} onClick={() => setData(p=>({...p, estudiaActual:true}))} />
      <FChoice title="No, aún no estudia en ningún colegio" selected={data.estudiaActual === false} onClick={() => setData(p=>({...p, estudiaActual:false, colegioProcedencia:""}))} />
      {data.estudiaActual === true && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ marginTop:"0.5rem" }}>
          <FInput label="¿En qué colegio?" value={data.colegioProcedencia} onChange={e=>setData(p=>({...p,colegioProcedencia:e.target.value}))} placeholder="Nombre del colegio actual" required />
        </motion.div>
      )}
    </>
  );
}

// 6 — COLEGIO (no preescolar)
function StepColegio({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Colegio de procedencia"
        title="¿En qué colegio estudia actualmente?"
      />
      <FInput value={data.colegioProcedencia} onChange={e=>setData(p=>({...p,colegioProcedencia:e.target.value}))} placeholder="Nombre del colegio" required />
    </>
  );
}

// 7 — PAPÁ
function StepPapa({ data, setData }) {
  return (
    <>
      <StepTitle badge="Datos del padre" title="Información del papá" sub="Esta información es el canal principal de comunicación del proceso." />
      <FInput label="Apellidos" value={data.apellidosPadre} onChange={e=>setData(p=>({...p,apellidosPadre:e.target.value}))} placeholder="Ej. Pérez García" required />
      <FInput label="Nombres" value={data.nombrePadre} onChange={e=>setData(p=>({...p,nombrePadre:e.target.value}))} placeholder="Ej. Carlos Alberto" required />
      <FInput label="Correo electrónico" type="email" value={data.correoPadre} onChange={e=>setData(p=>({...p,correoPadre:e.target.value}))} placeholder="correo@ejemplo.com" required hint="Recibirá información importante del proceso en este correo." />
      <FInput label="Celular" type="tel" value={data.celularPadre} onChange={e=>setData(p=>({...p,celularPadre:e.target.value}))} placeholder="3XX XXX XXXX" required />
    </>
  );
}

// 8 — MAMÁ
function StepMama({ data, setData }) {
  return (
    <>
      <StepTitle badge="Datos de la madre" title="Información de la mamá" sub="Ambos acudientes recibirán la información del proceso." />
      <FInput label="Apellidos" value={data.apellidosMadre} onChange={e=>setData(p=>({...p,apellidosMadre:e.target.value}))} placeholder="Ej. Gómez Vargas" required />
      <FInput label="Nombres" value={data.nombreMadre} onChange={e=>setData(p=>({...p,nombreMadre:e.target.value}))} placeholder="Ej. Laura Marcela" required />
      <FInput label="Correo electrónico" type="email" value={data.correoMadre} onChange={e=>setData(p=>({...p,correoMadre:e.target.value}))} placeholder="correo@ejemplo.com" required hint="Recibirá información importante del proceso en este correo." />
      <FInput label="Celular" type="tel" value={data.celularMadre} onChange={e=>setData(p=>({...p,celularMadre:e.target.value}))} placeholder="3XX XXX XXXX" required />
    </>
  );
}

// 9 — MOTIVACIÓN + CANAL
function StepMotivacion({ data, setData }) {
  const canales = ["Redes sociales del colegio","Correo electrónico","Recomendación de un conocido","Otro"];
  return (
    <>
      <StepTitle badge="Cuéntanos" title="¿Qué te motiva a ser parte de la Familia Presentación?" sub="Queremos conocerte mejor antes de recibirte." />
      <FTextarea
        value={data.motivacion}
        onChange={e=>setData(p=>({...p,motivacion:e.target.value}))}
        placeholder="Cuéntanos qué te inspira de nuestro colegio, qué esperas encontrar, qué valoras en una institución educativa..."
        required
      />
      <div style={{ marginTop:"1.5rem" }}>
        <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.62rem", fontWeight:700, color:C.muted, letterSpacing:"0.18em", textTransform:"uppercase", marginBottom:"0.75rem" }}>
          ¿Cómo se enteraron del evento? <span style={{ color:C.accent }}>*</span>
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
          {canales.map(c => (
            <FChip key={c} label={c} selected={data.canalEnterado === c} onClick={() => setData(p=>({...p,canalEnterado:c}))} />
          ))}
        </div>
      </div>
    </>
  );
}

// 10 — OPEN HOUSE (asistentes)
function StepOpenHouse({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Open House · 11 de julio"
        title="¿Cuántos asistirán?"
        sub="Máximo 3 personas por registro."
      />
      <div style={{ display:"flex", gap:"10px", marginBottom:"1.5rem" }}>
        {["1","2","3"].map(n => (
          <FChip key={n} label={`${n} ${n==="1"?"persona":"personas"}`} selected={data.numeroAsistentes === n} onClick={() => setData(p=>({...p,numeroAsistentes:n}))} />
        ))}
      </div>
      {data.numeroAsistentes && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}>
          <FInput
            label="Nombres completos de los asistentes"
            value={data.nombresAsistentes}
            onChange={e=>setData(p=>({...p,nombresAsistentes:e.target.value}))}
            placeholder="Ej. Ana Pérez, Juan Gómez, Laura Torres"
            hint="Sepáralos con comas"
            required
          />
        </motion.div>
      )}
    </>
  );
}

// 11 — PAGO (solo admisión)
function StepPago({ files, setFiles, data }) {
  return (
    <>
      <StepTitle badge="Pago" title="Comprobante de pago" sub="Sube el comprobante de la consignación de $40.000 a Bancolombia." />
      <div style={{ background:C.night, borderRadius:"16px", padding:"1.4rem 1.6rem", marginBottom:"1.5rem" }}>
        <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.58rem", fontWeight:700, color:"rgba(255,255,255,0.4)", letterSpacing:"0.2em", textTransform:"uppercase", marginBottom:"0.4rem" }}>Valor</p>
        <p style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:900, fontSize:"2.4rem", color:C.white, lineHeight:1, marginBottom:"0.75rem" }}>$40.000</p>
        <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.78rem", color:"rgba(255,255,255,0.45)", lineHeight:1.6 }}>
          Cuenta de ahorros Bancolombia No. 39900005178 a nombre de <br/>
          <strong style={{ color:C.white }}>Instituto Parroquial Nuestra Señora de la Presentación</strong>
        </p>
      </div>
      <FFile label="Comprobante de pago" fieldKey="comprobantePago" files={files} setFiles={setFiles} required datosAspirante={data} />
    </>
  );
}

// 12 — DOCUMENTOS (solo admisión)
function StepDocumentos({ files, setFiles, data }) {
  const docs = [
    { key:"registroCivil", label:"Registro civil del aspirante", required:true },
    { key:"informeAcademico", label:"Último informe académico", required:true },
    { key:"fichaSeguimiento", label:"Ficha de seguimiento u hoja de vida", required:true },
    { key:"pazYSalvo", label:"Paz y salvo del colegio anterior", required:true },
  ];
  return (
    <>
      <StepTitle badge="Documentos" title="Documentos requeridos" sub="Sube los documentos del aspirante. Puedes subir PDF, JPG o PNG." />
      {docs.map(d => (
        <FFile key={d.key} label={d.label} fieldKey={d.key} files={files} setFiles={setFiles} required={d.required} datosAspirante={data} />
      ))}
    </>
  );
}

// 13 — ¿INICIAR ADMISIÓN AHORA? (solo open house, al final)
function StepContinuarAdmision({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Un paso más"
        title="¿Deseas iniciar el proceso de admisión ahora?"
        sub="Ya tenemos tus datos. Puedes continuar con la inscripción formal o hacerlo después del Open House."
      />
      <FChoice
        title="Sí, quiero iniciar la admisión ahora"
        sub="Completarás el pago y documentos. Tu información ya está guardada."
        note="Derecho de admisión: $40.000"
        selected={data.continuarAdmision === true}
        onClick={() => setData(p=>({...p,continuarAdmision:true}))}
      />
      <FChoice
        title="Lo haré después del Open House"
        sub="Recibirás información por correo para continuar cuando estés listo."
        selected={data.continuarAdmision === false}
        onClick={() => setData(p=>({...p,continuarAdmision:false}))}
      />
    </>
  );
}

// 14 — OPEN HOUSE DESDE ADMISIÓN
function StepOpenHouseAdmision({ data, setData }) {
  return (
    <>
      <StepTitle
        badge="Open House · 11 de julio"
        title="¿Te gustaría asistir al Open House?"
        sub="Es gratuito. Puedes venir con hasta 3 personas de tu familia."
      />
      <FChoice title="Sí, quiero asistir al Open House" selected={data.asistirOpenHouse === true} onClick={() => setData(p=>({...p,asistirOpenHouse:true}))} />
      <FChoice title="No, gracias" selected={data.asistirOpenHouse === false} onClick={() => setData(p=>({...p,asistirOpenHouse:false,numeroAsistentes:"",nombresAsistentes:""}))} />
      {data.asistirOpenHouse === true && (
        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ marginTop:"0.5rem" }}>
          <div style={{ display:"flex", gap:"10px", marginBottom:"1rem" }}>
            {["1","2","3"].map(n => (
              <FChip key={n} label={`${n} ${n==="1"?"persona":"personas"}`} selected={data.numeroAsistentes === n} onClick={() => setData(p=>({...p,numeroAsistentes:n}))} />
            ))}
          </div>
          {data.numeroAsistentes && (
            <FInput
              label="Nombres completos de los asistentes"
              value={data.nombresAsistentes}
              onChange={e=>setData(p=>({...p,nombresAsistentes:e.target.value}))}
              placeholder="Ej. Ana Pérez, Juan Gómez"
              hint="Sepáralos con comas"
            />
          )}
        </motion.div>
      )}
    </>
  );
}

// 15 — RESUMEN
function StepResumen({ data, files, modo }) {
  const includeAdmision = modo === "admision" || data.continuarAdmision === true;
  const includeOH = modo === "openhouse" || data.asistirOpenHouse === true;

  const Row = ({ label, value }) => value ? (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", padding:"0.75rem 1.2rem", borderBottom:`1px solid ${C.line}` }}>
      <span style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.65rem", fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", flexShrink:0, marginRight:"1rem" }}>{label}</span>
      <span style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color:C.dark, fontWeight:500, textAlign:"right" }}>{value}</span>
    </div>
  ) : null;

  const docsCount = ["comprobantePago","registroCivil","informeAcademico","fichaSeguimiento","pazYSalvo"].filter(k=>files[k]).length;

  return (
    <>
      <StepTitle badge="Casi listo" title="Revisa tu registro" sub="Confirma que toda la información esté correcta antes de enviar." />

      {/* Aspirante */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:"16px", overflow:"hidden", marginBottom:"1rem" }}>
        <div style={{ background:C.panel, padding:"0.65rem 1.2rem" }}>
          <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:C.accent, letterSpacing:"0.18em", textTransform:"uppercase" }}>Aspirante</p>
        </div>
        <Row label="Nombre" value={`${data.nombreAspirante} ${data.apellidosAspirante}`} />
        <Row label="Nacimiento" value={data.fechaNacimiento} />
        <Row label="Edad" value={data.edad ? `${data.edad} años` : null} />
        <Row label="Grado" value={data.grado} />
        <Row label="Colegio actual" value={data.colegioProcedencia || (data.estudiaActual === false ? "No estudia actualmente" : null)} />
      </div>

      {/* Papá */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:"16px", overflow:"hidden", marginBottom:"1rem" }}>
        <div style={{ background:C.panel, padding:"0.65rem 1.2rem" }}>
          <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:C.accent, letterSpacing:"0.18em", textTransform:"uppercase" }}>Padre</p>
        </div>
        <Row label="Nombre" value={`${data.nombrePadre} ${data.apellidosPadre}`} />
        <Row label="Correo" value={data.correoPadre} />
        <Row label="Celular" value={data.celularPadre} />
      </div>

      {/* Mamá */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:"16px", overflow:"hidden", marginBottom:"1rem" }}>
        <div style={{ background:C.panel, padding:"0.65rem 1.2rem" }}>
          <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:C.accent, letterSpacing:"0.18em", textTransform:"uppercase" }}>Madre</p>
        </div>
        <Row label="Nombre" value={`${data.nombreMadre} ${data.apellidosMadre}`} />
        <Row label="Correo" value={data.correoMadre} />
        <Row label="Celular" value={data.celularMadre} />
      </div>

      {/* Open House */}
      {includeOH && (
        <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:"16px", overflow:"hidden", marginBottom:"1rem" }}>
          <div style={{ background:"#FFFBEB", padding:"0.65rem 1.2rem" }}>
            <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:"#92400E", letterSpacing:"0.18em", textTransform:"uppercase" }}>Open House · 11 julio</p>
          </div>
          <Row label="Asistentes" value={data.numeroAsistentes ? `${data.numeroAsistentes} persona(s)` : null} />
          <Row label="Nombres" value={data.nombresAsistentes} />
        </div>
      )}

      {/* Admisión */}
      {includeAdmision && (
        <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:"16px", overflow:"hidden", marginBottom:"1rem" }}>
          <div style={{ background:C.night, padding:"0.65rem 1.2rem" }}>
            <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:800, color:"rgba(255,255,255,0.7)", letterSpacing:"0.18em", textTransform:"uppercase" }}>Proceso de admisión</p>
          </div>
          <div style={{ padding:"0.75rem 1.2rem" }}>
            <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color:C.accent }}>
              {docsCount} documento(s) adjunto(s)
            </p>
          </div>
        </div>
      )}

      <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.78rem", color:C.muted, lineHeight:1.65 }}>
        Al enviar este registro, el equipo de admisiones se comunicará contigo a través de los correos y celulares registrados.
      </p>
    </>
  );
}

function StepAcudientes({ data, setData }) {
  const toggle = (id) => {
    const cur = data.acudientesSeleccionados || [];
    setData(p => ({ ...p, acudientesSeleccionados: cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id] }));
  };

  const sel = data.acudientesSeleccionados || [];
  const opts = [
    { id: "papa", label: "Papá" },
    { id: "mama", label: "Mamá" },
    { id: "otro", label: "Otro acudiente" },
  ];

  const f = (tipo) => {
    if (tipo === "papa") return { ap: "apellidosPadre", nm: "nombrePadre", co: "correoPadre", ce: "celularPadre" };
    if (tipo === "mama") return { ap: "apellidosMadre", nm: "nombreMadre", co: "correoMadre", ce: "celularMadre" };
    return { ap: "apellidosOtro", nm: "nombreOtro", co: "correoOtro", ce: "celularOtro" };
  };

  return (
    <>
      <StepTitle badge="Acudientes" title="¿Quiénes serán los acudientes del estudiante?" sub="Puedes elegir uno, dos o los tres. La información de cada acudiente seleccionado será obligatoria." />
      <div style={{ display: "flex", gap: "10px", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {opts.map(op => {
          const active = sel.includes(op.id);
          return (
            <motion.button key={op.id} whileTap={{ scale: 0.94 }} onClick={() => toggle(op.id)}
              style={{
                all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
                fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem", fontWeight: 700,
                background: active ? C.dark : C.white, border: `2px solid ${active ? C.dark : C.line}`,
                color: active ? C.white : C.body, borderRadius: "14px", padding: "0.65rem 1.1rem",
                transition: "all 0.15s", boxShadow: active ? "0 4px 16px rgba(33,20,95,0.2)" : "none",
              }}>
              
              <span>{op.label}</span>
              {active && <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="8" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg></div>}
            </motion.button>
          );
        })}
      </div>
      {sel.length === 0 && <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.82rem", color: C.muted, marginBottom: "1rem" }}>Selecciona al menos un acudiente para continuar.</p>}
      <AnimatePresence>
        {sel.map(tipo => {
          const campos = f(tipo);
          const correoVal = data.correoOwner === tipo ? data.correo : (data[campos.co] || "");
          return (
            <motion.div key={tipo} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ background: C.bg, border: `2px solid ${C.line}`, borderRadius: "18px", padding: "1.4rem 1.5rem", marginBottom: "1rem" }}>
              <div style={{ marginBottom: "1.2rem" }}>
  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.88rem", fontWeight: 800, color: C.dark }}>{opts.find(o => o.id === tipo)?.label}</p>
</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 12px" }}>
                <FInput label="Apellidos" value={data[campos.ap]} onChange={e => setData(p => ({ ...p, [campos.ap]: e.target.value }))} placeholder="Apellidos" required />
                <FInput label="Nombres"   value={data[campos.nm]} onChange={e => setData(p => ({ ...p, [campos.nm]: e.target.value }))} placeholder="Nombres"   required />
              </div>
              <FInput label="Correo electrónico" type="email" value={correoVal} onChange={e => { if (data.correoOwner !== tipo) setData(p => ({ ...p, [campos.co]: e.target.value })); }} placeholder="correo@ejemplo.com" required readOnly={data.correoOwner === tipo} hint={data.correoOwner === tipo ? "Este es el correo que ingresaste al inicio — ya está registrado." : "Recibirá información importante del proceso."} />
              <FInput label="Celular" type="tel" value={data[campos.ce]} onChange={e => setData(p => ({ ...p, [campos.ce]: e.target.value }))} placeholder="3XX XXX XXXX" required />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </>
  );
}

// ─── PROGRESS RESTORE MODAL ──────────────────────────────────────────────────
function RestoreModal({ savedData, onRestore, onDismiss }) {
  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      style={{
        position:"fixed", inset:0, zIndex:200,
        background:"rgba(14,10,53,0.6)", backdropFilter:"blur(12px)",
        display:"flex", alignItems:"center", justifyContent:"center", padding:"1.5rem",
      }}
    >
      <motion.div
        initial={{ opacity:0, y:24, scale:0.97 }}
        animate={{ opacity:1, y:0, scale:1 }}
        style={{
          background:C.white, borderRadius:"24px",
          padding:"2rem", maxWidth:"420px", width:"100%",
          boxShadow:"0 32px 80px rgba(14,10,53,0.22)",
        }}
      >
        <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:C.panel, display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"1.2rem" }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
  <path d="M1 4v6h6M23 20v-6h-6" />
  <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
</svg>
        </div>
        <h3 style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:800, fontSize:"1.3rem", color:C.dark, marginBottom:"0.6rem" }}>Registro anterior encontrado</h3>
        <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.85rem", color:C.muted, lineHeight:1.65, marginBottom:"1.5rem" }}>
          Encontramos un registro iniciado con este correo. ¿Deseas continuar donde lo dejaste?
        </p>
        <div style={{ display:"flex", gap:"10px" }}>
          <button
            onClick={onRestore}
            style={{
              flex:1, all:"unset", cursor:"pointer",
              background:C.dark, color:C.white,
              fontFamily:"'Montserrat', sans-serif", fontWeight:700,
              fontSize:"0.82rem", textAlign:"center",
              padding:"0.85rem", borderRadius:"12px",
            }}
          >Continuar registro</button>
          <button
            onClick={onDismiss}
            style={{
              flex:1, all:"unset", cursor:"pointer",
              background:C.bg, color:C.body,
              fontFamily:"'Montserrat', sans-serif", fontWeight:600,
              fontSize:"0.82rem", textAlign:"center",
              padding:"0.85rem", borderRadius:"12px",
              border:`1px solid ${C.line}`,
            }}
          >Empezar de nuevo</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── FINAL ────────────────────────────────────────────────────────────────────
function Final({ data, modo }) {
  const includeOH = modo === "openhouse" || data.asistirOpenHouse === true;
  const includeAdm = modo === "admision" || data.continuarAdmision === true;

  return (
    <motion.div
      initial={{ opacity:0 }} animate={{ opacity:1 }}
      style={{
        minHeight:"100vh", background:C.bg,
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"80px 1.5rem 3rem",
      }}
    >
      <div style={{ maxWidth:"500px", width:"100%", textAlign:"center" }}>
        <motion.div
          initial={{ scale:0.6, opacity:0 }}
          animate={{ scale:1, opacity:1 }}
          transition={{ type:"spring", stiffness:200, damping:18, delay:0.1 }}
          style={{
            width:"72px", height:"72px", borderRadius:"50%",
            background:C.dark, display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 2.5rem",
            boxShadow:"0 16px 48px rgba(33,20,95,0.22)",
          }}
        >
          <svg width="26" height="20" viewBox="0 0 26 20" fill="none">
            <path d="M2 10L9 17L24 3" stroke={C.gold} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
          <p style={{ fontFamily:"'Montserrat', sans-serif", fontSize:"0.6rem", fontWeight:700, color:C.accent, letterSpacing:"0.25em", textTransform:"uppercase", marginBottom:"1rem" }}>Registro recibido</p>
          <h1 style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:900, fontSize:"clamp(2rem,5vw,3rem)", color:C.dark, lineHeight:1.1, letterSpacing:"-0.02em", marginBottom:"1.2rem" }}>
            Bienvenidos a<br/><span style={{ color:C.accent }}>La Presentación.</span>
          </h1>

          <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"2rem" }}>
            {includeOH && (
              <div style={{ background:"#FFFBEB", border:"1px solid #FDE68A", borderRadius:"12px", padding:"0.75rem 1rem" }}>
                <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.82rem", color:"#92400E" }}>✓ Lugar en Open House reservado · 11 de julio</p>
              </div>
            )}
            {includeAdm && (
              <div style={{ background:C.panel, border:`1px solid ${C.lineHov}`, borderRadius:"12px", padding:"0.75rem 1rem" }}>
                <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.82rem", color:C.accent }}>✓ Proceso de admisión iniciado</p>
              </div>
            )}
          </div>

          <p style={{ fontFamily:"'Poppins', sans-serif", fontWeight:300, fontSize:"0.92rem", color:C.muted, lineHeight:1.75, marginBottom:"2.5rem" }}>
            El equipo de admisiones revisará tu registro y se comunicará a través de los correos y celulares registrados.
          </p>

          <a href="https://admisiones.sipresc.co" style={{
            all:"unset", cursor:"pointer",
            fontFamily:"'Montserrat', sans-serif", fontWeight:700,
            fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
            color:C.white, background:C.dark,
            padding:"0.9rem 2.2rem", borderRadius:"999px",
            display:"inline-block",
            boxShadow:"0 12px 36px rgba(33,20,95,0.22)",
          }}>Volver a admisiones</a>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── MAIN FORM SHELL ─────────────────────────────────────────────────────────
const slideVariants = {
  enter: (dir) => ({ opacity:0, x: dir > 0 ? 48 : -48, scale:0.98 }),
  center: { opacity:1, x:0, scale:1 },
  exit:  (dir) => ({ opacity:0, x: dir > 0 ? -48 : 48, scale:0.98 }),
};

const EMPTY_DATA = {
  tipoRegistro:"", politicaAceptada:null,
  correo:"",
  nombreAspirante:"", apellidosAspirante:"", fechaNacimiento:"", edad:"",
  grado:"", nivelDetectado:"",
  estudiaActual:null, colegioProcedencia:"",
  acudientesSeleccionados:[], correoOwner:"",
  apellidosOtro:"", nombreOtro:"", correoOtro:"", celularOtro:"",
  apellidosPadre:"", nombrePadre:"", correoPadre:"", celularPadre:"",
  apellidosMadre:"", nombreMadre:"", correoMadre:"", celularMadre:"",
  motivacion:"", canalEnterado:"",
  numeroAsistentes:"", nombresAsistentes:"",
  asistirOpenHouse:null,
  continuarAdmision:null,
};

const EMPTY_FILES = {
  comprobantePago:null, registroCivil:null,
  informeAcademico:null, fichaSeguimiento:null, pazYSalvo:null,
};

export default function Registro() {
  const [phase, setPhase] = useState("form");
  const [stepIdx, setStepIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [data, setData] = useState(EMPTY_DATA);
  const [files, setFiles] = useState(EMPTY_FILES);
  const [restoreCandidate, setRestoreCandidate] = useState(null);
  const [sending, setSending] = useState(false);
  const [showHijosModal, setShowHijosModal] = useState(false);
  const [hijosRegistrados, setHijosRegistrados] = useState([]);

  const modo = data.tipoRegistro;
  const isAdmision = modo === "admision";
  const isOH = modo === "openhouse";

  useEffect(() => {
    if (data.correo && stepIdx > 0) {
      try { localStorage.setItem(`registro_${data.correo}`, JSON.stringify({ data, stepIdx })); } catch(e) {}
    }
  }, [data, stepIdx]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tipo = params.get("tipo");
    if (tipo && ["openhouse", "admision", "ambos"].includes(tipo)) {
      setData(prev => ({ ...prev, tipoRegistro: tipo }));
      setStepIdx(1);
    }
  }, []);

  const handleProgressRestore = (saved) => {
    setRestoreCandidate(saved);
  };

  const handleRestore = () => {
    setData(restoreCandidate.data);
    setStepIdx(restoreCandidate.stepIdx);
    setRestoreCandidate(null);
  };

  const buildSteps = useCallback(() => {
    const steps = [];
    steps.push({ id:"tipo" });
    steps.push({ id:"politica" });
    steps.push({ id:"correo" });
    steps.push({ id:"aspirante" });
    steps.push({ id:"grado" });

    if (data.nivelDetectado === "Preescolar") {
      steps.push({ id:"estudia" });
    } else if (data.grado) {
      steps.push({ id:"colegio" });
    }

    steps.push({ id:"acudientes" });
    steps.push({ id:"motivacion" });

    if (isOH) {
      steps.push({ id:"openhouse" });
      steps.push({ id:"continuarAdmision" });
      if (data.continuarAdmision === true) {
        steps.push({ id:"pago" });
        steps.push({ id:"documentos" });
      }
    }

    if (isAdmision) {
      steps.push({ id:"openHouseAdmision" });
      steps.push({ id:"pago" });
      steps.push({ id:"documentos" });
    }

    steps.push({ id:"resumen" });
    return steps;
  }, [data.nivelDetectado, data.grado, isOH, isAdmision, data.continuarAdmision]);

  const steps = buildSteps();
  const currentStep = steps[stepIdx];
  const totalSteps = steps.length;

  const canNext = useCallback(() => {
    if (!currentStep) return false;
    const { id } = currentStep;
    if (id === "tipo") return !!data.tipoRegistro;
    if (id === "politica") return data.politicaAceptada === true;
    if (id === "correo") return data.correo.includes("@");
    if (id === "aspirante") return data.nombreAspirante.trim() && data.apellidosAspirante.trim() && data.fechaNacimiento;
    if (id === "grado") return !!data.grado;
    if (id === "estudia") return data.estudiaActual !== null && (data.estudiaActual === false || data.colegioProcedencia.trim());
    if (id === "colegio") return data.colegioProcedencia.trim();
    if (id === "acudientes") {
      const sel = data.acudientesSeleccionados || [];
      if (!sel.length) return false;
      return sel.every(tipo => {
        const campos = {
          papa: { ap: "apellidosPadre", nm: "nombrePadre", co: "correoPadre", ce: "celularPadre" },
          mama: { ap: "apellidosMadre", nm: "nombreMadre", co: "correoMadre", ce: "celularMadre" },
          otro: { ap: "apellidosOtro", nm: "nombreOtro", co: "correoOtro", ce: "celularOtro" },
        }[tipo];
        const correoVal = data.correoOwner === tipo ? data.correo : data[campos.co];
        return data[campos.ap]?.trim() && data[campos.nm]?.trim() && correoVal?.includes("@") && data[campos.ce]?.trim();
      });
    }
    if (id === "motivacion") return data.motivacion.trim() && data.canalEnterado;
    if (id === "openhouse") return data.numeroAsistentes && data.nombresAsistentes.trim();
    if (id === "continuarAdmision") return data.continuarAdmision !== null;
    if (id === "openHouseAdmision") return data.asistirOpenHouse !== null;
    if (id === "pago") return !!files.comprobantePago_link;
    if (id === "documentos") return (
      !!files.registroCivil_link &&
      !!files.informeAcademico_link &&
      !!files.fichaSeguimiento_link &&
      !!files.pazYSalvo_link
    );
    if (id === "resumen") return true;
    return true;
  }, [currentStep, data, files]);

  const goNext = () => {
    if (!canNext()) return;
    if (stepIdx === totalSteps - 1) {
      handleSubmit();
    } else {
      setDir(1);
      setStepIdx(i => i + 1);
    }
  };

  const goBack = () => {
    if (stepIdx > 0) {
      setDir(-1);
      setStepIdx(i => i - 1);
    }
  };

  const handleSubmit = async () => {
    setSending(true);

    try {
      let tipoRegistroFinal = data.tipoRegistro;
      if (data.tipoRegistro === "openhouse" && data.continuarAdmision === true) tipoRegistroFinal = "openhouse_admision";
      if (data.tipoRegistro === "admision" && data.asistirOpenHouse === true) tipoRegistroFinal = "admision_openhouse";

      const datosAEnviar = {
        tipoRegistro: tipoRegistroFinal,
        correo: data.correo,
        correoOwner: data.correoOwner,
        nombreAspirante: data.nombreAspirante,
        apellidosAspirante: data.apellidosAspirante,
        fechaNacimiento: data.fechaNacimiento,
        edad: data.edad,
        grado: data.grado,
        estudiaActual: data.estudiaActual,
        colegioProcedencia: data.colegioProcedencia,
        nombrePadre: data.nombrePadre,
        apellidosPadre: data.apellidosPadre,
        correoPadre: data.correoPadre,
        celularPadre: data.celularPadre,
        nombreMadre: data.nombreMadre,
        apellidosMadre: data.apellidosMadre,
        correoMadre: data.correoMadre,
        celularMadre: data.celularMadre,
        nombreOtro: data.nombreOtro,
        apellidosOtro: data.apellidosOtro,
        correoOtro: data.correoOtro,
        celularOtro: data.celularOtro,
        motivacion: data.motivacion,
        canalEnterado: data.canalEnterado,
        asistirOpenHouse: data.asistirOpenHouse,
        numeroAsistentes: data.numeroAsistentes,
        nombresAsistentes: data.nombresAsistentes,
        continuarAdmision: data.continuarAdmision,
        comprobantePago_link: files.comprobantePago_link || null,
        registroCivil_link: files.registroCivil_link || null,
        informeAcademico_link: files.informeAcademico_link || null,
        fichaSeguimiento_link: files.fichaSeguimiento_link || null,
        pazYSalvo_link: files.pazYSalvo_link || null,
      };

      const resultado = await guardarRegistro(datosAEnviar);

      if (resultado.success) {
        try { localStorage.removeItem(`registro_${data.correo}`); } catch(e) {}
        setPhase("done");
      } else {
        if (resultado.error?.includes("Ya existe")) {
          setPhase("duplicado");
        } else {
          setPhase("error");
        }
      }

    } catch (error) {
      console.error("Error al enviar:", error);
      setPhase("error");
    } finally {
      setSending(false);
    }
  };

  const renderStep = () => {
    if (!currentStep) return null;
    const { id } = currentStep;
    const props = { data, setData, files, setFiles };
    if (id === "tipo") return <StepTipo {...props} />;
    if (id === "politica") return <StepPolitica {...props} />;
    if (id === "correo") return <StepCorreo {...props} onProgressRestore={handleProgressRestore} stepIdx={stepIdx} setStepIdx={setStepIdx} setHijosRegistrados={setHijosRegistrados} setShowHijosModal={setShowHijosModal} />;
    if (id === "aspirante") return <StepAspirante {...props} />;
    if (id === "grado") return <StepGrado {...props} />;
    if (id === "estudia") return <StepEstudiaActual {...props} />;
    if (id === "colegio") return <StepColegio {...props} />;
    if (id === "acudientes") return <StepAcudientes {...props} />;
    if (id === "motivacion") return <StepMotivacion {...props} />;
    if (id === "openhouse") return <StepOpenHouse {...props} />;
    if (id === "continuarAdmision") return <StepContinuarAdmision {...props} />;
    if (id === "openHouseAdmision") return <StepOpenHouseAdmision {...props} />;
    if (id === "pago") return <StepPago {...props} />;
    if (id === "documentos") return <StepDocumentos {...props} />;
    if (id === "resumen") return <StepResumen data={data} files={files} modo={modo} />;
    return null;
  };

  if (sending) return (
    <AnimatePresence>
      <SendingScreen />
    </AnimatePresence>
  );

  if (phase === "duplicado") return (
    <>
      <style>{FONTS}</style>
      <Topbar stepIdx={0} totalSteps={0} tipoRegistro={null} />
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ maxWidth:"480px", width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1.5rem" }}>📋</div>
          <h2 style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:800, fontSize:"1.6rem", color:C.dark, marginBottom:"1rem" }}>
            Ya tienes un registro
          </h2>
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.9rem", color:C.muted, lineHeight:1.7, marginBottom:"1.5rem" }}>
            Ya existe un registro con el correo <strong style={{ color:C.dark }}>{data.correo}</strong>. Si crees que es un error, escríbenos.
          </p>
          <a href="https://admisiones.sipresc.co" style={{ all:"unset", cursor:"pointer", background:C.dark, color:C.white, fontFamily:"'Montserrat', sans-serif", fontWeight:700, fontSize:"0.82rem", padding:"0.9rem 2rem", borderRadius:"999px", display:"inline-block" }}>
            Volver a admisiones
          </a>
        </div>
      </div>
    </>
  );

  if (phase === "error") return (
    <>
      <style>{FONTS}</style>
      <Topbar stepIdx={0} totalSteps={0} tipoRegistro={null} />
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
        <div style={{ maxWidth:"480px", width:"100%", textAlign:"center" }}>
          <div style={{ fontSize:"3rem", marginBottom:"1.5rem" }}>⚠️</div>
          <h2 style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:800, fontSize:"1.6rem", color:C.dark, marginBottom:"1rem" }}>
            Hubo un problema al enviar
          </h2>
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"0.9rem", color:C.muted, lineHeight:1.7, marginBottom:"0.5rem" }}>
            Tu información está guardada en este dispositivo. Intenta de nuevo o escríbenos directamente:
          </p>
          <p style={{ fontFamily:"'Montserrat', sans-serif", fontWeight:700, fontSize:"0.9rem", color:C.accent, marginBottom:"1.5rem" }}>
            admisiones@lapresentaciongirardota.edu.co
          </p>
          <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" }}>
            <button
              onClick={() => { setPhase("form"); setSending(false); }}
              style={{ all:"unset", cursor:"pointer", background:C.dark, color:C.white, fontFamily:"'Montserrat', sans-serif", fontWeight:700, fontSize:"0.82rem", padding:"0.9rem 2rem", borderRadius:"999px" }}
            >
              Intentar de nuevo
            </button>
            <a href="https://admisiones.sipresc.co" style={{ all:"unset", cursor:"pointer", background:C.bg, color:C.body, fontFamily:"'Montserrat', sans-serif", fontWeight:600, fontSize:"0.82rem", padding:"0.9rem 2rem", borderRadius:"999px", border:`1px solid ${C.line}` }}>
              Volver
            </a>
          </div>
        </div>
      </div>
    </>
  );

  if (phase === "done") return (
    <>
      <style>{FONTS}</style>
      <Topbar stepIdx={0} totalSteps={0} tipoRegistro={null} />
      <Final data={data} modo={modo} />
    </>
  );

  const nextLabel = stepIdx === totalSteps - 1 ? (sending ? "Enviando..." : "Enviar registro") : "Continuar";
  const disabled = !canNext() || sending;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, position:"relative" }}>
      <style>{FONTS}</style>
      <AbstractBackground nivel={data.nivelDetectado} />
      <Topbar stepIdx={stepIdx} totalSteps={totalSteps} tipoRegistro={data.tipoRegistro} />

      {/* Restore modal */}
      <AnimatePresence>
        {restoreCandidate && (
          <RestoreModal
            savedData={restoreCandidate}
            onRestore={handleRestore}
            onDismiss={() => setRestoreCandidate(null)}
          />
        )}
      </AnimatePresence>

      {/* Modal de selección de hijos */}
      <AnimatePresence>
        {showHijosModal && hijosRegistrados.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(14,10,53,0.6)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "1.5rem",
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              style={{
                background: "#FFFFFF", borderRadius: "24px",
                padding: "2rem", maxWidth: "480px", width: "100%",
                boxShadow: "0 32px 80px rgba(14,10,53,0.22)",
              }}
            >
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1.3rem", color: "#21145F", marginBottom: "0.5rem" }}>
                Ya tienes registros previos
              </h3>
              <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.85rem", color: "#9CA3AF", lineHeight: 1.65, marginBottom: "1.5rem" }}>
                Encontramos {hijosRegistrados.length} aspirante(s) registrado(s) con este correo.
                Selecciona para qué hijo quieres continuar el proceso.
              </p>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.5rem" }}>
                {hijosRegistrados.map((hijo, index) => (
                  <button
                    key={index}
                    onClick={() => {
  // 1. Precargar TODOS los datos del hijo
  setData(p => ({
    ...p,
    nombreAspirante: hijo["Nombres aspirante"] || "",
    apellidosAspirante: hijo["Apellidos aspirante"] || "",
    fechaNacimiento: hijo["Fecha nacimiento"] || "",
    edad: hijo["Edad"] || "",
    grado: hijo["Grado"] || "",
    colegioProcedencia: hijo["Colegio procedencia"] || "",
    nombrePadre: hijo["Nombres papá"] || "",
    apellidosPadre: hijo["Apellidos papá"] || "",
    correoPadre: hijo["Correo papá"] || "",
    celularPadre: hijo["Celular papá"] || "",
    nombreMadre: hijo["Nombres mamá"] || "",
    apellidosMadre: hijo["Apellidos mamá"] || "",
    correoMadre: hijo["Correo mamá"] || "",
    celularMadre: hijo["Celular mamá"] || "",
    nombreOtro: hijo["Nombres otro acudiente"] || "",
    apellidosOtro: hijo["Apellidos otro acudiente"] || "",
    correoOtro: hijo["Correo otro acudiente"] || "",
    celularOtro: hijo["Celular otro acudiente"] || "",
    motivacion: hijo["Motivación"] || "",
    canalEnterado: hijo["Canal de llegada"] || "",
    numeroAsistentes: hijo["Número asistentes"] || "",
    nombresAsistentes: hijo["Nombres asistentes"] || "",
    asistirOpenHouse: hijo["¿Asiste a Open House?"] === "Sí" ? true : (hijo["¿Asiste a Open House?"] === "No" ? false : null),
    continuarAdmision: hijo["¿Continúa a admisión?"] === "Sí" ? true : (hijo["¿Continúa a admisión?"] === "No" ? false : null),
    estudiaActual: hijo["¿Estudia actualmente?"] === "Sí" ? true : (hijo["¿Estudia actualmente?"] === "No" ? false : null),
    // ⚠️ IMPORTANTE: NO precargar tipoRegistro para que el usuario pueda elegir
  }));
  
  // 2. Cerrar el modal
  setShowHijosModal(false);
  
  // 3. ✅ AVANZAR AL SIGUIENTE PASO (para ver los datos cargados)
  // Si el usuario está en el paso de correo (stepIdx = 2), avanzar al siguiente
  if (stepIdx === 2) {
    setDir(1);
    setStepIdx(3); // Ir a "Aspirante" donde se verán los datos precargados
  }
}}
                    style={{
                      all: "unset", cursor: "pointer",
                      width: "100%", textAlign: "left",
                      background: "#F7F8FC", border: "1px solid #E8EAF0",
                      borderRadius: "12px", padding: "1rem",
                      transition: "all 0.15s",
                    }}
                  >
                    <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, color: "#21145F" }}>
                      {hijo["Nombres aspirante"]} {hijo["Apellidos aspirante"]}
                    </p>
                    <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "0.8rem", color: "#9CA3AF" }}>
                      Grado: {hijo["Grado"]} · Estado: {hijo["Estado actual"] || "Registro recibido"}
                    </p>
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowHijosModal(false)}
                style={{
                  all: "unset", cursor: "pointer",
                  width: "100%", textAlign: "center",
                  fontFamily: "'Montserrat', sans-serif", fontWeight: 600,
                  fontSize: "0.82rem", color: "#9CA3AF",
                  padding: "0.8rem", borderRadius: "12px",
                  border: "1px solid #E8EAF0",
                }}
              >
                Registrar un nuevo aspirante
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form content */}
      <div style={{
        paddingTop:"80px", paddingBottom:"100px",
        minHeight:"100vh", display:"flex",
        alignItems:"center", justifyContent:"center",
        padding:"80px 1.5rem 120px",
      }}>
        <div style={{ width:"100%", maxWidth:"620px", position:"relative", zIndex:10 }}>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={currentStep?.id || stepIdx}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration:0.38, ease:[0.22,1,0.36,1] }}
            >
              <div style={{
                background:"rgba(255,255,255,0.88)",
                backdropFilter:"blur(24px)",
                WebkitBackdropFilter:"blur(24px)",
                borderRadius:"24px",
                padding:"clamp(1rem, 4vw, 2rem)",
                border:`1px solid rgba(255,255,255,0.9)`,
                boxShadow:"0 8px 48px rgba(33,20,95,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
              }}>
                {renderStep()}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Nav buttons */}
      <div style={{
        position:"fixed", bottom:"1.5rem", right:"1.5rem",
        display:"flex", gap:"10px", zIndex:50,
      }}>
        {stepIdx > 0 && (
          <button
            onClick={goBack}
            style={{
              all:"unset", cursor:"pointer",
              width:"48px", height:"48px", borderRadius:"50%",
              border:`2px solid ${C.line}`, background:C.white,
              display:"flex", alignItems:"center", justifyContent:"center",
              color:C.muted, fontSize:"1.1rem",
              boxShadow:"0 4px 16px rgba(33,20,95,0.08)",
              transition:"all 0.15s",
            }}
          >←</button>
        )}
        <motion.button
          whileHover={disabled ? {} : { scale:1.04 }}
          whileTap={disabled ? {} : { scale:0.96 }}
          onClick={goNext}
          disabled={disabled}
          style={{
            all:"unset", cursor: disabled ? "not-allowed" : "pointer",
            background: disabled ? C.line : C.dark,
            color: disabled ? C.muted : C.white,
            fontFamily:"'Montserrat', sans-serif",
            fontWeight:800, fontSize:"0.78rem",
            letterSpacing:"0.1em", textTransform:"uppercase",
            padding:"0.9rem 2rem", borderRadius:"999px",
            transition:"all 0.2s",
            boxShadow: disabled ? "none" : "0 8px 28px rgba(33,20,95,0.25)",
            display:"flex", alignItems:"center", gap:"6px",
          }}
        >
          {sending && <span style={{ fontSize:"0.9rem" }}>⏳</span>}
          {nextLabel} {!disabled && !sending && "→"}
        </motion.button>
      </div>

      {/* Step counter bottom left */}
      <div style={{
        position:"fixed", bottom:"2rem", left:"1.5rem",
        fontFamily:"'Montserrat', sans-serif",
        fontSize:"0.65rem", fontWeight:700, color:C.muted,
        zIndex:20,
      }}>
        {String(stepIdx+1).padStart(2,"0")} / {String(totalSteps).padStart(2,"0")}
      </div>
    </div>
  );
}
