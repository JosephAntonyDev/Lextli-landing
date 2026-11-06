# Dispositivo de la landing

Visualización **original inspirada en el Google Pixel 9 Pro XL**, modelada y renderizada con Blender 5.1.2. No es un archivo CAD oficial de Google ni un modelo descargado de terceros. No contiene la marca de Google.

- Proporciones físicas de referencia: 76.6 × 162.8 × 8.5 mm, tomadas de las [especificaciones de Google](https://fi.google.com/about/phones/pixel-9-pro-specs).
- Modelo editable: `pixel-9-pro-xl-inspired.blend` (geometría, materiales, cámara y luces).
- Generador reproducible: `scripts/render-pixel-preview.py`.
- La web solo carga dos WebP transparentes; **no carga Blender, Three.js ni un motor WebGL**.
- La captura de la app sigue siendo un `<img>` independiente: conserva su resolución 780 × 1688 y se ajusta con `object-fit: contain`. La cámara dispone de margen propio y no tapa la captura.
- La segunda vista del hardware es decorativa y no se anuncia a lectores de pantalla.

## Volver a renderizar

Ejecutar desde la raíz de la landing, en un proceso nuevo. El comando utiliza `--factory-startup` y no abre ni modifica una sesión de Blender del usuario.

```powershell
& 'C:\Program Files\Blender Foundation\Blender 5.1\blender.exe' --background --factory-startup --python scripts/render-pixel-preview.py
python scripts/optimize-device-renders.py
```

El segundo paso requiere Pillow y convierte los PNG intermedios a WebP. El `.blend` no se sirve en la landing; permanece como fuente editable en este directorio.

Se revisaron modelos de BlenderKit y tiendas de activos antes de crear esta visualización. No se descargó ni redistribuyó ningún modelo de terceros y no se realizó ninguna compra.
