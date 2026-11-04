document.addEventListener("DOMContentLoaded", () => {
  const experienceRows = document.querySelectorAll(".exp-row");

  function setRowOpen(row, isOpen) {
    row.classList.toggle("is-open", isOpen);
    row.setAttribute("aria-expanded", String(isOpen));
  }

  function toggleExperienceRow(row) {
    const isOpen = row.classList.contains("is-open");
    experienceRows.forEach((item) => setRowOpen(item, false));
    setRowOpen(row, !isOpen);
  }

  experienceRows.forEach((row) => {
    row.addEventListener("click", (event) => {
      if (event.target.closest("a, button")) return;
      toggleExperienceRow(row);
    });

    row.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleExperienceRow(row);
      }
    });
  });

  // Projets : liste des titres à gauche, projet sélectionné à droite (sans JS, toutes les cartes restent en grille)
  const projectsExplorer = document.getElementById("projects-explorer");
  const projectTabList = document.getElementById("project-tabs");
  const projectCards = document.querySelectorAll("#projects-grid .project-card");
  const projectTabs = [];

  function selectProject(index, moveFocus) {
    projectTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === index;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      projectCards[tabIndex].classList.toggle("is-active", isActive);
      projectCards[tabIndex].setAttribute("aria-hidden", String(!isActive));
    });
    if (moveFocus) projectTabs[index].focus();
  }

  if (projectsExplorer && projectTabList && projectCards.length > 0) {
    projectCards.forEach((card, index) => {
      const title = card.querySelector(".card-title");
      const language = card.querySelector(".project-lang");
      const cardId = `project-panel-${index + 1}`;

      card.id = cardId;
      card.setAttribute("role", "tabpanel");
      card.setAttribute("aria-labelledby", `project-tab-${index + 1}`);

      const tab = document.createElement("button");
      tab.type = "button";
      tab.className = "project-tab";
      tab.id = `project-tab-${index + 1}`;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", cardId);
      tab.innerHTML = `
        <span class="project-tab-number">${String(index + 1).padStart(2, "0")}</span>
        <span class="project-tab-text">
          <span class="project-tab-title"></span>
          <span class="project-tab-lang"></span>
        </span>`;
      tab.querySelector(".project-tab-title").textContent = title ? title.textContent.trim() : "";
      tab.querySelector(".project-tab-lang").textContent = language ? language.textContent.trim() : "";

      tab.addEventListener("click", () => {
        selectProject(index, false);

        // Sur mobile la carte est sous la liste : on la fait juste entrer dans l'écran si elle en sort
        const cardRect = card.getBoundingClientRect();
        if (cardRect.top > window.innerHeight - 160) {
          card.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "nearest" });
        }
      });
      tab.addEventListener("keydown", (event) => {
        const lastIndex = projectCards.length - 1;
        const keyTargets = {
          ArrowDown: index === lastIndex ? 0 : index + 1,
          ArrowRight: index === lastIndex ? 0 : index + 1,
          ArrowUp: index === 0 ? lastIndex : index - 1,
          ArrowLeft: index === 0 ? lastIndex : index - 1,
          Home: 0,
          End: lastIndex
        };
        if (!(event.key in keyTargets)) return;
        event.preventDefault();
        selectProject(keyTargets[event.key], true);
      });

      projectTabList.appendChild(tab);
      projectTabs.push(tab);
    });

    projectTabList.hidden = false;
    projectsExplorer.classList.add("is-enhanced");
    selectProject(0, false);
  }

  const dockBubble = document.getElementById("dock-bubble");
  const dockLinks = document.querySelectorAll(".dock-link");
  const dockContainer = document.querySelector(".dock-container");

  function moveDockBubble(link) {
    if (!dockBubble || !link || !dockContainer) return;

    const containerRect = dockContainer.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    const centerY = linkRect.top + linkRect.height / 2 - containerRect.top;

    dockBubble.style.top = `${centerY}px`;
    dockBubble.style.opacity = "1";
  }

  dockLinks.forEach((link) => {
    link.addEventListener("mouseenter", () => {
      moveDockBubble(link);
      link.classList.add("active");
    });
    link.addEventListener("mouseleave", () => {
      link.classList.remove("active");
    });
  });

  if (dockContainer) {
    dockContainer.addEventListener("mouseleave", () => {
      if (dockBubble) dockBubble.style.opacity = "0";
    });
  }

  const siteNavigation = document.querySelector(".site-nav-wrapper");
  const socialDock = document.querySelector(".social-dock");
  const scrollProgress = document.getElementById("scroll-progress");
  function updateNavigationOnScroll() {
    // Le menu et la barre sociale apparaissent quand le site classique recouvre la moitié de l'assistant
    const isScrolled = window.scrollY > window.innerHeight * 0.5;
    if (siteNavigation) siteNavigation.classList.toggle("scrolled", isScrolled);
    if (socialDock) socialDock.classList.toggle("scrolled", isScrolled);

    if (scrollProgress) {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      scrollProgress.style.transform = `scaleX(${Math.min(progress, 1)})`;
    }
  }

  window.addEventListener("scroll", updateNavigationOnScroll, { passive: true });
  window.addEventListener("resize", updateNavigationOnScroll);
  updateNavigationOnScroll();

  const cvModal = document.getElementById("cv-modal");
  const openCvButton = document.getElementById("open-cv-btn");
  const closeCvButton = document.getElementById("modal-close-btn");
  const modalOverlay = document.getElementById("modal-overlay");

  function openCvModal() {
    if (!cvModal) return;
    cvModal.classList.add("open");
    cvModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (closeCvButton) closeCvButton.focus();
  }

  function closeCvModal() {
    if (!cvModal) return;
    cvModal.classList.remove("open");
    cvModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (openCvButton) openCvButton.focus();
  }

  if (openCvButton) openCvButton.addEventListener("click", openCvModal);
  if (closeCvButton) closeCvButton.addEventListener("click", closeCvModal);
  if (modalOverlay) modalOverlay.addEventListener("click", closeCvModal);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && cvModal && cvModal.classList.contains("open")) {
      closeCvModal();
    }
  });

  const customScrollTargets = {
    "#hero": () => 0
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const getScrollTop = customScrollTargets[anchor.getAttribute("href")];
      if (!getScrollTop) return;

      event.preventDefault();
      window.scrollTo({ top: getScrollTop(), behavior: "smooth" });
    });
  });

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ===== Accueil en forme d'assistant : réponses écrites à l'avance, choisies par mots-clés =====
  const assistant = document.getElementById("hero");
  const assistantForm = document.getElementById("assistant-form");
  const assistantInput = document.getElementById("assistant-input");
  const assistantLog = document.getElementById("assistant-log");

  // Supprime les accents et la casse pour comparer les mots-clés
  function normalize(text) {
    return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Les projets sont lus directement dans la section Projets : une seule source de vérité
  function readProjects() {
    return [...document.querySelectorAll("#projects-grid .project-card")].map((card, index) => ({
      index,
      title: card.querySelector(".card-title").textContent.trim(),
      language: card.querySelector(".project-lang").textContent.trim(),
      description: card.querySelector(".project-desc").textContent.trim().replace(/\s+/g, " "),
      link: card.querySelector(".project-github").href
    }));
  }

  const projectKeywords = [
    ["foodndeliv", "kubernetes", "spring", "keycloak", "cloud", "devops"],
    ["realite augmentee", "webar", "fresque", "a-frame", "mindar", "galerie"],
    ["otsu", "seuillage", "vision", "image"],
    ["pac-man", "pacman", "pac man", "jeu"],
    ["mentorat", "tutorat", "flask"],
    ["solitaire", "cartes", "piles"],
    ["gps", "haversine", "tkinter", "parcours gps", "carte"]
  ];

  function projectAnswer(project) {
    return {
      html: `<p><strong>${escapeHtml(project.title)}</strong> (${escapeHtml(project.language)})</p>
             <p>${escapeHtml(project.description)}</p>`,
      actions: [
        { label: "Voir le code sur GitHub", href: project.link, external: true },
        { label: "Voir la fiche du projet", project: project.index }
      ]
    };
  }

  const answers = [
    {
      keys: ["contact", "contacter", "joindre", "mail", "e-mail", "email", "ecrire", "linkedin", "telephone"],
      answer: () => ({
        html: `<p>Le plus simple est de m'écrire à <strong>eliot.pechadre@gmail.com</strong>.
               Vous pouvez aussi me retrouver sur LinkedIn et GitHub.</p>`,
        actions: [
          { label: "M'écrire un e-mail", href: "mailto:eliot.pechadre@gmail.com" },
          { label: "LinkedIn", href: "https://www.linkedin.com/in/eliot-pechadre-28a961356/", external: true },
          { label: "GitHub", href: "https://github.com/Eli0tP", external: true }
        ]
      })
    },
    {
      keys: ["cv", "curriculum", "resume"],
      answer: () => ({
        html: "<p>Voici un résumé de mon profil. Vous pouvez aussi me demander mon CV complet en PDF par e-mail.</p>",
        actions: [{ label: "Ouvrir le résumé du CV", cv: true }]
      })
    },
    {
      keys: ["wesco", "alternance", "entreprise", "travail", "poste", "symfony", "php", "cerizay", "metier"],
      answer: () => ({
        html: `<p>Depuis septembre 2026, je suis <strong>développeur en alternance</strong> au service informatique de
               <strong>WESCO</strong>, à Cerizay.</p>
               <ul>
                 <li>Je corrige des bugs et je fais évoluer une application interne en <strong>PHP/Symfony</strong>.</li>
                 <li>J'ai mis en place GitLab et GitHub pour le service, avec la documentation technique.</li>
                 <li>Je déploie des postes macOS et j'installe le matériel logistique (imprimantes et scanners Zebra).</li>
               </ul>
               <p>Le rythme : 2 semaines à l'école, 3 semaines en entreprise.</p>`,
        actions: [{ label: "Voir tout mon parcours", href: "#timeline-section" }]
      })
    },
    {
      keys: ["parcours", "etude", "formation", "ecole", "ece", "bachelor", "diplome", "malte", "bac", "experience"],
      answer: () => ({
        html: `<p>En bref :</p>
               <ul>
                 <li><strong>2021 – 2024</strong> : baccalauréat général, spécialités Mathématiques et NSI, à Niort.</li>
                 <li><strong>2024 – 2026</strong> : Bachelor Informatique à l'ECE, campus de Rennes.</li>
                 <li><strong>Février – juillet 2026</strong> : semestre d'échange à l'Université de Malte, entièrement en anglais.</li>
                 <li><strong>Depuis septembre 2026</strong> : Bachelor IA à l'ECE Paris, en alternance chez WESCO.</li>
               </ul>`,
        actions: [{ label: "Voir le parcours détaillé", href: "#timeline-section" }]
      })
    },
    {
      keys: ["technologie", "competence", "langage", "stack", "outil", "maitrise", "sais faire", "skills"],
      answer: () => ({
        html: `<ul>
                 <li><strong>Web</strong> : PHP/Symfony, JavaScript, HTML et CSS, Flask.</li>
                 <li><strong>Langages</strong> : Java, Python, SQL.</li>
                 <li><strong>DevOps</strong> : Docker, Kubernetes, Git, GitHub et GitLab, Linux.</li>
                 <li><strong>Bases de données</strong> : PostgreSQL, MySQL, SQLite.</li>
                 <li><strong>Autres</strong> : réalité augmentée (A-Frame, MindAR), vision par ordinateur.</li>
               </ul>`,
        actions: [{ label: "Voir les projets qui les utilisent", href: "#projets" }]
      })
    },
    {
      keys: ["qui", "presente", "toi", "bonjour", "salut", "hello", "eliot"],
      answer: () => ({
        html: `<p>Je m'appelle <strong>Eliot Péchadre</strong>. Je suis développeur PHP/Symfony en alternance chez
               <strong>WESCO</strong>, et étudiant en Bachelor IA à l'<strong>ECE Paris</strong>.</p>
               <p>Posez-moi une question sur mes projets, mon parcours ou mon alternance.</p>`,
        actions: [
          { label: "Tes projets", ask: "Montre-moi tes projets" },
          { label: "Ton parcours", ask: "Quel est ton parcours ?" }
        ]
      })
    }
  ];

  function findAnswer(question) {
    const text = normalize(question);
    const projects = readProjects();

    // Un projet précis est cité
    const projectIndex = projectKeywords.findIndex((keys) => keys.some((key) => text.includes(key)));
    if (projectIndex >= 0 && projects[projectIndex] && !text.includes("projets")) {
      return projectAnswer(projects[projectIndex]);
    }

    if (text.includes("projet") || text.includes("realisation") || text.includes("portfolio")) {
      return {
        html: `<p>Voici mes ${projects.length} projets principaux :</p>
               <ul>${projects.map((p) => `<li><strong>${escapeHtml(p.title)}</strong> (${escapeHtml(p.language)})</li>`).join("")}</ul>
               <p>Demandez-moi le détail de l'un d'eux, par exemple « Parle-moi de Pac-Man ».</p>`,
        actions: [{ label: "Voir tous les projets", href: "#projets" }]
      };
    }

    const match = answers.find((entry) => entry.keys.some((key) => text.includes(key)));
    if (match) return match.answer();

    return {
      html: `<p>Je n'ai pas de réponse toute prête à cette question : toutes mes réponses sont écrites à l'avance.
             Le plus simple est de me la poser directement par e-mail, ou d'essayer un de ces sujets.</p>`,
      actions: [
        { label: "Qui es-tu ?", ask: "Qui es-tu ?" },
        { label: "Tes projets", ask: "Montre-moi tes projets" },
        { label: "Te contacter", ask: "Comment te contacter ?" }
      ]
    };
  }

  function renderActions(actions) {
    const box = document.createElement("div");
    box.className = "message-actions";
    actions.forEach((action) => {
      let element;
      if (action.href) {
        element = document.createElement("a");
        element.href = action.href;
        if (action.external) {
          element.target = "_blank";
          element.rel = "noopener noreferrer";
        }
      } else {
        element = document.createElement("button");
        element.type = "button";
        element.addEventListener("click", () => {
          if (action.ask) askQuestion(action.ask);
          if (action.cv && openCvButton) openCvButton.click();
          if (action.project !== undefined) {
            const tab = document.getElementById(`project-tab-${action.project + 1}`);
            if (tab) tab.click();
            document.getElementById("projets").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
          }
        });
      }
      element.textContent = action.label;
      box.appendChild(element);
    });
    return box;
  }

  function addMessage(role, html) {
    const message = document.createElement("div");
    message.className = `message message--${role}`;
    if (role === "bot") {
      message.innerHTML = `<span class="assistant-avatar" aria-hidden="true">EP</span><div class="message-body">${html}</div>`;
    } else {
      message.innerHTML = `<p>${html}</p>`;
    }
    assistantLog.appendChild(message);
    assistantLog.scrollTop = assistantLog.scrollHeight;
    return message;
  }

  let busy = false;

  function askQuestion(question) {
    const trimmed = question.trim();
    if (!trimmed || busy) return;
    busy = true;

    assistant.classList.add("has-conversation");
    assistantLog.hidden = false;
    addMessage("user", escapeHtml(trimmed));

    document.querySelectorAll(".assistant-history button").forEach((button) => {
      button.classList.toggle("is-current", button.dataset.ask === trimmed);
    });

    // Petit temps de « réflexion » avant la réponse, supprimé si l'utilisateur préfère moins d'animations
    const pending = addMessage("bot", '<span class="typing" aria-label="Eliot écrit"><span></span><span></span><span></span></span>');
    const reply = findAnswer(trimmed);
    setTimeout(() => {
      const body = pending.querySelector(".message-body");
      body.innerHTML = reply.html;
      if (reply.actions && reply.actions.length) body.appendChild(renderActions(reply.actions));
      assistantLog.scrollTop = assistantLog.scrollHeight;
      busy = false;
    }, reducedMotion ? 0 : 650);
  }

  // ===== Défilement strict : un cran vers le bas depuis l'assistant mène directement aux Expériences,
  // un cran vers le haut depuis le début des Expériences ramène à l'assistant =====
  const experienceSection = document.getElementById("timeline-section");
  let snapping = false;

  function experienceTop() {
    return Math.round(experienceSection.getBoundingClientRect().top + window.scrollY);
  }

  function snapTo(y) {
    snapping = true;
    window.scrollTo({ top: y, behavior: reducedMotion ? "auto" : "smooth" });
    setTimeout(() => { snapping = false; }, reducedMotion ? 50 : 800);
  }

  // Renvoie la position cible si le geste doit être intercepté, sinon null
  function snapTarget(direction) {
    const y = window.scrollY;
    const top = experienceTop();
    if (direction > 0 && y < top - 2) return top;
    if (direction < 0 && y > 0 && y <= top + 2) return 0;
    return null;
  }

  // La conversation garde son propre défilement tant qu'elle n'est pas arrivée au bout
  function conversationCanScroll(target, direction) {
    const log = target.closest && target.closest(".assistant-log");
    if (!log) return false;
    return direction > 0
      ? log.scrollTop + log.clientHeight < log.scrollHeight - 1
      : log.scrollTop > 0;
  }

  function handleSnap(event, direction) {
    if (snapping) {
      event.preventDefault();
      return;
    }
    if (conversationCanScroll(event.target, direction)) return;
    const target = snapTarget(direction);
    if (target === null) return;
    event.preventDefault();
    snapTo(target);
  }

  if (assistant && experienceSection) {
    window.addEventListener("wheel", (event) => {
      if (Math.abs(event.deltaY) < 4) return;
      handleSnap(event, Math.sign(event.deltaY));
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      if (event.target.closest("textarea, input, select")) return;
      const keys = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
      if (event.key in keys) handleSnap(event, keys[event.key]);
    });

    let touchStartY = null;
    window.addEventListener("touchstart", (event) => {
      touchStartY = event.touches[0].clientY;
    }, { passive: true });
    window.addEventListener("touchmove", (event) => {
      if (touchStartY === null) return;
      const delta = touchStartY - event.touches[0].clientY;
      if (Math.abs(delta) < 12) return;
      handleSnap(event, Math.sign(delta));
      if (event.defaultPrevented) touchStartY = null;
    }, { passive: false });

    // Les liens vers le Parcours arrivent exactement au même endroit que le défilement
    document.querySelectorAll('a[href="#timeline-section"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        snapTo(experienceTop());
      });
    });
  }

  if (assistant && assistantForm) {
    assistantForm.addEventListener("submit", (event) => {
      event.preventDefault();
      askQuestion(assistantInput.value);
      assistantInput.value = "";
      assistantInput.style.height = "";
    });

    // Entrée envoie la question, Maj + Entrée passe à la ligne
    assistantInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        assistantForm.requestSubmit();
      }
    });

    // La zone de saisie s'agrandit avec le texte
    assistantInput.addEventListener("input", () => {
      assistantInput.style.height = "auto";
      assistantInput.style.height = `${assistantInput.scrollHeight}px`;
    });

    document.querySelectorAll("[data-ask]").forEach((button) => {
      button.addEventListener("click", () => askQuestion(button.dataset.ask));
    });

    document.querySelectorAll("[data-reset]").forEach((button) => {
      button.addEventListener("click", () => {
        assistantLog.innerHTML = "";
        assistantLog.hidden = true;
        assistant.classList.remove("has-conversation");
        document.querySelectorAll(".assistant-history button").forEach((item) => item.classList.remove("is-current"));
        assistantInput.focus();
      });
    });
  }

  // Reflet orange qui suit la souris sur les cartes projets : la carte reste immobile pour viser facilement le logo GitHub
  if (finePointer) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const ratioX = (event.clientX - rect.left) / rect.width;
        const ratioY = (event.clientY - rect.top) / rect.height;

        card.classList.add("is-glowing");
        card.style.setProperty("--glare-x", `${(ratioX * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(ratioY * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-glowing");
      });
    });
  }

  // Apparition des blocs au défilement
  if (!reducedMotion && "IntersectionObserver" in window) {
    const revealGroups = [
      document.querySelectorAll(".section-header"),
      document.querySelectorAll(".exp-row"),
      document.querySelectorAll(".projects-explorer"),
      document.querySelectorAll(".contact-box")
    ];

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        element.classList.add("is-visible");
        revealObserver.unobserve(element);

        // On retire les classes une fois l'animation finie pour rendre la main aux effets de survol
        element.addEventListener("transitionend", function cleanUp(event) {
          if (event.target !== element || event.propertyName !== "opacity") return;
          element.classList.remove("reveal", "is-visible");
          element.style.removeProperty("--reveal-delay");
          element.removeEventListener("transitionend", cleanUp);
        });
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    revealGroups.forEach((group) => {
      group.forEach((element, index) => {
        element.classList.add("reveal");
        element.style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 0.08}s`);
        revealObserver.observe(element);
      });
    });
  }
});
