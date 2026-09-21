# PRD — Pague o Aluguel! 🫴

> Documento de referência para desenvolvimento e para agentes de IA.  
> Toda decisão de código deve ser validada contra este documento.

---

## 1. Visão geral

Pague o Aluguel! é uma aplicação web para dividir despesas entre amigos. Cada conta pode ser dividida igualmente ou por valores definidos para cada participante. O humor do produto se inspira na dinâmica do Seu Barriga, personagem que aparece para lembrar que a dívida continua pendente.

O tom faz parte do produto. A cobrança continua inevitável, mas o app a apresenta de forma menos constrangedora e mais bem-humorada.

---

## 2. Stack técnica

| Camada | Tecnologia |
|---|---|
| Backend | Node.js + TypeScript + Express |
| Banco de dados | PostgreSQL |
| Frontend | React + TypeScript + Vite |
| Autenticação | Google OAuth 2.0 + JWT |
| Containerização | Docker + Docker Compose |
| Deploy Backend | Render |
| Deploy Frontend | Vercel |
| Deploy Banco | Neon (Postgres serverless) |

---

## 3. Modos de uso

### 3.1 Modo visitante (sem conta)

O usuário pode acessar o site e usar a ferramenta sem criar uma conta.

O modo visitante permite:
- Nomear os participantes da conta
- Registrar uma despesa com valor total
- Dividir o valor igualmente ou definir quanto cabe a cada pessoa
- Gerar o resumo de quem deve quanto a quem
- Compartilhar via WhatsApp uma foto da nota ou copiar o texto formatado

Limitações:
- Os dados ficam apenas na sessão atual (localStorage)
- Ao fechar o navegador, os dados são perdidos
- Não há histórico, grupos fixos nem controle de "quem já pagou"

Comportamento esperado:
- Ao finalizar a conta, o app exibe um aviso claro:  
  *"Crie uma conta grátis para salvar essa cobrança e acompanhar quem pagou."*
- Se o usuário criar uma conta após usar o modo visitante, o sistema oferece a opção de importar os dados da sessão atual para a nova conta.

---

### 3.2 Modo autenticado (com conta)

A autenticação usa Google OAuth e dispensa formulário de cadastro e senha.

Além dos recursos do modo visitante, o usuário autenticado pode:
- Criar e gerenciar grupos fixos (ex: "Apê da República", "Turma da faculdade")
- Manter o histórico de despesas
- Marcar devedores como "pago" ou "ainda deve"
- Ver quem está com pendências antigas (com o tom de humor do Seu Barriga ou qualquer personagem que lembre cobrar dívidas)
- Consultar o saldo simplificado do grupo, calculado por um algoritmo que reduz o número de transações

---

## 4. Regras de negócio

### 4.1 Divisão de despesas

O usuário escolhe um dos dois modos de divisão para cada despesa.

Na divisão igual, o valor total é dividido pelo número de participantes. Os centavos são arredondados, e o excedente fica com o credor.

Na divisão customizada, o usuário define o valor exato de cada participante. A soma dos valores individuais deve corresponder ao total. O sistema valida essa soma e avisa sobre qualquer diferença antes da confirmação.

### 4.2 Cálculo de saldo

Para cada grupo, o sistema calcula:
- Quanto cada pessoa pagou (soma das despesas em que foi `paid_by`)
- Quanto cada pessoa deveria ter pago (soma dos `amount_owed` em `expense_splits`)
- Saldo = pagou − deveria ter pago (positivo = tem a receber; negativo = ainda deve)

### 4.3 Simplificação de dívidas

Após calcular os saldos individuais, o sistema reduz o número de transações necessárias para quitar as dívidas do grupo.

Exemplo:
- Sem simplificação: João → Ana (R$30), Ana → Pedro (R$30) = 2 transações
- Com simplificação: João → Pedro (R$30) = 1 transação

O resultado simplificado é o que aparece na tela de resumo e no compartilhamento WhatsApp.

### 4.4 Marcar como pago

- Apenas o credor (quem tem a receber) pode marcar uma dívida como paga
- O status da dívida tem três estados: `pendente`, `pago`, `parcial` *(parcial: reservado para versão futura)*
- Uma dívida marcada como paga permanece no histórico com o novo status

### 4.5 Edição e exclusão

- Despesas podem ser editadas (descrição, valor, divisão) enquanto nenhuma parte estiver marcada como paga
- Despesas com pagamentos registrados devem ser excluídas e recriadas, pois não podem ser editadas
- A exclusão de uma despesa remove também seus `expense_splits` (cascade no banco)

---

## 5. Compartilhamento pelo WhatsApp

