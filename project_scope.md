# Alcance del Proyecto: carta-invitacion-mexico.com

## Visión General

**Dominio:** carta-invitacion-mexico.com
**Tipo:** Sitio web transaccional (descarga digital de documento PDF)
**Idiomas:** Español (default) / Inglés
**Modelo de negocio:** Venta directa de cartas de invitación personalizadas en formato PDF
**Propuesta de valor:** Obtén tu carta de invitación a México en minutos — profesional, fácil y sin complicaciones.

---

## 1. Producto

### 1.1 Plan Esencial — $5 USD

Una carta de invitación formal, lista para presentar ante autoridades migratorias.

**Incluye:**

- Documento formal dirigido a la autoridad migratoria (INM / agente migratorio en punto de internación)
- Expedida a nombre de **una sola persona** invitada
- Detalle de **1 vuelo de ida y vuelta** (aerolínea, fechas, número de vuelo o referencia)
- Información de **1 alojamiento** (dirección completa del hospedaje durante la estancia)
- Formato PDF profesional, listo para imprimir o presentar digital
- Descarga inmediata tras completar el formulario y el pago

### 1.2 Plan Completo — $9 USD

Todo lo del Plan Esencial, más cobertura ampliada para viajes con acompañantes o itinerarios complejos.

**Incluye todo lo anterior, más:**

- **Itinerario de viaje** detallado (ciudades a visitar, actividades planeadas, fechas por destino)
- **Nombres de acompañantes** (agrega familiares o amigos que viajan con la persona invitada)
- **Detalle de todos los alojamientos** (múltiples hospedajes si el viaje incluye varias ciudades o cambios de hotel)

### 1.3 Flujo del Usuario (Compra)

1. **Landing page:** El usuario llega al sitio (SEO / búsqueda orgánica), lee los beneficios y elige un plan ($5 o $9)
2. **Typeform (formulario de datos):** Al hacer clic en el CTA del plan elegido, es redirigido a un Typeform específico para ese plan, donde completa todos los datos necesarios para redactar la carta de invitación (datos del anfitrión, del invitado, del viaje, alojamientos, etc.)
3. **Stripe Checkout (pago):** Al finalizar el Typeform, es redirigido automáticamente a un checkout de Stripe simple y rápido para efectuar el pago correspondiente al plan seleccionado
4. **Entrega por email:** Una vez confirmado el pago, la carta de invitación en PDF se envía al correo electrónico que el usuario proporcionó en el formulario

**Notas técnicas del flujo:**
- Se necesitan **2 Typeforms** (uno por plan), cada uno con los campos específicos según lo que incluye el plan
- El Typeform del Plan Esencial ($5) solicita: datos del anfitrión, datos de 1 invitado, 1 vuelo ida y vuelta, 1 alojamiento
- El Typeform del Plan Completo ($9) solicita: todo lo anterior + itinerario de viaje, nombres de acompañantes, múltiples alojamientos
- Cada Typeform redirige a su respectivo **Stripe Checkout link** con el precio pre-configurado ($5 o $9 USD)
- Tras el pago exitoso, se activa un **webhook de Stripe** que dispara la generación del PDF y el envío por email
- La carta se redacta internamente (manual o automatizada) con los datos recopilados en Typeform y se entrega al correo del usuario

---

## 2. Arquitectura del Sitio y Páginas

### 2.1 Páginas Principales

| Página | Slug | Propósito |
|--------|------|-----------|
| Home / Landing Page | `/` | Conversión principal. Hero, beneficios, planes, CTA, reviews, FAQ |
| Sobre Nosotros | `/sobre-nosotros` | Generar confianza. Quiénes somos, misión, por qué existimos |
| Preguntas Frecuentes | `/preguntas-frecuentes` | Resolver objeciones. FAQ completo con schema markup |
| Blog / Artículos | `/blog` | SEO + autoridad. Artículos informativos sobre migración turística a México |
| Términos y Condiciones | `/terminos` | Legal |
| Política de Privacidad | `/privacidad` | Legal |
| Política de Reembolso | `/reembolso` | Confianza + legal |
| Contacto | `/contacto` | Soporte. Formulario + email |

### 2.2 Páginas del Blog (Artículos SEO)

Artículos orientados a posicionar keywords de cola larga y generar tráfico orgánico:

