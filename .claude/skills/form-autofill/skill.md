---
name: Form Autofill
description: Automatically fills out the Carta Invitación forms (Plan Esencial or Plan Completo) with realistic dummy data using Puppeteer, then navigates to the review step so the user can proceed to payment. Use when the user wants to test the form flow or preview the review screen without manually entering data.
---

# Form Autofill — Carta Invitación

Automates filling out the multi-step Carta Invitación form with realistic Spanish-language dummy data. Can stop at the review screen or complete the full end-to-end checkout using Stripe's test card.

## Step 1 — Ask Which Plan, Environment, and Mode

**ALWAYS start by asking ALL THREE questions at once** using a single `AskUserQuestion` call with three questions:

**Question 1:**
- Question: "¿Qué formulario deseas llenar con datos de prueba?"
- Header: "Plan"
- Options:
  - label: "Plan Esencial", description: "Formulario básico — viajero, anfitrión, alojamiento y vuelos"
  - label: "Plan Completo", description: "Formulario completo — incluye acompañantes, gastos e itinerario detallado"

**Question 2:**
- Question: "¿Dónde quieres correr el autofill?"
- Header: "Entorno"
- Options:
  - label: "Local (localhost:3000)", description: "Dev server en tu máquina"
  - label: "Staging (Vercel)", description: "Sitio de staging en Vercel — carta-invitacion-mexico-tawny.vercel.app"
  - label: "Producción", description: "Sitio en vivo — cartadeinvitacionmexico.com"

**Question 3:**
- Question: "¿Hasta dónde quieres llegar?"
- Header: "Modo"
- Options:
  - label: "Solo llenar formulario", description: "Llena el formulario y se detiene en la pantalla de revisión (último paso)"
  - label: "End-to-end (checkout completo)", description: "Llena el formulario, hace clic en 'Confirmar y pagar', completa el pago en Stripe con tarjeta de prueba 4242, y espera la página de éxito"

Based on the answers, determine the **BASE_URL**:
- **Local** → `http://localhost:3000`
- **Staging (Vercel)** → `https://carta-invitacion-mexico-tawny.vercel.app`
- **Producción** → `https://cartadeinvitacionmexico.com`

Then build form URLs:
- **Esencial** → `{BASE_URL}/formulario-esencial.html`
- **Completo** → `{BASE_URL}/formulario-completo.html`

## Step 2 — Ensure Server is Running (local only)

**Skip this step entirely if running against staging or production.**

If local: check if the dev server is active. Run:
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/
```
If it returns anything other than `200`, start the server in the background:
```bash
node "c:/Antigravity Repository/Carta Invitacion/serve.mjs" &
sleep 2
```

## Form Step Order (CRITICAL)

**The two forms have DIFFERENT step counts and step orders.**

### Plan Esencial Steps (6 steps):
1. **Viajero** — traveler personal info (includes `v_genero` radio)
2. **Anfitrión** — host info (includes `a_genero` radio, `a-nacionalidad`, email, ocupacion, vinculo-detalle, tiempo-anios, tiempo-meses)
3. **El viaje** — activities + accommodation (`aloj_es_anfitrion` radio toggle)
4. **Gastos** — expenses (`gastos_anfitrion` radio + `gastos_host_conceptos` checkboxes + `transporte_mx` checkboxes)
5. **Entrada y salida** — flights (ingreso/salida transport type radios)
6. **Revisión** — review screen → `goNext(6)` triggers checkout

### Plan Completo Steps (5 steps):
1. **El anfitrión** — host personal info (includes `a_genero` radio, `a-nacionalidad` select, `a-empresa` optional)
2. **Los viajeros** — traveler principal (includes `v_genero` radio) + vínculo fields + companions (repeatable cards with genero, nombre, nacimiento, nacionalidad, pasaporte, ocupacion, vinculo, vinculo-detalle, tiempo-anios, tiempo-meses, mismo_domicilio)
3. **Itinerario, entrada y salida** — `j-motivo` select + transport type radios + destination cards
4. **Gastos** — expenses (same structure as Esencial)
5. **Revisión** — review screen → `goNext(5)` triggers checkout

## Step 3 — Write and Run the Puppeteer Script

Write a Node.js script to `c:/Antigravity Repository/Carta Invitacion/autofill-temp.mjs` and then run it with `node autofill-temp.mjs` from the project root.

### Puppeteer Config

**IMPORTANT — Windows ESM compatibility:** Use `createRequire`, NOT a bare `import` with a Windows path.

```js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('C:/Users/laura.rodriguez/AppData/Roaming/npm/node_modules/puppeteer');

