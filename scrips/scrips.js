/* ═══════════════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════════════ */
let st = {
  age: 25, height: 170, weight: 70, sexo: 'masculino',
  somato: 'ectomorfo', dias: 3, objetivo: 'perder_grasa',
  nivel: 'principiante', equipo: 'gym_completo',
  heightUnit: 'cm', weightUnit: 'kg',
  _imc: 0, _cat: '', _tdee: 0, _pesoIdeal: 0, _grasaEst: 0, _peso: 70, _prompt: ''
};

/* ═══════════════════════════════════════════════════════
   NAVEGACIÓN DE SECCIONES
═══════════════════════════════════════════════════════ */
function goTo(step) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById('sec' + step).classList.add('active');
  updateProgress(step);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(step) {
  for (let i = 1; i <= 5; i++) {
    const c = document.getElementById('sc' + i);
    c.classList.remove('active', 'done');
    if (i < step) { c.classList.add('done'); c.textContent = '✓'; }
    else if (i === step) { c.classList.add('active'); c.textContent = i === 5 ? '★' : i; }
    else c.textContent = i === 5 ? '★' : i;
    if (i < 5) document.getElementById('sl' + i).classList.toggle('done', i < step);
  }
}

/* ═══════════════════════════════════════════════════════
   SLIDERS
═══════════════════════════════════════════════════════ */
function updateSlider(type) {
  if (type === 'age') {
    st.age = +document.getElementById('ageSlider').value;
    document.getElementById('ageDisplay').innerHTML = st.age + ' <span class="slider-unit">años</span>';
  }
  if (type === 'height') {
    st.height = +document.getElementById('heightSlider').value;
    document.getElementById('heightDisplay').innerHTML = st.height + ' <span class="slider-unit">cm</span>';
  }
  if (type === 'weight') {
    const raw = +document.getElementById('weightSlider').value;
    document.getElementById('weightDisplay').innerHTML = raw + ' <span class="slider-unit">' + st.weightUnit + '</span>';
  }
  if (type === 'days') {
    st.dias = +document.getElementById('daysSlider').value;
    document.getElementById('daysDisplay').innerHTML = st.dias + ' <span class="slider-unit">días/semana</span>';
    updateDaysDesc();
  }
}

function updateDaysDesc() {
  const d = [
    '😴 Sedentario — No realizas actividad física regular.',
    '🚶 Muy ligero — Algo de movimiento 1 vez/semana.',
    '🚴 Ligero — Actividad moderada 2 veces por semana.',
    '⚡ Moderado — Entrenas regularmente 3 veces/semana.',
    '💪 Activo — Entrenamiento frecuente, buen hábito.',
    '🔥 Muy Activo — Entrenamiento intenso casi todos los días.',
    '🏆 Atlético — Entrenamiento diario de alta intensidad.'
  ];
  document.getElementById('daysDescBox').textContent = d[st.dias];
}

/* ═══════════════════════════════════════════════════════
   CONVERSIONES DE UNIDADES
═══════════════════════════════════════════════════════ */
function setHeightUnit(unit) {
  st.heightUnit = unit;
  document.getElementById('cmBtn').classList.toggle('active', unit === 'cm');
  document.getElementById('ftBtn').classList.toggle('active', unit === 'ft');
  document.getElementById('heightCm').style.display = unit === 'cm' ? 'block' : 'none';
  document.getElementById('heightFt').style.display = unit === 'ft' ? 'block' : 'none';

  if (unit === 'ft') {
    // convertir cm a pies/pulgadas
    const totalInches = st.height / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inc = Math.round(totalInches - ft * 12);
    document.getElementById('feetInput').value = ft;
    document.getElementById('inchesInput').value = inc;
    document.getElementById('ftConversion').textContent = '≈ ' + st.height + ' cm';
  }
}

function convertFtToCm() {
  const ft = +document.getElementById('feetInput').value || 0;
  const inc = +document.getElementById('inchesInput').value || 0;
  st.height = Math.round((ft * 30.48) + (inc * 2.54));
  document.getElementById('ftConversion').textContent = '≈ ' + st.height + ' cm';
}

function setWeightUnit(unit) {
  if (st.weightUnit === unit) return;
  st.weightUnit = unit;
  document.getElementById('kgBtn').classList.toggle('active', unit === 'kg');
  document.getElementById('lbBtn').classList.toggle('active', unit === 'lb');
  const slider = document.getElementById('weightSlider');
  const currentRaw = +slider.value;

  if (unit === 'lb') {
    // kg → lb
    slider.min = 66; slider.max = 440;
    slider.value = Math.round(currentRaw * 2.205);
    document.getElementById('weightLabels').innerHTML = '<span>66 lb</span><span>440 lb</span>';
  } else {
    // lb → kg
    slider.min = 30; slider.max = 200;
    slider.value = Math.round(currentRaw / 2.205);
    document.getElementById('weightLabels').innerHTML = '<span>30 kg</span><span>200 kg</span>';
  }
  updateSlider('weight');
}

