# Alpha Link GPS · website

Aquí vive el recorrido B2C completo, de la landing a la activación: las propuestas de landing (coordinadas con Matías) y el flujo de instaladores freelance.

Referencias:
- Proceso: Service Blueprint B2C v2 — https://endlvsss.github.io/alpha-tecnologia-blueprint/
- Especificación del módulo de instaladores: [../Especificacion-modulo-instaladores.md](../Especificacion-modulo-instaladores.md)
- CRM actual: `auto-crm-rust.vercel.app` (manual y capturas en `../Guia CRM` y `../Secciones CRM`)

## Desarrollo

Next.js 16 (App Router, TypeScript, Tailwind CSS 4, código en `src/`).

```bash
npm install
npm run dev
```

Abre http://localhost:3000.

## Qué se construye aquí, por tramo del blueprint

| Tramo | Etapas | Pantallas | Quién la usa |
|---|---|---|---|
| 1 · Adquisición y compra | 1–5 | Landing (hero, cómo funciona, funciones, planes, FAQ) → comparador de planes → checkout (persona, RUT, vehículo, dirección) → pago | Cliente |
| 2 · Agenda | 6–7 | Elegir día y bloque (solo horarios reales); sin cupo → alternativas y "Avísame" | Cliente |
| 2 · Instalación | 6–12 | Portal del técnico: disponibilidad, visitas del día, check-in → instalación → pruebas → check-out con firma | Técnico freelance |
| 2B / 2C · Excepciones | – | Reprogramar, cancelar, no-show, técnico no disponible, instalación fallida | Cliente / técnico |
| Back-office | – | Instaladores, agenda, visitas, dispositivos | Operaciones (al final, dentro del CRM) |

## Estado actual (27/10/2026)

Construidos el tramo 1, la agenda y el portal del técnico del tramo 2, con datos ficticios y sin integraciones. Los cambios de cada fecha están en las secciones de más abajo. Falta el back-office de Operaciones (A1–A6 de la especificación), que irá dentro del CRM.

| Ruta | Qué hay |
|---|---|
| `/` | Landing: portada, «3:12 AM», funciones con capturas reales, señal principal y de respaldo, cómo funciona, planes, instalación, preguntas frecuentes |
| `/planes` | Comparador completo (tabla en escritorio, pestañas en móvil) |
| `/checkout` | Plan y periodicidad → datos (RUT validado) → vehículo (patente validada) → dirección (comunas de la RM) → revisión y consentimiento |
| `/checkout/pago` | Pasarela simulada: aprobar o rechazar el pago |
| `/checkout/confirmacion` | CUENTA CREADA, «Instalación pendiente» y paso a la agenda |
| `/agenda` | Días y bloques reales por comuna, retención de 10 min, confirmación con `.ics`; sin cupo → ampliar rango → lista de espera |
| `/instalador/*` | Portal del técnico freelance, pantallas I1–I9 (ver «Portal del técnico freelance») |

- La compra vive en `sessionStorage` (`src/lib/purchase-store.ts`). Cada etapa ofrece «Usar datos de ejemplo» para revisarla sin llenar el formulario.
- Al pie del flujo de compra hay un panel **Demo interna** con el estado del cliente según el blueprint (LEAD → PAGADO → INSTALACIÓN AGENDADA) y los eventos.
- La disponibilidad de técnicos por comuna es ficticia y determinista (`src/lib/comunas.ts`, `src/lib/agenda.ts`). Tiltil, Alhué, Curacaví, María Pinto y San Pedro sirven para probar «sin cupo».
- Planes, precios y textos de oferta: `src/lib/plans.ts`. Contacto provisorio: `src/lib/site.ts`.
- Tema oscuro por defecto, al estilo de alphatecnologia.cl, con opción de tema claro y cálido; la elección se guarda en el navegador (tokens en `src/app/globals.css`, selector en `src/components/site/theme-toggle.tsx`).
- Títulos en Space Grotesk negrita (700, espaciado −0,025 em), como el sitio corporativo; textos en Inter y datos en JetBrains Mono.
- Capturas recortadas desde `../../Creacion de Contenido Alpha/fotos_gpstracker` (en `src/assets/plataforma`).
- Las tarjetas «Mapa en vivo» y «Geocercas» usan animaciones en bucle (`public/videos`, una versión por tema: `{nombre}-oscuro` y `{nombre}-claro`; componente `src/components/landing/loop-video.tsx`): solo se descarga la del tema activo, se cargan al entrar en pantalla, respetan «reducir movimiento» y se pueden pausar. El proyecto de Remotion que las genera vive fuera del repo, en `../../Creacion de Contenido Alpha/animaciones_landing` (ver su README), y usa como fuente las capturas en alta resolución de `capturas/`, que no se publican.
- `robots: noindex` mientras los precios sean provisorios (`src/app/layout.tsx`).

