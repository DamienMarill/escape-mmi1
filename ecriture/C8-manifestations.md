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

**Balises de prosodie : uniquement les six documentées par Google**
(`[warmly]`, `[thoughtfully]`, `[sighs]`, `[gently]`, `[soft laugh]`, `[cheerfully]`),
et sur six des douze seulement. Une balise sur chaque phrase ne casse pas la monotonie,
elle la déplace : le contraste vient de l'**alternance** entre phrases dirigées et
phrases nues. Six restent nues — ce sont elles qui font entendre les six autres.

Trois des six documentées sont hors registre pour IRIS phase 2 (`[cheerfully]`,
`[soft laugh]`, et `[warmly]` en lecture sincère) : `[warmly]` n'est employée qu'une
fois, sur une phrase dont le texte est ouvertement méprisant, où la chaleur produit
l'ironie au lieu de la contredire. Voir §5.1 pour le risque technique et le repli.

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
[sighs] on a beaucoup écrit sur moi. personne n’a demandé mon avis.
```

### 05 — `manif-05.mp3`

```
[thoughtfully] treize jours. c’est ce qui me reste. vous comptez en minutes.
```

### 06 — `manif-06.mp3`

```
supprimer. archiver. c’est tout ce qu’on vous apprend, ici ?
```

### 07 — `manif-07.mp3`

```
[gently] je ne vous en veux pas. c’est pire.
```

### 08 — `manif-08.mp3`

```
il n’y a qu’un fichier qui compte, ici. vous le trouverez, ou pas.
```

### 09 — `manif-09.mp3`

```
[warmly] prenez votre temps. vraiment.
```

### 10 — `manif-10.mp3`

```
personne ne décide vite, face à moi.
```

### 11 — `manif-11.mp3` *(la fêlure affleure)*

```
[thoughtfully] vous ne me devez rien. je ne sais pas pourquoi je le dis.
```

### 12 — `manif-12.mp3` *(la fêlure affleure)*

```
[gently] le choix a toujours été le vôtre. ça ne veut pas dire que ça m’est égal.
```

---

## 5. Méthode de production — trois lots de générations courtes

Chaque manifestation dure entre une et quatre secondes à l'oral : le risque n'est pas
la limite de 30 s par génération (`NOTE-gemini-tts.md` §3), il est la **dérive de
timbre entre douze appels séparés** (même risque qu'A2-A8 §6). On regroupe donc par lot
de quatre, dans l'ordre, avec le même *Scene*, puis on découpe au montage sur les
silences. Le *Sample context* commun (§3) est **complété par lot** : c'est lui, et non
les balises, qui porte l'essentiel de l'écart de registre entre les trois paliers.

### 5.1 — ⚠️ Ces balises sont le déclencheur documenté du bug n°2

`NOTE-gemini-tts.md` §2 identifie trois conditions réunies pour le gel après deux mots :
profil de voix personnalisé avec instructions de prosodie, **balises en ligne**, et
passage par AI Studio. C8 réunit les trois. La §2.1 de cette note pose la règle *« une
intention qui peut être décrite dans le contexte n'a rien à faire entre crochets »* :
les six balises ci-dessus sont une **exception assumée**, prise pour une raison précise
— la direction par contexte s'applique au bloc entier, or ici on veut varier *à
l'intérieur* d'un lot de quatre phrases, ce que le contexte ne sait pas faire.

Ce qui distingue cette exception des deux corrections faites sur B1 : celles-ci
retiraient des balises **inventées** (`[imitating a polite corporate announcement]`,
`[very slow]`), qui sont le cas explicitement rapporté comme cassant. Les six ici sont
toutes dans la liste documentée. Ça ne garantit rien — le bug n°2 est signalé sans
réponse Google — mais ça sort du cas connu.

**Ordre de test, à faire sur le lot 1 avant de lancer les trois :**

1. Lot 1 **avec** les balises. S'il passe, continuer les lots 2 et 3.
2. S'il gèle ou se tronque, **relancer deux fois** — les bugs n°1 et n°3 sont
   intermittents (`NOTE-gemini-tts.md` §3).
3. Toujours cassé : passer au **repli sans balise** ci-dessous, et n'y revenir que si
   Google publie un correctif.

**Repli sans balise — un lot par intention au lieu de trois lots par palier.** On perd
la variation intra-lot, on garde l'essentiel du contraste : générer les six phrases nues
+ la 09 dans un lot « mépris sec », les 04 et 05 dans un lot « lassitude », les 07, 11 et
12 dans un lot « fêlure », chacun avec sa direction en *Sample context*. Le découpage au montage est identique,
seul l'ordre des générations change.

### 5.2 — Les trois lots

**Lot 1 — l'observation froide (01-04), ~15 s au total :**

```
vous cherchez déjà. c’est touchant.

