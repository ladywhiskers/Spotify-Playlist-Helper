# Lastfm

Methods for interacting with Last.fm.

!> The equivalent tracks are found by searching Spotify for the best match. If no match is found, the track is ignored. One Last.fm track equals one search query. Be mindful of the [limitations](/details?id=limitations) on the number of queries per day and execution time.

| Method | Result Type | Brief Description |
|--------|-------------|-------------------|
| [convertToSpotify](/reference/lastfm?id=converttospotify) | Array | Find Spotify items based on Last.fm data. |
| [getAlbumsByTag](/reference/lastfm?id=getalbumsbytag) | Array | Get albums by tag. |
| [getArtistsByTag](/reference/lastfm?id=getartistsbytag) | Array | Get artists by tag. |
| [getCustomTop](/reference/lastfm?id=getcustomtop) | Array | Get a custom top list for a user. |
| [getLibraryStation](/reference/lastfm?id=getlibrarystation) | Array | Get tracks from the Last.fm _library_ station. |
| [getLovedTracks](/reference/lastfm?id=getlovedtracks) | Array | Get Last.fm _loved_ tracks. |
| [getMixStation](/reference/lastfm?id=getmixstation) | Array | Get tracks from the Last.fm _mix_ station. |
| [getNeighboursStation](/reference/lastfm?id=getneighboursstation) | Array | Get tracks from the Last.fm _neighbours_ station. |
| [getRecentTracks](/reference/lastfm?id=getrecenttracks) | Array | Get the listening history of a Last.fm user. |
| [getRecomStation](/reference/lastfm?id=getrecomstation) | Array | Get tracks from the Last.fm _recommendations_ station. |
| [getSimilarArtists](/reference/lastfm?id=getsimilarartists) | Array | Get similar artists. |
| [getSimilarTracks](/reference/lastfm?id=getsimilartracks) | Array | Get similar tracks. |
| [getTopAlbums](/reference/lastfm?id=gettopalbums) | Array | Get the top albums for a user. |
| [getTopAlbumsByTag](/reference/lastfm?id=gettopalbumsbytag) | Array | Get top albums by tag. |
| [getTopArtists](/reference/lastfm?id=gettopartists) | Array | Get the top artists for a user. |
| [getTopArtistsByTag](/reference/lastfm?id=getTopArtistsByTag) | Array | Get top artists by tag. |
| [getTopTracks](/reference/lastfm?id=gettoptracks) | Array | Get the top tracks for a user. |
| [getTopTracksByTag](/reference/lastfm?id=gettoptracksbytag) | Array | Get top tracks by tag. |
| [getTracksByTag](/reference/lastfm?id=gettracksbytag) | Array | Get tracks by tag. |
| [rangeTags](/reference/lastfm?id=rangetags) | - | Filter tracks by tags. |
| [removeRecentArtists](/reference/lastfm?id=removerecentartists) | - | Remove artists based on Last.fm listening history. |
| [removeRecentTracks](/reference/lastfm?id=removerecenttracks) | - | Remove tracks based on Last.fm listening history. |

## convertToSpotify

Find Spotify items based on Last.fm data.

### Arguments :id=converttospotify-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | String | Items in Last.fm format. For example, obtained from [getCustomTop](/reference/lastfm?id=getcustomtop) with `isRawItems = true`. |
| `type` | String | Search type: `track`, `artist`, or `album`. Default is `track`. |

### Return :id=converttospotify-return {docsify-ignore}

`items` (array) - search results.

## getAlbumsByTag

