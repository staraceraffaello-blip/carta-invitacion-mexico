# Formulario — Carta de Invitación para Visitantes a México
## Plan Completo

> Este formulario incluye todos los campos del Plan Esencial más: acompañantes, itinerario multi-ciudad con múltiples alojamientos, y ciudades y actividades planeadas.
>
> Formulario de 6 pasos + revisión final. Precio: **$9 USD**. Archivo: `formulario-completo.html`.

---

## Overview

- Multi-step form (`#main-form`) with 6 sections, HTML attribute `novalidate` (JS-driven validation).
- Steps are `<section>` elements (`#step-1` through `#step-6`), toggled via `.form-step.active`.
- Step transitions animate with `stepIn` keyframe (opacity + translateY).
- Sidebar (desktop) shows step progress with numbered dots (pending / active / done states); completed steps become clickable for navigation.
- Mobile shows a progress bar (`mob-progress-track` / `mob-progress-fill`) with label "Paso N de 6 — Title".
- Form data is saved to `localStorage` key `carta_form_completo` before Stripe redirect and restored on page load.
- Hash parameter `#step=N` allows returning to a specific step (used by Stripe cancel redirect).
- GA4 tracking: `G-3W7EBYNBQ1`.
- Page is `noindex, nofollow`.
- **Note**: The HTML section order is: step-1, step-2, step-3, step-5, step-4, step-6. However the sidebar and navigation use the logical order 1→2→3→4→5→6 where Step 4 = Itinerario and Step 5 = Gastos.

---

## Paso 1 — El viajero (Información del extranjero que visitará México)

| # | Campo | `name` / `id` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del viajero** | `v_nombre` / `v-nombre` | text | Sí | `nameReq()` — non-empty + must contain a space (nombre y apellidos). `titleCase()` on input. | `Ej. Juan Carlos Pérez López` |
| 2 | **Sexo del viajero** | `v_genero` | radio | Sí | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (invitado/invitada). |
| 3 | **Fecha de nacimiento** | `v_nacimiento` / `v-nacimiento` | date | Sí | `dateReq()` — year between 1900 and current year. `min="1900-01-01"`, `data-dynamic-date="birth"`. | Mobile: custom drum/wheel picker (DD/MM/AAAA). |
| 4 | **Nacionalidad** | `v_nacionalidad` / `v-nacionalidad` | select | Sí | `selReq()`. | Default: `"La que aparece en el pasaporte del viajero"` (disabled). See **Dropdown: Países** below. |
| 5 | **Número de pasaporte** | `v_pasaporte` / `v-pasaporte` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 6 | **País de residencia** | `v_residencia` / `v-residencia` | select | Sí | `selReq()`. | Default: `"Donde reside el viajero actualmente"` (disabled). Same country list as Nacionalidad. |
| 7 | **Domicilio completo en país de residencia** | (group) | — | Sí | All sub-fields validated with `req()`. | — |
| 7a | — Calle, número, e interior | `v_calle` / `v-calle` | text | Sí | `req()`. `autocomplete="off"`. | `Calle, número, e interior (si aplica)` |
| 7b | — Ciudad | `v_ciudad` / `v-ciudad` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7c | — Provincia / Estado / Región | `v_provincia` / `v-provincia` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Región` |
| 7d | — Código Postal | `v_cp` / `v-cp` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Código Postal` |
| 8 | **Actividad profesional u ocupación** | `v_ocupacion` / `v-ocupacion` | text | Sí | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante…` |
| 9 | **Correo electrónico** | `v_email` / `v-email` | email | Sí | `emailReq()` — regex `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`. Whitespace stripped on input. Validated on blur. `autocomplete="email"`. | `nombre@correo.com` |

### Warnings / Hints (Paso 1)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Verifica que el pasaporte tenga al menos **6 meses de vigencia** a partir de la fecha de entrada a México." (warn)
- **Residencia:** "Puede ser diferente a la nacionalidad." (hint)
- **Ocupación:** "En el país de residencia del viajero. La actividad profesional ayuda a demostrar motivos para regresar después del viaje." (hint)

---

## Paso 2 — Acompañantes *(exclusivo Plan Completo)*

> Los acompañantes viajan junto al invitado principal y quedan incluidos en la misma carta. Sección repetible — agregar un bloque por cada acompañante. Si el viajero viene solo, se puede omitir este paso.

Callout: "Exclusivo Plan Completo. Si el viajero viene solo, se puede omitir este paso y continuar."

Empty state (when no companions): "Sin acompañantes por ahora / Si alguien viaja con el invitado principal, agrégalo aquí."

Button: **"Agregar acompañante"** (`addCompanion()`)

### Campos por cada acompañante (template `#companion-tpl`)

