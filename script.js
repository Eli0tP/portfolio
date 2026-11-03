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
