import { artifactModels } from "./artifactModels";
import { catalog } from "./catalog";
import { storyImages } from "./storyImages";
import type { StoryCatalog } from "../lib/storyMode";
import { validatePlanetStory, type PlanetStory, type StoryPlanet } from "../lib/planetStory";

/**
 * Scripts for "Two Worlds. Two Stories." Each planet has its own seven-panel horizontal
 * journey. The panels name which NASA missions, artifacts, events, and archive
 * photographs appear and add the narrative thread between them. Every fact a panel
 * displays (dates, coordinates, status, credits) is read from the catalog at render time.
 */

export const planetStoryCatalog: StoryCatalog = {
  missions: catalog.missions,
  objects: catalog.objects,
  sources: catalog.sources,
  events: catalog.events,
  models: artifactModels,
  images: storyImages,
};

export const moonStory: PlanetStory = {
  planet: "moon",
  label: { en: "Moon", bn: "চাঁদ" },
  title: { en: "Echoes of the First Footsteps", bn: "প্রথম পদচিহ্নের প্রতিধ্বনি" },
  subtitle: { en: "Every footprint tells a story. Every machine leaves a legacy.", bn: "প্রতিটি পদচিহ্ন একটি গল্প বলে। প্রতিটি যন্ত্র রেখে যায় এক উত্তরাধিকার।" },
  description: {
    en: "Before humanity dreamed of distant worlds, it looked toward the Moon. From the earliest robotic explorers to the Apollo missions, every journey left behind a story written in dust, engineering, and silence.",
    bn: "দূরের জগতের স্বপ্ন দেখার আগে মানুষ তাকিয়েছিল চাঁদের দিকে। প্রথম রোবট অভিযাত্রী থেকে অ্যাপোলো অভিযান পর্যন্ত, প্রতিটি যাত্রা রেখে গেছে ধুলো, প্রকৌশল আর নীরবতায় লেখা এক গল্প।",
  },
  cta: { en: "Explore the Moon Story", bn: "চাঁদের গল্প দেখুন" },
  posterImageId: "aldrin-on-moon",
  theme: {
    accent: "#e6e9f2",
    accentSoft: "#aeb8cc",
    bg: "#0a0d14",
    bgDeep: "#030408",
    glowA: "rgba(174,184,204,0.22)",
    glowB: "rgba(61,90,150,0.18)",
    paper: "#c9d1e0",
    disc: "moon",
    dust: false,
  },
  panels: [
    {
      id: "moon-distant-world",
      layout: "intro",
      animationPreset: "lunar-rise",
      imageId: "earthrise",
      kicker: { en: "Section 01 · The Distant World", bn: "পর্ব ০১ · দূরের জগৎ" },
      title: { en: "The Distant World", bn: "দূরের জগৎ" },
      narrative: [
        { en: "For generations, the Moon remained a distant world visible only in the night sky.", bn: "প্রজন্মের পর প্রজন্ম ধরে চাঁদ ছিল এক দূরের জগৎ, যা কেবল রাতের আকাশে দেখা যেত।" },
        { en: "Eventually, humanity began sending machines toward it. The journey was difficult: early spacecraft had to survive launch, navigate across a quarter of a million miles, keep talking to Earth, and arrive at another celestial body in one piece.", bn: "একসময় মানুষ সেদিকে যন্ত্র পাঠাতে শুরু করল। যাত্রাটি ছিল কঠিন: প্রথম দিকের মহাকাশযানকে উৎক্ষেপণ সামলাতে হতো, লক্ষ লক্ষ কিলোমিটার পথ খুঁজে নিতে হতো, পৃথিবীর সঙ্গে যোগাযোগ রাখতে হতো, আর অক্ষত অবস্থায় অন্য এক জ্যোতিষ্কে পৌঁছাতে হতো।" },
        { en: "This was the beginning of a new era.", bn: "এটাই ছিল এক নতুন যুগের সূচনা।" },
      ],
    },
    {
      id: "moon-first-arrivals",
      layout: "missions",
      animationPreset: "arrivals",
      imageId: "surveyor-3-apollo-12",
      kicker: { en: "Section 02 · The First Arrivals", bn: "পর্ব ০২ · প্রথম আগমন" },
      title: { en: "The First Arrivals", bn: "প্রথম আগমন" },
      narrative: [
        { en: "Humanity was learning how to reach the Moon, survive the journey, and understand its surface. Nobody yet knew whether the ground would hold a spacecraft, or swallow it.", bn: "মানুষ তখন শিখছিল কীভাবে চাঁদে পৌঁছাতে হয়, যাত্রায় টিকে থাকতে হয়, আর এর পৃষ্ঠকে বুঝতে হয়। কেউ জানত না মাটি একটি মহাকাশযানকে ধরে রাখবে, না গিলে ফেলবে।" },
        { en: "NASA's Surveyor landers answered that question one touchdown at a time. Each mission settled a doubt and raised a new engineering challenge for the next.", bn: "নাসার সার্ভেয়ার ল্যান্ডারগুলো এক একটি অবতরণে সেই প্রশ্নের উত্তর দিল। প্রতিটি অভিযান একটি সংশয় মেটাল, আর পরেরটির জন্য নতুন প্রকৌশল-চ্যালেঞ্জ তুলে ধরল।" },
      ],
      beats: [
        {
          missionId: "surveyor-1",
          note: { en: "The first United States soft landing. It proved a spacecraft could set down gently and photograph the ground beneath it.", bn: "যুক্তরাষ্ট্রের প্রথম নরম অবতরণ। এটি প্রমাণ করল একটি মহাকাশযান আলতো করে নামতে পারে এবং নিচের মাটির ছবি তুলতে পারে।" },
        },
        {
          missionId: "surveyor-3",
          imageId: "surveyor-3-apollo-12",
          note: { en: "It dug into the soil with a robotic arm. Two and a half years later, Apollo 12 astronauts walked up to it, the only abandoned spacecraft people have ever visited.", bn: "এটি রোবট বাহু দিয়ে মাটি খুঁড়ল। আড়াই বছর পর অ্যাপোলো ১২-এর নভোচারীরা হেঁটে এর কাছে গেলেন, একমাত্র পরিত্যক্ত মহাকাশযান যেখানে মানুষ গিয়েছে।" },
        },
        {
          missionId: "surveyor-7",
          note: { en: "The last Surveyor landed on the rugged rim of Tycho crater, showing that the highlands, not just the plains, were within reach.", bn: "শেষ সার্ভেয়ার নামল টাইকো গহ্বরের এবড়োখেবড়ো কিনারে, দেখাল শুধু সমভূমি নয়, উচ্চভূমিও নাগালের মধ্যে।" },
        },
      ],
    },
    {
      id: "moon-one-giant-leap",
      layout: "missions",
      animationPreset: "apollo",
      kicker: { en: "Section 03 · One Giant Leap", bn: "পর্ব ০৩ · এক বিশাল লাফ" },
      title: { en: "One Giant Leap", bn: "এক বিশাল লাফ" },
      narrative: [
        { en: "Humanity moved from robotic exploration to human presence on the lunar surface.", bn: "মানুষ রোবট অভিযান থেকে এগিয়ে গেল চন্দ্রপৃষ্ঠে সশরীরে উপস্থিতিতে।" },
        { en: "Between 1969 and 1972, six Apollo crews landed. Each mission combined engineering, navigation, field science, and personal courage, and each stayed a little longer, travelled a little farther, and left a little more behind.", bn: "১৯৬৯ থেকে ১৯৭২-এর মধ্যে ছয়টি অ্যাপোলো দল অবতরণ করল। প্রতিটি অভিযানে মিশে ছিল প্রকৌশল, দিকনির্ণয়, মাঠের বিজ্ঞান আর ব্যক্তিগত সাহস; আর প্রতিটি দল একটু বেশি সময় থাকল, একটু দূরে গেল, একটু বেশি রেখে গেল।" },
      ],
      beats: [
        { missionId: "apollo-11", imageId: "aldrin-on-moon", note: { en: "The first crewed landing. A single moonwalk, the first samples, and the first instruments left to work alone.", bn: "প্রথম মানুষবাহী অবতরণ। একটি মাত্র চন্দ্রপদচারণা, প্রথম নমুনা, আর একা কাজ করার জন্য রেখে যাওয়া প্রথম যন্ত্র।" } },
        { missionId: "apollo-12", imageId: "bean-alsep", note: { en: "A pinpoint landing within walking distance of Surveyor 3, and the first full ALSEP science station.", bn: "সার্ভেয়ার ৩-এর হাঁটা দূরত্বে নিখুঁত অবতরণ, আর প্রথম পূর্ণাঙ্গ ALSEP বিজ্ঞান কেন্দ্র।" } },
        { missionId: "apollo-14", note: { en: "The Fra Mauro highlands, originally planned for Apollo 13, explored on foot with a hand-pulled equipment cart.", bn: "ফ্রা মাউরো উচ্চভূমি, যা আগে অ্যাপোলো ১৩-এর জন্য ঠিক ছিল, হাতে টানা সরঞ্জামের গাড়ি নিয়ে পায়ে হেঁটে অন্বেষণ।" } },
        { missionId: "apollo-15", imageId: "apollo-15-rover", note: { en: "The first lunar rover. Mountains, a rille, and a far wider range than any crew before.", bn: "প্রথম চন্দ্র রোভার। পাহাড়, একটি খাত, আর আগের যেকোনো দলের চেয়ে অনেক বড় পরিসর।" } },
        { missionId: "apollo-16", imageId: "apollo-16-salute", note: { en: "The first landing in the lunar highlands at Descartes, testing ideas about how the ancient crust formed.", bn: "দেকার্তে চন্দ্র উচ্চভূমিতে প্রথম অবতরণ, প্রাচীন ভূত্বক কীভাবে গড়ে উঠেছিল সেই ধারণার পরীক্ষা।" } },
        { missionId: "apollo-17", imageId: "apollo-17-rover-cernan", note: { en: "The last crewed landing, in the Taurus–Littrow valley, with a geologist on the surface.", bn: "শেষ মানুষবাহী অবতরণ, বৃষ–লিট্রো উপত্যকায়, পৃষ্ঠে একজন ভূতাত্ত্বিক নিয়ে।" } },
      ],
    },
    {
      id: "moon-science-left-behind",
      layout: "hardware",
      animationPreset: "instrument-bench",
      imageId: "bean-alsep",
      relicModelId: "apollo-14-modular-equipment-transporter",
      artifactIds: ["apollo-11-easep", "apollo-12-alsep", "apollo-14-alsep", "apollo-15-alsep", "apollo-16-alsep", "apollo-17-alsep", "apollo-15-lrv", "apollo-16-lrv", "apollo-17-lrv"],
      kicker: { en: "Section 04 · The Science Left Behind", bn: "পর্ব ০৪ · রেখে যাওয়া বিজ্ঞান" },
      title: { en: "The Science Left Behind", bn: "রেখে যাওয়া বিজ্ঞান" },
      narrative: [
        { en: "The astronauts did not only leave footprints. They left instruments designed to continue studying the Moon after they returned home.", bn: "নভোচারীরা শুধু পদচিহ্ন রেখে যাননি। তাঁরা রেখে গেছেন এমন যন্ত্র, যা তাঁদের ঘরে ফেরার পরও চাঁদকে অধ্যয়ন করে চলবে।" },
        { en: "Seismometers listened for moonquakes. Detectors counted particles arriving from the Sun. Rovers were parked at the end of their last drive. Some experiments kept reporting to Earth for years after the crews departed.", bn: "ভূকম্পমাপক শুনেছে চন্দ্রকম্পন। ডিটেক্টর গুনেছে সূর্য থেকে আসা কণা। রোভারগুলো থেমে আছে তাদের শেষ যাত্রার শেষে। কিছু পরীক্ষা নভোচারীরা চলে যাওয়ার পরও বছরের পর বছর পৃথিবীতে তথ্য পাঠিয়েছে।" },
      ],
      callouts: [
        { en: "Science stations at six landing sites", bn: "ছয়টি অবতরণস্থলে বিজ্ঞান কেন্দ্র" },
        { en: "Three lunar rovers parked where they stopped", bn: "তিনটি চন্দ্র রোভার থেমে আছে যেখানে থেমেছিল" },
        { en: "The only hand cart ever used on the Moon", bn: "চাঁদে ব্যবহৃত একমাত্র হাতগাড়ি" },
        { en: "Switched off from Earth in 1977", bn: "১৯৭৭-এ পৃথিবী থেকে বন্ধ করা হয়" },
      ],
    },
    {
      id: "moon-silence-on-the-surface",
      layout: "silence",
      animationPreset: "lunar-dusk",
      imageId: "apollo-17-schmitt-boulder",
      eventIds: ["alsep-off"],
      kicker: { en: "Section 05 · Silence on the Surface", bn: "পর্ব ০৫ · পৃষ্ঠে নীরবতা" },
      title: { en: "Silence on the Surface", bn: "পৃষ্ঠে নীরবতা" },
      narrative: [
        { en: "Missions eventually ended. Equipment stopped operating. Communications ceased.", bn: "অভিযানগুলো একসময় শেষ হলো। যন্ত্র কাজ বন্ধ করল। যোগাযোগ থেমে গেল।" },
        { en: "Yet the physical traces of these journeys remained exactly where they were left. Nothing on the Moon was abandoned by accident: the descent stages, the science stations, and the rovers were all built to stay.", bn: "তবু এই যাত্রাগুলোর বাস্তব চিহ্ন রয়ে গেল ঠিক যেখানে রাখা হয়েছিল। চাঁদে কিছুই দুর্ঘটনাবশত ফেলে যাওয়া হয়নি: অবতরণ পর্যায়, বিজ্ঞান কেন্দ্র আর রোভার, সবই থেকে যাওয়ার জন্য তৈরি।" },
        { en: "The Moon became an archive of humanity's exploration.", bn: "চাঁদ হয়ে উঠল মানুষের অভিযানের এক সংরক্ষণাগার।" },
      ],
    },
    {
      id: "moon-what-remains",
      layout: "remains",
      animationPreset: "archive-shelf",
      groupBy: "mission",
      kicker: { en: "Section 06 · What Remains", bn: "পর্ব ০৬ · যা রয়ে গেছে" },
      title: { en: "What Remains", bn: "যা রয়ে গেছে" },
      narrative: [
        { en: "This archive documents nine NASA landing sites on the Moon. Each one is a small museum with no visitors, listed here with its documented coordinates and sources.", bn: "এই সংরক্ষণাগারে চাঁদে নাসার নয়টি অবতরণস্থল নথিভুক্ত আছে। প্রতিটি যেন দর্শকহীন এক ছোট জাদুঘর, এখানে নথিভুক্ত স্থানাঙ্ক ও উৎসসহ তালিকাভুক্ত।" },
      ],
      groups: [
        {
          category: "left",
          artifactIds: [
            "surveyor-1",
            "surveyor-3",
            "surveyor-7",
            "apollo-11-descent-stage",
            "apollo-11-easep",
            "apollo-12-descent-stage",
            "apollo-12-alsep",
            "apollo-14-descent-stage",
            "apollo-14-alsep",
            "apollo-15-descent-stage",
            "apollo-15-alsep",
            "apollo-15-lrv",
            "apollo-16-descent-stage",
            "apollo-16-alsep",
            "apollo-16-lrv",
            "apollo-17-descent-stage",
            "apollo-17-alsep",
            "apollo-17-lrv",
          ],
        },
      ],
    },
    {
      id: "moon-echoes-continue",
      layout: "finale",
      animationPreset: "lunar-dawn",
      imageId: "bootprint",
      kicker: { en: "Section 07 · The Echoes Continue", bn: "পর্ব ০৭ · প্রতিধ্বনি চলতে থাকে" },
      title: { en: "The Echoes Continue", bn: "প্রতিধ্বনি চলতে থাকে" },
      narrative: [
        { en: "The Moon is more than a destination that humanity once reached. It is a record of experimentation, engineering, discovery, and ambition.", bn: "চাঁদ শুধু এমন এক গন্তব্য নয়, যেখানে মানুষ একদিন পৌঁছেছিল। এটি পরীক্ষা, প্রকৌশল, আবিষ্কার আর উচ্চাকাঙ্ক্ষার এক লিপি।" },
        { en: "The objects left behind represent the first chapters of a much larger journey.", bn: "রেখে যাওয়া বস্তুগুলো এক অনেক বড় যাত্রার প্রথম অধ্যায়।" },
      ],
    },
  ],
};

