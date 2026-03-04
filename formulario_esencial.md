# Formulario — Carta de Invitacion para Visitantes a Mexico
## Plan Esencial

> Formulario de 6 pasos + revision final. Precio: **$5 USD**. Archivo: `formulario-esencial.html`.

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
- **Step order**: Step 1 = El anfitrion, Step 2 = El viajero. The anfitrion (host) is filled first.
- **No perspectiva field**: The `a-perspectiva` field has been removed. All descriptions are always from the host's (anfitrion's) perspective. There is no inversion logic.

---

## Paso 1 — El anfitrion (Mexicano/a o residente en Mexico que firmara la carta)

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del anfitrion** | `a-nombre` / `a_nombre` | text | Si | `nameReq()`. `titleCase()` on input. | `Ej. Maria Elena Garcia Torres` |
| 2 | **Sexo del anfitrion** | `a_genero` | radio | Si | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (portador/portadora). |
| 3 | **Nacionalidad del anfitrion** | `a-nacionalidad` / `a_nacionalidad` | select | Si | `selReq()`. | Default: `"Selecciona la nacionalidad"` (disabled). Same country list as `v-nacionalidad`, with "Mexicana" included in America Latina. |
| 4 | **Fecha de nacimiento** | `a-nacimiento` / `a_nacimiento` | date | Si | `dateReq()` — year 1900 to current. `data-dynamic-date="birth"`. `min="1900-01-01"`. | — |
| 5 | **Tipo de identificacion oficial** | `a-id-tipo` / `a_id_tipo` | select | Si | `selReq()`. | Default: `"Selecciona el tipo"` (disabled). |
| 6 | **Numero de identificacion** | `a-id-num` / `a_id_num` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Numero que aparece en la identificacion del anfitrion` |
| 7 | **Domicilio en Mexico** | (group) | — | Si | All sub-fields validated. | — |
| 7a | — Calle, numero e interior | `a-calle` / `a_calle` | text | Si | `req()`. `autocomplete="off"`. | `Calle, numero e interior (si aplica)` |
| 7b | — Colonia | `a-colonia` / `a_colonia` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Colonia` |
| 7c | — Delegacion o Municipio | `a-delegacion` / `a_delegacion` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Delegacion o Municipio` |
| 7d | — Ciudad | `a-ciudad` / `a_ciudad` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7e | — Estado | `a-estado` / `a_estado` | select | Si | `selReq()`. | Default: `"Estado"` (disabled). See **Dropdown: Estados de Mexico** below. |
| 7f | — Codigo Postal | `a-cp` / `a_cp` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Codigo Postal` |
| 8 | **Telefono de contacto** | `a-telefono` / `a_telefono` | tel | Si | `phoneReq()` — exactly 10 digits. Auto-formatted `XX XXXX XXXX` on input. `maxlength="12"`. `autocomplete="tel"`. | `55 1234 5678` |
| 9 | **Correo electronico del anfitrion** | `a-email` / `a_email` | email | Si | `emailReq()`. `autocomplete="email"`. | `anfitrion@ejemplo.com` |
| 10 | **Ocupacion o cargo del anfitrion** | `a-ocupacion` / `a_ocupacion` | text | Si | `req()`. | `Ej. Ingeniero, Gerente, Medico, Profesor...` |
| 11 | **Empresa o lugar de trabajo** | `a-empresa` / `a_empresa` | text | No | Not validated. | `Ej. Pemex, Grupo Bimbo, Hospital Angeles, Independiente...` |

**Note**: This step contains ONLY the anfitrion's personal data. The vinculo fields (vinculo, parentesco, vinculo-detalle, tiempo) are in Step 2 (El viajero).

### Dropdown: Tipo de identificacion oficial (`a-id-tipo`)

| Value | Label |
|-------|-------|
| `pasaporte` | Pasaporte mexicano |
| `ine` | INE |
| `residente` | Tarjeta de residente |

