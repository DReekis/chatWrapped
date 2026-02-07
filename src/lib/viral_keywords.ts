/**
 * Multi-language keyword database for viral audit features
 * Supports: English, Hindi, Hinglish, Tamil, Telugu, Bengali, Marathi
 */

// ===== 🚩 RED FLAG KEYWORDS =====
// Passive-aggressive phrases, concerning patterns
export const redFlagKeywords = {
    // English
    en: [
        'fine', 'whatever', 'k', 'okay then', 'do what you want',
        'we need to talk', 'you always', 'you never', 'i dont care',
        'leave me alone', 'forget it', 'nevermind', 'its nothing',
        'im fine', 'sure', 'if you say so', 'you tell me',
        'nothing', 'its okay', 'dont worry about it'
    ],
    // Hindi
    hi: [
        'theek hai', 'ठीक है', 'kuch nahi', 'कुछ नहीं', 'jo marzi',
        'जो मर्ज़ी', 'mujhe kya', 'मुझे क्या', 'chhod do', 'छोड़ दो',
        'rehne do', 'रहने दो', 'koi baat nahi', 'कोई बात नहीं',
        'tum hamesha', 'तुम हमेशा', 'tum kabhi nahi', 'तुम कभी नहीं',
        'mujhe farak nahi padta', 'jaisa tumhe theek lage', 'mat karo',
        'hmm', 'haan haan', 'acha', 'acha theek hai', 'dekh lenge',
        'jo ho raha hai hone do', 'meri kisiko parwah nahi'
    ],
    // Tamil
    ta: [
        'சரி', 'sari', 'paravailla', 'பரவாயில்ல', 'onnum illa',
        'ஒன்னும் இல்ல', 'vidunga', 'விடுங்க', 'podhum', 'போதும்',
        'enna venumnaalum pannunga', 'unga ishtam', 'ok ok'
    ],
    // Telugu
    te: [
        'సరే', 'sare', 'parledu', 'పర్లేదు', 'em ledu', 'ఏం లేదు',
        'vaddu', 'వద్దు', 'nee ishtam', 'నీ ఇష్టం', 'chalu', 'చాలు'
    ],
    // Bengali
    bn: [
        'thik ache', 'ঠিক আছে', 'kichu na', 'কিছু না', 'jeta khushi',
        'যেটা খুশি', 'chere dao', 'ছেড়ে দাও', 'hoye gelo', 'হয়ে গেল'
    ],
    // Marathi
    mr: [
        'ठीक आहे', 'theek aahe', 'काही नाही', 'kahi nahi', 'तुझी मर्जी',
        'tuzhi marzi', 'सोड', 'sod', 'rahude', 'राहू दे'
    ]
};

// ===== 😅 APOLOGY KEYWORDS =====
export const apologyKeywords = {
    en: [
        'sorry', 'my bad', 'i was wrong', 'forgive me', 'i apologize',
        'my fault', 'i messed up', 'i shouldnt have', 'im an idiot',
        'please forgive', 'i didnt mean', 'wont happen again'
    ],
    hi: [
        'sorry', 'maaf karo', 'माफ़ करो', 'meri galti', 'मेरी गलती',
        'galti ho gayi', 'गलती हो गई', 'please maan jao', 'mujhe maaf kardo',
        'sorry yaar', 'sorry baba', 'sorry jaan', 'sorry baby',
        'galti se', 'dobara nahi hoga', 'i know galti meri hai',
        'maafi', 'माफी', 'maan ja na', 'please please please'
    ],
    ta: [
        'sorry', 'mannikanum', 'மன்னிக்கணும்', 'en thappu',
        'என் தப்பு', 'mannichu', 'மன்னிச்சு'
    ],
    te: [
        'sorry', 'kshaminchhandi', 'క్షమించండి', 'na thappu',
        'నా తప్పు', 'sorry ra', 'sorry cheppu'
    ],
    bn: [
        'sorry', 'maaf koro', 'মাফ করো', 'amar bhul', 'আমার ভুল',
        'bhul hoye geche', 'ভুল হয়ে গেছে'
    ],
    mr: [
        'sorry', 'maaf kar', 'माफ कर', 'माझी चूक', 'mazhi chuk',
        'चुकले मी', 'chukle mi'
    ]
};

