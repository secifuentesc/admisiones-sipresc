// src/api.js
const API_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";

// Consultar estado de un proceso
export async function consultarEstado(correo, celular) {
  const params = new URLSearchParams();
  params.append("accion", "consultar");
  if (correo) params.append("correo", correo);
  if (celular) params.append("celular", celular);
  
  const response = await fetch(`${API_URL}?${params.toString()}`);
  const data = await response.json();
  return data;
}

// Guardar un nuevo registro
export async function guardarRegistro(datos) {
  const response = await fetch(API_URL, {
    method: "POST",
    mode: "no-cors", // importante para Apps Script
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accion: "guardar",
      ...datos
    })
  });
  
  // Con no-cors, no podemos leer la respuesta directamente
  return { success: true, message: "Registro enviado" };
}

// Actualizar estado (solo para administración)
export async function actualizarEstado(id, estado, datosAdicionales) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      accion: "actualizarEstado",
      id,
      estado,
      ...datosAdicionales
    })
  });
  
  return response.json();
}
