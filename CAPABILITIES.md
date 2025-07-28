# 🚀 MRX-Core - Capacités et Fonctionnalités

> Une bibliothèque complète pour construire des microservices modernes avec TypeScript et Bun

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Modules de base](#modules-de-base)
  - [🗃️ Module Base de Données](#️-module-base-de-données)
  - [🌐 Plugins Elysia](#-plugins-elysia)
  - [📝 Module Logger](#-module-logger)
  - [🏛️ Module Repository](#️-module-repository)
  - [📊 Module Data](#-module-data)
  - [✉️ Module Mailer](#️-module-mailer)
  - [🔄 Store Redis](#-store-redis)
  - [🎯 Event System](#-event-system)
  - [🛠️ Utilitaires](#️-utilitaires)
  - [🔧 Singleton Manager](#-singleton-manager)
  - [⚠️ Gestion d'Erreurs](#️-gestion-derreurs)

---

## Vue d'ensemble

MRX-Core est une bibliothèque TypeScript complète conçue pour faciliter le développement de microservices robustes et typés. Elle fournit des abstractions de haut niveau pour les opérations courantes tout en maintenant la flexibilité et les performances.

### Caractéristiques principales

- ✅ **100% TypeScript** - Typage complet et sécurité à la compilation
- ⚡ **Optimisé pour Bun** - Performances maximales avec le runtime Bun
- 🏗️ **Architecture modulaire** - Utilisez uniquement ce dont vous avez besoin
- 🔒 **Type-safe** - API complètement typée pour éviter les erreurs
- 📦 **Prêt pour la production** - Gestion d'erreurs, logging, et monitoring intégrés

---

## Modules de base

### 🗃️ Module Base de Données

Le module de base de données offre une abstraction puissante pour interagir avec SQL Server (MSSQL) avec des fonctionnalités avancées.

#### Capacités principales

- **Connexion MSSQL typée** - Gestion automatique des connexions
- **Génération automatique de repositories** - CRUD automatique pour chaque table
- **Query Builder avancé** - Support d'opérateurs complexes
- **Streaming de données** - Traitement efficace de gros volumes
- **Gestion d'événements** - Émission d'événements pour les opérations DB

#### Opérateurs de requête supportés

```typescript
// Opérateurs de comparaison
$eq, $neq, $lt, $lte, $gt, $gte

// Opérateurs de collection
$in, $nin, $between, $nbetween

// Opérateurs de recherche textuelle
$like, $nlike

// Opérateurs de nullité
$isNull
```

#### Exemple d'utilisation

```typescript
import { MSSQL } from '@mrxsys/mrx-core/modules/database';

const mssql = new MSSQL({
  host: 'localhost',
  database: 'myapp',
  user: 'sa',
  password: 'password'
});

await mssql.connect();

// Récupération automatique du repository
const usersRepository = mssql.getRepository('users');

// Requête avec filtres avancés
const users = await usersRepository.find({
  where: {
    age: { $gte: 18 },
    name: { $like: 'John' },
    status: { $in: ['active', 'pending'] }
  },
  orderBy: [{ column: 'created_at', direction: 'desc' }],
  limit: 10
});
```

### 🌐 Plugins Elysia

Collection de plugins pour le framework web Elysia, permettant de créer rapidement des APIs REST robustes.

#### CRUD Plugin

Génère automatiquement des endpoints REST complets pour vos tables de base de données.

**Endpoints générés automatiquement :**
- `POST /` - Création d'enregistrements
- `GET /` - Liste avec filtres, tri et pagination
- `GET /:id` - Récupération par ID
- `PUT /:id` - Mise à jour par ID
- `DELETE /:id` - Suppression par ID
- `GET /count` - Comptage avec filtres

#### Schema Plugin

Génération automatique de schémas OpenAPI/Swagger pour vos endpoints.

#### Rate Limiting Plugin

Protection contre les abus avec limitation du taux de requêtes configurable.

**Fonctionnalités :**
- Limitation par IP avec fenêtre glissante
- Headers de rate limit automatiques
- Support Redis pour la scalabilité
- Configuration flexible des limites

**Headers ajoutés automatiquement :**
- `X-RateLimit-Limit` - Nombre maximum de requêtes autorisées
- `X-RateLimit-Remaining` - Requêtes restantes dans la fenêtre
- `X-RateLimit-Reset` - Temps en secondes avant reset

**Exemple :**
```typescript
import { ratelimitPlugin } from '@mrxsys/mrx-core/modules/elysia/ratelimitPlugin';
import { Redis } from '@mrxsys/mrx-core/modules/store';

const redis = new Redis({ host: 'localhost', port: 6379 });

const app = new Elysia()
  .use(ratelimitPlugin({
    max: 100,           // 100 requêtes max
    windowMs: 900000,   // Fenêtre de 15 minutes
    redis: redis.client, // Stockage Redis
    skipSuccessfulRequests: false,
    skipFailedRequests: true
  }));
```

#### JWT Plugin

Authentification et autorisation JWT intégrées avec validation automatique.

**Fonctionnalités :**
- Signature et vérification JWT avec la bibliothèque `jose`
- Gestion des secrets et algorithmes
- Middleware automatique de validation
- Support des claims personnalisés

**Exemple :**
```typescript
import { jwtPlugin } from '@mrxsys/mrx-core/modules/elysia/jwtPlugin';

const app = new Elysia()
  .use(jwtPlugin({ 
    secret: 'your-256-bit-secret',
    algorithm: 'HS256' 
  }))
  .post('/login', async ({ jwt, body }) => {
    // Validation utilisateur...
    const token = await jwt.sign({ 
      userId: user.id, 
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 heure
    });
    return { token };
  })
  .get('/protected', async ({ jwt, headers }) => {
    const payload = await jwt.verify(headers.authorization);
    return { user: payload };
  });
```

#### DB Resolver Plugin

Sélection dynamique de base de données basée sur les headers de requête.

**Fonctionnalités :**
- Connexion à différentes bases de données selon le contexte
- Header-based routing vers les bases de données
- Support de configurations multiples

**Exemple :**
```typescript
import { dbResolverPlugin } from '@mrxsys/mrx-core/modules/elysia/dbResolverPlugin';

const app = new Elysia()
  .use(dbResolverPlugin({
    'tenant-a': { host: 'db-tenant-a.com', database: 'tenant_a' },
    'tenant-b': { host: 'db-tenant-b.com', database: 'tenant_b' }
  }))
  .get('/users', ({ dynamicDB }) => {
    // La DB est sélectionnée automatiquement selon le header 'database-using'
    return dynamicDB.getRepository('users').find();
  });

// Headers: { 'database-using': 'tenant-a' }
```

#### Exemple d'utilisation

```typescript
import { Elysia } from 'elysia';
import { crudPlugin } from '@mrxsys/mrx-core/modules/elysia/crudPlugin';

const app = new Elysia()
  .use(crudPlugin({
    tableName: 'users',
    database: mssql,
    operations: {
      find: { enabled: true },
      findOne: { enabled: true },
      insert: { enabled: true },
      update: { enabled: true },
      delete: { enabled: true },
      count: { enabled: true }
    }
  }));

// Génère automatiquement toutes les routes CRUD pour la table 'users'
```

### 📝 Module Logger

Système de logging flexible et performant avec support multi-stratégies.

#### Capacités

- **Logging multi-stratégies** - Console, fichier, base de données, etc.
- **Niveaux de log typés** - error, warn, info, debug, log
- **Processing par stream** - Traitement asynchrone haute performance
- **Événements typés** - Émission d'événements pour les erreurs et la fin de logging
- **Queue de logs** - Gestion automatique des pics de charge

#### Exemple d'utilisation

```typescript
import { Logger } from '@mrxsys/mrx-core/modules/logger';

const logger = new Logger({
  console: new ConsoleStrategy(),
  file: new FileStrategy({ path: './logs/app.log' }),
  database: new DatabaseStrategy({ table: 'logs' })
});

// Logging avec stratégies multiples
logger.info('User login', { userId: 123, ip: '192.168.1.1' });
logger.error('Database error', { error: errorObject, context: 'user-service' });
```

### 🏛️ Module Repository

Pattern Repository générique offrant une abstraction puissante pour les opérations de données.

#### Fonctionnalités

- **CRUD complet** - Create, Read, Update, Delete
- **Queries complexes** - Filtres, tri, pagination
- **Streaming** - Support de gros volumes de données
- **Transformations** - Transformation automatique des données
- **Type safety** - Typage complet des entités

#### Opérations disponibles

```typescript
// Recherche avec options avancées
find(options?: QueryOptions)
findOne(options?: QueryOptions)
findById(id: string | number)

// Création et modification
insert(data: Partial<T> | Partial<T>[])
update(data: Partial<T>, options?: QueryOptions)
updateById(id: string | number, data: Partial<T>)

// Suppression
delete(options?: QueryOptions)
deleteById(id: string | number)

// Comptage
count(options?: QueryOptions)

// Streaming
stream(options?: QueryOptions): StreamWithAsyncIterable<T>
```

### 📊 Module Data

Utilitaires de manipulation et validation de données avec transformation automatique.

#### Capacités

- **Filtrage par clés** - Exclusion/inclusion de propriétés
- **Transformation de casse** - camelCase, snake_case, etc.
- **Validation de données** - Vérification de nullité et types
- **Nettoyage automatique** - Suppression des valeurs null/undefined

#### Exemple d'utilisation

```typescript
import { filterByKeyExclusion, transformObjectKeys } from '@mrxsys/mrx-core/modules/data';

// Filtrage de propriétés
const user = { id: 1, name: 'John', password: 'secret', email: 'john@example.com' };
const publicUser = filterByKeyExclusion(user, ['password']); // { id: 1, name: 'John', email: 'john@example.com' }

// Transformation de casse
const snakeCase = transformObjectKeys(user, 'snake_case'); // { user_id: 1, user_name: 'John' }
```

### ✉️ Module Mailer

Système d'envoi d'emails avec support SMTP configuré et typé.

#### Fonctionnalités

- **Configuration SMTP typée** - Options complètement typées avec Nodemailer
- **Pool de connexions** - Gestion automatique des connexions SMTP
- **Vérification de connexion** - Validation automatique de la configuration
- **Gestion d'erreurs** - Gestion complète des erreurs avec CoreError
- **Support SSL/TLS** - Configuration sécurisée

#### Exemple d'utilisation

```typescript
import { SMTP } from '@mrxsys/mrx-core/modules/mailer';

const smtp = new SMTP({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true pour port 465, false pour les autres ports
  credentials: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  },
  pool: {
    maxConnections: 5,
    maxMessages: 100
  }
});

// Connexion et vérification
await smtp.connect();

// Envoi d'email simple
await smtp.sendMail({
  from: '"App Name" <noreply@yourapp.com>',
  to: 'user@example.com',
  subject: 'Bienvenue !',
  text: 'Bienvenue dans notre application !',
  html: '<h1>Bienvenue dans notre application !</h1>'
});

// Envoi en masse
const emails = users.map(user => ({
  from: '"App Name" <noreply@yourapp.com>',
  to: user.email,
  subject: 'Newsletter',
  template: 'newsletter',
  context: { name: user.name }
}));

for (const email of emails) {
  await smtp.sendMail(email);
}

// Déconnexion propre
smtp.disconnect();
```

### 🔄 Store Redis

Intégration Redis pour le cache et le stockage de sessions.

#### Capacités

- **Connexion Redis typée** - Configuration complète avec IoRedis
- **Client Redis exposé** - Accès direct au client pour opérations avancées
- **Opérations CRUD** - Get, Set, Delete avec TTL
- **Pub/Sub** - Support des patterns publish/subscribe
- **Clustering** - Support Redis Cluster

#### Exemple d'utilisation

```typescript
import { Redis } from '@mrxsys/mrx-core/modules/store';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'your-password',
  db: 0,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3
});

// Accès au client Redis pour toutes les opérations
const client = redis.client;

// Cache avec TTL
await client.setex('user:123', 3600, JSON.stringify(userData));
const cachedUser = await client.get('user:123');

// Pub/Sub
await client.subscribe('notifications');
client.on('message', (channel, message) => {
  console.log(`Received on ${channel}: ${message}`);
});

// Opérations avancées
await client.zadd('leaderboard', 100, 'user1', 85, 'user2');
const topUsers = await client.zrevrange('leaderboard', 0, 9, 'WITHSCORES');
```

### 🎯 Event System

Système d'événements typé basé sur l'EventEmitter Node.js.

#### TypedEventEmitter

- **Événements typés** - Typage complet des payloads d'événements
- **Type safety** - Vérification à la compilation
- **API familière** - Compatible avec EventEmitter standard

#### Exemple d'utilisation

```typescript
import { TypedEventEmitter } from '@mrxsys/mrx-core/modules/typedEventEmitter';

interface MyEvents {
  userCreated: [{ userId: number; email: string }];
  userDeleted: [{ userId: number }];
  error: [{ error: Error; context: string }];
}

class UserService extends TypedEventEmitter<MyEvents> {
  async createUser(userData: any) {
    const user = await this.repository.insert(userData);
    this.emit('userCreated', { userId: user.id, email: user.email });
    return user;
  }
}
```

### 🛠️ Utilitaires

Collection d'utilitaires pour les tâches courantes.

#### Validation d'environnement

```typescript
import { validateEnv } from '@mrxsys/mrx-core/utils';

const config = validateEnv({
  DATABASE_URL: { required: true, type: 'string' },
  PORT: { required: false, type: 'number', default: 3000 },
  DEBUG: { required: false, type: 'boolean', default: false }
});
```

#### Utilitaires de date

```typescript
import { isDateString } from '@mrxsys/mrx-core/utils';

const isValid = isDateString('2023-12-25'); // true
const isValid2 = isDateString('invalid-date'); // false
```

#### Utilitaires de stream

```typescript
import { makeStreamAsyncIterable } from '@mrxsys/mrx-core/utils';

const stream = makeStreamAsyncIterable(readableStream);
for await (const chunk of stream) {
  console.log(chunk);
}
```

### 🔧 Singleton Manager

Gestionnaire de singletons pour maintenir une seule instance d'objets à travers l'application.

#### Fonctionnalités

- **Gestion automatique** - Création et réutilisation d'instances
- **Type safety** - Support TypeScript complet
- **Lifecycle management** - Contrôle du cycle de vie des singletons

### ⚠️ Gestion d'Erreurs

Système complet de gestion d'erreurs avec traçabilité et codes HTTP automatiques.

#### CoreError

Classe d'erreur personnalisée avec fonctionnalités avancées :

- **UUID unique** - Chaque erreur a un identifiant unique (UUIDv7)
- **Clé d'erreur** - Système de clés pour l'internationalisation
- **Code HTTP** - Mapping automatique vers les codes de statut HTTP
- **Cause tracking** - Traçabilité de la cause racine
- **Horodatage** - Date et heure de l'erreur

#### Error Plugin (Elysia)

Plugin de gestion d'erreurs pour les applications Elysia :

- **Gestion automatique** - Capture et formatage des erreurs
- **Réponses standardisées** - Format JSON cohérent
- **Codes de statut** - Mapping automatique des codes HTTP
- **Validation errors** - Gestion spéciale des erreurs de validation

#### Exemple d'utilisation

```typescript
import { CoreError } from '@mrxsys/mrx-core/error';
import { errorPlugin } from '@mrxsys/mrx-core/modules/elysia/errorPlugin';

// Création d'une erreur typée
throw new CoreError({
  key: 'user.not_found',
  message: 'Utilisateur introuvable',
  httpStatusCode: 404,
  cause: { userId: 123 }
});

// Utilisation du plugin d'erreur
const app = new Elysia()
  .use(errorPlugin)
  .get('/user/:id', ({ params }) => {
    const user = getUserById(params.id);
    if (!user) {
      throw new CoreError({
        key: 'user.not_found',
        message: 'Utilisateur introuvable',
        httpStatusCode: 404,
        cause: { userId: params.id }
      });
    }
    return user;
  });

// Réponse JSON automatique en cas d'erreur :
// {
//   "key": "user.not_found",
//   "message": "Utilisateur introuvable",
//   "cause": { "userId": 123 }
// }
```

---

## 🎯 Cas d'usage principaux

### 1. API REST complète avec authentification

```typescript
import { Elysia } from 'elysia';
import { MSSQL } from '@mrxsys/mrx-core/modules/database';
import { crudPlugin } from '@mrxsys/mrx-core/modules/elysia/crudPlugin';
import { jwtPlugin } from '@mrxsys/mrx-core/modules/elysia/jwtPlugin';
import { ratelimitPlugin } from '@mrxsys/mrx-core/modules/elysia/ratelimitPlugin';
import { errorPlugin } from '@mrxsys/mrx-core/modules/elysia/errorPlugin';
import { microservicePlugin } from '@mrxsys/mrx-core/modules/elysia/microservicePlugin';
import { Redis } from '@mrxsys/mrx-core/modules/store';

// Configuration base de données
const db = new MSSQL({
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});
await db.connect();

// Configuration Redis pour le rate limiting
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: parseInt(process.env.REDIS_PORT || '6379')
});

const app = new Elysia()
  // Plugins globaux
  .use(errorPlugin)
  .use(microservicePlugin)
  .use(jwtPlugin({ secret: process.env.JWT_SECRET }))
  .use(ratelimitPlugin({
    max: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    redis: redis.client
  }))
  
  // APIs CRUD automatiques
  .group('/api/v1', app => app
    .use(crudPlugin({ tableName: 'users', database: db }))
    .use(crudPlugin({ tableName: 'products', database: db }))
    .use(crudPlugin({ tableName: 'orders', database: db }))
  )
  
  .listen(3000);

console.log('🚀 API disponible sur http://localhost:3000');
// Endpoints automatiquement créés :
// POST   /api/v1/users      - Créer utilisateur
// GET    /api/v1/users      - Lister utilisateurs (avec filtres)
// GET    /api/v1/users/:id  - Récupérer utilisateur
// PUT    /api/v1/users/:id  - Modifier utilisateur
// DELETE /api/v1/users/:id  - Supprimer utilisateur
// GET    /api/v1/users/count - Compter utilisateurs
```

### 2. Microservice avec logging avancé et événements

```typescript
import { Logger } from '@mrxsys/mrx-core/modules/logger';
import { TypedEventEmitter } from '@mrxsys/mrx-core/modules/typedEventEmitter';
import { SMTP } from '@mrxsys/mrx-core/modules/mailer';

// Définition des événements typés
interface OrderEvents {
  orderCreated: [{ orderId: string; userId: string; total: number }];
  orderProcessed: [{ orderId: string }];
  orderFailed: [{ orderId: string; error: string }];
  paymentReceived: [{ orderId: string; amount: number }];
}

class OrderService extends TypedEventEmitter<OrderEvents> {
  private logger = new Logger({
    console: new ConsoleStrategy(),
    file: new FileStrategy({ path: './logs/orders.log' }),
    database: new DatabaseStrategy({ connection: db })
  });

  private mailer = new SMTP({
    host: 'smtp.gmail.com',
    credentials: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  async createOrder(orderData: OrderData) {
    try {
      this.logger.info('Création commande démarrée', { 
        userId: orderData.userId,
        total: orderData.total 
      });

      // Création en base
      const order = await this.repository.insert(orderData);
      
      // Émission d'événement
      this.emit('orderCreated', {
        orderId: order.id,
        userId: order.userId,
        total: order.total
      });

      this.logger.info('Commande créée avec succès', { orderId: order.id });
      return order;

    } catch (error) {
      this.logger.error('Échec création commande', { 
        error: error.message,
        userId: orderData.userId 
      });
      
      this.emit('orderFailed', {
        orderId: 'pending',
        error: error.message
      });
      
      throw error;
    }
  }

  async processOrder(orderId: string) {
    const order = await this.repository.findById(orderId);
    
    // Traitement métier...
    await this.processPayment(order);
    await this.updateInventory(order);
    
    // Notification par email
    await this.mailer.sendMail({
      to: order.customerEmail,
      subject: 'Commande confirmée',
      template: 'order-confirmation',
      context: { order }
    });

    this.emit('orderProcessed', { orderId });
    this.logger.info('Commande traitée', { orderId });
  }
}

// Utilisation avec gestion d'événements
const orderService = new OrderService();

orderService.on('orderCreated', async ({ orderId, userId, total }) => {
  await orderService.processOrder(orderId);
  await analyticsService.trackEvent('order_created', { userId, total });
});

orderService.on('orderFailed', async ({ orderId, error }) => {
  await notificationService.alertOps('order_failure', { orderId, error });
});
```

### 3. Traitement de données en streaming avec cache Redis

```typescript
import { Redis } from '@mrxsys/mrx-core/modules/store';

// Configuration cache Redis
const redis = new Redis({
  host: 'localhost',
  port: 6379,
  keyPrefix: 'myapp:',
  retryDelayOnFailover: 100
});

// Service de traitement de gros volumes
class DataProcessingService {
  async processLargeDataset(filters: any) {
    const cacheKey = `dataset:${JSON.stringify(filters)}`;
    
    // Vérification cache
    const cached = await redis.client.get(cacheKey);
    if (cached) {
      this.logger.info('Données servies depuis le cache');
      return JSON.parse(cached);
    }

    // Stream de données depuis la DB
    const repository = this.db.getRepository('large_table');
    const dataStream = repository.stream({
      where: filters,
      orderBy: [{ column: 'created_at', direction: 'asc' }]
    });

    const results = [];
    let processedCount = 0;

    // Traitement par chunks
    for await (const batch of dataStream) {
      const processedBatch = await this.processDataBatch(batch);
      results.push(...processedBatch);
      
      processedCount += batch.length;
      this.logger.info('Batch traité', { 
        count: batch.length, 
        total: processedCount 
      });

      // Mise à jour du cache intermédiaire
      if (processedCount % 1000 === 0) {
        await redis.client.setex(
          `${cacheKey}:partial`,
          300, // 5 minutes
          JSON.stringify(results)
        );
      }
    }

    // Cache final
    await redis.client.setex(
      cacheKey,
      3600, // 1 heure
      JSON.stringify(results)
    );

    return results;
  }

  private async processDataBatch(batch: any[]) {
    // Transformation et enrichissement des données
    return batch.map(item => ({
      ...item,
      processed: true,
      enrichedAt: new Date(),
      computedField: this.computeValue(item)
    }));
  }
}
```

---

## ⚡ Performance et optimisations

### Caractéristiques de performance

- **Runtime Bun** - Jusqu'à 3x plus rapide que Node.js pour les I/O
- **Streaming natif** - Traitement efficace de gros volumes sans limite mémoire
- **Connection pooling** - Gestion optimisée des connexions DB et Redis
- **Query optimization** - Requêtes SQL optimisées avec Knex.js
- **Type-safe à runtime zéro** - Typage compile-time sans overhead

### Optimisations intégrées

```typescript
// Cache automatique avec TTL
const cachedData = await repository.find({
  where: { status: 'active' },
  cache: { ttl: 300, key: 'active-users' }
});

// Streaming pour gros volumes
const largeDataset = repository.stream({
  where: { created_at: { $gte: lastWeek } },
  batchSize: 1000 // Traitement par lots de 1000
});

// Pool de connexions optimisé
const db = new MSSQL({
  pool: {
    min: 2,
    max: 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000
  }
});
```

---

## 🔗 Écosystème et intégrations

### Compatibilité

- **TypeScript 5.8+** - Support complet des dernières fonctionnalités
- **Bun runtime** - Optimisé pour les performances maximales  
- **Elysia 1.3+** - Framework web ultra-rapide
- **SQL Server** - Base de données entreprise via Knex.js
- **Redis** - Cache et sessions avec IoRedis
- **JWT** - Authentification avec la bibliothèque JOSE

### Intégrations tierces

```typescript
// OpenAPI/Swagger automatique
import swagger from '@elysiajs/swagger';

const app = new Elysia()
  .use(swagger({
    documentation: {
      info: { title: 'Mon API', version: '1.0.0' }
    }
  }))
  .use(crudPlugin({ tableName: 'users', database: db }));
// Documentation auto-générée sur /swagger

// Monitoring et observabilité  
import { Logger } from '@mrxsys/mrx-core/modules/logger';

const logger = new Logger({
  prometheus: new PrometheusStrategy(),
  datadog: new DatadogStrategy({ apiKey: process.env.DD_API_KEY }),
  elasticsearch: new ElasticsearchStrategy()
});

// Health checks
app.get('/health', () => ({
  status: 'healthy',
  timestamp: new Date(),
  uptime: process.uptime(),
  memory: process.memoryUsage()
}));
```

---

## 🚀 Démarrage rapide

### Installation

```bash
# Installer Bun (si pas déjà fait)
curl -fsSL https://bun.sh/install | bash

# Créer un nouveau projet
mkdir mon-microservice && cd mon-microservice
bun init

# Installer MRX-Core
bun add @mrxsys/mrx-core

# Installer les dépendances peer
bun add elysia @sinclair/typebox knex mssql ioredis jose nodemailer typescript
```

### Configuration minimale

Créer `.env` :
```env
DB_HOST=localhost
DB_NAME=myapp
DB_USER=sa
DB_PASSWORD=yourpassword
JWT_SECRET=your-256-bit-secret
REDIS_HOST=localhost
REDIS_PORT=6379
```

Créer `src/index.ts` :
```typescript
import { Elysia } from 'elysia';
import { MSSQL } from '@mrxsys/mrx-core/modules/database';
import { crudPlugin } from '@mrxsys/mrx-core/modules/elysia/crudPlugin';
import { jwtPlugin } from '@mrxsys/mrx-core/modules/elysia/jwtPlugin';
import { errorPlugin } from '@mrxsys/mrx-core/modules/elysia/errorPlugin';
import { microservicePlugin } from '@mrxsys/mrx-core/modules/elysia/microservicePlugin';
import { validateEnv } from '@mrxsys/mrx-core/utils';

// Validation environnement
const env = validateEnv({
  DB_HOST: { required: true, type: 'string' },
  DB_NAME: { required: true, type: 'string' },
  DB_USER: { required: true, type: 'string' },
  DB_PASSWORD: { required: true, type: 'string' },
  JWT_SECRET: { required: true, type: 'string' },
  PORT: { required: false, type: 'number', default: 3000 }
});

// Configuration base de données
const db = new MSSQL({
  host: env.DB_HOST,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD
});

await db.connect();

// Application Elysia
const app = new Elysia()
  .use(errorPlugin)
  .use(microservicePlugin)
  .use(jwtPlugin({ secret: env.JWT_SECRET }))
  .use(crudPlugin({ tableName: 'users', database: db }))
  .listen(env.PORT);

console.log(`🚀 Microservice démarré sur le port ${env.PORT}`);
```

Démarrer l'application :
```bash
bun run src/index.ts
```

### Endpoints disponibles

Une fois démarré, votre microservice expose automatiquement :

- `GET /ping` - Health check
- `GET /info` - Informations du service  
- `POST /users` - Créer utilisateur
- `GET /users` - Lister utilisateurs (avec filtres avancés)
- `GET /users/:id` - Récupérer utilisateur par ID
- `PUT /users/:id` - Modifier utilisateur
- `DELETE /users/:id` - Supprimer utilisateur
- `GET /users/count` - Compter utilisateurs

### Exemple de requêtes

```bash
# Health check
curl http://localhost:3000/ping

# Créer un utilisateur
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John Doe", "email": "john@example.com"}'

# Lister avec filtres
curl "http://localhost:3000/users?name[$like]=John&age[$gte]=18&$limit=10"

# Compter les utilisateurs actifs
curl "http://localhost:3000/users/count?status[$eq]=active"
```

---

## 📚 Prochaines étapes

### Développement avancé

1. **Explorez les modules** - Découvrez chaque module en détail
2. **Personnalisez les repositories** - Étendez les repositories avec votre logique métier
3. **Ajoutez des middlewares** - Créez des middlewares personnalisés avec Elysia
4. **Configurez le logging** - Mettez en place un système de logging robuste
5. **Implémentez l'authentification** - Sécurisez vos APIs avec JWT

### Production

1. **Monitoring** - Intégrez Prometheus, DataDog ou autres outils de monitoring
2. **Documentation** - Générez automatiquement la documentation OpenAPI/Swagger  
3. **Tests** - Écrivez des tests d'intégration avec Bun Test
4. **CI/CD** - Automatisez le déploiement avec GitHub Actions
5. **Scaling** - Configurez la mise à l'échelle horizontale

### Ressources

- **Documentation** - Consultez la documentation complète de chaque module
- **Exemples** - Explorez les exemples d'implémentation dans `/examples`
- **Tests** - Analysez les tests d'intégration pour des cas d'usage avancés
- **Community** - Rejoignez la communauté MRX Systems pour le support

---

## 🎯 Conclusion

MRX-Core vous permet de construire rapidement des microservices robustes et performants avec TypeScript et Bun. Grâce à son architecture modulaire et ses abstractions de haut niveau, vous pouvez vous concentrer sur votre logique métier plutôt que sur la plomberie technique.

**Commencez petit** avec quelques modules de base, puis ajoutez progressivement les fonctionnalités avancées selon vos besoins. MRX-Core grandit avec votre application, du prototype à la production à grande échelle.

---

*Développé avec ❤️ par l'équipe MRX Systems*