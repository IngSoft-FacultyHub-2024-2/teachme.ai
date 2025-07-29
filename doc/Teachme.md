# Convocatoria a Proyectos de Innovación con Inteligencia Artificial Generativa aplicada a la docencia

**Formulario 1**

**FORMULARIO DE PROPUESTA de Proyectos nuevos**

Título de la propuesta: /TeachmeAI

Postulante o postulantes (indicar nombre, apellido y CI)



Carrera y materia donde se desarrollará la propuesta

Licenciatura e Ingeniería en sistemas – Fundamentos de ingeniería de software y/o diseño de aplicaciones 1

_Fechas de inicio y fin del curso en que se implementará la propuesta_

Las primeras pruebas durante el semestre de agosto 2025 y sobre mejoras en marzo 2026. El primer objetivo es aplicar la herramienta en un solo desafío de desarrollo (_kata_) en algunos de los temas de las materias que se adecuen mejor para probar la idea.

_Descripción de la propuesta (máximo 500 palabras), incluyendo las herramientas de inteligencia artificial que se utilizarán. Indicar si la propuesta se refiere a mejoras en la planificación del curso, metodologías de enseñanza o modalidades de evaluación, u otros aspectos de la docencia._

La irrupción de la inteligencia artificial generativa está transformando profundamente la práctica profesional, especialmente en el desarrollo de software \[1\]. Herramientas como GitHub Copilot, ChatGPT o Claude Code, permiten generar soluciones funcionales en minutos, realizando muchas tareas tradicionales de programación manual. Si bien esta tecnología potencia significativamente la productividad de desarrolladores expertos, también plantea riesgos pedagógicos relevantes: estudiantes en formación pueden utilizar estas herramientas para producir código sin comprender su estructura, calidad o implicancias de diseño.

**/TeachmeAI** es una propuesta de innovación docente orientada a transformar ese desafío en una oportunidad. La propuesta se basa en el uso de _katas_ \[2, 3\] de desarrollo, un enfoque didáctico en el que los estudiantes resuelven desafíos progresivos, por ejemplo, aplicando conceptos específicos de diseño, pruebas, control de versiones y calidad de software.

