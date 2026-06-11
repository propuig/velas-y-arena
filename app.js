// DOM Content Loaded Handler
document.addEventListener('DOMContentLoaded', () => {
  initSlides();
  initInteractiveMap();
  initComparisonTable();
  initSailingQuiz();
  initResortGalleries();
});


/* ==========================================
   SLIDE DECK NAVIGATION LOGIC
   ========================================== */
function initSlides() {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  const slideNum = document.getElementById('slide-num');
  const indicatorContainer = document.getElementById('indicators');
  const sidebarLinks = document.querySelectorAll('.nav-link');
  
  let currentSlide = 0;
  const totalSlides = slides.length;
  
  // Create indicators
  slides.forEach((_, idx) => {
    const dot = document.createElement('div');
    dot.className = `indicator-dot ${idx === 0 ? 'active' : ''}`;
    dot.addEventListener('click', () => goToSlide(idx));
    indicatorContainer.appendChild(dot);
  });
  
  const dots = document.querySelectorAll('.indicator-dot');
  
  function updateControls() {
    prevBtn.disabled = currentSlide === 0;
    nextBtn.disabled = currentSlide === totalSlides - 1;
    slideNum.textContent = `${currentSlide + 1} / ${totalSlides}`;
    
    dots.forEach((dot, idx) => {
      dot.className = `indicator-dot ${idx === currentSlide ? 'active' : ''}`;
    });
    
    sidebarLinks.forEach(link => {
      const targetSlide = parseInt(link.getAttribute('data-slide'));
      if (targetSlide === currentSlide) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
  
  function goToSlide(index) {
    if (index < 0 || index >= totalSlides) return;
    
    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'past', 'future');
      if (idx < index) {
        slide.classList.add('past');
      } else if (idx > index) {
        slide.classList.add('future');
      } else {
        slide.classList.add('active');
      }
    });
    
    currentSlide = index;
    updateControls();
  }
  
  // Next/Prev Listeners
  prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));
  
  // Sidebar links
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetSlide = parseInt(link.getAttribute('data-slide'));
      goToSlide(targetSlide);
    });
  });
  
  // Keyboard Navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    }
  });

  // Touch Swipe for Mobile Support
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  let swipeLocked = false; // true when touch starts inside a scrollable/interactive area

  // Elements where horizontal swipe should scroll content, not change slide
  const swipeBlockSelectors = [
    '.table-wrapper',
    '.comparison-table',
    '.quiz-container',
    '.quiz-option',
    '.quiz-options',
    '.nav-links',
    '.slide-grid',
    '.filter-select',
    'select',
    'input',
    'button'
  ];

  function isInsideScrollableOrInteractive(target) {
    return swipeBlockSelectors.some(sel => target.closest(sel) !== null);
  }

  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    swipeLocked = isInsideScrollableOrInteractive(e.target);
  }, { passive: true });

  document.addEventListener('touchend', (e) => {
    if (swipeLocked) return;
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const threshold = 60;
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    // Only treat as horizontal swipe if horizontal movement dominates
    if (Math.abs(dx) < Math.abs(dy) * 1.5) return;
    if (dx < -threshold) {
      // Swipe Left -> Next Slide
      if (currentSlide < totalSlides - 1) goToSlide(currentSlide + 1);
    } else if (dx > threshold) {
      // Swipe Right -> Prev Slide
      if (currentSlide > 0) goToSlide(currentSlide - 1);
    }
  }

  // Initialize view
  goToSlide(0);
}

/* ==========================================
   INTERACTIVE MAP LOGIC
   ========================================== */
const regionData = {
  cabarete: {
    title: "Bahía de Cabarete (Costa Norte)",
    desc: "La capital del windsurf y kitesurf del Caribe. Cabarete experimenta vientos alisios térmicos constantes (15-22 nudos) y oleaje regular en la orilla, creando un entorno de alta energía ideal para la navegación activa y clínicas avanzadas de alto rendimiento.",
    resorts: ["Viva Wyndham Tangerine"],
    conditions: "Marejadilla, olas rompientes, viento térmico fuerte (15-22 nds)"
  },
  punta_cana: {
    title: "Punta Cana y Cap Cana",
    desc: "El principal centro del turismo dominicano. Conocido por kilómetros de playas de arena blanca, lagunas calmas protegidas por arrecifes de coral y vientos alisios suaves del este (10-15 nudos), lo que lo convierte en el lugar ideal para principiantes y paseos tranquilos en Hobie Cat.",
    resorts: ["Club Med Punta Cana", "Iberostar Waves Punta Cana"],
    conditions: "Agua calma, viento constante moderado (10-15 nds)"
  },
  la_romana: {
    title: "La Romana y Bayahibe",
    desc: "Situado en el lado caribeño más tranquilo de la isla. La playa de Bayahibe y las aguas alrededor de Casa de Campo ofrecen condiciones excepcionalmente tranquilas y cristalinas con vientos suaves, perfecto para familias y paseos relajados.",
    resorts: ["Casa de Campo Resort & Villas", "Bahia Principe Explore La Romana"],
    conditions: "Aguas tranquilas, viento suave (6-11 nds)"
  },
  samana: {
    title: "Península de Samaná (El Portillo)",
    desc: "Un paraíso ecoturístico con playas doradas y acantilados. La costa norte experimenta vientos y olas más fuertes del Atlántico, ofreciendo un campo de juego ideal para navegantes intermedios y avanzados que buscan velocidad y emoción.",
    resorts: ["Bahia Principe Grand El Portillo"],
    conditions: "Oleaje de océano abierto, viento moderado a fuerte (12-20 nds)"
  }
};

