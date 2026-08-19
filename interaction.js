(() => {
  const weaving = document.querySelector('.weaving');
  const machineList = document.querySelector('.machine-list');
  const processSummary = document.querySelector('.process-summary');
  const processButtons = [...document.querySelectorAll('[data-process-view]')];
  const toolsStage = document.querySelector('.tools-scroll-stage');
  const toolsViewport = document.querySelector('.tools-viewport');
  const toolsRail = document.querySelector('.tools-rail');
  const tools = [...document.querySelectorAll('.tools-rail .tool')];
  const flowToggle = document.querySelector('.flow-toggle');
  const preparationStage = document.querySelector('.preparation-stage');
  const patternStage = document.querySelector('.pattern-stage-label');
  const weavingStage = document.querySelector('.weaving-stage-label');
  const preparationFlow = document.querySelector('.preparation-flow');
  const patternWeavingFlow = document.querySelector('.pattern-weaving-flow');
  const patterns = document.querySelector('.patterns');
  const patternRails = [...document.querySelectorAll('.pattern-rail[data-marquee-direction]')];

  if (!weaving || !machineList) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;
  let updateFlowStages = () => {};

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

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

    const stageTop = toolsStage.getBoundingClientRect().top;
    const stickyTop = Math.max(0, (window.innerHeight - toolsViewport.offsetHeight) / 2);
    const scrollRange = toolsStage.offsetHeight - toolsViewport.offsetHeight;
    const progress = reducedMotion.matches
      ? 0
      : clamp((stickyTop - stageTop) / scrollRange, 0, 1);
    const lastTool = tools.at(-1);
    const viewportWidth = document.documentElement.clientWidth;
    const viewportCenter = viewportWidth / 2;
    const lastToolRight = toolsRail.offsetLeft + lastTool.offsetLeft + lastTool.offsetWidth;
    const maxTranslate = Math.max(0, lastToolRight - (viewportWidth - 128));
    const translate = maxTranslate * progress;

    selectProcessView(progress >= 0.995 ? 'process' : 'tools');

    toolsRail.style.setProperty('--tools-track-x', `${(-translate).toFixed(2)}px`);

    tools.forEach((tool) => {
      const initialCenter = toolsRail.offsetLeft + tool.offsetLeft + tool.offsetWidth / 2;
      const crossingProgress = maxTranslate > 0
        ? clamp((initialCenter - viewportCenter) / maxTranslate, 0, 1)
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
    const revealDistance = window.innerHeight * 0.4;
    const rawProgress = clamp(
      (startLine - titleCenter) / revealDistance,
      0,
      1
    );
    const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const spread = (viewportWidth - contentWidth) * progress;

    patterns.style.setProperty('--pattern-rail-spread', `${spread.toFixed(2)}px`);
  };

  const updateInteractions = () => {
    frame = 0;
    updateBackgroundWidth();
    updateToolsScroll();
    updatePatternRails();
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
      items: collectItems(patternWeavingFlow, weavingSelectors),
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

  const isLineItem = (item) => item.classList.contains('flow-main-line')
    || item.classList.contains('later-main-line');

  const renderStageItems = (stage, verticalOffset = 0) => {
    stage.items.forEach((item) => {
      const itemTop = Math.max(0, item.offsetTop - stage.minTop);
      const threshold = clamp((itemTop / stage.contentRange) * 0.84, 0, 0.84);
      const itemProgress = (stage.active || stage.closing)
        ? clamp((stage.progress - threshold) / 0.16, 0, 1)
        : 0;

      item.style.opacity = itemProgress.toFixed(3);
      item.style.transformOrigin = 'top center';

      if (isLineItem(item)) {
        item.style.transform = `translate3d(0, ${verticalOffset.toFixed(2)}px, 0) scaleY(${itemProgress.toFixed(3)})`;
      } else {
        const revealOffset = (1 - itemProgress) * 20;
        item.style.transform = `translate3d(0, ${(verticalOffset + revealOffset).toFixed(2)}px, 0)`;
      }
    });
  };

  const syncFlowControls = () => {
    const stages = Object.values(flowStages);
    const hasVisibleStage = stages.some((stage) => stage.active || stage.closing);

    stages.forEach((stage) => {
      stage.button?.classList.toggle('active', stage.active);
      stage.button?.classList.toggle('suppress-hover', stage.suppressHover);
      stage.button?.setAttribute('aria-expanded', String(stage.active));
    });

    document.documentElement.classList.toggle('flow-collapsed', !hasVisibleStage);
    preparationFlow?.setAttribute(
      'aria-hidden',
      String(!flowStages.preparation.active && !flowStages.preparation.closing)
    );
    patternWeavingFlow?.setAttribute(
      'aria-hidden',
      String(
        !flowStages.pattern.active
        && !flowStages.pattern.closing
        && !flowStages.weaving.active
        && !flowStages.weaving.closing
      )
    );
    flowToggle?.setAttribute('aria-expanded', String(hasVisibleStage));

    const toggleLabel = flowToggle?.querySelector('span');
    if (toggleLabel) toggleLabel.textContent = hasVisibleStage ? '收起' : '展开';
  };

  updateFlowStages = () => {
    const scrollY = window.scrollY;
    const now = performance.now();
    let hasRunningStage = false;
    let flowStateChanged = false;

    Object.values(flowStages).forEach((stage) => {
      if (stage.closing) {
        const closeProgress = reducedMotion.matches
          ? 1
          : clamp((now - stage.closeStartTime) / stage.closeDuration, 0, 1);
        const easedClose = closeProgress * closeProgress * (3 - 2 * closeProgress);
        stage.progress = stage.closeStartProgress * (1 - easedClose);

        if (closeProgress < 1) {
          hasRunningStage = true;
        } else {
          stage.closing = false;
          stage.progress = 0;
          flowStateChanged = true;
        }
        return;
      }

      if (!stage.active) {
        stage.progress = 0;
        return;
      }

      if (reducedMotion.matches) {
        stage.progress = 1;
        return;
      }

      const automaticProgress = clamp((now - stage.startTime) / stage.duration, 0, 1);
      const scrollProgress = clamp((scrollY - stage.startScroll) / stage.scrollRange, 0, 1);
      stage.progress = Math.max(automaticProgress, scrollProgress);
      hasRunningStage ||= stage.progress < 1;
    });

    const preparationExpansion = flowStages.preparation.maxExpansion * flowStages.preparation.progress;
    const patternExpansion = flowStages.pattern.maxExpansion * flowStages.pattern.progress;
    const weavingExpansion = flowStages.weaving.maxExpansion * flowStages.weaving.progress;

    document.documentElement.style.setProperty('--preparation-expansion', `${preparationExpansion.toFixed(2)}px`);
    document.documentElement.style.setProperty('--pattern-flow-expansion', `${patternExpansion.toFixed(2)}px`);
    document.documentElement.style.setProperty('--weaving-flow-expansion', `${weavingExpansion.toFixed(2)}px`);
    document.documentElement.style.setProperty(
      '--flow-tail-gap',
      `${(120 * (1 - flowStages.weaving.progress)).toFixed(2)}px`
    );

    if (preparationFlow) {
      const preparationVisible = flowStages.preparation.active || flowStages.preparation.closing;
      preparationFlow.style.visibility = preparationVisible ? 'visible' : 'hidden';
      preparationFlow.style.pointerEvents = flowStages.preparation.active ? 'auto' : 'none';
      preparationFlow.style.opacity = preparationVisible ? '1' : '0';
      preparationFlow.style.clipPath = `inset(0 0 ${((1 - flowStages.preparation.progress) * 100).toFixed(2)}% 0)`;
    }

    if (patternWeavingFlow) {
      const laterFlowActive = flowStages.pattern.active
        || flowStages.pattern.closing
        || flowStages.weaving.active
        || flowStages.weaving.closing;
      patternWeavingFlow.style.visibility = laterFlowActive ? 'visible' : 'hidden';
      patternWeavingFlow.style.pointerEvents = laterFlowActive ? 'auto' : 'none';
      patternWeavingFlow.style.opacity = laterFlowActive ? '1' : '0';
    }

    renderStageItems(flowStages.preparation);
    renderStageItems(flowStages.pattern);
    renderStageItems(flowStages.weaving, patternExpansion - flowStages.pattern.maxExpansion);

    if (flowStateChanged) syncFlowControls();
    if (hasRunningStage) requestUpdate();
  };

  const activateStage = (stage, complete = false) => {
    if (!stage || stage.active) return;

    const now = performance.now();
    stage.active = true;
    stage.closing = false;
    stage.suppressHover = false;
    stage.startScroll = complete
      ? window.scrollY - stage.scrollRange
      : window.scrollY - stage.progress * stage.scrollRange;
    stage.startTime = now - (complete ? stage.duration : stage.progress * stage.duration);
    syncFlowControls();
    requestUpdate();
  };

  const deactivateStage = (stage) => {
    if (!stage || !stage.active) return;

    stage.active = false;
    stage.suppressHover = true;

    if (reducedMotion.matches || stage.progress <= 0.001) {
      stage.closing = false;
      stage.progress = 0;
    } else {
      stage.closing = true;
      stage.closeStartTime = performance.now();
      stage.closeStartProgress = stage.progress;
      stage.closeDuration = clamp(stage.duration * stage.progress * 0.25, 450, 1500);
    }

    syncFlowControls();
    requestUpdate();
  };

  Object.values(flowStages).forEach((stage) => {
    if (!stage.button) return;
    stage.button.addEventListener('click', () => {
      if (stage.active) {
        deactivateStage(stage);
      } else {
        activateStage(stage);
      }
    });
    stage.button.addEventListener('pointerleave', () => {
      if (!stage.suppressHover) return;
      stage.suppressHover = false;
      syncFlowControls();
    });
  });

  const collapseFlow = () => {
    Object.values(flowStages).forEach((stage) => {
      stage.active = false;
      stage.closing = false;
      stage.suppressHover = false;
      stage.progress = 0;
      stage.startScroll = window.scrollY;
      stage.startTime = 0;
    });
    syncFlowControls();
    updateFlowStages();
  };

  if (flowToggle && processSummary) {
    flowToggle.addEventListener('click', () => {
      const willExpand = !Object.values(flowStages).some(
        (stage) => stage.active || stage.closing
      );

      if (!willExpand) {
        const summaryTop = processSummary.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo(0, summaryTop);
      }

      if (willExpand) {
        Object.values(flowStages).forEach((stage) => activateStage(stage, true));
      } else {
        collapseFlow();
      }
    });
  }

  syncFlowControls();

  if (patternRails.length) {
    const speed = 72;
    let marqueeFrame = 0;

    const marquees = patternRails.map((rail) => {
      const track = rail.querySelector('.rail-track');
      const sequence = track?.querySelector('.rail-sequence');
      const direction = rail.dataset.marqueeDirection === 'right' ? 1 : -1;

      if (!track || !sequence) return null;

      const duplicate = sequence.cloneNode(true);
      duplicate.setAttribute('aria-hidden', 'true');
      track.appendChild(duplicate);

      const width = sequence.offsetWidth;
      const state = {
        rail,
        track,
        sequence,
        direction,
        offset: direction > 0 ? -width : 0,
        active: false,
        lastTime: 0
      };

      track.style.setProperty('--rail-x', `${state.offset}px`);
      return state;
    }).filter(Boolean);

    const animateMarquees = (now) => {
      marqueeFrame = 0;
      let shouldContinue = false;

      marquees.forEach((state) => {
        if (!state.active || reducedMotion.matches) {
          state.lastTime = 0;
          return;
        }

        shouldContinue = true;
        if (!state.lastTime) state.lastTime = now;
        const elapsed = Math.min(40, now - state.lastTime);
        const width = state.sequence.offsetWidth;
        state.offset += state.direction * speed * elapsed / 1000;

        if (state.direction > 0 && state.offset >= 0) state.offset -= width;
        if (state.direction < 0 && state.offset <= -width) state.offset += width;

        state.track.style.setProperty('--rail-x', `${state.offset.toFixed(2)}px`);
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
      state.rail.addEventListener('pointerenter', () => {
        state.active = true;
        state.lastTime = 0;
        requestMarqueeFrame();
      });
      state.rail.addEventListener('pointerleave', () => {
        state.active = false;
        state.lastTime = 0;
      });
    });
  }

  updateInteractions();
})();
