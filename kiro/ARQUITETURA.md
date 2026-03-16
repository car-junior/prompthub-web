# Arquitetura do PromptHub

## Visão Geral

PromptHub é uma API REST para gerenciamento e catalogação de prompts de IA. O projeto segue uma arquitetura em camadas com separação clara de responsabilidades, dividida em três grandes módulos: `config`, `core` e `domain`.

---

## Estrutura de Pacotes

```
src/main/java/br/com/senior/prompthub/
├── config/                  # Configurações transversais
│   ├── audit/               # Auditoria automática (JPA)
│   ├── security/            # JWT, filtros, autenticação
│   └── GeneralConfig.java   # Beans gerais (ModelMapper, etc)
│
├── core/                    # Componentes genéricos reutilizáveis
│   ├── controller/          # BaseCrudController
│   ├── dto/                 # PageParams, PageResult
│   ├── repository/          # BaseRepository
│   ├── service/             # AbstractBaseService, BaseService
│   │   ├── modelmapper/     # ModelMapperService, @NoUpdateMapping
│   │   └── validate/        # CrudInterceptor
│   └── specification/       # BaseSpecification
│
├── domain/                  # Lógica de negócio da aplicação
│   ├── controller/          # Controllers REST
│   ├── dto/                 # DTOs de entrada e saída por domínio
│   ├── entity/              # Entidades JPA
│   ├── enums/               # Enumerações do domínio
│   ├── repository/          # Repositories JPA
│   ├── security/            # Permission Evaluators
│   ├── service/             # Serviços de negócio
│   └── spec/                # Specifications e filtros dinâmicos
│
└── infrastructure/
    └── exception/           # CustomException, GlobalExceptionHandler
```

---

## Camadas da Aplicação

### 1. config/

Configurações transversais que não pertencem ao domínio.

