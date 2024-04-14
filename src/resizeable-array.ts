export class ResizableFloat32Array {
  private data: Float32Array;
  public length: number;
  constructor(capacity: number | number[] | Float32Array) {
    if (capacity instanceof Float32Array) {
      this.data = capacity;
      this.length = capacity.length;
    } else if (Array.isArray(capacity)) {
      this.data = new Float32Array(capacity);
      this.length = capacity.length;
    } else {
      this.data = new Float32Array(capacity);
      this.length = 0;
    }
  }

  public push(...values: number[]) {
    if (this.length + values.length > this.data.length) {
      const newData = new Float32Array(Math.max(this.length + values.length, this.data.length * 2));
      newData.set(this.data);
      this.data = newData;
    }
    this.data.set(values, this.length);
    this.length += values.length;
  }

  public resize(length: number) {
    if (length > this.data.length) {
      throw new Error("Length should be less than the data length");
    }
    this.length = length;
  }

  public at(index: number) {
    return this.data[index];
  }

  public set(value: number, index: number) {
    this.data[index] = value;
  }

  public getArray() {
    return this.data.subarray(0, this.length);
  }
}

export class ResizableUint32Array {
  private data: Uint32Array;
  public length: number;
  constructor(capacity: number | number[] | Uint32Array | Int32Array | Uint16Array) {
    if(capacity instanceof Uint32Array) {
      this.data = capacity;
      this.length = capacity.length;
    } else if (capacity instanceof Int32Array || capacity instanceof Uint16Array) {
      this.data = new Uint32Array(capacity);
      this.length = capacity.length;
    } else if (Array.isArray(capacity)) {
      this.data = new Uint32Array(capacity);
      this.length = capacity.length;
    } else {
      this.data = new Uint32Array(capacity);
      this.length = 0;
    }
  }

  public push(...values: number[]) {
    if (this.length + values.length > this.data.length) {
      const newData = new Uint32Array(Math.max(this.length + values.length, this.data.length * 2));
      newData.set(this.data);
      this.data = newData;
    }
    this.data.set(values, this.length);
    this.length += values.length;
  }

  public resize(length: number) {
    if (length > this.data.length) {
      throw new Error("Length should be less than the data length");
    }
    this.length = length;
  }

  public at(index: number) {
    return this.data[index];
  }

  public set(value: number, index: number) {
    this.data[index] = value;
  }

  public getArray() {
    return this.data.subarray(0, this.length);
  }
}
