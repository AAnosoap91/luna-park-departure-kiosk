/*
 * DEPLOYMENT CONFIGURATION
 * Change this one value after deploying the mobile Departure Pass website.
 */
const MOBILE_SITE_URL = "https://aanosoap91.github.io/luna-park-departure-pass/";

/*
 * EDITABLE PROTOTYPE DATA
 * Change walking/waiting times, crowd levels and descriptions here.
 */
const TRANSPORT_OPTIONS = {
  metro: {
    name: "Metro",
    mobileOption: "metro",
    icon: "🚇",
    walk: "8 min",
    wait: "6–10 min",
    crowd: "Busy",
    crowdColor: "#f59e0b",
    tint: "#dff8fb",
    description: "Frequent services from Milsons Point. Best for trips toward the city and connections across the network.",
    stampSymbol: "🚆",
    stampColor: "#176eaa",
    stampBackground: "#e6f7ff",
    stampMeaning: "The Harbour Line stamp marks your train journey home from the festival."
  },
  bus: {
    name: "Bus",
    mobileOption: "bus",
    icon: "🚌",
    walk: "4 min",
    wait: "12–18 min",
    crowd: "Moderate",
    crowdColor: "#16a46b",
    tint: "#e5faef",
    description: "A short walk to the temporary bus zone. A comfortable choice for nearby suburbs and key interchanges.",
    stampSymbol: "🚌",
    stampColor: "#167353",
    stampBackground: "#e9fbf2",
    stampMeaning: "The Festival Shuttle stamp celebrates the shared ride beyond the harbour."
  },
  taxi: {
    name: "Taxi",
    mobileOption: "taxi",
    icon: "🚕",
    walk: "6 min",
    wait: "15–25 min",
    crowd: "High demand",
    crowdColor: "#e23f75",
    tint: "#fff1c9",
    description: "Follow signs to the managed pick-up zone. Useful for door-to-door travel, but expect a longer event wait.",
    stampSymbol: "🚕",
    stampColor: "#b77700",
    stampBackground: "#fff6d5",
    stampMeaning: "The Night Cab stamp remembers the final ride of your Luna Park evening."
  },
  park: {
    name: "Park",
    mobileOption: "stay",
    icon: "🎡",
    walk: "2 min",
    wait: "No rush",
    crowd: "Quiet",
    crowdColor: "#5a28c9",
    tint: "#f0e9ff",
    description: "Relax in the well-lit waiting area while crowds ease. Ideal if you are not ready to leave straight away.",
    stampSymbol: "🎡",
    stampColor: "#7728bd",
    stampBackground: "#f4ebff",
    stampMeaning: "The Moonlight Wheel stamp marks a calm final moment inside Luna Park."
  }
};

const SCREEN_STEPS = {
  start: { label: "Welcome", index: 0 },
  options: { label: "Choose travel", index: 1 },
  preview: { label: "Preview stamp", index: 2 },
  processing: { label: "Preparing card", index: 3 },
  result: { label: "Travel QR", index: 4 },
  complete: { label: "Complete", index: 4 }
};

let selectedOptionKey = null;
let processingTimers = [];

const screens = [...document.querySelectorAll(".screen")];
const optionGrid = document.querySelector("#optionGrid");
const selectionPlaceholder = document.querySelector("#selectionPlaceholder");
const selectionDetails = document.querySelector("#selectionDetails");
const stepLabel = document.querySelector("#stepLabel");
const stepDots = [...document.querySelectorAll(".step-dots i")];

function renderOptions() {
  optionGrid.innerHTML = Object.entries(TRANSPORT_OPTIONS).map(([key, option]) => `
    <button
      class="option-card"
      type="button"
      data-option="${key}"
      aria-pressed="false"
      style="--option-tint:${option.tint}; --crowd-color:${option.crowdColor}"
    >
      <span class="option-icon" aria-hidden="true">${option.icon}</span>
      <h3>${option.name}</h3>
      <ul class="quick-facts" aria-label="${option.name} estimates">
        <li><span>Walk</span><strong>${option.walk}</strong></li>
        <li><span>Wait</span><strong>${option.wait}</strong></li>
        <li><span>Crowd</span><strong class="crowd">${option.crowd}</strong></li>
      </ul>
    </button>
  `).join("");

  optionGrid.querySelectorAll(".option-card").forEach((card) => {
    card.addEventListener("click", () => selectOption(card.dataset.option));
  });
}

