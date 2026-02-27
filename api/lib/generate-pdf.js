import PDFDocument from 'pdfkit';

const NAVY = '#1B3566';
const GRAY = '#4B5563';
const LIGHT_GRAY = '#9CA3AF';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function entryLabel(tipo) {
  if (tipo === 'aereo') return 'Vía aérea';
  if (tipo === 'terrestre') return 'Vía terrestre';
  if (tipo === 'maritimo') return 'Vía marítima';
  return tipo || '—';
}

function gastoLabel(val) {
  if (val === 'visitante') return 'El visitante';
  if (val === 'anfitrion') return 'El anfitrión';
  if (val === 'ambos') return 'Ambos';
  return val || '—';
}

function transportLabel(arr) {
  if (!arr || !arr.length) return '—';
  const map = {
    avion: 'Avión interno',
    autobus: 'Autobús',
    auto_rentado: 'Auto rentado',
    anfitrion: 'Transporte del anfitrión',
    otro: 'Otro',
  };
  return arr.map(t => map[t] || t).join(', ');
}

/**
 * Generate the invitation letter PDF.
 * @param {object} formData — form fields from Supabase
 * @param {'esencial'|'completo'} plan
 * @returns {Promise<Buffer>} PDF as a buffer
 */
export default function generatePDF(formData, plan) {
  return new Promise((resolve, reject) => {
    const d = formData;
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 60, bottom: 60, left: 65, right: 65 },
      info: {
        Title: 'Carta de Invitación a México',
        Author: 'carta-invitacion-mexico.com',
      },
    });

    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const W = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    /* ─── Header ─── */
    doc.fontSize(20).fillColor(NAVY).font('Helvetica-Bold')
      .text('CARTA DE INVITACIÓN', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor(LIGHT_GRAY).font('Helvetica')
      .text('carta-invitacion-mexico.com', { align: 'center' });
    doc.moveDown(0.6);

    // Horizontal rule
    doc.moveTo(doc.x, doc.y).lineTo(doc.x + W, doc.y)
      .strokeColor(NAVY).lineWidth(1.5).stroke();
    doc.moveDown(1);

    /* ─── Date & Addressee ─── */
    const today = new Date();
    const dateStr = `${today.getDate()} de ${MONTHS_ES[today.getMonth()]} de ${today.getFullYear()}`;
    const hostCity = d['a-ciudad'] || 'México';
    const hostState = d['a-estado'] || '';

    doc.fontSize(10).fillColor(GRAY).font('Helvetica')
      .text(`${hostCity}${hostState ? ', ' + hostState : ''}, a ${dateStr}`, { align: 'right' });
    doc.moveDown(1.2);

    doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
      .text('Instituto Nacional de Migración');
    doc.font('Helvetica').fillColor(GRAY)
      .text('Presente');
    doc.moveDown(1);

    /* ─── Body intro ─── */
    const hostName = d['a-nombre'] || '';
    const hostIdTipo = d['a-id-tipo'] || 'identificación oficial';
    const hostIdNum = d['a-id-num'] || '';
    const hostAddr = [d['a-calle'], d['a-colonia'], d['a-delegacion'], d['a-ciudad'], d['a-estado'], d['a-cp']].filter(Boolean).join(', ');
    const vinculo = d['a-vinculo'] || 'conocido';

    doc.fontSize(10).fillColor('#1F2937').font('Helvetica')
      .text(
        `Yo, ${hostName}, con ${hostIdTipo} número ${hostIdNum}, ` +
        `con domicilio en ${hostAddr}, por medio de la presente me permito extender una cordial ` +
        `invitación a la(s) persona(s) que a continuación se detalla(n), con quien(es) mantengo una ` +
        `relación de ${vinculo}, para que visite(n) los Estados Unidos Mexicanos con fines turísticos ` +
        `y/o personales.`,
        { lineGap: 3 }
      );
    doc.moveDown(1);

    /* ─── Section helper ─── */
    function sectionTitle(text) {
      doc.moveDown(0.3);
      doc.fontSize(11).fillColor(NAVY).font('Helvetica-Bold').text(text);
      doc.moveTo(doc.x, doc.y + 2).lineTo(doc.x + W, doc.y + 2)
        .strokeColor('#D1D5DB').lineWidth(0.5).stroke();
      doc.moveDown(0.6);
    }

    function field(label, value) {
      doc.fontSize(9).fillColor(LIGHT_GRAY).font('Helvetica').text(label, { continued: true });
      doc.fillColor('#1F2937').font('Helvetica').text(`  ${value || '—'}`);
      doc.moveDown(0.15);
    }

    /* ─── Datos del visitante ─── */
    sectionTitle('DATOS DEL VISITANTE');
    field('Nombre completo:', d['v-nombre']);
    field('Fecha de nacimiento:', fmtDate(d['v-nacimiento']));
    field('Nacionalidad:', d['v-nacionalidad']);
    field('Número de pasaporte:', d['v-pasaporte']);
    field('País de residencia:', d['v-residencia']);
    const visitorAddr = [d['v-calle'], d['v-ciudad'], d['v-provincia'], d['v-cp']].filter(Boolean).join(', ');
    field('Domicilio:', visitorAddr);
    field('Ocupación:', d['v-ocupacion']);

    /* ─── Companions (Plan Completo only) ─── */
    if (plan === 'completo' && d.companions && d.companions.length) {
      sectionTitle('ACOMPAÑANTES');
      d.companions.forEach((c, i) => {
        doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
          .text(`Acompañante ${i + 1}`);
        doc.moveDown(0.2);
        field('Nombre:', c.nombre);
        field('Fecha de nacimiento:', fmtDate(c.nacimiento));
        field('Nacionalidad:', c.nacionalidad);
        field('Pasaporte:', c.pasaporte);
        field('Relación con el viajero:', c.relacion);
        doc.moveDown(0.3);
      });
    }

    /* ─── Datos del anfitrión ─── */
    sectionTitle('DATOS DEL ANFITRIÓN');
    field('Nombre completo:', hostName);
    field('Fecha de nacimiento:', fmtDate(d['a-nacimiento']));
    field('Identificación:', `${hostIdTipo} — ${hostIdNum}`);
    field('Domicilio:', hostAddr);
    field('Teléfono de contacto:', d['a-telefono']);
    field('Vínculo con el visitante:', vinculo);

    /* ─── Trip details ─── */
    if (plan === 'esencial') {
      sectionTitle('DATOS DEL VIAJE');
      field('Fecha de llegada:', fmtDate(d['ing-fecha']));
      field('Fecha de regreso:', fmtDate(d['sal-fecha']));
      field('Duración de la estancia:', `${d['j-duracion'] || '—'} días`);
      field('Ingreso a México:', entryLabel(d['ingreso_tipo']));
      if (d['ingreso_tipo'] === 'aereo') {
        field('Aeropuerto de ingreso:', d['ing-aeropuerto']);
        field('Aerolínea / Vuelo:', `${d['ing-aerolinea'] || ''} ${d['ing-vuelo'] || ''}`.trim());
      } else if (d['ingreso_tipo'] === 'terrestre') {
        field('Punto de cruce:', d['ing-cruce']);
      } else if (d['ingreso_tipo'] === 'maritimo') {
        field('Puerto de ingreso:', d['ing-puerto']);
      }
      field('Salida de México:', entryLabel(d['salida_tipo']));
      if (d['salida_tipo'] === 'aereo') {
        field('Aeropuerto de salida:', d['sal-aeropuerto']);
        field('Aerolínea / Vuelo:', `${d['sal-aerolinea'] || ''} ${d['sal-vuelo'] || ''}`.trim());
      } else if (d['salida_tipo'] === 'terrestre') {
        field('Punto de cruce:', d['sal-cruce']);
      } else if (d['salida_tipo'] === 'maritimo') {
        field('Puerto de salida:', d['sal-puerto']);
      }
      doc.moveDown(0.3);
      field('Actividades planeadas:', d['j-actividades']);
      doc.moveDown(0.3);

      const alojAddr = [d['j-al-calle'], d['j-al-colonia'], d['j-al-ciudad'], d['j-al-estado'], d['j-al-cp']].filter(Boolean).join(', ');
      field('Alojamiento:', d['j-aloj-nombre'] ? `${d['j-aloj-nombre']} — ${alojAddr}` : alojAddr);
    }

    /* ─── Itinerary (Plan Completo) ─── */
    if (plan === 'completo') {
      sectionTitle('ITINERARIO DE VIAJE');

      field('Ingreso a México:', entryLabel(d['ingreso_tipo']));
      field('Fecha de llegada:', fmtDate(d['ing-fecha']));
      if (d['ingreso_tipo'] === 'aereo') {
        field('Aeropuerto:', d['ing-aeropuerto']);
        field('Aerolínea / Vuelo:', `${d['ing-aerolinea'] || ''} ${d['ing-vuelo'] || ''}`.trim());
      } else if (d['ingreso_tipo'] === 'terrestre') {
        field('Punto de cruce:', d['ing-cruce']);
      } else if (d['ingreso_tipo'] === 'maritimo') {
        field('Puerto:', d['ing-puerto']);
      }
      doc.moveDown(0.4);

      if (d.destinos && d.destinos.length) {
        d.destinos.forEach((dest, i) => {
          doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
            .text(`Destino ${i + 1}: ${dest.ciudad}`);
          doc.moveDown(0.2);
          field('Fechas:', `${fmtDate(dest.fecha_desde)} — ${fmtDate(dest.fecha_hasta)}`);
          field('Actividades:', dest.actividades);
          const alojAddr = [dest.aloj_calle, dest.aloj_colonia, dest.aloj_delegacion, dest.aloj_ciudad, dest.aloj_estado, dest.aloj_cp].filter(Boolean).join(', ');
          field('Alojamiento:', dest.aloj_nombre ? `${dest.aloj_nombre} — ${alojAddr}` : alojAddr);
          doc.moveDown(0.3);
        });
      }

      doc.moveDown(0.2);
      field('Salida de México:', entryLabel(d['salida_tipo']));
      field('Fecha de regreso:', fmtDate(d['sal-fecha']));
      if (d['salida_tipo'] === 'aereo') {
        field('Aeropuerto:', d['sal-aeropuerto']);
        field('Aerolínea / Vuelo:', `${d['sal-aerolinea'] || ''} ${d['sal-vuelo'] || ''}`.trim());
      } else if (d['salida_tipo'] === 'terrestre') {
        field('Punto de cruce:', d['sal-cruce']);
      } else if (d['salida_tipo'] === 'maritimo') {
        field('Puerto:', d['sal-puerto']);
      }
    }

    /* ─── Gastos ─── */
    sectionTitle('GASTOS DEL VIAJE');
    field('Hospedaje:', gastoLabel(d['g_hospedaje']));
    field('Alimentos:', gastoLabel(d['g_alimentos']));
    field('Transporte:', gastoLabel(d['g_transporte']));
    field('Actividades turísticas:', gastoLabel(d['g_actividades']));
    field('Gastos médicos / emergencias:', gastoLabel(d['g_medicos']));
    doc.moveDown(0.2);
    field('Medios de transporte en México:', transportLabel(d['transporte_mx']));

    /* ─── Disclaimer ─── */
    doc.moveDown(1);
    doc.moveTo(doc.x, doc.y).lineTo(doc.x + W, doc.y)
      .strokeColor('#D1D5DB').lineWidth(0.5).stroke();
    doc.moveDown(0.5);
    doc.fontSize(8).fillColor(LIGHT_GRAY).font('Helvetica')
      .text(
        'AVISO: Esta carta de invitación es un documento informativo redactado con el fin de facilitar el ingreso ' +
        'del visitante a los Estados Unidos Mexicanos como turista. No constituye asesoría legal ni garantiza la ' +
        'entrada al país, ya que la decisión final corresponde al agente migratorio en el punto de internación. ' +
        'El firmante declara que los datos proporcionados son verídicos y asume la responsabilidad correspondiente.',
        { lineGap: 2 }
      );

    /* ─── Signature block ─── */
    doc.moveDown(2);
    doc.fontSize(10).fillColor('#1F2937').font('Helvetica')
      .text('Atentamente,', { align: 'left' });
    doc.moveDown(2.5);

    // Signature line
    const lineY = doc.y;
    doc.moveTo(doc.x, lineY).lineTo(doc.x + 200, lineY)
      .strokeColor(NAVY).lineWidth(0.8).stroke();
    doc.moveDown(0.3);
    doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
      .text(hostName);
    doc.fontSize(9).fillColor(GRAY).font('Helvetica')
      .text(`${hostIdTipo} — ${hostIdNum}`);

    doc.end();
  });
}
