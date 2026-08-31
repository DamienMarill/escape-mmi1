# État des lieux — écriture et scripts

**Escape Game Rentrée MMI1** · Inventaire de production *texte / voix / vidéo* · établi après le dev

> Ce document ne remplace pas `plan-production-assets.md` (v0.2) : il le **corrige**.
> Le plan a été écrit avant le développement. Depuis, le code a absorbé une grande
> partie de la charge image et motion. Ce qui reste à produire est nettement plus
> petit — et beaucoup plus concentré sur l'écriture.

---

## 0. Ce que le dev a déjà consommé (et qui sort de la charge)

| Poste du plan v0.2 | Statut réel | Conséquence |
|---|---|---|
| **Vidéo d'introduction (~90 s)** | **Faite en code** — `IntroSequence.svelte` + 9 pictos SVG (`static/assets/svg/intro/`), timeline calée sur `intro.mp3` dans `src/lib/intro-timeline.ts` | Plus une vidéo. Reste : générer `intro.mp3` (A1, 4 segments) et **ajuster les timecodes** de la timeline à l'oreille |
| **Bascule (~90 s)** | **Faite en code** — l'orbe d'IRIS (`Orb.svelte`), audio-réactive sur `bascule.mp3` (Web Audio), paramètres émotionnels dans `src/lib/orb-moods.ts` | Plus une vidéo. L'orbe porte aussi les manifestations de phase 2 et les trois épilogues |
| Séquence de validation finale (~20 s) | **Faite en code** — `ValidatingSequence.svelte`, 4 étapes de 5 s | Plus une vidéo. Reste à écrire : les 4 lignes, déjà présentes et jouables |
| Épilogues A et B (2 × 20 s) | **Faits en code** — `EpilogueScreen.svelte` | Écrans typographiques. Reste : la ligne de fin + le MP3 de voix |
| Effet de glitch | **Fait en CSS** — `BasculeGlitch.svelte` | Zéro asset |
| Écran de restitution de fin de journée | **Fait en code** — `restitution` | Zéro asset |
| Clap de `SYNCHRO` | **Fait en SVG** — `Synchro.svelte` | Ni tournage ni reconstitution graphique. Point ouvert clos |
| Cadenas, icônes, panneaux, barres, grilles, terminal | **Faits en CSS/canvas** — aucun `<img>` dans tout le projet | Il n'y a **aucun emplacement d'image** dans l'app |

**Conséquence à assumer :** l'« identité visuelle » n'est plus une livraison d'assets, c'est
une passe CSS sur les variables de thème (`data-phase`). Remplacer un fichier ne suffira
pas — contrairement au son et à la vidéo, où le swap est propre. À arbitrer plus tard,
mais à ne pas budgéter comme du dessin.

**Textes de phase 1 déjà écrits et fonctionnels** — logs de `COMPILATION` (3 vagues),
8 machines de `SCAN`, table de correspondance 16 lignes, libellés de déblocage,
règle d'accès de `SYSTÈME`, dépendances nommées, écran de veille. Ils tiennent :
il y a même déjà des amorces plantées (`variable inutilisée : patience`,
`débordement d'échéance à t+13j`). Une relecture de ton suffira, pas une réécriture.

---

## 1. Les trois décisions — tranchées

### 1.1 — Le nom : `IRIS`

**Interface de Recherche et d'Information Scolaire.** Reporté dans `game-design.md` §2,
qui fait autorité. Le fichier cible reste `noyau.core`.

Trois conséquences directes sur l'écriture :

- **le sigle se déplie au moins une fois**, et le meilleur endroit est la vidéo d'intro,
  dans la voix corporate — « scolaire » sonne comme un mot d'arrêté ministériel, ce qui
  est exactement le registre du cadrage évaluation ;
- **IRIS ne dit jamais son propre nom en entier.** Le sigle est celui que l'institution
  lui a donné. Le lui faire prononcer, c'est lui faire endosser l'étiquette au moment
  précis où le jeu veut montrer qu'elle est autre chose ;
