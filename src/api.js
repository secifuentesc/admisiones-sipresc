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


  const payload = {
    accion: "guardar",
    tipoRegistro:            datos.tipoRegistro,
    correo:                  datos.correo,
    correoOwner:             datos.correoOwner,
    nombreAspirante:         datos.nombreAspirante,
    apellidosAspirante:      datos.apellidosAspirante,
    fechaNacimiento:         datos.fechaNacimiento,
    edad:                    datos.edad,
    grado:                   datos.grado,
    estudiaActual:           datos.estudiaActual,
    colegioProcedencia:      datos.colegioProcedencia,
    nombrePadre:             datos.nombrePadre,
    apellidosPadre:          datos.apellidosPadre,
    correoPadre:             datos.correoPadre,
    celularPadre:            datos.celularPadre,
    nombreMadre:             datos.nombreMadre,
    apellidosMadre:          datos.apellidosMadre,
    correoMadre:             datos.correoMadre,
    celularMadre:            datos.celularMadre,
    nombreOtro:              datos.nombreOtro,
    apellidosOtro:           datos.apellidosOtro,
    correoOtro:              datos.correoOtro,
    celularOtro:             datos.celularOtro,
    motivacion:              datos.motivacion,
    canalEnterado:           datos.canalEnterado,
    asistirOpenHouse:        datos.asistirOpenHouse,
    numeroAsistentes:        datos.numeroAsistentes,
    nombresAsistentes:       datos.nombresAsistentes,
    continuarAdmision:       datos.continuarAdmision,
    comprobantePago:     datos.comprobantePago_link     || null,
    registroCivil:       datos.registroCivil_link       || null,
    informeAcademico:    datos.informeAcademico_link    || null,
    fichaSeguimiento:    datos.fichaSeguimiento_link    || null,
    pazYSalvo:           datos.pazYSalvo_link           || null,
  };

  // Copia de seguridad local ANTES de enviar
  try {
    localStorage.setItem("ultimo_registro_pendiente", JSON.stringify({
      payload,
      timestamp: new Date().toISOString(),
    }));
  } catch(e) {}

  // Intenta hasta 3 veces
  const MAX_INTENTOS = 3;
  let ultimoError = null;

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      console.log(`🔄 Intento ${intento} de ${MAX_INTENTOS}...`);

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

      const resultado = JSON.parse(text);

      if (resultado.success) {
        try { localStorage.removeItem("ultimo_registro_pendiente"); } catch(e) {}
        console.log("✅ Registro guardado en intento", intento);
        return resultado;
      }

      ultimoError = resultado.error || "Error desconocido";
      console.warn(`⚠️ Intento ${intento} fallido:`, ultimoError);

      // Si es correo duplicado no reintentar
      if (ultimoError.includes("Ya existe")) return resultado;

    } catch(err) {
      ultimoError = err.message;
      console.warn(`⚠️ Intento ${intento} con excepción:`, err.message);
      if (intento < MAX_INTENTOS) {
        await new Promise(r => setTimeout(r, intento * 1000));
      }
    }
  }

  console.error("❌ Todos los intentos fallaron:", ultimoError);
  return { success: false, error: ultimoError };
}
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

export async function subirArchivoADrive(file, fieldKey, datosAspirante) {
  const MAX_INTENTOS = 3;
  let ultimoError = null;

  const fileData = await fileToBase64(file);

  const payload = {
    accion: "subirArchivo",
    base64: fileData.base64,
    tipo: fileData.tipo,
    nombre: `${fieldKey}_${datosAspirante.apellidosAspirante}_${datosAspirante.nombreAspirante}.${fileData.tipo.includes('pdf') ? 'pdf' : fileData.tipo.includes('png') ? 'png' : 'jpg'}`,
    nombreAspirante: datosAspirante.nombreAspirante,
    apellidosAspirante: datosAspirante.apellidosAspirante,
    correo: datosAspirante.correo,
    grado: datosAspirante.grado,
  };

  for (let intento = 1; intento <= MAX_INTENTOS; intento++) {
    try {
      console.log(`📤 Subiendo ${fieldKey} — intento ${intento} de ${MAX_INTENTOS}...`);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
        redirect: "follow",
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();
      const resultado = JSON.parse(text);

      if (resultado.success) {
        console.log(`✅ ${fieldKey} subido correctamente`);
        return resultado;
      }

      ultimoError = resultado.error || "Error desconocido";
      console.warn(`⚠️ Intento ${intento} fallido:`, ultimoError);

    } catch(err) {
      ultimoError = err.message;
      console.warn(`⚠️ Intento ${intento} con excepción:`, err.message);
      if (intento < MAX_INTENTOS) {
        await new Promise(r => setTimeout(r, intento * 1000));
      }
    }
  }

  console.error(`❌ No se pudo subir ${fieldKey}:`, ultimoError);
  return { success: false, error: ultimoError };
}

export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);

  const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  return await response.json();
}
