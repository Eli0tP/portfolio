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

  const projectsGrid = document.getElementById("projects-grid");
  const projectsToggle = document.getElementById("projects-toggle");
  const extraProjects = document.querySelectorAll(".project-card--extra");

  function setProjectsExpanded(isExpanded) {
    projectsGrid.classList.toggle("is-collapsed", !isExpanded);
    projectsToggle.setAttribute("aria-expanded", String(isExpanded));
    projectsToggle.textContent = isExpanded
      ? "Afficher moins de projets"
      : `Voir les ${extraProjects.length} autres projets`;
  }

  if (projectsGrid && projectsToggle && extraProjects.length > 0) {
    projectsToggle.hidden = false;
    setProjectsExpanded(false);

    projectsToggle.addEventListener("click", () => {
      const isExpanded = projectsToggle.getAttribute("aria-expanded") === "true";
      setProjectsExpanded(!isExpanded);

      if (isExpanded) {
        document.getElementById("projets").scrollIntoView({ behavior: "smooth" });
      }
    });
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
    { label: "Agile" }, { label: "Vision par ordinateur" }, { label: "IA" }, { label: "Claude Code" }
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

    let sphereRadius = 0;
    let rotationX = 0.35;
    let rotationY = 0;
    let speedX = 0.0008;
    let speedY = 0.004;
    let targetSpeedX = speedX;
    let targetSpeedY = speedY;
    let heroVisible = true;
    let animationFrame = null;

    function updateSphereRadius() {
      const sectionRect = heroSection.getBoundingClientRect();
      sphereRadius = Math.min(sectionRect.width * 0.46, sectionRect.height * 0.42, 520);

      // La sphère tourne autour de la carte, pas du centre de la section
      if (heroCard) {
        const cardRect = heroCard.getBoundingClientRect();
        const cardCenterY = cardRect.top + cardRect.height / 2 - sectionRect.top;
        heroOrbit.style.setProperty("--orbit-center-y", `${cardCenterY.toFixed(0)}px`);
      }
    }

    function renderOrbit() {
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const perspective = sphereRadius * 2.6;

      orbitPoints.forEach((point) => {
        const x1 = point.x * cosY + point.z * sinY;
        const z1 = point.z * cosY - point.x * sinY;
        const y1 = point.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + point.y * sinX;

        const depth = (z2 + 1) / 2;
        const scale = perspective / (perspective - z2 * sphereRadius);
        const screenX = x1 * sphereRadius * scale;
        const screenY = y1 * sphereRadius * scale;

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

          targetSpeedY = 0.004 + offsetX * 0.014;
          targetSpeedX = 0.0008 - offsetY * 0.008;

          if (heroCard) {
            heroCard.style.setProperty("--hero-ry", `${(offsetX * 6).toFixed(2)}deg`);
            heroCard.style.setProperty("--hero-rx", `${(-offsetY * 6).toFixed(2)}deg`);
          }
        });

        heroSection.addEventListener("pointerleave", () => {
          targetSpeedX = 0.0008;
          targetSpeedY = 0.004;
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
      document.querySelectorAll(".project-card"),
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
