/** The wiki — de (translated from en/wiki.ts; same chapters). */
import type { WikiCatalog } from '../types'

export const WIKI: WikiCatalog = {
  why: {
    title: 'Warum eine Stadt auf dem Mars',
    lead: 'Das Ein-Planeten-Problem — und warum der Mars die einzige Antwort in Reichweite ist.',
    body: [
      'Jedes Lebewesen, das je existiert hat, hat auf einem einzigen Planeten gelebt. Das macht das Leben auf eine Weise verletzlich, über die wir selten nachdenken: ein ausreichend großer Asteroid, ein Supervulkan, ein Krieg, ein schlechtes Jahrhundert — und es gibt keine Sicherungskopie. Eine zweite Siedlung, die sich selbst versorgen kann, ist die erste echte Versicherung, die dem Leben je angeboten wurde.',
      'Der Mars ist der einzige Kandidat, der nah genug liegt. Sein Tag dauert 24 Stunden und 37 Minuten, Pflanzen und Menschen behalten also einen vertrauten Rhythmus. Es gibt Wasser, gefroren im Boden und an den Polen. Die dünne Luft besteht aus Kohlendioxid, aus dem mit Wasser und Strom Methan und Sauerstoff werden — Raketentreibstoff und etwas zum Atmen. Das Sonnenlicht ist schwächer als hier, am Äquator etwa 43 %, reicht aber für Pflanzen unter Glas.',
      'Nichts davon macht ihn zu einem Zuhause. Es macht ihn zu einem Neuland, das eines werden könnte. Diese Seite stellt die erste Frage auf dem Weg dorthin: Können die Raketen, die es heute gibt, eine Crew lebend auf die Oberfläche bringen — und wenn nicht, was versagt zuerst?',
    ],
  },
  rockets: {
    title: 'Warum Raketen fast nur Treibstoff sind',
    lead: 'Die Raketengleichung in einem Absatz — und warum Raketen in Stufen gebaut werden.',
    body: [
      'Eine Rakete bewegt sich vorwärts, indem sie Masse mit hoher Geschwindigkeit nach hinten ausstößt. Um schneller zu werden, muss sie mehr davon ausstoßen — doch der Treibstoff, den sie noch nicht ausgestoßen hat, ist totes Gewicht, das ebenfalls beschleunigt werden muss. Diese Rückkopplung ist gnadenlos: Für den Orbit braucht es eine Geschwindigkeitsänderung von etwa 9,4 km/s, und selbst mit den besten chemischen Triebwerken heißt das, dass rund 90 % einer Rakete auf der Startrampe Treibstoff sind. Starship V3 wiegt auf der Rampe etwa 5700 Tonnen, leer weniger als 400 Tonnen.',
      'Stufen sind der Ausweg aus dieser Rechnung. Sind die ersten Tanks leer, werden sie abgeworfen, sodass die Triebwerke der nächsten Stufe nur noch schieben, was weiterhin gebraucht wird. Jede Rakete hier hat zwei oder drei Stufen; Falcon Heavy und SLS haben außerdem seitlich an der mittleren Stufe Booster, die sie als Erstes abwerfen.',
      '## Was die Simulation daraus macht',
      'Jede Stufe trägt ihre echte Leermasse, ihre Treibstoffladung und ihre Triebwerke (Schub und Effizienz auf Meereshöhe und im Vakuum). Zahlen, die niemand veröffentlicht hat — allen voran die Leermassen von Starship —, werden nicht einmal geraten und dann versteckt: Sie sind Schieberegler unter Einstellungen → Erweitert, mit der veröffentlichten Spanne als Bereich.',
    ],
  },
  liftoff: {
    title: 'Abheben und die ersten Minuten',
    lead: 'Zündung, Halteklammern, Max-Q — und warum sich eine Rakete fast sofort zur Seite neigt.',
    body: [
      'Die Triebwerke zünden einige Sekunden, bevor die Uhr null erreicht, und werden überprüft, während Klammern das Fahrzeug festhalten; erst wenn jedes Triebwerk einwandfrei läuft, wird es freigegeben. Beim Abheben ist der Schub nur wenig größer als das Gewicht — Starship beschleunigt mit etwa 0,5 g —, die ersten Sekunden verlaufen also langsam. Das Flutwasser, das du siehst, schützt die Startrampe ebenso vor dem Schall wie vor der Hitze: Allein die akustische Energie würde das Fahrzeug in Stücke schütteln.',
      'Bereits nach wenigen Sekunden beginnt das Fahrzeug, sich nach Osten zu neigen. Senkrecht nach oben zu fliegen wäre reine Verschwendung: Beim Orbit geht es nicht um Höhe, sondern um Geschwindigkeit — 28.000 km/h zur Seite. Diese Neigung, das sogenannte Gravity-Turn-Manöver, lässt die Schwerkraft die Spitze nach und nach herumschwenken, während die Rakete weiter in ihre Flugrichtung schiebt — der effizienteste Weg, den es gibt.',
      '## Max-Q',
      'Etwa eine Minute nach dem Start ist die Rakete schon schnell, die Luft aber noch dicht. Die Kraft der Anströmung — der dynamische Druck, „Q“ — erreicht hier ihr Maximum, bei diesen Fahrzeugen etwa 25–35 kPa. Die Triebwerke werden für einige Sekunden gedrosselt, damit die Struktur nicht über ihre Grenzen hinaus belastet wird, und wieder hochgefahren, sobald die Luft dünner wird. Etwa zur selben Zeit wird die Schallgeschwindigkeit überschritten.',
      '## In der Simulation',
      'Der Aufstieg wird Schritt für Schritt integriert: Schub, der mit sinkendem Luftdruck steigt, Luftwiderstand aus der realen Atmosphäre, das Gravity-Turn-Manöver und ein geschlossener Regelkreis, der in den Zielorbit lenkt. Bemannte Fahrzeuge werden auf 4 g begrenzt.',
    ],
  },
  staging: {
    title: 'Stufentrennung und der Weg in den Orbit',
    lead: 'MECO, Trennung, die lange zweite Brennphase — und was „im Orbit“ wirklich bedeutet.',
    body: [
      'Zwei bis drei Minuten nach dem Start hat die erste Stufe fast alles verbrannt, was sie mitgebracht hat. Ihre Triebwerke schalten ab (MECO — Main Engine Cut-off, der Brennschluss der Hauptstufe), die Stufen trennen sich, und die Oberstufe zündet. Starship macht das „heiß“: Die Triebwerke des Schiffs zünden, während es noch angekoppelt ist, und es stößt sich vom Booster ab. Der Booster ist jetzt in 60–70 km Höhe und 6000–8000 km/h schnell, weit vom Orbit entfernt, und fällt zurück in Richtung Meer; die Booster von Starship und Falcon fliegen zurück, um gefangen zu werden oder zu landen.',
      'Die Oberstufe brennt weitere sechs bis acht Minuten, fast waagerecht, bis sie Orbitalgeschwindigkeit erreicht — etwa 7,8 km/s, 28.000 km/h, in 200 km Höhe. Bei diesem Tempo krümmt sich der Boden so schnell weg, wie das Fahrzeug auf ihn zufällt: Mehr ist ein Orbit nicht — ein Fall, der nie aufschlägt. SECO (Second Engine Cut-off, der Brennschluss der zweiten Stufe) markiert diesen Moment.',
      '## Warum es scheitern kann',
      'Reicht der Treibstoff nicht, kommt das Fahrzeug nicht ans Ziel: Entweder tritt es sofort wieder ein, oder es erreicht einen Orbit, dessen tiefster Punkt noch durch die Luft streift. Die Simulation meldet den erreichten Orbit (Perigäum × Apogäum) und wie viel Treibstoff übrig ist — von diesem Rest lebt die ganze weitere Mission.',
    ],
  },
  refuelling: {
    title: 'Orbit und Betankung',
    lead: 'Warum Starship fast leer im Orbit ankommt — und wie Tanker es füllen.',
    body: [
      'Der Weg in den Orbit verbraucht fast den gesamten Treibstoff, den eine Rakete mitführt. Starship erreicht den Orbit mit rund 100–200 Tonnen Rest in einem 1600-Tonnen-Tank — viel zu wenig, um sich selbst zum Mars zu schieben und dort zu landen. Der Plan von SpaceX: Tanker-Starships starten, andocken und Treibstoff hinüberpumpen, immer wieder, bis das Schiff voll genug für die Reise ist.',
      'Drei Zahlen entscheiden, ob das funktioniert, und keine davon wurde bisher im Flug gemessen: wie viel ein Tanker pro Flug tatsächlich liefert (der Plan nennt ~100 Tonnen), wie schnell der tiefkalte Treibstoff verdampft, während er im Sonnenlicht wartet (dieser Boil-off, der Verdampfungsverlust, liegt bei einem Bruchteil eines Prozents pro Tag — mit Zinseszinseffekt), und wie schnell sich Tanker starten lassen. Eine langsame Startrate bedeutet mehr Boil-off und mehr Tanker; ist sie zu langsam, schließt sich das Abflugfenster, bevor das Schiff voll ist.',
      'Die runde Treibstoff-Anzeige unten links zeigt die Tonnen an Bord im Vergleich zu dem, was die Mission braucht; die Zeitleiste markiert jedes Andocken eines Tankers. Die drei Szenarien — die Angaben von SpaceX, unabhängige Schätzungen und das bisher Demonstrierte — stecken den Rahmen dieser Unbekannten ab.',
      'Alle anderen (Orion, Dragon, Mengzhou, Apollo) lassen sich nicht betanken: Was ihre Oberstufe im Orbit an Treibstoff übrig hat, ist alles, was sie bekommen.',
    ],
  },
  window: {
    title: 'Das Startfenster',
    lead: 'Warum der Mars nur alle 26 Monate erreichbar ist — und warum manche Jahre schwieriger sind als andere.',
    body: [
      'Erde und Mars umkreisen beide die Sonne, die Erde schneller. Ein Raumschiff, das die Erde verlässt, zielt nicht dorthin, wo der Mars gerade steht, sondern dorthin, wo er acht oder neun Monate später sein wird, und gleitet auf einer Ellipse, die beide Bahnen berührt. Diese Geometrie ergibt sich nur alle 26 Monate; wer sie verpasst, wartet zwei Jahre auf die nächste Gelegenheit.',
      'Die Fenster sind nicht gleich. Die Marsbahn ist deutlich elliptisch, deshalb treffen sich die beiden Planeten in manchen Jahren dort, wo der Mars weit von der Sonne entfernt ist, und das Raumschiff kommt langsam an; in anderen (2031, 2033) kommt es schnell an. Die Größe, die das erfasst, heißt v-unendlich (v∞): die verbleibende Geschwindigkeit relativ zum Planeten, 2,7 km/s in den leichten Fenstern, über 5 km/s in den schweren. Aus der Ankunftsgeschwindigkeit wird die Eintrittsgeschwindigkeit, und aus der Eintrittsgeschwindigkeit wird Hitze.',
      '## In der Simulation',
      'Der Transfer wird für das gewählte Abflugdatum und die gewählte Flugdauer als Lambert-Problem auf Grundlage der Planetenpositionen des JPL gelöst und mit den von der NASA veröffentlichten Gelegenheiten minimaler Energie abgeglichen. Unter Einstellungen wählst du das Fenster; der Porkchop-Plot unter Daten zeigt, wie sich Abflug- und Ankunftsdatum gegeneinander aufwiegen.',
    ],
  },
  tmi: {
    title: 'Mars-Transferzündung',
    lead: 'Die eine Zündung, die aus einer Bahn um die Erde einen Weg zum Mars macht.',
    body: [
      'Aus einem Parkorbit in 200 km Höhe braucht das Raumschiff weitere 3,6–4,0 km/s, um der Erde zu entkommen und mit der richtigen Geschwindigkeit anzukommen. Den größten Nutzen holt es aus diesem Treibstoff heraus, wenn es am tiefsten, schnellsten Punkt seiner Bahn zündet — der Oberth-Effekt: Ein gegebener Schub fügt mehr Energie hinzu, wenn man schon schnell unterwegs ist. Bei Starship dauert die Zündung anderthalb Minuten und verbraucht mehrere hundert Tonnen.',
      'Schafft das Raumschiff nicht den vollen Betrag, endet die Mission hier. Fehlt nur wenig, erreicht es eine Bahn, die die Umgebung der Erde nie verlässt („im Erdorbit gestrandet“); die Crew kehrt heim, und das Fenster ist verloren.',
    ],
  },
  cruise: {
    title: 'Der Flug zum Mars',
    lead: 'Sechs bis neun Monate im freien Flug: Luft, Wasser, Nahrung — und die Strahlung, die niemand abschalten kann.',
    body: [
      'Nach der Zündung bleiben die Triebwerke für den Rest des Wegs aus: Das Raumschiff gleitet auf seiner Ellipse, nur mit kleinen Kurskorrekturen. Es passiert nichts — und genau das ist das Problem. Die Crew muss die ganze Zeit mit dem am Leben bleiben, was eingepackt wurde.',
      'Das Tagesbudget der NASA pro Person liegt bei etwa 0,9 kg Sauerstoff, 2,4 kg Nahrung und 3,5 kg Wasser, vor dem Recycling. Ein guter Lebenserhaltungskreislauf gewinnt den Großteil des Wassers und einen Teil des Sauerstoffs zurück; eine Kapsel, die für drei Wochen gebaut ist, hat überhaupt keinen. Die Simulation rechnet mit der echten Freiflug-Kapazität jedes Fahrzeugs: Orion 21 Tage, Apollo 14, Dragon etwa eine Woche — bei einer Reise von 200–300 Tagen.',
      '## Strahlung',
      'Außerhalb des Erdmagnetfelds ist die Crew ständig der galaktischen kosmischen Strahlung ausgesetzt. Der Rover Curiosity hat auf dem Weg zum Mars 1,8 mSv pro Tag gemessen; eine neunmonatige Reise ergibt etwa 500 mSv, den größten Teil des Karrieregrenzwerts von 600 mSv, und der Heimweg verdoppelt das. Es gibt keine leichte Abschirmung, die sie aufhält. Die Anzeige zählt mit, während du unterwegs bist.',
    ],
  },
  entry: {
    title: 'Eintritt: mit 6 km/s in die Luft',
    lead: 'Warum der Mars der schwierigste Landeplatz im Sonnensystem ist — und wozu der Hitzeschild da ist.',
    body: [
      'Das Raumschiff kommt mit 5,5–7,5 km/s an, viel zu schnell, um allein mit Triebwerken abgebremst zu werden. Die Atmosphäre ist die Bremse: Das Fahrzeug taucht ein, und die Luft vor ihm wird zusammengepresst und auf Tausende Grad erhitzt. Der Hitzeschild — die schwarzen Kacheln am Bauch von Starship, der ablative Boden einer Kapsel — nimmt diese Energie auf und hält sie von der Struktur fern. Das Leuchten, das du siehst, ist echt: Die Luft selbst wird zu Plasma.',
      'Die Marsluft ist nur etwa 1 % so dicht wie die der Erde. Das reicht, um ein Fahrzeug verglühen zu lassen, aber nicht, um es nennenswert abzubremsen: Eine Kapsel, die auf der Erde sanft herabschweben würde, ist wenige Kilometer über dem Mars noch immer schneller als der Schall. Jedes System, das dort gelandet ist, brauchte etwas Zusätzliches — Fallschirme so groß wie ein Haus, Airbags, einen Raketenkran. Für ein Fahrzeug, das eine Crew trägt, kommen nur Raketentriebwerke infrage.',
      '## Die Zahlen',
      'Die maximale Aufheizung wird in Watt pro Quadratzentimeter an der Nase gemessen. Die Kacheln von Starship sind hier auf 50 W/cm² ausgelegt, so kalibriert, dass die bisher geflogenen Wiedereintritte in die Erdatmosphäre auf 43–49 kommen. In den Fenstern 2031 und 2033 ist die Ankunft schnell genug, um diese Grenze zu überschreiten. Die maximale Abbremsung wird für eine Crew, die durch monatelange Schwerelosigkeit geschwächt ist, auf 5 g begrenzt. Das Abfangen ist der Moment, in dem die Sinkrate aufhört zu wachsen und das Raumschiff zu fliegen beginnt, statt zu fallen.',
    ],
  },
  landing: {
    title: 'Bauchklatscher und Flip',
    lead: 'Der Weg von Starship nach unten: flach fallen, Triebwerke zünden, aufrichten, auf dem Feuerstrahl landen.',
    body: [
      'Unterhalb von etwa 20 km fällt Starship mit dem Bauch voran wie ein Fallschirmspringer und steuert mit seinen vier Klappen, indem es verändert, wie viel Luftwiderstand jede Seite erzeugt. Es ist immer noch schneller als der Schall. Wenige Kilometer über dem Boden zünden drei Triebwerke, während das Schiff noch waagerecht liegt, und der Schub schwenkt es in wenigen Sekunden aufrecht — der Flip. Danach folgt ein Hoverslam: Die Triebwerke müssen mehrere hundert Meter pro Sekunde Fallgeschwindigkeit in etwa dreißig Sekunden abbauen, ohne jeden Spielraum.',
      'Das ist Überschall-Retropropulsion: Triebwerke gegen Luft feuern, die einem schneller als der Schall entgegenkommt. Sie war unerprobt, bis Falcon-9-Booster sie über dem Atlantik zu nutzen begannen; am Mars wurde sie noch nie eingesetzt. Die Simulation modelliert die Zündung als „Suicide Burn“, der so spät beginnt, wie er es wagt, den Luftwiderstand mitrechnet und 30 % Schubreserve für die Steuerung behält.',
      '## Die Kapseln',
      'Orion, Dragon, Mengzhou und Apollo haben keine Landetriebwerke, die das könnten; sie wurden gebaut, um auf der Erde an Fallschirmen im Meer zu wassern. Am Mars würden sich ihre Fallschirme in einer Luft öffnen, die zu dünn ist, um etwas auszurichten. Sie schlagen mit Endgeschwindigkeit auf — mehrere hundert Meter pro Sekunde —, und die Simulation sagt das auch.',
    ],
  },
  verdict: {
    title: 'Aufsetzen und was das Urteil bedeutet',
    lead: 'Die sechs möglichen Ausgänge — und warum die Seite dir sagt, was zuerst versagt hat.',
    body: [
      'Eine Mission endet auf eine von sechs Arten: gelandet mit lebender Crew; abgestürzt (zu schnell am Boden angekommen); verglüht (der Hitzeschild wurde beim Eintritt überlastet); im Erdorbit gestrandet (zu wenig Treibstoff, um aufzubrechen); unterwegs verloren (der Crew gingen Luft, Wasser oder Nahrung aus, oder die Strahlendosis wurde zu hoch); oder ein Vorbeiflug (keine Möglichkeit, am Mars abzubremsen, also schwingt das Raumschiff vorbei und fliegt weiter).',
      'Das Urteil nennt das Erste, was versagt hat, mit seinen Zahlen, denn das ist die nützliche Antwort: Es sagt dir, was sich ändern müsste. Eine Kapsel, der an Tag 21 die Lebenserhaltung ausgeht, braucht keinen besseren Hitzeschild.',
      'Lebend zu landen ist nicht das Ende des Problems — dort beginnt erst die Frage nach der Stadt. Aber es ist die Frage, die sich diese Seite vorgenommen hat.',
    ],
  },
  weather: {
    title: 'Staubstürme',
    lead: 'Das Einzige am Mars, was die Antwort von einem Monat auf den nächsten ändern kann.',
    body: [
      'Der Mars hat Jahreszeiten — und eine Staubsturmsaison: Frühling und Sommer auf der Südhalbkugel, wenn der Planet der Sonne am nächsten ist. Die meisten Jahre bringen regionale Stürme; in etwa einem von drei Marsjahren wächst ein Sturm, bis er den ganzen Planeten umhüllt und die Oberfläche wochenlang verschwindet. Staub, der in große Höhen gewirbelt wird, macht außerdem die obere Atmosphäre dichter — und das verändert den Eintritt.',
      'Die Simulation bestimmt das Wetter für das Ankunftsdatum anhand der historischen Aufzeichnungen: die Jahreszeit aus der solaren Länge, einen vom Datum festgelegten Würfelwurf für den Sturm, die zusätzliche Dichte, den Bodenwind und die Wahrscheinlichkeit, dass ein Landesystem, das den Boden nicht sehen kann, auf einem Felsen aufsetzt. Unter Einstellungen → Erweitert kannst du das überschreiben, um einen klaren Tag zu sehen.',
    ],
  },
  unknowns: {
    title: 'Was noch niemand weiß',
    lead: 'Die vier Zahlen, die über das Urteil für Starship entscheiden — und wie du mit ihnen spielen kannst.',
    body: [
      'Vier Größen wurden nie gemessen und bestimmen die Antwort für Starship: die Leermasse des Schiffs (nur als Spanne veröffentlicht), der Treibstoff, den ein Tanker wirklich liefert, der tägliche Boil-off im Orbit und der Wärmestrom, den die Kacheln am Mars überstehen. Die drei Szenarien stecken sie ab; mit den Schiebereglern unter Einstellungen → Erweitert legst du deine eigenen Werte fest.',
      'Die Haltung dieser Seite ist einfach: Wo eine Zahl unbekannt ist, ist sie ein Regler, keine Konstante. Ein Urteil ist nur so ehrlich wie die Eingaben dahinter — deshalb liegen sie offen auf dem Tisch.',
    ],
  },
  models: {
    title: 'Die Physik dahinter',
    lead: 'Was hier tatsächlich berechnet wird — auf einer Seite.',
    body: [
      '- Start: ein ebener Aufstieg im mitrotierenden Bezugssystem der Atmosphäre, integriert mit Runge–Kutta 4. Ordnung in Schritten von 0,1 s; US-Standardatmosphäre 1976; druckabhängiger Schub und Isp für jedes Triebwerk; Luftwiderstand aus machzahlabhängigen Beiwerten; ein Gravity-Turn-Manöver und ein geschlossener Regelkreis für den Einschuss; der Kippwinkel wird so gesucht, dass möglichst viel Treibstoff im Orbit übrig bleibt.',
      '- Orbit: eine Tanker-Kampagne mit einer Startrate und einem Boil-off, der täglich auf den verbleibenden Bestand angerechnet wird, abgeglichen mit der Abflugperiode.',
      '- Transfer: das Lambert-Problem auf Grundlage der genäherten Planetenelemente des JPL (gültig 1800–2050), mit Oberth-Effekt, Zuschlag für die endliche Brenndauer und Kurskorrekturen; abgeglichen mit den Gelegenheiten 2026/2028/2031/2033 von NASA Glenn auf 1 % genau.',
      '- Flug: das Vorratsbudget der NASA für die Crew mit ECLSS-Rückgewinnung; die von Curiosity (MSL RAD) auf dem Flug gemessene Dosisrate, verglichen mit dem Karrieregrenzwert von 600 mSv.',
      '- Eintritt: das Dichteprofil der Mars Climate Database mit einem Staubfaktor; Auftrieb mit einer Rollwinkelregel; Staupunkt-Aufheizung nach Sutton–Graves, kalibriert an den Wiedereintritten von Starship in die Erdatmosphäre; die g-Last, verglichen mit dem Grenzwert für eine geschwächte Crew; eine Landezündung mit Überschall-Retropropulsion und angerechnetem Luftwiderstand.',
      'Jede Zahl lässt sich auf eine Recherchenotiz mit Quelle und Vertrauensstufe zurückführen. Die Szenerie — das Cape, die Erde, der Mars — ist aus Daten von NASA und Natural Earth gebaut und so gemalt, wie sie aus einer Rakete aussieht.',
    ],
  },
}