| # | Título propuesto | Keyword objetivo |
|---|-----------------|-----------------|
| 1 | ¿Qué es una carta de invitación a México y para qué sirve? | carta de invitación México |
| 2 | Requisitos para entrar a México como turista en 2026 | requisitos turista México 2026 |
| 3 | ¿La carta de invitación es obligatoria para viajar a México? | carta invitación obligatoria México |
| 4 | Qué documentos pide migración al llegar a México | documentos migración México |
| 5 | Cómo evitar problemas en el filtro migratorio mexicano | filtro migratorio México tips |
| 6 | Carta de invitación a México para venezolanos: guía completa | carta invitación México venezolanos |
| 7 | Carta de invitación a México para colombianos: lo que debes saber | carta invitación México colombianos |
| 8 | ¿Quién puede hacer una carta de invitación a México? | quién puede hacer carta invitación México |
| 9 | Diferencia entre carta de invitación y visa de turista en México | carta invitación vs visa México |
| 10 | 5 errores comunes al redactar una carta de invitación a México | errores carta invitación México |

**Artículos en inglés:**

| # | Título propuesto | Keyword objetivo |
|---|-----------------|-----------------|
| 1 | What Is an Invitation Letter for Mexico and Do You Need One? | invitation letter Mexico |
| 2 | Mexico Tourist Entry Requirements: Complete Guide | Mexico tourist entry requirements |
| 3 | How to Avoid Being Denied Entry to Mexico as a Tourist | denied entry Mexico tourist |
| 4 | Invitation Letter for Mexico: A Guide for US Residents Hosting Visitors | invitation letter Mexico US |

---

## 3. Diseño y Experiencia de Usuario

### 3.1 Principios de Diseño

- **Simplicidad ante todo:** Diseño limpio, sin distracciones. El usuario debe entender qué ofrecemos y cómo comprarlo en menos de 10 segundos.
- **Confianza profesional:** Tipografía seria pero amigable (ej. Inter, DM Sans), paleta de colores institucionales (azul marino, blanco, acentos en verde o dorado suave). Nada que parezca "scam" o demasiado informal.
- **Mobile-first:** La mayoría del tráfico vendrá de celulares (particularmente desde Latinoamérica). Todo debe funcionar perfecto en pantallas pequeñas.
- **Velocidad:** Tiempo de carga < 2 segundos. Core Web Vitals optimizados. Impacto directo en SEO y conversión.

### 3.2 Estructura de la Landing Page (Home)

**Sección 1 — Hero**
- Headline claro: "Obtén tu Carta de Invitación a México en minutos"
- Subheadline: "Documento profesional listo para presentar en migración. Fácil, rápido y desde $5 USD."
- CTA principal: "Crear mi carta ahora"
- Elemento de confianza inmediata: "Más de X cartas generadas" / "4.8★ basado en X reseñas"

**Sección 2 — Beneficios / Tranquilidad**
- Viaja con mayor seguridad y tranquilidad
- Documento con formato profesional dirigido a la autoridad migratoria
- Demuestra que tu viaje está bien planeado y respaldado
- Reduce la incertidumbre en el filtro migratorio
- Listo en minutos, no en días

**Sección 3 — Cómo Funciona (3 pasos)**
1. Elige tu plan y completa el formulario con los datos del viaje
2. Realiza el pago de forma segura
3. Recibe tu carta de invitación en PDF directamente en tu correo

**Sección 4 — Planes y Precios**
- Tabla comparativa clara entre Plan Esencial ($5) y Plan Completo ($9)
- Destacar el Plan Completo como "Más popular" o "Recomendado"
- CTA en cada plan

**Sección 5 — Reviews / Testimonios**
- Tarjetas con nombre, país de origen, y comentario breve
- Estrellas de calificación
- Enfocarse en: facilidad del proceso, tranquilidad al llegar a México, calidad del documento

**Sección 6 — Preguntas Frecuentes (resumen)**
- Las 5-6 preguntas más importantes con schema FAQ
- Link a la página completa de FAQ

**Sección 7 — Artículos Destacados**
- 3 artículos del blog más relevantes con imagen, título y extracto
- Refuerza autoridad y SEO interno

**Sección 8 — CTA Final + Refuerzo de Confianza**
- "¿Listo para viajar tranquilo? Crea tu carta ahora."
- Íconos de confianza: pago seguro, descarga inmediata, satisfacción garantizada

**Footer**
- Links a páginas legales, contacto, blog
- Selector de idioma (ES/EN)
- Copyright

---

## 4. Elementos de Confianza

