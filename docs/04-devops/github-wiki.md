# GitHub Wiki

Besides the versioned `docs/` tree (reviewed via PRs), the repository exposes a **GitHub Wiki** tab for easy browsing.

## Dual documentation model

| Location | Role |
|----------|------|
| `docs/` | Source of truth for architecture, ADRs, runbooks (linked from `AGENTS.md`) |
| `wiki/` | Flat Markdown pages ready for the GitHub Wiki (generated/curated from `docs/`) |
| GitHub Wiki UI | Published view at `/wiki` |

**Edits:** change `docs/` and/or `wiki/` on a branch → PR → merge → publish wiki.

## One-time bootstrap

GitHub does not create `<repo>.wiki.git` until the first page exists in the UI:

1. Open https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki  
2. Click **Create the first page**  
3. Save (title `Home` is fine)  
4. Run:

```bash
./scripts/publish-wiki.sh
```

## Ongoing publish

After merging wiki content to `main`:

```bash
./scripts/publish-wiki.sh
```

Wiki URL: https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki
