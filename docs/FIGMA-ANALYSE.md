# Figma-Design: Zugriff & Umsetzung

## Warum der direkte Figma-Zugriff nicht funktioniert

Beim Abruf der Figma-URL  
`https://www.figma.com/design/PRzzftFXrYVfcHkVl8b0ei/Leistungserfassung?node-id=59-17885`  
tritt ein **Timeout** auf. Typische Ursachen:

1. **Figma ist eine SPA**  
   Der sichtbare Design-Inhalt wird per JavaScript nachgeladen. Ein einfacher HTTP-Request erhält nur das Grundgerüst der Web-App, nicht die gerenderten Frames oder Export-Daten.

2. **Login/Rechte**  
   Auch bei „geteilten“ Links kann Figma Cookies oder eine Session erwarten. Der Abruf aus einer isolierten Umgebung (z.B. Cursor/CI) hat keine Figma-Session.

3. **Keine Figma-API im Projekt**  
   Um Designs programmatisch zu nutzen, braucht man entweder:
   - die **Figma REST API** (mit Personal Access Token) zum Auslesen von Frames, Styles und Komponenten, oder
   - manuelle Übernahme von Screens/Specs aus dem Figma-UI.

4. **Netzwerk/Umgebung**  
   Timeouts können durch restriktive Netzwerke, Proxys oder fehlende Zugriffsrechte auf figma.com entstehen.

---

## Lösungswege

| Weg | Beschreibung |
|-----|--------------|
| **Figma API** | Personal Access Token in Figma erstellen, API (z.B. `GET /v1/files/:key` und Nodes) aufrufen. Farben, Abstände und Texte können aus dem JSON ausgelesen und in Tokens/Komponenten überführt werden. |
| **Figma Dev Mode / Inspect** | Im Browser „Inspect“ nutzen, CSS/Farben/Abstände ablesen und manuell in Tokens (z.B. `figma-tokens.css`) und Komponenten übernehmen. |
| **Export aus Figma** | Screens exportieren oder mit Plugins (z.B. „Figma to Code“, „Anima“) HTML/CSS/React-Snippets erzeugen und in das Projekt integrieren. |
| **Bereits umgesetzte Demo** | In diesem Projekt ist das Design **Frame 59:17885** (Node-ID `59-17885`) bereits in `app/figma-demo3/` umgesetzt – inkl. `figma-tokens.css` und React-Komponenten. Diese Umsetzung wurde in die Hauptseite integriert. |

---

## Umsetzung in diesem Projekt

- **Design-Referenz:** Figma „Leistungserfassung“, Node-ID `59-17885`.
- **Tokens:** `app/figma-demo3/figma-tokens.css` (Farben, Abstände).
- **Komponenten:** Header, Steuerung, Favoriten-Leiste, Kalender-Grid mit Tageszellen und Task-Chips.
- **Hauptseite:** `app/page.tsx` verwendet dieses Figma-Design; die Demo bleibt zusätzlich unter `/figma-demo3` erreichbar.

Wenn sich das Figma-Design ändert, die API nutzen oder die Tokens aus dem Dev Mode aktualisieren und ggf. die Komponenten in `app/figma-demo3/` und `app/page.tsx` anpassen.
