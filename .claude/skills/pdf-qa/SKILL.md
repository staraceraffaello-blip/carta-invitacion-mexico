# Skill: pdf-qa — Validación de calidad de Cartas de Invitación PDF

## Trigger
User says `/pdf-qa` or asks to review/validate the quality of generated PDFs.

## Steps

1. **Regenerate all test PDFs:**
   ```bash
   cd "c:/Users/laura.rodriguez/Vibe Repositories/Carta Invitacion" && node test-pdf.mjs
   ```

2. **Read each PDF** using the Read tool (Claude can read PDFs natively).

3. **Evaluate each PDF** against the checklist below. For each check, mark PASS or FAIL with a brief note if FAIL.

4. **Report results** per variant in table format, then a summary.

---

## QA Checklist (23 checks)

### A. Gramática y conjugación
| # | Check | Details |
|---|-------|---------|
| A1 | Concordancia singular/plural | Verbos coinciden con sujeto: visite/visiten, realizará/realizarán, abandonará/abandonarán, utilizará/utilizarán, cubrirá/cubrirán, hospedará/hospedarán |
| A2 | Concordancia de género | nacido/nacida, portador/portadora, parentesco correcto (hermano/hermana, tío/tía) |
| A3 | Artículos correctos | el invitado / la invitada / los invitados — según género y número |

### B. Capitalización y puntuación
| # | Check | Details |
|---|-------|---------|
| B1 | No hay oración que empiece con minúscula después de punto | Especialmente peligroso con variables interpoladas |
| B2 | "ASUNTO: Carta de invitación" en bold | Verificar visualmente |
| B3 | Puntuación correcta | Cada oración termina con punto. No hay doble punto (..) ni doble espacio |

### C. Redacción y fluidez
| # | Check | Details |
|---|-------|---------|
| C1 | Sin frases redundantes consecutivas | "Me comprometo" NO se repite en párrafos consecutivos |
| C2 | Sin "Durante su estancia" repetido | En párrafos consecutivos |
| C3 | Nombre completo del viajero en máximo 3 párrafos | Secciones permitidas: datos personales, vínculo, cierre (abandonará) |
| C4 | Perspectiva consistente en 1ª persona | Toda la carta desde punto de vista del anfitrión: "yo", "mi domicilio", "sufragaré" |

### D. Direcciones
| # | Check | Details |
|---|-------|---------|
| D1 | No hay delegación duplicada con ciudad | Ej. MAL: "Oaxaca de Juárez, Oaxaca de Juárez" |
| D2 | No hay ciudad duplicada con estado | Ej. MAL: "Ciudad de México, Ciudad de México" |
| D3 | Dirección del anfitrión termina con "México" | Siempre |
| D4 | Primera línea (fecha) no duplica ciudad/estado | Si ciudad = estado, solo mostrar ciudad |

### E. Itinerario (Plan Completo solamente)
| # | Check | Details |
|---|-------|---------|
| E1 | Destino único → "Destino:" sin número | Intro: "Los detalles de la estancia son los siguientes:" |
| E2 | Múltiples destinos → "Destino 1:", "Destino 2:" | Intro: "El itinerario previsto para el viaje es el siguiente:" |
| E3 | Bloques de destino con indent consistente | Si >1 destino, todas las líneas del bloque mantienen indent |

### F. Layout y paginación
| # | Check | Details |
|---|-------|---------|
| F1 | Párrafo "Me comprometo a colaborar..." en misma página que firma | No deben estar separados por salto de página |
| F2 | Bloque de firma completo sin corte | Atentamente + línea + nombre + INE + tel + correo juntos |
| F3 | Sin páginas en blanco innecesarias | Especialmente al final del documento |

### G. Datos y formato
| # | Check | Details |
|---|-------|---------|
| G1 | Fechas de viaje en formato largo | "6 de marzo de 2026" |
| G2 | Fechas de nacimiento en formato corto (bullets) o largo | DD/MM/YYYY en bullets, largo en párrafo individual |
| G3 | Tipo entrada/salida coincide con datos | Aéreo → aeropuerto + aerolínea + vuelo. Terrestre → cruce. Marítimo → puerto |

---

## Variantes a revisar

Todas las que estén en `temporary pdf/`. Mínimo las 6 estándar:
1. `test-carta-esencial-v2.pdf` — hotel, anfitrión paga gastos, salida aérea, femenino, amistad
2. `test-carta-esencial-b-v2.pdf` — domicilio anfitrión, sin gastos, terrestre, masculino, familiar
3. `test-carta-completo-v2.pdf` — 2 destinos, 2 acompañantes
4. `test-carta-completo-un-destino.pdf` — 1 destino, 1 acompañante
5. `test-carta-completo-un-viajero.pdf` — 0 acompañantes, 2 destinos
6. `test-carta-completo-4-destinos.pdf` — 4 destinos, 1 acompañante

---

## Formato de reporte

Per variant:
```
### [filename]
| # | Check | Result | Note |
|---|-------|--------|------|
| A1 | Singular/plural | PASS | |
| A2 | Género | PASS | |
| ... | ... | ... | ... |

Issues: [list or "ninguno"]
```

Final summary:
```
## Resumen
- X/Y variantes sin errores
- Issues encontrados:
  - [variant]: [descripción del problema]
```
