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

La práctica es una demostración local: no crea cuenta, no envía respuestas y no modifica progreso de la app. No hay formulario, analítica, cookies añadidas por la landing ni lista de espera. La infraestructura de hosting puede gestionar su propia autenticación y registros.

## Marca y mantenimiento

`src/brand.css` copia los tokens de `../Lextli_Kit/public/assets/brote/tokens.css`: terracota, semilla, lino, hoja y cacao. `src/styles.css` contiene la composición y los colores secundarios de las ilustraciones.

`public/brand` contiene el logotipo del kit; `public/loti` conserva los SVG originales del personaje y versiones `-still.svg` sin animación. `public/fonts` incluye Fraunces y DM Sans locales con sus licencias OFL. `public/app` conserva capturas de la beta del kit: actualizarlas cuando cambie significativamente el producto.

Excepción documentada: la postura `accessory-book` corrige las patas delanteras duplicadas del SVG exportado. `node scripts/fix-loti-book.mjs` aplica una corrección reproducible desde el kit y genera también la variante estática. Conserva dos patas traseras y dos brazos levantados que sujetan el libro. La corrección está en la landing; el rig Flutter y las exportaciones originales del kit permanecen pendientes de unificación.

`src/hero-art.css` concentra la composición de la carta. La ficha de vocabulario y el sello ocupan una fila propia debajo; no se posicionan encima del título. El saludo y la flecha comparten las coordenadas de la ilustración para conservar su posición al redimensionar. La inclinación del puntero agrupa escrituras con `requestAnimationFrame` y limita el recorrido a ±1.5°.

La preferencia de movimiento reducido del sistema desactiva animaciones. El botón del pie también cambia los SVG por versiones estáticas: pausar solo CSS del documento no detendría las animaciones internas de una imagen SVG.

## Rendimiento

Sin WebGL, vídeo de fondo ni librería de animaciones. Transiciones CSS de opacidad y transformación, `IntersectionObserver` para las entradas, fuentes WOFF2 locales y carga diferida para imágenes inferiores. La compilación inicial generó aproximadamente 70 KB gzip de JavaScript y 8 KB gzip de CSS; esto no es una medición de Core Web Vitals ni una comparación de rendimiento con Duolingo.

## Antes del lanzamiento público

1. Sustituir el aviso de beta por el enlace real y aprobado de Google Play cuando exista. No hay enlaces de descarga inventados.
2. Configurar el dominio definitivo, URL canónica, imagen Open Graph y sitemap para ese dominio.
3. Añadir la política de privacidad y contacto definitivo si se incorporan formularios, analítica o servicios que recojan datos.
4. Verificar en teléfonos físicos Android/iOS: anchuras pequeñas, texto ampliado, lector de pantalla, voz y movimiento reducido.
5. Si se añade lista de espera, implementar envío real, consentimiento, validación y errores; no simular registros exitosos.

La conversación con IA no se presenta como disponible. No se inventan testimonios, cifras de usuarios ni certificaciones.

## Verificación de esta entrega

- TypeScript y compilación de producción con `npm run build`.
- Seis pruebas de interacción con Vitest/Testing Library: completar y reiniciar práctica tras un error; voz no disponible; modal y restauración de scroll/foco; menú; pestañas con teclado y accesorios; movimiento reducido y SVG estático.
- Revisión posterior a las correcciones: portada inspeccionada en navegador, sin desbordamiento horizontal a 320, 360, 390, 620, 622, 768, 1024, 1280 y 1920 px. Carta dentro del ancho visible y ficha separada por al menos 23 px en las medidas comprobadas; saludo y flecha escalan junto con la escena.
- Menú móvil, selección de accesorios, práctica completa con error/reintento/reinicio, cierre de modal con Escape y pausa de SVG verificados también en navegador.
- Las órbitas decorativas se recortan dentro de su propio lienzo; no se oculta el desbordamiento de toda la página para disimular errores.
- Falta la prueba en teléfonos físicos y lectores de pantalla. Las medidas de escritorio emulado no sustituyen esas comprobaciones.

## Referencias

- [Documentación de Vite](https://vite.dev/guide/).
- [Preferencia de movimiento reducido](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion).
- [Duolingo](https://www.duolingo.com/), referencia de categoría; no se afirma superioridad medida.
- Kit y estado del producto: `../Lextli_Kit/README.md` y `../README.md`.