const CHROME = 'C:/Users/laura.rodriguez/.cache/puppeteer/chrome/win64-145.0.7632.77/chrome-win64/chrome.exe';

const delay = (ms) => new Promise(r => setTimeout(r, ms));
// IMPORTANT: page.waitForTimeout is REMOVED in newer Puppeteer — always use delay() instead
```

### Helper Functions to Include in Script

```js
async function fill(page, id, value) {
  await page.evaluate((id, value) => {
    const el = document.getElementById(id);
    if (!el) { console.warn('fill: missing #' + id); return; }
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, id, value);
}

async function sel(page, id, value) {
  await page.evaluate((id, value) => {
    const el = document.getElementById(id);
    if (!el) { console.warn('sel: missing #' + id); return; }
    el.value = value;
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, id, value);
}

async function fillArea(page, id, value) {
  await page.evaluate((id, value) => {
    const el = document.getElementById(id);
    if (!el) { console.warn('fillArea: missing #' + id); return; }
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }, id, value);
}

async function radio(page, name, value) {
  await page.evaluate((name, value) => {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); }
    else console.warn('radio: missing ' + name + '=' + value);
  }, name, value);
}

// Check a checkbox by name + value (for gastos_host_conceptos, transporte_mx, etc.)
async function checkBoxByValue(page, name, value) {
  await page.evaluate((name, value) => {
    const el = document.querySelector(`input[name="${name}"][value="${value}"]`);
    if (el && !el.checked) {
      el.checked = true;
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, name, value);
}

// IMPORTANT: Functions are in global scope (NOT on window). Reference them directly.
async function goNext(page, n) {
  const ok = await page.evaluate((n) => {
    if (typeof validateStep === 'function' && !validateStep(n)) {
      current = n + 1;
      showStep(n + 1);
      return false;
    }
    goNext(n);
    return true;
  }, n);
  if (!ok) console.warn(`⚠️  validateStep(${n}) failed — forced advance`);
  await delay(450);
}
```

### Dummy Data Constants

**IMPORTANT VALIDATION RULES:**
- **Nationality dropdowns** (`v-nacionalidad`, `a-nacionalidad`, `.companion-nacionalidad`): These use **feminine demonyms** (gentilicios femeninos), NOT country names. Examples: `'Venezolana'` (not `'Venezuela'`), `'Colombiana'` (not `'Colombia'`), `'Mexicana'` (not `'México'`). The `<option>` tags have no `value` attribute, so the value equals the display text.
- **Residencia dropdown** (`v-residencia`): This one uses **country names** (not demonyms). Examples: `'Colombia'`, `'Venezuela'`, `'Argentina'`.
- Phone (`a-telefono`): `phoneReq()` checks exactly **10 digits** after stripping non-digits. Use `'5512345678'` — NOT `'+52 55 1234 5678'` (which has 12 digits).
- Dates: `dateReq()` checks year range. Travel dates must be in the **current year to current+5 years**. Always use future dates.
- `dest-fecha-hasta` of the last destination MUST equal `sal-fecha` (departure date).
- `dest-fecha-desde` is **auto-synced from `ing-fecha` and made readonly** — do NOT set it manually.

```js
const VIAJERO = {
  nombre:       'Carlos Eduardo Martínez López',
  genero:       'masculino',        // radio: 'masculino' or 'femenino'
  nacimiento:   '1990-06-15',
  nacionalidad: 'Venezolana',        // DEMONYM (feminine) — NOT country name
  pasaporte:    'C12345678',
  residencia:   'Colombia',          // Country name (residencia uses country names, NOT demonyms)
  calle:        'Av. Libertador 245, Apto 3B',
  ciudad:       'Caracas',
  provincia:    'Distrito Capital',
  cp:           '1010',
  ocupacion:    'Ingeniero de Software',
  email:        'carlos.martinez@example.com',
};

const ANFITRION = {
  nombre:          'Sofía Hernández Ramírez',
  genero:          'femenino',           // radio: 'masculino' or 'femenino'
  nacionalidad:    'Mexicana',           // exact <option> text
  nacimiento:      '1985-03-22',
  idTipo:          'ine',                // exact <option value="ine">
  idNum:           'HERS850322MDFMNS02',
  calle:           'Calle Madero 78',
  colonia:         'Centro Histórico',
  delegacion:      'Cuauhtémoc',
  ciudad:          'Ciudad de México',
  estado:          'Ciudad de México',   // matches <option>Ciudad de México</option>
  cp:              '06000',
  telefono:        '5512345678',         // 10 digits only — NO country code
  email:           'sofia.hernandez@example.com',
  ocupacion:       'Abogada',
  empresa:         'Despacho Hernández & Asociados',  // optional field
  vinculo:         'amistad',            // exact <option value="amistad">
  vinculoDetalle:  'Amigos de la universidad desde 2008, estudiamos juntos en la UNAM la carrera de Derecho.',
  tiempoAnios:     '15',                // <option value="15">
  tiempoMeses:     '0',                 // <option value="0">
};
```

### ESENCIAL Autofill Script

**IMPORTANT:** The Esencial form may have been restructured similarly to Completo. Before running, **always read the actual form HTML** (`formulario-esencial.html`) to verify the step order and field IDs. The script below is a reference — adapt it to match the current form structure.

```js
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
});
const page = await browser.newPage();
await page.goto('{BASE_URL}/formulario-esencial.html', { waitUntil: 'networkidle0' });

