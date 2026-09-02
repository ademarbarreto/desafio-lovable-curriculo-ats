# Currículo Certeiro

Gerador de currículos otimizados para ATS. O app compara o seu currículo-base com o texto de uma vaga específica, mostra honestamente o que combina e o que falta, e gera uma versão adaptada pronta para exportar em `.docx` e `.pdf`.

> **Regra inegociável:** a IA nunca inventa habilidade, ferramenta, certificação ou tempo de experiência que não esteja no currículo-base. Ela pode reordenar, reescrever para clareza e incorporar palavras-chave da vaga — nada além disso. Requisito não atendido vira lacuna, nunca é omitido.

---

## Funcionalidades

- **Autenticação** por e-mail e senha, com criação de conta, confirmação de e-mail e recuperação de senha.
- **Currículo-base** estruturado: dados pessoais, experiências, formação, certificações e habilidades — preenchidos apenas por você.
- **Nova vaga**: cole a descrição do anúncio e a análise de compatibilidade roda automaticamente.
- **Análise com IA**: pontuação 0–100, requisitos atendidos com a evidência correspondente no currículo, lacunas classificadas (não atende / atende parcialmente) e currículo adaptado em coluna única.
- **Currículo gerado**: visualização do texto adaptado e exportação em `.docx` e `.pdf` no formato ATS.
- **Histórico** de vagas analisadas, com status editável (rascunho → aplicado → entrevista → rejeitado → aceito).
- **Estados vazios convidativos** em todas as listas, guiando para o primeiro passo.

---

## Telas da aplicação

Todas as capturas abaixo são do app rodando com dados reais. As imagens ficam em `docs/screens/`.

### 1. Entrar / Criar conta — `/auth`

![Tela de login do Currículo Certeiro](docs/screens/01-entrar.png)

A porta de entrada do app. Aba **Entrar** para quem já tem conta e **Criar conta** para novos usuários (com campo de nome completo). A confirmação de e-mail está ativa: clique no link recebido antes do primeiro login.

- Erros traduzidos para o português: credenciais inválidas, e-mail não confirmado, conta já existente e senha curta têm mensagens próprias.
- **Esqueci minha senha** envia um link de redefinição para o e-mail informado.

### 2. Painel — `/`

![Painel do Currículo Certeiro com cartões de estatísticas e candidaturas recentes](docs/screens/02-painel.png)

Visão geral da conta:

- **Cartões de estatística**: vagas analisadas, compatibilidade média e vagas em processo.
- **Candidaturas recentes**: as últimas 6 vagas com status, pontuação e atalho **Ver análise**.
- Botão **Nova Vaga** para começar uma análise imediatamente.
- Sem nenhuma vaga, um estado vazio convidativo mostra o caminho: *“Adicione a primeira vaga”*.

### 3. Meu Currículo — `/curriculo`

![Formulário do currículo-base com dados pessoais, experiências, formação, certificações e habilidades](docs/screens/03-meu-curriculo.png)

A **única fonte de verdade** do sistema. Nada é escrito pela IA nesta página — ela apenas reorganiza o que existe aqui.

- **Dados pessoais**: nome completo, título profissional, e-mail, telefone, localização, LinkedIn, GitHub, portfólio e resumo.
- **Experiências**: empresa, cargo, datas (fim vazio = emprego atual) e descrição, com botões para adicionar e remover.
- **Formação** e **Certificações**: entrada em bloco com emissor/instituição e períodos.
- **Habilidades**: nome + categoria (técnica, ferramenta ou soft skill).
- Botão **Salvar currículo-base** persiste tudo de uma vez — itens removidos são apagados, itens novos são inseridos.

### 4. Nova Vaga — `/nova-vaga`

![Tela Nova Vaga com textarea da descrição e painel de identificação](docs/screens/04-nova-vaga.png)

- Textarea em fonte monoespaçada para colar o anúncio integral (com contador de caracteres).
- **Identificação**: empresa, cargo e idioma do currículo adaptado (Português ou Inglês).
- Botão **Analisar Compatibilidade** dispara a análise com IA na hora — o resultado cai direto na tela de análise.

### 5. Análise de Compatibilidade — `/analise`

![Análise de compatibilidade com pontuação 75/100, tags de habilidades compatíveis e lacunas reais](docs/screens/05-analise.png)

O coração do produto, em três blocos:

- **Pontuação de match** (0–100) com barra de progresso e contagem de requisitos atendidos × lacunas.
- **+ Compatível** (verde-sálvia): requisitos da vaga atendidos pelo currículo-base.
- **~ Lacunas reais** (âmbar): requisitos não atendidos — nunca omitidos.
- **Evidências no currículo-base**: para cada requisito atendido, o trecho exato do currículo que o comprova.
- **Por que cada lacuna existe**: explicação do que falta, marcada como *(parcial)* ou *(não atende)*.
- Botões **Reanalisar com IA** e **Ver currículo gerado**.

### 6. Currículo Gerado — `/curriculo-gerado`

