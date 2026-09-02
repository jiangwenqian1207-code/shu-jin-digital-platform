(() => {
  const weaving = document.querySelector('.weaving');
  const machineList = document.querySelector('.machine-list');
  const processSummary = document.querySelector('.process-summary');
  const processButtons = [...document.querySelectorAll('[data-process-view]')];
  const toolsStage = document.querySelector('.tools-scroll-stage');
  const toolsViewport = document.querySelector('.tools-viewport');
  const toolsRail = document.querySelector('.tools-rail');
  const originalTools = [...document.querySelectorAll('.tools-rail .tool')];
  if (toolsRail && originalTools.length && !toolsRail.dataset.loopReady) {
    const loopFragment = document.createDocumentFragment();
    originalTools.forEach((tool) => {
      const clone = tool.cloneNode(true);
      clone.classList.add('tool-clone');
      clone.setAttribute('aria-hidden', 'true');
      loopFragment.appendChild(clone);
    });
    toolsRail.appendChild(loopFragment);
    toolsRail.dataset.loopReady = 'true';
  }
  const tools = [...document.querySelectorAll('.tools-rail .tool')];
  const preparationStage = document.querySelector('.preparation-stage');
  const patternStage = document.querySelector('.pattern-stage-label');
  const weavingStage = document.querySelector('.weaving-stage-label');
  const preparationFlow = document.querySelector('.preparation-flow');
  const patternWeavingFlow = document.querySelector('.pattern-weaving-flow');
  const weavingFlow = document.querySelector('.weaving-flow');
  const patterns = document.querySelector('.patterns');
  const footerDiscovery = document.querySelector('.footer-discovery');
  const patternRails = [...document.querySelectorAll('.pattern-rail[data-marquee-direction]')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenuPanel = document.querySelector('.mobile-menu-panel');
  const mobileMenuBackdrop = document.querySelector('.mobile-menu-backdrop');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');
  if (mobileMenuToggle && mobileMenuPanel && mobileMenuBackdrop && mobileMenuClose) {
    const setMobileMenu = (open) => {
      document.body.classList.toggle('mobile-menu-open', open);
      mobileMenuToggle.setAttribute('aria-expanded', String(open));
      mobileMenuToggle.setAttribute('aria-label', open ? '关闭侧边菜单' : '打开侧边菜单');
      mobileMenuPanel.setAttribute('aria-hidden', String(!open));
      if (open) mobileMenuClose.focus({ preventScroll: true });
    };

    mobileMenuToggle.addEventListener('click', () => {
      setMobileMenu(!document.body.classList.contains('mobile-menu-open'));
    });
    mobileMenuBackdrop.addEventListener('click', () => setMobileMenu(false));
    mobileMenuClose.addEventListener('click', () => {
      setMobileMenu(false);
      mobileMenuToggle.focus({ preventScroll: true });
    });
    mobileMenuPanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setMobileMenu(false));
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && document.body.classList.contains('mobile-menu-open')) {
        setMobileMenu(false);
        mobileMenuToggle.focus({ preventScroll: true });
      }
    });
  }

  const eraTrack = document.querySelector('.era-track');
  const eraLabels = eraTrack ? [...eraTrack.querySelectorAll('.era-labels > *')] : [];
  const eraControl = eraTrack?.querySelector('.track-line button');
  const timelinePicture = document.querySelector('.timeline-picture img');
  const timelineTitle = document.querySelector('.timeline-copy h3');
  const timelineDescription = document.querySelector('.timeline-copy p');
  const timelineCaption = document.querySelector('.timeline-copy small');
  const timelineArrows = [...document.querySelectorAll('.timeline-arrow')];
  const timelineEntries = [
    {
      title: '春秋战国时期',
      description: '这一时期蜀锦以多彩经线起花的经锦为主，纹样由小型几何纹逐渐发展为大型复合纹样。其构图多以菱形、方形等几何骨架组织画面，并融入舞人、龙凤、麒麟及动植物元素。色彩以黄、红、绿等暖色为主，整体呈现出秩序严谨、层次清晰且富有节奏的装饰特征。',
      caption: '图例：战国龙凤舞人纹锦',
      image: './public/shujin-patterns/warring-states-dragon-phoenix-dancer-pattern.jpg',
      alt: '战国龙凤舞人纹锦'
    },
    {
      title: '秦汉时期',
      description: '秦汉时期蜀锦纹样逐渐摆脱规整、均匀的几何构图，整体趋向流动、生动与富有变化。题材以云气纹、几何纹、植物纹和动物纹为主，并融入文字、茱萸、虎豹等吉祥元素。构图强调动势与节奏感，色彩多厚重沉稳，常用朱红、绛色、茶褐、深棕、玄色等，呈现出雄浑灵动的时代风格。',
      caption: '图例：汉五星出东方利中国锦纹',
      image: './public/digital-pattern-library/han-jin-five-stars-brocade-pattern.jpg',
      alt: '汉五星出东方利中国锦纹'
    },
    {
      title: '魏晋南北朝时期',
      description: '魏晋南北朝时期蜀锦纹样在继承汉代传统的基础上，受到丝绸之路与西域文化影响，题材更加多样，出现骆驼、狮象、生命树等动植物纹样。构图逐渐由汉代流动式布局转向更规整的对波、方格、联珠团窠等形式，动物多呈静态对称排列，整体风格趋于秩序化、装饰化，色彩也更加丰富。',
      caption: '图例：北朝方格兽锦纹',
      image: './public/digital-pattern-library/northern-dynasties-grid-beast-brocade-pattern.jpg',
      alt: '北朝方格兽锦纹'
    },
    {
      title: '隋唐时期',
      description: '隋唐时期蜀锦纹样发展至繁盛阶段，题材丰富、构图饱满，既吸收西域文化，又形成鲜明的本土特色。纹样常见团窠、联珠、宝相花、折枝花鸟及禽兽题材，布局多对称规整又富于变化；植物纹样明显增多，花鸟形象更生动，色彩鲜艳华丽、对比强烈，整体呈现出开放、富丽而兼具异域风情的艺术特征。',
      caption: '图例：唐代联珠对鹊锦纹',
      image: './public/digital-pattern-library/tang-dynasty-pearl-roundel-paired-magpie-brocade-pattern.jpg',
      alt: '唐代联珠对鹊锦纹'
    },
    {
      title: '宋元时期',
      description: '宋元时期蜀锦纹样在继承隋唐写实花鸟与禽兽题材的基础上，构图趋于清秀典雅、规整均衡。常见花鸟、动植物、几何及吉祥纹样，并发展出落花流水锦、灯笼锦等代表性形式。宋代色彩较隋唐更典雅丰富，元代则受波斯文化影响，常加入金线，整体呈现出雅致中兼具华丽的艺术特征。',
      caption: '图例：宋代灯笼锦纹',
      image: './public/digital-pattern-library/song-dynasty-lantern-brocade-pattern.jpg',
      alt: '宋代灯笼锦纹'
    },
    {
      title: '明清时期',
      description: '明清时期蜀锦虽受战乱影响一度衰落，但清初逐渐恢复生产，纹样体系也继续发展。明代多在唐宋传统基础上创新，题材以花卉、蝴蝶、几何及吉祥纹样为主；清代则形成方方锦、雨丝锦、月华锦等代表样式，构图更规整繁密，色彩层次丰富，整体呈现出精致华丽、装饰性强的艺术特征。',
      caption: '图例：明代太子绵羊锦纹',
      image: './public/digital-pattern-library/ming-dynasty-prince-mianyang-brocade-pattern.jpg',
      alt: '明代太子绵羊锦纹'
    }
  ];
  const mobileTimeline = window.matchMedia('(max-width: 767px)');
  if (eraTrack && eraLabels.length && eraControl) {
    const eraSlotWidth = 96;
    let eraProgress = 0;
    let eraDragging = false;
    let eraPointerId = null;
    let eraStartX = 0;
    let eraStartProgress = 0;
    let eraMoved = false;
    let renderedEraIndex = 0;

    const clampEra = (value, min, max) => Math.min(max, Math.max(min, value));
    const getDesktopEraCenters = () => {
      const lineBounds = eraControl.parentElement.getBoundingClientRect();
      return eraLabels.map((label) => {
        const bounds = label.getBoundingClientRect();
        return bounds.left - lineBounds.left + bounds.width / 2;
      });
    };
    const renderEraContent = (activeIndex) => {
      const entry = timelineEntries[activeIndex];
      if (!entry || activeIndex === renderedEraIndex) return;
      renderedEraIndex = activeIndex;
      if (timelinePicture) {
        timelinePicture.src = entry.image;
        timelinePicture.alt = entry.alt;
      }
      if (timelineTitle) timelineTitle.textContent = entry.title;
      if (timelineDescription) timelineDescription.textContent = entry.description;
      if (timelineCaption) timelineCaption.textContent = entry.caption;
    };
    const setActiveEra = (activeIndex) => {
      eraLabels.forEach((label, index) => label.classList.toggle('active', index === activeIndex));
      eraControl.setAttribute('aria-valuenow', String(activeIndex));
      eraControl.setAttribute('aria-valuetext', eraLabels[activeIndex].textContent.trim());
      timelineArrows.forEach((arrow) => {
        const atLimit = arrow.classList.contains('left') ? activeIndex === 0 : activeIndex === eraLabels.length - 1;
        arrow.setAttribute('aria-disabled', String(atLimit));
      });
      renderEraContent(activeIndex);
    };
    const updateEraTimeline = (progress = eraProgress) => {
      eraProgress = clampEra(progress, 0, 1);
      const activeIndex = Math.round(eraProgress * (eraLabels.length - 1));

      if (!mobileTimeline.matches) {
        eraTrack.style.removeProperty('--era-label-x');
        const centers = getDesktopEraCenters();
        const position = eraProgress * (eraLabels.length - 1);
        const startIndex = Math.floor(position);
        const endIndex = Math.min(eraLabels.length - 1, startIndex + 1);
        const localProgress = position - startIndex;
        const center = centers[startIndex] + (centers[endIndex] - centers[startIndex]) * localProgress;
        const sliderX = center - (eraControl.offsetWidth || 64) / 2;
        eraTrack.style.setProperty('--era-slider-x', `${sliderX.toFixed(2)}px`);
        setActiveEra(activeIndex);
        return;
      }

      const trackWidth = eraTrack.clientWidth;
      const controlWidth = eraControl.offsetWidth || 52;
      const startX = 20;
      const endX = Math.max(startX, trackWidth - controlWidth - 20);
      const sliderX = startX + (endX - startX) * eraProgress;
      const contentCenter = (eraProgress * (eraLabels.length - 1) + .5) * eraSlotWidth;
      const labelWidth = eraLabels.length * eraSlotWidth;
      const labelX = clampEra(sliderX + controlWidth / 2 - contentCenter, trackWidth - labelWidth, 0);

      eraTrack.style.setProperty('--era-slider-x', `${sliderX.toFixed(2)}px`);
      eraTrack.style.setProperty('--era-label-x', `${labelX.toFixed(2)}px`);
      setActiveEra(activeIndex);
    };

    const setEraIndex = (index) => {
      updateEraTimeline(clampEra(index, 0, eraLabels.length - 1) / (eraLabels.length - 1));
    };

    eraControl.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      eraDragging = true;
      eraPointerId = event.pointerId;
      eraStartX = event.clientX;
      eraStartProgress = eraProgress;
      eraMoved = false;
      eraTrack.classList.add('dragging');
      eraControl.classList.add('dragging');
      eraControl.setPointerCapture(event.pointerId);
      event.preventDefault();
    });
    eraControl.addEventListener('pointermove', (event) => {
      if (!eraDragging || event.pointerId !== eraPointerId) return;
      const desktopCenters = mobileTimeline.matches ? null : getDesktopEraCenters();
      const travel = mobileTimeline.matches
        ? Math.max(1, eraTrack.clientWidth - eraControl.offsetWidth - 40)
        : Math.max(1, desktopCenters[desktopCenters.length - 1] - desktopCenters[0]);
      const deltaX = event.clientX - eraStartX;
      if (Math.abs(deltaX) > 4) eraMoved = true;
      updateEraTimeline(eraStartProgress + deltaX / travel);
    });

    const stopEraDragging = (event) => {
      if (!eraDragging || event.pointerId !== eraPointerId) return;
      if (!eraMoved && event.type !== 'pointercancel') {
        const controlBox = eraControl.getBoundingClientRect();
        const activeIndex = Math.round(eraProgress * (eraLabels.length - 1));
        setEraIndex(activeIndex + (event.clientX < controlBox.left + controlBox.width / 2 ? -1 : 1));
      } else if (eraMoved && event.type !== 'pointercancel') {
        setEraIndex(Math.round(eraProgress * (eraLabels.length - 1)));
      }
      eraDragging = false;
      eraPointerId = null;
      eraTrack.classList.remove('dragging');
      eraControl.classList.remove('dragging');
      if (eraControl.hasPointerCapture(event.pointerId)) eraControl.releasePointerCapture(event.pointerId);
    };

    eraControl.addEventListener('pointerup', stopEraDragging);
    eraControl.addEventListener('pointercancel', stopEraDragging);
    eraControl.addEventListener('keydown', (event) => {
      const activeIndex = Math.round(eraProgress * (eraLabels.length - 1));
      if (event.key === 'ArrowLeft') setEraIndex(activeIndex - 1);
      else if (event.key === 'ArrowRight') setEraIndex(activeIndex + 1);
      else if (event.key === 'Home') setEraIndex(0);
      else if (event.key === 'End') setEraIndex(eraLabels.length - 1);
      else return;
      event.preventDefault();
    });
    timelineArrows.forEach((arrow) => {
      arrow.addEventListener('click', () => {
        const activeIndex = Math.round(eraProgress * (eraLabels.length - 1));
        setEraIndex(activeIndex + (arrow.classList.contains('left') ? -1 : 1));
      });
    });
    window.addEventListener('resize', () => updateEraTimeline());
    mobileTimeline.addEventListener?.('change', () => updateEraTimeline());
    updateEraTimeline();
  }

  const hero = document.querySelector('.hero');
  const heroLoom = hero?.querySelector('.hero-loom');
  const heroReelingMachine = hero?.querySelector('.hero-reeling-machine');
  const heroParticleCanvas = hero?.querySelector('.hero-particle-canvas');
  if (hero && heroLoom && heroReelingMachine && heroParticleCanvas) {
    const switchDistance = 360;
    const particleDuration = 1300;
    let previousPointerX = null;
    let horizontalTravel = 0;
    let activeMachine = 'loom';
    let machineAnimating = false;
    let queuedMachine = null;

    const clampParticle = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
    const setMachineState = (machine) => {
      activeMachine = machine;
      const showReelingMachine = machine === 'reeling';
      hero.classList.toggle('machine-reeling', showReelingMachine);
      heroLoom.setAttribute('aria-hidden', showReelingMachine ? 'true' : 'false');
      heroReelingMachine.setAttribute('aria-hidden', showReelingMachine ? 'false' : 'true');
    };

    const waitForImage = async (image) => {
      if (image.complete && image.naturalWidth) return;
      try {
        await image.decode();
      } catch {
        await new Promise((resolve) => image.addEventListener('load', resolve, { once: true }));
      }
    };

    const prepareParticleCanvas = () => {
      const bounds = heroParticleCanvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      heroParticleCanvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      heroParticleCanvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      const context = heroParticleCanvas.getContext('2d');
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      context.imageSmoothingEnabled = true;
      return { context, bounds };
    };

    const sampleMachineParticles = (image, canvasBounds, direction, converging) => {
      const imageBounds = image.getBoundingClientRect();
      const width = Math.max(1, Math.round(imageBounds.width));
      const height = Math.max(1, Math.round(imageBounds.height));
      const sampleSize = 6;
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = width;
      sourceCanvas.height = height;
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
      sourceContext.drawImage(image, 0, 0, width, height);
      const pixels = sourceContext.getImageData(0, 0, width, height).data;
      const particles = [];
      const originX = imageBounds.left - canvasBounds.left;
      const originY = imageBounds.top - canvasBounds.top;

      for (let blockY = 0; blockY < height; blockY += sampleSize) {
        for (let blockX = 0; blockX < width; blockX += sampleSize) {
          let selectedIndex = -1;
          let selectedAlpha = 0;
          const maxY = Math.min(height, blockY + sampleSize);
          const maxX = Math.min(width, blockX + sampleSize);

          for (let y = blockY; y < maxY; y += 1) {
            for (let x = blockX; x < maxX; x += 1) {
              const index = (y * width + x) * 4;
              if (pixels[index + 3] > selectedAlpha) {
                selectedAlpha = pixels[index + 3];
                selectedIndex = index;
              }
            }
          }

          if (selectedIndex < 0 || selectedAlpha < 44) continue;

          const centerX = blockX + sampleSize / 2;
          const centerY = blockY + sampleSize / 2;
          const angle = Math.random() * Math.PI * 2;
          const distance = 54 + Math.random() * 146;
          const directionalDrift = direction * (24 + Math.random() * 54);
          const scatterX = Math.cos(angle) * distance + directionalDrift;
          const scatterY = Math.sin(angle) * distance * .72;
          const red = pixels[selectedIndex];
          const green = pixels[selectedIndex + 1];
          const blue = pixels[selectedIndex + 2];

          particles.push({
            x: originX + centerX,
            y: originY + centerY,
            dx: scatterX,
            dy: scatterY,
            alpha: selectedAlpha / 255,
            color: `rgb(${red} ${green} ${blue})`,
            size: sampleSize * (.74 + Math.random() * .42),
            delay: converging ? Math.random() * .14 : 0
          });
        }
      }

      return particles;
    };

    const drawParticleSet = (context, particles, progress, converging) => {
      particles.forEach((particle) => {
        const localProgress = converging
          ? clampParticle((progress - particle.delay) / (1 - particle.delay))
          : progress;
        const eased = converging
          ? 1 - Math.pow(1 - localProgress, 3)
          : Math.pow(localProgress, 2);
        const travel = converging ? 1 - eased : eased;
        const alpha = particle.alpha * (converging ? eased : 1 - eased);
        if (alpha <= .012) return;

        const size = particle.size * (converging ? .7 + eased * .3 : 1 - eased * .32);
        context.globalAlpha = alpha;
        context.fillStyle = particle.color;
        context.fillRect(
          particle.x + particle.dx * travel - size / 2,
          particle.y + particle.dy * travel - size / 2,
          size,
          size
        );
      });
      context.globalAlpha = 1;
    };

    const animateMachineParticles = async (machine, direction) => {
      if (machine === activeMachine || machineAnimating) return;
      machineAnimating = true;
      const sourceImage = activeMachine === 'reeling' ? heroReelingMachine : heroLoom;
      const targetImage = machine === 'reeling' ? heroReelingMachine : heroLoom;

      await Promise.all([waitForImage(sourceImage), waitForImage(targetImage)]);

      if (reducedMotion.matches) {
        setMachineState(machine);
        machineAnimating = false;
        return;
      }

      const { context, bounds } = prepareParticleCanvas();
      const sourceParticles = sampleMachineParticles(sourceImage, bounds, direction, false);
      const targetParticles = sampleMachineParticles(targetImage, bounds, -direction, true);
      setMachineState(machine);
      hero.classList.add('machine-particle-active');

      await new Promise((resolve) => {
        const startTime = performance.now();
        const paintFrame = (now) => {
          const progress = clampParticle((now - startTime) / particleDuration);
          const sourceProgress = clampParticle(progress / .56);
          const targetProgress = clampParticle((progress - .4) / .6);
          context.clearRect(0, 0, bounds.width, bounds.height);
          drawParticleSet(context, sourceParticles, sourceProgress, false);
          drawParticleSet(context, targetParticles, targetProgress, true);

          if (progress < 1) {
            window.requestAnimationFrame(paintFrame);
          } else {
            resolve();
          }
        };
        window.requestAnimationFrame(paintFrame);
      });

      targetImage.style.transition = 'none';
      hero.classList.remove('machine-particle-active');
      context.clearRect(0, 0, bounds.width, bounds.height);
      targetImage.getBoundingClientRect();
      window.requestAnimationFrame(() => targetImage.style.removeProperty('transition'));
      machineAnimating = false;

      if (queuedMachine && queuedMachine !== activeMachine) {
        const nextMachine = queuedMachine;
        queuedMachine = null;
        animateMachineParticles(nextMachine, nextMachine === 'reeling' ? -1 : 1);
      } else {
        queuedMachine = null;
      }
    };

    const showHeroMachine = (machine) => {
      if (machineAnimating) {
        queuedMachine = machine;
        return;
      }
      if (machine === activeMachine) return;
      animateMachineParticles(machine, machine === 'reeling' ? -1 : 1);
    };

    const beginMachineGesture = (event) => {
      previousPointerX = event.clientX;
      horizontalTravel = 0;
    };

    hero.addEventListener('pointerenter', beginMachineGesture);
    hero.addEventListener('pointerdown', (event) => {
      beginMachineGesture(event);
      if (event.pointerType === 'touch') hero.setPointerCapture?.(event.pointerId);
    });

    hero.addEventListener('pointermove', (event) => {
      if (previousPointerX === null) {
        previousPointerX = event.clientX;
        return;
      }

      const deltaX = event.clientX - previousPointerX;
      previousPointerX = event.clientX;
      if (deltaX === 0) return;

      if (horizontalTravel !== 0 && Math.sign(deltaX) !== Math.sign(horizontalTravel)) {
        horizontalTravel = deltaX;
      } else {
        horizontalTravel += deltaX;
      }

      if (horizontalTravel <= -switchDistance) {
        showHeroMachine('reeling');
        horizontalTravel = 0;
      } else if (horizontalTravel >= switchDistance) {
        showHeroMachine('loom');
        horizontalTravel = 0;
      }
    });

    hero.addEventListener('pointerleave', () => {
      previousPointerX = null;
      horizontalTravel = 0;
    });
    hero.addEventListener('pointerup', () => {
      previousPointerX = null;
      horizontalTravel = 0;
    });
    hero.addEventListener('pointercancel', () => {
      previousPointerX = null;
      horizontalTravel = 0;
    });
  }

  if (!weaving || !machineList) return;
  let frame = 0;
  let updateFlowStages = () => {};

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const mobileTools = window.matchMedia('(max-width: 767px)');
  let mobileToolsOffset = 0;
  let mobileToolsLastFrame = performance.now();

  const animateMobileTools = (now) => {
    if (mobileTools.matches && !reducedMotion.matches && toolsViewport && toolsRail && originalTools.length) {
      const viewportBounds = toolsViewport.getBoundingClientRect();
      const visible = viewportBounds.bottom > 0 && viewportBounds.top < window.innerHeight;
      const loopAnchor = tools[originalTools.length];
      const cycleDistance = loopAnchor
        ? loopAnchor.offsetLeft - originalTools[0].offsetLeft
        : 0;

      if (visible && cycleDistance > 0) {
        const elapsed = Math.min(64, Math.max(0, now - mobileToolsLastFrame));
        mobileToolsOffset = (mobileToolsOffset + elapsed * .024) % cycleDistance;
        toolsRail.style.setProperty('--tools-track-x', `${(-mobileToolsOffset).toFixed(2)}px`);
      }
    }

    mobileToolsLastFrame = now;
    window.requestAnimationFrame(animateMobileTools);
  };
  window.requestAnimationFrame(animateMobileTools);

  const updateBackgroundWidth = () => {
    const viewportWidth = document.documentElement.clientWidth;
    const collapsedWidth = Math.min(1200, viewportWidth);
    const expandedWidth = viewportWidth;

    if (reducedMotion.matches || expandedWidth <= collapsedWidth) {
      weaving.style.setProperty('--tools-bg-width', `${collapsedWidth}px`);
      return;
    }

    const listTop = machineList.getBoundingClientRect().top;
    const startLine = window.innerHeight * 0.82;
    const endLine = window.innerHeight * 0.25;
    const rawProgress = clamp(
      (startLine - listTop) / (startLine - endLine),
      0,
      1
    );
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const width = collapsedWidth + (expandedWidth - collapsedWidth) * progress;

    weaving.style.setProperty('--tools-bg-width', `${width.toFixed(2)}px`);
  };

  const updateToolsScroll = () => {
    if (!toolsStage || !toolsViewport || !toolsRail || !tools.length) return;
    if (mobileTools.matches) return;

    const stageTop = toolsStage.getBoundingClientRect().top;
    const stickyTop = Math.max(0, (window.innerHeight - toolsViewport.offsetHeight) / 2);
    const scrollRange = toolsStage.offsetHeight - toolsViewport.offsetHeight;
    const progress = reducedMotion.matches
      ? 0
      : clamp((stickyTop - stageTop) / scrollRange, 0, 1);
    const viewportWidth = document.documentElement.clientWidth;
    const viewportCenter = viewportWidth / 2;
    const loopAnchor = tools[originalTools.length];
    const cycleDistance = loopAnchor
      ? loopAnchor.getBoundingClientRect().left - originalTools[0].getBoundingClientRect().left
      : 0;
    const translate = cycleDistance * progress;

    selectProcessView(progress >= 0.995 ? 'process' : 'tools');

    toolsRail.style.setProperty('--tools-track-x', `${(-translate).toFixed(2)}px`);

    tools.forEach((tool) => {
      const initialCenter = toolsRail.offsetLeft + tool.offsetLeft + tool.offsetWidth / 2;
      const crossingProgress = cycleDistance > 0
        ? clamp((initialCenter - viewportCenter) / cycleDistance, 0, 1)
        : 0;
      const revealStart = Math.max(0, crossingProgress - 0.085);
      const focus = clamp((progress - revealStart) / 0.085, 0, 1);
      const label = tool.querySelector('strong');
      const red = Math.round(169 + (194 - 169) * focus);
      const green = Math.round(102 + (58 - 102) * focus);
      const blue = Math.round(92 + (38 - 92) * focus);

      label.style.setProperty('--label-focus', focus.toFixed(3));
      label.style.setProperty('--brush-hidden', `${((1 - focus) * 100).toFixed(2)}%`);
      label.style.color = `rgb(${red}, ${green}, ${blue})`;
    });
  };

  const updatePatternRails = () => {
    if (!patterns) return;

    const viewportWidth = document.documentElement.clientWidth;
    const contentWidth = Math.min(1440, viewportWidth);

    if (reducedMotion.matches || viewportWidth <= contentWidth) {
      patterns.style.setProperty('--pattern-rail-spread', '0px');
      return;
    }

    const patternTitle = patterns.querySelector('#pattern-title');
    const titleRect = patternTitle?.getBoundingClientRect();
    const titleCenter = titleRect
      ? titleRect.top + titleRect.height / 2
      : patterns.getBoundingClientRect().top;
    const startLine = window.innerHeight * 0.5;
    // The side rails begin after the heading crosses the viewport center and
    // finish while the heading is still clearly visible in the upper field.
    const revealDistance = window.innerHeight * 0.22;
    const rawProgress = clamp(
      (startLine - titleCenter) / revealDistance,
      0,
      1
    );
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const spread = (viewportWidth - contentWidth) * progress;

    patterns.style.setProperty('--pattern-rail-spread', `${spread.toFixed(2)}px`);
  };

  const updateFooterBackgroundWidth = () => {
    if (!footerDiscovery) return;

    const viewportWidth = document.documentElement.clientWidth;
    const collapsedWidth = viewportWidth * 0.84;
    const expandedWidth = viewportWidth;

    if (reducedMotion.matches || expandedWidth <= collapsedWidth) {
      footerDiscovery.parentElement.style.setProperty('--footer-bg-width', `${expandedWidth}px`);
      return;
    }

    const footerTop = footerDiscovery.getBoundingClientRect().top;
    const startLine = window.innerHeight * 0.92;
    const endLine = window.innerHeight * 0.3;
    const rawProgress = clamp(
      (startLine - footerTop) / (startLine - endLine),
      0,
      1
    );
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const width = collapsedWidth + (expandedWidth - collapsedWidth) * progress;

    footerDiscovery.parentElement.style.setProperty('--footer-bg-width', `${width.toFixed(2)}px`);
  };

  const updateInteractions = () => {
    frame = 0;
    updateBackgroundWidth();
    updateToolsScroll();
    updatePatternRails();
    updateFooterBackgroundWidth();
    updateFlowStages();
  };

  const requestUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(updateInteractions);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reducedMotion.addEventListener?.('change', requestUpdate);

  const selectProcessView = (view) => {
    processButtons.forEach((button) => {
      const selected = button.dataset.processView === view;
      button.classList.toggle('selected', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
  };

  const scrollToView = (target) => {
    const top = target.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({
      top,
      behavior: reducedMotion.matches ? 'auto' : 'smooth'
    });
  };

  processButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const view = button.dataset.processView;
      selectProcessView(view);

      if (view === 'process' && processSummary) {
        scrollToView(processSummary);
      } else if (view === 'tools') {
        scrollToView(machineList);
      }
    });
  });

  const patternSelectors = [
    '.node-pattern-design', '.pattern-design-image', '.later-line-design',
    '.point-paper-figure', '.node-point-paper', '.later-line-point',
    '.node-foot-cord', '.foot-cord-image', '.later-line-foot',
    '.separation-figure', '.node-separation', '.later-line-separation',
    '.node-harness-making', '.harness-making-figure', '.later-line-making',
    '.harness-threading-figure', '.node-harness-threading', '.later-line-threading'
  ];
  const weavingSelectors = [
    '.drawboy-figure', '.node-drawboy', '.later-line-drawboy',
    '.weaver-figure', '.node-weaver'
  ];
  const collectItems = (root, selectors) => selectors
    .map((selector) => root?.querySelector(selector))
    .filter(Boolean);

  const flowStages = {
    preparation: {
      button: preparationStage,
      items: preparationFlow ? [...preparationFlow.children] : [],
      maxExpansion: 2684,
      scrollRange: 4200,
      duration: 6000,
      minTop: 0,
      contentRange: preparationFlow?.offsetHeight || 2835,
      active: false,
      closing: false,
      suppressHover: false,
      progress: 0,
      startScroll: 0,
      startTime: 0,
      closeStartTime: 0,
      closeStartProgress: 0,
      closeDuration: 0
    },
    pattern: {
      button: patternStage,
      items: collectItems(patternWeavingFlow, patternSelectors),
      maxExpansion: 1204,
      scrollRange: 2100,
      duration: 4500,
      minTop: 0,
      contentRange: 1250,
      active: false,
      closing: false,
      suppressHover: false,
      progress: 0,
      startScroll: 0,
      startTime: 0,
      closeStartTime: 0,
      closeStartProgress: 0,
      closeDuration: 0
    },
    weaving: {
      button: weavingStage,
      items: collectItems(weavingFlow, weavingSelectors),
      maxExpansion: 359,
      scrollRange: 900,
      duration: 3000,
      minTop: 1060,
      contentRange: 650,
      active: false,
      closing: false,
      suppressHover: false,
      progress: 0,
      startScroll: 0,
      startTime: 0,
      closeStartTime: 0,
      closeStartProgress: 0,
      closeDuration: 0
    }
  };

  const find = (selector, root = document) => root?.querySelector(selector) || null;
  const existing = (...elements) => elements.flat().filter(Boolean);
  const splitVisualParts = (visuals) => {
    const texts = [];
    const images = [];

    existing(visuals).forEach((visual) => {
      const caption = [...visual.children].find((child) => child.matches('figcaption'));
      const media = [...visual.children].filter((child) => child.matches('.flow-media,.later-image,.reed-images,.beam-images'));

      if (caption) {
        visual.style.opacity = '1';
        visual.style.transform = 'none';
        texts.push(caption);
        images.push(...media);
      } else {
        images.push(visual);
      }
    });

    return { texts, images };
  };

  const flowStep = (connector, node, visuals = [], nodeExtras = []) => {
    const nodeIsContainer = node?.matches('.flow-node,.later-node');
    const nodeBox = nodeIsContainer ? find('span', node) : node;
    const nodeChildren = nodeIsContainer ? [...node.children] : [];
    const nodeBoxIndex = nodeChildren.indexOf(nodeBox);
    const dashes = existing(
      nodeIsContainer
        ? nodeChildren.filter((child) => child.matches('i')).map((element, index) => ({
          element,
          origin: nodeChildren.indexOf(element) < nodeBoxIndex ? 'right center' : 'left center',
          order: index
        }))
        : [],
      existing(nodeExtras).map((element, index) => ({ element, origin: 'right center', order: index }))
    );
    const visualParts = splitVisualParts(visuals);

    return {
      connector,
      nodeBox,
      dashes,
      texts: visualParts.texts,
      images: visualParts.images
    };
  };

  flowStages.preparation.steps = [
    flowStep(preparationStage?.nextElementSibling, find('.node-dye', preparationFlow), [find('.dye-materials', preparationFlow), find('.dye-figure', preparationFlow)]),
    flowStep(find('.line-dye', preparationFlow), find('.shade-row b', preparationFlow), [find('.shade-row .flow-media', preparationFlow)], [find('.shade-row .dotted', preparationFlow)]),
    flowStep(find('.line-shade', preparationFlow), find('.node-cone', preparationFlow), [find('.cone-figure', preparationFlow)]),
    flowStep(find('.line-cone', preparationFlow), find('.node-thread', preparationFlow), [find('.thread-figure', preparationFlow), find('.warp-figure', preparationFlow)]),
    flowStep(find('.line-thread', preparationFlow), find('.node-lease', preparationFlow), [find('.lease-figure', preparationFlow)]),
    flowStep(find('.line-lease', preparationFlow), find('.node-reed', preparationFlow), [find('.reed-figure', preparationFlow)]),
    flowStep(find('.line-reed', preparationFlow), find('.node-beam', preparationFlow), [find('.warp-beam-left', preparationFlow), find('.beam-figure', preparationFlow)]),
    flowStep(find('.line-beam', preparationFlow), find('.node-harness', preparationFlow), [find('.harness-figure', preparationFlow)]),
    flowStep(find('.line-harness', preparationFlow), find('.node-bobbin', preparationFlow), [find('.bobbin-figure', preparationFlow)]),
    flowStep(find('.line-bobbin', preparationFlow), find('.node-shuttle', preparationFlow), [find('.shuttle-figure', preparationFlow)]),
    flowStep(find('.line-shuttle', preparationFlow), null)
  ];

  flowStages.pattern.steps = [
    flowStep(patternStage?.nextElementSibling, find('.node-pattern-design', patternWeavingFlow), [find('.pattern-design-image', patternWeavingFlow)]),
    flowStep(find('.later-line-design', patternWeavingFlow), find('.node-point-paper', patternWeavingFlow), [find('.point-paper-figure', patternWeavingFlow)]),
    flowStep(find('.later-line-point', patternWeavingFlow), find('.node-foot-cord', patternWeavingFlow), [find('.foot-cord-image', patternWeavingFlow)]),
    flowStep(find('.later-line-foot', patternWeavingFlow), find('.node-separation', patternWeavingFlow), [find('.separation-figure', patternWeavingFlow)]),
    flowStep(find('.later-line-separation', patternWeavingFlow), find('.node-harness-making', patternWeavingFlow), [find('.harness-making-figure', patternWeavingFlow)]),
    flowStep(find('.later-line-making', patternWeavingFlow), find('.node-harness-threading', patternWeavingFlow), [find('.harness-threading-figure', patternWeavingFlow)]),
    flowStep(find('.later-line-threading', patternWeavingFlow), null)
  ];

  flowStages.weaving.steps = [
    flowStep(find('.weaving-flow-lead', weavingFlow), find('.node-drawboy', weavingFlow), [find('.drawboy-figure', weavingFlow)]),
    flowStep(find('.later-line-drawboy', weavingFlow), find('.node-weaver', weavingFlow), [find('.weaver-figure', weavingFlow)])
  ];

  const phaseProgress = (timeline, start, duration) => clamp((timeline - start) / duration, 0, 1);
  const smoothProgress = (progress) => progress * progress * (3 - 2 * progress);

  const renderConnector = (connector, progress) => {
    if (!connector) return;
    const eased = smoothProgress(progress);
    connector.style.opacity = progress > 0 ? '1' : '0';
    connector.style.transformOrigin = 'top center';
    connector.style.transform = `scaleY(${eased.toFixed(3)})`;
  };

  const renderNode = (element, progress) => {
    if (!element) return;
    const eased = smoothProgress(progress);
    element.style.opacity = eased.toFixed(3);
    element.style.transformOrigin = 'center';
    element.style.transform = `translate3d(0, ${((1 - eased) * 8).toFixed(2)}px, 0) scale(${(0.94 + eased * 0.06).toFixed(3)})`;
  };

  const renderDash = (dash, progress) => {
    if (!dash?.element) return;
    const eased = smoothProgress(progress);
    dash.element.style.opacity = progress > 0 ? '1' : '0';
    dash.element.style.transformOrigin = dash.origin;
    dash.element.style.transform = `scaleX(${eased.toFixed(3)})`;
  };

  const renderVisual = (element, progress, distance = 20) => {
    if (!element) return;
    const eased = smoothProgress(progress);
    element.style.opacity = eased.toFixed(3);
    element.style.transform = `translate3d(0, ${((1 - eased) * distance).toFixed(2)}px, 0)`;
  };

  const renderStageItems = (stage) => {
    const steps = stage.steps || [];
    const weights = steps.map((step) => ({
      line: step.connector ? clamp((step.connector.offsetHeight || 96) / 180, 0.55, 1.4) : 0,
      node: step.nodeBox ? 0.34 : 0,
      dashes: step.dashes.length ? 0.32 : 0,
      texts: step.texts.length ? 0.45 : 0,
      images: step.images.length ? 0.65 : 0
    }));
    const totalWeight = weights.reduce(
      (total, weight) => total + weight.line + weight.node + weight.dashes + weight.texts + weight.images,
      0
    ) || 1;
    const timeline = stage.progress * totalWeight;
    let cursor = 0;

    steps.forEach((step, index) => {
      const weight = weights[index];
      const lineProgress = weight.line ? phaseProgress(timeline, cursor, weight.line) : 1;
      renderConnector(step.connector, lineProgress);
      cursor += weight.line;

      const nodeProgress = weight.node ? phaseProgress(timeline, cursor, weight.node) : 1;
      renderNode(step.nodeBox, nodeProgress);
      cursor += weight.node;

      const dashProgress = weight.dashes ? phaseProgress(timeline, cursor, weight.dashes) : 1;
      step.dashes.forEach((dash) => renderDash(dash, dashProgress));
      cursor += weight.dashes;

      const textProgress = weight.texts ? phaseProgress(timeline, cursor, weight.texts) : 1;
      step.texts.forEach((element) => renderVisual(element, textProgress, 10));
      cursor += weight.texts;

      const imageProgress = weight.images ? phaseProgress(timeline, cursor, weight.images) : 1;
      step.images.forEach((element) => renderVisual(element, imageProgress));
      cursor += weight.images;
    });
  };

  const syncFlowControls = () => {
    const stages = Object.values(flowStages);

    stages.forEach((stage) => {
      stage.button?.classList.toggle('active', stage.active);
      stage.button?.classList.toggle('suppress-hover', stage.suppressHover);
      stage.button?.setAttribute('aria-expanded', String(stage.active));
    });

    preparationFlow?.setAttribute(
      'aria-hidden',
      String(!flowStages.preparation.active && !flowStages.preparation.closing)
    );
    patternWeavingFlow?.setAttribute(
      'aria-hidden',
      String(!flowStages.pattern.active && !flowStages.pattern.closing)
    );
    weavingFlow?.setAttribute(
      'aria-hidden',
      String(!flowStages.weaving.active && !flowStages.weaving.closing)
    );
  };

  const flowScrollSpeed = 1.15;
  let previousFlowState = '';

  const updateResponsiveFlowMetrics = () => {
    const mobile = window.innerWidth <= 767;
    if (!mobile) {
      flowStages.preparation.maxExpansion = 2684;
      flowStages.pattern.maxExpansion = 1204;
      flowStages.weaving.maxExpansion = 359;
      return false;
    }

    const preparationScale = clamp((window.innerWidth - 16) / 1252, 0.235, 0.6);
    const laterScale = clamp((window.innerWidth - 16) / 1091, 0.27, 0.68);
    document.documentElement.style.setProperty('--mobile-preparation-scale', preparationScale.toFixed(4));
    document.documentElement.style.setProperty('--mobile-later-flow-scale', laterScale.toFixed(4));
    document.documentElement.style.setProperty('--mobile-preparation-line-width', `${(2 / preparationScale).toFixed(3)}px`);
    document.documentElement.style.setProperty('--mobile-pattern-lead-height', `${(65 * laterScale).toFixed(2)}px`);
    document.documentElement.style.setProperty('--mobile-later-line-width', `${(2 / laterScale).toFixed(3)}px`);
    const laterGap = 16 / laterScale;
    const patternFinalLineTop = 1169 + laterGap;
    const patternFinalLineEnd = 1250 + 116 / laterScale;
    const weavingSecondLineTop = 153 + laterGap;
    document.documentElement.style.setProperty('--mobile-pattern-final-line-top', `${patternFinalLineTop.toFixed(2)}px`);
    document.documentElement.style.setProperty('--mobile-pattern-final-line-height', `${Math.max(0, patternFinalLineEnd - patternFinalLineTop).toFixed(2)}px`);
    document.documentElement.style.setProperty('--mobile-weaving-lead-height', `${Math.max(0, 116 - laterGap).toFixed(2)}px`);
    document.documentElement.style.setProperty('--mobile-weaving-second-line-top', `${weavingSecondLineTop.toFixed(2)}px`);
    document.documentElement.style.setProperty('--mobile-weaving-second-line-height', `${Math.max(0, 573 - laterGap - weavingSecondLineTop).toFixed(2)}px`);

    flowStages.preparation.maxExpansion = Math.round(2835 * preparationScale + 24);
    flowStages.pattern.maxExpansion = Math.round(1250 * laterScale + 24);
    flowStages.weaving.maxExpansion = Math.round(650 * laterScale + 24);
    return true;
  };

  updateFlowStages = () => {
    if (!processSummary) return;

    const mobileFlowLayout = updateResponsiveFlowMetrics();

    const summaryTop = processSummary.getBoundingClientRect().top + window.scrollY;
    const viewportCenter = window.scrollY + window.innerHeight / 2;
    const stageSequence = mobileFlowLayout
      ? [
        { stage: flowStages.preparation, baseCenter: 166 },
        { stage: flowStages.pattern, baseCenter: 346 },
        { stage: flowStages.weaving, baseCenter: 526 }
      ]
      : [
        { stage: flowStages.preparation, baseCenter: 162 },
        { stage: flowStages.pattern, baseCenter: 458 },
        { stage: flowStages.weaving, baseCenter: 650 }
      ];
    let precedingExpansion = 0;

    stageSequence.forEach(({ stage, baseCenter }) => {
      const stageCenter = summaryTop + baseCenter + precedingExpansion;
      const revealDistance = Math.max(0, (viewportCenter - stageCenter) * flowScrollSpeed);
      stage.progress = reducedMotion.matches
        ? (revealDistance > 0 ? 1 : 0)
        : clamp(revealDistance / stage.maxExpansion, 0, 1);
      stage.active = stage.progress > 0.001;
      stage.closing = false;
      stage.suppressHover = false;
      stage.layoutProgress = stage === flowStages.pattern
        ? 1 - Math.pow(1 - stage.progress, 2)
        : stage.progress;
      precedingExpansion += stage.maxExpansion * stage.layoutProgress;
    });

    const preparationExpansion = flowStages.preparation.maxExpansion * flowStages.preparation.layoutProgress;
    const patternExpansion = flowStages.pattern.maxExpansion * flowStages.pattern.layoutProgress;
    const weavingExpansion = flowStages.weaving.maxExpansion * flowStages.weaving.layoutProgress;

    document.documentElement.style.setProperty('--preparation-expansion', `${preparationExpansion.toFixed(2)}px`);
    document.documentElement.style.setProperty('--pattern-flow-expansion', `${patternExpansion.toFixed(2)}px`);
    document.documentElement.style.setProperty('--weaving-flow-expansion', `${weavingExpansion.toFixed(2)}px`);

    if (preparationFlow) {
      const preparationVisible = flowStages.preparation.active || flowStages.preparation.closing;
      preparationFlow.style.visibility = preparationVisible ? 'visible' : 'hidden';
      preparationFlow.style.pointerEvents = flowStages.preparation.active ? 'auto' : 'none';
      preparationFlow.style.opacity = preparationVisible ? '1' : '0';
      preparationFlow.style.clipPath = `inset(0 0 ${((1 - flowStages.preparation.progress) * 100).toFixed(2)}% 0)`;
    }

    if (patternWeavingFlow) {
      const laterFlowActive = flowStages.pattern.active || flowStages.pattern.closing;
      patternWeavingFlow.style.visibility = laterFlowActive ? 'visible' : 'hidden';
      patternWeavingFlow.style.pointerEvents = laterFlowActive ? 'auto' : 'none';
      patternWeavingFlow.style.opacity = laterFlowActive ? '1' : '0';
    }

    if (weavingFlow) {
      const weavingFlowActive = flowStages.weaving.active || flowStages.weaving.closing;
      weavingFlow.style.visibility = weavingFlowActive ? 'visible' : 'hidden';
      weavingFlow.style.pointerEvents = weavingFlowActive ? 'auto' : 'none';
      weavingFlow.style.opacity = weavingFlowActive ? '1' : '0';
    }

    renderStageItems(flowStages.preparation);
    renderStageItems(flowStages.pattern);
    renderStageItems(flowStages.weaving);

    const flowState = Object.values(flowStages)
      .map((stage) => `${stage.active}:${stage.progress.toFixed(3)}`)
      .join('|');
    if (flowState !== previousFlowState) {
      previousFlowState = flowState;
      syncFlowControls();
    }
  };

  Object.values(flowStages).forEach((stage) => {
    if (!stage.button) return;
    stage.button.classList.add('scroll-driven');
    stage.button.setAttribute('aria-disabled', 'true');
  });
  syncFlowControls();

  if (patternRails.length) {
    const baseSpeed = 72;
    let marqueeFrame = 0;

    const wrapMarqueeOffset = (state) => {
      const width = state.sequence.offsetWidth;
      state.offset = ((state.offset % width) + width) % width - width;
    };

    const paintMarquee = (state) => {
      state.track.style.setProperty('--rail-x', `${state.offset.toFixed(2)}px`);
    };

    const marquees = patternRails.map((rail) => {
      const track = rail.querySelector('.rail-track');
      const sequence = track?.querySelector('.rail-sequence');
      const dragSurface = rail.querySelector('.rail-window');
      const direction = rail.dataset.marqueeDirection === 'right' ? 1 : -1;

      if (!track || !sequence || !dragSurface) return null;

      const duplicate = sequence.cloneNode(true);
      duplicate.setAttribute('aria-hidden', 'true');
      track.appendChild(duplicate);

      const width = sequence.offsetWidth;
      const state = {
        rail,
        track,
        sequence,
        dragSurface,
        direction,
        offset: direction > 0 ? -width : 0,
        dragging: false,
        pointerId: null,
        pointerX: 0,
        lastTime: 0
      };

      track.style.setProperty('--rail-x', `${state.offset}px`);
      return state;
    }).filter(Boolean);

    const animateMarquees = (now) => {
      marqueeFrame = 0;
      let shouldContinue = false;

      marquees.forEach((state) => {
        if (reducedMotion.matches) {
          state.lastTime = 0;
          return;
        }

        shouldContinue = true;
        if (!state.lastTime) state.lastTime = now;
        const elapsed = Math.min(40, now - state.lastTime);
        if (!state.dragging) {
          state.offset += state.direction * baseSpeed * elapsed / 1000;
          wrapMarqueeOffset(state);
          paintMarquee(state);
        }
        state.lastTime = now;
      });

      if (shouldContinue) marqueeFrame = window.requestAnimationFrame(animateMarquees);
    };

    const requestMarqueeFrame = () => {
      if (!marqueeFrame && !reducedMotion.matches) {
        marqueeFrame = window.requestAnimationFrame(animateMarquees);
      }
    };

    marquees.forEach((state) => {
      const stopDragging = (event) => {
        if (!state.dragging || event.pointerId !== state.pointerId) return;
        state.dragging = false;
        state.pointerId = null;
        state.lastTime = 0;
        state.dragSurface.classList.remove('dragging');
        if (state.dragSurface.hasPointerCapture(event.pointerId)) {
          state.dragSurface.releasePointerCapture(event.pointerId);
        }
      };

      state.dragSurface.addEventListener('pointerdown', (event) => {
        if (event.button !== 0) return;
        state.dragging = true;
        state.pointerId = event.pointerId;
        state.pointerX = event.clientX;
        state.lastTime = 0;
        state.dragSurface.classList.add('dragging');
        state.dragSurface.setPointerCapture(event.pointerId);
        event.preventDefault();
      });
      state.dragSurface.addEventListener('pointermove', (event) => {
        if (!state.dragging || event.pointerId !== state.pointerId) return;
        state.offset += event.clientX - state.pointerX;
        state.pointerX = event.clientX;
        wrapMarqueeOffset(state);
        paintMarquee(state);
      });
      state.dragSurface.addEventListener('pointerup', stopDragging);
      state.dragSurface.addEventListener('pointercancel', stopDragging);
    });

    requestMarqueeFrame();
  }

  updateInteractions();
})();