function getWeightKg() {
  const raw = +document.getElementById('weightSlider').value;
  return st.weightUnit === 'lb' ? raw / 2.205 : raw;
}

/* ═══════════════════════════════════════════════════════
   CÁLCULO IMC, TDEE, GRASA, PESO IDEAL
═══════════════════════════════════════════════════════ */
function calcularIMC() {
  st.sexo = document.querySelector('[name="sexo"]:checked').value;
  st.somato = document.querySelector('[name="somato"]:checked').value;
  st.objetivo = document.querySelector('[name="objetivo"]:checked').value;
  st.nivel = document.querySelector('[name="nivel"]:checked').value;
  st.equipo = document.querySelector('[name="equipo"]:checked').value;

  const peso = getWeightKg();
  const talla = st.height / 100;
  const imc = peso / (talla * talla);
  const imcR = Math.round(imc * 10) / 10;

  // TMB — Harris-Benedict revisada
  let tmb;
  if (st.sexo === 'masculino') {
    tmb = 88.362 + (13.397 * peso) + (4.799 * st.height) - (5.677 * st.age);
  } else {
    tmb = 447.593 + (9.247 * peso) + (3.098 * st.height) - (4.330 * st.age);
  }

  // Factor de actividad según días de entrenamiento
  const factors = [1.2, 1.375, 1.375, 1.55, 1.725, 1.725, 1.9];
  const tdee = Math.round(tmb * factors[st.dias]);

  // Peso ideal — fórmula de Devine
  let pesoIdeal;
  if (st.sexo === 'masculino') {
    pesoIdeal = 50 + 2.3 * ((st.height - 152.4) / 2.54);
  } else {
    pesoIdeal = 45.5 + 2.3 * ((st.height - 152.4) / 2.54);
  }
  pesoIdeal = Math.round(pesoIdeal);

  // Grasa corporal — fórmula de Deurenberg
  const sexMale = st.sexo === 'masculino' ? 1 : 0;
  const grasaCorp = Math.round((1.20 * imc) + (0.23 * st.age) - (10.8 * sexMale) - 5.4);

  // Categoría IMC
  let cat, cls, desc;
  if (imc < 18.5) { cat = 'Bajo Peso'; cls = 'bajo'; desc = 'Tu peso está por debajo del rango saludable para tu estatura.'; }
  else if (imc < 25) { cat = 'Peso Normal ✓'; cls = 'normal'; desc = '¡Excelente! Tu peso está dentro del rango saludable.'; }
  else if (imc < 30) { cat = 'Sobrepeso'; cls = 'sobrepeso'; desc = 'Tu peso supera levemente el rango saludable recomendado.'; }
  else if (imc < 35) { cat = 'Obesidad Grado I'; cls = 'obesidad1'; desc = 'Es importante tomar acción para mejorar tu salud.'; }
  else { cat = 'Obesidad Grado II'; cls = 'obesidad2'; desc = 'Se recomienda atención médica profesional urgente.'; }

  // Posición del indicador en la barra (rango 15 a 40)
  const pct = Math.min(100, Math.max(0, ((imc - 15) / 25) * 100));

  // Render en UI
  document.getElementById('imcValue').textContent = imcR;
  document.getElementById('imcLabel').className = 'imc-label ' + cls;
  document.getElementById('imcLabel').textContent = cat;
  document.getElementById('imcDesc').textContent = desc;
  setTimeout(() => { document.getElementById('imcPointer').style.left = pct + '%'; }, 300);

  document.getElementById('statsGrid').innerHTML = [
    { v: imcR, l: 'Índice de Masa Corporal' },
    { v: tdee + ' kcal', l: 'Calorías Mantenimiento' },
    { v: pesoIdeal + ' kg', l: 'Peso Ideal Estimado' },
    { v: Math.max(0, grasaCorp) + '%', l: 'Grasa Corporal Est.' }
  ].map(s => `<div class="stat-card"><div class="stat-value">${s.v}</div><div class="stat-label">${s.l}</div></div>`).join('');

  // Chips de resumen
  const oL = {
    perder_grasa: '🔥 Perder Grasa', ganar_musculo: '💪 Ganar Músculo',
    definicion: '⚡ Definición', salud_general: '❤️ Salud General',
    resistencia: '🏃 Resistencia', fuerza: '🏋️ Fuerza'
  };
  const eL = { gym_completo: '🏋️ Gym', mancuernas: '🔵 Mancuernas', cuerpo: '🤸 Sin equipo' };
  const nL = { principiante: '🌱 Principiante', intermedio: '⚙️ Intermedio', avanzado: '🏆 Avanzado' };
  const soL = { ectomorfo: '🏃 Ectomorfo', mesomorfo: '💪 Mesomorfo', endomorfo: '🏋️ Endomorfo' };
  const dL = ['😴 Sedentario', '🚶 1d/sem', '🚴 2d/sem', '⚡ 3d/sem', '💪 4d/sem', '🔥 5d/sem', '🏆 6d/sem'];

  document.getElementById('profileChips').innerHTML = [
    st.sexo === 'masculino' ? '♂ Masculino' : '♀ Femenino',
    st.age + ' años', st.height + ' cm', Math.round(peso) + ' kg',
    soL[st.somato], dL[st.dias], oL[st.objetivo], nL[st.nivel], eL[st.equipo]
  ].map(c => `<span class="chip">${c}</span>`).join('');

  // Alerta metabólica
  let am = '', ac = 'alert-info';
  if (imc < 18.5) {
    am = '⚠️ Con bajo peso, tu plan priorizará ganancia de masa muscular con superávit calórico y entrenamiento de fuerza progresivo.';
  } else if (cls === 'normal') {
    am = '✅ ¡Estás en el rango ideal! Tu plan optimizará tu composición corporal según tu objetivo.';
  } else {
    am = '⚠️ Con IMC elevado, el plan priorizará pérdida de grasa con déficit calórico moderado y ejercicio cardiovascular.';
    ac = 'alert-warn';
  }
  const ael = document.getElementById('metabolicAlert');
  ael.className = 'alert ' + ac;
  ael.textContent = am;

  // Explicación
  const exps = {
    bajo: `Con un IMC de ${imcR}, estás por debajo del peso saludable. Puede indicar déficit nutricional o masa muscular baja. Tu plan se enfocará en aumentar calorías con alimentos de calidad y entrenamiento de fuerza progresivo. Calorías de mantenimiento: ${tdee} kcal/día.`,
    normal: `¡Felicitaciones! Con un IMC de ${imcR} estás en el rango óptimo. Podemos mejorar tu composición (más músculo, menos grasa) según tu objetivo específico. Calorías de mantenimiento: ${tdee} kcal/día.`,
    sobrepeso: `Con un IMC de ${imcR}, estás en sobrepeso. Un déficit de 300-500 kcal/día con ejercicio es la estrategia más efectiva y sostenible. Calorías de mantenimiento: ${tdee} kcal/día.`,
    obesidad1: `Con un IMC de ${imcR} (Obesidad Grado I), es fundamental cambiar hábitos. Ejercicio aeróbico combinado con fuerza y dieta hipocalórica puede generar resultados en 3-6 meses. Calorías de mantenimiento: ${tdee} kcal/día.`,
    obesidad2: `Con un IMC de ${imcR}, consulta con un médico antes de iniciar cualquier programa. El ejercicio de bajo impacto (caminata, natación, bicicleta estacionaria) es el punto de inicio más seguro. Calorías de mantenimiento: ${tdee} kcal/día.`
  };
  document.getElementById('imcExplanation').textContent = exps[cls] || exps.normal;

  // Guardar en estado
  st._imc = imcR;
  st._cat = cat;
  st._tdee = tdee;
  st._pesoIdeal = pesoIdeal;
  st._grasaEst = Math.max(0, grasaCorp);
  st._peso = Math.round(peso);

  goTo(4);
}

