// Shared document type definitions for API v1
// Based on the actual form fields collected by formulario-esencial.html and formulario-completo.html

const DOCUMENT_TYPES = [
  {
    id: 'esencial',
    name: 'Plan Esencial — Carta de Invitación',
    description: 'Carta de invitación a México para un solo viajero. Incluye datos del anfitrión, viajero, detalles del viaje, alojamiento, gastos y transporte.',
    price_usd: 5.00,
    required_fields: [
      // — Host (Anfitrión) —
      { name: 'a_nombre', type: 'string', description: 'Nombre completo del anfitrión', required: true },
      { name: 'a_genero', type: 'enum', description: 'Género del anfitrión', required: true, enum_values: ['masculino', 'femenino'] },
      { name: 'a_nacionalidad', type: 'string', description: 'Nacionalidad del anfitrión', required: true },
      { name: 'a_nacimiento', type: 'date', description: 'Fecha de nacimiento del anfitrión (YYYY-MM-DD)', required: true },
      { name: 'a_id_tipo', type: 'enum', description: 'Tipo de identificación oficial del anfitrión', required: true, enum_values: ['pasaporte', 'ine', 'residente'] },
      { name: 'a_id_num', type: 'string', description: 'Número de identificación oficial del anfitrión', required: true },
      { name: 'a_calle', type: 'string', description: 'Calle y número del domicilio del anfitrión', required: true },
      { name: 'a_colonia', type: 'string', description: 'Colonia del domicilio del anfitrión', required: true },
      { name: 'a_delegacion', type: 'string', description: 'Delegación o municipio del anfitrión', required: true },
      { name: 'a_ciudad', type: 'string', description: 'Ciudad del anfitrión', required: true },
      { name: 'a_estado', type: 'string', description: 'Estado de México del anfitrión', required: true },
      { name: 'a_cp', type: 'string', description: 'Código postal del anfitrión', required: true },
      { name: 'a_telefono', type: 'string', description: 'Teléfono del anfitrión', required: true },
      { name: 'a_email', type: 'email', description: 'Correo electrónico del anfitrión', required: true },
      { name: 'a_ocupacion', type: 'string', description: 'Ocupación del anfitrión', required: true },

      // — Traveler (Viajero) —
      { name: 'v_nombre', type: 'string', description: 'Nombre completo del viajero', required: true },
      { name: 'v_genero', type: 'enum', description: 'Género del viajero', required: true, enum_values: ['masculino', 'femenino'] },
      { name: 'v_nacimiento', type: 'date', description: 'Fecha de nacimiento del viajero (YYYY-MM-DD)', required: true },
      { name: 'v_nacionalidad', type: 'string', description: 'Nacionalidad del viajero', required: true },
      { name: 'v_pasaporte', type: 'string', description: 'Número de pasaporte del viajero', required: true },
      { name: 'v_residencia', type: 'string', description: 'País de residencia del viajero', required: true },
      { name: 'v_calle', type: 'string', description: 'Dirección del viajero (calle y número)', required: true },
      { name: 'v_ciudad', type: 'string', description: 'Ciudad de residencia del viajero', required: true },
      { name: 'v_provincia', type: 'string', description: 'Provincia, estado o región del viajero', required: true },
      { name: 'v_cp', type: 'string', description: 'Código postal del viajero', required: true },
      { name: 'v_ocupacion', type: 'string', description: 'Ocupación del viajero', required: true },

      // — Relationship —
      { name: 'a_vinculo', type: 'enum', description: 'Vínculo del anfitrión con el viajero', required: true, enum_values: ['familiar', 'pareja', 'amistad', 'laboral', 'otro'] },
      { name: 'a_vinculo_detalle', type: 'string', description: 'Descripción breve del vínculo', required: true },
      { name: 'a_tiempo_anios', type: 'integer', description: 'Años de conocer al viajero', required: true },
      { name: 'a_tiempo_meses', type: 'integer', description: 'Meses adicionales de conocer al viajero', required: true },

      // — Trip —
      { name: 'j_motivo', type: 'enum', description: 'Motivo del viaje', required: true, enum_values: ['turismo', 'negocios', 'estudios', 'actividades_no_remuneradas', 'transito', 'tratamientos_medicos'] },
      { name: 'j_actividades', type: 'string', description: 'Descripción de las actividades que realizará el viajero en México', required: true },
      { name: 'aloj_es_anfitrion', type: 'enum', description: '¿El viajero se hospedará en la dirección del anfitrión?', required: true, enum_values: ['si', 'no'] },

      // — Entry transport —
      { name: 'ingreso_tipo', type: 'enum', description: 'Tipo de transporte de ingreso a México', required: true, enum_values: ['aereo', 'terrestre', 'maritimo'] },
      { name: 'ing_fecha', type: 'date', description: 'Fecha de ingreso a México (YYYY-MM-DD)', required: true },

      // — Exit transport —
      { name: 'salida_tipo', type: 'enum', description: 'Tipo de transporte de salida de México', required: true, enum_values: ['aereo', 'terrestre', 'maritimo'] },
      { name: 'sal_fecha', type: 'date', description: 'Fecha de salida de México (YYYY-MM-DD)', required: true },

      // — Host expenses —
      { name: 'gastos_anfitrion', type: 'enum', description: '¿El anfitrión cubrirá algún gasto del viajero?', required: true, enum_values: ['si', 'no'] },
    ],
    optional_fields: [
      { name: 'a_empresa', type: 'string', description: 'Empresa donde trabaja el anfitrión', required: false },
      { name: 'v_email', type: 'email', description: 'Correo electrónico del viajero', required: false },
      { name: 'a_parentesco', type: 'enum', description: 'Parentesco específico (cuando el vínculo es familiar)', required: false, enum_values: ['padre', 'hijo', 'hermano', 'abuelo', 'nieto', 'bisabuelo', 'tio', 'sobrino', 'primo', 'otro'] },
      { name: 'a_parentesco_otro', type: 'string', description: 'Parentesco personalizado (cuando parentesco es "otro")', required: false },

      // — Accommodation (when aloj_es_anfitrion = 'no') —
      { name: 'j_aloj_nombre', type: 'string', description: 'Nombre del alojamiento (hotel, Airbnb, etc.)', required: false },
      { name: 'j_al_calle', type: 'string', description: 'Calle del alojamiento', required: false },
      { name: 'j_al_colonia', type: 'string', description: 'Colonia del alojamiento', required: false },
      { name: 'j_al_delegacion', type: 'string', description: 'Delegación o municipio del alojamiento', required: false },
      { name: 'j_al_ciudad', type: 'string', description: 'Ciudad del alojamiento', required: false },
      { name: 'j_al_estado', type: 'string', description: 'Estado de México del alojamiento', required: false },
      { name: 'j_al_cp', type: 'string', description: 'Código postal del alojamiento', required: false },

      // — Entry transport details —
      { name: 'ing_aeropuerto', type: 'string', description: 'Aeropuerto de llegada (cuando ingreso_tipo es aereo)', required: false },
      { name: 'ing_aerolinea', type: 'string', description: 'Aerolínea de ingreso', required: false },
      { name: 'ing_vuelo', type: 'string', description: 'Número de vuelo de ingreso', required: false },
      { name: 'ing_cruce', type: 'string', description: 'Cruce fronterizo de ingreso (cuando ingreso_tipo es terrestre)', required: false },
      { name: 'ing_puerto', type: 'string', description: 'Puerto de ingreso (cuando ingreso_tipo es maritimo)', required: false },

      // — Exit transport details —
      { name: 'sal_aeropuerto', type: 'string', description: 'Aeropuerto de salida (cuando salida_tipo es aereo)', required: false },
      { name: 'sal_aerolinea', type: 'string', description: 'Aerolínea de salida', required: false },
      { name: 'sal_vuelo', type: 'string', description: 'Número de vuelo de salida', required: false },
      { name: 'sal_cruce', type: 'string', description: 'Cruce fronterizo de salida (cuando salida_tipo es terrestre)', required: false },
      { name: 'sal_puerto', type: 'string', description: 'Puerto de salida (cuando salida_tipo es maritimo)', required: false },

      // — Host expenses details (when gastos_anfitrion = 'si') —
      { name: 'gastos_host_conceptos', type: 'array', description: 'Conceptos de gastos que cubrirá el anfitrión', required: false, items: { type: 'enum', enum_values: ['alojamiento', 'alimentos', 'transporte', 'actividades', 'medicos', 'otro'] } },
      { name: 'gastos_otro_texto', type: 'string', description: 'Descripción del gasto "otro"', required: false },

      // — In-country transport —
      { name: 'transporte_mx', type: 'array', description: 'Medios de transporte dentro de México', required: false, items: { type: 'enum', enum_values: ['auto_rentado', 'anfitrion', 'transporte_publico'] } },
    ],
  },
  {
    id: 'completo',
    name: 'Plan Completo — Carta de Invitación',
    description: 'Carta de invitación a México con itinerario detallado, acompañantes y múltiples destinos. Incluye todos los campos del Plan Esencial más datos de acompañantes y destinos con fechas.',
    price_usd: 9.00,
    required_fields: [
      // — Host (Anfitrión) — same as esencial
      { name: 'a_nombre', type: 'string', description: 'Nombre completo del anfitrión', required: true },
      { name: 'a_genero', type: 'enum', description: 'Género del anfitrión', required: true, enum_values: ['masculino', 'femenino'] },
      { name: 'a_nacionalidad', type: 'string', description: 'Nacionalidad del anfitrión', required: true },
      { name: 'a_nacimiento', type: 'date', description: 'Fecha de nacimiento del anfitrión (YYYY-MM-DD)', required: true },
      { name: 'a_id_tipo', type: 'enum', description: 'Tipo de identificación oficial del anfitrión', required: true, enum_values: ['pasaporte', 'ine', 'residente'] },
      { name: 'a_id_num', type: 'string', description: 'Número de identificación oficial del anfitrión', required: true },
      { name: 'a_calle', type: 'string', description: 'Calle y número del domicilio del anfitrión', required: true },
      { name: 'a_colonia', type: 'string', description: 'Colonia del domicilio del anfitrión', required: true },
      { name: 'a_delegacion', type: 'string', description: 'Delegación o municipio del anfitrión', required: true },
      { name: 'a_ciudad', type: 'string', description: 'Ciudad del anfitrión', required: true },
      { name: 'a_estado', type: 'string', description: 'Estado de México del anfitrión', required: true },
      { name: 'a_cp', type: 'string', description: 'Código postal del anfitrión', required: true },
      { name: 'a_telefono', type: 'string', description: 'Teléfono del anfitrión', required: true },
      { name: 'a_email', type: 'email', description: 'Correo electrónico del anfitrión', required: true },
      { name: 'a_ocupacion', type: 'string', description: 'Ocupación del anfitrión', required: true },

      // — Primary Traveler (Viajero principal) —
      { name: 'v_nombre', type: 'string', description: 'Nombre completo del viajero principal', required: true },
      { name: 'v_genero', type: 'enum', description: 'Género del viajero principal', required: true, enum_values: ['masculino', 'femenino'] },
      { name: 'v_nacimiento', type: 'date', description: 'Fecha de nacimiento del viajero principal (YYYY-MM-DD)', required: true },
      { name: 'v_nacionalidad', type: 'string', description: 'Nacionalidad del viajero principal', required: true },
      { name: 'v_pasaporte', type: 'string', description: 'Número de pasaporte del viajero principal', required: true },
      { name: 'v_residencia', type: 'string', description: 'País de residencia del viajero principal', required: true },
      { name: 'v_calle', type: 'string', description: 'Dirección del viajero principal (calle y número)', required: true },
      { name: 'v_ciudad', type: 'string', description: 'Ciudad de residencia del viajero principal', required: true },
      { name: 'v_provincia', type: 'string', description: 'Provincia, estado o región del viajero principal', required: true },
      { name: 'v_cp', type: 'string', description: 'Código postal del viajero principal', required: true },
      { name: 'v_ocupacion', type: 'string', description: 'Ocupación del viajero principal', required: true },

      // — Relationship —
      { name: 'a_vinculo', type: 'enum', description: 'Vínculo del anfitrión con el viajero', required: true, enum_values: ['familiar', 'pareja', 'amistad', 'laboral', 'otro'] },
      { name: 'a_vinculo_detalle', type: 'string', description: 'Descripción breve del vínculo', required: true },
      { name: 'a_tiempo_anios', type: 'integer', description: 'Años de conocer al viajero', required: true },
      { name: 'a_tiempo_meses', type: 'integer', description: 'Meses adicionales de conocer al viajero', required: true },

      // — Trip —
      { name: 'j_motivo', type: 'enum', description: 'Motivo del viaje', required: true, enum_values: ['turismo', 'negocios', 'estudios', 'actividades_no_remuneradas', 'transito', 'tratamientos_medicos'] },

      // — Entry transport —
      { name: 'ingreso_tipo', type: 'enum', description: 'Tipo de transporte de ingreso a México', required: true, enum_values: ['aereo', 'terrestre', 'maritimo'] },
      { name: 'ing_fecha', type: 'date', description: 'Fecha de ingreso a México (YYYY-MM-DD)', required: true },

      // — Exit transport —
      { name: 'salida_tipo', type: 'enum', description: 'Tipo de transporte de salida de México', required: true, enum_values: ['aereo', 'terrestre', 'maritimo'] },
      { name: 'sal_fecha', type: 'date', description: 'Fecha de salida de México (YYYY-MM-DD)', required: true },

      // — Host expenses —
      { name: 'gastos_anfitrion', type: 'enum', description: '¿El anfitrión cubrirá algún gasto del viajero?', required: true, enum_values: ['si', 'no'] },

      // — Destinations (at least 1 required) —
      { name: 'destinos', type: 'array', description: 'Lista de destinos en México (mínimo 1). Cada destino incluye ciudad, actividades, fechas y alojamiento.', required: true, min_items: 1 },
    ],
    optional_fields: [
      { name: 'a_empresa', type: 'string', description: 'Empresa donde trabaja el anfitrión', required: false },
      { name: 'v_email', type: 'email', description: 'Correo electrónico del viajero', required: false },
      { name: 'a_parentesco', type: 'enum', description: 'Parentesco específico (cuando el vínculo es familiar)', required: false, enum_values: ['padre', 'hijo', 'hermano', 'abuelo', 'nieto', 'bisabuelo', 'tio', 'sobrino', 'primo', 'otro'] },
      { name: 'a_parentesco_otro', type: 'string', description: 'Parentesco personalizado (cuando parentesco es "otro")', required: false },

      // — Entry transport details —
      { name: 'ing_aeropuerto', type: 'string', description: 'Aeropuerto de llegada', required: false },
      { name: 'ing_aerolinea', type: 'string', description: 'Aerolínea de ingreso', required: false },
      { name: 'ing_vuelo', type: 'string', description: 'Número de vuelo de ingreso', required: false },
      { name: 'ing_cruce', type: 'string', description: 'Cruce fronterizo de ingreso', required: false },
      { name: 'ing_puerto', type: 'string', description: 'Puerto de ingreso', required: false },

      // — Exit transport details —
      { name: 'sal_aeropuerto', type: 'string', description: 'Aeropuerto de salida', required: false },
      { name: 'sal_aerolinea', type: 'string', description: 'Aerolínea de salida', required: false },
      { name: 'sal_vuelo', type: 'string', description: 'Número de vuelo de salida', required: false },
      { name: 'sal_cruce', type: 'string', description: 'Cruce fronterizo de salida', required: false },
      { name: 'sal_puerto', type: 'string', description: 'Puerto de salida', required: false },

      // — Host expenses details —
      { name: 'gastos_host_conceptos', type: 'array', description: 'Conceptos de gastos que cubrirá el anfitrión', required: false, items: { type: 'enum', enum_values: ['alojamiento', 'alimentos', 'transporte', 'actividades', 'medicos', 'otro'] } },
      { name: 'gastos_otro_texto', type: 'string', description: 'Descripción del gasto "otro"', required: false },

      // — In-country transport —
      { name: 'transporte_mx', type: 'array', description: 'Medios de transporte dentro de México', required: false, items: { type: 'enum', enum_values: ['avion', 'autobus_foraneo', 'auto_rentado', 'anfitrion', 'transporte_publico'] } },

      // — Companions (Plan Completo exclusive) —
      { name: 'companions', type: 'array', description: 'Lista de acompañantes del viajero principal. Cada acompañante incluye nombre, género, fecha de nacimiento, nacionalidad, pasaporte, país de residencia, dirección y ocupación.', required: false },
    ],
  },
];

export default DOCUMENT_TYPES;
