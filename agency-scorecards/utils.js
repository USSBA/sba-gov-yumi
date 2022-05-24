export function addTextToBody(text) {
    console.log('addTextToBody()');
    const div = document.createElement('div');
    div.textContent = text;
    document.body.appendChild(div);
}

// Camel case helper: https://stackoverflow.com/questions/2970525/converting-any-string-into-camel-case
function camalize(str) {
    return str.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}