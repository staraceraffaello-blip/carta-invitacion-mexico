# Formulario — Carta de Invitación para Visitantes a México
## Plan Esencial

> Formulario de 6 pasos + revisión final. Precio: **$5 USD**. Archivo: `formulario-esencial.html`.

---

## Overview

- Multi-step form (`#main-form`) with 6 sections, HTML attribute `novalidate` (JS-driven validation).
- Steps are `<section>` elements (`#step-1` through `#step-6`), toggled via `.form-step.active`.
- Step transitions animate with `stepIn` keyframe (opacity + translateY).
- Sidebar (desktop) shows step progress with numbered dots (pending / active / done states); completed steps become clickable for navigation.
- Mobile shows a progress bar (`mob-progress-track` / `mob-progress-fill`) with label "Paso N de 6 — Title".
- Form data is saved to `localStorage` key `carta_form_esencial` before Stripe redirect and restored on page load.
- Hash parameter `#step=N` allows returning to a specific step (used by Stripe cancel redirect).
- GA4 tracking: `G-3W7EBYNBQ1`.
- Page is `noindex, nofollow`.

---

## Paso 1 — El viajero (Información del extranjero que visitará México)

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del viajero** | `v-nombre` / `v_nombre` | text | Sí | `nameReq()` — must contain at least one space (nombre + apellido). `titleCase()` on input. | `Ej. Juan Carlos Pérez López` |
| 2 | **Fecha de nacimiento** | `v-nacimiento` / `v_nacimiento` | date | Sí | `dateReq()` — year between 1900 and current year. `data-dynamic-date="birth"` sets `max` to current year. `min="1900-01-01"`. | Mobile: custom drum/wheel picker (DD/MM/AAAA). |
| 3 | **Nacionalidad** | `v-nacionalidad` / `v_nacionalidad` | select | Sí | `selReq()` — must select a value. | Default: `"La que aparece en el pasaporte del viajero"` (disabled). See **Dropdown: Nacionalidad** below. |
| 4 | **Número de pasaporte** | `v-pasaporte` / `v_pasaporte` | text | Sí | `req()` — non-empty. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 5 | **País de residencia** | `v-residencia` / `v_residencia` | select | Sí | `selReq()`. | Default: `"Donde reside el viajero actualmente"` (disabled). Same country list as Nacionalidad. |
| 6 | **Domicilio completo en país de residencia** | (group) | — | Sí | All sub-fields validated with `req()`. | — |
| 6a | — Calle, número, e interior | `v-calle` / `v_calle` | text | Sí | `req()`. `autocomplete="off"`. | `Calle, número, e interior (si aplica)` |
| 6b | — Ciudad | `v-ciudad` / `v_ciudad` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 6c | — Provincia / Estado / Región | `v-provincia` / `v_provincia` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Región` |
| 6d | — Código Postal | `v-cp` / `v_cp` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Código Postal` |
| 7 | **Actividad profesional u ocupación** | `v-ocupacion` / `v_ocupacion` | text | Sí | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante…` |
| 8 | **Correo electrónico** | `v-email` / `v_email` | email | Sí | `emailReq()` — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Whitespace stripped on input. Validated on blur. `autocomplete="email"`. | `nombre@correo.com` |

### Warnings / Hints (Paso 1)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Verifica que el pasaporte tenga al menos **6 meses de vigencia** a partir de la fecha de entrada a México." (warn)
- **Residencia:** "Puede ser diferente a la nacionalidad." (hint)
- **Ocupación:** "En el país de residencia del viajero. La actividad profesional ayuda a demostrar motivos para regresar después del viaje." (hint)

### Upsell Note (Paso 1)
- "¿Viajan más personas con el viajero? Con el Plan Completo se pueden incluir acompañantes en la misma carta de invitación." Links to `formulario-completo.html`.

---

## Paso 2 — El anfitrión (Mexicano/a o residente en México que firmará la carta)

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del anfitrión** | `a-nombre` / `a_nombre` | text | Sí | `nameReq()`. `titleCase()` on input. | `Ej. María Elena García Torres` |
| 2 | **Nacionalidad del anfitrión** | `a-nacionalidad` / `a_nacionalidad` | select | Sí | `selReq()`. | Default: `"Selecciona la nacionalidad"` (disabled). Same country list as `v-nacionalidad`, with "Mexicana" included in América Latina. |
| 3 | **Fecha de nacimiento** | `a-nacimiento` / `a_nacimiento` | date | Sí | `dateReq()` — year 1900 to current. `data-dynamic-date="birth"`. `min="1900-01-01"`. | — |
| 4 | **Tipo de identificación oficial** | `a-id-tipo` / `a_id_tipo` | select | Sí | `selReq()`. | Default: `"Selecciona el tipo"` (disabled). |
| 5 | **Número de identificación** | `a-id-num` / `a_id_num` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Número que aparece en la identificación del anfitrión` |
| 6 | **Domicilio en México** | (group) | — | Sí | All sub-fields validated. | — |
| 6a | — Calle, número e interior | `a-calle` / `a_calle` | text | Sí | `req()`. `autocomplete="off"`. | `Calle, número e interior (si aplica)` |
| 6b | — Colonia | `a-colonia` / `a_colonia` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Colonia` |
| 6c | — Delegación o Municipio | `a-delegacion` / `a_delegacion` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Delegación o Municipio` |
| 6d | — Ciudad | `a-ciudad` / `a_ciudad` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 6e | — Estado | `a-estado` / `a_estado` | select | Sí | `selReq()`. | Default: `"Estado"` (disabled). See **Dropdown: Estados de México** below. |
| 6f | — Código Postal | `a-cp` / `a_cp` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Código Postal` |
| 7 | **Teléfono de contacto** | `a-telefono` / `a_telefono` | tel | Sí | `phoneReq()` — exactly 10 digits. Auto-formatted `XX XXXX XXXX` on input. `maxlength="12"`. `autocomplete="tel"`. | `55 1234 5678` |
| 8 | **Correo electrónico del anfitrión** | `a-email` / `a_email` | email | Sí | `emailReq()`. `autocomplete="email"`. | `anfitrion@ejemplo.com` |
| 9 | **Ocupación o cargo del anfitrión** | `a-ocupacion` / `a_ocupacion` | text | Sí | `req()`. | `Ej. Ingeniero, Gerente, Médico, Profesor…` |
| 10 | **Empresa o lugar de trabajo** | `a-empresa` / `a_empresa` | text | No | Not validated. | `Ej. Pemex, Grupo Bimbo, Hospital Ángeles, Independiente…` |
| 11 | **Vínculo con el viajero** | `a-vinculo` / `a_vinculo` | select | Sí | `selReq()`. | Default: `"Selecciona el vínculo"` (disabled). |
| 12 | **¿Quién llena este formulario?** | `a-perspectiva` / `a_perspectiva` | select | Sí | `selReq()`. | Default: `"Selecciona quién está describiendo"` (disabled). |
| 13 | **Describe brevemente el vínculo** | `a-vinculo-detalle` / `a_vinculo_detalle` | textarea | Sí | `req()`. `rows="2"`. | `Ej. Somos amigos desde la universidad · Es sobrino de mi esposa · Trabajamos juntos en la misma empresa…` |
| 14 | **¿Desde hace cuánto se conocen?** | (group) | — | Sí | Both selects validated with `selReq()`. | — |
| 14a | — Años | `a-tiempo-anios` / `a_tiempo_anios` | select | Sí | `selReq()`. | Default: `"Años"` (disabled). |
| 14b | — Meses | `a-tiempo-meses` / `a_tiempo_meses` | select | Sí | `selReq()`. | Default: `"Meses"` (disabled). |

### Dropdown: Tipo de identificación oficial (`a-id-tipo`)

| Value | Label |
|-------|-------|
| `pasaporte` | Pasaporte mexicano |
| `ine` | INE |
| `residente` | Tarjeta de residente |

### Dropdown: Vínculo con el viajero (`a-vinculo`)

| Value | Label |
|-------|-------|
| `familiar` | Familiar |
| `pareja` | Pareja |
| `amistad` | Amistad |
| `laboral` | Laboral |
| `otro` | Otro |

### Dropdown: ¿Quién llena este formulario? (`a-perspectiva`)

| Value | Label |
|-------|-------|
| `anfitrion` | Yo soy el anfitrión |
| `visitante` | Yo soy el visitante |

### Dropdown: Años de conocerse (`a-tiempo-anios`)

| Value | Label |
|-------|-------|
| `0` | 0 años |
| `1` | 1 año |
| `2` | 2 años |
| `3` | 3 años |
| `4` | 4 años |
| `5` | 5 años |
| `6` | 6 años |
| `7` | 7 años |
| `8` | 8 años |
| `9` | 9 años |
| `10` | 10 años |
| `11` | 11 años |
| `12` | 12 años |
| `13` | 13 años |
| `14` | 14 años |
| `15` | 15 años |
| `16` | 16 años |
| `17` | 17 años |
| `18` | 18 años |
| `19` | 19 años |
| `20` | 20 años |
| `21` | 21 años |
| `22` | 22 años |
| `23` | 23 años |
| `24` | 24 años |
| `25` | 25 años |
| `26` | 26 años |
| `27` | 27 años |
| `28` | 28 años |
| `29` | 29 años |
| `30` | 30 años |
| `99` | Más de 30 años |

### Dropdown: Meses de conocerse (`a-tiempo-meses`)

| Value | Label |
|-------|-------|
| `0` | 0 meses |
| `1` | 1 mes |
| `2` – `11` | 2 meses – 11 meses |

### Warnings / Hints (Paso 2)
- **Nombre:** "Tal como aparece en la identificación oficial." (warn)
- **Nacimiento:** "El anfitrión debe ser mayor de edad (18 años o más)." (hint)
- **Tipo de ID:** "Se deberá anexar copia de esta identificación a la carta de invitación." (warn)
- **Domicilio:** "Se recomienda anexar a la carta de invitación un comprobante de domicilio del anfitrión con antigüedad no mayor a 3 meses." (warn)
- **Teléfono:** "10 dígitos sin LADA internacional." (hint) + "Migración puede llamar a este número exactamente al momento del arribo del visitante. Es fundamental que el anfitrión esté disponible en este número durante las fechas del viaje." (warn)
- **Email:** "Un correo de contacto que aparecerá en la carta." (hint)
- **Ocupación:** "Esto ayuda a demostrar estabilidad y respaldo económico ante migración." (hint)
- **Perspectiva:** "Esto nos ayuda a redactar correctamente la carta desde la perspectiva adecuada." (hint)
- **Vínculo detalle:** "Describe la relación como si el anfitrión la estuviera explicando, sin importar quién llene el formulario. Este texto aparecerá directamente en la carta de invitación. Entre más detalle, más personalizada será la carta." (warn)

---

## Paso 3 — El viaje (Información sobre la estancia y alojamiento en México)

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Motivo del viaje** | `j-motivo` / `j_motivo` | select | Sí | `selReq()`. | Default: `"Selecciona el motivo principal"` (disabled). |
| 2 | **Actividades que realizará en México** | `j-actividades` / `j_actividades` | textarea | Sí | `req()`. `rows="3"`. | `Ej. Turismo en Ciudad de México, visita a familiares en Guadalajara, asistencia a la boda del anfitrión y celebraciones correspondientes, recorridos culturales en Oaxaca…` |
| 3 | **¿El viajero se hospedará en la dirección del anfitrión?** | `aloj_es_anfitrion` (radio) | radio | Sí | Must select one. | Values: `si` / `no`. Rendered as two radio cards. |

### Dropdown: Motivo del viaje (`j-motivo`)

| Value | Label |
|-------|-------|
| `turismo` | Turismo |
| `negocios` | Negocios |
| `estudios` | Estudios |
| `actividades_no_remuneradas` | Actividades no remuneradas |
| `transito` | Tránsito |
| `tratamientos_medicos` | Tratamientos médicos |

### Conditional: Alojamiento alternativo (shown when `aloj_es_anfitrion = "no"`)

Container: `#aloj-custom-container` (class `cond-fields`, toggles `open`). Controlled by `onAlojToggle()`.

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 4 | **Nombre del alojamiento** | `j-aloj-nombre` / `j_aloj_nombre` | text | No | Not validated. | `Hotel, Airbnb, casa particular…` |
| 5 | **Dirección del alojamiento en México** | (group) | — | Sí (conditional) | All sub-fields validated with `req()` / `selReq()`. | — |
| 5a | — Calle, número e interior | `j-al-calle` / `j_al_calle` | text | Sí | `req()`. | `Calle, número e interior (si aplica)` |
| 5b | — Colonia | `j-al-colonia` / `j_al_colonia` | text | Sí | `req()`. `capFirst()` on input. | `Colonia` |
| 5c | — Delegación o Municipio | `j-al-delegacion` / `j_al_delegacion` | text | Sí | `req()`. `capFirst()` on input. | `Delegación o Municipio` |
| 5d | — Ciudad | `j-al-ciudad` / `j_al_ciudad` | text | Sí | `req()`. `capFirst()` on input. | `Ciudad` |
| 5e | — Estado | `j-al-estado` / `j_al_estado` | select | Sí | `selReq()`. | Same 32 states as anfitrión address. |
| 5f | — Código Postal | `j-al-cp` / `j_al_cp` | text | Sí | `req()`. `upperAll()` on input. | `Código Postal` |