function initInteractiveMap() {
  const mapPins = document.querySelectorAll('.map-pin');
  const regionTitle = document.getElementById('region-title');
  const regionDesc = document.getElementById('region-description');
  const regionResorts = document.getElementById('region-resorts');
  const regionConditions = document.getElementById('region-conditions');
  
  function selectRegion(regionKey) {
    // Remove selected state from all pins
    mapPins.forEach(p => p.classList.remove('selected'));
    
    // Find matching pin and add selected
    const activePin = document.querySelector(`.map-pin[data-region="${regionKey}"]`);
    if (activePin) activePin.classList.add('selected');
    
    const data = regionData[regionKey];
    if (data) {
      regionTitle.textContent = data.title;
      regionDesc.textContent = data.desc;
      regionConditions.innerHTML = `<strong>Condiciones de Navegación:</strong> ${data.conditions}`;
      
      const resortSlideMap = {
        "Casa de Campo Resort & Villas": 2,
        "Bahia Principe Explore La Romana": 3,
        "Bahia Principe Grand El Portillo": 4,
        "Viva Wyndham Tangerine": 5,
        "Club Med Punta Cana": 6,
        "Iberostar Waves Punta Cana": 7
      };

      // Render resorts list
      regionResorts.innerHTML = '';
      data.resorts.forEach(resort => {
        const li = document.createElement('li');
        li.style.marginTop = '6px';
        
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = resort;
        a.addEventListener('click', (e) => {
          e.preventDefault();
          const targetSlideIdx = resortSlideMap[resort];
          if (targetSlideIdx !== undefined) {
            const navLink = document.getElementById(`nav-link-${targetSlideIdx}`);
            if (navLink) navLink.click();
          }
        });
        
        li.appendChild(a);
        regionResorts.appendChild(li);
      });
    }
  }
  
  // Attach Pin Click Listeners
  mapPins.forEach(pin => {
    pin.addEventListener('click', () => {
      const region = pin.getAttribute('data-region');
      selectRegion(region);
    });
  });
  
  // Select Punta Cana by default
  selectRegion('punta_cana');
}

/* ==========================================
   RESORT COMPARISON LOGIC
   ========================================== */
const resortList = [
  {
    name: "Casa de Campo Resort & Villas",
    location: "La Romana",
    type: "Familias y Élite",
    sailingOffering: "Alquiler de Hobie Cat y vela en playa Minitas incluido en tarifa premier",
    lessons: "De Pago",
    atmosphere: "Lujo de Élite / Tranquilo",
    difficulty: "Principiante a Intermedio",
    sailingOfferType: "all-included"
  },
  {
    name: "Bahia Principe Explore La Romana",
    location: "La Romana",
    type: "Familia y Parejas",
    sailingOffering: "1 hora diaria de catamarán Hobie Cat y kayak incluida con Seaklub, salida desde playa",
    lessons: "De Pago (Clases privadas a través de Seaklub)",
    atmosphere: "Activa y Familiar",
    difficulty: "Principiante a Intermedio",
    sailingOfferType: "all-included"
  },
  {
    name: "Bahia Principe Grand El Portillo",
    location: "Samaná (Las Terrenas)",
    type: "Familia y Parejas",
    sailingOffering: "1 hora diaria de catamarán gratis, bahía con viento, alquiler avanzado disponible",
    lessons: "De Pago (Clases privadas)",
    atmosphere: "Activa / Paisajística",
    difficulty: "Intermedio a Avanzado",
    sailingOfferType: "lessons-paid"
  },
  {
    name: "Viva Wyndham Tangerine",
    location: "Cabarete (Puerto Plata)",
    type: "Familias y Activos",
    sailingOffering: "Uso ilimitado y gratuito de Hobie Cat y kayak, vientos térmicos fuertes, asistencia en playa",
    lessons: "Gratis (Clases de introducción)",
    atmosphere: "Activa / Alta Energía",
    difficulty: "Todos los niveles (Principiante a Avanzado)",
    sailingOfferType: "free"
  },
  {
    name: "Club Med Punta Cana",
    location: "Punta Cana",
    type: "Familia y Adultos",
    sailingOffering: "Escuela de vela gratuita, clases grupales, uso libre de Hobie/Laser",
    lessons: "Gratis (Clases grupales incluidas)",
    atmosphere: "Activa / Deportiva",
    difficulty: "Todos los niveles (Principiante a Avanzado)",
    sailingOfferType: "free"
  },
  {
    name: "Iberostar Waves Punta Cana",
    location: "Punta Cana",
    type: "Familias y Parejas",
    sailingOffering: "1 hora diaria de catamarán incluida, salida de playa con asistencia",
    lessons: "De Pago",
    atmosphere: "Activa y Familiar / Animada",
    difficulty: "Principiante a Intermedio",
    sailingOfferType: "all-included"
  }
];

