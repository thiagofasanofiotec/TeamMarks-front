# Teams Marks - Gerenciador de Marcos

Aplicativo React para gerenciar marcos (milestones) de equipes ao longo do tempo com integração de API backend.

## 🚀 Funcionalidades

- **Autenticação**: Sistema de login com código via email
- **Controle de Acesso por Roles**:
  - **Usuários (roleId = 1)**: Podem criar marcos e visualizar timeline de aprovados
  - **Administradores (roleId = 2)**: Gerenciam aprovação/rejeição de marcos
- **Timeline de Marcos**: Visualize marcos aprovados em ordem cronológica
- **Criar Marcos**: Usuários podem solicitar novos marcos (ficam pendentes)
- **Administração**: Admins aprovam ou rejeitam marcos pendentes
- **Sistema de Status**:
  - Status 1: Pendente (aguardando aprovação)
  - Status 2: Aprovado (visível na timeline)
  - Status 3: Rejeitado
- **Integração com API**: Todos os dados sincronizados com backend
- **Rotas Protegidas**: Acesso controlado por autenticação e role

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure a API backend (veja [API_CONFIG.md](./API_CONFIG.md))

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse o aplicativo em `http://localhost:3000`

5. Faça login usando seu email corporativo
 e rotas protegidas
- **Axios** - Cliente HTTP para integração com API
- **Context API** - Gerenciamento de estado global
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização corporativa e responsiva
- **React 18** - Biblioteca JavaScript para construção de interfaces
- **React Router DOM** - Roteamento entre páginas
- **Vite** - Build tool e servidor de desenvolvimento
- **CSS3** - Estilização moderna com gradientes e animações

## 📂 Estrutura do Projeto

```   # Componente principal com rotas e autenticação
├── main.jsx                   # Ponto de entrada da aplicação
├── components/
│   └── PrivateRoute.jsx       # Componente de rota protegida
├── context/
│   ├── AuthContext.jsx        # Context para autenticação
│   └── MarcosContext.jsx      # Context para gerenciar estado dos marcos
├── pages/
│   ├── Login.jsx              # Página de autenticação
│   ├── Login.css              # Estilos do login
│   ├── Timeline.jsx           # Página de visualização da linha do tempo
│   ├── Timeline.css           # Estilos da timeline
│   ├── MarcoForm.jsx          # Formulário para criar/editar marcos
│   └── MarcoForm.css          # Estilos do formulário
├── services/
│ Design corporativo e profissional
- Interface responsiva para mobile e desktop
- Transições suaves nas interações
- Sistema de status com cores personalizáveis
- Validação de formulários com feedback
- Confirmação antes de excluir marcos
- Loading states e tratamento de erros
- Interceptors HTTP para token JWT

## 📝 Como Usar

### Para Usuários (roleId = 1):
1. **Login**: Acesse `/login` e digite seu email para receber o código
2. **Validar Código**: Digite o código recebido para fazer login
3. **Visualizar Timeline**: Veja todos os marcos aprovados em ordem cronológica
4. **Criar Marco**: Clique em "Novo Marco" - ficará pendente até aprovação
5. **Editar/Excluir**: Gerencie seus próprios marcos (botões disponíveis na timeline)

### Para Administradores (roleId = 2):
1. **Login**: Mesmo processo de login com código
2. **Área Admin**: Acesse "Administração" no menu
3. **Dashboard**: Visualize estatísticas de marcos pendentes, aprovados e rejeitados
4. **Filtros**: Alterne entre diferentes status
5. **Aprovar/Rejeitar**: Clique nos botões para gerenciar cada marco
6. **Timeline**: Visualize marcos aprovados (somente leitura para admins)
- Design responsivo para mobile e desktop
- Animações suaves nas interações
## 🔐 Autenticação e Controle de Acesso

### Sistema de Roles
- **roleId = 1 (Usuário)**: 
  - Criar marcos (ficam pendentes)
  - Editar e excluir seus próprios marcos
  - Visualizar timeline de marcos aprovados
  
- **roleId = 2 (Administrador)**:
  - Acessar painel administrativo
  - Aprovar ou rejeitar marcos pendentes
  - Visualizar estatísticas
  - Filtrar marcos por status
  - Visualizar timeline (somente leitura)

### Fluxo de Autenticação
- Login com código via email (sem JWT)
- Dados do usuário armazenados no localStorage
- Verificação de role para exibição de menus e rotas
- Redirecionamento baseado em permissões

##Filtros por usuário, status ou período
- Busca de marcos
- Exportação de timeline para PDF/Excel
- Notificações de marcos futuros
- Upload de anexos nos marcos
- Comentários e discussões em marcos
- Dashboard com estatísticas
- Modo escuroódigo de login
- `POST /Login/validate` - Valida código e retorna token
- `GET /Goal` - Lista todos os marcos
- `POST /Goal` - Cria novo marco
- `PUT /Goal` - Atualiza marco
- `DELETE /Goal/{id}` - Remove marco

Veja [API_CONFIG.md](./API_CONFIG.md) para documentação completa

## 📝 Como Usar

1. **Visualizar Marcos**: A página inicial mostra todos os marcos em ordem cronológica
2. **Adicionar Marco**: Clique em "Novo Marco" no menu superior
3. **Editar Marco**: Clique no ícone de lápis ✏️ em qualquer marco
4. **Excluir Marco**: Clique no ícone de lixeira 🗑️ e confirme a exclusão

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Visualiza o build de produção localmente

## 💾 Armazenamento

Os dados são armazenados localmente no navegador usando `localStorage`. Os marcos persistem mesmo após fechar o navegador.

## 🎯 Próximas Melhorias

- Integração com backend/API
- Autenticação de usuários
- Filtros por usuário ou período
- Exportação de marcos para PDF/Excel
- Notificações de marcos futuros
- Compartilhamento de timelines
