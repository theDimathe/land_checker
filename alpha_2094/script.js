(function () {
  function syncOrangeSelected(scopeEl) {
    var scope = scopeEl || document;
    var labels = scope.querySelectorAll('label._label_1nhvq_40');
    for (var i = 0; i < labels.length; i++) {
      var label = labels[i];
      var checked = label.querySelector('input[type="radio"]:checked, input[type="checkbox"]:checked');
      if (checked) label.classList.add('orangeSelected');
      else label.classList.remove('orangeSelected');
    }
  }

  var welcome = document.getElementById('step-welcome');
  var age = document.getElementById('step-age');
  var ethnicity = document.getElementById('step-ethnicity');
  var bodyType = document.getElementById('step-bodyType');
  var breast = document.getElementById('step-breast');
  var butt = document.getElementById('step-butt');
  var hairColor = document.getElementById('step-hairColor');
  var specific = document.getElementById('step-specific');
  var matchFreak = document.getElementById('step-matchFreak');
  var aiCompanion = document.getElementById('step-aiCompanion');
  var character = document.getElementById('step-character');
  var likeToTry = document.getElementById('step-likeToTry');
  var scenarios = document.getElementById('step-scenarios');
  var generation = document.getElementById('step-generation');
  var generationQ1 = document.getElementById('step-generation-q1');
  var generationQ2 = document.getElementById('step-generation-q2');
  var generationQ3 = document.getElementById('step-generation-q3');
  var summary = document.getElementById('step-summary');
  var landing = document.getElementById('step-landing');

  var steps = {
    welcome: welcome,
    age: age,
    ethnicity: ethnicity,
    bodyType: bodyType,
    breast: breast,
    butt: butt,
    hairColor: hairColor,
    specific: specific,
    matchFreak: matchFreak,
    aiCompanion: aiCompanion,
    character: character,
    likeToTry: likeToTry,
    scenarios: scenarios,
    generation: generation,
    generationQ1: generationQ1,
    generationQ2: generationQ2,
    generationQ3: generationQ3,
    summary: summary,
    landing: landing,
  };

  function getLanding() {
    if (landing) return landing;
    try {
      landing = document.getElementById('step-landing');
    } catch (e) {
      landing = null;
    }
    return landing;
  }

  var generationPhase = 'progress';
  var generationQuestionIndex = 0;
  var generationAfterProgressStepId = '';
  var generationProgress = {
    prefs: 0,
    unc: 0,
    craft: 0,
  };

  var generationTargets = {
    prefs: 100,
    unc: 100,
    craft: 100,
  };
  var generationAnswers = {
    spicy_photos: true,
    voice_messages: true,
    special_videos: true,
  };

  var summaryNamePool = [
    'Lucía',
    'Beatriz',
    'Mariana',
    'Gabriela',
    'Rafaela',
    'Olivia',
    'Julia',
    'Patricia',
    'Valentina',
    'Carolina',
    'Ana',
    'Fernanda',
    'Delfina',
    'Tatiana',
    'Sofía',
    'Camila',
    'Isabella',
    'Martina',
    'Victoria',
    'Daniela',
    'Paula',
    'Renata',
    'Alma',
    'Mía',
  ];

  function pickRandomName(exclude) {
    if (!summaryNamePool || !summaryNamePool.length) return '';
    if (summaryNamePool.length === 1) return summaryNamePool[0];

    var tries = 0;
    var next = '';
    do {
      next = summaryNamePool[Math.floor(Math.random() * summaryNamePool.length)];
      tries += 1;
    } while (exclude && next === exclude && tries < 10);
    return next;
  }

  function setSummaryRandomName(force) {
    var input = document.getElementById('quiz4902-model-name');
    if (!input) return;
    var current = (input.value || '').trim();
    if (!force && current) return;
    input.value = pickRandomName(current);
  }

  function getCheckedLabelTexts(stepId) {
    var step = document.getElementById(stepId);
    if (!step) return [];
    var inputs = step.querySelectorAll('input[type="checkbox"]:checked, input[type="radio"]:checked');
    var out = [];
    for (var i = 0; i < inputs.length; i++) {
      var inp = inputs[i];
      var label = inp.closest('label');
      if (!label) continue;
      var strong = label.querySelector('strong');
      var txt = (strong ? strong.textContent : label.textContent) || '';
      txt = txt.replace(/\s+/g, ' ').trim();
      if (txt) out.push(txt);
    }
    return out;
  }

  function readSliderValue(sliderRootId) {
    var root = document.getElementById(sliderRootId);
    if (!root) return null;
    var range = root.querySelector('input[type="range"]');
    if (!range) return null;
    var v = parseInt(range.value, 10);
    if (isNaN(v)) return null;
    if (v < 0) v = 0;
    if (v > 100) v = 100;
    return v;
  }

  function setSummaryPct(pctElId, sliderElId, v) {
    var pctEl = document.getElementById(pctElId);
    if (pctEl) pctEl.textContent = String(v) + '%';

    var slider = document.getElementById(sliderElId);
    if (!slider) return;
    var ticks = slider.querySelectorAll('span');
    var activeCount = Math.round(v / 10);
    if (activeCount < 0) activeCount = 0;
    if (activeCount > ticks.length) activeCount = ticks.length;
    for (var i = 0; i < ticks.length; i++) {
      if (i < activeCount) ticks[i].className = '_active_1ccmu_275';
      else ticks[i].className = '';
    }
  }

  function applyQuizAnswersToSummary() {
    try {
      var lookingFor = document.getElementById('summary-looking-for');
      if (lookingFor) {
        var aiCompanionTexts = getCheckedLabelTexts('step-aiCompanion');
        lookingFor.textContent = aiCompanionTexts.join(', ');
      }

      var specific = document.getElementById('summary-specific');
      if (specific) {
        var specificTexts = getCheckedLabelTexts('step-specific');
        specific.textContent = specificTexts.join(', ');
      }

      var scenarios = document.getElementById('summary-scenarios');
      if (scenarios) {
        var scenarioTexts = getCheckedLabelTexts('step-scenarios');
        scenarios.textContent = scenarioTexts.join(', ');
      }

      var libido = readSliderValue('quiz4901-slider-character-libido');
      if (libido === null) libido = 50;
      setSummaryPct('summary-libido-pct', 'summary-libido-slider', libido);

      var kink = readSliderValue('quiz4901-slider-character-kink');
      if (kink === null) kink = 50;
      setSummaryPct('summary-kink-pct', 'summary-kink-slider', kink);

      var nudity = readSliderValue('quiz4901-slider-character-nudity');
      if (nudity === null) nudity = 50;
      setSummaryPct('summary-nudity-pct', 'summary-nudity-slider', nudity);
    } catch (e) {}
  }

  function getSelectedEthnicityValue() {
    try {
      var checked = document.querySelector('#step-ethnicity input[name="ethnicity"]:checked');
      return checked ? checked.value : null;
    } catch (e) {
      return null;
    }
  }

  function updateSummaryImageFromEthnicity() {
    try {
      var ethnicityValue = getSelectedEthnicityValue();
      if (!ethnicityValue) return;

      var map = {
        white: {
          avif: './assets/caucasian-3xHlIwa6.avif',
          webp: './assets/caucasian-CHMSaHkg.webp',
          alt: 'white',
        },
        asian: {
          avif: './assets/asian-CM0pF2A-.avif',
          webp: './assets/asian-CfD1p0vs.webp',
          alt: 'asian',
        },
        latin: {
          avif: './assets/latin-2ilObCHL.avif',
          webp: './assets/latin-B2ZZHtw_.webp',
          alt: 'latin',
        },
        black: {
          avif: './assets/black-BdGjtiRC.avif',
          webp: './assets/black-BXE5KYGT.webp',
          alt: 'black',
        },
      };

      var entry = map[ethnicityValue];
      if (!entry) return;

      var wrap = document.getElementById('summary-generated-img');
      if (!wrap) return;
      var source = wrap.querySelector('source[type="image/avif"]');
      var img = wrap.querySelector('img');
      if (!source || !img) return;

      source.setAttribute('srcset', entry.avif + ' 486w');
      img.setAttribute('src', entry.webp);
      img.setAttribute('alt', entry.alt);
    } catch (e) {}
  }

  var genAnimId = 0;
  var summaryAnimId = 0;

  function startSummaryCreatingAnimation() {
    if (summaryAnimId) {
      clearInterval(summaryAnimId);
      summaryAnimId = 0;
    }

    var overlay = document.getElementById('summary-creating');
    var generatedImg = document.getElementById('summary-generated-img');
    var main = document.getElementById('summary-main');
    var pctEl = document.getElementById('summary-creating-pct');
    var barEl = document.getElementById('summary-creating-bar');

    if (!overlay || !main || !pctEl || !barEl) return;

    overlay.style.display = '';
    if (generatedImg) generatedImg.style.display = 'none';

    var v = 0;
    pctEl.textContent = '0%';
    barEl.style.width = '0%';

    summaryAnimId = setInterval(function () {
      v += 1;
      if (v > 100) v = 100;
      pctEl.textContent = v + '%';
      barEl.style.width = v + '%';

      if (v >= 100) {
        clearInterval(summaryAnimId);
        summaryAnimId = 0;
        overlay.style.display = 'none';
        if (generatedImg) generatedImg.style.display = '';
      }
    }, 14);
  }

  function showStep(stepIdToShow) {
    for (var key in steps) {
      if (!steps.hasOwnProperty(key)) continue;
      if (!steps[key]) continue;
      steps[key].style.display = key === stepIdToShow ? '' : 'none';
    }

    var next = steps[stepIdToShow];
    if (next) next.style.display = '';
    else if (welcome) welcome.style.display = '';

    try {
      if (stepIdToShow !== 'summary') {
        var summaryCreating = document.getElementById('summary-creating');
        if (summaryCreating) summaryCreating.style.display = 'none';

        var summaryGeneratedImg = document.getElementById('summary-generated-img');
        if (summaryGeneratedImg) summaryGeneratedImg.style.display = '';
      }
    } catch (e) {}

    try {
      var isGenerationModal =
        stepIdToShow === 'generationQ1' ||
        stepIdToShow === 'generationQ2' ||
        stepIdToShow === 'generationQ3';

      if (document && document.body) {
        if (isGenerationModal) {
          document.body.classList.add('modalOpened');
          document.body.style.overflow = 'hidden';
        } else {
          document.body.classList.remove('modalOpened');
          document.body.style.overflow = '';
        }
      }
    } catch (e) {}

    try {
      syncOrangeSelected(next || welcome);
    } catch (e) {}

    if (stepIdToShow === 'generation' && generationPhase === 'progress') {
      try {
        startGenerationAnimation();
      } catch (e) {}
    }

    if (stepIdToShow === 'summary') {
      try {
        setSummaryRandomName(false);
        updateSummaryImageFromEthnicity();
        applyQuizAnswersToSummary();
        applyGenerationAnswersToSummary();
        startSummaryCreatingAnimation();
      } catch (e) {}
    }

    if (stepIdToShow === 'landing') {
      try {
        initReviewsCarousel();
      } catch (e) {}

      try {
        initFaqAccordion();
      } catch (e) {}

      try {
        initPremiumTimer();
      } catch (e) {}
    }
  }

  var __reviewsCarouselStarted = false;

  var __faqAccordionWired = false;

  var __premiumTimerStarted = false;
  var __premiumTimerId = 0;

  function initPremiumTimer() {
    if (__premiumTimerStarted) return;

    var landingEl = getLanding();
    if (!landingEl) return;

    var timeEl = null;
    try {
      timeEl = landingEl.querySelector('p._time_3z4t6_76');
    } catch (e) {}
    if (!timeEl) return;

    var spans = [];
    try {
      spans = timeEl.querySelectorAll ? timeEl.querySelectorAll('span') : [];
    } catch (e) {}
    if (!spans || spans.length < 3) return;

    function toNum(s) {
      var v = 0;
      try {
        v = parseInt((s || '').replace(/\D+/g, ''), 10);
      } catch (e) {
        v = 0;
      }
      if (!isFinite(v) || isNaN(v)) v = 0;
      return v;
    }

    // The design uses MM:SS:MS(two digits). We treat the last part as centiseconds (00-99).
    var mm = toNum(spans[0].textContent);
    var ss = toNum(spans[1].textContent);
    var cs = toNum(spans[2].textContent);
    if (cs > 99) cs = cs % 100;

    var remainingCs = mm * 60 * 100 + ss * 100 + cs;
    if (remainingCs <= 0) remainingCs = 0;

    function pad2(n) {
      n = Math.max(0, Math.floor(n || 0));
      return n < 10 ? '0' + n : '' + n;
    }

    function render() {
      var totalSeconds = Math.floor(remainingCs / 100);
      var m = Math.floor(totalSeconds / 60);
      var s = totalSeconds % 60;
      var c = remainingCs % 100;

      try {
        spans[0].textContent = pad2(m);
        spans[1].textContent = pad2(s);
        spans[2].textContent = pad2(c);
      } catch (e) {}
    }

    function isLandingVisible() {
      try {
        return !landingEl.style || landingEl.style.display !== 'none';
      } catch (e) {
        return true;
      }
    }

    __premiumTimerStarted = true;
    render();

    if (__premiumTimerId) {
      try {
        clearInterval(__premiumTimerId);
      } catch (e) {}
      __premiumTimerId = 0;
    }

    __premiumTimerId = setInterval(function () {
      if (!isLandingVisible()) return;
      if (remainingCs <= 0) {
        render();
        return;
      }
      remainingCs -= 1;
      if (remainingCs < 0) remainingCs = 0;
      render();
    }, 10);
  }

  function initFaqAccordion() {
    if (__faqAccordionWired) return;

    var landingEl = getLanding();
    if (!landingEl) return;

    var accordions = landingEl.querySelectorAll
      ? landingEl.querySelectorAll('.MuiAccordion-root')
      : [];
    if (!accordions || !accordions.length) return;

    __faqAccordionWired = true;

    function getSummary(accEl) {
      try {
        return accEl.querySelector('.MuiAccordionSummary-root');
      } catch (e) {
        return null;
      }
    }

    function getCollapse(accEl) {
      try {
        return accEl.querySelector('.MuiCollapse-root');
      } catch (e) {
        return null;
      }
    }

    function setOpen(accEl, open) {
      var summary = getSummary(accEl);
      var collapse = getCollapse(accEl);
      if (!summary || !collapse) return;

      var iconWrap = null;
      try {
        iconWrap = summary.querySelector('.MuiAccordionSummary-expandIconWrapper');
      } catch (e) {
        iconWrap = null;
      }

      try {
        summary.setAttribute('aria-expanded', open ? 'true' : 'false');
      } catch (e) {}

      try {
        if (summary.classList) summary.classList.toggle('Mui-expanded', !!open);
      } catch (e) {}

      try {
        if (accEl.classList) accEl.classList.toggle('Mui-expanded', !!open);
      } catch (e) {}

      try {
        if (iconWrap && iconWrap.classList) iconWrap.classList.toggle('Mui-expanded', !!open);
      } catch (e) {}

      try {
        collapse.style.display = open ? '' : 'none';
      } catch (e) {}

      try {
        if (collapse.classList) collapse.classList.toggle('MuiCollapse-hidden', !open);
      } catch (e) {}
    }

    function closeAll(exceptEl) {
      for (var i = 0; i < accordions.length; i++) {
        if (exceptEl && accordions[i] === exceptEl) continue;
        setOpen(accordions[i], false);
      }
    }

    // Default state: all closed
    closeAll(null);

    for (var i = 0; i < accordions.length; i++) {
      (function (accEl) {
        var summary = getSummary(accEl);
        if (!summary || !summary.addEventListener) return;

        summary.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}

          var isOpen = false;
          try {
            isOpen = summary.getAttribute('aria-expanded') === 'true';
          } catch (err) {
            isOpen = false;
          }

          closeAll(accEl);
          setOpen(accEl, !isOpen);
        });
      })(accordions[i]);
    }
  }

  function initReviewsCarousel() {
    if (__reviewsCarouselStarted) return;

    var slides = document.querySelector('._slides_ro2q7_95');
    if (!slides) return;

    __reviewsCarouselStarted = true;

    try {
      slides.style.transform = 'translateX(0px)';
      slides.style.willChange = 'transform';
    } catch (e) {}

    // Remove any server-side / saved inline transform that could cause a jump.
    try {
      slides.style.transform = 'translate3d(0px, 0px, 0px)';
    } catch (e) {}

    // Create a seamless marquee:
    // 1) Measure width of the original set
    // 2) Clone once
    // 3) Animate X and wrap by original width
    var originalWidth = 0;

    function measureOriginalWidth() {
      // If we already cloned, measure only the first half.
      try {
        if (slides.children && slides.children.length) {
          var total = slides.scrollWidth;
          if (total && slides.getAttribute('data-marquee-cloned') === '1') {
            return Math.floor(total / 2);
          }
          return Math.floor(total || 0);
        }
      } catch (e) {}
      return 0;
    }

    try {
      originalWidth = measureOriginalWidth();
      if (!slides.getAttribute('data-marquee-cloned')) {
        var kids = slides.children ? Array.prototype.slice.call(slides.children) : [];
        for (var i = 0; i < kids.length; i++) {
          slides.appendChild(kids[i].cloneNode(true));
        }
        slides.setAttribute('data-marquee-cloned', '1');
      }
    } catch (e) {}

    // speed is pixels per frame (~60fps). Keep close to original feel.
    var x = 0;
    var speed = 0.45;

    function isLandingVisible() {
      try {
        var landingStep = slides.closest && slides.closest('#step-landing');
        return !(landingStep && landingStep.style && landingStep.style.display === 'none');
      } catch (e) {
        return true;
      }
    }

    function tick() {
      try {
        if (!slides || !document.body || !document.body.contains(slides)) return;
      } catch (e) {
        return;
      }

      if (!isLandingVisible()) {
        requestAnimationFrame(tick);
        return;
      }

      if (!originalWidth) {
        originalWidth = measureOriginalWidth();
      }

      x -= speed;
      if (originalWidth && -x >= originalWidth) {
        // wrap without visible jump
        x += originalWidth;
      }

      try {
        slides.style.transform = 'translate3d(' + x + 'px, 0px, 0px)';
      } catch (e) {}

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  try {
    window.quizShowStep = showStep;
  } catch (e) {}

      function startGenerationAnimation() {
        if (genAnimId) {
          clearInterval(genAnimId);
          genAnimId = 0;
        }

        var prefsPct = document.getElementById('gen_prefs_pct');
        var prefsBar = document.getElementById('gen_prefs_bar');
        var uncPct = document.getElementById('gen_uncensored_pct');
        var uncBar = document.getElementById('gen_uncensored_bar');
        var craftPct = document.getElementById('gen_crafting_pct');
        var craftBar = document.getElementById('gen_crafting_bar');

        if (!prefsPct || !prefsBar || !uncPct || !uncBar || !craftPct || !craftBar) return;

        var prefs = generationProgress.prefs || 0;
        var unc = generationProgress.unc || 0;
        var craft = generationProgress.craft || 0;
        var tick = 0;

        var prefsTarget = typeof generationTargets.prefs === 'number' ? generationTargets.prefs : 100;
        var uncTarget = typeof generationTargets.unc === 'number' ? generationTargets.unc : 100;
        var craftTarget = typeof generationTargets.craft === 'number' ? generationTargets.craft : 100;

        if (prefsTarget < 0) prefsTarget = 0;
        if (prefsTarget > 100) prefsTarget = 100;
        if (uncTarget < 0) uncTarget = 0;
        if (uncTarget > 100) uncTarget = 100;
        if (craftTarget < 0) craftTarget = 0;
        if (craftTarget > 100) craftTarget = 100;

        function setPct(el, v) {
          if (!el) return;
          el.textContent = v + '%';
        }

        function setBar(el, v) {
          if (!el) return;
          el.style.width = v + '%';
        }

        setPct(prefsPct, prefs);
        setBar(prefsBar, prefs);
        setPct(uncPct, unc);
        setBar(uncBar, unc);
        setPct(craftPct, craft);
        setBar(craftBar, craft);

        genAnimId = setInterval(function () {
          tick += 1;

          if (prefs < prefsTarget) {
            prefs += 1;
            if (prefs > prefsTarget) prefs = prefsTarget;
            setPct(prefsPct, prefs);
            setBar(prefsBar, prefs);
          } else if (unc < uncTarget) {
            if (tick % 2 === 0) {
              unc += 1;
              if (unc > uncTarget) unc = uncTarget;
              setPct(uncPct, unc);
              setBar(uncBar, unc);
            }
          } else if (craft < craftTarget) {
            if (tick % 2 === 0) {
              craft += 1;
              if (craft > craftTarget) craft = craftTarget;
              setPct(craftPct, craft);
              setBar(craftBar, craft);
            }
          }

          generationProgress.prefs = prefs;
          generationProgress.unc = unc;
          generationProgress.craft = craft;

          if (prefs === prefsTarget && unc === uncTarget && craft === craftTarget) {
            clearInterval(genAnimId);
            genAnimId = 0;
            if (generationAfterProgressStepId) {
              var nextId = generationAfterProgressStepId;
              generationAfterProgressStepId = '';
              showStep(nextId);
            } else {
              startGenerationQuestions();
            }
          }
        }, 10);
      }

      function stopAfterDownsellTimer() {
        if (typeof afterDownsellTimerId === 'undefined') return;
        if (afterDownsellTimerId) {
          try {
            clearInterval(afterDownsellTimerId);
          } catch (e) {}
          afterDownsellTimerId = 0;
        }
      }

      function renderAfterDownsellTimer() {
        if (typeof afterDownsellTimerEl === 'undefined') return;
        if (typeof afterDownsellRemainingCs === 'undefined') return;
        if (!afterDownsellTimerEl) return;
        try {
          afterDownsellTimerEl.textContent = formatCs(afterDownsellRemainingCs);
        } catch (e) {}
      }

      function startAfterDownsellTimer() {
        if (typeof afterDownsellTimerId === 'undefined') return;
        if (typeof afterDownsellRemainingCs === 'undefined') return;
        stopAfterDownsellTimer();
        afterDownsellRemainingCs = 60 * 100;
        renderAfterDownsellTimer();
        afterDownsellTimerId = setInterval(function () {
          if (afterDownsellRemainingCs <= 0) {
            afterDownsellRemainingCs = 0;
            renderAfterDownsellTimer();
            stopAfterDownsellTimer();
            return;
          }
          afterDownsellRemainingCs -= 1;
          if (afterDownsellRemainingCs < 0) afterDownsellRemainingCs = 0;
          renderAfterDownsellTimer();
        }, 10);
      }

      function startGenerationQuestions() {
        generationPhase = 'questions';
        generationQuestionIndex = 0;
        showStep('generationQ1');
      }

      function applyGenerationAnswersToSummary() {
        var spicy = document.getElementById('spicy_photos');
        var voice = document.getElementById('voice_messages');
        var videos = document.getElementById('special_videos');

        if (spicy) spicy.checked = !!generationAnswers.spicy_photos;
        if (voice) voice.checked = !!generationAnswers.voice_messages;
        if (videos) videos.checked = !!generationAnswers.special_videos;

        try {
          applyQuizAnswersToSummary();
        } catch (e) {}
      }

      function onGenerationQuestionAnswered(key, value) {
        generationAnswers[key] = !!value;

        generationQuestionIndex += 1;

        if (generationQuestionIndex === 1) {
          generationTargets.prefs = 100;
          generationTargets.unc = 70;
          generationTargets.craft = 0;
          generationAfterProgressStepId = 'generationQ2';
        } else if (generationQuestionIndex === 2) {
          generationTargets.prefs = 100;
          generationTargets.unc = 100;
          generationTargets.craft = 30;
          generationAfterProgressStepId = 'generationQ3';
        } else {
          generationTargets.prefs = 100;
          generationTargets.unc = 100;
          generationTargets.craft = 100;
          generationAfterProgressStepId = 'summary';
          applyGenerationAnswersToSummary();
        }

        generationPhase = 'progress';

        showStep('generation');
      }

  function onCreate() {
    showStep('age');
  }

  function onBack() {
    showStep('welcome');
  }

  function onAgeSelected() {
    showStep('ethnicity');
  }

  function onEthnicityBack() {
    showStep('age');
  }

  function onEthnicitySelected() {
    try {
      updateSummaryImageFromEthnicity();
    } catch (e) {}
    showStep('bodyType');
  }

  function onBodyTypeBack() {
    showStep('ethnicity');
  }

  function onBodyTypeSelected() {
    showStep('breast');
  }

  function onBreastBack() {
    showStep('bodyType');
  }

  function onBreastSelected() {
    showStep('butt');
  }

  function onButtBack() {
    showStep('breast');
  }

  function onButtSelected() {
    showStep('hairColor');
  }

  function onHairColorBack() {
    showStep('butt');
  }

  function onHairColorSelected() {
    showStep('specific');
  }

  function onSpecificBack() {
    showStep('hairColor');
  }

  function onSpecificContinue() {
    showStep('matchFreak');
  }

  function onMatchFreakBack() {
    showStep('specific');
  }

  function onMatchFreakContinue() {
    showStep('aiCompanion');
  }

  function onAiCompanionBack() {
    showStep('matchFreak');
  }

  function onAiCompanionContinue() {
    showStep('character');
  }

  function onCharacterBack() {
    showStep('aiCompanion');
  }

  function onCharacterContinue() {
    showStep('likeToTry');
  }

  function onLikeToTryBack() {
    showStep('character');
  }

  function syncLikeToTryContinueState() {
    var btn = document.getElementById('likeToTry');
    if (!btn) return;
    var checks = document.querySelectorAll('#step-likeToTry input[type="checkbox"]');
    var any = false;
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked) {
        any = true;
        break;
      }
    }
    if (any) btn.removeAttribute('disabled');
    else btn.setAttribute('disabled', '');
  }

  function onLikeToTryContinue() {
    showStep('scenarios');
  }

  function onScenariosBack() {
    showStep('likeToTry');
  }

  function onScenariosContinue() {
    generationPhase = 'progress';

    generationQuestionIndex = 0;
    generationProgress.prefs = 0;
    generationProgress.unc = 0;
    generationProgress.craft = 0;

    generationTargets.prefs = 80;
    generationTargets.unc = 0;
    generationTargets.craft = 0;
    generationAfterProgressStepId = 'generationQ1';

    showStep('generation');
  }

  function syncScenariosContinueState() {
    var btn = document.getElementById('scenarios');
    if (!btn) return;
    var checks = document.querySelectorAll('#step-scenarios input[type="checkbox"]');
    var any = false;
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked) {
        any = true;
        break;
      }
    }
    if (any) btn.removeAttribute('disabled');
    else btn.setAttribute('disabled', '');
  }

  function syncAiCompanionContinueState() {
    var btn = document.getElementById('aiCompanion');
    if (!btn) return;
    var checks = document.querySelectorAll('#step-aiCompanion input[type="checkbox"]');
    var any = false;
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked) {
        any = true;
        break;
      }
    }
    if (any) btn.removeAttribute('disabled');
    else btn.setAttribute('disabled', '');
  }

  function syncCharacterSliderUI(rangeInput) {
    if (!rangeInput) return;

    var value = Number(rangeInput.value);
    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    rangeInput.setAttribute('aria-valuenow', String(value));

    var model = rangeInput.closest('div._model_lzpno_40');
    if (!model) return;

    var percentStrong = model.querySelector('div._header_lzpno_48 > p > strong');
    if (percentStrong) percentStrong.textContent = value + '%';

    var sliderRoot = rangeInput.closest('span.MuiSlider-root');
    if (!sliderRoot) return;

    var track = sliderRoot.querySelector('span.MuiSlider-track');
    if (track) {
      track.style.left = '0%';
      track.style.width = value + '%';
    }

    var thumb = sliderRoot.querySelector('span.MuiSlider-thumb');
    if (thumb) thumb.style.left = value + '%';
  }

  function wireCharacterSliders() {
    var sliders = document.querySelectorAll('#step-character input[type="range"]');
    for (var i = 0; i < sliders.length; i++) {
      (function (input) {
        // Make the hidden native range input actually interactive.
        // The original DOM uses clip/overflow to hide it, but in our static copy
        // we rely on the native input events to drive the visuals.
        input.style.clip = 'auto';
        input.style.overflow = 'visible';
        input.style.opacity = '0';
        input.style.position = 'absolute';
        input.style.left = '0';
        input.style.top = '0';
        input.style.width = '100%';
        input.style.height = '100%';
        input.style.margin = '0';
        input.style.padding = '0';
        // Disable native pointer handling to avoid jitter; we implement pointer drag
        // on the slider root instead (one interaction path).
        input.style.pointerEvents = 'none';
        input.style.zIndex = '1';

        input.addEventListener('input', function () {
          syncCharacterSliderUI(input);
        });
        input.addEventListener('change', function () {
          syncCharacterSliderUI(input);
        });

        var sliderRoot = input.closest('span.MuiSlider-root');
        if (sliderRoot) {
          // Make sure nothing inside steals pointer events.
          sliderRoot.style.cursor = 'pointer';
          sliderRoot.style.touchAction = 'none';

          var rail = sliderRoot.querySelector('span.MuiSlider-rail');
          var track = sliderRoot.querySelector('span.MuiSlider-track');
          var thumb = sliderRoot.querySelector('span.MuiSlider-thumb');

          function startPointerDrag(e) {
            e.preventDefault();

            if (sliderRoot.setPointerCapture) {
              try {
                sliderRoot.setPointerCapture(e.pointerId);
              } catch (err) {}
            }

            var nextDown = valueFromClientX(e.clientX);
            setValue(nextDown);

            var latestX = e.clientX;
            function onMove(ev) {
              latestX = ev.clientX;
              if (rafId) return;
              rafId = requestAnimationFrame(function () {
                rafId = 0;
                setValue(valueFromClientX(latestX));
              });
            }

            function cleanup() {
              window.removeEventListener('pointermove', onMove);
              window.removeEventListener('pointerup', onUp);
              window.removeEventListener('pointercancel', onUp);
              if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
              }
            }

            function onUp() {
              cleanup();
            }

            window.addEventListener('pointermove', onMove);
            window.addEventListener('pointerup', onUp);
            window.addEventListener('pointercancel', onUp);
          }

          var rafId = 0;

          function valueFromClientX(clientX) {
            var rect = sliderRoot.getBoundingClientRect();
            if (!rect || !rect.width) return null;
            var x = clientX - rect.left;
            var pct = x / rect.width;
            if (pct < 0) pct = 0;
            if (pct > 1) pct = 1;
            return Math.round(pct * 100);
          }

          function setValue(next) {
            if (next === null || next === undefined) return;
            if (String(input.value) === String(next)) return;
            input.value = String(next);
            // Fire input event for any other listeners.
            try {
              input.dispatchEvent(new Event('input', { bubbles: true }));
            } catch (e) {
              syncCharacterSliderUI(input);
            }
          }

          sliderRoot.addEventListener('pointerdown', startPointerDrag);
          if (rail) rail.addEventListener('pointerdown', startPointerDrag);
          if (track) track.addEventListener('pointerdown', startPointerDrag);
          if (thumb) thumb.addEventListener('pointerdown', startPointerDrag);
        }

        syncCharacterSliderUI(input);
      })(sliders[i]);
    }
  }

  function syncSpecificContinueState() {
    var btn = document.getElementById('specific');
    if (!btn) return;
    var checks = document.querySelectorAll('#step-specific input[type="checkbox"]');
    var any = false;
    for (var i = 0; i < checks.length; i++) {
      if (checks[i].checked) {
        any = true;
        break;
      }
    }
    btn.disabled = !any;
  }

  function wire() {
    try {
    var welcomeSweet = document.getElementById('sweet-sweet');
    var welcomeNaughty = document.getElementById('naughty-naughty');
    var backAge = document.getElementById('quiz_back_button_age');
    var backEthnicity = document.getElementById('quiz_back_button_ethnicity');
    var backBodyType = document.getElementById('quiz_back_button_bodyType');
    var backBreast = document.getElementById('quiz_back_button_breast');
    var backButt = document.getElementById('quiz_back_button_butt');
    var backHairColor = document.getElementById('quiz_back_button_hairColor');
    var backSpecific = document.getElementById('quiz_back_button_specific');
    var backMatchFreak = document.getElementById('quiz_back_button_matchFreak');
    var specificContinue = document.getElementById('specific');
    var matchFreakContinue = document.getElementById('matchFreak');
    var backAiCompanion = document.getElementById('quiz_back_button_aiCompanion');
    var aiCompanionContinue = document.getElementById('aiCompanion');
    var backCharacter = document.getElementById('quiz_back_button_character');
    var characterContinue = document.getElementById('character');
    var backLikeToTry = document.getElementById('quiz_back_button_likeToTry');
    var likeToTryContinue = document.getElementById('likeToTry');
    var backScenarios = document.getElementById('quiz_back_button_scenarios');
    var scenariosContinue = document.getElementById('scenarios');
    var genQ1Yes = document.getElementById('generationQ1-yes');
    var genQ1No = document.getElementById('generationQ1-no');
    var genQ2Yes = document.getElementById('generationQ2-yes');
    var genQ2No = document.getElementById('generationQ2-no');
    var genQ3Yes = document.getElementById('generationQ3-yes');
    var genQ3No = document.getElementById('generationQ3-no');

    var summaryApply = document.getElementById('summary');
    var summaryChangeName = document.getElementById('quiz4902-change-model-name-button');

    function onWelcomeSelected() {
      showStep('age');
    }

    if (welcomeSweet) welcomeSweet.addEventListener('change', onWelcomeSelected);
    if (welcomeNaughty) welcomeNaughty.addEventListener('change', onWelcomeSelected);

    if (backAge) backAge.addEventListener('click', onBack);
    if (backEthnicity) backEthnicity.addEventListener('click', onEthnicityBack);
    if (backBodyType) backBodyType.addEventListener('click', onBodyTypeBack);
    if (backBreast) backBreast.addEventListener('click', onBreastBack);
    if (backButt) backButt.addEventListener('click', onButtBack);
    if (backHairColor) backHairColor.addEventListener('click', onHairColorBack);
    if (backSpecific) backSpecific.addEventListener('click', onSpecificBack);
    if (backMatchFreak) backMatchFreak.addEventListener('click', onMatchFreakBack);
    if (specificContinue) specificContinue.addEventListener('click', onSpecificContinue);
    if (matchFreakContinue) matchFreakContinue.addEventListener('click', onMatchFreakContinue);
    if (backAiCompanion) backAiCompanion.addEventListener('click', onAiCompanionBack);
    if (aiCompanionContinue) aiCompanionContinue.addEventListener('click', onAiCompanionContinue);
    if (backCharacter) backCharacter.addEventListener('click', onCharacterBack);
    if (characterContinue) characterContinue.addEventListener('click', onCharacterContinue);
    if (backLikeToTry) backLikeToTry.addEventListener('click', onLikeToTryBack);
    if (likeToTryContinue) likeToTryContinue.addEventListener('click', onLikeToTryContinue);
    if (backScenarios) backScenarios.addEventListener('click', onScenariosBack);
    if (scenariosContinue) scenariosContinue.addEventListener('click', onScenariosContinue);

    if (genQ1Yes) genQ1Yes.addEventListener('click', function () {
      onGenerationQuestionAnswered('spicy_photos', true);
    });
    if (genQ1No) genQ1No.addEventListener('click', function () {
      onGenerationQuestionAnswered('spicy_photos', false);
    });
    if (genQ2Yes) genQ2Yes.addEventListener('click', function () {
      onGenerationQuestionAnswered('voice_messages', true);
    });
    if (genQ2No) genQ2No.addEventListener('click', function () {
      onGenerationQuestionAnswered('voice_messages', false);
    });
    if (genQ3Yes) genQ3Yes.addEventListener('click', function () {
      onGenerationQuestionAnswered('special_videos', true);
    });
    if (genQ3No) genQ3No.addEventListener('click', function () {
      onGenerationQuestionAnswered('special_videos', false);
    });

    if (summaryApply)
      summaryApply.addEventListener('click', function (e) {
        try {
          if (e && e.preventDefault) e.preventDefault();
        } catch (err) {}
        showStep('landing');
      });

    if (summaryChangeName)
      summaryChangeName.addEventListener('click', function (e) {
        try {
          if (e && e.preventDefault) e.preventDefault();
        } catch (err) {}
        setSummaryRandomName(true);
      });

    } catch (err) {
      try {
        console.error('wire() failed', err);
      } catch (e) {}
    }

    // Allow clicking an already-checked radio to re-trigger navigation (matches original behavior).
    // We record the checked state before the click (pointerdown capture), then on click we navigate
    // only if it was already checked.
    document.addEventListener(
      'pointerdown',
      function (e) {
        var t = e && e.target;
        if (!t) return;
        var label = t.closest && t.closest('label._label_1nhvq_40');
        if (!label) return;
        var radio = label.querySelector('input[type="radio"]');
        if (!radio) return;
        radio.__wasChecked = !!radio.checked;
      },
      true
    );

    document.addEventListener(
      'click',
      function (e) {
        var t = e && e.target;
        if (!t) return;
        var label = t.closest && t.closest('label._label_1nhvq_40');
        if (!label) return;
        var radio = label.querySelector('input[type="radio"]');
        if (!radio) return;

        if (!radio.__wasChecked) return;

        var stepEl = label.closest && label.closest('[data-quiz-step]');
        var stepId = stepEl && stepEl.getAttribute ? stepEl.getAttribute('data-quiz-step') : '';

        if (stepId === 'welcome') showStep('age');
        else if (stepId === 'age') onAgeSelected();
        else if (stepId === 'ethnicity') onEthnicitySelected();
        else if (stepId === 'bodyType') onBodyTypeSelected();
        else if (stepId === 'breast') onBreastSelected();
        else if (stepId === 'butt') onButtSelected();
        else if (stepId === 'hairColor') onHairColorSelected();
      },
      true
    );

    // Keep orange selected state synced for any option change (radio/checkbox) across all steps.
    // Use capture so it runs before step-specific handlers that may auto-navigate.
    document.addEventListener(
      'change',
      function (e) {
      var t = e && e.target;
      if (!t || !t.matches) return;
      if (!t.matches('input[type="radio"], input[type="checkbox"]')) return;
      var stepEl = t.closest('[data-quiz-step]') || document;
      try {
        syncOrangeSelected(stepEl);
      } catch (err) {}
      },
      true
    );

    // Forward navigation: selecting any age option -> ethnicity
    var ageInputs = document.querySelectorAll('#step-age input[type="radio"]');
    for (var i = 0; i < ageInputs.length; i++) {
      ageInputs[i].addEventListener('change', function (e) {
        onAgeSelected(e);
      });
    }

    // Forward navigation: selecting any ethnicity option -> bodyType
    var ethnicityInputs = document.querySelectorAll('#step-ethnicity input[type="radio"]');
    for (var j = 0; j < ethnicityInputs.length; j++) {
      ethnicityInputs[j].addEventListener('change', function (e) {
        onEthnicitySelected(e);
      });
    }

    // Forward navigation: selecting any bodyType option -> breast
    var bodyTypeInputs = document.querySelectorAll('#step-bodyType input[type="radio"]');
    for (var k = 0; k < bodyTypeInputs.length; k++) {
      bodyTypeInputs[k].addEventListener('change', onBodyTypeSelected);
    }

    // Forward navigation: selecting any breast option -> butt
    var breastInputs = document.querySelectorAll('#step-breast input[type="radio"]');
    for (var m = 0; m < breastInputs.length; m++) {
      breastInputs[m].addEventListener('change', onBreastSelected);
    }

    // Forward navigation: selecting any butt option -> hairColor
    var buttInputs = document.querySelectorAll('#step-butt input[type="radio"]');
    for (var n = 0; n < buttInputs.length; n++) {
      buttInputs[n].addEventListener('change', onButtSelected);
    }

    // Forward navigation: selecting any hairColor option -> specific
    var hairColorInputs = document.querySelectorAll('#step-hairColor input[type="radio"]');
    for (var p = 0; p < hairColorInputs.length; p++) {
      hairColorInputs[p].addEventListener('change', onHairColorSelected);
    }

    // Enable Continue on specific when at least one checkbox selected
    var specificChecks = document.querySelectorAll('#step-specific input[type="checkbox"]');
    for (var q = 0; q < specificChecks.length; q++) {
      specificChecks[q].addEventListener('change', syncSpecificContinueState);
    }
    syncSpecificContinueState();

    // Enable Continue on aiCompanion when at least one checkbox selected
    var aiCompanionChecks = document.querySelectorAll('#step-aiCompanion input[type="checkbox"]');
    for (var r = 0; r < aiCompanionChecks.length; r++) {
      aiCompanionChecks[r].addEventListener('change', syncAiCompanionContinueState);
    }
    syncAiCompanionContinueState();

    // Enable Continue on likeToTry when at least one checkbox selected
    var likeToTryChecks = document.querySelectorAll('#step-likeToTry input[type="checkbox"]');
    for (var s = 0; s < likeToTryChecks.length; s++) {
      likeToTryChecks[s].addEventListener('change', syncLikeToTryContinueState);
    }
    syncLikeToTryContinueState();

    // Enable Continue on scenarios when at least one checkbox selected
    var scenariosChecks = document.querySelectorAll('#step-scenarios input[type="checkbox"]');
    for (var t = 0; t < scenariosChecks.length; t++) {
      scenariosChecks[t].addEventListener('change', syncScenariosContinueState);
    }
    syncScenariosContinueState();

    wireCharacterSliders();

    // Landing: header CTA should scroll to the pricing/discount block
    try {
      var landingCta = document.getElementById('header_cta_btn');
      if (landingCta && landingCta.addEventListener) {
        landingCta.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}

          var target =
            document.getElementById('discount_title') ||
            document.querySelector('._pricingSectionWrapper_xa3c3_109') ||
            document.getElementById('pay_btn');

          if (!target) return;
          try {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          } catch (err) {
            try {
              target.scrollIntoView(true);
            } catch (e2) {}
          }
        });
      }
    } catch (e) {}

    // Landing: Checkout modal
    try {
      var payBtn = document.getElementById('pay_btn');
      var overlay = document.getElementById('checkout-modal-overlay');
      var exitOffer = document.getElementById('checkout-exit-offer');
      var exitOfferLoseBtn = document.getElementById('exit_offer_lose_btn');
      var exitOfferBackBtn = document.getElementById('exit_offer_back_btn');
      var exitOfferTimerEl = document.getElementById('exit_offer_timer');
      var exitOfferTimerId = 0;
      var exitOfferRemainingCs = 0;

      var downSell = document.getElementById('checkout-downsell-offer');
      var downSellSkipBtn = document.getElementById('downsell_skip_btn');
      var downSellApplyBtn = document.getElementById('downsell_apply_btn');
      var downSellTimerEl = document.getElementById('downsell_timer');
      var downSellTimerId = 0;
      var downSellRemainingCs = 0;
      var downSellProducts = document.getElementById('downsell_products');

      var afterDownsell = document.getElementById('checkout-after-downsell-offer');
      var afterDownsellLoseBtn = document.getElementById('after_downsell_lose_btn');
      var afterDownsellAnswerBtn = document.getElementById('after_downsell_answer_btn');
      var afterDownsellTimerEl = document.getElementById('after_downsell_timer');

      function luhnCheck(numStr) {
        var s = (numStr || '').replace(/\D+/g, '');
        if (s.length < 12) return false;
        var sum = 0;
        var shouldDouble = false;
        for (var i = s.length - 1; i >= 0; i--) {
          var digit = s.charCodeAt(i) - 48;
          if (digit < 0 || digit > 9) return false;
          if (shouldDouble) {
            digit = digit * 2;
            if (digit > 9) digit -= 9;
          }
          sum += digit;
          shouldDouble = !shouldDouble;
        }
        return sum % 10 === 0;
      }

      function ensureErrorEl(fieldEl) {
        if (!fieldEl) return null;
        var err = null;
        try {
          err = fieldEl.querySelector('._paymentErrorText');
        } catch (e) {
          err = null;
        }
        if (err) return err;
        try {
          err = document.createElement('div');
          err.className = '_paymentErrorText';
          err.style.display = 'none';
          fieldEl.appendChild(err);
          return err;
        } catch (e2) {
          return null;
        }
      }

      function setFieldError(inputEl, fieldEl, message) {
        try {
          if (inputEl && inputEl.classList) inputEl.classList.add('_inputError');
        } catch (e) {}
        var err = ensureErrorEl(fieldEl);
        if (err) {
          try {
            err.textContent = message || '';
            err.style.display = message ? '' : 'none';
          } catch (e2) {}
        }
      }

      function clearFieldError(inputEl, fieldEl) {
        try {
          if (inputEl && inputEl.classList) inputEl.classList.remove('_inputError');
        } catch (e) {}
        var err = null;
        try {
          err = fieldEl ? fieldEl.querySelector('._paymentErrorText') : null;
        } catch (e2) {
          err = null;
        }
        if (err) {
          try {
            err.textContent = '';
            err.style.display = 'none';
          } catch (e3) {}
        }
      }

      function parseExp(expStr) {
        var raw = (expStr || '').trim();
        var m = null;
        try {
          m = raw.match(/^(\d{1,2})\s*\/\s*(\d{2,4})$/);
        } catch (e) {
          m = null;
        }
        if (!m) return null;
        var mm = parseInt(m[1], 10);
        var yy = parseInt(m[2], 10);
        if (isNaN(mm) || isNaN(yy)) return null;
        if (mm < 1 || mm > 12) return { mm: mm, yy: yy, invalidMonth: true };
        if (m[2].length === 2) yy = 2000 + yy;
        if (yy < 2000 || yy > 2100) return null;

        var now = new Date();
        var curY = now.getFullYear();
        var curM = now.getMonth() + 1;
        if (yy < curY || (yy === curY && mm < curM)) return { mm: mm, yy: yy, expired: true };
        return { mm: mm, yy: yy };
      }

      function isEmailValid(email) {
        var e = (email || '').trim();
        if (!e) return false;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      }

      function getCheckoutForm() {
        try {
          return document.querySelector('#checkout-modal #payment-form-container_\\#123 ._simplePaymentForm');
        } catch (e) {
          return null;
        }
      }

      function getCreditCardFieldEls(formEl) {
        if (!formEl) return null;
        var fields = null;
        try {
          fields = formEl.querySelectorAll('._fakePaymentField');
        } catch (e) {
          fields = null;
        }
        if (!fields || fields.length < 4) return null;
        return {
          cardField: fields[0],
          expField: fields[1],
          cvcField: fields[2],
          emailField: fields[3],
          cardInput: fields[0].querySelector('input._fakePaymentInput'),
          expInput: fields[1].querySelector('input._fakePaymentInput'),
          cvcInput: fields[2].querySelector('input._fakePaymentInput'),
          emailInput: fields[3].querySelector('input._fakePaymentInput'),
        };
      }

      function validateCreditCardForm() {
        var form = getCheckoutForm();
        if (!form) return true;
        var els = getCreditCardFieldEls(form);
        if (!els) return true;

        clearFieldError(els.cardInput, els.cardField);
        clearFieldError(els.expInput, els.expField);
        clearFieldError(els.cvcInput, els.cvcField);
        clearFieldError(els.emailInput, els.emailField);

        var ok = true;

        var cardRaw = '';
        try {
          cardRaw = els.cardInput ? els.cardInput.value : '';
        } catch (e) {
          cardRaw = '';
        }
        var cardDigits = (cardRaw || '').replace(/\D+/g, '');
        if (cardDigits.length !== 16) {
          ok = false;
          setFieldError(els.cardInput, els.cardField, 'Card number must be 16 digits.');
        }

        var expRaw = '';
        try {
          expRaw = els.expInput ? els.expInput.value : '';
        } catch (e2) {
          expRaw = '';
        }
        var exp = parseExp(expRaw);
        if (!exp) {
          ok = false;
          setFieldError(els.expInput, els.expField, 'Enter the expiration date in MM/YY format.');
        } else if (exp.invalidMonth) {
          ok = false;
          setFieldError(els.expInput, els.expField, 'Month must be between 01 and 12.');
        } else if (exp.expired) {
          ok = false;
          setFieldError(els.expInput, els.expField, 'Card has expired.');
        }

        var cvcRaw = '';
        try {
          cvcRaw = els.cvcInput ? els.cvcInput.value : '';
        } catch (e3) {
          cvcRaw = '';
        }
        var cvcDigits = (cvcRaw || '').replace(/\D+/g, '');
        if (!(cvcDigits.length === 3 || cvcDigits.length === 4)) {
          ok = false;
          setFieldError(els.cvcInput, els.cvcField, 'CVC must be 3–4 digits.');
        }

        var emailRaw = '';
        try {
          emailRaw = els.emailInput ? els.emailInput.value : '';
        } catch (e4) {
          emailRaw = '';
        }
        if (!isEmailValid(emailRaw)) {
          ok = false;
          setFieldError(els.emailInput, els.emailField, 'Enter a valid email.');
        }

        return ok;
      }

      function showNewUsersBlockedModal() {
        var existing = null;
        try {
          existing = document.getElementById('new-users-blocked-modal-overlay');
        } catch (e) {
          existing = null;
        }
        if (!existing) {
          try {
            var ov = document.createElement('div');
            ov.id = 'new-users-blocked-modal-overlay';
            ov.style.position = 'fixed';
            ov.style.left = '0';
            ov.style.top = '0';
            ov.style.right = '0';
            ov.style.bottom = '0';
            ov.style.background = 'rgba(0,0,0,0.65)';
            ov.style.zIndex = '2147483647';
            ov.style.display = 'flex';
            ov.style.alignItems = 'center';
            ov.style.justifyContent = 'center';
            ov.style.padding = '16px';

            var box = document.createElement('div');
            box.style.position = 'relative';
            box.style.width = '100%';
            box.style.maxWidth = '420px';
            box.style.background = '#ffffff';
            box.style.borderRadius = '12px';
            box.style.padding = '18px 16px 16px';
            box.style.boxSizing = 'border-box';
            box.style.fontFamily = 'Manrope, sans-serif';
            box.style.color = '#111';

            var close = document.createElement('button');
            close.type = 'button';
            close.setAttribute('aria-label', 'Close');
            close.textContent = '×';
            close.style.position = 'absolute';
            close.style.top = '8px';
            close.style.right = '10px';
            close.style.border = 'none';
            close.style.background = 'transparent';
            close.style.fontSize = '24px';
            close.style.lineHeight = '24px';
            close.style.cursor = 'pointer';
            close.style.color = '#111';

            var txt = document.createElement('div');
            txt.textContent = 'Sorry, we are not accepting new users at this time';
            txt.style.fontSize = '16px';
            txt.style.lineHeight = '22px';
            txt.style.fontWeight = '700';
            txt.style.paddingTop = '8px';

            box.appendChild(close);
            box.appendChild(txt);
            ov.appendChild(box);
            document.body.appendChild(ov);

            function hide() {
              try {
                if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
              } catch (e) {}
              try {
                document.removeEventListener('keydown', onKey);
              } catch (e2) {}
            }

            function onKey(e) {
              try {
                if (e && (e.key === 'Escape' || e.keyCode === 27)) hide();
              } catch (err) {}
            }

            try {
              close.addEventListener('click', function (e) {
                try {
                  if (e && e.preventDefault) e.preventDefault();
                } catch (err) {}
                hide();
              });
            } catch (e3) {}

            try {
              ov.addEventListener('click', function (e) {
                try {
                  if (e && e.target === ov) hide();
                } catch (err) {}
              });
            } catch (e4) {}

            try {
              document.addEventListener('keydown', onKey);
            } catch (e5) {}

            existing = ov;
          } catch (e6) {
            existing = null;
          }
        }
      }

      function bindOneClickBlockedModal() {
        try {
          if (!overlay) return;
          if (overlay.getAttribute('data-one-click-blocked-bound') === '1') return;
          overlay.setAttribute('data-one-click-blocked-bound', '1');

          function wireEl(el) {
            if (!el || !el.addEventListener) return;
            if (el.getAttribute && el.getAttribute('data-blocked-bound') === '1') return;
            try {
              if (el.setAttribute) el.setAttribute('data-blocked-bound', '1');
            } catch (e) {}
            try {
              el.addEventListener('click', function (e) {
                try {
                  if (e) {
                    if (e.preventDefault) e.preventDefault();
                    if (e.stopPropagation) e.stopPropagation();
                  }
                } catch (err) {}
                try {
                  showNewUsersBlockedModal();
                } catch (e2) {}
                return false;
              });
            } catch (e3) {}
          }

          var paypalBtn = null;
          try {
            paypalBtn = document.getElementById('pay_btn_pay_pal');
          } catch (e4) {
            paypalBtn = null;
          }
          wireEl(paypalBtn);

          var appleWrap = null;
          try {
            appleWrap = document.getElementById('apple-pay-button-container_#123');
          } catch (e5) {
            appleWrap = null;
          }
          wireEl(appleWrap);
          try {
            if (appleWrap) wireEl(appleWrap.querySelector('[role="button"]'));
          } catch (e6) {}

          var gpayWrap = null;
          try {
            gpayWrap = document.getElementById('google-pay-button-container_#123');
          } catch (e7) {
            gpayWrap = null;
          }
          if (gpayWrap) {
            try {
              var ifr = gpayWrap.querySelector('iframe');
              if (ifr && ifr.style) ifr.style.pointerEvents = 'none';
            } catch (e8) {}
          }
          wireEl(gpayWrap);
          try {
            if (gpayWrap) wireEl(gpayWrap.querySelector('[role="button"]'));
          } catch (e9) {}
        } catch (e10) {}
      }

      function bindCreditCardValidation() {
        var form = getCheckoutForm();
        if (!form) return;
        if (form.getAttribute('data-cc-validation-bound') === '1') return;
        form.setAttribute('data-cc-validation-bound', '1');

        function getPaySuccessUrl() {
          try {
            var u = new URL(window.location.href);
            try {
              u.searchParams.set('Pay', 'success');
            } catch (e2) {}
            return u.toString();
          } catch (e) {
            try {
              var href = String(window.location.href || '');
              var hash = '';
              var hi = href.indexOf('#');
              if (hi >= 0) {
                hash = href.slice(hi);
                href = href.slice(0, hi);
              }
              var qi = href.indexOf('?');
              if (qi < 0) return href + '?Pay=success' + hash;
              if (href.indexOf('Pay=') >= 0) {
                href = href.replace(/([?&])Pay=[^&]*/i, '$1Pay=success');
                return href + hash;
              }
              return href + '&Pay=success' + hash;
            } catch (e3) {
              return '?Pay=success';
            }
          }
        }

        function formatCardNumber(v) {
          var digits = (v || '').replace(/\D+/g, '').slice(0, 16);
          var out = '';
          for (var i = 0; i < digits.length; i++) {
            if (i > 0 && i % 4 === 0) out += ' ';
            out += digits.charAt(i);
          }
          return out;
        }

        function formatExp(v) {
          var digits = (v || '').replace(/\D+/g, '').slice(0, 4);
          if (digits.length <= 2) return digits;
          return digits.slice(0, 2) + '/' + digits.slice(2);
        }

        function formatCvc(v) {
          return (v || '').replace(/\D+/g, '').slice(0, 4);
        }

        var btn = null;
        try {
          btn = form.querySelector('button._simplePaymentButton');
        } catch (e) {
          btn = null;
        }

        var els = getCreditCardFieldEls(form);

        if (btn && btn.addEventListener) {
          btn.addEventListener('click', function (e) {
            if (!validateCreditCardForm()) {
              try {
                if (e && e.preventDefault) e.preventDefault();
              } catch (err) {}
              return;
            }
            try {
              if (e && e.preventDefault) e.preventDefault();
            } catch (err2) {}
            try {
              try {
                if (window.history && window.history.replaceState) {
                  window.history.replaceState(null, document.title, getPaySuccessUrl());
                }
              } catch (e3) {}
              showNewUsersBlockedModal();
            } catch (e2) {}
            return;
          });
        }

        if (els) {
          var inputs = [els.cardInput, els.expInput, els.cvcInput, els.emailInput];
          for (var i = 0; i < inputs.length; i++) {
            (function (inp) {
              if (!inp || !inp.addEventListener) return;
              inp.addEventListener('input', function () {
                try {
                  if (inp === els.cardInput) {
                    var nv = formatCardNumber(inp.value);
                    if (inp.value !== nv) inp.value = nv;
                    clearFieldError(els.cardInput, els.cardField);
                  } else if (inp === els.expInput) {
                    var ev = formatExp(inp.value);
                    if (inp.value !== ev) inp.value = ev;
                    clearFieldError(els.expInput, els.expField);
                  } else if (inp === els.cvcInput) {
                    var cv = formatCvc(inp.value);
                    if (inp.value !== cv) inp.value = cv;
                    clearFieldError(els.cvcInput, els.cvcField);
                  } else if (inp === els.emailInput) {
                    clearFieldError(els.emailInput, els.emailField);
                  }
                } catch (e) {}
              });
            })(inputs[i]);
          }
        }
      }
      var afterDownsellTimerId = 0;
      var afterDownsellRemainingCs = 0;

      var modal4 = document.getElementById('checkout-modal-4-offer');
      var modal4CloseBtn = document.getElementById('checkout_modal4_close_btn');
      var modal4ClaimBtn = document.getElementById('modal4_claim_btn');

      var appliedDiscountPlanId = '';
      var appliedDiscountPriceText = '';
      var closeBtn =
        document.getElementById('checkout-modal-close') ||
        document.getElementById('close_modal_wind');

      function getMainPlans() {
        var out = [];
        try {
          for (var i = 0; i < 3; i++) {
            var el = document.getElementById('subscription_' + i);
            if (el) out.push(el);
          }
        } catch (e) {}
        return out;
      }

      function parsePercent(text) {
        var m = null;
        try {
          m = String(text || '').match(/(\d+)/);
        } catch (e) {
          m = null;
        }
        if (!m) return null;
        var n = parseInt(m[1], 10);
        if (!isFinite(n) || isNaN(n)) return null;
        return n;
      }

      function parseNumber(text) {
        var m = null;
        try {
          m = String(text || '').match(/(\d+(?:[\.,]\d+)?)/);
        } catch (e) {
          m = null;
        }
        if (!m) return null;
        var n = parseFloat(m[1].replace(',', '.'));
        if (!isFinite(n) || isNaN(n)) return null;
        return n;
      }

      function formatMoney(n) {
        if (!isFinite(n) || isNaN(n)) return '';
        return n.toFixed(2);
      }

      function extractCurrentPriceText(planEl) {
        if (!planEl) return '';
        var priceEl = null;
        try {
          priceEl = planEl.querySelector('._currentFullPrice_8sdsc_185');
        } catch (e) {
          priceEl = null;
        }
        var raw = '';
        try {
          raw = (priceEl && priceEl.textContent) || '';
        } catch (e) {
          raw = '';
        }
        var num = parseNumber(raw);
        if (num === null) return '';
        return '$' + formatMoney(num);
      }

      function setCheckoutTotalText(priceText) {
        if (!priceText) return;
        var checkoutTotalP = null;
        try {
          checkoutTotalP = document.querySelector('p._totalPrice_d5uie_74');
        } catch (e) {
          checkoutTotalP = null;
        }
        if (!checkoutTotalP) return;
        try {
          var s = checkoutTotalP.querySelector('span');
          if (s) {
            checkoutTotalP.innerHTML = '';
            checkoutTotalP.appendChild(s);
            checkoutTotalP.appendChild(document.createTextNode(' ' + priceText));
          } else {
            checkoutTotalP.textContent = 'Total ' + priceText;
          }
        } catch (e) {}
      }

      function setMainSelectedPlanById(planId) {
        if (!planId) return;
        var selectedClass = '_selected_8sdsc_52';
        var plans = getMainPlans();
        for (var i = 0; i < plans.length; i++) {
          try {
            if (plans[i].classList) plans[i].classList.remove(selectedClass);
          } catch (e) {}
        }
        var el = document.getElementById(planId);
        if (el) {
          try {
            if (el.classList) el.classList.add(selectedClass);
          } catch (e) {}
        }
      }

      function applyDownsellDiscountToPlan(planEl) {
        if (!planEl) return;
        var badge = null;
        var prev = null;
        var cur = null;
        try {
          badge = planEl.querySelector('._discountBadge_8sdsc_106');
        } catch (e) {
          badge = null;
        }
        try {
          prev = planEl.querySelector('._prevFullPrice_8sdsc_181');
        } catch (e) {
          prev = null;
        }
        try {
          cur = planEl.querySelector('._currentFullPrice_8sdsc_185');
        } catch (e) {
          cur = null;
        }
        var prevNum = parseNumber(prev ? prev.textContent : '');
        var basePct = parsePercent(badge ? badge.textContent : '');
        if (prevNum === null || basePct === null) return;
        var pct = basePct + 5;
        if (pct > 90) pct = 90;
        var next = prevNum * (1 - pct / 100);
        if (badge) {
          try {
            badge.textContent = pct + '% OFF';
          } catch (e) {}
        }
        if (cur) {
          try {
            cur.textContent = formatMoney(next) + ' USD';
          } catch (e) {}
        }
      }

      function buildDownSellPlans() {
        if (!downSellProducts) return;
        try {
          downSellProducts.innerHTML = '';
        } catch (e) {}
        var srcPlans = getMainPlans();
        if (!srcPlans || !srcPlans.length) return;

        var selectedClass = '_selected_8sdsc_52';
        var selectedId = '';
        for (var i = 0; i < srcPlans.length; i++) {
          try {
            if (srcPlans[i].classList && srcPlans[i].classList.contains(selectedClass)) {
              selectedId = srcPlans[i].id;
              break;
            }
          } catch (e) {}
        }
        if (!selectedId) selectedId = 'subscription_1';

        var selectedPlanEl = null;
        for (var j = 0; j < srcPlans.length; j++) {
          if (srcPlans[j] && srcPlans[j].id === selectedId) {
            selectedPlanEl = srcPlans[j];
            break;
          }
        }
        if (!selectedPlanEl) return;

        var clone = null;
        try {
          clone = selectedPlanEl.cloneNode(true);
        } catch (e) {
          clone = null;
        }
        if (!clone) return;

        var baseId = selectedPlanEl.id;
        try {
          clone.setAttribute('data-source-plan-id', baseId);
        } catch (e) {}
        try {
          clone.id = 'base_downsell_' + baseId;
        } catch (e) {}

        try {
          if (clone.classList) clone.classList.remove(selectedClass);
        } catch (e) {}
        if (baseId === selectedId) {
          try {
            if (clone.classList) clone.classList.add(selectedClass);
          } catch (e) {}
        }

        try {
          applyDownsellDiscountToPlan(clone);
        } catch (e) {}

        (function (planEl) {
          if (!planEl || !planEl.addEventListener) return;
          planEl.addEventListener('click', function (e) {
            try {
              if (e && e.preventDefault) e.preventDefault();
            } catch (err) {}

            try {
              var kids = downSellProducts.querySelectorAll('.subscription_price');
              for (var k = 0; k < kids.length; k++) {
                try {
                  if (kids[k].classList) kids[k].classList.remove(selectedClass);
                } catch (e2) {}
              }
            } catch (e3) {}

            try {
              if (planEl.classList) planEl.classList.add(selectedClass);
            } catch (e4) {}
          });
        })(clone);

        try {
          downSellProducts.appendChild(clone);
        } catch (e) {}
      }

      function isDownSellOpen() {
        if (!downSell) return false;
        try {
          return !downSell.style || downSell.style.display !== 'none';
        } catch (e) {
          return false;
        }
      }

      function isAfterDownsellOpen() {
        if (!afterDownsell) return false;
        try {
          return !afterDownsell.style || afterDownsell.style.display !== 'none';
        } catch (e) {
          return false;
        }
      }

      function isModal4Open() {
        if (!modal4) return false;
        try {
          return !modal4.style || modal4.style.display !== 'none';
        } catch (e) {
          return false;
        }
      }

      function stopDownSellTimer() {
        if (downSellTimerId) {
          try {
            clearInterval(downSellTimerId);
          } catch (e) {}
          downSellTimerId = 0;
        }
      }

      function stopAfterDownsellTimerScoped() {
        if (afterDownsellTimerId) {
          try {
            clearInterval(afterDownsellTimerId);
          } catch (e) {}
          afterDownsellTimerId = 0;
        }
      }

      function renderAfterDownsellTimerScoped() {
        if (!afterDownsellTimerEl) return;
        try {
          afterDownsellTimerEl.textContent = formatCs(afterDownsellRemainingCs);
        } catch (e) {}
      }

      function startAfterDownsellTimerScoped() {
        stopAfterDownsellTimerScoped();
        afterDownsellRemainingCs = 60 * 100;
        renderAfterDownsellTimerScoped();
        afterDownsellTimerId = setInterval(function () {
          if (afterDownsellRemainingCs <= 0) {
            afterDownsellRemainingCs = 0;
            renderAfterDownsellTimerScoped();
            stopAfterDownsellTimerScoped();
            return;
          }
          afterDownsellRemainingCs -= 1;
          if (afterDownsellRemainingCs < 0) afterDownsellRemainingCs = 0;
          renderAfterDownsellTimerScoped();
        }, 10);
      }

      function renderDownSellTimer() {
        if (!downSellTimerEl) return;
        try {
          downSellTimerEl.textContent = formatCs(downSellRemainingCs);
        } catch (e) {}
      }

      function startDownSellTimer() {
        stopDownSellTimer();
        downSellRemainingCs = 60 * 100;
        renderDownSellTimer();
        downSellTimerId = setInterval(function () {
          if (downSellRemainingCs <= 0) {
            downSellRemainingCs = 0;
            renderDownSellTimer();
            stopDownSellTimer();
            return;
          }
          downSellRemainingCs -= 1;
          if (downSellRemainingCs < 0) downSellRemainingCs = 0;
          renderDownSellTimer();
        }, 10);
      }

      function openDownSell() {
        if (!downSell) return;
        try {
          buildDownSellPlans();
        } catch (e) {}
        try {
          downSell.style.display = '';
        } catch (e) {}
        try {
          document.body.style.overflow = 'hidden';
        } catch (e) {}

        try {
          if (downSellSkipBtn) downSellSkipBtn.removeAttribute('disabled');
          if (downSellApplyBtn) downSellApplyBtn.removeAttribute('disabled');
        } catch (e) {}
        try {
          startDownSellTimer();
        } catch (e) {}
      }

      function openAfterDownsell() {
        if (!afterDownsell) return;
        try {
          afterDownsell.style.display = '';
        } catch (e) {}
        try {
          document.body.style.overflow = 'hidden';
        } catch (e) {}

        try {
          if (afterDownsellLoseBtn) afterDownsellLoseBtn.removeAttribute('disabled');
          if (afterDownsellAnswerBtn) afterDownsellAnswerBtn.removeAttribute('disabled');
        } catch (e) {}

        try {
          startAfterDownsellTimerScoped();
        } catch (e) {}
      }

      function closeAfterDownsell() {
        if (!afterDownsell) return;
        try {
          afterDownsell.style.display = 'none';
        } catch (e) {}
        try {
          stopAfterDownsellTimerScoped();
        } catch (e) {}

        try {
          var anyOpen = false;
          if (overlay && overlay.classList && overlay.classList.contains('_open')) anyOpen = true;
          if (isExitOfferOpen()) anyOpen = true;
          if (isDownSellOpen()) anyOpen = true;
          if (isAfterDownsellOpen()) anyOpen = true;
          if (isModal4Open()) anyOpen = true;
          if (!anyOpen) document.body.style.overflow = '';
        } catch (e) {}
      }

      function openModal4() {
        if (!modal4) return;
        try {
          modal4.style.display = '';
        } catch (e) {}
        try {
          document.body.style.overflow = 'hidden';
        } catch (e) {}

        try {
          if (modal4ClaimBtn) modal4ClaimBtn.removeAttribute('disabled');
        } catch (e) {}
      }

      function closeModal4() {
        if (!modal4) return;
        try {
          modal4.style.display = 'none';
        } catch (e) {}

        try {
          var anyOpen = false;
          if (overlay && overlay.classList && overlay.classList.contains('_open')) anyOpen = true;
          if (isExitOfferOpen()) anyOpen = true;
          if (isDownSellOpen()) anyOpen = true;
          if (isAfterDownsellOpen()) anyOpen = true;
          if (isModal4Open()) anyOpen = true;
          if (!anyOpen) document.body.style.overflow = '';
        } catch (e) {}
      }

      function closeDownSell() {
        if (!downSell) return;
        try {
          downSell.style.display = 'none';
        } catch (e) {}
        try {
          stopDownSellTimer();
        } catch (e) {}

        // If nothing else is open, unlock scroll
        try {
          var anyOpen = false;
          if (overlay && overlay.classList && overlay.classList.contains('_open')) anyOpen = true;
          if (isExitOfferOpen()) anyOpen = true;
          if (isDownSellOpen()) anyOpen = true;
          if (isAfterDownsellOpen()) anyOpen = true;
          if (isModal4Open()) anyOpen = true;
          if (!anyOpen) document.body.style.overflow = '';
        } catch (e) {}
      }

      try {
        if (
          overlay &&
          document &&
          document.body &&
          overlay.parentNode !== document.body
        ) {
          document.body.appendChild(overlay);
        }
      } catch (e) {}

      try {
        if (
          exitOffer &&
          document &&
          document.body &&
          exitOffer.parentNode !== document.body
        ) {
          document.body.appendChild(exitOffer);
        }
      } catch (e) {}

      try {
        if (
          downSell &&
          document &&
          document.body &&
          downSell.parentNode !== document.body
        ) {
          document.body.appendChild(downSell);
        }
      } catch (e) {}

      try {
        if (overlay && overlay.classList) overlay.classList.remove('_open');
      } catch (e) {}

      function isExitOfferOpen() {
        if (!exitOffer) return false;
        try {
          return !exitOffer.style || exitOffer.style.display !== 'none';
        } catch (e) {
          return false;
        }
      }

      function openExitOffer() {
        if (!exitOffer) return;
        try {
          exitOffer.style.display = '';
        } catch (e) {}
        try {
          document.body.style.overflow = 'hidden';
        } catch (e) {}

        try {
          if (exitOfferLoseBtn) exitOfferLoseBtn.removeAttribute('disabled');
          if (exitOfferBackBtn) exitOfferBackBtn.removeAttribute('disabled');
        } catch (e) {}

        // Start countdown from 60.00 seconds
        try {
          startExitOfferTimer();
        } catch (e) {}
      }

      function closeExitOffer() {
        if (!exitOffer) return;
        try {
          exitOffer.style.display = 'none';
        } catch (e) {}

        try {
          stopExitOfferTimer();
        } catch (e) {}
      }

      function stopExitOfferTimer() {
        if (exitOfferTimerId) {
          try {
            clearInterval(exitOfferTimerId);
          } catch (e) {}
          exitOfferTimerId = 0;
        }
      }

      function formatCs(cs) {
        cs = Math.max(0, Math.floor(cs || 0));
        var sec = Math.floor(cs / 100);
        var c = cs % 100;
        var cStr = c < 10 ? '0' + c : '' + c;
        return sec + '.' + cStr;
      }

      function renderExitOfferTimer() {
        if (!exitOfferTimerEl) return;
        try {
          exitOfferTimerEl.textContent = formatCs(exitOfferRemainingCs);
        } catch (e) {}
      }

      function startExitOfferTimer() {
        stopExitOfferTimer();
        exitOfferRemainingCs = 60 * 100;
        renderExitOfferTimer();
        exitOfferTimerId = setInterval(function () {
          if (exitOfferRemainingCs <= 0) {
            exitOfferRemainingCs = 0;
            renderExitOfferTimer();
            stopExitOfferTimer();
            return;
          }
          exitOfferRemainingCs -= 1;
          if (exitOfferRemainingCs < 0) exitOfferRemainingCs = 0;
          renderExitOfferTimer();
        }, 10);
      }

      function openCheckout() {
        if (!overlay) return;

        try {
          var overlays = document.querySelectorAll('#checkout-modal-overlay');
          if (overlays && overlays.length > 1) {
            for (var oi = 0; oi < overlays.length; oi++) {
              if (overlays[oi] !== overlay && overlays[oi] && overlays[oi].parentNode) {
                overlays[oi].parentNode.removeChild(overlays[oi]);
              }
            }
          }
        } catch (e) {}

        try {
          if (
            document &&
            document.body &&
            overlay.parentNode &&
            overlay.parentNode !== document.body
          ) {
            document.body.appendChild(overlay);
          }
        } catch (e) {}

        try {
          if (overlay.classList) overlay.classList.add('_open');
        } catch (e) {
        }

        try {
          var checkoutContainer = document.querySelector('._container_d5uie_61');
          if (checkoutContainer) {
            var sections = checkoutContainer.querySelectorAll('._sectionContainer_d5uie_153');
            if (sections && sections.length >= 2) {
              for (var si = 0; si < sections.length; si++) {
                try {
                  if (sections[si].classList)
                    sections[si].classList.toggle('_active_d5uie_160', si === 0);
                } catch (e2) {}
                try {
                  var btn = sections[si].querySelector('button._buttonControl_xhd79_40');
                  if (btn && btn.classList)
                    btn.classList.toggle('_active_xhd79_48', si === 0);
                } catch (e3) {}
              }
            }
          }
        } catch (e) {}

        try {
          document.body.style.overflow = 'hidden';
        } catch (e) {}

        // If a downsell discount was applied, keep the checkout Total in sync.
        try {
          if (appliedDiscountPriceText) setCheckoutTotalText(appliedDiscountPriceText);
        } catch (e) {}

        try {
          bindCreditCardValidation();
        } catch (e) {}

        try {
          bindOneClickBlockedModal();
        } catch (e2) {}
      }

      function closeCheckout() {
        if (!overlay) return;
        try {
          if (overlay.classList) overlay.classList.remove('_open');
        } catch (e) {
        }
        try {
          document.body.style.overflow = '';
        } catch (e) {}
      }

      function attemptCloseCheckout() {
        if (isExitOfferOpen()) return;
        openExitOffer();
      }

      if (payBtn && payBtn.addEventListener) {
        payBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          openCheckout();
        });
      }

      try {
        if (document && document.body && document.body.getAttribute('data-start-chatting-bound') !== '1') {
          document.body.setAttribute('data-start-chatting-bound', '1');
          try {
            var allBtns = document.querySelectorAll('button');
            for (var bi = 0; bi < allBtns.length; bi++) {
              (function (b) {
                if (!b || !b.addEventListener) return;
                var t = '';
                try {
                  t = (b.textContent || '').trim();
                } catch (e2) {
                  t = '';
                }
                if (t !== 'Start Chatting') return;
                b.addEventListener('click', function (e) {
                  try {
                    if (e && e.preventDefault) e.preventDefault();
                  } catch (err) {}
                  openCheckout();
                });
              })(allBtns[bi]);
            }
          } catch (e) {}
        }
      } catch (e) {}

      if (closeBtn && closeBtn.addEventListener) {
        closeBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          attemptCloseCheckout();
        });
      }

      if (exitOfferBackBtn && exitOfferBackBtn.addEventListener) {
        exitOfferBackBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeExitOffer();
          openCheckout();
        });
      }

      if (exitOfferLoseBtn && exitOfferLoseBtn.addEventListener) {
        exitOfferLoseBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeExitOffer();
          closeCheckout();
          openDownSell();
        });
      }

      if (downSellSkipBtn && downSellSkipBtn.addEventListener) {
        downSellSkipBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeDownSell();
          openAfterDownsell();
        });
      }

      if (afterDownsellAnswerBtn && afterDownsellAnswerBtn.addEventListener) {
        afterDownsellAnswerBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeAfterDownsell();
          openDownSell();
        });
      }

      if (afterDownsellLoseBtn && afterDownsellLoseBtn.addEventListener) {
        afterDownsellLoseBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeAfterDownsell();
          openModal4();
        });
      }

      if (modal4CloseBtn && modal4CloseBtn.addEventListener) {
        modal4CloseBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeModal4();
        });
      }

      if (modal4ClaimBtn && modal4ClaimBtn.addEventListener) {
        modal4ClaimBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          closeModal4();
          openCheckout();
        });
      }

      if (downSellApplyBtn && downSellApplyBtn.addEventListener) {
        downSellApplyBtn.addEventListener('click', function (e) {
          try {
            if (e && e.preventDefault) e.preventDefault();
          } catch (err) {}
          var selected = null;
          try {
            selected = downSellProducts
              ? downSellProducts.querySelector('.subscription_price._selected_8sdsc_52')
              : null;
          } catch (e2) {
            selected = null;
          }

          var srcId = '';
          try {
            srcId = selected ? selected.getAttribute('data-source-plan-id') : '';
          } catch (e3) {
            srcId = '';
          }

          if (!srcId) srcId = 'subscription_1';
          appliedDiscountPlanId = srcId;
          appliedDiscountPriceText = selected ? extractCurrentPriceText(selected) : '';

          closeDownSell();
          openCheckout();

          try {
            setMainSelectedPlanById(appliedDiscountPlanId);
          } catch (e4) {}
          try {
            if (appliedDiscountPriceText) setCheckoutTotalText(appliedDiscountPriceText);
          } catch (e5) {}
        });
      }

      try {
        var checkoutContainer = document.querySelector('._container_d5uie_61');
        if (checkoutContainer) {
          var sections = checkoutContainer.querySelectorAll('._sectionContainer_d5uie_153');
          if (sections && sections.length >= 2) {
            (function () {
              function setActiveSection(activeIndex) {
                for (var si = 0; si < sections.length; si++) {
                  try {
                    if (sections[si].classList)
                      sections[si].classList.toggle('_active_d5uie_160', si === activeIndex);
                  } catch (e2) {}
                  try {
                    var btn = sections[si].querySelector('button._buttonControl_xhd79_40');
                    if (btn && btn.classList)
                      btn.classList.toggle('_active_xhd79_48', si === activeIndex);
                  } catch (e3) {}
                }
              }

              for (var si = 0; si < sections.length; si++) {
                (function (idx) {
                  try {
                    var btn = sections[idx].querySelector('button._buttonControl_xhd79_40');
                    if (btn && btn.addEventListener)
                      btn.addEventListener('click', function (e) {
                        try {
                          if (e && e.preventDefault) e.preventDefault();
                        } catch (err) {}
                        setActiveSection(idx);
                      });
                  } catch (e2) {}
                })(si);
              }

              try {
                setActiveSection(0);
              } catch (e2) {}
            })();
          }
        }
      } catch (e) {}

      document.addEventListener('keydown', function (e) {
        try {
          if (!overlay) return;
          try {
            if (overlay.classList && !overlay.classList.contains('_open')) return;
          } catch (e2) {}
          try {
            if (overlay.style && overlay.style.display === 'none') return;
          } catch (e3) {}
          var key = e && (e.key || e.code);
          if (key === 'Escape') closeCheckout();
        } catch (err) {}
      });
    } catch (e) {}

    try {
      var selectedClass = '_selected_8sdsc_52';
      var plans = document.querySelectorAll('#subscription_0, #subscription_1, #subscription_2');
      var checkoutTotal = document.getElementById('checkout-total');
      var checkoutTotalP = null;
      try {
        checkoutTotalP = document.querySelector('p._totalPrice_d5uie_74');
      } catch (e) {
        checkoutTotalP = null;
      }

      function extractPrice(planEl) {
        if (!planEl) return '';
        var priceEl = null;
        try {
          priceEl = planEl.querySelector('._currentFullPrice_8sdsc_185');
        } catch (e) {
          priceEl = null;
        }
        var raw = '';
        try {
          raw = (priceEl && priceEl.textContent) || '';
        } catch (e) {
          raw = '';
        }
        var m = null;
        try {
          m = raw.match(/(\d+(?:[\.,]\d+)?)/);
        } catch (e) {
          m = null;
        }
        if (!m || !m[1]) return '';
        var num = m[1].replace(',', '.');
        return '$' + num;
      }

      function setSelectedPlan(planEl) {
        if (!plans || !plans.length || !planEl) return;

        for (var i = 0; i < plans.length; i++) {
          try {
            if (plans[i].classList) plans[i].classList.remove(selectedClass);
          } catch (e) {}
        }

        try {
          if (planEl.classList) planEl.classList.add(selectedClass);
        } catch (e) {}

        var p = extractPrice(planEl);
        if (p) {
          if (checkoutTotal) {
            try {
              checkoutTotal.textContent = p;
            } catch (e) {}
          } else if (checkoutTotalP) {
            try {
              // Keep original markup: <p><span>Total</span> $X</p>
              var s = checkoutTotalP.querySelector('span');
              if (s) {
                checkoutTotalP.innerHTML = '';
                checkoutTotalP.appendChild(s);
                checkoutTotalP.appendChild(document.createTextNode(' ' + p));
              } else {
                checkoutTotalP.textContent = 'Total ' + p;
              }
            } catch (e) {}
          }
        }
      }

      for (var j = 0; j < plans.length; j++) {
        (function (planEl) {
          if (!planEl || !planEl.addEventListener) return;

          planEl.addEventListener('click', function (e) {
            try {
              if (e && e.preventDefault) e.preventDefault();
            } catch (err) {}
            setSelectedPlan(planEl);
          });

          planEl.addEventListener('keydown', function (e) {
            var k = e && (e.key || e.code);
            if (k === 'Enter' || k === ' ' || k === 'Spacebar') {
              try {
                if (e && e.preventDefault) e.preventDefault();
              } catch (err) {}
              setSelectedPlan(planEl);
            }
          });
        })(plans[j]);
      }

      for (var k = 0; k < plans.length; k++) {
        try {
          if (plans[k].classList && plans[k].classList.contains(selectedClass)) {
            setSelectedPlan(plans[k]);
            break;
          }
        } catch (e) {}
      }
    } catch (e) {}

  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wire);
  } else {
    wire();
  }
})();
