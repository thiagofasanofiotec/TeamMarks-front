---
description: Etapa 3 do SDD — implementa uma task específica conforme a Spec.md
argument-hint: <ID da task, ex: T-01>
allowed-tools: Read, Write, Edit, Bash(npm test:*), Bash(npm run:*), Bash(git diff:*), Bash(git status:*)
---

# SDD — Etapa 3: Implementação

Você está iniciando a **Etapa 3 do workflow Spec-Driven Development**.

Task a implementar: **$ARGUMENTS**

---

## Pré-requisito

Leia os arquivos antes de começar:
1. `docs/features/[nome-da-feature]/Spec.md` — instruções de implementação
2. `docs/features/[nome-da-feature]/Tasks.md` — detalhes da task $ARGUMENTS

Se algum desses arquivos não existir, interrompa e peça ao dev para rodar `/spec` primeiro.

---

## O que fazer

### 1. Identifique o escopo da task

Leia a task **$ARGUMENTS** no Tasks.md:
- Quais arquivos serão afetados
- O que exatamente deve ser implementado
- Qual é o critério de aceite

### 2. Implemente seguindo a Spec

- Siga **exatamente** os paths e instruções da Spec.md
- Use os snippets de referência da Spec como base
- **Não crie arquivos fora do escopo desta task**
- **Não antecipe implementações de tasks futuras**

### 3. Regras de qualidade

- Prefira soluções **simples** às engenhosas — menos linhas é melhor quando equivalente
- Não duplique código que já existe na codebase
- Siga os padrões de nomenclatura e estilo encontrados no projeto
- Se encontrar uma ambiguidade, **pergunte antes de implementar**

### 4. Ao finalizar a implementação

Execute os critérios de aceite da task:
- Rode os testes relevantes se disponíveis
- Verifique se não há erros de lint/build
- Mostre um `git diff` resumido do que foi alterado

---

## Output ao concluir

Apresente:

```
✅ Task T-[XX] implementada

Arquivos modificados:
- [path] — [o que foi feito]

Critérios de aceite:
- [x] [critério verificado]
- [x] [critério verificado]

Próxima task sugerida: T-[XX+1] — [título]
```

---

## Lembrete para o dev

Após validar manualmente:

```bash
git add .
git commit -m "feat: [descrição da task] AB#[ID do Work Item no Azure DevOps]"
```

Depois execute `/clear` antes de iniciar a próxima task.
