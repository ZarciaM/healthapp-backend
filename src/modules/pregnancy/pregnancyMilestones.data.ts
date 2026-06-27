/**
 * Sources médicales utilisées (vérifiables) :
 *
 * 1. Mayo Clinic. "Fetal development: The first trimester." March 2025.
 *    https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/prenatal-care/art-20045302
 *
 * 2. Mayo Clinic. "Fetal development: The 2nd trimester." March 2025.
 *    https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/fetal-development/art-20046151
 *
 * 3. Mayo Clinic. "Fetal development: The 3rd trimester." March 2025.
 *    https://www.mayoclinic.org/healthy-lifestyle/pregnancy-week-by-week/in-depth/fetal-development/art-20045997
 *
 * 4. ACOG (American College of Obstetricians and Gynecologists).
 *    "Changes During Pregnancy" — infographic couvrant mois 2 à 10.
 *    https://www.acog.org/womens-health/infographics/changes-during-pregnancy
 *
 * 5. Cleveland Clinic. "Fetal Development: Week-by-Week Stages of Pregnancy."
 *    https://my.clevelandclinic.org/health/articles/7247-fetal-development-stages-of-growth
 *
 * 6. NHS. "Week-by-week guide to pregnancy."
 *    https://www.nhs.uk/best-start-in-life/pregnancy/week-by-week-guide-to-pregnancy/
 *
 * Notes :
 * - Semaines 1-2 : période pré-conception (pas de développement embryonnaire).
 * - Les âges gestationnels suivent la convention obstétricale (comptage
 *   depuis le premier jour des dernières règles).
 * - Les descriptions sont paraphrasées, jamais copiées mot pour mot.
 * - Les informations non confirmées par au moins une source fiable ne sont
 *   pas incluses. Certaines semaines sont regroupées en tranches lorsque
 *   les sources ne fournissent pas de distinction fiable semaine par semaine.
 */

export type MilestoneEntry = {
  weekNumber: number;
  weekRange: string;
  title: string;
  description: string;
  trimester: 1 | 2 | 3;
};

