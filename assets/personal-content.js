(function(){"use strict";
  (function ladder() {
    var data = {
      suggest: {
        meta: "01 / suggest",
        title: "Suggest",
        text: "Summarize, draft, classify, or analyze. Output is read by a human; nothing changes in a system of record.",
        risk: "low",
        riskLabel: "low risk",
        gates: ["source attribution", "logged prompt and output", "reviewer can ignore safely"]
      },
      prepare: {
        meta: "02 / prepare",
        title: "Prepare",
        text: "Create a next action for review: a draft message, CRM update proposal, ticket, invoice match, or implementation plan.",
        risk: "low",
        riskLabel: "low-medium risk",
        gates: ["diff visible before save", "named owner approves", "edit history retained"]
      },
      modify: {
        meta: "03 / modify",
        title: "Modify",
        text: "Change a file, record, ticket, or field. The state of the system moves and humans review after the fact.",
        risk: "med",
        riskLabel: "medium risk",
        gates: ["field-level audit log", "rollback path defined", "restricted to scoped objects"]
      },
      trigger: {
        meta: "04 / trigger",
        title: "Trigger",
        text: "Start a workflow, escalate, notify, or route work to others. Side effects ripple to people downstream.",
        risk: "high",
        riskLabel: "high risk",
        gates: ["idempotency keys", "escalation owner on call", "cancel and reverse path tested"]
      },
      commit: {
        meta: "05 / commit",
        title: "Commit",
        text: "Spend, approve, deploy, sign, or contact externally. The action cannot be silently undone.",
        risk: "crit",
        riskLabel: "critical risk",
        gates: ["two-party authorization", "pre-commit eval gate", "recovery drill rehearsed"]
      }
    };
    var buttons = document.querySelectorAll(".ladder-step");
    var meta = document.getElementById("ladderMeta");
    var title = document.getElementById("ladderTitle");
    var text = document.getElementById("ladderText");
    var risk = document.getElementById("ladderRisk");
    var gates = document.getElementById("ladderGates");
    function render(key) {
      var item = data[key];
      if (!item) return;
      meta.textContent = item.meta;
      title.textContent = item.title;
      text.textContent = item.text;
      risk.className = "risk " + item.risk;
      risk.innerHTML = "<i></i> " + item.riskLabel;
      gates.innerHTML = item.gates.map(function (gate) { return "<li>" + gate + "</li>"; }).join("");
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.classList.remove("active");
          other.setAttribute("aria-selected", "false");
        });
        button.classList.add("active");
        button.setAttribute("aria-selected", "true");
        render(button.getAttribute("data-step"));
      });
    });
  })();

  (function signalLoop() {
    var data = {
      search: { code: '1  search("agent governance")\n2  results -> sources[]\n3  sources -> readable evidence' },
      scrape: { code: '1  scrape(url)\n2  html -> markdown + json\n3  screenshot -> review artifact' },
      map: { code: '1  map(domain)\n2  routes -> source graph\n3  changes -> watch list' },
      crawl: { code: '1  crawl(site)\n2  pages -> structured dataset\n3  duplicates -> merged context' },
      govern: { code: '1  attach owner\n2  cite source + timestamp\n3  publish only after approval' }
    };
    var controls = document.querySelectorAll("[data-signal]");
    var meta = document.getElementById("signalMeta");
    var code = document.getElementById("signalCode");
    function render(key) {
      if (!data[key]) return;
      meta.textContent = key;
      code.textContent = data[key].code;
    }
    controls.forEach(function (button) {
      button.addEventListener("click", function () {
        controls.forEach(function (other) { other.classList.remove("active"); });
        button.classList.add("active");
        render(button.getAttribute("data-signal"));
      });
    });
  })();


})();

// This is a local prompt composer. No request is sent to an AI service.
(() => {
  const panel = document.querySelector('[data-ai-chat]');
  if (!panel) return;
  const input = panel.querySelector('textarea');
  const state = panel.querySelector('#aiChatState');
  const commands = panel.querySelector('.ai-chat-composer');
  const providers = {ChatGPT: 'https://chatgpt.com/', Gemini: 'https://gemini.google.com/', Claude: 'https://claude.ai/'};
  let selected = 'ChatGPT';
  const open = document.createElement('a');
  open.className = 'le-button';
  open.target = '_blank';
  open.rel = 'noopener noreferrer';
  panel.querySelector('.ai-chat-actions').append(open);
  function chooseProvider(name) {
    selected = name;
    panel.querySelectorAll('[data-chat-agent]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.chatAgent === name)));
    panel.querySelector('[data-chat-attach]').textContent = 'agent: ' + name;
    open.href = providers[name];
    open.textContent = 'Open ' + name + ' ↗';
    state.textContent = name + ' · prompt draft';
  }
  panel.querySelectorAll('[data-chat-agent]').forEach(button => button.addEventListener('click', () => chooseProvider(button.dataset.chatAgent)));
  panel.querySelector('[data-chat-attach]').addEventListener('click', () => {
    const names = Object.keys(providers);
    chooseProvider(names[(names.indexOf(selected) + 1) % names.length]);
  });
  panel.querySelector('[data-chat-command-toggle]').addEventListener('click', () => commands.classList.toggle('commands-open'));
  panel.querySelectorAll('[data-chat-command]').forEach(button => button.addEventListener('click', () => {
    input.value = button.dataset.chatCommand + ' ';
    input.focus();
    commands.classList.remove('commands-open');
  }));
  panel.querySelector('[data-chat-send]').addEventListener('click', async () => {
    if (!input.value.trim()) {state.textContent = 'Write a question first'; input.focus(); return;}
    const prompt = 'Use this AI adoption lens: workflow ownership, permission boundaries, human approval, evidence, escalation and recovery.\n\n' + input.value.trim();
    try {await navigator.clipboard.writeText(prompt); state.textContent = 'Prompt copied · paste it into ' + selected;}
    catch {state.textContent = 'Select and copy the question manually'; input.focus(); input.select();}
  });
  chooseProvider(selected);
})();
