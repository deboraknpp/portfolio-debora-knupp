/* =====================================================================
   PORTFÓLIO AUDIOVISUAL — JavaScript
   Tudo em vanilla JS, sem bibliotecas. Cada bloco é independente:
   se você apagar uma seção do HTML, o resto continua funcionando.
   ===================================================================== */
(function () {
  "use strict";

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------
     1. HEADER — fundo ao rolar a página
     --------------------------------------------------------------- */
  const header = $("#header");
  const onScroll = () => header && header.classList.toggle("is-scrolled", window.scrollY > 30);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------------------------------------------------------------
     2. MENU MOBILE
     --------------------------------------------------------------- */
  const navToggle = $("#nav-toggle");
  const nav = $("#nav");

  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menu");
    document.body.style.overflow = "";
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      document.body.style.overflow = open ? "hidden" : "";
    });

    $$(".nav__link", nav).forEach((link) => link.addEventListener("click", closeNav));

    document.addEventListener("click", (e) => {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !navToggle.contains(e.target)) closeNav();
    });
  }

  /* ---------------------------------------------------------------
     3. REVEAL — elementos aparecem conforme o scroll
     --------------------------------------------------------------- */
  const revealItems = $$(".reveal");

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (!entry.isIntersecting) return;
          setTimeout(() => entry.target.classList.add("is-visible"), i * 70);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );
    revealItems.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------
     4. LINK ATIVO NO MENU conforme a seção visível
     --------------------------------------------------------------- */
  const sections = $$("main section[id]");
  const navLinks = $$(".nav__link");

  if (sections.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((l) =>
            l.classList.toggle("is-active", l.getAttribute("href") === "#" + entry.target.id)
          );
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------------------------------------------------------------
     5. CONTADORES ANIMADOS (números do hero e do social)
     --------------------------------------------------------------- */
  const counters = $$("[data-count]");

  const runCount = (el) => {
    const target = parseFloat(el.dataset.count) || 0;
    const suffix = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }

    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);           // ease-out
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  if (counters.length && "IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          runCount(entry.target);
          countObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach(runCount);
  }

  /* ---------------------------------------------------------------
     6. FILTRO DOS DESTAQUES
     --------------------------------------------------------------- */
  const filters = $$(".filter");
  const works = $$("#works-grid .work");

  filters.forEach((btn) => {
    btn.addEventListener("click", () => {
      filters.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");

      const wanted = btn.dataset.filter;
      works.forEach((work) => {
        const show = wanted === "all" || work.dataset.category === wanted;
        work.classList.toggle("is-hidden", !show);
      });
    });
  });

  /* ---------------------------------------------------------------
     7. MODAL DE VÍDEO (YouTube / Vimeo)
     O vídeo só é carregado ao clicar — a página abre rápido.
     --------------------------------------------------------------- */
  const vmodal = $("#vmodal");
  const vframe = $("#vmodal-frame");
  const vtitle = $("#vmodal-title");
  const vlink = $("#vmodal-link");
  let lastFocused = null;

  const openVideo = (trigger) => {
    if (!vmodal) return;
    const yt = trigger.dataset.video;
    const vimeo = trigger.dataset.vimeo;
    if (!yt && !vimeo) return;

    const src = yt
      ? `https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&rel=0`
      : `https://player.vimeo.com/video/${vimeo}?autoplay=1`;

    // Link de saída: alguns vídeos bloqueiam a incorporação (erro 153 do YouTube),
    // e abrir o site como arquivo local (file://) também derruba o player.
    if (vlink) {
      vlink.href = yt
        ? `https://www.youtube.com/watch?v=${yt}`
        : `https://vimeo.com/${vimeo}`;
    }

    lastFocused = document.activeElement;
    vframe.innerHTML =
      `<iframe src="${src}" title="${trigger.dataset.title || "Vídeo"}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    vtitle.textContent = trigger.dataset.title || "";
    vmodal.hidden = false;
    document.body.style.overflow = "hidden";
    $(".vmodal__close", vmodal).focus();
  };

  const closeVideo = () => {
    if (!vmodal || vmodal.hidden) return;
    vmodal.hidden = true;
    vframe.innerHTML = "";                 // para o vídeo de tocar
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  $$("[data-video], [data-vimeo]").forEach((el) =>
    el.addEventListener("click", () => openVideo(el))
  );

  if (vmodal) {
    $(".vmodal__close", vmodal).addEventListener("click", closeVideo);
    vmodal.addEventListener("click", (e) => { if (e.target === vmodal) closeVideo(); });
  }

  /* ---------------------------------------------------------------
     8. LIGHTBOX DA GALERIA DE FOTOS
     Funciona tanto com <img> quanto com os placeholders coloridos.
     --------------------------------------------------------------- */
  const lightbox = $("#lightbox");
  const stage = $("#lightbox-stage");
  const caption = $("#lightbox-caption");
  const shots = $$("#gallery .shot");
  let current = 0;

  const renderShot = (index) => {
    const shot = shots[index];
    if (!shot) return;
    current = index;

    const img = $("img", shot);
    const full = shot.dataset.full || (img && img.src);

    if (full) {
      stage.style.backgroundImage = "";
      stage.innerHTML = `<img src="${full}" alt="${shot.dataset.caption || ""}" />`;
    } else {
      const ph = $(".shot__ph", shot);
      stage.innerHTML = "";
      stage.style.backgroundImage = ph ? getComputedStyle(ph).backgroundImage : "";
    }
    caption.textContent = `${shot.dataset.caption || ""}  (${index + 1}/${shots.length})`;
  };

  const openLightbox = (index) => {
    if (!lightbox) return;
    lastFocused = document.activeElement;
    renderShot(index);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    $(".lightbox__close", lightbox).focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    stage.innerHTML = "";
    document.body.style.overflow = "";
    if (lastFocused) lastFocused.focus();
  };

  const step = (dir) => renderShot((current + dir + shots.length) % shots.length);

  shots.forEach((shot, i) => shot.addEventListener("click", () => openLightbox(i)));

  if (lightbox) {
    $(".lightbox__close", lightbox).addEventListener("click", closeLightbox);
    $(".lightbox__nav--prev", lightbox).addEventListener("click", () => step(-1));
    $(".lightbox__nav--next", lightbox).addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLightbox(); });

    // arrastar no celular
    let touchX = null;
    lightbox.addEventListener("touchstart", (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
    lightbox.addEventListener("touchend", (e) => {
      if (touchX === null) return;
      const delta = e.changedTouches[0].clientX - touchX;
      if (Math.abs(delta) > 55) step(delta < 0 ? 1 : -1);
      touchX = null;
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     9. PREVIEWS EM VÍDEO NOS CARDS DE SOCIAL
     Tocam em loop e sem áudio, só enquanto o card está na tela — fora
     dela o vídeo pausa, para não gastar bateria nem dados de graça.
     Se o arquivo não existir, o card segue mostrando a capa.
     --------------------------------------------------------------- */
  const previews = $$(".post__video");

  // Com "economia de dados" ligada no celular, nenhum preview é baixado:
  // os cards ficam na capa, que não custa nada.
  const economiaDeDados = navigator.connection && navigator.connection.saveData;

  if (previews.length && !reduceMotion && !economiaDeDados && "IntersectionObserver" in window) {
    const playObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting) {
            // com preload="none", é o play() que dispara o download
            const started = video.play();
            if (started) started.catch(() => {});     // arquivo ausente: segue a capa
          } else {
            video.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    previews.forEach((video) => {
      video.addEventListener("loadeddata", () => video.classList.add("is-ready"));
      playObserver.observe(video);
    });
  }

  /* ---------------------------------------------------------------
     10. CARROSSEL DO HERO
     As fotos trocam sozinhas, com fade. Pausa quando o hero sai da tela
     e nem começa para quem desativou animações no sistema.
     --------------------------------------------------------------- */
  const heroCarousel = $("#hero-carousel");

  if (heroCarousel && !reduceMotion) {
    const shots = $$("img", heroCarousel);
    const dots = $$(".hero__dots i", heroCarousel);

    if (shots.length > 1) {
      let current = 0;
      let timer = null;

      // As fotos 2 e 3 vêm com data-src: ficam fora do carregamento da página e
      // são buscadas 4,5s antes de entrarem em cena. Sem isso o navegador
      // baixaria as três de uma vez (o loading="lazy" não adia o que está
      // na área visível, mesmo invisível por opacity).
      const armar = (i) => {
        const img = shots[i];
        if (img && img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
      };

      const show = (next) => {
        shots[current].classList.remove("is-active");
        if (dots[current]) dots[current].classList.remove("is-active");
        current = next;
        shots[current].classList.add("is-active");
        if (dots[current]) dots[current].classList.add("is-active");
        armar((current + 1) % shots.length);          // já deixa a próxima pronta
      };

      const start = () => {
        if (!timer) {
          armar(1);
          timer = setInterval(() => show((current + 1) % shots.length), 4500);
        }
      };
      const stop = () => { clearInterval(timer); timer = null; };

      if ("IntersectionObserver" in window) {
        new IntersectionObserver(
          (entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop())),
          { threshold: 0.2 }
        ).observe(heroCarousel);
      } else {
        start();
      }
    }
  }

  /* ---------------------------------------------------------------
     11. FAIXAS QUE ROLAM PARA O LADO
     Vale para a faixa de Reels e, no celular, para o mosaico da galeria —
     qualquer bloco marcado com data-strip no HTML. As setas rolam dois cards
     por clique e somem nas pontas; somem também quando não há o que rolar,
     que é o caso da galeria no PC, onde o mosaico cabe inteiro na tela.
     Arrastar com o dedo ou o trackpad continua funcionando normalmente.
     --------------------------------------------------------------- */
  $$("[data-strip]").forEach((faixa) => {
    const trilho = $(".feed, .gallery", faixa);
    const anterior = $(".feed-nav--prev", faixa);
    const proximo = $(".feed-nav--next", faixa);
    if (!trilho || !anterior || !proximo) return;

    const passo = () => {
      const card = trilho.firstElementChild;
      const vao = parseFloat(getComputedStyle(trilho).columnGap) || 22;
      return card ? (card.offsetWidth + vao) * 2 : 480;
    };

    const atualizarSetas = () => {
      const max = trilho.scrollWidth - trilho.clientWidth;
      anterior.disabled = trilho.scrollLeft < 4;
      proximo.disabled = trilho.scrollLeft > max - 4;
    };

    anterior.addEventListener("click", () => trilho.scrollBy({ left: -passo(), behavior: "smooth" }));
    proximo.addEventListener("click", () => trilho.scrollBy({ left: passo(), behavior: "smooth" }));

    trilho.addEventListener("scroll", atualizarSetas, { passive: true });
    window.addEventListener("resize", atualizarSetas);
    atualizarSetas();
  });

  /* ---------------------------------------------------------------
     12. TECLADO — Esc fecha, setas navegam
     --------------------------------------------------------------- */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { closeVideo(); closeLightbox(); closeNav(); }
    if (lightbox && !lightbox.hidden) {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft")  step(-1);
    }
  });

  /* ---------------------------------------------------------------
     13. ANO NO RODAPÉ
     --------------------------------------------------------------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();
})();
