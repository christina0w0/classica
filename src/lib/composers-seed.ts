import { Composer, ComposerRelationship } from "@/types";

export const composers: Composer[] = [
  // ── Renaissance (1400–1600) ──
  {
    id: "josquin",
    name: "Josquin des Prez",
    pronunciation: "zhoss-KAHN day PRAY",
    era: "renaissance",
    birthYear: 1450,
    deathYear: 1521,
    bio: "Franco-Flemish composer widely regarded as the greatest of the Renaissance. His mastery of polyphony influenced generations of composers across Europe.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Josquin_des_Prez.jpg/220px-Josquin_des_Prez.jpg",
  },
  {
    id: "palestrina",
    name: "Giovanni Pierluigi da Palestrina",
    pronunciation: "joh-VAHN-nee pyair-loo-EE-jee dah pah-leh-STREE-nah",
    era: "renaissance",
    birthYear: 1525,
    deathYear: 1594,
    bio: "Italian composer of sacred music, the leading figure of the Roman School. His Pope Marcellus Mass saved polyphony from being banned by the Council of Trent.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Palestrina.jpg/220px-Palestrina.jpg",
  },
  {
    id: "byrd",
    name: "William Byrd",
    pronunciation: "WILL-yum BURD",
    era: "renaissance",
    birthYear: 1543,
    deathYear: 1623,
    bio: "English composer of the Elizabethan era, master of sacred and secular music. His keyboard works and choral pieces rank among the finest of the Renaissance.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/William_Byrd.jpg/220px-William_Byrd.jpg",
  },
  {
    id: "monteverdi",
    name: "Claudio Monteverdi",
    pronunciation: "KLOW-dee-oh mon-teh-VAIR-dee",
    era: "renaissance",
    birthYear: 1567,
    deathYear: 1643,
    bio: "Italian composer who bridged the Renaissance and Baroque periods. His opera L'Orfeo (1607) is one of the earliest operas still widely performed.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Bernardo_Strozzi_-_Claudio_Monteverdi_%28c.1630%29.jpg/220px-Bernardo_Strozzi_-_Claudio_Monteverdi_%28c.1630%29.jpg",
  },
  // ── Baroque (1600–1750) ──
  {
    id: "lully",
    name: "Jean-Baptiste Lully",
    pronunciation: "ZHAHN bah-TEEST loo-LEE",
    era: "baroque",
    birthYear: 1632,
    deathYear: 1687,
    bio: "Italian-born French composer who dominated French opera and ballet under Louis XIV, creating the tragédie en musique genre.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Jean-Baptiste_Lully_by_Paul_Mignard.jpg/220px-Jean-Baptiste_Lully_by_Paul_Mignard.jpg",
  },
  {
    id: "corelli",
    name: "Arcangelo Corelli",
    pronunciation: "ar-KAHN-jeh-loh koh-REL-lee",
    era: "baroque",
    birthYear: 1653,
    deathYear: 1713,
    bio: "Italian violinist and composer whose concerti grossi and trio sonatas established models that influenced the entire Baroque era.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Arcangelo_Corelli.jpg/220px-Arcangelo_Corelli.jpg",
  },
  {
    id: "pachelbel",
    name: "Johann Pachelbel",
    pronunciation: "YO-hahn PAHK-ul-bell",
    era: "baroque",
    birthYear: 1653,
    deathYear: 1706,
    bio: "German composer and organist best known for his Canon in D. A key figure in the development of the south German organ tradition.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Johann_Pachelbel.jpg/220px-Johann_Pachelbel.jpg",
  },
  {
    id: "purcell",
    name: "Henry Purcell",
    pronunciation: "HEN-ree PUR-sell",
    era: "baroque",
    birthYear: 1659,
    deathYear: 1695,
    bio: "England's greatest Baroque composer, known for the opera Dido and Aeneas and his mastery of English vocal and theatrical music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Henry_Purcell_by_John_Closterman.jpg/220px-Henry_Purcell_by_John_Closterman.jpg",
  },
  {
    id: "vivaldi",
    name: "Antonio Vivaldi",
    pronunciation: "ahn-TOH-nee-oh vih-VAHL-dee",
    era: "baroque",
    birthYear: 1678,
    deathYear: 1741,
    bio: "Italian virtuoso violinist and composer. His set of concertos The Four Seasons is among the most popular works in classical music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Vivaldi.jpg/220px-Vivaldi.jpg",
  },
  {
    id: "telemann",
    name: "Georg Philipp Telemann",
    pronunciation: "GAY-org FIL-ip TAY-leh-mahn",
    era: "baroque",
    birthYear: 1681,
    deathYear: 1767,
    bio: "The most prolific composer in history, with over 3,000 works. A central figure in German Baroque music alongside Bach and Handel.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Georg_Philipp_Telemann_by_Ludwig_Michael_Schneider.png/220px-Georg_Philipp_Telemann_by_Ludwig_Michael_Schneider.png",
  },
  {
    id: "rameau",
    name: "Jean-Philippe Rameau",
    pronunciation: "ZHAHN fee-LEEP rah-MOH",
    era: "baroque",
    birthYear: 1683,
    deathYear: 1764,
    bio: "French composer and music theorist whose Treatise on Harmony revolutionized music theory. Also a master of French Baroque opera.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Attribu%C3%A9_%C3%A0_Joseph_Aved%2C_Portrait_de_Jean-Philippe_Rameau_%28vers_1728%29_-_001.jpg/220px-Attribu%C3%A9_%C3%A0_Joseph_Aved%2C_Portrait_de_Jean-Philippe_Rameau_%28vers_1728%29_-_001.jpg",
  },
  {
    id: "bach",
    name: "Johann Sebastian Bach",
    pronunciation: "YO-hahn zeh-BASS-tee-ahn BAHKH",
    era: "baroque",
    birthYear: 1685,
    deathYear: 1750,
    bio: "German composer and musician of the late Baroque period. Widely regarded as one of the greatest composers of all time, known for the Brandenburg Concertos, The Well-Tempered Clavier, and the Mass in B minor.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Johann_Sebastian_Bach.jpg/220px-Johann_Sebastian_Bach.jpg",
  },
  {
    id: "handel",
    name: "George Frideric Handel",
    pronunciation: "JORJ FRID-er-ik HAN-dul",
    era: "baroque",
    birthYear: 1685,
    deathYear: 1759,
    bio: "German-British Baroque composer famous for operas, oratorios, and concertos. His Messiah remains one of the most performed choral works.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/George_Frideric_Handel_by_Balthasar_Denner.jpg/220px-George_Frideric_Handel_by_Balthasar_Denner.jpg",
  },
  {
    id: "scarlatti",
    name: "Domenico Scarlatti",
    pronunciation: "doh-MEN-ee-koh skar-LAH-tee",
    era: "baroque",
    birthYear: 1685,
    deathYear: 1757,
    bio: "Italian composer who spent much of his life in Spain. Best known for his 555 keyboard sonatas that expanded the technical vocabulary of the harpsichord.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Domingo_Antonio_Velasco_%28attributed%29_-_Portrait_of_Domenico_Scarlatti.jpg/220px-Domingo_Antonio_Velasco_%28attributed%29_-_Portrait_of_Domenico_Scarlatti.jpg",
  },
  // ── Classical (1750–1820) ──
  {
    id: "gluck",
    name: "Christoph Willibald Gluck",
    pronunciation: "KRIS-tof VIL-ee-bahlt GLOOK",
    era: "classical",
    birthYear: 1714,
    deathYear: 1787,
    bio: "Bohemian-Austrian composer who reformed opera by stripping away Baroque excess in favor of dramatic truth and simplicity.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Christoph_Willibald_Gluck_painted_by_Joseph_Duplessis.jpg/220px-Christoph_Willibald_Gluck_painted_by_Joseph_Duplessis.jpg",
  },
  {
    id: "cpe-bach",
    name: "Carl Philipp Emanuel Bach",
    pronunciation: "KARL FIL-ip eh-MAHN-oo-el BAHKH",
    era: "classical",
    birthYear: 1714,
    deathYear: 1788,
    bio: "Son of J.S. Bach, he was the most influential composer of the Empfindsamer Stil and a bridge between Baroque and Classical styles.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Carl_Philipp_Emanuel_Bach.jpg/220px-Carl_Philipp_Emanuel_Bach.jpg",
  },
  {
    id: "haydn",
    name: "Joseph Haydn",
    pronunciation: "YO-zef HY-dn",
    era: "classical",
    birthYear: 1732,
    deathYear: 1809,
    bio: "Austrian composer known as the 'Father of the Symphony' and 'Father of the String Quartet.' Composed 104 symphonies and helped establish Classical musical forms.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Joseph_Haydn%2C_Target_crop.jpg/220px-Joseph_Haydn%2C_Target_crop.jpg",
  },
  {
    id: "boccherini",
    name: "Luigi Boccherini",
    pronunciation: "loo-EE-jee bok-keh-REE-nee",
    era: "classical",
    birthYear: 1743,
    deathYear: 1805,
    bio: "Italian composer and cellist active in Spain. Known for his elegant chamber music, especially the famous Minuet from String Quintet in E major.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Pompeo_Batoni_-_Luigi_Boccherini.jpg/220px-Pompeo_Batoni_-_Luigi_Boccherini.jpg",
  },
  {
    id: "mozart",
    name: "Wolfgang Amadeus Mozart",
    pronunciation: "VOLF-gang ah-mah-DAY-oos MOH-tsart",
    era: "classical",
    birthYear: 1756,
    deathYear: 1791,
    bio: "Austrian prodigy who composed over 600 works across every genre of his era. His operas, symphonies, and concertos represent the pinnacle of Classical style.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Wolfgang-amadeus-mozart_1.jpg/220px-Wolfgang-amadeus-mozart_1.jpg",
  },
  {
    id: "beethoven",
    name: "Ludwig van Beethoven",
    pronunciation: "LOOD-vig vahn BAY-toh-ven",
    era: "classical",
    birthYear: 1770,
    deathYear: 1827,
    bio: "German composer who bridged the Classical and Romantic eras. His nine symphonies, piano sonatas, and string quartets transformed Western music forever.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Beethoven.jpg/220px-Beethoven.jpg",
  },
  {
    id: "hummel",
    name: "Johann Nepomuk Hummel",
    pronunciation: "YO-hahn NEH-poh-mook HOO-mul",
    era: "classical",
    birthYear: 1778,
    deathYear: 1837,
    bio: "Austrian composer and piano virtuoso, a student of Mozart. His brilliant piano concertos and chamber works bridged Classical and early Romantic styles.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Johann_Nepomuk_Hummel.jpg/220px-Johann_Nepomuk_Hummel.jpg",
  },
  // ── Romantic (1820–1910) ──
  {
    id: "paganini",
    name: "Niccolò Paganini",
    pronunciation: "nee-koh-LOH pah-gah-NEE-nee",
    era: "romantic",
    birthYear: 1782,
    deathYear: 1840,
    bio: "Italian violinist and composer whose legendary virtuosity redefined the possibilities of the violin. His 24 Caprices remain a benchmark for violinists.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Niccol%C3%B2_Paganini_by_Daniel_Maclise.jpg/220px-Niccol%C3%B2_Paganini_by_Daniel_Maclise.jpg",
  },
  {
    id: "weber",
    name: "Carl Maria von Weber",
    pronunciation: "KARL mah-REE-ah fon VAY-ber",
    era: "romantic",
    birthYear: 1786,
    deathYear: 1826,
    bio: "German composer who founded German Romantic opera with Der Freischütz, paving the way for Wagner.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Carl_Maria_von_Weber.jpg/220px-Carl_Maria_von_Weber.jpg",
  },
  {
    id: "rossini",
    name: "Gioachino Rossini",
    pronunciation: "joh-ah-KEE-noh ross-SEE-nee",
    era: "romantic",
    birthYear: 1792,
    deathYear: 1868,
    bio: "Italian opera composer renowned for The Barber of Seville and William Tell. His sparkling overtures are concert staples worldwide.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Rossini-portrait-by-Grevedon.jpg/220px-Rossini-portrait-by-Grevedon.jpg",
  },
  {
    id: "schubert",
    name: "Franz Schubert",
    pronunciation: "FRAHNTS SHOO-bert",
    era: "romantic",
    birthYear: 1797,
    deathYear: 1828,
    bio: "Austrian composer who wrote over 600 lieder (art songs) alongside symphonies, chamber music, and piano works of profound lyrical beauty.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Franz_Schubert_by_Wilhelm_August_Rieder_1875_larger_crop.png/220px-Franz_Schubert_by_Wilhelm_August_Rieder_1875_larger_crop.png",
  },
  {
    id: "berlioz",
    name: "Hector Berlioz",
    pronunciation: "ek-TOR bair-lee-OHZ",
    era: "romantic",
    birthYear: 1803,
    deathYear: 1869,
    bio: "French Romantic composer and orchestration pioneer. His Symphonie fantastique broke new ground in programmatic and orchestral music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Hector_Berlioz_2.jpg/220px-Hector_Berlioz_2.jpg",
  },
  {
    id: "mendelssohn",
    name: "Felix Mendelssohn",
    pronunciation: "FAY-liks MEN-dul-sohn",
    era: "romantic",
    birthYear: 1809,
    deathYear: 1847,
    bio: "German composer, pianist, and conductor. Revived interest in Bach's music and composed beloved works including the Violin Concerto and A Midsummer Night's Dream.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Felix_Mendelssohn_Bartholdy.jpg/220px-Felix_Mendelssohn_Bartholdy.jpg",
  },
  {
    id: "chopin",
    name: "Frédéric Chopin",
    pronunciation: "fray-day-REEK SHOW-pan",
    era: "romantic",
    birthYear: 1810,
    deathYear: 1849,
    bio: "Polish composer and virtuoso pianist known for his poetic and technically demanding piano works: nocturnes, études, ballades, and mazurkas.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Frederic_Chopin_photo.jpeg/220px-Frederic_Chopin_photo.jpeg",
  },
  {
    id: "schumann",
    name: "Robert Schumann",
    pronunciation: "ROH-bert SHOO-mahn",
    era: "romantic",
    birthYear: 1810,
    deathYear: 1856,
    bio: "German composer and influential music critic. His piano works, lieder, symphonies, and chamber music are pillars of Romantic repertoire.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Robert_Schumann_1839.jpg/220px-Robert_Schumann_1839.jpg",
  },
  {
    id: "liszt",
    name: "Franz Liszt",
    pronunciation: "FRAHNTS LIST",
    era: "romantic",
    birthYear: 1811,
    deathYear: 1886,
    bio: "Hungarian virtuoso pianist and composer who invented the symphonic poem and the solo piano recital. His transcendental technique was unmatched in his era.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Franz_Liszt_1858.jpg/220px-Franz_Liszt_1858.jpg",
  },
  {
    id: "wagner",
    name: "Richard Wagner",
    pronunciation: "RIKH-art VAHG-ner",
    era: "romantic",
    birthYear: 1813,
    deathYear: 1883,
    bio: "German composer who revolutionized opera with his concept of Gesamtkunstwerk (total artwork). The Ring Cycle is among the most ambitious works in all of music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/RichardWagner.jpg/220px-RichardWagner.jpg",
  },
  {
    id: "verdi",
    name: "Giuseppe Verdi",
    pronunciation: "joo-ZEP-peh VAIR-dee",
    era: "romantic",
    birthYear: 1813,
    deathYear: 1901,
    bio: "Italy's greatest opera composer, whose works — Rigoletto, La traviata, Aida, Otello — dominate the operatic stage to this day.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Verdi.jpg/220px-Verdi.jpg",
  },
  {
    id: "bruckner",
    name: "Anton Bruckner",
    pronunciation: "AHN-tohn BROOK-ner",
    era: "romantic",
    birthYear: 1824,
    deathYear: 1896,
    bio: "Austrian composer known for monumental symphonies of spiritual grandeur, blending Wagnerian harmony with a cathedral-like sense of scale.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Anton_Bruckner_%281890%29.jpg/220px-Anton_Bruckner_%281890%29.jpg",
  },
  {
    id: "brahms",
    name: "Johannes Brahms",
    pronunciation: "yoh-HAH-nes BRAHMZ",
    era: "romantic",
    birthYear: 1833,
    deathYear: 1897,
    bio: "German composer who combined Romantic passion with Classical structure. His four symphonies, German Requiem, and chamber works are cornerstones of the repertoire.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Johannes_Brahms_1853.jpg/220px-Johannes_Brahms_1853.jpg",
  },
  {
    id: "saint-saens",
    name: "Camille Saint-Saëns",
    pronunciation: "kah-MEEL san-SAHNS",
    era: "romantic",
    birthYear: 1835,
    deathYear: 1921,
    bio: "French composer, organist, and polymath. Best known for The Carnival of the Animals, Danse macabre, and the Organ Symphony.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Camille_Saint-Sa%C3%ABns_1900.jpg/220px-Camille_Saint-Sa%C3%ABns_1900.jpg",
  },
  {
    id: "tchaikovsky",
    name: "Pyotr Ilyich Tchaikovsky",
    pronunciation: "PYOH-ter ill-YEECH chy-KOFF-skee",
    era: "romantic",
    birthYear: 1840,
    deathYear: 1893,
    bio: "Russian composer whose ballets (Swan Lake, The Nutcracker, Sleeping Beauty), symphonies, and concertos are among the most beloved in all classical music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Tchaikovsky_by_Reutlinger_%28cropped%29.jpg/220px-Tchaikovsky_by_Reutlinger_%28cropped%29.jpg",
  },
  {
    id: "dvorak",
    name: "Antonín Dvořák",
    pronunciation: "AHN-toh-neen DVOR-zhahk",
    era: "romantic",
    birthYear: 1841,
    deathYear: 1904,
    bio: "Czech composer who blended Bohemian folk music with Classical forms. His Symphony No. 9 'From the New World' is universally celebrated.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Dvorak.jpg/220px-Dvorak.jpg",
  },
  {
    id: "grieg",
    name: "Edvard Grieg",
    pronunciation: "ED-vard GREEG",
    era: "romantic",
    birthYear: 1843,
    deathYear: 1907,
    bio: "Norwegian composer whose Peer Gynt Suite and Piano Concerto captured the spirit of Scandinavian landscapes and folklore.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2b/Edvard_Grieg_%281888%29_by_Elliot_and_Fry_-_02.jpg/220px-Edvard_Grieg_%281888%29_by_Elliot_and_Fry_-_02.jpg",
  },
  {
    id: "rimsky-korsakov",
    name: "Nikolai Rimsky-Korsakov",
    pronunciation: "nik-oh-LY RIM-skee KOR-sah-koff",
    era: "romantic",
    birthYear: 1844,
    deathYear: 1908,
    bio: "Russian composer and master orchestrator. His Scheherazade and operas paint vivid musical pictures drawn from Russian folk tales.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Nikolai_Rimsky-Korsakov_crop.jpg/220px-Nikolai_Rimsky-Korsakov_crop.jpg",
  },
  {
    id: "elgar",
    name: "Edward Elgar",
    pronunciation: "ED-werd EL-gar",
    era: "romantic",
    birthYear: 1857,
    deathYear: 1934,
    bio: "English composer whose Enigma Variations and cello concerto are cornerstones of British music. His Pomp and Circumstance marches are globally iconic.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Edward_Elgar.jpg/220px-Edward_Elgar.jpg",
  },
  {
    id: "puccini",
    name: "Giacomo Puccini",
    pronunciation: "JAH-koh-moh poo-CHEE-nee",
    era: "romantic",
    birthYear: 1858,
    deathYear: 1924,
    bio: "Italian opera composer whose La bohème, Tosca, and Madama Butterfly combine dramatic power with unforgettable melody.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Giacomo_Puccini_1924.jpg/220px-Giacomo_Puccini_1924.jpg",
  },
  {
    id: "mahler",
    name: "Gustav Mahler",
    pronunciation: "GOOS-tahv MAH-ler",
    era: "romantic",
    birthYear: 1860,
    deathYear: 1911,
    bio: "Austrian composer and conductor whose nine completed symphonies are vast emotional landscapes, bridging Romanticism and Modernism.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Gustav_Mahler_1909.jpg/220px-Gustav_Mahler_1909.jpg",
  },
  {
    id: "strauss-r",
    name: "Richard Strauss",
    pronunciation: "RIKH-art SHTROWSS",
    era: "romantic",
    birthYear: 1864,
    deathYear: 1949,
    bio: "German composer renowned for orchestral tone poems (Also sprach Zarathustra, Don Juan) and operas (Der Rosenkavalier, Salome).",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Strauss-Richard-cr.jpg/220px-Strauss-Richard-cr.jpg",
  },
  {
    id: "rachmaninoff",
    name: "Sergei Rachmaninoff",
    pronunciation: "sair-GAY rahkh-MAH-nee-noff",
    era: "romantic",
    birthYear: 1873,
    deathYear: 1943,
    bio: "Russian composer, pianist, and conductor. His lush, melodic piano concertos and the Rhapsody on a Theme of Paganini define late Romantic pianism.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Sergei_Rachmaninoff_cph.3a40575.jpg/220px-Sergei_Rachmaninoff_cph.3a40575.jpg",
  },
  // ── Modern / Contemporary (1910–2000) ──
  {
    id: "debussy",
    name: "Claude Debussy",
    pronunciation: "KLOHD deh-byu-SEE",
    era: "modern",
    birthYear: 1862,
    deathYear: 1918,
    bio: "French composer who pioneered musical Impressionism. Prélude à l'après-midi d'un faune, Clair de Lune, and La Mer evoke atmosphere through color and texture.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Claude_Debussy_ca_1908%2C_foto_av_F%C3%A9lix_Nadar.jpg/220px-Claude_Debussy_ca_1908%2C_foto_av_F%C3%A9lix_Nadar.jpg",
  },
  {
    id: "satie",
    name: "Erik Satie",
    pronunciation: "eh-REEK sah-TEE",
    era: "modern",
    birthYear: 1866,
    deathYear: 1925,
    bio: "French composer and eccentric whose Gymnopédies and Gnossiennes anticipated minimalism. A radical influence on 20th-century music.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Erik_Satie_en_velours.jpg/220px-Erik_Satie_en_velours.jpg",
  },
  {
    id: "ravel",
    name: "Maurice Ravel",
    pronunciation: "moh-REES rah-VEL",
    era: "modern",
    birthYear: 1875,
    deathYear: 1937,
    bio: "French composer known for meticulous orchestration. Boléro, Daphnis et Chloé, and his piano concertos showcase brilliant craftsmanship.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Maurice_Ravel_1925.jpg/220px-Maurice_Ravel_1925.jpg",
  },
  {
    id: "kreisler",
    name: "Fritz Kreisler",
    pronunciation: "FRITS KRY-slur",
    era: "modern",
    birthYear: 1875,
    deathYear: 1962,
    bio: "Austrian-American violinist and composer whose charming miniatures like Liebesleid and Liebesfreud became violin repertoire staples. He famously attributed his own compositions to earlier composers.",
  },
  {
    id: "bartok",
    name: "Béla Bartók",
    pronunciation: "BAY-lah BAR-tohk",
    era: "modern",
    birthYear: 1881,
    deathYear: 1945,
    bio: "Hungarian composer and ethnomusicologist who fused folk music with modernist techniques. His Concerto for Orchestra is a 20th-century masterpiece.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Bart%C3%B3k_B%C3%A9la_1927.jpg/220px-Bart%C3%B3k_B%C3%A9la_1927.jpg",
  },
  {
    id: "stravinsky",
    name: "Igor Stravinsky",
    pronunciation: "EE-gor strah-VIN-skee",
    era: "modern",
    birthYear: 1882,
    deathYear: 1971,
    bio: "Russian-born composer whose The Rite of Spring caused a riot at its 1913 premiere. One of the most influential composers of the 20th century.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Igor_Stravinsky_%28LOC%29_%28cropped%29.jpg/220px-Igor_Stravinsky_%28LOC%29_%28cropped%29.jpg",
  },
  {
    id: "prokofiev",
    name: "Sergei Prokofiev",
    pronunciation: "sair-GAY proh-KOF-ee-ef",
    era: "modern",
    birthYear: 1891,
    deathYear: 1953,
    bio: "Russian composer known for Peter and the Wolf, Romeo and Juliet, and seven symphonies. His music blends lyrical melody with driving, percussive energy.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Sergei_Prokofiev_circa_1918_over_Chair_Bain.jpg/220px-Sergei_Prokofiev_circa_1918_over_Chair_Bain.jpg",
  },
  {
    id: "gershwin",
    name: "George Gershwin",
    pronunciation: "JORJ GURSH-win",
    era: "modern",
    birthYear: 1898,
    deathYear: 1937,
    bio: "American composer who bridged popular and classical music. Rhapsody in Blue, An American in Paris, and Porgy and Bess are uniquely American masterworks.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/George_Gershwin_1937.jpg/220px-George_Gershwin_1937.jpg",
  },
  {
    id: "copland",
    name: "Aaron Copland",
    pronunciation: "AIR-un KOHP-lund",
    era: "modern",
    birthYear: 1900,
    deathYear: 1990,
    bio: "American composer who defined the sound of American classical music. Appalachian Spring, Fanfare for the Common Man, and Rodeo evoke the open frontier.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Aaron_Copland_1970.jpg/220px-Aaron_Copland_1970.jpg",
  },
  {
    id: "shostakovich",
    name: "Dmitri Shostakovich",
    pronunciation: "dih-MEE-tree shoss-tah-KOH-vich",
    era: "modern",
    birthYear: 1906,
    deathYear: 1975,
    bio: "Russian composer whose 15 symphonies and 15 string quartets chronicle the Soviet era with searing emotional intensity and coded defiance.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Dmitri_Shostakovich_credit_Deutsche_Fotothek_adjusted.jpg/220px-Dmitri_Shostakovich_credit_Deutsche_Fotothek_adjusted.jpg",
  },
  {
    id: "bernstein",
    name: "Leonard Bernstein",
    pronunciation: "LEN-urd BURN-styne",
    era: "modern",
    birthYear: 1918,
    deathYear: 1990,
    bio: "American conductor, composer, and educator. West Side Story, his symphonies, and his legendary Young People's Concerts brought classical music to millions.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Leonard_Bernstein_by_Jack_Mitchell.jpg/220px-Leonard_Bernstein_by_Jack_Mitchell.jpg",
  },
  {
    id: "ligeti",
    name: "György Ligeti",
    pronunciation: "JYUR-jee LIG-eh-tee",
    era: "modern",
    birthYear: 1923,
    deathYear: 2006,
    bio: "Hungarian-Austrian composer of groundbreaking avant-garde works. His Atmosphères, used in 2001: A Space Odyssey, redefined orchestral texture.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/Gy%C3%B6rgy_Ligeti_%281984%29.jpg/220px-Gy%C3%B6rgy_Ligeti_%281984%29.jpg",
  },
  {
    id: "arvo-part",
    name: "Arvo Pärt",
    pronunciation: "AR-voh PAIRT",
    era: "modern",
    birthYear: 1935,
    bio: "Estonian composer who developed the tintinnabuli style — a luminous, bell-like minimalism rooted in medieval and sacred music traditions.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Arvo_P%C3%A4rt_2011.jpg/220px-Arvo_P%C3%A4rt_2011.jpg",
  },
  {
    id: "glass",
    name: "Philip Glass",
    pronunciation: "FIL-ip GLASS",
    era: "modern",
    birthYear: 1937,
    bio: "American composer and a pioneer of minimalism. His operas, film scores, and symphonies built on hypnotic repetition have reached vast audiences worldwide.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Philip_Glass_in_Florence%2C_Italy_-_2007.jpg/220px-Philip_Glass_in_Florence%2C_Italy_-_2007.jpg",
  },
];