export const pregnancyMilestones: MilestoneEntry[] = [
  {
    weekNumber: 1,
    weekRange: "1-2",
    title: "Préparation du cycle",
    description:
      "L'utérus prépare sa muqueuse pour une éventuelle nidation. Les ovaires commencent à maturer un follicule sous l'effet de l'hormone FSH. La grossesse n'a pas encore commencé ; le comptage obstétrical inclut ces semaines par convention.",
    trimester: 1,
  },
  {
    weekNumber: 2,
    weekRange: "1-2",
    title: "Préparation du cycle",
    description:
      "L'utérus prépare sa muqueuse pour une éventuelle nidation. Les ovaires commencent à maturer un follicule sous l'effet de l'hormone FSH. La grossesse n'a pas encore commencé ; le comptage obstétrical inclut ces semaines par convention.",
    trimester: 1,
  },
  {
    weekNumber: 3,
    weekRange: "3",
    title: "Fécondation",
    description:
      "Le spermatozoïde et l'ovule s'unissent dans une trompe de Fallope pour former un zygote, cellule unique contenant 46 chromosomes. Le zygote se divise en se déplaçant vers l'utérus, devenant d'abord une morula puis un blastocyste.",
    trimester: 1,
  },
  {
    weekNumber: 4,
    weekRange: "4",
    title: "Implantation",
    description:
      "Le blastocyste s'implante dans la paroi utérine. Les cellules internes formeront l'embryon ; la couche externe donnera naissance au placenta, qui nourrira le fœtus tout au long de la grossesse.",
    trimester: 1,
  },
  {
    weekNumber: 5,
    weekRange: "5",
    title: "Formation des couches embryonnaires",
    description:
      "Le taux d'HCG augmente rapidement, signalant aux ovaires de cesser l'ovulation. L'embryon se structure en trois couches : l'ectoderme (système nerveux, peau), le mésoderme (cœur, os, reins) et l'endoderme (poumons, intestins).",
    trimester: 1,
  },
  {
    weekNumber: 6,
    weekRange: "6",
    title: "Fermeture du tube neural",
    description:
      "Le tube neural se ferme le long du dos de l'embryon ; il donnera naissance au cerveau et à la moelle épinière. Le cœur commence à se former et des bourgeons de membres supérieurs apparaissent. L'embryon prend une forme courbée en C.",
    trimester: 1,
  },
  {
    weekNumber: 7,
    weekRange: "7",
    title: "Développement du visage",
    description:
      "Le cerveau et le visage se développent rapidement. Les dépressions qui deviendront les narines deviennent visibles, la rétine commence à se former. Les bourgeons des membres inférieurs apparaissent et les bras prennent une forme de pagaie.",
    trimester: 1,
  },
  {
    weekNumber: 8,
    weekRange: "8",
    title: "Formation du nez et des doigts",
    description:
      "Les bourgeons des jambes prennent une forme de pagaie et les doigts commencent à se former. La lèvre supérieure et le nez sont visibles. Le tronc et le cou commencent à se redresser. L'embryon mesure environ 11 à 14 mm.",
    trimester: 1,
  },
  {
    weekNumber: 9,
    weekRange: "9",
    title: "Apparition des orteils",
    description:
      "Les bras s'allongent et les coudes deviennent visibles. Les orteils apparaissent et les paupières se forment. La tête est encore grande par rapport au corps et le menton n'est pas encore bien formé.",
    trimester: 1,
  },
  {
    weekNumber: 10,
    weekRange: "10",
    title: "Membres distincts",
    description:
      "La tête devient plus ronde et les coudes peuvent se plier. Les orteils et les doigts perdent leur palmure et s'allongent. Les paupières et les oreilles externes continuent leur développement.",
    trimester: 1,
  },
  {
    weekNumber: 11,
    weekRange: "11",
    title: "Transition vers le stade fœtal",
    description:
      "L'embryon est désormais appelé fœtus. Le visage est large, les yeux sont écartés et les oreilles sont placées bas sur la tête. Les bourgeons dentaires apparaissent et les globules rouges commencent à se former dans le foie. Les organes génitaux externes commencent à se développer.",
    trimester: 1,
  },
  {
    weekNumber: 12,
    weekRange: "12",
    title: "Apparition des ongles",
    description:
      "Les ongles des doigts commencent à pousser. Le profil du visage est plus développé. Les intestins sont désormais dans l'abdomen. Le fœtus mesure environ 61 mm et pèse environ 14 g.",
    trimester: 1,
  },
  {
    weekNumber: 13,
    weekRange: "13",
    title: "Début de l'ossification",
    description:
      "Les os du squelette commencent à durcir, en particulier ceux du crâne et des membres. La peau est encore fine et transparente, mais elle va commencer à s'épaissir.",
    trimester: 1,
  },
  {
    weekNumber: 14,
    weekRange: "14",
    title: "Formation des globules rouges",
    description:
      "Le cou du fœtus devient mieux défini. Les globules rouges commencent à se former dans la rate. Le sexe du bébé devient généralement plus visible à l'échographie.",
    trimester: 2,
  },
  {
    weekNumber: 15,
    weekRange: "15",
    title: "Poursuite de l'ossification",
    description:
      "Le fœtus grandit rapidement et l'ossification se poursuit. Les os deviennent visibles à l'échographie. Le motif capillaire du cuir chevelu commence à se former.",
    trimester: 2,
  },
  {
    weekNumber: 16,
    weekRange: "16",
    title: "Mouvements oculaires",
    description:
      "La tête du fœtus est redressée. Les yeux peuvent bouger lentement et les oreilles sont presque en position finale. Les mouvements des membres deviennent coordonnés et visibles à l'échographie, mais restent trop légers pour être ressentis par la mère.",
    trimester: 2,
  },
  {
    weekNumber: 17,
    weekRange: "17",
    title: "Apparition des ongles d'orteils",
    description:
      "Les ongles des orteils commencent à se développer. Le fœtus devient plus actif : il roule et fait des mouvements de bascule. La mère peut ressentir de petits mouvements saccadés causés par le hoquet du fœtus.",
    trimester: 2,
  },
  {
    weekNumber: 18,
    weekRange: "18",
    title: "Développement de l'ouïe",
    description:
      "Les oreilles commencent à se détacher de la tête et le fœtus peut commencer à entendre des sons. Le système digestif commence à fonctionner.",
    trimester: 2,
  },
  {
    weekNumber: 19,
    weekRange: "19",
    title: "Formation du vernix",
    description:
      "Une substance grasse et crémeuse appelée vernix caseosa commence à recouvrir la peau du fœtus pour la protéger du liquide amniotique. Le fœtus commence à uriner, ce qui constitue désormais la majeure partie du liquide amniotique.",
    trimester: 2,
  },
  {
    weekNumber: 20,
    weekRange: "20",
    title: "Premiers mouvements perçus",
    description:
      "La mère peut commencer à sentir les mouvements du fœtus (quickening). Le fœtus alterne sommeil et éveil et peut être réveillé par des bruits ou les mouvements de la mère.",
    trimester: 2,
  },
  {
    weekNumber: 21,
    weekRange: "21",
    title: "Réflexe de succion",
    description:
      "Le fœtus est entièrement recouvert d'un fin duvet appelé lanugo, qui maintient le vernix sur la peau. Le réflexe de succion se développe et le fœtus peut sucer son pouce.",
    trimester: 2,
  },
  {
    weekNumber: 22,
    weekRange: "22",
    title: "Cheveux et sourcils visibles",
    description:
      "Les sourcils et les cheveux deviennent visibles. Chez les garçons, les testicules commencent à descendre vers le scrotum. Chez les filles, l'utérus et les ovaires sont en place et le vagin est développé.",
    trimester: 2,
  },
  {
    weekNumber: 23,
    weekRange: "23",
    title: "Empreintes digitales",
    description:
      "Le fœtus commence à avoir des mouvements oculaires rapides. Des crêtes se forment sur les paumes et les plantes des pieds, créant les futures empreintes digitales. Les poumons commencent à produire du surfactant, essentiel pour la respiration après la naissance.",
    trimester: 2,
  },
  {
    weekNumber: 24,
    weekRange: "24",
    title: "Peau plissée et fine",
    description:
      "La peau du fœtus est plissée et translucide, avec une teinte rosée due aux vaisseaux sanguins visibles. Les poumons continuent leur maturation. En cas de naissance prématurée, certains fœtus de cet âge peuvent survivre avec une prise en charge médicale intensive.",
    trimester: 2,
  },
  {
    weekNumber: 25,
    weekRange: "25",
    title: "Réaction à la voix",
    description:
      "Le fœtus peut bouger en réponse à des sons familiers, comme la voix de la mère. La plupart du temps de sommeil est passé en phase de mouvements oculaires rapides.",
    trimester: 2,
  },
  {
    weekNumber: 26,
    weekRange: "26",
    title: "Paupières et cils formés",
    description:
      "Les sourcils et les cils sont désormais formés. Les yeux sont développés mais restent fermés encore quelques semaines.",
    trimester: 2,
  },
  {
    weekNumber: 27,
    weekRange: "27",
    title: "Maturation nerveuse",
    description:
      "Le système nerveux continue de mûrir. Le fœtus commence à accumuler de la graisse sous-cutanée, ce qui rend sa peau plus lisse. Cette prise de graisse se poursuivra au troisième trimestre.",
    trimester: 2,
  },
  {
    weekNumber: 28,
    weekRange: "28",
    title: "Ouverture partielle des yeux",
    description:
      "Les paupières du fœtus peuvent s'ouvrir partiellement. Le système nerveux central peut réguler la température corporelle et déclencher des mouvements respiratoires visibles à l'échographie.",
    trimester: 3,
  },
  {
    weekNumber: 29,
    weekRange: "29",
    title: "Mouvements actifs",
    description:
      "Le fœtus peut donner des coups de pied, s'étirer et faire des mouvements de préhension. Ces mouvements deviennent plus forts et plus faciles à ressentir pour la mère.",
    trimester: 3,
  },
  {
    weekNumber: 30,
    weekRange: "30",
    title: "Croissance des cheveux",
    description:
      "Les yeux du fœtus peuvent s'ouvrir largement. Une chevelure peut être présente. Les globules rouges commencent à se former dans la moelle osseuse.",
    trimester: 3,
  },
  {
    weekNumber: 31,
    weekRange: "31",
    title: "Prise de poids rapide",
    description:
      "La majeure partie du développement majeur est achevée. Le fœtus entre dans une phase de prise de poids rapide qui se poursuivra jusqu'à la naissance.",
    trimester: 3,
  },
  {
    weekNumber: 32,
    weekRange: "32",
    title: "Disparition du lanugo",
    description:
      "Les ongles des orteils sont visibles. Le fin duvet (lanugo) qui recouvrait la peau du fœtus commence à tomber. Le fœtus mesure environ 280 mm et pèse environ 1 700 g.",
    trimester: 3,
  },
  {
    weekNumber: 33,
    weekRange: "33",
    title: "Réaction à la lumière",
    description:
      "Les pupilles du fœtus peuvent changer de taille en réponse à la lumière. Les os continuent de durcir, mais le crâne reste souple et flexible pour faciliter l'accouchement.",
    trimester: 3,
  },
  {
    weekNumber: 34,
    weekRange: "34",
    title: "Ongles des doigts",
    description:
      "Les ongles des doigts atteignent l'extrémité des doigts. Le fœtus continue de prendre du poids et de la graisse sous-cutanée.",
    trimester: 3,
  },
  {
    weekNumber: 35,
    weekRange: "35",
    title: "Espace réduit",
    description:
      "Le fœtus remplit la majeure partie de l'espace dans le sac amniotique et a moins de place pour bouger. La mère ressent surtout des étirements, des roulades et des remuements plutôt que des coups francs.",
    trimester: 3,
  },
  {
    weekNumber: 36,
    weekRange: "36",
    title: "Positionnement tête en bas",
    description:
      "La peau devient plus lisse à mesure que la graisse sous-cutanée s'accumule. Les membres commencent à paraître potelés. La plupart des fœtus se retournent en position tête en bas à ce stade.",
    trimester: 3,
  },
  {
    weekNumber: 37,
    weekRange: "37",
    title: "Début du terme",
    description:
      "La tête du fœtus peut commencer à descendre dans le bassin en préparation à l'accouchement. Le fœtus peut attraper des objets fermement. Il est considéré comme pré-terme précoce (early term).",
    trimester: 3,
  },
  {
    weekNumber: 38,
    weekRange: "38",
    title: "Ongles des orteils",
    description:
      "Les ongles des orteils atteignent l'extrémité des orteils. La circonférence de la tête et du ventre sont similaires. La plupart du lanugo a disparu.",
    trimester: 3,
  },
  {
    weekNumber: 39,
    weekRange: "39",
    title: "Terme complet",
    description:
      "Le fœtus est considéré à terme complet (full term). La poitrine s'élargit et de la graisse s'ajoute sur tout le corps pour maintenir la température après la naissance.",
    trimester: 3,
  },
  {
    weekNumber: 40,
    weekRange: "40",
    title: "Date prévue d'accouchement",
    description:
      "Le fœtus mesure environ 360 mm (couronne-sacrum) et pèse environ 3 400 g en moyenne. La date prévue est une estimation à 40 semaines ; de nombreux accouchements surviennent avant ou après cette date.",
    trimester: 3,
  },
];