![Currículo gerado em coluna única com botões de exportação DOCX e PDF](docs/screens/06-curriculo-gerado.png)

- Pré-visualização do currículo adaptado em **coluna única**, com nome, contato, resumo, experiências, formação, certificações e habilidades.
- Botões **Exportar DOCX** e **Exportar PDF** com nome de arquivo no padrão `Nome_Sobrenome_Cargo_Empresa`.
- Painel **Observações** listando as lacunas que não entraram no corpo do currículo — transparência total.

### 7. Histórico — `/historico`

![Histórico de vagas analisadas em tabela com pontuação e status editável](docs/screens/07-historico.png)

Todas as vagas analisadas em tabela: data, empresa, cargo, idioma, pontuação e **status editável** (dropdown direto na linha, com toast de confirmação). Cada linha abre a análise completa.

### 8. Redefinir senha — `/redefinir-senha`

![Tela de redefinição de senha](docs/screens/08-redefinir-senha.png)

Aberta pelo link enviado por e-mail. Se a sessão de recuperação for válida, mostra o formulário **Nova senha**; caso contrário, avisa que o link é inválido ou expirado e oferece voltar para o login.

### Responsividade

![Painel em tela de celular com navegação superior horizontal](docs/screens/09-painel-mobile.png)

No mobile a sidebar vira uma barra de navegação horizontal no topo, e os cartões empilham verticalmente.

---

## Fluxo de uso

```text
1. Criar conta em /auth e confirmar o e-mail
2. Preencher o currículo-base em /curriculo  (fonte da verdade)
3. Colar a descrição da vaga em /nova-vaga   (análise roda sozinha)
4. Revisar /analise: o que combina, o que falta e por quê
5. Exportar o currículo adaptado em /curriculo-gerado (.docx ou .pdf)
6. Acompanhar o processo em /historico, atualizando o status
```

## Exportação compatível com ATS

- Coluna única, sem tabelas, caixas de texto, ícones ou elementos gráficos.
- Fonte padrão (Arial no DOCX, Helvetica no PDF), texto em preto.
- Títulos convencionais: Resumo Profissional, Experiência Profissional, Formação Acadêmica, Certificações, Habilidades.
- Datas normalizadas em MM/AAAA — aceita entradas como `2021-03`, `mar/2021`, `2015` e `atual`.
- Marcadores simples com hífen, sem símbolos decorativos.
- Arquivo nomeado `Nome_Sobrenome_Cargo_Empresa.docx` / `.pdf`.

## Autenticação

- Crie a conta na aba **Criar conta** da tela `/auth`. A confirmação de e-mail está ativa: clique no link recebido antes do primeiro login.
- **“Invalid login credentials”** significa e-mail ou senha incorretos, ou conta ainda não criada. A interface traduz isso para o português com instruções claras.
- Esqueceu a senha? Informe o e-mail na tela de login e clique em **Esqueci minha senha** — o link de redefinição chega por e-mail.

## Design

Estilo editorial-técnico (ficha técnica / scanner):

- **Manrope** na interface, **IBM Plex Mono** em dados processados (pontuações, datas, tags técnicas).
- Paleta em **teal profundo** (#0E7C86), **verde-sálvia** (#4F7942) e **âmbar** (#B8792A), com superfícies claras e cantos retos.
- Tags de análise com animação de varredura (`scan-in`) e rótulos em caixa alta monoespaçada (`label-tech`).
- Todos os valores são tokens semânticos em `src/styles.css` — nada de cores hardcoded nos componentes.

## Stack

- TanStack Start (React 19, Vite 7) com rotas em `src/routes`
- Tailwind CSS v4 + shadcn/ui
- Lovable Cloud (banco Postgres com RLS, autenticação e storage)
- Server functions (`createServerFn`) para a análise de IA via Lovable AI Gateway (modelo Gemini)
- `docx` e `jspdf` para exportação

## Estrutura

```text
src/
  routes/                 páginas (auth, redefinir-senha, _authenticated/*)
  components/             app shell, estados vazios, tags técnicas
  lib/
    dados.ts              consultas e mutações (TanStack Query)
    dominio.ts            tipos de domínio e rótulos
    analise.ts            comparação determinística por palavras-chave
    analise-ia.functions.ts  server function da análise com IA
    exportar-curriculo.ts    geração de DOCX e PDF em formato ATS
  integrations/supabase/  clientes e middlewares gerados
docs/
  screens/                capturas das telas usadas neste README
```

## Modelo de dados

`profiles`, `experiences`, `education`, `certifications`, `skills`, `job_postings` e `matches` — todas vinculadas ao usuário autenticado, com RLS garantindo que cada pessoa veja apenas os próprios dados. A tabela `matches` guarda pontuação, habilidades compatíveis, lacunas, evidências, explicações e o currículo adaptado gerado pela IA.

## Desenvolvimento local

```sh
git clone <url-do-repositorio>
cd <pasta-do-projeto>
npm i
npm run dev
```