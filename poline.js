import {
	Poline, positionFunctions
} from 'poline';
import {formatHex} from "culori";

import { createRequire } from "module";
const require = createRequire(import.meta.url);
const fs = require('fs')
const {spawn} = require('child_process');


let baseColor = Math.floor(Math.random() * 360);

let po = new Poline({
	anchorColors: [
		[15, 1, .73],
		[330, .66, 0.40],
		[190, 0.56, 0.60],
		// [baseColor, Math.random(), Math.random()],
		// [baseColor + 120 + (Math.random() * 120), Math.random(), Math.random()],
		// [baseColor + 240 + (Math.random() * 120), Math.random(), Math.random()],
		//... more colors
	],
	numPoints: 8,
	positionFunction:  positionFunctions.linearPosition,
	closedLoop: true,
});

po.shiftHue(1);

let hex = po.colorsCSS.map((c) => formatHex(c));

let url = "https://api.color.pizza/v1/?values=" + hex.map(x => x.substring(1)).join(",") + "&list=bestOf&noduplicates=true";
let response = await fetch(url);
let data = await response.json();

let palette = `GIMP Palette
Name: Poline/${data.paletteTitle}
Columns: 0
#\n`;

data.colors.forEach((c) => {
	palette += `${c.rgb.r} ${c.rgb.g} ${c.rgb.b} ${c.name} (${c.hex})\n`;
})

// save to file nodejs
// const fs = require('fs');
let sanitizedTitle = data.paletteTitle.toLowerCase().replace(/[^a-z0-9]/gi, '_');
fs.writeFileSync(`poline-${sanitizedTitle}.gpl`, palette);

let examples = `<!DOCTYPE html>
<html>
<head>
	<title>Poline Palette: ${data.paletteTitle}</title>
	<style>
		.color {
			width: 100px;
			height: 100px;
			display: inline-block;
		}
	@font-face { font-family: "Aboreto"; src: url("https://fonts.gstatic.com/s/aboreto/v2/5DCXAKLhwDDQ4N8bpKPUAg.woff2") format("woff2"); font-style: normal; font-weight: 400; font-display: swap; unicode-range: U+0-FF, U+131, U+152-153, U+2BB-2BC, U+2C6, U+2DA, U+2DC, U+304, U+308, U+329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD; }
	body { font-family: "Aboreto", sans-serif; }
	</style>
</head>
<body>
	<h1>Poline Palette: ${data.paletteTitle}</h1>
	${data.colors.map((c) => `<div class="color" style="background-color: ${c.hex}"></div>`).join("\n")}
</body>
</html>`;

fs.writeFileSync(`poline-${sanitizedTitle}.html`, examples);
console.log(`Palette saved to poline-${sanitizedTitle}.gpl`);
spawn(`xdg-open poline-${sanitizedTitle}.html`, {shell: true});
