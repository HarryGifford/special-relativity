import { MaxHeap } from "heap-typed";
import { ResizableFloat32Array, ResizableUint32Array } from "./resizeable-array";

export type GeomData = {
  vertexAttributes: {
    position: number[] | Float32Array;
    [kind: string]: number[] | Float32Array;
  };
  indices: number[] | Uint32Array | Int32Array | Uint16Array;
  /**
   * The number of elements in each vertex attribute.
   */
  strides: Record<string, number>;
};

export function breakupTriangles(config: GeomData,
  maxLength: number): boolean {
  const { vertexAttributes, strides } = config;
  const indices = new ResizableUint32Array(config.indices);
  const maxLengthSquared = maxLength * maxLength;
  const dataKinds = Object.keys(vertexAttributes);
  if (dataKinds.length === 0) {
    return false;
  }

  const vertexAttributesArrays: Record<string, ResizableFloat32Array> = {};
  for (const dataKind of dataKinds) {
    vertexAttributesArrays[dataKind] = new ResizableFloat32Array(vertexAttributes[dataKind]);
  }

  const positions = vertexAttributesArrays.position;
  const positionStride = strides.position;

  // Create a new vertex at the midpoint of each edge.
  const edgeToMidpoint = new Map<string, number>();

  // Helper function to get or create a new vertex at the midpoint of two vertices.
  function getOrCreateMidpointIndex(i1: number, i2: number): number {
    const key = [i1, i2].sort().join(",");
    let index = edgeToMidpoint.get(key);
    if (index != null) {
      return index;
    }
    index = positions.length / positionStride;
    edgeToMidpoint.set(key, index);
    for (const dataKind of dataKinds) {
      const stride = strides[dataKind];
      if (stride == null) {
        continue;
      }
      const data = vertexAttributesArrays[dataKind]!;
      for (let i = 0; i < stride; i++) {
        data.push((data.at(i1 * stride + i) + data.at(i2 * stride + i)) / 2);
      }
    }
    if (index == null) {
      throw new Error("Index should not be null");
    }
    return index;
  }

  // Helper function to add a new triangle.
  function addTriangle(i1: number, i2: number, i3: number, replaceIndex?: number) {
    if (i1 == null || i2 == null || i3 == null) {
      throw new Error("addTriangle: Index should not be null");
    }
    if (replaceIndex != null) {
      indices.set(i1, replaceIndex);
      indices.set(i2, replaceIndex + 1);
      indices.set(i3, replaceIndex + 2);
    } else {
      indices.push(i1, i2, i3);
    }
  }

  function getDistanceSquared(i1: number, i2: number) {
    let distSquared = 0;
    for (let i = 0; i < positionStride; i++) {
      distSquared += (
        positions.at(i1 * positionStride + i)
        - positions.at(i2 * positionStride + i)
      ) ** 2;
    }
    return distSquared;
  }

  // Keep track of whether the mesh has been modified.
  let modified = false;

  // Keep a queue of triangles to split.
  const queue: [number, number][] = [];

  // Keep a priority queue of triangles to split.
  const pq = new MaxHeap<[number, number]>([], {
    comparator: ([_ai, alen], [_bi, blen]) => alen - blen
  });

  // Populate the queue with all triangles.
  for (let i = 0; i < indices.length; i += 3) {
    pq.add([i, Number.POSITIVE_INFINITY]);
  }

  // Until the queue is empty, split the longest edge of each triangle.
  while (!pq.isEmpty()) {
    if (indices.length > 9000000) {
      break;
    }
    const [i, _dist] = pq.poll()!;
    const i1 = indices.at(i);
    const i2 = indices.at(i + 1);
    const i3 = indices.at(i + 2);

    const dist12 = getDistanceSquared(i1, i2);
    const dist23 = getDistanceSquared(i2, i3);
    const dist31 = getDistanceSquared(i3, i1);

    if (Number.isNaN(dist12) || Number.isNaN(dist23) || Number.isNaN(dist31)) {
      throw new Error("NaN distance found");
    }

    if (!Number.isFinite(dist12) || !Number.isFinite(dist23) || !Number.isFinite(dist31)) {
      throw new Error("Infinite distance found");
    }

    if (dist12 > maxLengthSquared && dist12 >= dist23 && dist12 >= dist31) {
      const i4 = getOrCreateMidpointIndex(i1, i2);
      const d14 = getDistanceSquared(i1, i4);
      const d42 = getDistanceSquared(i4, i2);
      addTriangle(i3, i4, i2);
      addTriangle(i1, i4, i3, i);
      pq.add([indices.length - 3, Math.max(dist31, d42, dist23)]);
      pq.add([i, Math.max(d14, dist23, dist31)]);
      modified = true;
    } else if (dist23 > maxLengthSquared && dist23 >= dist12 && dist23 >= dist31) {
      const i5 = getOrCreateMidpointIndex(i2, i3);
      const d25 = getDistanceSquared(i2, i5);
      const d53 = getDistanceSquared(i5, i3);
      addTriangle(i1, i5, i3);
      addTriangle(i5, i1, i2, i);
      pq.add([indices.length - 3, Math.max(dist12, d53, dist31)]);
      pq.add([i, Math.max(dist31, dist12, d25)]);
      modified = true;
    } else if (dist31 > maxLengthSquared && dist31 >= dist12 && dist31 >= dist23) {
      const i6 = getOrCreateMidpointIndex(i3, i1);
      const d36 = getDistanceSquared(i3, i6);
      const d61 = getDistanceSquared(i6, i1);
      addTriangle(i6, i2, i3);
      addTriangle(i2, i6, i1, i);
      pq.add([indices.length - 3, Math.max(dist12, dist23, d36)]);
      pq.add([i, Math.max(dist23, d61, dist12)]);
      modified = true;
    } else {
      if (dist12 > maxLengthSquared || dist23 > maxLengthSquared || dist31 > maxLengthSquared) {
        throw new Error("Distance should be less than the given distance");
      }
    }
  }

  // Update the vertex attributes.
  for (const dataKind of dataKinds) {
    vertexAttributes[dataKind] = vertexAttributesArrays[dataKind].getArray();
  }
  config.indices = indices.getArray();

  return modified;
}