O sistema gera uma mensagem ao fechar uma conta no modo visitante ou ao abrir o resumo de um grupo no modo autenticado.

Formato da mensagem:
```
Pague o Aluguel! — Resumo da conta

[Nome do grupo ou evento]
[Data]

Quem deve pra quem:
→ João deve R$ 35,50 pra Ana
→ Pedro deve R$ 22,00 pra Ana

Pague logo antes que o Seu Barriga apareça (exemplo)
[link da pessoa ou do grupo]
```

- O usuário pode tanto escolher enviar mensagem personalizada copiada (WhatsApp Web), como pode gerar um download da imagem
- Em dispositivos móveis, a imagem gerada pode ser encaminhada para outros aplicativos
- No modo visitante, a mensagem contém apenas o texto formatado, sem link

---

## 6. Schema do banco de dados

```sql
-- Usuários (criados via Google OAuth)
users (
  id UUID PK,
  google_id VARCHAR UNIQUE,
  name VARCHAR,
  email VARCHAR UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMPTZ
)

-- Grupos de despesas
groups (
  id UUID PK,
  name VARCHAR,
  owner_id UUID FK → users,
  invite_token VARCHAR UNIQUE,  -- token para convite por link
  created_at TIMESTAMPTZ
)

-- Membros de cada grupo
group_members (
  group_id UUID FK → groups,
  user_id UUID FK → users,
  joined_at TIMESTAMPTZ,
  PRIMARY KEY (group_id, user_id)
)

-- Despesas
expenses (
  id UUID PK,
  group_id UUID FK → groups,
  paid_by UUID FK → users,
  description VARCHAR,
  total_amount NUMERIC(10,2),
  date DATE,
  created_at TIMESTAMPTZ
)

-- Divisão de cada despesa por pessoa
expense_splits (
  expense_id UUID FK → expenses,
  user_id UUID FK → users,
  amount_owed NUMERIC(10,2),
  status VARCHAR DEFAULT 'pendente',  -- 'pendente' | 'pago'
  paid_at TIMESTAMPTZ,
  PRIMARY KEY (expense_id, user_id)
)
```

Todos os IDs usam UUID para impedir a enumeração de recursos por meio de identificadores sequenciais.

---

## 7. Rotas da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| GET | `/auth/google` | Inicia o fluxo OAuth com o Google |
| GET | `/auth/google/callback` | Callback do Google, retorna JWT |
| GET | `/auth/me` | Retorna dados do usuário logado |

### Groups
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/groups` | Lista grupos do usuário | Sim |
| POST | `/groups` | Cria novo grupo | Sim |
| GET | `/groups/:id` | Detalhe do grupo | Sim |
| DELETE | `/groups/:id` | Remove grupo (só owner) | Sim |
| POST | `/groups/:id/join` | Entra no grupo via invite_token | Sim |
| GET | `/groups/:id/balance` | Saldo simplificado do grupo | Sim |

### Expenses
| Método | Rota | Descrição | Auth |
|---|---|---|---|
| GET | `/groups/:id/expenses` | Lista despesas do grupo | Sim |
| POST | `/groups/:id/expenses` | Cria despesa | Sim |
| PUT | `/expenses/:id` | Edita despesa | Sim |
| DELETE | `/expenses/:id` | Remove despesa | Sim |
| PATCH | `/expenses/:id/splits/:userId/pay` | Marca como pago | Sim |

---

## 8. Práticas de implementação

- Todos os IDs usam UUID para evitar enumeração de recursos
- Todas as rotas que recebem body validam os dados de entrada com Zod
- Um middleware de autenticação JWT protege as rotas autenticadas
- Toda rota de grupo verifica se o usuário autenticado pertence ao grupo
- Segredos ficam em variáveis de ambiente, e o arquivo `.env.example` documenta as chaves necessárias
- Um middleware global trata erros sem depender de `console.log` solto
- A exclusão de um grupo remove automaticamente membros, despesas e splits por cascade no banco

---

## 9. Fora do escopo por enquanto

- Pagamentos reais (integração com Pix, etc.)
- Notificações push ou e-mail
- App mobile nativo
- Suporte a múltiplas moedas
- Pagamentos parciais (status `parcial` reservado mas não implementado)
- Relatórios ou exportação de dados

---

## 10. Tom e identidade

O app deve ser funcional e bem-humorado, sem adotar o tom formal de uma fintech. Referências ao Seu Barriga, frases leves de cobrança e um design que não intimide fazem parte da proposta. O humor diferencia o MePag de outros aplicativos de divisão de despesas.

> *"A dívida envergonha quem deve, mas o Pague o Aluguel! torna isso divertido."*
