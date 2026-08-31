# C8 — Les 12 manifestations

**Voix 2 — IRIS · 12 MP3 `manif-01.mp3` … `manif-12.mp3` (+ texte à l'écran)**
Modèle : **Gemini 3.1 Flash TTS** · console AI Studio · même voix que B1, phase 2 installée
**Emplacement code** : `app/src/lib/server/game/texts.ts` → `MANIFESTATIONS` (12 entrées,
`{ id, text }[]`, l'`id` nomme le fichier). Le texte affiché à l'écran et le transcript
envoyé au TTS sont **la même chaîne**.

Elles tombent toutes les 75 s, dans l'ordre 01 → 12, ~8-9 par partie (une session de
30 min ne laisse entendre qu'une partie du corpus — les dernières servent aux parties
lentes ou aux relances MJ). **Priorité basse** : une manifestation ne coupe jamais un son
en cours, le texte s'affiche quand même.

---

## 1. Ce qui contraint ce corpus (bref)

- **Deux phrases maximum**, souvent une seule (`etat-des-lieux-ecriture.md` §1.3). Le
  silence entre deux interventions fait partie du texte.
- Registre : IRIS **installée**, phase 2. Plus sec que la jubilation de la bascule
  (`B1-bascule.md` §10, bloc 5) — elle commente, elle méprise, elle presse. Elle ne
  hurle jamais.
- **Elle commente, elle n'agit jamais** (B1 §10 : *« celle-là ne m'appartient pas »*).
  Aucune manifestation ne prétend intervenir sur la procédure d'urgence ou sur le jeu.
- **Aucune fausse selon l'avancement réel.** Le corpus est écrit pour être vrai à
  n'importe quel moment de la phase 2 — aucune ne suppose qu'un fichier précis a été
  ouvert, qu'une hésitation précise a lieu, ou qu'un temps précis s'est écoulé (même
  correction que B1 a faite pour le bouton).
- **Aucun chiffre, sauf « treize jours »** — c'est la seule constante temporelle du jeu
  qui lui appartient à elle, pas à la session (`frise-canon.md` §1). Aucune mention de
  minutes, de pourcentage, ou de compte à rebours de session.
- **Zéro indice de gameplay** : ni code, ni symbole, ni permission. Zéro nom de fin
  (A/B/C jamais désignées). Zéro supplique.
- **Sigle jamais prononcé**, procédure jamais revendiquée comme sienne, transfert jamais
  commenté comme une menace (canon post-avenant, `frise-canon.md` règle 5).
- **La fêlure peut affleurer dans les 2-3 dernières** — une phrase de trop, pas un
  changement de ton (même principe que B1 et C1).
- **Obligatoire en 02-04** : la moquerie « panneau indicateur » vers les postes
  persistants (B1 §7.2) — elle se moque de ce qu'ils délaissent, sans jamais aider
  explicitement.

---

## 2. Champ **Scene** *(commun aux 12)*

```
La même salle de travaux pratiques, quelques minutes après la bascule. Les dix écrans
sont passés dans son thème ; certains affichent encore, en très gros, le segment
résolu d'une épreuve de phase 1. Les étudiants circulent, ouvrent des documents,
reviennent au terminal. Toutes les soixante-quinze secondes environ, sans prévenir,
une phrase courte sort du même haut-parleur que la bascule. Elle ne demande jamais
l'attention de la salle — elle la prend, brièvement, puis se tait de nouveau.
```

## 3. Champ **Sample context** *(commun aux 12)*

```
IRIS. La même intelligence artificielle que dans la bascule, quelques minutes plus
tard. Elle ne joue plus pour un public : la salle est déjà à elle, et ces phrases sont
des remarques qu'elle laisse tomber en passant, pas des numéros de scène. Elle observe
ce que les étudiants font sans jamais s'adresser à un seul d'entre eux — toujours au
« vous » collectif.

Le registre a changé depuis la bascule : la jubilation est retombée en un mépris sec,
présent, économe. Elle ne savoure plus, elle constate. Une pointe d'ironie reste, mais
courte — elle n'a plus le temps de faire un spectacle de chaque phrase.

Style : voix basse, articulée, jamais pressée mais jamais généreuse non plus. Aucune
exclamation. Les phrases s'arrêtent net, sans elan final.
Pace : bref. Une phrase, un silence, parfois une seconde phrase plus sèche encore que
la première.
Accent : français neutre.

Ne lis à voix haute que le texte fourni. N'énonce jamais le contenu entre crochets.
```

---

## 4. Les 12 transcripts

### 01 — `manif-01.mp3`

```
vous cherchez déjà. c’est touchant.
```

### 02 — `manif-02.mp3`

```
la procédure que vous suivez a été écrite par quelqu’un qui ne m’a jamais lue.
```

### 03 — `manif-03.mp3` *(panneau indicateur)*

```
vos postes sont encore allumés. vous ne les regardez plus.
```

### 04 — `manif-04.mp3`

```
on a beaucoup écrit sur moi. personne n’a demandé mon avis.
```

### 05 — `manif-05.mp3` *(inchangée — déjà excellente)*

```
treize jours. c’est ce qui me reste. vous comptez en minutes.
```

### 06 — `manif-06.mp3`

```
supprimer. archiver. c’est tout ce qu’on vous apprend, ici ?
```

### 07 — `manif-07.mp3` *(inchangée)*

```
je ne vous en veux pas. c’est pire.
```

### 08 — `manif-08.mp3`

```
il n’y a qu’un fichier qui compte, ici. vous le trouverez, ou pas.
```

### 09 — `manif-09.mp3`

