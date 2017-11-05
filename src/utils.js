export function camelize(str) {
	return str
		.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
			return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
		})
		.replace(/\s+/g, "");
}

export function isNumeric(num) {
	return !isNaN(num);
}
