// src/api.js - Sin proxy, Content-Type correcto
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) { resolve(null); return; }
    const reader = new FileReader();
    reader.onload = () => resolve({
      base64: reader.result.split(",")[1],
      tipo: file.type,
      nombre: file.name,
    });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function guardarRegistro(datos) {
  console.log("📝 Guardando registro...");

  const comprobantePago   = datos.comprobantePago   ? await fileToBase64(datos.comprobantePago)   : null;
  const registroCivil     = datos.registroCivil     ? await fileToBase64(datos.registroCivil)     : null;
  const informeAcademico  = datos.informeAcademico  ? await fileToBase64(datos.informeAcademico)  : null;
  const fichaSeguimiento  = datos.fichaSeguimiento  ? await fileToBase64(datos.fichaSeguimiento)  : null;
  const pazYSalvo         = datos.pazYSalvo         ? await fileToBase64(datos.pazYSalvo)         : null;

  const payload = {
    accion: "guardar",
    tipoRegistro:       datos.tipoRegistro,
    correo:             datos.correo,
    correoOwner:        datos.correoOwner,
    nombreAspirante:    datos.nombreAspirante,
    apellidosAspirante: datos.apellidosAspirante,
    fechaNacimiento:    datos.fechaNacimiento,
    edad:               datos.edad,
    grado:              datos.grado,
    estudiaActual:      datos.estudiaActual,
    colegioProcedencia: datos.colegioProcedencia,
    nombrePadre:        datos.nombrePadre,
    apellidosPadre:     datos.apellidosPadre,
    correoPadre:        datos.correoPadre,
    celularPadre:       datos.celularPadre,
    nombreMadre:        datos.nombreMadre,
    apellidosMadre:     datos.apellidosMadre,
    correoMadre:        datos.correoMadre,
    celularMadre:       datos.celularMadre,
    nombreOtro:         datos.nombreOtro,
    apellidosOtro:      datos.apellidosOtro,
    correoOtro:         datos.correoOtro,
    celularOtro:        datos.celularOtro,
    motivacion:         datos.motivacion,
    canalEnterado:      datos.canalEnterado,
    asistirOpenHouse:   datos.asistirOpenHouse,
    numeroAsistentes:   datos.numeroAsistentes,
    nombresAsistentes:  datos.nombresAsistentes,
    continuarAdmision:  datos.continuarAdmision,
    comprobantePago,
    registroCivil,
    informeAcademico,
    fichaSeguimiento,
    pazYSalvo,
  };

  // ✅ text/plain evita el preflight CORS y Apps Script lo recibe bien
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  
  const response = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(payload),
    redirect: "follow",
    signal: controller.signal,
  });
  
  clearTimeout(timeout);

  const text = await response.text();
  console.log("📨 Respuesta raw:", text);

  try {
    const resultado = JSON.parse(text);
    console.log("✅ Resultado:", resultado);
    return resultado;
  } catch {
    console.error("❌ No se pudo parsear respuesta:", text);
    return { success: false, error: "Respuesta inesperada del servidor" };
  }
}

export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);

  const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  return await response.json();
}
