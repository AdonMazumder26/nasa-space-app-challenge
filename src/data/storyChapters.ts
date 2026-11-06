import { artifactModels } from "./artifactModels";
import { catalog } from "./catalog";
import { storyImages } from "./storyImages";
import { validateStoryChapters, type StoryChapter } from "../lib/storyMode";

/**
 * The Story Mode script. It names which NASA missions and artifacts appear, in what
 * order, with which layout, and adds short narrative framing in both languages.
 * Dates, coordinates, statuses, photographs, and sources all come from the catalog.
 */
export const storyChapters: StoryChapter[] = [
  {
    id: "the-beginning",
    theme: "intro",
    title: { en: "The Beginning", bn: "সূচনা" },
    subtitle: { en: "Humanity looked beyond Earth.", bn: "মানুষ পৃথিবীর বাইরে তাকাল।" },
    sections: [
      {
        id: "opening",
        type: "hero",
        kicker: { en: "A cinematic history of NASA's Moon and Mars missions", bn: "নাসার চাঁদ ও মঙ্গল অভিযানের এক চলচ্চিত্রসম ইতিহাস" },
        title: { en: "Humanity looked beyond Earth.", bn: "মানুষ পৃথিবীর বাইরে তাকাল।" },
        paragraphs: [
          {
            en: "For as long as there have been people, there have been people wondering what lies past the sky. Eventually that curiosity became engineering, science, and exploration.",
            bn: "যতদিন মানুষ আছে, ততদিনই আকাশের ওপারে কী আছে তা নিয়ে মানুষ ভেবেছে। একসময় সেই কৌতূহল পরিণত হলো প্রকৌশলে, বিজ্ঞানে, অভিযানে।",
          },
          {
            en: "Spacecraft began to travel beyond Earth, carrying instruments and ambition into places no one had stood.",
            bn: "মহাকাশযান পৃথিবী ছাড়িয়ে যেতে শুরু করল, যন্ত্র আর উচ্চাকাঙ্ক্ষা বয়ে নিয়ে এমন সব জায়গায়, যেখানে কেউ কখনও দাঁড়ায়নি।",
          },
          {
            en: "Every mission leaves behind more than data. Some leave behind landers, rovers, experiments, and fragments of engineering history on the surface of another world.",
            bn: "প্রতিটি অভিযান শুধু তথ্য নয়, আরও কিছু রেখে যায়। কেউ কেউ অন্য জগতের বুকে রেখে যায় ল্যান্ডার, রোভার, পরীক্ষার যন্ত্র, আর প্রকৌশল-ইতিহাসের টুকরো।",
          },
        ],
        question: { en: "What happens to the machines after their missions end?", bn: "অভিযান শেষ হওয়ার পর যন্ত্রগুলোর কী হয়?" },
      },
      {
        id: "every-mission",
        type: "assembly",
        kicker: { en: "From the archive", bn: "সংগ্রহশালা থেকে" },
        title: { en: "Every mission leaves something behind.", bn: "প্রতিটি অভিযান কিছু না কিছু রেখে যায়।" },
        body: {
          en: "A rocket, a boot print, a rover, a helicopter. Photographs from NASA's own archive, from the first look back at Earth to the newest machines working on Mars.",
          bn: "একটি রকেট, একটি জুতোর ছাপ, একটি রোভার, একটি হেলিকপ্টার। নাসার নিজস্ব সংগ্রহশালার ছবি—পৃথিবীর দিকে প্রথম ফিরে তাকানো থেকে মঙ্গলে কর্মরত সর্বশেষ যন্ত্র পর্যন্ত।",
        },
        imageIds: ["earthrise", "saturn-v-apollo-11", "bootprint", "aldrin-on-moon", "perseverance-descent", "ingenuity-flight"],
      },
      {
        id: "what-this-is",
        type: "narrative",
        kicker: { en: "How to read this story", bn: "এই গল্প কীভাবে পড়বেন" },
        heading: { en: "Two worlds, one record.", bn: "দুই জগৎ, এক লিপি।" },
        paragraphs: [
          {
            en: "This story follows NASA's missions in the order they reached the surface: first the Moon, then Mars. Each stop draws on the same documented catalog that powers the interactive atlas, so every date, coordinate, and status you read here is traceable to a source.",
            bn: "এই গল্প নাসার অভিযানগুলোকে পৃষ্ঠে পৌঁছানোর ক্রমে অনুসরণ করে: প্রথমে চাঁদ, তারপর মঙ্গল। প্রতিটি পর্ব সেই একই নথিভুক্ত তালিকা থেকে নেওয়া, যা ইন্টারঅ্যাকটিভ মানচিত্রকেও চালায়। তাই এখানে পড়া প্রতিটি তারিখ, স্থানাঙ্ক ও অবস্থার একটি উৎস আছে।",
          },
          {
            en: "Scroll to move forward. Whenever a machine has a surveyed location, you can leave the story and visit it on the globe.",
            bn: "এগোতে স্ক্রল করুন। যখনই কোনো যন্ত্রের জরিপকৃত অবস্থান থাকবে, আপনি গল্প ছেড়ে গোলকে গিয়ে সেটি দেখতে পারবেন।",
          },
        ],
        stats: true,
      },
    ],
  },
  {
    id: "the-moon",
    theme: "moon",
    title: { en: "The Moon", bn: "চাঁদ" },
    subtitle: { en: "Humanity's first steps into another world.", bn: "অন্য এক জগতে মানুষের প্রথম পদক্ষেপ।" },
    sections: [
      {
        id: "moon-intro",
        type: "narrative",
        kicker: { en: "Chapter two", bn: "দ্বিতীয় অধ্যায়" },
        heading: { en: "Before anyone could walk there, a machine had to land.", bn: "কেউ সেখানে হাঁটার আগে, একটি যন্ত্রকে নামতে হয়েছিল।" },
        paragraphs: [
          {
            en: "In the 1960s NASA sent robotic Surveyor landers to prove that a spacecraft could touch down gently and that the ground would hold. Those tests prepared the way for Apollo, the six crewed landings between 1969 and 1972.",
            bn: "১৯৬০-এর দশকে নাসা রোবট সার্ভেয়ার ল্যান্ডার পাঠায়, প্রমাণ করতে যে একটি মহাকাশযান আলতো করে নামতে পারে আর মাটি তার ভার নিতে পারে। সেই পরীক্ষাগুলোই পথ তৈরি করে অ্যাপোলোর জন্য—১৯৬৯ থেকে ১৯৭২-এর মধ্যে ছয়টি মানুষবাহী অবতরণ।",
          },
          {
            en: "Each visit left something on the surface: descent stages that served as launch pads, science stations built to keep working after the crew had gone, and three electric rovers parked where their last drives ended.",
            bn: "প্রতিটি সফর পৃষ্ঠে কিছু না কিছু রেখে গেছে: উৎক্ষেপণ মঞ্চ হিসেবে কাজ করা অবতরণ স্তর, নভোচারীরা চলে যাওয়ার পরও কাজ চালিয়ে যেতে বানানো বিজ্ঞান কেন্দ্র, আর শেষ যাত্রা যেখানে থেমেছিল সেখানেই দাঁড়ানো তিনটি বৈদ্যুতিক রোভার।",
          },
        ],
      },
      {
        id: "surveyor-1",
        type: "mission",
        missionId: "surveyor-1",
        layout: "date",
        artifactIds: ["surveyor-1"],
        lead: {
          en: "The first United States spacecraft to land softly on the Moon came down in the Ocean of Storms and kept photographing the surface for months. It had no way home, and it is still there.",
          bn: "চাঁদে নরম অবতরণ করা প্রথম মার্কিন মহাকাশযানটি নামে ঝড়ের মহাসাগরে, আর মাসের পর মাস পৃষ্ঠের ছবি তুলে যায়। ফেরার কোনো উপায় তার ছিল না, এবং এটি এখনও সেখানেই আছে।",
        },
      },
      {
        id: "surveyor-3",
        type: "mission",
        missionId: "surveyor-3",
        layout: "split",
        artifactIds: ["surveyor-3"],
        relicModelId: "surveyor-3-lunar-lander",
        showTimeline: true,
        lead: {
          en: "Surveyor 3 landed in 1967, dug a trench with its robotic arm, and fell silent. Two and a half years later the Apollo 12 crew walked up to it and removed its camera to bring home. It remains the only abandoned spacecraft people have ever visited.",
          bn: "সার্ভেয়ার ৩ নামে ১৯৬৭ সালে, রোবট বাহু দিয়ে খাদ খোঁড়ে, তারপর নীরব হয়ে যায়। আড়াই বছর পর অ্যাপোলো ১২-এর নভোচারীরা হেঁটে তার কাছে যান এবং ক্যামেরা খুলে ঘরে ফিরিয়ে আনেন। এটিই এখনও একমাত্র পরিত্যক্ত মহাকাশযান, যেখানে মানুষ গিয়েছে।",
        },
      },
      {
        id: "apollo-11",
        type: "mission",
        missionId: "apollo-11",
        layout: "cinematic",
        artifactIds: ["apollo-11-descent-stage", "apollo-11-easep"],
        imageArtifactId: "apollo-11-descent-stage",
        lead: {
          en: "On 20 July 1969, Eagle's descent stage became the launch pad for the first people to leave another world. It stayed behind at Tranquility Base, a short walk from the first science package a crew ever set down.",
          bn: "১৯৬৯ সালের ২০ জুলাই ঈগলের অবতরণ স্তর হয়ে ওঠে অন্য জগৎ ছেড়ে যাওয়া প্রথম মানুষদের উৎক্ষেপণ মঞ্চ। এটি থেকে যায় প্রশান্তি ঘাঁটিতে, কোনো নভোচারী দলের বসানো প্রথম বিজ্ঞান প্যাকেজ থেকে অল্প হাঁটা পথ দূরে।",
        },
      },
      {
        id: "apollo-12",
        type: "mission",
        missionId: "apollo-12",
        layout: "split-reverse",
        artifactIds: ["apollo-12-descent-stage", "apollo-12-alsep"],
        lead: {
          en: "Apollo 12 proved a crew could land exactly where it intended: within walking distance of Surveyor 3. Its nuclear-powered ALSEP station kept reporting from the Ocean of Storms until Earth switched the network off in 1977.",
          bn: "অ্যাপোলো ১২ প্রমাণ করে যে নভোচারীরা ঠিক যেখানে চান সেখানেই নামতে পারেন: সার্ভেয়ার ৩-এর হাঁটা দূরত্বে। এর পারমাণবিক-শক্তির ALSEP কেন্দ্র ঝড়ের মহাসাগর থেকে তথ্য পাঠাতে থাকে, যতদিন না ১৯৭৭-এ পৃথিবী নেটওয়ার্ক বন্ধ করে দেয়।",
        },
      },
      {
        id: "apollo-15",
        type: "mission",
        missionId: "apollo-15",
        layout: "editorial",
        artifactIds: ["apollo-15-descent-stage", "apollo-15-lrv", "apollo-15-alsep"],
        showTimeline: true,
        lead: {
          en: "At Hadley–Apennine the crew unfolded the first Lunar Roving Vehicle and drove it across the edge of a rille. At the end of the last moonwalk they parked it so its camera could film Falcon lifting off. It has not moved since.",
          bn: "হ্যাডলি–অ্যাপেনাইনে নভোচারীরা প্রথম চন্দ্র বিচরণ যান খুলে একটি রিলের কিনার ধরে চালান। শেষ চন্দ্রপদচারণার শেষে তাঁরা এটিকে এমনভাবে দাঁড় করান যাতে এর ক্যামেরা ফ্যালকনের উড্ডয়ন ধারণ করতে পারে। তারপর থেকে এটি আর নড়েনি।",
        },
      },
      {
        id: "apollo-17",
        type: "mission",
        missionId: "apollo-17",
        layout: "date",
        artifactIds: ["apollo-17-descent-stage", "apollo-17-lrv", "apollo-17-alsep"],
        showTimeline: true,
        lead: {
          en: "The last crewed landing set down in the Taurus–Littrow valley in December 1972. Its rover camera sent the final live view of people leaving the Moon, and its science station was the last of the Apollo network to be switched off, on 30 September 1977.",
          bn: "শেষ মানুষবাহী অবতরণ হয় ১৯৭২ সালের ডিসেম্বরে, বৃষ–লিট্রো উপত্যকায়। এর রোভার ক্যামেরা মানুষের চাঁদ ছেড়ে যাওয়ার শেষ সরাসরি দৃশ্য পাঠায়, আর এর বিজ্ঞান কেন্দ্রটি অ্যাপোলো নেটওয়ার্কের মধ্যে সবশেষে বন্ধ হয়, ১৯৭৭ সালের ৩০ সেপ্টেম্বর।",
        },
      },
      {
        id: "apollo-footprints",
        type: "assembly",
        kicker: { en: "The Apollo surface", bn: "অ্যাপোলোর পৃষ্ঠ" },
        title: { en: "Six landing sites. Everything the crews parked or deployed is still there.", bn: "ছয়টি অবতরণস্থল। নভোচারীরা যা দাঁড় করিয়ে বা বসিয়ে রেখে এসেছেন, সবই এখনও সেখানে।" },
        body: {
          en: "Surveyor 3 waiting for Apollo 12. Science stations carried out by hand. Three rovers driven to the edge of their maps. All photographed by the people who left them.",
          bn: "অ্যাপোলো ১২-এর অপেক্ষায় সার্ভেয়ার ৩। হাতে বয়ে নেওয়া বিজ্ঞান কেন্দ্র। মানচিত্রের শেষ সীমা পর্যন্ত চালানো তিনটি রোভার। সবই তুলেছেন যাঁরা সেগুলো রেখে এসেছেন।",
        },
        imageIds: ["surveyor-3-apollo-12", "bean-alsep", "apollo-15-rover", "apollo-16-salute", "apollo-17-rover-cernan", "apollo-17-schmitt-boulder"],
      },
      {
        id: "moon-timeline",
        type: "timeline",
        heading: { en: "Arrivals and endings on the Moon", bn: "চাঁদে পৌঁছানো ও সমাপ্তি" },
        intro: {
          en: "Every NASA landing in this story, in the order it happened, with the recorded endings that followed.",
          bn: "এই গল্পের প্রতিটি নাসা অবতরণ, যে ক্রমে ঘটেছে, এবং তার পরে নথিবদ্ধ সমাপ্তিগুলো।",
        },
        missionIds: ["surveyor-1", "surveyor-3", "surveyor-7", "apollo-11", "apollo-12", "apollo-14", "apollo-15", "apollo-16", "apollo-17"],
      },
      {
        id: "moon-hardware",
        type: "hardware",
        heading: { en: "Hardware left on the lunar surface", bn: "চন্দ্রপৃষ্ঠে রেখে যাওয়া হার্ডওয়্যার" },
        intro: {
          en: "A selection of what the Surveyor and Apollo missions left behind, each at a surveyed coordinate.",
          bn: "সার্ভেয়ার ও অ্যাপোলো অভিযান যা রেখে গেছে তার একটি নির্বাচন, প্রতিটি একটি জরিপকৃত স্থানাঙ্কে।",
        },
        groups: [{ artifactIds: ["surveyor-7", "apollo-11-easep", "apollo-14-descent-stage", "apollo-16-lrv", "apollo-17-alsep"] }],
      },
      {
        id: "moon-legacy",
        type: "narrative",
        kicker: { en: "The legacy of lunar exploration", bn: "চন্দ্র অভিযানের উত্তরাধিকার" },
        heading: { en: "The Moon kept everything.", bn: "চাঁদ সবকিছু রেখে দিয়েছে।" },
        highlight: true,
        paragraphs: [
          {
            en: "With no weather to bury them, the Surveyor and Apollo sites look much as they did the day each crew or controller signed off. Decades later the Lunar Reconnaissance Orbiter photographed them from orbit, fixing their positions to within metres.",
            bn: "ঢেকে ফেলার মতো কোনো আবহাওয়া না থাকায় সার্ভেয়ার ও অ্যাপোলো স্থানগুলো প্রায় সেদিনের মতোই আছে, যেদিন প্রতিটি দল বা নিয়ন্ত্রক শেষ বিদায় জানিয়েছিল। কয়েক দশক পর লুনার রিকনেসাঁ অরবিটার কক্ষ থেকে তাদের ছবি তোলে, অবস্থান নির্ধারণ করে কয়েক মিটারের মধ্যে।",
          },
        ],
        quote: { en: "The hardware remained.", bn: "হার্ডওয়্যার থেকে গেল।" },
      },
    ],
  },
  {
    id: "the-journey",
    theme: "transition",
    title: { en: "The Journey to Mars", bn: "মঙ্গলের পথে যাত্রা" },
    subtitle: { en: "From the Moon to the Red Planet.", bn: "চাঁদ থেকে লাল গ্রহে।" },
    sections: [
      {
        id: "moon-to-mars",
        type: "transition",
        from: "moon",
        to: "mars",
        imageId: "earth-from-mars",
        imageCaption: { en: "Earth, seen from Mars by Curiosity", bn: "মঙ্গল থেকে কিউরিওসিটির দেখা পৃথিবী" },
        kicker: { en: "Chapter three", bn: "তৃতীয় অধ্যায়" },
        title: { en: "From the Moon to the Red Planet.", bn: "চাঁদ থেকে লাল গ্রহে।" },
        paragraphs: [
          {
            en: "Having learned to land on a nearby world, NASA kept sending robotic explorers deeper into the Solar System. Mars became a major destination for scientific investigation.",
            bn: "কাছের এক জগতে নামতে শেখার পর নাসা রোবট অভিযাত্রীদের সৌরজগতের আরও গভীরে পাঠাতে থাকে। বৈজ্ঞানিক অনুসন্ধানের একটি প্রধান গন্তব্য হয়ে ওঠে মঙ্গল।",
          },
          {
            en: "The challenge changed. A journey of days became a journey of months, and radio signals took minutes each way. Machines had to land, survive, and work for years with no one nearby to help.",
            bn: "চ্যালেঞ্জ বদলে গেল। কয়েক দিনের যাত্রা হয়ে উঠল কয়েক মাসের, আর বেতার সংকেত পৌঁছাতে প্রতিবার লাগত কয়েক মিনিট। যন্ত্রগুলোকে নামতে হতো, টিকে থাকতে হতো, আর বছরের পর বছর কাজ করতে হতো—সাহায্যের জন্য কাছে কেউ নেই।",
          },
        ],
      },
    ],
  },
  {
    id: "the-red-planet",
    theme: "mars",
    title: { en: "The Red Planet", bn: "লাল গ্রহ" },
    subtitle: { en: "Machines that became our eyes on Mars.", bn: "যে যন্ত্রগুলো মঙ্গলে আমাদের চোখ হয়ে উঠল।" },
    sections: [
      {
        id: "mars-intro",
        type: "narrative",
        kicker: { en: "Chapter four", bn: "চতুর্থ অধ্যায়" },
        heading: { en: "Nine landings between 1976 and 2021. Two rovers still at work.", bn: "১৯৭৬ থেকে ২০২১-এর মধ্যে নয়টি অবতরণ। দুটি রোভার এখনও কর্মরত।" },
        paragraphs: [
          {
            en: "From the twin Viking landers of 1976 to Perseverance in 2021, every NASA machine in this chapter is still on Mars. Some completed their missions. Some stopped answering. Two are driving today. The labels below say which is which.",
            bn: "১৯৭৬ সালের যমজ ভাইকিং ল্যান্ডার থেকে ২০২১-এর পারসিভিয়ারেন্স পর্যন্ত, এই অধ্যায়ের প্রতিটি নাসা যন্ত্র এখনও মঙ্গলেই আছে। কেউ অভিযান সম্পন্ন করেছে। কেউ উত্তর দেওয়া বন্ধ করেছে। দুটি আজও চলছে। নিচের চিহ্নগুলো বলে দেয় কোনটি কী।",
          },
        ],
      },
      {
        id: "viking-1",
        type: "mission",
        missionId: "viking-1",
        layout: "cinematic",
        artifactIds: ["viking-1-lander"],
        imageArtifactId: "viking-1-lander",
        lead: {
          en: "Minutes after touching down on Chryse Planitia on 20 July 1976, Viking 1 returned the first photograph from the surface of Mars. It worked for more than six years before contact was lost.",
          bn: "১৯৭৬ সালের ২০ জুলাই ক্রাইসি সমভূমিতে নামার কয়েক মিনিট পর ভাইকিং ১ মঙ্গলপৃষ্ঠ থেকে প্রথম আলোকচিত্র পাঠায়। যোগাযোগ হারানোর আগে এটি ছয় বছরেরও বেশি কাজ করে।",
        },
      },
      {
        id: "viking-2",
        type: "mission",
        missionId: "viking-2",
        layout: "date",
        artifactIds: ["viking-2-lander"],
        imageArtifactId: "viking-2-lander",
        lead: {
          en: "Six weeks after its twin, Viking 2 set down farther north in Utopia Planitia and repeated the search for life at a second site. Its last contact came in April 1980.",
          bn: "যমজের ছয় সপ্তাহ পর ভাইকিং ২ আরও উত্তরে ইউটোপিয়া সমভূমিতে নামে এবং দ্বিতীয় স্থানে প্রাণের খোঁজ পুনরায় চালায়। এর শেষ যোগাযোগ ১৯৮০ সালের এপ্রিলে।",
        },
      },
      {
        id: "mars-pathfinder",
        type: "mission",
        missionId: "mars-pathfinder",
        layout: "split",
        artifactIds: ["pathfinder-lander", "sojourner"],
        imageArtifactId: "sojourner",
        lead: {
          en: "Two decades after Viking, Pathfinder came to rest in Ares Vallis on 4 July 1997 and released Sojourner, the first rover on Mars. Both went quiet together that September, and the lander site was named Carl Sagan Memorial Station.",
          bn: "ভাইকিংয়ের দুই দশক পর, ১৯৯৭ সালের ৪ জুলাই পাথফাইন্ডার আরেস উপত্যকায় নামে এবং ছেড়ে দেয় সোজার্নারকে—মঙ্গলের প্রথম রোভার। সেই সেপ্টেম্বরে দুটোই একসঙ্গে নীরব হয়, আর ল্যান্ডার স্থানটির নাম হয় কার্ল সেগান স্মৃতি স্টেশন।",
        },
      },
      {
        id: "mer-spirit",
        type: "mission",
        missionId: "mer-spirit",
        layout: "editorial",
        artifactIds: ["spirit"],
        imageArtifactId: "spirit",
        showTimeline: true,
        lead: {
          en: "Spirit was built for ninety days and worked for six years. In 2009 its wheels broke through a crust into soft soil at a place the team called Troy. It could not drive out, became a stationary science station, and sent its last signal on 22 March 2010.",
          bn: "স্পিরিট বানানো হয়েছিল নব্বই দিনের জন্য, কাজ করেছে ছয় বছর। ২০০৯ সালে ট্রয় নামে এক জায়গায় এর চাকা পাতলা আস্তরণ ভেঙে নরম মাটিতে ডুবে যায়। বেরোতে না পেরে এটি একটি স্থির বিজ্ঞান কেন্দ্রে পরিণত হয়, এবং ২০১০ সালের ২২ মার্চ শেষ সংকেত পাঠায়।",
        },
      },
      {
        id: "mer-opportunity",
        type: "mission",
        missionId: "mer-opportunity",
        layout: "split-reverse",
        artifactIds: ["opportunity"],
        imageArtifactId: "opportunity",
        lead: {
          en: "Spirit's twin drove across Meridiani Planum for more than fourteen years. A planet-wide dust storm starved its solar panels, and the last contact came on 10 June 2018.",
          bn: "স্পিরিটের যমজ চৌদ্দ বছরেরও বেশি সময় মেরিডিয়ানি সমভূমি পাড়ি দেয়। গ্রহজোড়া এক ধুলোর ঝড় এর সৌরপ্যানেল শক্তিহীন করে দেয়, আর শেষ যোগাযোগ হয় ২০১৮ সালের ১০ জুন।",
        },
      },
      {
        id: "phoenix",
        type: "mission",
        missionId: "phoenix",
        layout: "date",
        artifactIds: ["phoenix"],
        imageArtifactId: "phoenix",
        lead: {
          en: "Phoenix landed in the Martian arctic and scraped bright water ice from just beneath the soil. It was never meant to survive the polar winter; as the days shortened its last signal came on 2 November 2008.",
          bn: "ফিনিক্স নামে মঙ্গলের সুমেরু অঞ্চলে এবং মাটির ঠিক নিচ থেকে উজ্জ্বল জলীয় বরফ খুঁড়ে তোলে। মেরু শীত পার করার কথা এর কখনও ছিল না; দিন ছোট হয়ে আসতে ২০০৮ সালের ২ নভেম্বর এর শেষ সংকেত আসে।",
        },
      },
      {
        id: "msl-curiosity",
        type: "mission",
        missionId: "msl-curiosity",
        layout: "cinematic",
        artifactIds: ["curiosity"],
        imageArtifactId: "curiosity",
        lead: {
          en: "Lowered by a sky crane into Gale crater on 6 August 2012, Curiosity has since driven many kilometres and is still working. The marker on the globe is Bradbury Landing, where it began, because this project does not track live positions.",
          bn: "২০১২ সালের ৬ আগস্ট স্কাই ক্রেনে করে গেল গহ্বরে নামানো কিউরিওসিটি এরপর বহু কিলোমিটার চলেছে এবং এখনও কাজ করছে। গোলকের চিহ্নটি ব্র্যাডবেরি অবতরণস্থল, যেখানে এর শুরু, কারণ এই প্রকল্প তাৎক্ষণিক অবস্থান অনুসরণ করে না।",
        },
      },
      {
        id: "insight",
        type: "mission",
        missionId: "insight",
        layout: "split",
        artifactIds: ["insight"],
        imageArtifactId: "insight",
        lead: {
          en: "InSight sat still on Elysium Planitia and listened for marsquakes. Dust slowly covered its solar panels, and NASA ended the mission on 21 December 2022. The seismometer that first mapped the planet's interior is still on the plain.",
          bn: "ইনসাইট এলিসিয়াম সমভূমিতে স্থির বসে মঙ্গলকম্পন শুনত। ধীরে ধীরে ধুলো এর সৌরপ্যানেল ঢেকে দেয়, আর নাসা ২০২২ সালের ২১ ডিসেম্বর অভিযান শেষ করে। গ্রহের অভ্যন্তর প্রথম মানচিত্রিত করা ভূকম্পমাপকটি এখনও সেই সমভূমিতেই আছে।",
        },
      },
      {
        id: "mars-2020",
        type: "mission",
        missionId: "mars-2020",
        layout: "editorial",
        artifactIds: ["perseverance"],
        imageArtifactId: "perseverance",
        showTimeline: true,
        lead: {
          en: "Perseverance landed in Jezero crater on 18 February 2021 carrying Ingenuity, the first aircraft to fly on another world. The helicopter made 72 flights before rotor damage retired it in January 2024. The rover remains an active mission.",
          bn: "পারসিভিয়ারেন্স ২০২১ সালের ১৮ ফেব্রুয়ারি জেজেরো গহ্বরে নামে, সঙ্গে ইনজেনুইটি—অন্য জগতে ওড়া প্রথম উড়োযান। রোটর ক্ষতিতে ২০২৪ সালের জানুয়ারিতে অবসর নেওয়ার আগে হেলিকপ্টারটি ৭২টি উড্ডয়ন করে। রোভারটি এখনও একটি সক্রিয় অভিযান।",
        },
      },
      {
        id: "mars-machines",
        type: "assembly",
        kicker: { en: "Our eyes on Mars", bn: "মঙ্গলে আমাদের চোখ" },
        title: { en: "Machines that sent home the view.", bn: "যে যন্ত্রগুলো দৃশ্য পাঠিয়েছে ঘরে।" },
        body: {
          en: "A summit panorama from Spirit. Layered cliffs from Opportunity. A seismometer set down by InSight. The first full-colour look from Jezero. Every frame here was taken on Mars, by the machine itself.",
          bn: "স্পিরিটের চূড়া থেকে প্যানোরামা। অপরচুনিটির স্তরযুক্ত খাড়াই। ইনসাইটের নামানো ভূকম্পমাপক। জেজেরো থেকে প্রথম পূর্ণ-রঙিন দৃশ্য। এখানকার প্রতিটি ফ্রেম মঙ্গলে, যন্ত্রটির নিজের তোলা।",
        },
        imageIds: ["spirit-husband-hill", "opportunity-burns-cliff", "phoenix-sun", "curiosity-murray-buttes", "insight-seis", "jezero-panorama"],
      },
      {
        id: "mars-gallery",
        type: "gallery",
        layout: "strip",
        heading: { en: "Postcards from the surface", bn: "পৃষ্ঠ থেকে পাঠানো ছবি" },
        intro: {
          en: "Photographs returned by the machines themselves, from NASA's image archive.",
          bn: "যন্ত্রগুলোর নিজেদের পাঠানো আলোকচিত্র, নাসার ছবির সংগ্রহ থেকে।",
        },
        artifactIds: ["viking-2-lander", "pathfinder-lander", "sojourner", "opportunity", "insight", "perseverance"],
      },
      {
        id: "mars-timeline",
        type: "timeline",
        heading: { en: "Arrivals and endings on Mars", bn: "মঙ্গলে পৌঁছানো ও সমাপ্তি" },
        missionIds: ["viking-1", "viking-2", "mars-pathfinder", "mer-spirit", "mer-opportunity", "phoenix", "msl-curiosity", "insight", "mars-2020"],
      },
    ],
  },
  {
    id: "what-remains",
    theme: "remains",
    title: { en: "What Remains", bn: "যা রয়ে গেছে" },
    subtitle: { en: "The mission ended. The hardware stayed.", bn: "অভিযান শেষ। হার্ডওয়্যার রয়ে গেল।" },
    sections: [
      {
        id: "remains-intro",
        type: "narrative",
        kicker: { en: "Chapter five", bn: "পঞ্চম অধ্যায়" },
        heading: { en: "Not everything left behind was abandoned.", bn: "যা ফেলে আসা হয়েছে, তার সবই পরিত্যক্ত নয়।" },
        paragraphs: [
          {
            en: "Some hardware was always meant to stay: a descent stage is a launch pad, a science station is built to outlast its crew. Some stopped working where it stood. Some finished its job and simply has no way home. And two rovers are still driving.",
            bn: "কিছু হার্ডওয়্যার থাকার জন্যই বানানো: অবতরণ স্তর একটি উৎক্ষেপণ মঞ্চ, বিজ্ঞান কেন্দ্র নভোচারীদের চেয়ে বেশিদিন টেকার জন্য তৈরি। কিছু যেখানে দাঁড়িয়ে ছিল সেখানেই কাজ বন্ধ করেছে। কিছু নিজের কাজ শেষ করেছে, কিন্তু ঘরে ফেরার কোনো পথ নেই। আর দুটি রোভার এখনও চলছে।",
          },
          {
            en: "These are different stories, and this chapter keeps them apart.",
            bn: "এগুলো ভিন্ন ভিন্ন গল্প, আর এই অধ্যায় তাদের আলাদা রাখে।",
          },
        ],
      },
      {
        id: "remains-showcase",
        type: "hardware",
        heading: { en: "Four kinds of remaining", bn: "রয়ে যাওয়ার চার রকম" },
        groups: [
          { category: "left", artifactIds: ["apollo-11-descent-stage", "apollo-15-lrv", "apollo-17-alsep", "surveyor-3"] },
          { category: "stranded", artifactIds: ["spirit", "opportunity", "viking-1-lander", "pathfinder-lander"] },
          { category: "ended", artifactIds: ["phoenix", "insight"] },
          { category: "active", artifactIds: ["curiosity", "perseverance"] },
        ],
      },
    ],
  },
  {
    id: "the-legacy",
    theme: "legacy",
    title: { en: "The Legacy", bn: "উত্তরাধিকার" },
    subtitle: { en: "Every mission leaves a story.", bn: "প্রতিটি অভিযান একটি গল্প রেখে যায়।" },
    sections: [
      {
        id: "legacy",
        type: "conclusion",
        title: { en: "Every mission leaves a story.", bn: "প্রতিটি অভিযান একটি গল্প রেখে যায়।" },
        paragraphs: [
          {
            en: "The machines that travelled across hundreds of thousands, and then hundreds of millions, of kilometres represent decades of engineering, patience, and curiosity. Some completed their missions. Some stopped communicating. Some continue working.",
            bn: "যে যন্ত্রগুলো লক্ষ লক্ষ, তারপর কোটি কোটি কিলোমিটার পাড়ি দিয়েছে, তারা কয়েক দশকের প্রকৌশল, ধৈর্য আর কৌতূহলের প্রতিনিধি। কেউ অভিযান সম্পন্ন করেছে। কেউ যোগাযোগ বন্ধ করেছে। কেউ এখনও কাজ করছে।",
          },
          {
            en: "Their stories matter because they document how humanity learned to explore other worlds, and because the evidence is still there, on the Moon and on Mars, at coordinates you can visit.",
            bn: "তাদের গল্প গুরুত্বপূর্ণ, কারণ তা নথিবদ্ধ করে মানুষ কীভাবে অন্য জগৎ অন্বেষণ করতে শিখল, আর কারণ প্রমাণগুলো এখনও সেখানেই আছে—চাঁদে আর মঙ্গলে, এমন স্থানাঙ্কে, যেখানে আপনি যেতে পারেন।",
          },
        ],
      },
      {
        id: "resources",
        type: "resources",
      },
      {
        id: "finale",
        type: "finale",
        kicker: { en: "The story continues on the surface", bn: "গল্প চলতে থাকে পৃষ্ঠে" },
        title: { en: "Where will you go next?", bn: "এরপর কোথায় যাবেন?" },
        body: {
          en: "Choose a world. Every machine in this story is waiting on the globe, at its documented coordinates.",
          bn: "একটি জগৎ বেছে নিন। এই গল্পের প্রতিটি যন্ত্র গোলকে, তার নথিভুক্ত স্থানাঙ্কে, অপেক্ষা করছে।",
        },
        moonImageId: "apollo-17-rover-cernan",
        marsImageId: "curiosity-murray-buttes",
      },
    ],
  },
];

export const storyIssues = validateStoryChapters(storyChapters, {
  missions: catalog.missions,
  objects: catalog.objects,
  sources: catalog.sources,
  events: catalog.events,
  models: artifactModels,
  images: storyImages,
});

if (import.meta.env.DEV && storyIssues.length > 0) {
  console.warn(`Story Mode data has ${storyIssues.length} issue(s):\n${storyIssues.map((issue) => ` - ${issue}`).join("\n")}`);
}
