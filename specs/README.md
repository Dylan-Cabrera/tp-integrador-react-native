# Specs — Biblioteca IPF (TP 4)

Este proyecto se desarrolla con **Spec-Driven Development**: primero se escribe *qué* tiene que hacer la app y *por qué*,
después *cómo* se va a construir, y recién al final el código. Cada tarea apunta a un requisito y cada requisito
tiene criterios de aceptación verificables.

| Orden | Documento | Responde a | Cambia cuando… |
|---|---|---|---|
| 0 | [00-constitucion.md](00-constitucion.md) | Reglas que **ninguna** decisión puede romper | Casi nunca |
| 1 | [01-especificacion.md](01-especificacion.md) | **Qué** hace la app (historias, requisitos, criterios) | Cambia un requisito del enunciado |
| 2 | [02-plan.md](02-plan.md) | **Cómo** se construye (rutas, datos, Context, permisos) | Cambia una decisión técnica |
| 3 | [03-tareas.md](03-tareas.md) | **En qué orden** (tareas chicas = commits) | Se termina o divide una tarea |

## Flujo de trabajo

1. Elegir la próxima tarea pendiente de `03-tareas.md`.
2. Leer los requisitos (`RF-xx`) que cita y sus criterios de aceptación en `01-especificacion.md`.
3. Implementar siguiendo `02-plan.md` sin violar la constitución.
4. Verificar los criterios a mano en Expo Go + `npx expo lint` + `npx tsc --noEmit`.
5. Marcar la tarea `[x]` y hacer **un commit** con un mensaje que diga qué cambió.

Si al implementar aparece algo que la spec no contempla, **primero se actualiza la spec** y después el código.
