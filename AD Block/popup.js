const input = document.getElementById("text");
const button = document.getElementById("save");
const toggle = document.getElementById("toggle");

// Carregar dados
chrome.storage.local.get(["message", "enabled"], (data) => {
  if (data.message) input.value = data.message;

  if (data.enabled) {
    toggle.classList.add("active");
  }
});

// Salvar mensagem
button.addEventListener("click", () => {
  chrome.storage.local.set({ message: input.value });
});

// Toggle ON/OFF
toggle.addEventListener("click", () => {
  toggle.classList.toggle("active");

  const enabled = toggle.classList.contains("active");

  chrome.storage.local.set({ enabled });
});