// ═══ STEP 1: Viajero ═══
await fill(page, 'v-nombre',       VIAJERO.nombre);
await radio(page, 'v_genero',      VIAJERO.genero);
await fill(page, 'v-nacimiento',   VIAJERO.nacimiento);
await sel(page,  'v-nacionalidad', VIAJERO.nacionalidad);
await fill(page, 'v-pasaporte',    VIAJERO.pasaporte);
await sel(page,  'v-residencia',   VIAJERO.residencia);
await fill(page, 'v-calle',        VIAJERO.calle);
await fill(page, 'v-ciudad',       VIAJERO.ciudad);
await fill(page, 'v-provincia',    VIAJERO.provincia);
await fill(page, 'v-cp',           VIAJERO.cp);
await fill(page, 'v-ocupacion',    VIAJERO.ocupacion);
await fill(page, 'v-email',        VIAJERO.email);
await goNext(page, 1);

// ═══ STEP 2: Anfitrión ═══
await fill(page, 'a-nombre',     ANFITRION.nombre);
await radio(page, 'a_genero',    ANFITRION.genero);
await sel(page,  'a-nacionalidad', ANFITRION.nacionalidad);
await fill(page, 'a-nacimiento', ANFITRION.nacimiento);
await sel(page,  'a-id-tipo',    ANFITRION.idTipo);
await fill(page, 'a-id-num',     ANFITRION.idNum);
await fill(page, 'a-calle',      ANFITRION.calle);
await fill(page, 'a-colonia',    ANFITRION.colonia);
await fill(page, 'a-delegacion', ANFITRION.delegacion);
await fill(page, 'a-ciudad',     ANFITRION.ciudad);
await sel(page,  'a-estado',     ANFITRION.estado);
await fill(page, 'a-cp',         ANFITRION.cp);
await fill(page, 'a-telefono',   ANFITRION.telefono);
await fill(page, 'a-email',      ANFITRION.email);
await fill(page, 'a-ocupacion',  ANFITRION.ocupacion);
await sel(page,  'a-vinculo',    ANFITRION.vinculo);
await fillArea(page, 'a-vinculo-detalle', ANFITRION.vinculoDetalle);
await sel(page,  'a-tiempo-anios', ANFITRION.tiempoAnios);
await sel(page,  'a-tiempo-meses', ANFITRION.tiempoMeses);
await goNext(page, 2);

// ═══ STEP 3: El viaje ═══
await fillArea(page, 'j-actividades', 'Turismo cultural, visita a museos como el Museo Nacional de Antropología, recorrido por el Centro Histórico y Zócalo, paseo en trajinera por Xochimilco, gastronomía local en Coyoacán');
// Alojamiento = anfitrión's address (radio toggle)
await radio(page, 'aloj_es_anfitrion', 'si');
// If 'no', would need to fill: j-al-calle, j-al-colonia, j-al-delegacion, j-al-ciudad, j-al-estado, j-al-cp
await goNext(page, 3);

