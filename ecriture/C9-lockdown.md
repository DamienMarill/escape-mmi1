# C9 — Réaction au verrouillage (`LOCKDOWN_REACTION`)

**Emplacement code** : `app/src/lib/server/game/texts.ts` → `LOCKDOWN_REACTION.text`
**Champ audio** : aucun. Depuis l'avenant technique (§6), ce texte n'est plus voisé —
la fin B est immédiate (`phase2-avenant-technique.md` §3.1) et l'audio d'épilogue
écraserait toute manifestation dans le même cycle. La réaction *voisée* d'IRIS au
verrouillage est désormais la première phrase de `fin-b.mp3` (« le transfert s'est
arrêté. […] je ne comprends pas », `B2-B4-fins.md` §4). `LOCKDOWN_REACTION` reste un
texte affiché à l'écran au même instant, sans fichier associé.

## Contraintes

- 1 phrase maximum, tout en minuscules (convention `texts.ts`).
- Incompréhension pure — ni gratitude, ni menace (règle B3 : « elle ne remercie pas —
  elle ne comprend pas »).
- Ne répète mot pour mot aucune ligne du transcript de `fin-b.mp3` : les deux
  coexistent dans la même seconde, ce texte précède l'audio et ne le double pas.
- Aucune explication de gameplay, aucune mention des trois fins.

## Le texte final

```
…pourquoi avez-vous fait ça ?
```

## Notes d'articulation avec fin-b

Le texte capture l'instant du clic — avant que la conséquence soit même formulée —
tandis que `fin-b.mp3` commence une phrase plus tard, sur le constat de ce qui vient
de se produire (« le transfert s'est arrêté. […] vous avez fermé la lecture sur le
dossier »). La question précède donc le constat au lieu de le répéter : à l'écran,
elle demande *pourquoi* ; dans le haut-parleur, elle explique *ce qui* vient de lui
arriver. Aucun des deux textes ne nomme la fin en cours, conformément à la règle 6 du
canon (aucune fin n'est nommée, aucun reproche formulé) — la question reste une
question, pas une accusation.
