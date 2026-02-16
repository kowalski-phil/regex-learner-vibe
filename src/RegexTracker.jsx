import { useState, useEffect, useCallback } from "react";

const CURRICULUM = [
  {
    day: 1,
    title: "Literal Matches",
    emoji: "🔤",
    desc: "Regex-Basics: Texte exakt finden",
    theory: "Ein Regex ist ein Suchmuster. Der einfachste Regex ist ein Wort selbst: /hallo/ findet 'hallo' im Text. In Java (und KNIME) ist Regex case-sensitive. Sonderzeichen wie . * + ? \\ [ ] { } ( ) ^ $ | müssen mit \\\\ escaped werden. In KNIME-Nodes wie String Manipulation, Row Filter oder Column Rename gibst du das Pattern direkt ein – ohne umschließende Slashes.",
    example: { pattern: "Siemens", text: "Siemens AG ist ein globaler Konzern. Siemens Healthineers auch.", expected: "Siemens" },
    challenges: [
      { q: "Finde 'KNIME' in: 'KNIME Analytics Platform rocks'", answer: "KNIME", hint: "Einfach das Wort selbst" },
      { q: "Finde den Punkt in: 'Version 5.4.2'", answer: "\\.", hint: "Punkt ist ein Sonderzeichen – escape mit \\\\" },
    ],
  },
  {
    day: 2,
    title: "Character Classes",
    emoji: "📦",
    desc: "Zeichenklassen mit [abc] und [a-z]",
    theory: "[abc] matcht EIN Zeichen: a, b oder c. [a-z] matcht Kleinbuchstaben, [A-Z] Großbuchstaben, [0-9] Ziffern. [^abc] matcht alles AUSSER a, b, c. Java-Besonderheit: Innerhalb von [] muss nur ], \\, ^ (am Anfang) und - (in der Mitte) escaped werden. In KNIME Column Filter kannst du Regex nutzen, um Spalten nach Muster zu selektieren.",
    example: { pattern: "[aeiou]", text: "KNIME workflow", expected: "o" },
    challenges: [
      { q: "Matche einen Großbuchstaben oder eine Ziffer", answer: "[A-Z0-9]", hint: "Zwei Bereiche in einer Klasse" },
      { q: "Matche alles AUSSER Ziffern", answer: "[^0-9]", hint: "^ am Anfang der Klasse negiert" },
    ],
  },
  {
    day: 3,
    title: "Vordefinierte Klassen",
    emoji: "⚡",
    desc: "Shortcuts: \\d, \\w, \\s und Java Unicode",
    theory: "\\d = Ziffer [0-9], \\D = keine Ziffer. \\w = Wortzeichen [a-zA-Z0-9_], \\W = kein Wortzeichen. \\s = Whitespace (Leerzeichen, Tab, Newline), \\S = kein Whitespace. Der Punkt . matcht alles AUSSER Newline (es sei denn (?s) ist aktiv). Java-Bonus: \\p{L} matcht JEDEN Unicode-Buchstaben (auch ä, ö, ü, é). Super nützlich in KNIME für internationale Daten!",
    example: { pattern: "\\d{2}\\.\\d{2}\\.\\d{4}", text: "Rechnung vom 14.02.2026", expected: "14.02.2026" },
    challenges: [
      { q: "Matche deutsche Umlaute und Buchstaben", answer: "\\p{L}", hint: "\\p{L} für Unicode Letters" },
      { q: "Matche 3 aufeinanderfolgende Whitespace-Zeichen", answer: "\\s{3}", hint: "\\s mit Quantifizierer" },
    ],
  },
  {
    day: 4,
    title: "Quantifizierer Basics",
    emoji: "🔁",
    desc: "Wiederholungen: *, +, ? und Greedy-Verhalten",
    theory: "* = 0 oder mehr (greedy). + = 1 oder mehr (greedy). ? = 0 oder 1 (optional). Standardmäßig sind Java-Quantifizierer GREEDY – sie matchen so viel wie möglich. Beispiel: .* frisst den ganzen String! In KNIME String Manipulation: $column$.matches(\"regex\") prüft ob der GESAMTE String matcht (implizites ^...$).",
    example: { pattern: "https?", text: "http und https sind Protokolle", expected: "http" },
    challenges: [
      { q: "Matche 'colour' und 'color'", answer: "colou?r", hint: "Das u ist optional" },
      { q: "Matche eine oder mehr Ziffern am Stück", answer: "\\d+", hint: "\\d mit +" },
    ],
  },
  {
    day: 5,
    title: "Exakte Quantifizierer",
    emoji: "🎯",
    desc: "Präzise mit {n}, {n,m} und Possessive",
    theory: "{3} = exakt 3x. {2,5} = 2 bis 5x. {3,} = mindestens 3x. Java-Exklusiv: POSSESSIVE Quantifizierer mit ++ / *+ / ?+ – wie greedy, aber OHNE Backtracking. Beispiel: \\d++ gibt niemals Zeichen zurück. Vorteil: deutlich schneller bei großen Datenmengen in KNIME Workflows!",
    example: { pattern: "\\d{5}", text: "PLZ: 91052 Erlangen", expected: "91052" },
    challenges: [
      { q: "Matche eine deutsche IBAN (DE + 20 Zeichen)", answer: "DE\\d{20}", hint: "DE gefolgt von exakt 20 Ziffern" },
      { q: "Matche 2-4 Großbuchstaben (possessive)", answer: "[A-Z]{2,4}+", hint: "Füge + nach {2,4} hinzu" },
    ],
  },
  {
    day: 6,
    title: "Anker & Boundaries",
    emoji: "⚓",
    desc: "Position: ^, $, \\b und Java \\G",
    theory: "^ = Zeilenanfang (mit (?m) auch jede Zeile). $ = Zeilenende. \\b = Wortgrenze. \\B = KEINE Wortgrenze. Java-Exklusiv: \\G = Ende des letzten Matches (nützlich für fortlaufende Suche). Wichtig in KNIME: .matches() prüft den GESAMTEN String, .find() sucht Teilstrings. Bei Row Filter mit Regex wird oft implizit der ganze String geprüft!",
    example: { pattern: "\\bKNIME\\b", text: "KNIME ist toll, unKNIMElich nicht", expected: "KNIME" },
    challenges: [
      { q: "Matche 'end' nur am Stringende", answer: "end$", hint: "$ für das Ende" },
      { q: "Matche 'log' als ganzes Wort (nicht 'catalog')", answer: "\\blog\\b", hint: "Wortgrenzen mit \\b" },
    ],
  },
  {
    day: 7,
    title: "🏆 Woche 1 Review",
    emoji: "🏆",
    desc: "KNIME Praxis-Challenges!",
    theory: "Zeit für Praxis! Typische KNIME-Szenarien: Spalten filtern, Strings bereinigen, Daten extrahieren. Denk dran: In KNIME String Manipulation nutzt du regexMatcher() und regexReplace(). Im Column Rename Node kannst du Regex für Bulk-Umbenennung nutzen. Tipp: regex101.com mit 'Java 8' Flavor zum Testen!",
    example: { pattern: "[A-Z]{2}\\d{2}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{4}\\s?\\d{2}", text: "IBAN: DE89 3704 0044 0532 0130 00", expected: "DE89 3704 0044 0532 0130 00" },
    challenges: [
      { q: "Matche eine Spalte die mit 'Amount' beginnt", answer: "Amount.*", hint: "Amount gefolgt von beliebigen Zeichen" },
      { q: "Bereinige: Matche führende/trailings Leerzeichen", answer: "^\\s+|\\s+$", hint: "Alternation: Anfang ODER Ende" },
    ],
  },
  {
    day: 8,
    title: "Gruppen & Capturing",
    emoji: "🫧",
    desc: "Capture Groups und Java Named Groups",
    theory: "() erstellt eine nummerierte Capture Group (Gruppe 1, 2, ...). In Java: (?<name>...) für BENANNTE Gruppen. Zurückreferenz: \\1 oder \\k<name>. (?:...) = Non-Capturing Group (für Gruppierung ohne Capture). In KNIME Regex Split oder String Manipulation kannst du $1, $2 nutzen, um Captures zu extrahieren!",
    example: { pattern: "(\\d{2})\\.(\\d{2})\\.(\\d{4})", text: "Datum: 14.02.2026", expected: "14.02.2026" },
    challenges: [
      { q: "Erfasse Vorname und Nachname separat", answer: "(?<vorname>\\w+)\\s(?<nachname>\\w+)", hint: "Benannte Gruppen mit (?<name>...)" },
      { q: "Gruppiere ohne zu capturen: (Mon|Die|Mit)tag", answer: "(?:Mon|Die|Mit)tag", hint: "(?:...) für Non-Capturing" },
    ],
  },
  {
    day: 9,
    title: "Alternation & Inline Flags",
    emoji: "🔀",
    desc: "Oder mit | und Java Inline-Flags",
    theory: "| = ODER-Verknüpfung. Java Inline-Flags ändern das Verhalten INNERHALB des Patterns: (?i) = case-insensitive. (?m) = multiline (^ und $ pro Zeile). (?s) = dotall (. matcht auch \\n). (?x) = comments mode (Whitespace wird ignoriert, # für Kommentare). Flags können kombiniert werden: (?ims). Super in KNIME wenn du Groß/Kleinschreibung ignorieren willst!",
    example: { pattern: "(?i)knime|python|r", text: "KNIME und Python und R sind Data-Tools", expected: "KNIME" },
    challenges: [
      { q: "Matche 'error', 'Error', 'ERROR' ohne [Ee]", answer: "(?i)error", hint: "Inline-Flag (?i) für case-insensitive" },
      { q: "Matche 'GmbH', 'AG' oder 'SE' (Rechtsformen)", answer: "GmbH|AG|SE", hint: "Pipe zwischen den Optionen" },
    ],
  },
  {
    day: 10,
    title: "Lookahead",
    emoji: "👀",
    desc: "Vorausschauen: (?=) und (?!)",
    theory: "(?=...) = Positiver Lookahead: prüft ob etwas FOLGT, ohne es zu matchen. (?!...) = Negativer Lookahead: prüft ob etwas NICHT folgt. Zero-width assertion – verbraucht keine Zeichen. Extrem nützlich in KNIME für bedingte Extraktion: Finde Zahlen nur wenn € dahinter steht, ohne das € mitzunehmen.",
    example: { pattern: "\\d+(?=€)", text: "Preis: 50€ und 30$ und 20€", expected: "50" },
    challenges: [
      { q: "Finde Wörter gefolgt von einem Komma", answer: "\\w+(?=,)", hint: "Lookahead auf Komma" },
      { q: "Finde Zahlen NICHT gefolgt von '%'", answer: "\\d+(?!%)", hint: "Negativer Lookahead (?!...)" },
    ],
  },
  {
    day: 11,
    title: "Lookbehind",
    emoji: "🔙",
    desc: "Zurückschauen: (?<=) und (?<!)",
    theory: "(?<=...) = Positiver Lookbehind: prüft was DAVOR steht. (?<!...) = Negativer Lookbehind: prüft was NICHT davor steht. Java-Einschränkung: Lookbehind muss eine FESTE Länge haben (kein *, + erlaubt, aber Alternation mit fester Länge geht). Nützlich in KNIME: Extrahiere Beträge nach 'EUR' ohne 'EUR' selbst.",
    example: { pattern: "(?<=EUR\\s)\\d+[.,]\\d{2}", text: "Betrag: EUR 1.250,00 netto", expected: "1.250,00" },
    challenges: [
      { q: "Finde Zahlen nach '#' (Issue-Nummern)", answer: "(?<=#)\\d+", hint: "Lookbehind auf #" },
      { q: "Finde Wörter NICHT nach 'un' (z.B. nicht 'unmöglich')", answer: "(?<!un)möglich", hint: "Negativer Lookbehind (?<!un)" },
    ],
  },
  {
    day: 12,
    title: "Greedy vs. Lazy vs. Possessive",
    emoji: "🍔",
    desc: "Drei Matching-Strategien in Java",
    theory: "GREEDY (Standard): .* matcht so VIEL wie möglich, gibt bei Bedarf zurück (Backtracking). LAZY/RELUCTANT: .*? matcht so WENIG wie möglich. POSSESSIVE (Java-exklusiv!): .*+ matcht so viel wie möglich und gibt NIE zurück – kein Backtracking! Possessive ist schneller, kann aber zu 'no match' führen. In KNIME bei großen Datasets: Possessive Quantifizierer können Performance drastisch verbessern!",
    example: { pattern: '".*?"', text: '"Hallo" und "Welt" sind Strings', expected: '"Hallo"' },
    challenges: [
      { q: "Extrahiere den KÜRZESTEN Text in <tags>", answer: "<.*?>", hint: "Lazy: .*?" },
      { q: "Matche Ziffern possessiv (ohne Backtracking)", answer: "\\d++", hint: "Doppeltes + für possessive" },
    ],
  },
  {
    day: 13,
    title: "Unicode & \\Q...\\E",
    emoji: "🌍",
    desc: "Java Unicode Properties und Literal Quoting",
    theory: "Java unterstützt Unicode Properties: \\p{L} = jeder Buchstabe (inkl. Umlaute!), \\p{N} = jede Zahl, \\p{Lu} = Großbuchstaben, \\p{Ll} = Kleinbuchstaben, \\p{P} = Satzzeichen, \\p{Sc} = Währungssymbole (€, $, £). \\Q...\\E behandelt alles dazwischen als LITERAL – kein Escaping nötig! In KNIME ideal für User-Input der Sonderzeichen enthalten könnte.",
    example: { pattern: "\\p{Sc}\\d+", text: "Preise: €50 und $30 und £20", expected: "€50" },
    challenges: [
      { q: "Matche alle Unicode-Buchstaben (auch Ümläute)", answer: "\\p{L}+", hint: "\\p{L} für Letter" },
      { q: "Matche literal '$100.00' mit \\Q...\\E", answer: "\\Q$100.00\\E", hint: "Alles zwischen \\Q und \\E ist literal" },
    ],
  },
  {
    day: 14,
    title: "🎓 KNIME Regex Meister",
    emoji: "🎓",
    desc: "Real-World Patterns für KNIME Workflows",
    theory: "Jetzt alles zusammen! Praxis-Patterns für KNIME: Daten bereinigen mit Regex Replace, Spalten extrahieren mit Regex Split, Rows filtern mit Pattern Matching. Denk dran: In KNIME String Manipulation ist die Syntax regexReplace($col$, 'pattern', 'replacement') – mit $1, $2 für Gruppen im Replacement. Teste immer auf regex101.com (Java 8 Flavor)!",
    example: { pattern: "(?<betrag>\\d{1,3}(?:\\.\\d{3})*,\\d{2})\\s*(?<waehrung>EUR|USD)", text: "Total: 1.250,00 EUR netto", expected: "1.250,00 EUR" },
    challenges: [
      { q: "Extrahiere Domain aus E-Mail: user@domain.de", answer: "(?<=@)[\\w.-]+", hint: "Lookbehind auf @ und dann Wortzeichen + Punkt" },
      { q: "Bereinige Telefonnr: Behalte nur Ziffern und +", answer: "[^\\d+]", hint: "Negierte Klasse: alles AUSSER Ziffern und +" },
    ],
  },
];

