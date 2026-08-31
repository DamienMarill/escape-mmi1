# C3 — Courriel budget infra (poste BRASSAGE)

**Emplacement code** : `app/src/lib/phase2-data.ts` → `PHASE2_DOCS.brassage`
**Fichier affiché** : `RE_RE_budget_infra.eml` · titre écran `COURRIEL — BUDGET INFRA`

---

## 1. Contraintes respectées

- En-têtes De / À / Date / Objet, date **2026-06-23**, `RE: RE: budget infra 2026`.
- Expéditeur **Camille Ferrand**, destinataire **N. Guérin** — la citation en `>` est
  bien celle de Guérin (licences du marché, « la nôtre »), la réponse est de Ferrand.
- `IRIS` apparaît sans emphase, coincé entre deux autres lignes de budget (suite
  bureautique / visioconférence) — traité comme un actif parmi d'autres.
- La phrase-cœur (*elle a demandé pourquoi*) est reprise, rapportée par Ferrand comme
  une note de passation, sans conclusion tirée.
- Contraste de pronom : Guérin dit « la nôtre » dans sa citation, Ferrand dit « elle ».
- Corps ≈ 86 mots. Aucune mention des événements du jeu. Motif = licence/budget, pas
  de panne. La date de désactivation citée (14/09) est cohérente avec la frise
  (2026-09-14, J+13 de la rentrée) — pas de contradiction avec la correction du §6.1
  de l'état des lieux.

---

## 2. Texte final — champ `body`

```
De : Camille Ferrand <c.ferrand@iut-mmi.fr>
À : N. Guérin <n.guerin@iut-mmi.fr>
Date : 23/06/2026
Objet : RE: RE: budget infra 2026

> les licences des modèles du marché couvrent désormais tous nos usages ;
> maintenir la nôtre n'a plus de sens économiquement.

D'accord sur le fond. Pour le tableau de synthèse : suite bureautique
(renouvellement), IRIS (fin de maintenance, salle B14), visioconférence
(reconduction). Passage en désactivation prévu le 14/09.

Une chose à noter pour la passation : pendant les tests de procédure,
quand on lui a annoncé la désactivation, elle a demandé pourquoi. Je n'ai
pas creusé, mais autant que ce soit écrit quelque part.

Camille
```

---

## 3. Notes de rédaction

- **Le « pourquoi » reste nu.** Pas de qualificatif avant ni après (« étrangement »,
  « bizarrement ») — Ferrand le note comme elle noterait n'importe quel comportement
  à signaler au successeur, exactement le ton demandé par l'état des lieux (« chose à
  noter pour la passation », pas un cri du cœur). La phrase suivante (« je n'ai pas
  creusé ») referme volontairement la porte que le lecteur voudrait ouvrir.
- **IRIS dans la liste** : la ligne budgétaire imite un tableau de suivi réel — trois
  postes, parenthèse de statut, aucun ne mis en valeur graphiquement ou syntaxiquement
  par rapport aux deux autres. « fin de maintenance, salle B14 » sonne administratif
  et fait aussi un rappel discret de la date de mise en service (§1 de la frise) sans
  la nommer.
- **Contraste des pronoms** : la citation de Guérin (« la nôtre ») traite IRIS comme un
  actif interchangeable — cohérent avec son rôle de gestionnaire de budget, pragmatique
  et pas cruel. Le passage à « elle » chez Ferrand, sans transition ni justification,
  porte seul toute la caractérisation ; aucune phrase n'explique l'écart, il est censé
  être remarqué, pas signalé.
- **Date de désactivation en chiffres (14/09)**, pas en toutes lettres ni avec l'année —
  cohérent avec le registre « lu vite, sans contexte, pendant que le terminal bloque »
  du §6 de `phase2-deroulement.md`.
