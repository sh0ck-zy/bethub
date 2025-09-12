# 📚 Instruções para Importar e Usar a Coleção BetHub no Insomnia

## 🚀 Importar a Coleção

### 1. Abrir o Insomnia
- Abrir o Insomnia Desktop
- Clicar em **Create** → **Import from File**

### 2. Selecionar o Arquivo
- Navegar para a pasta do projeto BetHub
- Selecionar `bethub-insomnia-collection-v2.json`
- Clicar em **Import**

### 3. Verificar a Importação
- A coleção "BetHub API Collection v2" deve aparecer no painel esquerdo
- Expandir para ver todos os endpoints

## 🔧 Configurar o Ambiente

### 1. Selecionar Ambiente
- No canto superior direito, clicar no dropdown de ambiente
- Selecionar **"Development Environment"**

### 2. Verificar Variáveis
As seguintes variáveis devem estar configuradas:
```json
{
  "baseUrl": "http://localhost:3000",
  "newsApiUrl": "http://localhost:8000",
  "adminToken": "your-admin-token-here",
  "userToken": "your-user-token-here",
  "matchId": "b8c751bd-a62f-4dc4-bf77-c3a5447394c2"
}
```

### 3. Atualizar Variáveis (se necessário)
- Clicar no ícone de engrenagem ao lado do ambiente
- Atualizar `baseUrl` se o servidor estiver rodando em porta diferente
- Atualizar `matchId` com um ID válido da base de dados

## 🧪 Testar as APIs

### ✅ **APIs que Funcionam (Testar Primeiro)**

#### 1. Health Check
- **Endpoint**: `GET /api/v1/health`
- **Status**: ✅ Funcionando
- **Teste**: Clicar em **Send** - deve retornar status 200 com informações do sistema

#### 2. Test Endpoint
- **Endpoint**: `GET /api/v1/test`
- **Status**: ✅ Funcionando
- **Teste**: Clicar em **Send** - deve retornar mensagem de teste

#### 3. Today's Matches
- **Endpoint**: `GET /api/v1/today`
- **Status**: ✅ Funcionando (mas sem dados publicados)
- **Teste**: Clicar em **Send** - deve retornar array vazio de matches

#### 4. Admin Matches
- **Endpoint**: `GET /api/v1/admin/matches`
- **Status**: ⚠️ Funcionando mas não protegido
- **Teste**: Clicar em **Send** - deve retornar todas as 18 partidas da base

### ❌ **APIs que Precisam ser Implementadas**

#### 1. Pull Matches from APIs
- **Endpoint**: `POST /api/v1/admin/matches/pull`
- **Status**: ❌ Retorna 404
- **Ação**: Implementar endpoint para importar partidas de APIs externas

#### 2. Request AI Analysis
- **Endpoint**: `POST /api/v1/admin/matches/analyze`
- **Status**: ❌ Retorna 404
- **Ação**: Implementar endpoint para solicitar análise IA

#### 3. Publish Matches
- **Endpoint**: `POST /api/v1/admin/matches/publish`
- **Status**: ❌ Retorna 404
- **Ação**: Implementar endpoint para publicar partidas analisadas

#### 4. External APIs Status
- **Endpoint**: `GET /api/v1/external-apis/status`
- **Status**: ❌ Retorna 404
- **Ação**: Implementar endpoint para verificar status das APIs externas

#### 5. Teams & Leagues
- **Endpoint**: `GET /api/v1/teams` e `GET /api/v1/leagues`
- **Status**: ❌ Retorna 404
- **Ação**: Implementar endpoints para gestão de equipas e ligas

## 📊 Status das APIs por Categoria

### 🟢 **Health & Status (100% Funcional)**
- ✅ Health Check
- ✅ Test Endpoint

### 🟡 **Match Management (50% Funcional)**
- ✅ Get Today's Matches
- ✅ Admin Matches (não protegido)
- ❌ Pull Matches from APIs
- ❌ Request AI Analysis
- ❌ Publish Matches

### 🔴 **Data Management (0% Funcional)**
- ❌ Teams Management
- ❌ Leagues Management
- ❌ External APIs Status
- ❌ Sync Operations

### 🟡 **Payments (50% Funcional)**
- ⚠️ Payment Checkout (funciona mas não protegido)

## 🎯 **Workflow de Teste Recomendado**

### **Passo 1: Verificar Sistema Funcionando**
1. Testar `GET /api/v1/health` - deve retornar 200
2. Testar `GET /api/v1/test` - deve retornar 200
3. Testar `GET /api/v1/today` - deve retornar 200 (sem dados)

### **Passo 2: Verificar Dados Existentes**
1. Testar `GET /api/v1/admin/matches` - deve retornar 18 partidas
2. Verificar que todas têm `analysis_status: failed`

### **Passo 3: Identificar Gaps**
1. Testar endpoints que retornam 404
2. Documentar quais precisam ser implementados
3. Priorizar implementação baseada no workflow admin

## 🔍 **Debugging e Troubleshooting**

### **Problema: Servidor não responde**
- Verificar se `pnpm dev` está rodando
- Verificar porta (padrão: 3000, pode ser 3002)
- Atualizar `baseUrl` no ambiente do Insomnia

### **Problema: Endpoints retornam 404**
- Verificar se o arquivo de rota existe em `src/app/api/v1/`
- Verificar se o servidor foi reiniciado após criar novas rotas
- Verificar logs do servidor para erros de compilação

### **Problema: Endpoints retornam 500**
- Verificar logs do servidor
- Verificar se há erros de sintaxe TypeScript
- Executar `npx tsc --noEmit` para verificar tipos

## 📝 **Próximos Passos**

### **Prioridade 1: Implementar Workflow Admin**
1. Criar `POST /api/v1/admin/matches/pull`
2. Criar `POST /api/v1/admin/matches/analyze`
3. Criar `POST /api/v1/admin/matches/publish`

### **Prioridade 2: Implementar Gestão de Dados**
1. Criar `GET /api/v1/teams`
2. Criar `GET /api/v1/leagues`
3. Criar `GET /api/v1/external-apis/status`

### **Prioridade 3: Corrigir Segurança**
1. Proteger endpoint admin com autenticação
2. Proteger endpoint de pagamentos
3. Implementar middleware de autenticação

## 🎉 **Benefícios da Coleção**

- **Visão clara** do estado atual das APIs
- **Testes rápidos** sem precisar de frontend
- **Documentação viva** das funcionalidades
- **Debugging eficiente** de problemas de API
- **Desenvolvimento iterativo** com feedback imediato

---

**💡 Dica**: Use esta coleção como um checklist de desenvolvimento. Marque cada endpoint como implementado e funcional conforme você os desenvolve!



