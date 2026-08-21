export type StatusCandidatura = "rascunho" | "aplicado" | "entrevista" | "rejeitado" | "aceito";

export const STATUS_LABEL: Record<StatusCandidatura, string> = {
  rascunho: "Rascunho",
  aplicado: "Aplicado",
  entrevista: "Entrevista",
  rejeitado: "Rejeitado",
  aceito: "Aceito",
};

export const perfil = {
  nome_completo: "Ademar Silva Barreto Junior",
  titulo_profissional: "Desenvolvedor Back-end Pleno",
  email: "ademar.barreto@email.com",
  telefone: "+55 11 98888-1234",
  localizacao: "São Paulo, SP — Brasil",
  linkedin_url: "linkedin.com/in/ademarbarreto",
  github_url: "github.com/ademarbarreto",
  portfolio_url: "ademar.dev",
  resumo:
    "Desenvolvedor back-end com 6 anos de experiência em APIs REST, integrações de pagamento e sistemas de alto volume transacional. Atuação forte em Node.js e PostgreSQL, com prática em observabilidade e testes automatizados.",
};

export const experiencias = [
  {
    id: "exp-1",
    empresa: "Pagfluxo Tecnologia",
    cargo: "Desenvolvedor Back-end Pleno",
    data_inicio: "2022-03",
    data_fim: "",
    descricao:
      "Responsável pelas APIs de conciliação financeira processando 2M de transações/mês. Reduzi o tempo de fechamento diário de 40 para 9 minutos reescrevendo o pipeline em Node.js com filas. Implementei testes de contrato e monitoramento com Grafana.",
  },
  {
    id: "exp-2",
    empresa: "Lumen Sistemas",
    cargo: "Desenvolvedor Back-end Júnior",
    data_inicio: "2020-01",
    data_fim: "2022-02",
    descricao:
      "Manutenção e evolução de APIs REST em Node.js e PostgreSQL para clientes de logística. Criei a camada de autenticação por token e a documentação OpenAPI adotada por 4 squads.",
  },
];

export const formacoes = [
  {
    id: "edu-1",
    instituicao: "Universidade Federal do ABC",
    curso: "Bacharelado em Ciência da Computação",
    data_inicio: "2015-02",
    data_fim: "2019-12",
  },
];

export const certificacoes = [
  {
    id: "cert-1",
    nome: "AWS Certified Developer – Associate",
    emissor: "Amazon Web Services",
    data_emissao: "2023-05",
    data_validade: "2026-05",
  },
];

export const habilidades = [
  { id: "sk-1", nome: "Node.js", categoria: "técnica" as const },
  { id: "sk-2", nome: "TypeScript", categoria: "técnica" as const },
  { id: "sk-3", nome: "PostgreSQL", categoria: "técnica" as const },
  { id: "sk-4", nome: "APIs REST", categoria: "técnica" as const },
  { id: "sk-5", nome: "Docker", categoria: "ferramenta" as const },
  { id: "sk-6", nome: "Grafana", categoria: "ferramenta" as const },
  { id: "sk-7", nome: "Git", categoria: "ferramenta" as const },
  { id: "sk-8", nome: "Comunicação escrita", categoria: "soft skill" as const },
  { id: "sk-9", nome: "Mentoria de juniores", categoria: "soft skill" as const },
];

export type Candidatura = {
  id: string;
  empresa_vaga: string;
  cargo_vaga: string;
  idioma: "pt" | "en";
  pontuacao: number;
  status: StatusCandidatura;
  data: string;
};

export const candidaturas: Candidatura[] = [
  {
    id: "m-1",
    empresa_vaga: "Nubank",
    cargo_vaga: "Engenheiro de Software Back-end",
    idioma: "pt",
    pontuacao: 78,
    status: "aplicado",
    data: "2026-08-18",
  },
  {
    id: "m-2",
    empresa_vaga: "Stone",
    cargo_vaga: "Desenvolvedor Node.js Sênior",
    idioma: "pt",
    pontuacao: 64,
    status: "entrevista",
    data: "2026-08-14",
  },
  {
    id: "m-3",
    empresa_vaga: "Remote Labs",
    cargo_vaga: "Backend Engineer (Payments)",
    idioma: "en",
    pontuacao: 52,
    status: "rascunho",
    data: "2026-08-11",
  },
  {
    id: "m-4",
    empresa_vaga: "Loft",
    cargo_vaga: "Pessoa Desenvolvedora Back-end Pleno",
    idioma: "pt",
    pontuacao: 71,
    status: "rejeitado",
    data: "2026-07-30",
  },
  {
    id: "m-5",
    empresa_vaga: "Contabilizei",
    cargo_vaga: "Desenvolvedor de Integrações",
    idioma: "pt",
    pontuacao: 83,
    status: "aceito",
    data: "2026-07-22",
  },
];

/** Dados de exemplo fixos — a análise real por IA entra depois. */
export const analiseExemplo = {
  empresa_vaga: "Nubank",
  cargo_vaga: "Engenheiro de Software Back-end",
  idioma: "pt" as const,
  pontuacao: 78,
  habilidades_compativeis: [
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "APIs REST",
    "Docker",
    "Testes automatizados",
    "Observabilidade",
    "Filas de mensageria",
    "Git",
  ],
  lacunas_reais: ["Kotlin", "Kafka em produção", "Kubernetes", "Liderança técnica formal"],
};

export const curriculoAdaptado = {
  arquivo: "curriculo_certeiro_nubank_backend.pdf",
  observacoes: [
    "A vaga pede Kotlin. Não há Kotlin no seu currículo-base e nada foi adicionado.",
    "Kafka aparece como requisito; você tem experiência com filas, mas não com Kafka em produção.",
    "Kubernetes não consta na sua base — apenas Docker foi mantido.",
    "A vaga cita liderança técnica formal; seu histórico registra mentoria de juniores, e foi isso que ficou no texto.",
  ],
};
