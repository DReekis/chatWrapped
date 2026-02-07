// Multi-Language Sentiment Dictionary for Ishq Audit 2026
// Covers: English, Hinglish, Spanish, French, Marathi, Bengali, Tamil, Telugu + Gen Z Slang

export interface SentimentCategory {
  romance: string[];
  fight: string[];
  food: string[];
  marriage: string[];
  waiting: string[];
}

export interface GlobalSentiment {
  [languageCode: string]: SentimentCategory;
}

export const globalSentiment: GlobalSentiment = {
  // English (Global)
  en: {
    romance: [
      "love", "baby", "babe", "honey", "sweetheart", "darling", "cutie",
      "beautiful", "handsome", "miss you", "miss u", "i love you", "ily",
      "forever", "heart", "kiss", "hug", "cuddle", "date", "together",
      "boyfriend", "girlfriend", "boo", "my love", "angel", "precious"
    ],
    fight: [
      "angry", "mad", "upset", "fight", "argue", "leave me alone", "go away",
      "hate", "stupid", "idiot", "block", "break up", "done", "over",
      "whatever", "fine", "bye", "goodbye", "sorry", "apologize", "forgive"
    ],
    food: [
      "hungry", "food", "eat", "lunch", "dinner", "breakfast", "snack",
      "pizza", "burger", "coffee", "restaurant", "order", "cook", "recipe",
      "yummy", "delicious", "starving", "takeout", "delivery"
    ],
    marriage: [
      "marry", "wedding", "engagement", "ring", "proposal", "future",
      "forever", "kids", "children", "family", "parents", "husband", "wife",
      "settle down", "move in", "live together"
    ],
    waiting: [
      "wait", "waiting", "where are you", "coming", "late", "hurry",
      "reply", "respond", "online", "seen", "read", "busy", "free"
    ]
  },

  // Hinglish (India - North)
  hi: {
    romance: [
      "babu", "shona", "jaan", "jaanu", "baby", "pyar", "ishq", "mohabbat",
      "dil", "meri jaan", "sweety", "cutie", "sona", "pagal", "miss u",
      "miss kiya", "love you", "yaad", "sapna", "chand", "sitara",
      "janeman", "dilruba", "mashallah", "kya baat hai"
    ],
    fight: [
      "gussa", "naraz", "pagal", "stupid", "bewakoof", "block", "break up",
      "mat baat karo", "dur raho", "khatam", "over", "jane do", "chod do",
      "bakwas", "jhagda", "problem", "sorry", "maaf karo", "galti"
    ],
    food: [
      "khana", "bhook", "khana khaya", "zomato", "swiggy", "biryani",
      "chai", "coffee", "lunch", "dinner", "breakfast", "nashta", "momos",
      "pizza", "burger", "roti", "daal", "sabzi", "pakora", "samosa"
    ],
    marriage: [
      "shaadi", "wedding", "mummy", "papa", "parents", "future", "rishta",
      "wife", "husband", "ghar", "family", "biwi", "pati", "dulhan",
      "dulha", "mangalsutra", "mehendi", "sangeet", "haldi"
    ],
    waiting: [
      "kaha ho", "kidhar ho", "aao", "jaldi", "late", "reply karo",
      "online ho", "busy ho", "free ho", "baat karo", "call karo",
      "message karo", "seen karke", "blue tick"
    ]
  },

  // Spanish (Global - Viral)
  es: {
    romance: [
      "amor", "bebe", "te amo", "te quiero", "corazon", "mi vida",
      "cariño", "hermosa", "hermoso", "guapo", "guapa", "linda", "lindo",
      "beso", "besito", "abrazo", "te extraño", "mi amor", "preciosa",
      "cielo", "princesa", "rey", "reina"
    ],
    fight: [
      "pelea", "enojado", "enojada", "molesto", "triste", "dejame",
      "vete", "estupido", "idiota", "terminamos", "adios", "perdon",
      "lo siento", "disculpa", "problema", "mal", "odio"
    ],
    food: [
      "comida", "hambre", "comer", "almuerzo", "cena", "desayuno",
      "pizza", "tacos", "restaurante", "cocinar", "delicioso", "rico"
    ],
    marriage: [
      "casarnos", "boda", "matrimonio", "anillo", "familia", "esposo",
      "esposa", "futuro", "hijos", "padres", "mama", "papa", "suegra"
    ],
    waiting: [
      "espera", "donde estas", "llegas", "tarde", "rapido", "responde",
      "mensaje", "conectado", "ocupado", "libre"
    ]
  },

  // French (Global)
  fr: {
    romance: [
      "amour", "cheri", "cherie", "je t'aime", "bisous", "bebe",
      "mon coeur", "ma vie", "mon amour", "belle", "beau", "magnifique",
      "tu me manques", "calin", "tendresse", "passion", "romantique"
    ],
    fight: [
      "fache", "en colere", "triste", "dispute", "probleme", "laisse moi",
      "va-t-en", "idiot", "stupide", "c'est fini", "au revoir", "pardon",
      "desole", "excuse moi"
    ],
    food: [
      "manger", "faim", "dejeuner", "diner", "petit dejeuner", "cuisine",
      "restaurant", "delicieux", "croissant", "cafe", "vin"
    ],
    marriage: [
      "mariage", "fiancailles", "bague", "famille", "mari", "femme",
      "enfants", "parents", "maman", "papa", "avenir"
    ],
    waiting: [
      "attends", "ou es-tu", "en retard", "vite", "reponds", "message",
      "connecte", "occupe", "libre"
    ]
  },

  // Marathi (India - Romanized & Script)
  mr: {
    romance: [
      "pillu", "sona", "jeev", "prem", "shona", "babu", "mazha", "mazhi",
      "sakhya", "gulabi", "rani", "raja", "जीव", "प्रेम", "सोना", "पिल्लू",
      "miss karte", "aavdto", "aavdte", "sundar"
    ],
    fight: [
      "rag", "raag", "nako", "bas", "chup", "dok", "khau", "tras",
      "राग", "नको", "बस", "चूप", "problem", "jhagda", "sorry",
      "maaf kar", "galti", "चुकी"
    ],
    food: [
      "jevan", "khalla", "bhuk", "jewle", "khato", "जेवण", "खाल्लं",
      "भूक", "vada pav", "misal", "pohe", "chai", "coffee", "biryani"
    ],
    marriage: [
      "lagna", "navra", "bayko", "future", "aai", "baba", "लग्न",
      "नवरा", "बायको", "आई", "बाबा", "family", "ghar", "संसार"
    ],
    waiting: [
      "kuthe", "kuthay", "ye", "jaldi", "late", "reply kar", "busy",
      "free", "कुठे", "ये", "जल्दी"
    ]
  },

  // Bengali (India - Romanized & Script)
  bn: {
    romance: [
      "bhalobashi", "shona", "babu", "jan", "kolija", "mon", "tumi",
      "ভালোবাসি", "সোনা", "বাবু", "জান", "মন", "তুমি",
      "miss korchi", "sundor", "সুন্দর", "prem", "প্রেম"
    ],
    fight: [
      "rag", "matha", "kharap", "ja", "birokto", "dur", "রাগ", "মাথা",
      "খারাপ", "যা", "বিরক্ত", "দূর", "sorry", "maaf koro"
    ],
    food: [
      "kheyecho", "khabar", "bhat", "biryani", "khabo", "খেয়েছ",
      "খাবার", "ভাত", "বিরিয়ানি", "খাবো", "rosogolla", "mishti"
    ],
    marriage: [
      "biye", "bou", "bor", "shongshar", "ma", "baba", "বিয়ে", "বউ",
      "বর", "সংসার", "মা", "বাবা", "family", "ghor"
    ],
    waiting: [
      "kothay", "esho", "jaldi", "late", "reply", "busy", "free",
      "কোথায়", "এসো", "জল্দি"
    ]
  },

  // Tamil (India - Romanized & Script)
  ta: {
    romance: [
      "chellam", "pattu", "anbu", "kadhal", "love", "baby", "di", "da",
      "செல்லம்", "பட்டு", "அன்பு", "காதல்", "thangam", "தங்கம்",
      "kannu", "கண்ணு", "roja", "ரோஜா"
    ],
    fight: [
      "kovam", "poda", "podi", "loos", "venam", "po", "கோவம்", "போடா",
      "போடி", "வேண்டாம்", "போ", "sorry", "problem"
    ],
    food: [
      "saptiya", "sapadu", "biryani", "pasi", "lunch", "சாப்டியா",
      "சாப்பாடு", "பசி", "dosa", "idli", "filter coffee"
    ],
    marriage: [
      "kalyanam", "pondati", "purushan", "future", "veedu", "கல்யாணம்",
      "பொண்டாட்டி", "புருஷன்", "வீடு", "amma", "appa", "அம்மா", "அப்பா"
    ],
    waiting: [
      "enga", "va", "vendam", "late", "reply pannu", "busy", "free",
      "எங்க", "வா"
    ]
  },

  // Telugu (India - Romanized & Script)
  te: {
    romance: [
      "bangaram", "prema", "love", "kanna", "babu", "bujjulu", "బంగారం",
      "ప్రేమ", "కన్నా", "బాబు", "బుజ్జులు", "chinni", "చిన్ని",
      "miss avutunna", "మిస్"
    ],
    fight: [
      "kopam", "oddu", "chiraaku", "po", "maata", "కోపం", "వద్దు",
      "చిరాకు", "పో", "మాట", "sorry", "problem"
    ],
    food: [
      "thinnava", "thindi", "bhojanam", "aakali", "తిన్నావా", "తిండి",
      "భోజనం", "ఆకలి", "biryani", "dosa", "idli"
    ],
    marriage: [
      "pelli", "mogudu", "pellam", "family", "పెళ్లి", "మొగుడు",
      "పెళ్ళాం", "amma", "nanna", "అమ్మ", "నాన్న"
    ],
    waiting: [
      "ekkada", "ra", "raa", "late", "reply", "busy", "free",
      "ఎక్కడ", "రా"
    ]
  }
};