| # | Campo | `name` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del acompañante** | `comp_nombre[]` | text | Sí | `nameReq()` — non-empty + space. `titleCase()` on input. | `Ej. Juan Carlos Pérez López` |
| 2 | **Sexo** | `comp_genero_N` | radio | Sí | Must select one. Name is unique per card (`comp_genero_0`, `comp_genero_1`, etc.). | Values: `masculino` / `femenino`. Inline radio buttons. |
| 3 | **Fecha de nacimiento** | `comp_nacimiento[]` | date | Sí | `dateReq()` — year 1900 to current. `min="1900-01-01"`, `data-dynamic-date="birth"`. | — |
| 4 | **Relación con el viajero principal** | `comp_relacion[]` | text | Sí | `req()`. | `Ej. Esposa, Hijo, Amigo de la infancia…` |
| 5 | **Nacionalidad** | `comp_nacionalidad[]` | select | Sí | `selReq()`. | Default: `"La que aparece en su pasaporte"` (disabled). Dropdown con países agrupados por región. |
| 6 | **Número de pasaporte** | `comp_pasaporte[]` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Ej. AB123456` |
| 7 | **¿Mismo domicilio de residencia que el viajero principal?** | `comp_mismo_domicilio[]` | radio | Sí | Must select one. Default: Sí. | Values: `si` / `no`. |

### Conditional: Domicilio diferente (shown when `comp_mismo_domicilio = "no"`)

| # | Campo | `name` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 7a | **País de residencia** | `comp_residencia[]` | select | Sí (if no) | `selReq()`. | Default: `"Selecciona el país"` (disabled). |
| 7b | **Calle, número, e interior** | `comp_calle[]` | text | Sí (if no) | `req()`. `autocomplete="off"`. | `Calle, número, e interior (si aplica)` |
| 7c | **Ciudad** | `comp_ciudad[]` | text | Sí (if no) | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7d | **Provincia / Estado / Región** | `comp_provincia[]` | text | Sí (if no) | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Provincia / Estado / Región` |
| 7e | **Código Postal** | `comp_cp[]` | text | Sí (if no) | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Código Postal` |

| 8 | **Actividad profesional u ocupación** | `comp_ocupacion[]` | text | Sí | `req()`. | `Ej. Ingeniero, Estudiante, Comerciante…` |

### Warnings / Hints (Paso 2)
- **Nombre:** "Tal como aparece en el pasaporte." (warn)
- **Pasaporte:** "Mín. 6 meses de vigencia desde la entrada." (warn)

---

## Paso 3 — El anfitrión (Mexicano/a o residente en México que firmará la carta)

| # | Campo | `name` / `id` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **Nombre completo del anfitrión** | `a_nombre` / `a-nombre` | text | Sí | `nameReq()`. `titleCase()` on input. | `Ej. María Elena García Torres` |
| 2 | **Sexo del anfitrión** | `a_genero` | radio | Sí | Must select one. | Values: `masculino` / `femenino`. Inline radio buttons. Used for gendered Spanish in the PDF (portador/portadora). |
| 3 | **Nacionalidad del anfitrión** | `a_nacionalidad` / `a-nacionalidad` | select | Sí | `selReq()`. | Default: `"Selecciona la nacionalidad"` (disabled). Same country list as `v-nacionalidad`, with "Mexicana" included in América Latina. |
| 4 | **Fecha de nacimiento** | `a_nacimiento` / `a-nacimiento` | date | Sí | `dateReq()` — year 1900 to current. `data-dynamic-date="birth"`. `min="1900-01-01"`. | — |
| 5 | **Tipo de identificación oficial** | `a_id_tipo` / `a-id-tipo` | select | Sí | `selReq()`. | Default: `"Selecciona el tipo"` (disabled). |
| 6 | **Número de identificación** | `a_id_num` / `a-id-num` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Número que aparece en la identificación del anfitrión` |
| 7 | **Domicilio en México** | (group) | — | Sí | All sub-fields validated. | — |
| 7a | — Calle, número e interior | `a_calle` / `a-calle` | text | Sí | `req()`. `autocomplete="off"`. | `Calle, número e interior (si aplica)` |
| 7b | — Colonia | `a_colonia` / `a-colonia` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Colonia` |
| 7c | — Delegación o Municipio | `a_delegacion` / `a-delegacion` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Delegación o Municipio` |
| 7d | — Ciudad | `a_ciudad` / `a-ciudad` | text | Sí | `req()`. `capFirst()` on input. `autocomplete="off"`. | `Ciudad` |
| 7e | — Estado | `a_estado` / `a-estado` | select | Sí | `selReq()`. | Default: `"Estado"` (disabled). See **Dropdown: Estados de México** below. |
| 7f | — Código Postal | `a_cp` / `a-cp` | text | Sí | `req()`. `upperAll()` on input. `autocomplete="off"`. | `Código Postal` |
| 8 | **Teléfono de contacto** | `a_telefono` / `a-telefono` | tel | Sí | `phoneReq()` — exactly 10 digits. Auto-formatted `XX XXXX XXXX` on input. `maxlength="12"`. `autocomplete="tel"`. | `55 1234 5678` |
| 9 | **Correo electrónico del anfitrión** | `a_email` / `a-email` | email | Sí | `emailReq()`. `autocomplete="email"`. | `anfitrion@ejemplo.com` |
| 10 | **Ocupación o cargo del anfitrión** | `a_ocupacion` / `a-ocupacion` | text | Sí | `req()`. | `Ej. Ingeniero, Gerente, Médico, Profesor…` |
| 11 | **Empresa o lugar de trabajo** | `a_empresa` / `a-empresa` | text | No | Not validated. | `Ej. Pemex, Grupo Bimbo, Hospital Ángeles, Independiente…` (labeled "(opcional)") |
| 12 | **¿Quién llena este formulario?** | `a_perspectiva` / `a-perspectiva` | select | Sí | `selReq()`. | Default: `"Selecciona quién está describiendo"` (disabled). |
| 13 | **Vínculo con el viajero** | `a_vinculo` / `a-vinculo` | select | Sí | `selReq()`. | Default: `"Selecciona el vínculo"` (disabled). |
| 14 | **Tipo de parentesco** *(conditional)* | `a_parentesco` / `a-parentesco` | select | Sí (when familiar) | `selReq()`. Shown only when vínculo = `familiar`. | Default: `"Selecciona el parentesco"` (disabled). See **Dropdown: Parentesco** below. |
| 15 | **Especifica el parentesco** *(conditional)* | `a_parentesco_otro` / `a-parentesco-otro` | text | Sí (when otro_familiar) | `req()`. Shown only when parentesco = `otro_familiar`. | `Ej. primo segundo, bisnieto, tío abuelo…` |
| 16 | **Describe brevemente el vínculo** | `a_vinculo_detalle` / `a-vinculo-detalle` | textarea | Sí | `req()`. `rows="2"`. | `Ej. Somos amigos desde la universidad · Es sobrino de mi esposa · Trabajamos juntos en la misma empresa…` |
| 17 | **¿Desde hace cuánto se conocen?** *(conditional)* | (group) | — | Sí | Both selects validated with `selReq()`. Hidden when vínculo = `familiar` AND parentesco is consanguineous. | — |
| 17a | — Años | `a_tiempo_anios` / `a-tiempo-anios` | select | Sí | `selReq()`. | Default: `"Años"` (disabled). |
| 17b | — Meses | `a_tiempo_meses` / `a-tiempo-meses` | select | Sí | `selReq()`. | Default: `"Meses"` (disabled). |

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

