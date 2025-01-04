type KeywordsHash = Record<string, boolean>;

/**
 * ECMAScript reserved words.
 */
const KEYWORDS: Record<string, KeywordsHash> = {};

// Initialize KEYWORDS after declaration
KEYWORDS['3'] = _hash(
    'break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof',
    'abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public',
    'null true false'
);

KEYWORDS['5'] = _hash(
    'break do instanceof typeof case else new var catch finally return void continue for switch while debugger function this with default if throw delete in try',
    'class enum extends super const export import',
    'null true false'
);

KEYWORDS['5-strict'] = _hash(
    KEYWORDS['5'],
    'implements let private public yield interface package protected static'
);

KEYWORDS['6'] = _hash(
    'break do in typeof case else instanceof var catch export new void class extends return while const finally super with continue for switch yield debugger function this default if throw delete import try',
    'enum await',
    'null true false'
);

KEYWORDS['6-strict'] = _hash(
    KEYWORDS['6'],
    'let static implements package protected interface private public'
);


/**
 * Helper function to generate a keyword hash.
 *
 * @param {...(string | KeywordsHash)} keywords - Space-delimited strings or keyword objects.
 * @returns {KeywordsHash} - Keyword hash.
 */
function _hash(...keywords: (string | KeywordsHash)[]): KeywordsHash {
    return keywords
        .map(v => typeof v === 'string' ? v : Object.keys(v).join(' '))
        .join(' ')
        .split(/\s+/)
        .reduce((res, keyword) => (res[keyword] = true, res), {} as KeywordsHash);
}


/**
 * Check if a word is a reserved keyword in any ECMAScript dialect.
 *
 * @param {string} name - The word to check.
 * @returns {boolean} - True if the word is reserved, false otherwise.
 */
export function isReserved(name: string): boolean {
  return Object.values(KEYWORDS).some(set => set.hasOwnProperty(name));
}
