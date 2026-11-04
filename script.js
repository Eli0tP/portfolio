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
    // Mode classique : comme sur main, le menu apparaît dès 70 pixels ;
    // autres modes : quand la moitié de l'accueil est passée
    const threshold = document.body.dataset.mode === "classique" ? 70 : window.innerHeight * 0.5;
    const isScrolled = window.scrollY > threshold;
    if (siteNavigation) siteNavigation.classList.toggle("scrolled", isScrolled);
    if (socialDock) socialDock.classList.toggle("scrolled", isScrolled);
    document.body.classList.toggle("is-scrolled", isScrolled);

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
    const log = target.closest && target.closest(".assistant-log, .terminal-screen");
    if (!log) return false;
    return direction > 0
      ? log.scrollTop + log.clientHeight < log.scrollHeight - 1
      : log.scrollTop > 0;
  }

  function handleSnap(event, direction) {
    // Le mode classique garde le défilement libre de main
    if (document.body.dataset.mode === "classique") return;
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
        if (document.body.dataset.mode === "classique") {
          // Comme sur main : on s'arrête quand le parcours recouvre l'accueil
          const peek = parseFloat(getComputedStyle(document.body).getPropertyValue("--hero-peek")) || 0;
          window.scrollTo({ top: peek, behavior: reducedMotion ? "auto" : "smooth" });
          return;
        }
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

  // ===== Choix de l'accueil : assistant, terminal ou classique (mémorisé dans le navigateur) =====
  const homeSections = {
    assistant: document.getElementById("hero"),
    terminal: document.getElementById("hero-terminal"),
    classique: document.getElementById("hero-classique-conteneur")
  };
  const modeButtons = document.querySelectorAll(".mode-switch [data-mode]");
  const terminalInput = document.getElementById("terminal-input");

  function setMode(mode, remember = true) {
    if (!homeSections[mode]) mode = "assistant";
    Object.entries(homeSections).forEach(([name, section]) => {
      if (section) section.hidden = name !== mode;
    });
    modeButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    });
    document.body.dataset.mode = mode;
    // Les éléments masqués ont une taille nulle : on recalcule les mises en page qui en dépendent
    window.dispatchEvent(new Event("resize"));
    if (remember) {
      try {
        localStorage.setItem("accueil-mode", mode);
      } catch (error) {
        // Stockage indisponible : le choix vaut seulement pour cette visite
      }
    }
    if (mode === "terminal" && terminalInput && window.scrollY < window.innerHeight / 2) {
      terminalInput.focus({ preventScroll: true });
    }
  }

  modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
      if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
    });
  });

  let savedMode = "assistant";
  try {
    savedMode = localStorage.getItem("accueil-mode") || "assistant";
  } catch (error) {
    savedMode = "assistant";
  }
  setMode(savedMode, false);

  // ===== Mode terminal : commandes écrites à l'avance =====
  const terminalForm = document.getElementById("terminal-form");
  const terminalOutput = document.getElementById("terminal-output");
  const terminalScreen = document.getElementById("terminal-screen");
  const PROMPT = "visiteur@portfolio-eliot:~$";
  const terminalHistory = [];
  let historyIndex = 0;

  function printLine(html, className = "") {
    const line = document.createElement("div");
    if (className) line.className = className;
    line.innerHTML = html;
    terminalOutput.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  }

  function link(href, label) {
    const external = href.startsWith("http") ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${href}"${external}>${escapeHtml(label)}</a>`;
  }

  const commandHelp = [
    ["qui", "qui suis-je"],
    ["alternance", "mon poste chez WESCO"],
    ["parcours", "mes études et expériences"],
    ["projets", "la liste de mes projets"],
    ["projet <numéro>", "le détail d'un projet, par exemple « projet 4 »"],
    ["technologies", "ce que je sais utiliser"],
    ["contact", "comment me joindre"],
    ["cv", "ouvrir le résumé de mon CV"],
    ["effacer", "vider l'écran"],
    ["assistant, classique", "changer d'affichage"],
    ["quitter", "fermer le terminal"]
  ];

  const commands = {
    aide() {
      printLine('<p class="t-title">Commandes disponibles</p>');
      printLine(commandHelp.map(([name, text]) => `  <span class="t-ok">${escapeHtml(name.padEnd(22))}</span>${escapeHtml(text)}`).join("\n"), "t-pre");
    },
    qui() {
      printLine(`Eliot Péchadre, développeur PHP/Symfony en alternance chez WESCO (Cerizay)
et étudiant en Bachelor IA à l'ECE Paris.`, "t-pre");
    },
    alternance() {
      printLine(`<span class="t-title">WESCO, service informatique, depuis septembre 2026</span>
  - corrections de bugs et évolutions d'une application interne en PHP/Symfony
  - mise en place de GitLab et GitHub pour le service, avec la documentation technique
  - déploiement de postes macOS et installation du matériel logistique (Zebra)
Rythme : 2 semaines à l'école, 3 semaines en entreprise.`, "t-pre");
    },
    parcours() {
      printLine(`<span class="t-key">2021 – 2024</span>  Baccalauréat général, spécialités Mathématiques et NSI (Niort)
<span class="t-key">2024 – 2026</span>  Bachelor Informatique, ECE Rennes
<span class="t-key">2026</span>         Semestre d'échange à l'Université de Malte, en anglais
<span class="t-key">2026 – 2027</span>  Bachelor IA, ECE Paris, en alternance chez WESCO`, "t-pre");
    },
    projets() {
      const projects = readProjects();
      printLine(projects.map((p, i) => `  <span class="t-ok">${String(i + 1).padStart(2)}</span>  ${escapeHtml(p.title)}  <span class="t-key">(${escapeHtml(p.language)})</span>`).join("\n")
        + "\n\nTapez « projet 1 » à « projet " + projects.length + " » pour le détail.", "t-pre");
    },
    projet(argument) {
      const projects = readProjects();
      const number = parseInt(argument, 10);
      const project = projects[number - 1];
      if (!project) {
        printLine(`Numéro inconnu. Choisissez entre 1 et ${projects.length} (tapez « projets »).`, "t-error");
        return;
      }
      printLine(`<span class="t-title">${escapeHtml(project.title)}</span>  <span class="t-key">(${escapeHtml(project.language)})</span>
${escapeHtml(project.description)}
Code source : ${link(project.link, project.link.replace("https://", ""))}`, "t-pre");
    },
    technologies() {
      printLine(`<span class="t-key">Web</span>              PHP/Symfony, JavaScript, HTML et CSS, Flask
<span class="t-key">Langages</span>         Java, Python, SQL
<span class="t-key">DevOps</span>           Docker, Kubernetes, Git, GitHub et GitLab, Linux
<span class="t-key">Bases de données</span> PostgreSQL, MySQL, SQLite
<span class="t-key">Autres</span>           réalité augmentée (A-Frame, MindAR), vision par ordinateur`, "t-pre");
    },
    contact() {
      printLine(`<span class="t-key">E-mail</span>    ${link("mailto:eliot.pechadre@gmail.com", "eliot.pechadre@gmail.com")}
<span class="t-key">LinkedIn</span>  ${link("https://www.linkedin.com/in/eliot-pechadre-28a961356/", "linkedin.com/in/eliot-pechadre")}
<span class="t-key">GitHub</span>    ${link("https://github.com/Eli0tP", "github.com/Eli0tP")}`, "t-pre");
    },
    cv() {
      printLine("Ouverture du résumé du CV…");
      if (openCvButton) openCvButton.click();
    },
    effacer() {
      terminalOutput.innerHTML = "";
    },
    assistant() {
      setMode("assistant");
    },
    classique() {
      setMode("classique");
    },
    terminal() {
      printLine("Vous y êtes déjà.");
    },
    ls() {
      printLine('<span class="t-blue-dir">parcours/</span>  <span class="t-blue-dir">projets/</span>  contact.txt  cv.txt', "t-pre");
    },
    quitter() {
      printLine("logout\nConnection to portfolio closed.", "t-pre");
      setTimeout(() => setMode("classique"), reducedMotion ? 0 : 900);
    }
  };

  // Autres façons d'écrire les mêmes commandes
  const aliases = {
    help: "aide", "?": "aide", whoami: "qui", "qui-es-tu": "qui", presentation: "qui",
    wesco: "alternance", travail: "alternance", etudes: "parcours", formation: "parcours",
    competences: "technologies", stack: "technologies", "cat contact.txt": "contact",
    "cat cv.txt": "cv", clear: "effacer", cls: "effacer", exit: "quitter", logout: "quitter",
    chatbot: "assistant"
  };

  function runCommand(raw) {
    const text = raw.trim();
    printLine(`<span class="t-prompt">${PROMPT}</span> ${escapeHtml(text)}`);
    if (!text) return;

    const normalized = normalize(text).replace(/\s+/g, " ");
    if (normalized.startsWith("sudo")) {
      printLine("Permission refusée : seul Eliot a les droits d'administration ici.", "t-error");
      return;
    }
    const [name, ...rest] = normalized.split(" ");
    const key = aliases[normalized] || aliases[name] || name;
    if (commands[key]) {
      commands[key](rest.join(" "));
    } else {
      printLine(`commande introuvable : ${escapeHtml(text)}. Tapez « aide » pour la liste des commandes.`, "t-error");
    }
  }

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const value = terminalInput.value;
      if (value.trim()) terminalHistory.push(value);
      historyIndex = terminalHistory.length;
      terminalInput.value = "";
      runCommand(value);
    });

    terminalInput.addEventListener("keydown", (event) => {
      // Flèches haut et bas : historique des commandes
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        if (!terminalHistory.length) return;
        historyIndex += event.key === "ArrowUp" ? -1 : 1;
        historyIndex = Math.max(0, Math.min(terminalHistory.length, historyIndex));
        terminalInput.value = terminalHistory[historyIndex] || "";
      }
      // Tabulation : complète le nom de la commande
      if (event.key === "Tab") {
        const start = normalize(terminalInput.value);
        const match = Object.keys(commands).find((name) => name.startsWith(start) && start);
        if (match) {
          event.preventDefault();
          terminalInput.value = match;
        }
      }
    });

    // Un clic dans le terminal place le curseur dans la ligne de commande
    terminalScreen.addEventListener("click", (event) => {
      if (event.target.closest("a") || window.getSelection().toString()) return;
      terminalInput.focus({ preventScroll: true });
    });
  }

  // Sphère 3D des technologies derrière la carte du hero
  const heroSection = document.getElementById("hero-classique");
  const heroOrbit = document.getElementById("hero-orbit");
  const heroCard = document.querySelector(".hero-card");
  const orbitTechnologies = [
    { label: "PHP", key: true }, { label: "Symfony", key: true }, { label: "Java", key: true },
    { label: "Python", key: true }, { label: "Kubernetes", key: true }, { label: "Docker", key: true },
    { label: "Spring Boot" }, { label: "Flask" }, { label: "JavaScript" }, { label: "SQL" },
    { label: "PostgreSQL" }, { label: "MySQL" }, { label: "SQLite" }, { label: "Helm" },
    { label: "Keycloak" }, { label: "Git" }, { label: "GitHub" }, { label: "Linux" },
    { label: "macOS" }, { label: "Bash" }, { label: "HTML" }, { label: "CSS" },
    { label: "A-Frame" }, { label: "MindAR" }, { label: "WebAR" }, { label: "POO" },
    { label: "Agile" }, { label: "Vision par ordinateur" }, { label: "IA" }, { label: "Claude Code" },
    { label: "Antigravity" }, { label: "CloudNativePG" }, { label: "KrakenD" }, { label: "OIDC" },
    { label: "JWT" }, { label: "Minikube" }, { label: "Service Worker" }, { label: "Jinja" },
    { label: "Tkinter" }, { label: "Swing" }, { label: "Jupyter" }, { label: "NoSQL" },
    { label: "Bootstrap" }, { label: "WordPress" }, { label: "Haversine" }, { label: "Réalité augmentée" },
    { label: "Documentation" }, { label: "Anglais B2" }, { label: "Zebra" }, { label: "API" },
    { label: "PHP", key: true }, { label: "Symfony", key: true }, { label: "Java", key: true },
    { label: "Python", key: true }, { label: "Kubernetes", key: true }, { label: "Git" },
    { label: "Spring Boot" }, { label: "SQL" }, { label: "Docker" }, { label: "IA" }
  ];

  if (heroSection && heroOrbit) {
    // Répartition régulière des mots sur la sphère (spirale de Fibonacci)
    const orbitPoints = orbitTechnologies.map((technology, index) => {
      const y = 1 - (2 * (index + 0.5)) / orbitTechnologies.length;
      const ringRadius = Math.sqrt(1 - y * y);
      const angle = index * Math.PI * (3 - Math.sqrt(5));

      const word = document.createElement("li");
      word.className = technology.key ? "orbit-word orbit-word--key" : "orbit-word";
      word.textContent = technology.label;
      heroOrbit.appendChild(word);

      return { element: word, x: Math.cos(angle) * ringRadius, y, z: Math.sin(angle) * ringRadius };
    });

    let sphereRadiusX = 0;
    let sphereRadiusY = 0;
    let rotationX = 0.35;
    let rotationY = 0;
    // Vitesses de rotation (radians par image) ; orbitSpeedFactor règle la vitesse globale du nuage
    const orbitSpeedFactor = 0.8;
    const baseSpeedX = 0.0008 * orbitSpeedFactor;
    const baseSpeedY = 0.004 * orbitSpeedFactor;
    let speedX = baseSpeedX;
    let speedY = baseSpeedY;
    let targetSpeedX = speedX;
    let targetSpeedY = speedY;
    let heroVisible = true;
    let animationFrame = null;

    function updateSphereRadius() {
      const sectionRect = heroSection.getBoundingClientRect();
      sphereRadiusY = Math.min(sectionRect.height * 0.42, 520);
      let cardHalfWidth = 0;

      // La sphère tourne autour de la carte, pas du centre de la section, sans sortir de l'écran par le haut
      if (heroCard) {
        const cardRect = heroCard.getBoundingClientRect();
        const cardCenterY = cardRect.top + cardRect.height / 2 - sectionRect.top;
        heroOrbit.style.setProperty("--orbit-center-y", `${cardCenterY.toFixed(0)}px`);
        sphereRadiusY = Math.min(sphereRadiusY, cardCenterY * 0.82);
        cardHalfWidth = cardRect.width / 2;
      }

      // Ellipsoïde plus large que haut : les mots débordent de chaque côté de la carte
      sphereRadiusX = Math.min(sectionRect.width * 0.46, Math.max(sphereRadiusY, cardHalfWidth * 1.35), 680);
    }

    function renderOrbit() {
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const perspective = 2.6;

      orbitPoints.forEach((point) => {
        const x1 = point.x * cosY + point.z * sinY;
        const z1 = point.z * cosY - point.x * sinY;
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + point.y * sinX;

        const depth = (z2 + 1) / 2;
        const scale = perspective / (perspective - z2);
        const screenX = x1 * sphereRadiusX * scale;
        const screenY = y1 * sphereRadiusY * scale;

        point.element.style.transform =
          `translate(-50%, -50%) translate3d(${screenX.toFixed(1)}px, ${screenY.toFixed(1)}px, 0) scale(${(0.7 + depth * 0.5).toFixed(3)})`;
        point.element.style.opacity = (0.18 + depth * 0.72).toFixed(2);
        point.element.style.zIndex = String(Math.round(depth * 100));
      });
    }

    function animateOrbit() {
      speedX += (targetSpeedX - speedX) * 0.04;
      speedY += (targetSpeedY - speedY) * 0.04;
      rotationX += speedX;
      rotationY += speedY;
      renderOrbit();
      animationFrame = heroVisible ? requestAnimationFrame(animateOrbit) : null;
    }

    updateSphereRadius();
    renderOrbit();

    window.addEventListener("resize", () => {
      updateSphereRadius();
      renderOrbit();
    });

    if (!reducedMotion) {
      new IntersectionObserver(([entry]) => {
        heroVisible = entry.isIntersecting;
        if (heroVisible && !animationFrame) animationFrame = requestAnimationFrame(animateOrbit);
      }).observe(heroSection);

      if (finePointer) {
        heroSection.addEventListener("pointermove", (event) => {
          const rect = heroSection.getBoundingClientRect();
          const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
          const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

          targetSpeedY = baseSpeedY + offsetX * 0.014 * orbitSpeedFactor;
          targetSpeedX = baseSpeedX - offsetY * 0.008 * orbitSpeedFactor;

          if (heroCard) {
            heroCard.style.setProperty("--hero-ry", `${(offsetX * 6).toFixed(2)}deg`);
            heroCard.style.setProperty("--hero-rx", `${(-offsetY * 6).toFixed(2)}deg`);
          }
        });

        heroSection.addEventListener("pointerleave", () => {
          targetSpeedX = baseSpeedX;
          targetSpeedY = baseSpeedY;
          if (heroCard) {
            heroCard.style.setProperty("--hero-ry", "0deg");
            heroCard.style.setProperty("--hero-rx", "0deg");
          }
        });
      }
    }
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
