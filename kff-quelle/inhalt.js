// Inhalte der textbasierten Untertests. Jede Loesung wird in pruefen.js
// maschinell gegengerechnet, damit im PDF nichts Falsches landet.

const zahlenfolgen = [
  { folge: [3, 6, 12, 24, 48], regel: 'Jede Zahl wird verdoppelt.',
    schritt: n => n * 2, optionen: [72, 96, 84, 92, 108] },
  { folge: [4, 5, 8, 13, 20], regel: 'Die Abstaende wachsen um je 2: +1, +3, +5, +7, +9.',
    schritte: [1, 3, 5, 7, 9], optionen: [27, 28, 29, 31, 33] },
  { folge: [81, 64, 49, 36], regel: 'Quadratzahlen absteigend: 9², 8², 7², 6², 5².',
    werte: [81, 64, 49, 36, 25], optionen: [24, 25, 27, 30, 32] },
  { folge: [2, 5, 11, 23, 47], regel: 'Verdoppeln und 1 addieren.',
    schritt: n => n * 2 + 1, optionen: [93, 94, 95, 96, 99] },
  { folge: [100, 50, 52, 26, 28], regel: 'Abwechselnd halbieren und 2 addieren.',
    wechsel: [n => n / 2, n => n + 2], optionen: [13, 14, 15, 26, 30] },
  { folge: [2, 3, 5, 8, 13, 21], regel: 'Jede Zahl ist die Summe der beiden davor.',
    fib: true, optionen: [29, 31, 34, 42, 55] },
  { folge: [7, 14, 10, 20, 16, 32], regel: 'Abwechselnd verdoppeln und 4 abziehen.',
    wechsel: [n => n * 2, n => n - 4], optionen: [24, 26, 28, 30, 64] },
  { folge: [3, 4, 8, 9, 27, 28], regel: 'Abwechselnd +1 und mal 2, mal 3, mal 4 …',
    kette: [n => n + 1, n => n * 2, n => n + 1, n => n * 3, n => n + 1, n => n * 4],
    optionen: [56, 84, 112, 116, 140] },
  { folge: [1, 2, 6, 24, 120], regel: 'Mal 2, mal 3, mal 4, mal 5, mal 6 …',
    kette: [n => n * 2, n => n * 3, n => n * 4, n => n * 5, n => n * 6],
    optionen: [600, 620, 700, 720, 840] },
  { folge: [64, 32, 48, 24, 36, 18], regel: 'Abwechselnd halbieren und mit 1,5 multiplizieren.',
    wechsel: [n => n / 2, n => n * 1.5], optionen: [9, 24, 27, 30, 36] },
];

// Wortfluessigkeit: Buchstabensalat aufloesen, dann den ANFANGSBUCHSTABEN
// des gesuchten Wortes ankreuzen. Alle Woerter haben mindestens fuenf
// verschiedene Buchstaben, damit fuenf echte Antwortoptionen moeglich sind.
const woerter = [
  'LUNGE', 'MUSKEL', 'KNOCHEN', 'PATIENT', 'THERAPIE',
  'SKELETT', 'HORMON', 'IMPFUNG', 'VIRUS', 'SCHMERZ',
  'GELENK', 'ARTERIE', 'FIEBER', 'WIRBEL', 'ENZYM',
];

