# 🏫 La Presentación — Admisiones 2027

Landing page premium para admisiones del Instituto Parroquial Nuestra Señora de la Presentación, Girardota, Antioquia.

---

## 🚀 Instalación y arranque local

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en desarrollo
npm run dev

# 3. Build para producción
npm run build

# 4. Preview del build
npm run preview
```

---

## ☁️ Deploy en Vercel

1. Sube el proyecto a un repositorio en GitHub.
2. Entra a [vercel.com](https://vercel.com) → **New Project** → conecta el repo.
3. Vercel detecta Vite automáticamente. No necesitas configuración extra.
4. El archivo `vercel.json` ya maneja el routing de la SPA.
5. Haz click en **Deploy** → listo.

---

## ✏️ Personalizaciones principales

Todas las variables clave están al inicio de `src/App.jsx`:

### 1. Video de YouTube
```js
const YOUTUBE_VIDEO_ID = "COLOCAR_ID_AQUI";
// Reemplaza con el ID real del video institucional.
// Ejemplo: si la URL es https://youtu.be/dQw4w9WgXcQ, el ID es dQw4w9WgXcQ
```

### 2. Enlace del formulario de registro
```js
const FORM_URL = "#registro";
// Reemplaza con la URL real del formulario (Google Forms, Typeform, etc.)
// Ejemplo: "https://forms.gle/tuformulario"
```

### 3. Imágenes de la galería
```js
const GALLERY_ITEMS = [
  { title: "Preescolar", word: "Crear", color: "#1A428A" },
  // ...
];
```
Para usar fotos reales, agrega una propiedad `image` a cada item:
```js
{ title: "Preescolar", word: "Crear", color: "#1A428A", image: "/fotos/preescolar.jpg" }
```
Luego en el componente `GallerySection`, reemplaza el placeholder con:
```jsx
<img src={item.image} alt={item.title} className="absolute inset-0 w-full h-full object-cover" />
```
Las fotos pueden estar en la carpeta `/public/fotos/`.

### 4. Datos académicos
En `AcademicSection`, busca el array con los resultados:
```js
{ label: "Categoría ICFES", value: "A+", ... }
```
Actualiza con los datos validados antes de publicar.

### 5. Textos institucionales
Todos los textos están directamente en los componentes JSX.
Busca por sección (comentarios con `─── NOMBRE ───`) y edita in-line.

### 6. Fecha del Open House
Busca `"11 de julio"` en el archivo y actualiza si cambia.

---

## 📁 Estructura de archivos

```
presentacion-2027/
├── public/
│   ├── favicon.svg          ← Reemplazar con logo real
│   └── fotos/               ← Carpeta para imágenes reales
├── src/
│   ├── App.jsx              ← Todo el código de la landing
│   ├── main.jsx             ← Entry point de React
│   └── index.css            ← Estilos globales + Google Fonts
├── index.html               ← HTML base con SEO
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── vercel.json              ← Config de deploy en Vercel
```

---

## 🎨 Paleta institucional

| Color              | Hex       | Uso                              |
|--------------------|-----------|----------------------------------|
| Azul profundo      | `#21145F` | Títulos, fondos oscuros          |
| Azul institucional | `#1A428A` | Fondos, componentes secundarios  |
| Azul noche premium | `#0E0A35` | Hero overlay, cierre             |
| Amarillo           | `#FFCC00` | Acento, botones, detalles        |
| Gris suave         | `#F7F8FC` | Fondos de sección alternos       |
| Blanco             | `#FFFFFF` | Fondos principales               |

---

## 📱 Responsive

- **Móvil**: Hero full-screen, botón CTA fijo en la parte inferior, timeline vertical.
- **Tablet**: Tarjetas en 2 columnas, composición equilibrada.
- **Desktop**: Bento grids, timeline horizontal, galería inmersiva.

---

## 🔧 Tecnologías

- **React 18** + **Vite 5**
- **Tailwind CSS 3**
- **Framer Motion 11**
- **Google Fonts**: Montserrat, Poppins, Playfair Display

---

*Instituto Parroquial Nuestra Señora de la Presentación · Girardota, Antioquia · Admisiones 2027*
