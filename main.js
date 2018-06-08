import Point3 from "./math.js";

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

//drawTriangle(imageData, new Point3(100, 54, 0), new Point3(200, 237, 0), new Point3(50, 300, 0));

setInterval(mainLoop, 1000/60.0)

let val = 0;
function mainLoop() {
	let imageData = new ImageData(width, height);
	val += .01;
	
	let a = Math.sin(val - 1.5 - Math.sin(val / 1.3538)) * 100 + 320;
	let b = Math.cos(val - 1.5 - Math.sin(val / 1.3538)) * 100 + 240;
	
	let c = Math.sin(val + 2) * 100 + 320;
	let d = Math.cos(val + 2) * 100 + 240;
	
	let e = Math.sin(val + 1) * 100 + 320;
	let f = Math.cos(val + 1) * 100 + 240;
	
	let g = Math.sin(val - 3.5) * 100 + 320;
	let h = Math.cos(val - 3.5) * 100 + 240;
	drawTriangle(imageData, new Point3(a, b, 0), new Point3(c, d, 0), new Point3(e, f, 0), 255, 0, 0, 255);
	drawTriangle(imageData, new Point3(a, b, 0), new Point3(g, h, 0), new Point3(c, d, 0), 0, 255, 0, 255);
	
	ctx.putImageData(imageData, 0, 0);
}



function setPixel(data, x, y, r, g, b, a) {
	if (x >= 0 && y >= 0 && x < data.width && y < data.height) {
		let idx = (x + y * data.width) * 4;
		data.data[idx] += r;
		data.data[idx + 1] += g;
		data.data[idx + 2] += b;
		data.data[idx + 3] = a;
	}
}

function drawTriangle(data, p1, p2, p3, r, g, b, a) {
	//sort from top to bottom maintaining order
	if (p2.y < p1.y && p2.y < p3.y) {
		let tmp = p1;
		p1 = p2;
		p2 = p3;
		p3 = tmp;
	}
	if (p3.y < p2.y && p3.y < p1.y) {
		let tmp = p1;
		p1 = p3;
		p3 = p2;
		p2 = tmp;
	}
	
	let vL = p2.sub(p1);
	let vR = p3.sub(p1);
	let cr = vL.cross2(vR);
	
	//keep Clockwise Faces
	//cull Counter Clockwise Faces
	if (cr < 0) {
		return;
	}
	
	//scan top half
	let yScanStart = Math.ceil(p1.y);
	let yScanEnd = Math.ceil(Math.min(p2.y, p3.y));
	if (yScanEnd !== yScanStart) {
		let vec1 = p2.sub(p1);
		let vec2 = p3.sub(p1);
		doHalfTri(data, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, r, g, b, a);
	}
	
	//scan bottom half
	yScanStart = yScanEnd;
	let vec1, vec2, start1, start2;
	if (p2.y > p3.y) {
		yScanEnd = Math.ceil(p2.y);
		vec1 = p2.sub(p1);
		vec2 = p2.sub(p3);
		start1 = p1;
		start2 = p3;
	} else {
		yScanEnd = Math.ceil(p3.y);
		vec1 = p3.sub(p2);
		vec2 = p3.sub(p1);
		start1 = p2;
		start2 = p1;
	}
	if (yScanStart !== yScanEnd) {
		doHalfTri(data, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, r, g, b, a);
	}
}

function doHalfTri(data, scanStart, scanEnd, p1, slope1, p2, slope2, r, g, b, a) {
	//start right x pos
	let sx1 = p1.x + (scanStart - p1.y) * slope1;
	
	//start left x pos
	let sx2 = p2.x + (scanStart - p2.y) * slope2;
	
	//draw scan lines
	for (let i = scanStart; i < scanEnd; i++) {
		let low = Math.ceil(sx2);
		let high = Math.ceil(sx1);
		for (let j = low; j < high; j++) {
			setPixel(data, j, i, r, g, b, a);
		}
		sx1 += slope1;
		sx2 += slope2;
	}
}

