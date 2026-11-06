# Lextli · Landing

Primera versión de la landing, 5 de noviembre de 2026. React + TypeScript + Vite, con la identidad **Brote** del kit de Lextli.

## Ejecutar

Requiere Node 22.12+ (verificado con Node 24).

```sh
npm ci
npm run dev
```

Vite imprime el puerto disponible. Para elegirlo: `npm run dev -- --port 5176 --strictPort`.

```sh
npm run test
npm run build
npm run preview
```

El resultado publicable está en `dist/`: no requiere servidor de aplicación, base de datos, Firebase ni secretos. Puede alojarse como sitio estático; la configuración de la revisión privada de Sites está en `.openai/hosting.json`.

**Publicación pendiente:** el sitio de revisión se registró, pero no se subió código ni se desplegó. La revisión automática rechazó la transferencia externa hasta contar con autorización explícita para ese destino. El identificador del manifiesto no demuestra que el sitio esté publicado.

## Experiencia

- Portada con carta de lotería, Loti y respuesta sutil al puntero en escritorio.
- Historia del método: descubrir, recordar y continuar una actividad pendiente.
- Práctica de tres palabras con errores recuperables, corrección, final y reinicio.
- Lectura de frases mediante la voz del navegador, con alternativa textual si no está disponible. Esa voz puede depender del sistema y de la conexión; no es el audio de la app.
- Capturas reales de la beta en un selector accesible con teclado.
- Loti con libro, audífonos o cempasúchil seleccionables.
- Preguntas frecuentes, promesa de aprendizaje gratuito y modal con estado de la beta.
- Menú móvil, navegación por anclas, foco visible, diálogo nativo y control de animaciones.
- Botón flotante «Volver arriba» al dejar atrás la portada, con etiquetas en los doce idiomas. Desplazamiento suave nativo, detección con `IntersectionObserver` sin listeners continuos de scroll y foco devuelto al enlace de inicio. Respeta movimiento reducido y la pausa manual; conserva espacio en el pie y los márgenes seguros de móvil.

La práctica es una demostración local: no crea cuenta, no envía respuestas y no modifica progreso de la app. No hay formulario, analítica, cookies añadidas por la landing ni lista de espera. La infraestructura de hosting puede gestionar su propia autenticación y registros.

## Marca y mantenimiento

`src/brand.css` copia los tokens de `../Lextli_Kit/public/assets/brote/tokens.css`: terracota, semilla, lino, hoja y cacao. `src/styles.css` contiene la composición y los colores secundarios de las ilustraciones.

`public/brand` contiene el logotipo del kit; `public/loti` conserva los SVG del personaje y versiones `-still.svg` sin animación. La ilustración de preguntas frecuentes y su variante estática están en `src/assets/loti`: se importan en el paquete para evitar una petición tardía o una ruta pública rota al hacer scroll. En móvil tienen su propio espacio debajo del título. `public/fonts` incluye Fraunces y DM Sans locales con sus licencias OFL. `public/app` conserva capturas de la beta del kit: actualizarlas cuando cambie significativamente el producto.

Excepción documentada: la postura `accessory-book` corrige las patas delanteras duplicadas del SVG exportado. `node scripts/fix-loti-book.mjs` aplica una corrección reproducible desde el kit y genera también la variante estática. Conserva dos patas traseras y dos brazos levantados que sujetan el libro. La corrección está en la landing; el rig Flutter y las exportaciones originales del kit permanecen pendientes de unificación.

`src/hero-art.css` concentra la composición de la carta. El sello usa dos líneas sin saltos internos y un corazón centrado, con tamaños adaptados a móvil. La ficha de vocabulario y el sello ocupan una fila propia debajo; no se posicionan encima del título. El saludo y la flecha comparten las coordenadas de la ilustración para conservar su posición al redimensionar. La inclinación del puntero agrupa escrituras con `requestAnimationFrame` y limita el recorrido a ±1.5°.

La preferencia de movimiento reducido del sistema desactiva animaciones. El botón del pie también cambia los SVG por versiones estáticas: pausar solo CSS del documento no detendría las animaciones internas de una imagen SVG.

## Idiomas, audio y dispositivo

