export function b2Class(name: string, params: any[]): any {
    if (name === "b2Vec2") {
        if (params.length === 0)
            return new b2Vec2(0, 0)

        if (params.length === 1)
            return new b2Vec2(params[0], 0)

        return new b2Vec2(params[0], params[1])
    }

    if (name === "b2Vec3") {
        if (params.length === 0)
            return new b2Vec3(0, 0, 0)

        if (params.length === 1)
            return new b2Vec3(params[0], 0, 0)

        if (params.length === 2)
            return new b2Vec3(params[0], params[1], 0)

        return new b2Vec3(params[0], params[1], params[2])
    }

    if (name === "b2Mat22")
        return new b2Mat22()

    if (name === "b2Mat33")
        return new b2Mat33()

    if (name === "b2AABB")
        return new b2AABB()

    if (name === "b2FilterData")
        return new b2FilterData()

    if (name === "b2BodyDef")
        return new b2BodyDef()

    if (name === "b2ContactID")
        return new b2ContactID()

    if (name === "b2Transform")
        return new b2Transform()
    
    return null
}

class b2Vec2 {
    __fast__: boolean = true
    
    x: number
    y: number

    constructor(x_: number = 0, y_: number = 0) {
        this.x = x_
        this.y = y_
    };

    SetZero(): void {
        this.x = 0.0
        this.y = 0.0
    }

    Set(x_: number = 0, y_: number = 0): void {
        this.x = x_
        this.y = y_
    };

    SetV(v: b2Vec2): void {
        this.x = v.x
        this.y = v.y
    };

    GetNegative(): b2Vec2 {
        return new b2Vec2(-this.x, -this.y)
    }

    NegativeSelf(): void {
        this.x = -this.x
        this.y = -this.y
    }

    static Make(x_: number, y_: number): b2Vec2 {
        return new b2Vec2(x_, y_)
    }

    Copy(): b2Vec2 {
        return new b2Vec2(this.x, this.y)
    }

    Add(v: b2Vec2): void {
        this.x += v.x
        this.y += v.y
    }

    Subtract(v: b2Vec2): void {
        this.x -= v.x
        this.y -= v.y
    }

    Multiply(a: number): void {
        this.x *= a
        this.y *= a
    }

    /*
    MulM(A:b2Mat22) : void
    {
        var tX:number = this.x;
        this.x = A.col1.x * tX + A.col2.x * this.y;
        this.y = A.col1.y * tX + A.col2.y * this.y;
    }
    
    MulTM(A:b2Mat22) : void
    {
        var tX:number = b2Math.Dot(this, A.col1);
        this.y = b2Math.Dot(this, A.col2);
        this.x = tX;
    }
    */

    CrossVF(s: number): void {
        var tX: number = this.x
        this.x = s * this.y
        this.y = -s * tX
    }

    CrossFV(s: number): void {
        var tX: number = this.x
        this.x = -s * this.y
        this.y = s * tX
    }

    MinV(b: b2Vec2): void {
        this.x = this.x < b.x ? this.x : b.x
        this.y = this.y < b.y ? this.y : b.y
    }

    MaxV(b: b2Vec2): void {
        this.x = this.x > b.x ? this.x : b.x
        this.y = this.y > b.y ? this.y : b.y
    }

    Abs(): void {
        if (this.x < 0) this.x = -this.x
        if (this.y < 0) this.y = -this.y
    }

    Length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y)
    }

    LengthSquared(): number {
        return (this.x * this.x + this.y * this.y)
    }

    Normalize(): number {
        var length: number = Math.sqrt(this.x * this.x + this.y * this.y)
        if (length < Number.MIN_VALUE) {
            return 0.0
        }
        var invLength: number = 1.0 / length
        this.x *= invLength
        this.y *= invLength

        return length
    }

    IsValid(): boolean {
        return isFinite(this.x) && isFinite(this.y)
    }

    toString(): string {
        return "[" + this.x + ", 5" + this.y + "]"
    }

}

class b2AABB {
    __fast__: boolean = true

