import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdmisionesRegistro from "./AdmisionesRegistro";
import Registro from "./Registro";

import { consultarEstado } from "./api";

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const FORM_URL = "/admisiones/registro";

const DYNAMIC_PHRASES = [
  "crecer feliz.",
  "sentirse en casa.",
  "aprender con sentido.",
  "descubrir su talento.",
  "caminar en familia.",
  "soñar en grande.",
];

const GALLERY_ITEMS = [
  { title: "Preescolar", word: "Comenzar", image: "/images/galeria-preescolar.jpg" },
  { title: "Primaria", word: "Descubrir", image: "/images/galeria-primaria.jpg" },
  { title: "Bachillerato", word: "Crecer", image: "/images/galeria-bachillerato.jpg" },
  { title: "Tecnología", word: "Crear", image: "/images/galeria-tecnologia.jpg" },
  { title: "Deporte", word: "Compartir", image: "/images/galeria-deporte.jpg" },
  { title: "Pastoral", word: "Caminar", image: "/images/galeria-pastoral.jpg" },
  { title: "Cultura", word: "Expresar", image: "/images/galeria-cultura.jpg" },
  { title: "Familia", word: "Acompañar", image: "/images/galeria-familia.jpg" },
  { title: "Eventos", word: "Celebrar", image: "/images/galeria-eventos.jpg" },
];

const DIFFERENTIALS = [
  {
    icon: "◎",
    title: "Acompañamiento cercano",
    text: "Cada estudiante es mirado con atención, escuchado en su proceso y acompañado según su historia, su ritmo y sus talentos.",
  },
  {
    icon: "✦",
    title: "Formación con valores",
    text: "Formamos personas capaces de convivir, decidir con responsabilidad y actuar con respeto, sencillez y sentido humano.",
  },
  {
    icon: "†",
    title: "Identidad católica",
    text: "Nuestra propuesta educativa nace de la fe, el servicio y la esperanza, iluminando la vida cotidiana con sentido cristiano.",
  },
  {
    icon: "◈",
    title: "Aprendizaje con sentido",
    text: "Aprender es descubrir, preguntar, crear y aplicar lo aprendido a la vida. Aquí el conocimiento también forma criterio y propósito.",
  },
  {
    icon: "⬡",
    title: "Familia y colegio juntos",
    text: "Creemos en una educación compartida, donde familia y colegio caminan unidos para acompañar mejor a cada estudiante.",
  },
];

const MOCK_ADMISSIONS = [
  {
    id: "ADM-2027-001",
    aspirante: "Mariana Gómez Restrepo",
    grado: "Tercero",
    acudiente: "Laura Restrepo",
    correoPadre: "papa@gmail.com",
    correoMadre: "familia@gmail.com",
    celularPadre: "3001234567",
    celularMadre: "3105557788",
    estado: "Entrevista programada",
    pruebaFecha: "6 de agosto de 2026",
    pruebaHora: "8:00 a.m.",
    tipoActividad: "Prueba de admisión",
    entrevistaFecha: "15 de agosto de 2026",
    entrevistaHora: "10:30 a.m.",
    responsableEntrevista: "Coordinación Académica",
    induccionFecha: "20 de noviembre de 2026",
    induccionHora: "Por confirmar",
    observacion:
      "Asistir con el aspirante y acudiente responsable. Llegar 10 minutos antes de la hora asignada.",
    actualizado: "Actualizado por el equipo de admisiones",
  },
  {
    id: "ADM-2027-002",
    aspirante: "Samuel Gómez Restrepo",
    grado: "Transición",
    acudiente: "Laura Restrepo",
    correoPadre: "papa@gmail.com",
    correoMadre: "familia@gmail.com",
    celularPadre: "3001234567",
    celularMadre: "3105557788",
    estado: "Prueba o pasantía programada",
    pruebaFecha: "8 de agosto de 2026",
    pruebaHora: "9:00 a.m.",
    tipoActividad: "Pasantía escolar",
    entrevistaFecha: "",
    entrevistaHora: "",
    responsableEntrevista: "",
    induccionFecha: "20 de noviembre de 2026",
    induccionHora: "Por confirmar",
    observacion:
      "La familia recibirá orientación sobre la entrevista una vez finalizada la pasantía.",
    actualizado: "Actualizado por el equipo de admisiones",
  },
];

const STATUS_STEPS = [
  "Presentación del colegio",
  "Inscripción",
  "Prueba o pasantía",
  "Entrevista",
  "Resultado",
  "Inducción",
];

function getStepIndex(estado) {
  const value = String(estado || "").toLowerCase();

  if (value.includes("presentación") || value.includes("open house") || value.includes("registro recibido")) return 0;
  if (value.includes("inscripción") || value.includes("registro completado")) return 1;
  if (value.includes("prueba") || value.includes("pasantía") || value.includes("prueba programada")) return 2;
  if (value.includes("entrevista") || value.includes("entrevista programada")) return 3;
  if (value.includes("resultado") || value.includes("admitido") || value.includes("no admitido") || value.includes("lista de espera")) return 4;
  if (value.includes("inducción") || value.includes("finalizado") || value.includes("bienvenida")) return 5;

  return 0;
}

// ✅ ACTUALIZADO: Timeline sin Open House
const TIMELINE_STEPS = [
  { n: "01", title: "Registro inicial", text: "Déjanos tus datos para acompañarte desde el primer momento." },
  { n: "02", title: "Inscripción y documentos", text: "Continúa el proceso con la información requerida." },
  { n: "03", title: "Pruebas y entrevista", text: "Queremos conocer al aspirante, su historia y su contexto familiar." },
  { n: "04", title: "Resultado del proceso", text: "Recibirás la información por los canales institucionales." },
  { n: "05", title: "Bienvenida", text: "Iniciamos juntos este nuevo camino en familia." },
];