- La página admite doce idiomas: español, inglés, francés, ruso, portugués, italiano, alemán, japonés, coreano, chino simplificado, indonesio y jemer (camboyano). `src/messages.ts` reúne el texto fuente y las traducciones a inglés, francés y ruso; `src/messages-extra.ts` contiene portugués, italiano y alemán; `src/messages-asia.ts` añade japonés, coreano, chino simplificado, indonesio y jemer. Ambos exigen las mismas claves mediante TypeScript. Para añadir idiomas, ampliar también `locales`, `names`, `glyphs` y `catalogs` en `src/i18n.tsx`, y completar todas las traducciones. La práctica mantiene palabras y voz en inglés; traduce instrucciones, respuestas y comentarios. Las capturas reales de la beta siguen en español y se indica en su pie.
- Se busca el primer idioma compatible en `navigator.languages`, incluidas variantes regionales como `fr-CA`, `pt-BR`, `pt-PT` `de-AT`, `ja-JP`, `ko-KR`, `zh-Hans-CN`, `id-ID` o `km-KH`; si ninguno coincide, se usa español. La selección manual se guarda en `localStorage` con la clave `lextli.locale`; «Automático» elimina esa preferencia. Si el almacenamiento está bloqueado, el selector sigue funcionando durante la sesión. Se actualizan `html.lang`, título y metadatos; esto no crea rutas SEO multilingües prerenderizadas.
- El selector tiene lista accesible con scroll propio, selección marcada, cierre exterior/Escape, navegación con flechas/Home/End y búsqueda por inicial. Animación CSS breve, respetando movimiento reducido y la pausa del pie. No requiere un servicio de traducción ni envía datos.
- `src/localization.css` adapta las fuentes, interlineados y saltos de línea de japonés, coreano, chino y jemer. Utiliza fuentes del sistema con cobertura del alfabeto, sin descargar paquetes CJK grandes. Las variantes `zh-*` usan por ahora el catálogo simplificado; no hay una traducción tradicional independiente. El identificador antiguo `in-ID` también se reconoce como indonesio. Las nuevas traducciones necesitan revisión editorial por hablantes nativos antes de una campaña pública.
- `src/useSpeech.ts` prepara el catálogo de voces, escucha `voiceschanged` y prioriza voces inglesas locales. Muestra preparación y reproducción, mantiene viva la locución, ignora cancelaciones antiguas y limpia al cambiar de palabra. Impide pulsaciones duplicadas y limita las esperas para permitir reintentar. El audio sigue dependiendo de las voces y políticas del navegador/dispositivo; la frase permanece legible si no hay voz. No se descarga audio de la app ni se utiliza IA.
- `src/PixelPreview.tsx` combina dos renders WebP transparentes (unos 59 KB en total) con la captura real completa (`object-fit: contain`). La cámara tiene espacio reservado y la nota offline queda debajo. Es un modelo original inspirado en las proporciones de Pixel 9 Pro XL, **no CAD oficial de Google**. Se generó con Blender 5.1.2; el archivo editable, las fuentes y los pasos para regenerarlo están en `assets/device/README.md`. No se ejecuta Blender ni WebGL en el navegador.

## Rendimiento

Sin WebGL, vídeo de fondo ni librería de animaciones. Transiciones CSS de opacidad y transformación, `IntersectionObserver` para las entradas, fuentes WOFF2 locales y carga diferida para imágenes inferiores. La versión con doce idiomas genera aproximadamente 122 KB gzip de JavaScript y 10 KB gzip de CSS; esto no es una medición de Core Web Vitals ni una comparación de rendimiento con Duolingo.

## Antes del lanzamiento público

1. Sustituir el aviso de beta por el enlace real y aprobado de Google Play cuando exista. No hay enlaces de descarga inventados.
2. Configurar el dominio definitivo, URL canónica, imagen Open Graph y sitemap para ese dominio.
3. Añadir la política de privacidad y contacto definitivo si se incorporan formularios, analítica o servicios que recojan datos.
4. Verificar en teléfonos físicos Android/iOS: anchuras pequeñas, texto ampliado, lector de pantalla, voz y movimiento reducido.
5. Si se añade lista de espera, implementar envío real, consentimiento, validación y errores; no simular registros exitosos.

La conversación con IA no se presenta como disponible. No se inventan testimonios, cifras de usuarios ni certificaciones.

## Verificación de esta entrega

- TypeScript y compilación de producción con `npm run build`.
- Veintitrés pruebas aprobadas con Vitest/Testing Library (`npm run test -- --maxWorkers=1 --testTimeout=20000`; margen ampliado por lentitud del entorno): flujos de práctica, selector y persistencia; detección regional; catálogos completos; práctica en portugués, italiano, alemán, japonés, coreano, chino, indonesio y jemer; SVG de preguntas integrado y variante estática; ciclo de audio (voces tardías, callbacks antiguos, reintento y esperas acotadas).
- Los cuatro idiomas iniciales y portugués, italiano y alemán revisados en navegador a 320, 390, 768 y 1280 px sin desbordamiento horizontal. Sello y Loti de preguntas comprobados en móvil; la ilustración carga también al pausar las animaciones. Selector comprobado hasta la última opción con scroll independiente de la página.
- Revisión posterior a las correcciones: portada inspeccionada en navegador, sin desbordamiento horizontal a 320, 360, 390, 620, 622, 768, 1024, 1280 y 1920 px. Carta dentro del ancho visible y ficha separada por al menos 23 px en las medidas comprobadas; saludo y flecha escalan junto con la escena.
- Menú móvil, selección de accesorios, práctica completa con error/reintento/reinicio, cierre de modal con Escape y pausa de SVG verificados también en navegador.
- Las órbitas decorativas se recortan dentro de su propio lienzo; no se oculta el desbordamiento de toda la página para disimular errores.
- Japonés, coreano, chino simplificado, indonesio y jemer: compilación verificada; revisión visual pendiente porque se interrumpió la conexión con el navegador durante esta ampliación.
- Falta la prueba en teléfonos físicos y lectores de pantalla. Las medidas de escritorio emulado no sustituyen esas comprobaciones.

## Referencias

- [Documentación de Vite](https://vite.dev/guide/).
- [Carga de voces y evento voiceschanged](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event).
- [Preferencia de movimiento reducido](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- [Duolingo](https://www.duolingo.com/), referencia de categoría; no se afirma superioridad medida.
- Kit y estado del producto: `../Lextli_Kit/README.md` y `../README.md`.
