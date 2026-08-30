#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  ESCAPE MMI1 — préparation du laptop MJ (Linux/macOS)
#  À lancer UNE FOIS avec sudo, à la préparation des machines.
# ─────────────────────────────────────────────────────────────
set -e

if [ "$(id -u)" -ne 0 ]; then
	echo "Ce script doit être lancé avec sudo."
	exit 1
fi

PORT=3000

if command -v ufw >/dev/null 2>&1; then
	echo "Ouverture du pare-feu (ufw) pour le port $PORT/tcp…"
	ufw allow "$PORT/tcp"
elif command -v firewall-cmd >/dev/null 2>&1; then
	echo "Ouverture du pare-feu (firewalld) pour le port $PORT/tcp…"
	firewall-cmd --add-port="$PORT/tcp" --permanent
	firewall-cmd --reload
else
	echo "Aucun pare-feu géré détecté (ufw/firewalld) — rien à faire."
fi

echo
echo "Terminé. Pour lancer le serveur :  node build"
echo "(les URLs des postes et de la console MJ s'affichent au démarrage)"
