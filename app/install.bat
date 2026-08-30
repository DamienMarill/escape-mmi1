@echo off
rem ─────────────────────────────────────────────────────────────
rem  ESCAPE MMI1 — préparation du laptop MJ (Windows)
rem  À lancer UNE FOIS en administrateur, à la préparation des
rem  machines. Jamais d'élévation UAC le jour du jeu (§14).
rem ─────────────────────────────────────────────────────────────
net session >nul 2>&1
if %errorlevel% neq 0 (
	echo Ce script doit etre lance en administrateur.
	echo Clic droit ^> "Executer en tant qu'administrateur"
	pause
	exit /b 1
)

echo Ouverture du pare-feu pour le serveur de jeu (port 3000, TCP entrant)...
netsh advfirewall firewall delete rule name="Escape MMI1" >nul 2>&1
netsh advfirewall firewall add rule name="Escape MMI1" dir=in action=allow protocol=TCP localport=3000

echo.
echo Termine. Pour lancer le serveur :
echo    node build
echo (les URLs des postes et de la console MJ s'affichent au demarrage)
pause