function initComparisonTable() {
  const tableBody = document.querySelector('.comparison-table tbody');
  const locationFilter = document.getElementById('filter-location');
  const skillFilter = document.getElementById('filter-skill');
  
  function renderTable() {
    const selectedLocation = locationFilter.value;
    const selectedSkill = skillFilter.value;
    
    tableBody.innerHTML = '';
    
    const filteredResorts = resortList.filter(resort => {
      // Location matching
      const matchesLocation = selectedLocation === 'all' || 
                              (selectedLocation === 'punta_cana' && (resort.location.includes('Punta Cana') || resort.location.includes('Cap Cana'))) ||
                              (selectedLocation === 'la_romana' && resort.location.includes('La Romana')) ||
                              (selectedLocation === 'samana' && resort.location.includes('Samaná')) ||
                              (selectedLocation === 'cabarete' && resort.location.includes('Cabarete'));
                              
      // Skill matching
      const matchesSkill = selectedSkill === 'all' ||
                           (selectedSkill === 'beginner' && (resort.difficulty.includes('Principiante') || resort.difficulty.includes('Todos los niveles'))) ||
                           (selectedSkill === 'advanced' && (resort.difficulty.includes('Avanzado') || resort.difficulty.includes('Intermedio') || resort.difficulty.includes('Todos los niveles')));
                           
      return matchesLocation && matchesSkill;
    });
    
    if (filteredResorts.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="6" style="text-align: center; color: var(--text-muted); padding: 30px;">Ningún resort coincide con los filtros seleccionados.</td>`;
      tableBody.appendChild(tr);
      return;
    }
    
    filteredResorts.forEach(resort => {
      const tr = document.createElement('tr');
      
      let badgeClass = 'all-included';
      if (resort.sailingOfferType === 'free') badgeClass = 'free';
      else if (resort.sailingOfferType === 'lessons-paid') badgeClass = 'lessons-paid';
      
      tr.innerHTML = `
        <td>
          <div class="resort-cell-name">${resort.name}</div>
          <div class="resort-cell-location">${resort.location}</div>
        </td>
        <td>${resort.type}</td>
        <td>${resort.sailingOffering}</td>
        <td><span class="badge-pill ${badgeClass}">${resort.lessons}</span></td>
        <td>${resort.difficulty}</td>
        <td>${resort.atmosphere}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
  
  locationFilter.addEventListener('change', renderTable);
  skillFilter.addEventListener('change', renderTable);
  
  renderTable();
}

/* ==========================================
   SAILING QUIZ / MATCH PLANNER
   ========================================== */
function initSailingQuiz() {
  const quizSteps = document.querySelectorAll('.quiz-step');
  const optionElements = document.querySelectorAll('.quiz-option');
  const prevQuizBtn = document.getElementById('quiz-prev');
  const nextQuizBtn = document.getElementById('quiz-next');
  const startOverBtn = document.getElementById('quiz-restart');
  const progressBar = document.querySelector('.quiz-progress-bar');
  
  let currentStep = 0;
  const answers = {
    vibe: null,      // 'active', 'luxury', 'romance'
    experience: null,// 'beginner', 'intermediate', 'advanced'
    guests: null     // 'family', 'adults'
  };
  
  function updateQuizUI() {
    // Show active step, hide others
    quizSteps.forEach((step, idx) => {
      if (idx === currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });
    
    // Update progress bar
    const progressPercent = (currentStep / (quizSteps.length - 1)) * 100;
    progressBar.style.width = `${progressPercent}%`;
    
    // Navigation buttons
    prevQuizBtn.style.visibility = (currentStep === 0 || currentStep === quizSteps.length - 1) ? 'hidden' : 'visible';
    
    // Disable next if option not selected
    if (currentStep < quizSteps.length - 1) {
      const currentStepEl = quizSteps[currentStep];
      const selectedOption = currentStepEl.querySelector('.quiz-option.selected');
      nextQuizBtn.disabled = !selectedOption;
      nextQuizBtn.style.display = 'inline-flex';
    } else {
      // In result slide
      nextQuizBtn.style.display = 'none';
    }
  }
  
  function handleOptionSelect(option) {
    const stepEl = option.closest('.quiz-step');
    const siblings = stepEl.querySelectorAll('.quiz-option');
    siblings.forEach(s => s.classList.remove('selected'));
    option.classList.add('selected');
    const key = option.getAttribute('data-key');
    const val = option.getAttribute('data-value');
    answers[key] = val;
    nextQuizBtn.disabled = false;
  }

  optionElements.forEach(option => {
    // 'click' works on desktop; 'touchend' is needed on mobile
    option.addEventListener('click', (e) => {
      e.stopPropagation();
      handleOptionSelect(option);
    });
    option.addEventListener('touchend', (e) => {
      e.stopPropagation();
      handleOptionSelect(option);
    }, { passive: true });
  });
  
  nextQuizBtn.addEventListener('click', () => {
    if (currentStep < quizSteps.length - 2) {
      currentStep++;
      updateQuizUI();
    } else if (currentStep === quizSteps.length - 2) {
      // Calculate and show result
      currentStep++;
      calculateResult();
      updateQuizUI();
    }
  });
  
  prevQuizBtn.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      updateQuizUI();
    }
  });
  
  startOverBtn.addEventListener('click', () => {
    currentStep = 0;
    // Reset answers
    answers.vibe = null;
    answers.experience = null;
    answers.guests = null;
    // Reset selections
    optionElements.forEach(o => o.classList.remove('selected'));
    updateQuizUI();
  });
  
  function calculateResult() {
    const resultTitle = document.getElementById('match-title');
    const resultDesc = document.getElementById('match-desc');
    const resultInclusions = document.getElementById('match-inclusions');
    const resultAtmosphere = document.getElementById('match-atmosphere');
    
     // Matching Logic Tree
    if (answers.experience === 'advanced' && answers.vibe === 'active') {
      matchedResort = resortList[3]; // Viva Wyndham Tangerine (Ultimate Windsports)
    } else if (answers.experience === 'advanced') {
      matchedResort = resortList[2]; // Bahia Principe Grand El Portillo (Strong Winds)
    } else if (answers.vibe === 'active' && answers.guests === 'adults') {
      matchedResort = resortList[1]; // Bahia Principe Explore La Romana (New!)
    } else if (answers.guests === 'adults') {
      matchedResort = resortList[5]; // Iberostar Waves Punta Cana
    } else { // Families or General
      if (answers.vibe === 'active') {
        matchedResort = resortList[4]; // Club Med Punta Cana (Active School)
      } else {
        matchedResort = resortList[0]; // Casa de Campo (Luxury/Family)
      }
    }
    
    // Render matched details
    if (matchedResort) {
      resultTitle.textContent = matchedResort.name;
      resultInclusions.textContent = matchedResort.sailingOffering;
      resultAtmosphere.textContent = `Ambiente ${matchedResort.atmosphere} · ${matchedResort.location}`;
      
      // Customize description paragraph
      if (matchedResort.name.includes("Club Med")) {
        resultDesc.textContent = "Club Med Punta Cana es la opción definitiva para ti. Dado que las lecciones de vela están completamente incluidas en el paquete todo incluido, puedes pasar de principiante absoluto a capitán competente en poco tiempo. Sus dedicados instructores de vela G.O. te guiarán en el agua.";
      } else if (matchedResort.name.includes("El Portillo")) {
        resultDesc.textContent = "¡Bahia Principe Grand El Portillo es tu pareja ideal! Ubicado en la Península de Samaná azotada por el viento, este complejo te brinda acceso a vientos atlánticos más fuertes y oleaje de océano abierto. Ideal para un navegante activo que desea catamaranes de alto rendimiento y hermosos paisajes.";
      } else if (matchedResort.name.includes("Casa de Campo")) {
        resultDesc.textContent = "Casa de Campo Resort & Villas se adapta a tus gustos de élite. Navegar en Hobie Cats en la playa Minitas ofrece una escapada serena, rodeado de campos de golf de clase mundial, centros ecuestres y puertos deportivos privados en la tranquila costa sur.";
      } else if (matchedResort.name.includes("Viva")) {
        resultDesc.textContent = "¡Viva Wyndham Tangerine en Cabarete es tu pareja perfecta! Ubicado en la Bahía de Cabarete azotada por el viento, este complejo te brinda navegación ilimitada y gratuita en Hobie Cat directamente desde la playa con fuertes vientos térmicos. Es perfecto para grupos activos y familias que aman la vela, las olas y la energía vibrante de un pueblo de surf.";
      } else if (matchedResort.name.includes("Explore La Romana")) {
        resultDesc.textContent = "¡Bahia Principe Explore La Romana es perfecto para ti! Ofrece el equilibrio ideal entre actividades familiares y relajación para adultos. Disfruta de una hora gratuita de Hobie Cat o kayak al día provista por el centro de deportes acuáticos Seaklub, navegando en las tranquilas y cristalinas aguas de La Romana.";
      } else {
        resultDesc.textContent = "Iberostar Waves Punta Cana es la opción perfecta para tus vacaciones activas y familiares. Disfruta de una hora diaria de navegación gratuita en catamarán Hobie Cat lanzándote desde la hermosa playa de Bávaro con la asistencia de su equipo de deportes acuáticos, mientras toda la familia se divierte con el programa Star Camp.";
      }
    }
  }
  
  // Initialize Quiz
  updateQuizUI();
}