// ═══ STEP 4: Gastos ═══
await radio(page, 'gastos_anfitrion', 'si');
await page.evaluate(() => { if (typeof onGastosHostToggle === 'function') onGastosHostToggle(); });
await delay(300);
await checkBoxByValue(page, 'gastos_host_conceptos', 'alimentos');
await checkBoxByValue(page, 'gastos_host_conceptos', 'transporte');
await checkBoxByValue(page, 'gastos_host_conceptos', 'actividades');
// Call toggleTransportCard for visual state
await page.evaluate(() => {
  document.querySelectorAll('input[name="gastos_host_conceptos"]').forEach(cb => {
    if (cb.checked && typeof toggleTransportCard === 'function') toggleTransportCard(cb);
  });
});
await delay(200);
await checkBoxByValue(page, 'transporte_mx', 'avion');
await checkBoxByValue(page, 'transporte_mx', 'autobus_foraneo');
await page.evaluate(() => {
  document.querySelectorAll('input[name="transporte_mx"]').forEach(cb => {
    if (cb.checked && typeof toggleTransportCard === 'function') toggleTransportCard(cb);
  });
});
await delay(200);
await goNext(page, 4);

// ═══ STEP 5: Entrada y salida ═══
// IMPORTANT: For transport type radios, check the radio AND call onTransportType() explicitly
await page.evaluate(() => {
  const r = document.querySelector('input[name="ingreso_tipo"][value="aereo"]');
  if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); }
  if (typeof onTransportType === 'function') onTransportType('ingreso', 'aereo');
});
await delay(350);
await fill(page, 'ing-aeropuerto', 'Aeropuerto Internacional Benito Juárez (MEX)');
await fill(page, 'ing-aerolinea',  'Aeromexico');
await fill(page, 'ing-vuelo',      'AM-0450');
await fill(page, 'ing-fecha',      '2026-04-10');  // MUST be future date
// Salida
await page.evaluate(() => {
  const r = document.querySelector('input[name="salida_tipo"][value="aereo"]');
  if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); }
  if (typeof onTransportType === 'function') onTransportType('salida', 'aereo');
});
await delay(350);
await fill(page, 'sal-aeropuerto', 'Aeropuerto Internacional Benito Juárez (MEX)');
await fill(page, 'sal-aerolinea',  'Aeromexico');
await fill(page, 'sal-vuelo',      'AM-0451');
await fill(page, 'sal-fecha',      '2026-04-24');  // MUST be >= ing-fecha
await goNext(page, 5);

// ═══ DONE: Review ═══
console.log('✅ Formulario Esencial listo en Paso 6 — Revisión');
await delay(99999999);
```

### COMPLETO Autofill Script

```js
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: false,
  defaultViewport: null,
});
const page = await browser.newPage();
await page.goto('{BASE_URL}/formulario-completo.html', { waitUntil: 'networkidle0' });

// ═══ STEP 1: El anfitrión ═══
console.log('  → Paso 1: El anfitrión…');
await fill(page, 'a-nombre',     ANFITRION.nombre);
await radio(page, 'a_genero',    ANFITRION.genero);
await sel(page,  'a-nacionalidad', ANFITRION.nacionalidad);
await fill(page, 'a-nacimiento', ANFITRION.nacimiento);
await sel(page,  'a-id-tipo',    ANFITRION.idTipo);
await fill(page, 'a-id-num',     ANFITRION.idNum);
await fill(page, 'a-calle',      ANFITRION.calle);
await fill(page, 'a-colonia',    ANFITRION.colonia);
await fill(page, 'a-delegacion', ANFITRION.delegacion);
await fill(page, 'a-ciudad',     ANFITRION.ciudad);
await sel(page,  'a-estado',     ANFITRION.estado);
await fill(page, 'a-cp',         ANFITRION.cp);
await fill(page, 'a-telefono',   ANFITRION.telefono);
await fill(page, 'a-email',      ANFITRION.email);
await fill(page, 'a-ocupacion',  ANFITRION.ocupacion);
await fill(page, 'a-empresa',    ANFITRION.empresa);  // optional
await goNext(page, 1);

// ═══ STEP 2: Los viajeros ═══
console.log('  → Paso 2: Los viajeros…');
// Viajero principal
await fill(page, 'v-nombre',       VIAJERO.nombre);
await radio(page, 'v_genero',      VIAJERO.genero);
await fill(page, 'v-nacimiento',   VIAJERO.nacimiento);
await sel(page,  'v-nacionalidad', VIAJERO.nacionalidad);
await fill(page, 'v-pasaporte',    VIAJERO.pasaporte);
await sel(page,  'v-residencia',   VIAJERO.residencia);
await fill(page, 'v-calle',        VIAJERO.calle);
await fill(page, 'v-ciudad',       VIAJERO.ciudad);
await fill(page, 'v-provincia',    VIAJERO.provincia);
await fill(page, 'v-cp',           VIAJERO.cp);
await fill(page, 'v-ocupacion',    VIAJERO.ocupacion);
await fill(page, 'v-email',        VIAJERO.email);