// ✅ ACTUALIZADO: FAQ enfocado en admisión
const FAQS = [
  {
    q: "¿El proceso de admisión tiene algún costo?",
    a: "El registro inicial no tiene costo. El equipo de admisiones te orientará sobre los pasos siguientes y los costos asociados al proceso.",
  },
  {
    q: "¿Puedo iniciar el proceso si no asistí al Open House?",
    a: "Sí. El proceso de admisión continúa abierto. Puedes iniciar tu registro en cualquier momento.",
  },
  {
    q: "¿Qué grados están disponibles para 2027?",
    a: "El equipo de admisiones confirmará la disponibilidad según el grado al momento del registro.",
  },
  {
    q: "¿Cómo continúa el proceso después del registro?",
    a: "El colegio se pondrá en contacto contigo para orientarte sobre inscripción, documentos, entrevista y pasos siguientes.",
  },
  {
    q: "¿Dónde puedo comunicarme si tengo dudas?",
    a: "Puedes dejar tus datos en el registro y el equipo institucional te acompañará por los canales oficiales.",
  },
  {
    q: "¿Cuándo inician las clases en 2027?",
    a: "El calendario académico se publicará oportunamente. El equipo de admisiones te informará sobre las fechas clave.",
  },
];

// ─── HOOKS ───────────────────────────────────────────────────────────────────
function useCounter(end, duration = 2000, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;

    let startTime = null;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [start, end, duration]);

  return count;
}

