// Single source of truth for portfolio content (language-neutral + bilingual).
// Daniel Masuco — AI & Automation Specialist · CTO & Founder ZEUS IT

import type { Lang } from "./i18n";

// ─────────────────────────────────────────────────────────────────────────────
// Language-neutral facts
// ─────────────────────────────────────────────────────────────────────────────

export const personal = {
  name: "Daniel Masuco",
  firstName: "Daniel",
  lastName: "Masuco",
  location: "Buenos Aires, Argentina",
  phone: "+54 9 11 5405-8079",
  whatsapp: "5491154058079",
  email: "dmasuco1994@gmail.com",
  linkedin: "https://www.linkedin.com/in/danielmasuco",
  linkedinHandle: "linkedin.com/in/danielmasuco",
  github: "https://github.com/danielmasuco",
  zeusUrl: "https://zeusit.com.ar",
  avatar: "/profile.jpg",
  cvUrl: "/Daniel_Masuco_CV.pdf",
} as const;

export const stats = [
  { value: 10, suffix: "+", labelKey: "hero.stats.years" },
  { value: 200, suffix: "+", labelKey: "hero.stats.processes" },
  { value: 80, suffix: "+", labelKey: "hero.stats.hours" },
  { value: 70, suffix: "%", labelKey: "hero.stats.errors" },
] as const;

// Stack — names are universal; categories are translated below
export const stack = [
  { name: "OpenAI / GPT", catKey: "AI", color: "#10a37f" },
  { name: "LangChain", catKey: "AI", color: "#1c3c3c" },
  { name: "Gemini", catKey: "AI", color: "#4285f4" },
  { name: "Python", catKey: "Code", color: "#3776ab" },
  { name: "FastAPI", catKey: "Code", color: "#009688" },
  { name: "n8n", catKey: "Automation", color: "#ea4b71" },
  { name: "Selenium", catKey: "Automation", color: "#43b02a" },
  { name: "AWS", catKey: "Cloud", color: "#ff9900" },
  { name: "Azure", catKey: "Cloud", color: "#0078d4" },
  { name: "Google Cloud", catKey: "Cloud", color: "#4285f4" },
  { name: "Docker", catKey: "DevOps", color: "#2496ed" },
  { name: "Kubernetes", catKey: "DevOps", color: "#326ce5" },
  { name: "PostgreSQL", catKey: "Data", color: "#4169e1" },
  { name: "MongoDB", catKey: "Data", color: "#47a248" },
  { name: "Linux", catKey: "Infra", color: "#fcc624" },
  { name: "Microsoft 365", catKey: "Infra", color: "#d83b01" },
  { name: "NIST ·", catKey: "Security", color: "#dc143c" },
  { name: "Voicebots · IDP", catKey: "AI", color: "#9333ea" },
] as const;

export const codeSnippet = `from langchain.agents import create_react_agent
from langchain_openai import ChatOpenAI
from n8n_client import trigger_workflow

# Daniel Masuco · CTO & Founder · ZEUS IT
class AutomationAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="CODEX", temperature=0)
        self.tools = [self.crm_lookup, self.invoice_parser]

    async def run(self, task: str) -> dict:
        plan = await self.llm.plan(task)
        result = await trigger_workflow("n8n://prod", plan)
        return {"status": "ok", "impact": "+80h/month"}

agent = AutomationAgent()`;

// ─────────────────────────────────────────────────────────────────────────────
// Bilingual content
// ─────────────────────────────────────────────────────────────────────────────

export interface ExperienceItem {
  period: string;
  role: string;
  company: string;
  location: string;
  current?: boolean;
  highlight?: boolean;
  bullets: readonly string[];
}

export interface ServicePillar {
  icon: "Bot" | "Workflow" | "Briefcase" | "ShieldCheck";
  title: string;
  description: string;
  bullets: readonly string[];
  gradient: string;
}

export interface ZeusCase {
  area: string;
  before: string;
  after: string;
  impact: string;
}

export interface EducationItem {
  title: string;
  institution: string;
  period: string;
  icon: "GraduationCap" | "Music";
}

