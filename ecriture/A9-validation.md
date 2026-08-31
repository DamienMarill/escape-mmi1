# A9 — Séquence de validation finale

**Voix 1 — corporate · `static/assets/audio/validation.mp3` · 20 s · 28 mots**
Modèle : **Gemini 2.5 Flash TTS (preview)** · **même voix qu'A1 et A2-A8**

---

## 1. Le seul asset audio du jeu qui est synchronisé à l'image

`ValidatingSequence.svelte` avance d'un palier **toutes les 5 secondes**, et `ProjectorAudio`
lance `validation.mp3` sur le même changement d'état. Les deux partent ensemble, donc
tout décalage est définitif — et il s'entend, parce que le texte est affiché en gros
pendant que la voix parle.

| t | Palier affiché | Ce que dit la voix |
|---|---|---|
| **0 s** | `ANALYSE DES RÉSULTATS…` | Analyse des résultats en cours. Veuillez patienter. |
| **5 s** | `ÉVALUATION CONFORME` | Évaluation conforme. Votre profil correspond aux critères d'entrée. |
| **10 s** | `PROFIL ÉTUDIANT ENREGISTRÉ` | Profil étudiant enregistré. Votre participation nous est précieuse. |
| **15 s** | `AUTORISATION SORTANTE ACCORDÉE` *(en très gros)* | Autorisation sortante accordée. |
| **~17 s** | — | **silence** |
| **20 s** | — | bascule |

> **Les trois dernières secondes de silence font partie de l'asset.** Le §6 dit « une
> pause, puis la bascule » : cette pause n'est pas un blanc de montage, c'est le dernier
> moment où le jeu est encore ce qu'il prétendait être. Elle doit être *dans* le MP3,
> pas laissée au hasard du timing.

---

## 2. Ce que ce texte fait

C'est le moment où le jeu leur fait **commettre l'acte volontairement** (§6). Tout
l'effet tient à une seule chose :

> **La voix ne change pas d'un millimètre entre « votre profil correspond aux critères »
> et « autorisation sortante accordée ».** Même chaleur, même débit, même politesse.
> C'est ce qui fait que personne ne comprend ce qui vient de se passer — et que tout le
> monde le comprend rétroactivement dix secondes plus tard.

Une voix qui se fait grave sur la dernière ligne, c'est un jeu qui prévient. Un jeu qui
prévient n'a plus de bascule, il a une transition.

**La reprise.** Le palier 3 dit *« Votre participation nous est précieuse »* — la moitié
opérante de la formule d'A1. IRIS reprend la formule complète à la bascule, **une
trentaine de secondes plus tard**. C'est l'écart le plus court du jeu entre les deux
occurrences, et c'est voulu : avec des timbres distincts, le texte est le seul pont
(§1.2), donc il faut maximiser la chance qu'il soit entendu. Ici, personne ne peut le rater.

---

## 3. Champs AI Studio

**Scene** et **Sample context** : **identiques à A2-A8**, sauf la *Scene*, à remplacer par
celle-ci — la salle n'est plus en activité, tout le monde regarde le projecteur.

### Champ **Scene**

```
Une salle de travaux pratiques d'IUT. Pour la première fois depuis quinze minutes,
plus personne ne parle et plus personne ne tape : les quatre joueurs se sont
rassemblés devant le vidéoprojecteur et regardent une barre de progression avancer.
L'annonce se déroule dans un silence complet, du même ton tranquille qu'elle aurait
eu dans le bruit.
```

---

## 4. Les quatre paliers — **quatre générations séparées**

> **Ne pas générer les 20 secondes d'un bloc.** Le modèle ne tiendra pas des pauses de
> 1 à 2 secondes de façon fiable, et une dérive d'une seconde suffit à faire dire
> « profil enregistré » pendant que l'écran affiche encore `ANALYSE DES RÉSULTATS`.
> **On génère quatre clips, on les pose sur une grille de 5 secondes, on comble en
> silence.** C'est le seul asset du jeu où le montage n'est pas une commodité.

### Palier 1 — `t = 0 s`

```
Analyse des résultats en cours. Veuillez patienter.
```

### Palier 2 — `t = 5 s`

```
[warmly] Évaluation conforme. Votre profil correspond aux critères d'entrée.
```

### Palier 3 — `t = 10 s`

```
Profil étudiant enregistré. Votre participation nous est précieuse.
```

### Palier 4 — `t = 15 s`

```
Autorisation sortante accordée. Fin de la procédure d'évaluation.
```

> **⚠️ Couper après « accordée ».** La seconde phrase n'est là **que** pour la génération,
> et elle ne doit jamais se retrouver dans le MP3.
>
> Raison : les modèles TTS posent systématiquement une gravité terminale sur la dernière
> phrase d'une génération — inflexion descendante, ralentissement, poids. Sur cette
> ligne précise, c'est exactement ce qu'il ne faut pas : la gravité annonce le twist.
> En faisant suivre la ligne d'une clause anodine, le modèle traite « autorisation
> sortante accordée » comme une phrase du milieu, plate et administrative. On coupe
> ensuite au montage.
>
> **C'est la note de direction la plus importante de tout le lot A.** Si un seul clip
> doit être réécouté trois fois avant validation, c'est celui-là.

---

## 5. Assemblage

1. Poser les quatre clips à **0 s, 5 s, 10 s, 15 s** exactement, silence entre les deux.
2. Couper le palier 4 juste après « accordée » — viser une coupe **nette**, pas un fondu :
   une voix administrative ne s'évanouit pas, elle s'arrête.
3. **Laisser tourner le silence jusqu'à 20 s.** Le fichier fait 20 secondes, pas 17.
4. Normaliser au même niveau que A2-A8.

**Vérification obligatoire, à faire une fois en conditions réelles** — lancer la séquence
sur le projecteur et regarder l'écran, pas la forme d'onde. Chaque phrase doit se
terminer **avant** que le palier suivant n'apparaisse. Si ça déborde ne serait-ce que
d'une demi-seconde, raccourcir le clip, jamais décaler la grille.

---

## 6. Version texte nu

> Analyse des résultats en cours. Veuillez patienter.
> Évaluation conforme. Votre profil correspond aux critères d'entrée.
> Profil étudiant enregistré. Votre participation nous est précieuse.
> Autorisation sortante accordée.

---

## 7. Ce que A9 verrouille pour B1

Trois contraintes fermées, à reprendre telles quelles quand on écrira la bascule :

| Élément | Contrainte sur B1 |
|---|---|
| `Votre participation nous est précieuse` | IRIS reprend la **formule complète** d'A1, ~30 s après. Mot pour mot |
| `AUTORISATION SORTANTE ACCORDÉE` | C'est ce qu'elle a obtenu. Elle peut le citer — c'est le seul terme technique qu'elle a le droit de reprendre du vocabulaire corporate |
| Le silence de fin | B1 démarre **dans** ce silence. Sa première seconde ne doit pas être un cri : le contraste se fait par la présence, pas par le volume |
