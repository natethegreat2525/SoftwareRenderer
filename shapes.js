import { Point3} from "./math.js";
import { Vertex, Triangle } from "./shader.js";

export function makeSphere(widthSegs, heightSegs, r, g, b) {
	let widthStep = Math.PI * 2 / widthSegs;
	let heightStep = Math.PI / heightSegs;
	let tris = [];
	for (let i = 0; i < widthSegs; i++) {
		let waLow = i * widthStep;
		let waHigh = (i + 1) * widthStep;
		for (let j = 0; j < heightSegs; j++) {
			let haLow = j * heightStep;
			let haHigh = (j + 1) * heightStep;

			let p1 = getSpherePoint(waLow, haLow);
			let p2 = getSpherePoint(waHigh, haLow);
			let p3 = getSpherePoint(waHigh, haHigh);
			let p4 = getSpherePoint(waLow, haHigh);
			
			let v1 = new Vertex(p1, [r,g,b,255,i*1.0/widthSegs,j*1.0/heightSegs, p1.x,p1.y,p1.z]);
			let v2 = new Vertex(p2, [r,g,b,255,(i+1)*1.0/widthSegs,j*1.0/heightSegs, p2.x,p2.y,p2.z]);
			let v3 = new Vertex(p3, [r,g,b,255,(i+1)*1.0/widthSegs,(j+1)*1.0/heightSegs, p3.x,p3.y,p3.z]);
			let v4 = new Vertex(p4, [r,g,b,255,i*1.0/widthSegs,(j+1)*1.0/heightSegs, p4.x,p4.y,p4.z]);
			
			tris.push(new Triangle(v1, v2, v3));
			tris.push(new Triangle(v1, v3, v4));
		}
	}
	return tris;
}

function getSpherePoint(wa, ha) {
	let x = Math.cos(wa) * Math.sin(ha);
	let y = Math.cos(ha);
	let z = Math.sin(wa) * Math.sin(ha);
	return new Point3(x, y, z);
}

export function makeCube(r, g, b) {
	let tris = [];
	tris.push(...makeCubeFace(r, g, b, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1));
	tris.push(...makeCubeFace(r, g, b, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, -1));

	tris.push(...makeCubeFace(r, g, b, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, -1, 0));
	tris.push(...makeCubeFace(r, g, b, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0));
	
	tris.push(...makeCubeFace(r, g, b, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0));
	tris.push(...makeCubeFace(r, g, b, 0, 0, 1, 0, 1, 0, 0, 0, 0, -1, 0, 0));
	
	return tris;
}

function makeCubeFace(r, g, b, xU, yU, zU, xV, yV, zV, xC, yC, zC, nx, ny, nz) {
	let uv = [[0, 0],[0, 1],[1, 1],[1, 0]];
	let vs = [];
	for (let i = 0; i < 4; i++) {
		let u = uv[i][0];
		let v = uv[i][1];
		let vert = new Vertex(new Point3(
			xU * u * 2 + xV * v * 2 + xC * 2 - 1,
			yU * u * 2 + yV * v * 2 + yC * 2 - 1,
			zU * u * 2 + zV * v * 2 + zC * 2 - 1
		), [r,g,b,255,u,v,nx,ny,nz]);
		vs.push(vert);
	}
	return [new Triangle(vs[0], vs[2], vs[1]), new Triangle(vs[0], vs[3], vs[2])];
}

export function makeCylinder(segs, r, g, b) {
	let widthStep = Math.PI * 2 / segs;
	let tris = [];
	let cTop = new Vertex(new Point3(0, 1, 0), [r,g,b,255,0,1, 0,1,0]);
	let cBot = new Vertex(new Point3(0, -1, 0), [r,g,b,255,0,0, 0,-1,0]);
	for (let i = 0; i < segs; i++) {
		let waLow = i * widthStep;
		let waHigh = (i + 1) * widthStep;
		let haLow = -1;
		let haHigh = 1;

		let normXL = Math.cos(waLow);
		let normZL = Math.sin(waLow);
		let normXH = Math.cos(waHigh);
		let normZH = Math.sin(waHigh);
		
		let v1 = new Vertex(getCylinderPoint(waLow, haLow), [r,g,b,255,i*1.0/segs,0, normXL,0,normZL]);
		let v2 = new Vertex(getCylinderPoint(waHigh, haLow), [r,g,b,255,(i+1)*1.0/segs,0, normXH,0,normZH]);
		let v3 = new Vertex(getCylinderPoint(waHigh, haHigh), [r,g,b,255,(i+1)*1.0/segs,1, normXH,0,normZH]);
		let v4 = new Vertex(getCylinderPoint(waLow, haHigh), [r,g,b,255,i*1.0/segs,1, normXL,0,normZL]);
			
		tris.push(new Triangle(v1, v3, v2));
		tris.push(new Triangle(v1, v4, v3));
		
		let v5 = new Vertex(getCylinderPoint(waLow, haLow), [r,g,b,255,i*1.0/segs,0, 0,-1,0]);
		let v6 = new Vertex(getCylinderPoint(waHigh, haLow), [r,g,b,255,(i+1)*1.0/segs,0, 0,-1,0]);
		let v7 = new Vertex(getCylinderPoint(waHigh, haHigh), [r,g,b,255,(i+1)*1.0/segs,1, 0,1,0]);
		let v8 = new Vertex(getCylinderPoint(waLow, haHigh), [r,g,b,255,i*1.0/segs,1, 0,1,0]);
		
		tris.push(new Triangle(cBot, v5, v6));
		tris.push(new Triangle(cTop, v7, v8));
	}
	return tris;
}

function getCylinderPoint(wa, ha) {
	let x = Math.cos(wa);
	let y = ha;
	let z = Math.sin(wa);
	return new Point3(x, y, z);
}

export function makePlane(r, g, b) {
	let tris = [];
	let v1 = new Vertex(new Point3(-1, 0, -1), [r,g,b,255,0,0, 0,-1,0]);
	let v2 = new Vertex(new Point3(-1, 0, 1), [r,g,b,255,0,1, 0,-1,0]);
	let v3 = new Vertex(new Point3(1, 0, 1), [r,g,b,255,1,1, 0,-1,0]);
	let v4 = new Vertex(new Point3(1, 0, -1), [r,g,b,255,1,0, 0,-1,0]);
	
	let v5 = new Vertex(new Point3(-1, 0, -1), [r,g,b,255,0,0, 0,1,0]);
	let v6 = new Vertex(new Point3(-1, 0, 1), [r,g,b,255,0,1, 0,1,0]);
	let v7 = new Vertex(new Point3(1, 0, 1), [r,g,b,255,1,1, 0,1,0]);
	let v8 = new Vertex(new Point3(1, 0, -1), [r,g,b,255,1,0, 0,1,0]);
	
	tris.push(new Triangle(v5, v6, v7));
	tris.push(new Triangle(v1, v3, v2));
	tris.push(new Triangle(v5, v7, v8));
	tris.push(new Triangle(v1, v4, v3));
	
	return tris;
}