const STORAGE_KEY = "regex-java-tracker-v2";

export default function RegexTracker() {
  const [progress, setProgress] = useState({});
  const [activeDay, setActiveDay] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showHints, setShowHints] = useState({});
  const [regexInput, setRegexInput] = useState("");
  const [testText, setTestText] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [showFlags, setShowFlags] = useState(false);
  const [flags, setFlags] = useState("g");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setProgress(JSON.parse(saved));
    } catch {}
    setLoaded(true);
  }, []);

  const saveProgress = useCallback((np) => {
    setProgress(np);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(np)); } catch {}
  }, []);

  const completedDays = Object.keys(progress).filter((k) => progress[k]?.done).length;
  const pct = Math.round((completedDays / 14) * 100);

  const markDone = (day) => saveProgress({ ...progress, [day]: { done: true, date: new Date().toISOString() } });

  const resetProgress = () => {
    setProgress({});
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  };

  const getMatches = (pattern, text, f) => {
    try {
      const re = new RegExp(pattern, f || "g");
      const matches = [];
      let m;
      while ((m = re.exec(text)) !== null) {
        matches.push({ index: m.index, text: m[0], groups: m.slice(1) });
        if (m.index === re.lastIndex) re.lastIndex++;
        if (!f?.includes("g")) break;
      }
      return matches;
    } catch { return []; }
  };

  const highlightText = (text, pattern, f) => {
    if (!pattern) return <span>{text}</span>;
    const matches = getMatches(pattern, text, f);
    if (!matches.length) return <span style={{ opacity: 0.5 }}>{text}</span>;
    const parts = [];
    let last = 0;
    matches.forEach((m, i) => {
      if (m.index > last) parts.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
      parts.push(
        <span key={`m${i}`} style={{
          background: "linear-gradient(135deg, #e85d26, #f0a830)",
          color: "#0d1117",
          padding: "1px 5px",
          borderRadius: 3,
          fontWeight: 700,
          boxShadow: "0 0 8px #e85d2640",
        }}>{m.text}</span>
      );
      last = m.index + m.text.length;
    });
    if (last < text.length) parts.push(<span key="end">{text.slice(last)}</span>);
    return <>{parts}</>;
  };

  if (!loaded) return (
    <div style={{ color: "#8b949e", textAlign: "center", padding: 80, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>Lade Fortschritt...
    </div>
  );

  const lesson = activeDay !== null ? CURRICULUM[activeDay] : null;

  const chipStyle = (active) => ({
    fontSize: 10, fontWeight: 700, letterSpacing: 0.8,
    padding: "3px 8px", borderRadius: 4, cursor: "pointer", border: "none",
    fontFamily: "inherit", transition: "all 0.15s",
    background: active ? "#e85d2630" : "#21262d",
    color: active ? "#e85d26" : "#8b949e",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      color: "#c9d1d9",
      padding: "24px 16px",
      boxSizing: "border-box",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ maxWidth: 800, margin: "0 auto 28px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 6 }}>
          <div>
            <div style={{
              fontSize: 32, fontWeight: 800, letterSpacing: "-1.5px",
              fontFamily: "'Outfit', sans-serif", color: "#f0f6fc",
            }}>
              <span style={{ color: "#e85d26" }}>/</span>Regex Sprint<span style={{ color: "#e85d26" }}>/</span>
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              <span style={{
                background: "#e85d2618", border: "1px solid #e85d2630", borderRadius: 6,
                padding: "2px 10px", fontSize: 10, color: "#e85d26", fontWeight: 700,
              }}>JAVA REGEX</span>
              <span style={{
                background: "#f0a83018", border: "1px solid #f0a83030", borderRadius: 6,
                padding: "2px 10px", fontSize: 10, color: "#f0a830", fontWeight: 700,
              }}>KNIME-READY</span>
              <span style={{
                background: "#3fb95018", border: "1px solid #3fb95030", borderRadius: 6,
                padding: "2px 10px", fontSize: 10, color: "#3fb950", fontWeight: 700,
              }}>14 TAGE · 15 MIN/TAG</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{
          background: "#161b22", borderRadius: 14, padding: 16,
          border: "1px solid #21262d", marginTop: 18,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", fontFamily: "'Outfit', sans-serif" }}>
              {completedDays}/14 Tage abgeschlossen
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                fontSize: 24, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
                color: pct === 100 ? "#3fb950" : "#e85d26",
              }}>{pct}%</span>
              {completedDays > 0 && (
                <button onClick={resetProgress} style={{
                  background: "none", border: "1px solid #21262d", color: "#484f58",
                  borderRadius: 6, padding: "2px 8px", fontSize: 9, cursor: "pointer",
                  fontFamily: "inherit",
                }} title="Fortschritt zurücksetzen">↺</button>
              )}
            </div>
          </div>
          <div style={{ background: "#0d1117", borderRadius: 8, height: 8, overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${pct}%`,
              background: pct === 100
                ? "linear-gradient(90deg, #238636, #3fb950)"
                : "linear-gradient(90deg, #e85d26, #f0a830)",
              borderRadius: 8, transition: "width 0.5s ease",
            }} />
          </div>
          {pct === 100 && (
            <div style={{
              marginTop: 10, textAlign: "center", fontSize: 14, color: "#3fb950",
              fontWeight: 700, fontFamily: "'Outfit', sans-serif",
            }}>🏆 Regex Meister! Du beherrschst Java Regex für KNIME!</div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        {lesson ? (
          <div style={{ animation: "fadeSlide 0.3s ease" }}>
            <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>

            <button onClick={() => { setActiveDay(null); setAnswers({}); setShowHints({}); setRegexInput(""); setTestText(""); }}
              style={{
                background: "none", border: "none", color: "#e85d26", cursor: "pointer",
                fontSize: 12, fontWeight: 600, marginBottom: 16, padding: 0, fontFamily: "inherit",
              }}>← Übersicht</button>

            <div style={{
              background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: 24, marginBottom: 14,
            }}>
              {/* Day Header */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg, #e85d2620, #f0a83020)",
                  border: "1px solid #e85d2630",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                }}>{lesson.emoji}</div>
                <div>
                  <div style={{ fontSize: 10, color: "#e85d26", fontWeight: 700, letterSpacing: 1.2, textTransform: "uppercase" }}>
                    Tag {lesson.day} · 15 Min
                  </div>
                  <h2 style={{
                    margin: "2px 0 0", fontSize: 22, color: "#f0f6fc", fontWeight: 700,
                    fontFamily: "'Outfit', sans-serif",
                  }}>{lesson.title}</h2>
                </div>
              </div>

              {/* Theory */}
              <div style={{
                background: "#0d1117", borderRadius: 10, padding: 16, marginBottom: 20,
                borderLeft: "3px solid #e85d26", fontSize: 13, lineHeight: 1.75, color: "#b1bac4",
              }}>{lesson.theory}</div>

              {/* Live Example */}
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 10, color: "#484f58", fontWeight: 700, marginBottom: 8,
                  textTransform: "uppercase", letterSpacing: 1.5,
                }}>Live-Beispiel</div>
                <div style={{
                  background: "#0d1117", borderRadius: 10, padding: 14, border: "1px solid #21262d",
                }}>
                  <div style={{ fontSize: 11, marginBottom: 6, color: "#484f58" }}>
                    Pattern: <code style={{ color: "#f0a830", fontWeight: 700, fontSize: 13 }}>{lesson.example.pattern}</code>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.8 }}>
                    {highlightText(lesson.example.text, lesson.example.pattern)}
                  </div>
                </div>
              </div>

              {/* Challenges */}
              <div style={{
                fontSize: 10, color: "#484f58", fontWeight: 700, marginBottom: 10,
                textTransform: "uppercase", letterSpacing: 1.5,
              }}>Challenges</div>
              {lesson.challenges.map((ch, ci) => {
                const key = `${lesson.day}-${ci}`;
                const userAns = answers[key] || "";
                const isCorrect = userAns.trim() === ch.answer;
                return (
                  <div key={ci} style={{
                    background: "#0d1117", borderRadius: 10, padding: 14, marginBottom: 10,
                    border: `1px solid ${isCorrect ? "#23863650" : "#21262d"}`,
                    transition: "border-color 0.3s",
                  }}>
                    <div style={{ fontSize: 13, marginBottom: 10, color: "#e6edf3", lineHeight: 1.5 }}>{ch.q}</div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                      <code style={{ color: "#e85d26", fontSize: 16, fontWeight: 300 }}>/</code>
                      <input
                        value={userAns}
                        onChange={(e) => setAnswers({ ...answers, [key]: e.target.value })}
                        placeholder="Dein Pattern..."
                        style={{
                          background: "#161b22",
                          border: `1px solid ${isCorrect ? "#238636" : "#30363d"}`,
                          borderRadius: 6, padding: "7px 11px", color: "#f0f6fc",
                          fontFamily: "inherit", fontSize: 13, flex: 1, minWidth: 120, outline: "none",
                          transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => e.target.style.borderColor = "#e85d26"}
                        onBlur={(e) => e.target.style.borderColor = isCorrect ? "#238636" : "#30363d"}
                      />
                      <code style={{ color: "#e85d26", fontSize: 16, fontWeight: 300 }}>/</code>
                      {isCorrect && <span style={{ color: "#3fb950", fontWeight: 700, fontSize: 20 }}>✓</span>}
                    </div>
                    {!isCorrect && (
                      <button onClick={() => setShowHints({ ...showHints, [key]: !showHints[key] })}
                        style={{
                          background: "none", border: "none", color: "#f0a830", cursor: "pointer",
                          fontSize: 11, padding: "8px 0 0", fontFamily: "inherit", opacity: 0.8,
                        }}>
                        {showHints[key] ? `💡 ${ch.hint}` : "💡 Hinweis"}
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Complete Button */}
              <div style={{ textAlign: "center", marginTop: 24 }}>
                {progress[lesson.day]?.done ? (
                  <div style={{
                    color: "#3fb950", fontWeight: 700, fontSize: 14, fontFamily: "'Outfit', sans-serif",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 20 }}>✅</span> Tag {lesson.day} abgeschlossen
                  </div>
                ) : (
                  <button onClick={() => markDone(lesson.day)} style={{
                    background: "linear-gradient(135deg, #e85d26, #f0a830)",
                    border: "none", borderRadius: 10, padding: "12px 36px",
                    color: "#0d1117", fontWeight: 800, fontSize: 14, cursor: "pointer",
                    fontFamily: "'Outfit', sans-serif", letterSpacing: "0.5px",
                    boxShadow: "0 4px 24px #e85d2640",
                  }}>Tag {lesson.day} abschließen ✓</button>
                )}
              </div>
            </div>

            {/* Playground */}
            <div style={{
              background: "#161b22", border: "1px solid #21262d", borderRadius: 16, padding: 20,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{
                  fontSize: 10, color: "#e85d26", fontWeight: 700, letterSpacing: 1.5,
                  textTransform: "uppercase",
                }}>🧪 Java Regex Playground</div>
                <button onClick={() => setShowFlags(!showFlags)} style={chipStyle(showFlags)}>
                  FLAGS
                </button>
              </div>

              {showFlags && (
                <div style={{
                  display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap",
                }}>
                  {[
                    { f: "g", label: "global", desc: "Alle Matches" },
                    { f: "i", label: "(?i)", desc: "Case-insensitive" },
                    { f: "m", label: "(?m)", desc: "Multiline" },
                    { f: "s", label: "(?s)", desc: "Dotall" },
                  ].map(({ f, label, desc }) => (
                    <button key={f} onClick={() => {
                      setFlags(flags.includes(f) ? flags.replace(f, "") : flags + f);
                    }} style={{
                      ...chipStyle(flags.includes(f)),
                      display: "flex", alignItems: "center", gap: 4,
                    }} title={desc}>
                      {label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
                <code style={{ color: "#e85d26", fontSize: 18, fontWeight: 300 }}>/</code>
                <input
                  value={regexInput}
                  onChange={(e) => setRegexInput(e.target.value)}
                  placeholder="Pattern eingeben..."
                  style={{
                    background: "#0d1117", border: "1px solid #21262d", borderRadius: 6,
                    padding: "9px 12px", color: "#f0f6fc", fontFamily: "inherit", fontSize: 14,
                    flex: 1, minWidth: 140, outline: "none",
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#e85d26"}
                  onBlur={(e) => e.target.style.borderColor = "#21262d"}
                />
                <code style={{ color: "#e85d26", fontSize: 18, fontWeight: 300 }}>/{flags}</code>
              </div>
              <textarea
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Test-String hier eingeben..."
                rows={3}
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#0d1117", border: "1px solid #21262d", borderRadius: 8,
                  padding: 12, color: "#f0f6fc", fontFamily: "inherit", fontSize: 13,
                  resize: "vertical", outline: "none", lineHeight: 1.6,
                }}
                onFocus={(e) => e.target.style.borderColor = "#e85d26"}
                onBlur={(e) => e.target.style.borderColor = "#21262d"}
              />
              {regexInput && testText && (() => {
                const matches = getMatches(regexInput, testText, flags);
                const isError = (() => { try { new RegExp(regexInput); return false; } catch { return true; } })();
                return (
                  <div style={{
                    marginTop: 12, background: "#0d1117", borderRadius: 8, padding: 14,
                    border: `1px solid ${isError ? "#f8514950" : "#21262d"}`,
                  }}>
                    {isError ? (
                      <div style={{ color: "#f85149", fontSize: 12 }}>⚠ Ungültiges Pattern</div>
                    ) : (
                      <>
                        <div style={{ fontSize: 14, lineHeight: 1.8, marginBottom: 8 }}>
                          {highlightText(testText, regexInput, flags)}
                        </div>
                        <div style={{
                          display: "flex", gap: 16, fontSize: 11, color: "#484f58",
                          borderTop: "1px solid #21262d", paddingTop: 8,
                        }}>
                          <span><strong style={{ color: "#e85d26" }}>{matches.length}</strong> Match(es)</span>
                          {matches.length > 0 && matches[0].groups?.length > 0 && (
                            <span>Groups: {matches[0].groups.map((g, i) =>
                              <code key={i} style={{ color: "#f0a830", marginLeft: 4 }}>${i + 1}="{g}"</code>
                            )}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* KNIME Tip */}
              <div style={{
                marginTop: 14, background: "#f0a83010", borderRadius: 8, padding: 12,
                border: "1px solid #f0a83020", fontSize: 11, color: "#f0a830", lineHeight: 1.6,
              }}>
                💡 <strong>KNIME-Tipp:</strong> In String Manipulation nutze <code style={{ background: "#0d1117", padding: "1px 5px", borderRadius: 3 }}>regexMatcher($column$, "pattern")</code> zum Testen und <code style={{ background: "#0d1117", padding: "1px 5px", borderRadius: 3 }}>regexReplace($col$, "pattern", "$1")</code> zum Ersetzen. Teste Patterns auf regex101.com mit Flavor „Java 8".
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Week Labels */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
              {[
                { label: "Woche 1: Grundlagen", color: "#e85d26" },
                { label: "Woche 2: Java-Power", color: "#f0a830" },
              ].map((w, i) => (
                <span key={i} style={{
                  fontSize: 11, fontWeight: 700, color: w.color,
                  background: `${w.color}12`, border: `1px solid ${w.color}25`,
                  padding: "4px 14px", borderRadius: 8,
                  fontFamily: "'Outfit', sans-serif",
                }}>{w.label}</span>
              ))}
            </div>

            {/* Day Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 10 }}>
              {CURRICULUM.map((day, i) => {
                const done = progress[day.day]?.done;
                const isWeek2 = i >= 7;
                return (
                  <button key={i} onClick={() => setActiveDay(i)} style={{
                    background: done ? "#161b22" : "#0d1117",
                    border: `1px solid ${done ? "#23863630" : "#21262d"}`,
                    borderRadius: 12, padding: "16px 14px", cursor: "pointer", textAlign: "left",
                    transition: "all 0.2s ease", position: "relative", overflow: "hidden",
                    fontFamily: "inherit",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = done ? "#238636" : "#e85d26"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = done ? "#23863630" : "#21262d"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {done && <div style={{
                      position: "absolute", top: 0, left: 0, right: 0, height: 2,
                      background: "linear-gradient(90deg, #238636, #3fb950)",
                    }} />}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span style={{ fontSize: 26 }}>{day.emoji}</span>
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: 1.2,
                        color: done ? "#3fb950" : isWeek2 ? "#f0a830" : "#e85d26",
                      }}>{done ? "✓ DONE" : `TAG ${day.day}`}</span>
                    </div>
                    <div style={{
                      fontSize: 14, fontWeight: 700, color: "#f0f6fc", marginBottom: 4,
                      fontFamily: "'Outfit', sans-serif",
                    }}>{day.title}</div>
                    <div style={{ fontSize: 11, color: "#484f58", lineHeight: 1.4 }}>{day.desc}</div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