### Dropdown: Tipo de parentesco (`a-parentesco`)

Shown only when `a-vinculo = "familiar"`. Label changes based on perspectiva:
- `anfitrion` → "El viajero es mi..."
- `visitante` → "El anfitrión es mi..."

| Value | Label |
|-------|-------|
| `padre` | Padre / Madre |
| `hijo` | Hijo(a) |
| `hermano` | Hermano(a) |
| `abuelo` | Abuelo(a) |
| `nieto` | Nieto(a) |
| `bisabuelo` | Bisabuelo(a) |
| `tio` | Tío(a) |
| `sobrino` | Sobrino(a) |
| `primo` | Primo(a) |
| `suegro` | Suegro(a) |
| `yerno` | Yerno / Nuera |
| `cunado` | Cuñado(a) |
| `concuno` | Concuño(a) |
| `padrastro` | Padrastro / Madrastra |
| `hijastro` | Hijastro(a) |
| `hermanastro` | Hermanastro(a) |
| `otro_familiar` | Otro familiar |

**Consanguineous** (hide tiempo when selected): `padre`, `hijo`, `hermano`, `abuelo`, `nieto`, `bisabuelo`, `tio`, `sobrino`, `primo`.

**Non-consanguineous** (show tiempo): `suegro`, `yerno`, `cunado`, `concuno`, `padrastro`, `hijastro`, `hermanastro`, `otro_familiar`.

