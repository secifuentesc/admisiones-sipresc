// api/proxy.js
export const config = {
  api: {
    bodyParser: false, // IMPORTANTE: Deshabilitar bodyParser para recibir archivos
  },
};

export default async function handler(req, res) {
  // Habilitar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const API_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";

  try {
    // Recibir el FormData del frontend
    const formData = await new Promise((resolve, reject) => {
      const chunks = [];
      req.on('data', (chunk) => chunks.push(chunk));
      req.on('end', () => {
        const buffer = Buffer.concat(chunks);
        const boundary = req.headers['content-type'].split('boundary=')[1];
        if (boundary) {
          const multipart = require('parse-multipart');
          const parts = multipart.Parse(buffer, boundary);
          
          // Reconstruir FormData para enviar a Google Apps Script
          const form = new FormData();
          parts.forEach(part => {
            if (part.filename) {
              // Es un archivo
              const blob = new Blob([part.data], { type: part.type });
              form.append(part.name, blob, part.filename);
            } else {
              // Es texto
              form.append(part.name, part.data.toString());
            }
          });
          resolve(form);
        } else {
          reject(new Error('No se pudo parsear multipart'));
        }
      });
    });

    // Enviar a Google Apps Script
    const response = await fetch(API_URL, {
      method: "POST",
      body: formData, // Enviar como FormData, no JSON
    });

    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(200).json({ success: false, error: error.message });
  }
}
