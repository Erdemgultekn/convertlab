// CAD Coordinates
const crossX = document.getElementById('crosshair-x');
const crossY = document.getElementById('crosshair-y');
const coordsDisplay = document.getElementById('coords-display');

document.addEventListener('mousemove', (e) => {
  crossX.style.top = e.clientY + 'px';
  crossY.style.left = e.clientX + 'px';
  const cadX = (e.clientX * 0.543).toFixed(4);
  const cadY = ((window.innerHeight - e.clientY) * 0.543).toFixed(4);
  coordsDisplay.textContent = `X: ${cadX}, Y: ${cadY}`;
});

// Licensing & Settings
let isPro = false;
let decimals = 4;
const cmdLogArray = ["ConvertCAD System Initialized...", "Loading physics modules... Done."];

// Command Logger
const cmdHistory = document.getElementById('cmd-history');
const cmdInput = document.getElementById('fake-cmd');

function logCommand(text) {
  cmdLogArray.push(text);
  const div = document.createElement('div');
  div.textContent = `> ${text}`;
  cmdHistory.appendChild(div);
  while (cmdHistory.children.length > 3) {
    cmdHistory.removeChild(cmdHistory.firstChild);
  }
}

// Theme System (Blueprint vs Whiteprint)
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const target = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', target);
  logCommand(`SYSTEM_PREF: SWITCH_PAPER_MODE = ${target.toUpperCase()}`);
});

// Pro License Activation
const upgradeBtn = document.getElementById('upgrade-btn');
const proStatus = document.getElementById('pro-status');
const licenseDisplay = document.getElementById('license-display');
const precisionDisplay = document.getElementById('precision-display');

upgradeBtn.addEventListener('click', () => {
  isPro = true;
  proStatus.textContent = "ACTIVE";
  proStatus.className = "status active";
  upgradeBtn.textContent = "PRO LICENSE VERIFIED";
  upgradeBtn.style.background = "#00ff00";
  upgradeBtn.style.color = "#000";
  licenseDisplay.innerHTML = "REV (LIC):<br>PRO COMM.";
  
  // Unlocks 6 decimals
  decimals = 6;
  precisionDisplay.innerHTML = "PRECISION:<br>6-DECIMAL";
  
  logCommand("LICENSE_SERVER: PAYMENT VERIFIED. PRO FEATURES UNLOCKED.");
  logCommand("SYSTEM: Precision increased to 6 decimals.");
  calculateStandard(); 
});

// Export Logs Feature (Pro Only)
document.getElementById('export-btn').addEventListener('click', () => {
  if (!isPro) {
    logCommand("ERROR: EXPORT FAILED. PRO LICENSE REQUIRED.");
    cmdInput.value = "ACCESS DENIED. PLEASE UPGRADE TO PRO.";
    return;
  }
  
  const blob = new Blob([cmdLogArray.join('\n')], { type: 'text/plain' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ConvertCAD_Calculation_Logs.txt';
  a.click();
  window.URL.revokeObjectURL(url);
  logCommand("FILE_IO: LOGS_EXPORTED_SUCCESSFULLY");
});

// Physics Units
const UNITS = {
  length: { items: {'mm': 0.001, 'cm': 0.01, 'm': 1, 'in': 0.0254, 'ft': 0.3048}, defFrom: 'mm', defTo: 'in' },
  pressure: { items: {'Pa': 1, 'kPa': 1000, 'bar': 100000, 'psi': 6894.757}, defFrom: 'bar', defTo: 'psi' }
};

let currentTab = 'length';
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
  if (currentTab === 'mechanical' || currentTab === 'pump' || currentTab === 'license') return;
  
  const val = parseFloat(fromVal.value) || 0;
  const f = fromUnit.value;
  const t = toUnit.value;
  const fFactor = UNITS[currentTab].items[f];
  const tFactor = UNITS[currentTab].items[t];
  
  const result = (val * fFactor) / tFactor;
  toVal.value = result.toFixed(decimals);
  formulaDisp.textContent = `> DIM_SCALE: 1 ${f} = ${(fFactor/tFactor).toFixed(decimals)} ${t}`;
  
  cmdInput.value = `COMPUTING DIMENSION... [${val} ${f} -> ${result.toFixed(decimals)} ${t}]`;
}

function calculateMechanical() {
  const T = parseFloat(document.getElementById('mech-torque').value) || 0;
  const rpm = parseFloat(document.getElementById('mech-rpm').value) || 0;
  const omega = (2 * Math.PI * rpm) / 60;
  const powerKW = (T * omega) / 1000;
  document.getElementById('mech-omega').textContent = `${omega.toFixed(decimals-2)} rad/s`;
  document.getElementById('mech-kw').textContent = `${powerKW.toFixed(decimals-2)} kW`;
  cmdInput.value = `ANALYZING KINEMATICS... [P = ${powerKW.toFixed(decimals-2)} kW]`;
}

function calculatePump() {
  const H = parseFloat(document.getElementById('pump-head').value) || 0;
  const Q = parseFloat(document.getElementById('pump-flow').value) || 0;
  const eff = (parseFloat(document.getElementById('pump-eff').value) || 100) / 100;
  const rho = 1000; const g = 9.81;
  const powerKW = (rho * g * H * Q) / (1000 * eff);
  document.getElementById('pump-power').textContent = `${powerKW.toFixed(decimals-2)} kW`;
  cmdInput.value = `FLUID DYNAMICS SIMULATION... [Hydraulic Power = ${powerKW.toFixed(decimals-2)} kW]`;
}

// Navigation Events
document.querySelectorAll('.tool-btn, #license-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
    if(e.target.classList.contains('tool-btn')) e.target.classList.add('active');
    
    currentTab = e.target.getAttribute('data-tab');
    document.querySelectorAll('.cad-panel').forEach(p => p.classList.add('hidden'));
    
    logCommand(`SWITCH_WORKSPACE: ${currentTab.toUpperCase()}`);
    
    if (currentTab === 'mechanical') {
      document.getElementById('mechanical-panel').classList.remove('hidden');
      calculateMechanical();
    } else if (currentTab === 'pump') {
      document.getElementById('pump-panel').classList.remove('hidden');
      calculatePump();
    } else if (currentTab === 'license') {
      document.getElementById('license-panel').classList.remove('hidden');
      cmdInput.value = "ACCESSING SECURE LICENSING SERVER...";
    } else {
      document.getElementById('standard-panel').classList.remove('hidden');
      populateUnits(currentTab);
      calculateStandard();
    }
  });
});

[fromVal, fromUnit, toUnit].forEach(el => el.addEventListener('input', () => { calculateStandard(); logCommand(`UPDATE_VAR: ${fromVal.value} ${fromUnit.value}`); }));
document.getElementById('swap-btn').addEventListener('click', () => { const temp = fromUnit.value; fromUnit.value = toUnit.value; toUnit.value = temp; calculateStandard(); logCommand('EXECUTE: MIRROR_AXIS'); });
['mech-torque', 'mech-rpm'].forEach(id => document.getElementById(id).addEventListener('input', calculateMechanical));
['pump-head', 'pump-flow', 'pump-eff'].forEach(id => document.getElementById(id).addEventListener('input', calculatePump));

populateUnits('length');
calculateStandard();