// Vínculo con el anfitrión (lives in step 2 for Completo, NOT step 1)
await sel(page, 'a-vinculo', ANFITRION.vinculo);
await delay(200);
await fillArea(page, 'a-vinculo-detalle', ANFITRION.vinculoDetalle);
await sel(page, 'a-tiempo-anios', ANFITRION.tiempoAnios);
await sel(page, 'a-tiempo-meses', ANFITRION.tiempoMeses);

// Add companion
await page.evaluate(() => {
  const allBtns = [...document.querySelectorAll('button')];
  const addBtn = allBtns.find(b => b.textContent.includes('Agregar') && (b.textContent.includes('viajero') || b.textContent.includes('acompañante')));
  if (addBtn) addBtn.click();
  else { const b2 = allBtns.find(b => b.textContent.includes('Agregar')); if (b2) b2.click(); }
});
await delay(800);

// Fill companion card (uses class selectors — cards are from <template>)
await page.evaluate(() => {
  const card = document.querySelector('[data-companion]');
  if (!card) { console.warn('No companion card found'); return; }
  const setVal = (el, v) => {
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  };
  setVal(card.querySelector('.companion-nombre'), 'Ana Lucía Martínez López');
  // Gender radio (name is dynamic: comp_genero_1, comp_genero_2, etc.)
  const genRadio = card.querySelector('input[type="radio"][value="femenino"]');
  if (genRadio) { genRadio.checked = true; genRadio.dispatchEvent(new Event('change', {bubbles:true})); }
  setVal(card.querySelector('.companion-nacimiento'), '1993-09-08');
  const nacSel = card.querySelector('.companion-nacionalidad');
  if (nacSel) { nacSel.value = 'Venezolana'; nacSel.dispatchEvent(new Event('change', {bubbles:true})); }
  setVal(card.querySelector('.companion-pasaporte'), 'C98765432');
  setVal(card.querySelector('.companion-ocupacion'), 'Diseñadora Gráfica');
  // Companion vínculo (required fields)
  const vincSel = card.querySelector('.companion-vinculo');
  if (vincSel) { vincSel.value = 'amistad'; vincSel.dispatchEvent(new Event('change', {bubbles:true})); }
  const vincDet = card.querySelector('.companion-vinculo-detalle');
  if (vincDet) { vincDet.value = 'Hermana del viajero principal, también amiga del anfitrión desde la universidad.'; vincDet.dispatchEvent(new Event('input', {bubbles:true})); }
  const tAnios = card.querySelector('.companion-tiempo-anios');
  if (tAnios) { tAnios.value = '15'; tAnios.dispatchEvent(new Event('change', {bubbles:true})); }
  const tMeses = card.querySelector('.companion-tiempo-meses');
  if (tMeses) { tMeses.value = '0'; tMeses.dispatchEvent(new Event('change', {bubbles:true})); }
  // comp_mismo_domicilio defaults to "si" (same address as traveler) — leave as-is
});
await delay(300);
await goNext(page, 2);

// ═══ STEP 3: Itinerario, entrada y salida ═══
console.log('  → Paso 3: Itinerario…');
// Motivo del viaje (required select)
await sel(page, 'j-motivo', 'turismo');

// IMPORTANT: For transport type radios, check the radio AND call onTransportType() explicitly.
// Do NOT use clickCard() — it doesn't reliably trigger the onchange handler.
await page.evaluate(() => {
  const r = document.querySelector('input[name="ingreso_tipo"][value="aereo"]');
  if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); }
  if (typeof onTransportType === 'function') onTransportType('ingreso', 'aereo');
});
await delay(350);
await fill(page, 'ing-aeropuerto', 'Aeropuerto Internacional Benito Juárez (MEX)');
await fill(page, 'ing-aerolinea',  'Aeromexico');
await fill(page, 'ing-vuelo',      'AM-0450');
await fill(page, 'ing-fecha',      '2026-04-10');