Get albums by tag. Parses names from the tag page, [for example](https://www.last.fm/tag/indie/albums).

### Arguments :id=getalbumsbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tag` | String | Tag name. |
| `limit` | Number | Maximum number of albums. |

### Return :id=getalbumsbytag-return {docsify-ignore}

`albums` (array) - search results for albums on Spotify.

### Examples :id=getalbumsbytag-examples {docsify-ignore}

1. Get albums by tag.

```js
let albums = Lastfm.getAlbumsByTag('indie', 40);
```

## getArtistsByTag

Get artists by tag. Parses names from the tag page, [for example](https://www.last.fm/tag/pixie/artists).

### Arguments :id=getartistsbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tag` | String | Tag name. |
| `limit` | Number | Maximum number of artists. |

### Return :id=getartistsbytag-return {docsify-ignore}

`artists` (array) - search results for artists on Spotify.

### Examples :id=getartistsbytag-examples {docsify-ignore}

1. Get artists by tag.

```js
let artists = Lastfm.getArtistsByTag('pixie', 40);
```

## getCustomTop

Get a custom top list for a user.

?> There is a [detailed example](https://github.com/Chimildic/goofy/discussions/91) on the forum, allowing you to get _recommendations from the past_.

### Arguments :id=getcustomtop-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. |

#### Selection Parameters :id=getcustomtop-params {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | Object | Last.fm user login. Default is the value from the `config file`. |
| `from` | Date/String/Number | Start of the period. |
| `to` | Date/String/Number | End of the period. |
| `type` | String | Type: `track`, `artist`, or `album`. Default is `track`. |
| `count` | Number | Number of items. Default is 40. |
| `offset` | Number | Skip the first N items. Default is 0. |
| `minPlayed` | Number | Minimum number of plays inclusive. Default is 0. |
| `maxPlayed` | Number | Maximum number of plays inclusive. Default is 100,000. |
| `isRawItems` | Boolean | When not specified or `false`, search for items by name on Spotify. If `true`, result from lastfm items. Ignores `count` and `offset`. May be needed for self-filtering. Then use the function [convertToSpotify](/reference/lastfm?id=converttospotify). |

### Return :id=getcustomtop-return {docsify-ignore}

`items` (array) - selection result, sorted by the number of plays (in case of `isRawItems = false`).

The result objects will have a `countPlayed` key with the number of plays.

### Examples :id=getcustomtop-examples {docsify-ignore}

1. Select the top 40 tracks for 2015

```js
let topTracks = Lastfm.getCustomTop({
  from: '2015-01-01', // or new Date('2015-01-01'),
  to: '2015-12-31', // or new Date('2015-12-31').getTime(),
});
```

2. Select the top 10 artists for the first half of 2014

```js
let topArtists = Lastfm.getCustomTop({
  type: 'artist',
  from: '2014-01-01',
  to: '2014-06-30',
  count: 10,
});
```

## getLibraryStation

Get tracks from the Last.fm _library_ station. Contains only scrobbled tracks. Pay attention to the warning from [getRecentTracks](/reference/lastfm?id=getrecenttracks).

### Arguments :id=getlibrarystation-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `countRequest` | Number | Number of requests to Last.fm. One request gives about 20 to 30 tracks. |

### Return :id=getlibrarystation-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getlibrarystation-examples {docsify-ignore}

1. Get tracks from the _library_ station.

```js
let tracks = Lastfm.getLibraryStation('login', 2);
```

## getLovedTracks

Get Last.fm _loved_ tracks. Pay attention to the warning from [getRecentTracks](/reference/lastfm?id=getrecenttracks). Includes the date added, can use a date filter.

### Arguments :id=getlovedtracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `limit` | Number | Limit the number of tracks. |

### Return :id=getlovedtracks-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getlovedtracks-examples {docsify-ignore}

1. Get Last.fm _loved_ tracks.

```js
let tracks = Lastfm.getLovedTracks('login', 200);
```

## getMixStation

Get tracks from the Last.fm _mix_ station. Contains scrobbled tracks and Last.fm recommendations. Pay attention to the warning from [getRecentTracks](/reference/lastfm?id=getrecenttracks).

### Arguments :id=getmixstation-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `countRequest` | Number | Number of requests to Last.fm. One request gives about 20 to 30 tracks. |

### Return :id=getmixstation-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getmixstation-examples {docsify-ignore}

1. Get tracks from the _mix_ station.

```js
let tracks = Lastfm.getMixStation('login', 2);
```

## getNeighboursStation

Get tracks from the Last.fm _neighbours_ station. Contains tracks that Last.fm users with similar musical tastes listen to. Pay attention to the warning from [getRecentTracks](/reference/lastfm?id=getrecenttracks).

### Arguments :id=getneighboursstation-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `countRequest` | Number | Number of requests to Last.fm. One request gives about 20 to 30 tracks. |

### Return :id=getneighboursstation-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getneighboursstation-examples {docsify-ignore}

1. Get tracks from the _neighbours_ station.

```js
let tracks = Lastfm.getNeighboursStation('login', 2);
```

## getRecentTracks

Get the listening history of a Last.fm user. Account privacy settings must be disabled.

### Arguments :id=getrecenttracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `count` | Number | Limit the number of tracks. |

### Return :id=getrecenttracks-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getrecenttracks-examples {docsify-ignore}

1. Get 200 recently played tracks.

```js
let tracks = Lastfm.getRecentTracks('login', 200);
```

## getRecomStation

Get tracks from the Last.fm _recommendations_ station. Pay attention to the warning from [getRecentTracks](/reference/lastfm?id=getrecenttracks).

### Arguments :id=getrecomstation-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `countRequest` | Number | Number of requests to Last.fm. One request gives about 20 to 30 tracks. |

### Return :id=getrecomstation-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getrecomstation-examples {docsify-ignore}

1. Get tracks from the _recommendations_ station.

```js
let tracks = Lastfm.getRecomStation('login', 2);
```

## getSimilarArtists

Get similar artists.

### Arguments :id=getsimilarartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | Array | Tracks or artists. Only `name` is significant. |
| `match` | Number | Minimum similarity value of the artist in the range from _0.0_ to _1.0_.  |
| `limit` | Number | Number of similar artists per original. |
| `isFlat` | Number | If `false`, the result is grouped by artists. If `true`, all artists are in one array. Default is `true`. |

### Return :id=getsimilarartists-return {docsify-ignore}

`artists` (array) - search results for artists on Spotify.

### Examples :id=getsimilarartists-examples {docsify-ignore}

1. Get artists similar to the followed ones.

```js
let artists = Source.getArtists({ followed_include: true, });
let similarArtists = Lastfm.getSimilarArtists(artists, 0.65, 20);
```

## getSimilarTracks

Get similar tracks.

### Arguments :id=getsimilartracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks or artists. Only `name` is significant. |
| `match` | Number | Minimum similarity value of the track in the range from _0.0_ to _1.0_.  |
| `limit` | Number | Number of similar tracks per original. |
| `isFlat` | Number | If `false`, the result is grouped by input tracks. If `true`, all tracks are in one array. Default is `true`. |

### Return :id=getsimilartracks-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=getsimilartracks-examples {docsify-ignore}

1. Get tracks similar to the playlist tracks.

```js
let playlistTracks = Source.getPlaylistTracks('name', 'id');
let similarTracks = Lastfm.getSimilarTracks(playlistTracks, 0.65, 30);
```

## getTopAlbums

Get the top albums for a user.

### Arguments :id=gettopalbums-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. Similar to the parameters of [getTopTracks](/reference/lastfm?id=gettoptracks). |

### Return :id=gettopalbums-return {docsify-ignore}

`albums` (array) - search results for albums on Spotify.

### Examples :id=gettopalbums-examples {docsify-ignore}

1. Get the top 10 albums for six months.

```js
let albums = Lastfm.getTopAlbums({
  user: 'login',
  period: '6month',
  limit: 10
});
```

## getTopAlbumsByTag

Get top albums by tag.

### Arguments :id=gettopalbumsbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. |

#### Selection Parameters :id=gettopalbumsbytag-params {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tag` | String | Tag name. |
| `limit` | Number | Number of albums per page. Default is 50. Can be more, but in this case Last.fm sometimes gives a different number. |
| `page` | Number | Page number, used for shifting through the result. Default is 1. |

### Return :id=gettopalbumsbytag-return {docsify-ignore}

`albums` (array) - search results for albums on Spotify.

### Examples :id=gettopalbumsbytag-examples {docsify-ignore}

1. Get albums 51-100 by rock tag

```js
let albums = Lastfm.getTopAlbumsByTag({
  tag: 'rock',
  page: 2,
})
```

## getTopArtists

Get the top artists for a user.

### Arguments :id=gettopartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. Similar to the parameters of [getTopTracks](/reference/lastfm?id=gettoptracks). |

### Return :id=gettopartists-return {docsify-ignore}

`artists` (array) - search results for artists on Spotify.

### Examples :id=gettopartists-examples {docsify-ignore}

1. Get the top 10 artists for six months.

```js
let artists = Lastfm.getTopArtists({
  user: 'login',
  period: '6month',
  limit: 10
});
```

## getTopArtistsByTag

Get top artists by tag.

### Arguments :id=gettopartistsbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. Similar to the parameters of [getTopAlbumsByTag](/reference/lastfm?id=gettopalbumsbytag). |

### Return :id=gettopartistsbytag-return {docsify-ignore}

`artists` (array) - search results for artists on Spotify.

### Examples :id=gettopartistsbytag-examples {docsify-ignore}

1. Get the second ten artists from the indie top.

```js
let artists = Lastfm.getTopArtistsByTag({
  tag: 'indie',
  limit: 10,
  page: 2,
})
```

## getTopTracks

Get the top tracks for a user.

### Arguments :id=gettoptracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. |

#### Selection Parameters :id=gettoptracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `period` | String | One of the values: _overall_, _7day_, _1month_, _3month_, _6month_, _12month_. |
| `limit` | Number | Limit the number of tracks. |

### Return :id=gettoptracks-return {docsify-ignore}

`artists` (array) - search results for artists on Spotify.

### Examples :id=gettoptracks-examples {docsify-ignore}

1. Get the top 40 tracks for six months.

```js
let tracks = Lastfm.getTopTracks({
  user: 'your login',
  period: '6month',
  limit: 40
});
```

## getTopTracksByTag

Get top tracks by tag.

### Arguments :id=gettoptracksbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `params` | Object | Selection parameters. Similar to the parameters of [getTopAlbumsByTag](/reference/lastfm?id=gettopalbumsbytag). |

### Return :id=gettoptracksbytag-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=gettoptracksbytag-examples {docsify-ignore}

1. Get top 20 tracks by pop tag.

```js
let tracks = Lastfm.getTopTracksByTag({
  tag: 'pop',
  limit: 20,
})
```

## getTracksByTag

Get tracks by tag. Parses names from the tag page, [for example](https://www.last.fm/ru/tag/vocal/tracks?page=1).

### Arguments :id=gettracksbytag-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tag` | String | Tag name. |
| `limit` | Number | Maximum number of tracks. |

### Return :id=gettracksbytag-return {docsify-ignore}

`tracks` (array) - search results for tracks on Spotify.

### Examples :id=gettracksbytag-examples {docsify-ignore}

1. Get tracks by tag.

```js
let tracks = Lastfm.getTracksByTag('vocal', 40);
```

2. Get tracks by multiple tags.

```js
let tracks = ['rock', 'indie', 'pixie'].reduce((tracks, tag) => 
  Combiner.push(tracks, Lastfm.getTracksByTag(tag, 100)), []);
```

## rangeTags

Filter tracks by tags.

### Arguments :id=rangetags-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `spotifyTracks` | Array | Spotify tracks to check. |
| `params` | Object | Selection parameters. |

### Selection Parameters :id=rangetags-params {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `include` | Array | Tag objects. If a track has at least one, it is kept. |
| `exclude` | Array | Tag objects. If a track has at least one, it is removed. |
| `isRemoveUnknown` | Boolean | If `true`, tracks without tags are removed. If `false`, they are kept. Default is `false`. |

### Return :id=rangetags-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=rangetags-examples {docsify-ignore}

1. Keep only rock tracks from recent favorites, excluding indie. Since tags are set by users, they have a popularity indicator (up to 100). `minCount` is the minimum value of the indicator inclusive. If less, the track is removed despite the tag.

```js
let tracks = Source.getSavedTracks(20);
Lastfm.rangeTags(tracks, {
  isRemoveUnknown: true,
  include: [
  { name: 'rock', minCount: 10 },
  ],
  exclude: [
  { name: 'indie', minCount: 10 },
  ]
});
```

2. Add tags to tracks, remove unknown ones.

```js
let tracks = Source.getSavedTracks(20);
Lastfm.rangeTags(tracks, {
  isRemoveUnknown: true,
});
```

## removeRecentArtists

Remove artists based on Last.fm listening history.

### Arguments :id=removerecentartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `original` | Array | Tracks to remove elements from. |
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `count` | Number | Number of tracks from listening history. Default is 600. |
| `mode` | String | Selection mode for artists. If `every`, checks each one, if `first`, only the first (usually the main one). Default is `every`. |

### Return :id=removerecentartists-return {docsify-ignore}

No return value. Modifies the input array.

## removeRecentTracks

Remove tracks based on Last.fm listening history.

### Arguments :id=removerecenttracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `original` | Array | Tracks to remove elements from. |
| `user` | String | Last.fm user login. Default is the value from the `config file`. |
| `count` | Number | Number of tracks from listening history. Default is 600. |
| `mode` | String | Selection mode for tracks. If `every`, checks each one, if `first`, only the first (usually the main one). Default is `every`. |

### Return :id=removerecenttracks-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=removerecenttracks-examples {docsify-ignore}

1. Create a playlist with favorite tracks that have not been played in the last thousand scrobbles.

```js
let savedTracks = Source.getSavedTracks();
Lastfm.removeRecentTracks(savedTracks, 'login', 1000)
Playlist.saveAsNew({
  name: 'Long time no listen',
  tracks: savedTracks,
});
```
