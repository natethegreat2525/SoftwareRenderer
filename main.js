import { Point3, Point4, Mat4 } from "./math.js";
import { makeSphere, makeCube, makePlane, makeCylinder } from "./shapes.js";
import { drawTriangles, Buffer, Triangle, Vertex, Fragment, getVarying } from "./shader.js";

let fragShader = (varyings, uniforms) => {
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);
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

let sphere = makeSphere(20, 20, 255, 255, 0);
let plane = makePlane(255, 0, 255);
let cube = makeCube(0, 255, 255);
let cylinder = makeCylinder(255, 255, 255);

setInterval(mainLoop, 1000/60.0)

function mainLoop() {
	val += .01;
	
	let modelMatrix1 = Mat4.translate(-.6, 0, -3 + Math.sin(val * 2.2) * .3).mult(Mat4.rotateZ(val * 1.5).mult(Mat4.rotateY(val * 2.5)).mult(Mat4.rotateX(val * 2)).mult(Mat4.scale(.3, .3, .3)));
	let modelMatrix2 = Mat4.translate(-.2, 0, -3 + Math.sin(val * 2.4) * .3).mult(Mat4.rotateZ(val * 2.6).mult(Mat4.rotateY(val * 1.4)).mult(Mat4.rotateX(val * 3)).mult(Mat4.scale(.3, .3, .3)));
	let modelMatrix3 = Mat4.translate(.2, 0, -3 + Math.sin(val * 2.6) * .3).mult(Mat4.rotateZ(val * 1.3).mult(Mat4.rotateY(val * 1.8)).mult(Mat4.rotateX(val * 2.1)).mult(Mat4.scale(.3, .3, .3)));
	let modelMatrix4 = Mat4.translate(.6, 0, -3 + Math.sin(val * 2.8) * .3).mult(Mat4.rotateZ(val * 2.0).mult(Mat4.rotateY(val * 2.0)).mult(Mat4.rotateX(val * 1.5)).mult(Mat4.scale(.3, .3, .3)));
	
	drawTriangles(buffer, sphere, vertexShader, fragShader, {modelMatrix: modelMatrix1, projMatrix: perspective});
	drawTriangles(buffer, plane, vertexShader, fragShader, {modelMatrix: modelMatrix2, projMatrix: perspective});
	drawTriangles(buffer, cube, vertexShader, fragShader, {modelMatrix: modelMatrix3, projMatrix: perspective});
	drawTriangles(buffer, cylinder, vertexShader, fragShader, {modelMatrix: modelMatrix4, projMatrix: perspective});

	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
}