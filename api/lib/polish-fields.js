import Anthropic from '@anthropic-ai/sdk';

/**
 * Polish ALL free-text fields in the form data using Claude Haiku.
 * Corrects grammar, spelling, punctuation, and capitalization for:
 *   - a-vinculo-detalle (host–visitor relationship)
 *   - j-actividades (Plan Esencial trip activities)
 *   - a-ocupacion, v-ocupacion (host & visitor occupation)
 *   - a-parentesco-otro (custom relationship label)
 *   - gastos-otro-texto (custom expense description)
 *   - Each companion's vinculo_detalle and ocupacion
 *   - Each destino's actividades (Plan Completo)
 *
 * If the API key is not set or the call fails, returns the original
 * data unchanged (graceful degradation — the letter still works).
 *
 * @param {object} formData — form fields
 * @returns {Promise<object>} formData with polished text fields
 */
export default async function polishFields(formData) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log('[polish] ANTHROPIC_API_KEY not set — skipping polish');
    return formData;
  }

  const d = { ...formData };
  if (d.companions) {
    d.companions = d.companions.map(c => ({ ...c }));
  }
  if (d.destinos) {
    d.destinos = d.destinos.map(dest => ({ ...dest }));
  }

  // Collect all free-text fields
  const fields = collectFields(d);

  // Nothing to polish?
  if (!fields.hasContent) return d;

  try {
    const client = new Anthropic({ apiKey });

    const prompt = buildPrompt(fields);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
      temperature: 0.3,
      system: `Eres un editor que corrige y pule texto en español para cartas formales de invitación a México.
Reglas estrictas:
- Corrige gramática, ortografía, puntuación y acentos.
- Cada texto corregido DEBE empezar con letra mayúscula.
- Mantén un tono formal pero natural, apropiado para un documento migratorio.
- NO cambies la información ni agregues datos nuevos.
- NO inventes hechos, fechas, nombres ni relaciones que no estén en el texto original.
- Si el texto original es muy informal o coloquial, reformúlalo en tono formal conservando el significado.
- Para ocupaciones: solo corrige ortografía y capitalización (ej. "injeniero" → "Ingeniero").
- Devuelve SOLO el JSON solicitado, sin markdown ni explicaciones.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text || '';
    const result = parseResponse(text);

    applyResults(d, fields, result);

    console.log('[polish] Fields polished successfully');
  } catch (err) {
    console.error('[polish] Haiku call failed (non-blocking):', err.message || err);
  }

  return d;
}

function collectFields(d) {
  const f = {
    vinculoDetalle: (d['a-vinculo-detalle'] || '').trim(),
    actividades: (d['j-actividades'] || '').trim(),
    aOcupacion: (d['a-ocupacion'] || '').trim(),
    vOcupacion: (d['v-ocupacion'] || '').trim(),
    parentescoOtro: (d['a-parentesco-otro'] || '').trim(),
    gastosOtro: (d['gastos-otro-texto'] || '').trim(),
    companionVinculos: (d.companions || []).map(c => (c.vinculo_detalle || '').trim()),
    companionOcupaciones: (d.companions || []).map(c => (c.ocupacion || '').trim()),
    destinoActividades: (d.destinos || []).map(dest => (dest.actividades || '').trim()),
  };

  f.hasContent =
    f.vinculoDetalle || f.actividades || f.aOcupacion || f.vOcupacion ||
    f.parentescoOtro || f.gastosOtro ||
    f.companionVinculos.some(t => t) ||
    f.companionOcupaciones.some(t => t) ||
    f.destinoActividades.some(t => t);

  return f;
}

function buildPrompt(f) {
  const parts = [];

  // --- Prose fields ---
  if (f.vinculoDetalle) {
    parts.push(
      `VÍNCULO PRINCIPAL:\n"${f.vinculoDetalle}"\nDescripción de la relación entre anfitrión y viajero principal. Corrige gramática, ortografía y puntuación. La primera letra debe ser mayúscula.`
    );
  }

  if (f.actividades) {
    parts.push(
      `ACTIVIDADES:\n"${f.actividades}"\nCorrige gramática y ortografía. Mantén todo el contenido original. No agregues ni quites actividades.`
    );
  }

  if (f.parentescoOtro) {
    parts.push(
      `PARENTESCO PERSONALIZADO:\n"${f.parentescoOtro}"\nEtiqueta corta de parentesco (ej. "primo segundo"). Solo corrige ortografía y capitalización.`
    );
  }

  if (f.gastosOtro) {
    parts.push(
      `GASTOS ADICIONALES:\n"${f.gastosOtro}"\nDescripción de gastos que el anfitrión cubrirá. Corrige gramática y ortografía.`
    );
  }

  // --- Short fields (occupations) ---
  const ocups = [];
  if (f.aOcupacion) ocups.push(`  Anfitrión: "${f.aOcupacion}"`);
  if (f.vOcupacion) ocups.push(`  Viajero: "${f.vOcupacion}"`);
  f.companionOcupaciones.forEach((t, i) => {
    if (t) ocups.push(`  Acompañante ${i + 1}: "${t}"`);
  });
  if (ocups.length > 0) {
    parts.push(
      `OCUPACIONES:\n${ocups.join('\n')}\nSolo corrige ortografía y capitalización. No cambies el significado. Devuelve un objeto con las claves "a_ocupacion", "v_ocupacion", y/o "companion_ocupaciones" (array en orden, null para vacíos).`
    );
  }

  // --- Array fields ---
  const nonEmptyCompanions = f.companionVinculos.filter(t => t);
  if (nonEmptyCompanions.length > 0) {
    const list = f.companionVinculos.map((t, i) =>
      t ? `  Acompañante ${i + 1}: "${t}"` : `  Acompañante ${i + 1}: (vacío)`
    ).join('\n');
    parts.push(
      `VÍNCULOS DE ACOMPAÑANTES:\n${list}\nCorrige gramática, ortografía y puntuación de cada uno. La primera letra de cada texto debe ser mayúscula. Devuelve un array en el mismo orden (usa null para los vacíos).`
    );
  }

  const nonEmptyDestinos = f.destinoActividades.filter(t => t);
  if (nonEmptyDestinos.length > 0) {
    const list = f.destinoActividades.map((t, i) =>
      t ? `  Destino ${i + 1}: "${t}"` : `  Destino ${i + 1}: (vacío)`
    ).join('\n');
    parts.push(
      `ACTIVIDADES POR DESTINO:\n${list}\nCorrige gramática y ortografía de cada uno. Mantén todo el contenido original. No agregues ni quites actividades. Devuelve un array en el mismo orden (usa null para los vacíos).`
    );
  }

  // --- JSON keys ---
  const keys = [];
  if (f.vinculoDetalle) keys.push('"vinculo_detalle": "..."');
  if (f.actividades) keys.push('"actividades": "..."');
  if (f.parentescoOtro) keys.push('"parentesco_otro": "..."');
  if (f.gastosOtro) keys.push('"gastos_otro": "..."');
  if (ocups.length > 0) {
    const subkeys = [];
    if (f.aOcupacion) subkeys.push('"a_ocupacion": "..."');
    if (f.vOcupacion) subkeys.push('"v_ocupacion": "..."');
    if (f.companionOcupaciones.some(t => t)) subkeys.push('"companion_ocupaciones": [...]');
    keys.push(...subkeys);
  }
  if (nonEmptyCompanions.length > 0) keys.push('"companion_vinculos": [...]');
  if (nonEmptyDestinos.length > 0) keys.push('"destino_actividades": [...]');

  return parts.join('\n\n---\n\n') +
    `\n\nDevuelve un JSON con estas claves: {${keys.join(', ')}}`;
}

function applyResults(d, f, result) {
  if (result.vinculo_detalle && f.vinculoDetalle) {
    d['a-vinculo-detalle'] = result.vinculo_detalle;
  }
  if (result.actividades && f.actividades) {
    d['j-actividades'] = result.actividades;
  }
  if (result.parentesco_otro && f.parentescoOtro) {
    d['a-parentesco-otro'] = result.parentesco_otro;
  }
  if (result.gastos_otro && f.gastosOtro) {
    d['gastos-otro-texto'] = result.gastos_otro;
  }
  if (result.a_ocupacion && f.aOcupacion) {
    d['a-ocupacion'] = result.a_ocupacion;
  }
  if (result.v_ocupacion && f.vOcupacion) {
    d['v-ocupacion'] = result.v_ocupacion;
  }
  if (result.companion_ocupaciones && Array.isArray(result.companion_ocupaciones)) {
    result.companion_ocupaciones.forEach((polished, i) => {
      if (polished && d.companions?.[i] && f.companionOcupaciones[i]) {
        d.companions[i].ocupacion = polished;
      }
    });
  }
  if (result.companion_vinculos && Array.isArray(result.companion_vinculos)) {
    result.companion_vinculos.forEach((polished, i) => {
      if (polished && d.companions?.[i] && f.companionVinculos[i]) {
        d.companions[i].vinculo_detalle = polished;
      }
    });
  }
  if (result.destino_actividades && Array.isArray(result.destino_actividades)) {
    result.destino_actividades.forEach((polished, i) => {
      if (polished && d.destinos?.[i] && f.destinoActividades[i]) {
        d.destinos[i].actividades = polished;
      }
    });
  }
}

function parseResponse(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Parsing failed
  }
  return {};
}
