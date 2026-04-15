// ── Budget range
function updateBudget(v) {
  const n = parseInt(v);
  let d;
  if (n >= 50000000) d = '$50,000,000+ MXN';
  else if (n >= 1000000) d = '$' + (n / 1000000).toFixed(1) + 'M MXN';
  else d = '$' + n.toLocaleString('es-MX') + ' MXN';
  document.getElementById('budget-val').textContent = d;
}

// ── Toast
function showToast(title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5500);
}

// ── Form handlers
function handleCot(e) {
  e.preventDefault();
  showToast('¡Solicitud Enviada!', 'Un ingeniero especialista revisará su proyecto y le contactará en menos de 48h hábiles.');
  e.target.reset();
  document.getElementById('budget-val').textContent = '$500,000 MXN';
  document.getElementById('budget-range').value = 500000;
}
function handleContact(e) {
  e.preventDefault();
  showToast('¡Mensaje Recibido!', 'Nuestro equipo responderá su consulta en menos de 24h hábiles.');
  e.target.reset();
}

// ── Nav scroll effect
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// ── Active nav links
const allSections = document.querySelectorAll('section[id], [id="metrics"], [id="cta-band"]');
const navAs = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let cur = '';
  allSections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 90) cur = s.id;
  });
  navAs.forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === '#' + cur);
  });
}, { passive: true });

// ── Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const tgt = document.querySelector(a.getAttribute('href'));
    if (tgt) { e.preventDefault(); tgt.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Reveal on scroll
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => ro.observe(el));

// ══════════════════════════════════════════════════
// ══  CARRUSEL DE PORTAFOLIO — Responsivo + Touch
// ══════════════════════════════════════════════════