### Conditional Logic: Alojamiento toggle

| Selection | Behavior |
|-----------|----------|
| **Sí** (hospeda en dirección del anfitrión) | `#aloj-custom-container` hidden. All custom address fields cleared. |
| **No** (alojamiento diferente) | `#aloj-custom-container` shown. Custom address fields become required. |

### Warnings / Hints (Paso 3)
- **Motivo del viaje:** "Esto determina el propósito que se indicará en la carta de invitación." (hint) + "La estancia máxima para visitantes en México es de 180 días." (warn)
- **Actividades:** "Sé lo más específico posible: incluye nombres de lugares, eventos, razones del viaje y cualquier detalle relevante. Mientras más información se proporcione, más completa será la carta de invitación." (warn)
- **Nombre del alojamiento:** "Se recomienda tener la reservación a la mano para mostrar a la autoridad migratoria." (hint)

### Upsell Note (Paso 3)
- "¿El viajero visitará varias ciudades o tendrá más de un alojamiento? Con el Plan Completo se puede agregar un itinerario multi-destino con múltiples alojamientos." Links to `formulario-completo.html`.

---

## Paso 4 — Gastos del viaje

### Info Note
- "Si el visitante cubre total o parcialmente sus propios gastos, se recomienda que pueda comprobar el equivalente de al menos **USD $50 por día** con efectivo, estado de cuenta bancario o de tarjeta."

