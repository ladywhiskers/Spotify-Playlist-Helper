# Templates

Before using the templates, it is recommended to familiarize yourself by creating [your first playlist](/first-playlist). It will significantly simplify working with templates and answer common questions. Additional templates can be found on the [GitHub forum](https://github.com/Chimildic/goofy/discussions).

## Unknown Set
```js
/**
 * Combine tracks from personal mixes into one playlist
 * Remove duplicates, listening history, likes
 */
function updateUnknownSet() {
  let banTracks = [];
  let savedTracks = Source.getSavedTracks();
  let recentTracks = RecentTracks.get(1000);
  Combiner.push(banTracks, savedTracks, recentTracks);

  // Insert the playlist IDs, which can be taken from the link or URI
  // Example: https://ladywhiskers.github.io/Spotify-Playlist-Helper/#/reference/desc?id=Identifier
  let onlyForYouTracks = Source.getTracks([
    { name: 'Daily Mix 1', id: 'yourId' },
    { name: 'Daily Mix 2', id: 'yourId' },
    { name: 'Daily Mix 3', id: 'yourId' },
    { name: 'Daily Mix 4', id: 'yourId' },
    { name: 'Daily Mix 5', id: 'yourId' },
    { name: 'Daily Mix 6', id: 'yourId' },
    { name: 'Release Radar', id: 'yourId' },
    { name: 'Discover Weekly', id: 'yourId' },
  ]);
  
  Filter.dedupTracks(onlyForYouTracks);
  Filter.dedupArtists(onlyForYouTracks);
  Filter.removeTracks(onlyForYouTracks, banTracks);
  Filter.matchOriginalOnly(onlyForYouTracks);
  Filter.matchExceptRu(onlyForYouTracks);

  // Example of removing artists if you maintain a ban playlist
  // let banArtists = Source.getPlaylistTracks('', 'yourId');
  // Filter.removeArtists(onlyForYouTracks, banArtists);
  
  Filter.rangeTracks(onlyForYouTracks, {
    artist: {
      ban_genres: ['rap', 'r&b', 'metal', 'anime', 'soul', 'blues', 'punk'],
    },
  });
  
  // Substitute the ID of the created playlist, after the first run of the code, remove the comment
  Playlist.saveWithReplace({
    // id: 'yourId',
    name: 'Unknown Set',
    tracks: Selector.sliceRandom(onlyForYouTracks, 60),
    description: Playlist.getDescription(onlyForYouTracks),
    randomCover: 'update',
  });
}
```

## New Releases
```js
/**
 * Collect new releases from followed artists
 */
function updateNewReleases() {
  let newReleases = Source.getRecentReleasesByArtists({
    artists: Source.getArtists({ followed_include: true, }),
    date: { sinceDays: 7, beforeDays: 0 }, // for a week, change as needed
    type: ['album', 'single'],
  });
  Playlist.saveWithReplace({
    name: 'New Releases',
    tracks: newReleases,
  })
}
```

## New Releases in Parts
```js
/**
 * When there are too many followed artists, there is a chance to reach the execution time limit or get a pause from Spotify for a day.
 * You can split the artists into chunks. For example, setting a trigger "every hour" with a chunk size of 100 will check 2400 artists per day.
 * The function accumulates releases in the cache. If desired, you can mix them into other playlists.
 */
function chunkDiscoverRecentReleases() {
  const CHUNK_SIZE = 100 // Number of artists checked per run
  const FA_FILENAME = 'ChunkFollowedArtists.json'
  const RR_FILENAME = 'ChunkDiscoverRecentReleases.json'

  let followedArtists = Cache.read(FA_FILENAME)
  if (followedArtists.length == 0) {
    followedArtists = Source.getArtists({ followed_include: true })
    Cache.write(FA_FILENAME, followedArtists)
  }
  if (followedArtists.length > 0) {
    discover()
    saveWithReplace() // optional saving of releases to playlist
  }

  function discover() {
    let discoverableArtists = followedArtists.splice(0, CHUNK_SIZE)
    Cache.write(FA_FILENAME, followedArtists)

    let remoteTracks = Source.getRecentReleasesByArtists({
      artists: discoverableArtists,
      date: { sinceDays: 1, beforeDays: 0 },
      type: ['album', 'single'],
      isFlat: true,
    })

    if (remoteTracks.length > 0) {
      Cache.compressTracks(remoteTracks)
      let combinedTracks = Combiner.push(remoteTracks, Cache.read(RR_FILENAME))
      Filter.dedupTracks(combinedTracks)
      Order.sort(combinedTracks, 'album.release_date', 'desc')
      Cache.write(RR_FILENAME, combinedTracks)
    }
  }

  function saveWithReplace() {
    Playlist.saveWithReplace({
      name: 'New Releases',
      tracks: Cache.read(RR_FILENAME),
      randomCover: 'update',
    })
  }
}
```

## Discoveries from Albums
```js
/**
 * Popular tracks from albums that already have known favorite tracks
 */
function updateDiscoveryAlbums() {
  const LIMIT_TRACKS = 20;
  const LIMIT_ALB_TRACK = 1;

  let recentTracks = RecentTracks.get(3000);
  let savedTracks = Source.getSavedTracks();
  let banTracks = Combiner.push([], recentTracks, savedTracks);
  let banArtists = Selector.sliceCopy(recentTracks);
  Filter.rangeDateRel(banArtists, 2, 0);

  let tracks = savedTracks;
  Order.shuffle(tracks);

  let recomTracks = [];
  for (let i = 0; i < tracks.length; i++) {
    if (tracks[i].album.album_type == 'compilation' 
        || tracks[i].album.total_tracks == 1) {
      continue;
    }
    let albumTracks = Source.getAlbumTracks(tracks[i].album);
    Filter.matchOriginalOnly(albumTracks);
    Filter.removeArtists(albumTracks, banArtists);
    Filter.removeTracks(albumTracks, banTracks);
    if (albumTracks.length == 0) {
      continue;
    }

    Order.sort(albumTracks, 'meta.popularity', 'desc');
    Selector.keepFirst(albumTracks, LIMIT_ALB_TRACK);
    Combiner.push(recomTracks, albumTracks);

    Filter.dedupTracks(recomTracks);
    if (recomTracks.length >= LIMIT_TRACKS) {
      break;
    }
  }

  Playlist.saveWithReplace({
    name: 'Discoveries from Albums',
    description: 'These tracks should please you!',
    tracks: Selector.sliceFirst(recomTracks, LIMIT_TRACKS),
    randomCover: 'update',
  });
}
```

## Loved and Forgotten
```js
/**
 * Collect favorite tracks that haven't been listened to for a long time and were added more than a month ago
 * It is recommended to use after accumulating at least a small listening history
 */
function updateSavedAndForgot(){
    let recentTracks = RecentTracks.get(3000);
    let savedTracks = Source.getSavedTracks(); 
    Filter.removeTracks(savedTracks, recentTracks);
    
    let startDate = new Date('2006-01-01');
    let endDate = Filter.getDateRel(30, 'endDay');
    Filter.rangeDateAbs(savedTracks, startDate, endDate);
    
    Selector.keepRandom(savedTracks, 20);    
    Order.sort(savedTracks, 'meta.added_at', 'asc');
    
    Playlist.saveWithReplace({
        // id: 'yourId',
        name: 'Loved and Forgotten',
        tracks: savedTracks,
        randomCover: 'update',
    });
}
```

## Update Tracking
```js
/**
 * Collect tracks from followed playlists that were added over the week
 */
function updateFollowedTracks(){
    let followedTracks = Source.getFollowedTracks({
        type: 'followed',
    });
    // Change the period if necessary
    Filter.rangeDateRel(followedTracks, 7, 1);

    // Add Order and Selector to limit the number

    Playlist.saveWithReplace({
        // id: 'yourId',
        name: 'Update Tracking',
        tracks: followedTracks,
        randomCover: 'update',
    });
}
```

## Editorial New Releases
```js
/**
 * Collect new releases from various editorial (curator) selections over the week
 */
function updateNewRelease(){
    let recentTracks = RecentTracks.get(2000);
    let newReleaseTracks = Source.getTracks([
        // Popular editorials
        { name: 'All New Indie', id: '37i9dQZF1DXdbXrPNafg9d' },
        { name: 'New music friday', id: '37i9dQZF1DX4JAvHpjipBk' },
        { name: 'NMEs Best New Tracks', id: '4NzWle6sDBwHLQ1tuqLKhp' },
        { name: 'Best New Music by Complex', id: '5PKZSKuHP4d27SXO5fB9Wl' },
        { name: 'MTV PUSH: Radar', id: '1RpijnCwXVGB2fxMA8km5K' },
        { name: 'Pop n Fresh by Spotify', id: '37i9dQZF1DX50KNyX4Fc9O' },
        { name: 'New Music Friday UK', id: '37i9dQZF1DX4W3aJJYCDfV' },
        { name: 'New This Week by Topsify', id: '4f0IMCLd3iciiLR4V6qXcp' },
        { name: 'Pop Rising by Topsify', id: '37i9dQZF1DWUa8ZRTfalHk' },
        
        // Less popular editorials
        { name: 'Disco Naivete', id: '4c6G93bHqsUbwqlqRDND9k' },
        { name: 'The Line Of Best Fit', id: '5359l8Co8qztllR0Mxk4Zv' },
        { name: 'Going Solo', id: '1ozCM0k4h6vrMlAzNaJCyy' },
        { name: '[PIAS] Monday', id: '59y1SSfAYf2DE4PmHhwNh1' },
        { name: 'undercurrents', id: '37i9dQZF1DX9myttyycIxA' },
        { name: 'XL Play', id: '1IUF5q4IvkjylMhd9P0urE' },
        { name: 'HumanHuman Most Promising', id: '5VMDrQb7imexrTLjLVjbnO' },
        { name: 'ESNS Chart', id: '72qhgUjoFVONkcQcBNQYcY' },
    ]);

    Filter.dedupTracks(newReleaseTracks);
    Filter.rangeDateRel(newReleaseTracks, 7, 1);
    Filter.removeTracks(newReleaseTracks, recentTracks);  
    Filter.matchExceptMix(newReleaseTracks);
    Filter.matchExceptRu(newReleaseTracks);
    Filter.rangeTracks(newReleaseTracks, {
        meta: {
            popularity: { min: 35, max: 100 },
        },
        artist: {
            ban_genres: ['pop', 'hip hop', 'rap', 'r&b', 'blues', 'punk', 'hollywood', 'latin', 'african', 'house'],
        },
    }); 
    
    Order.sort(newReleaseTracks, 'meta.popularity', 'desc');
    Selector.keepFirst(newReleaseTracks, 60);
        
    Playlist.saveWithReplace({
        // id: 'yourId',
        name: 'Editorial New Releases',
        tracks: newReleaseTracks,
        randomCover: 'update',
    });
}
```

## Collector
```js
/**
 * Accumulate tracks from "Release Radar", listened tracks are removed
 */
function updateCollectorPlaylist(){
    // After the first creation of the playlist, add the collector ID and remove the comments
    // const COLLECTOR_PLAYLIST_ID = '';
    let recentTracks = RecentTracks.get(1000);
    let newTracks = Source.getPlaylistTracks('Release Radar', 'yourId');

    // let currentTracks = Source.getPlaylistTracks('Collector: Release Radar', COLLECTOR_PLAYLIST_ID);
    // Combiner.push(newTracks, currentTracks);
    
    Filter.dedupTracks(newTracks);
    Filter.removeTracks(newTracks, recentTracks);
    
    Playlist.saveWithReplace({
      // id: COLLECTOR_PLAYLIST_ID,
      name: 'Collector: Release Radar',
      tracks: newTracks,
      randomCover: 'update',
    });
}
```