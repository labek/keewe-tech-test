# Glossaire · ledger

| Terme         | Code        | Définition                                                                                           |
| ------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| Wallet        | `Wallet`    | Le compte d'un client dans une devise. Un client détient au plus un wallet par devise.               |
| Client        | `holderId`  | L'entreprise cliente de Keewe qui détient le wallet.                                                 |
| Devise        | `currency`  | Le code ISO 4217 de la monnaie d'un wallet : `EUR`, `USD`.                                           |
| Solde         | `balance`   | La somme des crédits moins la somme des débits d'un wallet, en unités mineures. Il n'est pas stocké. |
| Mouvement     | `Entry`     | Une ligne qui crédite ou débite un wallet d'un montant positif.                                      |
| Sens          | `direction` | `CREDIT` augmente le solde, `DEBIT` le diminue.                                                      |
| Unité mineure | `minor`     | La plus petite unité d'une devise : `1050` = 10,50 EUR.                                              |
