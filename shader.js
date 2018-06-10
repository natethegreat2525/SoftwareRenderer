export class Vertex {
	//Vertex after going through vertex shader
	constructor(point, attributes, varyingArray) {
		this.point = point;
		this.varyingArray = varyingArray || [];
		this.attributes = attributes;
	}
}

export class Triangle {
	constructor(p1, p2, p3) {
		this.p1 = p1;
		this.p2 = p2;
		this.p3 = p3;
	}
}

export class Fragment {
	constructor(r, g, b, a) {
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
}

export class Buffer {
	constructor(ctx, w, h) {
		this.imageData = ctx.createImageData(w, h);
		this.depth = new Array(w*h);
		this.depth.fill(1);
	}
	
	clear() {
		this.imageData.data.fill(0);
		this.depth.fill(1);
	}
}

export function drawTriangles(buffer, triangles, vertexShader, fragmentShader, uniforms) {
	for (let i = 0; i < triangles.length; i++) {
		let t = triangles[i];
		let tNext = new Triangle();
		tNext.p1 = vertexShader(t.p1, uniforms);
		tNext.p2 = vertexShader(t.p2, uniforms);
		tNext.p3 = vertexShader(t.p3, uniforms);
		if (tNext.p1.z < -1 && tNext.p2.z < -1 && tNext.p3.z < -1) {
			continue;
		}
		if (tNext.p1.z > 1 && tNext.p2.z > 1 && tNext.p3.z > 1) {
			continue;
		}
		drawTriangle(buffer, tNext, fragmentShader, uniforms);
	}
}

function setPixelAlphaBlend(data, idx, r, g, b, a) {
	if (a >= 255) {
		data.data[idx] = r;
		data.data[idx + 1] = g;
		data.data[idx + 2] = b;
		data.data[idx + 3] = a;
	} else {
		let af = a / 255.0
		let oma = 1-af;
		data.data[idx] = data.data[idx] * oma + r * af;
		data.data[idx + 1] = data.data[idx + 1] * oma + g * af;
		data.data[idx + 2] = data.data[idx + 2] * oma + b * af;
		data.data[idx + 3] = data.data[idx + 3] + af * (255 - data.data[idx + 3]);
	}
}

function perspectiveCorrectTriangleVarying(t) {
	let v1 = t.p1.varyingArray;
	let v2 = t.p2.varyingArray;
	let v3 = t.p3.varyingArray;
		
	v1.push(t.p1.point.z);
	v2.push(t.p2.point.z);
	v3.push(t.p3.point.z);
	
	for (let i = 0; i < v1.length; i++) {
		v1[i] /= t.p1.point.w;
		v2[i] /= t.p2.point.w;
		v3[i] /= t.p3.point.w;
	}
	
	v1.push(1/t.p1.point.w);
	v2.push(1/t.p2.point.w);
	v3.push(1/t.p3.point.w);
}

function calculateVaryingSlope(t) {
	let v1 = t.p1.varyingArray;
	let v2 = t.p2.varyingArray;
	let v3 = t.p3.varyingArray;
	
	let w12 = t.p2.point.x - t.p1.point.x;
	let h12 = t.p2.point.y - t.p1.point.y;
	let w13 = t.p3.point.x - t.p1.point.x;
	let h13 = t.p3.point.y - t.p1.point.y;
	
	let quot = w13 * h12 - w12 * h13;
	
	if (quot === 0) {
		return null;
	}
	
	let slopeArray = [];
	
	for (let i = 0; i < v1.length; i++) {
		let r1 = v1[i];
		let r2 = v2[i];
		let r3 = v3[i];
		
		let dx = (h12 * (r3 - r1) + h13 * (r1 - r2)) / quot;
		let dy = (w12 * (r3 - r1) + w13 * (r1 - r2)) / -quot;
		
		slopeArray.push({dx: dx, dy: dy});
	}
	
	return slopeArray;
}

function drawTriangle(buffer, triangle, fragmentShader, uniforms) {
	let p1 = triangle.p1.point;
	let p2 = triangle.p2.point;
	let p3 = triangle.p3.point;
	
	//normalize w value of p1, p2, p3
	p1.normalizeW();
	p2.normalizeW();
	p3.normalizeW();
	
	//sort from top to bottom maintaining ccw or cw order
	if (p2.y < p1.y && p2.y <= p3.y) {
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

	//lets rescale the -1 to 1 point x and y coordinates to be buffer coordinates 0 - width and 0 - height
	let xScale = buffer.imageData.width / 2;
	let yScale = buffer.imageData.height / 2;
	
	p1.x = (p1.x + 1) * xScale;
	p1.y = (p1.y + 1) * yScale;
	
	p2.x = (p2.x + 1) * xScale;
	p2.y = (p2.y + 1) * yScale;
	
	p3.x = (p3.x + 1) * xScale;
	p3.y = (p3.y + 1) * yScale;
	
	let vL = p2.sub(p1);
	let vR = p3.sub(p1);
	let cr = vL.cross2(vR);
	
	//keep Clockwise Faces
	//cull Counter Clockwise Faces
	if (cr < 0) {
		return;
	}
	
	perspectiveCorrectTriangleVarying(triangle);
	let varyingSlopes = calculateVaryingSlope(triangle);
	if (!varyingSlopes) {
		return;
	}

	//scan top half
	let yScanStart = Math.ceil(p1.y);
	let yScanEnd = Math.ceil(Math.min(p2.y, p3.y));

	if (yScanEnd !== yScanStart) {
		let vec1 = p2.sub(p1);
		let vec2 = p3.sub(p1);
		doHalfTri(buffer, yScanStart, yScanEnd, p1.clone(), vec1.x/vec1.y, p1.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
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
		doHalfTri(buffer, yScanStart, yScanEnd, start1.clone(), vec1.x/vec1.y, start2.clone(), vec2.x/vec2.y, triangle.p1, varyingSlopes, fragmentShader, uniforms);
	}
}

function doHalfTri(buffer, scanStart, scanEnd, p1, slope1, p2, slope2, baseVertex, varyingSlopes, fragmentShader, uniforms) {
	
	if (scanStart > scanEnd) {
			return;
	}
	
	if (scanStart < 0) {
		scanStart = 0;
	}
	
	//start right x pos
	let sx1 = p1.x + (scanStart - p1.y) * slope1;
	
	//start left x pos
	let sx2 = p2.x + (scanStart - p2.y) * slope2;
	
	//draw scan lines
	for (let i = scanStart; i < scanEnd; i++) {
		if (i > buffer.imageData.height) {
			break;
		}
		
		let low = Math.ceil(sx2);
		let high = Math.ceil(sx1);
		if (low >= buffer.imageData.width || high < 0 || low > high) {
			sx1 += slope1;
			sx2 += slope2;
			continue;
		}
		if (low < 0) {
			low = 0;
		}
		if (high >= buffer.imageData.width) {
			high = buffer.imageData.width - 1;
		}

		let varyingBase = calculateVaryingBase(baseVertex, varyingSlopes, low, i);
		let depthLow = getDepth(varyingBase);

		for (let j = low; j < high; j++) {
			if (j >= 0 && i >= 0 && j < buffer.imageData.width && i < buffer.imageData.height) {
				let frag = fragmentShader(varyingBase, uniforms);
				//discard alpha of 0
				if (frag.a !== 0) {
					let idx = j + i * buffer.imageData.width;
					let depth = getDepth(varyingBase);
					//depth buffer
					if (depth > -1 && depth < 1) {
						if (depth <= buffer.depth[idx]) {
							buffer.depth[idx] = depth;
							setPixelAlphaBlend(buffer.imageData, idx * 4, frag.r, frag.g, frag.b, frag.a);
						}
					}
				}
			}
			incrementVaryingX(varyingBase, varyingSlopes);
		}
		sx1 += slope1;
		sx2 += slope2;
	}
}

function calculateVaryingBase(base, slopes, x, y) {
	let varyingBase = base.varyingArray.slice(0);
	let xDiff = x - base.point.x;
	let yDiff = y - base.point.y;
	incrementVarying(varyingBase, slopes, xDiff, yDiff);
	return varyingBase;
}

function incrementVaryingX(varying, slopes) {
	for (let i = 0; i < varying.length; i++) {
		varying[i] += slopes[i].dx;
	}
}
function incrementVarying(varying, slopes, dxm, dym) {
	for (let i = 0; i < varying.length; i++) {
		varying[i] += slopes[i].dx * dxm + slopes[i].dy * dym;
	}
}

export function getVarying(base, idx) {
	return base[idx] / base[base.length - 1];
}

export function getDepth(base) {
	return base[base.length - 2] / base[base.length - 1];
}
