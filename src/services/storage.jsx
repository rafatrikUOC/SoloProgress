const PREFIX = "app_";

export const storage = {
	set: (key, value) => {
		localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
	},
	get: (key) => {
		const value = localStorage.getItem(`${PREFIX}${key}`);
		return value ? JSON.parse(value) : null;
	},
	remove: (key) => {
		localStorage.removeItem(`${PREFIX}${key}`);
	},
};
