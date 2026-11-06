import type { Localized } from "../types/catalog";

/**
 * Photographs fetched from the NASA Image and Video Library for Story Mode's cinematic
 * scenes (see scripts/fetch-story-images.mjs). Titles, ids, and credits come from the
 * API record; only the alt text is written here. NASA imagery is not copyrighted, but
 * every use links back to the original record. These are illustrative scene images and
 * are kept separate from the catalog's artifact photographs on purpose.
 */
export type StoryImage = {
  id: string;
  file: string;
  nasaId: string;
  title: string;
  credit: string;
  alt: Localized;
  /** Intrinsic aspect ratio of the stored file, for layout without layout shift. */
  width: number;
  height: number;
};

const details = (nasaId: string) => `https://images.nasa.gov/details/${nasaId}`;

function image(input: { id: string; nasaId: string; title: string; credit: string; width: number; height: number; altEn: string; altBn: string }): StoryImage {
  return {
    id: input.id,
    file: `/images/story/${input.id}.jpg`,
    nasaId: input.nasaId,
    title: input.title,
    credit: `${input.credit} ${input.nasaId}.`,
    alt: { en: input.altEn, bn: input.altBn },
    width: input.width,
    height: input.height,
  };
}

export const storyImages: StoryImage[] = [
  image({
    id: "earthrise",
    nasaId: "as08-14-2383",
    title: "Apollo 8 Mission image, Earth over the horizon of the moon",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "Earth rising above the grey lunar horizon, photographed from Apollo 8 in lunar orbit, 24 December 1968.",
    altBn: "চন্দ্রকক্ষ থেকে অ্যাপোলো ৮-এর তোলা ছবি: ধূসর চন্দ্র দিগন্তের ওপর উদিত পৃথিবী, ২৪ ডিসেম্বর ১৯৬৮।",
  }),
  image({
    id: "saturn-v-apollo-11",
    nasaId: "6900556",
    title: "Saturn Apollo Program",
    credit: "NASA/MSFC. Photograph",
    width: 1600,
    height: 1269,
    altEn: "The Saturn V rocket carrying Apollo 11 lifts off from Kennedy Space Center on 16 July 1969.",
    altBn: "অ্যাপোলো ১১ বহনকারী স্যাটার্ন ফাইভ রকেট কেনেডি স্পেস সেন্টার থেকে উৎক্ষেপিত হচ্ছে, ১৬ জুলাই ১৯৬৯।",
  }),
  image({
    id: "aldrin-on-moon",
    nasaId: "as11-40-5903",
    title: "Astronaut Edwin Aldrin walks on lunar surface near leg of Lunar Module",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1562,
    altEn: "Buzz Aldrin standing on the Moon in his spacesuit, with Neil Armstrong and the lunar module reflected in his visor.",
    altBn: "চাঁদের বুকে স্পেসস্যুট পরা বাজ অলড্রিন; তাঁর ভাইজরে নিল আর্মস্ট্রং ও চন্দ্রযানের প্রতিবিম্ব।",
  }),
  image({
    id: "bootprint",
    nasaId: "as11-40-5878",
    title: "Close-up view of astronauts footprint in lunar soil",
    credit: "NASA. Photograph",
    width: 1593,
    height: 1600,
    altEn: "A single boot print pressed into fine grey lunar soil at Tranquility Base.",
    altBn: "প্রশান্তি ঘাঁটিতে মিহি ধূসর চন্দ্রমাটিতে বসে যাওয়া একটি জুতোর ছাপ।",
  }),
  image({
    id: "surveyor-3-apollo-12",
    nasaId: "AS12-48-7134",
    title: "Apollo 12 Mission image - Astronaut Alan L. Bean, lunar module pilot, and two U.S. spacecraft",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "Alan Bean beside the Surveyor 3 lander on the Moon, with the Apollo 12 lunar module Intrepid on the horizon behind him.",
    altBn: "চাঁদে সার্ভেয়ার ৩ ল্যান্ডারের পাশে অ্যালান বিন; পেছনে দিগন্তে অ্যাপোলো ১২-এর চন্দ্রযান ইন্ট্রেপিড।",
  }),
  image({
    id: "bean-alsep",
    nasaId: "as12-46-6807",
    title: "Astronaut Alan Bean with subpackages of the ALSEP during EVA",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "Alan Bean carrying the two packages of the Apollo 12 science station across the lunar surface.",
    altBn: "অ্যাপোলো ১২-এর বিজ্ঞান কেন্দ্রের দুটি প্যাকেজ চন্দ্রপৃষ্ঠে বয়ে নিয়ে যাচ্ছেন অ্যালান বিন।",
  }),
  image({
    id: "apollo-15-rover",
    nasaId: "as15-86-11603",
    title: "Astronaut James Irwin works at Lunar Roving Vehicle during Apollo 15 EVA",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "James Irwin working at the Apollo 15 lunar rover, with the Hadley mountains rising behind.",
    altBn: "অ্যাপোলো ১৫-এর চন্দ্র রোভারে কাজ করছেন জেমস আরউইন; পেছনে হ্যাডলি পর্বতমালা।",
  }),
  image({
    id: "apollo-16-salute",
    nasaId: "as16-113-18339",
    title: "Astronaut John Young leaps from lunar surface to salute flag",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "John Young jumping off the lunar surface while saluting the flag, with the lunar module and rover behind him.",
    altBn: "পতাকাকে স্যালুট করতে করতে চন্দ্রপৃষ্ঠ থেকে লাফিয়ে ওঠা জন ইয়াং; পেছনে চন্দ্রযান ও রোভার।",
  }),
  image({
    id: "apollo-17-rover-cernan",
    nasaId: "as17-134-20476",
    title: "View of Astronaut Eugene Cernan beside lunar roving vehicle during EVA",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1566,
    altEn: "Eugene Cernan standing beside the Apollo 17 lunar rover in the Taurus–Littrow valley.",
    altBn: "বৃষ–লিট্রো উপত্যকায় অ্যাপোলো ১৭-এর চন্দ্র রোভারের পাশে দাঁড়ানো ইউজিন সারনান।",
  }),
  image({
    id: "apollo-17-schmitt-boulder",
    nasaId: "as17-140-21496",
    title: "Astronaut Harrison Schmitt standing next to boulder during third EVA",
    credit: "NASA. Photograph",
    width: 1544,
    height: 1600,
    altEn: "Harrison Schmitt dwarfed by a split boulder on the floor of the Taurus–Littrow valley.",
    altBn: "বৃষ–লিট্রো উপত্যকার তলায় একটি ফাটা বিশাল পাথরের পাশে ক্ষুদ্র দেখানো হ্যারিসন শ্মিট।",
  }),
  image({
    id: "blue-marble",
    nasaId: "as17-148-22727",
    title: "View of the Earth seen by the Apollo 17 crew traveling toward the moon",
    credit: "NASA. Photograph",
    width: 1600,
    height: 1600,
    altEn: "The whole Earth, fully lit, photographed by the Apollo 17 crew on the way to the Moon.",
    altBn: "চাঁদের পথে অ্যাপোলো ১৭-এর নভোচারীদের তোলা পূর্ণ আলোকিত সমগ্র পৃথিবী।",
  }),
  image({
    id: "spirit-husband-hill",
    nasaId: "PIA03610",
    title: "Summit Panorama with Rover Deck",
    credit: "NASA/JPL-Caltech/Cornell. Photograph",
    width: 1600,
    height: 469,
    altEn: "Panorama from the summit of Husband Hill, with Spirit's dusty solar panels in the foreground.",
    altBn: "হাজব্যান্ড পাহাড়ের চূড়া থেকে প্যানোরামা; সামনে স্পিরিটের ধুলোমাখা সৌরপ্যানেল।",
  }),
  image({
    id: "opportunity-burns-cliff",
    nasaId: "PIA07039",
    title: "At Base of 'Burns Cliff'",
    credit: "NASA/JPL. Photograph",
    width: 1600,
    height: 1028,
    altEn: "Layered rock of Burns Cliff inside Endurance crater, photographed by Opportunity.",
    altBn: "এনডিউরেন্স গহ্বরের ভেতরে বার্নস ক্লিফের স্তরযুক্ত পাথর, অপরচুনিটির তোলা।",
  }),
  image({
    id: "phoenix-sun",
    nasaId: "PIA10665",
    title: "Phoenix Soaks up the Sun",
    credit: "NASA/JPL-Caltech/University of Arizona. Photograph",
    width: 1280,
    height: 720,
    altEn: "One of Phoenix's unfolded solar panels on the Martian arctic plain, soon after landing.",
    altBn: "অবতরণের কিছু পরে মঙ্গলের সুমেরু সমভূমিতে ফিনিক্সের খুলে যাওয়া একটি সৌরপ্যানেল।",
  }),
  image({
    id: "curiosity-murray-buttes",
    nasaId: "PIA20844",
    title: "Curiosity Self-Portrait at Murray Buttes",
    credit: "NASA/JPL-Caltech/MSSS. Photograph",
    width: 1600,
    height: 953,
    altEn: "Curiosity's self-portrait in front of the dark layered buttes of the Murray formation on Mount Sharp.",
    altBn: "মাউন্ট শার্পের মারে গঠনের গাঢ় স্তরযুক্ত টিলার সামনে কিউরিওসিটির আত্মপ্রতিকৃতি।",
  }),
  image({
    id: "insight-seis",
    nasaId: "PIA22977",
    title: "Putting SEIS on the Ground",
    credit: "NASA/JPL-Caltech. Photograph",
    width: 1579,
    height: 1600,
    altEn: "InSight's robotic arm lowering the copper-coloured seismometer onto the surface of Mars.",
    altBn: "ইনসাইটের রোবট বাহু তামাটে রঙের ভূকম্পমাপকটিকে মঙ্গলপৃষ্ঠে নামাচ্ছে।",
  }),
  image({
    id: "perseverance-descent",
    nasaId: "PIA24430",
    title: "Perseverance's First Full-Color Look at Mars",
    credit: "NASA/JPL-Caltech. Photograph",
    width: 1280,
    height: 960,
    altEn: "Perseverance's first full-colour view of the floor of Jezero crater, taken shortly after landing.",
    altBn: "অবতরণের কিছু পরে তোলা জেজেরো গহ্বরের তলার পারসিভিয়ারেন্সের প্রথম পূর্ণ-রঙিন দৃশ্য।",
  }),
  image({
    id: "ingenuity-flight",
    nasaId: "PIA24624",
    title: "Perseverance's Left Navcam Views Ingenuity During its Third Flight",
    credit: "NASA/JPL-Caltech. Photograph",
    width: 1280,
    height: 960,
    altEn: "The Ingenuity helicopter in the air above the Martian surface during its third flight, seen from Perseverance's navigation camera.",
    altBn: "তৃতীয় উড্ডয়নে মঙ্গলপৃষ্ঠের ওপরে বাতাসে ইনজেনুইটি হেলিকপ্টার, পারসিভিয়ারেন্সের নেভিগেশন ক্যামেরা থেকে দেখা।",
  }),
  image({
    id: "earth-from-mars",
    nasaId: "PIA17936",
    title: "Bright Evening Star Seen from Mars is Earth",
    credit: "NASA/JPL-Caltech/MSSS/TAMU. Photograph",
    width: 1600,
    height: 1000,
    altEn: "Earth as a bright point of light in the twilight sky over Mars, photographed by Curiosity.",
    altBn: "মঙ্গলের গোধূলি আকাশে একটি উজ্জ্বল আলোকবিন্দু হিসেবে পৃথিবী, কিউরিওসিটির তোলা।",
  }),
  image({
    id: "jezero-panorama",
    nasaId: "PIA24264",
    title: "Mastcam-Z's First 360-Degree Panorama",
    credit: "NASA/JPL-Caltech/MSSS/ASU. Photograph",
    width: 1600,
    height: 424,
    altEn: "A 360-degree panorama of Jezero crater from Perseverance's landing site, with the crater rim on the horizon.",
    altBn: "পারসিভিয়ারেন্সের অবতরণস্থল থেকে জেজেরো গহ্বরের ৩৬০ ডিগ্রি প্যানোরামা; দিগন্তে গহ্বরের কিনার।",
  }),
];

export function storyImageById(id: string): StoryImage | undefined {
  return storyImages.find((item) => item.id === id);
}

export function storyImageUrl(image: StoryImage): string {
  return details(image.nasaId);
}