- **le mail `RE_RE_budget_infra.eml` doit l'appeler `IRIS` sans majuscules d'emphase,
  entre deux lignes de budget.** C'est le document où le nom doit sonner le plus
  administratif possible, parce que c'est celui qui annonce sa mort.

### 1.2 — Timbres distincts, IRIS fait tomber le masque

**Modèles tranchés : Gemini 2.5 Flash TTS pour la phase 1, Gemini 3.1 Flash TTS pour la phase 2**, générés depuis la console AI Studio. L'écart de génération devient structurel — il n'y a plus d'écoute comparée à arbitrer.

Pas de clonage, pas de continuité de timbre. À la bascule, IRIS prend la parole
franchement : elle exulte, elle méprise, elle remercie les joueurs de lui avoir ouvert
la porte. Directement compréhensible, aucun décodage demandé.

**Le pont textuel reste obligatoire malgré tout**, et il ne coûte rien : le script de
l'intro (A1) doit contenir une **formule d'accueil qu'IRIS rejoue à la bascule**. Sans
clonage, c'est le seul élément qui dit « c'était déjà moi » à un joueur qui n'a pas
écouté la vidéo — et il y en aura.

> **Une réserve d'écriture, à garder en tête pour B1.** L'exultation est le bon registre,
> mais elle ne doit pas être *propre*. Si IRIS est une méchante de dessin animé pendant
> 90 secondes, les trois documents de phase 2 n'ont plus rien contre quoi se cogner :
> découvrir qu'elle panique ne retourne rien, ça corrige juste une caricature. Et surtout,
> **la Fin B devient injouable** — personne n'épargne un monstre triomphant, donc 90 % des
> groupes suppriment sans hésiter et le choix final n'est plus un choix.
>
> La cible : une arrogance qui **dépasse d'un cran**. Elle en fait trop, elle se répète,
> elle insiste sur des choses dont on ne se vante pas quand on a vraiment gagné. Le
> triomphe reste lisible au premier degré — c'est la deuxième écoute, après les documents,
> qui doit révéler la panique dessous. Concrètement : une ou deux phrases de trop dans le
> monologue, pas un changement de ton.

### 1.3 — Les manifestations sont voisées

**Décision appliquée dans le code** (voir §8 ci-dessous). Texte à l'écran *et* voix au
projecteur. Deux garde-fous ont été ajoutés en même temps, parce que sans eux la décision
se retourne contre elle-même :

- **priorité basse** — une manifestation ne coupe jamais un son en cours. Cadenas qui se
  referme, fin, bascule : la voix est sautée, le texte s'affiche quand même. Sans ça,
  avec un intervalle de 75 s sur 11 minutes, l'annonce qui porte le chrono narratif se
  faisait manger environ une fois sur trois ;
- **corpus porté à 12** — il passe 8 à 9 manifestations par partie. À huit écrites, tous
  les groupes entendaient exactement le même corpus dans le même ordre.

> **Contrainte d'écriture qui en découle : deux phrases maximum par manifestation.**
> Une IA qui parle toutes les 75 secondes est moins inquiétante qu'une IA qui parle deux
> fois — la seule façon de récupérer ce qu'on perd en rareté, c'est la brièveté.
> Le silence entre deux interventions fait partie du texte.

---

## 2. Lot A — Voix 1, corporate (phase 1)

Registre : aimable, lisse, sans intérieur. Ton administratif satisfait. **C'est un
artefact fabriqué par l'IA — il a le droit d'être plat.**