(function initCarousel() {
  const track = document.getElementById('carousel-track');
  const viewport = document.getElementById('carousel-viewport');
  const prevBtn = document.getElementById('carousel-prev');
  const nextBtn = document.getElementById('carousel-next');
  const counterEl = document.getElementById('carousel-counter');
  const dotsContainer = document.getElementById('carousel-dots');
  const slides = track.querySelectorAll('.carousel-slide');
  const totalSlides = slides.length;

  let currentIndex = 0;
  let slideWidth = 0;
  let autoPlayTimer = null;
  const AUTO_PLAY_INTERVAL = 5000;

  // ── Calcular ancho de cada slide según CSS flex-basis
  function calcSlideWidth() {
    if (!slides[0]) return;
    slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).paddingRight || 0);
  }

  // ── Mover al slide indicado
  function goToSlide(index, smooth = true) {
    if (index < 0) index = totalSlides - 1;
    if (index >= totalSlides) index = 0;
    currentIndex = index;

    calcSlideWidth();
    track.style.transition = smooth
      ? 'transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      : 'none';
    track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    updateUI();
  }

  // ── Actualizar contador, dots, estado de flechas
  function updateUI() {
    // Contador
    const display = String(currentIndex + 1).padStart(2, '0');
    counterEl.textContent = `${display} / ${String(totalSlides).padStart(2, '0')}`;

    // Dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // ── Generar dots
  function buildDots() {
    dotsContainer.innerHTML = '';
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Proyecto ${i + 1}`);
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoPlay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  // ── Auto-play
  function startAutoPlay() {
    stopAutoPlay();
    autoPlayTimer = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, AUTO_PLAY_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  // ── Flechas
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoPlay();
  });

  // ── Soporte teclado
  document.addEventListener('keydown', (e) => {
    // Solo si la sección de portafolio está visible en el viewport
    const section = document.getElementById('portafolio');
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    if (e.key === 'ArrowLeft') { goToSlide(currentIndex - 1); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { goToSlide(currentIndex + 1); resetAutoPlay(); }
  });

  // ── Drag / Touch (swipe para mobile y desktop)
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
  }

  function dragStart(event) {
    isDragging = true;
    startX = getPositionX(event);
    prevTranslate = currentIndex * slideWidth * -1;
    track.classList.add('is-dragging');
    stopAutoPlay();
  }

  function dragMove(event) {
    if (!isDragging) return;
    const currentX = getPositionX(event);
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;
    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function dragEnd(event) {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('is-dragging');

    const movedBy = currentTranslate - prevTranslate;
    // Si arrastró más del 20% del ancho del slide, cambiar
    const threshold = slideWidth * 0.2;

    if (movedBy < -threshold) {
      goToSlide(currentIndex + 1);
    } else if (movedBy > threshold) {
      goToSlide(currentIndex - 1);
    } else {
      goToSlide(currentIndex); // volver al actual
    }
    resetAutoPlay();
  }

  // Mouse events
  viewport.addEventListener('mousedown', dragStart);
  viewport.addEventListener('mousemove', dragMove);
  viewport.addEventListener('mouseup', dragEnd);
  viewport.addEventListener('mouseleave', () => {
    if (isDragging) dragEnd();
  });

  // Touch events
  viewport.addEventListener('touchstart', dragStart, { passive: true });
  viewport.addEventListener('touchmove', dragMove, { passive: true });
  viewport.addEventListener('touchend', dragEnd);

  // Prevenir drag de imágenes
  track.addEventListener('dragstart', e => e.preventDefault());

  // ── Pausar auto-play cuando el mouse está encima
  viewport.addEventListener('mouseenter', stopAutoPlay);
  viewport.addEventListener('mouseleave', startAutoPlay);

  // ── Recalcular en resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goToSlide(currentIndex, false);
    }, 150);
  });

  // ── Inicializar
  buildDots();
  calcSlideWidth();
  goToSlide(0, false);
  startAutoPlay();
})();


// ══════════════════════════════════════════════════════════════
// ══  RODGAR AI CHATBOT — Flujo conversacional con recopilación
// ══════════════════════════════════════════════════════════════

const chatbotLauncher = document.getElementById('chatbot-launcher');
const chatbotWindow = document.getElementById('chatbot-window');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatCloseBtn = document.getElementById('chat-close');
const chatbotBadge = document.getElementById('chatbot-badge');

// ── Botón cerrar chatbot
chatCloseBtn.addEventListener('click', () => {
  chatbotWindow.classList.remove('active');
});

// ── Datos del lead que se van recopilando en la conversación
let leadData = {
  nombre: null,
  telefono: null,
  email: null,
  tipoProyecto: null,
  descripcion: null,
  timestamp: null
};

// ── Estado actual del flujo conversacional
// Estados posibles: 'idle' | 'asking_name' | 'asking_phone' | 'asking_email'
//                 | 'asking_project_type' | 'asking_description' | 'completed'
let chatState = 'idle';

// ── Flag para saber si ya se abrió antes
let firstOpen = true;

// ── Base de conocimiento para preguntas frecuentes
const KNOWLEDGE_BASE = [
  {
    keywords: ['experiencia', 'años', 'tiempo', 'trayectoria', 'historia'],
    response: '🏗️ Contamos con <strong>10 años de experiencia en obra civil</strong> y <strong>2 años en arquitectura</strong>. Nuestra trayectoria nos respalda con múltiples proyectos entregados exitosamente en tiempo y forma.'
  },
  {
    keywords: ['servicio', 'servicios', 'hacen', 'ofrecen', 'realizan'],
    response: '📋 Nuestros servicios incluyen:<br>• Obra civil residencial y comercial<br>• Diseño arquitectónico<br>• Cálculo estructural<br>• Supervisión de obra<br>• Consultoría técnica y planos<br>• Remodelaciones y ampliaciones<br><br>¿Te gustaría cotizar alguno de estos servicios?'
  },
  {
    keywords: ['costo', 'precio', 'cotiz', 'presupu', 'cuanto', 'cuánto', 'cobran'],
    response: '💰 Cada proyecto es único, por lo que nuestras cotizaciones son personalizadas y <strong>completamente gratuitas</strong>. Preparamos una propuesta técnica y económica detallada en menos de <strong>48 horas</strong>. ¿Te gustaría que preparemos una cotización para tu proyecto?'
  },
  {
    keywords: ['ubicaci', 'donde', 'dónde', 'zona', 'ciudad', 'manzanillo', 'colima'],
    response: '📍 Estamos ubicados en <strong>Manzanillo, Colima</strong>, pero trabajamos en toda la región. Nuestro equipo puede atender proyectos en Colima y zonas aledañas.'
  },
  {
    keywords: ['contacto', 'teléfono', 'telefono', 'whatsapp', 'llamar', 'correo', 'email'],
    response: '📞 Puedes contactarnos directamente:<br>• <strong>WhatsApp:</strong> +52 999 000 0000<br>• <strong>Email:</strong> info@rodgar.com.mx<br><br>O si prefieres, puedo tomar tus datos ahora mismo para que el arquitecto te contacte. ¿Te gustaría?'
  },
  {
    keywords: ['bim', 'tecnolog', 'digital', 'gemelo'],
    response: '🖥️ Utilizamos tecnología <strong>BIM (Building Information Modeling)</strong> para coordinar todas las disciplinas del proyecto. Esto nos permite detectar conflictos en fase digital y reducir costos de materiales hasta un 15%.'
  },
  {
    keywords: ['residencial', 'casa', 'hogar', 'vivienda', 'departamento'],
    response: '🏠 Diseñamos y construimos proyectos residenciales de alta calidad: desde casas habitación hasta desarrollos de departamentos. Cada proyecto se adapta a las necesidades y presupuesto del cliente.'
  },
  {
    keywords: ['comercial', 'nave', 'industrial', 'bodega', 'local', 'oficina'],
    response: '🏢 Tenemos experiencia en proyectos comerciales e industriales: naves industriales, locales comerciales, oficinas y bodegas. Manejamos estructuras metálicas y de concreto según las necesidades del proyecto.'
  },
  {
    keywords: ['garant', 'segur', 'calidad', 'confianza'],
    response: '✅ Todos nuestros proyectos incluyen:<br>• Garantía estructural<br>• Supervisión residente permanente<br>• Reportes de avance<br>• Planos as-built al finalizar<br>• Transparencia total en costos'
  },
  {
    keywords: ['hola', 'buenos', 'buenas', 'hey', 'saludos', 'que tal', 'qué tal'],
    response: '¡Hola! 👋 Bienvenido a <strong>RODGAR</strong>. Con 10 años de experiencia en obra civil y 2 en arquitectura, estamos listos para ayudarte. ¿En qué puedo asistirte?'
  }
];

// ── Abrir/cerrar chatbot
chatbotLauncher.addEventListener('click', () => {
  chatbotWindow.classList.toggle('active');
  // Ocultar badge de notificación al abrir
  if (chatbotBadge) chatbotBadge.style.display = 'none';
  if (firstOpen) {
    setTimeout(() => {
      addBotMessage('¡Hola! 👋 Bienvenido a <strong>RODGAR</strong> — Ingeniería Civil y Arquitectura.');
      setTimeout(() => {
        addBotMessage('Con <strong>10 años de experiencia en obra civil</strong> y <strong>2 años en arquitectura</strong>, estamos listos para llevar tu proyecto al siguiente nivel. ¿En qué puedo ayudarte?');
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Quiero cotizar un proyecto', action: 'start_lead' },
            { label: '📋 Ver servicios', action: 'faq_servicios' },
            { label: '🏗️ Experiencia de RODGAR', action: 'faq_experiencia' },
            { label: '📞 Datos de contacto', action: 'faq_contacto' }
          ]);
        }, 400);
      }, 800);
    }, 600);
    firstOpen = false;
  }
});

// ── Enviar mensaje del usuario
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addUserMessage(text);
  chatInput.value = '';

  // Procesar según el estado actual del flujo
  setTimeout(() => {
    processUserInput(text);
  }, 600 + Math.random() * 400);
});

// ══════════════════════════════════
// ══  Procesador principal de input
// ══════════════════════════════════
function processUserInput(text) {
  switch (chatState) {
    case 'asking_name':
      handleNameInput(text);
      break;
    case 'asking_phone':
      handlePhoneInput(text);
      break;
    case 'asking_email':
      handleEmailInput(text);
      break;
    case 'asking_project_type':
      handleProjectTypeInput(text);
      break;
    case 'asking_description':
      handleDescriptionInput(text);
      break;
    default:
      // Estado idle — buscar en FAQ o interpretar intención
      handleIdleInput(text);
      break;
  }
}

// ── Manejo cuando el chatbot está en idle (sin flujo activo)
function handleIdleInput(text) {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Detectar intención de cotizar / contactar
  if (matchesAny(lower, ['cotizar', 'cotizacion', 'proyecto', 'construir', 'quiero', 'necesito', 'presupuesto', 'interesa'])) {
    startLeadFlow();
    return;
  }

  // Detectar si quiere hablar con alguien
  if (matchesAny(lower, ['hablar', 'arquitecto', 'ingeniero', 'contactar', 'llamar', 'cita'])) {
    addBotMessage('¡Con gusto te ponemos en contacto con nuestro equipo! Permíteme tomar algunos datos para que el arquitecto pueda comunicarse contigo.');
    setTimeout(() => startLeadFlow(), 800);
    return;
  }

  // Buscar en base de conocimiento
  for (const entry of KNOWLEDGE_BASE) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      addBotMessage(entry.response);
      setTimeout(() => {
        showQuickReplies([
          { label: '💬 Quiero cotizar', action: 'start_lead' },
          { label: '❓ Otra pregunta', action: 'otra_pregunta' }
        ]);
      }, 500);
      return;
    }
  }

  // Respuesta por defecto
  addBotMessage('Gracias por tu mensaje. Para poder asesorarte mejor, te ofrezco estas opciones:');
  setTimeout(() => {
    showQuickReplies([
      { label: '💬 Cotizar un proyecto', action: 'start_lead' },
      { label: '📋 Ver servicios', action: 'faq_servicios' },
      { label: '📞 Datos de contacto', action: 'faq_contacto' }
    ]);
  }, 400);
}

// ══════════════════════════════════════
// ══  FLUJO DE RECOPILACIÓN DE DATOS
// ══════════════════════════════════════

function startLeadFlow() {
  // Reiniciar datos del lead
  leadData = {
    nombre: null,
    telefono: null,
    email: null,
    tipoProyecto: null,
    descripcion: null,
    timestamp: new Date().toISOString()
  };

  chatState = 'asking_name';
  addBotMessage('¡Perfecto! Vamos a preparar tu solicitud. 📝<br><br>Para comenzar, <strong>¿cuál es tu nombre completo?</strong>');
  chatInput.placeholder = 'Escribe tu nombre...';
}

function handleNameInput(text) {
  if (text.length < 2) {
    addBotMessage('Por favor, ingresa un nombre válido. 😊');
    return;
  }
  leadData.nombre = text;
  chatState = 'asking_phone';
  addBotMessage(`Mucho gusto, <strong>${text}</strong> 👋<br><br>¿Cuál es tu <strong>número de teléfono o WhatsApp</strong>? Así el arquitecto podrá contactarte directamente.`);
  chatInput.placeholder = 'Ej: 314 123 4567';
}

function handlePhoneInput(text) {
  // Validar que tenga al menos 7 dígitos
  const digits = text.replace(/\D/g, '');
  if (digits.length < 7) {
    addBotMessage('Parece que el número no es válido. Por favor ingresa un número de teléfono con al menos 10 dígitos. 📱');
    return;
  }
  leadData.telefono = text;
  chatState = 'asking_email';
  addBotMessage('Perfecto ✅<br><br>¿Nos puedes compartir tu <strong>correo electrónico</strong>? Lo usaremos para enviarte la cotización formal.');
  chatInput.placeholder = 'Ej: tucorreo@ejemplo.com';
}

function handleEmailInput(text) {
  // Validar formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(text)) {
    addBotMessage('Hmm, ese correo no parece válido. ¿Podrías verificarlo? Ejemplo: <strong>nombre@correo.com</strong>');
    return;
  }
  leadData.email = text;
  chatState = 'asking_project_type';
  addBotMessage('Excelente 📧<br><br>¿Qué <strong>tipo de proyecto</strong> tienes en mente?');
  setTimeout(() => {
    showQuickReplies([
      { label: '🏠 Casa habitación', action: 'type_casa' },
      { label: '🏢 Comercial / Oficinas', action: 'type_comercial' },
      { label: '🏗️ Nave industrial', action: 'type_industrial' },
      { label: '🔧 Remodelación', action: 'type_remodelacion' },
      { label: '📐 Solo diseño / planos', action: 'type_diseno' },
      { label: '🏗️ Otro tipo', action: 'type_otro' }
    ]);
  }, 400);
  chatInput.placeholder = 'O escribe el tipo de proyecto...';
}

function handleProjectTypeInput(text) {
  leadData.tipoProyecto = text;
  chatState = 'asking_description';
  addBotMessage(`Entendido: <strong>${text}</strong> 📁<br><br>Por último, <strong>cuéntanos brevemente sobre tu proyecto</strong>: dimensiones aproximadas, ubicación, lo que tengas en mente. Todo nos ayuda a preparar una mejor propuesta.`);
  chatInput.placeholder = 'Describe tu proyecto brevemente...';
}

function handleDescriptionInput(text) {
  leadData.descripcion = text;
  chatState = 'completed';
  chatInput.placeholder = 'Escribe tu mensaje...';

  // Mostrar resumen
  addBotMessage(`¡Listo! ✅ Hemos recopilado tu información:<br><br>
    <div class="chat-summary">
      <div class="chat-summary-row"><span class="chat-summary-label">👤 Nombre:</span> ${leadData.nombre}</div>
      <div class="chat-summary-row"><span class="chat-summary-label">📱 Teléfono:</span> ${leadData.telefono}</div>
      <div class="chat-summary-row"><span class="chat-summary-label">📧 Email:</span> ${leadData.email}</div>
      <div class="chat-summary-row"><span class="chat-summary-label">📁 Proyecto:</span> ${leadData.tipoProyecto}</div>
      <div class="chat-summary-row"><span class="chat-summary-label">📝 Detalle:</span> ${leadData.descripcion}</div>
    </div>`);

  setTimeout(() => {
    addBotMessage('¡Perfecto! Ahora puedes enviar esta información directamente al <strong>arquitecto por WhatsApp</strong> con un solo clic. 📲');

    setTimeout(() => {
      showQuickReplies([
        { label: '📲 Enviar por WhatsApp', action: 'send_whatsapp' },
        { label: '📧 Enviar por Email', action: 'send_email' },
        { label: '💬 Tengo otra consulta', action: 'otra_pregunta' },
        { label: '👋 Gracias, es todo', action: 'despedida' }
      ]);
    }, 600);
  }, 1000);
}

// ══════════════════════════════════════════════
// ══  Enviar datos SIN backend (WhatsApp / Email)
// ══════════════════════════════════════════════

// ── Número de WhatsApp del arquitecto (formato internacional sin +)
// ⚠️ CAMBIAR POR EL NÚMERO REAL: ejemplo para +52 314 123 4567 → '523141234567'
const WHATSAPP_NUMBER = '523141024831';

// ── Email del arquitecto
const ARCHITECT_EMAIL = 'info@rodgar.com.mx';

// Enviar info del lead por WhatsApp
function sendViaWhatsApp(data) {
  const message = `🏗️ *NUEVO LEAD — RODGAR WEB*\n\n` +
    `👤 *Nombre:* ${data.nombre}\n` +
    `📱 *Teléfono:* ${data.telefono}\n` +
    `📧 *Email:* ${data.email}\n` +
    `📁 *Tipo de proyecto:* ${data.tipoProyecto}\n` +
    `📝 *Descripción:* ${data.descripcion}\n\n` +
    `📅 *Fecha:* ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` +
    `🌐 *Origen:* Chatbot Web RODGAR`;

  const encoded = encodeURIComponent(message);
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
  window.open(url, '_blank');
}

// Enviar info del lead por Email (abre cliente de correo)
function sendViaEmail(data) {
  const subject = `Nuevo Lead Web — ${data.nombre} — ${data.tipoProyecto}`;
  const body = `NUEVO LEAD — RODGAR WEB\n\n` +
    `Nombre: ${data.nombre}\n` +
    `Teléfono: ${data.telefono}\n` +
    `Email: ${data.email}\n` +
    `Tipo de proyecto: ${data.tipoProyecto}\n` +
    `Descripción: ${data.descripcion}\n\n` +
    `Fecha: ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}\n` +
    `Origen: Chatbot Web RODGAR`;

  const mailtoUrl = `mailto:${ARCHITECT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoUrl, '_blank');
}

