import type { Localized } from "../types/catalog";

export type ArtifactModel = {
    id: string;
    file: string;
    /** Exhibit group in the Hall of Relics. */
    group: string;
    /** Catalog objects this hardware is associated with. Not a claim that the scan is that exact object. */
    objectIds: string[];
    name: Localized;
    mission: Localized;
    kind: Localized;
    description: Localized;
    significance: Localized;
    sourceLabel: Localized;
    sourceUrl: string;
    /** Marks a single piece whose identification is provisional, even when its group is not. */
    provisional?: boolean;
};

export type RelicGroup = {
    id: string;
    title: Localized;
    tagline: Localized;
    blurb: Localized;
    /** Marks groups whose identifications are provisional. */
    provisional?: boolean;
};

export const relicGroups: RelicGroup[] = [
    {
        id: "apollo-12-antenna",
        title: { en: "The voice from the Ocean of Storms", bn: "ঝড়ের মহাসাগর থেকে আসা কণ্ঠ" },
        tagline: { en: "Apollo 12 S-band antenna · 1969", bn: "অ্যাপোলো ১২ এস-ব্যান্ড অ্যান্টেনা · ১৯৬৯" },
        blurb: {
            en: "An umbrella of gold mesh, unfolded by hand and pointed at a blue dot in the black sky. Every word the Apollo 12 crew spoke from the surface passed through this dish.",
            bn: "সোনালি জালের একটি ছাতা, হাতে খুলে কালো আকাশের নীল বিন্দুর দিকে তাক করা। অ্যাপোলো ১২-এর নভোচারীরা পৃষ্ঠ থেকে যা-ই বলেছেন, সব এই ডিশের মধ্য দিয়ে গেছে।",
        },
    },
    {
        id: "surveyor-3",
        title: { en: "The robot that waited for visitors", bn: "যে রোবট অতিথির অপেক্ষায় ছিল" },
        tagline: { en: "Surveyor 3 lander · 1967", bn: "সার্ভেয়ার ৩ ল্যান্ডার · ১৯৬৭" },
        blurb: {
            en: "It bounced twice on landing, dug a trench, sent back 6,000 pictures and fell silent. Two and a half years later, two astronauts walked up to it. It is still the only abandoned spacecraft anyone has ever visited.",
            bn: "অবতরণে এটি দু'বার লাফিয়ে ওঠে, একটি খাদ খোঁড়ে, ৬,০০০ ছবি পাঠায় এবং নীরব হয়ে যায়। আড়াই বছর পর দুই নভোচারী হেঁটে এর কাছে আসেন। এটিই এখনও একমাত্র পরিত্যক্ত মহাকাশযান, যেখানে কেউ গিয়েছে।",
        },
    },
    {
        id: "tv-camera",
        title: { en: "The eye that was brought home", bn: "যে চোখ ঘরে ফিরিয়ে আনা হয়েছিল" },
        tagline: { en: "Lunar surface television camera", bn: "চন্দ্রপৃষ্ঠ টেলিভিশন ক্যামেরা" },
        blurb: {
            en: "Cameras like this turned a landing into something six hundred million people watched together. Apollo 12 cut one from Surveyor 3 and carried it back, so engineers could learn what thirty months on the Moon does to a machine.",
            bn: "এমন ক্যামেরাই একটি অবতরণকে ষাট কোটি মানুষের একসঙ্গে দেখা ঘটনায় পরিণত করেছিল। অ্যাপোলো ১২ সার্ভেয়ার ৩ থেকে একটি কেটে নিয়ে ফিরিয়ে আনে, যাতে প্রকৌশলীরা জানতে পারেন চাঁদে তিরিশ মাস একটি যন্ত্রের কী করে।",
        },
    },
    {
        id: "plss",
        title: { en: "A room you could wear", bn: "একটি ঘর, যা পরা যেত" },
        tagline: { en: "Apollo Portable Life Support System", bn: "অ্যাপোলো পোর্টেবল লাইফ সাপোর্ট সিস্টেম" },
        blurb: {
            en: "Oxygen, cooling water, radio, and a few hours of life in a backpack. Twelve of them were thrown out of lunar modules to save weight before lift-off. They are all still there.",
            bn: "অক্সিজেন, শীতল জল, রেডিও আর একটি ব্যাকপ্যাকে কয়েক ঘণ্টার জীবন। উড্ডয়নের আগে ওজন কমাতে বারোটি লুনার মডিউল থেকে ছুড়ে ফেলা হয়। সবগুলো এখনও সেখানেই আছে।",
        },
    },
    {
        id: "apollo-11-inventory",
        title: { en: "What Eagle left at Tranquility Base", bn: "ঈগল প্রশান্তি ঘাঁটিতে যা রেখে গিয়েছিল" },
        tagline: { en: "Apollo 11 surface inventory · 16 pieces", bn: "অ্যাপোলো ১১ পৃষ্ঠের তালিকা · ১৬টি অংশ" },
        blurb: {
            en: "Two people, two and a half hours outside, and more than a hundred objects left behind: tools, experiments, cameras, boots, a flag. These sixteen scans come from that inventory. Their exact identities are provisional.",
            bn: "দুজন মানুষ, বাইরে আড়াই ঘণ্টা, আর শতাধিক জিনিস ফেলে আসা: যন্ত্রপাতি, পরীক্ষা, ক্যামেরা, জুতো, একটি পতাকা। এই ষোলোটি স্ক্যান সেই তালিকা থেকে। এদের নির্দিষ্ট পরিচয় অনিশ্চিত।",
        },
        provisional: true,
    },
    {
        id: "apollo-14-antares",
        title: { en: "The rickshaw and the ion counter", bn: "রিকশা আর আয়ন গণক" },
        tagline: { en: "Apollo 14 at Fra Mauro · 1971", bn: "ফ্রা মাউরোতে অ্যাপোলো ১৪ · ১৯৭১" },
        blurb: {
            en: "Shepard and Mitchell pulled a two-wheeled cart across the hills Apollo 13 never reached, and left behind a station that listened for ions in the thin lunar sky. Both are still at Fra Mauro, a short walk from the descent stage of Antares.",
            bn: "শেপার্ড ও মিচেল অ্যাপোলো ১৩-এর না-পৌঁছানো পাহাড়ে একটি দুই চাকার গাড়ি টেনে নিয়ে যান, আর রেখে যান এমন একটি কেন্দ্র যা পাতলা চন্দ্র-আকাশে আয়নের খোঁজ করত। দুটোই এখনও ফ্রা মাউরোতে, অ্যান্টারেসের অবতরণ স্তর থেকে অল্প দূরে।",
        },
    },
    {
        id: "luna-16",
        title: { en: "The robot that brought soil home", bn: "যে রোবট মাটি ঘরে এনেছিল" },
        tagline: { en: "Luna 16 · Mare Fecunditatis · 1970", bn: "লুনা ১৬ · উর্বরতার সাগর · ১৯৭০" },
        blurb: {
            en: "No crew, no rover, no flag. Luna 16 landed in the dark of the lunar night, drilled 35 centimetres into the Sea of Fertility, and a day later fired 101 grams of it back to Earth. The drilling platform never left.",
            bn: "কোনো নভোচারী নেই, রোভার নেই, পতাকা নেই। লুনা ১৬ চন্দ্র-রাতের অন্ধকারে নামে, উর্বরতার সাগরে ৩৫ সেন্টিমিটার খোঁড়ে, আর একদিন পর তার ১০১ গ্রাম পৃথিবীতে ছুড়ে পাঠায়। খননের মঞ্চ কখনও ফেরেনি।",
        },
    },
    {
        id: "lunokhod-1",
        title: { en: "The first wheels on another world", bn: "অন্য জগতে প্রথম চাকা" },
        tagline: { en: "Lunokhod 1 · Luna 17 · 1970", bn: "লুনোখোদ ১ · লুনা ১৭ · ১৯৭০" },
        blurb: {
            en: "A bathtub on eight wheels, driven from Crimea by people watching a television picture that was already seconds old. Built for three lunar days, it rolled for eleven, went silent, and was lost for nearly forty years until a laser from New Mexico found its French mirror.",
            bn: "আট চাকার ওপর একটি বাথটাব, ক্রিমিয়া থেকে মানুষ চালাতেন কয়েক সেকেন্ড পুরোনো টেলিভিশন ছবি দেখে। তিন চন্দ্রদিনের জন্য তৈরি, এটি চলে এগারো দিন, নীরব হয়, আর প্রায় চল্লিশ বছর হারিয়ে থাকে যতক্ষণ না নিউ মেক্সিকোর একটি লেজার এর ফরাসি আয়না খুঁজে পায়।",
        },
    },
];

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
        group: "apollo-11-inventory",
        objectIds: ["apollo-11-descent-stage", "apollo-11-easep"],
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