    IsValid(): boolean {
        var dX: number = this.upperBound.x - this.lowerBound.x
        var dY: number = this.upperBound.y - this.lowerBound.y
        var valid: boolean = dX >= 0.0 && dY >= 0.0
        valid = valid && this.lowerBound.IsValid() && this.upperBound.IsValid()
        return valid
    }

    GetCenter(): b2Vec2 {
        return new b2Vec2((this.lowerBound.x + this.upperBound.x) / 2,
            (this.lowerBound.y + this.upperBound.y) / 2)
    }

    GetExtents(): b2Vec2 {
        return new b2Vec2((this.upperBound.x - this.lowerBound.x) / 2,
            (this.upperBound.y - this.lowerBound.y) / 2)
    }

    Contains(aabb: b2AABB): boolean {
        var result: boolean = true
        result = result && this.lowerBound.x <= aabb.lowerBound.x
        result = result && this.lowerBound.y <= aabb.lowerBound.y
        result = result && aabb.upperBound.x <= this.upperBound.x
        result = result && aabb.upperBound.y <= this.upperBound.y
        return result
    }

    /*
   RayCast(output:b2RayCastOutput, input:b2RayCastInput):boolean
   {
       var tmin:number = -number.MAX_VALUE;
       var tmax:number = number.MAX_VALUE;
       
       var pX:number = input.p1.x;
       var pY:number = input.p1.y;
       var dX:number = input.p2.x - input.p1.x;
       var dY:number = input.p2.y - input.p1.y;
       var absDX:number = Math.abs(dX);
       var absDY:number = Math.abs(dY);
       
       var normal:b2Vec2 = output.normal;
       
       var inv_d:number;
       var t1:number;
       var t2:number;
       var t3:number;
       var s:number;
       
       //x
       {
           if (absDX < number.MIN_VALUE)
           {
               // Parallel.
               if (pX < this.lowerBound.x || this.upperBound.x < pX)
                   return false;
           }
           else
           {
               inv_d = 1.0 / dX;
               t1 = (this.lowerBound.x - pX) * inv_d;
               t2 = (this.upperBound.x - pX) * inv_d;
               
               // Sign of the normal vector
               s = -1.0;
               
               if (t1 > t2)
               {
                   t3 = t1;
                   t1 = t2;
                   t2 = t3;
                   s = 1.0;
               }
               
               // Push the min up
               if (t1 > tmin)
               {
                   normal.x = s;
                   normal.y = 0;
                   tmin = t1;
               }
               
               // Pull the max down
               tmax = Math.min(tmax, t2);
               
               if (tmin > tmax)
                   return false;
           }
       }
       //y
       {
           if (absDY < number.MIN_VALUE)
           {
               // Parallel.
               if (pY < this.lowerBound.y || this.upperBound.y < pY)
                   return false;
           }
           else
           {
               inv_d = 1.0 / dY;
               t1 = (this.lowerBound.y - pY) * inv_d;
               t2 = (this.upperBound.y - pY) * inv_d;
               
               // Sign of the normal vector
               s = -1.0;
               
               if (t1 > t2)
               {
                   t3 = t1;
                   t1 = t2;
                   t2 = t3;
                   s = 1.0;
               }
               
               // Push the min up
               if (t1 > tmin)
               {
                   normal.y = s;
                   normal.x = 0;
                   tmin = t1;
               }
               
               // Pull the max down
               tmax = Math.min(tmax, t2);
               
               if (tmin > tmax)
                   return false;
           }
       }
       
       output.fraction = tmin;
       return true;
   }
   */

    TestOverlap(other: b2AABB): boolean {
        var d1X: number = other.lowerBound.x - this.upperBound.x
        var d1Y: number = other.lowerBound.y - this.upperBound.y
        var d2X: number = this.lowerBound.x - other.upperBound.x
        var d2Y: number = this.lowerBound.y - other.upperBound.y

        if (d1X > 0.0 || d1Y > 0.0)
            return false

        if (d2X > 0.0 || d2Y > 0.0)
            return false

        return true
    }

