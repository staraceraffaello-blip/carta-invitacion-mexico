# Formulario — Carta de Invitacion para Visitantes a Mexico
## Plan Completo

> Este formulario incluye todos los campos del Plan Esencial mas: acompanantes (viajeros adicionales), itinerario multi-ciudad con multiples alojamientos, y ciudades y actividades planeadas.
>
> Formulario de 5 pasos + revision final. Precio: **$9 USD**. Archivo: `formulario-completo.html`.

---

## Overview

- Multi-step form (`#main-form`) with 5 sections, HTML attribute `novalidate` (JS-driven validation).
- Steps are `<section>` elements (`#step-1` through `#step-5`), toggled via `.form-step.active`.
- Step transitions animate with `stepIn` keyframe (opacity + translateY).
- Sidebar (desktop) shows step progress with numbered dots (pending / active / done states); completed steps become clickable for navigation.
- Mobile shows a progress bar (`mob-progress-track` / `mob-progress-fill`) with label "Paso N de 5 — Title".
- Form data is saved to `localStorage` key `carta_form_completo` (with `version: 2`) before Stripe redirect and restored on page load. On restore, if the saved version is not `2`, old data is cleared.
- Hash parameter `#step=N` allows returning to a specific step (used by Stripe cancel redirect).
- GA4 tracking: `G-3W7EBYNBQ1`.
- Page is `noindex, nofollow`.
- **Step structure (5 steps)**:
  - Step 1: El anfitrion (personal data only)
  - Step 2: Los viajeros (Viajero 1 mandatory + additional viajeros dynamically added)
  - Step 3: Itinerario, entrada y salida
  - Step 4: Gastos
  - Step 5: Revision final
- **No perspectiva field**: The `a-perspectiva` field has been removed. All descriptions are always from the host's (anfitrion's) perspective. There is no inversion logic.

---

## Paso 1 — El anfitrion (Mexicano/a o residente en Mexico que firmara la carta)

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del anfitrion** | `a_nombre` / `a-nombre` | text | Si | `nameReq()`. `titleCase()` on input. | `Ej. Maria Elena Garcia Torres` |
| 2 | **Sexo del anfitrion** | `a_genero` | radio | Si | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (portador/portadora). |
| 3 | **Nacionalidad del anfitrion** | `a_nacionalidad` / `a-nacionalidad` | select | Si | `selReq()`. | Default: `"Selecciona la nacionalidad"` (disabled). Same country list as `v-nacionalidad`, with "Mexicana" included in America Latina. |
| 4 | **Fecha de nacimiento** | `a_nacimiento` / `a-nacimiento` | date | Si | `dateReq()` — year 1900 to current. `data-dynamic-date="birth"`. `min="1900-01-01"`. | — |
| 5 | **Tipo de identificacion oficial** | `a_id_tipo` / `a-id-tipo` | select | Si | `selReq()`. | Default: `"Selecciona el tipo"` (disabled). |
| 6 | **Numero de identificacion** | `a_id_num` / `a-id-num` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Numero que aparece en la identificacion del anfitrion` |
| 7 | **Domicilio en Mexico** | (group) | — | Si | All sub-fields validated. | — |
| 7a | — Calle, numero e interior | `a_calle` / `a-calle` | text | Si | `req()`. `autocomplete="off"`. | `Calle, numero e interior (si aplica)` |
| 7b | — Colonia | `a_colonia` / `a-colonia` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Colonia` |
| 7c | — Delegacion o Municipio | `a_delegacion` / `a-delegacion` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Delegacion o Municipio` |
| 7d | — Ciudad | `a_ciudad` / `a-ciudad` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7e | — Estado | `a_estado` / `a-estado` | select | Si | `selReq()`. | Default: `"Estado"` (disabled). See **Dropdown: Estados de Mexico** below. |
| 7f | — Codigo Postal | `a_cp` / `a-cp` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Codigo Postal` |
| 8 | **Telefono de contacto** | `a_telefono` / `a-telefono` | tel | Si | `phoneReq()` — exactly 10 digits. Auto-formatted `XX XXXX XXXX` on input. `maxlength="12"`. `autocomplete="tel"`. | `55 1234 5678` |
| 9 | **Correo electronico del anfitrion** | `a_email` / `a-email` | email | Si | `emailReq()`. `autocomplete="email"`. | `anfitrion@ejemplo.com` |
| 10 | **Ocupacion o cargo del anfitrion** | `a_ocupacion` / `a-ocupacion` | text | Si | `req()`. | `Ej. Ingeniero, Gerente, Medico, Profesor...` |
| 11 | **Empresa o lugar de trabajo** | `a_empresa` / `a-empresa` | text | No | Not validated. | `Ej. Pemex, Grupo Bimbo, Hospital Angeles, Independiente...` (labeled "(opcional)") |

