const fs = require('fs');
const path = require('path');

// Define ALL_LANGUAGES directly in the script
const ALL_LANGUAGES = [
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

// Base translations template for all languages
const baseTranslations = {
  common: {
    app: {
      name: "Al-Hidaya",
      tagline: "Your Complete Islamic Companion",
      description: "Experience the beauty of Islam with our comprehensive platform"
    },
    auth: {
      signIn: "Sign In",
      signUp: "Sign Up",
      signOut: "Sign Out",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password?",
      rememberMe: "Remember Me",
      createAccount: "Create Account",
      alreadyHaveAccount: "Already have an account?",
      dontHaveAccount: "Don't have an account?",
      orContinueWith: "Or continue with",
      username: "Username",
      fullName: "Full Name"
    },
    navigation: {
      home: "Home",
      quran: "Quran",
      hadith: "Hadith",
      prayerTimes: "Prayer Times",
      qibla: "Qibla",
      calendar: "Calendar",
      zakat: "Zakat",
      learn: "Learn",
      chat: "AI Chat",
      profile: "Profile",
      settings: "Settings",
      about: "About",
      contact: "Contact",
      help: "Help",
      language: "Language"
    },
    hero: {
      welcome: "Welcome to",
      subtitle: "Your spiritual journey starts here",
      features: "with Quran, Hadith, Prayer Times, and more",
      cta: {
        start: "Get Started",
        demo: "Watch Demo",
        learnMore: "Learn More"
      }
    },
    features: {
      quran: {
        title: "Holy Quran",
        description: "Complete Quran with 50+ translations, tafsir, and audio recitations"
      },
      hadith: {
        title: "Hadith Collection",
        description: "Access 40,000+ authentic Hadith from major collections"
      },
      prayerTimes: {
        title: "Prayer Times",
        description: "Accurate prayer times with Adhan notifications"
      },
      qibla: {
        title: "Qibla Direction",
        description: "Accurate Qibla compass with AR view for prayers"
      },
      calendar: {
        title: "Islamic Calendar",
        description: "Hijri calendar with important Islamic dates and events"
      },
      zakat: {
        title: "Zakat Calculator",
        description: "Calculate your Zakat accurately with our smart calculator"
      },
      aiChat: {
        title: "AI Assistant",
        description: "Get instant answers to your Islamic questions"
      }
    },
    buttons: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      submit: "Submit",
      next: "Next",
      previous: "Previous",
      back: "Back",
      continue: "Continue",
      confirm: "Confirm",
      download: "Download",
      share: "Share",
      copy: "Copy",
      refresh: "Refresh",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      viewAll: "View All",
      readMore: "Read More",
      showLess: "Show Less"
    },
    messages: {
      loading: "Loading...",
      error: "An error occurred",
      success: "Success",
      warning: "Warning",
      info: "Information",
      noData: "No data available",
      comingSoon: "Coming Soon",
      underConstruction: "Under Construction",
      maintenance: "Under Maintenance",
      offline: "You are offline",
      online: "You are online",
      saved: "Saved successfully",
      deleted: "Deleted successfully",
      updated: "Updated successfully",
      created: "Created successfully",
      copied: "Copied to clipboard",
      shared: "Shared successfully"
    },
    time: {
      seconds: "seconds",
      minutes: "minutes",
      hours: "hours",
      days: "days",
      weeks: "weeks",
      months: "months",
      years: "years",
      ago: "ago",
      now: "now",
      today: "Today",
      yesterday: "Yesterday",
      tomorrow: "Tomorrow",
      thisWeek: "This Week",
      lastWeek: "Last Week",
      nextWeek: "Next Week",
      thisMonth: "This Month",
      lastMonth: "Last Month",
      nextMonth: "Next Month"
    },
    islamic: {
      bismillah: "In the name of Allah, the Most Gracious, the Most Merciful",
      alhamdulillah: "All praise is due to Allah",
      inshallah: "If Allah wills",
      mashallah: "What Allah has willed",
      subhanallah: "Glory be to Allah",
      allahAkbar: "Allah is the Greatest",
      laIlahaIllallah: "There is no deity but Allah",
      astaghfirullah: "I seek forgiveness from Allah",
      jazakallah: "May Allah reward you",
      assalamuAlaikum: "Peace be upon you",
      walaikumAssalam: "And peace be upon you"
    }
  },
  quran: {
    title: "The Holy Quran",
    search: "Search in Quran",
    searchPlaceholder: "Search by keyword, surah, or verse",
    surah: "Surah",
    verse: "Verse",
    juz: "Juz",
    page: "Page",
    translation: "Translation",
    transliteration: "Transliteration",
    tafsir: "Tafsir",
    audio: "Audio",
    reciter: "Reciter",
    playAudio: "Play Audio",
    pauseAudio: "Pause Audio",
    nextVerse: "Next Verse",
    previousVerse: "Previous Verse",
    bookmark: "Bookmark",
    bookmarked: "Bookmarked",
    removeBookmark: "Remove Bookmark",
    share: "Share Verse",
    copy: "Copy Verse",
    settings: "Reading Settings",
    fontSize: "Font Size",
    theme: "Theme",
    arabicText: "Arabic Text",
    showTranslation: "Show Translation",
    showTransliteration: "Show Transliteration"
  },
  hadith: {
    title: "Hadith Collections",
    search: "Search Hadith",
    searchPlaceholder: "Search by keyword or hadith number",
    collections: "Collections",
    bukhari: "Sahih al-Bukhari",
    muslim: "Sahih Muslim",
    tirmidhi: "Jami at-Tirmidhi",
    abuDawud: "Sunan Abu Dawud",
    nasai: "Sunan an-Nasai",
    ibnMajah: "Sunan Ibn Majah",
    book: "Book",
    hadithNumber: "Hadith Number",
    narrator: "Narrator",
    grade: "Grade",
    sahih: "Authentic",
    hasan: "Good",
    daif: "Weak",
    maudu: "Fabricated",
    reference: "Reference",
    inArabic: "In Arabic",
    translation: "Translation",
    explanation: "Explanation"
  },
  prayer: {
    title: "Prayer Times",
    fajr: "Fajr",
    sunrise: "Sunrise",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    nextPrayer: "Next Prayer",
    timeRemaining: "Time Remaining",
    adhan: "Adhan",
    iqamah: "Iqamah",
    qibla: "Qibla Direction",
    location: "Location",
    method: "Calculation Method",
    notifications: "Prayer Notifications",
    enableNotifications: "Enable Notifications",
    notificationSound: "Notification Sound",
    reminderBefore: "Reminder Before",
    minutes: "minutes"
  },
  zakat: {
    title: "Zakat Calculator",
    calculate: "Calculate Zakat",
    nisab: "Nisab",
    assets: "Assets",
    cash: "Cash",
    gold: "Gold",
    silver: "Silver",
    stocks: "Stocks",
    property: "Property",
    business: "Business",
    debts: "Debts",
    liabilities: "Liabilities",
    totalAssets: "Total Assets",
    zakatDue: "Zakat Due",
    rate: "Zakat Rate",
    eligible: "Eligible for Zakat",
    notEligible: "Not Eligible for Zakat",
    distribution: "Zakat Distribution",
    recipients: "Eligible Recipients",
    history: "Zakat History",
    saveCalculation: "Save Calculation"
  },
  calendar: {
    title: "Islamic Calendar",
    hijri: "Hijri",
    gregorian: "Gregorian",
    today: "Today",
    month: "Month",
    year: "Year",
    muharram: "Muharram",
    safar: "Safar",
    rabiAlAwwal: "Rabi' al-Awwal",
    rabiAlThani: "Rabi' al-Thani",
    jumadaAlAwwal: "Jumada al-Awwal",
    jumadaAlThani: "Jumada al-Thani",
    rajab: "Rajab",
    shaban: "Sha'ban",
    ramadan: "Ramadan",
    shawwal: "Shawwal",
    dhulQadah: "Dhul Qa'dah",
    dhulHijjah: "Dhul Hijjah",
    events: "Islamic Events",
    holidays: "Islamic Holidays",
    addEvent: "Add Event",
    reminder: "Set Reminder"
  },
  settings: {
    title: "Settings",
    general: "General",
    appearance: "Appearance",
    notifications: "Notifications",
    privacy: "Privacy",
    language: "Language",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    autoMode: "Auto",
    fontSize: "Font Size",
    small: "Small",
    medium: "Medium",
    large: "Large",
    account: "Account",
    profile: "Profile",
    changePassword: "Change Password",
    twoFactor: "Two-Factor Authentication",
    deleteAccount: "Delete Account",
    about: "About",
    version: "Version",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    contact: "Contact Us",
    feedback: "Send Feedback",
    rateApp: "Rate App"
  }
};