**PDF inversion** (when `perspectiva=visitante`): Asymmetric pairs are inverted for the host's POV: padre↔hijo, abuelo↔nieto, bisabuelo↔bisnieto, tio↔sobrino, suegro↔yerno, padrastro↔hijastro. Symmetric pairs (hermano, primo, cunado, concuno, hermanastro) stay the same.

### Dropdown: Años de conocerse (`a-tiempo-anios`)

| Value | Label |
|-------|-------|
| `0` | 0 años |
| `1` | 1 año |
| `2` – `99` | 2 años – 99 años |

### Dropdown: Meses de conocerse (`a-tiempo-meses`)

| Value | Label |
|-------|-------|
| `0` | 0 meses |
| `1` | 1 mes |
| `2` – `11` | 2 meses – 11 meses |

### Warnings / Hints (Paso 3)
- **Nombre:** "Tal como aparece en la identificación oficial." (warn)
- **Nacionalidad:** "La nacionalidad del anfitrión ayuda a determinar la capacidad de respaldar al visitante." (hint)
- **Nacimiento:** "El anfitrión debe ser mayor de edad (18 años o más)." (hint)
- **Tipo de ID:** "Se deberá anexar copia de esta identificación a la carta de invitación." (warn)
- **Domicilio:** "Se recomienda anexar a la carta de invitación un comprobante de domicilio del anfitrión con antigüedad no mayor a 3 meses." (warn)
- **Teléfono:** "10 dígitos sin LADA internacional." (hint) + "Migración puede llamar a este número exactamente al momento del arribo del visitante. Es fundamental que el anfitrión esté disponible en este número durante las fechas del viaje." (warn)
- **Email:** "Un correo de contacto que aparecerá en la carta." (hint)
- **Ocupación:** "Esto ayuda a demostrar estabilidad y respaldo económico ante migración." (hint)
- **Perspectiva:** "Esto nos ayuda a redactar correctamente la carta desde la perspectiva adecuada." (hint)
- **Vínculo detalle:** "Entre más detalle, más personalizada será la carta." (warn)

---

## Paso 4 — Itinerario, entrada y salida *(exclusivo Plan Completo)*

### Info Note
- "Se debe comprobar que se cuenta con reservación para el viaje de regreso al momento del ingreso a México."

### Motivo del viaje

| # | Campo | `name` / `id` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| — | **Motivo del viaje** | `j_motivo` / `j-motivo` | select | Sí | `selReq()`. | Default: `"Selecciona el motivo principal"` (disabled). |

#### Dropdown: Motivo del viaje (`j-motivo`)

| Value | Label |
|-------|-------|
| `turismo` | Turismo |
| `negocios` | Negocios |
| `estudios` | Estudios |
| `actividades_no_remuneradas` | Actividades no remuneradas |
| `transito` | Tránsito |
| `tratamientos_medicos` | Tratamientos médicos |

Hints:
- "Esto determina el propósito que se indicará en la carta de invitación." (hint)
- "La estancia máxima para visitantes en México es de 180 días." (warn)