// ===== 👀 JEALOUSY KEYWORDS =====
export const jealousyKeywords = {
    en: [
        'who is that', 'whos that', 'who was that', 'where are you',
        'who are you with', 'why didnt you reply', 'who called',
        'who texted', 'who is she', 'who is he', 'just a friend',
        'are you cheating', 'do you still love me', 'you dont care',
        'why are you ignoring', 'with whom', 'whose number'
    ],
    hi: [
        'kaun hai', 'कौन है', 'kaun tha', 'कौन था', 'kaun thi', 'कौन थी',
        'kahan ho', 'कहाँ हो', 'kiske saath ho', 'किसके साथ हो',
        'reply kyun nahi kiya', 'kisne call kiya', 'ye kaun hai',
        'sirf friend hai', 'mujhe bataya nahi', 'sach bol',
        'tu mujhse pyaar karti hai', 'kya chal raha hai',
        'bata kyun nahi rahi', 'sunna', 'bol na', 'kaha gayab ho'
    ],
    ta: [
        'yaaru adhu', 'யாரு அது', 'enga iruka', 'எங்க இருக்க',
        'yaarkuda iruntha', 'யார்கூட இருந்த', 'yaaru call panna',
        'friend thaan', 'உண்மையா சொல்லு', 'unmaiya sollu'
    ],
    te: [
        'evaru', 'ఎవరు', 'ekkada unnav', 'ఎక్కడ ఉన్నావ్',
        'evari tho unnav', 'ఎవరితో ఉన్నావ్', 'evaru call chesaru',
        'nijam cheppu', 'నిజం చెప్పు', 'friend ey', 'ఫ్రెండ్ ఏ'
    ],
    bn: [
        'ke eta', 'কে এটা', 'kothai acho', 'কোথায় আছো',
        'kar sathe', 'কার সাথে', 'ke call korlo', 'সত্যি বল',
        'shotti bol'
    ],
    mr: [
        'kon aahe', 'कोण आहे', 'kuthe aahe', 'कुठे आहे',
        'konasathi', 'कोणासाठी', 'khara sang', 'खरं सांग'
    ]
};

// ===== ✨ SELF-FOCUSED KEYWORDS (Main Character) =====
export const selfFocusedKeywords = {
    en: [
        'i think', 'i feel', 'i want', 'i need', 'my day',
        'i did', 'i went', 'i saw', 'happened to me', 'i was',
        'let me tell you', 'listen to me', 'you know what i',
        'about me', 'for me', 'myself'
    ],
    hi: [
        'mujhe', 'मुझे', 'main', 'मैं', 'mera', 'मेरा', 'meri', 'मेरी',
        'maine', 'मैंने', 'mere saath', 'मेरे साथ', 'mere baare mein',
        'sun na', 'meri baat sun', 'aaj mera', 'mujhe lagta hai',
        'mujhe chahiye', 'mere liye'
    ],
    ta: [
        'naan', 'நான்', 'enakku', 'எனக்கு', 'en', 'என்',
        'ennoda', 'என்னோட', 'nan nenaikiren', 'நான் நெனைக்கிறேன்'
    ],
    te: [
        'nenu', 'నేను', 'naaku', 'నాకు', 'naa', 'నా',
        'naakosam', 'నాకోసం'
    ],
    bn: [
        'ami', 'আমি', 'amar', 'আমার', 'amake', 'আমাকে',
        'amar kotha', 'আমার কথা'
    ],
    mr: [
        'mi', 'मी', 'mala', 'मला', 'mazha', 'माझा',
        'mazhi', 'माझी', 'majhyasathi', 'माझ्यासाठी'
    ]
};

// ===== 💀 CONVERSATION KILLER KEYWORDS =====
export const convoKillerKeywords = {
    en: [
        'ok', 'k', 'hmm', 'yeah', 'yep', 'nope', 'cool', 'nice',
        'lol', 'haha', 'oh', 'ohh', 'ohhh', 'mhm', 'ig', 'idk',
        'sure', 'kk', 'yaa', 'yup', 'nah', 'alright', 'gotcha',
        'bet', 'facts', 'true', 'same', 'ikr', 'fr'
    ],
    hi: [
        'ok', 'k', 'hmm', 'haan', 'हाँ', 'nahi', 'नहीं', 'acha',
        'अच्छा', 'theek', 'ठीक', 'haha', 'lol', 'ji', 'जी',
        'ho', 'हो', 'ha ha', 'hehe', 'ohh', 'hmmmm', 'kk',
        'achaa', 'okkk', 'haaa', 'naah', 'nice yaar', 'badhiya'
    ],
    ta: [
        'ok', 'hmm', 'sari', 'சரி', 'aama', 'ஆமா', 'illa', 'இல்ல',
        'lol', 'haha', 'mm', 'theriudhu', 'theriyum'
    ],
    te: [
        'ok', 'hmm', 'sare', 'సరే', 'avunu', 'అవును', 'ledu', 'లేదు',
        'lol', 'haha', 'aa', 'oo'
    ],
    bn: [
        'ok', 'hmm', 'haan', 'হ্যাঁ', 'na', 'না', 'accha', 'আচ্ছা',
        'lol', 'haha', 'ki', 'কি'
    ],
    mr: [
        'ok', 'hmm', 'ho', 'हो', 'nahi', 'नाही', 'bara', 'बरा',
        'lol', 'haha'
    ]
};

