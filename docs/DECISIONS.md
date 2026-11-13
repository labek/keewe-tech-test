# Décisions

> À compléter. Réponds aux trois questions ci-dessous, puis note les règles floues que tu as tranchées.

## 1. Verrouillage

Quelle stratégie as-tu choisie et pourquoi ? Qu'est-ce qui casse si on l'enlève ?

Voici ma stratégie :

### Validation

Voici ce que toutes les choses que j'ai pris en compte dans ma validation :

1. Existence des wallets
2. Wallets utilisant la même devise
3. Clé d'idempotence présente et non-utilisée
4. Fonds suffisants sur le compte débiteur

### Virements

Pour la création du virement (`transfer`) en soi, pour garder la donnée consistente et fail-proof :

1. J'ai opté pour une transaction SQL pour toutes les opérations (clé d'idempotence, mise à jour des soldes des deux wallets, créations des transferts)
2. J'ai également lock en `UPDATE` les deux wallets avant la vérification/màj de leurs soldes pour anticiper des cas de race conditions

## 2. Idempotence

Comment stockes-tu les clés ? Que se passe-t-il si le serveur tombe entre l'enregistrement de la clé et la fin du virement ? Combien de temps gardes-tu une clé ?

Pour la clé d'idempotence, j'ai opté pour une table `idempotency_key` dédiée.

Cette dernière a les colonnes suivantes:

- `id` : ID représentant la clé d'idempotence
- `fingerprint` : hash SHA256 unique du `payload` envoyé pour faire un virement.

Dans un cas d'évolution, on pourrait faire en sorte que l'API puisse renvoyer une erreur si la même clé a un fingerprint différent (cf. [ressource](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Idempotency-Key)).

En cas de crash du serveur à tout moment du requête, aucun problème comme la création de la clé, la vérification/màj des soldes des wallets et les créations des virements (`transfers`) ont été mis dans une seule et unique transaction PSQL.
Cela garantit la consistence et la fiabilité des données.

Pour la conservation des clés, aucun standard n'existe. Par exemple, Stripe les conserve 24h (cf. [ressource](https://docs.stripe.com/api/idempotent_requests)), tandis que cela varie par service pour AWS.

Pour nous, je pense que 24h serait une bonne base et comme les champs avec un index TTL n'existe pas en PostgreSQL contrairement à MongoDB, on pourrait envisager de mettre en place un CRON tournant quotidiennement qui supprimerait les clés trop anciennes en se basant sur le champ `created_at`.

## 3. Arbitrages

Qu'as-tu laissé de côté, et que ferais-tu avec une journée de plus ?

Voici ce que j'ai laissé de côté :

- Certains tests unitaires et d'intégration de domaine `idempotency key` et `wallet` par manque de temps. Ayant passé beaucoup plus de temps que nécessaire sur le cas pratique, j'ai préféré me concentrer sur l'essentiel en testant davantage la partie `transfer`
- La partie monitoring/observabilité qui est super important à tout CBS

Si j'avais eu une journée de plus, je me serai concentré sur le monitoring je pense.

## Règles tranchées

| Question                                | Mon choix                                                                                                                 | Pourquoi                                  |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| Solde calculé de la somme des entries ? | Solde calculé à chaque virement                                                                                           | Plus simple et moins lourd en computation |
| Statut de chaque virement ?             | Ajout d'une colonne `status` au virement avec une valeur précise (ex : `CREATED`, `PENDING`, `EXECUTED`, `REJECTED`, etc) | Facilite le monitoring et le debugging    |

## Usage de l'IA

Pour quoi faire, et ce que tu as corrigé derrière elle.

J'avoue que je l'ai très peu utilisée et l'utilise très peu au quotidien par manque d'habitude.
Je l'ai principalement utilisée pour :

- L'auto-complétion dans le code et les tests
- La génération de la collection Postman avec les requêtes testant chaque critère d'acceptation
- Une aide pour savoir comment lock le wallet pour éviter l'update pendant la vérification/màj de son solde