### Ingreso a México

| # | Campo | `name` / `id` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **¿Cómo será el ingreso a México?** | `ingreso_tipo` (radio) | radio | Sí | Must select one. | Three transport-type cards: Aéreo / Terrestre / Marítimo. |
| 2 | **Fecha de llegada a México** | `ing_fecha` / `ing-fecha` | date | Sí | `dateReq()` — year between current and current+5. `data-dynamic-date="travel"`. | — |

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
| Número de vuelo | `ing-vuelo` / `ing_vuelo` | text | Sí (when aéreo) | `Ej. AV204`. `upperAll()` on input. |

##### Terrestre ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `ing-cruce` / `ing_cruce` | text | Sí (when terrestre) | `Ej. Tijuana, Ciudad Juárez…` |

##### Marítimo ingreso fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de ingreso | `ing-puerto` / `ing_puerto` | text | Sí (when marítimo) | `Ej. Puerto de Veracruz` |

### Destinos del itinerario *(repetible — agregar un bloque por cada ciudad o destino)*

Badge: "Exclusivo Plan Completo"

One destino is auto-added on page load. Button: **"Agregar destino"** (`addDestino()`)

#### Destino N (template `#destino-tpl`)

| # | Campo | `name` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 1 | **Ciudad** | `dest_ciudad[]` | text | Sí | `req()`. `capFirst()` on input. | `Ej. Ciudad de México, CDMX` |
| 2 | **Actividades planeadas en este destino** | `dest_actividades[]` | textarea | Sí | `req()`. `rows="2"`. | `Ej. Turismo cultural, visita a museos, asistencia a la boda del anfitrión y celebraciones correspondientes, recorrido gastronómico…` |
| 3 | **¿El alojamiento es la dirección del anfitrión?** | `dest_aloj_es_anfitrion[]` | radio | Sí | Must select one. | Values: `si` / `no`. |

##### Conditional: Custom accommodation (shown when `dest_aloj_es_anfitrion = "no"`)

| # | Campo | `name` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|--------|------|-----------|------------|----------------------|
| 3a | **Nombre del alojamiento** | `dest_aloj_nombre[]` | text | No | Not validated. | `Hotel, Airbnb, casa particular…` (labeled "(si aplica, llenar solo en caso de ser hotel)") |
| 3b | **Calle, número e interior** | `dest_aloj_calle[]` | text | Sí (if no) | `req()`. | `Calle, número e interior (si aplica)` |
| 3c | **Colonia** | `dest_aloj_colonia[]` | text | Sí (if no) | `req()`. `capFirst()` on input. | `Colonia` |
| 3d | **Delegación o Municipio** | `dest_aloj_delegacion[]` | text | Sí (if no) | `req()`. `capFirst()` on input. | `Delegación o Municipio` |
| 3e | **Ciudad** | `dest_aloj_ciudad[]` | text | Sí (if no) | `req()`. `capFirst()` on input. | `Ciudad` |
| 3f | **Estado** | `dest_aloj_estado[]` | select | Sí (if no) | `selReq()`. | 32 Mexican states dropdown. |
| 3g | **Código Postal** | `dest_aloj_cp[]` | text | Sí (if no) | `req()`. `upperAll()` on input. | `Código Postal` |

| 4 | **Fechas de estadía en este destino** | — | date range | Sí | — | — |
| 4a | — Llegada | `dest_fecha_desde[]` | date | Sí | `dateReq()`. `data-dynamic-date="travel"`. | **Auto-synced and read-only**: Destino 1 arrival = `ing-fecha`; Destino N arrival = Destino N-1 departure. |
| 4b | — Salida | `dest_fecha_hasta[]` | date | Sí | `dateReq()`. Must be >= arrival date. | Triggers `syncDestinoArrivalDates()` on change. |

### Warnings / Hints (Destinos)
- **Actividades:** "Sé lo más específico posible: incluye nombres de lugares, eventos, razones del viaje y cualquier detalle relevante. Mientras más información se proporcione, más completa será la carta de invitación." (warn)
- **Nombre del alojamiento:** "Se recomienda tener la reservación a la mano para mostrar a la autoridad migratoria." (hint)