**Note**: This step contains ONLY the anfitrion's personal data. The vinculo fields are in Step 2, within each viajero's section.

### Dropdown: Tipo de identificacion oficial (`a-id-tipo`)

| Value | Label |
|-------|-------|
| `pasaporte` | Pasaporte mexicano |
| `ine` | INE |
| `residente` | Tarjeta de residente |

### Warnings / Hints (Paso 1)
- **Nombre:** "Tal como aparece en la identificacion oficial." (warn)
- **Nacionalidad:** "La nacionalidad del anfitrion ayuda a determinar la capacidad de respaldar al visitante." (hint)
- **Nacimiento:** "El anfitrion debe ser mayor de edad (18 anos o mas)." (hint)
- **Tipo de ID:** "Se debera anexar copia de esta identificacion a la carta de invitacion." (warn)
- **Domicilio:** "Se recomienda anexar a la carta de invitacion un comprobante de domicilio del anfitrion con antiguedad no mayor a 3 meses." (warn)
- **Telefono:** "10 digitos sin LADA internacional." (hint) + "Migracion puede llamar a este numero exactamente al momento del arribo del visitante. Es fundamental que el anfitrion este disponible en este numero durante las fechas del viaje." (warn)
- **Email:** "Un correo de contacto que aparecera en la carta." (hint)
- **Ocupacion:** "Esto ayuda a demostrar estabilidad y respaldo economico ante migracion." (hint)

---

## Paso 2 — Los viajeros (Datos de las personas que visitaran Mexico)

This step combines the primary traveler (Viajero 1) and any additional travelers into a single step. The section heading is "Los viajeros".

### Viajero 1 (mandatory, non-removable card)

Card title: "Viajero 1 (principal)" — displayed with gold accent styling.

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del viajero** | `v_nombre` / `v-nombre` | text | Si | `nameReq()` — non-empty + must contain a space (nombre y apellidos). `titleCase()` on input. | `Ej. Juan Carlos Perez Lopez` |
| 2 | **Sexo del viajero** | `v_genero` | radio | Si | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (invitado/invitada). |
| 3 | **Fecha de nacimiento** | `v_nacimiento` / `v-nacimiento` | date | Si | `dateReq()` — year between 1900 and current year. `min="1900-01-01"`, `data-dynamic-date="birth"`. | Mobile: custom drum/wheel picker (DD/MM/AAAA). |
| 4 | **Nacionalidad** | `v_nacionalidad` / `v-nacionalidad` | select | Si | `selReq()`. | Default: `"La que aparece en el pasaporte del viajero"` (disabled). See **Dropdown: Paises** below. |
| 5 | **Numero de pasaporte** | `v_pasaporte` / `v-pasaporte` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 6 | **Pais de residencia** | `v_residencia` / `v-residencia` | select | Si | `selReq()`. | Default: `"Donde reside el viajero actualmente"` (disabled). Same country list as Nacionalidad. |
| 7 | **Domicilio completo en pais de residencia** | (group) | — | Si | All sub-fields validated with `req()`. | — |
| 7a | — Calle, numero, e interior | `v_calle` / `v-calle` | text | Si | `req()`. `autocomplete="off"`. | `Calle, numero, e interior (si aplica)` |
| 7b | — Ciudad | `v_ciudad` / `v-ciudad` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7c | — Provincia / Estado / Region | `v_provincia` / `v-provincia` | text | Si | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Region` |
| 7d | — Codigo Postal | `v_cp` / `v-cp` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Codigo Postal` |
| 8 | **Actividad profesional u ocupacion** | `v_ocupacion` / `v-ocupacion` | text | Si | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante...` |
| 9 | **Correo electronico** | `v_email` / `v-email` | email | Si | `emailReq()` — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Whitespace stripped on input. Validated on blur. `autocomplete="email"`. | `nombre@correo.com` |

#### Viajero 1: Vinculo fields (after personal data)

These fields describe the relationship between the anfitrion and Viajero 1. They are always written from the anfitrion's perspective (a red note reminds: "Describe la relacion desde la perspectiva del anfitrion (quien firma la carta)").

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 10 | **Vinculo con el anfitrion** | `a_vinculo` / `a-vinculo` | select | Si | `selReq()`. | Default: `"Selecciona el vinculo"` (disabled). Label: "Vinculo con el anfitrion". |
| 11 | **Tipo de parentesco** *(conditional)* | `a_parentesco` / `a-parentesco` | select | Si (when familiar or pareja) | `selReq()`. Shown when vinculo = `familiar` (17 family options) or `pareja` (3 partner options). Options dynamically populated. | Default: `"Selecciona..."` (disabled). See **Dropdown: Parentesco** in esencial doc. |
| 12 | **Especifica el parentesco** *(conditional)* | `a_parentesco_otro` / `a-parentesco-otro` | text | Si (when otro_familiar) | `req()`. Shown only when parentesco = `otro_familiar`. | `Ej. primo segundo, bisnieto, tio abuelo...` |
| 13 | **Describe brevemente el vinculo** *(conditional)* | `a_vinculo_detalle` / `a-vinculo-detalle` | textarea | Conditional | `req()`. `rows="2"`. Hidden for familiar and pareja (except pareja→novio). Shown for amistad, laboral, otro, and pareja→novio. | `Ej. Somos amigos desde la universidad . Es sobrino de mi esposa . Trabajamos juntos en la misma empresa...` |
| 14 | **Desde hace cuanto se conocen?** *(conditional)* | (group) | — | Conditional | Both selects validated with `selReq()`. Hidden ONLY when vinculo = `familiar` AND parentesco is consanguineous. Shown for everything else (including all pareja types). | — |
| 14a | — Anos | `a_tiempo_anios` / `a-tiempo-anios` | select | Si | `selReq()`. | Default: `"Anos"` (disabled). |
| 14b | — Meses | `a_tiempo_meses` / `a-tiempo-meses` | select | Si | `selReq()`. | Default: `"Meses"` (disabled). |

### Warnings / Hints (Viajero 1)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Verifica que el pasaporte tenga al menos **6 meses de vigencia** a partir de la fecha de entrada a Mexico." (warn)
- **Residencia:** "Puede ser diferente a la nacionalidad." (hint)
- **Ocupacion:** "En el pais de residencia del viajero. La actividad profesional ayuda a demostrar motivos para regresar despues del viaje." (hint)
- **Vinculo detalle:** "Entre mas detalle, mas personalizada sera la carta." (warn)
- **Vinculo detalle (red note):** "Describe la relacion desde la perspectiva del anfitrion (quien firma la carta)." (warn, red)

### Additional Viajeros (optional, dynamically added)

Button: **"Agregar viajero"** (`addCompanion()`)

Companion cards are titled "Viajero N" where N starts at 2 (e.g., "Viajero 2", "Viajero 3", etc.). Each card can be removed via a delete button.

#### Campos por cada viajero adicional (template `#companion-tpl`)

