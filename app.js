// Units database with factors relative to standard base units
const unitData = {
  length: {
    base: 'm',
    units: {
      mm: { name: 'Millimeter (mm)', factor: 0.001 },
      cm: { name: 'Centimeter (cm)', factor: 0.01 },
      m:  { name: 'Meter (m)', factor: 1.0 },
      km: { name: 'Kilometer (km)', factor: 1000.0 },
      in: { name: 'Inch (in)', factor: 0.0254 },
      ft: { name: 'Foot (ft)', factor: 0.3048 }
    }
  },
  mass: {
    base: 'kg',
    units: {
      mg:  { name: 'Milligram (mg)', factor: 0.000001 },
      g:   { name: 'Gram (g)', factor: 0.001 },
      kg:  { name: 'Kilogram (kg)', factor: 1.0 },
      ton: { name: 'Metric Ton (t)', factor: 1000.0 },
      lb:  { name: 'Pound (lb)', factor: 0.45359237 }
    }
  },
  pressure: {
    base: 'Pa',
    units: {
      Pa:   { name: 'Pascal (Pa)', factor: 1.0 },
      kPa:  { name: 'Kilopascal (kPa)', factor: 1000.0 },
      MPa:  { name: 'Megapascal (MPa)', factor: 1000000.0 },
      bar:  { name: 'Bar', factor: 100000.0 },
      psi:  { name: 'Pound per sq in (psi)', factor: 6894.757 },
      atm:  { name: 'Standard Atmosphere (atm)', factor: 101325.0 }
    }
  },
  energy: {
    base: 'J',
    units: {
      J:    { name: 'Joule (J)', factor: 1.0 },
      kJ:   { name: 'Kilojoule (kJ)', factor: 1000.0 },
      cal:  { name: 'Calorie (cal)', factor: 4.184 },
      kcal: { name: 'Kilocalorie (kcal)', factor: 4184.0 },
      kWh:  { name: 'Kilowatt-hour (kWh)', factor: 3600000.0 }
    }
  },
  temperature: {
    units: {
      C: { name: 'Celsius (°C)' },
      F: { name: 'Fahrenheit (°F)' },
      K: { name: 'Kelvin (K)' }
    }
  }
};

let activeCategory = 'length';

// DOM Elements
const tabButtons = document.querySelectorAll('.tab-btn');
const standardConverter = document.getElementById('standard-converter');
const torqueConverter = document.getElementById('torque-converter');
const fromValueInput = document.getElementById('from-value');
const toValueInput = document.getElementById('to-value');
const fromUnitSelect = document.getElementById('from-unit');
const toUnitSelect = document.getElementById('to-unit');
const swapBtn = document.getElementById('swap-btn');
const formulaDisplay = document.getElementById('formula-display');

// Torque Tab Elements
const torqueInput = document.getElementById('torque-input');
const rpmInput = document.getElementById('rpm-input');
const powerKwDisplay = document.getElementById('power-kw');
const powerHpDisplay = document.getElementById('power-hp');

// Setup Dropdowns
function populateUnitDropdowns(category) {
  const units = unitData[category].units;
  fromUnitSelect.innerHTML = '';
  toUnitSelect.innerHTML = '';

  const keys = Object.keys(units);
  keys.forEach((key, index) => {
    const optFrom = new Option(units[key].name, key);
    const optTo = new Option(units[key].name, key);
    fromUnitSelect.add(optFrom);
    toUnitSelect.add(optTo);
  });

  if (keys.length > 1) {
    fromUnitSelect.selectedIndex = 0;
    toUnitSelect.selectedIndex = 1;
  }
}

// Convert logic
function calculateConversion() {
  const val = parseFloat(fromValueInput.value);
  if (isNaN(val)) {
    toValueInput.value = '';
    formulaDisplay.textContent = 'Enter a valid numeric value';
    return;
  }

  const fromUnit = fromUnitSelect.value;
  const toUnit = toUnitSelect.value;
  let result = 0;

  if (activeCategory === 'temperature') {
    // Temperature conversion
    let kelvin = 0;
    if (fromUnit === 'C') kelvin = val + 273.15;
    else if (fromUnit === 'F') kelvin = (val - 32) * (5 / 9) + 273.15;
    else kelvin = val;

    if (toUnit === 'C') result = kelvin - 273.15;
    else if (toUnit === 'F') result = (kelvin - 273.15) * (9 / 5) + 32;
    else result = kelvin;
  } else {
    // Factor based conversion
    const cat = unitData[activeCategory];
    const baseValue = val * cat.units[fromUnit].factor;
    result = baseValue / cat.units[toUnit].factor;
  }

  // Formatting output
  const formattedResult = Number(result.toFixed(6));
  toValueInput.value = formattedResult;
  formulaDisplay.textContent = `${val} ${fromUnit} = ${formattedResult} ${toUnit}`;
}

// Torque & Power calculation: P = T * (2 * PI * RPM / 60)
function calculateTorquePower() {
  const torque = parseFloat(torqueInput.value) || 0;
  const rpm = parseFloat(rpmInput.value) || 0;
  
  const omega = (2 * Math.PI * rpm) / 60;
  const powerWatts = torque * omega;
  const powerKw = powerWatts / 1000;
  const powerHp = powerWatts / 745.699872;

  powerKwDisplay.textContent = `${powerKw.toFixed(2)} kW`;
  powerHpDisplay.textContent = `${powerHp.toFixed(2)} HP`;
}

// Tab Switching
tabButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    tabButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    activeCategory = btn.getAttribute('data-category');

    if (activeCategory === 'torque') {
      standardConverter.classList.add('hidden');
      torqueConverter.classList.remove('hidden');
      calculateTorquePower();
    } else {
      torqueConverter.classList.add('hidden');
      standardConverter.classList.remove('hidden');
      populateUnitDropdowns(activeCategory);
      calculateConversion();
    }
  });
});

// Event Listeners
fromValueInput.addEventListener('input', calculateConversion);
fromUnitSelect.addEventListener('change', calculateConversion);
toUnitSelect.addEventListener('change', calculateConversion);

swapBtn.addEventListener('click', () => {
  const temp = fromUnitSelect.value;
  fromUnitSelect.value = toUnitSelect.value;
  toUnitSelect.value = temp;
  calculateConversion();
});

torqueInput.addEventListener('input', calculateTorquePower);
rpmInput.addEventListener('input', calculateTorquePower);

// Dark / Light Theme Toggle & Persistence
const themeToggleBtn = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function initTheme() {
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

  if (isDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeIcon.textContent = '☀️';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.textContent = '🌙';
  }
}

themeToggleBtn.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    themeIcon.textContent = '🌙';
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    themeIcon.textContent = '☀️';
  }
});

// Initial run
initTheme();
populateUnitDropdowns('length');
calculateConversion();