const apollo14Models: ArtifactModel[] = [
    {
        id: "apollo-14-modular-equipment-transporter",
        file: "/models/artifacts/apollo-14-modular-equipment-transporter.glb",
        group: "apollo-14-antares",
        objectIds: ["apollo-14-descent-stage", "apollo-14-alsep"],
        name: { en: "Modular Equipment Transporter (MET)", bn: "মডুলার ইকুইপমেন্ট ট্রান্সপোর্টার (MET)" },
        mission: { en: "Apollo 14", bn: "অ্যাপোলো ১৪" },
        kind: { en: "Hand-pulled equipment cart", bn: "হাতে টানা সরঞ্জামের গাড়ি" },
        description: {
            en: "A two-wheeled cart of about 14 kilograms, pulled by hand across Fra Mauro on both Apollo 14 moonwalks. It carried cameras, tools, sample bags, and a magnetometer so the crew's hands stayed free. Its two nitrogen-filled rubber tyres were the first tyres on the Moon. The astronauts called it the rickshaw.",
            bn: "প্রায় ১৪ কিলোগ্রামের দুই চাকার একটি গাড়ি, অ্যাপোলো ১৪-এর দুটি চন্দ্রভ্রমণেই ফ্রা মাউরো জুড়ে হাতে টেনে নেওয়া। এতে ক্যামেরা, যন্ত্রপাতি, নমুনার ব্যাগ ও একটি ম্যাগনেটোমিটার থাকত, যাতে নভোচারীদের হাত খালি থাকে। এর নাইট্রোজেন-ভরা দুটি রবারের টায়ারই চাঁদের প্রথম টায়ার। নভোচারীরা একে বলতেন রিকশা।",
        },
        significance: {
            en: "The only hand cart ever used on the Moon. The rough ground was hard on it, and at times the crew simply carried it. On the next mission the cart was replaced by a car.",
            bn: "চাঁদে ব্যবহৃত একমাত্র হাতগাড়ি। এবড়োখেবড়ো মাটি এর জন্য কঠিন ছিল, মাঝে মাঝে নভোচারীরা একে তুলেই বয়ে নিতেন। পরের অভিযানেই গাড়িটির জায়গা নেয় একটি মোটরগাড়ি।",
        },
        sourceLabel: { en: "NSSDC: Apollo 14 Lunar Module and surface traverse", bn: "NSSDC: অ্যাপোলো ১৪ লুনার মডিউল ও পৃষ্ঠ-ভ্রমণ" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1971-008C",
    },
    {
        id: "apollo-14-suprathermal-ion-detector",
        file: "/models/artifacts/apollo-14-suprathermal-ion-detector.glb",
        group: "apollo-14-antares",
        objectIds: ["apollo-14-alsep", "apollo-14-descent-stage"],
        name: { en: "Suprathermal Ion Detector Experiment (SIDE)", bn: "সুপ্রাথার্মাল আয়ন ডিটেক্টর এক্সপেরিমেন্ট (SIDE)" },
        mission: { en: "Apollo 14 ALSEP", bn: "অ্যাপোলো ১৪ ALSEP" },
        kind: { en: "Surface science instrument", bn: "পৃষ্ঠের বিজ্ঞান যন্ত্র" },
        description: {
            en: "An 8.5-kilogram detector from the Apollo 14 science station, set on a ground screen about 16 metres from the central station. It counted the charged particles arriving at the surface, mapping the Moon's barely-there ionosphere and the solar wind. Versions flew on Apollo 12, 14, and 15. The scan arrived under this label; the flight unit was box-shaped, so the identification is provisional.",
            bn: "অ্যাপোলো ১৪ বিজ্ঞান কেন্দ্রের ৮.৫ কিলোগ্রামের একটি ডিটেক্টর, কেন্দ্রীয় স্টেশন থেকে প্রায় ১৬ মিটার দূরে একটি গ্রাউন্ড স্ক্রিনে বসানো। এটি পৃষ্ঠে পৌঁছানো আধানযুক্ত কণা গণনা করে চাঁদের প্রায়-নেই আয়নমণ্ডল ও সৌরবায়ুর মানচিত্র করত। এর সংস্করণ অ্যাপোলো ১২, ১৪ ও ১৫-এ গিয়েছিল। স্ক্যানটি এই নামে এসেছে; আসল যন্ত্রটি বাক্স-আকৃতির ছিল, তাই পরিচয় অনিশ্চিত।",
        },
        significance: {
            en: "It watched ion clouds rise from meteorite impacts and caught a solar flare in August 1972. A fault silenced it in February 1976, a year and a half before the rest of the ALSEP network was switched off from Earth.",
            bn: "এটি উল্কাপাতের পর আয়নের মেঘ উঠতে দেখেছে, আর ১৯৭২-এর আগস্টে একটি সৌরঝড় ধরেছে। ১৯৭৬-এর ফেব্রুয়ারিতে একটি ত্রুটি একে নীরব করে, বাকি ALSEP নেটওয়ার্ক পৃথিবী থেকে বন্ধ করার দেড় বছর আগে।",
        },
        sourceLabel: { en: "NSSDC: Apollo 14 Suprathermal Ion Detector", bn: "NSSDC: অ্যাপোলো ১৪ সুপ্রাথার্মাল আয়ন ডিটেক্টর" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/experiment/display.action?id=1971-008C-06",
        provisional: true,
    },
];

const luna16Models: ArtifactModel[] = [
    {
        id: "luna-16-lander",
        file: "/models/artifacts/luna-16-lander.glb",
        group: "luna-16",
        objectIds: ["luna-16-descent-stage", "luna-24-descent-stage"],
        name: { en: "Luna 16 sample-return lander", bn: "লুনা ১৬ নমুনা-প্রত্যাবর্তন ল্যান্ডার" },
        mission: { en: "Luna 16", bn: "লুনা ১৬" },
        kind: { en: "Robotic sample-return spacecraft", bn: "রোবোটিক নমুনা-প্রত্যাবর্তন মহাকাশযান" },
        description: {
            en: "The full stack as it stood on 20 September 1970: four legs, spherical tanks, a drill arm, and the ascent stage with its round return capsule on top, nearly four metres tall. Only the lower half is still on the Moon. After 26 hours on the surface the ascent stage lifted off with 101 grams of soil and landed in Kazakhstan on 24 September.",
            bn: "১৯৭০-এর ২০ সেপ্টেম্বর যেমন দাঁড়িয়ে ছিল তেমনই পুরো কাঠামো: চারটি পা, গোলাকার ট্যাংক, একটি ড্রিল বাহু, আর ওপরে গোল প্রত্যাবর্তন ক্যাপসুলসহ আরোহণ স্তর, প্রায় চার মিটার উঁচু। শুধু নিচের অর্ধেক এখনও চাঁদে। পৃষ্ঠে ২৬ ঘণ্টা পর আরোহণ স্তর ১০১ গ্রাম মাটি নিয়ে উড়ে যায় এবং ২৪ সেপ্টেম্বর কাজাখস্তানে নামে।",
        },
        significance: {
            en: "The first robot to land on another world and bring part of it back. The descent stage kept reporting temperature and radiation from Mare Fecunditatis after its other half had gone.",
            bn: "অন্য জগতে নেমে তার একটি অংশ ফিরিয়ে আনা প্রথম রোবট। অন্য অর্ধেক চলে যাওয়ার পরও অবতরণ স্তর উর্বরতার সাগর থেকে তাপমাত্রা ও বিকিরণের খবর পাঠাতে থাকে।",
        },
        sourceLabel: { en: "NSSDC: Luna 16", bn: "NSSDC: লুনা ১৬" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-072A",
    },
];

function lunokhodRoverView(id: string, file: string, name: Localized, detail: Localized): ArtifactModel {
    return {
        id,
        file,
        group: "lunokhod-1",
        objectIds: ["lunokhod-1", "luna-17-lander", "lunokhod-2"],
        name,
        mission: { en: "Lunokhod programme", bn: "লুনোখোদ কর্মসূচি" },
        kind: { en: "Remote-controlled rover", bn: "দূরনিয়ন্ত্রিত রোভার" },
        description: {
            en: `${detail.en} This scan was supplied in the Luna 16 folder, but Luna 16 carried no rover; the hull, lid, and eight wheels are those of a Lunokhod. Whether it depicts Lunokhod 1 or its near-identical sibling Lunokhod 2 is not asserted.`,
            bn: `${detail.bn} এই স্ক্যানটি লুনা ১৬ ফোল্ডারে এসেছিল, কিন্তু লুনা ১৬-এ কোনো রোভার ছিল না; এর খোল, ঢাকনা ও আট চাকা লুনোখোদের। এটি লুনোখোদ ১ না তার প্রায়-অভিন্ন ভাই লুনোখোদ ২, তা নিশ্চিত করা হচ্ছে না।`,
        },
        significance: {
            en: "Two Lunokhods reached the Moon, in 1970 and 1973. Between them they drove more than 40 kilometres, a record for a wheeled vehicle on another world that stood until 2014.",
            bn: "দুটি লুনোখোদ চাঁদে পৌঁছেছিল, ১৯৭০ ও ১৯৭৩-এ। দুটি মিলে ৪০ কিলোমিটারের বেশি চলেছিল, অন্য জগতে চাকাযুক্ত যানের এই রেকর্ড ২০১৪ পর্যন্ত টিকে ছিল।",
        },
        sourceLabel: { en: "NSSDC: Luna 17 / Lunokhod 1", bn: "NSSDC: লুনা ১৭ / লুনোখোদ ১" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A",
        provisional: true,
    };
}

const lunokhod1Models: ArtifactModel[] = [
    {
        id: "lunokhod-1-rover",
        file: "/models/artifacts/lunokhod-1-rover.glb",
        group: "lunokhod-1",
        objectIds: ["lunokhod-1", "luna-17-lander"],
        name: { en: "Lunokhod 1 rover", bn: "লুনোখোদ ১ রোভার" },
        mission: { en: "Luna 17 / Lunokhod 1", bn: "লুনা ১৭ / লুনোখোদ ১" },
        kind: { en: "Remote-controlled rover", bn: "দূরনিয়ন্ত্রিত রোভার" },
        description: {
            en: "A tub-shaped rover on eight independently driven wheels, 1.35 metres tall, with a hinged lid that opened each lunar morning to charge its batteries from a solar panel and closed at night over a polonium heater. It rolled down twin ramps from Luna 17 on 17 November 1970 and drove 10,540 metres across Mare Imbrium, sending back more than 20,000 television pictures.",
            bn: "আটটি স্বাধীনভাবে চালিত চাকার ওপর একটি টাব-আকৃতির রোভার, ১.৩৫ মিটার উঁচু, যার কব্জাযুক্ত ঢাকনা প্রতি চন্দ্র-সকালে খুলে সৌর প্যানেল থেকে ব্যাটারি চার্জ করত আর রাতে একটি পোলোনিয়াম হিটারের ওপর বন্ধ হত। ১৯৭০-এর ১৭ নভেম্বর এটি লুনা ১৭-এর জোড়া র‍্যাম্প বেয়ে নামে এবং বৃষ্টির সাগরে ১০,৫৪০ মিটার চলে, ২০,০০০-এর বেশি টেলিভিশন ছবি পাঠায়।",
        },
        significance: {
            en: "The first wheeled vehicle to drive on another world. Built for three lunar days, it worked for eleven. Its last session was on 14 September 1971.",
            bn: "অন্য জগতে চলা প্রথম চাকাযুক্ত যান। তিন চন্দ্রদিনের জন্য তৈরি, এটি কাজ করেছে এগারো দিন। এর শেষ অধিবেশন ছিল ১৯৭১-এর ১৪ সেপ্টেম্বর।",
        },
        sourceLabel: { en: "NSSDC: Luna 17 / Lunokhod 1", bn: "NSSDC: লুনা ১৭ / লুনোখোদ ১" },
        sourceUrl: "https://nssdc.gsfc.nasa.gov/nmc/spacecraft/display.action?id=1970-095A",
    },
    lunokhodRoverView("lunokhod-rover-2", "/models/artifacts/lunokhod-rover-2.glb", { en: "Lunokhod rover · lid open", bn: "লুনোখোদ রোভার · ঢাকনা খোলা" }, {
        en: "A Lunokhod with its lid raised and the solar panel facing the Sun, as it would have stood through a lunar day, with the cone-shaped antenna and twin cameras at the front.",
        bn: "ঢাকনা তোলা ও সৌর প্যানেল সূর্যমুখী একটি লুনোখোদ, চন্দ্রদিনে যেমন দাঁড়িয়ে থাকত, সামনে শঙ্কু-আকৃতির অ্যান্টেনা ও জোড়া ক্যামেরাসহ।",
    }),
    lunokhodRoverView("lunokhod-rover-3", "/models/artifacts/lunokhod-rover-3.glb", { en: "Lunokhod rover · lid half closed", bn: "লুনোখোদ রোভার · ঢাকনা অর্ধেক বন্ধ" }, {
        en: "A Lunokhod with its lid tilted part-way closed, the position it took as the two-week lunar night approached and the rover went to sleep.",
        bn: "ঢাকনা আংশিক বন্ধ অবস্থায় হেলানো একটি লুনোখোদ, দুই সপ্তাহের চন্দ্ররাত এগিয়ে এলে রোভার ঘুমোতে যাওয়ার সময় যে অবস্থান নিত।",
    }),
    {
        id: "lunokhod-1-laser-retroreflector",
        file: "/models/artifacts/lunokhod-1-laser-retroreflector.glb",
        group: "lunokhod-1",
        objectIds: ["lunokhod-1", "lunokhod-2"],
        name: { en: "French laser retroreflector (TL1)", bn: "ফরাসি লেজার রেট্রোরিফ্লেক্টর (TL1)" },
        mission: { en: "Lunokhod 1", bn: "লুনোখোদ ১" },
        kind: { en: "Laser-ranging mirror array", bn: "লেজার-রেঞ্জিং আয়না অ্যারে" },
        description: {
            en: "A French-built array of fourteen glass corner-cubes, each 11 centimetres across, mounted on the front of Lunokhod 1. Fire a laser at it from Earth and a handful of photons come straight back, timing the distance to the Moon. The scan arrived labelled Luna 16, which carried no reflector; this hardware belongs to Lunokhod 1. The flight array was triangular, so the panel shown here is a provisional match.",
            bn: "ফ্রান্সে তৈরি চৌদ্দটি কাচের কর্নার-কিউবের একটি অ্যারে, প্রতিটি ১১ সেন্টিমিটার চওড়া, লুনোখোদ ১-এর সামনে লাগানো। পৃথিবী থেকে এতে লেজার ছুড়লে মুঠোভর ফোটন সোজা ফিরে আসে, চাঁদের দূরত্ব মেপে দেয়। স্ক্যানটি লুনা ১৬ নামে এসেছিল, যাতে কোনো প্রতিফলক ছিল না; এই হার্ডওয়্যার লুনোখোদ ১-এর। আসল অ্যারেটি ত্রিভুজাকার ছিল, তাই এখানে দেখানো প্যানেলটি অনিশ্চিত মিল।",
        },
        significance: {
            en: "Lost for nearly forty years. On 17 March 2010 LRO photographed the rover; on 22 April the APOLLO team at Apache Point, New Mexico, aimed a laser at that spot and the mirror answered, brighter than anyone expected.",
            bn: "প্রায় চল্লিশ বছর হারিয়ে ছিল। ২০১০-এর ১৭ মার্চ এলআরও রোভারের ছবি তোলে; ২২ এপ্রিল নিউ মেক্সিকোর অ্যাপাচি পয়েন্টে APOLLO দল সেই জায়গায় লেজার তাক করে, আর আয়না সাড়া দেয়, প্রত্যাশার চেয়ে উজ্জ্বল হয়ে।",
        },
        sourceLabel: { en: "APOLLO lunar laser ranging: retroreflectors", bn: "APOLLO চন্দ্র লেজার রেঞ্জিং: রেট্রোরিফ্লেক্টর" },
        sourceUrl: "https://tmurphy.physics.ucsd.edu/apollo/lrrr.html",
        provisional: true,
    },
    {
        id: "lunokhod-1-control-console",
        file: "/models/artifacts/lunokhod-1-control-console.glb",
        group: "lunokhod-1",
        objectIds: ["lunokhod-1"],
        name: { en: "Lunokhod driver's control console", bn: "লুনোখোদ চালকের নিয়ন্ত্রণ কনসোল" },
        mission: { en: "Lunokhod 1 ground control", bn: "লুনোখোদ ১ ভূ-নিয়ন্ত্রণ" },
        kind: { en: "Earth-side control hardware", bn: "পৃথিবীর নিয়ন্ত্রণ হার্ডওয়্যার" },
        description: {
            en: "The one piece in this hall that never left Earth. From the NIP-10 station at Shkolnoye near Simferopol in Crimea, a crew of driver, navigator, commander, engineer, and antenna operator steered Lunokhod 1 from consoles like this, watching a television frame that was already seconds old. They trained on a one-hectare practice moonscape dug beside the station.",
            bn: "এই হলের একমাত্র জিনিস যা কখনও পৃথিবী ছাড়েনি। ক্রিমিয়ার সিমফেরোপোলের কাছে শকোলনোয়ের NIP-10 স্টেশন থেকে চালক, নাবিক, কমান্ডার, প্রকৌশলী ও অ্যান্টেনা অপারেটরের দল এমন কনসোল থেকে লুনোখোদ ১ চালাতেন, কয়েক সেকেন্ড পুরোনো টেলিভিশন ফ্রেম দেখে। স্টেশনের পাশে খোঁড়া এক হেক্টরের একটি অনুশীলন-চন্দ্রভূমিতে তাঁরা প্রশিক্ষণ নিতেন।",
        },
        significance: {
            en: "Light takes about two and a half seconds to reach the Moon and come back. Every picture the drivers saw was already history, so they learned to steer into the past.",
            bn: "আলো চাঁদে পৌঁছে ফিরে আসতে প্রায় আড়াই সেকেন্ড নেয়। চালকরা যা দেখতেন তা ইতিমধ্যেই অতীত, তাই তাঁরা অতীতের দিকে স্টিয়ারিং ঘোরাতে শিখেছিলেন।",
        },
        sourceLabel: { en: "Lunokhod programme and ground control", bn: "লুনোখোদ কর্মসূচি ও ভূ-নিয়ন্ত্রণ" },
        sourceUrl: "https://en.wikipedia.org/wiki/Lunokhod_programme",
    },
];

export const artifactModels: ArtifactModel[] = [
    {
        id: "apollo-12-s-band-antenna",
        file: "/models/artifacts/apollo-12-s-band-antenna.glb",
        group: "apollo-12-antenna",
        objectIds: ["apollo-12-descent-stage"],
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
        group: "surveyor-3",
        objectIds: ["surveyor-3", "surveyor-1", "surveyor-7"],
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
        group: "plss",
        objectIds: ["apollo-11-descent-stage", "apollo-12-descent-stage", "apollo-14-descent-stage", "apollo-15-descent-stage", "apollo-16-descent-stage", "apollo-17-descent-stage"],
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
        group: "surveyor-3",
        objectIds: ["surveyor-3", "surveyor-1", "surveyor-7"],
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
        group: "tv-camera",
        objectIds: ["surveyor-3", "apollo-12-descent-stage"],
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
    ...apollo14Models,
    ...luna16Models,
    ...lunokhod1Models,
];

/** Relics that materialise in turn inside the landing-page vitrine. Order is the display order. */
export const LANDING_RELIC_IDS = ["apollo-12-s-band-antenna", "lunokhod-1-rover", "luna-16-lander", "apollo-14-modular-equipment-transporter", "surveyor-3-lunar-lander"];

export function landingRelics(): ArtifactModel[] {
    return LANDING_RELIC_IDS.map((id) => artifactModels.find((model) => model.id === id)).filter((model): model is ArtifactModel => Boolean(model));
}

export function modelsInGroup(groupId: string): ArtifactModel[] {
    return artifactModels.filter((model) => model.group === groupId);
}

export function modelsForObject(objectId: string): ArtifactModel[] {
    return artifactModels.filter((model) => model.objectIds.includes(objectId));
}

export function groupOf(model: ArtifactModel): RelicGroup | undefined {
    return relicGroups.find((group) => group.id === model.group);
}
