# jaspis

This is an attempt at creating a library for packing elements to nice layouts with flexibility.
For now it can only calculate the positions of elements but not present them on calculated places (yet).

To see what is this about run test-app:
```
.../test/test-app/server $ node server.js
```
open your browser at `http://localhost:9001/` and mess around with it or open very simple demo at `http://localhost:9001/demo/jquery/`.

### usage
```
import PackingAlgorithm from '...';

const packer = new PackingAlgorithm(options);

const packedElements = packer.pack(elements);
```
where elements must be objects:
```
Element: {
  width: number;
  height: number;
  index?: number;
}
```
Results `packedElements` will be array of:
```
PackedElements: {
  top: number;
  left: number;
  index: number;
  width: number;
  height: number;
}
```
so you can place your elements in DOM according to given results.

You can call `.pack` incrementally to add new elements.

### options
```
Options: {
  rowHeight: number;
  columnWidth: number;
  containerWidth: number;
  keepIndexOrder?: booelan;
}
```
Given `keepIndexOrder = true` and small `columnWidth` (e.g `1`) this will behave same as well known masonry library.