Es fundamental que el sitio inspire confianza sin afirmar ser abogados ni un servicio legal. La estrategia se basa en:

### 4.1 Prueba Social

- **Reviews reales** con nombre, país, y fecha (integrar con plataforma tipo Trustpilot, Google Reviews, o reviews propias verificadas)
- **Contador de cartas generadas** (social proof numérica)
- **Logos o badges:** "Pago Seguro con Stripe", "Descarga Inmediata", "Satisfacción Garantizada"

### 4.2 Transparencia Absoluta

- **Disclaimer claro:** "Este documento es una carta de invitación informativa redactada para facilitar tu ingreso como turista a México. No constituye asesoría legal ni garantiza la entrada al país, ya que la decisión final corresponde al agente migratorio en el punto de internación."

### 4.3 Contenido Educativo (Autoridad)

- Artículos de blog bien investigados que demuestran conocimiento profundo del proceso migratorio
- Referencias a fuentes oficiales (INM, SRE, Reglamento de la Ley de Migración)
- Guías por nacionalidad (venezolanos, colombianos, etc.)

### 4.4 Messaging de Beneficios y Tranquilidad

El copywriting de todo el sitio debe enfocarse en estos ejes emocionales:

- **Tranquilidad:** "Viaja con la confianza de tener todo en orden"
- **Preparación:** "Demuestra al agente migratorio que tu viaje está respaldado"
- **Simplicidad:** "Sin complicaciones, sin esperas, sin burocracia"
- **Profesionalismo:** "Un documento con formato profesional que habla por ti"

**Importante:** Nunca prometer que la carta garantiza la entrada a México. Siempre comunicar que facilita y aumenta la confianza, pero la decisión es del agente migratorio.

---

## 5. Estrategia SEO

### 5.1 SEO On-Page

- **Title tags** optimizados por página con keyword principal + branding
- **Meta descriptions** con CTA y beneficio claro
- **Headers (H1, H2, H3)** jerárquicos con keywords naturales
- **URLs limpias** y descriptivas (ej. `/blog/carta-invitacion-mexico-venezolanos`)
- **Alt text** en todas las imágenes
- **Internal linking** robusto entre artículos del blog y la landing page
- **Schema Markup:**
  - FAQ Schema en la home y página de FAQ
  - Product Schema en los planes
  - Article Schema en cada post del blog
  - Review/Rating Schema en la sección de testimonios
  - Organization Schema
  - Breadcrumb Schema

### 5.2 SEO Técnico

- **Velocidad:** Hosting rápido (Vercel, Cloudflare Pages, o Netlify). Imágenes en WebP/AVIF. Lazy loading.
- **Core Web Vitals:** LCP < 2.5s, FID < 100ms, CLS < 0.1
- **Mobile-first indexing:** Diseño responsive perfecto
- **SSL:** HTTPS obligatorio
- **Sitemap XML** + `robots.txt` correctamente configurados
- **Hreflang tags** para la versión en español e inglés
- **Canonical URLs** para evitar contenido duplicado entre idiomas
- **Datos estructurados** (JSON-LD) en todas las páginas

### 5.3 SEO de Contenido

- Publicar artículos de blog mínimo 2 por mes para los primeros 6 meses
- Cada artículo debe tener al menos 1,200 palabras, bien estructurado
- Incluir tablas, listas, y secciones que puedan aparecer como featured snippets
- Actualizar artículos cada 6 meses para mantener relevancia ("Guía 2026", "Actualizado enero 2026")
- Crear contenido que responda preguntas específicas (People Also Ask)

### 5.4 Keywords Primarias y Secundarias

**Español:**
- carta de invitación a México
- carta de invitación para viajar a México
- carta invitación migración México
- formato carta de invitación México PDF
- carta de invitación México turista
- carta invitación México ejemplo
- cómo hacer una carta de invitación para México

**Inglés:**
- invitation letter for Mexico
- Mexico invitation letter for immigration
- invitation letter to visit Mexico
- Mexico tourist invitation letter template
- how to write invitation letter for Mexico

---

## 6. Optimización para LLMs (GEO — Generative Engine Optimization)

Dado que cada vez más usuarios buscan respuestas a través de ChatGPT, Perplexity, Claude, Gemini y similares, el sitio debe estar optimizado para ser citado y recomendado por LLMs.

### 6.1 Estrategia GEO

