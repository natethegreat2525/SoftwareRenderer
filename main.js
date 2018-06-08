import { Point3 } from "./math.js";
import { drawTriangle, Buffer, Triangle, Vertex, Fragment } from "./shader.js";

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

//drawTriangle(imageData, new Point3(100, 54, 0), new Point3(200, 237, 0), new Point3(50, 300, 0));

setInterval(mainLoop, 1000/60.0)

let val = 0;
let fragShader = (varyings) => {
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}

let fragShaderGrid = (varyings) => {
	if ((Math.floor(varyings[4] / 10) + Math.floor(varyings[5] / 10)) % 2 == 0) {
		return new Fragment(0, 0, 0, 0);
	}
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}

function mainLoop() {
	let buffer = new Buffer(width, height);
	val += .01;
	
	let a = Math.sin(val - 1.5 - Math.sin(val / 1.3538)) * 200 + 320;
	let b = Math.cos(val - 1.5 - Math.sin(val / 1.3538)) * 200 + 240;
	
	let c = Math.sin(val + 3) * 200 + 320;
	let d = Math.cos(val + 3) * 200 + 240;
	
	let e = Math.sin(val + 1) * 200 + 320;
	let f = Math.cos(val + 1) * 200 + 240;
	
	let v1 = new Vertex(new Point3(a, b, 0), [255, 0, 0, 255, a, b]);
	let v2 = new Vertex(new Point3(c, d, 0), [0, 255, 0, 255, c, d]);
	let v3 = new Vertex(new Point3(e, f, 0), [0, 0, 255, 0, e, f]);
	
	let v4 = new Vertex(new Point3(0, 0, 0), [0, 0, 0, 255, 0, 0]);
	let v5 = new Vertex(new Point3(width, height, 0), [0, 0, 0, 255]);
	let v6 = new Vertex(new Point3(0, height, 0), [0, 0, 0, 255]);

	let tri = new Triangle(v1, v2, v3);
	let tri2 = new Triangle(v4, v5, v6);
	drawTriangle(buffer, tri2, fragShader);
	drawTriangle(buffer, tri, fragShaderGrid);
	
	ctx.putImageData(buffer.imageData, 0, 0);
}