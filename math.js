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
	
	dot3(p) {
		return this.x * p.x + this.y * p.y + this.z * p.z;
	}
	
	cross2(p) {
		return this.x * p.y - this.y * p.x;
	}
	
	magnitude() {
		return Math.sqrt(this.magSqr());
	}
	
	magSqr() {
		return this.x * this.x + this.y * this.y + this.z * this.z;
	}
	
	normalize() {
		let mag = this.magnitude();
		this.x /= mag;
		this.y /= mag;
		this.z /= mag;
		return this;
	}
	
	clone() {
		return new Point3(this.x, this.y, this.z);
	}
}

export class Point4 {
	constructor(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
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
	
	dot3(p) {
		return this.x * p.x + this.y * p.y + this.z * p.z;
	}
	
	multS(s) {
		return new Point4(this.x * s, this.y * s, this.z * s, this.w * s);
	}
	
	normalizeW() {
		this.x = this.x / this.w;
		this.y = this.y / this.w;
		this.z = this.z / this.w;
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
	
	inv() {
		//Not used in this example, but a very useful function to have around
		//found here: https://stackoverflow.com/questions/1148309/inverting-a-4x4-matrix
		let inv = new Array(16);
		let m = this.vals;
		inv[0] = m[5]  * m[10] * m[15] - 
				 m[5]  * m[11] * m[14] - 
				 m[9]  * m[6]  * m[15] + 
				 m[9]  * m[7]  * m[14] +
				 m[13] * m[6]  * m[11] - 
				 m[13] * m[7]  * m[10];

		inv[4] = -m[4]  * m[10] * m[15] + 
				  m[4]  * m[11] * m[14] + 
				  m[8]  * m[6]  * m[15] - 
				  m[8]  * m[7]  * m[14] - 
				  m[12] * m[6]  * m[11] + 
				  m[12] * m[7]  * m[10];

		inv[8] = m[4]  * m[9] * m[15] - 
				 m[4]  * m[11] * m[13] - 
				 m[8]  * m[5] * m[15] + 
				 m[8]  * m[7] * m[13] + 
				 m[12] * m[5] * m[11] - 
				 m[12] * m[7] * m[9];

		inv[12] = -m[4]  * m[9] * m[14] + 
				   m[4]  * m[10] * m[13] +
				   m[8]  * m[5] * m[14] - 
				   m[8]  * m[6] * m[13] - 
				   m[12] * m[5] * m[10] + 
				   m[12] * m[6] * m[9];

		inv[1] = -m[1]  * m[10] * m[15] + 
				  m[1]  * m[11] * m[14] + 
				  m[9]  * m[2] * m[15] - 
				  m[9]  * m[3] * m[14] - 
				  m[13] * m[2] * m[11] + 
				  m[13] * m[3] * m[10];

		inv[5] = m[0]  * m[10] * m[15] - 
				 m[0]  * m[11] * m[14] - 
				 m[8]  * m[2] * m[15] + 
				 m[8]  * m[3] * m[14] + 
				 m[12] * m[2] * m[11] - 
				 m[12] * m[3] * m[10];

		inv[9] = -m[0]  * m[9] * m[15] + 
				  m[0]  * m[11] * m[13] + 
				  m[8]  * m[1] * m[15] - 
				  m[8]  * m[3] * m[13] - 
				  m[12] * m[1] * m[11] + 
				  m[12] * m[3] * m[9];

		inv[13] = m[0]  * m[9] * m[14] - 
				  m[0]  * m[10] * m[13] - 
				  m[8]  * m[1] * m[14] + 
				  m[8]  * m[2] * m[13] + 
				  m[12] * m[1] * m[10] - 
				  m[12] * m[2] * m[9];

		inv[2] = m[1]  * m[6] * m[15] - 
				 m[1]  * m[7] * m[14] - 
				 m[5]  * m[2] * m[15] + 
				 m[5]  * m[3] * m[14] + 
				 m[13] * m[2] * m[7] - 
				 m[13] * m[3] * m[6];

		inv[6] = -m[0]  * m[6] * m[15] + 
				  m[0]  * m[7] * m[14] + 
				  m[4]  * m[2] * m[15] - 
				  m[4]  * m[3] * m[14] - 
				  m[12] * m[2] * m[7] + 
				  m[12] * m[3] * m[6];

		inv[10] = m[0]  * m[5] * m[15] - 
				  m[0]  * m[7] * m[13] - 
				  m[4]  * m[1] * m[15] + 
				  m[4]  * m[3] * m[13] + 
				  m[12] * m[1] * m[7] - 
				  m[12] * m[3] * m[5];

		inv[14] = -m[0]  * m[5] * m[14] + 
				   m[0]  * m[6] * m[13] + 
				   m[4]  * m[1] * m[14] - 
				   m[4]  * m[2] * m[13] - 
				   m[12] * m[1] * m[6] + 
				   m[12] * m[2] * m[5];

		inv[3] = -m[1] * m[6] * m[11] + 
				  m[1] * m[7] * m[10] + 
				  m[5] * m[2] * m[11] - 
				  m[5] * m[3] * m[10] - 
				  m[9] * m[2] * m[7] + 
				  m[9] * m[3] * m[6];

		inv[7] = m[0] * m[6] * m[11] - 
				 m[0] * m[7] * m[10] - 
				 m[4] * m[2] * m[11] + 
				 m[4] * m[3] * m[10] + 
				 m[8] * m[2] * m[7] - 
				 m[8] * m[3] * m[6];

		inv[11] = -m[0] * m[5] * m[11] + 
				   m[0] * m[7] * m[9] + 
				   m[4] * m[1] * m[11] - 
				   m[4] * m[3] * m[9] - 
				   m[8] * m[1] * m[7] + 
				   m[8] * m[3] * m[5];

		inv[15] = m[0] * m[5] * m[10] - 
				  m[0] * m[6] * m[9] - 
				  m[4] * m[1] * m[10] + 
				  m[4] * m[2] * m[9] + 
				  m[8] * m[1] * m[6] - 
				  m[8] * m[2] * m[5];

		let det = m[0] * inv[0] + m[1] * inv[4] + m[2] * inv[8] + m[3] * inv[12];

		if (det == 0)
			return null;

		det = 1.0 / det;

		let out = new Mat4();
		
		for (let i = 0; i < 16; i++)
			out.vals[i] = inv[i] * det;

		return out;
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
	
	static rotateX(r) {
		let m = new Mat4();
		m.vals[0] = 1;
		m.vals[15] = 1;
		
		m.vals[5] = Math.cos(r);
		m.vals[6] = Math.sin(r);
		m.vals[9] = -Math.sin(r);
		m.vals[10] = Math.cos(r);
		return m;
	}
	
	static rotateY(r) {
		let m = new Mat4();
		m.vals[5] = 1;
		m.vals[15] = 1;
		
		m.vals[0] = Math.cos(r);
		m.vals[2] = Math.sin(r);
		m.vals[8] = -Math.sin(r);
		m.vals[10] = Math.cos(r);
		return m;
	}
	
	static rotateZ(r) {
		let m = new Mat4();
		m.vals[10] = 1;
		m.vals[15] = 1;
		
		m.vals[0] = Math.cos(r);
		m.vals[1] = Math.sin(r);
		m.vals[4] = -Math.sin(r);
		m.vals[5] = Math.cos(r);
		return m;
	}
	
	static perspective(w, h, near, far, fov) {
		let r = Math.tan(fov / 2) * near;
		let t = r * h / w;
		let v00 = near / r;
		let v11 = near / t;
		let v22 = (far + near) / (near - far);
		let v23 = 2 * far * near / (near - far);
		let v32 = -1;
		
		let m = new Mat4();
		m.vals[0] = v00;
		m.vals[5] = v11;
		m.vals[10] = v22;
		m.vals[11] = v23;
		m.vals[14] = v32;
		return m;
	}
}