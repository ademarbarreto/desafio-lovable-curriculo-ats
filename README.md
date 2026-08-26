# Currículo Certeiro

Gerador de currículos otimizados para ATS (Applicant Tracking Systems) que compara o currículo-base do usuário com uma vaga específica e produz uma versão adaptada, mostrando honestamente o que combina e o que falta.

> **Regra inegociável:** a aplicação nunca inventa experiências, habilidades, ferramentas, certificações ou tempo de experiência. Tudo que sai do sistema precisa existir primeiro no currículo-base do usuário.

---

## Sumário

- [Visão geral](#visão-geral)
- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura e estrutura de pastas](#arquitetura-e-estrutura-de-pastas)
- [Funcionalidades](#funcionalidades)
- [Design system](#design-system)
- [Modelo de dados](#modelo-de-dados)
- [Fluxo de IA](#fluxo-de-ia)
- [Exportação ATS](#exportação-ats)
- [Autenticação e segurança](#autenticação-e-segurança)
- [Como rodar localmente](#como-rodar-localmente)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Princípios e decisões técnicas](#princípios-e-decisões-técnicas)

---

## Visão geral

O **Currículo Certeiro** é uma ferramenta para candidatos que querem aumentar a compatibilidade do currículo com vagas específicas sem distorcer a própria trajetória. O fluxo é simples:

1. O usuário cadastra seu **currículo-base** (dados pessoais, experiências, formação, certificações e habilidades).
2. Ele cola a descrição de uma **vaga** (cargo, empresa, descrição, idioma).
3. A IA compara os requisitos da vaga com o currículo-base e devolve:
   - uma **pontuação de compatibilidade** (0–100);
   - a lista de **requisitos atendidos**, com evidência no currículo-base;
   - a lista de **lacunas reais** (requisitos não atendidos ou parcialmente atendidos);
   - um **currículo adaptado** em formato ATS de coluna única.
4. O usuário pode visualizar o currículo gerado e exportar em **.docx** ou **.pdf**, seguindo regras rigorosas de compatibilidade com ATS.

A estética segue um conceito **editorial-técnico**: a tela parece uma ficha técnica ou um scanner de código. A interface usa a fonte **Manrope**; os dados processados (pontuações, tags, status, datas) usam **IBM Plex Mono**.

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| Framework full-stack | [TanStack Start v1](https://tanstack.com/start) + React 19 |
| Build tool | Vite 8 |
| Roteamento | TanStack Router (file-based) |
| Estado assíncrono | TanStack Query |
| Server functions | `createServerFn` do TanStack Start |
| Backend / banco / auth | Lovable Cloud (Supabase) |
| Cliente Supabase | `@supabase/supabase-js` |
| UI components | shadcn/ui + Radix UI primitives |
| Estilização | Tailwind CSS v4 (CSS-first, `@theme`) |
| Ícones | Lucide React |
| Formulários | React Hook Form + Zod |
| Geração de DOCX | `docx` |
| Geração de PDF | `jspdf` |
| IA | Lovable AI Gateway (`google/gemini-3.5-flash`) |

---

## Arquitetura e estrutura de pastas

```text
src/
├── components/
│   ├── app-shell.tsx          # Layout lateral + header responsivo
│   ├── estado-vazio.tsx       # Ilustração/CTA para listas vazias
│   ├── tech-tag.tsx           # Tags de match/gap, pontuação, status
│   └── ui/                    # Componentes shadcn/ui
├── integrations/supabase/
│   ├── client.ts              # Cliente browser Supabase (auto-gerado)
│   ├── client.server.ts       # Cliente server Supabase
│   ├── auth-middleware.ts     # requireSupabaseAuth para server functions
│   └── auth-attacher.ts       # Anexa bearer token nas server functions
├── lib/
│   ├── dominio.ts             # Tipos e enums de domínio
│   ├── dados.ts               # Funções de fetch (TanStack Query)
│   ├── analise.ts             # Análise determinística de compatibilidade
│   ├── analise-ia.functions.ts# Server function que chama a IA
│   └── exportar-curriculo.ts  # Exportação DOCX/PDF com regras ATS
├── routes/
│   ├── __root.tsx             # Root route (QueryClient, head, fonts)
│   ├── auth.tsx               # Login / criação de conta
│   └── _authenticated/        # Rotas protegidas
│       ├── route.tsx          # Layout guard (redireciona se não logado)
│       ├── index.tsx          # Painel
│       ├── curriculo.tsx      # Meu Currículo (fonte de verdade)
│       ├── nova-vaga.tsx      # Cadastro de vaga + análise inicial
│       ├── analise.tsx        # Resultado da análise de compatibilidade
│       ├── curriculo-gerado.tsx# Preview + exportação
│       └── historico.tsx      # Histórico de vagas com atualização de status
├── styles.css                 # Tokens de design e animações
├── start.ts                   # Configuração do TanStack Start
└── router.tsx                 # Configuração do router

supabase/migrations/             # Migrações do banco de dados
```

---

## Funcionalidades

### 1. Autenticação (`/auth`)

- Login com e-mail e senha.
- Criação de conta com nome completo.
- Ao criar a conta, um trigger `handle_new_user` insere automaticamente um registro vazio na tabela `profiles`.
- Rotas protegidas sob `_authenticated/` redirecionam usuários não logados para `/auth`.

### 2. Painel (`/`)

- Resumo em cards: vagas analisadas, compatibilidade média e candidaturas em processo.
- Lista das 6 candidaturas mais recentes com cargo, empresa, data, status e pontuação.
- Estado vazio convidativo quando não há vagas cadastradas.

### 3. Meu Currículo (`/curriculo`)

Formulário multi-seção que é a **fonte única de verdade** de todo o aplicativo:

- **Perfil**: nome completo, título profissional, e-mail, telefone, localização, LinkedIn, GitHub, portfolio e resumo.
- **Experiências**: empresa, cargo, período e descrição.
- **Formação**: instituição, curso e período.
- **Certificações**: nome, emissor, data de emissão e validade.
- **Habilidades**: nome e categoria (`técnica`, `ferramenta`, `soft skill`).

A tela salva via `upsert`: cria novos itens, atualiza existentes e remove os excluídos pelo usuário.

### 4. Nova Vaga (`/nova-vaga`)

- Formulário para cadastrar empresa, cargo, descrição da vaga, idioma e status.
- Ao salvar, a vaga é inserida e a IA é acionada automaticamente para gerar a primeira análise.

### 5. Análise de Compatibilidade (`/analise?id=...`)

- Exibe a **pontuação de match** (0–100), barra de progresso e contadores.
- Lista de **requisitos atendidos** como tags verdes (`+`).
- Lista de **lacunas reais** como tags âmbar (`~`).
- Seção de **evidências no currículo-base**: mostra, para cada requisito atendido, o trecho ou referência que comprova o match.
- Seção de **por que cada lacuna existe**: explica se o requisito não é atendido ou é atendido parcialmente.
- Botão **Reanalisar com IA** para refazer a análise a qualquer momento.
- Link para o **Currículo Gerado** daquela vaga.

### 6. Currículo Gerado (`/curriculo-gerado?id=...`)

- Preview do currículo adaptado.
- Se a IA gerou um `curriculo_adaptado`, ele tem prioridade; senão, o sistema monta uma versão ATS a partir do currículo-base.
- Botões para exportar em **.docx** e **.pdf**.
- Nome de arquivo sugerido: `Nome_Sobrenome_Cargo_Empresa`.

### 7. Histórico (`/historico`)

- Lista todas as candidaturas cadastradas.
- Permite atualizar o status (`rascunho`, `aplicado`, `entrevista`, `rejeitado`, `aceito`).
- Estado vazio quando não há vagas.

---

## Design system

- **Fontes:**
  - Interface: `Manrope` (400, 500, 600, 700, 800).
  - Dados processados / mono: `IBM Plex Mono` (400, 500, 600).
- **Paleta (OKLCH):**
  - **Teal profundo** (`--primary`): `#0E7C86` aproximado — usado em ações, links e destaques técnicos.
  - **Verde-sálvia** (`--success`): usado para matches e status positivos.
  - **Âmbar** (`--warning`): usado para lacunas e alertas.
  - Fundo claro neutro, cards brancos, bordas sutis.
- **Estilo visual:**
  - Layout de ficha técnica com sidebar técnica (`ATS · v0.1`).
  - Tags mono com prefixos (`+` / `~`).
  - Pontuação em mono tabular com `/100`.
  - Animação `scan-in` para tags de análise.
- **Componentes próprios:**
  - `AppShell`: sidebar + header + área de conteúdo responsivo.
  - `TechTag`: tags de match/gap.
  - `Pontuacao`: exibe pontuação com cor semântica.
  - `StatusPill`: status da candidatura em pill colorido.
  - `EstadoVazio`: ilustra + título + descrição + CTA para listas vazias.

---

## Modelo de dados

Banco relacional no Lovable Cloud (PostgreSQL) com RLS ativado em todas as tabelas.

### `profiles`

Perfil do usuário. Criado automaticamente pelo trigger `handle_new_user`.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | Referencia `auth.users` (`ON DELETE CASCADE`) |
| `nome_completo` | TEXT | |
| `titulo_profissional` | TEXT | |
| `email` | TEXT | |
| `telefone` | TEXT | |
| `localizacao` | TEXT | |
| `linkedin_url` | TEXT | |
| `github_url` | TEXT | |
| `portfolio_url` | TEXT | |
| `resumo` | TEXT | |
| `created_at` / `updated_at` | TIMESTAMPTZ | |

### `experiences`

Experiências profissionais do currículo-base.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | `auth.users` |
| `empresa` | TEXT | |
| `cargo` | TEXT | |
| `data_inicio` | TEXT | Aceita formatos livres; normalizado na exportação |
| `data_fim` | TEXT | |
| `descricao` | TEXT | Texto livre, convertido em bullets na exportação |
| `ordem` | INTEGER | |

### `education`

Formação acadêmica.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `instituicao` | TEXT | |
| `curso` | TEXT | |
| `data_inicio` / `data_fim` | TEXT | |
| `ordem` | INTEGER | |

### `certifications`

Certificações.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `nome` | TEXT | |
| `emissor` | TEXT | |
| `data_emissao` / `data_validade` | TEXT | |
| `ordem` | INTEGER | |

### `skills`

Habilidades do currículo-base.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `nome` | TEXT | |
| `categoria` | ENUM | `técnica`, `ferramenta`, `soft skill` |
| `ordem` | INTEGER | |

### `job_postings`

Vagas analisadas.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `empresa` | TEXT | |
| `cargo` | TEXT | |
| `descricao` | TEXT | Texto completo da vaga |
| `idioma` | ENUM | `pt`, `en` |
| `status` | ENUM | `rascunho`, `aplicado`, `entrevista`, `rejeitado`, `aceito` |

### `matches`

Resultado da análise de compatibilidade.

| Campo | Tipo | Observação |
|-------|------|------------|
| `id` | UUID PK | |
| `user_id` | UUID FK | |
| `job_posting_id` | UUID FK | `job_postings` (`ON DELETE CASCADE`) |
| `pontuacao` | INTEGER | 0–100 |
| `habilidades_compativeis` | TEXT[] | Lista de requisitos atendidos |
| `lacunas_reais` | TEXT[] | Lista de requisitos não atendidos |
| `observacoes` | TEXT[] | Explicações das lacunas |
| `evidencias` | JSONB | `{ requisito, evidencia }[]` |
| `lacunas_detalhadas` | JSONB | `{ requisito, situacao, explicacao }[]` |
| `curriculo_adaptado` | JSONB | Versão ATS estruturada gerada pela IA |
| `gerado_por_ia` | BOOLEAN | `true` quando a análise veio da IA |

### Segurança

- Todas as tabelas têm RLS ativado.
- Políticas `*_own` garantem que o usuário autenticado só lê/escreve seus próprios registros (`auth.uid() = user_id`).
- `GRANT` explícito para `authenticated` e `service_role` em todas as tabelas.
- Trigger `on_auth_user_created` cria o perfil automaticamente.

---

## Fluxo de IA

A análise de IA está em `src/lib/analise-ia.functions.ts` e é exposta como uma **TanStack Start Server Function** (`analisarComIA`).

### Entrada

```ts
{ job_posting_id: string }
```

### Processo

1. A função é protegida por `requireSupabaseAuth` — só usuários logados podem executar.
2. Busca a vaga e todo o currículo-base do usuário (perfil, experiências, formação, certificações, habilidades).
3. Monta um prompt com:
   - o currículo-base em JSON (única fonte de verdade);
   - o texto da vaga (empresa, cargo, descrição);
   - uma **regra inegociável** no system prompt.
4. Chama o modelo `google/gemini-3.5-flash` via Lovable AI Gateway.
5. Força o retorno por **tool calling** (`registrar_analise`) com JSON schema fixo.
6. Valida a pontuação (0–100), salva o resultado na tabela `matches` e retorna contadores.

### Regra inegociável no prompt

> "Você NUNCA pode adicionar habilidade, ferramenta, tecnologia, certificação, empresa, cargo ou tempo de experiência que não exista literalmente no currículo-base fornecido. Você PODE reordenar, priorizar, reescrever para clareza e incorporar naturalmente as palavras-chave da vaga APENAS quando o fato correspondente já existir no currículo-base. Todo requisito da vaga que o candidato não atende, ou atende apenas parcialmente, vai obrigatoriamente para a lista de lacunas — nunca é omitido nem disfarçado."

### Saída estruturada

```json
{
  "pontuacao": 73,
  "atendidos": [
    { "requisito": "React", "evidencia": "Experiência como Dev Frontend na XPTO — 'Desenvolvi interfaces com React e TypeScript'" }
  ],
  "lacunas": [
    { "requisito": "Inglês avançado", "situacao": "nao_atende", "explicacao": "O currículo-base não menciona proficiência em inglês." }
  ],
  "curriculo_adaptado": {
    "titulo": "Desenvolvedor Frontend",
    "resumo": "...",
    "experiencias": [...],
    "formacao": [...],
    "certificacoes": [...],
    "habilidades": [...]
  }
}
```

### Fallback determinístico

`src/lib/analise.ts` contém uma análise determinística baseada em um dicionário de tecnologias e termos. Ela foi usada como base inicial e permanece disponível, mas o fluxo principal hoje usa a IA.

---

## Exportação ATS

Implementada em `src/lib/exportar-curriculo.ts`.

### Regras de compatibilidade ATS

- Layout de **coluna única**.
- **Sem tabelas, caixas de texto, ícones, gráficos ou elementos decorativos**.
- Fonte padrão: **Arial** no DOCX, **Helvetica** no PDF, tudo em preto.
- Títulos de seção em texto simples e maiúsculas, com nomenclatura convencional:
  - Resumo Profissional
  - Experiência Profissional
  - Formação Acadêmica
  - Certificações
  - Habilidades
- Datas normalizadas para **MM/AAAA**.
- Marcadores simples com **hífen (`-`)**.

### Normalização de datas

A função `normalizarData` aceita vários formatos e converte para `MM/AAAA`:

- `2021-03` / `2021-03-01` → `03/2021`
- `3/2021` → `03/2021`
- `01/03/2021` → `03/2021`
- `mar/2021`, `março de 2021` → `03/2021`
- `2021` → `01/2021`
- `atual`, `presente`, `em andamento` → `atual`

### Formatos

| Formato | Biblioteca | Arquivo |
|---------|------------|---------|
| DOCX | `docx` | `Nome_Sobrenome_Cargo_Empresa.docx` |
| PDF | `jspdf` | `Nome_Sobrenome_Cargo_Empresa.pdf` |

---

## Autenticação e segurança

- Autenticação por e-mail/senha via Supabase Auth.
- O middleware `requireSupabaseAuth` protege as server functions.
- O `attachSupabaseAuth` anexa o bearer token do Supabase nas chamadas de server function pelo cliente.
- O layout `_authenticated/route.tsx` faz `beforeLoad` verificando `supabase.auth.getUser()` e redireciona para `/auth` se não houver sessão.
- RLS garante isolamento de dados entre usuários.

---

## Como rodar localmente

### Pré-requisitos

- [Bun](https://bun.sh/) (ou Node 22+ com npm/yarn/pnpm)
- Conta no Lovable Cloud (Supabase) configurada no projeto
- Chave da API do Lovable AI Gateway (`LOVABLE_API_KEY`)

### Passos

```bash
# 1. Clone o repositório
git clone <repo-url>
cd <repo-folder>

# 2. Instale as dependências
bun install

# 3. Configure as variáveis de ambiente
# O arquivo .env já vem gerenciado pelo Lovable Cloud com:
# VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID
# Adicione também:
# LOVABLE_API_KEY=<sua-chave>

# 4. Rode o servidor de desenvolvimento
bun run dev
```

O app estará disponível em `http://localhost:8080`.

### Scripts úteis

```bash
bun run dev        # Servidor de desenvolvimento
bun run build      # Build de produção
bun run build:dev  # Build em modo desenvolvimento
bun run lint       # ESLint
bun run format     # Prettier
```

---

## Variáveis de ambiente

| Variável | Origem | Descrição |
|----------|--------|-----------|
| `VITE_SUPABASE_URL` | Lovable Cloud | URL do projeto Supabase |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Lovable Cloud | Chave anon/public do Supabase |
| `VITE_SUPABASE_PROJECT_ID` | Lovable Cloud | ID do projeto Supabase |
| `LOVABLE_API_KEY` | Lovable AI Gateway | Chave para chamar modelos de IA |

> Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` ou senhas do banco no cliente.

---

## Princípios e decisões técnicas

1. **Fonte única de verdade:** o currículo-base do usuário é a única origem de experiências, habilidades e certificações. A IA só reorganiza e reescreve, nunca inventa.
2. **Honestidade no match:** requisitos não atendidos vão sempre para a lista de lacunas, nunca são omitidos ou mascarados.
3. **Server functions para IA:** a chamada ao LLM acontece no servidor (`createServerFn`) para proteger a chave de API e manter a lógica centralizada.
4. **Tool calling + JSON schema:** forçamos a IA a responder dentro de um schema rígido, reduzindo alucinações e facilitando a validação.
5. **RLS em todas as tabelas:** cada usuário vê apenas seus próprios dados.
6. **Exportação ATS-first:** os documentos gerados seguem regras estritas de parsing por sistemas ATS (coluna única, fontes padrão, bullets simples, datas normalizadas).
7. **Design editorial-técnico:** a interface comunica confiança e precisão, com dados processados destacados em mono e cores semânticas claras.
8. **Estados vazios:** toda lista vazia explica o que acontece e oferece uma ação clara, em vez de mostrar uma tela em branco.

---

## Licença

Projeto desenvolvido sob demanda. Uso interno / comercial conforme acordo do cliente.