**audit/**
- `Auditable` — classe base `@MappedSuperclass` que adiciona `createdAt` e `updatedAt` automaticamente em todas as entidades via JPA Auditing.
- `AuditorConfig` — provê o usuário atual para o JPA Auditing.
- `JpaAuditingConfiguration` — habilita o `@EnableJpaAuditing`.

**security/**
- `SecurityConfig` — configura o `SecurityFilterChain`: rotas públicas (`/api/auth/**`, `/swagger-ui/**`), sessão stateless, filtro JWT.
- `JwtAuthFilter` — intercepta cada requisição, valida o token e popula o `SecurityContext`.
- `JwtTokenService` — gera e valida tokens JWT (HS256, expiração configurável).
- `UserDetailsServiceImpl` — carrega o usuário do banco para o Spring Security.
- `UserPrincipal` — implementação de `UserDetails` com id, username, email e authorities.
- `SecurityUtils` — utilitário estático para obter o usuário logado do `SecurityContext`.
- `CustomAuthExceptionHandler` — retorna respostas padronizadas para 401 e 403.

---

### 2. core/

Componentes genéricos que eliminam código repetitivo em todos os módulos.

**BaseCrudController\<ENTITY, ID\>**

Helper que encapsula as operações CRUD padrão. Os controllers de domínio instanciam este helper ao invés de herdar de uma classe base, mantendo flexibilidade.

```java
// Instanciação no controller
this.crudController = new BaseCrudController<>(service, modelMapperService, Prompt.class);

// Uso com conversão fluente de DTO
return crudController.getById(id).asDto(PromptOutput.class);
return crudController.getAllSpec(pageParams, specification, search).asPageDto(PromptOutput.class);
```

Métodos disponíveis:
| Método | Descrição |
|--------|-----------|
| `getAll(pageParams)` | Lista com paginação |
| `getAllSpec(pageParams, spec, filter)` | Lista com paginação e filtros dinâmicos |
| `getById(id)` | Busca por ID |
| `create(requestDto)` | Cria novo recurso |
| `update(id, requestDto)` | Atualiza recurso existente |
| `delete(id)` | Remove recurso |

O retorno é sempre um `QueryResult` com conversão fluente: `.asDto(Class)`, `.asPageDto(Class)`, `.asEntity()`.

**AbstractBaseService\<T, ID\>**

Implementação padrão de `BaseService` com CRUD completo, transações e tratamento de erros. Os services de domínio estendem esta classe e podem sobrescrever métodos para adicionar validações.

```java
public class PromptService extends AbstractBaseService<Prompt, Long> {
    @Override
    public Prompt create(Prompt prompt) {
        promptValidator.validatePrompt(prompt); // validação customizada
        return super.create(prompt);            // delega para o base
    }
}
```

Suporta `CrudInterceptor` para hooks de `beforeCreate`, `afterCreate`, `beforeUpdate`, etc.

**BaseSpecification\<E, S\>**

Interface para construção de queries dinâmicas com JPA Criteria API. Cada módulo implementa sua própria specification com os filtros específicos.

```java
Specification<E> getPredicate(S search);
```

**PageParams / PageResult**

- `PageParams` — parâmetros de paginação recebidos via query string: `page`, `itemsPerPage`, `sort`, `sortName`. Todos com valores padrão.
- `PageResult<T>` — resposta padronizada de listagens: `totalPages`, `totalResults`, `result`.

**@NoUpdateMapping**

Anotação customizada aplicada em campos de entidades para protegê-los durante operações de UPDATE via ModelMapper. Campos anotados mantêm seu valor original mesmo que o DTO de atualização contenha um valor diferente.

```java
@Id
@NoUpdateMapping  // ID nunca é sobrescrito em updates
private Long id;

@NoUpdateMapping  // Senha não é alterada via PUT /users/{id}
private String password;
```

---

### 3. domain/

Contém toda a lógica de negócio específica da aplicação.

---

## Organização dos Controllers

Todos os controllers seguem o mesmo padrão: **composição com `BaseCrudController`** ao invés de herança, e **autorização declarativa com `@PreAuthorize`**.

### Padrão de Implementação

```java
@RestController
@RequestMapping("/api/prompts")
public class PromptController {

    // 1. Specification para filtros dinâmicos
    private final PromptSpecification promptSpecification;

    // 2. Helper CRUD genérico (composição, não herança)
    private final BaseCrudController<Prompt, Long> crudController;

    public PromptController(PromptService promptService,
                            ModelMapperService<Prompt> promptModelMapperService,
                            PromptSpecification promptSpecification) {
        this.promptSpecification = promptSpecification;
        // 3. Instancia o helper passando service, mapper e classe da entidade
        this.crudController = new BaseCrudController<>(promptService, promptModelMapperService, Prompt.class);
    }

    // 4. Cada endpoint declara sua permissão via @PreAuthorize
    @GetMapping("/{id}")
    @PreAuthorize("@promptPermissionEvaluator.canView(#id)")
    public ResponseEntity<PromptOutput> getPromptById(@PathVariable Long id) {
        return crudController.getById(id).asDto(PromptOutput.class);
    }
}
```

### Controllers Disponíveis

#### AuthController — `/api/auth`
Único controller sem `BaseCrudController`. Gerencia autenticação diretamente.

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/login` | Autentica e retorna JWT |
| POST | `/register` | Registra novo usuário |
| POST | `/change-password` | Altera senha do usuário |

Rotas públicas — não exigem token JWT.

---

#### UserController — `/api/users`

| Método | Endpoint | Autorização |
|--------|----------|-------------|
| GET | `/` | `@userPermissionEvaluator.canList()` |
| GET | `/{id}` | `@userPermissionEvaluator.canView(#id)` |
| PUT | `/{id}` | `@userPermissionEvaluator.canEdit(#id)` |
| PATCH | `/{id}/change-status` | `@userPermissionEvaluator.canChangeStatus()` |
| PATCH | `/{id}/change-role` | `@userPermissionEvaluator.canChangeRole()` |

Não expõe endpoint de criação (usuários são criados via `/api/auth/register`).

---

#### TeamController — `/api/teams`

O controller mais completo, gerencia times e seus membros.

| Método | Endpoint | Autorização |
|--------|----------|-------------|
| GET | `/` | `@teamPermissionEvaluator.canList()` |
| GET | `/{id}` | `@teamPermissionEvaluator.canView(#id)` |
| POST | `/` | `@teamPermissionEvaluator.canCreate(#teamCreate)` |
| PUT | `/{id}` | `@teamPermissionEvaluator.canEdit(#id)` |
| PATCH | `/{id}/change-status` | `@teamPermissionEvaluator.canChangeStatus()` |
| POST | `/with-members` | `@teamPermissionEvaluator.canCreate(#teamCreate)` |
| GET | `/{teamId}/members` | `@memberPermissionEvaluator.canView(#teamId)` |
| POST | `/{teamId}/members` | `@memberPermissionEvaluator.canCreate(#teamId)` |
| PATCH | `/{teamId}/members/{userId}` | `@memberPermissionEvaluator.canChangeRole()` |
| DELETE | `/{teamId}/members/{userId}` | `@memberPermissionEvaluator.canDelete(#teamId)` |

---

#### PromptController — `/api/prompts`

| Método | Endpoint | Autorização |
|--------|----------|-------------|
| GET | `/` | `@promptPermissionEvaluator.canList()` |
| GET | `/{id}` | `@promptPermissionEvaluator.canView(#id)` |
| POST | `/` | `@promptPermissionEvaluator.canCreate(#promptInput)` |
| PUT | `/{id}` | `@promptPermissionEvaluator.canEdit(#id)` |

---

#### PromptVersionController — `/api/prompt-versions`

| Método | Endpoint | Autorização |
|--------|----------|-------------|
| GET | `/` | `@promptVersionPermissionEvaluator.canList()` |
| GET | `/{id}` | `@promptVersionPermissionEvaluator.canView(#id)` |
| POST | `/` | `@promptVersionPermissionEvaluator.canCreate(#input)` |
| PUT | `/{id}` | `@promptVersionPermissionEvaluator.canEdit(#id)` |
| PATCH | `/{id}/change-status` | `@promptVersionPermissionEvaluator.canEdit(#id)` |
| PATCH | `/{id}/change-visibility` | `@promptVersionPermissionEvaluator.canEdit(#id)` |

---

#### TagController — `/api/tags`

| Método | Endpoint | Autorização |
|--------|----------|-------------|
| GET | `/` | `@tagPermissionEvaluator.canList()` |
| GET | `/{id}` | `@tagPermissionEvaluator.canView(#id)` |
| POST | `/` | `@tagPermissionEvaluator.canCreate(#tagInput)` |
| PUT | `/{id}` | `@tagPermissionEvaluator.canEdit(#id)` |
| DELETE | `/{id}` | `@tagPermissionEvaluator.canDelete(#id)` |

---

## Sistema de Autorização

### Permission Evaluators

Cada recurso tem seu próprio `PermissionEvaluator`, um bean Spring referenciado nas expressões `@PreAuthorize`. Todos estendem `BasePermissionEvaluator`.

```
BasePermissionEvaluator
├── UserPermissionEvaluator    → @userPermissionEvaluator
├── TeamPermissionEvaluator    → @teamPermissionEvaluator
├── MemberPermissionEvaluator  → @memberPermissionEvaluator
├── PromptPermissionEvaluator  → @promptPermissionEvaluator
├── PromptVersionPermissionEvaluator → @promptVersionPermissionEvaluator
└── TagPermissionEvaluator     → @tagPermissionEvaluator
```

`BasePermissionEvaluator` fornece métodos auxiliares reutilizáveis:

| Método | Descrição |
|--------|-----------|
| `isAdmin()` | Verifica se o usuário tem role ADMIN |
| `isAuthenticated()` | Verifica se há usuário logado |
| `isOwner(ownerId)` | Verifica se o usuário é dono do recurso |
| `isTeamMember(teamId)` | Verifica se o usuário pertence ao time |
| `hasTeamRole(teamId, role)` | Verifica role específica no time |
| `hasAnyTeamRole(teamId, roles...)` | Verifica qualquer uma das roles no time |
| `checkPermission(validation)` | Executa validação com fallback automático para ADMIN |
| `canAccessResource(ownerId, teamId, roles...)` | Verifica acesso por ownership ou role no time |

### Roles do Sistema

**Roles Globais (GlobalRole)**
| Role | Descrição |
|------|-----------|
| `ADMIN` | Acesso total, ignora todas as restrições de time |
| `USER` | Usuário comum, acesso restrito por times |

**Roles de Time (TeamRole)**
| Role | Descrição |
|------|-----------|
| `TEAM_OWNER` | Gerencia membros, edita e deleta prompts do time |
| `DEV` | Cria e edita prompts do time |
| `VIEWER` | Apenas leitura |

### Fluxo de Autorização

```
Requisição HTTP
    ↓
JwtAuthFilter → valida token → popula SecurityContext
    ↓
@PreAuthorize → avalia expressão ANTES do método executar
    ↓
PermissionEvaluator.canXxx()
    ├── isAdmin()? → true → acesso liberado
    └── não é admin → canXxxAsUser() → verifica ownership ou role no time
    ↓
true  → método executa → 200 OK
false → método bloqueado → 403 Forbidden
```

---

## Filtros Dinâmicos com Specifications

Cada módulo tem um par `Search` + `Specification`:

- `XxxSearch` — DTO com os campos de filtro recebidos via query string
- `XxxSpecification` — implementa `BaseSpecification` e constrói o `Specification<Entity>` com JPA Criteria API

### UserContextEnricherAspect

Aspecto AOP que intercepta automaticamente todos os controllers e enriquece os objetos `UserContextAware` (implementados pelos `Search` DTOs) com o `userId` e `teamIds` do usuário logado.

Isso garante que usuários comuns vejam apenas recursos acessíveis a eles, sem precisar passar esses filtros manualmente. Admins não recebem esses filtros — veem tudo.

```java
// Antes do controller executar, o aspecto injeta:
search.setCurrentUserId(userId);
search.setAccessibleTeamIds(teamIds);
// A Specification usa esses valores para filtrar a query
```

---

## Entidades do Domínio

```
Auditable (base)
├── User          → username, email, password, role (ADMIN/USER), status
├── Team          → name, description, status
├── TeamUser      → team_id, user_id, role (TEAM_OWNER/DEV/VIEWER)
├── Prompt        → team_id XOR owner_id, name, description, tags
├── PromptVersion → prompt_id, version, content, status, visibility, author_id
├── PromptHistory → prompt_version_id, old_status, new_status, author_id
├── PromptDependency → prompt_id, depends_on_prompt_id, min_version
└── Tag           → name, slug, description
```

Todas as entidades estendem `Auditable`, que adiciona `createdAt` e `updatedAt` automaticamente.

Entidades com exclusão lógica usam `@SQLRestriction("status <> 'DELETED'")`:
- `User`, `Team`, `PromptVersion`

### Regra de negócio: Prompt de equipe vs. pessoal

Um prompt pertence **exclusivamente** a um time **ou** a um usuário — nunca os dois, nunca nenhum. Isso é garantido tanto no banco (constraint `CHECK`) quanto no `PromptValidator`.

---

## Banco de Dados

Schema: `dbo` (PostgreSQL)

**Migrations Flyway**
| Versão | Conteúdo |
|--------|----------|
| V1.0.0 | Schema `dbo`, extensão `unaccent` |
| V1.1.0 | Tabelas `users`, `teams`, `team_users` |
| V1.2.0 | Tabelas `prompts`, `prompt_versions`, `prompt_history`, `prompt_dependencies` |
| V1.3.0 | Tabelas `tags`, `prompt_tags` |

---

## Tratamento de Erros

`CustomException` é a exceção padrão do projeto. Carrega `HttpStatus` e `message`, e é lançada em qualquer camada.

```java
throw CustomException.badRequest("Nome já existe");
throw CustomException.notFound("Prompt não encontrado");
throw CustomException.builder().httpStatus(HttpStatus.FORBIDDEN).message("Sem permissão").build();
```

O `GlobalExceptionHandler` captura todas as exceções e retorna respostas padronizadas:

```json
{
  "code": 400,
  "message": "Nome já existe"
}
```

---

## Frontend

Localizado em `frontend/`, é uma SPA simples em HTML/CSS/JS vanilla.

- `index.html` — estrutura com telas (login, explorar, dashboard) e modais
- `styles.css` — estilos responsivos com breakpoint em 768px
- `app.js` — lógica de navegação, chamadas à API e renderização dinâmica

As tabs do dashboard são renderizadas dinamicamente conforme o perfil do usuário logado (ADMIN vê mais opções que USER).

> Os dados ainda estão parcialmente mockados em `MOCK_DATA`. A integração completa com o backend está em andamento.
