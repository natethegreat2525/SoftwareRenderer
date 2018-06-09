export class Point3 {
	constructor(x, y, z) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	
	sub(p) {
		return new Point3(this.x - p.x, this.y - p.y, this.z - p.z);
	}
	
	add(p) {
		return new Point3(this.x + p.x, this.y + p.y, this.z + p.z);
	}
	
	dot2(p) {
		return this.x * p.x + this.y * p.y;
	}
	
	cross2(p) {
		return this.x * p.y - this.y * p.x;
	}
	
	clone() {
		return new Point3(this.x, this.y, this.z);
	}
}

export class Point4 {
	constructor(x, y, z, w) {
		this.x = x | 0;
		this.y = y | 0;
		this.z = z | 0;
		this.w = w | 0;
	}
	
	static fromPoint3(p3, w) {
		return new Point4(p3.x, p3.y, p3.z, w);
	}
	
	sub(p) {
		return new Point4(this.x - p.x, this.y - p.y, this.z - p.z, this.w - p.w);
	}
	
	add(p) {
		return new Point4(this.x + p.x, this.y + p.y, this.z + p.z, this.w + p.w);
	}
	
	cross2(p) {
		return this.x * p.y - this.y * p.x;
	}
	
	clone() {
		return new Point4(this.x, this.y, this.z, this.w);
	}
}

export class Mat4 {
	constructor() {
		this.vals = new Array(16).fill(0);
	}
	
	mult(m2) {
		let ret = new Mat4();
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				let idx = i + j * 4;
				for (let k = 0; k < 4; k++) {
					//dot product of the j'th row from m1 (this) and the i'th column from m2
					ret.vals[idx] += this.vals[k + j * 4] * m2.vals[i + k * 4];
				}
			}
		}
		return ret;
	}
	
	multVec4(vec) {
		let ret = new Point4();
		let vecV = [vec.x, vec.y, vec.z, vec.w];
		let retV = [0, 0, 0, 0];
		//multiply this x vec where vec is a 4x1 matrix
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 4; j++) {
				retV[i] += this.vals[j + i * 4] * vecV[j];
			}
		}
		ret.x = retV[0];
		ret.y = retV[1];
		ret.z = retV[2];
		ret.w = retV[3];
		return ret;
	}
	
	add(m2) {
		let ret = new Mat4();
		for (let i = 0; i < 16; i++) {
			ret.vals[i] = this.vals[i] + m2.vals[i];
		}
		return ret;
	}
	
	sub(m2) {
		let ret = new Mat4();
		for (let i = 0; i < 16; i++) {
			ret.vals[i] = this.vals[i] - m2.vals[i];
		}
		return ret;
	}
	
	static translate(x, y, z) {
		let m = new Mat4();
		m.vals[0] = 1;
		m.vals[5] = 1;
		m.vals[10] = 1;
		m.vals[15] = 1;

		m.vals[3] = x;
		m.vals[7] = y;
		m.vals[11] = z;
		return m;
	}
	
	static scale(x, y, z) {
		let m = new Mat4();
		m.vals[0] = x;
		m.vals[5] = y;
		m.vals[10] = z;
		m.vals[15] = 1;
		return m;
	}
}