    static Combine(aabb1: b2AABB, aabb2: b2AABB): b2AABB {
        var aabb: b2AABB = new b2AABB()
        aabb.Combine(aabb1, aabb2)
        return aabb
    }

    Combine(aabb1: b2AABB, aabb2: b2AABB): void {
        this.lowerBound.x = Math.min(aabb1.lowerBound.x, aabb2.lowerBound.x)
        this.lowerBound.y = Math.min(aabb1.lowerBound.y, aabb2.lowerBound.y)
        this.upperBound.x = Math.max(aabb1.upperBound.x, aabb2.upperBound.x)
        this.upperBound.y = Math.max(aabb1.upperBound.y, aabb2.upperBound.y)
    }

    lowerBound: b2Vec2 = new b2Vec2()
    upperBound: b2Vec2 = new b2Vec2()
}

class b2Mat22 {
    __fast__: boolean = true

    b2Mat22() {
        this.col1.x = this.col2.y = 1.0
    }

    static FromAngle(angle: number): b2Mat22 {
        var mat: b2Mat22 = new b2Mat22()
        mat.Set(angle)
        return mat
    }

    static FromVV(c1: b2Vec2, c2: b2Vec2): b2Mat22 {
        var mat: b2Mat22 = new b2Mat22()
        mat.SetVV(c1, c2)
        return mat
    }

    Set(angle: number): void {
        var c: number = Math.cos(angle)
        var s: number = Math.sin(angle)
        this.col1.x = c
        this.col2.x = -s
        this.col1.y = s
        this.col2.y = c
    }

    SetVV(c1: b2Vec2, c2: b2Vec2): void {
        this.col1.SetV(c1)
        this.col2.SetV(c2)
    }

    Copy(): b2Mat22 {
        var mat: b2Mat22 = new b2Mat22()
        mat.SetM(this)
        return mat
    }

    SetM(m: b2Mat22): void {
        this.col1.SetV(m.col1)
        this.col2.SetV(m.col2)
    }

    AddM(m: b2Mat22): void {
        this.col1.x += m.col1.x
        this.col1.y += m.col1.y
        this.col2.x += m.col2.x
        this.col2.y += m.col2.y
    }

    SetIdentity(): void {
        this.col1.x = 1.0
        this.col2.x = 0.0
        this.col1.y = 0.0
        this.col2.y = 1.0
    }

    SetZero(): void {
        this.col1.x = 0.0
        this.col2.x = 0.0
        this.col1.y = 0.0
        this.col2.y = 0.0
    }

    GetAngle(): number {
        return Math.atan2(this.col1.y, this.col1.x)
    }

    GetInverse(out: b2Mat22): b2Mat22 {
        var a: number = this.col1.x
        var b: number = this.col2.x
        var c: number = this.col1.y
        var d: number = this.col2.y
        var det: number = a * d - b * c
        if (det != 0.0) {
            det = 1.0 / det
        }
        out.col1.x = det * d
        out.col2.x = -det * b
        out.col1.y = -det * c
        out.col2.y = det * a
        return out
    }

    Solve(out: b2Vec2, bX: number, bY: number): b2Vec2 {
        var a11: number = this.col1.x
        var a12: number = this.col2.x
        var a21: number = this.col1.y
        var a22: number = this.col2.y
        var det: number = a11 * a22 - a12 * a21
        if (det != 0.0) {
            det = 1.0 / det
        }
        out.x = det * (a22 * bX - a12 * bY)
        out.y = det * (a11 * bY - a21 * bX)

        return out
    }

    Abs(): void {
        this.col1.Abs()
        this.col2.Abs()
    }

    col1: b2Vec2 = new b2Vec2()
    col2: b2Vec2 = new b2Vec2()
}

class b2FilterData {
    __fast__: boolean = true

    Copy(): b2FilterData {
        var copy: b2FilterData = new b2FilterData()
        copy.categoryBits = this.categoryBits
        copy.maskBits = this.maskBits
        copy.groupIndex = this.groupIndex
        return copy
    }

    categoryBits: number = 0x0001
    maskBits: number = 0xFFFF
    groupIndex: number = 0
}