// ══════════════════════════════════
// ══  Manejo de quick replies
// ══════════════════════════════════
function handleQuickReply(action) {
  // Deshabilitar los botones de quick reply actuales
  document.querySelectorAll('.chat-quick-replies').forEach(el => {
    el.querySelectorAll('.chat-quick-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.pointerEvents = 'none';
    });
  });

  switch (action) {
    case 'send_whatsapp':
      addUserMessage('Enviar por WhatsApp');
      sendViaWhatsApp(leadData);
      setTimeout(() => {
        addBotMessage('¡Se abrió WhatsApp con tu información lista para enviar! 📲✅<br><br>Solo presiona <strong>Enviar</strong> en WhatsApp y el arquitecto recibirá todos tus datos al instante.');
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Tengo otra consulta', action: 'otra_pregunta' },
            { label: '👋 Gracias, es todo', action: 'despedida' }
          ]);
        }, 500);
      }, 800);
      break;

    case 'send_email':
      addUserMessage('Enviar por Email');
      sendViaEmail(leadData);
      setTimeout(() => {
        addBotMessage('¡Se abrió tu correo con la información pre-llenada! 📧✅<br><br>Solo presiona <strong>Enviar</strong> en tu cliente de correo.');
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Tengo otra consulta', action: 'otra_pregunta' },
            { label: '👋 Gracias, es todo', action: 'despedida' }
          ]);
        }, 500);
      }, 800);
      break;

    case 'start_lead':
      addUserMessage('Quiero cotizar un proyecto');
      setTimeout(() => startLeadFlow(), 500);
      break;

    case 'faq_servicios':
      addUserMessage('Ver servicios');
      setTimeout(() => {
        const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes('servicio'));
        if (entry) addBotMessage(entry.response);
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Quiero cotizar', action: 'start_lead' },
            { label: '❓ Otra pregunta', action: 'otra_pregunta' }
          ]);
        }, 500);
      }, 600);
      break;

    case 'faq_experiencia':
      addUserMessage('Experiencia de RODGAR');
      setTimeout(() => {
        const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes('experiencia'));
        if (entry) addBotMessage(entry.response);
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Quiero cotizar', action: 'start_lead' },
            { label: '❓ Otra pregunta', action: 'otra_pregunta' }
          ]);
        }, 500);
      }, 600);
      break;

    case 'faq_contacto':
      addUserMessage('Datos de contacto');
      setTimeout(() => {
        const entry = KNOWLEDGE_BASE.find(e => e.keywords.includes('contacto'));
        if (entry) addBotMessage(entry.response);
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Quiero cotizar', action: 'start_lead' },
            { label: '❓ Otra pregunta', action: 'otra_pregunta' }
          ]);
        }, 500);
      }, 600);
      break;

    case 'type_casa':
      addUserMessage('Casa habitación');
      handleProjectTypeInput('Casa habitación');
      break;
    case 'type_comercial':
      addUserMessage('Comercial / Oficinas');
      handleProjectTypeInput('Comercial / Oficinas');
      break;
    case 'type_industrial':
      addUserMessage('Nave industrial');
      handleProjectTypeInput('Nave industrial');
      break;
    case 'type_remodelacion':
      addUserMessage('Remodelación');
      handleProjectTypeInput('Remodelación');
      break;
    case 'type_diseno':
      addUserMessage('Solo diseño / planos');
      handleProjectTypeInput('Solo diseño / planos');
      break;
    case 'type_otro':
      addUserMessage('Otro tipo de proyecto');
      handleProjectTypeInput('Otro tipo de proyecto');
      break;

    case 'otra_pregunta':
      chatState = 'idle';
      addUserMessage('Tengo otra pregunta');
      setTimeout(() => {
        addBotMessage('¡Claro! Escríbeme tu pregunta y con gusto te ayudo. También puedes elegir una opción:');
        setTimeout(() => {
          showQuickReplies([
            { label: '💬 Cotizar proyecto', action: 'start_lead' },
            { label: '📋 Servicios', action: 'faq_servicios' },
            { label: '🏗️ Experiencia', action: 'faq_experiencia' },
            { label: '📞 Contacto', action: 'faq_contacto' }
          ]);
        }, 400);
      }, 500);
      break;

    case 'despedida':
      addUserMessage('Gracias, es todo');
      setTimeout(() => {
        addBotMessage('¡Gracias por tu interés en <strong>RODGAR</strong>! 🙏 Recuerda que estamos a una llamada de distancia. ¡Que tengas un excelente día! 🏗️✨');
        chatState = 'idle';
      }, 500);
      break;
  }
}

