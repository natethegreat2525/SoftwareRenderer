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
	
	let vars = vertex.attributes.slice(0);
	return new Vertex(pt4, {}, vars);
}

let sampleDepth = (buff, x, y) => {
	let xLow = Math.floor(x);
	let yLow = Math.floor(y);
	let xHigh = xLow + 1;
	let yHigh = yLow + 1;
	let hX = x - xLow;
	let hY = y - yLow;
	let lX = 1 - hX;
	let lY = 1 - hY;
	
	let d00 = buff.depth[xLow + yLow * buff.imageData.width];
	let d10 = buff.depth[xHigh + yLow * buff.imageData.width];
	let d01 = buff.depth[xLow + yHigh * buff.imageData.width];
	let d11 = buff.depth[xHigh + yHigh * buff.imageData.width];
	
	//interpolate
	return (d00 * lX + d10 * hX) * lY + (d01 * lX + d11 * hX) * hY;
}

let shadowFrag = (varyings, uniforms) => {
	let u = getVarying(varyings, 4);
	let v = getVarying(varyings, 5);
	let shadowBuff = uniforms.shadowBuff;
	let shadowProj = uniforms.shadowProj;
	let shX = getVarying(varyings, 9);
	let shY = getVarying(varyings, 10);
	let shZ = getVarying(varyings, 11);
	let shW = getVarying(varyings, 12);
	let posSh = new Point4(shX, shY, shZ, shW);
	
	//position in shadow space
	posSh.normalizeW();
	posSh.x = (posSh.x + 1) * shadowBuff.imageData.width / 2;
	posSh.y = (posSh.y + 1) * shadowBuff.imageData.height / 2;
	
	let depth = sampleDepth(shadowBuff, posSh.x, posSh.y);
	let light = 1;
	if (posSh.z > depth + .001) {
		light = .1;
	} else {
		let normDot = getVarying(varyings, 6);
		light = Math.max(.1, -normDot);
	}

	return new Fragment(getVarying(varyings, 0) * light, getVarying(varyings, 1) * light, getVarying(varyings, 2) * light, getVarying(varyings, 3));
}

let shadowVert = (vertex, uniforms) => {
	let ptOrig = Point4.fromPoint3(vertex.point, 1);
	let ptWS = uniforms.modelMatrix.multVec4(ptOrig);
	let ptSS = uniforms.shadowProj.multVec4(ptWS);
	let ptRet = uniforms.projMatrix.multVec4(ptWS);
	
	//calculate norm in light space
	let norm = new Point4(vertex.attributes[6], vertex.attributes[7], vertex.attributes[8], 0);
	let shadowSpaceNorm = uniforms.shadowView.multVec4(uniforms.modelMatrix.multVec4(norm));
	
	//calculate vertex pos in light space
	let posShadSp = uniforms.shadowView.multVec4(ptWS);
	posShadSp.w = 0;
	let camVec = new Point3(posShadSp.x, posShadSp.y, posShadSp.z).normalize();
	let ssNorm = new Point3(shadowSpaceNorm.x, shadowSpaceNorm.y, shadowSpaceNorm.z).normalize();
	let normDot = camVec.dot3(ssNorm);
	
	let vars = vertex.attributes.slice(0);
	
	
	vars[6] = normDot;
	
	//vars 7 and 8 are used by norm y and norm z

	vars.push(ptSS.x, ptSS.y, ptSS.z, ptSS.w);

	return new Vertex(ptRet, {}, vars);
}

let lightFrag = (varyings, uniforms) => {
	return new Fragment(1, 1, 1, getVarying(varyings, 3));
}

let lightVert = (vertex, uniforms) => {
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
let lightBuffer = new Buffer(ctx, width, height);

let perspective = Mat4.perspective(width, height, .1, 100, Math.PI / 2);

let sphere = makeSphere(10, 10, 255, 255, 0);
let plane = makePlane(255, 255, 255);
let cube = makeCube(0, 255, 255);
let cylinder = makeCylinder(10, 255, 255, 255);

let shapes = [sphere, plane, cube, cylinder];
let entities = [];
for (let i = 0; i < 20; i++) {
	let rSpd = .03;
	let ent = {
		tris: shapes[Math.floor(Math.random() * shapes.length)],
		x: 0,
		y: Math.random() * -3,
		z: 0,
		rX: Math.random() * Math.PI * 2,
		rY: Math.random() * Math.PI * 2,
		rZ: Math.random() * Math.PI * 2,
		rvX: (Math.random() - .5) * rSpd,
		rvY: (Math.random() - .5) * rSpd,
		rvZ: (Math.random() - .5) * rSpd,
		sO: Math.random() * 10,
		cO: Math.random() * 10,
		sM: Math.random() * 5 + 1,
		cM: Math.random() * 5 + 1
	}
	entities.push(ent);
}

let cameraPos = new Point3(0, 1, 0);

let lightPos = new Point3(0, 8, 0);

setInterval(mainLoop, 1000/60.0)

function mainLoop() {
	val += .01;
	cameraPos.z = -5;
	let projMatrix = perspective.mult(Mat4.translate(cameraPos.x, cameraPos.y, cameraPos.z).mult(Mat4.rotateX((Math.sin(val) + 1) * .3).mult(Mat4.rotateY(Math.sin(val / 8) * 2*Math.PI))));
	let lightViewMatrix = Mat4.rotateX(Math.PI/2).mult(Mat4.translate(lightPos.x, lightPos.y, lightPos.z));
	let lightProjMatrix = perspective.mult(lightViewMatrix);
	
	updateEntities();
	
	drawWorld(lightProjMatrix, lightBuffer, lightVert, lightFrag);
	drawWorld(projMatrix, buffer, shadowVert, shadowFrag, lightBuffer, lightProjMatrix, lightViewMatrix);

	ctx.putImageData(buffer.imageData, 0, 0);
	buffer.clear();
	lightBuffer.clear();
}

function updateEntities() {
	for (let i = 0; i < entities.length; i++) {
		let ent = entities[i];
		ent.rX += ent.rvX;
		ent.rY += ent.rvY;
		ent.rZ += ent.rvZ;
		let x = ent.x + Math.sin(val * ent.sM + ent.sO) * 2;
		let z = ent.z + Math.cos(val * ent.cM + ent.cO) * 2;
		ent.modelMatrix = Mat4.translate(x, ent.y, z).mult(Mat4.rotateZ(ent.rZ).mult(Mat4.rotateY(ent.rY)).mult(Mat4.rotateX(ent.rX)).mult(Mat4.scale(.3, .3, .3)));
	}
}

function drawWorld(projMatrix, buf, vert, frag, shadowBuff, shadowProj, shadowView) {
	for (let i = 0; i < entities.length; i++) {
		let ent = entities[i];
		drawTriangles(buf, ent.tris, vert, frag, {modelMatrix: ent.modelMatrix, projMatrix: projMatrix, shadowBuff: shadowBuff, shadowView: shadowView, shadowProj: shadowProj});
	}
	drawTriangles(buf, plane, vert, frag, {modelMatrix: Mat4.translate(0, .5, 0).mult(Mat4.scale(5, 5, 5)), projMatrix: projMatrix, shadowBuff: shadowBuff, shadowView: shadowView, shadowProj: shadowProj});
}