function selectOption(key) {
  if (!TRANSPORT_OPTIONS[key]) return;
  selectedOptionKey = key;
  const option = TRANSPORT_OPTIONS[key];

  optionGrid.querySelectorAll(".option-card").forEach((card) => {
    const isSelected = card.dataset.option === key;
    card.classList.toggle("selected", isSelected);
    card.setAttribute("aria-pressed", String(isSelected));
  });

  document.querySelector("#selectionTitle").textContent = option.name;
  document.querySelector("#selectionDescription").textContent = option.description;
  selectionPlaceholder.hidden = true;
  selectionDetails.hidden = false;
}

function showScreen(name) {
  clearProcessingTimers();
  screens.forEach((screen) => screen.classList.toggle("active", screen.dataset.screen === name));

  const step = SCREEN_STEPS[name];
  stepLabel.textContent = step.label;
  stepDots.forEach((dot, index) => dot.classList.toggle("active", index === step.index));

  window.scrollTo({ top: 0, behavior: "instant" });
  const activeScreen = document.querySelector(`[data-screen="${name}"]`);
  activeScreen.setAttribute("tabindex", "-1");
  activeScreen.focus({ preventScroll: true });
}

function stampMarkup(option) {
  return `
    <span>
      <span class="stamp-symbol" aria-hidden="true">${option.stampSymbol}</span>
      <span class="stamp-name">${option.name.toUpperCase()}</span>
      <small>LUNA PARK · 2026</small>
    </span>
  `;
}

function openPreview() {
  if (!selectedOptionKey) return;
  const option = TRANSPORT_OPTIONS[selectedOptionKey];
  const stamp = document.querySelector("#previewStamp");
  stamp.innerHTML = stampMarkup(option);
  stamp.style.setProperty("--stamp-color", option.stampColor);
  document.querySelector(".stamp-stage").style.setProperty("--stamp-bg", option.stampBackground);
  document.querySelector("#previewOption").textContent = option.name;
  document.querySelector("#stampMeaning").textContent = option.stampMeaning;
  showScreen("preview");
}

function startProcessing() {
  if (!selectedOptionKey) return;
  const option = TRANSPORT_OPTIONS[selectedOptionKey];
  const title = document.querySelector("#processingTitle");
  const message = document.querySelector("#processingMessage");
  const bar = document.querySelector("#progressBar");

  document.querySelector("#processingSymbol").textContent = option.stampSymbol;
  title.textContent = "Stamping your card…";
  message.textContent = `Adding your ${option.name} souvenir stamp.`;
  bar.style.width = "0";
  showScreen("processing");

  processingTimers.push(setTimeout(() => { bar.style.width = "52%"; }, 60));
  processingTimers.push(setTimeout(() => {
    title.textContent = "Generating your QR code…";
    message.textContent = "Personalising your travel information.";
    bar.style.width = "100%";
  }, 1350));
  processingTimers.push(setTimeout(showResult, 2850));
}

function clearProcessingTimers() {
  processingTimers.forEach(clearTimeout);
  processingTimers = [];
}

function showResult() {
  const option = TRANSPORT_OPTIONS[selectedOptionKey];
  const resultStamp = document.querySelector("#resultStamp");
  resultStamp.innerHTML = stampMarkup(option);
  resultStamp.style.setProperty("--stamp-color", option.stampColor);
  document.querySelector("#qrOption").textContent = option.name;
  document.querySelector("#resultOption").textContent = option.name;
  drawQrCode(buildMobilePassUrl(selectedOptionKey));
  showScreen("result");
}

function buildMobilePassUrl(optionKey) {
  const option = TRANSPORT_OPTIONS[optionKey];
  const url = new URL(MOBILE_SITE_URL);
  url.searchParams.set("option", option.mobileOption);
  return url.toString();
}

