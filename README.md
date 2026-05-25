# Daniel Masuco · Portfolio

Sitio personal de **Daniel Masuco** — AI & Automation Specialist · CTO & Founder de **ZEUS IT**.

Construido con **Astro 6 + Tailwind v4 + React islands + Motion + Lenis** para efectos hyper-modernos.

---

## ✨ Features

- Dark mode con **mesh gradient animado** + grid + film grain
- **Smooth scroll** con Lenis
- **Custom cursor spotlight** que sigue al mouse
- **Scroll progress bar** arriba
- **Magnetic buttons** + **animated counters**
- **Code typing** animado en el hero
- **Glow cards** con spotlight de mouse en servicios
- **Marquee infinito** en stack
- **Timeline animado** scroll-triggered en experiencia
- **View Transitions** entre páginas (Astro nativo)
- SEO + Open Graph + JSON-LD (`schema.org/Person`) + sitemap
- Respeta `prefers-reduced-motion`

---

## 🚀 Levantar el proyecto

```bash
npm install      # ya instalado
npm run dev      # http://localhost:4321
npm run build    # build estático en dist/
npm run preview  # servir el build local
```

---

## 📂 Estructura

```
src/
├── components/        # UI primitives + efectos (Header, Cursor, Marquee, …)
├── layouts/Layout.astro
├── lib/data.ts        # 👈 TODO el contenido (CV, Zeus IT, contacto) vive acá
├── pages/index.astro
├── sections/          # Hero, About, Services, Stack, Experience, Zeus, Education, Contact
└── styles/globals.css # Tailwind v4 + theme tokens + utilities
```

---

## 🖼️ Reemplazar assets placeholder

Tres archivos en `/public/` están como **SVG placeholders** y deberías reemplazar:

| Path actual | Cambiar por | Notas |
|---|---|---|
| `public/profile.svg` | `public/profile.jpg` | Tu foto profesional (recomendado 800×1000, formato 4:5) |
| `public/zeus-logo.svg` | `public/zeus-logo.png` | El logo real de ZEUS IT |
| _(no existe)_ | `public/Daniel_Masuco_CV.pdf` | Copiá tu CV acá para que el botón "Descargar CV" funcione |
| _(no existe)_ | `public/og.png` | Imagen Open Graph 1200×630 |

Después de copiar los archivos reales, en `src/lib/data.ts` cambiá las extensiones de las constantes `personal.avatar` y `zeus.logo`.

---

## ✏️ Editar contenido

**TODO el texto del sitio vive en `src/lib/data.ts`** — un solo lugar, sin tocar componentes:

- `personal` → nombre, contacto, tagline
- `stats` → métricas del hero
- `services` → 3 servicios principales
- `stack` → tecnologías para el marquee
- `experience` → timeline de jobs
- `education`, `languages`, `competencies`, `zeus`, `navLinks`

---

## 🎨 Cambiar paleta

Los colores viven en `src/styles/globals.css` bajo `@theme`. Los principales:

```css
--color-accent: #7c3aed;     /* violet primary */
--color-accent-2: #06b6d4;   /* cyan */
--color-accent-3: #f97316;   /* orange spark */
```

---

## 🌐 Deploy

Funciona out-of-the-box en **Vercel** o **Netlify** sin config extra:

```bash
# Vercel
npx vercel

# Netlify (drag & drop)
npm run build
# subí la carpeta dist/ a app.netlify.com
```

---

## 🧠 Stack técnico

| Pieza | Versión | Por qué |
|---|---|---|
| **Astro** | 6.x | SSG ultra rápido, islands architecture, SEO impecable |
| **Tailwind** | v4 | Config en CSS (`@theme`), sin tailwind.config.js |
| **React** | 19 | Para islands con animaciones (Motion) |
| **Motion** | 12 (ex-Framer Motion) | Animaciones declarativas, scroll/spring |
| **Lenis** | latest | Smooth scroll de Studio Freight |
| **Lucide React** | latest | Iconos limpios |

---

© Daniel Masuco
