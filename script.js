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

  // Projets : trois modes de vue (liste + détail, grille compacte, carrousel 3D) qui partagent le projet sélectionné.
  // Sans JS, toutes les cartes restent en grille.
  const projectsExplorer = document.getElementById("projects-explorer");
  const projectTabList = document.getElementById("project-tabs");
  const projectsGrid = document.getElementById("projects-grid");
  const projectCards = document.querySelectorAll("#projects-grid .project-card");
  const projectViewSwitcher = document.getElementById("project-views");
  const projectViewButtons = document.querySelectorAll(".project-view-btn");
  const carouselControls = document.getElementById("carousel-controls");
  const carouselCounter = document.getElementById("carousel-counter");
  const projectViews = ["liste", "grille", "carrousel"];
  const projectViewStorageKey = "portfolio-projects-view";
  const projectTabs = [];
  let activeProjectIndex = 0;
  let projectView = "liste";

  function getCarouselOffset(index) {
    const total = projectCards.length;
    let offset = index - activeProjectIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;
    return offset;
  }

  function updateProjects() {
    projectTabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeProjectIndex;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    projectCards.forEach((card, index) => {
      const isActive = index === activeProjectIndex;
      const isHidden = projectView !== "grille" && !isActive;
      const offset = getCarouselOffset(index);

      card.classList.toggle("is-active", isActive);
      card.setAttribute("aria-hidden", String(isHidden));
      card.style.setProperty("--carousel-offset", String(offset));
      card.style.setProperty("--carousel-distance", String(Math.abs(offset)));
      card.querySelectorAll("a").forEach((link) => {
        if (isHidden) link.tabIndex = -1;
        else link.removeAttribute("tabindex");
      });

      if (projectView === "liste") card.setAttribute("role", "tabpanel");
      else card.removeAttribute("role");
    });

    if (carouselCounter) {
      const pad = (value) => String(value).padStart(2, "0");
      carouselCounter.textContent = `${pad(activeProjectIndex + 1)} / ${pad(projectCards.length)}`;
    }
  }

  function selectProject(index, moveFocus) {
    activeProjectIndex = (index + projectCards.length) % projectCards.length;
    updateProjects();
    if (moveFocus) projectTabs[activeProjectIndex].focus();
  }

  function setProjectView(view) {
    projectView = projectViews.includes(view) ? view : "liste";
    projectsExplorer.dataset.view = projectView;
    projectTabList.hidden = projectView !== "liste";
    if (carouselControls) carouselControls.hidden = projectView !== "carrousel";

    projectViewButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.view === projectView));
    });

    try {
      localStorage.setItem(projectViewStorageKey, projectView);
    } catch (error) {
      // Stockage indisponible (navigation privée) : le choix ne sera simplement pas retenu
    }

    updateProjects();
  }

  if (projectsExplorer && projectTabList && projectCards.length > 0) {
    projectCards.forEach((card, index) => {
      const title = card.querySelector(".card-title");
      const language = card.querySelector(".project-lang");
      const cardId = `project-panel-${index + 1}`;

      card.id = cardId;
      card.setAttribute("aria-labelledby", `project-tab-${index + 1}`);

      // Carrousel : cliquer sur une carte de côté la ramène au centre
      card.addEventListener("click", (event) => {
        if (projectView !== "carrousel" || index === activeProjectIndex) return;
        event.preventDefault();
        selectProject(index, false);
      });

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

    projectViewButtons.forEach((button) => {
      button.addEventListener("click", () => setProjectView(button.dataset.view));
    });

    document.getElementById("carousel-prev")?.addEventListener("click", () => selectProject(activeProjectIndex - 1, false));
    document.getElementById("carousel-next")?.addEventListener("click", () => selectProject(activeProjectIndex + 1, false));

    [projectsExplorer, carouselControls].forEach((element) => {
      element?.addEventListener("keydown", (event) => {
        if (projectView !== "carrousel") return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        event.preventDefault();
        selectProject(activeProjectIndex + (event.key === "ArrowRight" ? 1 : -1), false);
      });
    });

    // Carrousel : glisser du doigt (ou de la souris) vers la gauche ou la droite
    let swipeStartX = null;
    let ignoreNextClick = false;
    projectsGrid.addEventListener("pointerdown", (event) => {
      if (projectView === "carrousel") swipeStartX = event.clientX;
    });
    projectsGrid.addEventListener("pointerup", (event) => {
      if (swipeStartX === null) return;
      const distance = event.clientX - swipeStartX;
      swipeStartX = null;
      if (Math.abs(distance) > 50) {
        ignoreNextClick = true;
        setTimeout(() => {
          ignoreNextClick = false;
        }, 0);
        selectProject(activeProjectIndex + (distance < 0 ? 1 : -1), false);
      }
    });
    projectsGrid.addEventListener("pointercancel", () => {
      swipeStartX = null;
    });
    // Un glissement ne doit pas aussi compter comme un clic (sur une carte ou un lien GitHub)
    projectsGrid.addEventListener("click", (event) => {
      if (!ignoreNextClick) return;
      ignoreNextClick = false;
      event.preventDefault();
      event.stopPropagation();
    }, true);

    let savedView = "liste";
    try {
      savedView = localStorage.getItem(projectViewStorageKey) || "liste";
    } catch (error) {
      // Stockage indisponible : on garde la vue liste
    }

    if (projectViewSwitcher) projectViewSwitcher.hidden = false;
    setProjectView(savedView);
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
  const scrollThreshold = 70;

  function updateNavigationOnScroll() {
    const isScrolled = window.scrollY > scrollThreshold;
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

  function getHeroPeek() {
    const rootStyles = getComputedStyle(document.documentElement);
    return parseFloat(rootStyles.getPropertyValue("--hero-peek")) || 0;
  }

  const customScrollTargets = {
    "#hero": () => 0,
    "#timeline-section": getHeroPeek
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

  // Sphère 3D des technologies derrière la carte du hero
  const heroSection = document.getElementById("hero");
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

  // Inclinaison 3D des cartes projets au survol
  if (finePointer && !reducedMotion) {
    document.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const ratioX = (event.clientX - rect.left) / rect.width;
        const ratioY = (event.clientY - rect.top) / rect.height;

        card.classList.add("is-tilting");
        card.style.setProperty("--tilt-y", `${((ratioX - 0.5) * 10).toFixed(2)}deg`);
        card.style.setProperty("--tilt-x", `${((0.5 - ratioY) * 10).toFixed(2)}deg`);
        card.style.setProperty("--glare-x", `${(ratioX * 100).toFixed(1)}%`);
        card.style.setProperty("--glare-y", `${(ratioY * 100).toFixed(1)}%`);
      });

      card.addEventListener("pointerleave", () => {
        card.classList.remove("is-tilting");
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