function restart() {
  selectedOptionKey = null;
  optionGrid.querySelectorAll(".option-card").forEach((card) => {
    card.classList.remove("selected");
    card.setAttribute("aria-pressed", "false");
  });
  selectionPlaceholder.hidden = false;
  selectionDetails.hidden = true;
  showScreen("start");
}

document.querySelector("#insertCardButton").addEventListener("click", () => showScreen("options"));
document.querySelector("#continueButton").addEventListener("click", openPreview);
document.querySelector("#previewBackButton").addEventListener("click", () => showScreen("options"));
document.querySelector("#previewBackButtonBottom").addEventListener("click", () => showScreen("options"));
document.querySelector("#confirmButton").addEventListener("click", startProcessing);
document.querySelector("#finishButton").addEventListener("click", () => showScreen("complete"));
document.querySelector("#restartButton").addEventListener("click", restart);

/*
 * Small, dependency-free QR encoder for this prototype.
 * It creates a standards-compliant Version 5-L QR code (byte mode, mask 0),
 * which comfortably fits a GitHub Pages mobile-site URL.
 */
function drawQrCode(text) {
  const matrix = makeQrV5L(text);
  const canvas = document.querySelector("#qrCanvas");
  canvas.dataset.encodedValue = text;
  const context = canvas.getContext("2d");
  const quietZone = 4;
  const moduleCount = matrix.length + quietZone * 2;
  const pixelRatio = Math.max(1, window.devicePixelRatio || 1);
  const displaySize = 290;
  canvas.width = displaySize * pixelRatio;
  canvas.height = displaySize * pixelRatio;
  context.scale(pixelRatio, pixelRatio);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, displaySize, displaySize);
  const unit = displaySize / moduleCount;
  context.fillStyle = "#171044";
  matrix.forEach((row, y) => row.forEach((dark, x) => {
    if (dark) {
      const left = Math.round((x + quietZone) * unit);
      const top = Math.round((y + quietZone) * unit);
      const right = Math.round((x + quietZone + 1) * unit);
      const bottom = Math.round((y + quietZone + 1) * unit);
      context.fillRect(left, top, right - left, bottom - top);
    }
  }));
}

function makeQrV5L(text) {
  const size = 37;
  const dataCodewords = 108;
  const eccCodewords = 26;
  const bytes = [...new TextEncoder().encode(text)];
  if (bytes.length > 106) throw new Error("Mobile site URL is too long for the prototype QR code.");

  const bits = [];
  const pushBits = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1);
  };
  pushBits(0b0100, 4);
  pushBits(bytes.length, 8);
  bytes.forEach((byte) => pushBits(byte, 8));
  const capacity = dataCodewords * 8;
  pushBits(0, Math.min(4, capacity - bits.length));
  while (bits.length % 8) bits.push(0);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0));
  }
  for (let pad = 0; data.length < dataCodewords; pad += 1) data.push(pad % 2 === 0 ? 0xec : 0x11);

  const codewords = data.concat(reedSolomonRemainder(data, eccCodewords));
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  const setFunction = (x, y, dark) => {
    if (x >= 0 && y >= 0 && x < size && y < size) {
      matrix[y][x] = dark;
      reserved[y][x] = true;
    }
  };

  const drawFinder = (cx, cy) => {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        setFunction(cx + dx, cy + dy, distance !== 2 && distance !== 4);
      }
    }
  };
  drawFinder(3, 3);
  drawFinder(size - 4, 3);
  drawFinder(3, size - 4);

  for (let i = 0; i < size; i += 1) {
    if (!reserved[6][i]) setFunction(i, 6, i % 2 === 0);
    if (!reserved[i][6]) setFunction(6, i, i % 2 === 0);
  }

  for (let dy = -2; dy <= 2; dy += 1) {
    for (let dx = -2; dx <= 2; dx += 1) {
      setFunction(30 + dx, 30 + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
  }

  for (let i = 0; i < 9; i += 1) {
    if (i !== 6) {
      setFunction(8, i, false);
      setFunction(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i += 1) {
    setFunction(size - 1 - i, 8, false);
    setFunction(8, size - 1 - i, false);
  }
  setFunction(8, size - 8, true);

  const dataBits = [];
  codewords.forEach((word) => {
    for (let i = 7; i >= 0; i -= 1) dataBits.push((word >>> i) & 1);
  });

  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vertical = 0; vertical < size; vertical += 1) {
      const y = upward ? size - 1 - vertical : vertical;
      for (let offset = 0; offset < 2; offset += 1) {
        const x = right - offset;
        if (reserved[y][x]) continue;
        const bit = bitIndex < dataBits.length ? dataBits[bitIndex] : 0;
        const masked = bit ^ (((x + y) % 2 === 0) ? 1 : 0);
        matrix[y][x] = Boolean(masked);
        bitIndex += 1;
      }
    }
    upward = !upward;
  }

  const format = qrFormatBits(1, 0); // Error correction level L, mask pattern 0.
  for (let i = 0; i <= 5; i += 1) setFunction(8, i, ((format >>> i) & 1) !== 0);
  setFunction(8, 7, ((format >>> 6) & 1) !== 0);
  setFunction(8, 8, ((format >>> 7) & 1) !== 0);
  setFunction(7, 8, ((format >>> 8) & 1) !== 0);
  for (let i = 9; i < 15; i += 1) setFunction(14 - i, 8, ((format >>> i) & 1) !== 0);
  for (let i = 0; i < 8; i += 1) setFunction(size - 1 - i, 8, ((format >>> i) & 1) !== 0);
  for (let i = 8; i < 15; i += 1) setFunction(8, size - 15 + i, ((format >>> i) & 1) !== 0);
  setFunction(8, size - 8, true);
  return matrix;
}

function reedSolomonRemainder(data, degree) {
  let generator = [1];
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    const next = Array(generator.length + 1).fill(0);
    generator.forEach((coefficient, index) => {
      next[index] ^= coefficient;
      next[index + 1] ^= gfMultiply(coefficient, root);
    });
    generator = next;
    root = gfMultiply(root, 2);
  }

  const result = Array(degree).fill(0);
  data.forEach((value) => {
    const factor = value ^ result[0];
    result.shift();
    result.push(0);
    generator.slice(1).forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor);
    });
  });
  return result;
}

