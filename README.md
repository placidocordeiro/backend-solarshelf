# RFID Estoque Backend

Backend de controle de estoque via RFID. Cada **tag RFID representa um pallet**
de produtos (não uma unidade individual). O estoque total de um produto é
calculado somando a `quantidade` de todas as tags ativas (pallets ainda no
estoque) daquele produto.

## Stack
- Node.js + Express
- Prisma ORM
- PostgreSQL

## Setup

```bash
npm install
cp .env.example .env
# edite o .env com a sua DATABASE_URL do Postgres

docker compose up -d

npx prisma migrate dev --name init
npm run dev
```

## Modelo de dados

**Produto**
- `id`, `nome`, `descricao`, `createdAt`, `updatedAt`

**Tag** (pallet)
- `id` (TID da tag RFID, string/hex)
- `produtoId` (FK)
- `lote` (string, até 11 dígitos)
- `quantidade` (unidades do produto naquele pallet)
- `dataFabricacao`, `validade`
- `dataEntrada` (auto, quando o pallet entrou no estoque)
- `dataSaida` (null = pallet ainda em estoque; preenchida no DELETE)

**Movimentacao**
- `tipo` (`ENTRADA` ou `SAIDA`), pallet, produto, quantidade e data

## Rotas

### Produto
| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos` | Lista produtos com `estoqueTotal` e `totalPallets` calculados |
| GET | `/produtos/:id` | Detalhe de um produto + tags ativas |
| POST | `/produtos` | Cria produto |
| PUT | `/produtos/:id` | Atualiza produto |

### Tag
| Método | Rota | Descrição |
|---|---|---|
| GET | `/tags` | Lista tags **ativas**. `?incluirInativas=true` traz todas. Filtros: `?produtoId=`, `?lote=` |
| GET | `/tags/:tid` | Busca uma tag por TID (ativa ou não) |
| POST | `/tags` | Registra entrada de um pallet |
| PUT | `/tags/:tid` | Atualiza dados de um pallet |
| DELETE | `/tags/:tid` | Soft delete — marca `dataSaida = now()`, não apaga do banco |

### Movimentações
| Método | Rota | Descrição |
|---|---|---|
| GET | `/movimentacoes` | Histórico completo; filtros `produtoId`, `tipo`, `de` e `ate` |

## Exemplos

### Criar produto
```bash
curl -X POST http://localhost:3000/produtos \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Coca-Cola Zero 600ml",
    "descricao": "Refrigerante Coca-Cola Zero Açúcar - garrafa 600ml"
  }'
```

### Registrar entrada de um pallet (tag)
```bash
curl -X POST http://localhost:3000/tags \
  -H "Content-Type: application/json" \
  -d '{
    "id": "E2801160600002052A5D1234",
    "produtoId": 1,
    "lote": "24051201",
    "quantidade": 240,
    "dataFabricacao": "2025-05-12",
    "validade": "2025-11-12"
  }'
```

### Registrar saída do pallet (leitor detectou saída)
```bash
curl -X DELETE http://localhost:3000/tags/E2801160600002052A5D1234
```

### Ver estoque total do produto
```bash
curl http://localhost:3000/produtos/1
```

### Ver histórico completo de um produto (ativos + saídos)
```bash
curl "http://localhost:3000/tags?produtoId=1&incluirInativas=true"
```

Depois de atualizar schema, gere e aplique migration:

```bash
npx prisma migrate dev --name add_movimentacoes
npm run prisma:generate
npm run prisma:seed # opcional; recria dados de demonstração e eventos
```
