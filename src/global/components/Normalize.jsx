
// Capitalizes the first letter of a string and lowercases the rest
export function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str
 * @returns {string}
 */
export function capitalizeWords(str) {
    if (!str) return "";
    return str
        .split(" ")
        .map(word => capitalizeFirstLetter(word))
        .join(" ");
}

// Normalizes an array of strings: trims and lowercases each element
export function normalizeArray(arr) {
    if (!Array.isArray(arr)) return [];
    return arr.map(item => (typeof item === "string" ? item.trim().toLowerCase() : ""));
}

// Removes accents/diacritics from a string
export function removeDiacritics(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Converts a string to Title Case (each word capitalized, rest lowercase)
export function toTitleCase(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(" ")
        .map(word => capitalizeFirstLetter(word))
        .join(" ");
}

// Joins an array of strings with commas, capitalizing each element
export function joinAndCapitalize(arr) {
    if (!Array.isArray(arr)) return "";
    return arr.map(capitalizeFirstLetter).join(", ");
}

// Truncates a string to a maximum length, adding "…" if needed
export function truncate(str, maxLength = 30) {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength - 1) + "…";
}