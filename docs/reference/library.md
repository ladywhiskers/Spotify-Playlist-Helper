# Library

Methods for managing likes and subscriptions.

| Method | Result Type | Brief Description |
|--------|-------------|-------------------|
| [checkFavoriteTracks](/reference/library?id=checkfavoritetracks) | - | Check each track for presence in favorites (likes). |
| [deleteAlbums](/reference/library?id=deletealbums) | - | Remove albums from the library (likes on albums). |
| [deleteFavoriteTracks](/reference/library?id=deletefavoritetracks) | - | Remove tracks from favorites (remove likes). |
| [followArtists](/reference/library?id=followartists) | - | Follow artists. |
| [followPlaylists](/reference/library?id=followplaylists) | - | Follow playlists. |
| [saveAlbums](/reference/library?id=savealbums) | - | Save albums to the library. |
| [saveFavoriteTracks](/reference/library?id=savefavoritetracks) | - | Add tracks to favorites (like). |
| [unfollowArtists](/reference/library?id=unfollowartists) | - | Unfollow artists. |
| [unfollowPlaylists](/reference/library?id=unfollowplaylists) | - | Unfollow playlists. |

## checkFavoriteTracks

Check each track for presence in favorites (likes).

### Arguments :id=checkfavoritetracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to check. Only _id_ is significant. |

### Return :id=checkfavoritetracks-return {docsify-ignore}

No return value.

Tracks are augmented with a boolean `isFavorite` indicating the presence or absence of the track in favorites.

### Examples :id=checkfavoritetracks-examples {docsify-ignore}

1. Keep only playlist tracks without likes.

```js
let tracks = Source.getPlaylistTracks('', 'id')
Library.checkFavoriteTracks(tracks);
tracks = tracks.filter(t => !t.isFavorite);
```

## deleteAlbums

Remove albums from the library (likes on albums).

### Arguments :id=deletealbums-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `albums` | Array | Albums to remove. Only _id_ is significant. |

### Return :id=deletealbums-return {docsify-ignore}

No return value.

## deleteFavoriteTracks

Remove tracks from favorites (remove likes).

### Arguments :id=deletefavoritetracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to remove. Only _id_ is significant. |

### Return :id=deletefavoritetracks-return {docsify-ignore}

No return value.

### Examples :id=deletefavoritetracks-examples {docsify-ignore}

1. Clear all likes

```js
let savedTracks = Source.getSavedTracks();
Library.deleteFavoriteTracks(savedTracks);
```

## followArtists

Follow artists.

### Arguments :id=followartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `artists` | Array | Artists to follow. Only _id_ is significant. |

### Return :id=followartists-return {docsify-ignore}

No return value.

## followPlaylists

Follow playlists.

### Arguments :id=followplaylists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `playlists` | Array/String | Playlists (only _id_ is significant) or a string with _id_s separated by commas. |

### Return :id=followplaylists-return {docsify-ignore}

No return value.

## saveAlbums

Save albums to the library.

### Arguments :id=savealbums-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `albums` | Array | Albums to add. Only _id_ is significant. |

### Return :id=savealbums-return {docsify-ignore}

No return value.

## saveFavoriteTracks

Add tracks to favorites (like).

### Arguments :id=savefavoritetracks-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `tracks` | Array | Tracks to add. Only _id_ is significant. |

### Return :id=savefavoritetracks-return {docsify-ignore}

No return value.

## unfollowArtists

Unfollow artists.

### Arguments :id=unfollowartists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `artists` | Array | Artists to unfollow. Only _id_ is significant. |

### Return :id=unfollowartists-return {docsify-ignore}

No return value.

## unfollowPlaylists

Unfollow playlists.

### Arguments :id=unfollowplaylists-arguments {docsify-ignore}

| Name | Type | Description |
|------|------|-------------|
| `playlists` | Array/String | Playlists (only _id_ is significant) or a string with _id_s separated by commas. |

### Return :id=unfollowplaylists-return {docsify-ignore}

No return value.
