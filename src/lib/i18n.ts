/**
 * i18n helpers + language registry.
 * Routes: "/" → ES (default), "/en/" → EN
 */

export const languages = {
  es: "Español",
  en: "English",
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = "es";

/** Extract the language from a URL like "/en/..." or "/about". */
export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split("/");
  if (first && first in languages) return first as Lang;
  return defaultLang;
}

/** Get a path prefixed with the language (except default). */
export function localizedPath(path: string, lang: Lang): string {
  // Hash links shouldn't get prefixed
  if (path.startsWith("#")) return path;
  if (lang === defaultLang) return path;
  // Strip leading "/" if present
  const clean = path.replace(/^\//, "");
  return `/${lang}/${clean}`.replace(/\/+$/, "/") || "/";
}

/** Swap the language portion of the current URL. */
export function swapLangInUrl(url: URL, target: Lang): string {
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts[0] && parts[0] in languages) parts.shift();
  const path = "/" + parts.join("/");
  return localizedPath(path === "/" ? "/" : path, target);
}

/**
 * UI strings shared across components (nav, buttons, labels).
 * For long-form content (bio, experience bullets, cases) see content.ts.
 */
export const ui = {
  es: {
    "nav.home": "Inicio",
    "nav.zeus": "ZEUS IT",
    "nav.about": "Sobre mí",
    "nav.stack": "Stack",
    "nav.experience": "Experiencia",
    "nav.education": "Formación",
    "nav.contact": "Contacto",

    "cta.contact": "Hablemos",
    "cta.contactLong": "Hablemos de tu proyecto",
    "cta.cv": "Descargar CV",
    "cta.cvShort": "CV PDF",
    "cta.whatsapp": "WhatsApp directo",
    "cta.knowZeus": "Conocé ZEUS IT",
    "cta.knowZeusEn": "Discover ZEUS IT",
    "cta.audit": "Pedir auditoría gratis",
    "cta.send": "Enviar mensaje",
    "cta.scroll": "scroll",

    "hero.badge": "Disponible para nuevos proyectos",
    "hero.role": "CTO & Founder @ ZEUS IT · Consultor IA",
    "hero.tagline":
      "Diseño sistemas con IA y agentes que ejecutan, automatizan y miden — desde el código hasta el C-Level.",
    "hero.stats.years": "años en IT",
    "hero.stats.processes": "procesos automatizados",
    "hero.stats.hours": "hs/mes ahorradas",
    "hero.stats.errors": "menos errores",
    "hero.online": "Online · Buenos Aires",
    "hero.codeFile": "automation_agent.py",
    "hero.codeEnv": "ZEUS IT · prod",

    "zeus.eyebrow": "Mi consultora",
    "zeus.titleA": "Automatización con",
    "zeus.titleB": "IA real",
    "zeus.tagline": "Automatización con IA y Modelos Agénticos",
    "zeus.pitch":
      "ZEUS IT diseña y ejecuta automatizaciones inteligentes para pymes e industrias. Agentes que operan sistemas, procesan información y disparan acciones — sin humo, con métricas.",
    "zeus.pillarsTitle": "Tres pilares",
    "zeus.pillarsSub":
      "El stack completo para acelerar tu operación, con criterio de ingeniería y de negocio.",
    "zeus.casesTitle": "Casos reales",
    "zeus.casesSub": "Antes vs después — resultados medibles, no slides.",
    "zeus.case.before": "Antes",
    "zeus.case.after": "Después",
    "zeus.case.impact": "Impacto",
    "zeus.auditTitle": "Auditoría de IA · sin humo",
    "zeus.auditSub":
      "En una reunión corta relevamos tu proceso y detectamos cuellos de botella. Salís con plan y números.",
    "zeus.audit.input": "Qué relevamos",
    "zeus.audit.inputDesc": "Entradas, salidas, reglas, excepciones, sistemas.",
    "zeus.audit.output": "Qué entregamos",
    "zeus.audit.outputDesc": "Mapa AS-IS + quick wins + ROI estimado.",
    "zeus.audit.roadmap": "Roadmap",
    "zeus.audit.roadmapDesc": "Plan 30/60/90 días con hitos claros.",

    "about.eyebrow": "Sobre mí",
    "about.title": "El que está detrás de ZEUS IT",
    "about.sub":
      "Visión técnica profunda + criterio ejecutivo. Diseño soluciones que el equipo entiende, mantiene y escala.",
    "about.contactsTitle": "Contactá directo:",
    "about.competenciesTitle": "Competencias clave",
    "about.nowTitle": "Ahora",
    "about.nowSub": "Lo que estoy haciendo en este momento",
    "about.principlesTitle": "Cómo trabajo",
    "about.principlesSub": "Principios que no negocio — los aplico en cada proyecto",

    "stack.eyebrow": "Stack",
    "stack.title": "Las herramientas que mueven los proyectos",
    "stack.sub":
      "Stack premium en producción: sistemas escalables, seguros y medibles.",

    "exp.eyebrow": "Trayectoria",
    "exp.title": "Experiencia profesional",
    "exp.sub":
      "11+ años en IT. Hoy: CTO & Founder de ZEUS IT en paralelo a AI Consultant en Tec5.tech.",
    "exp.current": "Actual",

    "edu.eyebrow": "Formación",
    "edu.title": "Educación e idiomas",
    "edu.acadTitle": "Formación Académica",
    "edu.langsTitle": "Idiomas",
    "edu.continuous":
      "Aprendizaje continuo: formación en IA generativa, agentes y arquitecturas cloud actualizada constantemente.",

    "contact.eyebrow": "Contacto",
    "contact.title": "Construyamos algo que mueva el negocio",
    "contact.sub":
      "Respondo en menos de 24 hs. Contame qué proceso querés automatizar o qué dolor técnico tenés — coordinamos una llamada de discovery sin costo.",
    "contact.wa": "WhatsApp · más rápido",
    "contact.email": "Email",
    "contact.linkedin": "LinkedIn",
    "contact.form.name": "Nombre",
    "contact.form.company": "Empresa",
    "contact.form.email": "Email",
    "contact.form.message": "¿Qué necesitás automatizar?",
    "contact.form.note":
      "Tu mensaje abre el cliente de mail. Si preferís, escribime directo por WhatsApp.",

    "footer.nav": "Navegación",
    "footer.contact": "Contacto",
    "footer.rights": "Todos los derechos reservados.",
    "footer.built": "Hecho con",
  },

  en: {
    "nav.home": "Home",
    "nav.zeus": "ZEUS IT",
    "nav.about": "About",
    "nav.stack": "Stack",
    "nav.experience": "Experience",
    "nav.education": "Education",
    "nav.contact": "Contact",

    "cta.contact": "Let's talk",
    "cta.contactLong": "Let's talk about your project",
    "cta.cv": "Download CV",
    "cta.cvShort": "CV PDF",
    "cta.whatsapp": "WhatsApp direct",
    "cta.knowZeus": "Discover ZEUS IT",
    "cta.knowZeusEn": "Discover ZEUS IT",
    "cta.audit": "Request free audit",
    "cta.send": "Send message",
    "cta.scroll": "scroll",

    "hero.badge": "Available for new projects",
    "hero.role": "CTO & Founder @ ZEUS IT · AI Consultant",
    "hero.tagline":
      "I build AI systems and agents that execute, automate, and measure — from the code to the C-suite.",
    "hero.stats.years": "years in IT",
    "hero.stats.processes": "automated processes",
    "hero.stats.hours": "hours saved / month",
    "hero.stats.errors": "fewer errors",
    "hero.online": "Online · Buenos Aires",
    "hero.codeFile": "automation_agent.py",
    "hero.codeEnv": "ZEUS IT · prod",

    "zeus.eyebrow": "My consultancy",
    "zeus.titleA": "Automation with",
    "zeus.titleB": "real AI",
    "zeus.tagline": "Automation with AI and Agentic Models",
    "zeus.pitch":
      "ZEUS IT designs and ships intelligent automations for SMBs and industries. Agents that operate systems, process information, and trigger actions — no hype, just metrics.",
    "zeus.pillarsTitle": "Three pillars",
    "zeus.pillarsSub":
      "The full stack to accelerate your operation, with engineering and business judgment.",
    "zeus.casesTitle": "Real cases",
    "zeus.casesSub": "Before vs after — measurable results, not slides.",
    "zeus.case.before": "Before",
    "zeus.case.after": "After",
    "zeus.case.impact": "Impact",
    "zeus.auditTitle": "AI audit · no fluff",
    "zeus.auditSub":
      "A short call: we map your process, detect bottlenecks. You leave with a plan and numbers.",
    "zeus.audit.input": "What we map",
    "zeus.audit.inputDesc": "Inputs, outputs, rules, exceptions, systems.",
    "zeus.audit.output": "What we deliver",
    "zeus.audit.outputDesc": "AS-IS map + quick wins + estimated ROI.",
    "zeus.audit.roadmap": "Roadmap",
    "zeus.audit.roadmapDesc": "30/60/90-day plan with clear milestones.",

    "about.eyebrow": "About me",
    "about.title": "The person behind ZEUS IT",
    "about.sub":
      "Deep technical vision + executive judgment. I design solutions that teams understand, maintain, and scale.",
    "about.contactsTitle": "Reach me directly:",
    "about.competenciesTitle": "Core competencies",
    "about.nowTitle": "Now",
    "about.nowSub": "What I'm doing right now",
    "about.principlesTitle": "How I work",
    "about.principlesSub": "Non-negotiable principles I apply on every project",

    "stack.eyebrow": "Stack",
    "stack.title": "The tools that move every project",
    "stack.sub":
      "Premium production stack: scalable, secure, measurable systems.",

    "exp.eyebrow": "Track record",
    "exp.title": "Professional experience",
    "exp.sub":
      "11+ years in IT. Today: CTO & Founder at ZEUS IT alongside AI Consultant at Tec5.tech.",
    "exp.current": "Current",

    "edu.eyebrow": "Education",
    "edu.title": "Education & languages",
    "edu.acadTitle": "Academic Background",
    "edu.langsTitle": "Languages",
    "edu.continuous":
      "Continuous learning: ongoing training in generative AI, agents, and cloud architectures.",

    "contact.eyebrow": "Contact",
    "contact.title": "Let's build something that moves the business",
    "contact.sub":
      "I reply in under 24h. Tell me what process you want to automate or what tech pain you have — we'll book a no-cost discovery call.",
    "contact.wa": "WhatsApp · fastest",
    "contact.email": "Email",
    "contact.linkedin": "LinkedIn",
    "contact.form.name": "Name",
    "contact.form.company": "Company",
    "contact.form.email": "Email",
    "contact.form.message": "What do you want to automate?",
    "contact.form.note":
      "Your message opens your mail client. If you prefer, message me directly on WhatsApp.",

    "footer.nav": "Navigation",
    "footer.contact": "Contact",
    "footer.rights": "All rights reserved.",
    "footer.built": "Built with",
  },
} as const;

export type UIKey = keyof typeof ui["es"];

export function t(lang: Lang, key: UIKey): string {
  return ui[lang][key] ?? ui[defaultLang][key];
}
