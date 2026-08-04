/* ==========================================================================
   CONVITE DIGITAL FAZENDINHA DA YUMI - 2 ANOS
   Arquivo de Scripts JavaScript (script.js) - Vanilla JS puro
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. CONFIGURAÇÕES DO EVENTO (Fácil alteração de datas, local e dados)
   -------------------------------------------------------------------------- */
const EVENT_CONFIG = {
  childName: "Yumi",
  age: "2 Aninhos",
  // Defina a data e horário da festa (Formato: YYYY-MM-DDTHH:mm:ss)
  partyDate: "2026-08-15T19:00:00",
  displayDate: "Sábado, 15 de Agosto de 2026",
  displayTime: "A partir das 19:00h",
  locationName: "Espaço Casa da Praia - Pajuçara",
  locationAddress: "Espaço Casa da Praia - Pajuçara (Link no Google Maps: https://maps.app.goo.gl/AJivSBrD2veDFERg8)",
  mapsUrl: "https://maps.app.goo.gl/AJivSBrD2veDFERg8",
  whatsappNumber: "5593996589790",
  localStorageKey: "yumi_fazendinha_rsvps"
};

// Inicialização após o carregamento do DOM
document.addEventListener("DOMContentLoaded", () => {
  initCountdown();
  initBalloons();
  initRSVPForm();
  initScrollReveal();
  initCopyButtons();
  initCalendarGenerator();
  initAdminModal();

  // Animação inicial de balões e comemoração de boas-vindas na Tela Inicial
  setTimeout(() => {
    triggerConfetti();
  }, 500);

  // Botão de interatividade de balões na Tela Inicial
  const btnHeroBalloons = document.getElementById("btn-hero-balloons");
  if (btnHeroBalloons) {
    btnHeroBalloons.addEventListener("click", () => {
      triggerConfetti();
      spawnExtraBalloons();
      showToast("🎈 Uhuuu! Balões e festa na Fazendinha da Yumi!");
    });
  }
});

/* --------------------------------------------------------------------------
   2. CONTADOR REGRESSIVO (COUNTDOWN TIMER)
   -------------------------------------------------------------------------- */
