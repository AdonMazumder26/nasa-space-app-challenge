import type { CatalogImage } from "../types/catalog";

function photo(input: {
  id: string;
  file: string;
  nasaId: string;
  credit: string;
  altEn: string;
  altBn: string;
  orbital?: boolean;
}): CatalogImage {
  return {
    id: input.id,
    url: `/images/${input.file}`,
    alt: { en: input.altEn, bn: input.altBn },
    credit: input.credit,
    sourceId: `nasa-${input.nasaId.toLowerCase()}`,
    type: input.orbital ? "orbital photograph" : "surface photograph",
  };
}

export const objectImages: Record<string, CatalogImage[]> = {
  "apollo-11-descent-stage": [
    photo({
      id: "apollo-11-eagle",
      file: "apollo-11-descent-stage.jpg",
      nasaId: "as11-40-5927",
      credit: "NASA. Photograph AS11-40-5927.",
      altEn: "Apollo 11 lunar module Eagle on the Moon, with astronaut Edwin Aldrin at a landing leg. Photographed 20 July 1969.",
      altBn: "চাঁদের বুকে অ্যাপোলো ১১-এর চন্দ্রযান ঈগল। অবতরণ পায়ের কাছে নভোচারী এডউইন অলড্রিন। ২০ জুলাই ১৯৬৯-এর আলোকচিত্র।",
    }),
  ],
  "viking-1-lander": [
    photo({
      id: "viking-1-first-photo",
      file: "viking-1-lander.jpg",
      nasaId: "PIA00381",
      credit: "NASA/JPL. Photograph PIA00381.",
      altEn: "The first photograph from the surface of Mars, taken by Viking 1 minutes after landing on 20 July 1976. Part of the lander is at the right edge.",
      altBn: "মঙ্গলের পৃষ্ঠ থেকে প্রথম আলোকচিত্র। ভাইকিং ১ অবতরণের কয়েক মিনিট পর, ২০ জুলাই ১৯৭৬-এ তুলেছে। ডান প্রান্তে ল্যান্ডারের একাংশ।",
    }),
  ],
  "viking-2-lander": [
    photo({
      id: "viking-2-first-photo",
      file: "viking-2-lander.jpg",
      nasaId: "PIA00396",
      credit: "NASA/JPL. Photograph PIA00396.",
      altEn: "Viking 2's first photograph from the Martian surface, with part of the lander at the right edge.",
      altBn: "মঙ্গলের পৃষ্ঠ থেকে ভাইকিং ২-এর প্রথম আলোকচিত্র। ডান প্রান্তে ল্যান্ডারের একাংশ।",
    }),
  ],
  "pathfinder-lander": [
    photo({
      id: "pathfinder-ramp",
      file: "pathfinder-lander.jpg",
      nasaId: "PIA00628",
      credit: "NASA/JPL. Photograph PIA00628.",
      altEn: "Mars Pathfinder's forward ramp after it unfurled, photographed by the lander's camera. NASA notes this ramp was not the one Sojourner drove down.",
      altBn: "মার্স পাথফাইন্ডারের সামনের র্যাম্প খোলার পর, ল্যান্ডারের ক্যামেরায়। নাসা জানিয়েছে সোজার্নার এই র্যাম্প দিয়ে নামেনি।",
    }),
  ],
  sojourner: [
    photo({
      id: "sojourner-deployed",
      file: "sojourner.jpg",
      nasaId: "PIA01551",
      credit: "NASA/JPL. Photograph PIA01551.",
      altEn: "The Sojourner rover after deployment on Mars, seen from the Pathfinder lander.",
      altBn: "মঙ্গলে নামানোর পর সোজার্নার রোভার, পাথফাইন্ডার ল্যান্ডার থেকে দেখা।",
    }),
  ],
  spirit: [
    photo({
      id: "spirit-panels",
      file: "spirit.jpg",
      nasaId: "PIA10128",
      credit: "NASA/JPL-Caltech. Photograph PIA10128.",
      altEn: "Spirit's deck and solar panels coated with dust, photographed by the rover. This is not the landing-site view used for the map marker.",
      altBn: "স্পিরিটের ডেক ও সৌরপ্যানেল ধুলোয় ঢাকা, রোভারের নিজের আলোকচিত্র। মানচিত্রের চিহ্ন যে অবতরণস্থল, এই ছবি সেই দৃশ্য নয়।",
    }),
  ],
  opportunity: [
    photo({
      id: "opportunity-portrait",
      file: "opportunity.jpg",
      nasaId: "PIA15114",
      credit: "NASA/JPL-Caltech. Photograph PIA15114.",
      altEn: "A 2007 self-portrait of Opportunity's deck and solar panels. This is not the landing-site view used for the map marker.",
      altBn: "২০০৭ সালে অপরচুনিটির ডেক ও সৌরপ্যানেলের আত্মপ্রতিকৃতি। মানচিত্রের চিহ্ন যে অবতরণস্থল, এই ছবি সেই দৃশ্য নয়।",
    }),
  ],
  phoenix: [
    photo({
      id: "phoenix-deck",
      file: "phoenix.jpg",
      nasaId: "PIA12106",
      credit: "NASA/JPL-Caltech. Photograph PIA12106.",
      altEn: "The Phoenix lander's deck and a solar panel on Mars, after soil samples were delivered to the instruments.",
      altBn: "মঙ্গলে ফিনিক্স ল্যান্ডারের ডেক ও একটি সৌরপ্যানেল, যন্ত্রে মাটির নমুনা দেওয়ার পর।",
    }),
  ],
  curiosity: [
    photo({
      id: "curiosity-buckskin",
      file: "curiosity.jpg",
      nasaId: "PIA19808",
      credit: "NASA/JPL-Caltech/MSSS. Photograph PIA19808.",
      altEn: "Curiosity's selfie at the Buckskin drilling site. The map marker remains Bradbury Landing, not this later location.",
      altBn: "বাকস্কিন খননস্থলে কিউরিওসিটির আত্মপ্রতিকৃতি। মানচিত্রের চিহ্ন ব্র্যাডবেরি অবতরণস্থল, এই পরের জায়গা নয়।",
    }),
  ],
  insight: [
    photo({
      id: "insight-selfie",
      file: "insight.jpg",
      nasaId: "PIA22876",
      credit: "NASA/JPL-Caltech. Photograph PIA22876.",
      altEn: "InSight's first selfie on Mars, 6 December 2018, showing the deck, solar panels, and instruments.",
      altBn: "মঙ্গলে ইনসাইটের প্রথম আত্মপ্রতিকৃতি, ৬ ডিসেম্বর ২০১৮। ডেক, সৌরপ্যানেল ও যন্ত্র দেখা যাচ্ছে।",
    }),
  ],
  perseverance: [
    photo({
      id: "perseverance-ingenuity",
      file: "perseverance.jpg",
      nasaId: "PIA24542",
      credit: "NASA/JPL-Caltech/MSSS. Photograph PIA24542.",
      altEn: "Perseverance's selfie with the Ingenuity helicopter about 13 feet away, taken 6 April 2021. The map marker is the landing site, not this later position.",
      altBn: "প্রসেভিয়ারেন্সের আত্মপ্রতিকৃতি, কাছে ইনজেনুইটি হেলিকপ্টার, প্রায় ১৩ ফুট দূরে। ৬ এপ্রিল ২০২১। মানচিত্রের চিহ্ন অবতরণস্থল, এই পরের অবস্থান নয়।",
    }),
  ],
  "beagle-2": [
    photo({
      id: "beagle-2-hirise",
      file: "beagle-2.jpg",
      nasaId: "PIA19108",
      credit: "HiRISE/NASA/University of Leicester. Photograph PIA19108.",
      altEn: "Annotated Mars Reconnaissance Orbiter image. NASA identifies the marked feature as the Beagle 2 lander.",
      altBn: "মার্স রিকনাইসেন্স অরবিটারের টীকাযুক্ত ছবি। নাসা চিহ্নিত অংশটিকে বিগল ২ ল্যান্ডার বলে শনাক্ত করে।",
      orbital: true,
    }),
  ],
};
