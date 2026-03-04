/**
 * Quick test: generate a sample PDF and write it to disk.
 * Run: node test-pdf.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';
import generatePDF from './api/lib/generate-pdf.js';

const OUT_DIR = './temporary pdf';
mkdirSync(OUT_DIR, { recursive: true });

const sampleEsencial = {
  // Viajero
  'v-nombre': 'María Alejandra Rodríguez Pérez',
  'v-genero': 'femenino',
  'v-nacimiento': '1990-04-15',
  'v-nacionalidad': 'Venezolana',
  'v-pasaporte': 'AB1234567',
  'v-residencia': 'Venezuela',
  'v-calle': 'Av. Bolívar 123, Apto 4B',
  'v-ciudad': 'Caracas',
  'v-provincia': 'Distrito Capital',
  'v-cp': '1010',
  'v-ocupacion': 'Ingeniera de Software',
  'v-email': 'maria@example.com',

  // Anfitrión
  'a-nombre': 'Juan Carlos López Mendoza',
  'a-genero': 'masculino',
  'a-nacionalidad': 'Mexicana',
  'a-nacimiento': '1985-08-22',
  'a-id-tipo': 'ine',
  'a-id-num': 'LOPM850822HDFRND09',
  'a-calle': 'Calle Reforma 456',
  'a-colonia': 'Juárez',
  'a-delegacion': 'Cuauhtémoc',
  'a-ciudad': 'Ciudad de México',
  'a-estado': 'Ciudad de México',
  'a-cp': '06600',
  'a-telefono': '55 1234 5678',
  'a-email': 'juan@ejemplo.com',
  'a-ocupacion': 'Ingeniero en Sistemas',
  'a-empresa': 'Grupo Bimbo',
  'a-vinculo': 'amistad',
  'a-vinculo-detalle': 'Somos amigos desde la universidad. Estudiamos juntos la carrera de ingeniería en el ITESM campus Monterrey y hemos mantenido contacto desde entonces',
  'a-tiempo-anios': '8',
  'a-tiempo-meses': '0',
  // Viaje
  'j-motivo': 'turismo',
  'j-actividades': 'Turismo cultural, visita a museos, recorrido gastronómico por la ciudad, y visita a Teotihuacán.',
  'aloj_es_anfitrion': 'no',
  'j-aloj-nombre': 'Hotel Histórico Central',
  'j-al-calle': 'Calle 5 de Mayo 12',
  'j-al-colonia': 'Centro Histórico',
  'j-al-delegacion': 'Cuauhtémoc',
  'j-al-ciudad': 'Ciudad de México',
  'j-al-estado': 'Ciudad de México',
  'j-al-cp': '06000',

  // Gastos
  'gastos_anfitrion': 'si',
  'gastos_host_conceptos': ['alimentos', 'transporte'],
  'transporte_mx': ['auto_rentado', 'transporte_publico'],

  // Entrada
  'ingreso_tipo': 'aereo',
  'ing-aeropuerto': 'Aeropuerto Internacional de la Ciudad de México (AICM)',
  'ing-aerolinea': 'Avianca',
  'ing-vuelo': 'AV204',
  'ing-fecha': '2026-04-10',

  // Salida
  'salida_tipo': 'aereo',
  'sal-aeropuerto': 'Aeropuerto Internacional de la Ciudad de México (AICM)',
  'sal-aerolinea': 'Avianca',
  'sal-vuelo': 'AV205',
  'sal-fecha': '2026-04-24',
};

// Variant: host accommodation, no host expenses, land exit, familiar (consanguineous)
const sampleEsencialB = {
  ...sampleEsencial,
  'aloj_es_anfitrion': 'si',
  'gastos_anfitrion': 'no',
  'gastos_host_conceptos': [],
  'salida_tipo': 'terrestre',
  'sal-cruce': 'Nuevo Laredo',
  'a-empresa': '', // no company
  'a-genero': 'masculino',
  'a-vinculo': 'familiar',
  'a-parentesco': 'hermano',
  'a-tiempo-anios': '', // consanguineous — tiempo hidden
  'a-tiempo-meses': '',
  'a-vinculo-detalle': '', // familiar — detalle hidden
  'j-motivo': 'negocios',
};

const sampleCompleto = {
  ...sampleEsencial,
  'j-motivo': 'turismo',
  companions: [
    {
      nombre: 'Pedro Luis Rodríguez Pérez',
      genero: 'masculino',
      nacimiento: '1988-11-03',
      nacionalidad: 'Venezolana',
      pasaporte: 'CD7654321',
      vinculo: 'familiar',
      parentesco: 'sobrino',
      parentesco_otro: '',
      vinculo_detalle: '', // familiar — detalle hidden
      tiempo_anios: '30',
      tiempo_meses: '0',
    },
    {
      nombre: 'Ana Sofía Rodríguez',
      genero: 'femenino',
      nacimiento: '2015-06-20',
      nacionalidad: 'Venezolana',
      pasaporte: 'EF1112233',
      vinculo: 'pareja',
      parentesco: 'conyuge',
      parentesco_otro: '',
      vinculo_detalle: '', // pareja cónyuge — detalle hidden
      tiempo_anios: '5',
      tiempo_meses: '3',
    },
  ],
  destinos: [
    {
      ciudad: 'Ciudad de México, CDMX',
      actividades: 'Visita al Zócalo, Museo Nacional de Antropología, Chapultepec, recorrido gastronómico.',
      aloj_nombre: 'Hotel Histórico Central',
      aloj_calle: 'Calle 5 de Mayo 12',
      aloj_colonia: 'Centro Histórico',
      aloj_delegacion: 'Cuauhtémoc',
      aloj_ciudad: 'Ciudad de México',
      aloj_estado: 'Ciudad de México',
      aloj_cp: '06000',
      fecha_desde: '2026-04-10',
      fecha_hasta: '2026-04-17',
    },
    {
      ciudad: 'Oaxaca de Juárez, Oaxaca',
      actividades: 'Visita a Monte Albán, mercado de artesanías, degustación de mezcal, Hierve el Agua.',
      aloj_nombre: '',
      aloj_calle: 'Calle Macedonio Alcalá 305',
      aloj_colonia: 'Centro',
      aloj_delegacion: 'Oaxaca de Juárez',
      aloj_ciudad: 'Oaxaca de Juárez',
      aloj_estado: 'Oaxaca',
      aloj_cp: '68000',
      fecha_desde: '2026-04-17',
      fecha_hasta: '2026-04-24',
    },
  ],
};

// Remove single-accommodation fields not used in completo
delete sampleCompleto['j-actividades'];
delete sampleCompleto['j-aloj-nombre'];
delete sampleCompleto['j-al-calle'];
delete sampleCompleto['j-al-colonia'];
delete sampleCompleto['j-al-ciudad'];
delete sampleCompleto['j-al-estado'];
delete sampleCompleto['j-al-cp'];
delete sampleCompleto['aloj_es_anfitrion'];

async function main() {
  console.log('Generating Plan Esencial PDF (hotel, host pays some, air exit)...');
  const esencialBuf = await generatePDF(sampleEsencial, 'esencial');
  writeFileSync(`${OUT_DIR}/test-carta-esencial-v2.pdf`, esencialBuf);
  console.log(`  → ${OUT_DIR}/test-carta-esencial-v2.pdf (${(esencialBuf.length / 1024).toFixed(1)} KB)`);

  console.log('Generating Plan Esencial B (host home, no host expenses, land exit, no company)...');
  const esencialBBuf = await generatePDF(sampleEsencialB, 'esencial');
  writeFileSync(`${OUT_DIR}/test-carta-esencial-b-v2.pdf`, esencialBBuf);
  console.log(`  → ${OUT_DIR}/test-carta-esencial-b-v2.pdf (${(esencialBBuf.length / 1024).toFixed(1)} KB)`);

  console.log('Generating Plan Completo PDF...');
  const completoBuf = await generatePDF(sampleCompleto, 'completo');
  writeFileSync(`${OUT_DIR}/test-carta-completo-v2.pdf`, completoBuf);
  console.log(`  → ${OUT_DIR}/test-carta-completo-v2.pdf (${(completoBuf.length / 1024).toFixed(1)} KB)`);

  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
