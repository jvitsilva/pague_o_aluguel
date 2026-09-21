<div align="center">
  <h1>Pague o Aluguel!</h1>
  <p>Aplicação web para divisão de despesas desiguais entre grupos, com cálculo exato de dívidas e compartilhamento rápido.</p>

  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
</div>

## Sobre o Projeto

O **Pague o Aluguel!** resolve o atrito na hora de dividir contas complexas de bares, viagens ou supermercados. Diferente de divisões genéricas de "meio a meio", o sistema permite atribuição de valores específicos por pessoa (ex: quem consumiu bebida alcoólica e quem não), calculando automaticamente a matriz de quem deve para quem.

O projeto foi arquitetado para oferecer uso imediato (sem barreiras de entrada) e recursos avançados para usuários recorrentes.

## Funcionalidades e Regras de Negócio

### Modo Visitante (Sem Autenticação)
Foco em menor atrito e resolução rápida.
* **Criação Rápida:** Inserção de participantes e valor total da conta.
* **Divisão Desigual:** Lógica de negócio que permite definir pesos ou valores exatos consumidos por cada membro.
* **Cálculo de Matriz de Dívida:** Algoritmo que simplifica as transações (ex: se A deve para B e B deve para C, o sistema otimiza para A pagar diretamente a C).
* **Compartilhamento Expresso:** Geração de link ou texto formatado para envio direto via WhatsApp.

### Modo Autenticado
Foco em histórico, persistência relacional e controle de inadimplência.
* **Gestão de Grupos:** Criação de grupos fixos (ex: "República", "Futebol de Quinta").
* **Caderneta de Cobrança:** Registro histórico de contas pagas e em aberto.
* **Status de Atraso:** Acompanhamento visual de dívidas antigas.

## Tecnologias

A aplicação é dividida entre uma API RESTful e uma SPA, ambas fortemente tipadas.

**Backend**
* **Ambiente:** Node.js
* **Framework:** Express
* **Linguagem:** TypeScript
* **Banco de Dados:** PostgreSQL (Modelagem relacional para suportar entidades N:N)

**Frontend**
* **Core:** React
* **Build Tool:** Vite
* **Linguagem:** TypeScript
* **Estilização:** Tailwind

## Estrutura

```
starter/
├── backend/     API Express (porta 3333)
└── frontend/    App React servido pelo Vite (porta 5173)
```

## Como rodar

Em dois terminais separados:

```bash
# Terminal 1 — backend
cd backend
cp .env.example .env
npm install
npm run dev

# Terminal 2 — frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```
