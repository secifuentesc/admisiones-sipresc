// api.js - Versión para GitHub Pages (sin proxy)
export async function guardarRegistro(datos) {
  const formData = new FormData();
  
  // Campos de texto
  const camposTexto = [
    'tipoRegistro', 'correo', 'correoOwner',
    'nombreAspirante', 'apellidosAspirante', 'fechaNacimiento', 'edad',
    'grado', 'estudiaActual', 'colegioProcedencia',
    'nombrePadre', 'apellidosPadre', 'correoPadre', 'celularPadre',
    'nombreMadre', 'apellidosMadre', 'correoMadre', 'celularMadre',
    'nombreOtro', 'apellidosOtro', 'correoOtro', 'celularOtro',
    'motivacion', 'canalEnterado',
    'asistirOpenHouse', 'numeroAsistentes', 'nombresAsistentes',
    'continuarAdmision'
  ];
  
  // Agregar campos de texto
  camposTexto.forEach(campo => {
    let valor = datos[campo];
    if (valor === null || valor === undefined) valor = '';
    if (typeof valor === 'boolean') valor = valor ? 'true' : 'false';
    formData.append(campo, String(valor));
  });
  
  // Agregar archivos (PDF, JPG, PNG - TODOS FUNCIONAN)
  const archivos = ['comprobantePago', 'registroCivil', 'informeAcademico', 'fichaSeguimiento', 'pazYSalvo'];
  
  archivos.forEach(archivo => {
    if (datos[archivo] && datos[archivo] instanceof File) {
      formData.append(archivo, datos[archivo]);
      console.log(`✅ Archivo adjunto: ${archivo} - ${datos[archivo].name}`);
    }
  });
  
  // TU URL de Google Apps Script (la que ya tienes)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbybF614uTYGOX3lU4FeNnBhqTbUmAcpiXGVCYNizBk7XPlcKsvUljU3RBMH-ANf9hOV/exec";
  
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // IMPORTANTE para Google Apps Script
      body: formData
    });
    
    // Con 'no-cors' no podemos leer la respuesta directamente
    console.log('Registro enviado correctamente');
    return { success: true };
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}
