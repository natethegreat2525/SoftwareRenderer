import { Point3, Point4, Mat4 } from "./math.js";
import { drawTriangles, Buffer, Triangle, Vertex, Fragment, getVarying } from "./shader.js";

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

let val = 0;
let buffer = new Buffer(ctx, width, height);
let perspective = Mat4.perspective(width, height, .1, 1000, Math.PI / 2);

setInterval(mainLoop, 1000/60.0)

let fragShader = (varyings, uniforms) => {
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);
	if ((Math.floor(u * 10) + Math.floor(v * 10)) % 2 == 0) {
		return new Fragment(getVarying(varyings, 0), getVarying(varyings, 1), getVarying(varyings, 2), 0);
	}
	return new Fragment(getVarying(varyings, 0), getVarying(varyings, 1), getVarying(varyings, 2), getVarying(varyings, 3));
}

let vertexShader = (vertex, uniforms) => {
	let pt4 = Point4.fromPoint3(vertex.point, 1);
	pt4 = uniforms.projMatrix.multVec4(uniforms.modelMatrix.multVec4(pt4));
	return new Vertex(pt4, {}, vertex.attributes);
}

function mainLoop() {
	val += .01;
	
	let v1 = new Vertex(new Point3(-1, -1, 0), [255, 0, 0, 255, 0, 0]);
	let v2 = new Vertex(new Point3(1, -1, 0), [0, 255, 0, 255, 1, 0]);
	let v3 = new Vertex(new Point3(1, 1, 0), [0, 0, 255, 255, 1, 1]);
	
	let v4 = new Vertex(new Point3(-1, -1, 0), [255, 0, 0, 255, 0, 0]);
	let v5 = new Vertex(new Point3(1, 1, 0), [0, 0, 255, 255, 1, 1]);
	let v6 = new Vertex(new Point3(-1, 1, 0), [255, 255, 255, 255, 0, 1]);

	let tri1 = new Triangle(v1, v2, v3);
	let tri2 = new Triangle(v4, v5, v6);
	
	let modelMatrix = Mat4.translate(0, 0, 1).mult(Mat4.rotateX(val * 3).mult(Mat4.scale(.3, .3, .3)));
	
	drawTriangles(buffer, [tri1, tri2], vertexShader, fragShader, {modelMatrix: modelMatrix, projMatrix: perspective});
	
	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
}