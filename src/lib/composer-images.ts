export const COMPOSER_IMAGES: Record<string, string> = {
  "arvo-part": "/images/composers/arvo-part.jpg",
  "bach": "/images/composers/bach.jpg",
  "bartok": "/images/composers/bartok.jpg",
  "beethoven": "/images/composers/beethoven.jpg",
  "berlioz": "/images/composers/berlioz.png",
  "bernstein": "/images/composers/bernstein.jpg",
  "boccherini": "/images/composers/boccherini.jpg",
  "brahms": "/images/composers/brahms.jpg",
  "bruckner": "/images/composers/bruckner.jpg",
  "byrd": "/images/composers/byrd.jpg",
  "chopin": "/images/composers/chopin.jpg",
  "copland": "/images/composers/copland.jpg",
  "corelli": "/images/composers/corelli.jpg",
  "cpe-bach": "/images/composers/cpe-bach.jpg",
  "debussy": "/images/composers/debussy.jpg",
  "dvorak": "/images/composers/dvorak.jpg",
  "elgar": "/images/composers/elgar.jpg",
  "gershwin": "/images/composers/gershwin.jpg",
  "glass": "/images/composers/glass.jpg",
  "gluck": "/images/composers/gluck.jpg",
  "grieg": "/images/composers/grieg.jpg",
  "handel": "/images/composers/handel.jpg",
  "haydn": "/images/composers/haydn.jpg",
  "hummel": "/images/composers/hummel.jpg",
  "josquin": "/images/composers/josquin.jpg",
  "ligeti": "/images/composers/ligeti.jpg",
  "liszt": "/images/composers/liszt.png",
  "lully": "/images/composers/lully.jpg",
  "mahler": "/images/composers/mahler.jpg",
  "mendelssohn": "/images/composers/mendelssohn.jpg",
  "monteverdi": "/images/composers/monteverdi.jpg",
  "mozart": "/images/composers/mozart.jpg",
  "paganini": "/images/composers/paganini.jpg",
  "palestrina": "/images/composers/palestrina.jpg",
  "prokofiev": "/images/composers/prokofiev.jpg",
  "puccini": "/images/composers/puccini.jpg",
  "purcell": "/images/composers/purcell.jpg",
  "rachmaninoff": "/images/composers/rachmaninoff.jpg",
  "rameau": "/images/composers/rameau.jpg",
  "ravel": "/images/composers/ravel.jpg",
  "rimsky-korsakov": "/images/composers/rimsky-korsakov.jpg",
  "rossini": "/images/composers/rossini.jpg",
  "saint-saens": "/images/composers/saint-saens.jpg",
  "satie": "/images/composers/satie.jpg",
  "scarlatti": "/images/composers/scarlatti.jpg",
  "schubert": "/images/composers/schubert.jpg",
  "schumann": "/images/composers/schumann.jpg",
  "shostakovich": "/images/composers/shostakovich.jpg",
  "strauss-r": "/images/composers/strauss-r.jpg",
  "stravinsky": "/images/composers/stravinsky.jpg",
  "tchaikovsky": "/images/composers/tchaikovsky.jpg",
  "telemann": "/images/composers/telemann.jpg",
  "verdi": "/images/composers/verdi.jpg",
  "vivaldi": "/images/composers/vivaldi.jpg",
  "wagner": "/images/composers/wagner.jpg",
  "weber": "/images/composers/weber.jpg",
};

export function getComposerImage(id: string): string | undefined {
  if (COMPOSER_IMAGES[id]) return COMPOSER_IMAGES[id];

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("classica_custom_composers");
      if (raw) {
        const list = JSON.parse(raw) as { id: string; imageUrl?: string }[];
        const found = list.find((c) => c.id === id);
        if (found?.imageUrl) return found.imageUrl;
      }
    } catch {
      /* ignore */
    }
  }

  return undefined;
}