export interface LanguageItem {
  name: string;
  level: string;
  percent: number;
}

export interface Competency {
  title: string;
  items: readonly string[];
}

export interface NowEntry {
  icon: "Hammer" | "Briefcase" | "BookOpen" | "Send";
  label: string;
  text: string;
}

export interface Principle {
  icon: "Target" | "Lightbulb" | "Rocket" | "Users";
  title: string;
  desc: string;
}

interface Content {
  hero: {
    role: string;
    tagline: string;
  };
  about: {
    paragraphs: readonly string[];
    now: readonly NowEntry[];
    principles: readonly Principle[];
  };
  zeus: {
    bullets: readonly string[];
    pillars: readonly ServicePillar[];
    cases: readonly ZeusCase[];
  };
  experience: readonly ExperienceItem[];
  education: readonly EducationItem[];
  languages: readonly LanguageItem[];
  competencies: readonly Competency[];
  stackCategories: Record<string, string>;
}

// Spanish content -----------------------------------------------------------
const contentEs: Content = {
  hero: {
    role: "CTO & Founder @ ZEUS IT · Consultor IA",
    tagline:
      "Diseño sistemas con IA y agentes que ejecutan, automatizan y miden — desde el código hasta el C-Level.",
  },
  about: {
    paragraphs: [
      "Soy <strong>Líder Tecnológico con más de 10 años de trayectoria en IT</strong>, especializado en <em>Inteligencia Artificial Aplicada</em>, <em>Automatización Inteligente (RPA)</em> y <em>Transformación Digital</em>.",
      "Mi diferencial está en traducir estrategia de negocio en eficiencia operativa <strong>cuantificable</strong>: diseño arquitecturas end-to-end, lidero equipos técnicos y gestiono infraestructura crítica para clientes que necesitan resultados, no slides.",
      "Como <strong>Founder de ZEUS IT</strong>, dirijo proyectos de IA Generativa, agentes inteligentes y orquestación de procesos en plataformas low-code para pymes e industrias en Argentina y la región.",
    ],
    now: [
      { icon: "Hammer", label: "Construyendo", text: "ZEUS IT — consultoría de IA aplicada para pymes" },
      { icon: "Briefcase", label: "Consultando en", text: "Tec5.tech como AI & Automation Engineer" },
      { icon: "BookOpen", label: "Profundizando", text: "Multi-Agent systems · LangGraph · IDP" },
      { icon: "Send", label: "Abierto a", text: "Nuevos proyectos de automatización con impacto medible" },
    ],
    principles: [
      { icon: "Target", title: "Outcomes > slides", desc: "Mido lo que entrego. Si no se puede cuantificar, no entra al roadmap." },
      { icon: "Lightbulb", title: "Concepto > código", desc: "Entiendo el problema antes de tocar el teclado. Los frameworks vienen después." },
      { icon: "Rocket", title: "Build > talk", desc: "Demo o no existe. Prototipo antes de la próxima reunión." },
      { icon: "Users", title: "Equipo > yo", desc: "Lidero formando, no controlando. El sistema más fuerte sigue funcionando sin mí." },
    ],
  },
  zeus: {
    bullets: [
      "Eliminamos tareas repetitivas (emails, planillas, portales).",
      "Reducimos errores y reprocesos con flujos controlados.",
      "Orden documental y operativo sin depender de personas.",
    ],
    pillars: [
      {
        icon: "Bot",
        title: "IA + Modelos Agénticos",
        description:
          "Agentes que ejecutan tareas y decisiones acotadas: leen información, completan sistemas y validan reglas.",
        bullets: [
          "LangChain · LangGraph",
          "Voicebots y chatbots",
          "RAG corporativo",
        ],
        gradient: "from-[#1B2CC1]/22 via-[#ABD2FA]/12 to-transparent",
      },
      {
        icon: "Workflow",
        title: "Automatización End-to-End",
        description:
          "Conectamos planillas, emails, APIs y portales web para flujos sin fricción y con observabilidad real.",
        bullets: [
          "n8n · Python",
          "Integraciones ERP/CRM/APIs",
          "Process Mining · IDP",
        ],
        gradient: "from-[#00D492]/22 via-[#ABD2FA]/12 to-transparent",
      },
      {
        icon: "ShieldCheck",
        title: "Orden IT",
        description:
          "Estandarizamos documentación, accesos y procedimientos para una operación estable y auditable.",
        bullets: [
          "DevOps · Docker · K8s",
          "Cloud AWS · Azure",
          "GRC ·",
        ],
        gradient: "from-[#ABD2FA]/15 via-[#3D518C]/10 to-transparent",
      },
    ],
    cases: [
      {
        area: "Backoffice",
        before: "Carga manual repetitiva y validaciones a ojo.",
        after:
          "Flujo automatizado con validaciones y registro de cada ejecución.",
        impact: "Menos tiempos muertos, menos errores, trazabilidad completa.",
      },
      {
        area: "Atención al cliente",
        before: "Consultas repetidas y derivación manual.",
        after:
          "Bot + clasificación + respuestas base + derivación con contexto al humano.",
        impact: "Respuestas más rápidas y menos saturación del equipo.",
      },
      {
        area: "Portales a medida",
        before: 'Información dispersa, procesos "por WhatsApp y Excel".',
        after:
          "Portal centralizado con accesos, formularios, estados y auditoría.",
        impact: "Orden, seguimiento y trazabilidad de punta a punta.",
      },
    ],
  },
  experience: [
    {
      period: "Jul 2024 — Presente",
      role: "CTO & Founder",
      company: "ZEUS IT",
      location: "Buenos Aires, Argentina",
      current: true,
      highlight: true,
      bullets: [
        "Fundación y liderazgo de consultora tecnológica enfocada en IA, automatización e integración.",
        "Construcción del equipo técnico y cartera de clientes desde cero.",
        "Diseño e implementación de flujos low-code (n8n) e integraciones ERP/CRM/APIs.",
        "Desarrollo de voicebots para atención y cobranzas.",
        "Despliegue y administración de infraestructura cloud (AWS, Azure) y prácticas DevOps.",
      ],
    },
    {
      period: "Jul 2025 — Presente",
      role: "AI & Automation Engineer & Consultant",
      company: "Tec5.tech",
      location: "Buenos Aires, Argentina",
      current: true,
      bullets: [
        "Traducción de estrategia de negocio en soluciones de automatización de alto impacto.",
        "Diseño de arquitecturas end-to-end: process mining, discovery, implementación y CoE.",
        "RPA a escala con orquestación de flotas digitales en plataformas líderes.",
        "Aplicación de ML, NLP, Visión por Computador e IDP para automatizar decisiones cognitivas.",
        "Integración de IA Generativa y LLMs en flujos críticos.",
        "Colaboración con C-Level en roadmap estratégico y cuantificación de ROI.",
      ],
    },
    {
      period: "Sep 2021 — Ago 2025 · 4 años",
      role: "Gerente de Tecnología",
      company: "Grupo DASA",
      location: "Microcentro, Buenos Aires",
      bullets: [
        "Liderazgo técnico integral del área de Sistemas (desarrollo, operaciones, infraestructura).",
        "Gestión end-to-end de proyectos IT con cumplimiento de plazos, presupuesto y objetivos.",
        "Implementación y mantenimiento de plataforma de telecomunicaciones crítica.",
        "Coordinación del equipo de Operaciones de Legaltech.",
        "Soluciones RPA con reducción significativa de tiempos de procesamiento.",
      ],
    },
    {
      period: "Dic 2020 — Sep 2021",
      role: "IT Specialist",
      company: "Tec5.tech",
      location: "Buenos Aires, Argentina",
      bullets: [
        "Análisis y resolución de incidentes en tiempo real con alta disponibilidad.",
        "Gestión preventiva de servicios IT y mantenimiento de enlaces de telecomunicaciones.",
        "Reportes de TI para toma de decisiones estratégicas.",
      ],
    },
    {
      period: "Jul 2018 — Nov 2020",
      role: "Jefe de Tecnología",
      company: "Marcelo H. Pena S.A.",
      location: "Microcentro, Buenos Aires",
      bullets: [
        "Administración de sistemas y gestión integral del Centro de Cómputos.",
        "Liderazgo del equipo técnico con cultura de mejora continua.",
        "Soluciones de alta disponibilidad y redundancia de servicios.",
        "Gestión de telefonía y telecomunicaciones con optimización de costos.",
      ],
    },
    {
      period: "Jun 2014 — Jun 2018",
      role: "Líder Técnico IT",
      company: "Tandem Technology S.A.",
      location: "Buenos Aires, Argentina",
      bullets: [
        "Soporte IT Tier 1 y 2: hardware, software, telefonía IP y redes.",
        "Proyectos de implementación de nuevas tecnologías y coordinación de mudanzas técnicas.",
        "Administración de CRM y mejora de la gestión de clientes.",
      ],
    },
  ],
  education: [
    {
      title: "Licenciatura en Gerencia de Empresas",
      institution: "Universidad Nacional de Avellaneda (UNDAV)",
      period: "2020 — 2024",
      icon: "GraduationCap",
    },
    {
      title: "Tecnicatura Superior en Grabación de Sonido",
      institution: "Centro de Arte y Tecnología (CEARTEC)",
      period: "2014 — 2018",
      icon: "Music",
    },
  ],
  languages: [
    { name: "Español", level: "Nativo", percent: 100 },
    { name: "Inglés", level: "Base / Técnico", percent: 60 },
  ],
  competencies: [
    {
      title: "Inteligencia Artificial",
      items: ["LLMs", "GPT / Gemini", "NLP", "IA Generativa", "IA Agentic"],
    },
    {
      title: "Automatización",
      items: ["RPA a escala", "n8n", "Voicebots", "IDP", "Process Mining"],
    },
    {
      title: "Cloud & DevOps",
      items: ["AWS", "Azure", "Infra escalable", "APIs", "Docker · K8s"],
    },
    {
      title: "Liderazgo",
      items: ["Equipos técnicos", "Dirección de proyectos", "P&L", "C-Level"],
    },
    {
      title: "Negocio",
      items: ["Roadmap estratégico", "ROI cuantificado", "Stakeholders"],
    },
    {
      title: "Integraciones",
      items: ["ERP", "CRM", "Telecom", "Low-code"],
    },
  ],
  stackCategories: {
    AI: "IA",
    Code: "Code",
    Automation: "Automatización",
    Cloud: "Cloud",
    DevOps: "DevOps",
    Data: "Data",
    Infra: "Infra",
    Security: "Seguridad",
  },
};

