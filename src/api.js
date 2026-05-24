// src/api.js
const API_URL = "https://script.google.com/macros/s/TU_NUEVA_URL/exec";

export async function guardarRegistro(datos) {
  // Convertir archivos a base64
  const convertirArchivoABase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Procesar archivos
  const comprobantePago = datos.comprobantePago ? await convertirArchivoABase64(datos.comprobantePago) : null;
  const registroCivil = datos.registroCivil ? await convertirArchivoABase64(datos.registroCivil) : null;
  const informeAcademico = datos.informeAcademico ? await convertirArchivoABase64(datos.informeAcademico) : null;
  const fichaSeguimiento = datos.fichaSeguimiento ? await convertirArchivoABase64(datos.fichaSeguimiento) : null;
  const pazYSalvo = datos.pazYSalvo ? await convertirArchivoABase64(datos.pazYSalvo) : null;

  const payload = {
    accion: "guardar",
    ...datos,
    comprobantePago,
    registroCivil,
    informeAcademico,
    fichaSeguimiento,
    pazYSalvo
  };

  const response = await fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  return { success: true };
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
