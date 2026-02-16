# Supabase: Tabelle für Zeiterfassung anlegen

## Schritt-für-Schritt

1. **Supabase Dashboard öffnen**  
   [https://supabase.com/dashboard](https://supabase.com/dashboard) → dein Projekt wählen.

2. **SQL Editor öffnen**  
   Links in der Sidebar: **SQL Editor** → **New query**.

3. **SQL ausführen**  
   - Datei `supabase/time_entries.sql` im Projekt öffnen.
   - Gesamten Inhalt kopieren und in den SQL Editor einfügen.
   - Auf **Run** (oder Ctrl+Enter) klicken.

4. **Prüfen**  
   Unter **Table Editor** sollte die Tabelle **time_entries** mit den Spalten  
   `id`, `date`, `start_time`, `end_time`, `label`, `comment`, `is_billable`, `created_at`, `updated_at` erscheinen.

Danach kann die App Einträge speichern, laden und bearbeiten.