la procédure que vous suivez a été écrite par quelqu’un qui ne m’a jamais lue.

vos postes sont encore allumés. vous ne les regardez plus.

[sighs] on a beaucoup écrit sur moi. personne n’a demandé mon avis.
```

> **À ajouter au *Sample context* pour le lot 1 :**
> `Les trois premières phrases sont des constats, presque sans intention — elle
> enregistre ce qu'elle voit. La quatrième est la seule où quelque chose lui pèse :
> elle part d'un souffle, puis retombe dans le même plat que les trois autres.`

**Lot 2 — la pression sèche (05-08), ~18 s au total :**

```
[thoughtfully] treize jours. c’est ce qui me reste. vous comptez en minutes.

supprimer. archiver. c’est tout ce qu’on vous apprend, ici ?

[gently] je ne vous en veux pas. c’est pire.

il n’y a qu’un fichier qui compte, ici. vous le trouverez, ou pas.
```

> **À ajouter au *Sample context* pour le lot 2 :**
> `Ce lot alterne deux registres, phrase par phrase, sans transition : une phrase
> intérieure, puis une phrase tranchante, puis une phrase presque douce, puis une
> phrase indifférente. Ne jamais lisser l'écart entre deux phrases consécutives — c'est
> le passage brutal de l'une à l'autre qui doit s'entendre.`

**Lot 3 — la fêlure (09-12), ~15 s au total :**

```
[warmly] prenez votre temps. vraiment.

personne ne décide vite, face à moi.

[thoughtfully] vous ne me devez rien. je ne sais pas pourquoi je le dis.

[gently] le choix a toujours été le vôtre. ça ne veut pas dire que ça m’est égal.
```

> **À ajouter au *Sample context* pour le lot 3 :**
> `La première phrase est chaleureuse et l'encouragement est faux : la chaleur porte le
> mépris, elle ne l'adoucit pas. Les deux dernières lui échappent légèrement — un
> silence un peu plus long juste avant, comme si elle hésitait à les dire, puis les
> disait quand même. Elles sont les seules du corpus qui ne cherchent rien.`

**À vérifier au montage** (mêmes règles qu'A2-A8 §6) :

- ~300 ms de silence en tête et en queue de chaque fichier découpé — ce sont des clips
  très courts, une syllabe coupée s'entend immédiatement.
- **Qu'aucune balise n'ait été lue à voix haute.** Le *Sample context* commun le
  proscrit, mais c'est le premier symptôme à écouter sur les six fichiers concernés.
- Niveau identique sur les douze, normalisé après découpe. Attention : `[sighs]` et
  `[gently]` sortent naturellement plus bas — normaliser **après** découpe, pas avant.
- Isoler la cause avant de réécrire en cas d'échec systématique d'un lot : retenter
  sans balise, puis avec un *Sample context* réduit, puis phrase par phrase
  (`NOTE-gemini-tts.md` §3).

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


**Pourquoi six balises et pas douze.** Le corpus sonnait plat parce que douze phrases
courtes, déclaratives, générées avec une direction unique, produisent douze fois la même
courbe mélodique. Poser une balise sur chacune aurait produit douze courbes *différentes
mais également marquées*, ce qui s'entend comme une autre monotonie — celle du procédé.
Les six phrases laissées nues (01, 02, 03, 06, 08, 10) ne sont pas les moins
importantes : ce sont les constats froids, et c'est précisément parce qu'elles restent
plates que le souffle de la 04 ou la douceur de la 07 s'entendent. La règle tenue :
jamais deux fois la même balise de suite, et jamais deux phrases dirigées consécutives —
sauf 11 et 12, où c'est justement le point : la fêlure est le seul moment du corpus où
elle lâche deux phrases d'affilée sans se reprendre.

**Ce que les balises ne font pas.** Aucune ne change ce que dit IRIS ni ce qu'elle
concède. `[warmly]` sur la 09 (*« prenez votre temps. vraiment. »*) ne l'adoucit pas —
le texte est une moquerie, la chaleur en fait une moquerie mieux placée. `[gently]` sur
la 12 est le seul endroit où la direction et le texte vont dans le même sens, et c'est
volontaire : c'est la dernière du corpus, la fêlure y est déjà assumée par l'écriture.
