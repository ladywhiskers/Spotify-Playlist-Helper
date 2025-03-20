# Cache {docsify-ignore}

Methods for managing Google Drive data.

By default, `json` is assumed without specifying a file extension. `txt` text format is supported when specified explicitly.

| Method                                                 | Result type         | Short description                                                  |
| ------------------------------------------------------ | ------------------- | ------------------------------------------------------------------ |
| [append](/reference/cache?id=append)                   | Number              | Append data to an array from a file.                               |
| [compressArtists](/reference/cache?id=compressartists) | -                   | Remove irrelevant artist data.                                     |
| [compressTracks](/reference/cache?id=compresstracks)   | -                   | Remove irrelevant track data.                                      |
| [copy](/reference/cache?id=copy)                       | String              | Create a copy of the file in the same folder as the original file. |
| [read](/reference/cache?id=read)                       | Array/Object/String | Read data from a file.                                             |
| [remove](/reference/cache?id=remove)                   | -                   | Move a file to the Google Drive trash.                             |
| [rename](/reference/cache?id=rename)                   | -                   | Rename a file.                                                     |
| [write](/reference/cache?id=write)                     | -                   | Write data to a file.                                              |

## append

Append data to an array from a file. Creates the file if it does not exist.

### Arguments :id=append-arguments {docsify-ignore}

| Name       | Type   | Description                                                                                      |
| ---------- | ------ | ------------------------------------------------------------------------------------------------ |
| `filepath` | String | [Path to file](/best-practices?id=Path-to-file).                                                 |
| `content`  | Array  | Data to append.                                                                                  |
| `place`    | String | Place to join: `begin` - start, `end` - end. Defaults to `end`.                                  |
| `limit`    | Number | Limit the number of array elements after appending new data. </br> Defaults to 200,000 elements. |

### Return :id=append-return {docsify-ignore}

`contentLength` (number) - number of elements after appending.

### Examples :id=append-examples {docsify-ignore}

1. Append playlist tracks to the beginning of the file. Limit the array to 5 thousand tracks after appending.

```js
let tracks = Source.getPlaylistTracks("playlist name", "id");
Cache.append("filename.json", tracks, "begin", 5000);
```

2. Append playlist tracks to the end of the file.

```js
let tracks = Source.getPlaylistTracks("playlist name", "id");
Cache.append("filename.json", tracks);
```

## compressArtists

Remove irrelevant data about artists. Use before saving to file to reduce its size.

### Arguments :id=compressartists-arguments {docsify-ignore}

| Name      | Type  | Description                             |
| --------- | ----- | --------------------------------------- |
| `artists` | Array | Artists to remove irrelevant data from. |

### Return :id=compressartists-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=compressartists-examples {docsify-ignore}

1. Reduce the size of the file with the artists array.

```js
let filename = "artists.json";
let artists = Cache.read(filename);
Cache.compressArtists(artists);
Cache.write(filename, artists);
```

## compressTracks

Remove irrelevant track data. Use before saving to file to reduce its size. Enables calling [compressArtists](/reference/cache?id=compressartists)

### Arguments :id=compresstracks-arguments {docsify-ignore}

| Name     | Type  | Description                            |
| -------- | ----- | -------------------------------------- |
| `tracks` | Array | Tracks to remove irrelevant data from. |

### Return :id=compresstracks-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=compresstracks-examples {docsify-ignore}

1. Reduce the size of a file with an array of tracks.

```js
let filename = "tracks.json";
let tracks = Cache.read(filename);
Cache.compressTracks(tracks);
Cache.write(filename, tracks);
```

## copy

Create a copy of the file in the same folder as the original file.

### Arguments :id=copy-arguments {docsify-ignore}

| Name       | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `filepath` | String | [Path to file](/best-practices?id=Path-to-file). |

### Return :id=copy-return {docsify-ignore}

`filecopypath` (string) - path to the created copy.

### Examples :id=copy-examples {docsify-ignore}

1. Create a copy of the file and read its data.

```js
let filename = "tracks.json";
let filecopyname = Cache.copy(filename);
let tracks = Cache.read(filecopyname);
```

## read

Read data from the file.

### Arguments :id=read-arguments {docsify-ignore}

| Name       | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `filepath` | String | [Path to file](/best-practices?id=Path-to-file). |

### Return :id=read-return {docsify-ignore}

`content` (array/object/string) - data from the file.

If the file does not exist, the extension in the `filepath` string is checked. If _json_ is absent or equal, it will return an empty array. In other cases, an empty string.

### Examples :id=read-examples {docsify-ignore}

1. Read data from the file and add to the playlist.

```js
let tracks = Cache.read("tracks.json");
Playlist.saveAsNew({
  name: "Tracks from file",
  tracks: tracks,
});
```

## remove

Move a file to the Google Drive trash. The trash is deleted after 30 days.

### Arguments :id=remove-arguments {docsify-ignore}

| Name       | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `filepath` | String | [Path to file](/best-practices?id=Path-to-file). |

### Return :id=remove-return {docsify-ignore}

No return value.

### Examples :id=remove-examples {docsify-ignore}

1. Move a file to the trash

```js
Cache.remove("filepath.json");
```

## rename

Rename a file.

!> Do not use the names `SpotifyRecentTracks`, `LastfmRecentTracks`, `BothRecentTracks`. They are needed in the [listening history](/details?id=Listening-history) accumulation mechanism.

### Arguments :id=rename-arguments {docsify-ignore}

| Name          | Type   | Description                                      |
| ------------- | ------ | ------------------------------------------------ |
| `filepath`    | String | [Path to file](/best-practices?id=Path-to-file). |
| `newFilename` | String | New file name (not path)                         |

### Return :id=rename-return {docsify-ignore}

No return value.

### Examples :id=rename-examples {docsify-ignore}

1. Rename a file.

```js
Cache.rename("filename.json", "newname.json");
```

## write

Write data to a file. Creates a file if it does not exist. Overwrites a file if it exists.

### Arguments :id=write-arguments {docsify-ignore}

| Name       | Type   | Description                                      |
| ---------- | ------ | ------------------------------------------------ |
| `filepath` | String | [Path to file](/best-practices?id=Path-to-file). |
| `content`  | Array  | Data to write.                                   |

### Return :id=write-return {docsify-ignore}

No return value.

### Examples :id=write-examples {docsify-ignore}

1. Write favorite tracks to a file.

```js
let tracks = Sourct.getSavedTracks();
Cache.write("liked.json", tracks);
```
