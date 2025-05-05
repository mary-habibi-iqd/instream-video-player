
## Verwendung von Ad Rules im VAST‑Ad‑Tag

Im Ad Tag **müssen** Pre‑, Mid‑ und Post‑Rolls **nicht** explizit angegeben werden – das regeln deine **Ad Rules** in Google Ad Manager. Im Tag selbst reicht es aus:

1. **Ad Rules aktivieren**

   ```text
   &ad_rule=1
   ```

   ([Google Help][1])

2. **Gesamtdauer des Content‑Videos übermitteln**

   ```text
   &vid_d=<Videodauer in ms>
   ```

   Dieser Wert muss **immer** die vollständige Länge des **Inhalts‑Videos** (nicht der Werbespots) in Millisekunden angeben. ([Google Help][1])

3. **Cue Points übergeben** (nur bei „Every N cue points“)

   ```text
   &allcues=<Liste der Cue Points in ms>
   ```

   Beispiel:

   ```text
   &allcues=5000,60000
   ```

   für Cue Points bei 5 s und 60 s. ([Google Help][1])

> **Hinweis:** Pre‑Roll, Mid‑Roll und Post‑Roll positionierst du zentral in deinen Ad Rules – im Tag selbst genügt die Aktivierung von Ad Rules plus `vid_d` und gegebenenfalls `allcues`.

---

## 1. Unterschied zwischen „Max Ad Duration“ und „Max Pod Duration“

* **Max Ad Duration**
  Gibt die **maximale Laufzeit** einer **einzelnen** Werbeanzeige im Pod an.
  Beispiel: **120 s** → jede Ad darf bis zu 120 s lang sein, sofern der Pod genug Kapazität hat. ([Google Help][2])

* **Max Pod Duration**
  Legt die **maximale Gesamtdauer** aller Ads im Pod fest (Summe aller Spots).
  Beispiel: **32 s** → in diesem Pre‑Roll‑Pod dürfen alle zusammen maximal 32 s dauern. ([Google Help][2])

> **Praxis:** Selbst wenn eine Einzel‑Ad bis zu 120 s erlaubt ist, wird sie abgewiesen, falls sie nicht vollständig in den 32 s‑Pod‑Limit passt.

---

## 2. Anzeige‑Frequenz bei Mid‑Rolls

| Modus                  | Verhalten                                                                             |
| ---------------------- | ------------------------------------------------------------------------------------- |
| **Every N seconds**    | Mid‑Rolls erscheinen in fixen Zeitabständen (Sekunden).                               |
|                        | Beispiel: N = 60 → Pods bei 60 s, 120 s, 180 s …                                      |
| **Every N cue points** | Mid‑Rolls erscheinen bei jedem n‑ten Cue Point, den du via `allcues=` definiert hast. |
|                        | Beispiel: N = 1 → bei jedem Cue Point (z. B. `allcues=5000,60000` → 5 s und 60 s)     |

> **Wichtig:** Bei Auswahl von **“Every N seconds”** werden vorher definierte Cue Points (`allcues=`) **nicht** berücksichtigt. ([Google Help][2])

---

### Weiterführende Links

* [All VAST‑Tag‑Parameter (engl.)][1]
* [Standard Video Ad Rules (deutsch) – Google Ad Manager Help][2]

[1]: https://support.google.com/admanager/answer/10678356?hl=en
[2]: https://support.google.com/admanager/answer/9204132?hl=de
