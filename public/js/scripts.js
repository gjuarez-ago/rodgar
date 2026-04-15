// --- Budget range
function updateBudget(v) {
  const n = parseInt(v);
  let d;
  if (n >= 50000000) d = '$50,000,000+ MXN';
  else if (n >= 1000000) d = '$' + (n / 1000000).toFixed(1) + 'M MXN';
  else d = '$' + n.toLocaleString('es-MX') + ' MXN';
  document.getElementById('budget-val').textContent = d;
}

// --- Toast
function showToast(title, msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 5500);
}

// --- EmailJS Configuration
function initEmailJS() {
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: "eGWzwCVi4qWYy9mKa" });
  } else {
    setTimeout(initEmailJS, 300);
  }
}
initEmailJS();

const EMAILJS_SERVICE_ID = 'service_o0d5nrrmi';
const EMAILJS_TEMPLATE_ID = 'template_i4923gv';

async function handleCot(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const servicios = data.getAll('servicios');
  const presupuestoTexto = document.getElementById('budget-val')?.textContent?.trim() || 'No especificado';

  const templateParams = {
    from_name: safeValue(data.get('nombre')),
    from_email: safeValue(data.get('correo')),
    telefono: safeValue(data.get('telefono') || data.get('ciudad_estado')), // Fallback a ubicación si no hay tel
    form_type: 'SOLICITUD DE COTIZACIÓN',
    project_type: safeValue(data.get('tipo_proyecto')),
    budget: presupuestoTexto,
    message: `Detalles: ${safeValue(data.get('descripcion_proyecto'))}\nServicios: ${servicios.join(', ')}\nPlazo: ${safeValue(data.get('plazo_inicio'))}`,
    source: 'Formulario de Cotización Web'
  };

  const sent = await sendEmailJS(templateParams);
  if (sent) {
    showToast('Solicitud enviada', 'Tu propuesta técnica será procesada por nuestros ingenieros.');
    form.reset();
    document.getElementById('budget-val').textContent = '$500,000 MXN';
    document.getElementById('budget-range').value = 500000;
  } else {
    showToast('Error de envío', 'Hubo un problema al enviar tus datos. Por favor intenta más tarde.');
  }
}

async function handleContact(e) {
  e.preventDefault();
  const form = e.target;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const data = new FormData(form);
  const templateParams = {
    from_name: safeValue(data.get('nombre')),
    from_email: safeValue(data.get('correo')),
    telefono: safeValue(data.get('telefono')),
    form_type: 'CONSULTA GENERAL',
    project_type: safeValue(data.get('asunto')),
    budget: 'N/A',
    message: safeValue(data.get('mensaje')),
    source: 'Formulario de Contacto Web'
  };

  const sent = await sendEmailJS(templateParams);
  if (sent) {
    showToast('Mensaje enviado', 'Nuestro equipo se pondrá en contacto contigo a la brevedad.');
    form.reset();
  } else {
    showToast('Error de envío', 'No pudimos procesar tu mensaje. Intenta de nuevo más tarde.');
  }
}

function safeValue(v) {
  const text = (v || '').toString().trim();
  return text || 'No especificado';
}

async function sendEmailJS(params) {
  try {
    const res = await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params);
    return res.status === 200;
  } catch (err) {
    console.error('EmailJS Error:', err);
    return false;
  }
}
// --- Nav scroll effect
const nav = document.getElementById('main-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
});

// --- Active nav links
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

// --- Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const tgt = document.querySelector(a.getAttribute('href'));
    if (tgt) { e.preventDefault(); tgt.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// --- Reveal on scroll
const ro = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
}, { threshold: 0.07 });
document.querySelectorAll('.reveal, .reveal-l, .reveal-r').forEach(el => ro.observe(el));