| # | Campo | Class / `name` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|----------------|------|-----------|------------|----------------------|
| 1 | **Nombre completo** | `.companion-nombre` / `comp_nombre[]` | text | Si | `nameReq()` — non-empty + space. `titleCase()` on input. | `Ej. Juan Carlos Perez Lopez` |
| 2 | **Sexo** | `comp_genero_N` | radio | Si | Must select one. Name is unique per card (`comp_genero_0`, `comp_genero_1`, etc.). | Values: `masculino` / `femenino`. Inline radio buttons. |
| 3 | **Fecha de nacimiento** | `.companion-nacimiento` / `comp_nacimiento[]` | date | Si | `dateReq()` — year 1900 to current. `min="1900-01-01"`, `data-dynamic-date="birth"`. | — |
| 4 | **Nacionalidad** | `.companion-nacionalidad` / `comp_nacionalidad[]` | select | Si | `selReq()`. | Default: `"La que aparece en su pasaporte"` (disabled). Dropdown con paises agrupados por region. |
| 5 | **Numero de pasaporte** | `.companion-pasaporte` / `comp_pasaporte[]` | text | Si | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 6 | **Mismo domicilio de residencia que el viajero principal?** | `comp_mismo_domicilio[]` | radio | Si | Must select one. Default: Si. | Values: `si` / `no`. |
| 7 | **Actividad profesional u ocupacion** | `.companion-ocupacion` / `comp_ocupacion[]` | text | Si | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante...` |

##### Conditional: Domicilio diferente (shown when `comp_mismo_domicilio = "no"`)

| # | Campo | Class / `name` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|----------------|------|-----------|------------|----------------------|
| 6a | **Pais de residencia** | `.companion-residencia` / `comp_residencia[]` | select | Si (if no) | `selReq()`. | Default: `"Selecciona el pais"` (disabled). |
| 6b | **Calle, numero, e interior** | `.companion-calle` / `comp_calle[]` | text | Si (if no) | `req()`. `autocomplete="off"`. | `Calle, numero, e interior (si aplica)` |
| 6c | **Ciudad** | `.companion-ciudad` / `comp_ciudad[]` | text | Si (if no) | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 6d | **Provincia / Estado / Region** | `.companion-provincia` / `comp_provincia[]` | text | Si (if no) | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Region` |
| 6e | **Codigo Postal** | `.companion-cp` / `comp_cp[]` | text | Si (if no) | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Codigo Postal` |

##### Vinculo fields per additional viajero

Each additional viajero has its own full vinculo system, identical in structure to Viajero 1's vinculo fields. All from the anfitrion's perspective with a red note reminder.

| # | Campo | Class | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|-------|------|-----------|------------|----------------------|
| 8 | **Vinculo con el anfitrion** | `.companion-vinculo` | select | Si | Must select a value. | Same options as `a-vinculo`: familiar, pareja, amistad, laboral, otro. |
| 9 | **Tipo de parentesco** *(conditional)* | `.companion-parentesco` | select | Si (when familiar or pareja) | Must select a value. Shown when vinculo = `familiar` (17 options) or `pareja` (3 options). Dynamically populated. Label: "El viajero es mi..." |
| 10 | **Especifica el parentesco** *(conditional)* | `.companion-parentesco-otro` | text | Si (when otro_familiar) | `req()`. | `Ej. primo segundo, bisnieto, tio abuelo...` |
| 11 | **Describe brevemente el vinculo** *(conditional)* | `.companion-vinculo-detalle` | textarea | Conditional | `req()`. `rows="2"`. Hidden for familiar and pareja (except novio). Shown for amistad, laboral, otro, and pareja→novio. | `Ej. Es sobrino de mi esposa . Es amigo de la infancia . Trabajamos juntos...` |
| 12 | **Desde hace cuanto se conocen?** *(conditional)* | (group) | — | Conditional | Hidden ONLY when vinculo = `familiar` AND parentesco is consanguineous. Shown for everything else. | — |
| 12a | — Anos | `.companion-tiempo-anios` | select | Si | Must select a value. | Same 0--99 anos. |
| 12b | — Meses | `.companion-tiempo-meses` | select | Si | Must select a value. | Same 0--11 meses. |

### Warnings / Hints (Additional Viajeros)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Min. 6 meses de vigencia desde la entrada." (warn)
- **Vinculo detalle (red note):** "Describe la relacion desde la perspectiva del anfitrion (quien firma la carta)." (warn, red)

---

## Paso 3 — Itinerario, entrada y salida *(exclusivo Plan Completo)*

### Info Note
- "Se debe comprobar que se cuenta con reservacion para el viaje de regreso al momento del ingreso a Mexico."

### Motivo del viaje

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| — | **Motivo del viaje** | `j_motivo` / `j-motivo` | select | Si | `selReq()`. | Default: `"Selecciona el motivo principal"` (disabled). |

#### Dropdown: Motivo del viaje (`j-motivo`)

| Value | Label |
|-------|-------|
| `turismo` | Turismo |
| `negocios` | Negocios |
| `estudios` | Estudios |
| `actividades_no_remuneradas` | Actividades no remuneradas |
| `transito` | Transito |
| `tratamientos_medicos` | Tratamientos medicos |

Hints:
- "Esto determina el proposito que se indicara en la carta de invitacion." (hint)
- "La estancia maxima para visitantes en Mexico es de 180 dias." (warn)

### Ingreso a Mexico

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Como sera el ingreso a Mexico?** | `ingreso_tipo` (radio) | radio | Si | Must select one. | Three transport-type cards: Aereo / Terrestre / Maritimo. |
| 2 | **Fecha de llegada a Mexico** | `ing_fecha` / `ing-fecha` | date | Si | `dateReq()` — year between current and current+5. `data-dynamic-date="travel"`. | — |

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
| Numero de vuelo | `ing-vuelo` / `ing_vuelo` | text | Si (when aereo) | `Ej. AV204`. `upperAll()` on input. |

##### Terrestre ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `ing-cruce` / `ing_cruce` | text | Si (when terrestre) | `Ej. Tijuana, Ciudad Juarez...` |

##### Maritimo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de ingreso | `ing-puerto` / `ing_puerto` | text | Si (when maritimo) | `Ej. Puerto de Veracruz` |

### Destinos del itinerario *(repetible — agregar un bloque por cada ciudad o destino)*

Badge: "Exclusivo Plan Completo"

One destino is auto-added on page load. Button: **"Agregar destino"** (`addDestino()`)

#### Destino N (template `#destino-tpl`)