// Function to create directory structure
function createTranslationStructure() {
  const localesDir = path.join(__dirname, '../public/locales');
  
  // Create main locales directory
  if (!fs.existsSync(localesDir)) {
    fs.mkdirSync(localesDir, { recursive: true });
  }
  
  console.log(`Creating translation structure for ${ALL_LANGUAGES.length} languages...`);
  
  // Create directory and files for each language
  ALL_LANGUAGES.forEach((language, index) => {
    const langDir = path.join(localesDir, language.code);
    
    // Create language directory
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    // Create translation files for each namespace
    Object.keys(baseTranslations).forEach(namespace => {
      const filePath = path.join(langDir, `${namespace}.json`);
      
      // For English, use the base translations as-is
      if (language.code === 'en') {
        fs.writeFileSync(
          filePath,
          JSON.stringify(baseTranslations[namespace], null, 2),
          'utf8'
        );
      } else {
        // For other languages, add a note that translation is needed
        const translationNeeded = addTranslationNote(baseTranslations[namespace], language);
        fs.writeFileSync(
          filePath,
          JSON.stringify(translationNeeded, null, 2),
          'utf8'
        );
      }
    });
    
    // Create a metadata file for each language
    const metadataPath = path.join(langDir, 'metadata.json');
    const metadata = {
      code: language.code,
      name: language.name,
      nativeName: language.nativeName,
      flag: language.flag,
      direction: language.dir,
      translated: language.code === 'en',
      lastUpdated: new Date().toISOString()
    };
    
    fs.writeFileSync(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      'utf8'
    );
    
    console.log(`✓ Created translations for ${language.name} (${language.code}) - ${index + 1}/${ALL_LANGUAGES.length}`);
  });
  
  console.log('\n✅ Translation structure created successfully!');
  console.log(`📁 Total languages: ${ALL_LANGUAGES.length}`);
  console.log(`📂 Location: ${localesDir}`);
}

