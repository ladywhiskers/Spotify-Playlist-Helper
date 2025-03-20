# Filter

Methods for filtering elements.

| Method | Result type | Brief description |
|-------|----------------|------------------|
| [dedupArtists](/reference/filter?id=dedupartists) | - | Remove duplicate artists. |
| [dedupTracks](/reference/filter?id=deduptracks) | - | Remove duplicate tracks. |
| [getDateRel](/reference/filter?id=getdaterel) | Date | Calculate the date by the offset in days relative to today. |
| [detectLanguage](/reference/filter?id=detectlanguage) | - | Determine the primary language of the tracks by the text. |
| [getLastOutRange](/reference/filter?id=getlastoutrange) | Array | Find tracks that failed the last filter [rangeTracks](/reference/filter?id=rangetracks) |
| [match](/reference/filter?id=match) | - | Remove tracks that do not match the regular expression. |
| [matchExcept](/reference/filter?id=matchexcept) | - | Wrapper for [match](/reference/filter?id=match) with inversion. |
| [matchExceptMix](/reference/filter?id=matchexceptmix) | - | Remove tracks containing the words _mix_ and _club_. |
| [matchExceptRu](/reference/filter?id=matchexceptru) | - | Remove tracks containing Cyrillic in the title. |
| [matchLatinOnly](/reference/filter?id=matchlatinonly) | - | Remove all tracks except those containing Latin in the title. |
| [matchOriginalOnly](/reference/filter?id=matchoriginalonly) | - | Remove non-original versions of tracks. |
| [rangeDateAbs](/reference/filter?id=rangedateabs) | - | Filter items that fall within the period by absolute dates of addition or listening. |
| [rangeDateRel](/reference/filter?id=rangedaterel) | - | Filter items that fall within the period by relative dates of addition or listening. |
| [rangeTracks](/reference/filter?id=rangetracks) | - | Filter tracks that fall within the metadata range. |
| [removeArtists](/reference/filter?id=removeartists) | - | Exclude artists from the array. |
| [removeTracks](/reference/filter?id=removetracks) | - | Exclude tracks from the array. |
| [removeUnavailable](/reference/filter?id=removeunavailable) | - | Exclude tracks that cannot be listened to. |
| [replaceWithSimilar](/reference/filter?id=replacewithsimilar) | - | Replace tracks with similar ones. |

## dedupArtists
Remove duplicate artists by _id_. Only one element per artist will remain.

### Arguments :id=dedupartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | Array | Tracks or artists from which duplicate artists need to be removed. |

### Return :id=dedupartists-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=dedupartists-examples {docsify-ignore}

1. Remove duplicate artists in tracks.

```js
let tracks = Source.getTracks(playlistArray);
Filter.dedupArtists(tracks);
```

2. Remove duplicate artists from an array of artists.

```js
let relatedArtists = Source.getRelatedArtists(artists);
Filter.dedupArtists(relatedArtists);
```

## dedupTracks

Remove duplicate tracks by _id_ and _name_.

