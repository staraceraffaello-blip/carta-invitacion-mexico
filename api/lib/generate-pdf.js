import PDFDocument from 'pdfkit';

const BLACK = '#000000';
const GRAY_SIG = '#333333';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

const ID_LABELS = {
  ine: 'INE',
  pasaporte: 'Pasaporte mexicano',
  residente: 'Tarjeta de residente',
};

const TRANSPORTE_LABELS = {
  auto_rentado: 'auto rentado',
  anfitrion: 'transporte del anfitrión',
  transporte_publico: 'transporte público y/o taxis',
};

const PARENTESCO_LABELS = {
  padre:       { m: 'padre',       f: 'madre' },
  hijo:        { m: 'hijo',        f: 'hija' },
  hermano:     { m: 'hermano',     f: 'hermana' },
  abuelo:      { m: 'abuelo',      f: 'abuela' },
  nieto:       { m: 'nieto',       f: 'nieta' },
  bisabuelo:   { m: 'bisabuelo',   f: 'bisabuela' },
  bisnieto:    { m: 'bisnieto',    f: 'bisnieta' },
  tio:         { m: 'tío',         f: 'tía' },
  sobrino:     { m: 'sobrino',     f: 'sobrina' },
  primo:       { m: 'primo',       f: 'prima' },
  suegro:      { m: 'suegro',      f: 'suegra' },
  yerno:       { m: 'yerno',       f: 'nuera' },
  cunado:      { m: 'cuñado',      f: 'cuñada' },
  concuno:     { m: 'concuño',     f: 'concuña' },
  padrastro:   { m: 'padrastro',   f: 'madrastra' },
  hijastro:    { m: 'hijastro',    f: 'hijastra' },
  hermanastro: { m: 'hermanastro', f: 'hermanastra' },
  // Pareja sub-types
  conyuge:     { m: 'cónyuge',     f: 'cónyuge' },
  concubino:   { m: 'concubino',   f: 'concubina' },
  novio:       { m: 'novio',       f: 'novia' },
};


const CONSANGUINEOUS = ['padre','hijo','hermano','abuelo','nieto','bisabuelo','bisnieto','tio','sobrino','primo'];

const GASTOS_LABELS = {
  alojamiento: 'alojamiento',
  alimentos: 'alimentos',
  transporte: 'transporte',
  actividades: 'actividades turísticas',
  medicos: 'gastos médicos de emergencia',
};

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${d.getFullYear()}`;
}

function fmtDateShort(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Build human-readable time string from años/meses, skipping zeros. */
function buildTiempoStr(anios, meses) {
  const a = parseInt(anios, 10) || 0;
  const m = parseInt(meses, 10) || 0;
  const parts = [];
  if (a > 0) parts.push(`${a} año${a > 1 ? 's' : ''}`);
  if (m > 0) parts.push(`${m} mes${m > 1 ? 'es' : ''}`);
  return parts.join(' y ') || '';
}

/** Build fluent transport list: "auto rentado, transporte del anfitrión y transporte público" */
function buildTransportList(arr) {
  if (!arr || !arr.length) return '—';
  const labels = arr.map(t => TRANSPORTE_LABELS[t] || t);
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  return labels.slice(0, -1).join(', ') + ' y ' + labels[labels.length - 1];
}

/** Build gastos list: "alimentos, transporte y actividades turísticas" */
function buildGastosList(conceptos, otroTexto) {
  if (!conceptos || !conceptos.length) return '';
  const labels = conceptos.map(c => {
    if (c === 'otro') return otroTexto ? otroTexto.toLowerCase() : 'otros gastos';
    return GASTOS_LABELS[c] || c;
  });
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} y ${labels[1]}`;
  return labels.slice(0, -1).join(', ') + ' y ' + labels[labels.length - 1];
}

/** Build motivo phrase for the invitation paragraph. */
function buildMotivoParagraph(motivo) {
  const map = {
    turismo: 'con fines turísticos y sin ejercer actividad remunerada alguna',
    negocios: 'con fines de negocios y sin ejercer actividad remunerada alguna',
    estudios: 'con fines de estudios y sin ejercer actividad remunerada alguna',
    actividades_no_remuneradas: 'para realizar actividades no remuneradas',
    transito: 'en tránsito y sin ejercer actividad remunerada alguna',
    tratamientos_medicos: 'para recibir tratamiento médico y sin ejercer actividad remunerada alguna',
  };
  return map[motivo] || 'con fines turísticos y sin ejercer actividad remunerada alguna';
}