const implikationen = [
  { aussage: 'Alle Studierenden, die den MedAT bestanden haben, haben den Aufnahmetest vollständig absolviert.',
    optionen: [
      'Wer den Aufnahmetest vollständig absolviert hat, hat den MedAT bestanden.',
      'Wer den Aufnahmetest nicht vollständig absolviert hat, hat den MedAT nicht bestanden.',
      'Wer den MedAT nicht bestanden hat, hat den Aufnahmetest nicht absolviert.',
      'Einige, die den Test absolviert haben, sind durchgefallen.',
      'Niemand, der den Test absolviert hat, ist durchgefallen.'],
    loesung: 1,
    warum: 'Aus „alle A sind B“ folgt zwingend nur die Umkehrung mit Verneinung: Wer nicht B ist, kann nicht A sein. Der Schluss „wer den Test absolviert hat, hat bestanden“ dreht die Richtung um — das ist der häufigste Denkfehler.' },

  { aussage: 'Wenn Lena regelmäßig Testsimulationen schreibt, verbessert sich ihre Zeiteinteilung.',
    optionen: [
      'Lenas Zeiteinteilung hat sich verbessert, also schreibt sie regelmäßig Testsimulationen.',
      'Lena schreibt keine Testsimulationen, also verschlechtert sich ihre Zeiteinteilung.',
      'Hat sich Lenas Zeiteinteilung nicht verbessert, hat sie nicht regelmäßig Testsimulationen geschrieben.',
      'Lena wird den MedAT bestehen.',
      'Nur Testsimulationen können die Zeiteinteilung verbessern.'],
    loesung: 2,
    warum: 'Aus „wenn A, dann B“ folgt nur „wenn nicht B, dann nicht A“. Dass die Zeiteinteilung auch aus anderen Gründen besser werden kann, bleibt offen.' },

  { aussage: 'Kein Bewerber ohne Anmeldung wird zum MedAT zugelassen.',
    optionen: [
      'Wer sich angemeldet hat, wird zugelassen.',
      'Wer zugelassen wurde, hat sich angemeldet.',
      'Wer sich nicht angemeldet hat, wollte nicht teilnehmen.',
      'Die Anmeldung genügt für die Zulassung.',
      'Manche Zugelassene haben sich nicht angemeldet.'],
    loesung: 1,
    warum: 'Die Anmeldung ist notwendig, aber nicht automatisch ausreichend. Aus der Zulassung folgt die Anmeldung — nicht umgekehrt.' },

  { aussage: 'Einige Mentoren in Wien studieren Zahnmedizin.',
    optionen: [
      'Alle Mentoren in Wien studieren Zahnmedizin.',
      'Kein Mentor in Wien studiert Humanmedizin.',
      'Es gibt mindestens eine Person, die Zahnmedizin studiert und Mentor in Wien ist.',
      'Die meisten Zahnmedizinstudenten sind Mentoren.',
      'Mentoren in Wien studieren überwiegend Zahnmedizin.'],
    loesung: 2,
    warum: '„Einige“ heißt in der Logik ausschließlich „mindestens einer“. Jede Aussage über Mehrheiten oder über alle geht darüber hinaus.' },

  { aussage: 'Nur wer den Biologieteil überdurchschnittlich löst, erreicht das obere Drittel der Rangliste.',
    optionen: [
      'Wer den Biologieteil überdurchschnittlich löst, erreicht das obere Drittel.',
      'Wer im oberen Drittel liegt, hat den Biologieteil überdurchschnittlich gelöst.',
      'Biologie ist der wichtigste Testteil.',
      'Wer den Biologieteil schlecht löst, fällt durch.',
      'Das obere Drittel besteht nur aus Biologiestudenten.'],
    loesung: 1,
    warum: '„Nur wenn A, dann B“ kehrt die Richtung um: Aus B folgt A. Der überdurchschnittliche Biologieteil ist notwendig, aber nicht hinreichend.' },

  { aussage: 'Alle Teilnehmer des Kurses haben mindestens einen Probetest geschrieben.',
    optionen: [
      'Wer einen Probetest geschrieben hat, ist Kursteilnehmer.',
      'Wer keinen Probetest geschrieben hat, ist kein Kursteilnehmer.',
      'Alle, die Probetests schreiben, bestehen den MedAT.',
      'Manche Kursteilnehmer haben keinen Probetest geschrieben.',
      'Der Kurs besteht ausschließlich aus Probetests.'],
    loesung: 1,
    warum: 'Wieder die Umkehrung mit Verneinung. „Wer einen Probetest geschrieben hat, ist Kursteilnehmer“ wäre nur richtig, wenn ausschließlich Kursteilnehmer Probetests schreiben — das steht nirgends.' },

  { aussage: 'Wenn der Test im Juli stattfindet, ist die Anmeldefrist im März abgelaufen.',
    optionen: [
      'Die Anmeldefrist ist im März abgelaufen, also findet der Test im Juli statt.',
      'Findet der Test nicht im Juli statt, läuft die Frist nicht im März ab.',
      'Ist die Anmeldefrist im März nicht abgelaufen, findet der Test nicht im Juli statt.',
      'Der Test findet immer im Juli statt.',
      'Die Anmeldefrist endet immer drei Monate vor dem Test.'],
    loesung: 2,
    warum: 'Nur die Umkehrung mit Verneinung ist zwingend. Von der abgelaufenen Frist auf den Juli-Termin zu schließen und aus „nicht Juli“ auf „nicht März“ zu schließen sind die beiden klassischen Fehlschlüsse.' },

  { aussage: 'Kein Kandidat kann den MedAT bestehen, ohne den KFF-Teil zu bearbeiten.',
    optionen: [
      'Wer den KFF-Teil bearbeitet, besteht den MedAT.',
      'Wer den MedAT bestanden hat, hat den KFF-Teil bearbeitet.',
      'Der KFF-Teil ist der schwierigste Testteil.',
      'Wer den KFF-Teil auslässt, bearbeitet die anderen Teile besser.',
      'Der KFF-Teil allein entscheidet über das Bestehen.'],
    loesung: 1,
    warum: 'Der KFF-Teil ist eine notwendige Bedingung. Aus dem Bestehen folgt die Bearbeitung, nicht umgekehrt.' },

  { aussage: 'Einige Aufgaben im KFF-Teil sind Zahlenfolgen. Alle Zahlenfolgen erfordern Rechnen.',
    optionen: [
      'Alle KFF-Aufgaben erfordern Rechnen.',
      'Einige KFF-Aufgaben erfordern Rechnen.',
      'Keine KFF-Aufgabe kommt ohne Rechnen aus.',
      'Zahlenfolgen sind der größte Teil des KFF.',
      'Wer rechnen kann, löst alle KFF-Aufgaben.'],
    loesung: 1,
    warum: 'Zwei Aussagen lassen sich verketten, aber die schwächere bestimmt das Ergebnis: Aus „einige“ kann nie „alle“ werden.' },

  { aussage: 'Wer zu spät zum Testzentrum kommt, wird nicht eingelassen. Jonas wurde eingelassen.',
    optionen: [
      'Jonas kam pünktlich oder zu früh — jedenfalls nicht zu spät.',
      'Jonas kam genau pünktlich.',
      'Jonas war der Erste am Testzentrum.',
      'Jonas hat den Test bestanden.',
      'Über Jonas’ Ankunftszeit lässt sich nichts sagen.'],
    loesung: 0,
    warum: 'Aus „wenn zu spät, dann nicht eingelassen“ und „eingelassen“ folgt zwingend „nicht zu spät“. Wie genau pünktlich er war, bleibt offen — „Jonas kam genau pünktlich“ ist deshalb zu stark.' },
];