function gfMultiply(a, b) {
  let result = 0;
  for (let i = 0; i < 8; i += 1) {
    if (b & 1) result ^= a;
    b >>>= 1;
    const carry = a & 0x80;
    a = (a << 1) & 0xff;
    if (carry) a ^= 0x1d;
  }
  return result;
}

function qrFormatBits(errorCorrectionLevel, mask) {
  const data = (errorCorrectionLevel << 3) | mask;
  let remainder = data << 10;
  const generator = 0x537;
  while (highestBit(remainder) >= 10) {
    remainder ^= generator << (highestBit(remainder) - 10);
  }
  return ((data << 10) | remainder) ^ 0x5412;
}

function highestBit(value) {
  let result = -1;
  while (value > 0) {
    result += 1;
    value >>>= 1;
  }
  return result;
}

function registerWebMcpTools() {
  const context = document.modelContext;
  if (!context?.registerTool) return;
  const register = (tool) => Promise.resolve(context.registerTool(tool)).catch(() => {});

  register({
    name: "start_departure_flow",
    title: "Start departure flow",
    description: "Simulate inserting a festival card and show the travel options.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute() { showScreen("options"); return { screen: "options" }; }
  });

  register({
    name: "select_travel_option",
    title: "Select travel option",
    description: "Select one of the four prototype travel options and open its stamp preview.",
    inputSchema: {
      type: "object",
      properties: { option: { type: "string", enum: Object.keys(TRANSPORT_OPTIONS) } },
      required: ["option"],
      additionalProperties: false
    },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute(input) {
      if (!input || !TRANSPORT_OPTIONS[input.option]) throw new Error("Choose metro, bus, taxi or park.");
      showScreen("options");
      selectOption(input.option);
      openPreview();
      return { selected: input.option, screen: "preview" };
    }
  });

  register({
    name: "restart_departure_flow",
    title: "Restart departure flow",
    description: "Reset the prototype for the next user.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: false, untrustedContentHint: false },
    execute() { restart(); return { screen: "start" }; }
  });
}

renderOptions();
registerWebMcpTools();