### Salida de México

| # | Campo | `name` / `id` | Tipo | Requerido | Validación | Placeholder / Detalle |
|---|-------|---------------|------|-----------|------------|----------------------|
| 1 | **¿Cómo será la salida de México?** | `salida_tipo` (radio) | radio | Sí | Must select one. | Three transport-type cards: Aéreo / Terrestre / Marítimo. |
| 2 | **Fecha de regreso** | `sal_fecha` / `sal-fecha` | date | Sí | `dateReq()` — year between current and current+5. Must be >= `ing-fecha`. Must equal last destino's `dest_fecha_hasta`. `data-dynamic-date="travel"`. | — |

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
| Número de vuelo | `sal-vuelo` / `sal_vuelo` | text | Sí (when aéreo) | `Ej. AV205`. `upperAll()` on input. |

##### Terrestre salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Punto de cruce fronterizo | `sal-cruce` / `sal_cruce` | text | Sí (when terrestre) | `Ej. Nuevo Laredo, Reynosa…` |

##### Marítimo salida fields:

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Puerto de salida | `sal-puerto` / `sal_puerto` | text | Sí (when marítimo) | `Ej. Puerto de Ensenada` |

### Date Cross-Validation (Paso 4)
- `sal-fecha` must be >= `ing-fecha`.
- `sal-fecha` must equal last destino's `dest_fecha_hasta`.
- Each destino's `dest_fecha_hasta` must be >= its `dest_fecha_desde`.
- **180-day warning** (`#warn-180`): Non-blocking warning displayed when stay exceeds 180 days: "La estancia máxima para turismo en México es de 180 días."
- **Date coherence hint:** "Estas fechas deben coincidir exactamente con los boletos de avión o transporte del viajero. El agente migratorio verificará la coherencia." (warn)

### Auto-sync: Destino arrival dates (`syncDestinoArrivalDates()`)
- **Destino 1** arrival (`dest_fecha_desde`) is auto-set to `ing-fecha` (arrival in Mexico).
- **Destino N** (N > 1) arrival is auto-set to the departure date of Destino N-1.
- All arrival dates are set to **read-only** (`readOnly = true`) with grey background.
- Syncing is triggered whenever: a destino is added/removed, a destino departure date changes, or `ing-fecha` changes.

---

## Paso 5 — Gastos del viaje

### Info Note
- "Si el visitante cubre total o parcialmente sus propios gastos, se recomienda que pueda comprobar el equivalente de al menos **USD $50 por día** con efectivo, estado de cuenta bancario o de tarjeta."

### Pregunta principal: ¿Gastos a cargo del anfitrión?

| # | Campo | `name` / `id` | Tipo | Requerido | Validación |
|---|-------|---------------|------|-----------|------------|
| 1 | **¿Hay algún gasto que será a cargo del anfitrión?** | `gastos_anfitrion` (radio) | radio | Sí | Must select one. Values: `si` / `no`. |

### Conditional: Detalle de gastos del anfitrión (shown when `gastos_anfitrion = "si"`)

Container: `#gastos-host-detail` (class `cond-fields`, toggles `open`).

**Warning box (red):** "Si el anfitrión asume alguno de los gastos, se debe anexar documentación adicional de solvencia económica del anfitrión, como **estados de cuenta bancarios** o **recibos de nómina**, para demostrar que cuenta con los recursos para cubrir la estancia."

