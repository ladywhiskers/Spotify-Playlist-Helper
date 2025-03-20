# RecentTracks

Methods for working with listening history.

| Method | Result Type | Brief Description |
|--------|-------------|-------------------|
| [appendTracks](/reference/filter?id=appendtracks) | - | Add an array of tracks to the listening history file. |
| [compress](/reference/filter?id=compress) | - | Remove insignificant track data in cumulative listening history files. |
| [get](/reference/filter?id=get) | Array | Retrieve tracks from the listening history. |

## appendTracks

Add an array of tracks to the listening history file. The playlist addition date `added_at` becomes the listening date `played_at`. If the date is not available, the function execution date is set. Sorted by listening date from newest to oldest.

!> Note the limit of 60,000 tracks for the listening history. The limit can be increased in the `config` file.

### Arguments :id=appendtracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `filename` | String | Name of the listening history file: `SpotifyRecentTracks` or `LastfmRecentTracks`. |
| `tracks` | Array | Tracks to be added. |

### Return :id=appendtracks-return {docsify-ignore}

No return value.

### Examples :id=appendtracks-examples {docsify-ignore}

1. Add all favorite tracks to the listening history

```js
let tracks = Source.getSavedTracks();
RecentTracks.appendTracks('SpotifyRecentTracks', tracks);
```

## compress

Remove insignificant track data in cumulative listening history files based on [parameters](/config). A copy of the file is created beforehand.

?> Used for compatibility with previous versions of the library. One execution is enough to compress the listening history files. New tracks in the history are compressed automatically.

### Arguments :id=compress-arguments {docsify-ignore}

No arguments.

### Return :id=compress-return {docsify-ignore}

No return value.

## get

Retrieve tracks from the listening history based on [parameters](/config). Sorted by listening date from newest to oldest.

### Arguments :id=get-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `limit` | Number | If specified, limit the number of returned tracks. If not, all available tracks. |

#### Listening History Parameters

| Enabled Parameter | Returned Array |
|-------------------|----------------|
| `ON_SPOTIFY_RECENT_TRACKS` | Listening history only from Spotify. File `SpotifyRecentTracks`. Duplicates are not removed. |
| `ON_LASTFM_RECENT_TRACKS` | Listening history only from Lastfm. File `LastfmRecentTracks`. Duplicates are not removed. |
| `ON_SPOTIFY_RECENT_TRACKS` and `ON_LASTFM_RECENT_TRACKS` | Combination of both sources with duplicates removed. File `BothRecentTracks`. |

### Return :id=get-return {docsify-ignore}

`tracks` (array) - tracks from the listening history.

### Examples :id=get-examples {docsify-ignore}

1. Retrieve an array of tracks from the listening history. The source of tracks depends on the parameters.

```js
let tracks = RecentTracks.get();
```

2. Retrieve 100 tracks from the listening history.

```js
let tracks = RecentTracks.get(100);
```
