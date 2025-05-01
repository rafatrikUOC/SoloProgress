import { storage } from "./storage";
import { LANGUAGES, DEFAULT_LANGUAGE } from "../config/i18n";

const LANGUAGE_KEY = "user_language";

export const languageService = {
	get: () => {
		const savedLanguage = storage.get(LANGUAGE_KEY);
		return savedLanguage || DEFAULT_LANGUAGE;
	},
	set: (language) => {
		if (!LANGUAGES[language]) return;
		storage.set(LANGUAGE_KEY, language);
	},
};