| # | Campo | Name | Tipo | Requerido | Validación |
|---|-------|------|------|-----------|------------|
| 2 | **¿Cuáles gastos serán cubiertos por el anfitrión?** | `gastos_host_conceptos` | checkbox (multiple) | Sí (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `gastos_host_conceptos`:

| Value | Label |
|-------|-------|
| `alojamiento` | 🏨 Alojamiento *(visible only when any destino has `dest_aloj_es_anfitrion = "no"`)* |
| `alimentos` | Alimentos |
| `transporte` | Transporte |
| `actividades` | Actividades turísticas |
| `medicos` | Gastos médicos o emergencia |
| `otro` | Otro |

#### Conditional: "Otro" gasto text (shown when `otro` is checked)

| Campo | ID / Name | Tipo | Requerido | Placeholder |
|-------|-----------|------|-----------|-------------|
| Describe el gasto adicional | `gastos-otro-texto` / `gastos_otro_texto` | text | Sí (when "otro" checked) | `Describe el gasto adicional…` |

### Medios de transporte del visitante en México

| # | Campo | Name | Tipo | Requerido | Validación |
|---|-------|------|------|-----------|------------|
| 3 | **Medios de transporte en México** | `transporte_mx` | checkbox (multiple) | Sí (at least 1) | At least one checkbox must be checked. |

#### Checkbox options for `transporte_mx`:

| Value | Label |
|-------|-------|
| `avion` | Avión interno |
| `autobus_foraneo` | Autobús Foráneo |
| `auto_rentado` | Auto rentado |
| `anfitrion` | Transporte del anfitrión |
| `transporte_publico` | Transporte público y/o taxis |

---

## Paso 6 — Revisión final

No new form fields. Displays a read-only summary of all data entered in Steps 1–5, built dynamically by `buildReview()`.

### CTA Box (appears twice — top and bottom of review)
- Text: "¿Todo correcto? Revisa los datos abajo y confirma para proceder al pago seguro. La carta PDF llegará al correo del viajero y del anfitrión en minutos."
- Security note: "Pago procesado por Stripe. No almacenamos datos de tarjeta."
- Buttons: "Volver y editar" (btn-back → `goPrev(6)`) | "Confirmar y pagar · $9 USD" (btn-navy → `goNext(6)`)

### Responsibility Note
- "Al generar esta carta, el anfitrión declara que la información proporcionada es verídica y se compromete a recibir al visitante durante las fechas indicadas. Es importante que toda la información coincida con lo que el viajero declare ante el agente migratorio."

### Review Cards Generated by `buildReview()`

6 review sections:

1. **El viajero** — Nombre completo, Fecha de nacimiento (DD/MM/YYYY), Nacionalidad, N.º de pasaporte, País de residencia, Domicilio (concatenated), Ocupación, Correo electrónico.
2. **Acompañantes** — For each companion: Nombre, Nacimiento, Relación, Nacionalidad, Pasaporte, Ocupación, Domicilio (or "Mismo que el viajero principal").
3. **El anfitrión** — Nombre completo, Nacionalidad, Fecha de nacimiento, Tipo de ID, N.º de ID, Domicilio en México (concatenated with colonia, delegación, ciudad, estado, CP), Teléfono, Correo electrónico, Ocupación / cargo, Empresa, Vínculo con el viajero, ¿Quién llena?, Detalle del vínculo, Tiempo de conocerse.
4. **Gastos** — Gastos a cargo del anfitrión (Sí/No), Conceptos cubiertos (if Sí, with labels including Alojamiento), Transporte en México.
5. **Destino N — [Ciudad]** — For each destino: Ciudad, Actividades, Alojamiento (or "Dirección del anfitrión"), Dirección alojamiento, Llegada, Salida.
6. **Entrada y salida** — Motivo del viaje, Tipo de ingreso, Detalle ingreso (airport·airline·flight or crossing/port), Fecha de llegada, Tipo de salida, Detalle salida, Fecha de regreso.

---

## Dropdown: Países (agrupados por región)

Used for: `v-nacionalidad`, `v-residencia`, `comp_nacionalidad[]`, `comp_residencia[]`, `a-nacionalidad`.

### América Latina y el Caribe
Antigua y Barbuda, Argentina, Bahamas, Barbados, Belice, Bolivia, Brasil, Chile, Colombia, Costa Rica, Cuba, Dominica, Ecuador, El Salvador, Granada, Guatemala, Guyana, Haití, Honduras, Jamaica, México, Nicaragua, Panamá, Paraguay, Perú, República Dominicana, San Cristóbal y Nieves, San Vicente y las Granadinas, Santa Lucía, Surinam, Trinidad y Tobago, Uruguay, Venezuela

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

## Dropdown: Estados de México (used for `a-estado`, `dest_aloj_estado[]`)

32 states: Aguascalientes, Baja California, Baja California Sur, Campeche, Chiapas, Chihuahua, Ciudad de México, Coahuila, Colima, Durango, Guanajuato, Guerrero, Hidalgo, Jalisco, México, Michoacán, Morelos, Nayarit, Nuevo León, Oaxaca, Puebla, Querétaro, Quintana Roo, San Luis Potosí, Sinaloa, Sonora, Tabasco, Tamaulipas, Tlaxcala, Veracruz, Yucatán, Zacatecas

---

## Payment Flow (Stripe Integration)

1. User clicks "Confirmar y pagar · $9 USD" on Step 6.
2. `goNext(6)` calls `submitToAPI()`.
3. Button is disabled and shows "Procesando..." spinner.
4. `collectFormData()` gathers all form values into a JSON object (text/select/textarea by ID, radios by name, checkboxes as arrays by name, plus companion and destino arrays).
5. **Email selection logic:** If `a-perspectiva === 'visitante'`, uses `v-email`; otherwise uses `a-email`. This determines the Stripe checkout email.
6. POST to `/api/submit` with body: `{ plan: 'completo', email, formData }`.
7. Expects JSON response with `{ url }` (Stripe Checkout URL).
8. Saves form data to `localStorage` key `carta_form_completo` (with current step number).
9. Redirects to `result.url` (Stripe Checkout).
10. On error: shows `alert()` with error message, re-enables button.

### Stripe Cancel / Return Flow
- On page load, checks for `#step=N` hash parameter (e.g., `#step=6` from Stripe cancel).
- Restores form data from `localStorage` via `restoreFormData()`.
- `restoreFormData()` sets values by element ID, fires `input` and `change` events to trigger formatting and conditional logic, handles radio/checkbox arrays, and recreates companion/destino blocks.
- Syncs mobile date picker trigger values (DD/MM/YYYY format) with hidden date inputs.

---

## JavaScript Behavior Summary

### Text Transform Helpers
| Function | Behavior | Used on |
|----------|----------|---------|
| `titleCase(el)` | Capitalizes first letter of every word | `v-nombre`, `a-nombre`, `comp_nombre[]` |
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
- iOS-style drum/wheel picker with three scrollable columns: Day, Month (Ene–Dic), Year.
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
- Saved before Stripe redirect: `{ formData: {...}, step: N }`
- Restored on page load if present (including companion/destino recreation).
- Hash `#step=N` overrides saved step number.

---

## Conditional Logic Summary

| Trigger | Condition | Fields Shown / Hidden |
|---------|-----------|----------------------|
| `comp_mismo_domicilio[]` radio | `= "no"` | Show companion address fields (country, street, city, province, CP) |
| `comp_mismo_domicilio[]` radio | `= "si"` | Hide companion address fields, clear values |
| `dest_aloj_es_anfitrion[]` radio | `= "no"` | Show destino accommodation fields (name, street, colonia, delegación, city, state, CP) |
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
| `a-vinculo` select | `≠ "familiar"` | Hide `#parentesco-wrapper`, reset value, remove required |
| `a-parentesco` select | `= "otro_familiar"` | Show `#parentesco-otro-wrapper` (text input), make required |
| `a-parentesco` select | `≠ "otro_familiar"` | Hide `#parentesco-otro-wrapper`, clear value |
| `a-parentesco` select | consanguineous value | Hide `#tiempo-wrapper` (años/meses), remove required |
| `a-parentesco` select | non-consanguineous value | Show `#tiempo-wrapper`, make required |
| `a-perspectiva` select | changes | Update `#parentesco-label` text: anfitrion → "El viajero es mi...", visitante → "El anfitrión es mi..." |

All conditional containers use CSS class `cond-fields` with `max-height: 0; overflow: hidden; opacity: 0` (hidden) and `cond-fields.open` with `max-height: 800px; opacity: 1` (visible), animated via CSS transitions.

---

## Review Label Maps (used in `buildReview()`)

### `TIPO_INGSAL`
```js
{ aereo: 'Aéreo', terrestre: 'Terrestre', maritimo: 'Marítimo' }
```

### `TRANSPORTE_LABELS`
```js
{ avion: 'Avión interno', autobus_foraneo: 'Autobús Foráneo', auto_rentado: 'Auto rentado', anfitrion: 'Transporte del anfitrión', transporte_publico: 'Transporte público y/o taxis' }
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
