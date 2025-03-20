# Search

Search methods. Used by other functions. Needed only for individual solutions.

### find*

Returns an array with search results by keyword for types: playlist, track, album, artist.

Arguments
- (array) `keywords` - list of keywords, strings only. Each keyword will have its own array in the results.
- (number) `requestCount` - number of requests per **one** keyword. Each request returns 50 objects if available. Maximum 40 requests. Default is 1.

Example 1 - Find 100 playlists by the keyword `rain`

?> The best way would be the function [mineTracks](/reference/source?id=minetracks). Direct use of the Search module is needed for solutions not implemented by default. For example, when [importing tracks from FM radio](https://github.com/Chimildic/goofy/discussions/35).

```js
let keywords = ['rain'];
let playlists = Search.findPlaylists(keywords, 2);
```

### getNoFound

Returns an array with keywords and search type for which no results were found during the current script execution.

No arguments.

```js
let noFound = Search.getNoFound();
// structure: { type: '', keyword: '', item: {} }
```

### multisearch*

Returns the best match by keyword for track/artist/album.

Arguments
- (array) `items` - items to iterate over
- (function) `parseNameMethod` - callback called for each item. Should return a string that is the keyword for the search.

Example 1 - When the array of items is simple text
```js
let keywords = ['skillet', 'skydive'];
let artists = Search.multisearchArtists(keywords, (i) => i);
```

Example 2 - When the array of items has a complex structure
```js
let tracks = Search.multisearchTracks(items, (item) => {
    return `${item.artist} ${item.title}`.formatName();
});
```