// Gedaechtnis und Merkfaehigkeit: acht erfundene Allergieausweise.
const ausweise = [
  { nachname: 'Bauer',   vorname: 'Lena',   geburt: '14.03.2004', allergie: 'Erdnuss',         medikament: 'Adrenalin-Pen' },
  { nachname: 'Hofer',   vorname: 'Mattis', geburt: '02.11.2003', allergie: 'Bienengift',      medikament: 'Antihistaminikum' },
  { nachname: 'Gruber',  vorname: 'Sophie', geburt: '27.07.2005', allergie: 'Penicillin',      medikament: 'Kortison' },
  { nachname: 'Wagner',  vorname: 'Elias',  geburt: '19.01.2002', allergie: 'Hausstaubmilbe',  medikament: 'Nasenspray' },
  { nachname: 'Steiner', vorname: 'Marie',  geburt: '08.09.2004', allergie: 'Latex',           medikament: 'Adrenalin-Pen' },
  { nachname: 'Moser',   vorname: 'Jakob',  geburt: '30.05.2003', allergie: 'Gräserpollen',    medikament: 'Antihistaminikum' },
  { nachname: 'Berger',  vorname: 'Nora',   geburt: '11.12.2005', allergie: 'Schalentiere',    medikament: 'Kortison' },
  { nachname: 'Fuchs',   vorname: 'David',  geburt: '23.06.2002', allergie: 'Katzenhaare',     medikament: 'Nasenspray' },
];