| # | Campo | `name` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 1 | **Ciudad** | `dest_ciudad[]` | text | Si | `req()`. `capFirst()` on input. | `Ej. Ciudad de Mexico, CDMX` |
| 2 | **Actividades planeadas en este destino** | `dest_actividades[]` | textarea | Si | `req()`. `rows="2"`. | `Ej. Turismo cultural, visita a museos, asistencia a la boda del anfitrion y celebraciones correspondientes, recorrido gastronomico...` |
| 3 | **El alojamiento es la direccion del anfitrion?** | `dest_aloj_es_anfitrion[]` | radio | Si | Must select one. | Values: `si` / `no`. |

##### Conditional: Custom accommodation (shown when `dest_aloj_es_anfitrion = "no"`)

| # | Campo | `name` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 3a | **Nombre del alojamiento** | `dest_aloj_nombre[]` | text | No | Not validated. | `Hotel, Airbnb, casa particular...` (labeled "(si aplica, llenar solo en caso de ser hotel)") |
| 3b | **Calle, numero e interior** | `dest_aloj_calle[]` | text | Si (if no) | `req()`. | `Calle, numero e interior (si aplica)` |
| 3c | **Colonia** | `dest_aloj_colonia[]` | text | Si (if no) | `req()`. `capFirst()` on input. | `Colonia` |
| 3d | **Delegacion o Municipio** | `dest_aloj_delegacion[]` | text | Si (if no) | `req()`. `capFirst()` on input. | `Delegacion o Municipio` |
| 3e | **Ciudad** | `dest_aloj_ciudad[]` | text | Si (if no) | `req()`. `capFirst()` on input. | `Ciudad` |
| 3f | **Estado** | `dest_aloj_estado[]` | select | Si (if no) | `selReq()`. | 32 Mexican states dropdown. |
| 3g | **Codigo Postal** | `dest_aloj_cp[]` | text | Si (if no) | `req()`. `upperAll()` on input. | `Codigo Postal` |