/* ==========================================
   INTERACTIVE RESORT GALLERIES
   ========================================== */
function initResortGalleries() {
  const tabs = document.querySelectorAll('.gallery-tab');
  
  // Catamaran images for El Portillo sub-carousel
  const catamaranImages = [
    'assets/catamaran2.jpg',
    'assets/catamaran0.jpg',
    'assets/catamaran1.jpg',
    'assets/catamaran3.jpg',
    'assets/catamaran4.jpg',
    'assets/catamaran5.jpg'
  ];
  const catamaranCaptions = [
    "Navegación: Imagen 1 de 6 · Equipos de navegación",
    "Navegación: Imagen 2 de 6 · Huespedes alistando su catamaran en El Portillo",
    "Navegación: Imagen 3 de 6 · Navegando en El Portillo",
    "Navegación: Imagen 4 de 6 · Dia perfecto para navegar",
    "Navegación: Imagen 5 de 6 · Casita de equipos de navegacion El Portillo",
    "Navegación: Imagen 6 de 6 · Playas y oleaje ideal para navegacion en vela"
  ];
  let currentCatamaranIdx = 0;

  // Arrow buttons on Slide 4
  const prevArrow = document.getElementById('el-portillo-prev-arrow');
  const nextArrow = document.getElementById('el-portillo-next-arrow');
  const elPortilloImg = document.getElementById('el-portillo-gallery-img');
  const elPortilloCaption = document.getElementById('el-portillo-gallery-caption');
  const elPortilloNavTab = document.querySelector('.gallery-tab[data-resort="el-portillo"]:first-child');

  function updateCatamaranImage(idx) {
    if (!elPortilloImg) return;
    elPortilloImg.style.opacity = '0.1';
    setTimeout(() => {
      elPortilloImg.src = catamaranImages[idx];
      if (elPortilloCaption) elPortilloCaption.textContent = catamaranCaptions[idx];
      // Sync active tab data attributes
      if (elPortilloNavTab) {
        elPortilloNavTab.setAttribute('data-img', catamaranImages[idx]);
        elPortilloNavTab.setAttribute('data-caption', catamaranCaptions[idx]);
      }
      elPortilloImg.style.opacity = '1';
    }, 150);
  }

  if (prevArrow && nextArrow) {
    prevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCatamaranIdx = (currentCatamaranIdx - 1 + catamaranImages.length) % catamaranImages.length;
      updateCatamaranImage(currentCatamaranIdx);
    });

    nextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCatamaranIdx = (currentCatamaranIdx + 1) % catamaranImages.length;
      updateCatamaranImage(currentCatamaranIdx);
    });
  }

  // El Portillo "Mejor Opción" images
  const elPortilloHabImages = [
    'assets/portillohab.avif',
    'assets/portillohab2.avif',
    'assets/portillohab4.avif',
    'assets/portillohab3.avif'
  ];
  const elPortilloHabCaptions = [
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium"
  ];
  let currentElPortilloHabIdx = 0;

  const elPortilloMejorPrevArrow = document.getElementById('el-portillo-mejor-prev-arrow');
  const elPortilloMejorNextArrow = document.getElementById('el-portillo-mejor-next-arrow');
  const elPortilloMejorTab = document.getElementById('el-portillo-mejor-tab');

  function updateElPortilloHabImage(idx) {
    if (!elPortilloImg) return;
    elPortilloImg.style.opacity = '0.1';
    setTimeout(() => {
      elPortilloImg.src = elPortilloHabImages[idx];
      if (elPortilloCaption) elPortilloCaption.textContent = elPortilloHabCaptions[idx];
      if (elPortilloMejorTab) {
        elPortilloMejorTab.setAttribute('data-img', elPortilloHabImages[idx]);
        elPortilloMejorTab.setAttribute('data-caption', elPortilloHabCaptions[idx]);
      }
      elPortilloImg.style.opacity = '1';
    }, 150);
  }

  if (elPortilloMejorPrevArrow && elPortilloMejorNextArrow) {
    elPortilloMejorPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentElPortilloHabIdx = (currentElPortilloHabIdx - 1 + elPortilloHabImages.length) % elPortilloHabImages.length;
      updateElPortilloHabImage(currentElPortilloHabIdx);
    });
    elPortilloMejorNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentElPortilloHabIdx = (currentElPortilloHabIdx + 1) % elPortilloHabImages.length;
      updateElPortilloHabImage(currentElPortilloHabIdx);
    });
  }

  // Casa de Campo "Mejor Opción" images
  const cdcImages = [
    'assets/cdc5.avif',
    'assets/cdc3.avif',
    'assets/cdc4.avif',
    'assets/cdc6.avif',
    'assets/cdc.avif',
    'assets/cdc2.avif'
  ];
  const cdcCaptions = [
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium"
  ];
  let currentCdcIdx = 0;

  // Arrow buttons on Slide 5 (Casa de Campo)
  const cdcPrevArrow = document.getElementById('casa-campo-prev-arrow');
  const cdcNextArrow = document.getElementById('casa-campo-next-arrow');
  const cdcImg = document.getElementById('casa-campo-gallery-img');
  const cdcCaption = document.getElementById('casa-campo-gallery-caption');
  const cdcRoomTab = document.querySelector('.gallery-tab[data-resort="casa-campo"]:nth-child(3)');

  function updateCdcImage(idx) {
    if (!cdcImg) return;
    cdcImg.style.opacity = '0.1';
    setTimeout(() => {
      cdcImg.src = cdcImages[idx];
      if (cdcCaption) cdcCaption.textContent = cdcCaptions[idx];
      // Sync active tab data attributes
      if (cdcRoomTab) {
        cdcRoomTab.setAttribute('data-img', cdcImages[idx]);
        cdcRoomTab.setAttribute('data-caption', cdcCaptions[idx]);
      }
      cdcImg.style.opacity = '1';
    }, 150);
  }

  if (cdcPrevArrow && cdcNextArrow) {
    cdcPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCdcIdx = (currentCdcIdx - 1 + cdcImages.length) % cdcImages.length;
      updateCdcImage(currentCdcIdx);
    });

    cdcNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentCdcIdx = (currentCdcIdx + 1) % cdcImages.length;
      updateCdcImage(currentCdcIdx);
    });
  }  // Bahia Principe Explore La Romana "Mejor Opción" images
  const bbrImages = [
    'assets/laromanabahia1.avif',
    'assets/laromanabahia2.avif',
    'assets/laromanabahia3.avif'
  ];
  const bbrCaptions = [
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium",
    "Habitaciónes · Suites de Lujo Premium"
  ];
  let currentBbrIdx = 0;

  // Arrow buttons on Slide 3 (Bahia Principe Explore La Romana)
  const bbrPrevArrow = document.getElementById('bahia-romana-prev-arrow');
  const bbrNextArrow = document.getElementById('bahia-romana-next-arrow');
  const bbrImg = document.getElementById('bahia-romana-gallery-img');
  const bbrCaption = document.getElementById('bahia-romana-gallery-caption');
  const bbrRoomTab = document.querySelector('.gallery-tab[data-resort="bahia-romana"]:nth-child(3)');

  function updateBbrImage(idx) {
    if (!bbrImg) return;
    bbrImg.style.opacity = '0.1';
    setTimeout(() => {
      bbrImg.src = bbrImages[idx];
      if (bbrCaption) bbrCaption.textContent = bbrCaptions[idx];
      // Sync active tab data attributes
      if (bbrRoomTab) {
        bbrRoomTab.setAttribute('data-img', bbrImages[idx]);
        bbrRoomTab.setAttribute('data-caption', bbrCaptions[idx]);
      }
      bbrImg.style.opacity = '1';
    }, 150);
  }

  if (bbrPrevArrow && bbrNextArrow) {
    bbrPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentBbrIdx = (currentBbrIdx - 1 + bbrImages.length) % bbrImages.length;
      updateBbrImage(currentBbrIdx);
    });

    bbrNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentBbrIdx = (currentBbrIdx + 1) % bbrImages.length;
      updateBbrImage(currentBbrIdx);
    });
  }

  // Viva Wyndham "Navegación" sub-carousel images
  const vivaNavImages = [
    'assets/wyndhamcabaretesailing.jpg',
    'assets/wyndhamcabarete3.jpg',
    'assets/wyndhamcabaretesailing2.webp'
  ];
  const vivaNavCaptions = [
    "Navegación: Imagen 1 de 3 · Acceso gratuito a Hobie Cats y kayaks",
    "Navegación: Imagen 2 de 3 · Viento y mar listos en Cabarete",
    "Navegación: Imagen 3 de 3 · Uso ilimitado de catamarán y equipos acuáticos"
  ];
  let currentVivaNavIdx = 0;

  const vivaPrevArrow = document.getElementById('viva-prev-arrow');
  const vivaNextArrow = document.getElementById('viva-next-arrow');
  const vivaImg = document.getElementById('viva-gallery-img');
  const vivaCaption = document.getElementById('viva-gallery-caption');
  const vivaNavTab = document.querySelector('.gallery-tab[data-resort="viva"]:first-child');

  function updateVivaNavImage(idx) {
    if (!vivaImg) return;
    vivaImg.style.opacity = '0.1';
    setTimeout(() => {
      vivaImg.src = vivaNavImages[idx];
      if (vivaCaption) vivaCaption.textContent = vivaNavCaptions[idx];
      if (vivaNavTab) {
        vivaNavTab.setAttribute('data-img', vivaNavImages[idx]);
        vivaNavTab.setAttribute('data-caption', vivaNavCaptions[idx]);
      }
      vivaImg.style.opacity = '1';
    }, 150);
  }

  if (vivaPrevArrow && vivaNextArrow) {
    vivaPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaNavIdx = (currentVivaNavIdx - 1 + vivaNavImages.length) % vivaNavImages.length;
      updateVivaNavImage(currentVivaNavIdx);
    });
    vivaNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaNavIdx = (currentVivaNavIdx + 1) % vivaNavImages.length;
      updateVivaNavImage(currentVivaNavIdx);
    });
  }

  // Viva Wyndham "Instalaciones" sub-carousel images
  const vivaInstImages = [
    'assets/wyndhamcabaretehotel.jpg',
    'assets/wyndham2.jpg'
  ];
  const vivaInstCaptions = [
    "Resort: Imagen 1 de 2 · Vista del hotel y jardines tropicales en la playa",
    "Resort: Imagen 2 de 2 · Gran piscina tipo laguna frente al mar"
  ];
  let currentVivaInstIdx = 0;

  const vivaInstPrevArrow = document.getElementById('viva-inst-prev-arrow');
  const vivaInstNextArrow = document.getElementById('viva-inst-next-arrow');
  const vivaInstTab = document.getElementById('viva-inst-tab');

  function updateVivaInstImage(idx) {
    if (!vivaImg) return;
    vivaImg.style.opacity = '0.1';
    setTimeout(() => {
      vivaImg.src = vivaInstImages[idx];
      if (vivaCaption) vivaCaption.textContent = vivaInstCaptions[idx];
      if (vivaInstTab) {
        vivaInstTab.setAttribute('data-img', vivaInstImages[idx]);
        vivaInstTab.setAttribute('data-caption', vivaInstCaptions[idx]);
      }
      vivaImg.style.opacity = '1';
    }, 150);
  }

  if (vivaInstPrevArrow && vivaInstNextArrow) {
    vivaInstPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaInstIdx = (currentVivaInstIdx - 1 + vivaInstImages.length) % vivaInstImages.length;
      updateVivaInstImage(currentVivaInstIdx);
    });
    vivaInstNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaInstIdx = (currentVivaInstIdx + 1) % vivaInstImages.length;
      updateVivaInstImage(currentVivaInstIdx);
    });
  }

  // Viva Wyndham "Mejor Opción" sub-carousel images
  const vivaMejorImages = [
    'assets/wyndy1.avif',
    'assets/wyndy3.avif',
    'assets/wyndy2.avif',
    'assets/wyndy4.avif',
    'assets/wyndy5.avif'
  ];
  const vivaMejorCaptions = [
    "Mejor Opción: Imagen 1 de 5 · Habitación moderna con vistas al mar",
    "Mejor Opción: Imagen 2 de 5 · Habitación moderna con vistas al mar",
    "Mejor Opción: Imagen 3 de 5 · Habitación moderna con vistas al mar",
    "Mejor Opción: Imagen 4 de 5 · Habitación moderna con vistas al mar",
    "Mejor Opción: Imagen 5 de 5 · Habitación moderna con vistas al mar"
  ];
  let currentVivaMejorIdx = 0;

  const vivaMejorPrevArrow = document.getElementById('viva-mejor-prev-arrow');
  const vivaMejorNextArrow = document.getElementById('viva-mejor-next-arrow');
  const vivaMejorTab = document.getElementById('viva-mejor-tab');

  function updateVivaMejorImage(idx) {
    if (!vivaImg) return;
    vivaImg.style.opacity = '0.1';
    setTimeout(() => {
      vivaImg.src = vivaMejorImages[idx];
      if (vivaCaption) vivaCaption.textContent = vivaMejorCaptions[idx];
      if (vivaMejorTab) {
        vivaMejorTab.setAttribute('data-img', vivaMejorImages[idx]);
        vivaMejorTab.setAttribute('data-caption', vivaMejorCaptions[idx]);
      }
      vivaImg.style.opacity = '1';
    }, 150);
  }

  if (vivaMejorPrevArrow && vivaMejorNextArrow) {
    vivaMejorPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaMejorIdx = (currentVivaMejorIdx - 1 + vivaMejorImages.length) % vivaMejorImages.length;
      updateVivaMejorImage(currentVivaMejorIdx);
    });
    vivaMejorNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentVivaMejorIdx = (currentVivaMejorIdx + 1) % vivaMejorImages.length;
      updateVivaMejorImage(currentVivaMejorIdx);
    });
  }

  // Club Med "Navegación" sub-carousel images
  const clubMedNavImages = [
    'assets/clubmedsailing3.jpg',
    'assets/clubmedsailing4.jpg',
    'assets/clubmedsailing5.webp',
    'assets/clubmedsailing8.jpg',
    'assets/clubmedsailing1.JPG',
    'assets/clubmedsailing2.jpeg'
  ];
  const clubMedNavCaptions = [
    "Navegación: Imagen 1 de 6",
    "Navegación: Imagen 2 de 6",
    "Navegación: Imagen 3 de 6",
    "Navegación: Imagen 4 de 6",
    "Navegación: Imagen 5 de 6",
    "Navegación: Imagen 6 de 6"
  ];
  let currentClubMedNavIdx = 0;

  const clubMedNavPrevArrow = document.getElementById('club-med-nav-prev-arrow');
  const clubMedNavNextArrow = document.getElementById('club-med-nav-next-arrow');
  const clubMedNavTab = document.querySelector('.gallery-tab[data-resort="club-med"]:first-child');

  function updateClubMedNavImage(idx) {
    if (!clubMedImg) return;
    clubMedImg.style.opacity = '0.1';
    setTimeout(() => {
      clubMedImg.src = clubMedNavImages[idx];
      if (clubMedCaption) clubMedCaption.textContent = clubMedNavCaptions[idx];
      if (clubMedNavTab) {
        clubMedNavTab.setAttribute('data-img', clubMedNavImages[idx]);
        clubMedNavTab.setAttribute('data-caption', clubMedNavCaptions[idx]);
      }
      clubMedImg.style.opacity = '1';
    }, 150);
  }

  if (clubMedNavPrevArrow && clubMedNavNextArrow) {
    clubMedNavPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentClubMedNavIdx = (currentClubMedNavIdx - 1 + clubMedNavImages.length) % clubMedNavImages.length;
      updateClubMedNavImage(currentClubMedNavIdx);
    });
    clubMedNavNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentClubMedNavIdx = (currentClubMedNavIdx + 1) % clubMedNavImages.length;
      updateClubMedNavImage(currentClubMedNavIdx);
    });
  }

  // Club Med "Habitaciones" sub-carousel images
  const clubMedMejorImages = [
    'assets/cmpc.webp',
    'assets/cmpc1.webp',
    'assets/cmpc2.webp',
    'assets/cmpc3.webp'
  ];
  const clubMedMejorCaptions = [
    "Habitaciones: Imagen 1 de 4 · Habitación con diseño tropical moderno",
    "Habitaciones: Imagen 2 de 4 · Habitación con diseño tropical moderno",
    "Habitaciones: Imagen 3 de 4 · Habitación con diseño tropical moderno",
    "Habitaciones: Imagen 4 de 4 · Habitación con diseño tropical moderno"
  ];
  let currentClubMedMejorIdx = 0;

  const clubMedMejorPrevArrow = document.getElementById('club-med-mejor-prev-arrow');
  const clubMedMejorNextArrow = document.getElementById('club-med-mejor-next-arrow');
  const clubMedMejorTab = document.getElementById('club-med-mejor-tab');
  const clubMedImg = document.getElementById('club-med-gallery-img');
  const clubMedCaption = document.getElementById('club-med-gallery-caption');

  function updateClubMedMejorImage(idx) {
    if (!clubMedImg) return;
    clubMedImg.style.opacity = '0.1';
    setTimeout(() => {
      clubMedImg.src = clubMedMejorImages[idx];
      if (clubMedCaption) clubMedCaption.textContent = clubMedMejorCaptions[idx];
      if (clubMedMejorTab) {
        clubMedMejorTab.setAttribute('data-img', clubMedMejorImages[idx]);
        clubMedMejorTab.setAttribute('data-caption', clubMedMejorCaptions[idx]);
      }
      clubMedImg.style.opacity = '1';
    }, 150);
  }

  if (clubMedMejorPrevArrow && clubMedMejorNextArrow) {
    clubMedMejorPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentClubMedMejorIdx = (currentClubMedMejorIdx - 1 + clubMedMejorImages.length) % clubMedMejorImages.length;
      updateClubMedMejorImage(currentClubMedMejorIdx);
    });
    clubMedMejorNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentClubMedMejorIdx = (currentClubMedMejorIdx + 1) % clubMedMejorImages.length;
      updateClubMedMejorImage(currentClubMedMejorIdx);
    });
  }

  // Iberostar "Habitaciones" sub-carousel images
  const iberostarMejorImages = [
    'assets/waves7.avif',
    'assets/waves1.avif',
    'assets/waves2.avif',
    'assets/waves3.avif',
    'assets/waves4.avif',
    'assets/waves5.avif',
    'assets/waves6.avif'
  ];
  const iberostarMejorCaptions = [
    "Habitaciones: Imagen 1 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 2 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 3 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 4 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 5 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 6 de 7 · Habitación Familiar de Iberostar Waves",
    "Habitaciones: Imagen 7 de 7 · Habitación Familiar de Iberostar Waves"
  ];
  let currentIberostarMejorIdx = 0;

  const iberostarMejorPrevArrow = document.getElementById('iberostar-mejor-prev-arrow');
  const iberostarMejorNextArrow = document.getElementById('iberostar-mejor-next-arrow');
  const iberostarMejorTab = document.getElementById('iberostar-mejor-tab');
  const iberostarImg = document.getElementById('iberostar-gallery-img');
  const iberostarCaption = document.getElementById('iberostar-gallery-caption');

  function updateIberostarMejorImage(idx) {
    if (!iberostarImg) return;
    iberostarImg.style.opacity = '0.1';
    setTimeout(() => {
      iberostarImg.src = iberostarMejorImages[idx];
      if (iberostarCaption) iberostarCaption.textContent = iberostarMejorCaptions[idx];
      if (iberostarMejorTab) {
        iberostarMejorTab.setAttribute('data-img', iberostarMejorImages[idx]);
        iberostarMejorTab.setAttribute('data-caption', iberostarMejorCaptions[idx]);
      }
      iberostarImg.style.opacity = '1';
    }, 150);
  }

  if (iberostarMejorPrevArrow && iberostarMejorNextArrow) {
    iberostarMejorPrevArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIberostarMejorIdx = (currentIberostarMejorIdx - 1 + iberostarMejorImages.length) % iberostarMejorImages.length;
      updateIberostarMejorImage(currentIberostarMejorIdx);
    });
    iberostarMejorNextArrow.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIberostarMejorIdx = (currentIberostarMejorIdx + 1) % iberostarMejorImages.length;
      updateIberostarMejorImage(currentIberostarMejorIdx);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const resortKey = tab.getAttribute('data-resort');
      const imgPath = tab.getAttribute('data-img');
      const captionText = tab.getAttribute('data-caption');
      
      // Find the specific container
      const container = tab.closest('.gallery-container');
      if (!container) return;
      
      const mainImg = container.querySelector('.gallery-main-img');
      const caption = container.querySelector('.gallery-caption');
      
      // Remove active from sibling tabs
      const siblingTabs = container.querySelectorAll('.gallery-tab');
      siblingTabs.forEach(t => t.classList.remove('active'));
      
      // Add active to current
      tab.classList.add('active');
      
      // Show/hide slideshow arrows for El Portillo tabs
      if (resortKey === 'el-portillo') {
        const isNavegacion = tab.textContent.includes('Navegación');
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (prevArrow && nextArrow) {
          prevArrow.style.display = isNavegacion ? 'flex' : 'none';
          nextArrow.style.display = isNavegacion ? 'flex' : 'none';
        }
        if (elPortilloMejorPrevArrow && elPortilloMejorNextArrow) {
          elPortilloMejorPrevArrow.style.display = isMejorOpcion ? 'flex' : 'none';
          elPortilloMejorNextArrow.style.display = isMejorOpcion ? 'flex' : 'none';
        }
        // Reset Mejor Opcion index when switching away
        if (!isMejorOpcion) currentElPortilloHabIdx = 0;
      }

      // Show/hide slideshow arrows for Casa de Campo "Mejor Opción" tab
      if (resortKey === 'casa-campo') {
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (cdcPrevArrow && cdcNextArrow) {
          if (isMejorOpcion) {
            cdcPrevArrow.style.display = 'flex';
            cdcNextArrow.style.display = 'flex';
          } else {
            cdcPrevArrow.style.display = 'none';
            cdcNextArrow.style.display = 'none';
          }
        }
      }

      // Show/hide slideshow arrows for Bahia Principe Explore La Romana "Mejor Opción" tab
      if (resortKey === 'bahia-romana') {
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (bbrPrevArrow && bbrNextArrow) {
          if (isMejorOpcion) {
            bbrPrevArrow.style.display = 'flex';
            bbrNextArrow.style.display = 'flex';
          } else {
            bbrPrevArrow.style.display = 'none';
            bbrNextArrow.style.display = 'none';
          }
        }
      }

      // Show/hide slideshow arrows for Club Med tabs
      if (resortKey === 'club-med') {
        const isNavegacion = tab.textContent.includes('Navegación');
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (clubMedNavPrevArrow && clubMedNavNextArrow) {
          if (isNavegacion) {
            clubMedNavPrevArrow.style.display = 'flex';
            clubMedNavNextArrow.style.display = 'flex';
          } else {
            clubMedNavPrevArrow.style.display = 'none';
            clubMedNavNextArrow.style.display = 'none';
          }
        }
        if (clubMedMejorPrevArrow && clubMedMejorNextArrow) {
          if (isMejorOpcion) {
            clubMedMejorPrevArrow.style.display = 'flex';
            clubMedMejorNextArrow.style.display = 'flex';
          } else {
            clubMedMejorPrevArrow.style.display = 'none';
            clubMedMejorNextArrow.style.display = 'none';
          }
        }
        if (!isNavegacion) currentClubMedNavIdx = 0;
        if (!isMejorOpcion) currentClubMedMejorIdx = 0;
      }

      // Show/hide slideshow arrows for Iberostar tabs
      if (resortKey === 'iberostar') {
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (iberostarMejorPrevArrow && iberostarMejorNextArrow) {
          if (isMejorOpcion) {
            iberostarMejorPrevArrow.style.display = 'flex';
            iberostarMejorNextArrow.style.display = 'flex';
          } else {
            iberostarMejorPrevArrow.style.display = 'none';
            iberostarMejorNextArrow.style.display = 'none';
          }
        }
        if (!isMejorOpcion) currentIberostarMejorIdx = 0;
      }

      // Show/hide slideshow arrows for Viva Wyndham tabs
      if (resortKey === 'viva') {
        const isNavegacion = tab.textContent.includes('Navegación');
        const isInstalaciones = tab.textContent.includes('Instalaciones');
        const isMejorOpcion = tab.textContent.includes('Habitaciones');
        if (vivaPrevArrow && vivaNextArrow) {
          if (isNavegacion) {
            vivaPrevArrow.style.display = 'flex';
            vivaNextArrow.style.display = 'flex';
          } else {
            vivaPrevArrow.style.display = 'none';
            vivaNextArrow.style.display = 'none';
          }
        }
        if (vivaInstPrevArrow && vivaInstNextArrow) {
          if (isInstalaciones) {
            vivaInstPrevArrow.style.display = 'flex';
            vivaInstNextArrow.style.display = 'flex';
          } else {
            vivaInstPrevArrow.style.display = 'none';
            vivaInstNextArrow.style.display = 'none';
          }
        }
        if (vivaMejorPrevArrow && vivaMejorNextArrow) {
          if (isMejorOpcion) {
            vivaMejorPrevArrow.style.display = 'flex';
            vivaMejorNextArrow.style.display = 'flex';
          } else {
            vivaMejorPrevArrow.style.display = 'none';
            vivaMejorNextArrow.style.display = 'none';
          }
        }
        // Reset indexes when switching away
        if (!isNavegacion) currentVivaNavIdx = 0;
        if (!isInstalaciones) currentVivaInstIdx = 0;
        if (!isMejorOpcion) currentVivaMejorIdx = 0;
      }

      // Smooth transition
      if (mainImg) {
        mainImg.style.opacity = '0.1';
        setTimeout(() => {
          mainImg.src = imgPath;
          if (caption) caption.textContent = captionText;
          mainImg.style.opacity = '1';
        }, 150);
      }
    });
  });
  
  // Set initial display of arrows depending on initial tab state
  if (prevArrow && nextArrow && elPortilloNavTab) {
    const isNavegacionActive = elPortilloNavTab.classList.contains('active');
    prevArrow.style.display = isNavegacionActive ? 'flex' : 'none';
    nextArrow.style.display = isNavegacionActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Casa de Campo
  if (cdcPrevArrow && cdcNextArrow && cdcRoomTab) {
    const isRoomActive = cdcRoomTab.classList.contains('active');
    cdcPrevArrow.style.display = isRoomActive ? 'flex' : 'none';
    cdcNextArrow.style.display = isRoomActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Bahia Principe Explore La Romana
  if (bbrPrevArrow && bbrNextArrow && bbrRoomTab) {
    const isRoomActive = bbrRoomTab.classList.contains('active');
    bbrPrevArrow.style.display = isRoomActive ? 'flex' : 'none';
    bbrNextArrow.style.display = isRoomActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Viva Wyndham
  if (vivaPrevArrow && vivaNextArrow && vivaNavTab) {
    const isNavegacionActive = vivaNavTab.classList.contains('active');
    vivaPrevArrow.style.display = isNavegacionActive ? 'flex' : 'none';
    vivaNextArrow.style.display = isNavegacionActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Viva Wyndham Instalaciones
  if (vivaInstPrevArrow && vivaInstNextArrow && vivaInstTab) {
    const isInstActive = vivaInstTab.classList.contains('active');
    vivaInstPrevArrow.style.display = isInstActive ? 'flex' : 'none';
    vivaInstNextArrow.style.display = isInstActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Viva Wyndham Mejor Opción
  if (vivaMejorPrevArrow && vivaMejorNextArrow && vivaMejorTab) {
    const isMejorActive = vivaMejorTab.classList.contains('active');
    vivaMejorPrevArrow.style.display = isMejorActive ? 'flex' : 'none';
    vivaMejorNextArrow.style.display = isMejorActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Club Med Habitaciones
  if (clubMedMejorPrevArrow && clubMedMejorNextArrow && clubMedMejorTab) {
    const isMejorActive = clubMedMejorTab.classList.contains('active');
    clubMedMejorPrevArrow.style.display = isMejorActive ? 'flex' : 'none';
    clubMedMejorNextArrow.style.display = isMejorActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Club Med Navegación
  if (clubMedNavPrevArrow && clubMedNavNextArrow && clubMedNavTab) {
    const isNavActive = clubMedNavTab.classList.contains('active');
    clubMedNavPrevArrow.style.display = isNavActive ? 'flex' : 'none';
    clubMedNavNextArrow.style.display = isNavActive ? 'flex' : 'none';
  }

  // Set initial display of arrows depending on initial tab state for Iberostar Habitaciones
  if (iberostarMejorPrevArrow && iberostarMejorNextArrow && iberostarMejorTab) {
    const isMejorActive = iberostarMejorTab.classList.contains('active');
    iberostarMejorPrevArrow.style.display = isMejorActive ? 'flex' : 'none';
    iberostarMejorNextArrow.style.display = isMejorActive ? 'flex' : 'none';
  }
}
