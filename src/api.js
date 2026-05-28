// src/api.js - CON CORS PROXY (funciona 100%)
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";
const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function guardarRegistro(datos) {
  console.log("📝 Guardando registro...");
  
  try {
    // Convertir archivos a base64
    const comprobantePago = datos.comprobantePago ? await fileToBase64(datos.comprobantePago) : null;
    const registroCivil = datos.registroCivil ? await fileToBase64(datos.registroCivil) : null;
    const informeAcademico = datos.informeAcademico ? await fileToBase64(datos.informeAcademico) : null;
    const fichaSeguimiento = datos.fichaSeguimiento ? await fileToBase64(datos.fichaSeguimiento) : null;
    const pazYSalvo = datos.pazYSalvo ? await fileToBase64(datos.pazYSalvo) : null;

    const payload = {
      accion: "guardar",
      tipoRegistro: datos.tipoRegistro,
      correo: datos.correo,
      correoOwner: datos.correoOwner,
      nombreAspirante: datos.nombreAspirante,
      apellidosAspirante: datos.apellidosAspirante,
      fechaNacimiento: datos.fechaNacimiento,
      edad: datos.edad,
      grado: datos.grado,
      estudiaActual: datos.estudiaActual,
      colegioProcedencia: datos.colegioProcedencia,
      nombrePadre: datos.nombrePadre,
      apellidosPadre: datos.apellidosPadre,
      correoPadre: datos.correoPadre,
      celularPadre: datos.celularPadre,
      nombreMadre: datos.nombreMadre,
      apellidosMadre: datos.apellidosMadre,
      correoMadre: datos.correoMadre,
      celularMadre: datos.celularMadre,
      nombreOtro: datos.nombreOtro,
      apellidosOtro: datos.apellidosOtro,
      correoOtro: datos.correoOtro,
      celularOtro: datos.celularOtro,
      motivacion: datos.motivacion,
      canalEnterado: datos.canalEnterado,
      asistirOpenHouse: datos.asistirOpenHouse,
      numeroAsistentes: datos.numeroAsistentes,
      nombresAsistentes: datos.nombresAsistentes,
      continuarAdmision: datos.continuarAdmision,
      comprobantePago: comprobantePago,
      registroCivil: registroCivil,
      informeAcademico: informeAcademico,
      fichaSeguimiento: fichaSeguimiento,
      pazYSalvo: pazYSalvo
    };

    // Intentar sin proxy primero
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resultado = await response.json();
      console.log("✅ Éxito sin proxy:", resultado);
      return resultado;
    } catch (corsError) {
      console.log("⚠️ Error CORS, usando proxy...");
      
      // Si falla, usar proxy
      const response = await fetch(CORS_PROXY + APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const resultado = await response.json();
      console.log("✅ Éxito con proxy:", resultado);
      return resultado;
    }
    
  } catch (error) {
    console.error("❌ Error:", error);
    return { success: false, error: error.message };
  }
}

export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);
  
  const response = await fetch(`${APPS_SCRIPT_URL}?${params.toString()}`);
  const data = await response.json();
  return data;
}
