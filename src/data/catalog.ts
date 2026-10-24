import type { TimelineEvent } from "../types/catalog";
import { validateCatalog } from "../lib/validation/schema";
import { marsObjects } from "./marsObjects";
import { missions } from "./missions";
import { moonObjects } from "./moonObjects";
import { objectImages } from "./objectImages";
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
  beresheet: "beresheet-impact",
  "chandrayaan-2": "chandrayaan-2-vikram-impact",
  "change-5": "change-5-lander",
  "change-6": "change-6-lander",
  "luna-25": "luna-25-impact",
  slim: "slim-lander",
  "tianwen-1": "tianwen-1-lander",
  "exomars-2016": "schiaparelli",
};

const endings: TimelineEvent[] = [
  {
    id: "surveyor-3-visited",
    objectId: "surveyor-3",
    missionId: "surveyor-3",
    date: "1969-11-20",
    kind: "found",
    label: { en: "Apollo 12 astronauts walk to Surveyor 3", bn: "অ্যাপোলো ১২-এর নভোচারীরা সার্ভেয়ার ৩-এ হেঁটে যান" },
    description: {
      en: "Pete Conrad and Alan Bean reached the lander on foot and removed its television camera for return to Earth. It is the only abandoned spacecraft people have ever visited.",
      bn: "পিট কনরাড ও অ্যালান বিন হেঁটে ল্যান্ডারে পৌঁছান এবং পৃথিবীতে ফেরত আনতে এর টেলিভিশন ক্যামেরা খুলে নেন। এটিই একমাত্র পরিত্যক্ত মহাকাশযান, যেখানে মানুষ গিয়েছে।",
    },
  },
  {
    id: "lunokhod-1-silence",
    objectId: "lunokhod-1",
    missionId: "luna-17",
    date: "1971-09-14",
    kind: "loss",
    label: { en: "Lunokhod 1 goes silent", bn: "লুনোখোদ ১ নীরব হয়" },
    description: {
      en: "Contact with the first lunar rover ended. It stayed where it had stopped until orbiters found it again in 2010.",
      bn: "প্রথম চন্দ্র রোভারের যোগাযোগ শেষ। ২০১০-এ কক্ষযান আবার না পাওয়া পর্যন্ত যেখানে থেমেছিল সেখানেই থাকে।",
    },
  },
  {
    id: "lunokhod-2-end",
    objectId: "lunokhod-2",
    missionId: "luna-21",
    date: "1973-05-10",
    kind: "loss",
    label: { en: "Lunokhod 2 overheats and stops", bn: "লুনোখোদ ২ অতিরিক্ত গরম হয়ে থেমে যায়" },
    description: {
      en: "Dust knocked onto its radiator trapped heat inside the rover. After a record drive of about 39 kilometres, this was the last contact.",
      bn: "রেডিয়েটরে পড়া ধুলো রোভারের ভেতরে তাপ আটকে দেয়। প্রায় ৩৯ কিলোমিটারের রেকর্ড পথ চলার পর এটি ছিল শেষ যোগাযোগ।",
    },
  },
  {
    id: "alsep-off",
    objectId: "apollo-17-alsep",
    missionId: "apollo-17",
    date: "1977-09-30",
    kind: "retired",
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
    kind: "loss",
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
    kind: "loss",
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
    kind: "loss",
    label: { en: "Pathfinder and Sojourner go silent", bn: "পাথফাইন্ডার ও সোজার্নার নীরব হয়" },
    description: {
      en: "Contact ended with the lander and the first Mars rover.",
      bn: "ল্যান্ডার ও মঙ্গলের প্রথম রোভারের যোগাযোগ শেষ।",
    },
  },
  {
    id: "spirit-troy",
    objectId: "spirit",
    missionId: "mer-spirit",
    date: "2009-05-01",
    kind: "milestone",
    label: { en: "Spirit breaks through the crust at Troy", bn: "স্পিরিট ট্রয়ে নরম মাটিতে আটকে যায়" },
    description: {
      en: "The rover's wheels sank into soft soil hidden under a thin crust. Months of attempts to drive out did not free it, and it became a stationary science station.",
      bn: "পাতলা আস্তরণের নিচে লুকোনো নরম মাটিতে রোভারের চাকা ডুবে যায়। বহু মাস চেষ্টা করেও বের করা যায়নি, এবং এটি একটি স্থির বিজ্ঞান কেন্দ্রে পরিণত হয়।",
    },
  },
  {
    id: "phoenix-silence",
    objectId: "phoenix",
    missionId: "phoenix",
    date: "2008-11-02",
    kind: "loss",
    label: { en: "Phoenix sends its last signal", bn: "ফিনিক্স শেষ সংকেত পাঠায়" },
    description: {
      en: "As the northern autumn closed in, dust and shortening days starved the solar panels. This was the final contact before the polar winter.",
      bn: "উত্তরের শরৎ ঘনিয়ে আসতেই ধুলো ও ছোট হয়ে আসা দিন সৌর প্যানেলকে শক্তিহীন করে। মেরু শীতের আগে এটি ছিল শেষ যোগাযোগ।",
    },
  },
  {
    id: "spirit-silence",
    objectId: "spirit",
    missionId: "mer-spirit",
    date: "2010-03-22",
    kind: "loss",
    label: { en: "Spirit sends its last signal", bn: "স্পিরিট শেষ সংকেত পাঠায়" },
    description: {
      en: "The rover had been stuck at Troy. This was the last contact.",
      bn: "রোভার ট্রয়ে আটকে ছিল। এটি ছিল শেষ যোগাযোগ।",
    },
  },
  {
    id: "lunokhod-1-found",
    objectId: "lunokhod-1",
    missionId: "luna-17",
    date: "2010-04-22",
    kind: "found",
    label: { en: "Lunokhod 1 answers a laser from Earth", bn: "লুনোখোদ ১ পৃথিবীর লেজারে সাড়া দেয়" },
    description: {
      en: "Weeks after Lunar Reconnaissance Orbiter photographed the lost rover, a laser fired from New Mexico bounced off its reflector. Nearly forty years of silence ended with a flash of light.",
      bn: "লুনার রিকনেসাঁ অরবিটার হারিয়ে যাওয়া রোভারের ছবি তোলার কয়েক সপ্তাহ পর নিউ মেক্সিকো থেকে ছোড়া লেজার তার প্রতিফলকে ধাক্কা খেয়ে ফেরে। প্রায় চল্লিশ বছরের নীরবতা এক ঝলক আলোয় শেষ হয়।",
    },
  },
  {
    id: "beagle-found",
    objectId: "beagle-2",
    missionId: "beagle-2",
    date: "2015-01-16",
    kind: "found",
    label: { en: "Beagle 2 is found in orbital images", bn: "কক্ষপথের ছবিতে বিগল ২ পাওয়া যায়" },
    description: {
      en: "Eleven years after landing, images showed the lander on Isidis Planitia.",
      bn: "অবতরণের এগারো বছর পর ছবিতে ইসিডিস সমভূমিতে ল্যান্ডার দেখা যায়।",
    },
  },
  {
    id: "yutu-end",
    objectId: "yutu",
    missionId: "change-3",
    date: "2016-08-03",
    kind: "retired",
    label: { en: "Yutu's mission is declared over", bn: "ইউটুর অভিযান শেষ ঘোষণা" },
    description: {
      en: "The rover had stopped driving in its second lunar night but kept transmitting for years. China announced the end of its mission after 31 months on the surface.",
      bn: "দ্বিতীয় চন্দ্র-রাতেই রোভারের চলা থেমে গেলেও এটি বছরের পর বছর সংকেত পাঠাতে থাকে। পৃষ্ঠে ৩১ মাস কাটানোর পর চীন অভিযান শেষের ঘোষণা দেয়।",
    },
  },
  {
    id: "schiaparelli-found",
    objectId: "schiaparelli",
    missionId: "exomars-2016",
    date: "2016-10-21",
    kind: "found",
    label: { en: "Schiaparelli's crash site is photographed", bn: "শিয়াপারেল্লির সংঘাতস্থলের ছবি তোলা হয়" },
    description: {
      en: "Two days after the lander went quiet during descent, Mars Reconnaissance Orbiter saw a dark new mark on Meridiani Planum where it had struck the ground.",
      bn: "অবতরণের সময় ল্যান্ডার নীরব হওয়ার দুই দিন পর মার্স রিকনেসাঁ অরবিটার মেরিডিয়ানি সমভূমিতে একটি নতুন কালো দাগ দেখে, যেখানে এটি মাটিতে আছড়ে পড়েছিল।",
    },
  },
  {
    id: "opportunity-silence",
    objectId: "opportunity",
    missionId: "mer-opportunity",
    date: "2018-06-10",
    kind: "loss",
    label: { en: "Opportunity falls silent", bn: "অপরচুনিটি নীরব হয়" },
    description: {
      en: "A planet-wide dust storm ended contact with the rover.",
      bn: "গ্রহজোড়া ধুলোর ঝড় রোভারের যোগাযোগ শেষ করে।",
    },
  },
  {
    id: "chandrayaan-2-found",
    objectId: "chandrayaan-2-vikram-impact",
    missionId: "chandrayaan-2",
    date: "2019-12-02",
    kind: "found",
    label: { en: "Vikram's debris is found", bn: "বিক্রমের ধ্বংসাবশেষ পাওয়া যায়" },
    description: {
      en: "An engineer in Chennai, searching public Lunar Reconnaissance Orbiter images, spotted the first fragment. NASA confirmed the debris field three months after the crash.",
      bn: "চেন্নাইয়ের এক প্রকৌশলী লুনার রিকনেসাঁ অরবিটারের উন্মুক্ত ছবি ঘেঁটে প্রথম টুকরোটি খুঁজে পান। সংঘাতের তিন মাস পর নাসা ধ্বংসাবশেষের ক্ষেত্রটি নিশ্চিত করে।",
    },
  },
  {
    id: "zhurong-silence",
    objectId: "zhurong",
    missionId: "tianwen-1",
    date: "2022-05-20",
    kind: "loss",
    label: { en: "Zhurong enters hibernation", bn: "ঝুরং শীতনিদ্রায় যায়" },
    description: {
      en: "The rover powered down for the Martian winter with dust on its panels. It was expected to wake in December. It did not.",
      bn: "প্যানেলে ধুলো নিয়ে রোভার মঙ্গলের শীতের জন্য বন্ধ হয়ে যায়। ডিসেম্বরে জেগে ওঠার কথা ছিল। ওঠেনি।",
    },
  },
  {
    id: "insight-end",
    objectId: "insight",
    missionId: "insight",
    date: "2022-12-21",
    kind: "retired",
    label: { en: "InSight's mission ends", bn: "ইনসাইটের অভিযান শেষ" },
    description: {
      en: "NASA ended the mission after the lander could no longer recharge.",
      bn: "ল্যান্ডার আর চার্জ করতে না পারায় নাসা অভিযান শেষ করে।",
    },
  },
  {
    id: "luna-25-found",
    objectId: "luna-25-impact",
    missionId: "luna-25",
    date: "2023-08-31",
    kind: "found",
    label: { en: "Luna 25's crater is identified", bn: "লুনা ২৫-এর গর্ত শনাক্ত হয়" },
    description: {
      en: "Lunar Reconnaissance Orbiter compared old and new images of the south polar region and found a fresh crater about ten metres across where the lander had come down.",
      bn: "লুনার রিকনেসাঁ অরবিটার দক্ষিণ মেরু অঞ্চলের পুরোনো ও নতুন ছবি মিলিয়ে প্রায় দশ মিটার চওড়া একটি নতুন গর্ত খুঁজে পায়, যেখানে ল্যান্ডারটি নেমেছিল।",
    },
  },
  {
    id: "ingenuity-retired",
    objectId: "perseverance",
    missionId: "mars-2020",
    date: "2024-01-18",
    kind: "retired",
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
        kind: "arrival",
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

export const objects = [...moonObjects, ...marsObjects].map((object) => {
  const images = objectImages[object.id] ?? [];
  const extraSources = images.map((image) => image.sourceId).filter((sourceId) => !object.sources.includes(sourceId));
  return { ...object, images, sources: [...object.sources, ...extraSources] };
});
export const timeline = buildTimeline();

export const catalog = {
  sources,
  missions,
  objects,
  events: timeline,
};

export const catalogIssues = validateCatalog(catalog);
