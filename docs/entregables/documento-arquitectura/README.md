# Architecture document — course delivery (PDF)

Formal **software architecture document** for **RutaCO / Personal Itineraries Platform**, structured like the academic “Formato Arquitectura de Software” template (RNF, tactics, logical/implementation/integration/deployment/DevOps/threat views).

| Artifact | Path |
|----------|------|
| **PDF (submit this)** | [`Documento-Arquitectura-RutaCO.pdf`](Documento-Arquitectura-RutaCO.pdf) |
| Markdown source | [`Documento-Arquitectura-RutaCO.md`](Documento-Arquitectura-RutaCO.md) |
| Diagram PNGs | [`diagramas/`](diagramas/) |
| Short formal doc (repo wiki seed) | [`../../01-architecture/document.md`](../../01-architecture/document.md) |

## Download (after merge to `main`)

- Blob: https://github.com/bue221/proyecto-arquitectura-software-emergente/blob/main/docs/entregables/documento-arquitectura/Documento-Arquitectura-RutaCO.pdf  
- Raw: https://raw.githubusercontent.com/bue221/proyecto-arquitectura-software-emergente/main/docs/entregables/documento-arquitectura/Documento-Arquitectura-RutaCO.pdf  

GitHub Wiki summary (Spanish): [Architecture-PDF](https://github.com/bue221/proyecto-arquitectura-software-emergente/wiki/Architecture-PDF)

## Regenerate PDF (optional)

From this folder (requires Node + network for `npx`):

```bash
# Render Mermaid → PNG (if .mmd sources exist alongside)
# Then:
npx --yes md-to-pdf@5.2.5 Documento-Arquitectura-RutaCO.md \
  --pdf-options '{"format":"A4","margin":{"top":"18mm","right":"16mm","bottom":"18mm","left":"16mm"},"printBackground":true}'
```

Keep relative image paths (`diagramas/*.png`) intact when editing the Markdown.