| 4 | **Fechas de estadia en este destino** | — | date range | Si | — | — |
| 4a | — Llegada | `dest_fecha_desde[]` | date | Si | `dateReq()`. `data-dynamic-date="travel"`. | **Auto-synced and read-only**: Destino 1 arrival = `ing-fecha`; Destino N arrival = Destino N-1 departure. |
| 4b | — Salida | `dest_fecha_hasta[]` | date | Si | `dateReq()`. Must be >= arrival date. | Triggers `syncDestinoArrivalDates()` on change. |

### Warnings / Hints (Destinos)
- **Actividades:** "Se lo mas especifico posible: incluye nombres de lugares, eventos, razones del viaje y cualquier detalle relevante. Mientras mas informacion se proporcione, mas completa sera la carta de invitacion." (warn)
- **Nombre del alojamiento:** "Se recomienda tener la reservacion a la mano para mostrar a la autoridad migratoria." (hint)

### Salida de Mexico

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Como sera la salida de Mexico?** | `salida_tipo` (radio) | radio | Si | Must select one. | Three transport-type cards: Aereo / Terrestre / Maritimo. |
| 2 | **Fecha de regreso** | `sal_fecha` / `sal-fecha` | date | Si | `dateReq()` — year between current and current+5. Must be >= `ing-fecha`. Must equal last destino's `dest_fecha_hasta`. `data-dynamic-date="travel"`. | — |

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
| Numero de vuelo | `sal-vuelo` / `sal_vuelo` | text | Si (when aereo) | `Ej. AV205`. `upperAll()` on input. |

##### Terrestre salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `sal-cruce` / `sal_cruce` | text | Si (when terrestre) | `Ej. Nuevo Laredo, Reynosa...` |

##### Maritimo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de salida | `sal-puerto` / `sal_puerto` | text | Si (when maritimo) | `Ej. Puerto de Ensenada` |

### Date Cross-Validation (Paso 3)
- `sal-fecha` must be >= `ing-fecha`.
- `sal-fecha` must equal last destino's `dest_fecha_hasta`.
- Each destino's `dest_fecha_hasta` must be >= its `dest_fecha_desde`.
- **180-day warning** (`#warn-180`): Non-blocking warning displayed when stay exceeds 180 days: "La estancia maxima para turismo en Mexico es de 180 dias."
- **Date coherence hint:** "Estas fechas deben coincidir exactamente con los boletos de avion o transporte del viajero. El agente migratorio verificara la coherencia." (warn)

### Auto-sync: Destino arrival dates (`syncDestinoArrivalDates()`)
- **Destino 1** arrival (`dest_fecha_desde`) is auto-set to `ing-fecha` (arrival in Mexico).
- **Destino N** (N > 1) arrival is auto-set to the departure date of Destino N-1.
- All arrival dates are set to **read-only** (`readOnly = true`) with grey background.
- Syncing is triggered whenever: a destino is added/removed, a destino departure date changes, or `ing-fecha` changes.

---

## Paso 4 — Gastos del viaje

### Info Note
- "Si el visitante cubre total o parcialmente sus propios gastos, se recomienda que pueda comprobar el equivalente de al menos **USD $50 por dia** con efectivo, estado de cuenta bancario o de tarjeta."

### Pregunta principal: Gastos a cargo del anfitrion?

| # | Campo | `name` / `id` | Tipo | Requerido | Validacion |
|---|-------|---------------|------|-----------|------------|
| 1 | **Hay algun gasto que sera a cargo del anfitrion?** | `gastos_anfitrion` (radio) | radio | Si | Must select one. Values: `si` / `no`. |

### Conditional: Detalle de gastos del anfitrion (shown when `gastos_anfitrion = "si"`)

Container: `#gastos-host-detail` (class `cond-fields`, toggles `open`).

**Warning box (red):** "Si el anfitrion asume alguno de los gastos, se debe anexar documentacion adicional de solvencia economica del anfitrion, como **estados de cuenta bancarios** o **recibos de nomina**, para demostrar que cuenta con los recursos para cubrir la estancia."

| # | Campo | Name | Tipo | Requerido | Validacion |
|---|-------|------|------|-----------|------------|
| 2 | **Cuales gastos seran cubiertos por el anfitrion?** | `gastos_host_conceptos` | checkbox (multiple) | Si (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `gastos_host_conceptos`:

| Value | Label |
|-------|-------|
| `alojamiento` | Alojamiento *(visible only when any destino has `dest_aloj_es_anfitrion = "no"`)* |
| `alimentos` | Alimentos |
| `transporte` | Transporte |
| `actividades` | Actividades turisticas |
| `medicos` | Gastos medicos o emergencia |
| `otro` | Otro |

#### Conditional: "Otro" gasto text (shown when `otro` is checked)

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Describe el gasto adicional | `gastos-otro-texto` / `gastos_otro_texto` | text | Si (when "otro" checked) | `Describe el gasto adicional...` |

### Medios de transporte del visitante en Mexico

| # | Campo | Name | Tipo | Requerido | Validacion |
|---|-------|------|------|-----------|------------|
| 3 | **Medios de transporte en Mexico** | `transporte_mx` | checkbox (multiple) | Si (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `transporte_mx`:

| Value | Label |
|-------|-------|
| `avion` | Avion interno |
| `autobus_foraneo` | Autobus Foraneo |
| `auto_rentado` | Auto rentado |
| `anfitrion` | Transporte del anfitrion |
| `transporte_publico` | Transporte publico y/o taxis |

---

## Paso 5 — Revision final

No new form fields. Displays a read-only summary of all data entered in Steps 1--4, built dynamically by `buildReview()`.

### CTA Box (appears twice — top and bottom of review)
- Text: "Todo correcto? Revisa los datos abajo y confirma para proceder al pago seguro. La carta PDF llegara al correo del viajero y del anfitrion en minutos."
- Security note: "Pago procesado por Stripe. No almacenamos datos de tarjeta."
- Buttons: "Volver y editar" (btn-back -> `goPrev(5)`) | "Confirmar y pagar . $9 USD" (btn-navy -> `goNext(5)`)

### Responsibility Note
- "Al generar esta carta, el anfitrion declara que la informacion proporcionada es veridica y se compromete a recibir al visitante durante las fechas indicadas. Es importante que toda la informacion coincida con lo que el viajero declare ante el agente migratorio."

### Review Cards Generated by `buildReview()`

Review cards are rendered in this order:

1. **El anfitrion** — Nombre completo, Nacionalidad, Fecha de nacimiento (DD/MM/YYYY), Tipo de ID, N.o de ID, Domicilio en Mexico (concatenated with colonia, delegacion, ciudad, estado, CP), Telefono, Correo electronico, Ocupacion / cargo, Empresa.
2. **Viajero 1 (principal)** — Nombre completo, Fecha de nacimiento (DD/MM/YYYY), Nacionalidad, N.o de pasaporte, Pais de residencia, Domicilio (concatenated), Ocupacion, Correo electronico, Vinculo con el anfitrion, Detalle del vinculo, Tiempo de conocerse.
3. **Viajero N** (for each additional viajero, N starting at 2) — Nombre, Nacimiento, Nacionalidad, Pasaporte, Ocupacion, Domicilio (or "Mismo que el viajero principal"), Vinculo con el anfitrion, Detalle del vinculo, Tiempo de conocerse.
4. **Gastos** — Gastos a cargo del anfitrion (Si/No), Conceptos cubiertos (if Si, with labels including Alojamiento), Transporte en Mexico.
5. **Destino N — [Ciudad]** — For each destino: Ciudad, Actividades, Alojamiento (or "Direccion del anfitrion"), Direccion alojamiento, Llegada, Salida.
6. **Entrada y salida** — Motivo del viaje, Tipo de ingreso, Detalle ingreso (airport.airline.flight or crossing/port), Fecha de llegada, Tipo de salida, Detalle salida, Fecha de regreso.

---

## Dropdown: Paises (agrupados por region)

Used for: `v-nacionalidad`, `v-residencia`, `comp_nacionalidad[]`, `comp_residencia[]`, `a-nacionalidad`.

### America Latina y el Caribe
Antigua y Barbuda, Argentina, Bahamas, Barbados, Belice, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Dominica, Ecuador, El Salvador, Granada, Guatemala, Guyana, Haiti, Honduras, Jamaica, Mexico, Nicaragua, Panama, Paraguay, Peru, Republica Dominicana, San Cristobal y Nieves, San Vicente y las Granadinas, Santa Lucia, Surinam, Trinidad y Tobago, Uruguay, Venezuela

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

## Dropdown: Vinculo con el anfitrion (used for `a-vinculo` and `.companion-vinculo`)

| Value | Label |
|-------|-------|
| `familiar` | Familiar |
| `pareja` | Pareja |
| `amistad` | Amistad |
| `laboral` | Laboral |
| `otro` | Otro |

## Dropdown: Tipo de parentesco (used for `a-parentesco` and `.companion-parentesco`)

Shown only when vinculo = `familiar`. Label is always "El viajero es mi..." (no toggling, no perspectiva-based changes).

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

**Consanguineous** (hide tiempo when selected): `padre`, `hijo`, `hermano`, `abuelo`, `nieto`, `bisabuelo`, `tio`, `sobrino`, `primo`.

**Non-consanguineous** (show tiempo): `suegro`, `yerno`, `cunado`, `concuno`, `padrastro`, `hijastro`, `hermanastro`, `otro_familiar`.

**No PDF inversion**: Since the perspectiva field was removed, parentesco values are always from the anfitrion's perspective and are never inverted.

## Dropdown: Anos de conocerse

| Value | Label |
|-------|-------|
| `0` | 0 anos |
| `1` | 1 ano |
| `2` -- `99` | 2 anos -- 99 anos |

## Dropdown: Meses de conocerse

| Value | Label |
|-------|-------|
| `0` | 0 meses |
| `1` | 1 mes |
| `2` -- `11` | 2 meses -- 11 meses |

---

## Dropdown: Estados de Mexico (used for `a-estado`, `dest_aloj_estado[]`)

32 states: Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de Mexico, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, Mexico, Michoacan, Morelos, Nayarit, Nuevo Leon, Oaxaca, Puebla, Queretaro, Quintana Roo, San Luis Potosi, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatan, Zacatecas

---

## Payment Flow (Stripe Integration)

1. User clicks "Confirmar y pagar . $9 USD" on Step 5.
2. `goNext(5)` calls `submitToAPI()`.
3. Button is disabled and shows "Procesando..." spinner.
4. `collectFormData()` gathers all form values into a JSON object (text/select/textarea by ID, radios by name, checkboxes as arrays by name, plus companion and destino arrays).
5. **Email selection logic:** Always uses `a-email` (anfitrion's email) for the Stripe checkout email. No perspectiva-based logic.
6. POST to `/api/submit` with body: `{ plan: 'completo', email, formData }`.
7. Expects JSON response with `{ url }` (Stripe Checkout URL).
8. Saves form data to `localStorage` key `carta_form_completo` (with `version: 2` and current step number).
9. Redirects to `result.url` (Stripe Checkout).
10. On error: shows `alert()` with error message, re-enables button.

### collectFormData companion object structure

Each companion in the companions array includes:
```js
{
  nombre: '',
  genero: '',
  nacimiento: '',
  nacionalidad: '',
  pasaporte: '',
  mismo_domicilio: 'si' | 'no',
  residencia: '',       // only if mismo_domicilio = 'no'
  calle: '',            // only if mismo_domicilio = 'no'
  ciudad: '',           // only if mismo_domicilio = 'no'
  provincia: '',        // only if mismo_domicilio = 'no'
  cp: '',               // only if mismo_domicilio = 'no'
  ocupacion: '',
  vinculo: '',
  parentesco: '',
  parentesco_otro: '',
  vinculo_detalle: '',
  tiempo_anios: '',
  tiempo_meses: ''
}
```

### Stripe Cancel / Return Flow
- On page load, checks for `#step=N` hash parameter (e.g., `#step=5` from Stripe cancel).
- Restores form data from `localStorage` via `restoreFormData()`.
- On restore, validates `version === 2`. If version mismatch, clears localStorage and does not restore.
- `restoreFormData()` sets values by element ID, fires `input` and `change` events to trigger formatting and conditional logic, handles radio/checkbox arrays, and recreates companion/destino blocks.
- Syncs mobile date picker trigger values (DD/MM/YYYY format) with hidden date inputs.

---

## JavaScript Behavior Summary

### Text Transform Helpers
| Function | Behavior | Used on |
|----------|----------|---------|
| `titleCase(el)` | Capitalizes first letter of every word | `v-nombre`, `a-nombre`, companion nombres |
| `capFirst(el)` | Capitalizes first letter only | City/province/colonia fields, dest_ciudad[] |
| `upperAll(el)` | Converts entire value to uppercase | Passport numbers, ID number, postal codes, flight numbers |

### Validation Functions
| Function | Logic |
|----------|-------|
| `nameReq(id, errId)` | Non-empty AND contains at least one space. Custom error: "nombre(s) y apellidos completos". |
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
- Dynamically added fields (companions, destinos): validated via event delegation.

### Phone Auto-Format
Formats as `XX XXXX XXXX` (10 digits with spaces). `maxlength="12"`.

### Auto-Trim
- All text/email/textarea inputs: leading whitespace removed on `input`, full trim on `blur`.
- Applied via direct listeners and event delegation (covers dynamic fields).

### Mobile Date Picker
- Activated only on screens <= 639px width (`matchMedia`).
- Converts all `<input type="date">` into hidden inputs + visible readonly trigger inputs with `DD/MM/AAAA` placeholder.
- iOS-style drum/wheel picker with three scrollable columns: Day, Month (Ene--Dic), Year.
- Year range determined by `data-dynamic-date` attribute:
  - `birth`: 1920 to current year (default selection: 1990).
  - `travel`: current year to current year + 5 (default selection: today).
- Day column auto-adjusts for month/year changes (e.g., February leap year).
- Dynamically added date inputs (companions, destinos) are converted via `window._dpConvert`.

### Dynamic Date Constraints
Set on page load via IIFE:
- `data-dynamic-date="travel"` inputs: `min` = `{currentYear}-01-01`, `max` = `{currentYear+5}-12-31`.
- `data-dynamic-date="birth"` inputs: `max` = `{currentYear}-12-31`.

### localStorage Persistence
- Key: `carta_form_completo`
- Saved before Stripe redirect: `{ version: 2, formData: {...}, step: N }`
- Restored on page load if present (including companion/destino recreation).
- On restore, if `version !== 2`, old data is cleared (`localStorage.removeItem`).
- Hash `#step=N` overrides saved step number.

---

## Conditional Logic Summary

| Trigger | Condition | Fields Shown / Hidden |
|---------|-----------|----------------------|
| `comp_mismo_domicilio[]` radio | `= "no"` | Show companion address fields (country, street, city, province, CP) |
| `comp_mismo_domicilio[]` radio | `= "si"` | Hide companion address fields, clear values |
| `.companion-vinculo` select | `= "familiar"` | Show `.companion-parentesco-wrapper`, make required |
| `.companion-vinculo` select | `!= "familiar"` | Hide `.companion-parentesco-wrapper`, reset value |
| `.companion-parentesco` select | `= "otro_familiar"` | Show `.companion-parentesco-otro-wrapper`, make required |
| `.companion-parentesco` select | `!= "otro_familiar"` | Hide `.companion-parentesco-otro-wrapper`, clear value |
| `.companion-parentesco` select | consanguineous value | Hide `.companion-tiempo-wrapper`, remove required |
| `.companion-parentesco` select | non-consanguineous value | Show `.companion-tiempo-wrapper`, make required |
| `dest_aloj_es_anfitrion[]` radio | `= "no"` | Show destino accommodation fields (name, street, colonia, delegacion, city, state, CP) |
| `dest_aloj_es_anfitrion[]` radio | `= "si"` | Hide destino accommodation fields, clear values |
| `dest_aloj_es_anfitrion[]` radio (any) | any `= "no"` | Show `#gasto-alojamiento-card` checkbox in gastos via `syncAlojGastoVisibility()` |
| `dest_aloj_es_anfitrion[]` radio (all) | all `= "si"` | Hide `#gasto-alojamiento-card`, uncheck it |
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
- No `a-perspectiva` select exists. The parentesco labels are always "El viajero es mi..." and never toggle.

---

## Review Label Maps (used in `buildReview()`)

### `TIPO_INGSAL`
```js
{ aereo: 'Aereo', terrestre: 'Terrestre', maritimo: 'Maritimo' }
```

### `TRANSPORTE_LABELS`
```js
{ avion: 'Avion interno', autobus_foraneo: 'Autobus Foraneo', auto_rentado: 'Auto rentado', anfitrion: 'Transporte del anfitrion', transporte_publico: 'Transporte publico y/o taxis' }
```

### `VINCULO_LABELS` (used in companion review)
```js
{ familiar: 'Familiar', pareja: 'Pareja', amistad: 'Amistad', laboral: 'Laboral', otro: 'Otro' }
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
