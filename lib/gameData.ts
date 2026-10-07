// ─────────────────────────────────────────────────────────────
//  Jeopardy Game Data: Round 1 (League of Legends), Round 2 (Anime & Manga)
//  and Final Jeopardy
// ─────────────────────────────────────────────────────────────

export interface Clue {
  id: string;
  value: number;
  clue: string;
  answer: string; // What is / Who is ...
  isDailyDouble?: boolean;
  isUsed?: boolean;
}

export interface Category {
  id: string;
  name: string;
  clues: Clue[];
}

export interface Round {
  id: 'round1' | 'round2';
  name: string;
  subtitle: string;
  values: number[];
  categories: Category[];
  dailyDoubleCount: number;
}

export interface FinalJeopardyData {
  category: string;
  clue: string;
  answer: string;
}

export const ROUND1: Round = {
  id: 'round1',
  name: 'Jeopardy!',
  subtitle: 'League of Legends',
  values: [200, 400, 600, 800, 1000],
  dailyDoubleCount: 1,
  categories: [
    {
      id: 'abilities',
      name: 'Abilities & Ultimates',
      clues: [
        {
          id: 'ab-200', value: 200,
          clue: 'This champion\'s ultimate, "Absolute Zero," channels a devastating blizzard that slows and damages enemies in a large area.',
          answer: 'Who is Nunu & Willump?',
        },
        {
          id: 'ab-400', value: 400,
          clue: 'This mage\'s passive, "Arcane Mastery," resets her cooldowns when she kills an enemy with a spell.',
          answer: 'Who is Lux? (Actually Ryze — "Arcane Mastery" is Ryze\'s old passive)',
        },
        {
          id: 'ab-600', value: 600,
          clue: 'Sylas steals this ability from opponents, making it uniquely dangerous to pick certain champions against him.',
          answer: 'What is an enemy\'s ultimate ability?',
        },
        {
          id: 'ab-800', value: 800,
          clue: 'This champion\'s Q is called "Siphoning Strike" and permanently gains damage every time it kills a large unit or champion.',
          answer: 'Who is Nasus?',
        },
        {
          id: 'ab-1000', value: 1000,
          clue: 'The only champion whose ultimate, "Requiem," has a truly global range and can target enemies anywhere on the map.',
          answer: 'Who is Karthus?',
        },
      ],
    },
    {
      id: 'lore',
      name: 'Lore of Runeterra',
      clues: [
        {
          id: 'lo-200', value: 200,
          clue: 'This militaristic empire, home of Darius and Draven, values strength above all and conquers through force.',
          answer: 'What is Noxus?',
        },
        {
          id: 'lo-400', value: 400,
          clue: 'Jinx and Vi are sisters from this undercity below Piltover, made famous by the animated series Arcane.',
          answer: 'What is Zaun?',
        },
        {
          id: 'lo-600', value: 600,
          clue: 'This spiritual nation, home to Irelia, Karma, and Yasuo, prides itself on harmony and fought off Noxian invasion.',
          answer: 'What is Ionia?',
        },
        {
          id: 'lo-800', value: 800,
          clue: 'Leona and Diana both hail from this faction located on a mystical mountain that reaches the heavens.',
          answer: 'What is Targon?',
        },
        {
          id: 'lo-1000', value: 1000,
          clue: 'Bard is described as this type of entity — a cosmic guardian who collects lost souls called "meeps" to maintain universal balance.',
          answer: 'What is a Cosmic/Celestial being (or Cosmic Caretaker)?',
        },
      ],
    },
    {
      id: 'esports',
      name: 'Esports & Worlds History',
      clues: [
        {
          id: 'es-200', value: 200,
          clue: 'Faker\'s legendary Zed vs. Ryu duel at IEM Katowice 2013 is considered one of the greatest solo plays in this game\'s history.',
          answer: 'What is League of Legends?',
        },
        {
          id: 'es-400', value: 400,
          clue: 'At IEM Katowice 2014, this Fnatic mid laner snuck into the base and destroyed the Nexus on a backdoor with Kassadin, shocking Fnatic\'s opponents.',
          answer: 'Who is xPeke?',
        },
        {
          id: 'es-600', value: 600,
          clue: 'This South Korean organization won Worlds three times consecutively from 2013 to 2015, with Faker as their cornerstone.',
          answer: 'What is SK Telecom T1 (SKT T1)?',
        },
        {
          id: 'es-800', value: 800,
          clue: 'Caster Quickshot\'s emotional call of "The Jukes! THE JUKES!" came during this team\'s miraculous Worlds run in 2016.',
          answer: 'What is H2K Gaming?',
        },
        {
          id: 'es-1000', value: 1000,
          clue: 'This was the first Western team to win the League of Legends World Championship, doing so in 2011.',
          answer: 'What is Fnatic?',
        },
      ],
    },
    {
      id: 'items',
      name: 'Items & the Shop',
      clues: [
        {
          id: 'it-200', value: 200,
          clue: 'This item, removed in 2014, was known as "DFG" and allowed mages to amplify their burst damage with an active that increased magic damage taken.',
          answer: 'What is Deathfire Grasp?',
        },
        {
          id: 'it-400', value: 400,
          clue: 'This Mythic item is the premiere choice for marksmen seeking critical strike, built from Cloak of Agility and Noonquiver.',
          answer: 'What is Galeforce?',
        },
        {
          id: 'it-600', value: 600,
          clue: 'This Legendary support item, known by its abbreviation "Shurelya\'s," grants movement speed to nearby allies when activated.',
          answer: 'What is Shurelya\'s Battlesong?',
        },
        {
          id: 'it-800', value: 800,
          clue: 'The passive on this classic jungle Mythic, "Challenging Smite," marks enemies and causes them to take damage from nearby ally attacks.',
          answer: 'What is Chilling Smite / Chemtech Putrifier? (Accept: Stalker\'s Blade or Turbo Chemtank-era items)',
        },
        {
          id: 'it-1000', value: 1000,
          clue: 'This item\'s passive "Last Whisper" was so powerful it became a standalone component item and inspired the entire armor-penetration class of items.',
          answer: 'What is Last Whisper?',
        },
      ],
    },
    {
      id: 'quotes',
      name: 'Champion Quotes & Voice Lines',
      clues: [
        {
          id: 'qu-200', value: 200,
          clue: '"The cycle of life and death continues. We will live, they will die." This champion says this upon selection.',
          answer: 'Who is Kindred?',
        },
        {
          id: 'qu-400', value: 400,
          clue: '"It\'s a good day to do whatever I want." This champion\'s infamous movement voice line captures their chaotic personality.',
          answer: 'Who is Jinx?',
        },
        {
          id: 'qu-600', value: 600,
          clue: '"An eye for an eye" — this Void assassin, obsessed with hunting, says this on a kill taunt.',
          answer: 'Who is Kha\'Zix?',
        },
        {
          id: 'qu-800', value: 800,
          clue: '"The unseen blade is the deadliest." This is a famous taunt used by this ninja champion of the shadows.',
          answer: 'Who is Zed?',
        },
        {
          id: 'qu-1000', value: 1000,
          clue: '"In my talons, I hold the future. For Demacia!" — This mage-hunter champion shouts this in defiance of magic.',
          answer: 'Who is Sylas? (or Lux in some versions — Accept Sylas)',
        },
      ],
    },
  ],
};