// Salida — same pattern: check radio + call handler
await page.evaluate(() => {
  const r = document.querySelector('input[name="salida_tipo"][value="aereo"]');
  if (r) { r.checked = true; r.dispatchEvent(new Event('change', {bubbles:true})); }
  if (typeof onTransportType === 'function') onTransportType('salida', 'aereo');
});
await delay(350);
await fill(page, 'sal-aeropuerto', 'Aeropuerto Internacional Benito Juárez (MEX)');
await fill(page, 'sal-aerolinea',  'Aeromexico');
await fill(page, 'sal-vuelo',      'AM-0451');
await fill(page, 'sal-fecha',      '2026-04-24');

// CRITICAL: The form may auto-add a destination card. Check before adding another.
const destCount = await page.evaluate(() => document.querySelectorAll('[data-destino]').length);
if (destCount === 0) {
  await page.evaluate(() => { if (typeof addDestino === 'function') addDestino(); });
  await delay(600);
} else {
  // Remove any extra empty cards beyond the first
  await page.evaluate(() => {
    const cards = document.querySelectorAll('[data-destino]');
    for (let i = 1; i < cards.length; i++) cards[i].remove();
  });
  await delay(200);
}

// Fill destination card
await page.evaluate(() => {
  const card = document.querySelector('[data-destino]');
  if (!card) { console.warn('No destino card found'); return; }
  const setVal = (el, v) => {
    if (!el) return;
    el.value = v;
    el.dispatchEvent(new Event('input', {bubbles:true}));
    el.dispatchEvent(new Event('change', {bubbles:true}));
  };
  setVal(card.querySelector('.dest-ciudad'), 'Ciudad de México');
  setVal(card.querySelector('.dest-actividades'), 'Visita al Museo Nacional de Antropología, recorrido por el Zócalo y Palacio Nacional, paseo en trajinera por Xochimilco, gastronomía local en Coyoacán');
  // CRITICAL: Radio name is DYNAMIC (dest_aloj_es_anfitrion_1, _2, etc.) — use starts-with selector
  const siRadio = card.querySelector('input[name^="dest_aloj_es_anfitrion"][value="si"]');
  if (siRadio) {
    siRadio.checked = true;
    siRadio.dispatchEvent(new Event('change', {bubbles:true}));
    if (typeof onDestAlojToggle === 'function') onDestAlojToggle(siRadio);
  }
  // CRITICAL: dest-fecha-desde is auto-synced from ing-fecha and made READONLY.
  // Do NOT set it manually. Only set dest-fecha-hasta.
  const hastaEl = card.querySelector('.dest-fecha-hasta');
  if (hastaEl) {
    hastaEl.value = '2026-04-24';
    hastaEl.dispatchEvent(new Event('input', {bubbles:true}));
    hastaEl.dispatchEvent(new Event('change', {bubbles:true}));
  }
});
await delay(300);
await goNext(page, 3);

// ═══ STEP 4: Gastos ═══
console.log('  → Paso 4: Gastos…');
await radio(page, 'gastos_anfitrion', 'si');
await page.evaluate(() => { if (typeof onGastosHostToggle === 'function') onGastosHostToggle(); });
await delay(300);
await checkBoxByValue(page, 'gastos_host_conceptos', 'alimentos');
await checkBoxByValue(page, 'gastos_host_conceptos', 'transporte');
await checkBoxByValue(page, 'gastos_host_conceptos', 'actividades');
// Call toggleTransportCard for visual state on each checked box
await page.evaluate(() => {
  document.querySelectorAll('input[name="gastos_host_conceptos"]').forEach(cb => {
    if (cb.checked && typeof toggleTransportCard === 'function') toggleTransportCard(cb);
  });
});
await delay(200);
await checkBoxByValue(page, 'transporte_mx', 'avion');
await checkBoxByValue(page, 'transporte_mx', 'autobus_foraneo');
await page.evaluate(() => {
  document.querySelectorAll('input[name="transporte_mx"]').forEach(cb => {
    if (cb.checked && typeof toggleTransportCard === 'function') toggleTransportCard(cb);
  });
});
await delay(200);
await goNext(page, 4);

