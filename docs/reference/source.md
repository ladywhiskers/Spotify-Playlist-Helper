# Source

Methods for retrieving Spotify elements.

### craftTracks

Returns an array of tracks obtained from [getRecomTracks](/reference/source?id=getrecomtracks) for each set of five source tracks. Duplicate source tracks are ignored, and duplicates in the recommended tracks are removed. The limit of five elements is dictated by the Spotify API for the recommendation function. You can partially influence the formation of the sets of elements by applying one of the `Order` sorts before calling the function.

Arguments

- (array) `tracks` - tracks for which to get recommendations. If `key` is `seed_artists`, an array of artists is allowed.
- (object) `params` - additional parameters.

Parameter description

- (string) `key` - determines the key for recommendations. Allowed: `seed_tracks` and `seed_artists`. Default is `seed_tracks`.
- (object) `query` - optional parameter, all keys from [getRecomTracks](/reference/source?id=getrecomtracks) are available, except the one specified in `key`.

?> In `query`, you can specify two of: `seed_tracks`, `seed_artists`, `seed_genres`. The third is chosen based on `key`. Thus, you can set static track/artist/genre (up to 4 values in total). The remaining free slots will be filled based on `key`.

Example 1 - Get recommendations for all favorite tracks based on their artists

```js
let tracks = Source.getSavedTracks();
let recomTracks = Source.craftTracks(tracks, {
  key: "seed_artists",
  query: {
    limit: 20, // default and maximum 100
    min_energy: 0.4,
    min_popularity: 60,
    // target_popularity: 60,
  },
});
```

Example 2 - Recommendations with a specified static genre and track. The remaining 3 slots are filled with `seed_artists`.

```js
let recomTracks = Source.craftTracks(tracks, {
  key: "seed_artists",
  query: {
    seed_genres: "indie",
    seed_tracks: "6FZDfxM3a3UCqtzo5pxSLZ",
  },
});
```

Example 3 - You can specify only an array of tracks. Then recommendations will be based on the `seed_tracks` key.

```js
let tracks = Source.getSavedTracks();
let recomTracks = Source.craftTracks(tracks);
```

### getAlbumsTracks

Returns an array of tracks from all albums.

Arguments

- (array) `albums` - list of albums
- (number) `limit` - if specified, randomly selects tracks up to the specified number in each album separately.

Example 1 - Get tracks from the top 10 Lastfm albums

```js
let albums = Lastfm.getTopAlbums({ user: "login", limit: 10 });
let tracks = Source.getAlbumsTracks(albums);
```

### getAlbumTracks

Returns an array of tracks from the specified album.

Arguments

- (object) `album` - object of one album
- (number) `limit` - if specified, randomly selects tracks up to the specified number.

Example 1 - Get tracks from the first album in the array

```js
let albums = Source.getArtistsAlbums(artists, {
  groups: "album",
});
let albumTracks = Source.getAlbumTracks(albums[0]);
```

Example 2 - Get tracks from all albums

```js
let albums = Source.getArtistsAlbums(artists, {
  groups: "album",
});
let tracks = [];
albums.forEach((album) => Combiner.push(tracks, Source.getAlbumTracks(album)));
```

### getArtists

Returns an array of artists according to the specified `paramsArtist`.

Arguments

- (object) `paramsArtist` - list of criteria for selecting artists. The object corresponds to the description from [getArtistsTracks](/reference/source?id=getartiststracks) in the artist part.

Example 1 - Get an array of followed artists

```js
let artists = Source.getArtists({
  followed_include: true,
});
```

### getArtistsAlbums

Returns an array with all albums of the specified artists.

Arguments

- (array) `artists` - array of artists
- (object) `paramsAlbum` - list of criteria for selecting albums. The object corresponds to the description from [getArtistsTracks](/reference/source?id=getartiststracks) in the album part.

Example 1 - Get an array of singles from one artist

```js
let artist = Source.getArtists({
  followed_include: false,
  include: [{ id: "abc", name: "Avril" }],
});
let albums = Source.getArtistsAlbums(artist, {
  groups: "single",
  // isFlat: false, // group by artist
});
```

### getArtistsTopTracks

Returns the top tracks of the artist as an array. Up to 10 tracks per artist.

Arguments

- (array) `artists` - array of artists. Only `id` is significant.
- (boolean) `isFlat` - if `false`, the result is grouped by artists. If `true`, all tracks are in one array. Default is `true`.

Example 1 - `isFlat = true`

