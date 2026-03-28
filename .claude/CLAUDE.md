# Instruções do Projeto

Este repositório usa o workflow **Spec-Driven Development (SDD)** para geração de código com Claude Code.

## Workflow obrigatório

### Projeto existente

```
/research <descrição>  →  revisa PRD.md  →  /clear
/spec                  →  revisa Spec.md + Tasks.md  →  /clear
/implement T-XX        →  valida  →  commit AB#[ID]  →  /clear  →  próxima task
```

### Projeto novo (executado uma única vez)

```
Cria repositório → cola spec funcional em docs/spec-funcional.md
        ↓
/setup docs/spec-funcional.md  →  revisa ARCHITECTURE.md + MODULES.md  →  /clear
        ↓
/research <módulo 1>  →  revisa PRD.md  →  /clear
/spec                 →  revisa Spec.md + Tasks.md  →  /clear
/implement T-XX       →  valida  →  commit AB#[ID]  →  /clear  →  próxima task
```

**Nunca pule etapas.** Nunca implemente sem PRD e Spec aprovados.

## Comandos disponíveis

| Comando | Quando usar | O que faz |
|---|---|---|
| `/setup <spec>` | Apenas em projetos novos | Lê a spec funcional e cria o esqueleto do projeto |
| `/research <feature>` | Toda nova feature ou bug | Pesquisa codebase + docs e gera `PRD.md` |
| `/spec` | Após aprovar o PRD | Lê o `PRD.md` e gera `Spec.md` + `Tasks.md` |
| `/implement T-XX` | Após aprovar Spec + Tasks | Implementa a task indicada seguindo a `Spec.md` |
| `/document <feature>` | Após o /implement de todas as tasks | Atualiza ARCHITECTURE.md e gera CHANGELOG.md para o PR |

## Regras

- Máximo **40–50% da Context Window** por sessão. Se passar, `/clear` e recomeça.
- Cada task = uma sessão. Sempre `/clear` entre tasks.
- Commits com `AB#[ID]` para rastreabilidade no Azure DevOps.
- Tasks G (> 4h) devem ser divididas antes de implementar.
- PRD.md, Spec.md e Tasks.md ficam versionados em `docs/features/[nome]/`.

## Estrutura de artefatos

```
docs/features/
└── [nome-da-feature]/
    ├── PRD.md      ← output do /research
    ├── Spec.md     ← output do /spec
    └── Tasks.md    ← output do /spec
```

## Convenção de commits

```
feat: descrição da task AB#1234
fix: descrição do bug AB#1235
test: testes da feature X AB#1236
refactor: melhoria em Y AB#1237
```

---

## Padrões de projeto — Backend (C# / .NET)

### Arquitetura: Domain-Driven Design (DDD)

Estrutura de pastas obrigatória:

```
src/
├── Domain/                        ← núcleo do negócio — sem dependências externas
│   ├── Entities/                  ← objetos com identidade (ex: Order.cs, User.cs)
│   ├── ValueObjects/              ← objetos sem identidade (ex: Email.cs, Money.cs)
│   ├── Aggregates/                ← raízes de agregado
│   ├── Repositories/              ← interfaces de repositório (nunca a implementação)
│   ├── Services/                  ← domain services (lógica que não cabe em entidade)
│   └── Events/                    ← domain events
│
├── Application/                   ← orquestra o domínio — sem lógica de negócio
│   ├── UseCases/                  ← um caso de uso por pasta (ex: CreateOrder/)
│   │   └── CreateOrder/
│   │       ├── CreateOrderCommand.cs
│   │       ├── CreateOrderHandler.cs
│   │       └── CreateOrderResponse.cs
│   ├── DTOs/                      ← objetos de transferência de dados
│   └── Interfaces/                ← interfaces de serviços externos (email, storage...)
│
├── Infrastructure/                ← implementações concretas — banco, APIs externas
│   ├── Persistence/               ← DbContext, migrations, repositórios concretos
│   ├── ExternalServices/          ← integrações com APIs de terceiros
│   └── DependencyInjection/       ← registro de serviços no DI container
│
└── Presentation/                  ← entrada da aplicação (API, controllers)
    ├── Controllers/
    ├── Middlewares/
    └── ViewModels/
```

### Regras obrigatórias

**Dependências entre camadas:**
- `Domain` → não importa nenhuma outra camada. Zero dependências externas.
- `Application` → importa apenas `Domain`. Nunca importa `Infrastructure`.
- `Infrastructure` → implementa interfaces de `Domain` e `Application`.
- `Presentation` → importa apenas `Application`. Nunca acessa `Domain` diretamente.