// ===========================================================================
//    CARRUSEL DE PORTAFOLIO - Responsivo + Touch
// ===========================================================================

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

  // --- Calcular ancho de cada slide según CSS flex-basis
  function calcSlideWidth() {
    if (!slides[0]) return;
    slideWidth = slides[0].offsetWidth + parseInt(getComputedStyle(slides[0]).paddingRight || 0);
  }

  // --- Mover al slide indicado
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

  // --- Actualizar contador, dots, estado de flechas
  function updateUI() {
    // Contador
    const display = String(currentIndex + 1).padStart(2, '0');
    counterEl.textContent = `${display} / ${String(totalSlides).padStart(2, '0')}`;

    // Dots
    dotsContainer.querySelectorAll('.carousel-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  // --- Generar dots
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

  // --- Auto-play
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

  // --- Flechas
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
    resetAutoPlay();
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
    resetAutoPlay();
  });

  // --- Soporte teclado
  document.addEventListener('keydown', (e) => {
    // Solo si la sección de portafolio está visible en el viewport
    const section = document.getElementById('portafolio');
    const rect = section.getBoundingClientRect();
    if (rect.top > window.innerHeight || rect.bottom < 0) return;

    if (e.key === 'ArrowLeft') { goToSlide(currentIndex - 1); resetAutoPlay(); }
    if (e.key === 'ArrowRight') { goToSlide(currentIndex + 1); resetAutoPlay(); }
  });

  // --- Drag / Touch (swipe para mobile y desktop)
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

  // --- Pausar auto-play cuando el mouse está encima
  viewport.addEventListener('mouseenter', stopAutoPlay);
  viewport.addEventListener('mouseleave', startAutoPlay);

  // --- Recalcular en resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      goToSlide(currentIndex, false);
    }, 150);
  });

  // --- Inicializar
  buildDots();
  calcSlideWidth();
  goToSlide(0, false);
  startAutoPlay();
})();


// ===========================================================================
//    RODGAR AI CHATBOT - Flujo conversacional con recopilación
// ===========================================================================

const chatbotLauncher = document.getElementById('chatbot-launcher');
const chatbotWindow = document.getElementById('chatbot-window');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatCloseBtn = document.getElementById('chat-close');
const chatbotBadge = document.getElementById('chatbot-badge');

// --- Botón cerrar chatbot
chatCloseBtn.addEventListener('click', () => {
  chatbotWindow.classList.remove('active');
});

// --- Datos del lead que se van recopilando en la conversación
let leadData = {
  nombre: null,
  telefono: null,
  email: null,
  tipoProyecto: null,
  descripcion: null,
  timestamp: null
};

// --- Estado actual del flujo conversacional
// Estados posibles: 'idle' | 'asking_name' | 'asking_phone' | 'asking_email'
//                 | 'asking_project_type' | 'asking_description' | 'completed'
let chatState = 'idle';

// --- Flag para saber si ya se abrió antes
let firstOpen = true;

// --- Base de conocimiento para preguntas frecuentes
const KNOWLEDGE_BASE = [];

// --- Abrir/cerrar chatbot
chatbotLauncher.addEventListener('click', () => {
  chatbotWindow.classList.toggle('active');
  if (chatbotBadge) chatbotBadge.style.display = 'none';

  if (firstOpen) {
    setTimeout(() => {
      addBotMessage('Hola. Este asistente solo recopila tus datos para seguimiento de proyecto.');
      setTimeout(() => {
        showQuickReplies([
          { label: 'Iniciar registro', action: 'start_lead' }
        ]);
      }, 300);
    }, 300);
    firstOpen = false;
  }
});

// --- Enviar mensaje del usuario
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = chatInput.value.trim();
  if (!text) return;

  addUserMessage(text);
  chatInput.value = '';
  setTimeout(() => processUserInput(text), 300);
});

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
      handleIdleInput();
      break;
  }
}

function handleIdleInput() {
  addBotMessage('Para ayudarte, necesito recopilar tus datos de contacto y proyecto.');
  setTimeout(() => {
    showQuickReplies([{ label: 'Comenzar ahora', action: 'start_lead' }]);
  }, 250);
}

function startLeadFlow() {
  leadData = {
    nombre: null,
    telefono: null,
    email: null,
    tipoProyecto: null,
    descripcion: null,
    timestamp: new Date().toISOString()
  };

  chatState = 'asking_name';
  addBotMessage('Vamos a registrar tu solicitud. ¿Cuál es tu nombre completo?');
  chatInput.placeholder = 'Escribe tu nombre...';
}

function handleNameInput(text) {
  if (text.length < 2) {
    addBotMessage('Por favor ingresa un nombre válido.');
    return;
  }
  leadData.nombre = text;
  chatState = 'asking_phone';
  addBotMessage(`Gracias, ${text}. ¿Cuál es tu teléfono de contacto?`);
  chatInput.placeholder = 'Ej: 314 123 4567';
}