function initCountdown() {
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minutesEl = document.getElementById("cd-minutes");
  const secondsEl = document.getElementById("cd-seconds");

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDate = new Date(EVENT_CONFIG.partyDate).getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.innerText = "00";
      hoursEl.innerText = "00";
      minutesEl.innerText = "00";
      secondsEl.innerText = "00";
      const titleEl = document.querySelector(".countdown-title");
      if (titleEl) titleEl.innerText = "🎉 A festa é hoje! 🎉";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.innerText = String(days).padStart(2, "0");
    hoursEl.innerText = String(hours).padStart(2, "0");
    minutesEl.innerText = String(minutes).padStart(2, "0");
    secondsEl.innerText = String(seconds).padStart(2, "0");
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* --------------------------------------------------------------------------
   3. GERADOR DE BALÕES FLUTUANTES ANIMAÇÃO CSS/JS
   -------------------------------------------------------------------------- */
function initBalloons() {
  const container = document.getElementById("balloons-container");
  if (!container) return;

  const types = ["balloon-rosa", "balloon-blush", "balloon-transparente", "balloon-amarelo"];
  const totalBalloons = 14;

  for (let i = 0; i < totalBalloons; i++) {
    createBalloon(container, types);
  }
}

function createBalloon(container, types) {
  const balloon = document.createElement("div");
  const randomType = types[Math.floor(Math.random() * types.length)];
  
  balloon.className = `balloon ${randomType}`;
  
  // Posicionamento horizontal e tempo de animação randômico
  const leftPos = Math.random() * 92; // 0% a 92%
  const duration = 9 + Math.random() * 8; // 9s a 17s
  const delay = Math.random() * 10; // 0s a 10s
  const scale = 0.7 + Math.random() * 0.5; // Escala visual

  balloon.style.left = `${leftPos}%`;
  balloon.style.animationDuration = `${duration}s`;
  balloon.style.animationDelay = `${delay}s`;
  balloon.style.transform = `scale(${scale})`;

  // Interatividade: estourar ou fazer efeito ao clicar no balão
  balloon.addEventListener("click", (e) => {
    e.stopPropagation();
    popBalloon(balloon);
  });

  container.appendChild(balloon);
}

function popBalloon(balloon) {
  balloon.style.transform = "scale(1.4)";
  balloon.style.opacity = "0";
  balloon.style.transition = "all 0.2s ease";

  showToast("🎈 *POPP!* Que a festa comece!");
  triggerConfetti();

  setTimeout(() => {
    balloon.style.transform = "scale(0.8)";
    balloon.style.opacity = "0.75";
  }, 4000);
}

function spawnExtraBalloons() {
  const container = document.getElementById("balloons-container");
  if (!container) return;

  const types = ["balloon-rosa", "balloon-blush", "balloon-transparente", "balloon-amarelo"];
  for (let i = 0; i < 6; i++) {
    createBalloon(container, types);
  }
}

/* --------------------------------------------------------------------------
   4. FORMULÁRIO RSVP & VALIDAÇÃO & ENVIO VIA WHATSAPP & SALVAMENTO (localStorage)
   -------------------------------------------------------------------------- */
function initRSVPForm() {
  const form = document.getElementById("rsvp-form");
  const radioSim = document.getElementById("attending-yes");
  const radioNao = document.getElementById("attending-no");
  const companionsSection = document.getElementById("companions-section");
  const companionNamesGroup = document.getElementById("companion-names-group");
  const companionNamesInput = document.getElementById("companion-names");
  const companionNamesError = document.getElementById("companion-names-error");
  const btnMinus = document.getElementById("btn-companion-minus");
  const btnPlus = document.getElementById("btn-companion-plus");
  const companionValueEl = document.getElementById("companion-count");
  const companionSummaryEl = document.getElementById("companion-summary");
  
  if (!form) return;

  let companionCount = 0;

  // Atualiza visibilidade da seção de acompanhantes
  function toggleCompanions() {
    if (radioSim && radioSim.checked) {
      companionsSection.style.display = "block";
    } else {
      companionsSection.style.display = "none";
    }
  }

  if (radioSim && radioNao) {
    radioSim.addEventListener("change", toggleCompanions);
    radioNao.addEventListener("change", toggleCompanions);
  }

  // Controle de adição/remoção de acompanhantes
  if (btnMinus && btnPlus && companionValueEl) {
    btnMinus.addEventListener("click", () => {
      if (companionCount > 0) {
        companionCount--;
        updateCompanionDisplay();
      }
    });

    btnPlus.addEventListener("click", () => {
      if (companionCount < 10) {
        companionCount++;
        updateCompanionDisplay();
      }
    });
  }

  function updateCompanionDisplay() {
    companionValueEl.innerText = companionCount;
    if (companionCount === 0) {
      companionSummaryEl.innerText = "Apenas você (1 pessoa)";
      if (companionNamesGroup) companionNamesGroup.style.display = "none";
      if (companionNamesInput) companionNamesInput.value = "";
    } else if (companionCount === 1) {
      companionSummaryEl.innerText = "Você + 1 acompanhante (2 pessoas)";
      if (companionNamesGroup) companionNamesGroup.style.display = "block";
    } else {
      companionSummaryEl.innerText = `Você + ${companionCount} acompanhantes (${companionCount + 1} pessoas)`;
      if (companionNamesGroup) companionNamesGroup.style.display = "block";
    }
  }

  // Submissão do Formulário
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nameInput = document.getElementById("guest-name");
    const nameError = document.getElementById("name-error");
    
    let isValid = true;

    // Validação de Nome Obrigatório
    if (!nameInput.value.trim()) {
      nameInput.classList.add("error");
      if (nameError) nameError.style.display = "block";
      isValid = false;
    } else {
      nameInput.classList.remove("error");
      if (nameError) nameError.style.display = "none";
    }

    const isAttending = radioSim && radioSim.checked;

    // Validação dos Nomes dos Acompanhantes se tiver acompanhantes e for comparecer
    if (isAttending && companionCount > 0 && companionNamesInput) {
      if (!companionNamesInput.value.trim()) {
        companionNamesInput.classList.add("error");
        if (companionNamesError) companionNamesError.style.display = "block";
        isValid = false;
      } else {
        companionNamesInput.classList.remove("error");
        if (companionNamesError) companionNamesError.style.display = "none";
      }
    }

    if (!isValid) return;

    const companionNamesVal = (isAttending && companionCount > 0 && companionNamesInput) 
      ? companionNamesInput.value.trim() 
      : "";

    const guestData = {
      id: Date.now(),
      name: nameInput.value.trim(),
      attending: isAttending ? "Sim" : "Não",
      companions: isAttending ? companionCount : 0,
      companionNames: companionNamesVal,
      totalPeople: isAttending ? companionCount + 1 : 0,
      createdAt: new Date().toLocaleString("pt-BR")
    };

    const btnSubmit = form.querySelector('button[type="submit"]');
    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `<span>Redirecionando para o WhatsApp... 💬</span>`;
    }

    // Salvar no localStorage local
    saveRSVPToLocalStorage(guestData);

    // Formatar e Abrir Mensagem do WhatsApp
    sendWhatsAppRSVP(guestData);

    setTimeout(() => {
      // Exibir cartão de sucesso animado
      form.style.display = "none";
      const successCard = document.getElementById("rsvp-success-card");
      if (successCard) {
        successCard.style.display = "block";
      }

      // Efeito de Confetti Festivo!
      triggerConfetti();

      // Scroll suave até a mensagem
      if (successCard) {
        successCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }

      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `<span>Enviar Confirmação pelo WhatsApp</span><span style="font-size: 1.3rem;">💬</span>`;
      }
    }, 1000);
  });
}