/**
 * Generate the invitation letter PDF (formal letter format).
 * @param {object} formData — form fields
 * @param {'esencial'|'completo'} plan
 * @returns {Promise<Buffer>} PDF as a buffer
 */
export default function generatePDF(formData, plan) {
  return new Promise((resolve, reject) => {
    const d = formData;
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 55, bottom: 50, left: 65, right: 65 },
      info: {
        Title: 'Carta de Invitación a México',
      },
    });

    const chunks = [];
    doc.on('data', c => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const LINE_GAP = 2;
    const BODY_SIZE = 9.5;

    /* ─── Date & Addressee ─── */
    const now = new Date();
    const dateStr = `${now.getDate()} de ${MONTHS_ES[now.getMonth()]} de ${now.getFullYear()}`;
    const hostCity = d['a-ciudad'] || 'México';
    const hostState = d['a-estado'] || '';

    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
      .text(`${hostCity}${hostState && hostState !== hostCity ? ', ' + hostState : ''}, a ${dateStr}.`, { align: 'right' });
    doc.moveDown(0.8);

    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica-Bold')
      .text('ASUNTO: Carta de invitación', { lineGap: LINE_GAP });
    doc.moveDown(0.4);

    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
      .text('A quien corresponda:', { lineGap: LINE_GAP });
    doc.moveDown(0.6);

    /* ─── Extract all data ─── */
    const hostName = d['a-nombre'] || '';
    const hostNacionalidad = d['a-nacionalidad'] || '';
    const hostNacimiento = fmtDate(d['a-nacimiento']);
    const hostIdTipo = ID_LABELS[d['a-id-tipo']] || d['a-id-tipo'] || 'identificación oficial';
    const hostIdNum = d['a-id-num'] || '';
    const hostAddr = [d['a-calle'], d['a-colonia'], d['a-delegacion'], d['a-ciudad'], d['a-estado'] !== d['a-ciudad'] ? d['a-estado'] : '', 'C.P. ' + (d['a-cp'] || ''), 'México'].filter(Boolean).join(', ');
    const hostOcupacion = d['a-ocupacion'] || '';
    const hostEmpresa = d['a-empresa'] || '';
    const hostTelefono = d['a-telefono'] || '';
    const hostEmail = d['a-email'] || '';

    const visitorName = d['v-nombre'] || '';
    const visitorNacimiento = fmtDateShort(d['v-nacimiento']);
    const visitorNacionalidad = d['v-nacionalidad'] || '';
    const visitorPasaporte = d['v-pasaporte'] || '';
    const visitorOcupacion = d['v-ocupacion'] || '';
    const visitorResidencia = d['v-residencia'] || '';
    const visitorAddr = [d['v-calle'], d['v-ciudad'], d['v-provincia'], 'C.P. ' + (d['v-cp'] || ''), visitorResidencia].filter(Boolean).join(', ');

    const hostGenero = d['a-genero'] || 'masculino';
    const visitorGenero = d['v-genero'] || 'masculino';

    const vinculo = d['a-vinculo'] || 'conocido';
    const vinculoDetalle = d['a-vinculo-detalle'] || '';
    const tiempoStr = buildTiempoStr(d['a-tiempo-anios'], d['a-tiempo-meses']);

    // Resolve parentesco for the letter (always from host's perspective — no inversion needed)
    const parentescoRaw = d['a-parentesco'] || '';
    const parentescoOtro = d['a-parentesco-otro'] || '';
    const gKey = visitorGenero === 'femenino' ? 'f' : 'm';
    const parentescoLabel = parentescoRaw === 'otro_familiar'
      ? parentescoOtro
      : (PARENTESCO_LABELS[parentescoRaw]?.[gKey] || '');

    const motivo = d['j-motivo'] || 'turismo';
    const motivoPhrase = buildMotivoParagraph(motivo);
    const actividades = d['j-actividades'] || '';
    const fechaLlegada = fmtDate(d['ing-fecha']);
    const fechaSalida = fmtDate(d['sal-fecha']);
    const totalDias = Math.round((new Date(d['sal-fecha']) - new Date(d['ing-fecha'])) / 86400000) + 1;
    const diasStr = totalDias === 1 ? '1 día' : `${totalDias} días`;

    const ingresoTipo = d['ingreso_tipo'] || '';
    const salidaTipo = d['salida_tipo'] || '';

    /* ─── Intro paragraph ─── */
    let empresaStr = '';
    if (hostEmpresa) empresaStr = ` en ${hostEmpresa}`;

    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
      .text(
        `Por medio de la presente, yo, ${hostName}, de nacionalidad ${hostNacionalidad}, ` +
        `con fecha de nacimiento ${hostNacimiento}, con domicilio en ${hostAddr}, ` +
        `${hostGenero === 'femenino' ? 'portadora' : 'portador'} de ${hostIdTipo} número ${hostIdNum}, ` +
        `de ocupación ${hostOcupacion}${empresaStr}, ` +
        `manifiesto bajo protesta de decir verdad que extiendo formal invitación a:`,
        { lineGap: LINE_GAP, align: 'justify' }
      );
    doc.moveDown(0.5);

    /* ─── Traveler data block ─── */
    const hasCompanions = plan === 'completo' && d.companions && d.companions.length;

    // Singular / plural references used across multiple paragraphs
    const refInvitados = hasCompanions ? 'los invitados' : (visitorGenero === 'femenino' ? 'la invitada' : 'el invitado');
    const refInvitadosCap = hasCompanions ? 'Los invitados' : (visitorGenero === 'femenino' ? 'La invitada' : 'El invitado');
    const refNombreOPlural = hasCompanions ? refInvitados : visitorName;

    /** Build vínculo phrase for a traveler bullet. */
    function vinculoPhrase(vType, parLabel, parRaw, detalle, tiempo) {
      let phrase;
      if ((vType === 'familiar' || vType === 'pareja') && parLabel) {
        phrase = `Es mi ${parLabel}.`;
      } else {
        phrase = `Mantenemos una relación de ${vType}.`;
      }
      if (detalle) {
        const detClean = detalle.replace(/\.+$/, '');
        phrase += ` ${detClean}.`;
      }
      const isCons = vType === 'familiar' && CONSANGUINEOUS.includes(parRaw);
      if (tiempo && !isCons) phrase += ` Nos conocemos desde hace ${tiempo}.`;
      return phrase;
    }

    if (hasCompanions) {
      /* ── Bullet-point format: multiple travelers ── */
      const BULLET_INDENT = 14;
      const textX = doc.page.margins.left + BULLET_INDENT;
      const textW = doc.page.width - doc.page.margins.left - doc.page.margins.right - BULLET_INDENT;

      function writeBullet(text) {
        const bulletY = doc.y;
        doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
          .text('\u2022', doc.page.margins.left, bulletY);
        doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
          .text(text, textX, bulletY, { width: textW, lineGap: LINE_GAP, align: 'justify' });
        doc.moveDown(0.3);
      }

      // Main traveler bullet
      const mainVPhrase = vinculoPhrase(vinculo, parentescoLabel, parentescoRaw, vinculoDetalle, tiempoStr);
      writeBullet(
        `${visitorName}, de nacionalidad ${visitorNacionalidad}, ` +
        `nacid${visitorGenero === 'femenino' ? 'a' : 'o'} el ${visitorNacimiento}, ` +
        `${visitorGenero === 'femenino' ? 'portadora' : 'portador'} de pasaporte N.º ${visitorPasaporte}, ` +
        `de ocupación ${visitorOcupacion}, con domicilio en ${visitorAddr}. ${mainVPhrase}`
      );

      // Companion bullets
      d.companions.forEach((comp) => {
        const compGenero = comp.genero || 'masculino';
        const cVinculo = comp.vinculo || 'conocido';
        const cParRaw = comp.parentesco || '';
        const cParOtro = comp.parentesco_otro || '';
        const cGKey = compGenero === 'femenino' ? 'f' : 'm';
        const cParLabel = cParRaw === 'otro_familiar'
          ? cParOtro
          : (PARENTESCO_LABELS[cParRaw]?.[cGKey] || '');
        const cDetalle = comp.vinculo_detalle || '';
        const cTiempo = buildTiempoStr(comp.tiempo_anios, comp.tiempo_meses);
        const cVPhrase = vinculoPhrase(cVinculo, cParLabel, cParRaw, cDetalle, cTiempo);
        writeBullet(
          `${comp.nombre || '—'}, de nacionalidad ${comp.nacionalidad || '—'}, ` +
          `nacid${compGenero === 'femenino' ? 'a' : 'o'} el ${fmtDateShort(comp.nacimiento)}, ` +
          `${compGenero === 'femenino' ? 'portadora' : 'portador'} de pasaporte N.º ${comp.pasaporte || '—'}. ${cVPhrase}`
        );
      });
      doc.moveDown(0.2);
      // Reset X to left margin for subsequent paragraphs
      doc.x = doc.page.margins.left;
    } else {
      /* ── Fluent paragraph: single traveler ── */
      const singleConsanguineous = vinculo === 'familiar' && CONSANGUINEOUS.includes(parentescoRaw) && parentescoLabel;
      const nameFragment = singleConsanguineous
        ? `${visitorName}, mi ${parentescoLabel},`
        : `${visitorName},`;
      const singleVisitorText =
        `${nameFragment} de nacionalidad ${visitorNacionalidad}, ` +
        `nacid${visitorGenero === 'femenino' ? 'a' : 'o'} el ${visitorNacimiento}, ` +
        `${visitorGenero === 'femenino' ? 'portadora' : 'portador'} de pasaporte N.º ${visitorPasaporte}, ` +
        `de ocupación ${visitorOcupacion}, con domicilio en ${visitorAddr}.`;
      doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
        .text(singleVisitorText, { lineGap: LINE_GAP, align: 'justify' });
      doc.moveDown(0.5);
    }

    /* ─── Vínculo paragraph (single traveler only — bullets already include this) ─── */
    /* For consanguineous relatives the vínculo is already merged into the visitor paragraph above */
    if (!hasCompanions) {
      const isConsanguineous = vinculo === 'familiar' && CONSANGUINEOUS.includes(parentescoRaw);
      if (!isConsanguineous) {
        let vinculoPara;
        if ((vinculo === 'familiar' || vinculo === 'pareja') && parentescoLabel) {
          vinculoPara = `${visitorName} es mi ${parentescoLabel}.`;
        } else {
          vinculoPara = `${visitorName} y quien suscribe mantenemos una relación de ${vinculo}.`;
        }
        if (vinculoDetalle) {
          const detClean = vinculoDetalle.replace(/\.+$/, '');
          vinculoPara += ` ${detClean}.`;
        }
        if (tiempoStr) vinculoPara += ` Nos conocemos desde hace ${tiempoStr}.`;

        doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
          .text(vinculoPara, { lineGap: LINE_GAP, align: 'justify' });
      }
    }
    doc.moveDown(0.4);

    /* ─── Invitation purpose + entry/exit (combined paragraph) ─── */
    const actividadesClean = actividades.replace(/\.+$/, '');
    const invitadosRef = hasCompanions
      ? 'las personas antes mencionadas visiten'
      : `${refInvitados} visite`;
    const realizara = hasCompanions ? 'realizarán' : 'realizará';

    let purposePara = `La presente invitación tiene como objeto que ${invitadosRef} México ${motivoPhrase}.`;

    // Entry
    if (ingresoTipo === 'aereo') {
      purposePara += ` El ingreso a México se realizará el ${fechaLlegada} vía aérea por ${d['ing-aeropuerto'] || '—'}, aerolínea ${d['ing-aerolinea'] || '—'}, vuelo número ${d['ing-vuelo'] || '—'}.`;
    } else if (ingresoTipo === 'terrestre') {
      purposePara += ` El ingreso a México se realizará el ${fechaLlegada} vía terrestre por ${d['ing-cruce'] || '—'}.`;
    } else if (ingresoTipo === 'maritimo') {
      purposePara += ` El ingreso a México se realizará el ${fechaLlegada} vía marítima por ${d['ing-puerto'] || '—'}.`;
    }

    // Exit
    if (salidaTipo === 'aereo') {
      purposePara += ` La salida del país se realizará el ${fechaSalida} vía aérea por ${d['sal-aeropuerto'] || '—'}, aerolínea ${d['sal-aerolinea'] || '—'}, vuelo número ${d['sal-vuelo'] || '—'}.`;
    } else if (salidaTipo === 'terrestre') {
      purposePara += ` La salida del país se realizará el ${fechaSalida} vía terrestre por ${d['sal-cruce'] || '—'}.`;
    } else if (salidaTipo === 'maritimo') {
      purposePara += ` La salida del país se realizará el ${fechaSalida} vía marítima por ${d['sal-puerto'] || '—'}.`;
    }

    // Duration after exit
    purposePara += ` La duración total del viaje será de ${diasStr}.`;

    doc.text(purposePara, { lineGap: LINE_GAP, align: 'justify' });

    /* ─── Accommodation + Activities paragraph (Plan Esencial) ─── */
    if (plan === 'esencial') {
      const alojAnfitrion = d['aloj_es_anfitrion'] === 'si';
      let alojSentence;
      if (alojAnfitrion) {
        alojSentence = `${refInvitadosCap} se hospedará en mi domicilio ubicado en ${hostAddr}.`;
      } else {
        const alojNombre = d['j-aloj-nombre'] || '';
        const alojAddr = [d['j-al-calle'], d['j-al-colonia'], d['j-al-delegacion'], d['j-al-ciudad'], d['j-al-estado'] !== d['j-al-ciudad'] ? d['j-al-estado'] : '', 'C.P. ' + (d['j-al-cp'] || '')].filter(Boolean).join(', ');
        alojSentence = alojNombre
          ? `${refInvitadosCap} se hospedará en ${alojNombre}, ubicado en ${alojAddr}.`
          : `${refInvitadosCap} se hospedará en ${alojAddr}.`;
      }
      let alojActPara = alojSentence;
      if (actividadesClean) {
        alojActPara += ` Durante su estancia, ${realizara} las siguientes actividades: ${actividadesClean}.`;
      }
      doc.moveDown(0.4);
      doc.text(alojActPara, { lineGap: LINE_GAP, align: 'justify' });
      doc.moveDown(0.3);
    } else if (actividadesClean) {
      doc.moveDown(0.4);
      doc.text(
        `Durante su estancia, ${realizara} las siguientes actividades: ${actividadesClean}.`,
        { lineGap: LINE_GAP, align: 'justify' }
      );
      doc.moveDown(0.4);
    } else {
      doc.moveDown(0.4);
    }

    /* ─── Itinerary (Plan Completo only) ─── */
    if (plan === 'completo' && d.destinos && d.destinos.length) {
      const singleDest = d.destinos.length === 1;
      doc.moveDown(0.1);
      doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
        .text(
          singleDest
            ? 'Los detalles de la estancia son los siguientes:'
            : 'El itinerario previsto para el viaje es el siguiente:',
          { lineGap: LINE_GAP, align: 'justify' }
        );
      doc.moveDown(0.2);

      const destIndent = singleDest ? 0 : 20;
      const baseX = doc.page.margins.left;
      const baseW = doc.page.width - doc.page.margins.left - doc.page.margins.right;

      d.destinos.forEach((dest, i) => {
        const alojAddr = [dest.aloj_calle, dest.aloj_colonia, dest.aloj_delegacion, dest.aloj_ciudad, dest.aloj_ciudad !== dest.aloj_estado ? dest.aloj_estado : '', 'C.P. ' + (dest.aloj_cp || '')].filter(Boolean).join(', ');
        const alojStr = dest.aloj_nombre ? `${dest.aloj_nombre}, ${alojAddr}` : alojAddr;
        const textX = baseX + destIndent;
        const textW = baseW - destIndent;
        doc.fontSize(BODY_SIZE).fillColor(BLACK).font(singleDest ? 'Helvetica' : 'Helvetica-Bold')
          .text(singleDest ? `Destino: ${dest.ciudad}` : `Destino ${i + 1}: ${dest.ciudad}`, textX, doc.y, { lineGap: 1, width: textW });
        doc.font('Helvetica')
          .text(`Fechas: ${fmtDate(dest.fecha_desde)} — ${fmtDate(dest.fecha_hasta)}`, textX, doc.y, { lineGap: 1, width: textW })
          .text(`Actividades: ${dest.actividades}`, textX, doc.y, { lineGap: 1, width: textW })
          .text(`Alojamiento: ${alojStr}`, textX, doc.y, { lineGap: 1, width: textW });
        doc.moveDown(0.25);
      });
      // Reset X to left margin after indented block
      doc.x = baseX;
      doc.moveDown(0.1);
    }

    /* ─── Expenses paragraph ─── */
    const gastosAnfitrion = d['gastos_anfitrion'] === 'si';
    const gastosConceptos = d['gastos_host_conceptos'] || [];
    const gastosOtroTexto = d['gastos-otro-texto'] || d['gastos_otro_texto'] || '';

    const transportArr = d['transporte_mx'] || [];
    const transportList = transportArr.length ? buildTransportList(transportArr) : '';
    const transportSentence = transportList
      ? ` Para desplazarse utilizará${hasCompanions ? 'n' : ''} ${transportList}.`
      : '';

    if (gastosAnfitrion && gastosConceptos.length) {
      const listaGastos = buildGastosList(gastosConceptos, gastosOtroTexto);
      const deInvitado = hasCompanions ? 'de los invitados' : (visitorGenero === 'femenino' ? 'de la invitada' : 'del invitado');
      const propioInvitado = hasCompanions ? 'los propios invitados, quienes cuentan' : (visitorGenero === 'femenino' ? 'la propia invitada, quien cuenta' : 'el propio invitado, quien cuenta');
      doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
        .text(
          `Me comprometo a sufragar los gastos de ${listaGastos} durante la estancia ` +
          `${deInvitado}. ` +
          `Los demás gastos serán cubiertos por ${propioInvitado} con los medios económicos suficientes para ello.` +
          transportSentence,
          { lineGap: LINE_GAP, align: 'justify' }
        );
    } else {
      const cubrira = hasCompanions ? `${refInvitadosCap} cubrirán` : `${refInvitadosCap} cubrirá`;
      doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
        .text(
          `${cubrira} sus propios gastos durante la visita, ` +
          `contando con los medios económicos suficientes para ello.` +
          transportSentence,
          { lineGap: LINE_GAP, align: 'justify' }
        );
    }
    doc.moveDown(0.3);

    /* ─── Commitment paragraph ─── */
    const abandonara = hasCompanions
      ? `${refInvitados} abandonarán`
      : `${visitorName} abandonará`;
    doc.text(
      `Me comprometo a colaborar plenamente con las autoridades migratorias de ser necesario, ` +
      `y a garantizar que ${abandonara} el territorio nacional conforme a las fechas señaladas. ` +
      `Manifiesto que toda la información contenida en la presente carta es verídica y que estaré ` +
      `disponible en el número de contacto indicado al calce durante las fechas del viaje.`,
      { lineGap: LINE_GAP, align: 'justify' }
    );

    /* ─── Signature block (centered) ─── */
    doc.moveDown(1.5);
    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica')
      .text('Atentamente,', { align: 'center' });
    doc.moveDown(3);

    const pageW = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const sigLineW = 220;
    const sigLineX = doc.page.margins.left + (pageW - sigLineW) / 2;
    const lineY = doc.y;
    doc.moveTo(sigLineX, lineY).lineTo(sigLineX + sigLineW, lineY)
      .strokeColor(BLACK).lineWidth(0.8).stroke();
    doc.moveDown(0.3);

    doc.fontSize(BODY_SIZE).fillColor(BLACK).font('Helvetica-Bold')
      .text(hostName, { align: 'center' });
    doc.fontSize(BODY_SIZE).fillColor(GRAY_SIG).font('Helvetica')
      .text(`${hostIdTipo}: ${hostIdNum}`, { align: 'center', lineGap: 1 })
      .text(`Tel.: ${hostTelefono}`, { align: 'center', lineGap: 1 })
      .text(`Correo: ${hostEmail}`, { align: 'center' });

    doc.end();
  });
}
