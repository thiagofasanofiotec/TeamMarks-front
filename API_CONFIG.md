# Configuração da API

## Endpoint Base
```
https://localhost:7000/api
```

## Configuração HTTPS Local

Como a API usa HTTPS com certificado local, você precisa:

1. **Aceitar o certificado SSL no navegador**: Acesse `https://localhost:7000` e aceite o aviso de segurança

2. **OU configurar o certificado no sistema** (recomendado para desenvolvimento)

## Estrutura de Dados

### Goal (Marco)
```json
{
  "id": 1,
  "typeId": 1,
  "statusId": 1,
  "userId": 1,
  "title": "Título do Marco",
  "description": "Descrição detalhada",
  "applicant": "Nome do Responsável",
  "highlights": "",
  "deliveryAt": "2025-01-15T00:00:00Z",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

### Mapeamento de Status (cores)
- 1: Azul (#2563eb)
- 2: Verde (#059669)
- 3: Vermelho (#dc2626)
- 4: Roxo (#7c3aed)
- 5: Cinza (#475569)

## Fluxo de Autenticação

### 1. Enviar Código de Login
```http
POST /api/Login/email
Content-Type: application/json

"usuario@email.com"
```

### 2. Validar Código
```http
POST /api/Login/validate
Content-Type: application/json

{
  "email": "usuario@email.com",
  "codeHash": "codigo-recebido"
}
```

Resposta esperada:
```json
{
  "token": "jwt-token-aqui",
  "user": {
    "id": 1,
    "name": "Nome do Usuário",
    "email": "usuario@email.com"
  }
}
```

## Endpoints de Goals

### Listar Todos
```http
GET /api/Goal
Authorization: Bearer {token}
```

### Buscar por ID
```http
GET /api/Goal/{id}
Authorization: Bearer {token}
```

### Criar
```http
POST /api/Goal
Authorization: Bearer {token}
Content-Type: application/json

{
  "typeId": 1,
  "statusId": 1,
  "userId": 1,
  "title": "Novo Marco",
  "description": "Descrição",
  "applicant": "Responsável",
  "highlights": "",
  "deliveryAt": "2025-12-31T00:00:00Z",
  "createdAt": "2025-01-26T00:00:00Z",
  "updatedAt": "2025-01-26T00:00:00Z"
}
```

### Atualizar
```http
PUT /api/Goal
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "typeId": 1,
  "statusId": 1,
  "userId": 1,
  "title": "Marco Atualizado",
  "description": "Nova descrição",
  "applicant": "Responsável",
  "highlights": "",
  "deliveryAt": "2025-12-31T00:00:00Z",
  "createdAt": "2025-01-26T00:00:00Z",
  "updatedAt": "2025-01-26T00:00:00Z"
}
```

### Deletar
```http
DELETE /api/Goal/{id}
Authorization: Bearer {token}
```

## Tratamento de Erros

O aplicativo trata automaticamente:
- Erros 401 (Não autorizado): Redireciona para login
- Erros de rede: Exibe mensagem ao usuário
- Erros de validação: Mostra no formulário

## Desenvolvimento Local

### Teste sem backend
Se a API ainda não estiver disponível, o aplicativo pode funcionar em modo offline comentando as chamadas de API no `MarcosContext.jsx` e usando o localStorage.
