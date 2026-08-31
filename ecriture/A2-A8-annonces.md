# A2 → A8 — Annonces du projecteur

**Voix 1 — corporate · 7 MP3 · phase 1 uniquement**
Modèle : **Gemini 2.5 Flash TTS (preview)** · console AI Studio · **même voix qu'A1**

---

## 1. Trois règles qui contraignent ces textes

### 1.1 — Aucune référence à l'ordre ni au décompte

Les trois cadenas peuvent tomber dans **n'importe quel ordre**. Une annonce qui dit
« premier verrou » ou « plus que deux » sera fausse une fois sur trois. Le compteur
`2 / 3` est déjà à l'écran, en gros : **la voix nomme le domaine, l'écran compte.**

### 1.2 — Le système félicite, toujours *(règle de conception n°2)*

Un groupe qui bloque doit se sentir en train de réussir lentement. Aucune annonce ne
constate un retard, aucune ne presse. Y compris — surtout — les jalons de temps.

### 1.3 — Chaque cadenas plante quelque chose

C'est gratuit et ça ne se représentera pas : trois annonces que tout le monde écoute,
au moment exact où le groupe est fier. Chacune place un élément qui ne servira qu'en
phase 2, sous forme de notice administrative anodine.

| Verrou | Ce qui est planté | Où ça ressort |
|---|---|---|
| **α** DEV | le marqueur déposé est *conservé* | Le terminal liste les dossiers par symbole (§9) |
| **β** SYSTÈME | les droits d'accès *restent actifs* | **Le fusil de Tchekhov** — c'est le mode d'emploi de la Fin B |
| **γ** RÉSEAU | la *liaison sortante* est disponible | `AUTORISATION SORTANTE ACCORDÉE`, puis la bascule |

> β est la plus importante des trois. Elle dit littéralement aux joueurs que le
> mécanisme des permissions survivra à l'épreuve — sur le ton d'une confirmation
> de droits d'accès dont personne ne retient jamais rien.

---

## 2. Champ **Scene** *(commun aux 7)*

```
Une salle de travaux pratiques d'IUT en pleine activité. Des étudiants parlent fort
d'un poste à l'autre, quelqu'un traverse la pièce. L'annonce sort du haut-parleur du
vidéoprojecteur et passe par-dessus le bruit, sans jamais le forcer — le ton d'un
message d'aéroport qui n'a pas besoin qu'on l'écoute pour être diffusé.
```

## 3. Champ **Sample context** *(commun aux 7)*

```
Voix d'annonce du module d'évaluation automatisée d'un établissement scolaire.
Ce n'est pas une personne : c'est un système qui confirme, informe et remercie,
parce que c'est sa fonction. Il annonce une réussite exactement comme il annoncerait
un horaire.

Style : chaleur professionnelle constante, exactement la même du premier au dernier
mot et d'une annonce à l'autre. Une satisfaction administrative, polie et sincère,
jamais enthousiaste. Registre de l'annonce de gare ou de terminal d'aéroport.

Pace : posé, articulé, un temps d'arrêt net entre chaque phrase. Les annonces sont
courtes et ne se précipitent jamais, même celles qui parlent du temps restant.
Accent : français neutre, diction d'annonce publique.
```

---

## 4. Les sept transcripts

### A2 — `cadenas-alpha.mp3` · ouverture du verrou α *(DEV)*

```
[warmly] Épreuve de séquençage validée. Verrou alpha ouvert.
Le marqueur déposé est conservé pour la suite de la procédure.
```

### A3 — `cadenas-beta.mp3` · ouverture du verrou β *(SYSTÈME)*

```
[warmly] Arborescence rétablie. Verrou bêta ouvert.
Vos droits d'accès restent actifs jusqu'à la fin de la session.
```

### A4 — `cadenas-gamma.mp3` · ouverture du verrou γ *(RÉSEAU)*

```
[warmly] Table de routage rétablie. Verrou gamma ouvert.
La liaison sortante est désormais disponible.
```

### A5 — `jalon-10min.mp3`

```
Dix minutes restantes. Votre progression est conforme aux moyennes observées.
```

### A6 — `jalon-5min.mp3`

```
Cinq minutes restantes. Nous vous rappelons que les épreuves peuvent être traitées
dans n'importe quel ordre.
```

### A7 — `jalon-2min.mp3`

```
Deux minutes restantes. Quel que soit votre avancement, votre profil sera enregistré.
Merci de votre participation.
```

### A8 — `rappel-document.mp3`

```
Rappel de procédure. Une partie de la documentation de référence n'a pas été numérisée.
Les documents concernés sont consultables dans la salle.
```

---

## 5. Notes de rédaction

**A5 · A6 · A7 sont des soupapes, pas des jalons.** Voir §7 — dans l'état actuel du code
elles ne se déclenchent que pour un groupe **en retard**. Elles sont donc écrites pour
rassurer, jamais pour presser : A5 affirme que tout va bien *(c'est faux, et c'est un
compliment)*, A6 glisse une aide réelle sous une formule administrative, A7 promet que
rien ne sera perdu.

**A7 est la seule annonce à moitié cruelle.** « Quel que soit votre avancement, votre
profil sera enregistré » rassure au premier degré et désigne exactement ce qui les
condamne. Elle reprend aussi, en version raccourcie, la formule d'accueil d'A1 — sans
la diluer, puisque la plupart des groupes ne l'entendront jamais.

