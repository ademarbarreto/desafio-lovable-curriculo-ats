/**
 * Análise determinística de compatibilidade.
 * Regra inegociável: nada é inventado — só cruzamos o que já existe no
 * currículo-base com o que o texto da vaga menciona explicitamente.
 */

const DICIONARIO = [
  "JavaScript", "TypeScript", "Node.js", "Deno", "Bun", "React", "Next.js", "Vue", "Angular",
  "Svelte", "Python", "Django", "FastAPI", "Flask", "Java", "Spring", "Kotlin", "Scala", "Go",
  "Rust", "C#", ".NET", "PHP", "Laravel", "Ruby", "Rails", "Elixir", "SQL", "PostgreSQL", "MySQL",
  "SQL Server", "Oracle", "MongoDB", "Redis", "Elasticsearch", "Kafka", "RabbitMQ", "SQS",
  "GraphQL", "gRPC", "APIs REST", "Microserviços", "Docker", "Kubernetes", "Terraform", "AWS",
  "GCP", "Azure", "CI/CD", "GitHub Actions", "Jenkins", "Git", "Linux", "Grafana", "Prometheus",
  "Datadog", "Observabilidade", "Testes automatizados", "TDD", "Scrum", "Kanban", "Jira", "Figma",
  "Tailwind", "HTML", "CSS", "Power BI", "Excel", "Pandas", "Machine Learning", "LLM", "Inglês",
  "Espanhol", "Liderança técnica", "Mentoria", "Comunicação",
];

const normalizar = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function mencionado(termo: string, texto: string) {
  return normalizar(texto).includes(normalizar(termo));
}

export type ResultadoAnalise = {
  pontuacao: number;
  habilidades_compativeis: string[];
  lacunas_reais: string[];
  observacoes: string[];
};

export function analisarVaga(
  descricao: string,
  habilidades: { nome: string }[],
  idioma: "pt" | "en" = "pt",
): ResultadoAnalise {
  const nomes = habilidades.map((h) => h.nome).filter(Boolean);

  const compativeis = nomes.filter((nome) => mencionado(nome, descricao));

  const lacunas = DICIONARIO.filter(
    (termo) =>
      mencionado(termo, descricao) &&
      !nomes.some((nome) => normalizar(nome) === normalizar(termo)),
  );

  const total = compativeis.length + lacunas.length;
  const pontuacao = total === 0 ? 0 : Math.round((compativeis.length / total) * 100);

  const observacoes = lacunas.map((termo) =>
    idioma === "en"
      ? `The job mentions ${termo}. It is not in your base resume, and nothing was added.`
      : `A vaga menciona ${termo}. Não consta no seu currículo-base e nada foi adicionado.`,
  );

  if (nomes.length === 0) {
    observacoes.unshift(
      idioma === "en"
        ? "Your base resume has no skills registered yet, so the comparison is empty."
        : "Seu currículo-base ainda não tem habilidades cadastradas, então a comparação ficou vazia.",
    );
  }

  return {
    pontuacao,
    habilidades_compativeis: compativeis,
    lacunas_reais: lacunas,
    observacoes,
  };
}
