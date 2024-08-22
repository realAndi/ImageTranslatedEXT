function updateContextMenu() {
  chrome.storage.sync.get(['translateFrom', 'translateTo'], function(items) {
      const fromLang = items.translateFrom || 'auto';
      const toLang = items.translateTo || 'en';

      const fromText = fromLang === 'auto' ? 'Auto-detected' : getLanguageName(fromLang);
      const toText = getLanguageName(toLang);

      chrome.contextMenus.update("processImage", {
          title: `Translate image text from ${fromText} to ${toText}`
      });
  });
}

function getLanguageName(langCode) {
  const languages = {
      'auto': 'Auto-detect',
      'en': 'English',
      'zh': 'Chinese',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'es': 'Spanish',
      'sq': 'Albanian',
      'af': 'Afrikaans',
      'am': 'Amharic',
      'ar': 'Arabic',
      'az': 'Azerbaijani',
      'be': 'Belarusian',
      'bg': 'Bulgarian',
      'bn': 'Bengali',
      'bs': 'Bosnian',
      'ca': 'Catalan',
      'ceb': 'Cebuano',
      'co': 'Corsican',
      'cs': 'Czech',
      'cy': 'Welsh',
      'da': 'Danish',
      'el': 'Greek',
      'eo': 'Esperanto',
      'et': 'Estonian',
      'eu': 'Basque',
      'fa': 'Persian',
      'fi': 'Finnish',
      'fy': 'Frisian',
      'ga': 'Irish',
      'gd': 'Scots Gaelic',
      'gl': 'Galician',
      'gu': 'Gujarati',
      'ha': 'Hausa',
      'haw': 'Hawaiian',
      'he': 'Hebrew',
      'hi': 'Hindi',
      'hmn': 'Hmong',
      'hr': 'Croatian',
      'ht': 'Haitian Creole',
      'hu': 'Hungarian',
      'hy': 'Armenian',
      'id': 'Indonesian',
      'ig': 'Igbo',
      'is': 'Icelandic',
      'it': 'Italian',
      'iw': 'Hebrew',
      'jw': 'Javanese',
      'ka': 'Georgian',
      'kk': 'Kazakh',
      'km': 'Khmer',
      'kn': 'Kannada',
      'ku': 'Kurdish',
      'ky': 'Kyrgyz',
      'la': 'Latin',
      'lb': 'Luxembourgish',
      'lo': 'Lao',
      'lt': 'Lithuanian',
      'lv': 'Latvian',
      'mg': 'Malagasy',
      'mi': 'Maori',
      'mk': 'Macedonian',
      'ml': 'Malayalam',
      'mn': 'Mongolian',
      'mr': 'Marathi',
      'ms': 'Malay',
      'mt': 'Maltese',
      'my': 'Myanmar (Burmese)',
      'ne': 'Nepali',
      'nl': 'Dutch',
      'no': 'Norwegian',
      'ny': 'Chichewa',
      'or': 'Odia (Oriya)',
      'pa': 'Punjabi',
      'pl': 'Polish',
      'ps': 'Pashto',
      'pt': 'Portuguese',
      'ro': 'Romanian',
      'ru': 'Russian',
      'rw': 'Kinyarwanda',
      'sd': 'Sindhi',
      'si': 'Sinhala',
      'sk': 'Slovak',
      'sl': 'Slovenian',
      'sm': 'Samoan',
      'sn': 'Shona',
      'so': 'Somali',
      'sr': 'Serbian',
      'st': 'Sesotho',
      'su': 'Sundanese',
      'sv': 'Swedish',
      'sw': 'Swahili',
      'ta': 'Tamil',
      'te': 'Telugu',
      'tg': 'Tajik',
      'th': 'Thai',
      'tk': 'Turkmen',
      'tl': 'Filipino (Tagalog)',
      'tr': 'Turkish',
      'tt': 'Tatar',
      'ug': 'Uyghur',
      'uk': 'Ukrainian',
      'ur': 'Urdu',
      'uz': 'Uzbek',
      'vi': 'Vietnamese',
      'xh': 'Xhosa',
      'yi': 'Yiddish',
      'yo': 'Yoruba',
      'zu': 'Zulu'

      // Add more languages as needed
  };
  return languages[langCode] || langCode;
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
      id: "processImage",
      title: "Translate image text",
      contexts: ["image"]
  });
  updateContextMenu();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && (changes.translateFrom || changes.translateTo)) {
      updateContextMenu();
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "processImage") {
      console.log('Context menu clicked. Sending message to content script.');
      chrome.tabs.sendMessage(tab.id, {
          action: "processImage",
          imageUrl: info.srcUrl
      });
  }
});