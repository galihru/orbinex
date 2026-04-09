const chapterSearch = document.getElementById("chapter-search");
const chapterLinks = Array.from(document.querySelectorAll("#chapter-list a"));
const sections = Array.from(document.querySelectorAll("main section"));

chapterSearch?.addEventListener("input", (event) => {
  const query = String(event.target.value || "").trim().toLowerCase();
  chapterLinks.forEach((link) => {
    const text = link.textContent.toLowerCase();
    const show = text.includes(query);
    link.parentElement.style.display = show ? "block" : "none";
  });
});

function markActiveLink() {
  let selected = null;
  const y = window.scrollY + 120;
  sections.forEach((section) => {
    if (section.offsetTop <= y) {
      selected = section.id;
    }
  });

  chapterLinks.forEach((link) => {
    const active = link.getAttribute("href") === `#${selected}`;
    link.classList.toggle("active", active);
  });
}

window.addEventListener("scroll", markActiveLink);
markActiveLink();

async function runRust(code) {
  const body = {
    channel: "stable",
    mode: "debug",
    crateType: "bin",
    tests: false,
    code,
  };

  const response = await fetch("https://play.rust-lang.org/execute", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Rust playground request failed with status ${response.status}`);
  }

  const data = await response.json();
  if (data.success) {
    return (data.stdout || "").trim() || "Program completed with no stdout.";
  }
  return (data.stderr || "Execution failed").trim();
}

function runShellScript(code) {
  const lines = code.split("\n").map((l) => l.trim()).filter(Boolean);
  const output = [];
  lines.forEach((line) => {
    output.push(`$ ${line}`);
    if (line.includes("git clone")) {
      output.push("Cloning into 'orbinex'...");
      output.push("remote: Enumerating objects... done");
      return;
    }
    if (line.includes("cd orbinex")) {
      output.push("Changed directory to orbinex");
      return;
    }
    if (line.includes("mill.bat __.compile")) {
      output.push("Compiling modules: orbinexCore, orbinexFetch, orbinex");
      output.push("BUILD SUCCESS in 17s");
      return;
    }
    output.push("Command simulated");
  });
  return output.join("\n");
}

function runScalaDemo() {
  return [
    "Running facade example...",
    "Speed at 1 AU: 29784.69 m/s",
    "Done.",
  ].join("\n");
}

Array.from(document.querySelectorAll(".code-card")).forEach((card) => {
  const codeEl = card.querySelector("code");
  const output = card.querySelector(".run-output");
  const copyBtn = card.querySelector(".copy-btn");
  const runBtn = card.querySelector(".run-btn");
  const toggleBtn = card.querySelector(".toggle-btn");
  const lang = card.dataset.lang || "text";

  copyBtn?.addEventListener("click", async () => {
    const text = codeEl?.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      copyBtn.textContent = "Copied";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 1200);
    } catch (error) {
      copyBtn.textContent = "Failed";
      setTimeout(() => {
        copyBtn.textContent = "Copy";
      }, 1200);
    }
  });

  runBtn?.addEventListener("click", async () => {
    const code = codeEl?.textContent || "";
    output.classList.remove("hidden");
    output.textContent = "Running...";

    try {
      if (lang === "rust") {
        output.textContent = await runRust(code);
      } else if (lang === "shell") {
        output.textContent = runShellScript(code);
      } else if (lang === "scala") {
        output.textContent = runScalaDemo();
      } else {
        output.textContent = "No runner registered for this language.";
      }
    } catch (error) {
      output.textContent = `Runner error: ${error.message}`;
    }
  });

  toggleBtn?.addEventListener("click", () => {
    output.classList.toggle("hidden");
    toggleBtn.textContent = output.classList.contains("hidden") ? "Show" : "Hide";
  });
});

const G = 6.67430e-11;
const massInput = document.getElementById("mass-input");
const radiusInput = document.getElementById("radius-input");
const computeButton = document.getElementById("compute-speed");
const formulaResult = document.getElementById("formula-result");

computeButton?.addEventListener("click", () => {
  const mass = Number(massInput.value);
  const radius = Number(radiusInput.value);

  if (!Number.isFinite(mass) || !Number.isFinite(radius) || mass <= 0 || radius <= 0) {
    formulaResult.textContent = "Please provide positive finite values for mass and radius.";
    return;
  }

  const speed = Math.sqrt((G * mass) / radius);
  formulaResult.textContent = `Circular speed: ${speed.toFixed(2)} m/s`;
});

const terminalHistory = document.getElementById("terminal-history");
const terminalForm = document.getElementById("terminal-form");
const terminalInput = document.getElementById("terminal-input");

const commandTable = {
  help: [
    "Available commands:",
    "- help",
    "- ls",
    "- ./mill.bat __.compile",
    "- orbinex demo speed",
    "- clear",
  ],
  ls: ["README.md", "build.mill", "orbinex/", "orbinexCore/", "orbinexFetch/", "docs/"],
  "./mill.bat __.compile": [
    "[orbinexCore] compile ... done",
    "[orbinexFetch] compile ... done",
    "[orbinex] compile ... done",
    "BUILD SUCCESS",
  ],
  "orbinex demo speed": [
    "Input: solar mass + 1 AU",
    "Output: 29784.69 m/s",
  ],
};

function appendTerminalLine(text, cls = "output") {
  const line = document.createElement("div");
  line.className = `terminal-line ${cls}`;
  line.textContent = text;
  terminalHistory.appendChild(line);
  terminalHistory.scrollTop = terminalHistory.scrollHeight;
}

function executeCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) {
    return;
  }

  appendTerminalLine(`orbinex@lab:$ ${cmd}`, "command");

  if (cmd === "clear") {
    terminalHistory.innerHTML = "";
    return;
  }

  const output = commandTable[cmd];
  if (!output) {
    appendTerminalLine(`Command not recognized: ${cmd}`, "error");
    appendTerminalLine("Type help to see available commands.", "output");
    return;
  }

  output.forEach((line) => appendTerminalLine(line, "output"));
}

terminalForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  executeCommand(terminalInput.value);
  terminalInput.value = "";
});

Array.from(document.querySelectorAll(".cmd-shortcut")).forEach((btn) => {
  btn.addEventListener("click", () => {
    executeCommand(btn.dataset.cmd || "");
    terminalInput.focus();
  });
});

appendTerminalLine("Welcome to Orbinex Terminal Lab.", "output");
appendTerminalLine("Type help to begin.", "output");
