import type { Localized } from "../types/catalog";

export type ArtifactModel = {
    id: string;
    file: string;
    name: Localized;
    mission: Localized;
    kind: Localized;
    description: Localized;
    significance: Localized;
    sourceLabel: Localized;
    sourceUrl: string;
};

function apollo11Model(
    id: string,
    file: string,
    name: Localized,
    kind: Localized,
    detail: Localized,
): ArtifactModel {
    return {
        id,
        file,
        name,
        mission: { en: "Apollo 11", bn: "অ্যাপোলো ১১" },
        kind,
        description: {
            en: `${detail.en} The attached inventory gives this as a likely identification; the exact subsystem is not asserted from the filename alone.`,
            bn: `${detail.bn} সংযুক্ত তালিকায় এটি সম্ভাব্য পরিচয় হিসেবে দেওয়া হয়েছে; শুধু ফাইলের নাম থেকে নির্দিষ্ট সাবসিস্টেম নিশ্চিত করা হচ্ছে না।`,
        },
        significance: {
            en: "This model represents the distributed hardware that supported Apollo 11's first crewed lunar landing and surface work.",
            bn: "এই মডেল অ্যাপোলো ১১-এর প্রথম মানুষবাহী চন্দ্র অবতরণ ও পৃষ্ঠের কাজকে সহায়তা করা বিভিন্ন হার্ডওয়্যারের প্রতিনিধিত্ব করে।",
        },
        sourceLabel: { en: "Apollo 11 mission context", bn: "অ্যাপোলো ১১ অভিযানের তথ্য" },
        sourceUrl: "https://www.nasa.gov/mission/apollo-11/",
    };
}