// ═══ DONE: Review ═══
console.log('✅ Formulario Completo listo en Paso 5 — Revisión');
await delay(99999999);
```

### End-to-End Checkout Block (Stripe Test Card)

**Only include this block when the user chose "End-to-end (checkout completo)".**

Replace the final `console.log('✅ ...')` + `await delay(99999999)` with this block.

**CRITICAL:** Use the REVIEW_STEP constant (5 for Completo, 6 for Esencial) to determine the correct step number.

```js
// --- END-TO-END: Click "Confirmar y pagar" and complete Stripe Checkout ---
const REVIEW_STEP = 5; // Use 5 for Completo, 6 for Esencial
console.log(`  → Paso ${REVIEW_STEP}: Revisión — clicking "Confirmar y pagar"…`);
await delay(2000);

// IMPORTANT: Click the actual button — do NOT call goNext() or submitToAPI() directly
// because submitToAPI is scoped inside a closure and may not be accessible from evaluate.
const clicked = await page.evaluate(() => {
  const btns = [...document.querySelectorAll('button')];
  const payBtn = btns.find(b => b.textContent.includes('Confirmar y pagar'));
  if (payBtn) { payBtn.click(); return true; }
  return false;
});
if (!clicked) {
  console.log('  ⚠️ Could not find "Confirmar y pagar" button, trying goNext…');
  await page.evaluate((step) => { goNext(step); }, REVIEW_STEP);
}

console.log('  ⏳ Esperando redirección a Stripe Checkout…');
try {
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 45000 });
} catch (e) {
  console.log('  ⚠️ Navigation timeout. Current URL: ' + page.url());
}
console.log('  → URL actual: ' + page.url());
await delay(3000);

// Try to change the email field on Stripe checkout (if user provided a custom Stripe email)
const emailField = await page.$('#email');
if (emailField) {
  await page.evaluate(() => {
    const e = document.getElementById('email');
    if (e) { e.value = ''; e.dispatchEvent(new Event('input', {bubbles:true})); }
  });
  await page.type('#email', STRIPE_EMAIL, { delay: 40 });
}

// Fill card details
const isHostedCheckout = await page.evaluate(() => !!document.getElementById('cardNumber'));

if (isHostedCheckout) {
  await page.type('#cardNumber', '4242424242424242', { delay: 50 });
  await page.type('#cardExpiry', '1230', { delay: 50 });
  await page.type('#cardCvc', '123', { delay: 50 });
  await page.type('#billingName', 'Carlos Eduardo Martínez López', { delay: 30 });
  const zipField = await page.$('#billingPostalCode');
  if (zipField) await page.type('#billingPostalCode', '10001', { delay: 50 });
} else {
  await delay(1000);
  const cardInput = await page.$('input[name="cardNumber"], input[placeholder*="card number" i], input[autocomplete="cc-number"]');
  if (cardInput) { await cardInput.click(); await page.keyboard.type('4242424242424242', { delay: 50 }); }
  const expiryInput = await page.$('input[name="cardExpiry"], input[placeholder*="MM" i], input[autocomplete="cc-exp"]');
  if (expiryInput) { await expiryInput.click(); await page.keyboard.type('1230', { delay: 50 }); }
  const cvcInput = await page.$('input[name="cardCvc"], input[placeholder*="CVC" i], input[autocomplete="cc-csc"]');
  if (cvcInput) { await cvcInput.click(); await page.keyboard.type('123', { delay: 50 }); }
  const nameInput = await page.$('input[name="billingName"], input[placeholder*="name" i], input[autocomplete="cc-name"]');
  if (nameInput) { await nameInput.click(); await page.keyboard.type('Carlos Eduardo Martínez López', { delay: 30 }); }
}

await delay(1000);

const payButton = await page.$('button[type="submit"], .SubmitButton, button[data-testid="hosted-payment-submit-button"]');
if (payButton) {
  console.log('  → Haciendo clic en el botón de pago…');
  await payButton.click();
} else {
  await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button')];
    const payBtn = btns.find(b => b.textContent.includes('Pay') || b.textContent.includes('Pagar') || b.type === 'submit');
    if (payBtn) payBtn.click();
  });
}

console.log('  ⏳ Esperando procesamiento del pago…');
try {
  await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 });
} catch (e) {
  await delay(5000);
}

const finalUrl = page.url();
console.log('  → Página final: ' + finalUrl);

if (finalUrl.includes('status=success')) {
  console.log('✅ ¡Checkout end-to-end completado con éxito!');
} else if (finalUrl.includes('status=cancelled')) {
  console.log('⚠️  El checkout fue cancelado.');
} else {
  console.log('ℹ️  Checkout terminado — verifica el resultado en el navegador.');
}

