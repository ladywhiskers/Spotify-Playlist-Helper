# Playlist

Methods for creating and managing playlists.

### getDescription

Returns a string like: `Artist 1, Artist 2... and more`.

Arguments
- (array) `tracks` - tracks from which artists are randomly selected.
- (number) `limit` - number of randomly selected artists. Default is 5.

Example 1 - Create a playlist with a description
```js
let tracks = Source.getTracks(playlistArray);
Playlist.saveWithReplace({
    id: 'abcd',
    name: 'Big Mix of the Day',
    tracks: tracks,
    description: Playlist.getDescription(tracks),
});
```

### removeTracks

Removes tracks from a playlist.

Arguments
- (string) `id` - playlist id.
- (array) `tracks` - array of tracks.

Example 1 - Remove likes from a playlist
```js
let savedTracks = Source.getSavedTracks();
Playlist.removeTracks('id', savedTracks);
```

### saveAsNew

Creates a playlist. Each time a new one. Returns the `id` of the created playlist.

Arguments
- (object) `data` - data for creating a playlist.

Data format for creating a playlist
- (string) `name` - playlist name, required.
- (array) `tracks` - array of tracks, required.
- (string) `description` - playlist description. Up to 300 characters.
- (boolean) `public` - if `false` the playlist will be private. Default is `true`.
- (string) `sourceCover` - direct link to the cover (up to 256 kb). If specified, `randomCover` is ignored.
- (string) `randomCover` - add a random cover with the value `once`. Without use, the standard mosaic from Spotify.

Example 1 - Create a public playlist with favorite tracks without description with a random cover
```js
let tracks = Source.getSavedTracks();
Playlist.saveAsNew({
  name: 'Copy of Favorite Tracks',
  tracks: tracks,
  randomCover: 'once',
  // sourceCover: tracks[0].album.images[0].url,
});
```

Example 2 - Create a private playlist with recent listening history and description without a cover.
```js
let tracks = RecentTracks.get(200);
Playlist.saveAsNew({
  name: 'Listening History',
  description: '200 recently listened tracks',
  public: false,
  tracks: tracks,
});
```

### saveWithAppend

Adds tracks to an existing playlist. Updates other data (name, description). If the playlist does not exist, creates a new one. Returns the `id` of the playlist to which the tracks were added.

Arguments
- (object) `data` - playlist data. Playlist data format according to the description [saveWithReplace](/reference/playlist?id=savewithreplace).
- (string) `position` - place to add tracks: beginning `begin` or end `end`. Default is `end`.

Example 1 - Add tracks to the beginning of the playlist.
```js
let tracks = Source.getTracks(playlistArray);
Playlist.saveWithAppend({
    id: 'fewf4t34tfwf4',
    name: 'Mix of the Day',
    tracks: tracks
});
```

Example 2 - Add tracks to the end of the playlist, update the name and description.
```js
let tracks = Source.getTracks(playlistArray);
Playlist.saveWithAppend({
    id: 'fewf4t34tfwf4',
    name: 'New Name',
    description: 'New Description',
    tracks: tracks,
});
```

!> If you update the playlist name without specifying `id`, a new playlist will be created. Because the search did not find a playlist with the new name.

### saveWithReplace

Replaces the tracks of the playlist. Updates other data (name, description). If the playlist does not exist, creates a new one. Returns the `id` of the playlist to which the tracks were added.

Arguments
- (object) `data` - playlist data.

Playlist data format
- (string) `id` - [playlist identifier](#identifier).
- (string) `name` - playlist name, required.
- (array) `tracks` - array of tracks, required.
- (string) `description` - playlist description. Up to 300 characters.
- (boolean) `public` - if `false` the playlist will be private. Default is `true`.
- (string) `sourceCover` - direct link to the cover (up to 256 kb). If specified, `randomCover` is ignored.
- (string) `randomCover` - if `once` adds a random cover. With `update` updates the cover each time. Without use, the standard mosaic from Spotify.

?> It is recommended to always specify `id`. If `id` is not specified, search by name. If such a playlist does not exist, a new one is created.

Example 1 - Update the playlist content and cover
```js
let tracks = Source.getTracks(playlistArray);
Playlist.saveWithReplace({
    id: 'fewf4t34tfwf4',
    name: 'Mix of the Day',
    description: 'Playlist Description',
    tracks: tracks,
    randomCover: 'update',
    // sourceCover: tracks[0].album.images[0].url,
});
```

Example 2 - Update the content of the playlist from example 1. Search by name.
```js
let tracks = RecentTracks.get();
Playlist.saveWithReplace({
    name: 'History',
    description: 'New Playlist Description',
    tracks: tracks,
    randomCover: 'update',
});
```

### saveWithUpdate

Updates the playlist or creates a new one. Tracks that are in the array but not in the playlist are added. Tracks that are not in the array but are in the playlist are removed. What is in both is saved. The date of adding tracks is not affected. It is impossible to apply sorting where old and new tracks are mixed (acts like `saveWithAppend`). Returns the `id` of the playlist to which the tracks were added.

Arguments
- (object) `data` - playlist data, corresponds to [saveWithReplace](/reference/playlist?id=savewithreplace).

Additional mode for `data`
- (string) `position` - place to add tracks: beginning `begin` or end `end`. Default is `end`.
