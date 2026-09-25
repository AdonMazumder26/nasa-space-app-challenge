import type { TimelineEvent } from "../types/catalog";
import { validateCatalog } from "../lib/validation/schema";
import { marsObjects } from "./marsObjects";
import { missions } from "./missions";
import { moonObjects } from "./moonObjects";
import { sources } from "./sources";

const featuredObjectId: Record<string, string> = {
  "apollo-11": "apollo-11-descent-stage",
  "apollo-12": "apollo-12-descent-stage",
  "apollo-14": "apollo-14-descent-stage",
  "apollo-15": "apollo-15-descent-stage",
  "apollo-16": "apollo-16-descent-stage",
  "apollo-17": "apollo-17-descent-stage",
  "surveyor-1": "surveyor-1",
  "surveyor-3": "surveyor-3",
  "surveyor-7": "surveyor-7",
  "luna-16": "luna-16-descent-stage",
  "luna-17": "lunokhod-1",
  "luna-21": "lunokhod-2",
  "luna-24": "luna-24-descent-stage",
  "change-3": "change-3-lander",
  "change-4": "change-4-lander",
  "chandrayaan-3": "chandrayaan-3-vikram",
  "viking-1": "viking-1-lander",
  "viking-2": "viking-2-lander",
  "mars-pathfinder": "pathfinder-lander",
  "mer-spirit": "spirit",
  "mer-opportunity": "opportunity",
  phoenix: "phoenix",
  "msl-curiosity": "curiosity",
  insight: "insight",
  "mars-2020": "perseverance",
  "beagle-2": "beagle-2",
};

const endings: TimelineEvent[] = [
  {
    id: "lunokhod-1-silence",
    objectId: "lunokhod-1",
    missionId: "luna-17",
    date: "1971-09-14",
    label: { en: "Lunokhod 1 goes silent", bn: "লুনোখোদ ১ নীরব হয়" },
    description: {
      en: "Contact with the first lunar rover ended. It stayed where it had stopped until orbiters found it again in 2010.",
      bn: "প্রথম চন্দ্র রোভারের যোগাযোগ শেষ। ২০১০-এ কক্ষযান আবার না পাওয়া পর্যন্ত যেখানে থেমেছিল সেখানেই থাকে।",
    },
  },
  {
    id: "alsep-off",
    objectId: "apollo-17-alsep",
    missionId: "apollo-17",
    date: "1977-09-30",
    label: { en: "Earth switches off the ALSEP network", bn: "পৃথিবী ALSEP নেটওয়ার্ক বন্ধ করে" },
    description: {
      en: "Controllers turned off the Apollo surface stations, including the last one at Taurus–Littrow. The hardware remained.",
      bn: "নিয়ন্ত্রকরা অ্যাপোলোর পৃষ্ঠ কেন্দ্র বন্ধ করে, বৃষ–লিট্রোর শেষটিসহ। হার্ডওয়্যার থেকে যায়।",
    },
  },
  {
    id: "viking-2-silence",
    objectId: "viking-2-lander",
    missionId: "viking-2",
    date: "1980-04-11",
    label: { en: "Viking 2 falls silent", bn: "ভাইকিং ২ নীরব হয়" },
    description: {
      en: "The last contact with the Utopia Planitia lander.",
      bn: "ইউটোপিয়া সমভূমির ল্যান্ডারের শেষ যোগাযোগ।",
    },
  },
  {
    id: "viking-1-silence",
    objectId: "viking-1-lander",
    missionId: "viking-1",
    date: "1982-11-11",
    label: { en: "Viking 1 falls silent", bn: "ভাইকিং ১ নীরব হয়" },
    description: {
      en: "The last contact with the first U.S. lander on Mars.",
      bn: "মঙ্গলে প্রথম মার্কিন ল্যান্ডারের শেষ যোগাযোগ।",
    },
  },
  {
    id: "pathfinder-silence",
    objectId: "pathfinder-lander",
    missionId: "mars-pathfinder",
    date: "1997-09-27",
    label: { en: "Pathfinder and Sojourner go silent", bn: "পাথফাইন্ডার ও সোজার্নার নীরব হয়" },
    description: {
      en: "Contact ended with the lander and the first Mars rover.",
      bn: "ল্যান্ডার ও মঙ্গলের প্রথম রোভারের যোগাযোগ শেষ।",
    },
  },
  {
    id: "spirit-silence",
    objectId: "spirit",
    missionId: "mer-spirit",
    date: "2010-03-22",
    label: { en: "Spirit sends its last signal", bn: "স্পিরিট শেষ সংকেত পাঠায়" },
    description: {
      en: "The rover had been stuck at Troy. This was the last contact.",
      bn: "রোভার ট্রয়ে আটকে ছিল। এটি ছিল শেষ যোগাযোগ।",
    },
  },
  {
    id: "beagle-found",
    objectId: "beagle-2",
    missionId: "beagle-2",
    date: "2015-01-16",
    label: { en: "Beagle 2 is found in orbital images", bn: "কক্ষপথের ছবিতে বিগল ২ পাওয়া যায়" },
    description: {
      en: "Eleven years after landing, images showed the lander on Isidis Planitia.",
      bn: "অবতরণের এগারো বছর পর ছবিতে ইসিডিস সমভূমিতে ল্যান্ডার দেখা যায়।",
    },
  },
  {
    id: "opportunity-silence",
    objectId: "opportunity",
    missionId: "mer-opportunity",
    date: "2018-06-10",
    label: { en: "Opportunity falls silent", bn: "অপরচুনিটি নীরব হয়" },
    description: {
      en: "A planet-wide dust storm ended contact with the rover.",
      bn: "গ্রহজোড়া ধুলোর ঝড় রোভারের যোগাযোগ শেষ করে।",
    },
  },
  {
    id: "insight-end",
    objectId: "insight",
    missionId: "insight",
    date: "2022-12-21",
    label: { en: "InSight's mission ends", bn: "ইনসাইটের অভিযান শেষ" },
    description: {
      en: "NASA ended the mission after the lander could no longer recharge.",
      bn: "ল্যান্ডার আর চার্জ করতে না পারায় নাসা অভিযান শেষ করে।",
    },
  },
  {
    id: "ingenuity-retired",
    objectId: "perseverance",
    missionId: "mars-2020",
    date: "2024-01-18",
    label: { en: "Ingenuity is retired", bn: "ইনজেনুইটি অবসর নেয়" },
    description: {
      en: "The helicopter, carried by Perseverance, was retired after rotor damage. This dataset has no separate final coordinate for it.",
      bn: "পারসিভিয়ারেন্সের বহন করা হেলিকপ্টার রোটর ক্ষতিতে অবসর নেয়। তার আলাদা শেষ স্থানাঙ্ক এই তথ্যে নেই।",
    },
  },
];

function buildTimeline(): TimelineEvent[] {
  const arrivals: TimelineEvent[] = missions.flatMap((mission) => {
    const objectId = featuredObjectId[mission.id];
    if (!mission.arrivalDate || !objectId) return [];
    return [
      {
        id: `${mission.id}-arrival`,
        objectId,
        missionId: mission.id,
        date: mission.arrivalDate,
        label: {
          en: `${mission.name.en} reaches the surface`,
          bn: `${mission.name.bn} পৃষ্ঠে পৌঁছায়`,
        },
        description: mission.description,
      },
    ];
  });
  return [...arrivals, ...endings].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
}

export const objects = [...moonObjects, ...marsObjects];
export const timeline = buildTimeline();

export const catalog = {
  sources,
  missions,
  objects,
  events: timeline,
};

export const catalogIssues = validateCatalog(catalog);
