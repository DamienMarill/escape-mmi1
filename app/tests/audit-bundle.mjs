// Audit anti-fuite : vérifie qu'aucune chaîne connue du code SERVEUR
// (clé MJ, solutions, journaux internes) n'apparaît dans le bundle client.
// Usage : node tests/audit-bundle.mjs   (après un build)

import fs from 'node:fs';
import path from 'node:path';

const CLIENT_DIR = path.resolve('build', 'client');

// Chaînes qui n'existent QUE dans lib/server/ — toute occurrence côté client
// signifie qu'un module serveur a fuité dans le bundle.
const SENTINELS = [
	'brassens', // clé MJ par défaut
	'triche MJ', // journal serveur
	'anti-brute-force', // journal serveur
	'procédure automatique — noyau supprimé', // fin A serveur
	'consulter le plan de câblage', // message de validation BRASSAGE
	'machine légitime', // message de validation SCAN
	'cette ligne est intègre', // message de validation PARITÉ
	'pistes désynchronisées', // message de validation SYNCHRO
	'fragmentation détectée', // message de validation MÉMOIRE
	'erreur non isolée' // message de validation COMPILATION
];

if (!fs.existsSync(CLIENT_DIR)) {
	console.error(`[audit] dossier introuvable : ${CLIENT_DIR} — lancer le build d'abord`);
	process.exit(2);
}

const files = [];
(function walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name);
		if (entry.isDirectory()) walk(p);
		else if (/\.(js|css|json|html)$/.test(entry.name)) files.push(p);
	}
})(CLIENT_DIR);

let leaks = 0;
for (const file of files) {
	const content = fs.readFileSync(file, 'utf-8');
	for (const sentinel of SENTINELS) {
		if (content.includes(sentinel)) {
			console.error(`[audit] FUITE : « ${sentinel} » trouvé dans ${path.relative('.', file)}`);
			leaks++;
		}
	}
}

if (leaks > 0) {
	console.error(`[audit] ÉCHEC — ${leaks} fuite(s) détectée(s) dans le bundle client`);
	process.exit(1);
}
console.log(`[audit] OK — ${files.length} fichiers client inspectés, aucune fuite`);
