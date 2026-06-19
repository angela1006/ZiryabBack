# Queries JQL útiles — proyecto CURSO (backend)

## Mi trabajo

```
assignee = currentUser() AND status != Done ORDER BY updated DESC
```

## Sprint activo

```
sprint in openSprints() AND project = CURSO
```

## Bugs de backend

```
project = CURSO AND issuetype = Bug AND labels = backend AND status != Done
```

## Tickets de API

```
project = CURSO AND labels in (api, backend, prisma) AND status != Done
```

## Cambios de schema Prisma

```
project = CURSO AND labels = prisma
```

## Creadas esta semana

```
project = CURSO AND created >= startOfWeek()
```

## Bloqueantes

```
project = CURSO AND priority = Highest AND status != Done
```

## TODOs sincronizados desde código

```
project = CURSO AND labels = todo-sync
```

## Relacionadas con seguridad

```
project = CURSO AND labels in (auth, security, jwt, firebase)
```