```js
let tracks = Source.getArtistsTopTracks(artists);
tracks[0]; // first track of the first artist
tracks[10]; // first track of the second artist, if the first artist has 10 tracks
```

Example 2 - `isFlat = false`

```js
let tracks = Source.getArtistsTopTracks(artists, false);
tracks[0][0]; // first track of the first artist
tracks[1][0]; // first track of the second artist
```

### getArtistsTracks

Returns an array of tracks of artists according to the specified `params`.

!> The selection includes many albums. Especially with a large number of followed artists (100+). To reduce execution time, use filters for the artist and album. You can specify a random selection of N elements.

?> The Spotify API has a bug. Despite explicitly specifying the country from the token, some albums may be duplicated (for different countries). Use deduplication for tracks.

Arguments

- (object) `params` - list of criteria for selecting artists and their tracks

| Key              | Type    | Description                                                                                                           |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------- |
| isFlat           | boolean | If `false`, the result is grouped by artists. Default is `true`.                                                      |
| followed_include | boolean | If `true`, includes followed artists. If `false`, artists are taken only from `include`                               |
| include          | array   | Selection of artists by `id` to get albums. The `name` key is for convenience and optional.                           |
| exclude          | array   | Selection of artists by `id` to exclude artists from the selection. Use in combination with `followed_include`        |
| popularity       | object  | Range of artist popularity                                                                                            |
| followers        | object  | Range of the number of followers of the artist                                                                        |
| genres           | array   | List of genres. If at least one is present, the artist passes the filter.                                             |
| ban_genres       | array   | List of genres for blocking. If at least one is present, the artist is removed from the selection.                    |
| groups           | string  | Album type. Allowed: `album`, `single`, `appears_on`, `compilation`                                                   |
| release_date     | object  | Album release date. Relative period with `sinceDays` and `beforeDays`. Absolute period with `startDate` and `endDate` |
| \_limit          | number  | If specified, a random number of specified elements (artist, album, track) is selected                                |

Example `params` object with all keys

```js
{
    isFlat: true,
    artist: {
        followed_include: true,
        popularity: { min: 0, max: 100 },
        followers: { min: 0, max: 100000 },
        artist_limit: 10,
        genres: ['indie'],
        ban_genres: ['rap', 'pop'],
        include: [
            { id: '', name: '' },
            { id: '', name: '' },
        ],
        exclude:  [
            { id: '', name: '' },
            { id: '', name: '' },
        ],
    },
    album: {
        groups: 'album,single',
        release_date: { sinceDays: 6, beforeDays: 0 },
        // release_date: { startDate: new Date('2020.11.30'), endDate: new Date('2020.12.30') },
        album_limit: 10,
        track_limit: 1,
    }
}
```

Example 1 - Get tracks from singles of followed artists released in the last week including today. Exclude several artists.

```js
let tracks = Source.getArtistsTracks({
  artist: {
    followed_include: true,
    exclude: [
      { id: "abc1", name: "" },
      { id: "abc2", name: "" },
    ],
  },
  album: {
    groups: "single",
    release_date: { sinceDays: 7, beforeDays: 0 },
  },
});
```

Example 2 - Get tracks from albums and singles released in the last week by ten randomly selected followed artists. Artists with no more than 10,000 followers. Only one track from each album.

```js
let tracks = Source.getArtistsTracks({
  artist: {
    followed_include: true,
    artist_limit: 10,
    followers: { min: 0, max: 10000 },
  },
  album: {
    groups: "album,single",
    track_limit: 1,
    release_date: { sinceDays: 7, beforeDays: 0 },
  },
});
```

Example 3 - Get tracks from albums and singles of specified artists

```js
let tracks = Source.getArtistsTracks({
  artist: {
    followed_include: false,
    include: [
      { id: "abc1", name: "" },
      { id: "abc2", name: "" },
    ],
  },
  album: {
    groups: "album,single",
  },
});
```

### getCategoryTracks

Returns an array of tracks from playlists of the specified category. Playlists are sorted by popularity. [List of categories](/reference/desc?id=Категории-плейлистов).

Arguments

- (string) `category_id` - category name.
- (object) `params` - additional parameters.

Description of `params`

- (number) `limit` - limit the number of selected playlists. Maximum 50, default is 20.
- (number) `offset` - skip the specified number of tracks. Default is 0.
- (string) `country` - country name to look for category playlists. For example, `RU` or `AU`.

Example 1 - Get tracks from the second ten playlists of the "focus" category from Australia.

