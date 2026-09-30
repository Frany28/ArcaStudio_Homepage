# ARCA Studio

Pagina Web: https://arcastudio2025.com

## Propósito del repositorio

Este repositorio contiene la experiencia web pública de ARCA Studio. Su objetivo es presentar la identidad, el enfoque de trabajo y el portafolio del estudio mediante una navegación visual e interactiva, y ofrecer a potenciales clientes una vía directa de contacto.

El sitio permite:

- Comunicar las áreas principales del estudio: arquitectura, construcción e interiorismo.
- Presentar servicios residenciales, comerciales, institucionales e industriales.
- Mostrar proyectos destacados a través de galerías responsivas.
- Explicar los procesos de diseño, planificación, ejecución y supervisión de obra.
- Contar la visión y la propuesta de valor de ARCA Studio.
- Facilitar el contacto mediante WhatsApp y redes sociales.

## Experiencia del sitio

La aplicación es una experiencia de una sola página compuesta por:

1. Una secuencia de apertura y presentación de marca.
2. Paneles iniciales de arquitectura, construcción e interiorismo.
3. Una sección de servicios.
4. Galerías de proyectos destacados.
5. Una muestra audiovisual de los procesos de trabajo.
6. La historia y filosofía del estudio.
7. Una sección final de contacto.

La interfaz incluye animaciones, navegación controlada por desplazamiento y gestos táctiles, comportamiento adaptado a dispositivos móviles y soporte para la preferencia de movimiento reducido del usuario.

## Tecnologías principales

- React 19
- Vite 8
- Tailwind CSS 4
- Motion y GSAP para animaciones
- React Router
- Node.js Test Runner para las pruebas automatizadas
- Netlify para compilación y despliegue

## Requisitos

- Node.js 22.12.0 o superior
- npm

## Desarrollo local

Instala las dependencias:

```bash
npm install
```

Inicia el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local donde se encuentra disponible el sitio.

## Comandos disponibles

```bash
npm run dev      # Inicia el entorno de desarrollo
npm run build    # Genera la versión optimizada en dist/
npm run preview  # Previsualiza localmente la compilación
npm test         # Ejecuta la suite de pruebas
```

## Estructura del proyecto

```text
HomeArca/
├── public/                 # Archivos públicos, SEO e identidad visual
├── src/
│   ├── assets/             # Imágenes, videos, iconos y logotipos
│   ├── components/ui/      # Componentes reutilizables de interfaz
│   ├── hooks/              # Hooks compartidos
│   └── pages/publicSite/   # Secciones y lógica del sitio público
├── tests/                  # Pruebas de interacción y comportamiento
├── index.html              # Documento base y metadatos SEO
├── netlify.toml            # Configuración de despliegue
└── vite.config.js          # Configuración de Vite
```

## Calidad y accesibilidad

La suite de pruebas cubre aspectos clave como la navegación por desplazamiento, los gestos táctiles, las galerías, la reproducción de video, el menú móvil, el contraste del encabezado, los enlaces de contacto y los metadatos SEO.

El proyecto también contempla navegación responsiva, etiquetas semánticas, textos alternativos y reducción de movimiento.

## Despliegue

El sitio está preparado para desplegarse en Netlify. La plataforma ejecuta `npm run build`, publica el directorio `dist/` y redirige las rutas hacia `index.html` para servir correctamente la aplicación.

---

**ARCA Studio** — *Piénsalo y lo hacemos realidad.*
