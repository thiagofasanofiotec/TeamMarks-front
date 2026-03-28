---
description: Gera documentação da feature após todas as tasks implementadas — atualiza ARCHITECTURE.md e gera CHANGELOG.md
argument-hint: <nome-da-feature, ex: confirmacao-email>
allowed-tools: Read, Write, Edit, Glob, Bash(git log:*), Bash(git diff:*)
---

# SDD — Documentação de Feature

Feature a documentar: **$ARGUMENTS**

---

## Pré-requisitos

Antes de começar, verifique:
- Existe `docs/features/$ARGUMENTS/Spec.md`?
- Existe `docs/features/$ARGUMENTS/Tasks.md`?

Se algum não existir, interrompa e avise o dev.

---

## O que fazer

### 1. Leia os artefatos da feature

- `docs/features/$ARGUMENTS/Spec.md` — o que foi planejado
- `docs/features/$ARGUMENTS/Tasks.md` — as tasks e critérios de aceite
- Todos os arquivos listados na Spec — o que foi realmente implementado

### 2. Compare Spec com implementação

Identifique:
- O que foi implementado exatamente como planejado
- O que divergiu da Spec (decisões tomadas durante a implementação)
- Arquivos que foram criados ou modificados além do previsto na Spec
- Dependências novas que foram adicionadas

### 3. Gere o CHANGELOG.md

Crie `docs/features/$ARGUMENTS/CHANGELOG.md`:
```markdown
# CHANGELOG — [nome da feature]

## O que foi implementado
[Descrição objetiva do que foi entregue]

## Arquivos criados
- `path/arquivo` — [o que faz]

## Arquivos modificados
- `path/arquivo` — [o que mudou]

## Desvios da Spec
[O que foi diferente do planejado e por quê — se não houver, escreva "Nenhum"]

## Dependências adicionadas
[Libs ou pacotes novos — se não houver, escreva "Nenhuma"]

## Como testar
[Passos para validar manualmente o que foi implementado]
```

### 4. Atualize o ARCHITECTURE.md

Abra `docs/ARCHITECTURE.md` e adicione uma nova entrada no final:
```markdown
---

## [nome-da-feature] — [data de hoje]

**Bounded context:** [módulo afetado]
**Arquivos criados:** [lista resumida]
**Arquivos modificados:** [lista resumida]
**Decisões relevantes:** [desvios da Spec ou escolhas de arquitetura feitas durante a implementação]
**Dependências adicionadas:** [se houver]
```

---

## Output ao concluir
```
✅ Documentação gerada

docs/features/$ARGUMENTS/CHANGELOG.md — criado
docs/ARCHITECTURE.md — atualizado

Próximo passo:
Cole o conteúdo do CHANGELOG.md na descrição do PR no Azure DevOps.
```

---

## Regras

- **Não modifique arquivos de código** — apenas arquivos dentro de `docs/`
- **Seja objetivo** — documentação longa não é lida
- **Se não houve desvios da Spec, diga isso explicitamente** — é uma informação valiosa
- **Não invente informações** — se algo não está claro nos artefatos ou no código, deixe como `[a verificar]`