```js
let tracks = Source.getCategoryTracks("focus", {
  limit: 10,
  offset: 10,
  country: "AU",
});
```

Example 2 - Get tracks from 20 playlists in the party category.

```js
let tracks = Source.getCategoryTracks("party");
```

### getFollowedTracks

Returns an array of tracks from followed playlists and/or personal playlists of the specified user.

?> If you need to perform different actions on the source, create a copy of the array [sliceCopy](/reference/selector?id=slicecopy) instead of new requests to Spotify via getFollowedTracks.

Arguments

- (object) `params` - playlist selection arguments.

Description of keys

- (string) `type` - type of selected playlists. Default is `followed`.
- (string) `userId` - [user identifier](#идентификатор). If not specified, the `userId` of the authorized user is set, i.e., yours.
- (number) `limit` - if used, playlists are selected randomly.
- (array) `exclude` - list of playlists to exclude. Only `id` is significant. The `name` value is optional, only needed for understanding which playlist it is. A comment can be used instead.
- (boolean) `isFlat` - if `false`, the result is grouped by artists. If `true`, all tracks are in one array (each contains the `origin` key with playlist data). Default is `true`.

| type     | Selection               |
| -------- | ----------------------- |
| owned    | Only personal playlists |
| followed | Only followed playlists |
| all      | All playlists           |

Full `params` object

```js
{
    type: 'followed',
    userId: 'abc',
    limit: 2,
    exclude: [
        { name: 'playlist 1', id: 'abc1' },
        { id: 'abc2' }, // playlist 2
    ],
}
```

Example 1 - Get tracks only from my followed playlists.

```js
// All default values, no arguments specified
let tracks = Source.getFollowedTracks();

// The same with explicit playlist type
let tracks = Source.getFollowedTracks({
  type: "followed",
});
```

Example 2 - Get tracks from only two randomly selected personal playlists of the user `example`, excluding several playlists by their id.

```js
let tracks = Source.getFollowedTracks({
  type: "owned",
  userId: "example",
  limit: 2,
  exclude: [
    { id: "abc1" }, // playlist 1
    { id: "abc2" }, // playlist 2
  ],
});
```

!> Avoid users with too many playlists. For example, `glennpmcdonald` with almost 5 thousand playlists. The limitation is due to the quota on execution time in Apps Script. It will not be possible to get such a volume of tracks in the allotted time. More details in [description of limitations](/details?id=Ограничения).

### getListCategory

Returns an array of valid categories for [getCategoryTracks](/reference/source?id=getcategorytracks).

Arguments

- (object) `params` - category selection parameters.

Description of `params`

- (number) `limit` - limit the number of selected categories. Maximum 50, default is 20.
- (number) `offset` - skip the specified number of categories. Default is 0. Used to get categories after 50+.
- (string) `country` - country name to look for categories. For example, `RU` or `AU`. If not specified, globally available. But an availability error is possible. To avoid errors, specify the same `country` for the category list and playlist request.

Example 1 - Get tracks from 10 playlists in a random category

```js
let listCategory = Source.getListCategory({ limit: 50, country: "RU" });
let category = Selector.sliceRandom(listCategory, 1);
let tracks = Source.getCategoryTracks(category[0].id, {
  limit: 10,
  country: "RU",
});
```

### getPlaylistTracks

Returns an array of tracks from one playlist. Similar to [getTracks](/reference/source?id=gettracks) with one playlist.

Arguments

- (string) `name` - playlist name.
- (string) `id` - [playlist identifier](/reference/desc?id=Плейлист).
- (string) `user` - [user identifier](/reference/desc?id=Пользователь). Default is yours.
- (number) `count` - number of selected tracks.
- (boolean) `inRow` - selection mode. If no key or `true`, select the first `count` elements, otherwise random selection.

Example 1 - Get tracks from one playlist

```js
let tracks = Source.getPlaylistTracks("Blocked tracks", "abcdef");
```

Example 2 - Random selection of 10 tracks

```js
// playlist name and user can be left empty if the playlist id is known
let tracks = Source.getPlaylistTracks("", "id", "", 10, false);
```

### getRecomArtists

Returns an array of recommended artists based on the given parameters. The function is intended to replace [getRelatedArtists](/reference/source?id=getrelatedartists) due to errors caused by Spotify's updated policy. Internally, [getRecomTracks](/reference/source?id=getrecomtracks) is used based on the artist seed (artists are extracted from the recommended tracks).

Arguments

- (array) `artists` - list of artists to get similar ones. Only `id` is significant.
- (object) `queryObj` - parameters for selecting recommendations. Correspond to [getRecomTracks](/reference/source?id=getrecomtracks).
- (boolean) `isFlat` - if `false`, the result is grouped by artists. If `true`, all artists are in one array. Default is `true`.

Example 1 - Replacement for `getRelatedArtists`

```js
let followedArtists = Source.getArtists({ followed_include: true });
Selector.keepFirst(followedArtists, 5);

// Was: let recomArtists = Source.getRelatedArtists(followedArtists)
let recomArtists = Source.getRecomArtists(followedArtists);
```

Example 2 - Recommendations with mixed seed

```js
let followedArtists = Source.getArtists({ followed_include: true });
Selector.keepFirst(followedArtists, 5);

let recomArtists = Source.getRecomArtists(followedArtists, {
  isFullArtist: false, // artist from the track has reduced data, if you need popularity, genre, number of followers specify true
  limit: 10, // default is 50, maximum 100
  seed_tracks: "3nzL5CIQiCEt6jRt1AlQ9d", // you can embed an additional track seed so that Spotify gives a recommendation close to both the track and the artist
  min_valence: 0.65, // track features are also supported, but have less significance, since the result is an artist, not a specific track
});
```

### getRecomTracks

Returns an array of recommended tracks based on the given parameters (up to 100 tracks). For new or little-known artists/tracks, there may not be enough accumulated data to generate recommendations.

Arguments

- (object) `queryObj` - parameters for selecting recommendations.

Allowed parameters

- limit - number of tracks. Maximum 100.
- seed\_\* - up to **5 values** in any combination:
  - seed_artists - [artist identifiers](/reference/desc?id=Идентификатор), separated by commas.
  - seed_tracks - [track identifiers](/reference/desc?id=Идентификатор), separated by commas.
  - seed_genres - genres, separated by commas. Allowed values can be found [here](/reference/desc?id=Жанры-для-отбора-рекомендаций).
- max\_\* - maximum value of one of the [track features](/reference/desc?id=Особенности-трека-features).
- min\_\* - minimum value of one of the [track features](/reference/desc?id=Особенности-трека-features).
- target\_\* - target value of one of the [track features](/reference/desc?id=Особенности-трека-features). The closest values are selected.

?> Additionally, the `popularity` key is available in `features`. For example, `target_popularity`. This is hidden in the Spotify API documentation.

!> When specifying a specific genre in `seed_genres`, tracks of that genre may not necessarily come. Such a seed is a starting point for recommendations.

Example object with parameters

```js
let queryObj = {
    seed_artists: '',
    seed_genres: '',
    seed_tracks: '',
    max_*: 0,
    min_*: 0,
    target_*: 0,
};
```

Example 1 - Get recommendations for indie and alternative genres with a positive mood:

```js
let tracks = Source.getRecomTracks({
  seed_genres: "indie,alternative",
  min_valence: 0.65,
});
```

Example 2 - Get recommendations in the rock and electronic genres based on 3 random favorite artists (up to 5 values).

```js
let savedTracks = Source.getSavedTracks();
Selector.keepRandom(savedTracks, 3);

let artistIds = savedTracks.map((track) => track.artists[0].id);

let tracks = Source.getRecomTracks({
  seed_artists: artistIds.join(","),
  seed_genres: "rock,electronic",
});
```

Example 3 - Substitution of artist genres. In all `craftTracks` requests, randomly selected genres will be used once. On the next run, different ones will be used.

```js
let artists = Source.getArtists({ followed_include: false });
let genres = Array.from(
  new Set(
    artists.reduce((genres, artist) => {
      return Combiner.push(genres, artist.genres);
    }, [])
  )
);
let recomTracks = Source.craftTracks(artists, {
  key: "seed_artists",
  query: {
    seed_genres: Selector.sliceRandom(genres, 3).join(","),
    min_popularity: 20,
  },
});
```

### getRelatedArtists

Returns an array of similar artists according to Spotify data.

Arguments

- (array) `artists` - list of artists to get similar ones. Only `id` is significant.
- (boolean) `isFlat` - if `false`, the result is grouped by artists. If `true`, all artists are in one array. Default is `true`.

Example 1 - `isFlat = true`

```js
let relatedArtists = Source.getRelatedArtists(artists);
relatedArtists[0]; // first artist
relatedArtists[10]; // 11th artist
```

Example 2 - `isFlat = false`

```js
let relatedArtists = Source.getRelatedArtists(artists, false);
relatedArtists[0][0]; // first artist, similar to the first from the source
relatedArtists[1][0]; // first artist, similar to the second from the source
```

### getRecentReleasesByArtists

Returns recent releases within the specified artists and period.

Arguments

- (object) `params` - selection parameters
  - (array) `artists` - artists of the sought albums. Only `id` is significant for each element.
  - (object) `date` - relative or absolute time period (`sinceDays` and `beforeDays` or `startDate` and `endDate`).
  - (array) `type` - allowed album type (`single`, `album`).
  - (boolean) `isFlat` - if `false`, the result is grouped by artists. If `true`, all tracks are in one array. Default is `true`.

Example 1 - Releases of followed artists in the last week

```js
let weekReleases = Source.getRecentReleasesByArtists({
  artists: Source.getArtists({ followed_include: true }),
  date: { sinceDays: 7, beforeDays: 0 },
  type: ["album", "single"],
});
// When albums and singles are selected, duplicate tracks may appear, especially with a large date range
Filter.dedupTracks(weekReleases);
```

### getSavedAlbums

Returns an array of saved albums, each containing up to 50 tracks. Albums are sorted from recent to old by save date.

No arguments.

Example 1 - Get tracks from the last saved album

```js
let albums = Source.getSavedAlbums();
let tracks = albums[0].tracks.items;
```

### getSavedAlbumTracks

Returns an array of tracks from all saved albums. Albums can be selected randomly.

Arguments:

- (number) `limit` - if used, albums are selected randomly up to the specified value.

Example 1 - Get tracks from three random albums

```js
let tracks = Source.getSavedAlbumTracks(3);
```

Example 2 - Get tracks from all saved albums

```js
let tracks = Source.getSavedAlbumTracks();
```

### getSavedTracks

Returns an array of favorite tracks (likes). Sorted from new to old. If likes were added by automatic means, the date is the same. Therefore, the final sorting of the array and the Spotify interface may differ.

?> To reduce the number of requests, use `Cache.read('SavedTracks.json')`. The cache is updated daily.

Argument

- (number) `limit` - if specified, limits the number of tracks and requests to get them. When not specified, all are returned.

?> If you have many favorite tracks and need to perform different actions on them in the script, create a copy of the array [sliceCopy](/reference/selector?id=slicecopy) instead of new requests to Spotify.

Example 1 - Get an array of favorite tracks.

```js
let tracks = Source.getSavedTracks();
```

Example 2 - Get the last 5 likes.

```js
let tracks = Source.getSavedTracks(5);
```

### getTopArtists

Returns the top artists for the selected period. Up to 98 artists.

Arguments

- (string) `timeRange` - period. Default is `medium`. Possible values are listed in [getTopTracks](/reference/source?id=gettoptracks).

Example 1 - Get top tracks from the top 10 artists

```js
let artists = Source.getTopArtists("long");
Selector.keepFirst(artists, 10);
let tracks = Source.getArtistsTopTracks(artists);
```

### getTopTracks

Returns an array of tracks with the top listens for the selected period. Up to 98 tracks.
Arguments

- (string) `timeRange` - period. Default is `medium`.

| timeRange | Period                          |
| --------- | ------------------------------- |
| short     | Approximately the last month    |
| medium    | Approximately the last 6 months |
| long      | Several years                   |

!> These tracks do not contain information about the date added. When using [rangeDateRel](/reference/filter?id=rangedaterel) or [rangeDateAbs](/reference/filter?id=rangedateabs), they are assigned the date 01.01.2000.

Example 1 - Get the top tracks for the last month.

```js
let tracks = Source.getTopTracks("short");
```

Example 2 - Get the top tracks for several years.

```js
let tracks = Source.getTopTracks("long");
```

### getTracks

Returns an array of tracks from one or more playlists.

Arguments

- (array) `playlistArray` - one or more playlists.

Format of _one_ playlist

- `id` - [playlist identifier](/reference/desc?id=Плейлист).
- `userId` - [user identifier](/reference/desc?id=Пользователь).
- `name` - playlist name.
- `count` - number of selected tracks.
- `inRow` - selection mode. If no key or `true`, select the first `count` elements, otherwise random selection.

| id  | name | userId | Action                                        |
| :-: | :--: | :----: | :-------------------------------------------- |
|  ✓  |  ☓   |   ☓    | Take the playlist with the specified id       |
|  ☓  |  ✓   |   ☓    | Search for the playlist by name among yours   |
|  ☓  |  ✓   |   ✓    | Search for the playlist by name from the user |

?> It is recommended to always specify `id` and `name`. The fastest and most convenient way.

!> If `name` is specified without `id` and there are several playlists with that name, tracks from the first one found will be returned. When the playlist is not found, an empty array will be returned.

Example 1 - Get tracks from two playlists by `id`. The `name` value is optional. It is specified for convenience.

```js
let tracks = Source.getTracks([
  { name: "Top Hits", id: "37i9dQZF1DX12G1GAEuIuj" },
  { name: "Cardio", id: "37i9dQZF1DWSJHnPb1f0X3" },
]);
```

Example 2 - Get tracks from personal playlists The Best and Soundtracks.

```js
let tracks = Source.getTracks([{ name: "The Best" }, { name: "Soundtracks" }]);
```

Example 3 - Get tracks from the playlist named mint from the user spotify.

```js
let tracks = Source.getTracks([{ name: "mint", userId: "spotify" }]);
```

### getTracksRandom

Returns an array of tracks from one or more playlists. Playlists are selected randomly.

Arguments

- (array) `playlistArray` - one or more playlists. Similar to [getTracks](/reference/source?id=gettracks).
- (number) `countPlaylist` - number of randomly selected playlists. Default is one.

Example 1 - Get tracks from one randomly selected playlist out of three.

```js
let tracks = Source.getTracksRandom([
  { name: "Top Hits", id: "37i9dQZF1DX12G1GAEuIuj" },
  { name: "Cardio", id: "37i9dQZF1DWSJHnPb1f0X3" },
  { name: "Dark Side", id: "37i9dQZF1DX73pG7P0YcKJ" },
]);
```

Example 2 - Get tracks from two randomly selected playlists out of three.

```js
let playlistArray = [
  { name: "Top Hits", id: "37i9dQZF1DX12G1GAEuIuj" },
  { name: "Cardio", id: "37i9dQZF1DWSJHnPb1f0X3" },
  { name: "Dark Side", id: "37i9dQZF1DX73pG7P0YcKJ" },
];
let tracks = Source.getTracksRandom(playlistArray, 2);
```

### mineTracks

Returns an array of tracks found by searching for playlists, albums, or tracks by keywords. Duplicates are removed from the result.

Arguments

- (object) `params` - search parameters.

Description of `params`

- (string) `type` - type of search. Allowed: `playlist`, `album`, `track`. Default is `playlist`. For `track`, you can use [advanced search](https://support.spotify.com/by-ru/article/search/).
- (array) `keyword` - list of keywords for searching elements.
- (number) `requestCount` - number of requests per keyword. Each request returns up to 50 elements, if available. Maximum 40 requests. Default is one.
- (number) `itemCount` - number of selected elements from all found for one keyword. Default is three.
- (number) `skipCount` - number of elements skipped from the beginning for one keyword. Default is zero.
- (boolean) `inRow` - if not specified or `false`, elements are selected randomly. If `true`, the first `N` elements (by `itemCount` value) are taken.
- (number) `popularity` - minimum track popularity value. Default is zero.
- (object) `followers` - range of the number of playlist followers (inclusive boundaries). Filter before selecting `itemCount`. Use only with a small `requestCount` when `type = playlist`.

!> It is necessary to balance the values in `params`. Several large values can take a lot of execution time and make many requests. Find acceptable combinations in practice.

> You can output the number of requests made. Add the line at the end of the function:
> `console.log('Number of requests', CustomUrlFetchApp.getCountRequest());`

Example 1 - Select 5 random playlists for each keyword with track popularity from 70. With a limited number of playlist followers.

```js
let tracks = Source.mineTracks({
  keyword: ["synth", "synthpop", "rock"],
  followers: { min: 2, max: 1000 },
  itemCount: 5,
  requestCount: 3,
  popularity: 70,
});
```

Example 2 - Select the first 10 playlists by keyword with any track popularity

```js
let tracks = Source.mineTracks({
  keyword: ["indie"],
  itemCount: 10,
  inRow: true,
});
```

Example 3 - Select tracks from random albums

```js
let tracks = Source.mineTracks({
  type: "album",
  keyword: ["winter", "night"],
});
```

Example 4 - Select tracks in the indie genre for 2020

```js
let tracks = Source.mineTracks({
  type: "track",
  keyword: ["genre:indie + year:2020"],
});
```
