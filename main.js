import { Point3, Point4, Mat4 } from "./math.js";
import { makeSphere, makeCube, makePlane, makeCylinder } from "./shapes.js";
import { drawTriangles, Buffer, Triangle, Vertex, Fragment, getVarying } from "./shader.js";

let fragShader = (varyings, uniforms) => {
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);
	return new Fragment(getVarying(varyings, 0) * u , getVarying(varyings, 1) * v, getVarying(varyings, 2) * u, getVarying(varyings, 3));
}

let fragShaderGrid = (varyings, uniforms) => {
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);
	if ((Math.floor(u * 10) + Math.floor(v * 10)) % 2 == 0) {
		return null;
	}
	return new Fragment(getVarying(varyings, 0) * u , getVarying(varyings, 1) * v, getVarying(varyings, 2) * u, getVarying(varyings, 3));
}

let vertexShader = (vertex, uniforms) => {
	let pt4 = Point4.fromPoint3(vertex.point, 1);
	pt4 = uniforms.modelMatrix.multVec4(pt4);
	pt4 = uniforms.projMatrix.multVec4(pt4);
	return new Vertex(pt4, {}, vertex.attributes.slice(0));
}

let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');
let width = canvas.width;
let height = canvas.height;

let val = 0;
let buffer = new Buffer(ctx, width, height);

let perspective = Mat4.perspective(width, height, .1, 100, Math.PI / 2);

let sphere = makeSphere(10, 10, 255, 255, 0);
let plane = makePlane(255, 255, 255);
let cube = makeCube(0, 255, 255);
let cylinder = makeCylinder(10, 255, 255, 255);

let shapes = [sphere, plane, cube, cylinder];
let entities = [];
for (let i = 0; i < 10; i++) {
	let ent = {
		tris: shapes[Math.floor(Math.random() * shapes.length)],
		x: Math.random() * 10 - 5,
		z: Math.random() * 10 - 5,
		rX: Math.random() * Math.PI * 2,
		rY: Math.random() * Math.PI * 2,
		rZ: Math.random() * Math.PI * 2
	}
	ent.modelMatrix = Mat4.translate(ent.x, 0, ent.z).mult(Mat4.rotateZ(ent.rZ).mult(Mat4.rotateY(ent.rY)).mult(Mat4.rotateX(ent.rX)).mult(Mat4.scale(.3, .3, .3)));
	entities.push(ent);
}

let cameraPos = new Point3(0, 1, 0);

setInterval(mainLoop, 1000/60.0)

function mainLoop() {
	val += .01;
	cameraPos.z = Math.cos(val * .3) * 5 - 5;
	let triCnt = 0;
	let projMatrix = perspective.mult(Mat4.translate(cameraPos.x, cameraPos.y, cameraPos.z).mult(Mat4.rotateY(Math.sin(val / 8) * 2*Math.PI)));
	for (let i = 0; i < entities.length; i++) {
		let ent = entities[i];
		triCnt += ent.tris.length;
		drawTriangles(buffer, ent.tris, vertexShader, fragShader, {modelMatrix: ent.modelMatrix, projMatrix: projMatrix});
	}
	drawTriangles(buffer, plane, vertexShader, fragShaderGrid, {modelMatrix: Mat4.translate(0, .5, 0).mult(Mat4.scale(5, 5, 5)), projMatrix: projMatrix});

	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
}