- **Contenido con formato Q&A:** Estructurar artículos como preguntas y respuestas claras que los LLMs puedan extraer fácilmente
- **Definiciones claras al inicio:** Cada artículo debe comenzar con una definición concisa del tema (ej. "Una carta de invitación a México es un documento que...")
- **Datos estructurados ricos:** Schema markup extenso para que los crawlers de IA puedan interpretar el contenido
- **Respuestas directas y factuales:** Evitar contenido "relleno". Cada párrafo debe aportar información concreta
- **Citas a fuentes oficiales:** Referenciar INM, SRE, y legislación mexicana para aumentar la autoridad del contenido
- **Lenguaje natural y conversacional:** Escribir como la gente habla y pregunta, no como texto técnico
- **Listas y estructuras claras:** Facilitar la extracción de información por parte de los modelos
- **About page detallada:** Los LLMs valoran saber quién está detrás del contenido
- **Menciones y backlinks:** Buscar que otros sitios de autoridad (blogs de viajeros, guías de expats) enlacen al sitio

### 6.2 Contenido Diseñado para LLMs

Crear páginas que respondan directamente a las preguntas que los usuarios hacen a los LLMs:

- "¿Necesito una carta de invitación para entrar a México?"
- "¿Dónde puedo conseguir una carta de invitación para México?"
- "¿Cuánto cuesta una carta de invitación a México?"
- "¿La carta de invitación a México es obligatoria?"
- "¿Qué debe incluir una carta de invitación a México?"

---

## 7. Internacionalización (i18n)

### 7.1 Implementación

- **Idioma default:** Español (sin prefijo en URL — `carta-invitacion-mexico.com/blog/...`)
- **Inglés:** Con prefijo `/en/` (ej. `carta-invitacion-mexico.com/en/blog/...`)
- **Selector de idioma:** Visible en el header y footer (bandera o dropdown ES/EN)
- **Hreflang tags** en cada página para indicar la relación entre versiones
- **Contenido traducido profesionalmente** (no automático). El copy en inglés debe sonar nativo, no traducido.

### 7.2 Consideraciones por Idioma

- **Español:** Orientado a anfitriones en México que invitan a turistas extranjeros, y a turistas de habla hispana (Venezuela, Colombia, Cuba, Argentina, etc.)
- **Inglés:** Orientado a turistas de EE.UU., Canadá, UK, y otros países anglófonos que planean visitar México

---

## 8. Stack Tecnológico (Recomendación)

| Componente | Tecnología sugerida | Razón |
|-----------|-------------------|-------|
| Frontend | Next.js (App Router) | SSR para SEO, velocidad, i18n nativo |
| Hosting | Vercel | CDN global, deploy automático, excelente performance |
| Estilos | Tailwind CSS | Desarrollo rápido, consistente, mobile-first |
| CMS (Blog) | MDX o Contentlayer | Contenido estático = velocidad + SEO |
| Formularios | Typeform (2 formularios, 1 por plan) | UX conversacional, fácil de usar, integración con Stripe |
| Pagos | Stripe Checkout (Payment Links) | Links de pago pre-configurados por plan, confiable, internacional |
| Automatización | Stripe Webhooks + Zapier/Make (o backend propio) | Disparar generación de PDF y envío de email tras pago exitoso |
| Generación PDF | react-pdf o Puppeteer | Generación dinámica del documento con los datos de Typeform |
| Email transaccional | Resend o SendGrid | Entrega del PDF al correo del usuario post-pago |
| Analytics | Plausible o GA4 | Tracking de conversiones y tráfico |
| Reviews | Trustpilot widget o propio | Prueba social verificable |

---

## 9. Métricas de Éxito (KPIs)

| Métrica | Objetivo (primeros 6 meses) |
|---------|----------------------------|
| Tráfico orgánico mensual | 5,000+ visitas/mes |
| Tasa de conversión (visita → compra) | 3-5% |
| Ingreso mensual promedio | $500-1,500 USD |
| Posiciones en top 10 Google | 5+ keywords principales |
| Reviews positivas | 50+ con rating ≥ 4.5 |
| Tiempo de carga | < 2 segundos  |
| Core Web Vitals | Todo en verde |

---

## 11. Notas Legales Importantes

- El sitio ofrece un **documento informativo** que facilita el proceso de ingreso turístico.
- La carta de invitación **no garantiza** la entrada a México; la decisión es del agente migratorio.
- Incluir un disclaimer legal visible en el footer y en la página del producto.
- Cumplir con regulaciones de protección de datos (al manejar datos personales del invitado y anfitrión).