class b2BodyDef {
    __fast__: boolean = true

    type: number = 0
    position: b2Vec2 = new b2Vec2(0, 0)
    angle: number = 0
    linearVelocity: b2Vec2 = new b2Vec2(0, 0)
    angularVelocity: number = 0
    linearDamping: number = 0
    angularDamping: number = 0
    allowSleep: boolean = true
    awake: boolean = true
    fixedRotation: boolean = false
    bullet: boolean = false
    active: boolean = true
    userData: any = null
    inertiaScale: number = 1.0
}

class Features {
    __fast__: boolean = true

    get_referenceEdge(): number {
        return this._referenceEdge
    }

    set_referenceEdge(value: number): void {
        this._referenceEdge = value
        this._m_id._key = (this._m_id._key & 0xffffff00) | (this._referenceEdge & 0x000000ff)
    }

    _referenceEdge: number

    get_incidentEdge(): number {
        return this._incidentEdge
    }

    set_incidentEdge(value: number): void {
        this._incidentEdge = value
        this._m_id._key = (this._m_id._key & 0xffff00ff) | ((this._incidentEdge << 8) & 0x0000ff00)
    }

    _incidentEdge: number

    get_incidentVertex(): number {
        return this._incidentVertex
    }

    set_incidentVertex(value: number): void {
        this._incidentVertex = value
        this._m_id._key = (this._m_id._key & 0xff00ffff) | ((this._incidentVertex << 16) & 0x00ff0000)
    }

    _incidentVertex: number

    get_flip(): number {
        return this._flip
    }

    set_flip(value: number): void {
        this._flip = value
        this._m_id._key = (this._m_id._key & 0x00ffffff) | ((this._flip << 24) & 0xff000000)
    }

    _flip: number

    _m_id: b2ContactID
}

class b2ContactID {
    __fast__: boolean = true

    constructor() {
        this.features._m_id = this
    }

    Set(id: b2ContactID): void {
        this.set_key(id._key)
    }

    Copy(): b2ContactID {
        var id: b2ContactID = new b2ContactID()
        id.set_key(this._key)
        return id
    }

    get_key(): number {
        return this._key
    }

    set_key(value: number): void {
        this._key = value
        this.features._referenceEdge = value & 0x000000ff
        this.features._incidentEdge = ((value & 0x0000ff00) >> 8) & 0x000000ff
        this.features._incidentVertex = ((value & 0x00ff0000) >> 16) & 0x000000ff
        this.features._flip = ((value & 0xff000000) >> 24) & 0x000000ff
    }

    features: Features = new Features()

    _key: number
}

class b2Vec3 {
    __fast__: boolean = true

    constructor(x: number = 0, y: number = 0, z: number = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    SetZero(): void {
        this.x = this.y = this.z = 0.0
    }

    Set(x: number, y: number, z: number): void {
        this.x = x
        this.y = y
        this.z = z
    }

    SetV(v: b2Vec3): void {
        this.x = v.x
        this.y = v.y
        this.z = v.z
    }

    GetNegative(): b2Vec3 {
        return new b2Vec3(-this.x, -this.y, -this.z)
    }

    NegativeSelf(): void {
        this.x = -this.x
        this.y = -this.y
        this.z = -this.z
    }

    Copy(): b2Vec3 {
        return new b2Vec3(this.x, this.y, this.z)
    }

    Add(v: b2Vec3): void {
        this.x += v.x
        this.y += v.y
        this.z += v.z
    }

    Subtract(v: b2Vec3): void {
        this.x -= v.x
        this.y -= v.y
        this.z -= v.z
    }

    Multiply(a: number): void {
        this.x *= a
        this.y *= a
        this.z *= a
    }

    x: number
    y: number
    z: number
}

class b2Transform {
    __fast__: boolean = true

    constructor(pos: b2Vec2 = null, r: b2Mat22 = null) {
        if (pos) {
            this.position.SetV(pos)
            this.R.SetM(r)
        }
    }