// ══════════════════════════════════
// ══  Funciones de UI del chat
// ══════════════════════════════════

// Agregar mensaje del bot (soporta HTML)
function addBotMessage(html) {
  const div = document.createElement('div');
  div.className = 'msg msg-bot';
  div.innerHTML = html;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  // Animación de entrada
  requestAnimationFrame(() => {
    div.classList.add('in');
  });
}

// Agregar mensaje del usuario
function addUserMessage(text) {
  const div = document.createElement('div');
  div.className = 'msg msg-user';
  div.textContent = text;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  requestAnimationFrame(() => {
    div.classList.add('in');
  });
}

// Mostrar botones de respuesta rápida
function showQuickReplies(options) {
  const container = document.createElement('div');
  container.className = 'chat-quick-replies';

  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'chat-quick-btn';
    btn.textContent = opt.label;
    btn.addEventListener('click', () => handleQuickReply(opt.action));
    container.appendChild(btn);
  });

  chatMessages.appendChild(container);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Animación escalonada de entrada
  requestAnimationFrame(() => {
    container.classList.add('in');
  });
}

// Función auxiliar para detectar keywords
function matchesAny(text, keywords) {
  return keywords.some(kw => text.includes(kw));
}


// ── Hamburger Menu Logic
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const spans = hamburger.querySelectorAll('span');
  hamburger.classList.toggle('open');
  if (hamburger.classList.contains('open')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Close menu when clicking a link
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navLinks.classList.remove('active');
    hamburger.classList.remove('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  });
});