// ─── SHARED ANIMATION VARIANTS ───────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────
function Section({ children, className = "", style = {}, id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
}

// ─── HERO ─────────────────────────────────────────────────────────────────────
// ✅ ACTUALIZADO: Botón Open House muestra "Realizado ✓"
function Hero() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIdx((i) => (i + 1) % DYNAMIC_PHRASES.length);
    }, 2800);

    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearInterval(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[680px] overflow-hidden bg-[#0E0A35]">
      <div className="absolute inset-0 z-0">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
        >
          <source 
            src="https://res.cloudinary.com/dmfm1r8ar/video/upload/v1779986251/0528_1_lgkebw.mov" 
            type="video/mp4" 
          />
        </video>

        <div className="absolute inset-0 bg-[#0E0A35]/28" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0E0A35]/55 via-[#0E0A35]/8 to-[#0E0A35]/88" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0E0A35]/68 via-transparent to-[#0E0A35]/48" />
      </div>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 px-5 md:px-12 py-6"
      >
        <div
          className={`relative mx-auto max-w-7xl flex items-center justify-between gap-2 transition-all duration-500 ${
            scrolled
              ? "rounded-full bg-white/90 backdrop-blur-xl px-5 py-2 shadow-[0_18px_60px_rgba(0,0,0,0.12)]"
              : "py-0"
          }`}
        >
          <a
            href={FORM_URL}
            className={`hidden sm:inline-flex items-center gap-2 text-xs font-extrabold tracking-wide transition-colors duration-500 ${
              scrolled ? "text-[#21145F]" : "text-white"
            }`}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              textShadow: scrolled ? "none" : "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            <span>Iniciar admisión</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                scrolled ? "bg-[#FFCC00]" : "bg-white/70"
              }`}
            />
          </a>

          <a
            href="#"
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 md:gap-4"
          >
            <div
              className={`leading-none transition-colors duration-500 ${
                scrolled ? "text-[#21145F]" : "text-white"
              }`}
              style={{
                fontFamily: "'CollegiateBlackFLF', serif",
                fontSize: "clamp(1.8rem, 3vw, 2.4rem)",
                lineHeight: "0.82",
                textShadow: scrolled ? "none" : "0 10px 30px rgba(0,0,0,0.45)",
              }}
            >
              P
            </div>

            <div className="flex flex-col leading-none">
              <span
                className={`uppercase tracking-[0.26em] text-[0.68rem] md:text-xs font-extrabold transition-colors duration-500 ${
                  scrolled ? "text-[#21145F]" : "text-white"
                }`}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: scrolled ? "none" : "0 10px 30px rgba(0,0,0,0.45)",
                }}
              >
                La Presentación
              </span>

              <span
                className={`uppercase tracking-[0.31em] text-[0.48rem] md:text-[0.55rem] mt-1 font-semibold transition-colors duration-500 ${
                  scrolled ? "text-[#1A428A]/75" : "text-white/70"
                }`}
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: scrolled ? "none" : "0 10px 30px rgba(0,0,0,0.45)",
                }}
              >
                Admisiones 2027
              </span>
            </div>
          </a>

          {/* ✅ ACTUALIZADO: Open House -> Realizado ✓ */}
          <div
            className={`inline-flex items-center gap-1 md:gap-2 rounded-full px-3 md:px-4 py-1 md:py-2 text-[10px] md:text-xs font-bold tracking-wide transition-all duration-500 ${
              scrolled
                ? "bg-[#F7F8FC] text-[#21145F]"
                : "bg-white/[0.14] text-white/70 border border-white/20 backdrop-blur-md"
            }`}
            style={{
              fontFamily: "'Montserrat', sans-serif",
              textShadow: scrolled ? "none" : "0 8px 24px rgba(0,0,0,0.35)",
            }}
          >
            <span className="hidden sm:inline">Open House</span>
            <span className="sm:hidden">OH</span>
            <span className={scrolled ? "text-[#1A428A]/40" : "text-white/30"}>·</span>
            <span style={{ color: scrolled ? "#FFCC00" : "#FFCC00" }}>Realizado</span>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 h-full flex items-end px-6 md:px-12 pb-16 md:pb-24">
        <div className="w-full max-w-7xl mx-auto grid md:grid-cols-[1fr_0.42fr] gap-8 md:gap-16 items-end">
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-5xl pb-3"
          >
            <h1
              className="text-white font-black tracking-[-0.055em] leading-[0.95]"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                textShadow: "0 24px 70px rgba(0,0,0,0.55)",
                fontSize: "clamp(3.15rem, 7.2vw, 7.4rem)",
              }}
            >
              <span className="block">Un colegio para</span>

              <span className="block text-[#FFCC00] min-h-[1.05em]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={phraseIdx}
                    initial={{ y: 32, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -28, opacity: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="block"
                  >
                    {DYNAMIC_PHRASES[phraseIdx]}
                  </motion.span>
                </AnimatePresence>
              </span>
            </h1>
          </motion.div>

          {/* ✅ ACTUALIZADO: Botones - eliminado "Conocer Open House" */}
          <motion.div
            initial={{ opacity: 0, y: 42 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="flex md:justify-end"
          >
            <div className="w-full md:w-[320px] space-y-3">
              <a
                href={FORM_URL}
                className="group flex items-center justify-between w-full rounded-full px-7 py-4 bg-white text-[#21145F] backdrop-blur-xl font-semibold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02] hover:bg-white"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: "0 22px 70px rgba(0,0,0,0.34)",
                }}
              >
                <span>Iniciar proceso de admisión</span>
                <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#consulta-proceso"
                className="group flex items-center justify-between w-full rounded-full px-7 py-4 bg-black/20 text-white border border-white/20 backdrop-blur-xl font-medium text-sm tracking-wide transition-all duration-300 hover:bg-white/12 hover:scale-[1.02]"
                style={{
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: "0 18px 60px rgba(0,0,0,0.18)",
                }}
              >
                <span>Consultar mi proceso</span>
                <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="hidden md:block absolute bottom-8 left-1/2 -translate-x-1/2 z-10 text-white/45"
      >
        ↓
      </motion.div>
    </section>
  );
}

// ─── EMOTIONAL SECTION ────────────────────────────────────────────────────────
function EmotionalSection() {
  return (
    <Section
      className="py-16 md:py-24 px-6 md:px-12 lg:px-24"
      style={{ background: "#FFFFFF" }}
    >
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <motion.p variants={fadeUp} className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
            Nuestra esencia
          </motion.p>

          <motion.h2
            variants={fadeUp}
            className="font-black text-3xl md:text-5xl leading-tight mb-6"
            style={{ fontFamily: "'Montserrat', sans-serif", color: "#21145F" }}
          >
            No eliges solo un colegio.<br />
            <span style={{ color: "#1A428A" }}>Eliges una familia.</span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="text-gray-600 text-lg leading-relaxed mb-6"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            En La Presentación creemos que cada estudiante tiene una historia, unos talentos y una manera particular de aprender. Por eso, educar es caminar juntos: con cercanía, con valores y con una mirada profundamente humana.
          </motion.p>

          <motion.p
            variants={fadeUp}
            className="text-gray-500 text-base leading-relaxed italic"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Aquí la formación académica se une con la fe, la vida, la familia y el propósito.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 flex items-center gap-4">
            <div className="w-12 h-0.5" style={{ background: "#FFCC00" }} />
            <p className="text-sm font-medium tracking-widest uppercase" style={{ color: "#21145F" }}>
              Piedad · Sencillez · Trabajo · Caridad
            </p>
          </motion.div>
        </div>

        <motion.div variants={fadeUp} className="relative">
          <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/images/esencia-colegio.jpg"
              alt="Familia Presentación"
              className="w-full h-full object-cover"
            />
          </div>
          <div
            className="absolute -bottom-6 -left-6 md:-left-10 p-5 rounded-2xl shadow-2xl"
            style={{
              background: "#0E0A35",
              maxWidth: "200px",
            }}
          >
            <p className="font-black text-2xl" style={{ color: "#FFCC00", fontFamily: "'Montserrat', sans-serif" }}>
              +47
            </p>
            <p className="text-xs font-bold" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "'Poppins', sans-serif" }}>
              años formando generaciones
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── OPEN HOUSE ───────────────────────────────────────────────────────────────
// ✅ ACTUALIZADO: Muestra que ya pasó y agradece
function OpenHouseSection() {
  const steps = [
    "Bienvenida",
    "¿Por qué elegir La Presentación?",
    "Ruta por experiencias",
    "Proceso de admisión",
    "Cierre y despedida",
  ];

  return (
    <Section
      id="openhouse"
      className="py-20 md:py-28 px-6 md:px-12 text-white"
      style={{
        background:
          "radial-gradient(circle at 20% 20%, rgba(26,66,138,0.55), transparent 35%), linear-gradient(135deg, #0E0A35 0%, #21145F 55%, #050218 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-start">
          <div>
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6"
              style={{
                background: "rgba(255,204,0,0.15)",
                color: "#FFCC00",
                border: "1px solid rgba(255,204,0,0.3)",
                backdropFilter: "blur(16px)",
              }}
            >
              <span>✓</span> Realizado el 11 de julio
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-black text-3xl md:text-5xl leading-tight mb-4"
              style={{ fontFamily: "'Montserrat', sans-serif", color: "#FFFFFF" }}
            >
              Gracias por<br />vivir el Open House
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-white/75 text-lg leading-relaxed mb-6"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              El pasado 11 de julio abrimos nuestras puertas para que las familias conocieran lo que somos, lo que creemos y la manera como acompañamos a cada estudiante.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="text-white/60 text-base leading-relaxed mb-8"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Si no pudiste asistir, aún estás a tiempo de iniciar el proceso de admisión. Nuestro equipo está listo para acompañarte y resolver todas tus dudas.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href={FORM_URL}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-block px-8 py-4 rounded-full font-bold text-sm tracking-wide transition-all"
                style={{ background: "#FFFFFF", color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
              >
                Iniciar proceso de admisión
              </a>

              <span
                className="text-white/40 text-sm flex items-center gap-2"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <span className="w-6 h-px bg-white/20" />
                Sin costo de inscripción
              </span>
            </motion.div>
          </div>

          <div>
            <motion.p
              variants={fadeUp}
              className="text-xs font-bold tracking-[0.2em] uppercase text-white/45 mb-6"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Nuestro recorrido
            </motion.p>

            <div className="space-y-0 rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-xl p-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fadeUp}
                  className="flex items-center gap-4 py-4 border-b border-white/10 last:border-b-0"
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{
                      background: i === 0 ? "#FFCC00" : "rgba(255,255,255,0.12)",
                      color: i === 0 ? "#21145F" : "#FFFFFF",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>

                  <span className="font-medium text-white/80" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    {step}
                  </span>

                  {i < steps.length - 1 && <div className="ml-auto w-4 h-px bg-white/15" />}
                </motion.div>
              ))}
            </div>

            <motion.div
              variants={fadeUp}
              className="mt-4 p-4 rounded-2xl border border-white/10 bg-white/[0.04]"
            >
              <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                💡 El proceso de admisión continúa abierto. Puedes iniciarlo en cualquier momento.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </Section>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────
function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const years = useCounter(47, 2200, inView);

  return (
    <Section className="py-20 md:py-28 px-6 md:px-12" style={{ background: "#21145F" }}>
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          Nuestra historia
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl text-white text-center mb-16 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Una historia que sigue<br />formando futuro.
        </motion.h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            variants={fadeUp}
            className="col-span-2 md:col-span-2 rounded-3xl p-8 flex flex-col justify-between"
            style={{ background: "#1A428A", minHeight: "180px" }}
          >
            <p className="text-white/50 text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Fundación
            </p>

            <div>
              <p className="font-black text-6xl md:text-8xl text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                1978
              </p>
              <p className="text-white/60 text-sm mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Girardota, Antioquia
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-3xl p-6 flex flex-col justify-between border border-white/20"
            style={{
              background: "rgba(255,255,255,0.16)",
              minHeight: "180px",
              backdropFilter: "blur(22px)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14)",
            }}
          >
            <p
              className="text-white/60 text-xs font-medium tracking-widest uppercase"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              Años
            </p>

            <div>
              <p
                className="font-black text-5xl md:text-6xl"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Montserrat', sans-serif",
                  textShadow: "0 12px 40px rgba(0,0,0,0.35)",
                }}
              >
                +{inView ? years : 0}
              </p>

              <p className="text-xs mt-1" style={{ fontFamily: "'Poppins', sans-serif", color: "rgba(255,255,255,0.6)" }}>
                acompañando generaciones
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="rounded-3xl p-6 flex flex-col justify-between"
            style={{ background: "#0E0A35", minHeight: "180px" }}
          >
            <p className="text-white/40 text-xs font-medium tracking-widest uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Niveles
            </p>

            <div>
              <p className="font-black text-5xl text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                4
              </p>
              <p className="text-white/50 text-xs mt-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Preescolar · Básica Primaria · Básica Secundaria · Media Académica
              </p>
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="col-span-2 md:col-span-4 rounded-3xl p-8 flex items-center justify-between"
            style={{ background: "#F7F8FC" }}
          >
            <div>
              <p className="text-gray-400 text-xs font-medium tracking-widest uppercase mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Identidad
              </p>
              <p className="font-black text-2xl md:text-3xl" style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}>
                Una sola familia
              </p>
            </div>

            <p className="text-gray-400 text-sm max-w-xs text-right hidden md:block italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              "Educar es caminar juntos: un solo camino, una sola familia"
            </p>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── DIFFERENTIALS ───────────────────────────────────────────────────────────
function DifferentialsSection() {
  return (
    <Section className="py-20 md:py-28 px-6 md:px-12" style={{ background: "#F7F8FC" }}>
      <div className="max-w-6xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          ¿Por qué La Presentación?
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl text-center mb-16 leading-tight max-w-3xl mx-auto"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#21145F" }}
        >
          Una educación que mira a cada estudiante con nombre propio.
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-6">
          {DIFFERENTIALS.map((d, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
              className="p-8 rounded-3xl border group cursor-default transition-all duration-300"
              style={{ borderColor: "#E8EAF0", background: "#FFFFFF" }}
            >
              <div className="text-3xl mb-4 opacity-60" style={{ color: "#21145F" }}>
                {d.icon}
              </div>

              <h3 className="font-bold text-lg mb-3" style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}>
                {d.title}
              </h3>

              <p className="text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {d.text}
              </p>

              <div className="mt-6 w-8 h-0.5 transition-all duration-300 group-hover:w-16" style={{ background: "#FFCC00" }} />
            </motion.div>
          ))}

          <motion.div
            variants={fadeUp}
            className="md:col-span-3 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6"
            style={{ background: "#21145F" }}
          >
            <p className="text-white font-black text-2xl md:text-3xl" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              Un solo camino, una sola familia.
            </p>

            <a
              href={FORM_URL}
              className="px-8 py-3 rounded-full font-bold text-sm tracking-wide flex-shrink-0 transition-all duration-300 hover:scale-[1.03]"
              style={{
                background: "#FFFFFF",
                color: "#21145F",
                fontFamily: "'Montserrat', sans-serif",
                boxShadow: "0 18px 50px rgba(0,0,0,0.18)",
              }}
            >
              Iniciar proceso de admisión
            </a>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── ACADEMIC RESULTS ─────────────────────────────────────────────────────────
function AcademicSection() {
  return (
    <Section className="py-20 md:py-28 px-6 md:px-12" style={{ background: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto text-center">
        <motion.p variants={fadeUp} className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Logros académicos
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl mb-4 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#21145F" }}
        >
          Resultados que reflejan compromiso.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-gray-500 text-lg mb-16 max-w-2xl mx-auto"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Los logros académicos tienen un sentido mayor: acompañar a cada estudiante para que descubra lo mejor de sí.
        </motion.p>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {[
            { label: "Categoría ICFES", value: "A+", sub: "Excelencia académica" },
            { label: "Ranking Antioquia", value: "Top 25", sub: "Posición departamental" },
            { label: "Norte Valle de Aburrá", value: "Referente", sub: "Liderazgo educativo regional" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="p-8 rounded-3xl text-center"
              style={{ background: i === 1 ? "#21145F" : "#F7F8FC", border: "1px solid #E8EAF0" }}
            >
              <div
                className="text-xs font-bold tracking-widest uppercase mb-3"
                style={{
                  color: i === 1 ? "rgba(255,255,255,0.5)" : "#9CA3AF",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {item.label}
              </div>

              <div
                className="font-black text-4xl md:text-5xl mb-2"
                style={{
                  color: i === 1 ? "#FFCC00" : "#21145F",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {item.value}
              </div>

              <div
                className="text-sm"
                style={{
                  color: i === 1 ? "rgba(255,255,255,0.6)" : "#6B7280",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                {item.sub}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p variants={fadeUp} className="text-gray-400 text-xs italic" style={{ fontFamily: "'Poppins', sans-serif" }}>
          * Acorde al Ranking Col-Sapiens.
        </motion.p>
      </div>
    </Section>
  );
}

// ─── GALLERY ──────────────────────────────────────────────────────────────────
function GallerySection() {
  return (
    <Section className="py-20 md:py-28 px-6 md:px-12 overflow-hidden" style={{ background: "#0E0A35" }}>
      <div className="max-w-6xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          Vida escolar
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl text-white text-center mb-4 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          La vida escolar también<br />se aprende viviéndola.
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-white/50 text-lg text-center mb-16 max-w-2xl mx-auto"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Aquí se aprende en el aula, en la cancha, en la oración, en el arte, en la tecnología y en cada experiencia compartida.
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {GALLERY_ITEMS.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
              className="relative rounded-2xl overflow-hidden cursor-pointer"
              style={{
                aspectRatio: i % 5 === 0 ? "1/1.3" : i % 3 === 0 ? "1/0.8" : "1/1",
                backgroundImage: `url(${item.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundColor: item.color,
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)",
                }}
              />

              <div className="absolute bottom-0 left-0 p-4">
                <p
                  className="text-white font-black text-xl italic"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.word}
                </p>

                <p
                  className="text-white/60 text-xs font-medium tracking-widest uppercase"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {item.title}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── TIMELINE ─────────────────────────────────────────────────────────────────
