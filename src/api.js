// src/api.js
const API_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";

const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export async function guardarRegistro(datos) {
  try {
    const comprobantePago = datos.comprobantePago ? await fileToBase64(datos.comprobantePago) : null;
    const registroCivil = datos.registroCivil ? await fileToBase64(datos.registroCivil) : null;
    const informeAcademico = datos.informeAcademico ? await fileToBase64(datos.informeAcademico) : null;
    const fichaSeguimiento = datos.fichaSeguimiento ? await fileToBase64(datos.fichaSeguimiento) : null;
    const pazYSalvo = datos.pazYSalvo ? await fileToBase64(datos.pazYSalvo) : null;

    const payload = {
      accion: "guardar",
      ...datos,
      comprobantePago,
      registroCivil,
      informeAcademico,
      fichaSeguimiento,
      pazYSalvo
    };

    // Usar text/plain para evitar preflight CORS
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(payload)
    });

    return { success: true };
  } catch (error) {
    console.error("Error:", error);
    return { success: false, error: error.message };
  }
}

export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  const data = await response.json();
  return data;
}
