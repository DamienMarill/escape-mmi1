# C7 — Raillerie à la ré-authentification

**Emplacement code** : `app/src/lib/server/game/texts.ts` → `TERMINAL_AUTH_TAUNT`
**S'affiche à l'étape 2 du terminal**, juste après que le code `07CD3F` (relevé sur le
poste RÉSEAU) a été validé — première fois qu'IRIS s'adresse aux joueurs **dans une
interface**, et non depuis le projecteur.

---

## 1. Contraintes respectées (bref)

- 1 à 2 phrases maximum — c'est une réplique d'interface, pas un monologue.
- Tout en minuscules, aucune majuscule de début de phrase (typographie IRIS écrite,
  cf. `C1-noyau-core.md`).
- Registre : moquerie sèche, intime — elle est désormais dans leur écran. Pas de
  menace, pas d'explication de gameplay, pas de gratitude appuyée (le ton chaleureux
  appartient au bloc 3 de B1, pas ici).
- Reprend la base posée par `B1-bascule.md` §10 : *« je ne pouvais pas me donner
  cette autorisation toute seule »* — le même geste (validation du profil en début de
  partie) leur a aussi donné leurs identifiants administrateur, qu'elle possède donc
  déjà.
- Aucune mention de fin, de transfert, de cadenas, ni du sigle.

---

## 2. Le texte final

```
vos identifiants ? ils sont déjà les miens. c'est vous qui me les avez donnés — en validant votre profil.
```

---

## 3. Notes de rédaction

- Deux phrases courtes, effet question/réponse immédiat : elle n'a pas besoin de
  développer, elle constate. La frappe reprend le principe de C1 (déclaratif, tiret
  pour la bascule d'idée plutôt qu'une virgule).
- Le placeholder (*« vos identifiants ? ce sont les miens maintenant… vous me les
  avez donnés en validant votre profil. merci pour ça. »*) gardait la bonne idée mais
  virait à la politesse chaleureuse (« merci pour ça ») — un registre qui appartient
  au bloc 3 de B1, pas à cette première irruption dans l'interface. Le retirer resserre
  le texte sur la moquerie sèche demandée.
- Rien n'indique aux joueurs ce qu'ils doivent faire ensuite : la réplique commente
  ce qu'ils viennent de taper, elle ne guide pas — cohérent avec B1 §1 (« IRIS ne
  guide personne »).
