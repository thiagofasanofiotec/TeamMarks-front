---
description: Etapa 2 do SDD — lê o PRD.md e gera Spec.md + Tasks.md para planejamento tático
allowed-tools: Read, Glob
---

# SDD — Etapa 2: Spec + Tasks

Você está iniciando a **Etapa 2 do workflow Spec-Driven Development**.

---

## Pré-requisito

Leia o arquivo `docs/features/[nome-da-feature]/PRD.md` antes de começar.
Se o PRD.md não existir, interrompa e peça ao dev para rodar `/research` primeiro.

---

## O que fazer

Com base **exclusivamente** no PRD.md, gere dois arquivos:

---

### Arquivo 1: `Spec.md`

A Spec é o **mapa tático** da implementação. Ela diz exatamente o que fazer em cada arquivo.

Estrutura obrigatória por arquivo:

```
### path/completo/do/arquivo.ts

**Ação:** CRIAR | MODIFICAR | DELETAR

**O que fazer:**
[Descrição clara e específica do que implementar neste arquivo]

**Snippet de referência:**
[Cole aqui o snippet do PRD que deve ser seguido, se houver]
```

Regras para a Spec:
- Todo arquivo da implementação deve ter seu próprio bloco
- Paths devem ser **completos** a partir da raiz do projeto
- Instruções devem ser específicas o bastante para não deixar ambiguidade
- Se houver código de referência no PRD, inclua-o diretamente na Spec

---

### Arquivo 2: `Tasks.md`

As Tasks quebram a Spec em unidades atômicas de trabalho — cada uma cabe em uma sessão do Claude Code.

Estrutura de cada task:

```markdown
## T-[XX] — [Título curto da task]

**Complexidade:** P (< 1h) | M (1–4h) | G (> 4h)
**Arquivos afetados:** [paths dos arquivos desta task]
**Depende de:** T-[XX] | nenhuma

### O que fazer
[Descrição objetiva da implementação]

### Critério de aceite
- [ ] [Como validar que esta task está correta — testes, comportamento esperado, etc.]
- [ ] [Outro critério se necessário]

---
```

Regras para as Tasks:
- Tasks devem ser **independentes** quando possível — uma não deve depender de outra não finalizada
- Tasks **G devem ser obrigatoriamente divididas** em subtasks P ou M antes de avançar
- A ordem das tasks deve respeitar dependências técnicas (ex: migration antes do service)
- Cada task deve ter pelo menos um critério de aceite verificável
- O ID deve ser sequencial: T-01, T-02, T-03...

---

## Output esperado

```
docs/features/[nome-da-feature]/
├── PRD.md      ← já existia (Etapa 1)
├── Spec.md     ← você vai gerar agora
└── Tasks.md    ← você vai gerar agora
```

---

## Ao finalizar

Apresente um resumo:
- Quantos arquivos serão criados/modificados
- Quantas tasks foram geradas e a distribuição P/M/G
- Se há tasks G que precisam ser divididas antes de implementar
- Pergunte ao dev se aprova os dois artefatos ou quer ajustes

Após aprovação, o dev executará `/clear` antes de iniciar a Etapa 3.