// Gen Z Slang (Universal - added to all analyses)
export const slangDictionary: string[] = [
  // Relationship slang
  "delulu", "solulu", "red flag", "green flag", "beige flag", "ick",
  "situationship", "talking stage", "ghosting", "breadcrumbing",

  // General Gen Z
  "rizz", "cooked", "ate", "slay", "no cap", "based", "snatched",
  "periodt", "sending", "lowkey", "highkey", "vibes", "bussin",
  "mid", "sus", "bet", "tea", "spill", "main character", "npc",
  "toxic", "gaslight", "gatekeep", "girlboss", "pick me",

  // Internet culture
  "bruh", "bestie", "understood the assignment", "lives rent free",
  "its giving", "core", "era", "coded", "canon", "ship"
];

// Language code to display name mapping
export const languageNames: Record<string, string> = {
  en: "English",
  hi: "Hinglish",
  es: "Spanish",
  fr: "French",
  mr: "Marathi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu"
};

// SEO titles by language
export const seoTitles: Record<string, string> = {
  en: "ChatWrapped 2026 - Who Loves Who More?",
  hi: "ChatWrapped 2026 - सच्चा प्यार या Timepass?",
  es: "ChatWrapped 2026 - ¿Quién ama más?",
  fr: "ChatWrapped 2026 - Qui aime le plus?",
  mr: "ChatWrapped 2026 - खरं प्रेम की टाईमपास?",
  bn: "ChatWrapped 2026 - সত্যিকারের ভালোবাসা?",
  ta: "ChatWrapped 2026 - உண்மையான காதலா?",
  te: "ChatWrapped 2026 - నిజమైన ప్రేमा?"
};

// A/B testing title variants for landing page
export const landingPageTitles: string[] = [
  "Your Relationship, Wrapped 💕",
  "Who Loves Who More? Find Out Now",
  "100% Private - Works in Airplane Mode ✈️",
  "The Viral Couple Test of 2026"
];

export default globalSentiment;