export const relationships: ComposerRelationship[] = [
  // Renaissance → Baroque bridges
  { from: "palestrina", to: "monteverdi", type: "influence", description: "Palestrina's contrapuntal mastery set the standard that Monteverdi both absorbed and rebelled against in creating the new Baroque style" },
  { from: "monteverdi", to: "lully", type: "influence", description: "Monteverdi's operatic innovations in Italy laid the groundwork for Lully's development of French opera at Versailles" },

  // Baroque connections
  { from: "corelli", to: "vivaldi", type: "influence", description: "Corelli's concerto grosso form and violin technique directly shaped Vivaldi's concerto writing" },
  { from: "corelli", to: "handel", type: "influence", description: "Handel met Corelli in Rome and was deeply influenced by his orchestral and sonata style" },
  { from: "bach", to: "handel", type: "contemporary", description: "Born the same year just 80 miles apart in Germany, though they never met despite mutual awareness" },
  { from: "bach", to: "telemann", type: "contemporary", description: "Close lifelong friends — Telemann was godfather to C.P.E. Bach and they regularly exchanged music" },
  { from: "vivaldi", to: "bach", type: "influence", description: "Bach transcribed several of Vivaldi's concertos for keyboard, learning Italian melodic style" },

  // Baroque → Classical bridges
  { from: "bach", to: "cpe-bach", type: "teacher", description: "J.S. Bach trained his son C.P.E. at home, who went on to pioneer the empfindsamer Stil" },
  { from: "bach", to: "mozart", type: "influence", description: "Mozart studied Bach's fugues in Vienna and declared 'here is something one can learn from'" },

  // Classical connections
  { from: "haydn", to: "mozart", type: "contemporary", description: "Devoted friends in Vienna who played string quartets together and openly admired each other's genius" },
  { from: "haydn", to: "beethoven", type: "teacher", description: "Beethoven moved to Vienna in 1792 to study with Haydn, though the lessons were famously fraught" },
  { from: "mozart", to: "beethoven", type: "influence", description: "Young Beethoven reportedly played for Mozart in Vienna; Mozart's dramatic piano concertos shaped Beethoven's early style" },
  { from: "mozart", to: "hummel", type: "teacher", description: "Hummel lived in Mozart's household as a child prodigy and received two years of free instruction" },

  // Classical → Romantic bridges
  { from: "beethoven", to: "schubert", type: "influence", description: "Schubert idolized Beethoven, lived in the same city, and reportedly visited him on his deathbed" },
  { from: "beethoven", to: "brahms", type: "influence", description: "Brahms saw himself as Beethoven's symphonic heir, famously struggling for years to complete his First Symphony" },
  { from: "paganini", to: "liszt", type: "influence", description: "Hearing Paganini's virtuosity in Paris inspired Liszt to pursue the same transcendent technique on piano" },

  // Romantic connections
  { from: "weber", to: "wagner", type: "influence", description: "Weber's German Romantic operas, especially Der Freischütz, were a formative inspiration for Wagner's music dramas" },
  { from: "mendelssohn", to: "brahms", type: "influence", description: "Mendelssohn's craft and classical sensibility influenced Brahms's approach to chamber music and orchestration" },
  { from: "schumann", to: "brahms", type: "teacher", description: "Schumann proclaimed the young Brahms a genius in an 1853 essay, launching his career and becoming his mentor" },
  { from: "chopin", to: "liszt", type: "contemporary", description: "Close friends in 1830s Paris who admired and promoted each other's revolutionary piano works" },
  { from: "liszt", to: "wagner", type: "contemporary", description: "Liszt championed Wagner's operas at Weimar and became his father-in-law when Wagner married Cosima" },
  { from: "wagner", to: "bruckner", type: "influence", description: "Bruckner worshipped Wagner and dedicated his Third Symphony to him, embracing vast Wagnerian orchestration" },
  { from: "wagner", to: "mahler", type: "influence", description: "Wagner's orchestral scale and philosophical ambition profoundly shaped Mahler's symphonic vision" },
  { from: "wagner", to: "strauss-r", type: "influence", description: "Strauss heard Wagner's operas as a teenager and carried the Wagnerian orchestral tradition into the 20th century" },
  { from: "verdi", to: "puccini", type: "influence", description: "Puccini inherited Verdi's mantle as Italy's leading opera composer, evolving his dramatic lyricism into verismo" },
  { from: "tchaikovsky", to: "rachmaninoff", type: "influence", description: "Rachmaninoff idolized Tchaikovsky's emotional lyricism and carried the Russian Romantic tradition forward" },
  { from: "rimsky-korsakov", to: "stravinsky", type: "teacher", description: "Stravinsky studied privately with Rimsky-Korsakov for three years, absorbing his brilliant orchestration" },

  // Romantic → Modern bridges
  { from: "liszt", to: "debussy", type: "influence", description: "Liszt's late experimental harmonies and tone poems anticipated Debussy's Impressionist language" },
  { from: "debussy", to: "ravel", type: "influence", description: "Ravel absorbed Debussy's Impressionist palette but developed a more precise, classically structured voice" },
  { from: "debussy", to: "satie", type: "contemporary", description: "Friends in Montmartre who mutually influenced each other, though Satie's radical simplicity was the opposite of Debussy's lushness" },

  // Modern connections
  { from: "rimsky-korsakov", to: "prokofiev", type: "influence", description: "Prokofiev studied at the St. Petersburg Conservatory where Rimsky-Korsakov's orchestral color left a lasting mark" },
  { from: "stravinsky", to: "copland", type: "influence", description: "Copland studied with Stravinsky's teacher Boulanger and adopted his rhythmic vitality and neo-classical clarity" },
  { from: "prokofiev", to: "shostakovich", type: "contemporary", description: "Soviet Russia's two greatest composers, whose careers intertwined under the pressures of Stalinist cultural policy" },
  { from: "copland", to: "bernstein", type: "influence", description: "Bernstein met Copland at age 17 and became his protégé, absorbing his American sound and compositional ethos" },
  { from: "bartok", to: "ligeti", type: "influence", description: "Fellow Hungarians — Ligeti studied Bartók's folk-infused modernism before forging his own avant-garde path" },
];

export function getComposerById(id: string): Composer | undefined {
  return composers.find((c) => c.id === id);
}

export function getComposersByEra(era: string): Composer[] {
  return composers.filter((c) => c.era === era);
}
