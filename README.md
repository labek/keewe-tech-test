# Keewe · Ledger de wallets

Repo de départ du cas pratique **Payer un autre client Keewe depuis son wallet**. L'énoncé est dans [TICKET.md](docs/TICKET.md).

## Ce que contient le repo

- Une app **NestJS 12** en **TypeScript 6** (ESM), lintée et formatée par **Biome**.
- **Prisma 7** sur PostgreSQL, avec un schéma qui contient les wallets et leurs mouvements ([prisma/ledger.prisma](prisma/ledger.prisma)), une migration initiale et un seed en EUR et en USD.
- **Vitest** et **Testcontainers** : les tests d'intégration tournent sur un vrai PostgreSQL jetable, construit par les migrations.

Deux routes de lecture existent : `GET /wallets/:walletId` (le wallet et son solde) et `GET /wallets/:walletId/entries` (ses mouvements). Le reste de l'API fait partie du ticket.

## Prérequis

- Node.js 26 (voir `.nvmrc`)
- Docker, pour PostgreSQL en local et pour les tests

## Lancer le projet

```bash
npm install
cp .env.example .env
npm run db:up
npx prisma migrate deploy
npm run db:seed
npm run start:dev
```

La documentation Swagger de l'API est sur <http://localhost:3000/api>.

`npm run db:down` arrête PostgreSQL et supprime ses données. `npm run db:reset` repart d'une base neuve : il la supprime, la recrée, applique les migrations et relance le seed.

### Données du seed

| Client             | `holderId`                             | Wallet                                 | Devise | Solde     |
| ------------------ | -------------------------------------- | -------------------------------------- | ------ | --------- |
| Boulangerie Martin | `01970000-0000-7000-8000-000000000001` | `01970000-0000-7000-8000-0000000000a1` | EUR    | 15 000,00 |
| Boulangerie Martin | `01970000-0000-7000-8000-000000000001` | `01970000-0000-7000-8000-0000000000a2` | USD    | 2 000,00  |
| Atelier Durand     | `01970000-0000-7000-8000-000000000002` | `01970000-0000-7000-8000-0000000000b1` | EUR    | 2 500,00  |
| Studio Nova        | `01970000-0000-7000-8000-000000000003` | `01970000-0000-7000-8000-0000000000c1` | EUR    | 0,00      |
| Studio Nova        | `01970000-0000-7000-8000-000000000003` | `01970000-0000-7000-8000-0000000000c2` | USD    | 5 000,00  |

Le solde n'est pas stocké : c'est la somme des crédits moins la somme des débits du wallet dans la table `entry`, où chaque montant est positif. Chaque solde non nul vient ici d'un dépôt, donc d'un crédit. Ces dépôts viennent de l'extérieur de Keewe (SEPA entrant) et n'ont pas de contrepartie dans le ledger : ils sont hors périmètre. Les montants sont des entiers en unités mineures (`1050` = 10,50 EUR), stockés en `BigInt`.

## Lancer les tests

Docker doit tourner. Il n'est pas nécessaire de démarrer la base locale.

```bash
npm test                   # tous les tests
npm run test:unit          # tests unitaires, sans base
npm run test:integration   # tests d'intégration sur PostgreSQL
npm run check              # Biome, typage et tests : ce que la CI lancerait
```

Le premier run télécharge l'image `postgres:18`. Le mécanisme est décrit dans [src/shared/\_\_test\_\_](src/shared/__test__) :

1. `database.global-setup.ts` démarre un seul conteneur PostgreSQL par run et y applique les migrations dans une base modèle.
2. `database.setup.ts` donne à chaque worker Vitest sa copie de cette base, et vide toutes les tables avant chaque test.

Un test part donc toujours d'une base vide et prépare lui-même ses données, par exemple avec `givenWallet` ([src/ledger/\_\_test\_\_/wallet.fixtures.ts](src/ledger/__test__/wallet.fixtures.ts)). Le solde passé à `givenWallet` devient un mouvement de dépôt. Pour un test end-to-end, l'application démarre depuis `AppModule` : voir [application-startup.e2e-spec.ts](src/shared/__test__/application-startup.e2e-spec.ts).

| Niveau                                                 | Suffixe                 | Projet Vitest |
| ------------------------------------------------------ | ----------------------- | ------------- |
| Unitaire, sans infrastructure                          | `*.spec.ts`             | `unit`        |
| Intégration : un adapter, sur la vraie base            | `*.integration-spec.ts` | `integration` |
| End-to-end : l'application démarrée depuis `AppModule` | `*.e2e-spec.ts`         | `integration` |

## Structure

```txt
prisma/
├── schema.prisma          générateur et datasource
├── ledger.prisma          le schéma du bounded context ledger (schéma PostgreSQL `ledger`)
├── migrations/            migrations commitées : jamais modifiées une fois appliquées
└── seed.ts
src/
├── main.ts                bootstrap : démarre l'application, rien d'autre
├── app.module.ts          assemble les bounded contexts
├── shared/                technique uniquement : client Prisma, configuration, mise en place des tests
└── ledger/                le bounded context ledger
    ├── ledger.module.ts   son wiring
    ├── domain/            Wallet, Entry et le port WalletRepository
    ├── application/       WalletService : les cas d'usage
    ├── driven/            PrismaWalletRepository : l'adapter Prisma du port
    ├── driving/           WalletController : l'API HTTP
    └── __test__/          les tests end-to-end du contexte, et leurs fixtures
```

La structure du contexte ledger est un point de départ, pas une contrainte. Le modèle de départ est volontairement minimal. Tu peux faire évoluer le schéma Prisma comme tu veux : `npm run db:migrate -- --name <nom>` crée la migration, à commiter avec le changement.

## Conventions

- **ESM** : les imports relatifs prennent l'extension `.js` (`import { X } from './x.js'`).
- **Validation** : un `ValidationPipe` global, déclaré dans `SharedModule`, valide les bodies avec `class-validator` et rejette les champs inconnus. Il s'applique aussi aux tests end-to-end.
- **Montants dans l'API** : des chaînes de caractères en unités mineures (`"1050"`), en entrée comme en sortie, pour ne rien perdre d'un `BigInt`.
- **Code généré** : le client Prisma vit dans `src/shared/driven/prisma/generated/`. Il n'est pas commité et `npm install` le régénère (`npx prisma generate` après un changement de schéma).
- **Lint** : `npm run lint` doit passer sans erreur, et `npm run lint:fix` corrige le formatage.

## Documentation

- [TICKET.md](docs/TICKET.md) : l'énoncé
- [DECISIONS.md](docs/DECISIONS.md) : tes choix, à compléter
- [docs/ledger/glossary.md](docs/ledger/glossary.md) : le langage du contexte ledger