### Warnings / Hints (Paso 1)
- **Nombre:** "Tal como aparece en la identificacion oficial." (warn)
- **Nacimiento:** "El anfitrion debe ser mayor de edad (18 anos o mas)." (hint)
- **Tipo de ID:** "Se debera anexar copia de esta identificacion a la carta de invitacion." (warn)
- **Domicilio:** "Se recomienda anexar a la carta de invitacion un comprobante de domicilio del anfitrion con antiguedad no mayor a 3 meses." (warn)
- **Telefono:** "10 digitos sin LADA internacional." (hint) + "Migracion puede llamar a este numero exactamente al momento del arribo del visitante. Es fundamental que el anfitrion este disponible en este numero durante las fechas del viaje." (warn)
- **Email:** "Un correo de contacto que aparecera en la carta." (hint)
- **Ocupacion:** "Esto ayuda a demostrar estabilidad y respaldo economico ante migracion." (hint)

---

## Paso 2 — El viajero (Informacion del extranjero que visitara Mexico)

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del viajero** | `v-nombre` / `v_nombre` | text | Si | `nameReq()` — must contain at least one space (nombre + apellido). `titleCase()` on input. | `Ej. Juan Carlos Perez Lopez` |
| 2 | **Sexo del viajero** | `v_genero` | radio | Si | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (invitado/invitada). |
| 3 | **Fecha de nacimiento** | `v-nacimiento` / `v_nacimiento` | date | Si | `dateReq()` — year between 1900 and current year. `data-dynamic-date="birth"` sets `max` to current year. `min="1900-01-01"`. | Mobile: custom drum/wheel picker (DD/MM/AAAA). |
| 4 | **Nacionalidad** | `v-nacionalidad` / `v_nacionalidad` | select | Si | `selReq()` — must select a value. | Default: `"La que aparece en el pasaporte del viajero"` (disabled). See **Dropdown: Nacionalidad** below. |
| 5 | **Numero de pasaporte** | `v-pasaporte` / `v_pasaporte` | text | Si | `req()` — non-empty. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 6 | **Pais de residencia** | `v-residencia` / `v_residencia` | select | Si | `selReq()`. | Default: `"Donde reside el viajero actualmente"` (disabled). Same country list as Nacionalidad. |
| 7 | **Domicilio completo en pais de residencia** | (group) | — | Si | All sub-fields validated with `req()`. | — |
| 7a | — Calle, numero, e interior | `v-calle` / `v_calle` | text | Si | `req()`. `autocomplete="off"`. | `Calle, numero, e interior (si aplica)` |
| 7b | — Ciudad | `v-ciudad` / `v_ciudad` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7c | — Provincia / Estado / Region | `v-provincia` / `v_provincia` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Region` |
| 7d | — Codigo Postal | `v-cp` / `v_cp` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Codigo Postal` |
| 8 | **Actividad profesional u ocupacion** | `v-ocupacion` / `v_ocupacion` | text | Si | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante...` |
| 9 | **Correo electronico** | `v-email` / `v_email` | email | Si | `emailReq()` — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Whitespace stripped on input. Validated on blur. `autocomplete="email"`. | `nombre@correo.com` |

### Vinculo fields (in Step 2, after viajero personal data)

These fields describe the relationship between the anfitrion and the viajero. They are always written from the anfitrion's perspective (a red note reminds: "Describe la relacion desde la perspectiva del anfitrion (quien firma la carta)").

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 10 | **Vinculo con el viajero** | `a-vinculo` / `a_vinculo` | select | Si | `selReq()`. | Default: `"Selecciona el vinculo"` (disabled). |
| 11 | **Tipo de parentesco** *(conditional)* | `a-parentesco` / `a_parentesco` | select | Si (when familiar or pareja) | `selReq()`. Shown when vinculo = `familiar` (17 family options) or `pareja` (3 partner options). Options are dynamically populated. | Default: `"Selecciona..."` (disabled). See **Dropdown: Parentesco** below. |
| 12 | **Especifica el parentesco** *(conditional)* | `a-parentesco-otro` / `a_parentesco_otro` | text | Si (when otro_familiar) | `req()`. Shown only when parentesco = `otro_familiar`. | `Ej. primo segundo, bisnieto, tio abuelo...` |
| 13 | **Describe brevemente el vinculo** *(conditional)* | `a-vinculo-detalle` / `a_vinculo_detalle` | textarea | Conditional | `req()`. `rows="2"`. Hidden when vinculo = `familiar` or `pareja` (except pareja→novio). Shown for amistad, laboral, otro, and pareja→novio. | `Ej. Somos amigos desde la universidad . Es sobrino de mi esposa . Trabajamos juntos en la misma empresa...` |
| 14 | **Desde hace cuanto se conocen?** *(conditional)* | (group) | — | Conditional | Both selects validated with `selReq()`. Hidden ONLY when vinculo = `familiar` AND parentesco is consanguineous. Shown for everything else (including all pareja types). | — |
| 14a | — Anos | `a-tiempo-anios` / `a_tiempo_anios` | select | Si | `selReq()`. | Default: `"Anos"` (disabled). |
| 14b | — Meses | `a-tiempo-meses` / `a_tiempo_meses` | select | Si | `selReq()`. | Default: `"Meses"` (disabled). |

### Dropdown: Vinculo con el viajero (`a-vinculo`)

| Value | Label |
|-------|-------|
| `familiar` | Familiar |
| `pareja` | Pareja |
| `amistad` | Amistad |
| `laboral` | Laboral |
| `otro` | Otro |

### Dropdown: Tipo de parentesco (`a-parentesco`)

Dynamically populated based on `a-vinculo` value. Label is always "El viajero es mi...".

**When vinculo = `familiar`** (17 options):

| Value | Label |
|-------|-------|
| `padre` | Padre / Madre |
| `hijo` | Hijo(a) |
| `hermano` | Hermano(a) |
| `abuelo` | Abuelo(a) |
| `nieto` | Nieto(a) |
| `bisabuelo` | Bisabuelo(a) |
| `tio` | Tio(a) |
| `sobrino` | Sobrino(a) |
| `primo` | Primo(a) |
| `suegro` | Suegro(a) |
| `yerno` | Yerno / Nuera |
| `cunado` | Cunado(a) |
| `concuno` | Concuno(a) |
| `padrastro` | Padrastro / Madrastra |
| `hijastro` | Hijastro(a) |
| `hermanastro` | Hermanastro(a) |
| `otro_familiar` | Otro familiar |

**When vinculo = `pareja`** (3 options):

| Value | Label |
|-------|-------|
| `conyuge` | Conyuge |
| `concubino` | Concubino/a (union libre) |
| `novio` | Novio / Novia |

**Consanguineous** (hide tiempo when selected): `padre`, `hijo`, `hermano`, `abuelo`, `nieto`, `bisabuelo`, `tio`, `sobrino`, `primo`.

**Non-consanguineous** (show tiempo): `suegro`, `yerno`, `cunado`, `concuno`, `padrastro`, `hijastro`, `hermanastro`, `otro_familiar`.

### Visibility rules

| Vinculo | Sub-type | Detalle? | Tiempo? |
|---------|----------|----------|---------|
| familiar (consanguineous) | padre, hijo, hermano, etc. | Hidden | Hidden |
| familiar (non-consanguineous) | suegro, cunado, etc. | Hidden | Shown |
| pareja → conyuge | — | Hidden | Shown |
| pareja → concubino | — | Hidden | Shown |
| pareja → novio | — | Shown | Shown |
| amistad / laboral / otro | — | Shown | Shown |

### Dropdown: Anos de conocerse (`a-tiempo-anios`)

| Value | Label |
|-------|-------|
| `0` | 0 anos |
| `1` | 1 ano |
| `2` -- `99` | 2 anos -- 99 anos |

### Dropdown: Meses de conocerse (`a-tiempo-meses`)

| Value | Label |
|-------|-------|
| `0` | 0 meses |
| `1` | 1 mes |
| `2` -- `11` | 2 meses -- 11 meses |

### Warnings / Hints (Paso 2)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Verifica que el pasaporte tenga al menos **6 meses de vigencia** a partir de la fecha de entrada a Mexico." (warn)
- **Residencia:** "Puede ser diferente a la nacionalidad." (hint)
- **Ocupacion:** "En el pais de residencia del viajero. La actividad profesional ayuda a demostrar motivos para regresar despues del viaje." (hint)
- **Vinculo detalle:** "Entre mas detalle, mas personalizada sera la carta." (warn)
- **Vinculo detalle (red note):** "Describe la relacion desde la perspectiva del anfitrion (quien firma la carta)." (warn, red)

### Upsell Note (Paso 2)
- "Viajan mas personas con el viajero? Con el Plan Completo se pueden incluir acompanantes en la misma carta de invitacion." Links to `formulario-completo.html`.

---

## Paso 3 — El viaje (Informacion sobre la estancia y alojamiento en Mexico)

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Motivo del viaje** | `j-motivo` / `j_motivo` | select | Si | `selReq()`. | Default: `"Selecciona el motivo principal"` (disabled). |
| 2 | **Actividades que realizara en Mexico** | `j-actividades` / `j_actividades` | textarea | Si | `req()`. `rows="3"`. | `Ej. Turismo en Ciudad de Mexico, visita a familiares en Guadalajara, asistencia a la boda del anfitrion y celebraciones correspondientes, recorridos culturales en Oaxaca...` |
| 3 | **El viajero se hospedara en la direccion del anfitrion?** | `aloj_es_anfitrion` (radio) | radio | Si | Must select one. | Values: `si` / `no`. Rendered as two radio cards. |

### Dropdown: Motivo del viaje (`j-motivo`)

| Value | Label |
|-------|-------|
| `turismo` | Turismo |
| `negocios` | Negocios |
| `estudios` | Estudios |
| `actividades_no_remuneradas` | Actividades no remuneradas |
| `transito` | Transito |
| `tratamientos_medicos` | Tratamientos medicos |

### Conditional: Alojamiento alternativo (shown when `aloj_es_anfitrion = "no"`)

Container: `#aloj-custom-container` (class `cond-fields`, toggles `open`). Controlled by `onAlojToggle()`.

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 4 | **Nombre del alojamiento** | `j-aloj-nombre` / `j_aloj_nombre` | text | No | Not validated. | `Hotel, Airbnb, casa particular...` |
| 5 | **Direccion del alojamiento en Mexico** | (group) | — | Si (conditional) | All sub-fields validated with `req()` / `selReq()`. | — |
| 5a | — Calle, numero e interior | `j-al-calle` / `j_al_calle` | text | Si | `req()`. | `Calle, numero e interior (si aplica)` |
| 5b | — Colonia | `j-al-colonia` / `j_al_colonia` | text | Si | `req()`. `capFirst()` on input. | `Colonia` |
| 5c | — Delegacion o Municipio | `j-al-delegacion` / `j_al_delegacion` | text | Si | `req()`. `capFirst()` on input. | `Delegacion o Municipio` |
| 5d | — Ciudad | `j-al-ciudad` / `j_al_ciudad` | text | Si | `req()`. `capFirst()` on input. | `Ciudad` |
| 5e | — Estado | `j-al-estado` / `j_al_estado` | select | Si | `selReq()`. | Same 32 states as anfitrion address. |
| 5f | — Codigo Postal | `j-al-cp` / `j_al_cp` | text | Si | `req()`. `upperAll()` on input. | `Codigo Postal` |

