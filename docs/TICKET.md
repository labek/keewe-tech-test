# Cas pratique · Ledger de wallets

## Comment ça se passe

Tu rejoins l'équipe Ledger le temps d'une demi-journée. Ton PM t'a assigné le ticket ci-dessous. Traite-le comme tu le ferais chez nous, en 3 à 4 h.

L'IA est autorisée et même encouragée. Utilise les outils avec lesquels tu travailles au quotidien. Le volume de code ne nous intéresse pas. On regarde comment tu comprends le besoin et comment tu justifies tes choix.

Comme dans la vraie vie, le ticket ne dit pas tout. Quand une règle est floue, tranche et note ton choix dans le `DECISIONS.md`. Si tu manques de temps, coupe dans le périmètre plutôt que dans la qualité, et écris ce que tu as coupé.

## Payer un autre client Keewe depuis son wallet

> En tant que trésorier d'une PME cliente de Keewe, je veux virer de l'argent depuis mon wallet vers le wallet d'un autre client Keewe, afin de payer mes fournisseurs instantanément, sans passer par un virement SEPA.

### Contexte

Chaque client détient un wallet par devise. Beaucoup de nos clients se paient entre eux, et ils attendent un paiement immédiat.

Nos plus gros clients déclenchent leurs paiements par lots via l'API. Des dizaines de virements peuvent partir en même temps du même wallet.

Le réseau n'est pas fiable. Quand une requête tombe en timeout, notre front et les intégrations de nos clients la renvoient. Pour reconnaître une demande déjà reçue, le front envoie un identifiant unique par demande de virement, dans le header `Idempotency-Key`.

Keewe prépare son agrément d'établissement de monnaie électronique. La conformité veut voir, pour chaque virement, le débit d'un côté et le crédit du même montant de l'autre. Un mouvement passé ne doit jamais être modifié ni supprimé.

### Critères d'acceptation

1. Un virement débite un wallet source et crédite un wallet destination de la même devise. Les deux soldes sont à jour dès la réponse.
2. Un wallet ne peut jamais être débité au-delà de son solde, même quand plusieurs virements en partent au même moment.
3. Si une demande arrive deux fois, le virement n'est exécuté qu'une fois et l'appelant reçoit la même réponse les deux fois. Même si les deux demandes arrivent en même temps.
4. Un identifiant de demande réutilisé pour un virement différent est refusé.
5. Deux clients qui se paient l'un l'autre au même moment voient leurs deux virements aboutir.
6. Un virement entre deux devises différentes est refusé.
7. Pour chaque virement, la conformité retrouve le débit et le crédit du même montant. Un mouvement passé ne peut être ni modifié ni supprimé.

### Pas dans ce ticket

La création de wallets (ils existent déjà), l'authentification, le front, la conversion de devises, les frais. L'appelant est considéré comme autorisé à débiter le wallet source.

## Ce que l'équipe tech te fournit

Ce repo. Il contient déjà :

- une app NestJS 12 en TypeScript 6, avec Biome pour le lint et le formatage ;
- Prisma, avec un schéma qui contient les wallets et leurs mouvements, et un seed en EUR et en USD ;
- Testcontainers, qui démarre un vrai PostgreSQL pour les tests d'intégration Vitest.

Tu peux faire évoluer le schéma Prisma comme tu veux. Le solde n'est pas stocké : il se calcule à partir des mouvements. Tu peux changer ce modèle, par exemple stocker le solde, si tu le justifies dans `DECISIONS.md`. Le design de l'API est à ta main. Les montants sont des entiers en unités mineures (`1050` = 10,50 EUR). Dans l'API, ils circulent en chaîne de caractères (`"1050"`), en entrée comme en sortie. Le code rendu doit passer Biome sans erreur.

## Ce que tu nous rends

Un lien vers ton repo, avec deux choses :

1. Le code, et des tests d'intégration qui prouvent les critères d'acceptation.

2. Un `DECISIONS.md` qui répond aux trois questions qu'il contient.

## Le débrief

On en parle ensemble pendant 45 minutes. Tu nous présentes ton code et tes choix.
