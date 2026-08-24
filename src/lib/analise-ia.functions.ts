import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const entrada = z.object({ job_posting_id: z.string().uuid() });

const esquemaResultado = {
  type: "object",
  additionalProperties: false,
  required: ["pontuacao", "atendidos", "lacunas", "curriculo_adaptado"],
  properties: {
    pontuacao: { type: "integer", description: "Compatibilidade de 0 a 100" },
    atendidos: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requisito", "evidencia"],
        properties: {
          requisito: { type: "string", description: "Requisito da vaga atendido" },
          evidencia: {
            type: "string",
            description: "Trecho literal ou referência do currículo-base que comprova",
          },
        },
      },
    },
    lacunas: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["requisito", "situacao", "explicacao"],
        properties: {
          requisito: { type: "string" },
          situacao: { type: "string", enum: ["nao_atende", "atende_parcialmente"] },
          explicacao: { type: "string" },
        },
      },
    },
    curriculo_adaptado: {
      type: "object",
      additionalProperties: false,
      required: ["titulo", "resumo", "experiencias", "formacao", "certificacoes", "habilidades"],
      properties: {
        titulo: { type: "string" },
        resumo: { type: "string" },
        experiencias: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["cargo", "empresa", "periodo", "bullets"],
            properties: {
              cargo: { type: "string" },
              empresa: { type: "string" },
              periodo: { type: "string" },
              bullets: { type: "array", items: { type: "string" } },
            },
          },
        },
        formacao: { type: "array", items: { type: "string" } },
        certificacoes: { type: "array", items: { type: "string" } },
        habilidades: { type: "array", items: { type: "string" } },
      },
    },
  },
} as const;

const REGRA = `REGRA INEGOCIÁVEL: você NUNCA pode adicionar habilidade, ferramenta, tecnologia, certificação, empresa, cargo ou tempo de experiência que não exista literalmente no currículo-base fornecido.
Você PODE: reordenar, priorizar, reescrever para clareza e incorporar naturalmente as palavras-chave da vaga APENAS quando o fato correspondente já existir no currículo-base.
Você NÃO PODE: inflar tempo de experiência, inferir domínio de tecnologias não citadas, criar métricas ou resultados inexistentes.
Todo requisito da vaga que o candidato não atende, ou atende apenas parcialmente, vai obrigatoriamente para a lista de lacunas — nunca é omitido nem disfarçado.
O currículo adaptado deve estar em formato ATS de coluna única: texto simples, sem tabelas, sem colunas, sem gráficos, com títulos de seção convencionais.`;

export const analisarComIA = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => entrada.parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Serviço de IA não configurado.");

    const supabase = context.supabase;

    const [vagaRes, perfilRes, expRes, eduRes, certRes, skillRes] = await Promise.all([
      supabase
        .from("job_postings")
        .select("*")
        .eq("id", data.job_posting_id)
        .maybeSingle(),
      supabase.from("profiles").select("*").eq("id", context.userId).maybeSingle(),
      supabase.from("experiences").select("*").order("ordem"),
      supabase.from("education").select("*").order("ordem"),
      supabase.from("certifications").select("*").order("ordem"),
      supabase.from("skills").select("*").order("ordem"),
    ]);

    const vaga = vagaRes.data;
    if (!vaga) throw new Error("Vaga não encontrada.");

    const curriculoBase = {
      perfil: perfilRes.data ?? {},
      experiencias: expRes.data ?? [],
      formacao: eduRes.data ?? [],
      certificacoes: certRes.data ?? [],
      habilidades: skillRes.data ?? [],
    };

    const idiomaSaida =
      vaga.idioma === "en"
        ? "Responda inteiramente em inglês (o currículo adaptado e as explicações)."
        : "Responda inteiramente em português do Brasil.";

    const resposta = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-Lovable-AIG-SDK": "fetch",
      },
      body: JSON.stringify({
        model: "google/gemini-3.5-flash",
        messages: [
          {
            role: "system",
            content: `Você é um analista de recrutamento técnico que adapta currículos para sistemas ATS.\n${REGRA}\n${idiomaSaida}`,
          },
          {
            role: "user",
            content: `CURRÍCULO-BASE (única fonte de verdade, em JSON):\n${JSON.stringify(curriculoBase)}\n\nVAGA:\nEmpresa: ${vaga.empresa}\nCargo: ${vaga.cargo}\nDescrição:\n${vaga.descricao}\n\nCompare os requisitos da vaga com o currículo-base e devolve o resultado usando a ferramenta registrar_analise.`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "registrar_analise",
              description: "Registra a análise de compatibilidade e o currículo adaptado.",
              parameters: esquemaResultado,
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "registrar_analise" } },
      }),
    });

    if (!resposta.ok) {
      const texto = await resposta.text();
      if (resposta.status === 429) {
        throw new Error("Muitas análises seguidas. Aguarde alguns segundos e tente de novo.");
      }
      if (resposta.status === 402) {
        throw new Error("Os créditos de IA do espaço de trabalho acabaram. Adicione créditos para continuar.");
      }
      throw new Error(`Falha na análise de IA (${resposta.status}): ${texto.slice(0, 300)}`);
    }

    const json = (await resposta.json()) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const argumentos = json.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!argumentos) throw new Error("A IA não devolveu um resultado utilizável.");

    const bruto = JSON.parse(argumentos) as {
      pontuacao: number;
      atendidos: { requisito: string; evidencia: string }[];
      lacunas: { requisito: string; situacao: string; explicacao: string }[];
      curriculo_adaptado: Record<string, unknown>;
    };

    const pontuacao = Math.max(0, Math.min(100, Math.round(bruto.pontuacao ?? 0)));
    const atendidos = bruto.atendidos ?? [];
    const lacunas = bruto.lacunas ?? [];

    const registro = {
      user_id: context.userId,
      job_posting_id: vaga.id,
      pontuacao,
      habilidades_compativeis: atendidos.map((a) => a.requisito),
      lacunas_reais: lacunas.map((l) => l.requisito),
      observacoes: lacunas.map(
        (l) =>
          `${l.requisito} — ${l.situacao === "atende_parcialmente" ? "atende parcialmente" : "não atendido"}: ${l.explicacao}`,
      ),
      evidencias: atendidos,
      lacunas_detalhadas: lacunas,
      curriculo_adaptado: bruto.curriculo_adaptado ?? {},
      gerado_por_ia: true,
    };

    await supabase.from("matches").delete().eq("job_posting_id", vaga.id);
    const { error } = await supabase.from("matches").insert(registro);
    if (error) throw new Error(error.message);

    return { pontuacao, atendidos: atendidos.length, lacunas: lacunas.length };
  });
