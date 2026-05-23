# Rodovia Lanches - Backend

Backend Spring Boot para o trabalho da faculdade.

Pré-requisitos:
- Java 17
- Maven
- PostgreSQL

Crie o banco PostgreSQL `rodovialanches` e ajuste credenciais se necessário:

```bash
psql -U postgres -c "CREATE DATABASE rodovialanches;"
```

Rodar a aplicação:

```bash
cd "Nova pasta/rodovialanches-backend"
mvnd spring-boot:run
```

Endpoints básicos:
- `POST /api/orders` — criar pedido (enviar JSON do `Order` com `items`)
- `GET /api/orders` — listar pedidos
- `GET /api/orders/status/{status}` — filtrar por status
- `PUT /api/orders/{id}/status?status=READY_FOR_PAYMENT` — atualizar status

O backend controla estoque de produtos: quando um pedido é criado, a quantidade no produto é reduzida automaticamente. Se não houver estoque, a API retorna erro 400.

O backend permite chamadas do frontend `http://localhost:5173` via CORS.

Em seguida posso scaffolder o frontend React e criar os diagramas solicitados.
