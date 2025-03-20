# Combiner {docsify-ignore}

Methods for combining elements.

| Method                                          | Result type | Brief description                                                                                    |
| ----------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------------- |
| [alternate](/reference/combiner?id=alternate)   | Array       | Alternate elements of arrays. One step - one element of the array.                                   |
| [mixin](/reference/combiner?id=mixin)           | Array       | Alternate elements of two arrays. One step - one or more elements from one array.                    |
| [mixinMulti](/reference/combiner?id=mixinmulti) | Array       | Alternate elements of an unlimited number of arrays. One step - one or more elements from one array. |
| [push](/reference/combiner?id=push)             | Array       | Add elements of the second array to the end of the first array, and so on.                           |

## alternate

Alternate array elements. One step is one array element.

### Arguments :id=alternate-arguments {docsify-ignore}

| Name        | Type   | Description                                                                                                                                                     |
| ----------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bound`     | String | The boundary of alternation. If `min`, alternation ends when one of the sources ends. If `max`, alternation continues as long as there are unaffected elements. |
| `...arrays` | Arrays | Sources of elements to alternate.                                                                                                                               |

### Return :id=alternate-return {docsify-ignore}

`resultArray` (array) - a new array in which the elements of the sources are alternated.

### Examples :id=alternate-examples {docsify-ignore}

1. Alternate elements of three arrays.

```js
let firstArray = [1, 3, 5];
let secondeArray = [2, 4, 6, 8, 10];
let thirdArray = [100, 200, 300];
let resultArray = Combiner.alternate(
  "max",
  firstArray,
  secondeArray,
  thirdArray
);
// result 1, 2, 100, 3, 4, 200, 5, 6, 300, 8, 10
```

2. Alternate top monthly plays and favorite tracks.

```js
let topTracks = Source.getTopTracks("short"); // say 50 tracks
let savedTracks = Source.getSavedTracks(20); //say 20 tracks
let resultArray = Combiner.alternate("min", topTracks, savedTracks);
// result contains 40 tracks
```

## mixin

Alternate elements of two arrays. One step - one or more elements from one array. Includes calling [mixinMulti](/reference/combiner?id=mixinmulti).

### Arguments :id=mixin-arguments {docsify-ignore}

| Name        | Type    | Description                                                                                                                                                                                  |
| ----------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `xArray`    | Array   | First source.                                                                                                                                                                                |
| `yArray`    | Array   | Second source.                                                                                                                                                                               |
| `xRow`      | Count   | Number of elements in a row from the first source.                                                                                                                                           |
| `yRow`      | Number  | Number of consecutive elements from the second source.                                                                                                                                       |
| `toLimitOn` | Boolean | Elements are alternated as long as the ratio can be maintained. If `true`, excess elements are not included in the result. If `false`, they are appended to the result. Defaults to `false`. |

### Return :id=mixin-return {docsify-ignore}

`resultArray` (array) - a new array in which elements of the two sources are alternated in the given ratio.

### Examples :id=mixin-examples {docsify-ignore}

1. Alternate playlist tracks and favorites in a ratio of 5 to 1. Discard excess.

```js
let tracks = Source.getTracks(playlistArray);
let savedTracks = Source.getSavedTracks();
let resultArray = Combiner.mixin(tracks, savedTracks, 5, 1, true);
```

## mixinMulti

Alternate elements of an unlimited number of arrays. One step - one or more elements from one array.

### Arguments :id=mixinmulti-arguments {docsify-ignore}

| Name     | Type   | Description                 |
| -------- | ------ | --------------------------- |
| `params` | Object | Parameters for alternation. |

#### Parameters for alternation :id=mixinmulti-params {docsify-ignore}

| Name        | Type    | Description                                                                                                                                                                                                                                                                                                                                   |
| ----------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `source`    | Array   | Arrays of sources.                                                                                                                                                                                                                                                                                                                            |
| `inRow`     | Array   | Elements that set the number of consecutive elements for each source.                                                                                                                                                                                                                                                                         |
| `toLimitOn` | Boolean | Elements are alternated as long as the ratio can be preserved. If `true`, excess elements are not included in the result. If `false`, they are appended to the result. Defaults to `false`. If `toLimitOn = true`, the first iteration checks the number of elements. If there are fewer elements than the ratio, an empty array is returned. |

### Return :id=mixinmulti-return {docsify-ignore}

`resultArray` (array) - a new array in which the elements of the sources are alternated in the given ratio.

### Examples :id=mixinmulti-examples {docsify-ignore}

1. Alternate elements in a 1:1:1 ratio. Keep all elements.

```js
let x = [1, 2, 3, 4, 5];
let y = [10, 20, 30, 40];
let z = [100, 200, 300];
let result = Combiner.mixinMulti({
  source: [x, y, z],
  inRow: [1, 1, 1],
});
// 1, 10, 100, 2, 20, 200, 3, 30, 300, 4, 40, 5
```

2. Alternate elements in a 2:4:2 ratio until the sequence can be preserved.

```js
let x = [1, 2, 3, 4, 5];
let y = [10, 20, 30, 40];
let z = [100, 200, 300];
let result = Combiner.mixinMulti({
  toLimitOn: true,
  source: [x, y, z],
  inRow: [2, 4, 2],
});
// 1, 2, 10, 20, 30, 40, 100, 200
```

3. Alternate recommendations, favorites, and listening history in a 4:1:1 ratio until consistency can be maintained.

```js
let recom = Source.getRecomTracks();
let saved = Source.getSavedTracks();
let recent = RecentTracks.get();
let tracks = Combiner.mixinMulti({
  toLimitOn: true,
  source: [recom, saved, recent],
  inRow: [4, 1, 1],
});
```

## push

Add elements of the second array to the end of the first array, and so on.

### Arguments :id=push-arguments {docsify-ignore}

| Name                 | Type   | Description                                                     |
| -------------------- | ------ | --------------------------------------------------------------- |
| `sourceArray`        | Array  | The first array. Elements of subsequent arrays are added to it. |
| `...additionalArray` | Arrays | Subsequent arrays to add to the previous one.                   |

### Return :id=push-return {docsify-ignore}

`sourceArray` (array) - the original first array after adding elements from other arrays.

### Examples :id=push-examples {docsify-ignore}

1. Append elements of the second array to the end of the first array.

```js
let firstArray = Source.getTracks(playlistArray); // say 20 tracks
let secondeArray = Source.getSavedTracks(); // say 40 tracks
Combiner.push(firstArray, secondeArray);
// now there are 60 tracks in firstArray
```

2. Append elements of the other two arrays to the first array.

```js
let firstArray = Source.getTracks(playlistArray); // say 25 tracks
let secondeArray = Source.getSavedTracks(); // let's say 100 tracks
let thirdArray = Source.getPlaylistTracks(); // let's say 20 tracks
Combiner.push(firstArray, secondeArray, thirdArray);
// now there are 145 tracks in firstArray
```