function handlePhoneInput(text) {
  const digits = text.replace(/\D/g, '');
  if (digits.length < 7) {
    addBotMessage('Por favor ingresa un teléfono válido.');
    return;
  }
  leadData.telefono = text;
  chatState = 'asking_email';
  addBotMessage('Perfecto. ¿Cuál es tu correo electrónico?');
  chatInput.placeholder = 'Ej: nombre@correo.com';
}

function handleEmailInput(text) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(text)) {
    addBotMessage('El correo no parece válido. Intenta de nuevo.');
    return;
  }
  leadData.email = text;
  chatState = 'asking_project_type';
  addBotMessage('¿Qué tipo de proyecto tienes en mente?');
  setTimeout(() => {
    showQuickReplies([
      { label: 'Casa habitación', action: 'type_casa' },
      { label: 'Comercial / Oficinas', action: 'type_comercial' },
      { label: 'Nave industrial', action: 'type_industrial' },
      { label: 'Remodelación', action: 'type_remodelacion' },
      { label: 'Solo diseño / planos', action: 'type_diseno' },
      { label: 'Otro', action: 'type_otro' }
    ]);
  }, 250);
  chatInput.placeholder = 'Escribe el tipo de proyecto...';
}

function handleProjectTypeInput(text) {
  leadData.tipoProyecto = text;
  chatState = 'asking_description';
  addBotMessage(`Entendido: ${text}. Ahora describe brevemente tu proyecto.`);
  chatInput.placeholder = 'Describe tu proyecto...';
}

function handleDescriptionInput(text) {
  leadData.descripcion = text;
  chatState = 'completed';
  chatInput.placeholder = 'Escribe tu mensaje...';

  const templateParams = {
    from_name: safeValue(leadData.nombre),
    from_email: safeValue(leadData.email),
    telefono: safeValue(leadData.telefono),
    form_type: 'LEAD DE CHATBOT',
    project_type: safeValue(leadData.tipoProyecto),
    budget: 'Por definir',
    message: safeValue(leadData.descripcion),
    source: 'Asistente Virtual (Chatbot)'
  };

  addBotMessage(`Registro completado:\n\n` +
    `<div class="chat-summary">` +
    `<div class="chat-summary-row"><span class="chat-summary-label">Nombre:</span> ${safeValue(leadData.nombre)}</div>` +
    `<div class="chat-summary-row"><span class="chat-summary-label">Teléfono:</span> ${safeValue(leadData.telefono)}</div>` +
    `<div class="chat-summary-row"><span class="chat-summary-label">Correo:</span> ${safeValue(leadData.email)}</div>` +
    `<div class="chat-summary-row"><span class="chat-summary-label">Proyecto:</span> ${safeValue(leadData.tipoProyecto)}</div>` +
    `<div class="chat-summary-row"><span class="chat-summary-label">Detalle:</span> ${safeValue(leadData.descripcion)}</div>` +
    `</div>`);

  sendEmailJS(templateParams).then((ok) => {
    if (ok) {
      addBotMessage('Tus datos fueron enviados para seguimiento.');
    } else {
      addBotMessage('Hubo un retraso en el envío, pero nuestro equipo revisará tu solicitud pronto.');
    }
    setTimeout(() => {
      showQuickReplies([
        { label: 'Registrar otro proyecto', action: 'start_lead' },
        { label: 'Finalizar', action: 'despedida' }
      ]);
    }, 300);
  });
}

function handleQuickReply(action) {
  document.querySelectorAll('.chat-quick-replies').forEach(el => {
    el.querySelectorAll('.chat-quick-btn').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.4';
      btn.style.pointerEvents = 'none';
    });
  });

  switch (action) {
    case 'start_lead':
      addUserMessage('Iniciar registro');
      setTimeout(() => startLeadFlow(), 250);
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
      addUserMessage('Otro');
      handleProjectTypeInput('Otro');
      break;
    case 'despedida':
      addUserMessage('Finalizar');
      setTimeout(() => {
        addBotMessage('Gracias. Tu registro fue guardado correctamente.');
        chatState = 'idle';
      }, 250);
      break;
  }
}
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


// --- Hamburger Menu Logic
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