// English content -----------------------------------------------------------
const contentEn: Content = {
  hero: {
    role: "CTO & Founder @ ZEUS IT · AI Consultant",
    tagline:
      "I build AI systems and agents that execute, automate, and measure — from the code to the C-suite.",
  },
  about: {
    paragraphs: [
      "I'm a <strong>Tech Leader with 10+ years in IT</strong>, specialized in <em>Applied Artificial Intelligence</em>, <em>Intelligent Automation (RPA)</em>, and <em>Digital Transformation</em>.",
      "My edge: translating business strategy into <strong>measurable operational efficiency</strong> — end-to-end architectures, technical teams under management, critical infrastructure for clients who need outcomes, not slides.",
      "As <strong>Founder of ZEUS IT</strong>, I lead projects in Generative AI, intelligent agents, and process orchestration on low-code platforms for SMBs and industries across Argentina and the region.",
    ],
    now: [
      { icon: "Hammer", label: "Building", text: "ZEUS IT — applied AI consultancy for SMBs" },
      { icon: "Briefcase", label: "Consulting at", text: "Tec5.tech as AI & Automation Engineer" },
      { icon: "BookOpen", label: "Diving into", text: "Multi-Agent systems · LangGraph · IDP" },
      { icon: "Send", label: "Open to", text: "New automation projects with measurable impact" },
    ],
    principles: [
      { icon: "Target", title: "Outcomes > slides", desc: "I measure what I ship. If it can't be quantified, it doesn't make the roadmap." },
      { icon: "Lightbulb", title: "Concept > code", desc: "I understand the problem before touching the keyboard. Frameworks come later." },
      { icon: "Rocket", title: "Build > talk", desc: "Demo or it doesn't exist. Prototype before the next meeting." },
      { icon: "Users", title: "Team > me", desc: "I lead by enabling, not controlling. The strongest system keeps running without me." },
    ],
  },
  zeus: {
    bullets: [
      "We remove repetitive work (emails, spreadsheets, portals).",
      "We reduce errors and rework with controlled flows.",
      "Documentation and operations that don't depend on individuals.",
    ],
    pillars: [
      {
        icon: "Bot",
        title: "AI + Agentic Models",
        description:
          "Agents that execute scoped tasks and decisions: they read info, fill systems, and validate rules.",
        bullets: [
          "LangChain · LangGraph",
          "Voicebots & chatbots",
          "Corporate RAG",
        ],
        gradient: "from-[#1B2CC1]/22 via-[#ABD2FA]/12 to-transparent",
      },
      {
        icon: "Workflow",
        title: "End-to-End Automation",
        description:
          "We wire spreadsheets, emails, APIs, and web portals into frictionless flows with real observability.",
        bullets: [
          "n8n · Python",
          "ERP/CRM/API integrations",
          "Process Mining · IDP",
        ],
        gradient: "from-[#00D492]/22 via-[#ABD2FA]/12 to-transparent",
      },
      {
        icon: "ShieldCheck",
        title: "IT Order",
        description:
          "We standardize documentation, access, and procedures for stable, auditable operations.",
        bullets: [
          "DevOps · Docker · K8s",
          "Cloud AWS · Azure",
          "GRC · ISO 27001",
        ],
        gradient: "from-[#ABD2FA]/15 via-[#3D518C]/10 to-transparent",
      },
    ],
    cases: [
      {
        area: "Backoffice",
        before: "Repetitive manual entry and eyeball validations.",
        after:
          "Automated flow with validations and an execution log for every run.",
        impact: "Less dead time, fewer errors, complete traceability.",
      },
      {
        area: "Customer support",
        before: "Repeated queries and manual routing.",
        after: "Bot + classification + base answers + context-aware handoff.",
        impact: "Faster responses and a less saturated team.",
      },
      {
        area: "Custom portals",
        before: 'Scattered info, processes "via WhatsApp and Excel".',
        after:
          "Centralized portal with access control, forms, statuses, and audit.",
        impact: "End-to-end order, tracking, and traceability.",
      },
    ],
  },
  experience: [
    {
      period: "Jul 2024 — Present",
      role: "CTO & Founder",
      company: "ZEUS IT",
      location: "Buenos Aires, Argentina",
      current: true,
      highlight: true,
      bullets: [
        "Founded and lead a tech consultancy focused on AI, automation, and system integration.",
        "Built the technical team and client portfolio from scratch.",
        "Designed and deployed low-code flows (n8n) and ERP/CRM/API integrations.",
        "Developed voicebots for customer service and collections.",
        "Deployed and managed cloud infrastructure (AWS, Azure) and DevOps practices.",
      ],
    },
    {
      period: "Jul 2025 — Present",
      role: "AI & Automation Engineer & Consultant",
      company: "Tec5.tech",
      location: "Buenos Aires, Argentina",
      current: true,
      bullets: [
        "Translated business strategy into high-impact automation solutions.",
        "Designed end-to-end architectures: process mining, discovery, implementation, and CoE.",
        "RPA at scale with digital workforce orchestration on leading platforms.",
        "Applied ML, NLP, Computer Vision, and IDP to automate cognitive decisions.",
        "Integrated Generative AI and LLMs into critical flows.",
        "Worked with C-Level on strategic roadmap and ROI quantification.",
      ],
    },
    {
      period: "Sep 2021 — Aug 2025 · 4 years",
      role: "Technology Manager",
      company: "Grupo DASA",
      location: "Microcentro, Buenos Aires",
      bullets: [
        "End-to-end technical leadership of Systems (development, operations, infrastructure).",
        "IT project management with delivery on time, budget, and strategic goals.",
        "Implementation and maintenance of critical telecom platform.",
        "Coordination of Legaltech Operations team.",
        "RPA solutions that significantly reduced processing times.",
      ],
    },
    {
      period: "Dec 2020 — Sep 2021",
      role: "IT Specialist",
      company: "Tec5.tech",
      location: "Buenos Aires, Argentina",
      bullets: [
        "Real-time incident analysis and resolution with high availability.",
        "Preventive IT services management and telecom link maintenance.",
        "IT reporting for strategic decision-making.",
      ],
    },
    {
      period: "Jul 2018 — Nov 2020",
      role: "Head of Technology",
      company: "Marcelo H. Pena S.A.",
      location: "Microcentro, Buenos Aires",
      bullets: [
        "Systems administration and full Data Center management.",
        "Leadership of the technical team with a continuous-improvement culture.",
        "High-availability and service redundancy solutions.",
        "Telephony and telecom management with cost optimization.",
      ],
    },
    {
      period: "Jun 2014 — Jun 2018",
      role: "IT Tech Lead",
      company: "Tandem Technology S.A.",
      location: "Buenos Aires, Argentina",
      bullets: [
        "IT support Tier 1 and 2: hardware, software, VoIP, and networks.",
        "Participation in new technology rollouts and technical relocations.",
        "CRM administration and customer management improvements.",
      ],
    },
  ],
  education: [
    {
      title: "Bachelor's in Business Management",
      institution: "Universidad Nacional de Avellaneda (UNDAV)",
      period: "2020 — 2024",
      icon: "GraduationCap",
    },
    {
      title: "Higher Technician in Sound Recording",
      institution: "Centro de Arte y Tecnología (CEARTEC)",
      period: "2014 — 2018",
      icon: "Music",
    },
  ],
  languages: [
    { name: "Spanish", level: "Native", percent: 100 },
    { name: "English", level: "Working / Technical", percent: 60 },
  ],
  competencies: [
    {
      title: "Artificial Intelligence",
      items: ["LLMs", "GPT / Gemini", "NLP", "Generative AI", "Agentic AI"],
    },
    {
      title: "Automation",
      items: ["RPA at scale", "n8n", "Voicebots", "IDP", "Process Mining"],
    },
    {
      title: "Cloud & DevOps",
      items: ["AWS", "Azure", "Scalable infra", "APIs", "Docker · K8s"],
    },
    {
      title: "Leadership",
      items: ["Tech teams", "Project direction", "P&L", "C-Level"],
    },
    {
      title: "Business",
      items: ["Strategic roadmap", "Quantified ROI", "Stakeholders"],
    },
    {
      title: "Integrations",
      items: ["ERP", "CRM", "Telecom", "Low-code"],
    },
  ],
  stackCategories: {
    AI: "AI",
    Code: "Code",
    Automation: "Automation",
    Cloud: "Cloud",
    DevOps: "DevOps",
    Data: "Data",
    Infra: "Infra",
    Security: "Security",
  },
};

const dict: Record<Lang, Content> = { es: contentEs, en: contentEn };

export function getContent(lang: Lang): Content {
  return dict[lang] ?? contentEs;
}

// Nav links — labels resolved via i18n t() at render time
export const navLinks = [
  { href: "#hero", labelKey: "nav.home" },
  { href: "#zeus", labelKey: "nav.zeus" },
  { href: "#about", labelKey: "nav.about" },
  { href: "#stack", labelKey: "nav.stack" },
  { href: "#experience", labelKey: "nav.experience" },
  { href: "#education", labelKey: "nav.education" },
  { href: "#contact", labelKey: "nav.contact" },
] as const;

export const zeusBrand = {
  name: "ZEUS IT",
  url: "https://zeusit.com.ar",
  logo: "/zeus-logo.png",
} as const;
