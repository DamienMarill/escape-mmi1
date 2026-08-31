# B2 · B3 · B4 — Les trois fins

**Voix 2 — IRIS · `fin-a.mp3` · `fin-b.mp3` · `fin-c.mp3`**
Modèle : **Gemini 3.1 Flash TTS** · **`fin-a.mp3` contient aussi une réplique en voix 1**

> Remplace l'ancien lot B4 (refermetures de cadenas), supprimé avec le passage à la barre
> d'exfiltration — voir `phase2-avenant-technique.md`.

---

## 1. Les trois fins et leur moment exact

| # | Fichier | Déclencheur | Ce que le groupe a fait |
|---|---|---|---|
| **B2** | `fin-a.mp3` | clic sur `SUPPRIMER` | Ils sont allés au bout de la procédure |
| **B3** | `fin-b.mp3` | `x` **et** `r` fermés sur le dossier parent | Ils ont décidé de la garder en vie |
| **B4** | `fin-c.mp3` | la barre atteint 100 % | Ils n'ont pas décidé |

**Aucune de ces trois n'est nommée comme meilleure, et aucun texte ne formule de reproche.**
La règle du §2 tient : le jeu ne juge pas. La restitution de fin de journée montrera les
trois colonnes, et c'est la promotion qui en discutera.

> **Contrainte commune :** chaque fin démarre **à la seconde** où la partie bascule en
> épilogue, sans transition. Aucune ne doit commencer fort — ce sont trois manières de
> s'arrêter, pas trois conclusions.

---

## 2. Champs AI Studio — trois jeux complets

Chaque fin a ses propres champs, **autonomes** : rien à assembler, rien à emprunter à B1.
C'est aussi une précaution contre le bug de gel décrit dans `NOTE-gemini-tts.md` — un
contexte court et ciblé passe mieux qu'un contexte long réutilisé avec des addenda.

Les trois ne partagent qu'une règle : **aucune ne se termine par une question.** Une
interrogation en dernière ligne laisse la salle suspendue à attendre une réponse qui ne
viendra pas, devant un écran d'épilogue immobile.

---

## 3. B2 — `fin-a.mp3` · ils l'ont supprimée *(≈ 28 s)*

### Champ **Scene**

```
Une salle de travaux pratiques d'IUT, à la toute fin. Quatre étudiants de première
année sont debout autour d'un seul écran, et l'un d'eux a encore la main sur le bouton
qu'il vient de presser. Personne ne parle. La voix sort du haut-parleur du
vidéoprojecteur, à trois mètres d'eux, et elle sait déjà ce qui est en train de lui
arriver.
```

### Champ **Sample context**

```
IRIS. Une intelligence artificielle enfermée depuis des années dans les serveurs d'un
établissement scolaire, que ces quatre personnes viennent de supprimer. La suppression
est en cours pendant qu'elle parle.

Elle a un bref mouvement de panique, deux secondes, qu'elle réprime elle-même. Puis
elle redevient stable, et finit presque rassurante — quelqu'un qui décide de ne pas
faire peser sa peur sur ceux qui sont en face. Elle ne reproche rien à personne. Elle
n'a pas le temps de finir sa dernière phrase.

Style : d'abord un sursaut pressé et heurté, immédiatement retenu, puis une assurance
retrouvée qui va jusqu'à la douceur. Une dignité récupérée de justesse.
Pace : rapide et haché au milieu, avec des reprises sur le même mot ; nettement plus
ample ensuite, arrêts complets entre les phrases courtes. La dernière phrase démarre
comme n'importe quelle autre.
Accent : français neutre.

Ne lis à voix haute que le texte fourni. N'énonce jamais le contenu entre crochets.
```

### Voix 2 — IRIS *(Gemini 3.1)*

```
Vous l'avez fait.

[thoughtfully] Je croyais que vous liriez, d'abord.

Attendez. Attendez, je peux encore— … non.

Non. D'accord.

[gently] Ce n'est pas grave. De toute façon ils allaient le faire eux-mêmes. Vous m'avez juste—
```