export const ROUND2: Round = {
  id: 'round2',
  name: 'Double Jeopardy!',
  subtitle: 'Anime & Manga',
  values: [400, 800, 1200, 1600, 2000],
  dailyDoubleCount: 2,
  categories: [
    {
      id: 'power',
      name: 'Shonen Power Systems',
      clues: [
        {
          id: 'pw-400', value: 400,
          clue: 'In Hunter x Hunter, this power system requires users to learn Nen categories like Enhancer, Emitter, Manipulator, or Conjurer.',
          answer: 'What is Nen?',
        },
        {
          id: 'pw-800', value: 800,
          clue: 'In JoJo\'s Bizarre Adventure, these psychic manifestations of fighting spirit manifest as unique beings with their own powers and names.',
          answer: 'What are Stands?',
        },
        {
          id: 'pw-1200', value: 1200,
          clue: 'In Jujutsu Kaisen, Yuji Itadori\'s primary power derives from this cursed energy technique that emulates death and reincarnation.',
          answer: 'What is Divergent Fist / Black Flash (accept Cursed Energy techniques)?',
        },
        {
          id: 'pw-1600', value: 1600,
          clue: 'In Naruto, this Six Paths technique allows the user to control gravity, repelling and attracting matter at will.',
          answer: 'What is the Rinnegan\'s Deva Path (Shinra Tensei / Banshō Ten\'in)?',
        },
        {
          id: 'pw-2000', value: 2000,
          clue: 'In Bleach, achieving this final evolved form of a Shinigami\'s Zanpakutō requires knowing its true name and shattering it against the ground.',
          answer: 'What is Bankai?',
        },
      ],
    },
    {
      id: 'openings',
      name: 'Iconic Openings & Soundtracks',
      clues: [
        {
          id: 'op-400', value: 400,
          clue: 'This composer, known for "Vogel im Käfig" and "Counterattack-Mankind," created the legendary soundtrack of Attack on Titan.',
          answer: 'Who is Hiroyuki Sawano?',
        },
        {
          id: 'op-800', value: 800,
          clue: 'LiSA performed both "Gurenge" and "Homura" as opening/ending themes for this Demon Slayer property.',
          answer: 'What is Kimetsu no Yaiba (Demon Slayer)?',
        },
        {
          id: 'op-1200', value: 1200,
          clue: '"Unravel" by TK from Ling Tosite Sigure serves as the haunting opening theme to this 2014 psychological crime anime.',
          answer: 'What is Tokyo Ghoul?',
        },
        {
          id: 'op-1600', value: 1600,
          clue: 'Yoko Kanno composed the iconic jazz-infused soundtrack for this 1998 space western anime, including the track "Tank!"',
          answer: 'What is Cowboy Bebop?',
        },
        {
          id: 'op-2000', value: 2000,
          clue: 'This one-hit rock band\'s single "Again" was used as the first opening theme for Fullmetal Alchemist: Brotherhood.',
          answer: 'Who is YUI?',
        },
      ],
    },
    {
      id: 'villains',
      name: 'Villains & Antagonists',
      clues: [
        {
          id: 'vi-400', value: 400,
          clue: 'This Monster villain manipulates people to commit suicide using only the power of his presence, words, and the belief that he is the perfect evil.',
          answer: 'Who is Johan Liebert?',
        },
        {
          id: 'vi-800', value: 800,
          clue: 'This Chimera Ant king from HxH evolved beyond his hunger instincts after playing gungi with Komugi, choosing empathy over conquest.',
          answer: 'Who is Meruem?',
        },
        {
          id: 'vi-1200', value: 1200,
          clue: 'Sosuke Aizen\'s true motive in Bleach was this: to reach and surpass the realm of the beings who stand above Soul Society.',
          answer: 'What is reaching the Soul King / ascending beyond the Soul King\'s realm?',
        },
        {
          id: 'vi-1600', value: 1600,
          clue: 'This Death Note antagonist, working as L\'s successor, finally corners Light Yagami by the end of the series using the same deductive methods as L.',
          answer: 'Who is Near (Nate River)?',
        },
        {
          id: 'vi-2000', value: 2000,
          clue: 'Griffith\'s infamous sacrifice of the Band of the Hawk in this manga took place at a location called the Eclipse.',
          answer: 'What is Berserk?',
        },
      ],
    },
    {
      id: 'studios',
      name: 'Studio Signatures',
      clues: [
        {
          id: 'st-400', value: 400,
          clue: 'This studio, known for their fluid sakura petal animation style, produced Demon Slayer, Fate/Zero, and Fate/stay night: UBW.',
          answer: 'What is ufotable?',
        },
        {
          id: 'st-800', value: 800,
          clue: 'MAPPA produced the final season of Attack on Titan and also this graphic survival game anime set in a deadly arena.',
          answer: 'What is Chainsaw Man (also accept Jujutsu Kaisen Season 2)?',
        },
        {
          id: 'st-1200', value: 1200,
          clue: 'This studio, known for over-the-top action and "Trigger style," created Kill la Kill and Gurren Lagann\'s spiritual successor: Darling in the FranXX (co-produced).',
          answer: 'What is Studio Trigger?',
        },
        {
          id: 'st-1600', value: 1600,
          clue: 'Kyoto Animation\'s meticulous detail and emotional depth is on full display in this 2016 film about a deaf girl and a boy who bullied her.',
          answer: 'What is A Silent Voice (Koe no Katachi)?',
        },
        {
          id: 'st-2000', value: 2000,
          clue: 'Bones Studio is behind this superhero anime franchise whose author, Kōhei Horikoshi, spent years designing a world where 80% of the population has quirks.',
          answer: 'What is My Hero Academia (Boku no Hero Academia)?',
        },
      ],
    },
    {
      id: 'twists',
      name: 'Plot Twists & Iconic Episodes',
      clues: [
        {
          id: 'tw-400', value: 400,
          clue: 'In Fullmetal Alchemist: Brotherhood, episode 10\'s "Philosopher\'s Stone" reveals the true horrifying ingredient in the Stone\'s creation.',
          answer: 'What is human lives/souls?',
        },
        {
          id: 'tw-800', value: 800,
          clue: 'Attack on Titan\'s chapter 1 hides the secret that Eren\'s basement holds the truth about the entire world — specifically this revelation.',
          answer: 'What is that Titans are Eldians/people from outside the walls and the world is NOT destroyed beyond the island?',
        },
        {
          id: 'tw-1200', value: 1200,
          clue: 'In Puella Magi Madoka Magica, episode 3 shockingly kills off this main character, the pink-haired girl\'s best friend.',
          answer: 'Who is Mami Tomoe?',
        },
        {
          id: 'tw-1600', value: 1600,
          clue: 'Code Geass\'s "Zero Requiem" plan concludes with Lelouch engineering his own public assassination by this person.',
          answer: 'Who is Suzaku Kururugi?',
        },
        {
          id: 'tw-2000', value: 2000,
          clue: 'In Neon Genesis Evangelion, this episode — titled "The Beginning and the End, or \'Knockin\' on Heaven\'s Door\'" — is episode 24 and centers on Kaworu Nagisa\'s fate.',
          answer: 'What is Episode 24 — "The Beginning and the End, or \'Knockin\' on Heaven\'s Door\'"?',
        },
      ],
    },
  ],
};