// ✅ ACTUALIZADO: Usa TIMELINE_STEPS sin Open House
function TimelineSection() {
  return (
    <Section className="py-20 md:py-28 px-6 md:px-12" style={{ background: "#FFFFFF" }}>
      <div className="max-w-5xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          Proceso de admisión
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl text-center mb-16 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#21145F" }}
        >
          Tu camino para hacer parte de<br />familia Presentación.
        </motion.h2>

        <div className="hidden md:grid md:grid-cols-5 gap-4 relative">
          <div className="absolute top-8 left-[8%] right-[8%] h-px" style={{ background: "linear-gradient(to right, #FFCC00, #21145F)" }} />

          {TIMELINE_STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex flex-col items-center text-center pt-0">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center font-black text-sm z-10 mb-4"
                style={{
                  background: i === 0 ? "#FFCC00" : "#F7F8FC",
                  color: i === 0 ? "#21145F" : "#9CA3AF",
                  border: "2px solid",
                  borderColor: i === 0 ? "#FFCC00" : "#E8EAF0",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {step.n}
              </div>

              <p className="font-bold text-xs mb-2 leading-tight" style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}>
                {step.title}
              </p>

              <p className="text-gray-400 text-xs leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {step.text}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="md:hidden space-y-0">
          {TIMELINE_STEPS.map((step, i) => (
            <motion.div key={i} variants={fadeUp} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs flex-shrink-0"
                  style={{
                    background: i === 0 ? "#FFCC00" : "#F7F8FC",
                    color: i === 0 ? "#21145F" : "#9CA3AF",
                    border: "2px solid",
                    borderColor: i === 0 ? "#FFCC00" : "#E8EAF0",
                    fontFamily: "'Montserrat', sans-serif",
                  }}
                >
                  {step.n}
                </div>

                {i < TIMELINE_STEPS.length - 1 && <div className="w-px flex-1 my-2" style={{ background: "#E8EAF0" }} />}
              </div>

              <div className="pb-8">
                <p className="font-bold text-sm mb-1" style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}>
                  {step.title}
                </p>

                <p className="text-gray-400 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  {step.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────
// ✅ ACTUALIZADO: Solo admisión, eliminadas las dos opciones de Open House
function RegistroSection() {
  return (
    <Section
      id="registro"
      className="py-20 md:py-28 px-6 md:px-12"
      style={{
        background: "linear-gradient(135deg, #21145F 0%, #0E0A35 100%)",
      }}
    >
      <div className="max-w-5xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-400 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          Comienza aquí
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl text-center mb-4 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#FFFFFF" }}
        >
          Inicia el proceso de admisión
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-white/65 text-lg text-center mb-12 max-w-2xl mx-auto"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          El proceso de admisión 2027 está abierto. Regístrate y nuestro equipo te acompañará en cada paso.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="md:col-span-2 p-8 rounded-3xl border-2 flex flex-col justify-between gap-6"
            style={{
              background: "#FFFFFF",
              borderColor: "#FFFFFF",
            }}
          >
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4"
                style={{
                  background: "#F7F8FC",
                  color: "#21145F",
                  border: "1px solid #E8EAF0",
                }}
              >
                Proceso activo
              </div>

              <h3
                className="font-black text-xl mb-3"
                style={{
                  color: "#21145F",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                Iniciar proceso de admisión
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "#6B7280",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Completa el registro con los datos del aspirante y los acudientes. El equipo de admisiones se comunicará contigo para orientarte en los siguientes pasos.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs px-3 py-1 rounded-full bg-[#EEF2FF] text-[#1A428A] font-medium">
                  Sin costo de inscripción
                </span>
                <span className="text-xs px-3 py-1 rounded-full bg-[#F0FDF4] text-[#059669] font-medium">
                  Acompañamiento personalizado
                </span>
              </div>
            </div>

            <a
              href={FORM_URL}
              className="inline-block px-6 py-3 rounded-full font-bold text-sm text-center transition-all hover:opacity-90 w-full md:w-auto"
              style={{
                background: "#21145F",
                color: "#FFFFFF",
                fontFamily: "'Montserrat', sans-serif",
              }}
            >
              Iniciar registro
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4, transition: { duration: 0.3 } }}
            className="md:col-span-2 p-8 rounded-3xl border-2 flex flex-col justify-between gap-6"
            style={{
              background: "rgba(255,255,255,0.08)",
              borderColor: "rgba(255,255,255,0.16)",
            }}
          >
            <div>
              <div
                className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide mb-4"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  color: "#FFFFFF",
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                Seguimiento
              </div>

              <h3
                className="font-black text-xl mb-3"
                style={{
                  color: "#FFFFFF",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                ¿Ya iniciaste tu proceso?
              </h3>

              <p
                className="text-sm leading-relaxed"
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                Consulta el estado de admisión de tu hijo con el correo o celular registrado por la familia.
              </p>
            </div>

            <a
              href="#consulta-proceso"
              className="inline-block px-6 py-3 rounded-full font-bold text-sm text-center transition-all hover:opacity-90 w-full md:w-auto"
              style={{
                background: "rgba(255,255,255,0.15)",
                color: "#FFFFFF",
                fontFamily: "'Montserrat', sans-serif",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              Consultar mi proceso
            </a>
          </motion.div>
        </div>
      </div>
    </Section>
  );
}

// ─── CONSULTA DE ESTADO ──────────────────────────────────────────────────────
function AdmissionStatusSection() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("consultar") === "1") {
      setOpen(true);
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  return (
    <>
      <Section
        id="consulta-proceso"
        className="py-16 md:py-20 px-6 md:px-12"
        style={{
          background:
            "linear-gradient(135deg, #F7F8FC 0%, #FFFFFF 45%, #EEF2FF 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-12 border"
            style={{
              background:
                "linear-gradient(135deg, rgba(33,20,95,0.98) 0%, rgba(14,10,53,0.98) 52%, rgba(26,66,138,0.94) 100%)",
              borderColor: "rgba(255,255,255,0.16)",
              boxShadow: "0 30px 90px rgba(14,10,53,0.18)",
            }}
          >
            <div
              className="absolute -top-24 -right-24 w-72 h-72 rounded-full"
              style={{
                background: "#1A428A",
                opacity: 0.24,
                filter: "blur(18px)",
              }}
            />

            <div
              className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full"
              style={{
                background: "#FFCC00",
                opacity: 0.12,
                filter: "blur(18px)",
              }}
            />

            <div className="relative z-10 grid md:grid-cols-[1.1fr_0.9fr] gap-10 md:gap-14 items-center">
              <div>
                <p
                  className="text-xs font-bold tracking-[0.28em] uppercase mb-4"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "rgba(255,255,255,0.62)",
                  }}
                >
                  Seguimiento de admisión
                </p>

                <h2
                  className="font-black text-3xl md:text-5xl leading-tight mb-5"
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    color: "#FFFFFF",
                  }}
                >
                  ¿Ya iniciaste tu proceso?
                </h2>

                <p
                  className="text-base md:text-lg leading-relaxed max-w-2xl"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: "rgba(255,255,255,0.78)",
                  }}
                >
                  Consulta el estado de admisión de tu hijo con el correo o celular registrado por la familia.
                </p>

                <p
                  className="mt-5 text-sm leading-relaxed max-w-xl"
                  style={{
                    fontFamily: "'Poppins', sans-serif",
                    color: "rgba(255,255,255,0.52)",
                  }}
                >
                  La información será actualizada por el equipo de admisiones según el avance de cada aspirante.
                </p>
              </div>

              <div className="md:flex md:justify-end">
                <div
                  className="w-full md:max-w-[380px] rounded-3xl p-6 border backdrop-blur-xl"
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    borderColor: "rgba(255,255,255,0.28)",
                    boxShadow: "0 24px 70px rgba(0,0,0,0.22)",
                  }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="h-10 w-10 rounded-full flex items-center justify-center font-black"
                      style={{
                        background: "rgba(255,255,255,0.92)",
                        color: "#21145F",
                      }}
                    >
                      →
                    </div>

                    <div>
                      <p
                        className="font-bold text-sm"
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          color: "#FFFFFF",
                        }}
                      >
                        Consulta rápida
                      </p>

                      <p
                        className="text-xs"
                        style={{
                          fontFamily: "'Poppins', sans-serif",
                          color: "rgba(255,255,255,0.55)",
                        }}
                      >
                        Correo o celular registrado
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="w-full rounded-full px-6 py-4 font-bold text-sm tracking-wide transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: "#FFFFFF",
                      color: "#21145F",
                      fontFamily: "'Montserrat', sans-serif",
                      boxShadow: "0 18px 55px rgba(0,0,0,0.25)",
                    }}
                  >
                    Consultar estado de mi proceso
                  </button>

                  <p
                    className="mt-4 text-xs leading-relaxed text-center"
                    style={{
                      fontFamily: "'Poppins', sans-serif",
                      color: "rgba(255,255,255,0.52)",
                    }}
                  >
                    Si tienes más de un hijo inscrito, podrás elegir cuál proceso consultar.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      <AdmissionStatusModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

// ─── ADMISSION STATUS MODAL ──────────────────────────────────────────────────
function AdmissionStatusModal({ open, onClose }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "");
  }

  async function handleSearch(e) {
    e.preventDefault();

    const q = normalize(query);
    if (!q) return;

    setLoading(true);

    try {
      const esCorreo = q.includes("@");
      const esCelular = /^\d+$/.test(q);
      
      let resultado;
      if (esCorreo) {
        resultado = await consultarEstado(q, null);
      } else if (esCelular) {
        resultado = await consultarEstado(null, q);
      } else {
        setResults([]);
        setSearched(true);
        setLoading(false);
        return;
      }
      
      if (resultado && resultado.success && resultado.data) {
        const found = resultado.data;
        setResults(found);
        setSelected(found.length === 1 ? found[0] : null);
        setSearched(true);
      } else {
        setResults([]);
        setSearched(true);
      }
    } catch (error) {
      console.error("Error al consultar:", error);
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  function resetSearch() {
    setQuery("");
    setSearched(false);
    setResults([]);
    setSelected(null);
  }

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: "rgba(5,2,24,0.72)", backdropFilter: "blur(14px)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.96 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[2rem] bg-white shadow-2xl"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 z-10 h-10 w-10 rounded-full bg-[#F7F8FC] text-[#21145F] font-bold transition hover:bg-[#EEF2FF]"
            aria-label="Cerrar"
          >
            ×
          </button>

          <div className="p-7 md:p-10">
            {!searched && (
              <>
                <div className="mb-8">
                  <p
                    className="text-[#1A428A] text-xs font-bold tracking-[0.25em] uppercase mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Consulta de admisión
                  </p>

                  <h3
                    className="text-2xl md:text-4xl font-black leading-tight mb-3"
                    style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Consulta tu proceso
                  </h3>

                  <p
                    className="text-gray-500 text-sm md:text-base leading-relaxed max-w-xl"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Ingresa el correo o celular registrado por el padre, madre o acudiente durante la inscripción.
                  </p>
                </div>

                <form onSubmit={handleSearch} className="space-y-4">
                  <div>
                    <label
                      className="block text-xs font-bold tracking-wide uppercase mb-2"
                      style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
                    >
                      Correo o celular registrado
                    </label>

                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ej. familia@gmail.com o 3001234567"
                      className="w-full rounded-2xl border border-gray-200 bg-[#F7F8FC] px-5 py-4 text-[#21145F] outline-none transition focus:border-[#21145F] focus:bg-white"
                      style={{ fontFamily: "'Poppins', sans-serif" }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-full px-6 py-4 bg-[#21145F] text-white font-bold text-sm tracking-wide transition-all hover:scale-[1.01]"
                  >
                    {loading ? "Consultando..." : "Consultar proceso"}
                  </button>
                </form>

                <p
                  className="mt-5 text-gray-400 text-xs leading-relaxed"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Si la familia tiene más de un aspirante inscrito, el sistema mostrará todos los procesos asociados a ese dato.
                </p>
              </>
            )}

            {searched && results.length === 0 && (
              <div className="text-center py-8">
                <div className="mx-auto mb-5 h-14 w-14 rounded-full bg-[#F7F8FC] flex items-center justify-center text-[#21145F] font-black">
                  !
                </div>

                <h3
                  className="text-2xl font-black mb-3"
                  style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
                >
                  No encontramos un proceso asociado
                </h3>

                <p
                  className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto mb-7"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Verifica que el correo o celular coincida con el registrado en la inscripción. Si necesitas ayuda, comunícate con el equipo de admisiones.
                </p>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="rounded-full px-7 py-3 bg-[#21145F] text-white font-bold text-sm"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Intentar nuevamente
                </button>
              </div>
            )}

            {searched && results.length > 1 && !selected && (
              <>
                <div className="mb-7">
                  <p
                    className="text-[#1A428A] text-xs font-bold tracking-[0.25em] uppercase mb-3"
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Procesos encontrados
                  </p>

                  <h3
                    className="text-2xl md:text-4xl font-black leading-tight mb-3"
                    style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
                  >
                    Selecciona el aspirante
                  </h3>

                  <p
                    className="text-gray-500 text-sm md:text-base leading-relaxed"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Encontramos {results.length} procesos asociados a este dato.
                  </p>
                </div>

                <div className="space-y-3">
                  {results.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelected(item)}
                      className="w-full text-left rounded-3xl border border-gray-200 bg-[#F7F8FC] p-5 transition hover:bg-white hover:border-[#21145F]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p
                            className="font-black text-[#21145F] text-base"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {item.aspirante}
                          </p>

                          <p
                            className="text-gray-500 text-sm mt-1"
                            style={{ fontFamily: "'Poppins', sans-serif" }}
                          >
                            Grado al que aspira: {item.grado}
                          </p>

                          <p
                            className="text-[#1A428A] text-xs font-bold mt-3"
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                          >
                            {item.estado}
                          </p>
                        </div>

                        <span className="text-[#21145F] text-xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={resetSearch}
                  className="mt-6 text-sm font-bold text-[#21145F]"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  Consultar con otro dato
                </button>
              </>
            )}

            {selected && (
              <AdmissionStatusDetail
                item={selected}
                onBack={() => {
                  if (results.length > 1) setSelected(null);
                  else resetSearch();
                }}
                onReset={resetSearch}
              />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function AdmissionStatusDetail({ item, onBack, onReset }) {
  const activeIndex = getStepIndex(item.estado);

  function formatFecha(fechaIso) {
    if (!fechaIso || fechaIso === "Por confirmar" || fechaIso === "") return "Por confirmar";
    
    try {
      const fecha = new Date(fechaIso);
      if (isNaN(fecha.getTime()) || fecha.getFullYear() < 1900) return "Por confirmar";
      
      return fecha.toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Por confirmar";
    }
  }

  function formatHora(horaIso) {
    if (!horaIso || horaIso === "Por confirmar" || horaIso === "") return "Por confirmar";
    
    try {
      if (horaIso.includes("T")) {
        const fecha = new Date(horaIso);
        if (isNaN(fecha.getTime())) return horaIso;
        return fecha.toLocaleTimeString('es-CO', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      }
      return horaIso;
    } catch {
      return horaIso;
    }
  }

  return (
    <div>
      <div className="mb-7">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 text-sm font-bold text-[#21145F]"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          ← Volver
        </button>

        <p
          className="text-[#1A428A] text-xs font-bold tracking-[0.25em] uppercase mb-3"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Estado del proceso
        </p>

        <h3
          className="text-2xl md:text-4xl font-black leading-tight mb-2"
          style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
        >
          {item.aspirante}
        </h3>

        <p
          className="text-gray-500 text-sm"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Grado al que aspira: <strong>{item.grado}</strong>
        </p>
      </div>

      <div
        className="rounded-3xl p-6 mb-6"
        style={{
          background:
            "linear-gradient(135deg, #21145F 0%, #0E0A35 100%)",
        }}
      >
        <p
          className="text-white/50 text-xs font-bold tracking-[0.22em] uppercase mb-2"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Estado actual
        </p>

        <p
          className="text-white text-2xl font-black"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {item.estado}
        </p>

        <p
          className="text-white/45 text-xs mt-3"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {item.actualizado}
        </p>
      </div>

      <div className="mb-7">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {STATUS_STEPS.map((step, i) => (
            <div
              key={step}
              className="rounded-2xl p-3 text-center border"
              style={{
                background: i <= activeIndex ? "#21145F" : "#F7F8FC",
                borderColor: i <= activeIndex ? "#21145F" : "#E8EAF0",
              }}
            >
              <p
                className="text-[0.62rem] font-bold leading-tight"
                style={{
                  color: i <= activeIndex ? "#FFFFFF" : "#9CA3AF",
                  fontFamily: "'Montserrat', sans-serif",
                }}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <StatusInfoCard
          title="Prueba o pasantía"
          date={formatFecha(item["Prueba fecha"])}
          hour={formatHora(item["Prueba hora"])}
          detail={item["Tipo actividad"]}
        />
        <StatusInfoCard
          title="Entrevista"
          date={formatFecha(item["Entrevista fecha"])}
          hour={formatHora(item["Entrevista hora"])}
          detail={item["Responsable entrevista"]}
        />
        <StatusInfoCard
          title="Inducción"
          date={formatFecha(item["Inducción fecha"])}
          hour={formatHora(item["Inducción hora"])}
          detail="Nuevas familias"
        />
      </div>

      {item.observacion && (
        <div className="rounded-3xl bg-[#F7F8FC] p-5 border border-gray-100">
          <p
            className="text-xs font-bold tracking-[0.22em] uppercase mb-2"
            style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
          >
            Observación
          </p>

          <p
            className="text-gray-600 text-sm leading-relaxed"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {item.observacion}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onReset}
        className="mt-6 w-full rounded-full px-6 py-4 bg-[#21145F] text-white font-bold text-sm tracking-wide transition hover:scale-[1.01]"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        Consultar otro proceso
      </button>
    </div>
  );
}

function StatusInfoCard({ title, date, hour, detail }) {
  const hasInfo = date || hour || detail;

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
      <p
        className="text-xs font-bold tracking-[0.18em] uppercase mb-4"
        style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}
      >
        {title}
      </p>

      {hasInfo ? (
        <>
          <p
            className="text-[#21145F] font-black text-lg leading-tight"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {date || "Por confirmar"}
          </p>

          <p
            className="text-gray-500 text-sm mt-1"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            {hour || "Hora por confirmar"}
          </p>

          {detail && (
            <p
              className="text-gray-400 text-xs mt-4 leading-relaxed"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {detail}
            </p>
          )}
        </>
      ) : (
        <p
          className="text-gray-400 text-sm leading-relaxed"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          Información pendiente por asignar.
        </p>
      )}
    </div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <Section className="py-16 md:py-24 px-6 md:px-12" style={{ background: "#F7F8FC" }}>
      <div className="max-w-3xl mx-auto">
        <motion.p variants={fadeUp} className="text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4 text-center">
          Preguntas frecuentes
        </motion.p>

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-4xl text-center mb-12 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif", color: "#21145F" }}
        >
          Resolvemos tus dudas.
        </motion.h2>

        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="border rounded-2xl overflow-hidden"
              style={{ borderColor: "#E8EAF0" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left"
                style={{ background: open === i ? "#FFFFFF" : "#FFFFFF" }}
              >
                <span className="font-bold text-sm md:text-base pr-4" style={{ color: "#21145F", fontFamily: "'Montserrat', sans-serif" }}>
                  {faq.q}
                </span>

                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-gray-400 flex-shrink-0 text-xl font-light"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: "hidden", background: "#FFFFFF" }}
                  >
                    <p className="px-6 pb-6 text-gray-500 text-sm leading-relaxed" style={{ fontFamily: "'Poppins', sans-serif" }}>
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

// ─── CIERRE EMOCIONAL ─────────────────────────────────────────────────────────
function ClosingSection() {
  return (
    <Section className="py-28 md:py-40 px-6 md:px-12 relative overflow-hidden" style={{ background: "#0E0A35" }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5" style={{ background: "#1A428A", transform: "translate(30%, -30%)" }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-5" style={{ background: "#FFCC00", transform: "translate(-30%, 30%)" }} />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div variants={fadeUp} className="w-12 h-0.5 mx-auto mb-8" style={{ background: "#FFCC00" }} />

        <motion.h2
          variants={fadeUp}
          className="font-black text-3xl md:text-5xl lg:text-6xl text-white mb-6 leading-tight"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          Elige un colegio donde tu hijo pueda{" "}
          <span style={{ color: "#FFCC00" }}>aprender, crecer y ser feliz.</span>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="text-white/60 text-lg mb-4 max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Poppins', sans-serif" }}
        >
          En La Presentación educamos con fe, cercanía y sentido humano. Caminamos con cada familia para formar personas capaces de crear, sentir y transformar.
        </motion.p>

        <motion.p
          variants={fadeUp}
          className="text-white/40 text-base italic mb-12"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Educar es caminar juntos: un solo camino, una sola familia.
        </motion.p>

        <motion.a
          variants={fadeUp}
          href={FORM_URL}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block px-12 py-5 rounded-full font-black text-base tracking-wide transition-all"
          style={{
            background: "#FFFFFF",
            color: "#0E0A35",
            fontFamily: "'Montserrat', sans-serif",
            boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
          }}
        >
          Iniciar proceso de admisión
        </motion.a>

        <motion.div variants={fadeUp} className="mt-16 pt-12 border-t border-white/10">
          <p className="text-white/30 text-xs tracking-widest uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            Instituto Parroquial Nuestra Señora de la Presentación · Girardota, Antioquia, Colombia
          </p>

          <p className="text-white/20 text-xs mt-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
            Admisiones 2027 · Piedad · Sencillez · Trabajo · Caridad
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

// ─── MOBILE STICKY CTA ────────────────────────────────────────────────────────
// ✅ ACTUALIZADO: Texto a "Iniciar proceso de admisión"
function MobileCTA() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(window.scrollY > 200);
    window.addEventListener("scroll", handler, { passive: true });

    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe"
          style={{
            background: "linear-gradient(to top, rgba(14,10,53,0.98) 0%, rgba(14,10,53,0) 100%)",
            paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          }}
        >
          <a
            href={FORM_URL}
            className="block w-full py-4 rounded-full font-black text-sm text-center tracking-wide"
            style={{
              background: "#FFFFFF",
              color: "#0E0A35",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: "0 18px 60px rgba(0,0,0,0.35)",
            }}
          >
            Iniciar proceso de admisión
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────
function LandingAdmisiones() {
  return (
    <div className="font-sans antialiased" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <Hero />
      <EmotionalSection />
      <OpenHouseSection />
      <StatsSection />
      <DifferentialsSection />
      <AcademicSection />
      <GallerySection />
      <TimelineSection />
      <RegistroSection />
      <AdmissionStatusSection />
      <FAQSection />
      <ClosingSection />
      <MobileCTA />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingAdmisiones />} />
        <Route path="/admisiones" element={<AdmisionesRegistro />} />
        <Route path="/admisiones/registro" element={<Registro />} />
      </Routes>
    </BrowserRouter>
  );
}
