/** The wiki — tr (translated from en/wiki.ts; same chapters). */
import type { WikiCatalog } from '../types'

export const WIKI: WikiCatalog = {
  why: {
    title: "Neden Mars'ta bir şehir",
    lead: "Tek gezegen sorunu ve ulaşılabilecek tek yanıtın neden Mars olduğu.",
    body: [
      'Bugüne kadar var olmuş her canlı tek bir gezegende yaşadı. Bu, hayatı pek aklımıza gelmeyen bir biçimde kırılgan kılıyor: yeterince büyük bir asteroit, bir süper yanardağ, bir savaş, kötü geçen bir yüzyıl — ve yedeği yok. Kendi kendine yetebilen ikinci bir yerleşim, hayata şimdiye dek sunulmuş ilk gerçek sigorta poliçesi olur.',
      "Yeterince yakın olan tek aday Mars. Günü 24 saat 37 dakika sürüyor; bitkiler de insanlar da alıştıkları ritmi koruyabilir. Su var: toprağın içinde ve kutuplarda donmuş hâlde. İnce havası karbondioksitten oluşuyor; bu gaz su ve elektrikle metana ve oksijene dönüştürülebilir — hem roket yakıtı hem solunacak hava. Güneş ışığı Dünya'dakinden zayıf — ekvatorda yaklaşık %43'ü kadar — ama cam altında ürün yetiştirmeye yetiyor.",
      "Bunların hiçbiri Mars'ı bir yurt yapmıyor; onu, bir gün yurda dönüşebilecek bir sınır bölgesi yapıyor. Bu site oraya giden yoldaki ilk soruyu soruyor: bugün var olan roketler bir mürettebatı yüzeye sağ salim taşıyabilir mi — taşıyamıyorsa, ilk olarak ne kırılır?",
    ],
  },
  rockets: {
    title: 'Roketin çoğu neden yakıt',
    lead: 'Tek paragrafta roket denklemi ve araçların neden kademeli yapıldığı.',
    body: [
      "Roket, arkasından çok hızlı kütle fırlatarak ilerler. Daha hızlı gitmek için daha fazla kütle fırlatması gerekir; ama henüz fırlatmadığı yakıt da hızlandırılması gereken ölü ağırlıktır. Bu geri besleme acımasızdır: yörüngeye çıkmak yaklaşık 9,4 km/s'lik bir hız değişimi gerektirir ve en iyi kimyasal motorlarla bu, rampadaki bir roketin kabaca %90'ının yakıt olması demektir. Starship V3 rampada yaklaşık 5700 ton, boşken 400 tonun altında.",
      'Kademelendirme bu aritmetikten kaçış yoludur. İlk tanklar boşalınca atılır; böylece bir sonraki kademenin motorları yalnızca hâlâ işe yarayan kütleyi iter. Buradaki her araçta iki ya da üç kademe var; Falcon Heavy ve SLS ayrıca çekirdeğin yanlarına iticiler bağlar ve ilk önce onları bırakır.',
      '## Simülasyon bununla ne yapıyor',
      "Her kademe gerçek kuru kütlesini, yakıt yükünü ve motorlarını (deniz seviyesinde ve vakumda itki ve verim) taşır. Kimsenin yayımlamadığı sayılar — her şeyden önce Starship'in kuru kütleleri — bir kez tahmin edilip gizlenmez: Görev ayarları → Gelişmiş altında, yayımlanmış alt ve üst sınırlar arasında oynatılabilen kaydırıcılar olarak durur.",
    ],
  },
  liftoff: {
    title: 'Kalkış ve ilk dakikalar',
    lead: 'Ateşleme, tutma kelepçeleri, max-Q ve bir roketin neden hemen yana yatmaya başladığı.',
    body: [
      'Motorlar saat sıfıra ulaşmadan birkaç saniye önce ateşlenir ve kelepçeler aracı yerinde tutarken denetlenir; araç ancak bütün motorlar sağlıklı çalışıyorsa serbest bırakılır. Kalkışta itki ağırlığı yalnızca biraz aşar — Starship yaklaşık 0,5 g ile hızlanır — bu yüzden ilk saniyeler yavaş geçer. Ekranda görünen su perdesi rampayı ısıdan olduğu kadar sesten korumak için de oradadır: yalnızca akustik enerji bile aracı sarsıp parçalayabilir.',
      'Birkaç saniye içinde araç doğuya doğru eğilmeye başlar. Dümdüz yukarı çıkmak her şeyi boşa harcardı: yörünge yükseklikle değil hızla ilgilidir — yatay yönde saatte 28.000 km. Yerçekimi dönüşü denen bu eğilme, roket hareket yönünde itmeyi sürdürürken burnun yerçekimiyle yavaş yavaş yana yatmasını sağlar; bilinen en verimli yol budur.',
      '## Max-Q',
      'Kalkıştan yaklaşık bir dakika sonra roket hızlanmıştır ama hava hâlâ yoğundur. Hava akışının kuvveti — dinamik basınç, “Q” — burada zirveye ulaşır; bu araçlar için 25–35 kPa civarındadır. Yapının sınırlarını aşmaması için motorlar birkaç saniyeliğine kısılır, hava inceldikçe yeniden açılır. Ses hızı da aşağı yukarı aynı sırada geçilir.',
      '## Simülasyonda',
      'Tırmanış adım adım hesaplanır: hava basıncı düştükçe artan itki, gerçek atmosferin hava direnci, yerçekimi dönüşü ve aracı hedef yörüngeye yönlendiren kapalı döngü bir güdüm yasası. Mürettebatlı araçlarda ivme 4 g ile sınırlanır.',
    ],
  },
  staging: {
    title: 'Kademe ayrılması ve yörünge',
    lead: 'MECO, ayrılma, uzun ikinci yanma ve “yörüngede” olmanın gerçekte ne anlama geldiği.',
    body: [
      "Kalkıştan iki üç dakika sonra ilk kademe taşıdığı yakıtın neredeyse tamamını yakmıştır. Motorları kapanır (MECO — main engine cut-off, ana motorların kesilmesi), kademeler ayrılır ve üst kademe ateşlenir. Starship bunu “sıcak” yapar: gemi daha iticiye bağlıyken motorlarını ateşler ve iticiyi geriye iterek ondan ayrılır. İtici bu noktada 60–70 km yükseklikte ve saatte 6000–8000 km hızdadır — yörüngeden çok uzakta — ve denize doğru geri düşer; Starship'in ve Falcon'un iticileri yakalanmak ya da inmek için geri uçar.",
      "Üst kademe neredeyse yatay biçimde altı ila sekiz dakika daha yanar ve yörünge hızına ulaşır — 200 km'de yaklaşık 7,8 km/s, yani saatte 28.000 km. Bu hızda yer, aracın ona doğru düştüğü hızla kıvrılıp uzaklaşır: yörünge bundan ibarettir, hiç yere değmeyen bir düşüş. SECO (second engine cut-off, ikinci motor kesmesi) bu anı işaretler.",
      '## Neden başarısız olabilir',
      'Yakıt yetmezse araç hedefin gerisinde kalır: ya hemen atmosfere geri döner ya da en alçak noktası hâlâ havayı sıyıran bir yörüngeye ulaşır. Simülasyon ulaşılan yörüngeyi (perije × apoje) ve ne kadar yakıt kaldığını bildirir — görevin geri kalanı o artık yakıtla idare etmek zorundadır.',
    ],
  },
  refuelling: {
    title: 'Yörünge ve yakıt ikmali',
    lead: "Starship'in yörüngeye neden neredeyse boş vardığı ve tankerlerin onu nasıl doldurduğu.",
    body: [
      "Yörüngeye çıkmak, bir roketin taşıdığı yakıtın neredeyse tamamını tüketir. Starship yörüngeye, 1600 tonluk tankında kabaca 100–200 ton yakıtla varır — kendini Mars'a itip inmeye hiç yetmeyecek kadar az. SpaceX'in planı tanker Starship'ler uçurmak, kenetlenmek ve gemi yolculuğa yetecek kadar dolana dek yakıtı tekrar tekrar aktarmak.",
      'Bunun işe yarayıp yaramayacağını üç sayı belirliyor ve hiçbiri henüz uçuşta ölçülmedi: bir tankerin uçuş başına gerçekte ne kadar yakıt teslim ettiği (plan ~100 ton diyor), kriyojenik yakıtın güneş ışığı altında beklerken ne hızla buharlaştığı (günde yüzde birin küçük bir kesri, ama bileşik olarak birikiyor) ve tankerlerin ne sıklıkla fırlatılabildiği. Seyrek fırlatma daha fazla buharlaşma ve daha fazla tanker demektir; fırlatmalar çok seyrekse gemi dolmadan ayrılış penceresi kapanır.',
      "Alt bantta yer alan Yakıt göstergesi gemideki tonajı görevin ihtiyacıyla karşılaştırır; zaman çizelgesi her tanker kenetlenmesini işaretler. Üç hazır varsayım seti — SpaceX'in iddiaları, bağımsız tahminler, şimdiye kadar gösterilenler — bu bilinmeyenleri iki uçtan çevreler.",
      'Geri kalan araçların hiçbiri (Orion, Dragon, Mengzhou, Apollo) yakıt ikmali alamaz: üst kademelerinde yörüngede ne kadar yakıt kaldıysa ellerindeki o kadardır.',
    ],
  },
  window: {
    title: 'Fırlatma penceresi',
    lead: "Mars'a neden yalnızca 26 ayda bir gidilebildiği ve bazı yılların neden ötekilerden zor olduğu.",
    body: [
      "Dünya da Mars da Güneş'in çevresinde döner; Dünya daha hızlıdır. Dünya'dan ayrılan bir gemi Mars'ın o anki konumuna değil, sekiz dokuz ay sonra olacağı yere nişan alır ve iki yörüngeye de değen bir elips üzerinde süzülür. Bu geometri yalnızca 26 ayda bir oluşur; kaçırılırsa bir sonraki fırsat iki yıl sonradır.",
      "Pencereler eşit değildir. Mars'ın yörüngesi belirgin biçimde eliptiktir; bu yüzden bazı yıllarda iki gezegen Mars'ın Güneş'ten uzak olduğu noktada buluşur ve gemi yavaş varır, bazı yıllarda ise (2031, 2033) hızlı. Bunu ölçen sayı v-sonsuzdur (v∞), yani geminin gezegene göre geriye kalan fazla hızı: kolay pencerelerde 2,7 km/s, zor olanlarda 5 km/s'nin üstünde. Varış hızı giriş hızına, giriş hızı da ısıya dönüşür.",
      '## Simülasyonda',
      "Transfer, seçilen ayrılış tarihi ve yolculuk süresi için JPL'nin gezegen konumları üzerinde Lambert problemi olarak çözülür ve NASA'nın yayımladığı en düşük enerjili fırsatlarla karşılaştırılarak doğrulanır. Pencere Görev ayarlarından seçilir; Veriler altındaki porkchop grafiği, ayrılış ve varış tarihlerinin birbirine göre nasıl değiştiğini gösterir.",
    ],
  },
  tmi: {
    title: "Mars'a geçiş yanması",
    lead: "Dünya çevresindeki bir yörüngeyi Mars'a giden bir yola çeviren tek yanma.",
    body: [
      "200 km'lik park yörüngesindeki gemi, Dünya'dan kurtulup Mars'a uygun hızla varmak için 3,6–4,0 km/s daha kazanmak zorundadır. Bu yakıtın karşılığını en iyi, yörüngesinin en alçak ve en hızlı noktasında yanma yaparak alır — Oberth etkisi: aynı itki, araç zaten hızlı giderken ona daha fazla enerji katar. Starship için yanma bir buçuk dakika sürer ve birkaç yüz ton yakıt harcar.",
      "Gemi bu sayının tamamını karşılayamıyorsa görev burada biter. Az bir farkla eksik kalırsa Dünya'nın yakın çevresinden hiç çıkamayan bir yörüngeye ulaşır (“yörüngede mahsur”); mürettebat eve döner, pencere kaybedilir.",
    ],
  },
  cruise: {
    title: 'Yolculuk',
    lead: 'Altı ila dokuz ay boyunca süzülerek yol almak: hava, su, yiyecek ve kimsenin kapatamadığı radyasyon.',
    body: [
      'Yanmadan sonra motorlar yolun geri kalanında kapalı kalır: gemi yalnızca küçük rota düzeltmeleriyle elipsi üzerinde süzülür. Hiçbir şey olmaz — sorun da tam olarak budur. Mürettebatın bütün bu süre boyunca yanına alınanlarla hayatta tutulması gerekir.',
      "NASA'nın kişi başı günlük bütçesi, geri dönüşümden önce yaklaşık 0,9 kg oksijen, 2,4 kg yiyecek ve 3,5 kg sudur. İyi bir yaşam desteği döngüsü suyun çoğunu ve oksijenin bir kısmını geri kazanır; üç hafta için tasarlanmış bir kapsülde böyle bir döngü hiç yoktur. Simülasyon her aracın gerçek serbest uçuş kapasitesini kullanır: Orion 21 gün, Apollo 14 gün, Dragon yaklaşık bir hafta — 200–300 günlük bir yolculuğa karşı.",
      '## Radyasyon',
      "Dünya'nın manyetik alanının dışında mürettebat sürekli olarak galaktik kozmik ışınlara maruz kalır. Curiosity gezgini Mars yolunda günde 1,8 mSv ölçtü; dokuz aylık bir yolculuk yaklaşık 500 mSv eder — 600 mSv'lik kariyer sınırının büyük kısmı — ve eve dönüş bunu ikiye katlar. Bu ışınları durduracak hafif bir zırh yok. Gösterge, yol alındıkça dozu toplar.",
    ],
  },
  entry: {
    title: 'Giriş: havaya 6 km/s ile çarpmak',
    lead: "Mars'ın Güneş Sistemi'nde iniş yapılacak en zor yer olmasının nedeni ve ısı kalkanının işlevi.",
    body: [
      "Gemi 5,5–7,5 km/s hızla gelir; yalnızca motorlarla yavaşlatılabilecek her şeyden çok daha hızlı. Fren atmosferin kendisidir: araç içeri dalar, önündeki hava sıkışıp binlerce dereceye kadar ısınır. Isı kalkanı — Starship'in karnındaki siyah karolar, bir kapsülün ablatif tabanı — bu enerjiyi karşılar ve yapıdan uzak tutar. Görünen parıltı gerçektir: havanın kendisi plazmaya dönüşür.",
      "Mars'ın havası Dünya'nınkinin yaklaşık %1'i kadar yoğundur. Bir aracı yakacak kadar kalın, ama onu pek yavaşlatmayacak kadar incedir: Dünya'da süzülerek yavaşça inecek bir kapsül, Mars'ta yüzeyin birkaç kilometre üstünde hâlâ ses hızının üstündedir. Orada iniş yapan her sistem fazladan bir şeye ihtiyaç duydu — ev büyüklüğünde paraşütler, hava yastıkları, roketli bir gökyüzü vinci. Mürettebat taşıyacak büyüklükte bir araç için ise yalnızca roketler işe yarar.",
      '## Sayılar',
      "En yüksek ısınma, burunda santimetrekare başına watt cinsinden ölçülür. Simülasyonda Starship'in karolarının sınırı 50 W/cm² kabul edilir; model, aracın şimdiye kadar yaptığı Dünya dönüşleri 43–49 W/cm² çıkacak şekilde kalibre edildi. 2031 ve 2033 pencerelerinde varış, bu sınırı aşacak kadar hızlıdır. Aylarca ağırlıksız kalmanın zayıflattığı bir mürettebat için en yüksek yavaşlama 5 g ile sınırlandı. Toparlanma, alçalma hızının artmayı bıraktığı ve geminin düşmek yerine uçmaya başladığı andır.",
    ],
  },
  landing: {
    title: 'Karın üstü süzülüş ve dikleşme',
    lead: "Starship'in iniş yöntemi: yatay düşüş, motorların ateşlenmesi, dik konuma dönüş, alevler içinde iniş.",
    body: [
      "Yaklaşık 20 km'nin altında Starship bir serbest paraşütçü gibi karnı aşağıda düşer; dört kanatçığı, her iki yanın ne kadar hava direnci ürettiğini değiştirerek aracı yönlendirir. Hâlâ ses hızından hızlıdır. Birkaç kilometre yükseklikte, gemi henüz yataydayken üç motor ateşlenir ve itki onu birkaç saniyede dik konuma getirir — dikleşme manevrası. Bundan sonrası son ana kadar bekleyip sert frenlemektir: motorlar saniyede birkaç yüz metrelik düşüşü yaklaşık otuz saniyede, hiç pay bırakmadan sıfırlamak zorundadır.",
      "Buna süpersonik geri itki denir: motorları, araca ses hızından hızlı gelen havaya karşı ateşlemek. Falcon 9 iticileri bunu Atlantik üzerinde yapmaya başlayana dek kanıtlanmamıştı; Mars'ta ise hiç yapılmadı. Simülasyon yanmayı, göze alınabilecek en son anda başlayan bir “intihar yanması” olarak modeller, hava direncini hesaba katar ve kontrol için itkinin %30'unu yedekte tutar.",
      '## Kapsüller',
      "Orion, Dragon, Mengzhou ve Apollo'da bunu yapabilecek iniş motorları yok; bu araçlar Dünya'da paraşütle denize inmek için yapıldı. Mars'ta paraşütleri, işe yaramayacak kadar ince bir havada açılır. Yere limit hızla — saniyede birkaç yüz metre — çarparlar ve simülasyon da bunu söyler.",
    ],
  },
  verdict: {
    title: 'Yere değme ve hükmün anlamı',
    lead: 'Altı olası son ve sitenin neden ilk kırılan şeyi söylediği.',
    body: [
      "Bir görev altı biçimde biter: mürettebat sağ olarak iner; araç çakılır (yere fazla hızlı ulaşır); yanar (atmosfere girişte ısı kalkanının sınırı aşılır); Dünya yörüngesinde mahsur kalır (ayrılmaya yetecek yakıt yoktur); mürettebat yolda kaybedilir (havası, suyu ya da yiyeceği tükenir veya radyasyon dozu sınırı aşar); ya da araç yakın geçiş yapar (Mars'ta yavaşlamanın bir yolu yoktur, gemi gezegenin yanından geçip gider).",
      'Hüküm, ilk başarısız olan şeyi sayılarıyla birlikte adlandırır, çünkü işe yarayan yanıt budur: neyin değişmesi gerektiğini söyler. Yaşam desteği 21. günde biten bir kapsülün daha iyi bir ısı kalkanına ihtiyacı yoktur.',
      'Sağ salim inmek sorunun sonu değil — şehir sorusu orada başlıyor. Ama bu sitenin yanıtlamak için yola çıktığı soru bu.',
    ],
  },
  weather: {
    title: 'Toz fırtınaları',
    lead: "Mars'ta yanıtı bir aydan ötekine değiştirebilecek tek şey.",
    body: [
      "Mars'ın mevsimleri ve bir de toz fırtınası mevsimi var: gezegenin Güneş'e en yakın olduğu dönemde, güney yarımkürede ilkbahar ve yaz. Çoğu yıl bölgesel fırtınalar getirir; kabaca üç Mars yılında bir, bir fırtına büyüyerek bütün gezegeni sarar ve yüzey haftalarca görünmez olur. Yüksek irtifaya kalkan toz üst atmosferi de yoğunlaştırır — bu da atmosfere girişi değiştirir.",
      'Simülasyon, varış tarihindeki havayı tarihsel kayıtlardan çeker: Güneş boylamından mevsimi, tarihe bağlı bir fırtına zar atışını, ek yoğunluğu, yüzey rüzgârını ve yeri göremeyen bir iniş sisteminin bir kayanın üstüne konma olasılığını. Açık bir günü görmek için bu seçim Görev ayarları → Gelişmiş altından değiştirilebilir.',
    ],
  },
  unknowns: {
    title: 'Henüz kimsenin bilmedikleri',
    lead: 'Starship hükmünü belirleyen dört sayı ve onlarla nasıl oynanacağı.',
    body: [
      "Dört nicelik hiç ölçülmedi ve Starship yanıtını bunlar belirliyor: geminin kuru kütlesi (yalnızca bir aralık olarak yayımlandı), bir tankerin gerçekte teslim ettiği yakıt, yörüngedeki günlük buharlaşma kaybı ve karoların Mars'ta dayanabileceği ısı akısı. Üç hazır set bunları iki uçtan çevreler; Görev ayarları → Gelişmiş altındaki kaydırıcılarla bu değerler elle de ayarlanabilir.",
      'Sitenin tutumu basit: bir sayı bilinmiyorsa sabit değil, bir kontroldür. Bir hüküm ancak arkasındaki girdiler kadar dürüsttür; bu yüzden girdiler masada.',
    ],
  },
  models: {
    title: 'Arkasındaki fizik',
    lead: 'Gerçekte neyin hesaplandığı, tek sayfada.',
    body: [
      "- Fırlatma: dönen atmosfer çerçevesinde düzlemsel bir yükseliş, 0,1 s adımla 4. dereceden Runge–Kutta yöntemiyle çözülür; US Standard Atmosphere 1976; her motor için basınca bağlı itki ve Isp; Mach'a bağlı katsayılarla sürükleme; yerçekimi dönüşü ve kapalı döngü bir yörüngeye yerleştirme yasası; yunuslama manevrası, yörüngede en çok yakıtı bırakacak şekilde aranır.",
      '- Yörünge: bileşik buharlaşma kaybı ve belli bir fırlatma sıklığıyla yürüyen bir tanker kampanyası; ayrılış dönemine göre denetlenir.',
      "- Transfer: JPL'nin yaklaşık gezegen elemanları (1800–2050 için geçerli) üzerinde Lambert problemi; Oberth etkisi, sonlu yanma payı ve ara rota düzeltmeleriyle. NASA Glenn'in 2026/2028/2031/2033 fırsatlarıyla %1 hassasiyetle doğrulandı.",
      "- Yolculuk: NASA'nın mürettebat sarf malzemesi bütçesi ve ECLSS geri kazanımı; Curiosity'nin (MSL RAD) yolculuk sırasında ölçtüğü doz hızı, 600 mSv'lik kariyer sınırına karşı.",
      "- Giriş: toz çarpanıyla Mars Climate Database yoğunluk profili; yatış kuralıyla kaldırma kuvveti; Starship'in Dünya dönüşleriyle kalibre edilmiş Sutton–Graves durma noktası ısınması; aylarca ağırlıksız kalmış mürettebatın sınırına karşı g yükü; sürüklemeyi hesaba katan, süpersonik geri itkili bir iniş yanması.",
      'Her sayı, güven etiketi taşıyan kaynaklı bir araştırma notuna dayanır. Manzara — Cape, Dünya, Mars — NASA ve Natural Earth verileriyle kuruldu ve bir roketten nasıl görünüyorsa öyle görünecek şekilde boyandı.',
    ],
  },
}
