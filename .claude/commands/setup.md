---
description: Etapa 0 do SDD — usado apenas em projetos novos. Lê a especificação funcional e cria o esqueleto do projeto seguindo os padrões da empresa.
argument-hint: <caminho para a especificação funcional, ex: docs/spec-funcional.md>
allowed-tools: Read, Write, Edit, Glob, Bash(dotnet:*), Bash(npm:*), Bash(npx:*), Bash(mkdir:*), Bash(touch:*)
---

# SDD — Etapa 0: Setup do Projeto

Você está iniciando um **projeto do zero** usando o workflow Spec-Driven Development.

Especificação funcional: **$ARGUMENTS**

---

## Pré-requisitos

### ⚠️ Verificação obrigatória antes de qualquer ação

Verifique se o projeto já existe checando sinais de código:
- Existe `src/` com arquivos `.cs`, `.ts`, `.tsx`, `.js` dentro?
- Existe `*.csproj`, `*.sln`, `package.json` na raiz ou em subpastas?
- Existe `docs/ARCHITECTURE.md` (sinal de que o `/setup` já foi executado)?

**Se qualquer um desses existir, interrompa imediatamente** com a mensagem:
```
⛔ Projeto existente detectado.

O comando /setup é exclusivo para projetos novos e pode sobrescrever
arquivos existentes se executado aqui.

Se você quer:
- Implementar uma nova feature → use /research <descrição>
- Documentar a arquitetura atual → posso gerar o ARCHITECTURE.md
  sem modificar nenhum arquivo de código. Confirma?
```

Só prossiga se o projeto estiver vazio (apenas `.claude/`, `CLAUDE.md`, `.git`, `.gitignore`).

---

1. Leia o arquivo de especificação funcional indicado em `$ARGUMENTS`
2. Leia o `CLAUDE.md` para entender os padrões obrigatórios da empresa
3. Se algum dos dois não existir, interrompa e avise o dev

---

## O que fazer

### 1. Analise a especificação funcional

Extraia da spec:
- **Domínio principal** — qual o problema que o sistema resolve
- **Bounded contexts / módulos** — quais são as grandes áreas funcionais
- **Entidades principais** — os conceitos centrais do negócio
- **Integrações externas** — APIs, serviços de terceiros mencionados
- **Tipo de projeto** — backend API, frontend, fullstack, ou ambos

### 2. Identifique o tipo de projeto e aplique os padrões

**Se for backend C#/.NET:**
- Estrutura DDD com `Domain`, `Application`, `Infrastructure`, `Presentation`
- Crie a solution e os projects separados por camada
- Configure as referências entre projects respeitando a regra de dependências

**Se for frontend React:**
- Estrutura com `components/`, `pages/`, `services/`, `hooks/`, `types/`, `utils/`
- Configure com Create React App ou Vite conforme o padrão da empresa
- Instale React Bootstrap e Axios como dependências base

**Se for fullstack:**
- Crie pastas separadas `backend/` e `frontend/` na raiz
- Aplique os padrões de cada um independentemente

### 3. Crie a estrutura de pastas e arquivos base

Crie **apenas o esqueleto** — sem lógica de negócio ainda:
- Estrutura de pastas completa
- Arquivos de configuração (`.csproj`, `Program.cs`, `package.json`, `.gitignore`, etc.)
- Dependências base instaladas
- Arquivos de exemplo vazios nas camadas principais para servir de referência

### 4. Gere os artefatos de documentação

Crie os seguintes arquivos em `docs/`:

**`docs/ARCHITECTURE.md`** — decisões de arquitetura tomadas:
```markdown
# Arquitetura do Projeto

## Tipo de projeto
[backend / frontend / fullstack]

## Padrões aplicados
[DDD, React Bootstrap, etc. — referenciando o CLAUDE.md]

## Bounded contexts identificados
[Lista dos módulos extraídos da spec funcional]

## Estrutura de pastas
[Árvore de pastas criada com explicação de cada camada]

## Dependências instaladas
[Lista com nome, versão e motivo de cada dependência]

## Decisões tomadas
[Qualquer decisão relevante que não estava explícita na spec]
```

**`docs/MODULES.md`** — mapa dos módulos para guiar o desenvolvimento:
```markdown
# Módulos do Projeto

## [Nome do Módulo 1]
**Descrição:** [O que este módulo faz]
**Entidades principais:** [Lista]
**Integrações:** [Dependências com outros módulos ou serviços externos]
**Prioridade sugerida:** Alta / Média / Baixa

## [Nome do Módulo 2]
...
```

---

## Output ao concluir

Apresente um resumo para o dev revisar:
```
✅ Projeto configurado

Tipo: [backend / frontend / fullstack]

Bounded contexts identificados:
- [Módulo 1] — [descrição curta]
- [Módulo 2] — [descrição curta]

Estrutura criada:
[árvore de pastas resumida]

Dependências instaladas:
- [lib] v[versão]

Arquivos gerados:
- docs/ARCHITECTURE.md
- docs/MODULES.md

Próximo passo:
Para cada módulo, rode:
/research <nome do módulo conforme a spec funcional>
```

---

## Regras importantes

- **Não implemente lógica de negócio** nesta etapa — apenas estrutura e configuração
- **Siga estritamente os padrões do `CLAUDE.md`** — não invente convenções novas
- **Se a spec for ambígua**, liste as ambiguidades no `ARCHITECTURE.md` e tome a decisão mais conservadora
- **Não instale libs fora das obrigatórias** — se identificar necessidade de algo novo, liste em `ARCHITECTURE.md` como "dependências pendentes de aprovação"
- Ao finalizar, o dev revisa os artefatos e executa `/clear` antes de iniciar o `/research` do primeiro módulo