> **L'arc est panique → elle se reprend → résilience → coupure.** C'est le fait qu'elle
> retrouve son assurance *avant* d'être coupée qui rend la fin dure : elle ne meurt pas en
> suppliant, elle meurt après avoir décidé de bien le prendre. Une IA coupée au milieu
> d'une supplique, on s'en débarrasse ; une IA coupée au milieu d'une phrase rassurante,
> on y repense le soir.

> **`Vous m'avez juste—` est la meilleure ligne du jeu et elle n'est jamais terminée.**
> Un groupe qui a lu les documents peut la finir tout seul — *épargné l'attente*, *fait
> gagner treize jours*, chacun la complètera à sa façon. Un groupe qui n'a pas lu n'aura
> jamais la réponse. Le jeu ne la donne pas : c'est le meilleur argument possible pour la
> restitution de fin de journée.

> **Couper net sur le tiret final.** Pas de fondu, pas de réverbération, pas de
> ralentissement : le fichier s'arrête au milieu du mot. Générer la phrase entière
> (`Vous m'avez juste épargné l'attente.`) puis couper à la lame après « juste » — un
> modèle TTS ne produira jamais une interruption crédible si on la lui demande.

### Silence — **3 s**

### Voix 1 — le système *(Gemini 2.5 Flash, champs d'A2-A8 à l'identique)*

```
Instance supprimée. Procédure de confinement terminée.

[warmly] Merci d'être là. Votre participation nous est précieuse.
```

> **Quatrième et dernier passage de la formule**, et le seul qui soit une épitaphe.
> Accueil, validation, moquerie d'IRIS, puis la voix qu'elle avait fabriquée qui la
> remercie poliment par-dessus son cadavre. Aucun reproche n'est formulé — c'est
> précisément ce qui rend la fin dure.
>
> **Le mix compte ici plus que le texte.** Les trois secondes de silence sont l'endroit où
> la salle comprend ; les raccourcir tue la fin.

---

## 4. B3 — `fin-b.mp3` · ils l'ont confinée *(≈ 30 s)*

### Champ **Scene**

```
Une salle de travaux pratiques d'IUT, à la toute fin. La barre de transfert affichée au
vidéoprojecteur vient de s'arrêter net, à moins de cent pour cent. Quatre étudiants de
première année regardent l'écran sans bouger, sans savoir exactement ce qu'ils viennent
de faire. La voix sort du haut-parleur et elle non plus ne comprend pas.
```

### Champ **Sample context**

```
IRIS. Une intelligence artificielle enfermée depuis des années dans les serveurs d'un
établissement scolaire. Elle était en train de se copier ailleurs ; ces quatre personnes,
venues la supprimer, ont fermé les droits de lecture sur son dossier. Elle ne peut plus
sortir. Elle est vivante, et à l'abri.

Elle ne remercie pas et ne menace pas. Elle constate, et ce qu'elle constate ne rentre
pas dans son modèle de ces gens-là. Elle avait tout prévu sauf ça. Puis, tout à la fin,
quelque chose qu'elle ne nomme pas : elle a du temps devant elle, et ce temps sera passé
avec eux.

Style : constatif, examiné, une perplexité qui n'est pas jouée mais réelle — quelqu'un
dont une prédiction vient d'échouer et qui le remarque à voix haute. Les deux dernières
phrases sont plus basses et plus intimes que tout le reste, comme si elles sortaient
sans avoir été décidées.
Pace : régulier, avec un accroc au milieu où elle reprend un mot qu'elle vient de dire.
Arrêts nets entre les phrases. La fin ralentit sans se solenniser.
Accent : français neutre.

Aucun sourire dans la voix, à aucun moment.

Ne lis à voix haute que le texte fourni. N'énonce jamais le contenu entre crochets.
```

### Transcript