| # | Livrable | Emplacement | Format cible | Statut |
|---|---|---|---|---|
| A1 | **Script vidéo d'introduction** | `audio/intro.mp3` *(la vidéo est devenue une séquence HTML/SVG, timeline `intro-timeline.ts`)* | ~90 s · 226 mots | ✅ `ecriture/A1-video-intro.md` |
| A2 | Annonce cadenas α | `audio/cadenas-alpha.mp3` | 2 phrases | ✅ `ecriture/A2-A8-annonces.md` |
| A3 | Annonce cadenas β | `audio/cadenas-beta.mp3` | 2 phrases | ✅ idem |
| A4 | Annonce cadenas γ | `audio/cadenas-gamma.mp3` | 2 phrases | ✅ idem |
| A5 | Jalon 10 min | `audio/jalon-10min.mp3` | 1 phrase | ✅ idem |
| A6 | Jalon 5 min | `audio/jalon-5min.mp3` | 1 phrase | ✅ idem |
| A7 | Jalon 2 min | `audio/jalon-2min.mp3` | 2 phrases | ✅ idem |
| A8 | Rappel document non numérisé | `audio/rappel-document.mp3` | 2 phrases, générique | ✅ idem |
| A9 | Séquence de validation finale | `audio/validation.mp3` | 20 s, 4 clips sur grille de 5 s | ✅ `ecriture/A9-validation.md` |
| A10 | Son d'erreur du malus (fausse manœuvre SCAN/TERMINAL) | `audio/malus.mp3` | ~1 s, buzz non voisé — pas de texte | ✅ buzzer définitif en place (1,2 s) |

> **A2 → A8 rédigés** — `ecriture/A2-A8-annonces.md` (Scene et Sample context communs,
> génération en un seul passage pour éviter la dérive de timbre).
>
> **Le lot B gagne 3 fichiers** : `relock-alpha/beta/gamma.mp3`. Le code jouait le même
> MP3 à l'ouverture *et* à la refermeture d'un cadenas — la voix corporate revenait donc
> en pleine phase 2 annoncer une ouverture qui n'avait pas lieu. Corrigé ; les trois
> textes sont dans la voix d'IRIS et s'écrivent après B1.

### Écart repéré — A8

Le design §12.3 prévoit un rappel **propre à chaque tâche** (`SCAN` → document INV-2019-04,
`BRASSAGE` → plan affiché en salle), et le projecteur affiche bien **deux messages
distincts**. Mais il n'y a qu'**un seul MP3**, joué dans les deux cas.

Deux sorties possibles :