### Diseño (revisión visual del 15/10/2026, tasteskill)

- Portada: se volvió a la versión con el título a la izquierda y el panel de la plataforma a la derecha (preferencia del cliente); en el celular, la animación del mapa bajo los botones.
- «03:12» es una escena siempre nocturna (también en tema claro) con un reloj grande que avanza con cada minuto en pantalla.
- «Cómo funciona» muestra fragmentos reales del flujo (plan, pago, agenda, vehículo activo) e «Instalación» el acta de instalación, en vez de filas de cajas con número.
- Superficies separadas por tono, sin bordes finos ni sombras en reposo; sin destellos de degradado. El tema oscuro usa un fondo azul petróleo profundo (#0f1a21, no negro puro) y un campo más intenso (#10323b) para marcar «GPS + TAG».
- Nada que deba leerse bajo 13 px (`--text-xs` en `globals.css`).
- Entradas escalonadas por sección (`data-reveal` + `src/components/landing/reveal-observer.tsx`); sin JavaScript todo queda visible y se respeta «reducir movimiento».
- Pie de página que cierra con el logo a todo el ancho.
- Se mantienen a propósito, por identidad de marca: las etiquetas en mayúsculas sobre algunos títulos y la monoespaciada en datos (como alphatecnologia.cl).

### Señal principal y de respaldo (17/10/2026)

- La sección `#doble-senal` (`src/components/landing/double-signal.tsx`) explica el concepto sin mostrar equipos, cableado ni puntos de instalación: un sedán en vista superior dibujado en SVG (volumen por tonos, techo panorámico, luces LED) rodeado por dos campos. Principal: anillo cian que se dibuja al entrar, pulso cada 2,6 s y un barrido tipo radar que gira detrás del vehículo. Respaldo: banda de puntos verdes más amplia que respira cada 4,8 s. Entrada en secuencia (vehículo, principal, respaldo). Pasar el cursor o tocar una tarjeta resalta su señal y muestra una explicación breve. Con movimiento reducido o sin JavaScript todo queda visible y quieto (CSS `.sig-*` en `globals.css`). Rediseñada con la skill impeccable el 17/10/2026; reemplazó una versión con foto.
- Terminología en toda la landing, planes y pie: «señal principal» y «señal de respaldo» en lugar de GPS + TAG; el menú dice «Dos señales». Los modelos de los equipos solo aparecen en el portal del técnico.
- La secuencia nocturna usa 3:12–3:15 AM y se presenta como ilustrativa, sin prometer tiempos de respuesta.
- **Por validar con el equipo técnico antes de publicar:** que la señal de respaldo funcione de forma independiente de la principal y con qué cobertura y precisión; la alerta de desacoplamiento entre ambas señales (sigue en la lista de alertas de Funciones); que la principal sea la que aparece en el mapa del panel; la batería interna de respaldo del equipo principal (FAQ). Revisar también el lema «Tu vehículo, siempre a la vista», que puede leerse como seguimiento ininterrumpido.

### Menos scroll en el celular (16/10/2026)

De 20,5 a ~15,6 pantallas a 390 px, sin quitar contenido y sin cambiar el escritorio:

- Planes: selector Esencial · Seguridad · Flota con el precio de cada uno y una tarjeta a la vez (abre en Seguridad); en escritorio, las tres tarjetas.
- Funciones: el mapa en vivo queda grande y las otras cuatro van en la única fila deslizable de la página (`src/components/ui/swipe-row.tsx`: scroll nativo con imán, puntos tocables).
- Cómo funciona: riel tipo acordeón; solo el paso abierto muestra su pantalla (`src/components/landing/steps-rail.tsx`).
- Instalación y pie de página más compactos, y menos relleno entre secciones.

### Conversión (auditoría del 15/10/2026)

- Barra de compra fija en el celular (`src/components/landing/sticky-cta.tsx`): aparece fuera de la portada, los planes y el cierre.
- El botón principal de la portada baja a los planes de la misma página; la tabla completa queda en `/planes`.
- Cada plan muestra «Pagas hoy» (equipo e instalación + primer período), igual que el total del checkout. Esencial indica lo que no incluye.
- «¿Instalamos en tu comuna?» antes de los planes (`src/components/plans/coverage-check.tsx`): muestra el primer horario o avisa que aún no hay técnicos, y deja la comuna precargada en el checkout. El paso de dirección avisa si la comuna no tiene cobertura.
- Garantía «Si no podemos instalar, te devolvemos todo» bajo los planes y antes de pagar (`src/components/site/guarantee.tsx`, texto en `src/lib/site.ts`). **Por aprobar** por el equipo.
- Preguntas frecuentes nuevas: costo total, frecuencia de reporte (10 s, manual del VL103M), inhibidores de señal y duración de la instalación (por definir).
- En el celular la animación del mapa aparece en la primera pantalla.
- Medición: `src/lib/analytics.ts` deja los eventos del embudo en `window.dataLayer` (`cta_ver_planes`, `comuna_consultada`, `elegir_plan`, `checkout_paso`, `pago_iniciado`, `pago_resultado`, `agenda_reservada`, `lista_espera`, `whatsapp_click`). No carga scripts de terceros: falta elegir herramienta (GTM con GA4 y píxel de Meta) y publicar el aviso de cookies.

### Portal del técnico freelance (16/10/2026)

Web móvil en `/instalador`, según la especificación v0.2 (pantallas I1–I9). Datos ficticios en el teléfono (`localStorage`, clave `alg-instalador-v1`); se regeneran cada día y «Demo: reiniciar visitas y disponibilidad» (Mi cuenta) los vuelve al inicio.

- **Ingreso de demo:** RUT del técnico de prueba (Diego Fuentes, botón «Completar con los datos de demo») y contraseña `alpha2026`. Sin sesión, todo `/instalador/*` redirige a `/instalador/ingreso`.

| Ruta | Pantalla |
|---|---|
| `/instalador/ingreso` | I1 · Ingreso con RUT y contraseña |
| `/instalador` | I2 · Hoy: siguiente visita con su acción, resto del día y mañana; aviso para confirmar la semana |
| `/instalador/agenda` | I3 · Semana a semana (3 semanas): reservado, disponible, bloqueado, sin cupo |
| `/instalador/disponibilidad` | I4 · Confirmar la próxima semana, semana tipo (bloques de 2 h, lunes a sábado), cupo diario (máx. 3) y **bloqueo de días o bloques con motivo**; un bloque reservado no se bloquea (se usa «No puedo asistir») |
| `/instalador/visita/[id]` | I5 · Detalle: confirmar asistencia → iniciar trayecto → «Llegué»; contacto del cliente solo de 24 h antes a 48 h después; mapas; plan y accesorios; excepciones |
| `/instalador/visita/[id]/registro` | I6 · Asistente check-in → instalación → pruebas → check-out (fotos, IMEI con Luhn y custodia, pruebas con corte y sirena solo con el vehículo detenido, verificación en plataforma, firma y conformidad). El avance se guarda en el teléfono |
| `/instalador/visita/[id]/falla` | I7 · Instalación fallida (o visita técnica sin solución): causa, descripción, fotos → ticket SD ficticio; nunca se marca como instalado |
| `/instalador/historial` | I8 · Visitas cerradas, con incidencia y no-show |
| `/instalador/cuenta` | I9 · Contacto, comunas (las asigna Operaciones), documentos, equipos en custodia |

- Reglas en `src/lib/instalador/rules.ts` y constantes en `src/lib/instalador/model.ts`. Cada visita tiene un panel **Demo interna · CRM** con el estado del cliente (INSTALACIÓN AGENDADA → INSTALADO / VEHÍCULO ACTIVO, o SOPORTE ABIERTO) y sus eventos; no se envía nada al CRM, al Service Desk ni a la plataforma.
- Fotos desde la cámara trasera, comprimidas en el teléfono (`src/lib/image.ts`); «Usar ejemplo» permite probar sin cámara. El escáner de códigos aparece solo si el navegador trae `BarcodeDetector` (Chrome en Android); en iOS el IMEI se escribe o se elige de la custodia.
- La firma se guarda como tinta oscura sobre blanco en ambos temas, para que sirva en el acta.
- **Agenda del cliente conectada (solo demo, `src/lib/instalador/bridge.ts`):** el técnico de prueba cubre todas las comunas con cobertura alta o media (`comunasConTecnicos` en `src/lib/comunas.ts`); en ellas, `/agenda` y «¿Instalamos en tu comuna?» muestran sus bloques libres según semana tipo, bloqueos, visitas y cupo. Al confirmar, la reserva aparece en el portal como visita «Por confirmar»; «Cambiar fecha u hora» la libera; si el técnico bloquea el horario mientras el cliente lo tiene retenido, la confirmación avisa que ya no está disponible. Las comunas de cobertura baja y sin técnicos siguen con la disponibilidad ficticia, para probar «ver más fechas» y la lista de espera. Comparten el `localStorage`, así que solo se sincroniza dentro del mismo navegador (por ejemplo, la compra en una pestaña y el portal en otra). En producción ambos lados leen y escriben en el CRM.
- Verificado el 16/10/2026: recorrido completo y excepciones con Playwright a 390 px, axe sin hallazgos en ambos temas, `npm run build`. **Falta probar en teléfonos reales** (cámara, teclado, zonas seguras, GPS).
- **Por definir con Operaciones:** espera antes del no-show (15 min) e intentos (2), límite para iniciar trayecto (45 min antes), ventana de privacidad (24 h / 48 h), cupo máximo (3), cobro de visita en no-show, motivos de bloqueo y de «No puedo asistir», y la verificación manual «GPS reporta» mientras la plataforma no tenga API (D9).

## Reglas de contenido

- Mostrar solo funciones **validadas**. Corte de suministro y sirena **sí se ofrecen** (decisión del 15/10/2026), siempre con la regla de usar el corte solo con el vehículo detenido.
- No prometer monitoreo 24/7, recuperación del vehículo, app móvil (en desarrollo) ni alertas por WhatsApp o push: hoy las alertas llegan por correo y al panel.
- Planes Esencial · Seguridad · Flota (referencia del modelo de negocio), precios cercanos al mercado y condiciones son **provisorios**: marcarlos así hasta que se aprueben. El equipo se vende con el plan; garantía y permanencia POR DEFINIR.
- Pago con Webpay, mensual o anual (anual: pagas 10 meses y usas 12).
- Público: particulares. Cobertura de instalación: solo Región Metropolitana.
- Nunca mostrar datos GPS falsos al cliente.
- Leads hacia el CRM por el webhook existente (`POST /api/webhook`, cabecera `x-webhook-secret`).