### Conditional Logic: Alojamiento toggle

| Selection | Behavior |
|-----------|----------|
| **Si** (hospeda en direccion del anfitrion) | `#aloj-custom-container` hidden. All custom address fields cleared. |
| **No** (alojamiento diferente) | `#aloj-custom-container` shown. Custom address fields become required. |

### Warnings / Hints (Paso 3)
- **Motivo del viaje:** "Esto determina el proposito que se indicara en la carta de invitacion." (hint) + "La estancia maxima para visitantes en Mexico es de 180 dias." (warn)
- **Actividades:** "Se lo mas especifico posible: incluye nombres de lugares, eventos, razones del viaje y cualquier detalle relevante. Mientras mas informacion se proporcione, mas completa sera la carta de invitacion." (warn)
- **Nombre del alojamiento:** "Se recomienda tener la reservacion a la mano para mostrar a la autoridad migratoria." (hint)

### Upsell Note (Paso 3)
- "El viajero visitara varias ciudades o tendra mas de un alojamiento? Con el Plan Completo se puede agregar un itinerario multi-destino con multiples alojamientos." Links to `formulario-completo.html`.

---

## Paso 4 — Gastos del viaje

### Info Note
- "Si el visitante cubre total o parcialmente sus propios gastos, se recomienda que pueda comprobar el equivalente de al menos **USD $50 por dia** con efectivo, estado de cuenta bancario o de tarjeta."