function sendWhatsAppRSVP(data) {
  const number = EVENT_CONFIG.whatsappNumber;
  let text = "";

  if (data.attending === "Sim") {
    text = `🌸 *CONFIRMAÇÃO DE PRESENÇA - FAZENDINHA DA YUMI* 🌾\n\n` +
           `Olá! Gostaria de confirmar minha presença no aniversário de 2 Anos da Yumi! 💕\n\n` +
           `👤 *Nome do Convidado:* ${data.name}\n` +
           `✅ *Vai comparecer?* Sim, vou com certeza!\n` +
           `👥 *Número de Acompanhantes:* ${data.companions} (${data.totalPeople} pessoa(s) no total)\n`;

    if (data.companions > 0 && data.companionNames) {
      text += `📝 *Nome(s) do(s) Acompanhante(s):* ${data.companionNames}\n`;
    }

    text += `\n📅 *Data:* ${EVENT_CONFIG.displayDate} às 19:00h\n` +
            `📍 *Local:* ${EVENT_CONFIG.locationName}\n` +
            `🔗 *Mapa:* ${EVENT_CONFIG.mapsUrl}\n\n` +
            `Mal posso esperar para comemorar com vocês! 🎉🎂`;
  } else {
    text = `🌸 *CONFIRMAÇÃO DE PRESENÇA - FAZENDINHA DA YUMI* 🌾\n\n` +
           `Olá! Infelizmente não poderei comparecer ao aniversário de 2 Anos da Yumi. 💔\n\n` +
           `👤 *Nome do Convidado:* ${data.name}\n` +
           `❌ *Vai comparecer?* Não poderei ir\n\n` +
           `Desejo uma festa linda e cheia de alegrias para a Yumi! 🎈✨`;
  }

  const waUrl = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
  window.open(waUrl, "_blank");
}

function saveRSVPToLocalStorage(data) {
  try {
    const existing = JSON.parse(localStorage.getItem(EVENT_CONFIG.localStorageKey) || "[]");
    existing.push(data);
    localStorage.setItem(EVENT_CONFIG.localStorageKey, JSON.stringify(existing));
  } catch (err) {
    console.error("Erro ao salvar no localStorage:", err);
  }
}

/* --------------------------------------------------------------------------
   5. EFEITO CONFETTI DE COMEMORAÇÃO EM CANVAS
   -------------------------------------------------------------------------- */
function triggerConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ["#f472b6", "#ec4899", "#fbcfe8", "#fde047", "#ffffff", "#86efac"];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height / 2,
      rx: Math.random() * 6 + 4,
      ry: Math.random() * 6 + 4,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.7) * 16,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 10,
      opacity: 1
    });
  }

  let animationFrame;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // Gravidade
      p.rotation += p.vRot;
      p.opacity -= 0.012;

      if (p.opacity > 0) {
        active = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.rx, p.ry, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }
    });

    if (active) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      cancelAnimationFrame(animationFrame);
    }
  }

  animate();
}

/* --------------------------------------------------------------------------
   6. SCROLL REVEAL COM INTERSECTION OBSERVER
   -------------------------------------------------------------------------- */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal-on-scroll");

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach(el => el.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealElements.forEach(el => observer.observe(el));
}

/* --------------------------------------------------------------------------
   7. GERADOR DE ARQUIVO DE CALENDÁRIO (.ICS)
   -------------------------------------------------------------------------- */
