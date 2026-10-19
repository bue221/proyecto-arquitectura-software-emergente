# Checklist de Pull Request

Cópialo en el PR si la plantilla quedó desactualizada.

## Diseño

- [ ] Respeta los límites hexagonales (sin imports de infra en `domain`)
- [ ] No se agregó lógica de negocio al Gateway
- [ ] El frontend no llama a API Colombia
- [ ] Las teselas usan el puerto Adapter (sin CDN fijo en el código de interacción)
- [ ] El comportamiento público nuevo o cambiado está documentado en `docs/`

## Wiki (obligatorio)

- [ ] Las páginas `wiki/` correspondientes se actualizaron en **este mismo PR**
- [ ] La prosa nueva de `wiki/` está en español; los nombres de archivo no cambiaron
- [ ] Tras el merge a `main`: ejecutar `make wiki` / `./scripts/publish-wiki.sh`

## Calidad

- [ ] Tests unitarios de los casos de uso o puertos tocados
- [ ] Los caminos de error devuelven la forma HTTP problem de manera consistente
- [ ] Los logs son JSON e incluyen correlación de traza en el camino de la petición
- [ ] Hay migraciones si cambió el esquema (por servicio)

## Conciencia de nivel

- [ ] Si toca eventos: AsyncAPI actualizado; el outbox no se salta
- [ ] Si toca I/O externo: se consideraron timeouts + retry/CB
- [ ] Si es superficie de Nivel 3: probes / contratos / notas de CI actualizados

## Ops

- [ ] No se commitearon secretos
- [ ] Los cambios de Compose/K8s están descritos en el cuerpo del PR
- [ ] El impacto en la demo está anotado para quien revisa ([Demo-script](Demo-script))
