/** The wiki — fr (translated from en/wiki.ts; same chapters). */
import type { WikiCatalog } from '../types'

export const WIKI: WikiCatalog = {
  why: {
    title: 'Pourquoi une ville sur Mars',
    lead: "Le problème d'une seule planète, et pourquoi Mars est la seule réponse à notre portée.",
    body: [
      "Tout être vivant ayant jamais existé a vécu sur une seule planète. Cela rend la vie fragile d'une manière à laquelle on pense rarement : un astéroïde assez gros, un supervolcan, une guerre, un mauvais siècle — et il n'y a pas de plan B. Une seconde implantation, capable de subsister par elle-même, est la première véritable assurance que la vie se soit jamais vu offrir.",
      "Mars est le seul candidat assez proche. Sa journée dure 24 heures et 37 minutes : plantes et humains y gardent un rythme familier. On y trouve de l'eau, gelée dans le sol et aux pôles. Son air ténu est fait de dioxyde de carbone qui, avec de l'eau et de l'électricité, donne du méthane et de l'oxygène — du carburant pour les fusées, et de quoi respirer. Le Soleil y éclaire moins qu'ici, environ 43 % à l'équateur, mais assez pour des cultures sous serre.",
      "Rien de tout cela n'en fait un foyer. Cela en fait une frontière qui pourrait le devenir. Ce site pose la première question sur ce chemin : les fusées qui existent aujourd'hui peuvent-elles déposer un équipage vivant à la surface — et sinon, qu'est-ce qui lâche en premier ?",
    ],
  },
  musk: {
    title: "Les raisons d'Elon Musk",
    lead: "Pourquoi l'homme qui construit Starship dit qu'il faut y aller — dans ses propres mots, avec les dates, et ce que lui répondent ses critiques.",
    body: [
      "SpaceX a été fondée en 2002 « avec pour but ultime de permettre aux gens de vivre sur d'autres planètes ». L'argument de son fondateur n'a guère changé depuis. Ses dates, si, et souvent.",
      '## Une seule planète finira',
      "> Une voie, c'est de rester sur Terre pour toujours, et il y aura alors, un jour, un événement d'extinction. | Congrès international d'astronautique, Guadalajara, 2016",
      "L'autre voie, c'est de devenir multiplanétaire : un second foyer capable de continuer seul. Musk parle d'une « assurance vie pour la vie tout entière » (2025) et de porter « la lumière de la conscience » jusqu'aux étoiles.",
      '## Pourquoi Mars',
      '- À une fois et demie la distance de la Terre au Soleil, la lumière solaire suffit encore.',
      '- La journée est presque la nôtre, un peu plus de 24 heures et demie. La gravité vaut 38 % de celle de la Terre.',
      "- La glace est presque partout et l'air est du dioxyde de carbone : ensemble, ils donnent du méthane et de l'oxygène — le carburant du retour.",
      "- La Lune est petite et sans air, et son jour dure un mois. Vénus est « un bain d'acide brûlant ».",
      'En février 2026, il a donné la priorité à une ville sur la Lune — à deux jours au lieu de six mois, donc plus rapide pour apprendre —, Mars restant le but.',
      '## Tant que nous le pouvons',
      '> Je pense que le plus sage est de rendre la vie multiplanétaire tant que nous le pouvons. | Union américaine de géophysique, San Francisco, 2015',
      "En 4,5 milliards d'années, c'est la première fois que la vie terrestre peut atteindre une autre planète. Et la technique peut aussi reculer : une guerre mondiale, un nouvel âge sombre.",
      '## Quelque chose à espérer',
      "> La vie ne peut pas se résumer à résoudre un problème misérable après l'autre. Il faut des choses qui vous inspirent, qui vous rendent heureux de vous réveiller le matin et de faire partie de l'humanité. | SXSW, Austin, 2018",
      '## Le seuil',
      "Une ville compte dès qu'elle continue de grandir même si les vaisseaux de la Terre cessent d'arriver. Ses chiffres : environ un million de personnes, à peu près un million de tonnes de fret, et mille vaisseaux ou plus à chaque fois que les planètes s'alignent — tous les 26 mois.",
      "Cela ne tient que si une place coûte le prix d'une maison, et non des milliards. Ses quatre leviers : des fusées entièrement réutilisées, le ravitaillement en orbite, des ergols produits sur Mars, et le méthane comme carburant. Le ravitaillement en orbite est précisément ce que cette simulation met à l'épreuve.",
      '## Des dates qui reculent',
      '- 2017 : des cargos vers Mars en 2022, un équipage en 2024.',
      "- 2020 : « très confiant » d'avoir des humains sur Mars vers 2026.",
      '- 2025 : des vaisseaux emportant des robots Optimus fin 2026 ; des humains « dès 2029, même si 2031 est plus probable ».',
      "- Février 2026 : la Lune d'abord ; une ville sur Mars à commencer d'ici cinq à sept ans.",
      "- Octobre 2026 : la fenêtre de fin 2026 est passée — le ravitaillement en orbite n'est pas encore démontré — et SpaceX annonce du fret vers Mars au plus tôt en 2028.",
      '> Historiquement, mes calendriers ont été optimistes. | Elon Musk, SXSW, 2018',
      '## Ce que répondent les critiques',
      "- Radiations : le seul voyage aller-retour, tel que Curiosity l'a mesuré, représente environ 0,66 sievert — au-dessus de la limite de carrière de la NASA, 0,6.",
      '- Corps : personne ne sait ce que 38 % de gravité fait à une grossesse ou à un enfant qui grandit.',
      "- La Terre d'abord : l'astronome Lucianne Walkowicz (TED, 2015) a jugé présomptueux de croire que s'installer sur une autre planète suffira à nous sauver.",
      "- La vie sur Mars : les humains apportent des microbes, qui pourraient brouiller la recherche d'une vie martienne.",
      "- L'argent : le propre prospectus d'introduction en Bourse de SpaceX (2026) prévient que ses projets lunaires et martiens reposent sur des « technologies non éprouvées ».",
    ],
  },
  rockets: {
    title: 'Pourquoi tant de carburant',
    lead: "L'équation de la fusée en un paragraphe, et pourquoi les lanceurs ont plusieurs étages.",
    body: [
      "Une fusée avance en éjectant de la matière vers l'arrière, à très grande vitesse. Pour aller plus vite, elle doit en éjecter davantage — mais les ergols qu'elle n'a pas encore brûlés sont un poids mort qu'il faut lui aussi accélérer. Ce cercle vicieux est implacable : atteindre l'orbite exige un changement de vitesse d'environ 9,4 km/s, et avec les meilleurs moteurs chimiques, cela veut dire qu'environ 90 % de la masse d'une fusée sur son pas de tir, ce sont des ergols. Starship V3 pèse environ 5 700 tonnes au décollage et moins de 400 tonnes à vide.",
      "L'étagement permet d'échapper à cette arithmétique. Dès que les premiers réservoirs sont vides, on s'en débarrasse : les moteurs de l'étage suivant ne poussent plus que ce qui sert encore. Tous les lanceurs présentés ici ont deux ou trois étages ; Falcon Heavy et SLS accrochent en plus des propulseurs d'appoint sur les flancs de l'étage central, et les larguent en premier.",
      "## Ce qu'en fait la simulation",
      "Chaque étage emporte sa vraie masse à vide, sa charge d'ergols et ses moteurs (poussée et rendement au niveau de la mer et dans le vide). Les chiffres que personne n'a publiés — avant tout les masses à vide de Starship — ne sont pas devinés une fois pour toutes puis cachés : ce sont des curseurs, dans Réglages de la mission → Options avancées, avec la fourchette publiée pour plage.",
    ],
  },
  liftoff: {
    title: 'Décollage et premières minutes',
    lead: "L'allumage, le maintien au sol, le max-Q, et pourquoi une fusée s'incline presque aussitôt.",
    body: [
      "Les moteurs s'allument quelques secondes avant que le compte à rebours n'atteigne zéro, et sont contrôlés pendant que des pinces retiennent le lanceur ; il n'est libéré que si tous les moteurs fonctionnent correctement. Au décollage, la poussée dépasse à peine le poids — Starship accélère à environ 0,5 g —, si bien que les premières secondes sont lentes. Le déluge d'eau que l'on voit protège le pas de tir du bruit autant que de la chaleur : l'énergie acoustique suffirait à elle seule à disloquer le véhicule.",
      "En quelques secondes, le lanceur commence à s'incliner vers l'est. Monter tout droit serait du gâchis : l'orbite n'est pas une affaire d'altitude, mais de vitesse — 28 000 km/h à l'horizontale. Cette inclinaison, le virage gravitationnel, laisse la gravité faire basculer le nez peu à peu pendant que la fusée continue de pousser dans le sens de sa course : c'est la trajectoire la plus efficace qui soit.",
      '## Max-Q',
      "Environ une minute après le décollage, la fusée va vite mais l'air est encore dense. La force exercée par l'écoulement de l'air — la pression dynamique, « Q » — culmine à ce moment-là, autour de 25 à 35 kPa pour ces lanceurs. Les moteurs sont réduits quelques secondes pour ne pas pousser la structure au-delà de ses limites, puis remontent en puissance à mesure que l'air se raréfie. Le mur du son est franchi à peu près au même moment.",
      '## Dans la simulation',
      "La montée est intégrée pas à pas : une poussée qui augmente à mesure que la pression de l'air baisse, la traînée dans l'atmosphère réelle, le virage gravitationnel et une loi de guidage en boucle fermée qui conduit le lanceur sur l'orbite visée. Les véhicules habités sont limités à 4 g.",
    ],
  },
  staging: {
    title: 'Étages et mise en orbite',
    lead: "MECO, la séparation, la longue poussée du deuxième étage, et ce que « être en orbite » veut vraiment dire.",
    body: [
      "Deux à trois minutes après le décollage, le premier étage a brûlé presque tout ce qu'il emportait. Ses moteurs s'éteignent (MECO, pour main engine cut-off, l'extinction des moteurs principaux), les étages se séparent et l'étage supérieur s'allume. Starship le fait « à chaud » : les moteurs du vaisseau s'allument alors qu'il est encore attaché, et le repoussent du propulseur. Celui-ci se trouve alors à 60–70 km d'altitude et à 6 000–8 000 km/h, très loin de l'orbite, et retombe vers la mer ; ceux de Starship et de Falcon reviennent pour être rattrapés ou se poser.",
      "L'étage supérieur pousse encore six à huit minutes, presque à l'horizontale, jusqu'à la vitesse orbitale — environ 7,8 km/s, soit 28 000 km/h, à 200 km d'altitude. À cette vitesse, le sol s'incurve et se dérobe aussi vite que le véhicule tombe vers lui : une orbite n'est rien d'autre qu'une chute qui ne touche jamais le sol. Le SECO (second engine cut-off, l'extinction du deuxième étage) marque ce moment.",
      '## Pourquoi ça peut échouer',
      "S'il manque des ergols, le lanceur n'y arrive pas : soit il retombe aussitôt, soit il atteint une orbite dont le point bas frôle encore l'atmosphère. La simulation indique l'orbite atteinte (périgée × apogée) et la quantité d'ergols restante — ce reliquat est tout ce dont disposera le reste de la mission.",
    ],
  },
  refuelling: {
    title: 'Orbite et ravitaillement',
    lead: 'Pourquoi Starship arrive en orbite presque vide, et comment les ravitailleurs le remplissent.',
    body: [
      "Atteindre l'orbite consomme presque tous les ergols qu'emporte une fusée. Starship y arrive avec environ 100 à 200 tonnes restantes dans des réservoirs de 1 600 tonnes — bien trop peu pour se propulser jusqu'à Mars et s'y poser. Le plan de SpaceX : lancer des Starship ravitailleurs qui s'amarrent et lui transfèrent leurs ergols, encore et encore, jusqu'à ce que le vaisseau soit assez plein pour le voyage.",
      "Trois chiffres décident si cela fonctionne, et aucun n'a encore été mesuré en vol : ce qu'un ravitailleur livre réellement par vol (le plan parle d'environ 100 tonnes), la vitesse à laquelle les ergols cryogéniques s'évaporent pendant l'attente au soleil (une fraction de pour cent par jour, qui se cumule), et la cadence à laquelle on peut lancer les ravitailleurs. Une cadence lente, c'est plus d'évaporation et plus de ravitailleurs ; trop lente, et la fenêtre de départ se referme avant que le vaisseau soit plein.",
      "La jauge Ergols du bandeau inférieur compare les tonnes à bord aux besoins de la mission ; la frise chronologique marque chaque amarrage de ravitailleur. Les trois jeux d'hypothèses — les annonces de SpaceX, les estimations indépendantes, ce qui a été démontré à ce jour — encadrent ces inconnues.",
      "Tous les autres (Orion, Dragon, Mengzhou, Apollo) ne peuvent pas être ravitaillés : les ergols qui restent à leur étage supérieur une fois en orbite, c'est tout ce dont ils disposent.",
    ],
  },
  window: {
    title: 'La fenêtre de tir',
    lead: "Pourquoi Mars n'est accessible que tous les 26 mois, et pourquoi certaines années sont plus difficiles que d'autres.",
    body: [
      "La Terre et Mars tournent toutes deux autour du Soleil, la Terre plus vite. Un vaisseau qui quitte la Terre ne vise pas l'endroit où se trouve Mars, mais celui où elle sera huit ou neuf mois plus tard, en suivant sur sa lancée une ellipse qui touche les deux orbites. Cette configuration ne se présente qu'une fois tous les 26 mois ; si on la manque, la prochaine occasion est deux ans plus tard.",
      "Les fenêtres ne se valent pas. L'orbite de Mars est nettement elliptique : certaines années, les deux planètes se rejoignent quand Mars est loin du Soleil, et le vaisseau arrive lentement ; d'autres années (2031, 2033), il arrive vite. Le chiffre qui résume cela est le v-infini, la vitesse résiduelle par rapport à la planète : 2,7 km/s pour les fenêtres faciles, plus de 5 km/s pour les difficiles. La vitesse d'arrivée devient la vitesse d'entrée, et la vitesse d'entrée devient de la chaleur.",
      '## Dans la simulation',
      "Le transfert est résolu comme un problème de Lambert sur les positions planétaires du JPL, pour la date de départ et la durée de trajet choisies, puis vérifié par rapport aux opportunités à énergie minimale publiées par la NASA. Les Réglages de la mission permettent de choisir la fenêtre ; le diagramme « porkchop », dans Données, montre le compromis entre dates de départ et d'arrivée.",
    ],
  },
  tmi: {
    title: "L'injection vers Mars",
    lead: 'La seule manœuvre qui transforme une orbite autour de la Terre en route vers Mars.',
    body: [
      "Depuis une orbite d'attente à 200 km, le vaisseau a besoin de 3,6 à 4,0 km/s de plus pour échapper à la Terre et arriver à la bonne vitesse. Il tire le meilleur parti de ses ergols en allumant ses moteurs au point le plus bas et le plus rapide de son orbite — c'est l'effet Oberth : une même poussée ajoute plus d'énergie quand on va déjà vite. Pour Starship, l'allumage dure une minute et demie et consomme plusieurs centaines de tonnes.",
      "Si le vaisseau ne peut pas fournir la totalité de ce chiffre, la mission s'arrête là. S'il en manque un peu, il atteint une orbite qui ne quitte jamais les parages de la Terre (« bloqué en orbite ») ; l'équipage rentre, et la fenêtre est perdue.",
    ],
  },
  cruise: {
    title: 'La croisière',
    lead: "Six à neuf mois de vol sur la lancée : l'air, l'eau, la nourriture, et les radiations que personne ne peut couper.",
    body: [
      "Après l'allumage, les moteurs restent éteints pour le reste du trajet : le vaisseau suit son ellipse sur sa lancée, avec seulement de petites corrections de trajectoire. Il ne se passe rien, et c'est bien là le problème. L'équipage doit être maintenu en vie pendant tout ce temps avec ce qui a été embarqué.",
      "Le budget quotidien de la NASA est d'environ 0,9 kg d'oxygène, 2,4 kg de nourriture et 3,5 kg d'eau par personne, avant recyclage. Un bon système de support de vie récupère l'essentiel de l'eau et une partie de l'oxygène ; une capsule conçue pour trois semaines n'en a pas du tout. La simulation reprend l'autonomie réelle de chaque véhicule en vol libre : 21 jours pour Orion, 14 pour Apollo, environ une semaine pour Dragon — face à un voyage de 200 à 300 jours.",
      '## Radiations',
      "Hors du champ magnétique terrestre, l'équipage est exposé en permanence au rayonnement cosmique galactique. Le rover Curiosity a mesuré 1,8 mSv par jour pendant son voyage vers Mars ; un trajet de neuf mois représente environ 500 mSv, l'essentiel d'une limite de carrière de 600 mSv, et le retour double la dose. Aucun blindage léger ne l'arrête. La jauge en tient le compte au fil du voyage.",
    ],
  },
  entry: {
    title: "Entrée : percuter l'air à 6 km/s",
    lead: "Pourquoi Mars est l'endroit du Système solaire où il est le plus difficile de se poser, et à quoi sert le bouclier thermique.",
    body: [
      "Le vaisseau arrive à 5,5–7,5 km/s, bien trop vite pour être freiné par ses seuls moteurs. C'est l'atmosphère qui sert de frein : le véhicule y plonge, et l'air devant lui est comprimé et chauffé à des milliers de degrés. Le bouclier thermique — les tuiles noires sous le ventre de Starship, la base ablative d'une capsule — encaisse cette énergie et la tient à l'écart de la structure. La lueur que l'on voit est réelle : l'air lui-même devient un plasma.",
      "L'air martien est environ 1 % aussi dense que celui de la Terre. C'est assez pour vous consumer, et trop peu pour vous ralentir vraiment : une capsule qui descendrait en douceur sur Terre est encore supersonique à quelques kilomètres au-dessus de Mars. Tous les engins qui s'y sont posés ont eu besoin d'un supplément — des parachutes grands comme une maison, des airbags, une grue volante propulsée. Pour un véhicule à la mesure d'un équipage, seuls des moteurs-fusées feront l'affaire.",
      '## Les chiffres',
      "Le pic d'échauffement se mesure en watts par centimètre carré, au niveau du nez. Les tuiles de Starship sont fixées ici à 50 W/cm², une limite calibrée pour que les rentrées terrestres qu'il a déjà effectuées ressortent à 43–49. Les fenêtres de 2031 et de 2033 arrivent assez vite pour la dépasser. Le pic de décélération est limité à 5 g pour un équipage affaibli par des mois d'apesanteur. Le redressement est le moment où la vitesse de descente cesse d'augmenter et où le vaisseau commence à voler plutôt qu'à tomber.",
    ],
  },
  landing: {
    title: 'La chute à plat et la bascule',
    lead: 'La descente de Starship : tomber à plat, allumer les moteurs, basculer à la verticale, se poser sur un jet de feu.',
    body: [
      "En dessous d'environ 20 km, Starship tombe à plat ventre comme un parachutiste en chute libre, ses quatre ailerons le pilotant en modulant la traînée de chaque côté. Il va encore plus vite que le son. À quelques kilomètres d'altitude, trois moteurs s'allument alors que le vaisseau est encore à l'horizontale, et la poussée le fait basculer à la verticale — la bascule — en quelques secondes. Vient alors un freinage au tout dernier moment : les moteurs doivent annuler plusieurs centaines de mètres par seconde de chute en une trentaine de secondes, sans aucune marge.",
      "C'est la rétropropulsion supersonique : allumer des moteurs face à un air qui arrive plus vite que le son. Elle n'avait jamais été démontrée avant que les propulseurs de Falcon 9 ne s'y mettent au-dessus de l'Atlantique ; sur Mars, personne ne l'a jamais fait. La simulation modélise cette poussée comme un « suicide burn » qui démarre aussi tard qu'il l'ose, tient compte de la traînée et garde 30 % de marge de poussée pour le contrôle.",
      '## Les capsules',
      "Orion, Dragon, Mengzhou et Apollo n'ont pas de moteurs d'atterrissage capables d'un tel exploit ; elles ont été conçues pour amerrir sous parachutes sur Terre. Sur Mars, leurs parachutes s'ouvriraient dans un air trop ténu pour servir à quoi que ce soit. Elles percutent le sol à leur vitesse terminale — plusieurs centaines de mètres par seconde — et la simulation le dit.",
    ],
  },
  verdict: {
    title: "L'atterrissage et le verdict",
    lead: 'Les six issues possibles, et pourquoi le site vous dit ce qui a lâché en premier.',
    body: [
      "Une mission se termine de l'une de ces six façons : posée avec l'équipage vivant ; écrasée (elle a atteint le sol trop vite) ; désintégrée (le bouclier thermique a été dépassé pendant l'entrée) ; bloquée en orbite terrestre (pas assez d'ergols pour partir) ; perdue en route (l'équipage a épuisé son air, son eau ou sa nourriture, ou a reçu une dose de radiations excessive) ; ou un survol (aucun moyen de freiner à l'arrivée sur Mars, le vaisseau passe à côté et poursuit sa route).",
      "Le verdict nomme la première chose qui a lâché, chiffres à l'appui, parce que c'est la réponse utile : elle dit ce qu'il faudrait changer. Une capsule qui tombe à court de support de vie le 21e jour n'a pas besoin d'un meilleur bouclier thermique.",
      "Se poser vivant n'est pas la fin du problème — c'est là que commence la question de la ville. Mais c'est la question à laquelle ce site s'est donné pour but de répondre.",
    ],
  },
  weather: {
    title: 'Les tempêtes de poussière',
    lead: "La seule chose sur Mars qui peut changer la réponse d'un mois à l'autre.",
    body: [
      "Mars a des saisons, et une saison des tempêtes de poussière : le printemps et l'été de l'hémisphère sud, quand la planète est au plus près du Soleil. La plupart des années apportent des tempêtes régionales ; environ une année martienne sur trois, une tempête grossit jusqu'à envelopper toute la planète, et la surface disparaît pendant des semaines. La poussière soulevée à haute altitude rend aussi la haute atmosphère plus dense — ce qui modifie l'entrée.",
      "La simulation tire la météo de la date d'arrivée d'après les archives historiques : la saison selon la longitude solaire, un tirage de tempête dont la date est la graine, le surcroît de densité, le vent en surface, et le risque qu'un système d'atterrissage qui ne voit pas le sol se pose sur un rocher. Vous pouvez l'imposer dans Réglages de la mission → Options avancées pour voir une journée dégagée.",
    ],
  },
  unknowns: {
    title: 'Ce que personne ne sait encore',
    lead: 'Les quatre chiffres qui décident du verdict de Starship, et comment jouer avec.',
    body: [
      "Quatre grandeurs n'ont jamais été mesurées et dominent la réponse pour Starship : la masse à vide du vaisseau (publiée seulement sous forme de fourchette), les ergols qu'un ravitailleur livre réellement, l'évaporation quotidienne en orbite, et le flux thermique que les tuiles peuvent supporter sur Mars. Les trois jeux d'hypothèses les encadrent ; les curseurs de Réglages de la mission → Options avancées vous permettent de fixer les vôtres.",
      "La position du site est simple : là où un chiffre est inconnu, c'est un réglage, pas une constante. Un verdict ne vaut que par les données qui le fondent ; ces données sont donc sur la table.",
    ],
  },
  models: {
    title: 'La physique en coulisses',
    lead: 'Ce qui est réellement calculé, en une page.',
    body: [
      "- Lancement : une montée plane dans le repère de l'atmosphère tournante, intégrée par Runge–Kutta d'ordre 4 au pas de 0,1 s ; atmosphère standard américaine de 1976 ; poussée et Isp de chaque moteur fonction de la pression ; traînée tirée de coefficients dépendant du nombre de Mach ; un virage gravitationnel et une loi d'injection en boucle fermée ; l'angle de basculement initial optimisé pour laisser le plus d'ergols possible en orbite.",
      "- Orbite : une campagne de ravitaillement avec une évaporation qui se cumule et une cadence de lancement, vérifiée par rapport à la période de départ.",
      "- Transfert : le problème de Lambert sur les éléments planétaires approchés du JPL (valables de 1800 à 2050), avec l'effet Oberth, une marge pour la poussée finie et des corrections à mi-parcours ; vérifié à 1 % près par rapport aux opportunités 2026/2028/2031/2033 de NASA Glenn.",
      "- Croisière : le budget de consommables de la NASA pour l'équipage, avec le recyclage de l'ECLSS ; le débit de dose en croisière mesuré par Curiosity (MSL RAD), face à la limite de carrière de 600 mSv.",
      "- Entrée : le profil de densité de la Mars Climate Database avec un facteur de poussière ; la portance pilotée par une règle de roulis ; l'échauffement au point d'arrêt selon Sutton–Graves, calibré sur les rentrées terrestres de Starship ; la charge en g comparée à la limite d'un équipage déconditionné ; une poussée d'atterrissage en rétropropulsion supersonique qui tient compte de la traînée.",
      "Chaque chiffre renvoie à une note de recherche sourcée, avec un indice de confiance. Les décors — le cap Canaveral, la Terre, Mars — sont construits à partir de données de la NASA et de Natural Earth, et peints pour ressembler à ce qu'on voit depuis une fusée.",
    ],
  },
}
