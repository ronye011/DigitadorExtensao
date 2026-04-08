let isUpdating = false;
let message = "TESTE";
let enabled = true;

const stateMap = new WeakMap();

// Carrega configurações
chrome.storage.local.get(["message", "enabled"], (data) => {
  if (data.message) message = data.message;
  if (data.enabled !== undefined) enabled = data.enabled;
});

// Atualiza em tempo real
chrome.storage.onChanged.addListener((changes) => {
  if (changes.message) message = changes.message.newValue;
  if (changes.enabled) enabled = changes.enabled.newValue;
});

// Inserção segura de texto
function insertText(el, char) {
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;

    el.value =
      el.value.substring(0, start) +
      char +
      el.value.substring(end);

    el.selectionStart = el.selectionEnd = start + char.length;
  } else {
    document.execCommand("insertText", false, char);
  }
}

function handleKeydown(e) {
  if (isUpdating) return;
  if (!enabled) return;

  const el = e.target;

  // Só atua em campos de texto
  if (
    el.tagName !== "INPUT" &&
    el.tagName !== "TEXTAREA" &&
    !el.isContentEditable
  ) return;

  if (!message || message.length === 0) return;

  // Permite atalhos (Ctrl, Cmd)
  if (e.ctrlKey || e.metaKey) return;

  // Backspace
  if (e.key === "Backspace") {
    let state = stateMap.get(el) || { index: 0 };
    state.index = Math.max(0, state.index - 1);
    stateMap.set(el, state);
    return;
  }

  // Ignora teclas especiais (Shift, Alt, etc.)
  if (e.key.length > 1) return;

  // Bloqueia digitação original
  e.preventDefault();

  let state = stateMap.get(el) || { index: 0 };

  let char;

  // Lógica sequencial + espaço
  if (state.index >= message.length) {
    char = " ";
    state.index = 0;
  } else {
    char = message[state.index];
    state.index++;
  }

  stateMap.set(el, state);

  isUpdating = true;
  insertText(el, char);
  isUpdating = false;
}

// Listener global leve
document.addEventListener("keydown", handleKeydown, true);