**A8 est volontairement générique.** Le code ne prévoit qu'un seul fichier pour les deux
tâches à support physique, alors que le projecteur affiche bien deux messages distincts
(`DOCUMENT INV-2019-04` / `PLAN DE CÂBLAGE`). **La voix reste vague, l'écran est précis** :
zéro ligne de code, et le §12.3 est respecté puisque ni « livre » ni « tableau » n'est
jamais prononcé.

---

## 6. Production — générer les sept **en un seul passage**

> **Le vrai risque sur ces clips n'est pas le texte, c'est la dérive de timbre.** Sept
> générations séparées de huit à vingt mots, ce sont sept occasions pour le modèle de
> partir légèrement ailleurs — et sur des clips aussi courts, l'oreille entend la couture
> immédiatement. Une salle où le système change de voix entre deux cadenas, c'est la
> crédibilité du cadrage « évaluation automatisée » qui tombe.

**Méthode :** coller le bloc ci-dessous **d'un coup**, avec les mêmes champs *Scene* et
*Sample context*, puis découper les sept fichiers dans le montage. Les silences balisés
donnent les points de coupe.

```
[warmly] Épreuve de séquençage validée. Verrou alpha ouvert. Le marqueur déposé est conservé pour la suite de la procédure.

[warmly] Arborescence rétablie. Verrou bêta ouvert. Vos droits d'accès restent actifs jusqu'à la fin de la session.

[warmly] Table de routage rétablie. Verrou gamma ouvert. La liaison sortante est désormais disponible.

Dix minutes restantes. Votre progression est conforme aux moyennes observées.

Cinq minutes restantes. Nous vous rappelons que les épreuves peuvent être traitées dans n'importe quel ordre.

Deux minutes restantes. Quel que soit votre avancement, votre profil sera enregistré. Merci de votre participation.

Rappel de procédure. Une partie de la documentation de référence n'a pas été numérisée. Les documents concernés sont consultables dans la salle.
```

**À vérifier :**

- **`alpha` / `bêta` / `gamma`** doivent être prononcés comme des mots français, pas
  épelés ni anglicisés. Si `bêta` sort en « bèta » à l'anglaise, écrire `beta`.
- **Laisser ~300 ms de silence** en tête et en queue de chaque fichier au découpage.
  Un MP3 qui démarre sur la première syllabe s'entend coupé quand il passe fort dans
  une salle silencieuse.
- **Le niveau doit être identique sur les sept** — normaliser après découpe. Ces annonces
  passent par-dessus une salle qui parle.
- **Ne pas réutiliser A1 pour caler le niveau** : la vidéo d'intro est diffusée dans le
  silence, les annonces par-dessus le bruit. Elles se mixent différemment.

---

## 7. ⚠️ Deux points à trancher, découverts en écrivant

### 7.1 — Les jalons ne se déclenchent que pour les groupes très en retard

Le chrono porte sur la **session de 30 minutes**, pas sur les 15 minutes de phase 1, et
le code ne joue les jalons que si `phase === 'phase1'`.

| Jalon | Se déclenche à | Or la phase 1 finit vers |
|---|---|---|
| 10 min restantes | **20 min écoulées** | 15 min |
| 5 min restantes | **25 min écoulées** | 15 min |
| 2 min restantes | **28 min écoulées** | 15 min |

Un groupe nominal est en phase 2 depuis longtemps : **il n'entend aucun des trois.**
Seul un groupe avec au moins cinq minutes de retard déclenche A5.

Deux lectures possibles, et il faut choisir :

- **soupapes de retard** *(ce que fait le code)* — les textes ci-dessus sont écrits pour ça ;
- **jalons de phase 1** *(peut-être l'intention d'origine)* — il faudrait alors les
  calculer sur les 15 minutes de phase 1, soit des seuils à 5 / 10 / 13 minutes écoulées.
  Changement dans `constants.ts` + `ProjectorAudio`, et **réécriture des trois textes** :
  un jalon qui tombe à mi-parcours ne dit pas la même chose qu'une bouée.

### 7.2 — Bug : la voix corporate parle pendant la phase 2

`ProjectorAudio.svelte` joue **le même MP3** à l'ouverture d'un cadenas *et* à sa
refermeture :

```ts
if (snapshot.locks[lock] === 'open' || snapshot.locks[lock] === 'reclosed') {
    playSrc(`/assets/audio/cadenas-${lock}.mp3`);
}
```

Conséquence : au milieu de la phase 2, pendant qu'IRIS a pris la salle, le système
d'évaluation revient annoncer joyeusement *« Verrou gamma ouvert, la liaison sortante
est disponible »* — au moment précis où le verrou se **referme**. Mauvaise voix, sens
inversé, et le chrono narratif du §8 se transforme en bug apparent.

**Corrigé dans le code** : les refermetures pointent désormais sur `relock-<lock>.mp3`,
trois fichiers distincts.

> **Ces trois textes appartiennent au lot B, pas au lot A** — c'est IRIS qui parle, en
> Gemini 3.1. Ils s'écrivent donc après B1, quand sa voix existe. Trois placeholders
> sont en place en attendant.
