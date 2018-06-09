import { Point3, Point4, Mat4 } from "./math.js";
import { drawTriangles, Buffer, Triangle, Vertex, Fragment } from "./shader.js";

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

//drawTriangle(imageData, new Point3(100, 54, 0), new Point3(200, 237, 0), new Point3(50, 300, 0));

let val = 0;
let buffer = new Buffer(ctx, width, height);

setInterval(mainLoop, 1000/60.0)

let fragShader = (varyings, uniforms) => {
	return new Fragment(varyings[0], varyings[1], varyings[2], varyings[3]);
}

let vertexShader = (vertex, uniforms) => {
	let pt4 = Point4.fromPoint3(vertex.point, 1);
	pt4 = uniforms.modelMatrix.multVec4(pt4);
	return new Vertex(pt4, {}, vertex.attributes);
}

function mainLoop() {
	val += .01;
	
	let v1 = new Vertex(new Point3(-1, -1, -1), [255, 0, 0, 255]);
	let v2 = new Vertex(new Point3(1, -1, -1), [0, 255, 0, 255]);
	let v3 = new Vertex(new Point3(1, 1, -1), [0, 0, 255, 255]);
	
	let v4 = new Vertex(new Point3(-1, -1, -1), [255, 0, 0, 255]);
	let v5 = new Vertex(new Point3(1, 1, -1), [0, 0, 255, 255]);
	let v6 = new Vertex(new Point3(-1, 1, -1), [255, 255, 255, 255]);

	let tri1 = new Triangle(v1, v2, v3);
	let tri2 = new Triangle(v4, v5, v6);
	
	let mv = Mat4.translate(Math.sin(val * 5), Math.cos(val * 5), 0);
	
	let scaleVal = (Math.sin(val / 2) + 2) / 6;
	let sc = Mat4.scale(scaleVal, scaleVal, 1);
	
	let modelMatrix = mv.mult(sc);
	
	drawTriangles(buffer, [tri1, tri2], vertexShader, fragShader, {modelMatrix: modelMatrix});
	
	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
}