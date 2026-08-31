# Note technique — bugs connus de `gemini-3.1-flash-tts-preview`

*Relevé le 30 août 2026 sur le forum développeurs Google. À rouvrir avant de relancer une
session de génération : ce sont des bugs de preview, ils bougent.*

---

## 1. Ce n'est pas l'interface, c'est le modèle

Quatre défaillances distinctes sont remontées sur `gemini-3.1-flash-tts-preview`, toutes
côté modèle ou côté serveur. Aucune ne vient d'AI Studio en tant qu'interface.

| # | Symptôme | Statut Google |
|---|---|---|
| 1 | **Troncature en cours de génération.** Message : `TextToSpeechRecipeRunner received text output from model, but only audio output modality is supported`. Le modèle repasse en génération de texte au milieu de la requête | **Reproduit et escaladé** à l'équipe gen media |
| 2 | **Deux mots puis gel.** L'audio se coupe après deux mots et l'interface se fige | Signalé le 28/08/2026, pas de réponse |
| 3 | **`500 INTERNAL` sur toutes les requêtes.** 12+ clés API, plusieurs projets, plusieurs voix, `v1beta` et `v1alpha` | Aucune réponse |
| 4 | **Dégradation au-delà d'~1 minute.** Le volume baisse, la qualité baisse, et **la voix change progressivement** | Reconnu, « en investigation », sans ETA |

---

## 2. ⚠️ Le déclencheur du bug n°2, c'est notre prompt

Le rapport identifie trois conditions réunies : **profil de voix personnalisé avec
instructions de prosodie**, **balises de prosodie en ligne** (l'exemple donné est
`[whispering]`), et passage par l'interface AI Studio.

C'est la description exacte des fiches B1 et B4. Deux corrections appliquées :

### 2.1 — Plus aucune balise hors de la liste documentée

Google ne documente que six balises : `[warmly]`, `[thoughtfully]`, `[sighs]`,
`[gently]`, `[soft laugh]`, `[cheerfully]`. Les articles de prompting affirment qu'on
peut en inventer — **c'est vrai, et c'est précisément ce qui casse**.

| Retiré | Remplacé par |
|---|---|
| `[imitating a polite corporate announcement]` *(B1, bloc 1)* | une phrase de direction dans le champ *Sample context* |
| `[very slow]` *(B1, bloc 5)* | idem |

**Règle générale : une intention qui peut être décrite dans le contexte n'a rien à faire
entre crochets.** Le contexte est de la direction que le modèle interprète ; la balise
est un jeton qu'il doit exécuter au milieu du flux. C'est le second qui casse.

### 2.2 — Contexte variable par bloc

Puisqu'on génère bloc par bloc, le champ *Sample context* peut être ajusté à chaque
passage. C'est plus sûr **et** plus précis qu'une balise : la direction s'applique à
tout le bloc au lieu de se déclencher sur un mot.

---

## 3. Contournements

**Découper court.** Le bug n°4 fait dériver la voix au-delà d'une minute — c'est
rédhibitoire ici, puisque la crédibilité d'IRIS tient à ce qu'une seule chose parle.
Le découpage en blocs déjà spécifié dans B1 et B4 suffit : **ne jamais dépasser ~30 s
par génération**, et si un bloc échoue, le couper à la phrase.

**Ne pas forcer `temperature: 0`.** Rapporté comme provoquant une sortie PCM
surdimensionnée et des erreurs d'épuisement de ressources sur les requêtes longues.
Laisser la valeur par défaut.

**Relancer bêtement.** Les bugs n°1 et n°3 sont intermittents chez une partie des
utilisateurs : une même requête qui échoue passe parfois au troisième essai. Ça vaut le
coup avant de conclure que le texte est en cause.

**Isoler la cause avant de réécrire.** Si un bloc échoue systématiquement, tester dans
cet ordre : (a) le même texte **sans aucune balise** ; (b) le même texte avec un
*Sample context* réduit à trois lignes ; (c) la première phrase seule. Ça dit en trois
essais si c'est le texte, les balises ou le contexte.

---

## 4. Repli si 3.1 reste inutilisable

**La décision de conception ne dépend pas de ces deux modèles-là.** Le §8 du game design
exige *un écart audible entre les deux voix*, pas `2.5 Flash` et `3.1 Flash`. Si 3.1
reste cassé à l'approche de la date de gel :

| Repli | Effet sur l'écart |
|---|---|
| **Gemini 2.5 Pro TTS** pour IRIS, 2.5 Flash restant pour le système | Écart conservé, moins spectaculaire. **Repli recommandé** : même famille, même interface, aucune réécriture |
| Un autre fournisseur pour la voix 2 uniquement | Écart maximal, mais direction à réécrire entièrement |
| Même modèle, deux voix très différentes | Repli de dernier recours — l'effet repose alors uniquement sur le texte et le mixage |

> À décider **avant** la date de gel des assets, pas pendant. Le seul poste qui coûte
> cher en cas de bascule tardive, c'est B1 : c'est le texte qui demande le plus
> d'itérations, et le seul dont la réussite ne se juge qu'à l'oreille.

---

## Sources

- [Truncation issues persist — forum Google AI](https://discuss.ai.google.dev/t/google-gemini-flash-tts-3-1-truncation-issues-persist/172943)
- [Cuts off after two words and freezes](https://discuss.ai.google.dev/t/bug-report-gemini-3-1-flash-tts-preview-cuts-off-audio-after-two-words-and-freezes/179910)
- [500 INTERNAL on every request](https://discuss.ai.google.dev/t/bug-report-gemini-3-1-flash-tts-preview-returns-500-internal-on-every-request-tts-unusable/167574)
- [Voice drift / quality drop past ~1 minute](https://discuss.ai.google.dev/t/gemini-3-1-flash-live-voice-slowly-changing-massive-audio-quality-volume-dropping-on-tts-requests-longer-than-1-minute/142499)
- [Documentation officielle TTS](https://ai.google.dev/gemini-api/docs/speech-generation)
