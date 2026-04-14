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

    // ── RODGAR AI Chatbot Logic
    const chatbotLauncher = document.getElementById('chatbot-launcher');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');

    const KNOWLEDGE_BASE = {
      manzanillo: "En Manzanillo, Colima, RODGAR es líder en infraestructura portuaria y desarrollos turísticos de lujo. Hemos ejecutado más de 12 proyectos estratégicos en la región en los últimos 5 años.",
      puerto: "Nuestra obra en el Puerto de Manzanillo incluye la Terminal de Contenedores con pavimentos de alta resistencia y cimentaciones profundas para grúas Super Post-Panamax, con capacidad de 1.2M de TEUs.",
      terminal: "Nuestra obra en el Puerto de Manzanillo incluye la Terminal de Contenedores con pavimentos de alta resistencia y cimentaciones profundas para grúas Super Post-Panamax, con capacidad de 1.2M de TEUs.",
      hotel: "En el sector turístico, lideramos la expansión del Resort & Marina en la Zona Hotelera, integrando arquitectura orgánica con sistemas estructurales sismorresistentes avanzados.",
      resort: "En el sector turístico, lideramos la expansión del Resort & Marina en la Zona Hotelera, integrando arquitectura orgánica con sistemas estructurales sismorresistentes avanzados.",
      viaducto: "El Viaducto Costero de Manzanillo es una de nuestras obras viales clave, diseñado con trabes pretensadas para soportar el tráfico pesado logístico del puerto bajo la norma HL-93.",
      puente: "El Viaducto Costero de Manzanillo es una de nuestras obras viales clave, diseñado con trabes pretensadas para soportar el tráfico pesado logístico del puerto bajo la norma HL-93.",
      residencial: "Desarrollamos las Torres Bahía Esmeralda en la Península de Santiago, un proyecto premium que utiliza concreto de baja permeabilidad para resistir la corrosión marina.",
      industrial: "Nuestras plantas logísticas en el Puerto Interior cuentan con certificaciones internacionales de seguridad estructural y optimización de espacios mediante techos de grandes claros.",
      bim: "Utilizamos BIM (Building Information Modeling) nivel 3 para coordinar todas las disciplinas. Esto nos permite detectar el 100% de las colisiones en fase digital antes de iniciar la construcción.",
      tecnologia: "La tecnología en RODGAR incluye drones para fotogrametría, escaneo láser 3D de nubes de puntos y Gemelos Digitales para el mantenimiento preventivo de las obras.",
      costo: "Nuestros presupuestos son transparentes y basados en modelos BIM exactos. Esto reduce las variaciones de costos imprevistos a menos del 2% en promedio."
    };

    let firstOpen = true;

    chatbotLauncher.addEventListener('click', () => {
      chatbotWindow.classList.toggle('active');
      if (firstOpen) {
        setTimeout(() => {
          addMessage('¡Hola! Soy RODGAR AI. Como expertos en ingeniería civil y arquitectura, transformamos visiones en estructuras que perduran por generaciones. ¿En qué puedo asesorarte hoy sobre nuestras obras en Manzanillo?', 'bot');
        }, 600);
        firstOpen = false;
      }
    });

    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;

      addMessage(text, 'user');
      chatInput.value = '';

      // Typing indicator
      const typingId = 'typing-' + Date.now();
      const typingDiv = document.createElement('div');
      typingDiv.id = typingId;
      typingDiv.className = 'msg msg-bot reveal';
      typingDiv.innerHTML = '<span style="opacity:0.5;">Pensando...</span>';
      chatMessages.appendChild(typingDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;

      setTimeout(() => {
        document.getElementById(typingId).remove();

        const lower = text.toLowerCase();
        let response = "Es una consulta interesante. Para darle detalles técnicos exactos sobre ese tema, me gustaría que contactara directamente a nuestra dirección de ingeniería estructural o mencionara una palabra clave como 'Puerto', 'Residencial' o 'BIM'.";

        for (const [key, val] of Object.entries(KNOWLEDGE_BASE)) {
          if (lower.includes(key)) {
            response = val;
            break;
          }
        }

        addMessage(response, 'bot');
      }, 800 + Math.random() * 700);
    });

    function addMessage(text, side) {
      const div = document.createElement('div');
      div.className = `msg msg-${side} reveal`;
      div.textContent = text;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      setTimeout(() => div.classList.add('in'), 10);
    }

    // ── Hamburger Menu Logic
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navItems = document.querySelectorAll('.nav-links a');

    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      // Optional: change hamburger icon look
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
