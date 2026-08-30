import os from 'node:os';
import { DEFAULT_MJ_KEY } from '$lib/server/game/constants';
// Importer l'instance ici garantit que le jeu (et son snapshot) démarre avec le serveur.
import '$lib/server/game/instance';

const port = process.env.PORT ?? '3000';
const addresses = Object.values(os.networkInterfaces())
	.flat()
	.filter((i) => i && i.family === 'IPv4' && !i.internal)
	.map((i) => i!.address);

console.log('─'.repeat(60));
console.log('ESCAPE MMI1 — serveur de salle démarré');
for (const addr of addresses) console.log(`  postes joueurs : http://${addr}:${port}/`);
console.log(
	`  console MJ     : http://localhost:${port}/mj?key=${process.env.MJ_KEY ?? DEFAULT_MJ_KEY}`
);
console.log('─'.repeat(60));