/* ═══════════════════════════════════════════════════════
   GENERAR PROMPT — respuesta directa en el chat, sin archivos
═══════════════════════════════════════════════════════ */
function generarPrompt() {
  const oL = {
    perder_grasa: 'pérdida de grasa corporal',
    ganar_musculo: 'ganancia de masa muscular',
    definicion: 'definición y tonificación muscular',
    salud_general: 'salud general y bienestar integral',
    resistencia: 'resistencia cardiovascular y aeróbica',
    fuerza: 'desarrollo de fuerza máxima'
  };
  const nL = {
    principiante: 'principiante (0 a 6 meses de experiencia)',
    intermedio: 'intermedio (6 meses a 2 años de experiencia)',
    avanzado: 'avanzado (más de 2 años de entrenamiento constante)'
  };
  const eL = {
    gym_completo: 'gimnasio completo con máquinas, barras olímpicas, pesas libres y poleas',
    mancuernas: 'mancuernas y pesas libres en casa o gym básico',
    cuerpo: 'solo peso corporal (calistenia), sin equipamiento adicional'
  };
  const sL = {
    ectomorfo: 'ectomorfo — metabolismo rápido, estructura ósea pequeña, dificultad para ganar peso y músculo',
    mesomorfo: 'mesomorfo — respuesta muscular rápida, buena constitución atlética natural, facilidad para ganar músculo',
    endomorfo: 'endomorfo — metabolismo más lento, tendencia a acumular grasa especialmente en abdomen y caderas'
  };
  const dL = [
    'sedentario (no realiza actividad física)',
    '1 día a la semana',
    '2 días a la semana',
    '3 días a la semana',
    '4 días a la semana',
    '5 días a la semana',
    '6 días a la semana'
  ];

  // Ajustes calóricos según objetivo e IMC
  let calObj = st._tdee;
  if (st.objetivo === 'perder_grasa') calObj = st._tdee - 400;
  if (st.objetivo === 'ganar_musculo') calObj = st._tdee + 300;
  if (st.objetivo === 'definicion') calObj = st._tdee - 250;
  if (st._imc >= 30 && st.objetivo !== 'ganar_musculo') calObj = st._tdee - 500;
  calObj = Math.max(1200, calObj);

  // Macros: proteínas por peso corporal
  let pm = 2.0;
  if (st.objetivo === 'ganar_musculo') pm = 2.2;
  if (st.objetivo === 'perder_grasa' || st.objetivo === 'definicion') pm = 2.4;
  const prot = Math.round(st._peso * pm);
  const carbs = Math.round((calObj * 0.40) / 4);
  const grasas = Math.round((calObj * 0.25) / 9);

  const diffPesoIdeal = st._peso - st._pesoIdeal;
  const signoPeso = diffPesoIdeal > 0 ? '+' : '';

  const prompt = `Actúa como un entrenador personal certificado y nutricionista deportivo profesional. Basándote en los siguientes datos, responde directamente en este chat con un plan completo y personalizado. NO generes código HTML, NO generes PDF, NO uses markdown complejo. Solo responde con texto claro, estructurado con títulos, listas y tablas simples en el chat.

═══════════════════════════════════════════
👤 PERFIL DEL USUARIO
═══════════════════════════════════════════
• Edad: ${st.age} años
• Sexo biológico: ${st.sexo}
• Estatura: ${st.height} cm
• Peso actual: ${st._peso} kg
• Somatotipo: ${sL[st.somato]}
• IMC: ${st._imc} (${st._cat})
• Grasa corporal estimada: ${st._grasaEst}%
• Peso ideal estimado: ${st._pesoIdeal} kg
• Diferencia con peso ideal: ${signoPeso}${diffPesoIdeal} kg

═══════════════════════════════════════════
🎯 OBJETIVO Y CONDICIONES
═══════════════════════════════════════════
• Objetivo principal: ${oL[st.objetivo]}
• Nivel de experiencia: ${nL[st.nivel]}
• Frecuencia de entrenamiento: ${dL[st.dias]}
• Equipamiento disponible: ${eL[st.equipo]}

═══════════════════════════════════════════
🔥 METABOLISMO Y MACROS OBJETIVO
═══════════════════════════════════════════
• TDEE (mantenimiento): ${st._tdee} kcal/día
• Calorías objetivo: ${calObj} kcal/día
• Proteínas: ${prot} g/día (${Math.round(pm * 10) / 10} g por kg de peso)
• Carbohidratos: ${carbs} g/día (40% de calorías)
• Grasas saludables: ${grasas} g/día (25% de calorías)

═══════════════════════════════════════════
📋 QUÉ NECESITO QUE ME RESPONDAS
═══════════════════════════════════════════

Responde directamente en el chat con las siguientes 5 partes bien organizadas:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 1 — RESUMEN Y DIAGNÓSTICO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Análisis breve de mi situación actual
• Expectativas realistas de resultados en 4, 8 y 12 semanas
• Mensaje motivacional personalizado según mi objetivo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 2 — RUTINA DE ENTRENAMIENTO SEMANAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organiza la rutina de Lunes a Sábado (Domingo = descanso activo) adaptada a mi nivel ${nL[st.nivel]} y equipamiento ${eL[st.equipo]}.

Para CADA día incluye:
1. Nombre del día y grupo(s) muscular(es) a trabajar
2. Calentamiento (5-10 min): 3-4 ejercicios de movilidad articular
3. Bloque principal: mínimo 6-8 ejercicios con formato tabla simple:
   - Nombre del ejercicio
   - Series × Repeticiones
   - Descanso entre series
   - Músculo trabajado
   - Dificultad (principiante/intermedio/avanzado)
4. Trabajo de core (2-3 ejercicios) si aplica
5. Enfriamiento y estiramientos (5 min)

Domingo: plan de descanso activo con movilidad, yoga o caminata.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 3 — PLAN NUTRICIONAL SEMANAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Plan de Lunes a Domingo. Objetivo: ${calObj} kcal/día, ${prot}g proteína, ${carbs}g carbos, ${grasas}g grasas.

Para CADA día incluye 5 comidas con horarios y cantidades en gramos:
• Desayuno (07:00-08:00)
• Snack mañana (10:30)
• Almuerzo (12:30-13:30)
• Snack tarde / pre-entreno (16:30)
• Cena (19:30-20:00)

Al final de cada día: total de calorías y macros del día.
Usa alimentos variados, accesibles en Latinoamérica. No repitas los mismos menús dos días consecutivos. Incluye nota de hidratación (mínimo 2.5L de agua/día).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 4 — CONSEJOS Y SUPLEMENTACIÓN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 6 tips específicos para mi somatotipo ${st.somato}
• Suplementación básica según mi objetivo (qué, cuánto, cuándo)
• Señales de sobreentrenamiento a vigilar
• Progresión sugerida: semanas 1-4 vs semanas 5-8
• Hábitos de sueño y recuperación esenciales
• Tabla de seguimiento semanal (peso, medidas, cómo me siento)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PARTE 5 — RECORDATORIO IMPORTANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nota final: este plan es orientativo y educativo, no reemplaza consulta con médico, nutricionista o entrenador certificado presencial.

═══════════════════════════════════════════
📝 INSTRUCCIONES DE FORMATO
═══════════════════════════════════════════
• Responde TODO en español
• Usa emojis para hacer el contenido visual
• Usa tablas simples en texto plano para ejercicios y comidas
• Separa claramente cada parte con títulos grandes
• Sé detallado, profesional, específico y motivador
• Responde COMPLETO en una sola respuesta en el chat
• No generes archivos, no generes código, solo texto formateado

Empieza ahora el plan.`;

  // Render en pantalla con highlights
  document.getElementById('promptBox').innerHTML = prompt
    .replace(/═══[^═\n]*/g, m => `<span class="prompt-section">${m}</span>`)
    .replace(/━━━[^━\n]*/g, m => `<span class="prompt-section">${m}</span>`)
    .replace(/•\s[^:\n]+:/g, m => `<span class="prompt-highlight">${m}</span>`);

  st._prompt = prompt;
  goTo(5);
}

