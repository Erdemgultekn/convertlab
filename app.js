// AutoCAD Crosshair & Coordinates tracking
const crossX = document.getElementById('crosshair-x');
const crossY = document.getElementById('crosshair-y');
const coordsDisplay = document.getElementById('coords-display');

document.addEventListener('mousemove', (e) => {
  crossX.style.top = e.clientY + 'px';
  crossY.style.left = e.clientX + 'px';
  
  // Fake CAD coordinates based on mouse position
  const cadX = (e.clientX * 0.543).toFixed(4);
  const cadY = ((window.innerHeight - e.clientY) * 0.543).toFixed(4);
  coordsDisplay.textContent = `X: ${cadX}, Y: ${cadY}`;
});

// AutoCAD Style Command Line Logger
const cmdHistory = document.getElementById('cmd-history');
const cmdInput = document.getElementById('fake-cmd');

function logCommand(text) {
  const div = document.createElement('div');
  div.textContent = `> ${text}`;
  cmdHistory.appendChild(div);
  
  // Keep only last 3 lines
  while (cmdHistory.children.length > 3) {
    cmdHistory.removeChild(cmdHistory.firstChild);
  }
}

// Unit Definitions
const UNITS = {
  length: {
    items: {'mm': 0.001, 'cm': 0.01, 'm': 1, 'in': 0.0254, 'ft': 0.3048},
    defFrom: 'mm', defTo: 'in'
  },
  pressure: {
    items: {'Pa': 1, 'kPa': 1000, 'bar': 100000, 'psi': 6894.757},
    defFrom: 'bar', defTo: 'psi'
  }
};

let currentTab = 'length';

// DOM Elements
const fromVal = document.getElementById('from-value');
const toVal = document.getElementById('to-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const formulaDisp = document.getElementById('formula-display');

function populateUnits(tab) {
  if (!UNITS[tab]) return;
  fromUnit.innerHTML = ''; toUnit.innerHTML = '';
  
  Object.keys(UNITS[tab].items).forEach(key => {
    fromUnit.add(new Option(key, key));
    toUnit.add(new Option(key, key));
  });
  
  fromUnit.value = UNITS[tab].defFrom;
  toUnit.value = UNITS[tab].defTo;
}

function calculateStandard() {
  if (currentTab === 'mechanical' || currentTab === 'pump') return;
  
  const val = parseFloat(fromVal.value) || 0;
  const f = fromUnit.value;
  const t = toUnit.value;
  
  const fFactor = UNITS[currentTab].items[f];
  const tFactor = UNITS[currentTab].items[t];
  
  const result = (val * fFactor) / tFactor;
  toVal.value = result.toFixed(4);
  formulaDisp.textContent = `> DIM_SCALE: 1 ${f} = ${(fFactor/tFactor).toFixed(4)} ${t}`;
  
  cmdInput.value = `COMPUTING DIMENSION... [${val} ${f} -> ${result.toFixed(4)} ${t}]`;
}

// Mechanical (Torque & Power) Calculation
function calculateMechanical() {
  const T = parseFloat(document.getElementById('mech-torque').value) || 0;
  const rpm = parseFloat(document.getElementById('mech-rpm').value) || 0;
  
  const omega = (2 * Math.PI * rpm) / 60;
  const powerKW = (T * omega) / 1000;
  
  document.getElementById('mech-omega').textContent = `${omega.toFixed(2)} rad/s`;
  document.getElementById('mech-kw').textContent = `${powerKW.toFixed(2)} kW`;
  
  cmdInput.value = `ANALYZING KINEMATICS... [P = ${powerKW.toFixed(2)} kW]`;
}

// New Module: Turbine / Pump Hydraulic Power Calculation
function calculatePump() {
  const H = parseFloat(document.getElementById('pump-head').value) || 0;
  const Q = parseFloat(document.getElementById('pump-flow').value) || 0;
  const eff = (parseFloat(document.getElementById('pump-eff').value) || 100) / 100;
  
  // P = (rho * g * H * Q) / efficiency
  const rho = 1000; // kg/m3 (Water)
  const g = 9.81;
  const powerKW = (rho * g * H * Q) / (1000 * eff);
  
  document.getElementById('pump-power').textContent = `${powerKW.toFixed(2)} kW`;
  cmdInput.value = `FLUID DYNAMICS SIMULATION... [Hydraulic Power = ${powerKW.toFixed(2)} kW]`;
}

// Event Listeners
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    
    currentTab = e.target.getAttribute('data-tab');
    document.querySelectorAll('.cad-panel').forEach(p => p.classList.add('hidden'));
    
    logCommand(`SWITCH_WORKSPACE: ${currentTab.toUpperCase()}`);
    
    if (currentTab === 'mechanical') {
      document.getElementById('mechanical-panel').classList.remove('hidden');
      calculateMechanical();
    } else if (currentTab === 'pump') {
      document.getElementById('pump-panel').classList.remove('hidden');
      calculatePump();
    } else {
      document.getElementById('standard-panel').classList.remove('hidden');
      populateUnits(currentTab);
      calculateStandard();
    }
  });
});

[fromVal, fromUnit, toUnit].forEach(el => el.addEventListener('input', () => {
  calculateStandard();
  logCommand(`UPDATE_VAR: ${fromVal.value} ${fromUnit.value}`);
}));

document.getElementById('swap-btn').addEventListener('click', () => {
  const temp = fromUnit.value;
  fromUnit.value = toUnit.value;
  toUnit.value = temp;
  calculateStandard();
  logCommand('EXECUTE: MIRROR_AXIS');
});

['mech-torque', 'mech-rpm'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculateMechanical);
});

['pump-head', 'pump-flow', 'pump-eff'].forEach(id => {
  document.getElementById(id).addEventListener('input', calculatePump);
});

// Init
populateUnits('length');
calculateStandard();
