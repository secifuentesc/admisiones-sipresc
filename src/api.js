// src/api.js
const API_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";

// Convertir archivo a base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// Guardar registro con archivos
export async function guardarRegistro(datos) {
  try {
    // Procesar archivos si existen
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

    // IMPORTANTE: Cambiar mode a 'cors' y agregar método POST
    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const resultado = await response.json();
    return resultado;
    
  } catch (error) {
    console.error("Error guardando registro:", error);
    throw error;
  }
}

// Consultar estado
export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  const data = await response.json();
  return data;
}