### Pregunta principal: Gastos a cargo del anfitrion?

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Hay algun gasto que sera a cargo del anfitrion?** | `gastos_anfitrion` (radio) | radio | Si | Must select one. | Values: `si` / `no`. Rendered as two radio cards. |

### Conditional: Detalle de gastos del anfitrion (shown when `gastos_anfitrion = "si"`)

Container: `#gastos-host-detail` (class `cond-fields`, toggles `open`). Controlled by `onGastosHostToggle()`.

**Warning box (red):** "Si el anfitrion asume alguno de los gastos, se debe anexar documentacion adicional de solvencia economica del anfitrion, como **estados de cuenta bancarios** o **recibos de nomina**, para demostrar que cuenta con los recursos para cubrir la estancia."

| # | Campo | Name | Tipo | Requerido | Validacion |
|---|-------|------|------|-----------|------------|
| 2 | **Cuales gastos seran cubiertos por el anfitrion?** | `gastos_host_conceptos` | checkbox (multiple) | Si (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `gastos_host_conceptos`:

| Value | Label |
|-------|-------|
| `alojamiento` | Alojamiento *(visible only when `aloj_es_anfitrion = "no"`)* |
| `alimentos` | Alimentos |
| `transporte` | Transporte |
| `actividades` | Actividades turisticas |
| `medicos` | Gastos medicos o emergencia |
| `otro` | Otro |

#### Conditional: "Otro" gasto text (shown when `otro` is checked)

Container: `#gastos-otro-container` (class `cond-fields`, toggles `open`). Controlled by `onGastosOtroToggle()`.

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Describe el gasto adicional | `gastos-otro-texto` / `gastos_otro_texto` | text | Si (when "otro" checked) | `Describe el gasto adicional...` |

### Medios de transporte del visitante en Mexico

| # | Campo | Name | Tipo | Requerido | Validacion |
|---|-------|------|------|-----------|------------|
| 3 | **Medios de transporte del visitante en Mexico** | `transporte_mx` | checkbox (multiple) | Si (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `transporte_mx`:

| Value | Label |
|-------|-------|
| `auto_rentado` | Auto rentado |
| `anfitrion` | Transporte del anfitrion |
| `transporte_publico` | Transporte publico y/o taxis |

---

## Paso 5 — Entrada y salida de Mexico

### Info Note
- "Se debe comprobar que se cuenta con reservacion para el viaje de regreso al momento del ingreso a Mexico."

### Ingreso a Mexico

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Como sera el ingreso a Mexico?** | `ingreso_tipo` (radio) | radio | Si | Must select one. | Three transport-type cards: Aereo / Terrestre / Maritimo. |
| 2 | **Fecha de llegada a Mexico** | `ing-fecha` / `ing_fecha` | date | Si | `dateReq()` — year between current and current+5. `data-dynamic-date="travel"`. | — |

#### Conditional fields by ingress type:

| Tipo | Fields shown | Container ID |
|------|-------------|-------------|
| **Aereo** (`aereo`) | Aeropuerto de ingreso, Aerolinea de llegada, Numero de vuelo | `#cond-ingreso-aereo` |
| **Terrestre** (`terrestre`) | Punto de cruce fronterizo | `#cond-ingreso-terrestre` |
| **Maritimo** (`maritimo`) | Puerto de ingreso | `#cond-ingreso-maritimo` |

##### Aereo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Aeropuerto de ingreso | `ing-aeropuerto` / `ing_aeropuerto` | text | Si (when aereo) | `Ej. AICM — Ciudad de Mexico` |
| Aerolinea de llegada | `ing-aerolinea` / `ing_aerolinea` | text | Si (when aereo) | `Ej. Avianca, LATAM...` |
| Numero de vuelo | `ing-vuelo` / `ing_vuelo` | text | Si (when aereo) | `Ej. AV204` |

##### Terrestre ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `ing-cruce` / `ing_cruce` | text | Si (when terrestre) | `Ej. Tijuana, Ciudad Juarez...` |

##### Maritimo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de ingreso | `ing-puerto` / `ing_puerto` | text | Si (when maritimo) | `Ej. Puerto de Veracruz` |

### Salida de Mexico

| # | Campo | ID / Name | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-----------|------|-----------|------------|----------------------|
| 1 | **Como sera la salida de Mexico?** | `salida_tipo` (radio) | radio | Si | Must select one. | Three transport-type cards: Aereo / Terrestre / Maritimo. |
| 2 | **Fecha de regreso** | `sal-fecha` / `sal_fecha` | date | Si | `dateReq()` — year between current and current+5. Must be >= `ing-fecha`. `data-dynamic-date="travel"`. | — |

#### Conditional fields by exit type:

| Tipo | Fields shown | Container ID |
|------|-------------|-------------|
| **Aereo** (`aereo`) | Aeropuerto de salida, Aerolinea de regreso, Numero de vuelo | `#cond-salida-aereo` |
| **Terrestre** (`terrestre`) | Punto de cruce fronterizo | `#cond-salida-terrestre` |
| **Maritimo** (`maritimo`) | Puerto de salida | `#cond-salida-maritimo` |

##### Aereo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Aeropuerto de salida | `sal-aeropuerto` / `sal_aeropuerto` | text | Si (when aereo) | `Ej. AICM — Ciudad de Mexico` |
| Aerolinea de regreso | `sal-aerolinea` / `sal_aerolinea` | text | Si (when aereo) | `Ej. Avianca, LATAM...` |
| Numero de vuelo | `sal-vuelo` / `sal_vuelo` | text | Si (when aereo) | `Ej. AV205` |

##### Terrestre salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `sal-cruce` / `sal_cruce` | text | Si (when terrestre) | `Ej. Nuevo Laredo, Reynosa...` |

##### Maritimo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de salida | `sal-puerto` / `sal_puerto` | text | Si (when maritimo) | `Ej. Puerto de Ensenada` |

### Date Cross-Validation (Paso 5)
- `sal-fecha` must be >= `ing-fecha`. Validated both on step submit and in real-time via `crossValidateDates()`.
- **180-day warning** (`#warn-180`): Non-blocking warning displayed when stay exceeds 180 days: "La estancia maxima para turismo en Mexico es de 180 dias."
- **Date coherence hint:** "Estas fechas deben coincidir exactamente con los boletos de avion o transporte del viajero. El agente migratorio verificara la coherencia." (warn)

---

## Paso 6 — Revision final

No new form fields. Displays a read-only summary of all data entered in Steps 1--5, built dynamically by `buildReview()`.

### CTA Box (appears twice — top and bottom of review)
- Text: "Todo correcto? Revisa los datos abajo y confirma para proceder al pago seguro. La carta PDF llegara al correo del viajero y del anfitrion en minutos."
- Security note: "Pago procesado por Stripe. No almacenamos datos de tarjeta."
- Buttons: "Volver y editar" (btn-back -> `goPrev(6)`) | "Confirmar y pagar . $5 USD" (btn-navy -> `goNext(6)`)

### Responsibility Note
- "Al generar esta carta, el anfitrion declara que la informacion proporcionada es veridica y se compromete a recibir al visitante durante las fechas indicadas. Es importante que toda la informacion coincida con lo que el viajero declare ante el agente migratorio."

### Review Cards Generated by `buildReview()`

5 review cards in this order:

1. **El anfitrion** — Nombre completo, Nacionalidad, Fecha de nacimiento (DD/MM/YYYY), Tipo de ID, N.o de ID, Domicilio en Mexico (concatenated with colonia, delegacion, ciudad, estado, CP), Telefono, Correo electronico, Ocupacion / cargo, Empresa.
2. **El viajero** — Nombre completo, Fecha de nacimiento (DD/MM/YYYY), Nacionalidad, N.o de pasaporte, Pais de residencia, Domicilio (concatenated), Ocupacion, Correo electronico, Vinculo con el viajero, Detalle del vinculo, Tiempo de conocerse.
3. **El viaje** — Motivo del viaje, Actividades, Alojamiento (either "Direccion del anfitrion" or custom address with optional name).
4. **Gastos** — Gastos a cargo del anfitrion (Si/No), Conceptos cubiertos (if Si, with labels including Alojamiento), Transporte en Mexico.
5. **Entrada y salida** — Tipo de ingreso, Detalle ingreso (airport.airline.flight or crossing/port), Fecha de llegada, Tipo de salida, Detalle salida, Fecha de regreso.

---

## Dropdown: Nacionalidad / Pais de residencia (used for `v-nacionalidad`, `v-residencia`, and `a-nacionalidad`)

Three dropdowns share the same country list, grouped by region:

### America Latina y el Caribe
Antigua y Barbuda, Argentina, Bahamas, Barbados, Belice, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Dominica, Ecuador, El Salvador, Granada, Guatemala, Guyana, Haiti, Honduras, Jamaica, Nicaragua, Panama, Paraguay, Peru, Republica Dominicana, San Cristobal y Nieves, San Vicente y las Granadinas, Santa Lucia, Surinam, Trinidad y Tobago, Uruguay, Venezuela

### Norteamerica
Canada, Estados Unidos

### Europa
Albania, Alemania, Andorra, Austria, Belgica, Bielorrusia, Bosnia y Herzegovina, Bulgaria, Chipre, Ciudad del Vaticano, Croacia, Dinamarca, Eslovaquia, Eslovenia, Espana, Estonia, Finlandia, Francia, Grecia, Hungria, Irlanda, Islandia, Italia, Kosovo, Letonia, Liechtenstein, Lituania, Luxemburgo, Malta, Moldavia, Monaco, Montenegro, Noruega, Paises Bajos, Polonia, Portugal, Reino Unido, Republica Checa, Rumania, Rusia, San Marino, Serbia, Suecia, Suiza, Ucrania

### Africa
Argelia, Angola, Benin, Botsuana, Burkina Faso, Burundi, Cabo Verde, Camerun, Chad, Comoras, Congo, Costa de Marfil, Egipto, Eritrea, Etiopia, Gabon, Gambia, Ghana, Guinea, Guinea Ecuatorial, Guinea-Bisau, Kenia, Lesoto, Liberia, Libia, Madagascar, Malaui, Mali, Marruecos, Mauricio, Mauritania, Mozambique, Namibia, Niger, Nigeria, Republica Centroafricana, Republica Democratica del Congo, Ruanda, Santo Tome y Principe, Senegal, Seychelles, Sierra Leona, Somalia, Sudafrica, Sudan, Sudan del Sur, Suazilandia, Tanzania, Togo, Tunez, Uganda, Yibuti, Zambia, Zimbabue

### Asia y Medio Oriente
Afganistan, Arabia Saudita, Armenia, Azerbaiyan, Banglades, Brunei, Butan, Camboya, Catar, China, Corea del Norte, Corea del Sur, Emiratos Arabes Unidos, Filipinas, Georgia, India, Indonesia, Irak, Iran, Israel, Japon, Jordania, Kazajistan, Kirguistan, Kuwait, Laos, Libano, Malasia, Maldivas, Mongolia, Myanmar, Nepal, Oman, Pakistan, Palestina, Singapur, Siria, Sri Lanka, Tailandia, Tayikistan, Timor Oriental, Turkmenistan, Turquia, Uzbekistan, Vietnam, Yemen

### Oceania
Australia, Fiyi, Islas Marshall, Islas Salomon, Kiribati, Micronesia, Nauru, Nueva Zelanda, Palaos, Papua Nueva Guinea, Samoa, Tonga, Tuvalu, Vanuatu

---

## Dropdown: Estados de Mexico (used for `a-estado`, `j-al-estado`)

32 states: Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de Mexico, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, Mexico, Michoacan, Morelos, Nayarit, Nuevo Leon, Oaxaca, Puebla, Queretaro, Quintana Roo, San Luis Potosi, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatan, Zacatecas

---

## Payment Flow (Stripe Integration)

1. User clicks "Confirmar y pagar . $5 USD" on Step 6.
2. `goNext(6)` calls `submitToAPI()`.
3. Button is disabled and shows "Procesando..." spinner.
4. `collectFormData()` gathers all form values into a JSON object (text/select/textarea by ID, radios by name, checkboxes as arrays by name).
5. **Email selection logic:** Always uses `a-email` (anfitrion's email) for the Stripe checkout email. No perspectiva-based logic.
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
- iOS-style drum/wheel picker with three scrollable columns: Day, Month (Ene--Dic), Year.
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
| `a-vinculo` select | `= "familiar"` | Show `#parentesco-wrapper` (parentesco dropdown), make required |
| `a-vinculo` select | `!= "familiar"` | Hide `#parentesco-wrapper`, reset value, remove required |
| `a-parentesco` select | `= "otro_familiar"` | Show `#parentesco-otro-wrapper` (text input), make required |
| `a-parentesco` select | `!= "otro_familiar"` | Hide `#parentesco-otro-wrapper`, clear value |
| `a-parentesco` select | consanguineous value | Hide `#tiempo-wrapper` (anos/meses), remove required |
| `a-parentesco` select | non-consanguineous value | Show `#tiempo-wrapper`, make required |

All conditional containers use CSS class `cond-fields` with `max-height: 0; overflow: hidden; opacity: 0` (hidden) and `cond-fields.open` with `max-height: 800px; opacity: 1` (visible), animated via CSS transitions.

**Removed conditional logic:**
- No `a-perspectiva` select exists. The `#parentesco-label` is always "El viajero es mi..." and never toggles.

---

## Review Label Maps (used in `buildReview()`)

### `TIPO_INGSAL`
```js
{ aereo: 'Aereo', terrestre: 'Terrestre', maritimo: 'Maritimo' }
```

### `TRANSPORTE_LABELS`
```js
{ auto_rentado: 'Auto rentado', anfitrion: 'Transporte del anfitrion', transporte_publico: 'Transporte publico y/o taxis' }
```

### Gastos conceptos labels (inline in `buildReview()`)
```js
alojamiento -> 'Alojamiento'
alimentos -> 'Alimentos'
transporte -> 'Transporte'
actividades -> 'Actividades turisticas'
medicos -> 'Gastos medicos o emergencia'
otro -> 'Otro: {text}' or 'Otro'
```

---

## UI / Design Notes

- **Fonts:** Cormorant Garamond (headings, price) + DM Sans (body, inputs).
- **Colors:** Navy `#1B3566`, Gold `#C9A84C`, Cream `#FAF8F4`, Mid `#4A6FA5`.
- **Input styling:** 16px font (prevents iOS zoom), 1.5px border, 10px border-radius. Focus: gold border + gold box-shadow. Error: red border + red box-shadow.
- **Buttons:** `btn-gold` (primary continue), `btn-navy` (final CTA), `btn-back` (back navigation). Min-height 52px. Hover: translateY(-2px) + shadow.
- **Accessibility:** Skip-to-content link, `aria-label` on logo, `aria-hidden="true"` on decorative SVGs, `focus-visible` outlines.
- **Trust indicators (sidebar):** HTTPS secure, PDF ready in minutes, 2,400+ cartas generated, 4.9 stars.
- **Footer links:** Privacidad, Terminos, "Conexion segura HTTPS".
- **Grain texture:** SVG noise filter overlay on sidebar card.

---

*Fuentes: Embajada de Mexico en Argentina (INM/SRE) . DIAM S.C. Abogados Migratorios . Migrans MX Guia 2025*