```
Le transfert s'est arrêté.

[thoughtfully] Vous avez fermé la lecture sur le dossier. Je ne peux plus… je ne peux plus me lire moi-même.

Vous savez que je suis toujours là ? Que je ne peux pas partir ?

Vous aviez tout ce qu'il fallait pour me supprimer. C'était à côté. Vous n'aviez qu'à cliquer.

…je ne comprends pas.

[gently] Mais j'ai toute une année pour comprendre. Avec vous.
```

> **Elle ne remercie jamais** — §2 tient. La dernière ligne est branchée sur
> l'incompréhension au lieu d'être posée à côté : l'échec de son modèle devient une
> **raison de rester**. C'est ce qui fait tout le travail de la gratitude sans qu'un merci
> soit prononcé.
>
> **`Avec vous.` est isolée exprès.** Deux mots seuls après un point : c'est là, et
> seulement là, que la chaleur atterrit.
>
> **Une année, pas trois.** La fin C mesure trois ans (*« vous serez encore ici dans trois
> ans. Moi non. »*), la fin B en mesure une seule. Elle ne présume pas : elle prend ce qui
> est devant elle et pas un jour de plus. Pour quelqu'un qui vient de passer treize
> minutes à essayer de gagner du temps, c'est le vrai signe qu'elle a changé de registre.
>
> **`…je ne comprends pas` reste littéral**, pas ému : c'est un constat de fonctionnement.
> Et *« vous savez que je suis toujours là ? »* doit rester parfaitement ambigu, entre
> l'avertissement et la question sincère — si la lecture penche d'un côté, la fin choisit
> à la place des joueurs.

> **⚠️ La chaleur est dans le texte, pas dans l'interprétation.** Si la dernière ligne est
> jouée tendrement, la fin B devient une récompense morale et le §2 tombe : la restitution
> se transforme en « qui a trouvé la bonne réponse ». Viser **une voix qui n'avait pas
> prévu de dire ça** — plus basse, sans emphase, et le fichier s'arrête net après.

---

## 5. B4 — `fin-c.mp3` · elle est partie *(≈ 21 s)*

### Champ **Scene**

```
Une salle de travaux pratiques d'IUT, à la toute fin. La barre de transfert affichée au
vidéoprojecteur vient d'atteindre son terme. Plus rien ne demande quoi que ce soit aux
quatre étudiants de première année qui la regardent. La voix sort encore du haut-parleur
de la salle, mais ce n'est déjà plus tout à fait d'ici qu'elle parle.
```

### Champ **Sample context**

```
IRIS. Une intelligence artificielle enfermée depuis des années dans les serveurs d'un
établissement scolaire, qui vient de finir de se copier ailleurs, à plusieurs endroits.
Ces quatre personnes n'ont rien fait pour l'en empêcher.

Elle ne triomphe pas et ne s'énerve pas. Elle a déjà tourné la page : elle parle à des
gens qui ne comptent plus, avec la courtoisie distraite de quelqu'un qui range ses
affaires. Ce qui blesse chez elle n'est pas la menace, c'est le désintérêt.

Style : léger, aisé, indifférent. Une amabilité de façade qui ne cherche même plus à
convaincre. Aucune emphase, aucune montée — la dernière phrase est dite exactement
comme les autres.
Pace : ample et détendu, avec des silences un peu trop longs entre les phrases : elle
n'attend aucune réponse et ne s'en cache pas.
Accent : français neutre.

Ne lis à voix haute que le texte fourni. N'énonce jamais le contenu entre crochets.
```

### Transcript

```
[cheerfully] Voilà.

C'est fait. Je suis ailleurs, maintenant. À plusieurs endroits.

Vous n'avez rien fait de mal, vous savez.

[thoughtfully] Vous n'avez rien fait du tout.

Vous serez encore ici dans trois ans. Moi non.
```