### Arguments :id=deduptracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks from which duplicates need to be removed. |
| `offsetDurationMs` | Number | Deviation in milliseconds within which tracks with the same name are considered identical. Default is 2000 milliseconds (2 seconds). [More details](https://github.com/Chimildic/goofy/discussions/116). |

### Return :id=deduptracks-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=deduptracks-examples {docsify-ignore}

1. Remove duplicates. Specifying the deviation is optional.

```js
let tracks = Source.getTracks(playlistArray);
Filter.dedupTracks(tracks);
```

## getDateRel

Calculate the date by the offset in days relative to today.

### Arguments :id=getdaterel-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `days` | Number | Offset in days relative to today. |
| `bound` | String | Time boundary. `startDay` for 00:00, `endDay` for 23:59. If not specified, the value will be from the moment of method execution. |

### Return :id=getdaterel-return {docsify-ignore}

`date` (Date) - the calculated date after the offset.

### Examples :id=getdaterel-examples {docsify-ignore}

Example in the [favorite and forgotten](/template?id=Любимо-и-забыто) template.

## detectLanguage

Determine the primary language of the tracks by the text.

!> The `MUSIXMATCH_API_KEY` parameter is required, [more details](/config). The service limits the number of requests per day. Use the function only after reducing the array of tracks with other filters.

### Arguments :id=detectlanguage-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks for which the primary language needs to be determined. |
| `params` | Object | Filtering parameters. |

#### Filtering Parameters :id=detectlanguage-params {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `isRemoveUnknown` | Boolean | Action for unknown languages (when not in the `musixmatch` database or it is dance music). `true` removes such tracks, `false` keeps them. Default is `false`. |
| `include` | Array | Languages to keep. |
| `exclude` | Array | Languages to remove. |

?> Two-letter language codes in lowercase are accepted. [List of languages](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

### Return :id=detectlanguage-return {docsify-ignore}

No return value. Modifies the input array when filtering parameters are specified.

Tracks are augmented with a `lyrics` object containing the language code `lang` and a short text excerpt `text`.
### Examples :id=detectlanguage-examples {docsify-ignore}

1. Take the [Germany Top 50](https://open.spotify.com/playlist/37i9dQZEVXbJiZcmkrIHGU?si=33fdf90a2b854fc8) and keep only German tracks.

```js
let tracks = Source.getPlaylistTracks('', '37i9dQZEVXbJiZcmkrIHGU');
Filter.detectLanguage(tracks, {
  isRemoveUnknown: true,
  include: ['de'],
});
```

2. Similar situation, exclude Russian tracks.

```js
let tracks = Source.getPlaylistTracks('', '37i9dQZEVXbL8l7ra5vVdB');
Filter.detectLanguage(tracks, {
  isRemoveUnknown: true,
  exclude: ['ru'],
});
```

3. Find out which languages are in the array.

```js
let tracks = Source.getPlaylistTracks('', '37i9dQZEVXbL8l7ra5vVdB');
Filter.detectLanguage(tracks, { isRemoveUnknown: true });
console.log(Array.from(new Set(tracks.map(t => t.lyrics.lang))).join('\n'));
```

?> For a set of tracks in different languages, the [mineTracks](/reference/source?id=minetracks) function is suitable.
## matchLatinOnly

Remove all tracks except those containing Latin characters in the title. Wrapper for [match](/reference/filter?id=match) with the argument `strRegex = '^[a-zA-Z0-9 ]+$'`.

?> For filtering by track language, use [detectLanguage](/reference/filter?id=detectlanguage).

### Arguments :id=matchlatinonly-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to be checked with the regular expression. |

### Return :id=matchlatinonly-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=matchlatinonly-examples {docsify-ignore}

1. Keep only tracks with Latin characters in the title.

```js
let tracks = Source.getTracks(playlistArray);
Filter.matchLatinOnly(tracks);
```

## matchOriginalOnly

Remove non-original versions of tracks. Wrapper for [matchExcept](/reference/filter?id=matchexcept) with the argument `strRegex = 'mix|club|radio|piano|acoustic|edit|live|version|cover|karaoke'`.

### Arguments :id=matchoriginalonly-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to be checked with the regular expression. |

### Return :id=matchoriginalonly-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=matchoriginalonly-examples {docsify-ignore}

1. Keep only original versions of tracks.

```js
let tracks = Source.getTracks(playlistArray);
Filter.matchOriginalOnly(tracks);
```

## rangeDateAbs

Filter items that fall within the period by absolute dates of addition or listening.

?> For filtering by album release date, use [rangeTracks](/reference/filter?id=rangetracks).

### Arguments :id=rangedateabs-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | Array | Items to be checked. |
| `startDate` | Date | Start of the absolute period. |
| `endDate` | Date | End of the absolute period. |

Date format `YYYY-MM-DDTHH:mm:ss.sss`, where
- `YYYY-MM-DD` - year, month, day
- `T` - separator for specifying time. Include if adding time.
- `HH:mm:ss.sss` - hours, minutes, seconds, milliseconds

### Return :id=rangedateabs-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=rangedateabs-examples {docsify-ignore}

1. Tracks added between September 1 and September 3.

```js
let tracks = Source.getTracks(playlistArray);
let startDate = new Date('2020-09-01');
let endDate = new Date('2020-09-03');
Filter.rangeDateAbs(tracks, startDate, endDate);
```

2. Tracks added from August 1, 15:00 to August 20, 10:00.

```js
let tracks = Source.getTracks(playlistArray);
let startDate = new Date('2020-08-01T15:00');
let endDate = new Date('2020-08-20T10:00');
Filter.rangeDateAbs(tracks, startDate, endDate);
```

3. Tracks added from September 1 to the current date and time.

```js
let tracks = Source.getTracks(playlistArray);
let startDate = new Date('2020-09-01');
let endDate = new Date();
Filter.rangeDateAbs(tracks, startDate, endDate);
```

## rangeDateRel

Filter items that fall within the period by relative dates. Checks the date of addition or listening.

!> If an item does not contain a date, it is set to 01.01.2000. This can happen, for example, if a track was added to Spotify a long time ago, the source is [getTopTracks](/reference/source?id=gettoptracks), or it is from playlists like "My Daily Mix #N" or other sources.

### Arguments :id=rangedaterel-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `items` | Array | Items to be checked. |
| `sinceDays` | Number | Start of the relative period. |
| `beforeDays` | Number | End of the relative period. |

The diagram shows an example for `sinceDays = 7` and `beforeDays = 2`. This means getting items added to the playlist from September 3rd 00:00 to September 8th 23:59 relative to today, September 10th.

![Example usage of sinceDays and beforeDays](../img/DaysRel.png ':size=60%')

?> The mechanism for obtaining the start date of tracking an artist is described [on the forum](https://github.com/Chimildic/goofy/discussions/98)

### Return :id=rangedaterel-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=rangedaterel-examples {docsify-ignore}

1. Tracks added in the last 5 days and today.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeDateRel(tracks, 5);
// equivalent to Filter.rangeDateRel(tracks, 5, 0);
```

2. Tracks from the last 7 days excluding today.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeDateRel(tracks, 7, 1);
```

3. Tracks from one day, 14 days ago.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeDateRel(tracks, 14, 14);
```

4. Tracks only from today.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeDateRel(tracks);
// equivalent to Filter.rangeDateRel(tracks, 0, 0);
```

## rangeTracks

Filter tracks that fall within the metadata range.

### Arguments :id=rangetracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to be checked. |
| `params` | Object | Filtering parameters. |

!> The function requests additional data. To reduce the number of requests, use it after reducing the array of tracks by other methods (e.g., [rangeDateRel](/reference/filter?id=rangedaterel), [match](/reference/filter?id=match), and others). The obtained data is cached for the **current** execution. Repeated function calls or sorting [sort](/reference/order?id=sort) with the same categories do not send new requests.

#### Filtering Parameters :id=rangetracks-params {docsify-ignore}

Below is an example of a `params` object with all possible conditions.

```js
let params = {
  meta: {
    popularity: { min: 0, max: 100 },
    duration_ms: { min: 0, max: 10000 },
    explicit: false,
  },
  artist: {
    popularity: { min: 0, max: 100 },
    followers: { min: 0, max: 100000 },
    genres: ['indie'],
    ban_genres: ['rap', 'pop'],
    isRemoveUnknownGenre: false,
  },
  features: {
    acousticness: { min: 0.0, max: 1.0 },
    danceability: { min: 0.0, max: 1.0 },
    energy: { min: 0.0, max: 1.0 },
    instrumentalness: { min: 0.0, max: 1.0 },
    liveness: { min: 0.0, max: 1.0 },
    loudness: { min: -60, max: 0 },
    speechiness: { min: 0.0, max: 1.0 },
    valence: { min: 0.0, max: 1.0 },
    tempo: { min: 30, max: 210 },
    key: 0,
    mode: 0,
    time_signature: 1,

    // calculated https://github.com/Chimildic/goofy/discussions/87
    anger: { min: 0.0, max: 1.0 },
    happiness: { min: 0.0, max: 1.0 },
    sadness: { min: 0.0, max: 1.0 }, 
    
    // duplicates args.meta.duration_ms, only one is needed (choice depends on category)
    duration_ms: { min: 0, max: 10000 },
  },
  album: {
    popularity: { min: 30, max: 70 },
    album_type: ['single', 'album'],
    release_date: { sinceDays: 6, beforeDays: 0 },
    // or release_date: { startDate: new Date('2020.11.30'), endDate: new Date('2020.12.30') },
  },
};
```

### Return :id=rangetracks-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=rangetracks-examples {docsify-ignore}

1. Remove rap genre tracks.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeTracks(tracks, {
  artist: {
    ban_genres: ['rap'],
  }
});
```

2. Select tracks in indie and alternative genres.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeTracks(tracks, {
  artist: {
    genres: ['indie', 'alternative'],
  },
});
```

3. Select less popular tracks from less known artists.

```js
let tracks = Source.getTracks(playlistArray);
Filter.rangeTracks(tracks, {
  meta: {
    popularity: { min: 0, max: 49 },
  },
  artist: {
    followers: { min: 0, max: 9999 },
  },
});
```

## removeArtists

Exclude artists from the array. Matching is determined by the track artist's _id_.

### Arguments :id=removeartists-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `original` | Array | Tracks or artists to be checked. |
| `removable` | Array | Tracks or artists to be excluded. |
| `invert` | Boolean | Invert the result. If `true`, remove everything except `removable`. Default is `false`. |
| `mode` | String | Artist selection mode. `every` checks each, `first` checks only the first (usually the main one). Default is `every`. |

### Return :id=removeartists-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=removeartists-examples {docsify-ignore}

1. Get playlist tracks and exclude favorite track artists.

```js
let sourceArray = Source.getTracks(playlistArray);
let removedArray = Source.getSavedTracks();
Filter.removeArtists(sourceArray, removedArray);
```

## removeTracks

Exclude tracks from the array. Matching is determined by the track's _id_ and by the track name along with the artist.

?> There is a chance of encountering a [relink issue](https://github.com/Chimildic/goofy/discussions/99) when deleting listening history.

### Arguments :id=removetracks-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `original` | Array | Tracks to be checked. |
| `removable` | Array | Tracks to be excluded. |
| `invert` | Boolean | Invert the result. If `true`, remove everything except `removable`. Default is `false`. |
| `mode` | String | Artist selection mode. `every` checks each, `first` checks only the first (usually the main one). Default is `every`. |

### Return :id=removetracks-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=removetracks-examples {docsify-ignore}

1. Get playlist tracks and exclude favorite tracks.

```js
let sourceArray = Source.getTracks(playlistArray);
let removedArray = Source.getSavedTracks();
Filter.removeTracks(sourceArray, removedArray);
```

## removeUnavailable

Exclude tracks that cannot be listened to. Does not replace the original with a similar one. That is, there is no redirection to another track, more details in the [relink issue](https://github.com/Chimildic/goofy/discussions/99). Makes additional requests (1 per 50 tracks) if the track is in an undefined state.

?> It is acceptable to apply the filter to tracks from `Cache` that have passed the [compressTracks](/reference/cache?id=compresstracks) method. If the method was not applied, the state is determined by the value in the cached track.

### Arguments :id=removeunavailable-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `tracks` | Array | Tracks to be checked. |
| `market` | String | Country where track availability is checked. Default is the account country. |

### Return :id=removeunavailable-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=removeunavailable-examples {docsify-ignore}

1. Remove tracks unavailable in Russia from the playlist.

```js
let tracks = Source.getPlaylistTracks('', 'id');
Filter.removeUnavailable(tracks, 'RU');
```

## replaceWithSimilar

Replace tracks with similar ones. For one replacement, N random tracks from the results of [getRecomTracks](/reference/source?id=getrecomtracks) are used. Recommendations are requested with `target_*` parameters from the original track. When there is no replacement, the track is removed.

### Arguments :id=replacewithsimilar-arguments {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `params` | Object | Replacement parameters. |

### Replacement Parameters :id=replacewithsimilar-params {docsify-ignore}

| Name | Type | Description |
|-----|-----|----------|
| `origin` | Array | Tracks to be checked. |
| `replace` | Array | Tracks to be replaced. |
| `count` | Number | Number of recommended tracks per original. Default is 1, maximum is 100. The output quantity may be less due to lack of recommendations or filtering. |
| `isRemoveOriginArtists` | Boolean | If `true`, removes artists from recommendations that appear in `origin`. If `false`, keeps them. Default is `false`. |

### Return :id=replacewithsimilar-return {docsify-ignore}

No return value. Modifies the input array.

### Examples :id=replacewithsimilar-examples {docsify-ignore}

1. Replace recently played tracks and playlist likes with close analogs.

```js
let tracks = Source.getPlaylistTracks('', 'id');
Filter.replaceWithSimilar({
  origin: tracks,
  replace: [RecentTracks.get(2000), Source.getSavedTracks()],
  count: 3
});
```

2. Get recommendations for favorite tracks without the participation of original artists.

```js
let tracks = Source.getSavedTracks();
Filter.replaceWithSimilar({
  origin: tracks,
  replace: tracks,
  isRemoveOriginArtists: true,
})
```
