import Anthropic from '@anthropic-ai/sdk';

/**
 * Polish free-text fields in the form data using Claude Haiku.
 * Corrects grammar, spelling, and ensures the vínculo description
 * is written from the host's (anfitrión) perspective.
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
  const vinculoDetalle = (d['a-vinculo-detalle'] || '').trim();
  const actividades = (d['j-actividades'] || '').trim();

  // Nothing to polish
  if (!vinculoDetalle && !actividades) return d;

  try {
    const client = new Anthropic({ apiKey });

    const prompt = buildPrompt(vinculoDetalle, actividades);

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      temperature: 0.3,
      system: `Eres un editor que corrige y pule texto en español para cartas formales de invitación a México. Solo corrige gramática, ortografía y fluidez. NO cambies la información ni agregues datos nuevos. Devuelve SOLO el JSON solicitado, sin markdown ni explicaciones.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0]?.text || '';
    const result = parseResponse(text);

    if (result.vinculo_detalle && vinculoDetalle) {
      d['a-vinculo-detalle'] = result.vinculo_detalle;
    }
    if (result.actividades && actividades) {
      d['j-actividades'] = result.actividades;
    }

    console.log('[polish] Fields polished successfully');
  } catch (err) {
    console.error('[polish] Haiku call failed (non-blocking):', err.message || err);
    // Return original data — the letter still generates fine without polish
  }

  return d;
}

function buildPrompt(vinculoDetalle, actividades) {
  const parts = [];

  if (vinculoDetalle) {
    parts.push(
      `VÍNCULO:\n"${vinculoDetalle}"\nEste texto ya está desde la perspectiva del anfitrión. Solo corrige gramática, ortografía y mejora la fluidez si es necesario.\nReglas: mantén el tono formal pero natural. No inventes información.`
    );
  }

  if (actividades) {
    parts.push(
      `ACTIVIDADES:\n"${actividades}"\nCorrige gramática y ortografía. Mantén todo el contenido original. No agregues ni quites actividades.`
    );
  }

  return parts.join('\n\n---\n\n') +
    '\n\nDevuelve un JSON con las claves "vinculo_detalle" y "actividades" (solo las que apliquen). Ejemplo:\n{"vinculo_detalle": "texto pulido", "actividades": "texto pulido"}';
}

function parseResponse(text) {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Parsing failed
  }
  return {};
}