**Em código:**
```csharp
// ✅ CORRETO — repositório como interface em Domain
// Domain/Repositories/IOrderRepository.cs
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id);
    Task SaveAsync(Order order);
}

// ✅ CORRETO — implementação em Infrastructure
// Infrastructure/Persistence/OrderRepository.cs
public class OrderRepository : IOrderRepository { ... }

// ❌ ERRADO — nunca instancie DbContext dentro de Domain ou Application
// ❌ ERRADO — nunca importe Infrastructure dentro de Domain
```

**Entidades:**
- Sempre use construtores privados com factory methods públicos
- Encapsule coleções — nunca exponha `List<T>`, use `IReadOnlyCollection<T>`
- Valide invariantes dentro da própria entidade

```csharp
// ✅ CORRETO
public class Order : Entity
{
    private readonly List<OrderItem> _items = new();
    public IReadOnlyCollection<OrderItem> Items => _items.AsReadOnly();

    private Order() { }

    public static Order Create(Guid customerId)
    {
        if (customerId == Guid.Empty)
            throw new DomainException("CustomerId inválido.");

        return new Order { CustomerId = customerId };
    }
}
```

**Use Cases:**
- Um handler por use case — não crie handlers genéricos
- Use MediatR para dispatch de commands e queries
- Handlers retornam `Result<T>` — nunca lançam exceção para fluxo de negócio

**Testes:**
- Testes unitários cobrem `Domain` e `Application`
- Testes de integração cobrem `Infrastructure`
- Nunca mocke entidades — use instâncias reais

---

## Padrões de projeto — Frontend (React)

### Bibliotecas obrigatórias

| Categoria | Biblioteca | Observação |
|---|---|---|
| UI e formulários | React Bootstrap | Nunca instale outra lib de componentes sem aprovação |
| HTTP | Axios | Sempre via wrapper interno — nunca importe Axios diretamente |

### Estrutura de pastas

```
src/
├── components/         ← componentes reutilizáveis (sem lógica de negócio)
│   ├── ui/             ← componentes genéricos (Button, Modal, Table...)
│   └── [feature]/      ← componentes específicos de uma feature
│
├── pages/              ← uma pasta por página/rota
│
├── services/           ← wrapper do Axios + chamadas à API
│   ├── api.ts          ← instância configurada do Axios (base URL, interceptors, auth)
│   └── [recurso].service.ts   ← ex: orders.service.ts, users.service.ts
│
├── hooks/              ← custom hooks reutilizáveis
├── contexts/           ← React Context para estado global simples
├── types/              ← interfaces e types TypeScript
└── utils/              ← funções utilitárias puras
```

### Regras obrigatórias

**HTTP — sempre use o wrapper interno:**
```typescript
// ✅ CORRETO — use o wrapper em src/services/api.ts
import api from '@/services/api';

export const getOrders = () => api.get('/orders');
export const createOrder = (data: CreateOrderDto) => api.post('/orders', data);

// ❌ ERRADO — nunca importe Axios diretamente nos componentes ou hooks
import axios from 'axios'; // proibido fora de src/services/api.ts
```

**Formulários — use React Bootstrap com validação:**
```tsx
// ✅ CORRETO — Form do React Bootstrap
import { Form, Button } from 'react-bootstrap';

function CreateOrderForm({ onSubmit }: Props) {
  const [validated, setValidated] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setValidated(true);
      return;
    }
    onSubmit(/* dados */);
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group>
        <Form.Label>Nome</Form.Label>
        <Form.Control required type="text" />
        <Form.Control.Feedback type="invalid">
          Nome é obrigatório.
        </Form.Control.Feedback>
      </Form.Group>
      <Button type="submit">Salvar</Button>
    </Form>
  );
}
```

**Componentes:**
- Componentes de página buscam dados — componentes `ui/` só recebem props
- Nunca faça chamadas à API diretamente em componentes — use um custom hook ou service
- Prefira componentes funcionais com hooks — sem class components

**Nomenclatura:**
- Componentes: `PascalCase` (ex: `OrderCard.tsx`)
- Services: `camelCase` com sufixo `.service.ts` (ex: `orders.service.ts`)
- Hooks: prefixo `use` (ex: `useOrders.ts`)
- Types/Interfaces: `PascalCase` com sufixo `Dto`, `Response`, `Props` quando aplicável