// Helper function to add translation notes
function addTranslationNote(obj, language) {
  const result = {};
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = addTranslationNote(obj[key], language);
    } else if (typeof obj[key] === 'string') {
      // Add a note indicating translation is needed
      result[key] = `[${language.code}] ${obj[key]}`;
    } else {
      result[key] = obj[key];
    }
  }
  
  return result;
}

// Create index file for easy import
function createIndexFile() {
  const indexPath = path.join(__dirname, '../public/locales/index.js');
  const indexContent = `// Auto-generated language index
export const languages = ${JSON.stringify(ALL_LANGUAGES.map(lang => ({
  code: lang.code,
  name: lang.name,
  nativeName: lang.nativeName,
  flag: lang.flag,
  dir: lang.dir
})), null, 2)};

export const supportedLanguages = languages.map(lang => lang.code);

export default languages;
`;
  
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log('\n✅ Created language index file');
}

// Main execution
console.log('🌍 Al-Hidaya Translation Generator');
console.log('==================================\n');

createTranslationStructure();
createIndexFile();

console.log('\n📝 Next Steps:');
console.log('1. Review the generated translation files');
console.log('2. Use a translation service (Google Translate API, DeepL, etc.) to translate content');
console.log('3. Update the i18n configuration to include all languages');
console.log('4. Test RTL languages (Arabic, Hebrew, Urdu, etc.) for proper display');