const gedaechtnis = [
  { frage: 'Welche Allergie hat Lena Bauer?',
    optionen: ['Latex', 'Erdnuss', 'Bienengift', 'Penicillin', 'Katzenhaare'], loesung: 1,
    pruefe: a => a.find(p => p.vorname === 'Lena').allergie === 'Erdnuss' },
  { frage: 'Wer ist gegen Penicillin allergisch?',
    optionen: ['Nora Berger', 'Marie Steiner', 'Sophie Gruber', 'Lena Bauer', 'Elias Wagner'], loesung: 2,
    pruefe: a => a.find(p => p.allergie === 'Penicillin').vorname === 'Sophie' },
  { frage: 'Welches Notfallmedikament trägt Marie Steiner?',
    optionen: ['Kortison', 'Nasenspray', 'Antihistaminikum', 'Adrenalin-Pen', 'Keines'], loesung: 3,
    pruefe: a => a.find(p => p.vorname === 'Marie').medikament === 'Adrenalin-Pen' },
  { frage: 'In welchem Monat wurde Jakob Moser geboren?',
    optionen: ['März', 'Mai', 'Juni', 'September', 'November'], loesung: 1,
    pruefe: a => a.find(p => p.vorname === 'Jakob').geburt.slice(3, 5) === '05' },
  { frage: 'Wie viele der acht Personen tragen einen Adrenalin-Pen?',
    optionen: ['1', '2', '3', '4', '5'], loesung: 1,
    pruefe: a => a.filter(p => p.medikament === 'Adrenalin-Pen').length === 2 },
  { frage: 'Welche Allergie hat die am frühesten geborene Person?',
    optionen: ['Katzenhaare', 'Gräserpollen', 'Hausstaubmilbe', 'Latex', 'Schalentiere'], loesung: 2,
    pruefe: a => {
      const jahr = d => +d.slice(6) * 10000 + +d.slice(3, 5) * 100 + +d.slice(0, 2);
      return [...a].sort((x, y) => jahr(x.geburt) - jahr(y.geburt))[0].allergie === 'Hausstaubmilbe';
    } },
  { frage: 'Wer ist gegen Katzenhaare allergisch?',
    optionen: ['David Fuchs', 'Mattis Hofer', 'Jakob Moser', 'Elias Wagner', 'Nora Berger'], loesung: 0,
    pruefe: a => a.find(p => p.allergie === 'Katzenhaare').vorname === 'David' },
  { frage: 'In welchem Jahr wurde Nora Berger geboren?',
    optionen: ['2002', '2003', '2004', '2005', '2006'], loesung: 3,
    pruefe: a => a.find(p => p.vorname === 'Nora').geburt.endsWith('2005') },
  { frage: 'Welche Allergie hat die Person mit Antihistaminikum, die im November geboren wurde?',
    optionen: ['Gräserpollen', 'Bienengift', 'Erdnuss', 'Latex', 'Schalentiere'], loesung: 1,
    pruefe: a => {
      const t = a.filter(p => p.medikament === 'Antihistaminikum' && p.geburt.slice(3, 5) === '11');
      return t.length === 1 && t[0].allergie === 'Bienengift';
    } },
  { frage: 'Welche beiden Personen tragen ein Nasenspray?',
    optionen: ['Lena Bauer und Marie Steiner', 'Sophie Gruber und Nora Berger',
               'Elias Wagner und David Fuchs', 'Mattis Hofer und Jakob Moser',
               'Elias Wagner und Jakob Moser'], loesung: 2,
    pruefe: a => {
      const n = a.filter(p => p.medikament === 'Nasenspray').map(p => p.vorname).sort();
      return n.length === 2 && n[0] === 'David' && n[1] === 'Elias';
    } },
];

module.exports = { zahlenfolgen, woerter, implikationen, ausweise, gedaechtnis };
