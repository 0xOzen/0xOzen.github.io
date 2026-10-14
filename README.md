# Ali Osman Ozen personal website

Static GitHub Pages site for Ali Osman Ozen.

Public focus:
- AI Adoption Architect
- Agent governance
- Digital transformation
- Workflow automation
- Web3 / RWA tokenization

Local preview:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://127.0.0.1:8080
```

Deployment target:

```text
https://github.com/0xOzen/0xOzen.github.io
https://0xozen.github.io/
```

Privacy note:
This site intentionally keeps recruiter-specific contact details outside the public repository.

The homepage now uses the pinned AequAI Film B design, including its original
particle film, entropy/control orbit, nine visual studies, menu and theme switch.
Personal copy and navigation are defined in `scripts/build_personal_home.py`.
The original personal content is mapped by `scripts/personal_content.py` from
`scripts/reference/personal-home.html`, with writing previews read from the
existing archive. The six management questions, brief, control model, diagrams,
proof lenses and AI prompt composer are part of the homepage. The composer
copies a prompt locally; no AI service is connected.
Rebuild locally with `python3 scripts/build_personal_home.py` (dependencies in
`scripts/requirements-personal-home.txt`). The source checkout is not required.
Imported styles, scripts and embedded maps live in `assets/aequai-home/`.
The previous homepage is retained locally in `state/index-before-aequai-2026-10-06.html`.
Publication requires explicit scoped approval. Ali authorized review, commit, push and publication on 2026-10-14.

All personal subpages use the same homepage shell, typography, amber palette,
light/dark theme, menus, footer and square particle field. Rebuild in this order:

```bash
python3 scripts/build_personal_home.py
python3 scripts/build_personal_subpages.py
```

Subpage content is preserved in `scripts/reference/subpages/`. Edit those pinned
inputs for writing/adoption content; shared presentation is in
`assets/personal-subpages.css` and `assets/personal-shell.js`. The two local
adoption preview routes are also generated, and remain unpublished previews.

Canonical local workspace: `/Users/0xozen/Projects/0xozen/subprojects/0xozen-github-io/`.
Personal blog: https://ozen.aequai.com/.