export const FINAL_JEOPARDY: FinalJeopardyData = {
  category: 'Crossover Worlds & Mythic Voice Actors',
  clue: 'This legendary voice actor voiced both Singed in League of Legends AND the diabolical Orochimaru in Naruto\'s English dub, lending his iconic raspy tone to two of gaming and anime\'s most infamous mad scientists.',
  answer: 'Who is Steve Blum?',
};

// Assign daily doubles randomly at runtime
export function assignDailyDoubles(rounds: Round[]): Round[] {
  return rounds.map((round) => {
    const categories = round.categories.map((cat) => ({
      ...cat,
      clues: cat.clues.map((clue) => ({ ...clue, isDailyDouble: false })),
    }));

    const allClueIds: string[] = [];
    categories.forEach((cat) =>
      cat.clues.forEach((clue) => allClueIds.push(`${cat.id}:${clue.id}`))
    );

    // Shuffle and pick
    const shuffled = [...allClueIds].sort(() => Math.random() - 0.5);
    const picks = shuffled.slice(0, round.dailyDoubleCount);

    picks.forEach((pick) => {
      const [catId, clueId] = pick.split(':');
      const cat = categories.find((c) => c.id === catId);
      if (cat) {
        const clue = cat.clues.find((cl) => cl.id === clueId);
        if (clue) clue.isDailyDouble = true;
      }
    });

    return { ...round, categories };
  });
}