### Pregunta principal: ¿Gastos a cargo del anfitrión?

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **¿Hay algún gasto que será a cargo del anfitrión?** | `gastos_anfitrion` (radio) | radio | Sí | Must select one. | Values: `si` / `no`. Rendered as two radio cards. |

### Conditional: Detalle de gastos del anfitrión (shown when `gastos_anfitrion = "si"`)

Container: `#gastos-host-detail` (class `cond-fields`, toggles `open`). Controlled by `onGastosHostToggle()`.

**Warning box (red):** "Si el anfitrión asume alguno de los gastos, se debe anexar documentación adicional de solvencia económica del anfitrión, como **estados de cuenta bancarios** o **recibos de nómina**, para demostrar que cuenta con los recursos para cubrir la estancia."

| # | Campo | Name | Tipo | Requerido | Validación |
|---|-------|------|------|-----------|------------|
| 2 | **¿Cuáles gastos serán cubiertos por el anfitrión?** | `gastos_host_conceptos` | checkbox (multiple) | Sí (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `gastos_host_conceptos`:

| Value | Label |
|-------|-------|
| `alojamiento` | 🏨 Alojamiento *(visible only when `aloj_es_anfitrion = "no"`)* |
| `alimentos` | Alimentos |
| `transporte` | Transporte |
| `actividades` | Actividades turísticas |
| `medicos` | Gastos médicos o emergencia |
| `otro` | Otro |

#### Conditional: "Otro" gasto text (shown when `otro` is checked)

Container: `#gastos-otro-container` (class `cond-fields`, toggles `open`). Controlled by `onGastosOtroToggle()`.

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Describe el gasto adicional | `gastos-otro-texto` / `gastos_otro_texto` | text | Sí (when "otro" checked) | `Describe el gasto adicional…` |

### Medios de transporte del visitante en México

| # | Campo | Name | Tipo | Requerido | Validación |
|---|-------|------|------|-----------|------------|
| 3 | **Medios de transporte del visitante en México** | `transporte_mx` | checkbox (multiple) | Sí (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `transporte_mx`:

| Value | Label |
|-------|-------|
| `auto_rentado` | Auto rentado |
| `anfitrion` | Transporte del anfitrión |
| `transporte_publico` | Transporte público y/o taxis |

---

## Paso 5 — Entrada y salida de México

### Info Note
- "Se debe comprobar que se cuenta con reservación para el viaje de regreso al momento del ingreso a México."

### Ingreso a México

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **¿Cómo será el ingreso a México?** | `ingreso_tipo` (radio) | radio | Sí | Must select one. | Three transport-type cards: Aéreo / Terrestre / Marítimo. |
| 2 | **Fecha de llegada a México** | `ing-fecha` / `ing_fecha` | date | Sí | `dateReq()` — year between current and current+5. `data-dynamic-date="travel"`. | — |

#### Conditional fields by ingress type:

| Tipo | Fields shown | Container ID |
|------|-------------|-------------|
| **Aéreo** (`aereo`) | Aeropuerto de ingreso, Aerolínea de llegada, Número de vuelo | `#cond-ingreso-aereo` |
| **Terrestre** (`terrestre`) | Punto de cruce fronterizo | `#cond-ingreso-terrestre` |
| **Marítimo** (`maritimo`) | Puerto de ingreso | `#cond-ingreso-maritimo` |

##### Aéreo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Aeropuerto de ingreso | `ing-aeropuerto` / `ing_aeropuerto` | text | Sí (when aéreo) | `Ej. AICM — Ciudad de México` |
| Aerolínea de llegada | `ing-aerolinea` / `ing_aerolinea` | text | Sí (when aéreo) | `Ej. Avianca, LATAM…` |
| Número de vuelo | `ing-vuelo` / `ing_vuelo` | text | Sí (when aéreo) | `Ej. AV204` |

##### Terrestre ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `ing-cruce` / `ing_cruce` | text | Sí (when terrestre) | `Ej. Tijuana, Ciudad Juárez…` |

##### Marítimo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de ingreso | `ing-puerto` / `ing_puerto` | text | Sí (when marítimo) | `Ej. Puerto de Veracruz` |

### Salida de México

| # | Campo | ID / Name | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **¿Cómo será la salida de México?** | `salida_tipo` (radio) | radio | Sí | Must select one. | Three transport-type cards: Aéreo / Terrestre / Marítimo. |
| 2 | **Fecha de regreso** | `sal-fecha` / `sal_fecha` | date | Sí | `dateReq()` — year between current and current+5. Must be >= `ing-fecha`. `data-dynamic-date="travel"`. | — |

#### Conditional fields by exit type:

| Tipo | Fields shown | Container ID |
|------|-------------|-------------|
| **Aéreo** (`aereo`) | Aeropuerto de salida, Aerolínea de regreso, Número de vuelo | `#cond-salida-aereo` |
| **Terrestre** (`terrestre`) | Punto de cruce fronterizo | `#cond-salida-terrestre` |
| **Marítimo** (`maritimo`) | Puerto de salida | `#cond-salida-maritimo` |

##### Aéreo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Aeropuerto de salida | `sal-aeropuerto` / `sal_aeropuerto` | text | Sí (when aéreo) | `Ej. AICM — Ciudad de México` |
| Aerolínea de regreso | `sal-aerolinea` / `sal_aerolinea` | text | Sí (when aéreo) | `Ej. Avianca, LATAM…` |
| Número de vuelo | `sal-vuelo` / `sal_vuelo` | text | Sí (when aéreo) | `Ej. AV205` |

##### Terrestre salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `sal-cruce` / `sal_cruce` | text | Sí (when terrestre) | `Ej. Nuevo Laredo, Reynosa…` |

##### Marítimo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de salida | `sal-puerto` / `sal_puerto` | text | Sí (when marítimo) | `Ej. Puerto de Ensenada` |

### Date Cross-Validation (Paso 5)
- `sal-fecha` must be >= `ing-fecha`. Validated both on step submit and in real-time via `crossValidateDates()`.
- **180-day warning** (`#warn-180`): Non-blocking warning displayed when stay exceeds 180 days: "La estancia máxima para turismo en México es de 180 días."
- **Date coherence hint:** "Estas fechas deben coincidir exactamente con los boletos de avión o transporte del viajero. El agente migratorio verificará la coherencia." (warn)

---

## Paso 6 — Revisión final

No new form fields. Displays a read-only summary of all data entered in Steps 1–5, built dynamically by `buildReview()`.

### CTA Box (appears twice — top and bottom of review)
- Text: "¿Todo correcto? Revisa los datos abajo y confirma para proceder al pago seguro. La carta PDF llegará al correo del viajero y del anfitrión en minutos."
- Security note: "Pago procesado por Stripe. No almacenamos datos de tarjeta."
- Buttons: "Volver y editar" (btn-back → `goPrev(6)`) | "Confirmar y pagar · $5 USD" (btn-navy → `goNext(6)`)

### Responsibility Note
- "Al generar esta carta, el anfitrión declara que la información proporcionada es verídica y se compromete a recibir al visitante durante las fechas indicadas. Es importante que toda la información coincida con lo que el viajero declare ante el agente migratorio."

### Review Cards Generated by `buildReview()`

5 review cards with the following data:

1. **El viajero** — Nombre completo, Fecha de nacimiento (DD/MM/YYYY), Nacionalidad, N.º de pasaporte, País de residencia, Domicilio (concatenated), Ocupación, Correo electrónico.
2. **El anfitrión** — Nombre completo, Nacionalidad, Fecha de nacimiento, Tipo de ID, N.º de ID, Domicilio en México (concatenated with colonia, delegación, ciudad, estado, CP), Teléfono, Correo electrónico, Ocupación / cargo, Empresa, Vínculo con el viajero, ¿Quién llena?, Detalle del vínculo, Tiempo de conocerse.
3. **El viaje** — Motivo del viaje, Actividades, Alojamiento (either "Dirección del anfitrión" or custom address with optional name).
4. **Gastos** — Gastos a cargo del anfitrión (Sí/No), Conceptos cubiertos (if Sí, with labels including Alojamiento), Transporte en México.
5. **Entrada y salida** — Tipo de ingreso, Detalle ingreso (airport·airline·flight or crossing/port), Fecha de llegada, Tipo de salida, Detalle salida, Fecha de regreso.

---

## Dropdown: Nacionalidad / País de residencia (used for `v-nacionalidad`, `v-residencia`, and `a-nacionalidad`)

Three dropdowns share the same country list, grouped by region:

### América Latina y el Caribe
Antigua y Barbuda, Argentina, Bahamas, Barbados, Belice, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Dominica, Ecuador, El Salvador, Granada, Guatemala, Guyana, Haití, Honduras, Jamaica, Nicaragua, Panamá, Paraguay, Perú, República Dominicana, San Cristóbal y Nieves, San Vicente y las Granadinas, Santa Lucía, Surinam, Trinidad y Tobago, Uruguay, Venezuela

### Norteamérica
Canadá, Estados Unidos

### Europa
Albania, Alemania, Andorra, Austria, Bélgica, Bielorrusia, Bosnia y Herzegovina, Bulgaria, Chipre, Ciudad del Vaticano, Croacia, Dinamarca, Eslovaquia, Eslovenia, España, Estonia, Finlandia, Francia, Grecia, Hungría, Irlanda, Islandia, Italia, Kosovo, Letonia, Liechtenstein, Lituania, Luxemburgo, Malta, Moldavia, Mónaco, Montenegro, Noruega, Países Bajos, Polonia, Portugal, Reino Unido, República Checa, Rumanía, Rusia, San Marino, Serbia, Suecia, Suiza, Ucrania

### África
Argelia, Angola, Benín, Botsuana, Burkina Faso, Burundi, Cabo Verde, Camerún, Chad, Comoras, Congo, Costa de Marfil, Egipto, Eritrea, Etiopía, Gabón, Gambia, Ghana, Guinea, Guinea Ecuatorial, Guinea-Bisáu, Kenia, Lesoto, Liberia, Libia, Madagascar, Malaui, Mali, Marruecos, Mauricio, Mauritania, Mozambique, Namibia, Níger, Nigeria, República Centroafricana, República Democrática del Congo, Ruanda, Santo Tomé y Príncipe, Senegal, Seychelles, Sierra Leona, Somalia, Sudáfrica, Sudán, Sudán del Sur, Suazilandia, Tanzania, Togo, Túnez, Uganda, Yibuti, Zambia, Zimbabue

### Asia y Medio Oriente
Afganistán, Arabia Saudita, Armenia, Azerbaiyán, Bangladés, Brunéi, Bután, Camboya, Catar, China, Corea del Norte, Corea del Sur, Emiratos Árabes Unidos, Filipinas, Georgia, India, Indonesia, Irak, Irán, Israel, Japón, Jordania, Kazajistán, Kirguistán, Kuwait, Laos, Líbano, Malasia, Maldivas, Mongolia, Myanmar, Nepal, Omán, Pakistán, Palestina, Singapur, Siria, Sri Lanka, Tailandia, Tayikistán, Timor Oriental, Turkmenistán, Turquía, Uzbekistán, Vietnam, Yemen

### Oceanía
Australia, Fiyi, Islas Marshall, Islas Salomón, Kiribati, Micronesia, Nauru, Nueva Zelanda, Palaos, Papúa Nueva Guinea, Samoa, Tonga, Tuvalu, Vanuatu

---

## Dropdown: Estados de México (used for `a-estado`, `j-al-estado`)

32 states: Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de México, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, México, Michoacán, Morelos, Nayarit, Nuevo León, Oaxaca, Puebla, Querétaro, Quintana Roo, San Luis Potosí, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatán, Zacatecas

---

## Payment Flow (Stripe Integration)

1. User clicks "Confirmar y pagar · $5 USD" on Step 6.
2. `goNext(6)` calls `submitToAPI()`.
3. Button is disabled and shows "Procesando..." spinner.
4. `collectFormData()` gathers all form values into a JSON object (text/select/textarea by ID, radios by name, checkboxes as arrays by name).
5. **Email selection logic:** If `a-perspectiva === 'visitante'`, uses `v-email`; otherwise uses `a-email`. This determines the Stripe checkout email.
6. POST to `/api/submit` with body: `{ plan: 'esencial', email, formData }`.
7. Expects JSON response with `{ url }` (Stripe Checkout URL).
8. Saves form data to `localStorage` key `carta_form_esencial` (with current step number).
9. Redirects to `result.url` (Stripe Checkout).
10. On error: shows `alert()` with error message, re-enables button.

### Stripe Cancel / Return Flow
- On page load, checks for `#step=N` hash parameter (e.g., `#step=6` from Stripe cancel).
- Restores form data from `localStorage` via `restoreFormData()`.
- `restoreFormData()` sets values by element ID, fires `input` and `change` events to trigger formatting and conditional logic, and handles radio/checkbox arrays.
- Syncs mobile date picker trigger values (DD/MM/YYYY format) with hidden date inputs.

---

## JavaScript Behavior Summary

### Text Transform Helpers
| Function | Behavior | Used on |
|----------|----------|---------|
| `titleCase(el)` | Capitalizes first letter of every word | `v-nombre`, `a-nombre` |
| `capFirst(el)` | Capitalizes first letter only | City/province/colonia fields, airport/airline fields |
| `upperAll(el)` | Converts entire value to uppercase | Passport number, ID number, postal codes, flight numbers |

### Validation Functions
| Function | Logic |
|----------|-------|
| `nameReq(id, errId)` | Non-empty AND contains at least one space. Custom error message: "nombre(s) y apellidos completos". |
| `req(id, errId)` | Non-empty after trim. |
| `selReq(id, errId)` | Value is not empty string. |
| `phoneReq(id, errId)` | Exactly 10 digits after stripping non-digits. |
| `emailReq(id, errId)` | Matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. |
| `dateReq(id, errId, minYear, maxYear)` | Non-empty, valid Date object reconstruction, year within range. |

### Real-Time Validation (`setupRealtimeValidation()`)
- Name fields: validated on `blur`.
- Text/textarea fields: validated on `blur`.
- Date fields: validated on both `change` and `input`.
- Select fields: validated on `change`.
- Phone: validated on `blur`.
- Cross-date validation (`sal-fecha` >= `ing-fecha`): validated on both `change` and `input` of either date.

### Phone Auto-Format
Input regex: `this.value.replace(/[^\d]/g,'').replace(/^(\d{2})(\d{0,4})(\d{0,4})$/,(_,a,b,c)=>[a,b,c].filter(Boolean).join(' ')).slice(0,12)`
Formats as `XX XXXX XXXX` (10 digits with spaces).

### Auto-Trim
- All text/email/textarea inputs: leading whitespace removed on `input`, full trim on `blur`.
- Applied via direct listeners and event delegation.

### Mobile Date Picker
- Activated only on screens <= 639px width (`matchMedia`).
- Converts all `<input type="date">` into hidden inputs + visible readonly trigger inputs with `DD/MM/AAAA` placeholder.
- iOS-style drum/wheel picker with three scrollable columns: Day, Month (Ene–Dic), Year.
- Year range determined by `data-dynamic-date` attribute:
  - `birth`: 1920 to current year (default selection: 1990).
  - `travel`: current year to current year + 5 (default selection: today).
- Day column auto-adjusts for month/year changes (e.g., February leap year).
- Scroll snap with 40px item height.
- Cancel / OK buttons in navy bottom sheet.

### Dynamic Date Constraints
Set on page load via IIFE:
- `data-dynamic-date="travel"` inputs: `min` = `{currentYear}-01-01`, `max` = `{currentYear+5}-12-31`.
- `data-dynamic-date="birth"` inputs: `max` = `{currentYear}-12-31`.

### localStorage Persistence
- Key: `carta_form_esencial`
- Saved before Stripe redirect: `{ formData: {...}, step: N }`
- Restored on page load if present.
- Hash `#step=N` overrides saved step number.

---

## Conditional Logic Summary

| Trigger | Condition | Fields Shown / Hidden |
|---------|-----------|----------------------|
| `aloj_es_anfitrion` radio | `= "no"` | Show `#aloj-custom-container` (accommodation name + address) |
| `aloj_es_anfitrion` radio | `= "si"` | Hide `#aloj-custom-container`, clear all values |
| `aloj_es_anfitrion` radio | `= "no"` | Show `#gasto-alojamiento-card` checkbox in gastos section |
| `aloj_es_anfitrion` radio | `= "si"` | Hide `#gasto-alojamiento-card`, uncheck it |
| `gastos_anfitrion` radio | `= "si"` | Show `#gastos-host-detail` (warning + concept checkboxes) |
| `gastos_anfitrion` radio | `= "no"` | Hide `#gastos-host-detail`, uncheck all, clear "otro" text |
| `gastos_host_conceptos` checkbox `"otro"` | checked | Show `#gastos-otro-container` (text input) |
| `gastos_host_conceptos` checkbox `"otro"` | unchecked | Hide `#gastos-otro-container`, clear text |
| `ingreso_tipo` radio | `= "aereo"` | Show `#cond-ingreso-aereo` (airport, airline, flight) |
| `ingreso_tipo` radio | `= "terrestre"` | Show `#cond-ingreso-terrestre` (border crossing) |
| `ingreso_tipo` radio | `= "maritimo"` | Show `#cond-ingreso-maritimo` (port) |
| `salida_tipo` radio | `= "aereo"` | Show `#cond-salida-aereo` (airport, airline, flight) |
| `salida_tipo` radio | `= "terrestre"` | Show `#cond-salida-terrestre` (border crossing) |
| `salida_tipo` radio | `= "maritimo"` | Show `#cond-salida-maritimo` (port) |

All conditional containers use CSS class `cond-fields` with `max-height: 0; overflow: hidden; opacity: 0` (hidden) and `cond-fields.open` with `max-height: 800px; opacity: 1` (visible), animated via CSS transitions.

---

## Review Label Maps (used in `buildReview()`)

### `TIPO_INGSAL`
```js
{ aereo: 'Aéreo', terrestre: 'Terrestre', maritimo: 'Marítimo' }
```

### `TRANSPORTE_LABELS`
```js
{ auto_rentado: 'Auto rentado', anfitrion: 'Transporte del anfitrión', transporte_publico: 'Transporte público y/o taxis' }
```

### Gastos conceptos labels (inline in `buildReview()`)
```js
alojamiento → 'Alojamiento'
alimentos → 'Alimentos'
transporte → 'Transporte'
actividades → 'Actividades turísticas'
medicos → 'Gastos médicos o emergencia'
otro → 'Otro: {text}' or 'Otro'
```

---

## UI / Design Notes

- **Fonts:** Cormorant Garamond (headings, price) + DM Sans (body, inputs).
- **Colors:** Navy `#1B3566`, Gold `#C9A84C`, Cream `#FAF8F4`, Mid `#4A6FA5`.
- **Input styling:** 16px font (prevents iOS zoom), 1.5px border, 10px border-radius. Focus: gold border + gold box-shadow. Error: red border + red box-shadow.
- **Buttons:** `btn-gold` (primary continue), `btn-navy` (final CTA), `btn-back` (back navigation). Min-height 52px. Hover: translateY(-2px) + shadow.
- **Accessibility:** Skip-to-content link, `aria-label` on logo, `aria-hidden="true"` on decorative SVGs, `focus-visible` outlines.
- **Trust indicators (sidebar):** HTTPS secure, PDF ready in minutes, 2,400+ cartas generated, 4.9 stars.
- **Footer links:** Privacidad, Términos, "Conexión segura HTTPS".
- **Grain texture:** SVG noise filter overlay on sidebar card.

---

*Fuentes: Embajada de México en Argentina (INM/SRE) · DIAM S.C. Abogados Migratorios · Migrans MX Guía 2025*