TeachmeAI será idealmente implementado como una extensión para Visual Studio Code<sup>[\[1\]](#footnote-1)</sup>, con un sistema basado en agentes de IA generativa \[4\] que actúa como un tutor digital. Este agente acompañará al estudiante durante la ejecución del _kata_, guiándolo a través del siguiente ciclo:

\- Generación de código base: el estudiante utiliza una herramienta de IA generativa (por ejemplo, Copilot) para resolver un desafío planteado por el docente.

\- Evaluación asistida por el agente /TeachmeAI: el agente ayuda al estudiante a entender los componentes del código generado, señalando estructuras relevantes (como responsabilidades, dependencias, violaciones a principios, etc.). El agente se enfocará en destacar los aspectos indicados en las instrucciones dadas por el docente.

\- Permitir que el estudiante profundice formulando preguntas al /TeachmeAI.

\- Análisis guiado: el agente fomenta el pensamiento crítico, formulando preguntas, validando conceptos clave e identificando oportunidades de mejora basadas en las reglas del _kata_ y los criterios definidos por el docente.

\- Iteración sobre el código: el estudiante mejora la solución incorporando los conceptos aprendidos.

\- Avance en el kata: una vez resuelto el paso actual, el agente habilita la siguiente etapa del desafío, profundizando gradualmente la complejidad, fomentando un ciclo de feedback continuo bajo la consigna del kata.

El fin del agente es potenciar el aprendizaje de conceptos avanzados, promoviendo la comprensión crítica del código generado, alinear la práctica con los objetivos del curso, y facilitar una retroalimentación personalizada y continua.

A su vez, la propuesta apunta a lograr que los estudiantes:

\- Se familiaricen con herramientas de desarrollo potenciadas por IA.

\- Aprendan a evaluar críticamente el código generado.

\- Internalicen principios de desarrollo aplicados en ejercicios guiados.

\- Participen activamente de su proceso de mejora mediante iteraciones orientadas por el kata.

Esta herramienta se podrá adaptar a otros cursos o temas que trabajen con herramientas de IA generativa que asistan el desarrollo de software y que sean accesibles mediante el IDE VSC.

En el **anexo I** se incluye una imagen ilustrativa del concepto.

_Principal innovación en la práctica docente de la propuesta (máximo 200 palabras),_

/TeachmeAI es una herramienta que integra AI tanto en proceso de ingeniería de software como en el ciclo pedagógico. El estudiante interactúa con la herramienta desde el comienzo como un asistente en la resolución del desafío y también de forma iterativa en el análisis crítico de los resultados.

La innovación principal radica en integrar herramientas de IA generativa en el proceso de aprendizaje como objetos de evaluación crítica. El ciclo de retroalimentación de esta herramienta permitirá que los estudiantes utilicen herramientas de desarrollo potenciadas por AI y a través de su interacción con /TeachmeAI, comiencen a comprender y a aplicar conceptos avanzados de desarrollo de software, y mediante las mejoras que se soliciten aprendan incremental e iterativamente los conceptos que el docente desea enseñar.

Desde el punto de vista pedagógico, /TeachmeAI se basa en los principios de feedback y progresividad. Los code kata son ejercicios de desarrollo de software cortos y enfocados. Utilizan la repetición guiada para el aprendizaje significativo de habilidades fundamentales como el refactoring y test unitario.

Este enfoque promueve un aprendizaje activo, contextualizado y replicable en otros cursos que trabajen con desarrollo, refactorización o revisión de código, adaptándose fácilmente a otros marcos teóricos y estilos de enseñanza.

Criterios de evaluación de logros y aprendizajes de la propuesta (máximo 250 palabras)

La evaluación del asistente será contextualizada en los objetivos de aprendizaje de cada unidad temática y en el uso efectivo por parte de los estudiantes. Se seleccionarán habilidades fundamentales de ingeniería de software que puedan plantearse en ejercicios con desafíos progresivos. Ejemplos de unidades temáticas que serán utilizadas para la evaluación de aprendizajes: test unitario (FIS), principios de diseño SOLID (DA1).

La evaluación se realizará tanto desde el punto de vista cualitativo (observación directa de la interacción de los estudiantes con la herramienta), como cuantitativa (instrumentación de observabilidad de la herramienta). Se planifican tres enfoques de evaluación complementarios:

• Evaluación cualitativa por observación de sesiones de desarrollo. Objetivo: evaluar usabilidad y adaptación pedagógica del asistente.

• Entrevista con estudiantes post-sesión: reflexión sobre aprendizajes y análisis crítico del apoyo brindado por el asistente.

• Métricas (anonimizadas) de progresión pedagógica en cada kata. Número de interacciones, progresión en los distintos pasos del desafío, logro de estados finales, tiempo de interacción.

Si corresponde, mencionar los antecedentes, referencias o modelos usados para generar la propuesta (máximo 5 referencias en formato citación)

**Referencias**

1\. Jack Keeely. (2024, November 1). AI Powers 25% of Google’s Code: What’s Next for Software Engineers? <https://www.forbes.com/sites/jackkelly/2024/11/01/ai-code-and-the-future-of-software-engineers/>

2\. Emily Bache. (2024, August). SE Radio 629: Emily Bache on Katas and the Importance of Practice – Software Engineering Radio. <https://se-radio.net/2024/08/se-radio-629-emily-bache-on-katas-and-the-importance-of-practice/?utm_source=chatgpt.com>

3\. Alexandru Macavei. (2019). What are Code Katas and Why Should we Care? | by Alexandru Macavei | HackerNoon.com | Medium. <https://medium.com/hackernoon/what-are-code-katas-and-why-should-we-care-2e3f1b7e111c>

4\. Anthropic Engineering. (2024, December 19). Building Effective AI Agents \\ Anthropic. <https://www.anthropic.com/engineering/building-effective-agents>

**Prompts utilizados**

<https://chatgpt.com/share/6849c5e3-1bfc-800d-b196-eceee964ebf7>

<https://g.co/gemini/share/48adb82588dd>

**Anexo I – Imagen ilustrativa del concepto**

![Diagrama]


1. En caso que el desarrollo de una extensión sea más complicada de los esperado, se utilizará una ventana de dialogo que pueda integrase al layout del escritorio del estudiante. [↑](#footnote-ref-1)
