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

// Variant: Plan Completo with a single destination
const sampleCompletoUnDestino = {
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
      vinculo_detalle: '',
      tiempo_anios: '30',
      tiempo_meses: '0',
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
      fecha_hasta: '2026-04-24',
    },
  ],
};
delete sampleCompletoUnDestino['j-actividades'];
delete sampleCompletoUnDestino['j-aloj-nombre'];
delete sampleCompletoUnDestino['j-al-calle'];
delete sampleCompletoUnDestino['j-al-colonia'];
delete sampleCompletoUnDestino['j-al-ciudad'];
delete sampleCompletoUnDestino['j-al-estado'];
delete sampleCompletoUnDestino['j-al-cp'];
delete sampleCompletoUnDestino['aloj_es_anfitrion'];

// Variant: Plan Completo with a single traveler (no companions)
const sampleCompletoUnViajero = {
  ...sampleEsencial,
  'j-motivo': 'negocios',
  companions: [],
  destinos: [
    {
      ciudad: 'Ciudad de México, CDMX',
      actividades: 'Reuniones de trabajo en oficinas corporativas, visita a proveedores.',
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
      ciudad: 'Guadalajara, Jalisco',
      actividades: 'Conferencia tecnológica y networking profesional.',
      aloj_nombre: '',
      aloj_calle: 'Av. Vallarta 1500',
      aloj_colonia: 'Americana',
      aloj_delegacion: 'Guadalajara',
      aloj_ciudad: 'Guadalajara',
      aloj_estado: 'Jalisco',
      aloj_cp: '44160',
      fecha_desde: '2026-04-17',
      fecha_hasta: '2026-04-24',
    },
  ],
};
delete sampleCompletoUnViajero['j-actividades'];
delete sampleCompletoUnViajero['j-aloj-nombre'];
delete sampleCompletoUnViajero['j-al-calle'];
delete sampleCompletoUnViajero['j-al-colonia'];
delete sampleCompletoUnViajero['j-al-ciudad'];
delete sampleCompletoUnViajero['j-al-estado'];
delete sampleCompletoUnViajero['j-al-cp'];
delete sampleCompletoUnViajero['aloj_es_anfitrion'];

// Variant: Plan Completo with 4 destinations
const sampleCompleto4Destinos = {
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
      vinculo_detalle: '',
      tiempo_anios: '30',
      tiempo_meses: '0',
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
      fecha_hasta: '2026-04-15',
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
      fecha_desde: '2026-04-15',
      fecha_hasta: '2026-04-18',
    },
    {
      ciudad: 'San Cristóbal de las Casas, Chiapas',
      actividades: 'Visita al Cañón del Sumidero, pueblo mágico, mercados indígenas, iglesia de Santo Domingo.',
      aloj_nombre: 'Posada del Abuelito',
      aloj_calle: 'Real de Guadalupe 18',
      aloj_colonia: 'Centro',
      aloj_delegacion: 'San Cristóbal de las Casas',
      aloj_ciudad: 'San Cristóbal de las Casas',
      aloj_estado: 'Chiapas',
      aloj_cp: '29200',
      fecha_desde: '2026-04-18',
      fecha_hasta: '2026-04-21',
    },
    {
      ciudad: 'Cancún, Quintana Roo',
      actividades: 'Playa, snorkel en arrecifes, visita a Chichén Itzá, parque Xcaret.',
      aloj_nombre: 'Hotel Zona Hotelera',
      aloj_calle: 'Blvd. Kukulcán Km 9.5',
      aloj_colonia: 'Zona Hotelera',
      aloj_delegacion: 'Benito Juárez',
      aloj_ciudad: 'Cancún',
      aloj_estado: 'Quintana Roo',
      aloj_cp: '77500',
      fecha_desde: '2026-04-21',
      fecha_hasta: '2026-04-26',
    },
  ],
};
delete sampleCompleto4Destinos['j-actividades'];
delete sampleCompleto4Destinos['j-aloj-nombre'];
delete sampleCompleto4Destinos['j-al-calle'];
delete sampleCompleto4Destinos['j-al-colonia'];
delete sampleCompleto4Destinos['j-al-ciudad'];
delete sampleCompleto4Destinos['j-al-estado'];
delete sampleCompleto4Destinos['j-al-cp'];
delete sampleCompleto4Destinos['aloj_es_anfitrion'];

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

  console.log('Generating Plan Completo — un destino...');
  const completoUnDestBuf = await generatePDF(sampleCompletoUnDestino, 'completo');
  writeFileSync(`${OUT_DIR}/test-carta-completo-un-destino.pdf`, completoUnDestBuf);
  console.log(`  → ${OUT_DIR}/test-carta-completo-un-destino.pdf (${(completoUnDestBuf.length / 1024).toFixed(1)} KB)`);

  console.log('Generating Plan Completo — un viajero...');
  const completoUnViajBuf = await generatePDF(sampleCompletoUnViajero, 'completo');
  writeFileSync(`${OUT_DIR}/test-carta-completo-un-viajero.pdf`, completoUnViajBuf);
  console.log(`  → ${OUT_DIR}/test-carta-completo-un-viajero.pdf (${(completoUnViajBuf.length / 1024).toFixed(1)} KB)`);

  console.log('Generating Plan Completo — 4 destinos...');
  const completo4Buf = await generatePDF(sampleCompleto4Destinos, 'completo');
  writeFileSync(`${OUT_DIR}/test-carta-completo-4-destinos.pdf`, completo4Buf);
  console.log(`  → ${OUT_DIR}/test-carta-completo-4-destinos.pdf (${(completo4Buf.length / 1024).toFixed(1)} KB)`);

  console.log('Done!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
