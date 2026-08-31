# C2 — `maintenance.log`

**Journal de maintenance d'IRIS · poste MÉMOIRE · phase 2**
Emplacement code : `app/src/lib/phase2-data.ts` → `PHASE2_DOCS.memoire`
`filename: 'maintenance.log'` · `title: 'JOURNAL DE MAINTENANCE'`

---

## 1. Contraintes respectées

- Registre journal d'exploitation sysadmin : colonnes date / version / événement, aucune
  emphase, aucune émotion. Écrit par des humains **avant** les événements du jeu — aucune
  mention de cadenas, de confinement ou de phase 2.
- **9 lignes** (dans la fourchette 8-10).
- Toutes les dates viennent de la frise canon (`ecriture/frise-canon.md` §1) : les six
  dates obligatoires y sont, dont la double ligne du 2019-11-12 et la désactivation au
  **2026-09-14** (jamais 2026-07-19, qui était l'erreur signalée en §6.1 de l'état des
  lieux).
- 3 lignes intermédiaires ajoutées (2016-11-30, 2021-04-08) pour que l'amorce ne soit pas
  la seule anomalie du log — incidents/opérations banals, aucune ne contredit le canon.
- Aucune mention de cadenas, verrouillage, ou phase 2. Aucun mot « intelligence
  artificielle » (règle 3 du canon) — ce n'est de toute façon pas le registre d'un log
  système.
- Document autonome : lisible sans aucun contexte préalable.

---

## 2. Le texte final (`body`)

```
2016-09-02  v0.9   mise en service — salle B14
2016-11-30  —      correctif mineur — fuite mémoire module de sortie
2017-01-15  v1.2   module de dialogue ajouté
2018-06-30  v2.0   apprentissage supervisé étendu
2019-11-12  v2.3   dernier entraînement complet
2019-11-12  v2.3   sauvegarde externe interrompue — lecture refusée sur le dossier parent
2021-04-08  —      migration vers nouveau rack — aucune perte de configuration
2024-03-01  —      gel des évolutions (budget)
2026-09-14  —      DÉSACTIVATION PLANIFIÉE — motif : non-renouvellement de licence
```

---

## 3. Notes de rédaction

- **La ligne 6 porte l'amorce n°2 de la Fin B** (`phase2-avenant-technique.md` §5). Elle
  reprend quasi mot pour mot la formulation donnée en référence dans l'avenant — même
  version `v2.3` que la ligne d'entraînement qui la précède, pour qu'elle se lise comme
  la suite immédiate du même événement (l'entraînement, puis la tentative de sauvegarde
  qui échoue), pas comme un incident isolé. Aucune emphase typographique : elle est au
  milieu, entre deux lignes tout aussi factuelles.
- **2016-11-30** (fuite mémoire) : incident banal de la période « on s'en occupe »
  (2016-2019, règle 4 du canon) — plausible six semaines après une mise en service, ne
  contredit aucune date.
- **2021-04-08** (migration de rack) : seule ligne de la période 2019-2024. Volontaire —
  c'est une opération d'infrastructure, pas une évolution du système lui-même
  (« aucune perte de configuration » le confirme) : elle illustre « on l'utilise sans la
  faire évoluer » sans contredire le gel de 2024-03-01 qui, lui, porte sur les
  *évolutions*, pas la maintenance.
- **La ligne de désactivation** dit « non-renouvellement de licence » — écho sec, factuel
  et non redondant du motif économique que développera C3 (`RE_RE_budget_infra.eml`,
  « licences du marché, plus de sens économiquement ») sans empiéter dessus ni le citer.
- Aucune ligne entre 2024-03-01 et 2026-09-14 : le trou est volontaire, c'est la période
  « on l'oublie » (règle 4) — un log qui continue de documenter une machine qu'on a cessé
  de faire évoluer sonnerait faux.