await delay(99999999);
```

**Important notes for end-to-end mode:**
- Uses Stripe's test card `4242 4242 4242 4242` with expiry `12/30` and CVC `123`
- The Stripe Checkout page is hosted at `checkout.stripe.com` — it's NOT an embedded iframe
- After payment, Stripe redirects back to `{BASE_URL}/checkout?status=success&session_id=...`
- The webhook fires asynchronously — the PDF email may arrive a few seconds after the redirect

### Post-Checkout Verification (End-to-End only)

**After the Puppeteer script finishes and the success page loads**, verify delivery using MCP tools. Do NOT include this in the Puppeteer script — run these checks yourself as Claude after the script completes.

**Wait ~15 seconds** after the success page loads to give the webhook time to process, then run these checks:

1. **Extract the `session_id`** from the final URL (the `session_id=cs_test_...` query parameter).

2. **Check Supabase submission status** using the Supabase MCP:
   ```
   Use mcp__supabase__execute_sql with project_id "cxciqefundnhkvjgogjn":
   SELECT id, status, paid_at, delivered_at, pdf_url, email, plan
   FROM submissions
   WHERE stripe_session = '{session_id}'
   ```

3. **Check Resend email delivery** using the Resend MCP:
   ```
   Use mcp__resend__list-emails to list recent sent emails
   ```

4. **Report results to the user**

## Step 4 — Assemble and Run the Full Script

Combine the helpers, dummy data constants, and the chosen form's autofill script into a single `autofill-temp.mjs` file:

```
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('...');
const CHROME = '...';
const delay = (ms) => new Promise(r => setTimeout(r, ms));
[helper functions]
const VIAJERO = {...};
const ANFITRION = {...};
(async () => {
  [chosen form's autofill script]
})();
```

Run it from the project directory:
```bash
cd "c:/Antigravity Repository/Carta Invitacion" && node autofill-temp.mjs
```

The script leaves the browser window **open and visible**. Do NOT close the browser.

## Step 5 — Report to the User

**If mode is "Solo llenar formulario":**
- Confirm the browser window is open at the review step
- Show a brief summary of the dummy data used
- Remind the user they can click "Confirmar y pagar" to proceed to payment, or "Volver y editar" to go back and change data

**If mode is "End-to-end":**
- Report whether the checkout completed successfully
- Run the Post-Checkout Verification (Supabase + Resend MCP checks)
- Report delivery status, PDF URL, and email status

## Error Handling

**If validation blocks goNext:**
- The `goNext` helper force-advances when `validateStep(n)` fails — this is expected for testing
- Common causes: phone format (must be 10 digits), missing required fields added after the skill was written
- Before running, always **read the actual HTML form file** to check for new fields that may have been added since the last update

**Known validation gotchas:**
- `phoneReq()` strips non-digits and checks `digits.length === 10` — country codes will fail
- `gastos_host_conceptos` checkboxes require `onGastosHostToggle()` to be called first to show the section
- `dest_aloj_es_anfitrion` radio name is **dynamic** (`dest_aloj_es_anfitrion_1`, `_2`, etc.) — use `input[name^="dest_aloj_es_anfitrion"]` selector
- `dest-fecha-desde` is **auto-synced and readonly** — setting it manually will be ignored or cause errors
- Travel dates must be within current year to current+5 years range
- `sal-fecha` must equal the last destination's `dest-fecha-hasta`
- The form may auto-add a destination card on load — always check `querySelectorAll('[data-destino]').length` before calling `addDestino()`
- Transport type radios (ingreso/salida) need BOTH the radio to be checked AND `onTransportType()` called explicitly
- Form functions (`goNext`, `validateStep`, `addDestino`, etc.) are in **global scope** (not `window.` prefixed). Reference them directly in `page.evaluate`.
- For the checkout submission, **click the "Confirmar y pagar" button** rather than calling `submitToAPI()` directly, since `submitToAPI` may be scoped inside a closure.

**If the browser window closes unexpectedly:**
- Ensure the script ends with `await delay(99999999)` and does NOT call `browser.close()`

## Notes

- The script uses `headless: false` so you can see the form being filled in real time
- All dummy data uses realistic Spanish-language content appropriate for a Mexican immigration context
- `page.waitForTimeout()` is REMOVED in newer Puppeteer — always use the `delay()` helper
- After the script completes, `autofill-temp.mjs` can be deleted: `rm autofill-temp.mjs`
- **Supabase project ID** for Carta Invitación: `cxciqefundnhkvjgogjn`