export const marsStory: PlanetStory = {
  planet: "mars",
  label: { en: "Mars", bn: "মঙ্গল" },
  title: { en: "The Long Red Silence", bn: "দীর্ঘ লাল নীরবতা" },
  subtitle: { en: "Across millions of kilometers, machines carried humanity's questions into another world.", bn: "লক্ষ লক্ষ কিলোমিটার পেরিয়ে যন্ত্রেরা মানুষের প্রশ্ন বয়ে নিয়ে গেছে অন্য এক জগতে।" },
  description: {
    en: "Millions of kilometers away, machines crossed an unfamiliar world in humanity's place. Some continued sending discoveries. Others fell silent. Their journeys reveal the ambition, uncertainty, and endurance behind planetary exploration.",
    bn: "লক্ষ লক্ষ কিলোমিটার দূরে, মানুষের বদলে যন্ত্রেরা পাড়ি দিয়েছে এক অচেনা জগৎ। কেউ আবিষ্কার পাঠিয়ে গেছে। কেউ নীরব হয়ে গেছে। তাদের যাত্রা তুলে ধরে গ্রহ-অভিযানের পেছনের উচ্চাকাঙ্ক্ষা, অনিশ্চয়তা আর সহনশীলতা।",
  },
  cta: { en: "Explore the Mars Story", bn: "মঙ্গলের গল্প দেখুন" },
  posterImageId: "jezero-panorama",
  theme: {
    accent: "#f0a35a",
    accentSoft: "#d9785a",
    bg: "#1a0c0a",
    bgDeep: "#090403",
    glowA: "rgba(217,120,90,0.36)",
    glowB: "rgba(240,163,90,0.18)",
    paper: "#e9d4c6",
    disc: "mars",
    dust: true,
  },
  panels: [
    {
      id: "mars-another-world",
      layout: "intro",
      animationPreset: "red-dawn",
      imageId: "earth-from-mars",
      kicker: { en: "Section 01 · Another World", bn: "পর্ব ০১ · অন্য এক জগৎ" },
      title: { en: "Another World", bn: "অন্য এক জগৎ" },
      narrative: [
        { en: "For centuries, Mars remained a mysterious red point in the sky.", bn: "শতাব্দীর পর শতাব্দী ধরে মঙ্গল ছিল আকাশে এক রহস্যময় লাল বিন্দু।" },
        { en: "Scientists wanted to know whether it had water, whether its environment could support life, and how its surface had evolved. Reaching it would mean sending machines across interplanetary distances, and trusting them to work alone when they arrived.", bn: "বিজ্ঞানীরা জানতে চেয়েছিলেন সেখানে পানি আছে কি না, তার পরিবেশ প্রাণ ধারণ করতে পারে কি না, আর তার পৃষ্ঠ কীভাবে বদলেছে। সেখানে পৌঁছানো মানে আন্তঃগ্রহ দূরত্ব পেরিয়ে যন্ত্র পাঠানো, আর পৌঁছানোর পর তাদের একা কাজ করার ওপর ভরসা রাখা।" },
        { en: "From the surface of Mars, Earth is only a bright point in the evening sky.", bn: "মঙ্গলের পৃষ্ঠ থেকে পৃথিবী কেবল সন্ধ্যার আকাশে এক উজ্জ্বল বিন্দু।" },
      ],
    },
    {
      id: "mars-first-robotic-explorers",
      layout: "missions",
      animationPreset: "landers",
      kicker: { en: "Section 02 · The First Robotic Explorers", bn: "পর্ব ০২ · প্রথম রোবট অভিযাত্রী" },
      title: { en: "The First Robotic Explorers", bn: "প্রথম রোবট অভিযাত্রী" },
      narrative: [
        { en: "Humanity was no longer only trying to reach Mars. It was trying to understand what the planet was made of, what its atmosphere was like, and whether its environment had ever been suitable for life.", bn: "মানুষ তখন আর শুধু মঙ্গলে পৌঁছানোর চেষ্টা করছিল না। সে বুঝতে চাইছিল গ্রহটি কী দিয়ে তৈরি, তার বায়ুমণ্ডল কেমন, আর তার পরিবেশ কখনও প্রাণের উপযোগী ছিল কি না।" },
        { en: "Two Viking landers arrived in 1976 and photographed the ground for the first time. Two decades later, Pathfinder proved a far cheaper way down and released the first rover onto the surface.", bn: "১৯৭৬-এ দুটি ভাইকিং ল্যান্ডার পৌঁছাল এবং প্রথমবারের মতো মাটির ছবি তুলল। দুই দশক পর পাথফাইন্ডার অনেক কম খরচে নামার পথ দেখাল এবং পৃষ্ঠে প্রথম রোভার ছাড়ল।" },
      ],
      beats: [
        { missionId: "viking-1", imageArtifactId: "viking-1-lander", note: { en: "The first United States spacecraft to land safely on Mars. Its first photograph came back minutes after touchdown.", bn: "মঙ্গলে নিরাপদে নামা প্রথম মার্কিন মহাকাশযান। অবতরণের কয়েক মিনিট পরই এর প্রথম ছবি ফিরে আসে।" } },
        { missionId: "viking-2", imageArtifactId: "viking-2-lander", note: { en: "Its twin repeated the surface investigation on the far side of the planet, in Utopia Planitia.", bn: "এর যমজ গ্রহের অন্য পাশে, ইউটোপিয়া সমভূমিতে, একই পৃষ্ঠ-অনুসন্ধান পুনরায় করল।" } },
        { missionId: "mars-pathfinder", imageArtifactId: "sojourner", note: { en: "A low-cost lander in Ares Vallis with Sojourner, the first wheels on Mars. The site became the Carl Sagan Memorial Station.", bn: "আরেস উপত্যকায় কম খরচের ল্যান্ডার, সঙ্গে সোজার্নার, মঙ্গলে প্রথম চাকা। স্থানটি হলো কার্ল সেগান স্মৃতি স্টেশন।" } },
      ],
    },
    {
      id: "mars-machines-that-kept-moving",
      layout: "missions",
      animationPreset: "rovers",
      kicker: { en: "Section 03 · Machines That Kept Moving", bn: "পর্ব ০৩ · যে যন্ত্রেরা চলতেই থাকল" },
      title: { en: "Machines That Kept Moving", bn: "যে যন্ত্রেরা চলতেই থাকল" },
      narrative: [
        { en: "The exploration of Mars became more ambitious. Instead of remaining in one location, robotic explorers could travel across the surface, studying rocks, landscapes, soil, and weather as they went.", bn: "মঙ্গল-অভিযান আরও উচ্চাকাঙ্ক্ষী হলো। এক জায়গায় থেমে না থেকে রোবট অভিযাত্রীরা পৃষ্ঠ জুড়ে চলতে পারল, পথে পাথর, ভূদৃশ্য, মাটি আর আবহাওয়া পরীক্ষা করতে করতে।" },
        { en: "Spirit and Opportunity were twins, launched weeks apart for ninety-day missions. Their stories diverged on the ground.", bn: "স্পিরিট আর অপরচুনিটি ছিল যমজ, নব্বই দিনের অভিযানের জন্য কয়েক সপ্তাহের ব্যবধানে উৎক্ষেপিত। মাটিতে নামার পর তাদের গল্প আলাদা পথে গেল।" },
      ],
      beats: [
        { missionId: "mer-spirit", imageId: "spirit-husband-hill", note: { en: "Spirit climbed the Columbia Hills from Gusev crater and worked for six years, until its wheels sank into soft soil at a place the team called Troy.", bn: "স্পিরিট গুসেভ গহ্বর থেকে কলম্বিয়া পাহাড়ে উঠল এবং ছয় বছর কাজ করল, যতক্ষণ না এর চাকা ট্রয় নামের জায়গায় নরম মাটিতে ডুবে গেল।" } },
        { missionId: "mer-opportunity", imageId: "opportunity-burns-cliff", note: { en: "Opportunity crossed the plains of Meridiani for more than fourteen years, crater to crater, until a planet-wide dust storm darkened its solar panels.", bn: "অপরচুনিটি চোদ্দ বছরেরও বেশি সময় মেরিডিয়ানির সমভূমি পাড়ি দিল, এক গহ্বর থেকে আরেক গহ্বরে, যতক্ষণ না গ্রহজোড়া ধুলোর ঝড় এর সৌরপ্যানেল অন্ধকার করে দিল।" } },
      ],
    },
    {
      id: "mars-search-for-ancient-life",
      layout: "missions",
      animationPreset: "habitability",
      imageId: "curiosity-murray-buttes",
      kicker: { en: "Section 04 · The Search for Ancient Life", bn: "পর্ব ০৪ · প্রাচীন প্রাণের খোঁজ" },
      title: { en: "The Search for Ancient Life", bn: "প্রাচীন প্রাণের খোঁজ" },
      narrative: [
        { en: "The central question evolved. Scientists were no longer only asking what Mars looked like.", bn: "মূল প্রশ্নটি বদলে গেল। বিজ্ঞানীরা আর শুধু জানতে চাইছিলেন না মঙ্গল দেখতে কেমন।" },
        { en: "They were investigating whether ancient Mars had environments that could support microbial life, and searching for evidence preserved in rocks and sediments. Two of the machines on this page are still at work.", bn: "তাঁরা অনুসন্ধান করছিলেন প্রাচীন মঙ্গলে অণুজীবের উপযোগী পরিবেশ ছিল কি না, আর পাথর ও পলিতে সংরক্ষিত প্রমাণ খুঁজছিলেন। এই পাতার দুটি যন্ত্র এখনও কাজ করছে।" },
      ],
      beats: [
        { missionId: "phoenix", imageId: "phoenix-sun", note: { en: "A polar lander that confirmed water ice beneath the arctic soil before the northern winter closed in.", bn: "এক মেরু ল্যান্ডার, যা উত্তরের শীত ঘনিয়ে আসার আগে সুমেরু মাটির নিচে জলীয় বরফ নিশ্চিত করল।" } },
        { missionId: "msl-curiosity", imageId: "curiosity-murray-buttes", note: { en: "A laboratory on wheels in Gale crater, reading the layered record of an ancient lake and asking whether it was ever habitable.", bn: "গেল গহ্বরে চাকার ওপর এক পরীক্ষাগার, প্রাচীন হ্রদের স্তরে স্তরে লেখা ইতিহাস পড়ছে আর জিজ্ঞেস করছে এটি কখনও বাসযোগ্য ছিল কি না।" } },
        { missionId: "mars-2020", imageId: "jezero-panorama", note: { en: "Perseverance landed in Jezero crater, an ancient river delta, to seek signs of past life and seal samples for a future return to Earth.", bn: "পারসিভিয়ারেন্স নামল জেজেরো গহ্বরে, এক প্রাচীন নদী-বদ্বীপে, অতীত প্রাণের চিহ্ন খুঁজতে আর ভবিষ্যতে পৃথিবীতে ফেরানোর জন্য নমুনা সিল করতে।" } },
      ],
    },
    {
      id: "mars-when-machines-fall-silent",
      layout: "silence",
      animationPreset: "signal-loss",
      imageId: "insight-seis",
      eventIds: ["viking-2-silence", "viking-1-silence", "pathfinder-silence", "phoenix-silence", "spirit-troy", "spirit-silence", "opportunity-silence", "insight-end"],
      kicker: { en: "Section 05 · When Machines Fall Silent", bn: "পর্ব ০৫ · যখন যন্ত্রেরা নীরব হয়" },
      title: { en: "When Machines Fall Silent", bn: "যখন যন্ত্রেরা নীরব হয়" },
      narrative: [
        { en: "Every robotic explorer depends on engineering, power, communication, and a hostile environment that never stops changing.", bn: "প্রতিটি রোবট অভিযাত্রী নির্ভর করে প্রকৌশল, শক্তি, যোগাযোগ, আর এমন এক প্রতিকূল পরিবেশের ওপর, যা বদলাতে কখনও থামে না।" },
        { en: "Some missions ended after years of discoveries. Others stopped communicating. Their final recorded events became part of their history.", bn: "কিছু অভিযান বছরের পর বছর আবিষ্কারের পর শেষ হয়েছে। কিছু যোগাযোগ বন্ধ করেছে। তাদের শেষ নথিভুক্ত ঘটনাগুলো তাদের ইতিহাসের অংশ হয়ে গেছে।" },
      ],
    },
    {
      id: "mars-what-remains",
      layout: "remains",
      animationPreset: "red-ledger",
      groupBy: "artifact",
      kicker: { en: "Section 06 · What Remains on Mars", bn: "পর্ব ০৬ · মঙ্গলে যা রয়ে গেছে" },
      title: { en: "What Remains on Mars", bn: "মঙ্গলে যা রয়ে গেছে" },
      narrative: [
        { en: "This archive documents ten NASA machines on the Martian surface. Two are still working. Two finished their missions on their own terms. Six stopped answering.", bn: "এই সংরক্ষণাগারে মঙ্গলের পৃষ্ঠে নাসার দশটি যন্ত্র নথিভুক্ত আছে। দুটি এখনও কাজ করছে। দুটি নিজের শর্তে অভিযান শেষ করেছে। ছয়টি সাড়া দেওয়া বন্ধ করেছে।" },
      ],
      groups: [
        { category: "active", artifactIds: ["curiosity", "perseverance"] },
        { category: "ended", artifactIds: ["phoenix", "insight"] },
        { category: "stranded", artifactIds: ["viking-1-lander", "viking-2-lander", "pathfinder-lander", "sojourner", "spirit", "opportunity"] },
      ],
    },
    {
      id: "mars-journey-continues",
      layout: "finale",
      animationPreset: "red-horizon",
      imageId: "jezero-panorama",
      kicker: { en: "Section 07 · The Journey Continues", bn: "পর্ব ০৭ · যাত্রা চলতে থাকে" },
      title: { en: "The Journey Continues", bn: "যাত্রা চলতে থাকে" },
      narrative: [
        { en: "The machines sent to Mars changed the way humanity understands another planet. Their discoveries continue to shape scientific questions and future exploration.", bn: "মঙ্গলে পাঠানো যন্ত্রেরা বদলে দিয়েছে মানুষ কীভাবে অন্য এক গ্রহকে বোঝে। তাদের আবিষ্কার এখনও বৈজ্ঞানিক প্রশ্ন আর ভবিষ্যৎ অভিযানকে গড়ে দিচ্ছে।" },
        { en: "Some explorers have completed their missions. Others continue working. The story of Mars exploration is not finished.", bn: "কিছু অভিযাত্রী তাদের অভিযান শেষ করেছে। অন্যরা কাজ করে চলেছে। মঙ্গল-অভিযানের গল্প এখনও শেষ হয়নি।" },
      ],
    },
  ],
};

export const planetStories: Record<StoryPlanet, PlanetStory> = { moon: moonStory, mars: marsStory };

export const planetStoryIssues: string[] = [...validatePlanetStory(moonStory, planetStoryCatalog), ...validatePlanetStory(marsStory, planetStoryCatalog)];