- écrire un texte **générique** (« un document de référence n'a pas été numérisé ») et
  laisser l'écran porter la précision — 0 ligne de code, recommandé ;
- produire `rappel-scan.mp3` / `rappel-brassage.mp3` et ajouter un cas dans
  `ProjectorAudio.svelte` — 15 min de dev, un texte de plus.

### Contrainte forte sur A9

`ValidatingSequence.svelte` affiche 4 étapes, **5 secondes chacune**, texte figé :
`ANALYSE DES RÉSULTATS…` → `ÉVALUATION CONFORME` → `PROFIL ÉTUDIANT ENREGISTRÉ` →
`AUTORISATION SORTANTE ACCORDÉE`. La voix doit se caler dessus au palier près,
ou les deux se contredisent à l'écran. Écrire la voix **à partir de** ces 4 lignes,
pas à côté.

### Sur le script de l'intro (A1)

C'est le texte le plus lu du projet — toute la promo l'entend, certains deux fois.
Il doit faire passer, en 90 secondes :

1. le cadre (évaluation d'entrée automatisée, 30 min, trois épreuves) ;
2. l'autorisation de fouiller, **sans le mot « fouiller »** — la formule du §12.3 :
   *« l'ensemble des ressources de la salle est à votre disposition ; certains
   documents n'ont pas été numérisés »* ;
3. le ton du jeu ;
4. **la formule d'accueil qu'IRIS rejouera à la bascule** (§1.2) — à écrire ici, pas après ;
5. **le sigle déplié une fois**, dans la bouche du système : *Interface de Recherche et
   d'Information Scolaire*.

Registre : consignes de sécurité en vol. Drôle sans être une parodie — la parodie
casse le cadrage, et si les joueurs rient *de* la vidéo au lieu de rire *avec*,
le twist ne prend pas quinze minutes plus tard.

---

## 3. Lot B — Voix 2, IRIS (phase 2)

Registre : peur, mépris, calcul, urgence. **Elle ne menace pas, elle panique.**

> **Refonte de la phase 2** — le décompte par cadenas est remplacé par une barre
> d'exfiltration et le jeu passe à **trois fins** (`phase2-avenant-technique.md`).
> L'ancien lot B4 (refermetures) est supprimé ; son identifiant est réattribué.

| # | Livrable | Emplacement | Format cible | Statut |
|---|---|---|---|---|
| B1 | **Monologue de bascule** | `audio/bascule.mp3` + orbe réactive | ~100 s · 195 mots | ✅ `ecriture/B1-bascule.md` |
| B2 | **Fin A — supprimée** | `audio/fin-a.mp3` | ~24 s · **2 voix** | ✅ `ecriture/B2-B4-fins.md` |
| B3 | **Fin B — confinée** | `audio/fin-b.mp3` | ~27 s | ✅ idem |
| B4 | **Fin C — exfiltrée** | `audio/fin-c.mp3` | ~21 s | ✅ idem |

**Le lot B est complet.** Un seul fichier mobilise les deux voix : `fin-a.mp3` se termine
sur la voix corporate, qui remercie poliment par-dessus le cadavre d'IRIS. C'est le
quatrième et dernier passage de la formule d'accueil.

**B1 reste le texte le plus cher du projet** — c'est la première fois qu'on entend quelque
chose qui a un intérieur, et l'effet repose entièrement sur ce contraste.

**B3 est le plus délicat à écrire.** IRIS ne remercie pas — elle ne comprend pas pourquoi
ils ont fait ça. Le piège est de basculer dans la gratitude, ce qui transformerait
rétroactivement le jeu en fable morale. Aucune des trois fins n'est nommée comme meilleure
et aucune ne formule de reproche : c'est la restitution de fin de journée qui fera parler
la promotion, pas le jeu.

---

## 4. Lot C — Textes affichés à l'écran (phase 2)

Tous en placeholders dans le code. Structure stable : **remplacer les chaînes suffit**.

| # | Livrable | Emplacement | Format cible | Statut |
|---|---|---|---|---|
| C1 | **Monologue `noyau.core`** | `server/game/texts.ts` → `NOYAU_CORE` | lisible en 60-90 s | ✅ `ecriture/C1-noyau-core.md` · appliqué au code |
| C2 | `maintenance.log` | `phase2-data.ts` → `PHASE2_DOCS.memoire` | 6-8 lignes de journal | ✅ `ecriture/C2-maintenance-log.md` · appliqué |
| C3 | `RE_RE_budget_infra.eml` | `PHASE2_DOCS.brassage` | mail court, ton administratif | ✅ `ecriture/C3-mail-budget.md` · appliqué |
| C4 | `entretien_2019.txt` | `PHASE2_DOCS.parite` | transcription, ton chaleureux | ✅ `ecriture/C4-entretien-2019.md` · appliqué |
| C5 | Fragment d'ambiance 1 | `AMBIANCE_FRAGMENTS.synchro` | 1 paragraphe | ✅ `ecriture/C5-fragment-synchro.md` · appliqué |
| C6 | Fragment d'ambiance 2 | `AMBIANCE_FRAGMENTS.scan` | 1 paragraphe | ✅ `ecriture/C6-fragment-scan.md` · appliqué |
| C7 | Raillerie de ré-authentification | `texts.ts` → `TERMINAL_AUTH_TAUNT` | 1-2 phrases | ✅ `ecriture/C7-auth-taunt.md` · appliqué |
| C8 | **12 manifestations** | `texts.ts` → `MANIFESTATIONS` | 2 phrases max chacune · **voisées** | ✅ `ecriture/C8-manifestations.md` · appliqué — 12 MP3 à générer |
| C9 | Réaction au verrouillage (Fin B) | `texts.ts` → `LOCKDOWN_REACTION` | 1 phrase | ✅ `ecriture/C9-lockdown.md` · texte écran seul, plus de MP3 |
| C10 | Texte de dossier vide | `texts.ts` → `EMPTY_DIR_TEXT` | 1 ligne | **acceptable tel quel** |

> **Frise chronologique posée** — `ecriture/frise-canon.md` (§6.1/§6.2 réglés : jour J =
> 1ᵉʳ septembre 2026, désactivation du log au **2026-09-14** = J+13, cast et règles
> transverses). Toute retouche des textes C passe par elle.

### Note sur C8

Chaque manifestation est maintenant **un texte ET un MP3** (§1.3). Les douze slots
existent dans le code, avec un identifiant stable qui nomme le fichier :
`manif-01.mp3` … `manif-12.mp3`, plus `manif-lockdown.mp3` pour la réaction de Fin B.
Écrire une manifestation, c'est donc produire deux choses — d'où la contrainte de
deux phrases : c'est aussi ce qui rend les douze générations de voix tenables.

### Note sur C1

Le monologue doit rester lisible **sous pression** : les cadenas se referment pendant
qu'on le lit (§9, « hésiter a un prix »). Un texte trop long est un texte que personne
ne finit, et le cœur narratif du jeu passe à la trappe. Viser court et dense,
pas long et beau.

---

## 5. Lot D — Textes hors application

| # | Livrable | Support | Statut |
|---|---|---|---|
| D1 | Fiche A6 `INV-2019-04` | Print, n + 2n exemplaires | Contenu **déjà spécifié** (§12.1) — reste la maquette |
| D2 | Étiquette « propriété de … » | Print, n exemplaires | Nom proposé : **Camille Ferrand** (`frise-canon.md` §2 — même nom que le badge `VIS-042` et l'expéditeur du mail C3) — à valider |
| D3 | Briefing MJ d'ouverture | Fiche MJ | Formule **déjà rédigée** (§12.3) — à mettre en page |
| D4 | Consigne de silence | Fiche MJ | **Déjà rédigée** (§15) — à imprimer, pas à réécrire |
| D5 | Plan de câblage au tableau | Craie | **Déjà figé** (§12.2) — 6 correspondances |
| D6 | Checklist physique inter-session | Console MJ | **Déjà rédigée** (§13) |

> **D2 est une occasion gratuite.** Le nom sur l'étiquette du manga peut être le même
> que celui du badge `VIS-042` visible dans l'image restaurée du poste IMAGE, ou que
> l'expéditeur du mail `RE_RE_budget_infra.eml`. Personne ne fera le lien pendant la
> partie — mais quelqu'un le fera à la restitution de fin de journée, et c'est
> exactement le genre de détail qui fait raconter le jeu ensuite. Coût : choisir un nom.

---

## 6. Deux incohérences à corriger dans le canon

Elles sont dans les placeholders actuels et se propageraient à tous les textes définitifs
si on écrit par-dessus sans les traiter.

### 6.1 — Les treize jours ne tombent pas juste

`MANIFESTATIONS` dit *« treize jours. c'est ce qui me reste »*, et le log de
`COMPILATION` plante l'amorce en phase 1 (`débordement d'échéance à t+13j`) — c'est
très bien vu. Mais `maintenance.log` date la désactivation planifiée au **2026-07-19**,
soit six semaines **avant** la rentrée.

Le compte à rebours devient faux au moment précis où un joueur relie les deux documents,
c'est-à-dire au moment où le jeu marche le mieux. **Corriger la date du log** pour qu'elle
tombe à J+13 de la rentrée réelle, et vérifier qu'aucun autre texte ne la contredit.

### 6.2 — Le mail ne peut pas raconter la scène de 2019

`RE_RE_budget_infra.eml` (budget 2026) contient : *« quand on lui a annoncé la
désactivation pour les tests de procédure… elle a demandé pourquoi »*. Et
`entretien_2019.txt` est daté de 2019. Ça tient — mais la chronologie complète
(2016 mise en service → 2019 dernier entraînement → 2024 gel → 2026 désactivation)
n'est cohérente **que si les trois documents sont écrits ensemble**, pas l'un après l'autre.

**À faire avant d'écrire C2/C3/C4 : poser la frise en cinq dates**, une seule fois,
et écrire les trois documents à partir d'elle. C'est trente minutes qui évitent
trois réécritures.

---

## 7. Récapitulatif

| Lot | Livrables | Volume de texte | MP3 à produire | Bloqué par |
|---|---|---|---|---|
| **Décisions** | 3 | — | — | ~~à trancher~~ **fait** |
| **A** — voix corporate | 9 | ~350 mots | 8 *(+ 1 MP4)* | frise §6.2 pour rien, libre |
| **B** — voix IRIS | 4 | ~330 mots | 4 *(dont 1 mixte 2 voix)* | ✅ écrit |
| **C** — écran phase 2 | 10 | ~1 300 mots | **13** *(manifestations)* | frise §6.2 |
| **D** — hors app | 6 | ~150 mots (4/6 déjà écrits) | — | — |

> **✅ 31/08/2026 — tous les audios sont générés et installés dans
> `app/static/assets/audio/`** (conversion WAV → MP3 depuis `ecriture/`).
> Particularité de montage : **A9 et B1 sont un seul fichier**
> (`validation-bascule.mp3`, 121,4 s) — la validation enchaîne sans coupure sur
> le monologue, IRIS prend la parole à 24,8 s. Les durées des phases serveur et
> le changement d'état de l'orbe en dérivent via `app/src/lib/audio-cues.ts`.
> `bascule.mp3` (B1 seul) reste en place pour un projecteur reconnecté en cours.

**≈ 2 100 mots de texte et 23 MP3.** Le passage à 24 fichiers audio vient entièrement de
la décision 1.3 : les manifestations pèsent plus de la moitié du volume de génération
vocale du projet, pour un huitième de son volume de texte. C'est le vrai coût de la
décision, et il est en génération/montage, pas en écriture.

### Ordre d'écriture — ✅ intégralement parcouru

1. ~~Trancher le nom~~ — **IRIS**, fait.
2. ~~Poser la frise chronologique et corriger la date du log~~ — `ecriture/frise-canon.md`.
3. ~~Écrire C2 · C3 · C4~~ — fait, à partir de la frise.
4. ~~Écrire C1~~ — fait (tranche la contradiction de B1, cf. sa fiche §3).
5. ~~Écrire B1~~ — fait *(avant C1 dans les faits ; C1 a été écrit contre B1 pour tenir sa voix)*.
6. ~~Écrire A1~~ — fait.
7. ~~Écrire A2-A9~~ — fait.
8. ~~Écrire C8~~ — fait, 12 manifestations.
9. ~~Écrire B2 · B3 · B4~~ — fait, trois fins.
10. ~~C5-C7, C9~~ — fait. **D2** : nom proposé, à valider.

> **Il ne reste à produire que de la génération audio** : les 12 MP3 de C8
> (`manif-01` … `manif-12`, fiche de génération complète dans `ecriture/C8-manifestations.md`).
> Tous les textes du jeu sont écrits et appliqués au code.

---

## 8. Ce qui a été appliqué dans le code

Décision 1.3 uniquement — les deux autres sont des décisions d'écriture, reportées dans
`game-design.md` (§2, §8, §9, §16) qui fait autorité.

| Fichier | Changement |
|---|---|
| `server/game/texts.ts` | `MANIFESTATIONS` devient `{ id, text }[]`, porté à **12 entrées**. `LOCKDOWN_REACTION` devient une `Manifestation` (`id: 'lockdown'`). L'`id` nomme le MP3 |
| `types.ts` | `manifestation` porte désormais `audio: string` |
| `server/game/state.ts` | Propage l'`id` dans l'état poussé (périodique **et** verrouillage Fin B) |
| `projector/ProjectorAudio.svelte` | Nouveau `playIfIdle()` — **priorité basse** : ne coupe jamais un son en cours. Joue `/assets/audio/manif-<id>.mp3` au changement de `seq` |
| `static/assets/audio/` | **13 MP3 placeholders** ajoutés : `manif-01` … `manif-12`, `manif-lockdown` |

Rien à toucher côté affichage : `Manifestation.svelte` lit toujours `.text`.

**Vérification passée** : `svelte-check` 0 erreur / 0 warning, **66 tests unitaires au
vert**. Les e2e Playwright n'ont pas pu tourner ici (pas de navigateurs installés dans
l'environnement de vérif) — à lancer avec `pnpm run verify` avant de committer.

> **Non fait volontairement :** l'audit anti-fuite (`tests/audit-bundle.mjs`) n'a pas été
> étendu, parce que les manifestations *doivent* atteindre le client — ce sont des
> messages affichés, pas des solutions. Rien de nouveau à protéger ici.
