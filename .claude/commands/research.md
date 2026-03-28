---
description: Etapa 1 do SDD — pesquisa a codebase e gera PRD.md para a feature informada
argument-hint: <descrição da feature ou bug>
allowed-tools: Read, Grep, Glob, WebFetch, Bash(find:*), Bash(git log:*), Bash(git grep:*)
---

# SDD — Etapa 1: Research

Você está iniciando a **Etapa 1 do workflow Spec-Driven Development**.

Feature/bug a implementar: **$ARGUMENTS**

---

## O que fazer

### 1. Mapeie a codebase

Identifique todos os arquivos que serão **afetados** pela implementação:

- Busque arquivos com padrões similares à feature pedida (`Grep`, `Glob`)
- Encontre implementações parecidas já existentes no projeto
- Mapeie dependências diretas (services, controllers, models, testes)
- Liste apenas os arquivos **relevantes** — não liste o projeto inteiro

### 2. Encontre padrões internos

- Identifique como features similares foram implementadas no projeto
- Extraia trechos de código (snippets) que mostram o padrão adotado
- Note convenções de nomenclatura, estrutura de arquivos, estilo de código

### 3. Busque documentação externa

- Para cada biblioteca/framework envolvido, busque a documentação atual (`WebFetch`)
- Foque nos trechos relevantes para esta feature — não cole docs inteiras
- Priorize documentação oficial e exemplos da versão usada no projeto

### 4. Registre referências externas

- Se houver padrões úteis no Stack Overflow, GitHub ou outras fontes, traga os snippets relevantes
- Indique a fonte de cada referência externa

---

## Output esperado

Gere o arquivo `docs/features/[nome-da-feature]/PRD.md` com a seguinte estrutura:

```markdown
# PRD — [Nome da Feature]

## Contexto
[O que precisa ser feito e por quê]

## Arquivos afetados
[Lista com path completo de cada arquivo relevante]

## Padrões internos encontrados
[Snippets de código do projeto que mostram como coisas similares foram feitas]

## Documentação relevante
[Trechos das docs das libs/frameworks envolvidos]

## Referências externas
[Snippets e links de referências externas úteis]

## Restrições e observações
[Algo que NÃO deve ser feito, limitações conhecidas, riscos]
```

---

## Regras importantes

- **Seja seletivo**: inclua apenas o que é necessário para implementar. Contexto inútil desperdiça a Context Window.
- **Não escreva código de implementação** nesta etapa — apenas pesquise e documente.
- **Não tome decisões de arquitetura** — apenas levante opções e padrões existentes.
- Ao finalizar o PRD.md, avise o dev para revisar antes de prosseguir.

Após o dev revisar e aprovar o PRD.md, ele executará `/clear` para limpar a Context Window antes da Etapa 2.
