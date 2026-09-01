# Currículo Certeiro

Gerador de currículos otimizados para ATS. O app compara o seu currículo-base com o texto de uma vaga específica, mostra honestamente o que combina e o que falta, e gera uma versão adaptada pronta para exportar.

**Regra inegociável:** a IA nunca inventa habilidade, ferramenta, certificação ou tempo de experiência que não esteja no currículo-base. Ela pode reordenar, reescrever para clareza e incorporar palavras-chave da vaga — nada além disso. Requisito não atendido vira lacuna, nunca é omitido.

## Funcionalidades

- **Autenticação** por e-mail e senha, com recuperação de senha (“Esqueci minha senha” → link por e-mail → tela `/redefinir-senha`).
- **Currículo-base** estruturado: perfil, experiências, formação, certificações e habilidades.
- **Nova vaga**: cole a descrição e a análise de compatibilidade roda automaticamente.
- **Análise com IA**: pontuação 0–100, requisitos atendidos com a evidência correspondente no currículo, lacunas classificadas (não atende / atende parcialmente) e currículo adaptado em coluna única.
- **Currículo gerado**: visualização do texto adaptado e exportação em `.docx` e `.pdf`.
- **Histórico** de vagas analisadas com status.
- Estados vazios convidativos em todas as listas.

## Exportação compatível com ATS

- Coluna única, sem tabelas, caixas de texto, ícones ou elementos gráficos.
- Fonte padrão (Arial no DOCX, Helvetica no PDF), texto em preto.
- Títulos convencionais: Resumo Profissional, Experiência Profissional, Formação Acadêmica, Certificações, Habilidades.
- Datas normalizadas em MM/AAAA e marcadores simples com hífen.
- Arquivo nomeado `Nome_Sobrenome_Cargo_Empresa.docx` / `.pdf`.

## Design

Estilo editorial-técnico (ficha técnica / scanner): Manrope na interface e IBM Plex Mono em dados processados, com paleta em teal profundo, verde-sálvia e âmbar. Todos os valores são tokens semânticos em `src/styles.css`.

## Acesso e login

- Crie a conta na aba **Criar conta** da tela `/auth`. A confirmação de e-mail está ativa: clique no link recebido antes do primeiro login.
- **“Invalid login credentials”** significa e-mail ou senha incorretos, ou conta ainda não criada. As mensagens agora aparecem em português explicando o caso.
- Esqueceu a senha? Informe o e-mail na tela de login e clique em **Esqueci minha senha**.

## Stack

- TanStack Start (React 19, Vite 7) com rotas em `src/routes`
- Tailwind CSS v4 + shadcn/ui
- Lovable Cloud (banco Postgres com RLS, autenticação e storage)
- Server functions (`createServerFn`) para a análise de IA via Lovable AI Gateway
- `docx` e `jspdf` para exportação

## Estrutura

```text
src/
  routes/                 páginas (auth, redefinir-senha, _authenticated/*)
  components/             app shell, estados vazios, tags técnicas
  lib/
    dados.ts              consultas e mutações (TanStack Query)
    dominio.ts            tipos de domínio
    analise.ts            comparação determinística por palavras-chave
    analise-ia.functions.ts  server function da análise com IA
    exportar-curriculo.ts    geração de DOCX e PDF em formato ATS
  integrations/supabase/  clientes e middlewares gerados
```

## Desenvolvimento local

```sh
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm i
npm run dev
```

## Modelo de dados

`profiles`, `experiences`, `education`, `certifications`, `skills`, `job_postings` e `matches` — todas vinculadas ao usuário autenticado, com RLS garantindo que cada pessoa veja apenas os próprios dados.
