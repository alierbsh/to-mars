/** The wiki — es (translated from en/wiki.ts; same chapters). */
import type { WikiCatalog } from '../types'

export const WIKI: WikiCatalog = {
  why: {
    title: 'Por qué una ciudad en Marte',
    lead: 'El problema de tener un solo planeta, y por qué Marte es la única respuesta a nuestro alcance.',
    body: [
      'Todo ser vivo que ha existido ha vivido en un solo planeta. Eso hace que la vida sea frágil de una forma en la que rara vez pensamos: basta un asteroide lo bastante grande, un supervolcán, una guerra o un siglo aciago, y no hay copia de seguridad. Un segundo asentamiento autosuficiente es el primer seguro de verdad que se le ha ofrecido jamás a la vida.',
      'Marte es el único candidato lo bastante cercano. Su día dura 24 horas y 37 minutos, así que plantas y personas mantienen un ritmo familiar. Hay agua, congelada en el subsuelo y en los polos. Su tenue atmósfera es de dióxido de carbono, que con agua y electricidad se convierte en metano y oxígeno: combustible para cohetes y algo que respirar. La luz del Sol es más débil que aquí, alrededor del 43 % en el ecuador, pero basta para cultivar bajo cristal.',
      'Nada de eso lo convierte en un hogar. Lo convierte en una frontera que podría llegar a serlo. Este sitio se plantea la primera pregunta del camino: ¿pueden los cohetes que existen hoy llevar una tripulación con vida hasta la superficie? Y si no pueden, ¿qué falla primero?',
    ],
  },
  musk: {
    title: 'Las razones de Elon Musk para ir a Marte',
    lead: 'Por qué el hombre que construye Starship dice que hay que ir: con sus propias palabras, sus fechas y lo que le responden sus críticos.',
    body: [
      'SpaceX se fundó en 2002 «con el objetivo último de permitir que la gente viva en otros planetas». El argumento de su fundador apenas ha cambiado desde entonces. Sus fechas, muchas veces.',
      '## Un solo planeta se acaba',
      '> Un camino es quedarnos en la Tierra para siempre, y entonces habrá algún evento de extinción. | Congreso Astronáutico Internacional, Guadalajara, 2016',
      'El otro camino es volverse multiplanetarios: un segundo hogar capaz de seguir adelante solo. Musk lo llama «un seguro de vida para la vida en su conjunto» (2025) y habla de llevar «la luz de la conciencia» a las estrellas.',
      '## Por qué Marte',
      '- A una vez y media la distancia de la Tierra al Sol, la luz solar sigue bastando.',
      '- El día es casi el nuestro, algo más de 24 horas y media. La gravedad es el 38 % de la terrestre.',
      '- Hay hielo casi en todas partes y el aire es dióxido de carbono: juntos dan metano y oxígeno, el combustible para volver.',
      '- La Luna es pequeña y no tiene aire, y su día dura un mes. Venus es «un baño de ácido caliente».',
      'En febrero de 2026 dio prioridad a una ciudad en la Luna —a dos días en lugar de seis meses, así que se aprende más rápido—, con Marte como meta.',
      '## Mientras podamos',
      '> Creo que lo sensato es hacer la vida multiplanetaria mientras podamos. | Unión Geofísica Americana, San Francisco, 2015',
      'En 4.500 millones de años es la primera vez que la vida de la Tierra puede llegar a otro planeta. Y la tecnología también puede retroceder: una guerra mundial, una nueva edad oscura.',
      '## Algo que esperar con ilusión',
      '> La vida no puede consistir solo en resolver un problema miserable tras otro. Tiene que haber cosas que te inspiren, que te alegren al despertar por la mañana y te hagan sentir parte de la humanidad. | SXSW, Austin, 2018',
      '## El umbral',
      'Una ciudad cuenta como tal cuando sigue creciendo aunque dejen de llegar naves de la Tierra. Sus cifras: alrededor de un millón de personas, cerca de un millón de toneladas de carga y mil naves o más cada vez que los planetas se alinean, cada 26 meses.',
      'Eso solo funciona si un asiento cuesta lo que una casa y no miles de millones. Sus cuatro palancas: cohetes reutilizados por completo, repostaje en órbita, propelente fabricado en Marte y metano como combustible. El repostaje en órbita es justo lo que esta simulación pone a prueba.',
      '## Las fechas no dejaron de moverse',
      '- 2017: naves de carga a Marte en 2022 y una tripulación en 2024.',
      '- 2020: «muy seguro» de que habría personas en Marte hacia 2026.',
      '- 2025: naves con robots Optimus a finales de 2026; personas «ya en 2029, aunque 2031 es más probable».',
      '- Febrero de 2026: primero la Luna; una ciudad en Marte empezaría dentro de cinco a siete años.',
      '- Octubre de 2026: la ventana de finales de 2026 se ha dejado pasar —el repostaje en órbita aún no se ha demostrado— y SpaceX anuncia carga a Marte no antes de 2028.',
      '> Históricamente, mis plazos han sido optimistas. | Elon Musk, SXSW, 2018',
      '## Lo que responden los críticos',
      '- Radiación: solo el viaje de ida y vuelta, según lo midió Curiosity, suma unos 0,66 sievert, por encima del límite de carrera de la NASA, 0,6.',
      '- Cuerpos: nadie sabe qué le hace un 38 % de gravedad a un embarazo o a un niño que crece.',
      '- Primero la Tierra: la astrónoma Lucianne Walkowicz (TED, 2015) calificó de soberbia pensar que asentarse en otro planeta bastará por sí solo para salvarnos.',
      '- Vida en Marte: las personas llevan microbios, que podrían enturbiar la búsqueda de vida marciana.',
      '- Dinero: el propio folleto de salida a bolsa de SpaceX (2026) advierte que sus planes para la Luna y Marte dependen de «tecnologías no probadas».',
    ],
  },
  rockets: {
    title: 'Por qué un cohete es casi todo combustible',
    lead: 'La ecuación del cohete en un párrafo, y por qué los vehículos se dividen en etapas.',
    body: [
      'Un cohete avanza expulsando masa hacia atrás a gran velocidad. Para ir más rápido tiene que expulsar más, pero el propelente que todavía no ha expulsado es peso muerto que también hay que acelerar. Ese círculo vicioso es implacable: llegar a la órbita exige un cambio de velocidad de unos 9,4 km/s y, con los mejores motores químicos, eso significa que cerca del 90 % de un cohete en la plataforma es propelente. Starship V3 pesa unas 5700 toneladas en la plataforma y menos de 400 toneladas vacío.',
      'Las etapas son la forma de escapar de esa aritmética. En cuanto se vacían los primeros tanques, se sueltan, de modo que los motores de la etapa siguiente solo empujan lo que todavía es útil. Todos los vehículos de este sitio tienen dos o tres etapas; Falcon Heavy y SLS, además, llevan propulsores sujetos a los lados de la etapa central y se desprenden de ellos primero.',
      '## Qué hace la simulación con esto',
      'Cada etapa lleva su masa en seco, su carga de propelente y sus motores reales (empuje y eficiencia a nivel del mar y en el vacío). Las cifras que nadie ha publicado —sobre todo las masas en seco de Starship— no se adivinan una vez para luego esconderlas: son controles deslizantes en Ajustes de la misión → Avanzado, con el intervalo publicado como rango.',
    ],
  },
  liftoff: {
    title: 'El despegue y los primeros minutos',
    lead: 'La ignición, la sujeción a la plataforma, max-Q y por qué un cohete se inclina casi de inmediato.',
    body: [
      'Los motores se encienden unos segundos antes de que el reloj llegue a cero y se comprueban mientras unas abrazaderas mantienen el vehículo sujeto; solo se libera cuando todos los motores funcionan bien. En el despegue, el empuje es apenas algo mayor que el peso —Starship acelera a unos 0,5 g—, así que los primeros segundos son lentos. El agua del sistema de diluvio que se ve protege la plataforma tanto del sonido como del calor: la energía acústica por sí sola haría pedazos el vehículo.',
      'A los pocos segundos, el vehículo empieza a inclinarse hacia el este. Subir en vertical lo desperdiciaría todo: estar en órbita no es cuestión de altura, sino de velocidad, 28.000 km/h en horizontal. Esa inclinación, llamada giro gravitatorio, deja que la gravedad vaya bajando el morro poco a poco mientras el cohete sigue empujando en su dirección de avance, que es la trayectoria más eficiente posible.',
      '## Max-Q',
      'Hacia el primer minuto, el cohete ya va rápido, pero el aire todavía es denso. La fuerza del flujo de aire —la presión dinámica, «Q»— alcanza aquí su máximo, unos 25–35 kPa en estos vehículos. Se reduce el empuje de los motores durante unos segundos para no llevar la estructura más allá de sus límites, y se vuelve a aumentar a medida que el aire se enrarece. Más o menos al mismo tiempo se supera la velocidad del sonido.',
      '## En la simulación',
      'El ascenso se integra paso a paso: un empuje que aumenta a medida que baja la presión del aire, la resistencia de la atmósfera real, el giro gravitatorio y una ley de guiado en lazo cerrado que dirige el vehículo hacia la órbita objetivo. Los vehículos tripulados se limitan a 4 g.',
    ],
  },
  staging: {
    title: 'Las etapas y el camino a la órbita',
    lead: 'MECO, la separación, el largo segundo encendido y lo que significa de verdad «estar en órbita».',
    body: [
      'A los dos o tres minutos, la primera etapa ha quemado casi todo lo que llevaba. Sus motores se apagan (MECO, del inglés main engine cut-off: apagado de los motores principales), las etapas se separan y se enciende la etapa superior. Starship lo hace «en caliente»: los motores de la nave se encienden cuando todavía está unida al propulsor y se separa empujando contra él. El propulsor está entonces a 60–70 km de altura y a 6000–8000 km/h, muy lejos de la órbita, y vuelve a caer hacia el mar; los propulsores de Starship y de Falcon regresan para que los atrapen en la torre o para aterrizar.',
      'La etapa superior sigue encendida otros seis a ocho minutos, casi en horizontal, hasta alcanzar la velocidad orbital: unos 7,8 km/s, 28.000 km/h, a 200 km. A esa velocidad, el suelo se curva y se aleja tan deprisa como el vehículo cae hacia él: eso es todo lo que es una órbita, una caída que nunca toca tierra. El SECO (second engine cut-off: apagado del motor de la segunda etapa) marca ese momento.',
      '## Por qué puede fallar',
      'Si falta propelente, el vehículo se queda corto: o reentra de inmediato o alcanza una órbita cuyo punto más bajo todavía roza el aire. La simulación indica la órbita alcanzada (perigeo × apogeo) y cuánto propelente sobró; ese remanente es todo con lo que contará el resto de la misión.',
    ],
  },
  refuelling: {
    title: 'Órbita y recarga de propelente',
    lead: 'Por qué Starship llega a la órbita casi sin propelente y cómo la llenan las naves cisterna.',
    body: [
      'Llegar a la órbita consume casi todo el propelente que lleva un cohete. Starship alcanza la órbita con unas 100–200 toneladas en un tanque de 1600 toneladas: demasiado poco para impulsarse hasta Marte y aterrizar. El plan de SpaceX es lanzar naves cisterna Starship, acoplarlas y trasvasar propelente, una y otra vez, hasta que la nave esté lo bastante llena para el viaje.',
      'Tres cifras deciden si esto funciona, y ninguna se ha medido todavía en vuelo: cuánto entrega realmente una cisterna en cada vuelo (el plan habla de ~100 toneladas), a qué ritmo se evapora el propelente criogénico mientras espera al sol (menos de un 1 % al día, que se va acumulando) y con qué rapidez se pueden lanzar las cisternas. Una cadencia lenta significa más evaporación y más cisternas; si es demasiado lenta, la ventana de salida se cierra antes de que la nave esté llena.',
      'El indicador Propelente de la franja inferior muestra las toneladas a bordo frente a las que necesita la misión; la línea de tiempo marca el acoplamiento de cada cisterna. Los tres conjuntos de hipótesis —lo que afirma SpaceX, las estimaciones independientes y lo demostrado hasta ahora— acotan esas incógnitas.',
      'Ninguno de los demás (Orion, Dragon, Mengzhou, Apolo) se puede recargar: el propelente que le quede en órbita a su etapa superior es todo lo que tienen.',
    ],
  },
  window: {
    title: 'La ventana de lanzamiento',
    lead: 'Por qué solo se puede ir a Marte cada 26 meses y por qué unos años son más difíciles que otros.',
    body: [
      'La Tierra y Marte giran alrededor del Sol, la Tierra más deprisa. Una nave que sale de la Tierra no apunta a donde está Marte, sino a donde estará ocho o nueve meses después, avanzando por inercia sobre una elipse que toca ambas órbitas. Esa geometría solo se repite una vez cada 26 meses; si se pierde, la siguiente oportunidad queda a dos años vista.',
      'No todas las ventanas son iguales. La órbita de Marte es apreciablemente elíptica, así que algunos años los dos planetas se encuentran cuando Marte está lejos del Sol y la nave llega despacio; otros años (2031, 2033) llega deprisa. La cifra que lo resume es la v-infinito, la velocidad sobrante respecto al planeta: 2,7 km/s en las ventanas fáciles y más de 5 km/s en las difíciles. La velocidad de llegada se convierte en velocidad de entrada, y la velocidad de entrada, en calor.',
      '## En la simulación',
      'La transferencia se resuelve como un problema de Lambert con las posiciones planetarias del JPL, para la fecha de salida y la duración del viaje elegidas, y se contrasta con las oportunidades de mínima energía que publica la NASA. En Ajustes de la misión puedes elegir la ventana; el diagrama de chuleta de cerdo (porkchop) de Datos muestra cómo se compensan entre sí las fechas de salida y de llegada.',
    ],
  },
  tmi: {
    title: 'Inyección transmarciana',
    lead: 'El encendido que convierte una órbita alrededor de la Tierra en un camino hacia Marte.',
    body: [
      'Desde una órbita de aparcamiento de 200 km, la nave necesita otros 3,6–4,0 km/s para escapar de la Tierra y llegar con la velocidad adecuada. Saca el máximo partido a ese propelente encendiendo los motores en el punto más bajo y más rápido de su órbita: es el efecto Oberth, por el que un mismo empujón aporta más energía cuando ya se va deprisa. En Starship, el encendido dura un minuto y medio y consume varios cientos de toneladas.',
      'Si la nave no llega a la cifra completa, la misión termina aquí. Si se queda un poco corta, alcanza una órbita que nunca abandona las inmediaciones de la Tierra («no sale de la órbita»); la tripulación vuelve a casa y la ventana se pierde.',
    ],
  },
  cruise: {
    title: 'El crucero',
    lead: 'De seis a nueve meses de vuelo por inercia: aire, agua, comida y la radiación que nadie puede apagar.',
    body: [
      'Tras el encendido, los motores quedan apagados el resto del camino: la nave avanza por inercia sobre su elipse, con solo pequeñas correcciones de rumbo. No pasa nada, y ese es el problema. Hay que mantener con vida a la tripulación todo ese tiempo con lo que se haya embarcado.',
      'El presupuesto diario de la NASA por persona es de unos 0,9 kg de oxígeno, 2,4 kg de comida y 3,5 kg de agua, antes de reciclar. Un buen sistema de soporte vital de ciclo cerrado recupera la mayor parte del agua y algo del oxígeno; una cápsula diseñada para tres semanas no tiene ninguno. La simulación usa la autonomía real en vuelo libre de cada vehículo (Orion, 21 días; Apolo, 14; Dragon, alrededor de una semana) frente a un viaje de 200–300 días.',
      '## Radiación',
      'Fuera del campo magnético terrestre, la tripulación está expuesta en todo momento a los rayos cósmicos galácticos. El rover Curiosity midió 1,8 mSv al día durante el viaje a Marte; un viaje de nueve meses supone unos 500 mSv, la mayor parte de un límite de carrera de 600 mSv, y el regreso duplica la dosis. Ningún blindaje ligero puede detener esa radiación. El indicador va sumando la dosis sobre la marcha.',
    ],
  },
  entry: {
    title: 'Entrada: chocar con el aire a 6 km/s',
    lead: 'Por qué Marte es el lugar más difícil del sistema solar para aterrizar y para qué sirve el escudo térmico.',
    body: [
      'La nave llega a 5,5–7,5 km/s, mucho más deprisa de lo que cualquier motor podría frenar por sí solo. El freno es la atmósfera: el vehículo se zambulle en ella y el aire que tiene delante se comprime y se calienta a miles de grados. El escudo térmico —las losetas negras del vientre de Starship, la base ablativa de una cápsula— absorbe esa energía y la mantiene lejos de la estructura. El resplandor que se ve es real: el propio aire se convierte en plasma.',
      'El aire de Marte tiene alrededor del 1 % de la densidad del de la Tierra. Es lo bastante denso para quemarte y lo bastante tenue para no frenarte mucho: una cápsula que en la Tierra bajaría suavemente sigue siendo supersónica a pocos kilómetros sobre la superficie de Marte. Todos los sistemas que han aterrizado allí han necesitado algo más: paracaídas del tamaño de una casa, airbags, una grúa propulsada por cohetes. Para un vehículo capaz de llevar una tripulación, solo sirven los cohetes.',
      '## Las cifras',
      'El calentamiento máximo se mide en vatios por centímetro cuadrado en el morro. Aquí, las losetas de Starship tienen un límite de 50 W/cm², calibrado para que las reentradas que ya ha hecho en la Tierra den entre 43 y 49. En las ventanas de 2031 y 2033 se llega lo bastante rápido como para superarlo. La deceleración máxima para una tripulación debilitada por meses de ingravidez se limita a 5 g. La recuperación (pull-out) es el momento en que la velocidad de descenso deja de aumentar y la nave empieza a volar en lugar de caer.',
    ],
  },
  landing: {
    title: 'El panzazo y el giro',
    lead: 'Cómo baja Starship: caer en horizontal, encender los motores, enderezarse y aterrizar sobre el fuego.',
    body: [
      'Por debajo de unos 20 km, Starship cae de panza como un paracaidista, y sus cuatro aletas la dirigen variando la resistencia que genera cada lado. Todavía va más rápido que el sonido. A pocos kilómetros del suelo, tres motores se encienden con la nave aún en horizontal y el empuje la endereza —el giro— en unos segundos. A partir de ahí es una frenada en el último instante (hover-slam): los motores tienen que anular varios cientos de metros por segundo de caída en unos treinta segundos, sin margen de sobra.',
      'Es retropropulsión supersónica: encender los motores contra un aire que te llega más rápido que el sonido. No estaba demostrada hasta que los propulsores de Falcon 9 empezaron a hacerlo sobre el Atlántico; en Marte nunca se ha hecho. La simulación modela el encendido como un «encendido suicida» que empieza lo más tarde posible, tiene en cuenta la resistencia aerodinámica y reserva un 30 % del empuje para el control.',
      '## Las cápsulas',
      'Orion, Dragon, Mengzhou y Apolo no tienen motores de aterrizaje capaces de hacer esto; se construyeron para amerizar con paracaídas en la Tierra. En Marte, sus paracaídas se abrirían en un aire demasiado tenue para servir de algo. Chocan contra el suelo a velocidad terminal —varios cientos de metros por segundo—, y la simulación lo refleja.',
    ],
  },
  verdict: {
    title: 'La toma de contacto y el veredicto',
    lead: 'Los seis desenlaces posibles y por qué el sitio te dice qué falló primero.',
    body: [
      'Una misión termina de una de estas seis formas: aterriza con la tripulación viva; se estrella (llega al suelo demasiado rápido); se desintegra (se supera el límite del escudo térmico durante la entrada); no sale de la órbita terrestre (no hay propelente suficiente para partir); la tripulación muere en el tránsito (se queda sin aire, agua o comida, o recibe una dosis de radiación excesiva); o pasa de largo (no hay forma de frenar en Marte, así que la nave lo sobrevuela y sigue su camino).',
      'El veredicto nombra lo primero que falló, con sus cifras, porque esa es la respuesta útil: te dice qué tendría que cambiar. Una cápsula que se queda sin soporte vital el día 21 no necesita un escudo térmico mejor.',
      'Aterrizar con vida no es el final del problema: es donde empieza la pregunta de la ciudad. Pero es la pregunta que este sitio se propuso responder.',
    ],
  },
  weather: {
    title: 'Tormentas de polvo',
    lead: 'Lo único de Marte que puede cambiar la respuesta de un mes para otro.',
    body: [
      'Marte tiene estaciones, y una temporada de tormentas de polvo: la primavera y el verano del hemisferio sur, cuando el planeta está más cerca del Sol. Casi todos los años hay tormentas regionales; aproximadamente uno de cada tres años marcianos, una tormenta crece hasta envolver el planeta entero y la superficie desaparece durante semanas. El polvo que sube a gran altura también hace más densa la alta atmósfera, lo que cambia la entrada.',
      'La simulación sortea la meteorología de la fecha de llegada a partir del registro histórico: la estación según la longitud solar, una tirada de tormenta con la fecha como semilla, la densidad adicional, el viento en superficie y la probabilidad de que un sistema de aterrizaje que no ve el suelo se pose sobre una roca. Puedes cambiarla en Ajustes de la misión → Avanzado para ver un día despejado.',
    ],
  },
  unknowns: {
    title: 'Lo que nadie sabe todavía',
    lead: 'Las cuatro cifras que deciden el veredicto de Starship y cómo jugar con ellas.',
    body: [
      'Hay cuatro magnitudes que nunca se han medido y que dominan la respuesta para Starship: la masa en seco de la nave (publicada solo como un intervalo), el propelente que entrega realmente una cisterna, la pérdida diaria por evaporación en órbita y el flujo de calor que pueden soportar las losetas en Marte. Los tres conjuntos de hipótesis las acotan; los controles deslizantes de Ajustes de la misión → Avanzado te permiten fijar las tuyas.',
      'La postura del sitio es sencilla: cuando una cifra se desconoce, es un control, no una constante. Un veredicto solo es tan honesto como los datos de partida, así que los datos están a la vista.',
    ],
  },
  models: {
    title: 'La física que hay detrás',
    lead: 'Qué se calcula exactamente, en una página.',
    body: [
      '- Lanzamiento: un ascenso plano en el sistema de referencia de la atmósfera en rotación, integrado con Runge–Kutta de cuarto orden a 0,1 s; atmósfera estándar de EE. UU. de 1976; empuje e Isp de cada motor en función de la presión; resistencia con coeficientes que dependen del número de Mach; giro gravitatorio y ley de inserción en lazo cerrado; el cabeceo inicial se elige para dejar el máximo de propelente en órbita.',
      '- Órbita: una campaña de cisternas con pérdida por evaporación acumulativa y una cadencia de lanzamientos, contrastada con el periodo de salida.',
      '- Transferencia: problema de Lambert con los elementos planetarios aproximados del JPL (válidos entre 1800 y 2050), con el efecto Oberth, un margen por encendido finito y correcciones a mitad de trayecto; contrastada con las oportunidades 2026/2028/2031/2033 de NASA Glenn, con menos de un 1 % de diferencia.',
      '- Crucero: el presupuesto de consumibles por tripulante de la NASA con recuperación ECLSS; la tasa de dosis en crucero de Curiosity (MSL RAD) frente al límite de carrera de 600 mSv.',
      '- Entrada: el perfil de densidad de la Mars Climate Database con un factor por el polvo; sustentación con una regla de alabeo; calentamiento en el punto de remanso según Sutton–Graves, calibrado con las reentradas de Starship en la Tierra; carga g frente al límite de una tripulación desacondicionada; un encendido de aterrizaje con retropropulsión supersónica que descuenta la resistencia aerodinámica.',
      'Cada cifra remite a una nota de investigación con fuentes y una etiqueta de confianza. El paisaje —Cabo Cañaveral, la Tierra, Marte— está construido con datos de la NASA y de Natural Earth, y pintado para que se vea como se ve desde un cohete.',
    ],
  },
}