/* ═══════════════════════════════════════════════════════
   COPIAR PROMPT
═══════════════════════════════════════════════════════ */
function copyPrompt() {
  if (!st._prompt) return;
  const fallback = () => {
    const ta = document.createElement('textarea');
    ta.value = st._prompt;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  };
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(st._prompt).then(showToast).catch(fallback);
  } else {
    fallback();
  }
}

function showToast() {
  const t = document.getElementById('copyToast');
  t.style.display = 'block';
  setTimeout(() => t.style.display = 'none', 5000);
}

/* ═══════════════════════════════════════════════════════
   RESET
═══════════════════════════════════════════════════════ */
function resetAll() {
  document.getElementById('ageSlider').value = 25;
  document.getElementById('heightSlider').value = 170;
  document.getElementById('weightSlider').min = 30;
  document.getElementById('weightSlider').max = 200;
  document.getElementById('weightSlider').value = 70;
  document.getElementById('daysSlider').value = 3;
  st.weightUnit = 'kg';
  st.heightUnit = 'cm';
  document.getElementById('kgBtn').classList.add('active');
  document.getElementById('lbBtn').classList.remove('active');
  document.getElementById('cmBtn').classList.add('active');
  document.getElementById('ftBtn').classList.remove('active');
  document.getElementById('heightCm').style.display = 'block';
  document.getElementById('heightFt').style.display = 'none';
  document.getElementById('weightLabels').innerHTML = '<span>30 kg</span><span>200 kg</span>';
  ['age', 'height', 'weight', 'days'].forEach(updateSlider);
  document.querySelector('[name="sexo"][value="masculino"]').checked = true;
  document.querySelector('[name="somato"][value="ectomorfo"]').checked = true;
  document.querySelector('[name="objetivo"][value="perder_grasa"]').checked = true;
  document.querySelector('[name="nivel"][value="principiante"]').checked = true;
  document.querySelector('[name="equipo"][value="gym_completo"]').checked = true;
}

/* ═══════════════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════════════ */
updateSlider('days');
updateDaysDesc();
