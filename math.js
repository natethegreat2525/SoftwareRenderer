export default class Point3 {
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