function initCalendarGenerator() {
  const btnAddCalendar = document.getElementById("btn-add-calendar");
  if (!btnAddCalendar) return;

  btnAddCalendar.addEventListener("click", () => {
    const startDate = new Date(EVENT_CONFIG.partyDate);
    const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // 4 horas de festa

    function formatDateToICS(d) {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, "");
    }

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Fazendinha Yumi 2 Anos//PT",
      "BEGIN:VEVENT",
      `SUMMARY:Aniversário de 2 Anos da Yumi - Fazendinha 🌸`,
      `DESCRIPTION:Venha comemorar os 2 aninhos da Yumi! Local: ${EVENT_CONFIG.locationName}`,
      `LOCATION:${EVENT_CONFIG.locationAddress}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "Aniversario_Yumi_2_Anos.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("📅 Convite adicionado ao seu calendário!");
  });
}

/* --------------------------------------------------------------------------
   8. COPIAR CHAVE PIX & ENDEREÇO + TOAST
   -------------------------------------------------------------------------- */
function initCopyButtons() {
  const btnCopyPix = document.getElementById("btn-copy-pix");
  const btnCopyAddress = document.getElementById("btn-copy-address");

  if (btnCopyPix) {
    btnCopyPix.addEventListener("click", () => {
      copyToClipboard(EVENT_CONFIG.pixKey, "Chave Pix copiada com sucesso! 💝");
    });
  }

  if (btnCopyAddress) {
    btnCopyAddress.addEventListener("click", () => {
      copyToClipboard(EVENT_CONFIG.locationAddress, "Endereço copiado para a área de transferência! 📍");
    });
  }
}

function copyToClipboard(text, successMessage) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMessage);
    });
  } else {
    // Fallback para navegadores sem suporte direto a clipboard
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      showToast(successMessage);
    } catch (err) {
      showToast("Não foi possível copiar automaticamente.");
    }
    document.body.removeChild(textarea);
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
}

/* --------------------------------------------------------------------------
   9. PAINEL DE CONTROLE DOS PAIS (VISUALIZAR CONFIRMAÇÕES)
   -------------------------------------------------------------------------- */
function initAdminModal() {
  const btnOpenAdmin = document.getElementById("btn-open-admin");
  const modalOverlay = document.getElementById("admin-modal");
  const btnCloseModal = document.getElementById("btn-close-admin");
  const guestTableBody = document.getElementById("guest-table-body");
  const guestStatsEl = document.getElementById("guest-stats");
  const btnClearList = document.getElementById("btn-clear-guests");

  if (!btnOpenAdmin || !modalOverlay) return;

  btnOpenAdmin.addEventListener("click", () => {
    renderGuestList();
    modalOverlay.style.display = "flex";
  });

  if (btnCloseModal) {
    btnCloseModal.addEventListener("click", () => {
      modalOverlay.style.display = "none";
    });
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      modalOverlay.style.display = "none";
    }
  });

  if (btnClearList) {
    btnClearList.addEventListener("click", () => {
      if (confirm("Deseja realmente apagar a lista de confirmações local?")) {
        localStorage.removeItem(EVENT_CONFIG.localStorageKey);
        renderGuestList();
        showToast("Lista limpa com sucesso.");
      }
    });
  }

  function renderGuestList() {
    const list = JSON.parse(localStorage.getItem(EVENT_CONFIG.localStorageKey) || "[]");
    if (!guestTableBody) return;

    guestTableBody.innerHTML = "";

    if (list.length === 0) {
      guestTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding: 1rem; color: #888;">Nenhuma confirmação recebida ainda.</td></tr>`;
      if (guestStatsEl) guestStatsEl.innerText = "Total de Pessoas Confirmadas: 0";
      return;
    }

    let totalConfirmedPeople = 0;

    list.forEach(item => {
      if (item.attending === "Sim") {
        totalConfirmedPeople += item.totalPeople || 1;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td><span style="color: ${item.attending === "Sim" ? "#16a34a" : "#dc2626"}; font-weight: bold;">${item.attending}</span></td>
        <td>${item.totalPeople || 1}</td>
        <td><small>${escapeHtml(item.companionNames || "-")}</small></td>
      `;
      guestTableBody.appendChild(tr);
    });

    if (guestStatsEl) {
      guestStatsEl.innerHTML = `<strong>Total de Convidados Confirmados:</strong> <span style="color: var(--rosa-escuro); font-size: 1.1rem;">${totalConfirmedPeople} pessoas</span>`;
    }
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