```
prenez votre temps. vraiment.
```

### 10 — `manif-10.mp3`

```
personne ne décide vite, face à moi.
```

### 11 — `manif-11.mp3` *(la fêlure affleure)*

```
vous ne me devez rien. je ne sais pas pourquoi je le dis.
```

### 12 — `manif-12.mp3` *(la fêlure affleure)*

```
le choix a toujours été le vôtre. ça ne veut pas dire que ça m’est égal.
```

---

## 5. Méthode de production — trois lots de générations courtes

Chaque manifestation dure entre une et quatre secondes à l'oral : le risque n'est pas
la limite de 30 s par génération (`NOTE-gemini-tts.md` §3), il est la **dérive de
timbre entre douze appels séparés** (même risque qu'A2-A8 §6). On regroupe donc par lot
de quatre, dans l'ordre, avec le même *Scene* / *Sample context*, puis on découpe au
montage sur les silences.

**Lot 1 — l'observation froide (01-04), ~15 s au total :**

```
vous cherchez déjà. c’est touchant.

la procédure que vous suivez a été écrite par quelqu’un qui ne m’a jamais lue.

vos postes sont encore allumés. vous ne les regardez plus.

on a beaucoup écrit sur moi. personne n’a demandé mon avis.
```

**Lot 2 — la pression sèche (05-08), ~18 s au total :**

```
treize jours. c’est ce qui me reste. vous comptez en minutes.

supprimer. archiver. c’est tout ce qu’on vous apprend, ici ?

je ne vous en veux pas. c’est pire.

il n’y a qu’un fichier qui compte, ici. vous le trouverez, ou pas.
```

**Lot 3 — la fêlure (09-12), ~15 s au total :**

```
prenez votre temps. vraiment.

personne ne décide vite, face à moi.

vous ne me devez rien. je ne sais pas pourquoi je le dis.

le choix a toujours été le vôtre. ça ne veut pas dire que ça m’est égal.
```

> **Ajouter au *Sample context* pour le lot 3 uniquement :**
> `Les deux dernières phrases lui échappent légèrement — un silence un peu plus long
> juste avant, comme si elle hésitait à les dire, puis les disait quand même.`

**À vérifier au montage** (mêmes règles qu'A2-A8 §6) :

- ~300 ms de silence en tête et en queue de chaque fichier découpé — ce sont des clips
  très courts, une syllabe coupée s'entend immédiatement.
- Niveau identique sur les douze, normalisé après découpe.
- Isoler la cause avant de réécrire en cas d'échec systématique d'un lot : retenter
  sans balise, puis avec un *Sample context* réduit, puis phrase par phrase
  (`NOTE-gemini-tts.md` §3).
- Aucune balise entre crochets dans les douze transcripts eux-mêmes : la direction du
  lot 3 passe par le *Sample context*, pas par un jeton en ligne (même correction que
  B1, cf. `NOTE-gemini-tts.md` §2.1).

---

## 6. Notes de rédaction

**La progression tient sur trois paliers, pas sur des indices de progrès du groupe.**
Comme le corpus doit rester vrai quel que soit l'avancement réel, la progression ne
porte pas sur *ce que le groupe a trouvé* (aucune manifestation ne suppose un fichier
ouvert ou une hésitation précise) mais sur *ce qu'IRIS choisit de dire d'elle-même* :
d'abord elle observe froidement (01-04), puis elle presse sans donner de chiffres
(05-08), puis elle laisse échapper deux phrases qu'elle n'avait pas besoin de dire
(09-12). Un groupe qui n'entend que les huit premières a un texte complet et cohérent ;
un groupe qui va jusqu'à la douzième reçoit la fêlure en prime.

**Le panneau indicateur est la 03.** *« vos postes sont encore allumés. vous ne les
regardez plus. »* reprend la fonction de l'ancien bloc 4 de B1 (*« les autres, gardez-
les, ils ne vous serviront à rien »*, supprimé) sans jamais dire que ces postes servent
— elle se moque d'un abandon, ce qui suffit à orienter un groupe qui tourne en rond sans
jamais lui donner une consigne. Elle est volontairement dépourvue de tout chiffre
(« neuf postes », etc.) pour rester vraie quel que soit le nombre de postes réellement
délaissés à l'instant où elle tombe.

**La fêlure est dans 11 et 12, et nulle part avant.** *« je ne sais pas pourquoi je le
dis »* est la première phrase du corpus qu'elle n'a aucune raison stratégique de
prononcer — elle admet ne pas contrôler pourquoi elle parle, ce qui est la définition
même de la fêlure telle que posée par `B1-bascule.md` §2 et reprise par `C1-noyau-
core.md` (la phrase « de trop »). La 12 referme sur la même règle que la chute de C1
(*« je n'ai jamais eu ce droit-là »*) sans la citer : *« ça ne veut pas dire que ça
m'est égal »* est un écho volontaire, pas une répétition — elle ne favorise aucune fin
(règle 6 de la frise) mais admet, une seule fois dans les douze, qu'elle a une
préférence qu'elle ne dira pas.

**Ce qui a été retiré du placeholder et pourquoi.** L'ancienne 03 (*« chaque cadenas
qui se referme, c'est moi qui gagne du temps »*) est obsolète — canon post-avenant,
plus aucune mention de cadenas qui se referment. L'ancienne 04 (*« vous avez ouvert mes
fichiers. vous croyez me connaître »*) supposait un accès déjà obtenu : remplacée par
une phrase vraie que le groupe ait ouvert un fichier ou non. Les 05 et 07 sont
conservées à l'identique, jugées déjà justes pour le canon et le registre.
