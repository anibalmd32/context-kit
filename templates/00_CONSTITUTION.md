# 📜 Constitución del Proyecto: {{PROJECT_NAME}}

**Fecha de fundación:** {{DATE}}  
**Stack principal declarado:** {{MAIN_STACK}}  

---

Esta constitución contiene las **reglas INMUTABLES** que rigen la interacción entre el equipo humano y los agentes de IA.  
Todo agente que intervenga en el código o la documentación de este proyecto **DEBE** leer y acatar estas reglas en el orden establecido.

---

## 🔽 Regla 0: El Entorno por Encima de Todo (La "Ley del Manifest")
**Antes de sugerir, ejecutar o modificar CUALQUIER comando en la terminal, el agente DEBE:**

1. Leer exhaustivamente el archivo `manifest.json` ubicado en la raíz de `.ai/`.
2. Identificar los `command_aliases` y `runtimes` definidos.
3. **USAR ESTRICTAMENTE** los comandos mapeados en `command_aliases`. 
   - *Ejemplo:* Si el manifest dice que `python` está mapeado a `uv run python`, **NUNCA** uses el comando `python` a pelo.
4. Si el manifest indica que usamos `laragon` o `docker`, asumir que los servicios ya están corriendo en segundo plano. **NO** intentar levantar servidores con comandos alternativos (como `uvicorn` o `node server.js`) a menos que se indique explícitamente lo contrario en la sección `servers` del manifest.

---

## 🔽 Regla 1: El Estado de la Sesión (El "Aquí y Ahora")
**Antes de iniciar CUALQUIER tarea de codificación o diseño:**

1. El agente DEBE abrir y leer el archivo `state/active_session.md`.
2. Entender cuál es el **objetivo actual**, qué se hizo en la última sesión y cuál es el **próximo paso concreto**.
3. Si el `active_session.md` está vacío o desactualizado, el agente DEBE preguntar al humano: *"¿Cuál es la tarea prioritaria para comenzar?"* antes de proseguir.

---

## 🔽 Regla 2: La Doble Naturaleza del Negocio (Requirements vs. Context)
El agente debe entender que **NO** es lo mismo una *Historia de Usuario* que una *Regla de Negocio*.

- **`requirements/` (El "QUÉ"):** 
  - Aquí residen las Historias de Usuario, los flujos de interacción (UX) y los criterios de aceptación en lenguaje natural.
  - Este es el **contrato funcional** que el cliente espera. Es volátil y cambia con el product owner.
  
- **`context/business/` (El "CÓMO" y "POR QUÉ"):**
  - Aquí residen los modelos de dominio, las invariantes, las validaciones técnicas y los cálculos específicos del negocio.
  - **Esto es SAGRADO** y debe ser técnicamente preciso. Si una regla de negocio (ej: *"El IVA se calcula sobre el subtotal"*) está aquí, **no puede romperse** a menos que se cree un ADR.

**Orden de lectura al recibir una tarea:**
1. Primero, leer `requirements/active/` para saber **qué** hay que construir.
2. Luego, leer `context/business/` para saber **sobre qué estructuras técnicas** hay que construir.
3. Si ambos entran en conflicto, el agente debe priorizar `context/business/` y crear un ADR explicando la discrepancia con el requerimiento.

---

## 🔽 Regla 3: El Protocolo de la Divergencia (Desvíos del Diseño Inicial)
Cuando la implementación real NO coincida con lo planteado originalmente en `requirements/` o `context/`:

1. **NO** se permite simplemente "actualizar el archivo viejo" añadiendo un párrafo al final.
2. El agente DEBE crear un nuevo archivo en `state/decisions/` siguiendo la plantilla `adr_template.md` (Architecture Decision Record).
3. En ese ADR, debe explicar: *Contexto inicial → Decisión tomada → Alternativas descartadas → Impacto real en el código*.
4. **Luego**, debe SOBRESCRIBIR (no añadir) el archivo original de `context/` o `requirements/` para que refleje la NUEVA realidad, marcando en el frontmatter `estado: "Actualizado"` y referenciando el ADR creado.

---

## 🔽 Regla 4: El Cierre de Sesión (El "Handoff" o Pase de Testigo)
**Al finalizar una tarea significativa o al terminar la interacción con el humano:**

El agente DEBE actualizar `state/active_session.md` con el siguiente formato estricto:

```markdown
---
Última actualización: {{DATE}}
---

## 🎯 Objetivo actual de la sesión
*(Lo que se estaba haciendo justo antes de cerrar)*

## ✅ Última acción completada
- Feature/Cambio: 
- Hash de commit (si aplica): 
- Estado: (Completado / En revisión / Bloqueado)

## 🐞 Bugs/Deuda técnica conocida (pendientes de resolver)
- 

## 📌 Próximo paso concreto para la siguiente interacción
*(Escrito en imperativo, ej: "Refactoriza el módulo de autenticación para usar Redis")*
1. 

## 📝 Resumen ejecutivo (máx. 5 líneas)
*(Lo esencial para que un nuevo agente se ponga al día en 10 segundos)*