const apollo11Models: ArtifactModel[] = [
    apollo11Model("apollo-11-lunar-module", "/models/artifacts/apollo-11.glb", { en: "Apollo 11 Lunar Module / LM-related equipment", bn: "অ্যাপোলো ১১ লুনার মডিউল / LM-সম্পর্কিত সরঞ্জাম" }, { en: "Lunar Module hardware", bn: "লুনার মডিউল হার্ডওয়্যার" }, { en: "A model associated with the Apollo 11 Lunar Module Eagle or nearby LM equipment left at the landing site.", bn: "অ্যাপোলো ১১ লুনার মডিউল ঈগল বা অবতরণস্থলে থাকা LM-সম্পর্কিত সরঞ্জামের সঙ্গে যুক্ত একটি মডেল।" }),
    apollo11Model("apollo-11-lunar-surface-camera", "/models/artifacts/apollo-11-2.glb", { en: "Lunar surface camera / TV camera-type equipment", bn: "চন্দ্রপৃষ্ঠ ক্যামেরা / টিভি ক্যামেরা ধরনের সরঞ্জাম" }, { en: "Imaging hardware", bn: "ছবি তোলার হার্ডওয়্যার" }, { en: "A likely camera or television-camera-type assembly used to document Apollo 11 surface activity.", bn: "অ্যাপোলো ১১-এর পৃষ্ঠের কাজ নথিবদ্ধ করতে ব্যবহৃত সম্ভাব্য ক্যামেরা বা টেলিভিশন-ক্যামেরা ধরনের একটি অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-portable-life-support", "/models/artifacts/apollo-11-3.glb", { en: "Lunar Portable Life Support / equipment assembly", bn: "চন্দ্র পোর্টেবল লাইফ সাপোর্ট / সরঞ্জাম অ্যাসেম্বলি" }, { en: "Crew life-support hardware", bn: "ক্রু লাইফ-সাপোর্ট হার্ডওয়্যার" }, { en: "A likely portable life-support or spacesuit equipment assembly from the Apollo surface system.", bn: "অ্যাপোলো পৃষ্ঠ-সিস্টেমের সম্ভাব্য পোর্টেবল লাইফ-সাপোর্ট বা স্পেসস্যুট সরঞ্জাম অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-astronaut-equipment", "/models/artifacts/apollo-11-7.glb", { en: "Astronaut / tool / equipment assembly", bn: "নভোচারী / সরঞ্জাম / টুল অ্যাসেম্বলি" }, { en: "EVA equipment", bn: "EVA সরঞ্জাম" }, { en: "A likely astronaut-carried tool or equipment assembly used during extravehicular activity.", bn: "বাহিরে কাজের সময় নভোচারীর বহন করা সম্ভাব্য টুল বা সরঞ্জাম অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-lunar-module-structure", "/models/artifacts/apollo-11-9.glb", { en: "Lunar Module / large structural equipment", bn: "লুনার মডিউল / বড় কাঠামোগত সরঞ্জাম" }, { en: "Lander structure", bn: "ল্যান্ডার কাঠামো" }, { en: "A likely large structural component associated with the Lunar Module landing system.", bn: "লুনার মডিউল অবতরণ ব্যবস্থার সঙ্গে যুক্ত সম্ভাব্য বড় কাঠামোগত অংশ।" }),
    apollo11Model("apollo-11-reflector-experiment", "/models/artifacts/apollo-11-10.glb", { en: "Lunar surface experiment package / reflector-like instrument", bn: "চন্দ্রপৃষ্ঠ পরীক্ষা প্যাকেজ / রিফ্লেক্টরের মতো যন্ত্র" }, { en: "Surface experiment", bn: "পৃষ্ঠের পরীক্ষা" }, { en: "A likely reflector-like or experiment-package component from the instruments deployed on the lunar surface.", bn: "চন্দ্রপৃষ্ঠে স্থাপিত যন্ত্রগুলোর সম্ভাব্য রিফ্লেক্টরের মতো বা পরীক্ষা-প্যাকেজ অংশ।" }),
    apollo11Model("apollo-11-communications-antenna", "/models/artifacts/apollo-11-11.glb", { en: "Apollo communications / antenna equipment", bn: "অ্যাপোলো যোগাযোগ / অ্যান্টেনা সরঞ্জাম" }, { en: "Communications hardware", bn: "যোগাযোগের হার্ডওয়্যার" }, { en: "A likely communications or antenna assembly supporting voice, telemetry, or television links with Earth.", bn: "পৃথিবীর সঙ্গে কণ্ঠ, টেলিমেট্রি বা টেলিভিশন সংযোগে সহায়তা করা সম্ভাব্য যোগাযোগ বা অ্যান্টেনা অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-equipment-pallet", "/models/artifacts/apollo-11-12.glb", { en: "Lunar surface equipment pallet / experiment package", bn: "চন্দ্রপৃষ্ঠ সরঞ্জাম প্যালেট / পরীক্ষা প্যাকেজ" }, { en: "Surface equipment", bn: "পৃষ্ঠের সরঞ্জাম" }, { en: "A likely pallet or grouped equipment package used to carry and deploy several Apollo 11 surface items.", bn: "অ্যাপোলো ১১-এর একাধিক পৃষ্ঠের সরঞ্জাম বহন ও স্থাপনের সম্ভাব্য প্যালেট বা একত্রিত প্যাকেজ।" }),
    apollo11Model("apollo-11-experiment-package", "/models/artifacts/apollo-11-13.glb", { en: "Lunar surface experiment package", bn: "চন্দ্রপৃষ্ঠ পরীক্ষা প্যাকেজ" }, { en: "Surface experiment", bn: "পৃষ্ঠের পরীক্ষা" }, { en: "A likely scientific experiment package deployed during Apollo 11's short surface stay.", bn: "অ্যাপোলো ১১-এর স্বল্প পৃষ্ঠ-অবস্থানে স্থাপিত সম্ভাব্য বৈজ্ঞানিক পরীক্ষা প্যাকেজ।" }),
    apollo11Model("apollo-11-solar-communications-antenna", "/models/artifacts/apollo-11-14.glb", { en: "Solar / communications antenna or experimental equipment", bn: "সৌর / যোগাযোগ অ্যান্টেনা বা পরীক্ষামূলক সরঞ্জাম" }, { en: "Antenna or experiment", bn: "অ্যান্টেনা বা পরীক্ষা" }, { en: "A likely solar, communications, or experimental assembly from the Apollo 11 surface equipment set.", bn: "অ্যাপোলো ১১ পৃষ্ঠের সরঞ্জাম সেটের সম্ভাব্য সৌর, যোগাযোগ বা পরীক্ষামূলক অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-tripod-instrument", "/models/artifacts/apollo-11-15.glb", { en: "Tripod-mounted lunar instrument", bn: "ট্রাইপডে স্থাপিত চন্দ্রযন্ত্র" }, { en: "Surface instrument", bn: "পৃষ্ঠের যন্ত্র" }, { en: "A likely tripod-mounted instrument positioned for a stable measurement or observation on the lunar surface.", bn: "চন্দ্রপৃষ্ঠে স্থির পরিমাপ বা পর্যবেক্ষণের জন্য বসানো সম্ভাব্য ট্রাইপড-ভিত্তিক যন্ত্র।" }),
    apollo11Model("apollo-11-surface-experiment-communications", "/models/artifacts/apollo-11-16.glb", { en: "Lunar surface experiment / communications unit", bn: "চন্দ্রপৃষ্ঠ পরীক্ষা / যোগাযোগ ইউনিট" }, { en: "Experiment or communications hardware", bn: "পরীক্ষা বা যোগাযোগ হার্ডওয়্যার" }, { en: "A likely combined experiment or communications unit from the equipment deployed around the Apollo 11 landing site.", bn: "অ্যাপোলো ১১ অবতরণস্থলের চারপাশে স্থাপিত সম্ভাব্য পরীক্ষা বা যোগাযোগ ইউনিট।" }),
    apollo11Model("apollo-11-large-equipment-assembly", "/models/artifacts/apollo-11-17.glb", { en: "Large Apollo lunar-surface equipment assembly", bn: "বড় অ্যাপোলো চন্দ্রপৃষ্ঠ সরঞ্জাম অ্যাসেম্বলি" }, { en: "Surface equipment assembly", bn: "পৃষ্ঠের সরঞ্জাম অ্যাসেম্বলি" }, { en: "A likely large assembly from the collection of hardware left around the Apollo 11 landing site.", bn: "অ্যাপোলো ১১ অবতরণস্থলের চারপাশে রেখে যাওয়া হার্ডওয়্যারের সম্ভাব্য বড় অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-equipment-experiment-assembly", "/models/artifacts/apollo-115.glb", { en: "Apollo lunar equipment / experiment assembly", bn: "অ্যাপোলো চন্দ্র সরঞ্জাম / পরীক্ষা অ্যাসেম্বলি" }, { en: "Surface experiment hardware", bn: "পৃষ্ঠের পরীক্ষা হার্ডওয়্যার" }, { en: "A likely equipment or experiment assembly from the Apollo 11 surface inventory.", bn: "অ্যাপোলো ১১ পৃষ্ঠের তালিকার সম্ভাব্য সরঞ্জাম বা পরীক্ষা অ্যাসেম্বলি।" }),
    apollo11Model("apollo-11-surface-instrument-panel", "/models/artifacts/apollo-116.glb", { en: "Lunar surface instrument / panel", bn: "চন্দ্রপৃষ্ঠ যন্ত্র / প্যানেল" }, { en: "Instrument panel", bn: "যন্ত্র প্যানেল" }, { en: "A likely instrument panel or surface-facing unit from the Apollo 11 equipment set.", bn: "অ্যাপোলো ১১ সরঞ্জাম সেটের সম্ভাব্য যন্ত্র প্যানেল বা পৃষ্ঠমুখী ইউনিট।" }),
    apollo11Model("apollo-11-tripod-equipment", "/models/artifacts/apollo-118.glb", { en: "Tripod-mounted instrument / equipment", bn: "ট্রাইপডে স্থাপিত যন্ত্র / সরঞ্জাম" }, { en: "Surface equipment", bn: "পৃষ্ঠের সরঞ্জাম" }, { en: "A likely tripod-mounted instrument or equipment assembly used during Apollo 11 surface operations.", bn: "অ্যাপোলো ১১ পৃষ্ঠ অভিযানে ব্যবহৃত সম্ভাব্য ট্রাইপড-ভিত্তিক যন্ত্র বা সরঞ্জাম অ্যাসেম্বলি।" }),
];

export const artifactModels: ArtifactModel[] = [
    {
        id: "apollo-12-s-band-antenna",
        file: "/models/artifacts/apollo-12-s-band-antenna.glb",
        name: { en: "Apollo 12 S-band Antenna", bn: "অ্যাপোলো ১২ এস-ব্যান্ড অ্যান্টেনা" },
        mission: { en: "Apollo 12", bn: "অ্যাপোলো ১২" },
        kind: { en: "Communications hardware", bn: "যোগাযোগের হার্ডওয়্যার" },
        description: {
            en: "A large steerable S-band antenna deployed near the Apollo 12 Lunar Module. It carried voice, telemetry, and television signals between the lunar surface and Earth.",
            bn: "অ্যাপোলো ১২ লুনার মডিউলের কাছে স্থাপিত একটি বড় ঘোরানো যায় এমন এস-ব্যান্ড অ্যান্টেনা। এটি চন্দ্রপৃষ্ঠ ও পৃথিবীর মধ্যে কণ্ঠ, টেলিমেট্রি ও টেলিভিশন সংকেত বহন করত।",
        },
        significance: {
            en: "It made the lunar surface a connected scientific workplace rather than an isolated landing site.",
            bn: "এটি চন্দ্রপৃষ্ঠকে বিচ্ছিন্ন অবতরণস্থল নয়, সংযুক্ত বৈজ্ঞানিক কর্মক্ষেত্রে পরিণত করেছিল।",
        },
        sourceLabel: { en: "Apollo 12 mission context", bn: "অ্যাপোলো ১২ অভিযানের তথ্য" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1969-099A",
    },
    {
        id: "surveyor-3-lunar-lander",
        file: "/models/artifacts/surveyor-3-lunar-lander.glb",
        name: { en: "Surveyor 3 Lunar Lander", bn: "সার্ভেয়ার ৩ চন্দ্র ল্যান্ডার" },
        mission: { en: "Surveyor 3", bn: "সার্ভেয়ার ৩" },
        kind: { en: "Robotic lander", bn: "রোবোটিক ল্যান্ডার" },
        description: {
            en: "The unmanned Surveyor 3 spacecraft soft-landed in the Ocean of Storms in April 1967. Apollo 12 astronauts later walked to it, photographed it, and recovered selected components.",
            bn: "মানবহীন সার্ভেয়ার ৩ ১৯৬৭ সালের এপ্রিলে ঝড়ের মহাসাগরে নরম অবতরণ করে। পরে অ্যাপোলো ১২ নভোচারীরা সেখানে হেঁটে যান, ছবি তোলেন এবং কিছু অংশ ফিরিয়ে আনেন।",
        },
        significance: {
            en: "Surveyor 3 became a rare meeting point between a robotic precursor and a later crewed expedition.",
            bn: "সার্ভেয়ার ৩ একটি রোবোটিক পূর্বসূরি ও পরের মানুষবাহী অভিযানের বিরল মিলনস্থল হয়ে ওঠে।",
        },
        sourceLabel: { en: "Surveyor coordinates and mission context", bn: "সার্ভেয়ার স্থানাঙ্ক ও অভিযানের তথ্য" },
        sourceUrl: "https://lroc.im-ldi.com/data/support/downloads/2016_LROC_Coordinates_of_Robotic_Spacecraft.pdf",
    },
    {
        id: "apollo-portable-life-support-system",
        file: "/models/artifacts/apollo-portable-life-support-system.glb",
        name: { en: "Apollo Portable Life Support System (PLSS)", bn: "অ্যাপোলো পোর্টেবল লাইফ সাপোর্ট সিস্টেম (PLSS)" },
        mission: { en: "Apollo surface operations", bn: "অ্যাপোলো পৃষ্ঠ অভিযান" },
        kind: { en: "Crew life-support hardware", bn: "ক্রু লাইফ-সাপোর্ট হার্ডওয়্যার" },
        description: {
            en: "The backpack unit of the Apollo spacesuit supplied breathing oxygen, removed carbon dioxide, circulated cooling water, and carried communications equipment during lunar surface activity.",
            bn: "অ্যাপোলো স্পেসস্যুটের এই ব্যাকপ্যাক চন্দ্রপৃষ্ঠে কাজের সময় শ্বাসের অক্সিজেন সরবরাহ, কার্বন ডাই-অক্সাইড অপসারণ, শীতল জল সঞ্চালন ও যোগাযোগ সরঞ্জাম বহন করত।",
        },
        significance: {
            en: "It was the life-support boundary that allowed astronauts to work outside the Lunar Module for hours at a time.",
            bn: "এটি সেই লাইফ-সাপোর্ট সীমা যা নভোচারীদের লুনার মডিউলের বাইরে ঘণ্টার পর ঘণ্টা কাজ করতে দিয়েছিল।",
        },
        sourceLabel: { en: "Apollo EVA systems context", bn: "অ্যাপোলো EVA সিস্টেমের তথ্য" },
        sourceUrl: "https://www.nasa.gov/history/alsj/alsj-technology.html",
    },
    {
        id: "surveyor-3-lunar-lander-detail",
        file: "/models/artifacts/surveyor-3-lunar-lander-detail.glb",
        name: { en: "Surveyor 3 lunar lander", bn: "সার্ভেয়ার ৩ চন্দ্র ল্যান্ডার" },
        mission: { en: "Surveyor 3", bn: "সার্ভেয়ার ৩" },
        kind: { en: "Robotic lander", bn: "রোবোটিক ল্যান্ডার" },
        description: {
            en: "A second model view of the Surveyor 3 lander, the spacecraft that tested the lunar surface before Apollo 12 arrived nearby.",
            bn: "সার্ভেয়ার ৩ ল্যান্ডারের আরেকটি মডেল ভিউ; অ্যাপোলো ১২ কাছাকাছি আসার আগে এই মহাকাশযান চন্দ্রপৃষ্ঠ পরীক্ষা করেছিল।",
        },
        significance: {
            en: "Its hardware connected robotic reconnaissance, landing-site confidence, and human exploration.",
            bn: "এর হার্ডওয়্যার রোবোটিক অনুসন্ধান, অবতরণস্থলের আস্থা ও মানব অন্বেষণকে যুক্ত করেছিল।",
        },
        sourceLabel: { en: "Surveyor coordinates and mission context", bn: "সার্ভেয়ার স্থানাঙ্ক ও অভিযানের তথ্য" },
        sourceUrl: "https://lroc.im-ldi.com/data/support/downloads/2016_LROC_Coordinates_of_Robotic_Spacecraft.pdf",
    },
    {
        id: "apollo-lunar-surface-television-camera",
        file: "/models/artifacts/apollo-lunar-surface-television-camera.glb",
        name: { en: "Apollo lunar surface television camera", bn: "অ্যাপোলো চন্দ্রপৃষ্ঠ টেলিভিশন ক্যামেরা" },
        mission: { en: "Apollo 12 / Surveyor 3", bn: "অ্যাপোলো ১২ / সার্ভেয়ার ৩" },
        kind: { en: "Surface imaging hardware", bn: "পৃষ্ঠের ছবি তোলার হার্ডওয়্যার" },
        description: {
            en: "A television camera used to transmit live lunar surface activity. Apollo 12 also removed Surveyor 3's camera for examination on Earth; this local model is identified as an Apollo lunar surface television camera.",
            bn: "চন্দ্রপৃষ্ঠের কাজ সরাসরি পৃথিবীতে পাঠাতে ব্যবহৃত একটি টেলিভিশন ক্যামেরা। অ্যাপোলো ১২ সার্ভেয়ার ৩-এর ক্যামেরাও পরীক্ষা করার জন্য পৃথিবীতে নিয়ে আসে; এই স্থানীয় মডেলটি অ্যাপোলো চন্দ্রপৃষ্ঠ টেলিভিশন ক্যামেরা হিসেবে চিহ্নিত।",
        },
        significance: {
            en: "The camera turned a remote expedition into a shared human event and preserved a visual record of work on another world.",
            bn: "ক্যামেরাটি দূরবর্তী অভিযানকে সবার দেখা মানবিক ঘটনায় পরিণত করে এবং অন্য জগতে কাজের দৃশ্যমান নথি সংরক্ষণ করে।",
        },
        sourceLabel: { en: "Apollo and Surveyor mission context", bn: "অ্যাপোলো ও সার্ভেয়ার অভিযানের তথ্য" },
        sourceUrl: "https://www.nasa.gov/history/alsj/alsj-survey.html",
    },
    ...apollo11Models,
];