// ===== 💕 LOVE/AFFECTION KEYWORDS (for compatibility) =====
export const loveKeywords = {
    en: [
        'i love you', 'love you', 'love u', 'luv u', 'ily',
        'miss you', 'miss u', 'missing you', 'i miss u',
        'you mean everything', 'youre the best', 'my love',
        'cant live without you', 'forever', 'always yours',
        'dream about you', 'think about you', 'youre amazing',
        'perfect', 'beautiful', 'handsome', 'gorgeous', 'cutie',
        'need you', 'want you', 'only you', 'my everything'
    ],
    hi: [
        'i love you', 'love you', 'pyaar', 'प्यार', 'pyar karta',
        'pyar karti', 'bahut pyaar', 'बहुत प्यार', 'miss you',
        'yaad aa rahi', 'याद आ रही', 'yaad aata hai', 'jaan', 'जान',
        'baby', 'babe', 'jaanu', 'जानू', 'shona', 'sweetheart',
        'meri jaan', 'मेरी जान', 'love you jaan', 'bohot miss kiya',
        'tum meri zindagi ho', 'sirf tumse pyaar', 'forever tumhara',
        'pagal hu tere liye', 'tujhe kitna chahte', 'dil mein rehti ho'
    ],
    ta: [
        'love you', 'kaadhal', 'காதல்', 'kannamma', 'கண்ணம்மா',
        'miss you', 'nhayabagam', 'ஞாபகம்', 'uyire', 'உயிரே',
        'thangam', 'தங்கம்', 'love pannuren', 'miss panren'
    ],
    te: [
        'love you', 'prema', 'ప్రేమ', 'miss you', 'neeku ishtam',
        'నీకు ఇష్టం', 'nuvvu naaku', 'నువ్వు నాకు', 'bangaram',
        'బంగారం', 'love chestunna', 'miss avuthunna'
    ],
    bn: [
        'love you', 'bhalobashi', 'ভালোবাসি', 'miss you',
        'tomake miss korchi', 'তোমাকে মিস করছি', 'sona', 'সোনা',
        'mon', 'মন', 'priya', 'প্রিয়', 'shudhu tumi', 'শুধু তুমি'
    ],
    mr: [
        'love you', 'prem', 'प्रेम', 'miss you', 'aathvan yet',
        'आठवण येत', 'maazi jaan', 'माझी जान', 'sonu', 'सोनू',
        'khup prem karto', 'खूप प्रेम करतो'
    ]
};

// ===== 😈 FLIRTY KEYWORDS =====
export const flirtyKeywords = {
    en: [
        'cutie', 'hottie', 'sexy', 'wanna hang', 'come over',
        'thinking of you', 'wish you were here', 'cuddle',
        'kiss', 'hug', 'wink', ';)', ':*', '😘', '😏', '🥵',
        'date night', 'movie night', 'just us', 'all mine'
    ],
    hi: [
        'aaja na', 'आजा ना', 'milna hai', 'मिलना है', 'kab mil rahe',
        'ghar pe akele', 'kiss', 'hug', 'gale lagao', 'गले लगाओ',
        'bahut cute', 'बहुत cute', 'sexy lag rahi', 'meri cutie',
        'aaj raat', 'आज रात', 'sirf hum dono', 'तेरे बिना',
        'tere bina', 'cuddle karna hai', '😘', '😏', '🥰'
    ],
    ta: [
        'cutie', 'azhaga', 'அழகா', 'vaanga', 'வாங்க',
        'kiss', 'hug', 'eppo paakalam', 'எப்போ பாக்கலாம்'
    ],
    te: [
        'cutie', 'andanga', 'అందంగా', 'raava', 'రావా',
        'kiss', 'hug', 'epudu kaluddam', 'ఎప్పుడు కలుద్దాం'
    ],
    bn: [
        'cutie', 'sundor', 'সুন্দর', 'esho', 'এসো',
        'kiss', 'hug', 'kokhon dekha hobe', 'কখন দেখা হবে'
    ],
    mr: [
        'cutie', 'sundar', 'सुंदर', 'bhetu', 'भेटू',
        'kiss', 'hug', 'kadhi bhetnar', 'कधी भेटणार'
    ]
};

// ===== HELPER FUNCTIONS =====

/**
 * Get all keywords for a category across all languages
 */
export function getAllKeywords(category: Record<string, string[]>): string[] {
    return Object.values(category).flat();
}

/**
 * Count keyword matches in text (case-insensitive)
 */
export function countKeywordMatches(text: string, keywords: string[]): number {
    const lowerText = text.toLowerCase();
    return keywords.filter(keyword =>
        lowerText.includes(keyword.toLowerCase())
    ).length;
}

/**
 * Check if text contains any keyword from category
 */
export function containsKeyword(text: string, category: Record<string, string[]>): boolean {
    const allKeywords = getAllKeywords(category);
    const lowerText = text.toLowerCase();
    return allKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
}

/**
 * Get matching keywords from text
 */
export function getMatchingKeywords(text: string, category: Record<string, string[]>): string[] {
    const allKeywords = getAllKeywords(category);
    const lowerText = text.toLowerCase();
    return allKeywords.filter(keyword => lowerText.includes(keyword.toLowerCase()));
}