    Initialize(pos: b2Vec2, r: b2Mat22): void {
        this.position.SetV(pos)
        this.R.SetM(r)
    }

    SetIdentity(): void {
        this.position.SetZero()
        this.R.SetIdentity()
    }

    Set(x: b2Transform): void {
        this.position.SetV(x.position)
        this.R.SetM(x.R)
    }

    GetAngle(): number {
        return Math.atan2(this.R.col1.y, this.R.col1.x)
    }

    position: b2Vec2 = new b2Vec2()
    R: b2Mat22 = new b2Mat22()
}

class b2Mat33 {
    __fast__: boolean = true

    constructor() {
    }

    SetVVV(c1: b2Vec3, c2: b2Vec3, c3: b2Vec3): void {
        this.col1.SetV(c1)
        this.col2.SetV(c2)
        this.col3.SetV(c3)
    }

    Copy(): b2Mat33 {
        var r = new b2Mat33()
        r.SetVVV(this.col1, this.col2, this.col3)
        return r
    }

    SetM(m: b2Mat33): void {
        this.col1.SetV(m.col1)
        this.col2.SetV(m.col2)
        this.col3.SetV(m.col3)
    }

    AddM(m: b2Mat33): void {
        this.col1.x += m.col1.x
        this.col1.y += m.col1.y
        this.col1.z += m.col1.z
        this.col2.x += m.col2.x
        this.col2.y += m.col2.y
        this.col2.z += m.col2.z
        this.col3.x += m.col3.x
        this.col3.y += m.col3.y
        this.col3.z += m.col3.z
    }

    SetIdentity(): void {
        this.col1.x = 1.0
        this.col2.x = 0.0
        this.col3.x = 0.0
        this.col1.y = 0.0
        this.col2.y = 1.0
        this.col3.y = 0.0
        this.col1.z = 0.0
        this.col2.z = 0.0
        this.col3.z = 1.0
    }

    SetZero(): void {
        this.col1.x = 0.0
        this.col2.x = 0.0
        this.col3.x = 0.0
        this.col1.y = 0.0
        this.col2.y = 0.0
        this.col3.y = 0.0
        this.col1.z = 0.0
        this.col2.z = 0.0
        this.col3.z = 0.0
    }

    Solve22(out: b2Vec2, bX: number, bY: number): b2Vec2 {
        var a11: number = this.col1.x
        var a12: number = this.col2.x
        var a21: number = this.col1.y
        var a22: number = this.col2.y
        var det: number = a11 * a22 - a12 * a21
        if (det != 0.0) {
            det = 1.0 / det
        }
        out.x = det * (a22 * bX - a12 * bY)
        out.y = det * (a11 * bY - a21 * bX)

        return out
    }

    Solve33(out: b2Vec3, bX: number, bY: number, bZ: number): b2Vec3 {
        var a11: number = this.col1.x
        var a21: number = this.col1.y
        var a31: number = this.col1.z
        var a12: number = this.col2.x
        var a22: number = this.col2.y
        var a32: number = this.col2.z
        var a13: number = this.col3.x
        var a23: number = this.col3.y
        var a33: number = this.col3.z
        var det: number = a11 * (a22 * a33 - a32 * a23) +
            a21 * (a32 * a13 - a12 * a33) +
            a31 * (a12 * a23 - a22 * a13)
        if (det != 0.0) {
            det = 1.0 / det
        }
        out.x = det * (bX * (a22 * a33 - a32 * a23) +
            bY * (a32 * a13 - a12 * a33) +
            bZ * (a12 * a23 - a22 * a13))
        out.y = det * (a11 * (bY * a33 - bZ * a23) +
            a21 * (bZ * a13 - bX * a33) +
            a31 * (bX * a23 - bY * a13))
        out.z = det * (a11 * (a22 * bZ - a32 * bY) +
            a21 * (a32 * bX - a12 * bZ) +
            a31 * (a12 * bY - a22 * bX))
        return out
    }

    col1: b2Vec3 = new b2Vec3()
    col2: b2Vec3 = new b2Vec3()
    col3: b2Vec3 = new b2Vec3()
}

