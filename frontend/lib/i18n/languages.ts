export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

// All 193 UN member states' official languages
export const ALL_LANGUAGES: Language[] = [
  // Major World Languages
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  
  // European Languages
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', dir: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', dir: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', dir: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', dir: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', dir: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', dir: 'ltr' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', dir: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺', dir: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴', dir: 'ltr' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬', dir: 'ltr' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷', dir: 'ltr' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸', dir: 'ltr' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰', dir: 'ltr' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮', dir: 'ltr' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪', dir: 'ltr' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', dir: 'ltr' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', dir: 'ltr' },
  { code: 'mt', name: 'Maltese', nativeName: 'Malti', flag: '🇲🇹', dir: 'ltr' },
  { code: 'ga', name: 'Irish', nativeName: 'Gaeilge', flag: '🇮🇪', dir: 'ltr' },
  { code: 'cy', name: 'Welsh', nativeName: 'Cymraeg', flag: '🏴󐁧󐁢󐁷󐁬󐁳󐁿', dir: 'ltr' },
  { code: 'is', name: 'Icelandic', nativeName: 'Íslenska', flag: '🇮🇸', dir: 'ltr' },
  { code: 'sq', name: 'Albanian', nativeName: 'Shqip', flag: '🇦🇱', dir: 'ltr' },
  { code: 'mk', name: 'Macedonian', nativeName: 'Македонски', flag: '🇲🇰', dir: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', dir: 'ltr' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', dir: 'ltr' },
  
  // Asian Languages
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', dir: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', dir: 'ltr' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', dir: 'ltr' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', dir: 'ltr' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', dir: 'ltr' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳', dir: 'ltr' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳', dir: 'ltr' },
  { code: 'si', name: 'Sinhala', nativeName: 'සිංහල', flag: '🇱🇰', dir: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', dir: 'ltr' },
  { code: 'lo', name: 'Lao', nativeName: 'ລາວ', flag: '🇱🇦', dir: 'ltr' },
  { code: 'my', name: 'Myanmar', nativeName: 'မြန်မာ', flag: '🇲🇲', dir: 'ltr' },
  { code: 'ka', name: 'Georgian', nativeName: 'ქართული', flag: '🇬🇪', dir: 'ltr' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' },
  { code: 'km', name: 'Khmer', nativeName: 'ខ្មែរ', flag: '🇰🇭', dir: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', dir: 'ltr' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', dir: 'ltr' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭', dir: 'ltr' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', dir: 'ltr' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', dir: 'rtl' },
  { code: 'ps', name: 'Pashto', nativeName: 'پښتو', flag: '🇦🇫', dir: 'rtl' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', flag: '🇵🇰', dir: 'rtl' },
  
  // Central Asian Languages
  { code: 'kk', name: 'Kazakh', nativeName: 'Қазақша', flag: '🇰🇿', dir: 'ltr' },
  { code: 'uz', name: 'Uzbek', nativeName: 'Oʻzbek', flag: '🇺🇿', dir: 'ltr' },
  { code: 'ky', name: 'Kyrgyz', nativeName: 'Кыргызча', flag: '🇰🇬', dir: 'ltr' },
  { code: 'tg', name: 'Tajik', nativeName: 'Тоҷикӣ', flag: '🇹🇯', dir: 'ltr' },
  { code: 'tk', name: 'Turkmen', nativeName: 'Türkmen', flag: '🇹🇲', dir: 'ltr' },
  { code: 'mn', name: 'Mongolian', nativeName: 'Монгол', flag: '🇲🇳', dir: 'ltr' },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', flag: '🇳🇵', dir: 'ltr' },
  { code: 'bo', name: 'Tibetan', nativeName: 'བོད་སྐད་', flag: '🇨🇳', dir: 'ltr' },
  { code: 'dz', name: 'Dzongkha', nativeName: 'རྫོང་ཁ', flag: '🇧🇹', dir: 'ltr' },
  { code: 'az', name: 'Azerbaijani', nativeName: 'Azərbaycan', flag: '🇦🇿', dir: 'ltr' },
  { code: 'hy', name: 'Armenian', nativeName: 'Հայերեն', flag: '🇦🇲', dir: 'ltr' },
  { code: 'ku', name: 'Kurdish', nativeName: 'Kurdî', flag: '🇮🇶', dir: 'ltr' },
  
  // African Languages
  { code: 'so', name: 'Somali', nativeName: 'Soomaali', flag: '🇸🇴', dir: 'ltr' },
  { code: 'ti', name: 'Tigrinya', nativeName: 'ትግርኛ', flag: '🇪🇷', dir: 'ltr' },
  { code: 'om', name: 'Oromo', nativeName: 'Oromoo', flag: '🇪🇹', dir: 'ltr' },
  { code: 'aa', name: 'Afar', nativeName: 'Afaraf', flag: '🇪🇹', dir: 'ltr' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬', dir: 'ltr' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬', dir: 'ltr' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬', dir: 'ltr' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', flag: '🇿🇦', dir: 'ltr' },
  { code: 'xh', name: 'Xhosa', nativeName: 'isiXhosa', flag: '🇿🇦', dir: 'ltr' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦', dir: 'ltr' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', dir: 'ltr' },
  { code: 'mg', name: 'Malagasy', nativeName: 'Malagasy', flag: '🇲🇬', dir: 'ltr' },
  { code: 'sn', name: 'Shona', nativeName: 'chiShona', flag: '🇿🇼', dir: 'ltr' },
  { code: 'ny', name: 'Chichewa', nativeName: 'Chichewa', flag: '🇲🇼', dir: 'ltr' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda', flag: '🇷🇼', dir: 'ltr' },
  { code: 'rn', name: 'Kirundi', nativeName: 'Kirundi', flag: '🇧🇮', dir: 'ltr' },
  { code: 'kg', name: 'Kongo', nativeName: 'Kikongo', flag: '🇨🇩', dir: 'ltr' },
  { code: 'ln', name: 'Lingala', nativeName: 'Lingála', flag: '🇨🇩', dir: 'ltr' },
  { code: 'lu', name: 'Luba-Katanga', nativeName: 'Tshiluba', flag: '🇨🇩', dir: 'ltr' },
  { code: 'ts', name: 'Tsonga', nativeName: 'Xitsonga', flag: '🇿🇦', dir: 'ltr' },
  { code: 'ss', name: 'Swati', nativeName: 'siSwati', flag: '🇸🇿', dir: 'ltr' },
  { code: 'tn', name: 'Tswana', nativeName: 'Setswana', flag: '🇧🇼', dir: 'ltr' },
  { code: 'st', name: 'Southern Sotho', nativeName: 'Sesotho', flag: '🇱🇸', dir: 'ltr' },
  { code: 'nso', name: 'Northern Sotho', nativeName: 'Sepedi', flag: '🇿🇦', dir: 'ltr' },
  { code: 've', name: 'Venda', nativeName: 'Tshivenḓa', flag: '🇿🇦', dir: 'ltr' },
  { code: 'nr', name: 'Southern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇦', dir: 'ltr' },
  { code: 'nd', name: 'Northern Ndebele', nativeName: 'isiNdebele', flag: '🇿🇼', dir: 'ltr' },
  
  // Pacific Languages
  { code: 'fj', name: 'Fijian', nativeName: 'Vosa Vakaviti', flag: '🇫🇯', dir: 'ltr' },
  { code: 'to', name: 'Tongan', nativeName: 'Lea fakatonga', flag: '🇹🇴', dir: 'ltr' },
  { code: 'sm', name: 'Samoan', nativeName: 'Gagana Samoa', flag: '🇼🇸', dir: 'ltr' },
  { code: 'mi', name: 'Māori', nativeName: 'Te Reo Māori', flag: '🇳🇿', dir: 'ltr' },
  { code: 'haw', name: 'Hawaiian', nativeName: 'ʻŌlelo Hawaiʻi', flag: '🇺🇸', dir: 'ltr' },
  { code: 'ty', name: 'Tahitian', nativeName: 'Reo Tahiti', flag: '🇵🇫', dir: 'ltr' },
  { code: 'mh', name: 'Marshallese', nativeName: 'Kajin M̧ajeļ', flag: '🇲🇭', dir: 'ltr' },
  { code: 'tvl', name: 'Tuvaluan', nativeName: 'Te Ggana Tuuvalu', flag: '🇹🇻', dir: 'ltr' },
  { code: 'nau', name: 'Nauruan', nativeName: 'Dorerin Naoero', flag: '🇳🇷', dir: 'ltr' },
  { code: 'bi', name: 'Bislama', nativeName: 'Bislama', flag: '🇻🇺', dir: 'ltr' },
  { code: 'tpi', name: 'Tok Pisin', nativeName: 'Tok Pisin', flag: '🇵🇬', dir: 'ltr' },
  { code: 'ho', name: 'Hiri Motu', nativeName: 'Hiri Motu', flag: '🇵🇬', dir: 'ltr' },
  { code: 'gil', name: 'Gilbertese', nativeName: 'Taetae ni Kiribati', flag: '🇰🇮', dir: 'ltr' },
  { code: 'niu', name: 'Niuean', nativeName: 'ko e vagahau Niuē', flag: '🇳🇺', dir: 'ltr' },
  { code: 'tkl', name: 'Tokelauan', nativeName: 'Tokelau', flag: '🇹🇰', dir: 'ltr' },
  { code: 'pau', name: 'Palauan', nativeName: 'a tekoi er a Belau', flag: '🇵🇼', dir: 'ltr' },
  { code: 'ch', name: 'Chamorro', nativeName: 'Chamoru', flag: '🇬🇺', dir: 'ltr' },
  
  // Caribbean Languages
  { code: 'pap', name: 'Papiamento', nativeName: 'Papiamentu', flag: '🇦🇼', dir: 'ltr' },
  { code: 'srn', name: 'Sranan Tongo', nativeName: 'Sranan', flag: '🇸🇷', dir: 'ltr' },
  { code: 'ht', name: 'Haitian Creole', nativeName: 'Kreyòl ayisyen', flag: '🇭🇹', dir: 'ltr' },
  
  // South American Indigenous Languages
  { code: 'qu', name: 'Quechua', nativeName: 'Runasimi', flag: '🇵🇪', dir: 'ltr' },
  { code: 'ay', name: 'Aymara', nativeName: 'Aymar aru', flag: '🇧🇴', dir: 'ltr' },
  { code: 'gn', name: 'Guarani', nativeName: 'Avañeʼẽ', flag: '🇵🇾', dir: 'ltr' },
  
  // North American Indigenous Languages
  { code: 'nah', name: 'Nahuatl', nativeName: 'Nāhuatl', flag: '🇲🇽', dir: 'ltr' },
  { code: 'myn', name: 'Maya', nativeName: 'Maya', flag: '🇲🇽', dir: 'ltr' },
  { code: 'grn', name: 'Greenlandic', nativeName: 'Kalaallisut', flag: '🇬🇱', dir: 'ltr' },
  
  // Regional Languages
  { code: 'eu', name: 'Basque', nativeName: 'Euskera', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ca', name: 'Catalan', nativeName: 'Català', flag: '🇪🇸', dir: 'ltr' },
  { code: 'gl', name: 'Galician', nativeName: 'Galego', flag: '🇪🇸', dir: 'ltr' },
  { code: 'ast', name: 'Asturian', nativeName: 'Asturianu', flag: '🇪🇸', dir: 'ltr' },
  { code: 'an', name: 'Aragonese', nativeName: 'Aragonés', flag: '🇪🇸', dir: 'ltr' },
  { code: 'oc', name: 'Occitan', nativeName: 'Occitan', flag: '🇫🇷', dir: 'ltr' },
  { code: 'co', name: 'Corsican', nativeName: 'Corsu', flag: '🇫🇷', dir: 'ltr' },
  { code: 'br', name: 'Breton', nativeName: 'Brezhoneg', flag: '🇫🇷', dir: 'ltr' },
  { code: 'gd', name: 'Scottish Gaelic', nativeName: 'Gàidhlig', flag: '🏴󐁧󐁢󐁳󐁣󐁴󐁿', dir: 'ltr' },
  { code: 'kw', name: 'Cornish', nativeName: 'Kernewek', flag: '🇬🇧', dir: 'ltr' },
  { code: 'gv', name: 'Manx', nativeName: 'Gaelg', flag: '🇮🇲', dir: 'ltr' },
  { code: 'sc', name: 'Sardinian', nativeName: 'Sardu', flag: '🇮🇹', dir: 'ltr' },
  { code: 'nap', name: 'Neapolitan', nativeName: 'Napulitano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'scn', name: 'Sicilian', nativeName: 'Sicilianu', flag: '🇮🇹', dir: 'ltr' },
  { code: 'vec', name: 'Venetian', nativeName: 'Vèneto', flag: '🇮🇹', dir: 'ltr' },
  { code: 'lij', name: 'Ligurian', nativeName: 'Ligure', flag: '🇮🇹', dir: 'ltr' },
  { code: 'lmo', name: 'Lombard', nativeName: 'Lumbaart', flag: '🇮🇹', dir: 'ltr' },
  { code: 'pms', name: 'Piedmontese', nativeName: 'Piemontèis', flag: '🇮🇹', dir: 'ltr' },
  { code: 'fur', name: 'Friulian', nativeName: 'Furlan', flag: '🇮🇹', dir: 'ltr' },
  { code: 'lad', name: 'Ladino', nativeName: 'Judeo-Español', flag: '🇮🇱', dir: 'ltr' },
  { code: 'rm', name: 'Romansh', nativeName: 'Rumantsch', flag: '🇨🇭', dir: 'ltr' },
  { code: 'lb', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch', flag: '🇱🇺', dir: 'ltr' },
  { code: 'gsw', name: 'Swiss German', nativeName: 'Schwiizerdütsch', flag: '🇨🇭', dir: 'ltr' },
  { code: 'bar', name: 'Bavarian', nativeName: 'Boarisch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'hsb', name: 'Upper Sorbian', nativeName: 'Hornjoserbšćina', flag: '🇩🇪', dir: 'ltr' },
  { code: 'dsb', name: 'Lower Sorbian', nativeName: 'Dolnoserbšćina', flag: '🇩🇪', dir: 'ltr' },
  { code: 'fy', name: 'West Frisian', nativeName: 'Frysk', flag: '🇳🇱', dir: 'ltr' },
  { code: 'li', name: 'Limburgish', nativeName: 'Limburgs', flag: '🇳🇱', dir: 'ltr' },
  { code: 'zea', name: 'Zeelandic', nativeName: 'Zeêuws', flag: '🇳🇱', dir: 'ltr' },
  { code: 'vls', name: 'West Flemish', nativeName: 'West-Vlams', flag: '🇧🇪', dir: 'ltr' },
  { code: 'wa', name: 'Walloon', nativeName: 'Walon', flag: '🇧🇪', dir: 'ltr' },
  { code: 'pfl', name: 'Palatine German', nativeName: 'Pälzisch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ksh', name: 'Colognian', nativeName: 'Kölsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'stq', name: 'Saterland Frisian', nativeName: 'Seeltersk', flag: '🇩🇪', dir: 'ltr' },
  { code: 'nds', name: 'Low German', nativeName: 'Plattdüütsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ang', name: 'Old English', nativeName: 'Ænglisc', flag: '🇬🇧', dir: 'ltr' },
  { code: 'sco', name: 'Scots', nativeName: 'Scots', flag: '🏴󐁧󐁢󐁳󐁣󐁴󐁿', dir: 'ltr' },
  { code: 'szl', name: 'Silesian', nativeName: 'Ślůnski', flag: '🇵🇱', dir: 'ltr' },
  { code: 'csb', name: 'Kashubian', nativeName: 'Kaszëbsczi', flag: '🇵🇱', dir: 'ltr' },
  { code: 'rue', name: 'Rusyn', nativeName: 'Русиньскый', flag: '🇺🇦', dir: 'ltr' },
  
  // Additional Languages
  { code: 'eo', name: 'Esperanto', nativeName: 'Esperanto', flag: '🌐', dir: 'ltr' },
  { code: 'ia', name: 'Interlingua', nativeName: 'Interlingua', flag: '🌐', dir: 'ltr' },
  { code: 'ie', name: 'Interlingue', nativeName: 'Interlingue', flag: '🌐', dir: 'ltr' },
  { code: 'io', name: 'Ido', nativeName: 'Ido', flag: '🌐', dir: 'ltr' },
  { code: 'vo', name: 'Volapük', nativeName: 'Volapük', flag: '🌐', dir: 'ltr' },
  
  // Sign Languages (represented with special codes)
  { code: 'ase', name: 'American Sign Language', nativeName: 'ASL', flag: '🇺🇸', dir: 'ltr' },
  { code: 'bfi', name: 'British Sign Language', nativeName: 'BSL', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fsl', name: 'French Sign Language', nativeName: 'LSF', flag: '🇫🇷', dir: 'ltr' },
  { code: 'dse', name: 'Dutch Sign Language', nativeName: 'NGT', flag: '🇳🇱', dir: 'ltr' },
  { code: 'gsg', name: 'German Sign Language', nativeName: 'DGS', flag: '🇩🇪', dir: 'ltr' },
];

// Export helper functions
export const getLanguageByCode = (code: string): Language | undefined => {
  return ALL_LANGUAGES.find(lang => lang.code === code);
};

export const getRTLLanguages = (): Language[] => {
  return ALL_LANGUAGES.filter(lang => lang.dir === 'rtl');
};

export const getLanguagesByRegion = (region: string): Language[] => {
  // Implementation can be added based on region classification
  return ALL_LANGUAGES;
};

// Total count validation