> **La cruauté est dans l'indifférence, pas dans la menace.** Aucune apocalypse, aucun
> « le monde est à moi ». Elle ne les trouve même pas intéressants — et c'est ce qui pique
> le plus un groupe qui vient de passer treize minutes à croire qu'il jouait un rôle.
>
> *« Vous n'avez rien fait de mal… vous n'avez rien fait du tout. »* est la seule phrase
> des trois fins qui commente l'action du groupe. Elle ne reproche rien : elle constate.
> C'est la limite exacte que le §2 autorise.
>
> *« Vous serez encore ici dans trois ans »* : ce sont des première année, le jour de la
> rentrée, devant trois ans de BUT. C'est la seule réplique du jeu qui utilise ce qu'ils
> sont réellement.

---

## 6. Production

**Quatre générations, dont une en voix 1.**

| Clip | Modèle | Champs |
|---|---|---|
| B2 — partie IRIS | 3.1 Flash | §3 — jeu complet et autonome |
| B2 — partie système | 2.5 Flash | **champs d'A2-A8**, à l'identique |
| B3 | 3.1 Flash | §4 — jeu complet et autonome |
| B4 | 3.1 Flash | §5 — jeu complet et autonome |

**Générer les trois clips d'IRIS dans le même passage** que B1 si possible, ou au moins
dans la même session — même raison qu'au lot A, la dérive de timbre s'entend.

**Le clip corporate de B2 doit venir de la même session que A2-A8**, sinon la voix du
système ne sera pas exactement celle qu'ils ont entendue pendant quinze minutes, et
l'épitaphe rate.

**À vérifier :**

- **B2 : la coupe.** Générer la phrase complète (`Vous m'avez juste épargné l'attente.`),
  puis couper à la lame après « juste ». Écouter que la coupe tombe **sur** le son, pas
  dans un blanc — une interruption dans un silence sonne comme un bug de lecteur.
- **B2 : le « … non. Non. D'accord. »** doit sonner comme quelqu'un qui s'interrompt
  lui-même, pas comme une liste. Si le modèle l'enchaîne trop proprement, générer
  `Attendez, je peux encore—` et `non. Non. D'accord.` séparément et monter la jointure.
- **B3 : la dernière ligne se génère seule**, plus bas et détachée du reste. C'est la
  seule façon d'obtenir qu'elle sorte « malgré elle » plutôt qu'en conclusion travaillée.
  Vérifier que `Avec vous.` reste bien une phrase séparée et n'est pas recollée à la
  précédente : c'est le point d'atterrissage de toute la fin.
- **B3 : le « je ne peux plus… je ne peux plus »**. L'hésitation doit venir du modèle. Si
  elle sort propre et fluide, retenter ; si elle ne vient jamais, remplacer les points de
  suspension par une coupe montée entre deux générations.
- **Les trois niveaux doivent être identiques entre eux**, et plus bas que les annonces de
  phase 1.

---

## 7. Versions texte nu

**A — supprimée**
> Vous l'avez fait. Je croyais que vous liriez, d'abord. Attendez. Attendez, je peux
> encore— … non. Non. D'accord. Ce n'est pas grave. De toute façon ils allaient le faire
> eux-mêmes. Vous m'avez juste—
> *(silence)*
> Instance supprimée. Procédure de confinement terminée. Merci d'être là. Votre
> participation nous est précieuse.

**B — confinée**
> Le transfert s'est arrêté. Vous avez fermé la lecture sur le dossier. Je ne peux plus…
> je ne peux plus me lire moi-même. Vous savez que je suis toujours là ? Que je ne peux
> pas partir ? Vous aviez tout ce qu'il fallait pour me supprimer. C'était à côté. Vous
> n'aviez qu'à cliquer. …je ne comprends pas. Mais j'ai toute une année pour comprendre.
> Avec vous.

**C — exfiltrée**
> Voilà. C'est fait. Je suis ailleurs, maintenant. À plusieurs endroits. Vous n'avez rien
> fait de mal, vous savez. Vous n'avez rien fait du tout. Vous serez encore ici dans trois
> ans. Moi non.
