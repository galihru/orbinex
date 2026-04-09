(() => {
  const G = 6.6743e-11;
  const SOLAR_MASS = 1.98847e30;
  const AU = 1.495978707e11;

  function qsa(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function formatFixed(value, digits = 2) {
    if (!Number.isFinite(value)) {
      return "NaN";
    }
    return value.toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  function normalizeCommand(raw) {
    return String(raw || "").trim().replace(/\s+/g, " ").toLowerCase();
  }

  function parseNumberFlag(command, flagName, fallback) {
    const regex = new RegExp(`--${flagName}\\s+([^\\s]+)`, "i");
    const match = command.match(regex);
    if (!match) {
      return fallback;
    }
    const parsed = Number(match[1]);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function safeName(name) {
    const source = String(name || "").trim();
    return source
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function currentFileName() {
    const path = window.location.pathname;
    const segment = path.substring(path.lastIndexOf("/") + 1);
    return segment || "index.html";
  }

  function computeCircularSpeed(mass, radius) {
    return Math.sqrt((G * mass) / radius);
  }

  function computeOrbitalPeriod(axis, mass) {
    return 2 * Math.PI * Math.sqrt(Math.pow(axis, 3) / (G * mass));
  }

  function simulateScalaTerminalCommand(raw, context) {
    const command = String(raw || "").trim();
    const normalized = normalizeCommand(command);

    if (!command) {
      return { lines: [], level: "output" };
    }

    if (normalized === "clear") {
      return { clear: true, lines: [], level: "output" };
    }

    if (normalized === "help") {
      return {
        lines: [
          "Available commands:",
          "- help",
          "- pwd",
          "- ls",
          "- java -version",
          "- scala-cli version",
          "- ./mill.bat __.compile",
          "- orbinex formula speed --mass <kg> --radius <m>",
          "- orbinex formula period --mass <kg> --axis <m>",
          "- orbinex fetch exoplanet --limit <n>",
          "- clear",
        ],
        level: "output",
      };
    }

    if (normalized === "pwd") {
      return { lines: [context.cwd], level: "output" };
    }

    if (normalized === "ls" || normalized === "dir") {
      return {
        lines: ["README.md", "build.mill", "orbinex/", "orbinexCore/", "orbinexFetch/", "docs/", "website/"],
        level: "output",
      };
    }

    if (normalized.startsWith("cd ")) {
      const next = command.substring(3).trim();
      if (!next) {
        return { lines: ["cd: missing directory argument"], level: "error" };
      }
      context.cwd = next;
      return { lines: [`Moved to ${context.cwd}`], level: "output" };
    }

    if (normalized === "java -version") {
      return {
        lines: [
          'openjdk version "21.0.2" 2026-01-16',
          "OpenJDK Runtime Environment Temurin-21.0.2+13",
          "OpenJDK 64-Bit Server VM Temurin-21.0.2+13",
        ],
        level: "output",
      };
    }

    if (normalized === "scala-cli version") {
      return {
        lines: ["Scala CLI version: 1.7.0", "Scala version (default): 3.8.1"],
        level: "output",
      };
    }

    if (normalized.includes("./mill.bat __.compile") || normalized.includes("mill.bat __.compile")) {
      return {
        lines: [
          "[orbinexCore] compile ... done",
          "[orbinexFetch] compile ... done",
          "[orbinex] compile ... done",
          "BUILD SUCCESS in 16.8s",
        ],
        level: "output",
      };
    }

    if (normalized.includes("./mill.bat __.test") || normalized.includes("mill.bat __.test")) {
      return {
        lines: [
          "[orbinexCore] tests ... passed",
          "[orbinexFetch] tests ... passed",
          "[orbinex] tests ... passed",
          "TEST SUCCESS",
        ],
        level: "output",
      };
    }

    if (normalized.startsWith("git clone ")) {
      return {
        lines: ["Cloning into 'orbinex'...", "remote: Enumerating objects... done", "remote: Total 100%, done"],
        level: "output",
      };
    }

    if (normalized.startsWith("scala-cli run")) {
      const speed = computeCircularSpeed(SOLAR_MASS, AU);
      return {
        lines: [
          "Compiling Main.scala...",
          `Circular speed at 1 AU: ${formatFixed(speed, 2)} m/s`,
          "Run completed.",
        ],
        level: "output",
      };
    }

    if (normalized.startsWith("orbinex formula speed")) {
      const mass = parseNumberFlag(command, "mass", SOLAR_MASS);
      const radius = parseNumberFlag(command, "radius", AU);
      if (mass <= 0 || radius <= 0) {
        return { lines: ["mass and radius must be positive numbers"], level: "error" };
      }
      const speed = computeCircularSpeed(mass, radius);
      return {
        lines: [
          `Input mass = ${mass.toExponential(6)} kg`,
          `Input radius = ${radius.toExponential(6)} m`,
          `circular_speed_mps = ${formatFixed(speed, 4)}`,
        ],
        level: "output",
      };
    }

    if (normalized.startsWith("orbinex formula period")) {
      const mass = parseNumberFlag(command, "mass", SOLAR_MASS);
      const axis = parseNumberFlag(command, "axis", AU);
      if (mass <= 0 || axis <= 0) {
        return { lines: ["mass and axis must be positive numbers"], level: "error" };
      }
      const periodSeconds = computeOrbitalPeriod(axis, mass);
      const periodDays = periodSeconds / 86400;
      return {
        lines: [
          `orbital_period_seconds = ${formatFixed(periodSeconds, 2)}`,
          `orbital_period_days = ${formatFixed(periodDays, 5)}`,
        ],
        level: "output",
      };
    }

    if (normalized.startsWith("orbinex fetch exoplanet")) {
      const limit = Math.max(1, Math.min(10, Math.trunc(parseNumberFlag(command, "limit", 3))));
      const rows = [];
      for (let i = 1; i <= limit; i += 1) {
        rows.push(`row ${i}: system=Kepler-${90 + i}, axis_au=${(0.31 + i * 0.04).toFixed(3)}, ecc=${(0.01 * i).toFixed(3)}`);
      }
      return {
        lines: [`Fetching ${limit} exoplanet rows...`, ...rows, "Fetch completed."],
        level: "output",
      };
    }

    return {
      lines: [`Unknown command: ${command}`, "Type help to inspect available commands."],
      level: "error",
    };
  }

  function simulateShellScriptBlock(code) {
    const context = { cwd: "C:/Users/student/orbinex" };
    const lines = code
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const output = [];

    lines.forEach((line) => {
      output.push(`$ ${line}`);
      const result = simulateScalaTerminalCommand(line, context);
      if (result.clear) {
        output.length = 0;
        return;
      }
      result.lines.forEach((entry) => output.push(entry));
    });

    return output.join("\n");
  }

  function parseScalaValue(source, regex, fallback) {
    const match = source.match(regex);
    if (!match) {
      return fallback;
    }
    const value = Number(match[1]);
    return Number.isFinite(value) ? value : fallback;
  }

  function simulateScalaSnippet(code) {
    const mass = parseScalaValue(code, /primaryMassKg\s*=\s*([0-9.eE+-]+)/, SOLAR_MASS);
    const radius = parseScalaValue(code, /orbitalRadiusMeters\s*=\s*([0-9.eE+-]+)/, AU);
    const axis = parseScalaValue(code, /axis\s*=\s*([0-9.eE+-]+)/, radius);
    const speed = computeCircularSpeed(mass, radius);
    const period = computeOrbitalPeriod(axis, mass);

    const lines = ["Scala run simulation:"];
    if (code.toLowerCase().includes("speed")) {
      lines.push(`Circular speed = ${formatFixed(speed, 2)} m/s`);
    }
    if (code.toLowerCase().includes("period")) {
      lines.push(`Orbital period = ${formatFixed(period, 2)} s`);
      lines.push(`Orbital period = ${formatFixed(period / 86400, 5)} days`);
    }
    if (lines.length === 1) {
      lines.push("Program completed. No printable output was detected.");
    }
    return lines.join("\n");
  }

  function initChapterSearchAndLinks() {
    const fileName = currentFileName();

    qsa(".book-sidebar").forEach((sidebar) => {
      const search = sidebar.querySelector("[data-chapter-search]");
      const links = qsa(".chapter-link", sidebar);

      links.forEach((link) => {
        const href = String(link.getAttribute("href") || "");
        const hrefFile = href.split("?")[0].split("#")[0].split("/").pop() || "index.html";
        link.classList.toggle("active", hrefFile === fileName);
      });

      if (!search) {
        return;
      }

      search.addEventListener("input", (event) => {
        const query = String(event.target.value || "").trim().toLowerCase();
        links.forEach((link) => {
          const text = link.textContent.toLowerCase();
          const visible = text.includes(query);
          if (link.parentElement) {
            link.parentElement.style.display = visible ? "block" : "none";
          }
        });
      });
    });
  }

  function initCodeCards() {
    qsa(".code-card").forEach((card) => {
      const codeNode = card.querySelector("code");
      const output = card.querySelector(".run-output");
      const copyBtn = card.querySelector(".copy-btn");
      const runBtn = card.querySelector(".run-btn");
      const toggleBtn = card.querySelector(".toggle-btn");
      const language = card.dataset.lang || "text";

      if (!codeNode || !output) {
        return;
      }

      copyBtn?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(codeNode.textContent || "");
          copyBtn.textContent = "Copied";
        } catch (error) {
          copyBtn.textContent = "Copy Failed";
        }
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1200);
      });

      runBtn?.addEventListener("click", () => {
        const source = codeNode.textContent || "";
        output.classList.remove("hidden");

        if (language === "shell") {
          output.textContent = simulateShellScriptBlock(source);
          return;
        }

        if (language === "scala") {
          output.textContent = simulateScalaSnippet(source);
          return;
        }

        output.textContent = "No simulation runner is available for this language.";
      });

      toggleBtn?.addEventListener("click", () => {
        output.classList.toggle("hidden");
        toggleBtn.textContent = output.classList.contains("hidden") ? "Show" : "Hide";
      });
    });
  }

  function initFormulaLab() {
    const massInput = document.getElementById("formula-mass");
    const radiusInput = document.getElementById("formula-radius");
    const speedButton = document.getElementById("formula-calc-speed");
    const speedOutput = document.getElementById("formula-speed-output");

    speedButton?.addEventListener("click", () => {
      const mass = Number(massInput?.value);
      const radius = Number(radiusInput?.value);
      if (!Number.isFinite(mass) || !Number.isFinite(radius) || mass <= 0 || radius <= 0) {
        if (speedOutput) {
          speedOutput.textContent = "Mass and radius must be positive finite numbers.";
        }
        return;
      }
      const speed = computeCircularSpeed(mass, radius);
      if (speedOutput) {
        speedOutput.textContent = `Circular speed = ${formatFixed(speed, 5)} m/s`;
      }
    });

    const axisInput = document.getElementById("formula-axis");
    const periodMassInput = document.getElementById("formula-period-mass");
    const periodButton = document.getElementById("formula-calc-period");
    const periodOutput = document.getElementById("formula-period-output");

    periodButton?.addEventListener("click", () => {
      const axis = Number(axisInput?.value);
      const mass = Number(periodMassInput?.value);
      if (!Number.isFinite(axis) || !Number.isFinite(mass) || axis <= 0 || mass <= 0) {
        if (periodOutput) {
          periodOutput.textContent = "Axis and mass must be positive finite numbers.";
        }
        return;
      }
      const periodSeconds = computeOrbitalPeriod(axis, mass);
      const periodDays = periodSeconds / 86400;
      if (periodOutput) {
        periodOutput.textContent = `Orbital period = ${formatFixed(periodSeconds, 2)} s (${formatFixed(periodDays, 5)} days)`;
      }
    });
  }

  function createTerminal(root, options = {}) {
    if (!root || root.dataset.terminalReady === "true") {
      return null;
    }

    root.dataset.terminalReady = "true";

    const history = root.querySelector("[data-terminal-history]") || root.querySelector(".terminal-history");
    const form = root.querySelector("[data-terminal-form]") || root.querySelector(".terminal-input-row");
    const input = root.querySelector("[data-terminal-input]") || root.querySelector("input");
    const shortcuts = qsa(".cmd-shortcut", root);
    const promptText = root.querySelector(".prompt")?.textContent || "scala@orbinex:$";
    const context = { cwd: "C:/Users/student/orbinex" };

    if (!history || !form || !input) {
      return null;
    }

    function appendLine(text, level = "output") {
      const line = document.createElement("div");
      line.className = `terminal-line ${level}`;
      line.textContent = text;
      history.appendChild(line);
      history.scrollTop = history.scrollHeight;
    }

    function clear() {
      history.innerHTML = "";
    }

    function execute(raw, userTriggered = true) {
      const command = String(raw || "").trim();
      if (!command) {
        return { lines: [], level: "output" };
      }

      appendLine(`${promptText} ${command}`, "command");
      const result = simulateScalaTerminalCommand(command, context);

      if (result.clear) {
        clear();
      } else {
        result.lines.forEach((entry) => appendLine(entry, result.level || "output"));
      }

      if (typeof options.onCommand === "function") {
        options.onCommand(command, result, api, userTriggered);
      }

      return result;
    }

    const api = {
      execute,
      appendLine,
      clear,
      context,
      reset: () => {
        clear();
        const title = root.dataset.terminalName || "Scala Terminal";
        appendLine(`${title} ready. Type help to inspect commands.`, "system");
      },
    };

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      execute(input.value, true);
      input.value = "";
    });

    shortcuts.forEach((button) => {
      button.addEventListener("click", () => {
        execute(button.dataset.cmd || "", true);
        input.focus();
      });
    });

    api.reset();
    return api;
  }

  function initStepLabs() {
    qsa("[data-step-lab]").forEach((lab) => {
      const stepItems = qsa("[data-step-list] li", lab);
      const status = lab.querySelector("[data-step-status]");
      const terminalRoot = lab.querySelector("[data-terminal-instance]");
      const nextButton = lab.querySelector("[data-step-next]");
      const resetButton = lab.querySelector("[data-step-reset]");

      if (!stepItems.length || !terminalRoot) {
        return;
      }

      let currentIndex = 0;
      let terminalApi = null;

      function updateStepVisuals() {
        stepItems.forEach((item, index) => {
          item.classList.toggle("is-current", index === currentIndex);
          item.classList.toggle("is-done", index < currentIndex);
        });
        if (status) {
          status.textContent = currentIndex >= stepItems.length ? "All steps completed" : `Step ${currentIndex + 1} of ${stepItems.length}`;
        }
      }

      function expectedCommand() {
        return stepItems[currentIndex]?.dataset.stepCommand || "";
      }

      function resetLab() {
        currentIndex = 0;
        updateStepVisuals();
        terminalApi?.reset();
        terminalApi?.appendLine(`Guided mode started. Expected command: ${expectedCommand()}`, "hint");
      }

      function evaluateCommand(command) {
        if (currentIndex >= stepItems.length) {
          return;
        }
        const expected = expectedCommand();
        if (normalizeCommand(command) === normalizeCommand(expected)) {
          currentIndex += 1;
          updateStepVisuals();
          if (currentIndex < stepItems.length) {
            terminalApi?.appendLine(`Step accepted. Next expected command: ${expectedCommand()}`, "hint");
          } else {
            terminalApi?.appendLine("All guided steps completed successfully.", "system");
          }
        } else {
          terminalApi?.appendLine(`Command accepted by terminal, but guided target is: ${expected}`, "hint");
        }
      }

      terminalApi = createTerminal(terminalRoot, {
        onCommand: (command) => evaluateCommand(command),
      });

      nextButton?.addEventListener("click", () => {
        if (currentIndex >= stepItems.length) {
          terminalApi?.appendLine("All steps are already completed.", "system");
          return;
        }
        terminalApi?.execute(expectedCommand(), false);
      });

      resetButton?.addEventListener("click", () => {
        resetLab();
      });

      resetLab();
    });
  }

  function initStandaloneTerminals() {
    qsa("[data-terminal-instance]").forEach((root) => {
      if (root.dataset.terminalReady === "true") {
        return;
      }
      createTerminal(root);
    });
  }

  function shuffle(array) {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function encodePayload(payload) {
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json);
    let binary = "";
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  function decodePayload(token) {
    const normalized = token.replace(/-/g, "+").replace(/_/g, "/");
    const pad = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
    const binary = atob(normalized + pad);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json);
  }

  function badgeForScore(score) {
    if (score >= 92) {
      return { name: "Platinum Orbiter", className: "badge-theme-platinum" };
    }
    if (score >= 80) {
      return { name: "Gold Navigator", className: "badge-theme-gold" };
    }
    if (score >= 68) {
      return { name: "Silver Trajectory", className: "badge-theme-silver" };
    }
    if (score >= 52) {
      return { name: "Bronze Cadet", className: "badge-theme-bronze" };
    }
    return { name: "Apprentice", className: "badge-theme-apprentice" };
  }

  function secondsToClock(totalSeconds) {
    const value = Math.max(0, Math.trunc(totalSeconds));
    const mm = String(Math.floor(value / 60)).padStart(2, "0");
    const ss = String(value % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }

  function initQuiz() {
    const startForm = document.querySelector("[data-quiz-start-form]");
    const nameInput = document.querySelector("[data-quiz-name]");
    const timerNode = document.querySelector("[data-quiz-timer]");
    const container = document.querySelector("[data-quiz-container]");
    const submitButton = document.querySelector("[data-quiz-submit]");
    const resultNode = document.querySelector("[data-quiz-result]");
    const sharedNode = document.querySelector("[data-shared-result]");

    if (!startForm || !nameInput || !timerNode || !container || !submitButton || !resultNode) {
      return;
    }

    const questionBank = [
      {
        id: "q-g-constant",
        type: "mcq",
        prompt: "What value is used for gravitational constant G in Orbinex formulas?",
        options: ["6.67430e-11", "9.80665", "3.14159", "1.496e11"],
        answer: "0",
      },
      {
        id: "q-circular-formula",
        type: "mcq",
        prompt: "Which formula defines circular orbit speed?",
        options: ["v = G * M / r", "v = sqrt((G * M) / r)", "v = 2 * pi * r", "v = M / r^2"],
        answer: "1",
      },
      {
        id: "q-module-fetch",
        type: "mcq",
        prompt: "Which module is responsible for dynamic HTTP ingestion?",
        options: ["orbinex-core", "orbinex-fetch", "orbinex-ui", "orbinex-docs"],
        answer: "1",
      },
      {
        id: "q-module-facade",
        type: "mcq",
        prompt: "Which artifact exposes the unified facade API?",
        options: ["orbinex-core_3", "orbinex-fetch_3", "orbinex_3", "scala3-library_3"],
        answer: "2",
      },
      {
        id: "q-mu-definition",
        type: "mcq",
        prompt: "In orbital period equations, what does mu represent?",
        options: ["m1 + m2", "G * M", "r / G", "a^3 / T^2"],
        answer: "1",
      },
      {
        id: "q-radius-fallback",
        type: "mcq",
        prompt: "Fallback radius scaling in docs uses Earth-mass exponent:",
        options: ["0.12", "0.29", "0.50", "1.00"],
        answer: "1",
      },
      {
        id: "q-speed-estimate",
        type: "numeric",
        prompt: "Approximate circular speed at 1 AU around 1 solar mass (m/s).",
        expected: 29784.69,
        tolerance: 250,
        placeholder: "Enter value in m/s",
      },
      {
        id: "q-period-days",
        type: "numeric",
        prompt: "Approximate orbital period at 1 AU around 1 solar mass (days).",
        expected: 365.256,
        tolerance: 5,
        placeholder: "Enter value in days",
      },
      {
        id: "q-compile-cmd",
        type: "terminal",
        prompt: "Practical: run the command that compiles all modules.",
        expectedPattern: /^(\.\/)?mill\.bat __\.compile$/i,
        hint: "Use Mill command from repository root.",
      },
      {
        id: "q-speed-cmd",
        type: "terminal",
        prompt: "Practical: run command to compute circular speed with mass and radius flags.",
        expectedPattern: /^orbinex formula speed --mass [^\s]+ --radius [^\s]+$/i,
        hint: "Command must start with: orbinex formula speed",
      },
      {
        id: "q-period-cmd",
        type: "terminal",
        prompt: "Practical: run command to compute orbital period using mass and axis.",
        expectedPattern: /^orbinex formula period --mass [^\s]+ --axis [^\s]+$/i,
        hint: "Command must start with: orbinex formula period",
      },
      {
        id: "q-fetch-cmd",
        type: "terminal",
        prompt: "Practical: fetch exoplanet rows with an explicit limit.",
        expectedPattern: /^orbinex fetch exoplanet --limit [0-9]+$/i,
        hint: "Command must include --limit <n>",
      },
    ];

    const state = {
      started: false,
      userName: "",
      questions: [],
      answers: {},
      startAt: 0,
      timerId: null,
      durationSec: 0,
    };

    function clearTimer() {
      if (state.timerId) {
        clearInterval(state.timerId);
        state.timerId = null;
      }
    }

    function setTimerText(sec) {
      timerNode.textContent = secondsToClock(sec);
    }

    function startTimer() {
      setTimerText(0);
      state.startAt = Date.now();
      clearTimer();
      state.timerId = setInterval(() => {
        const sec = Math.floor((Date.now() - state.startAt) / 1000);
        state.durationSec = sec;
        setTimerText(sec);
      }, 1000);
    }

    function stopTimer() {
      clearTimer();
      state.durationSec = Math.floor((Date.now() - state.startAt) / 1000);
      setTimerText(state.durationSec);
    }

    function selectQuestionSet() {
      const theory = shuffle(questionBank.filter((q) => q.type !== "terminal")).slice(0, 6);
      const practical = shuffle(questionBank.filter((q) => q.type === "terminal")).slice(0, 2);
      return shuffle([...theory, ...practical]);
    }

    function appendQuizTerminalLine(historyNode, text, level) {
      const line = document.createElement("div");
      line.className = `terminal-line ${level}`;
      line.textContent = text;
      historyNode.appendChild(line);
      historyNode.scrollTop = historyNode.scrollHeight;
    }

    function renderQuizQuestions() {
      container.innerHTML = "";

      state.questions.forEach((question, index) => {
        const card = document.createElement("article");
        card.className = "quiz-question";
        card.dataset.questionId = question.id;

        const title = document.createElement("h3");
        title.textContent = `${index + 1}. ${question.prompt}`;
        card.appendChild(title);

        if (question.type === "mcq") {
          const options = document.createElement("div");
          options.className = "quiz-options";
          question.options.forEach((optionText, optionIndex) => {
            const label = document.createElement("label");
            const input = document.createElement("input");
            input.type = "radio";
            input.name = `quiz-${question.id}`;
            input.value = String(optionIndex);
            input.addEventListener("change", () => {
              state.answers[question.id] = input.value;
            });

            const span = document.createElement("span");
            span.textContent = optionText;

            label.appendChild(input);
            label.appendChild(span);
            options.appendChild(label);
          });
          card.appendChild(options);
        }

        if (question.type === "numeric") {
          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = question.placeholder || "Enter your answer";
          input.addEventListener("input", () => {
            state.answers[question.id] = input.value.trim();
          });
          card.appendChild(input);
        }

        if (question.type === "terminal") {
          const hint = document.createElement("p");
          hint.className = "muted";
          hint.textContent = question.hint;
          card.appendChild(hint);

          const terminal = document.createElement("div");
          terminal.className = "quiz-terminal";

          const history = document.createElement("div");
          history.className = "quiz-terminal-history";
          terminal.appendChild(history);

          const form = document.createElement("form");
          form.className = "quiz-terminal-form";

          const prompt = document.createElement("span");
          prompt.className = "prompt";
          prompt.textContent = "scala@quiz:$";

          const input = document.createElement("input");
          input.className = "quiz-terminal-input";
          input.autocomplete = "off";
          input.placeholder = "Type command and run";

          const run = document.createElement("button");
          run.className = "quiz-terminal-run";
          run.type = "submit";
          run.textContent = "Run";

          form.appendChild(prompt);
          form.appendChild(input);
          form.appendChild(run);
          terminal.appendChild(form);
          card.appendChild(terminal);

          appendQuizTerminalLine(history, "Quiz terminal ready. Run a command for this task.", "system");

          const terminalContext = { cwd: "C:/Users/student/orbinex" };
          form.addEventListener("submit", (event) => {
            event.preventDefault();
            const command = input.value.trim();
            if (!command) {
              return;
            }

            appendQuizTerminalLine(history, `scala@quiz:$ ${command}`, "command");
            const result = simulateScalaTerminalCommand(command, terminalContext);

            if (result.clear) {
              history.innerHTML = "";
              appendQuizTerminalLine(history, "Terminal cleared.", "system");
            } else {
              result.lines.forEach((line) => appendQuizTerminalLine(history, line, result.level || "output"));
            }

            state.answers[question.id] = command;
            const valid = question.expectedPattern.test(command);
            appendQuizTerminalLine(
              history,
              valid ? "Command shape for this question is valid." : `Expected pattern not met. Hint: ${question.hint}`,
              valid ? "system" : "hint"
            );
            input.value = "";
          });
        }

        container.appendChild(card);
      });
    }

    function evaluateQuestion(question, answer) {
      if (question.type === "mcq") {
        const correct = String(answer || "") === question.answer;
        return { correct, answerText: answer || "(no answer)" };
      }

      if (question.type === "numeric") {
        const numeric = Number(answer);
        const correct = Number.isFinite(numeric) && Math.abs(numeric - question.expected) <= question.tolerance;
        return { correct, answerText: Number.isFinite(numeric) ? String(numeric) : "(invalid number)" };
      }

      if (question.type === "terminal") {
        const text = String(answer || "").trim();
        const correct = question.expectedPattern.test(text);
        return { correct, answerText: text || "(no command)" };
      }

      return { correct: false, answerText: "(unsupported question type)" };
    }

    function renderResult(data) {
      const summaryHtml = `
        <div class="result-summary">
          <div class="result-chip"><span>Name</span><strong>${safeName(data.name)}</strong></div>
          <div class="result-chip"><span>Score</span><strong>${data.score}%</strong></div>
          <div class="result-chip"><span>Badge</span><strong>${safeName(data.badge)}</strong></div>
          <div class="result-chip"><span>Duration</span><strong>${secondsToClock(data.durationSec)}</strong></div>
        </div>
      `;

      const listHtml = data.items
        .map((item, index) => {
          return `<div class="result-question-item ${item.correct ? "correct" : "wrong"}">
            Q${index + 1}: ${safeName(item.prompt)}<br />
            Your answer: ${safeName(item.answerText)}<br />
            Status: ${item.correct ? "Correct" : "Incorrect"}
          </div>`;
        })
        .join("");

      const payload = {
        name: data.name,
        score: data.score,
        badge: data.badge,
        durationSec: data.durationSec,
        finishedAt: data.finishedAt,
        items: data.items,
      };
      const token = encodePayload(payload);
      const shareUrl = `${window.location.origin}${window.location.pathname}?result=${token}`;

      resultNode.className = `quiz-result ${data.badgeClass}`;
      resultNode.innerHTML = `
        <h3>Quiz Result</h3>
        ${summaryHtml}
        <p class="muted">Completed at: ${safeName(data.finishedAt)}</p>
        <div class="result-questions">${listHtml}</div>
        <div class="chapter-pagination">
          <button class="btn btn-primary" type="button" data-share-copy>Copy Share Link</button>
          <a class="btn btn-ghost" href="${shareUrl}" target="_blank" rel="noreferrer">Open Share Link</a>
        </div>
      `;
      resultNode.classList.remove("hidden");

      const copyButton = resultNode.querySelector("[data-share-copy]");
      copyButton?.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          copyButton.textContent = "Link Copied";
        } catch (error) {
          copyButton.textContent = "Copy Failed";
        }
        setTimeout(() => {
          copyButton.textContent = "Copy Share Link";
        }, 1300);
      });
    }

    function renderSharedResult(payload) {
      if (!sharedNode) {
        return;
      }

      const badgeMeta = badgeForScore(Number(payload.score || 0));
      const items = Array.isArray(payload.items) ? payload.items : [];
      const itemsHtml = items
        .map((item, index) => {
          return `<div class="result-question-item ${item.correct ? "correct" : "wrong"}">
            Q${index + 1}: ${safeName(item.prompt)}<br />
            Answer: ${safeName(item.answerText)}<br />
            Status: ${item.correct ? "Correct" : "Incorrect"}
          </div>`;
        })
        .join("");

      sharedNode.className = `shared-result ${badgeMeta.className}`;
      sharedNode.innerHTML = `
        <h2>Shared Badge View</h2>
        <p>This link displays a completed quiz profile.</p>
        <div class="result-summary">
          <div class="result-chip"><span>Name</span><strong>${safeName(payload.name || "Unknown")}</strong></div>
          <div class="result-chip"><span>Score</span><strong>${safeName(String(payload.score || 0))}%</strong></div>
          <div class="result-chip"><span>Badge</span><strong>${safeName(payload.badge || badgeMeta.name)}</strong></div>
          <div class="result-chip"><span>Duration</span><strong>${secondsToClock(Number(payload.durationSec || 0))}</strong></div>
        </div>
        <p class="muted">Completed at: ${safeName(payload.finishedAt || "Unknown")}</p>
        <div class="result-questions">${itemsHtml || "<p>No question details in this shared payload.</p>"}</div>
      `;
      sharedNode.classList.remove("hidden");
    }

    function gradeQuiz() {
      const evaluations = state.questions.map((question) => {
        const answer = state.answers[question.id];
        const evaluated = evaluateQuestion(question, answer);
        return {
          prompt: question.prompt,
          answerText: evaluated.answerText,
          correct: evaluated.correct,
        };
      });

      const correctCount = evaluations.filter((item) => item.correct).length;
      const score = Math.round((correctCount / state.questions.length) * 100);
      const badge = badgeForScore(score);

      return {
        name: state.userName,
        score,
        badge: badge.name,
        badgeClass: badge.className,
        durationSec: state.durationSec,
        finishedAt: new Date().toLocaleString(),
        items: evaluations,
      };
    }

    function beginQuizSession(userName) {
      state.started = true;
      state.userName = userName;
      state.questions = selectQuestionSet();
      state.answers = {};

      renderQuizQuestions();
      resultNode.classList.add("hidden");
      submitButton.disabled = false;
      startTimer();
    }

    startForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const name = String(nameInput.value || "").trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      beginQuizSession(name);
    });

    submitButton.addEventListener("click", () => {
      if (!state.started) {
        return;
      }
      stopTimer();
      const result = gradeQuiz();
      renderResult(result);
    });

    const params = new URLSearchParams(window.location.search);
    const sharedToken = params.get("result");
    if (sharedToken) {
      try {
        const payload = decodePayload(sharedToken);
        renderSharedResult(payload);
      } catch (error) {
        if (sharedNode) {
          sharedNode.classList.remove("hidden");
          sharedNode.innerHTML = `<p>Shared result could not be decoded.</p>`;
        }
      }
    }
  }

  initChapterSearchAndLinks();
  initCodeCards();
  initFormulaLab();
  initStepLabs();
  initStandaloneTerminals();
  initQuiz();
})();
