//Daily Playlists
async function updateDailyPlaylists() {
    await Promise.all([
      updateHeardLikedandForgotten_(),
      songstolike_(),
      updateDiscoverDaily_(),
      updateFocusedWork_(),
      createTopOfRandomNeighbours_(),
    ]);
  }
  
  
  // Liked songs on Plex and Spotify. 
  function songstolike_() {
    // Retrieve saved tracks and playlist tracks
    const savedTracks = Source.getSavedTracks();
    const savedPlexTracks = Source.getPlaylistTracks('', '0XX5ctli6YOqUPz9a4v1qc');
    const allPlexTracks = Source.getPlaylistTracks('', '2X7gTHAOwM1n1f5XqeRTYd');
  
    // Create sets of track IDs for quick lookups
    const savedPlexTrackIds = new Set(savedPlexTracks.map(track => track.id));
    const allPlexTrackIds = new Set(allPlexTracks.map(track => track.id));
  
    // Filter out tracks in allPlexTracks from savedTracks
    const tracksToLikeInPlex = savedTracks.filter(track => !allPlexTrackIds.has(track.id));
  
    // Filter out tracks in savedTracks from savedPlexTracks
    const tracksToLikeOnSpotify = savedPlexTracks.filter(track => !savedPlexTrackIds.has(track.id));
  
    // Save the "Plex to like" playlist
    Playlist.saveWithReplace({
      id: '1XUpKZlr0LXLYPfhMkefNu',
      name: 'Plex to like',
      tracks: tracksToLikeInPlex,
    });
  
    // Save the "Songs to like on Spotify" playlist
    Playlist.saveWithReplace({
      id: '2rqLUXz228mrIjoL7ulTgP',
      name: '🎵 Songs to like on Spotify',
      tracks: tracksToLikeOnSpotify,
    });
  }
  
  //Top songs of random LastFM neighbours
    function createTopOfRandomNeighbours_() {
        function updateNeighbourNames() {
          const FILENAME = 'NeighbourNames';
          let remoteUsers = getLastfmNames();
          let cacheUsers = Array.from(new Set(Combiner.push(Cache.read(FILENAME), remoteUsers)));
          Cache.write(FILENAME, cacheUsers);
        }
        updateNeighbourNames();
        let users = Selector.sliceRandom(Cache.read('NeighbourNames'), 3);
        let tracks = users.reduce((tracks, user) => {
          return Combiner.push(tracks, Lastfm.getTopTracks({ user: user }));
        }, []);
        Filter.removeTracks(tracks, RecentTracks.get());
        Filter.dedupTracks(tracks);
        Filter.matchOriginalOnly(tracks);
  
        Playlist.saveWithReplace ( { 
          id : '0gKuGvhISOaY8uieM7ywsY' , 
          name : 'Top from neighbors' , 
          description : 'Neighbours: '  + users.join ( ', ' ) , 
          tracks : tracks , 
        } ) ; 
        function getLastfmNames(page = 'neighbours', user) {
        let url = `https://www.last.fm/user/${user || KeyValue.LASTFM_LOGIN}/${page}`;
        let cheerio = createCherio(url);
        let root = cheerio(`.user-list`);
        let users = [];
        cheerio('.user-list-name', '', root).each((index, node) => {
          users.push(cheerio(node).text().trim());
        });
        return users;
        function createCherio(url) {
          let content = CustomUrlFetchApp.fetch(url).getContentText();
          return Cheerio.load(content);
      } }
      }
  
  // Pool of Memory - change year
  async function createPoolOfMemory() {
    const FILENAME = 'PoolOfMemory';
    const YEAR = 2023;
    // Get existing memory tracks from cache
    let memoryTracks = Cache.read(FILENAME);
    // Fetch new tracks from Last.fm
    const lastfmTracks = await Lastfm.getCustomTop({
      user: 'ladywhiskers94', // thisisbritt
      from: `${YEAR}-01-01`,
      to: `${YEAR}-12-31`,
      count: 1000,
      offset: 60,
      minPlayed: 10,
    });
    // Combine the existing memory tracks with the new Last.fm tracks
    memoryTracks = Combiner.push(memoryTracks, lastfmTracks);
    // Remove duplicate tracks
    Filter.dedupTracks(memoryTracks);
    // Filter tracks based on popularity and duration
    Filter.rangeTracks(memoryTracks, {
      meta: {
        popularity: { min: 5 },
        duration_ms: { min: 120000 },
      },
    });
  
    // Compress and write the updated memory tracks to cache
    Cache.compressTracks(memoryTracks);
    Cache.write(FILENAME, memoryTracks);
  
    // Save the updated memory tracks as a playlist
    Playlist.saveWithUpdate({
      id: '', 
      name: 'Pool of Memory',
      tracks: memoryTracks,
    });
  }
    function updateHeardLikedandForgotten_() {
      const PLAYLIST_ID = '7BpAuAyoNGmEu3OLC65aCN'
      let recentTracks = RecentTracks.get(15000);
      let savedTracks = Combiner.push((Cache.read('SavedTracks')),Cache.read('PoolofMemory'));
      let bannedTracks = Source.getPlaylistTracks('banned','4Ep4JuDSqaIvd2OzraWRSt')
      let likedTracks = Source.getSavedTracks()
  
      let tracks = findTracks();
      Filter.removeTracks(tracks,savedTracks,true)
      Playlist.saveWithReplace({
        id: PLAYLIST_ID,
        name: 'heard, liked, then forgotten',
        tracks: tracks,
      });
      function findTracks() {
          
          let startDate = new Date('2020-01-01');
          let endDate = Filter.getDateRel(90, 'endDay');
          Filter.rangeDateAbs(savedTracks, startDate, endDate);
          Filter.removeTracks(savedTracks, Combiner.push(recentTracks, bannedTracks));
          Filter.dedupTracks(savedTracks)
          Filter.removeUnavailable(savedTracks,'AU')
          Filter.matchLatinOnly(savedTracks);
          Filter.removeTracks(savedTracks,likedTracks,true)
          //Filter.dedupArtists(savedTracks);
          savedTracks = Selector.sliceFirst(savedTracks, 200);
          return savedTracks;
        }
      }
  
  //Pulling new songs from my Release Radar,  Discover Weekly, Daily Mixes, triple j's New Music Hitlist, triple j Unearthed, and The Needle / Australia. Updates daily.
  function updateDiscoverDaily_() {
    // Retrieve saved tracks and banned tracks from cache and playlists.
    const savedTracks = Cache.read('SavedTracks');
    const bannedTracks = Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt');
    // Define an array of track sources.
    const trackSources = [
      { name: 'dailyjams', id: '78CmSGx8iaHMxGwN9OknSv' },
      { name: 'Discover Weekly Archive', id: '1yLjDzSM5NEEQ5yGc5ZRhp' },
      { name: 'The Needle / Australia - Emerging', id: '2xQ33augU2OmdZQVijYecH' },
      { name: 'The Needle / Australia - Current', id: '2mjbz0gH1KwFWj5Sku7LJI'},
      { name: 'triple js New Music Hitlist', id: '7vFQNWXoblEJXpbnTuyz76' },
      { name: 'triple j Unearthed Best New Music', id: '78d1cKN9xYtKialnOYkI92' },
      { name: 'The Sound of Canberra Indie', id: '6NtolKQzqsuJxnDi5NgBkH'  },
      { name: 'Top from neighbors', id: '0gKuGvhISOaY8uieM7ywsY'}, 
      { name: 'Canberra New Music', id: '31A9GAJDWkQFAY4gV9Co0h'},
      { name: 'plex songs', id: '2X7gTHAOwM1n1f5XqeRTYd'},
      { name: '', id: '2CNDphbrMuTQLOyeGzC5rT' }, //weekly exploration 
    ];
    // Retrieve tracks from specified sources.
    const tracks = Source.getTracks(trackSources);
    // Remove saved and banned tracks from the retrieved tracks.
    Filter.removeTracks(tracks, Combiner.push(savedTracks, bannedTracks));
    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);
    // Randomly select 10 tracks from the retrieved tracks.
    Selector.keepRandom(tracks, 10);
    // Save the resulting tracks to the "Discover Daily" playlist.
    Playlist.saveWithReplace({
      id: '7aPZj5UPndnpHD7anj2AtU',
      name: 'Discover Daily',
      tracks: tracks,
    });
  }
  function updateFocusedWork_() {
    const today = new Date();
    
    // Define seasonal playlists and determine current season
    const seasonPlaylists = {
      summer: { name: 'Season: Summer', id: '2h10grHRIER0b6M8CITsCO', limit: 100 },
      autumn: { name: 'Season: Autumn', id: '2137grXLE1vCOO2MucbkiU', limit: 100 },
      winter: { name: 'Season: Winter', id: '73aUH1Sv8w28usXnPLIjV7', limit: 100 },
      spring: { name: 'Season: Spring', id: '4N97YkOZec45LFTPu7FT6e', limit: 100 }
    };
    
    const currentSeason = getCurrentSeason_(today, seasonPlaylists);
    const isSpookySeason = today.getMonth() === 9;
    const isFestiveSeason = today.getMonth() === 11;
  
    // Retrieve and prepare core tracks
    const memoryTracks = Cache.read('PoolofMemory');
    const savedAlbumTracks = getRandomTracks_(Source.getSavedAlbumTracks(5), 20);
    const topTracks = getRandomTracks_(Source.getTopTracks('medium'), 90);
    const dailyTracks = Source.getPlaylistTracks('Discover Daily', '7aPZj5UPndnpHD7anj2AtU', '', 10);
    
    // Compile seasonal and memory tracks
    const corePlaylists = [
      { name: 'heard, liked, then forgotten', id: '7BpAuAyoNGmEu3OLC65aCN', limit: 100 },
      { name: 'happy', id: '04z4EQ0AC9a7cjtdcKnDpn', limit: 100 },
      { name: 'gay', id: '4CHdd4KMQABX3inKKEiDMV', limit: 50 },
      { name: 'Top Tracks (All Time)', id: '4YWHWAECe9R5nIxIUDlkAj', limit: 100 },
      currentSeason
    ];
  
    let combinedTracks = getCombinedTracks_(corePlaylists, memoryTracks.concat(savedAlbumTracks));
    combinedTracks = filterTracks_(combinedTracks, { tempo: { min: 60, max: 120 } });
    combinedTracks = deduplicateTracks_(combinedTracks);
  
    // Additional mixes and daily jams
    const additionalMixPlaylists = [
      { name: 'Instrumental Soundtracks I dig', id: '5qqdXcHnly1RuBnpkZzueE', limit: 10 }
    ];
  
    let additionalMixTracks = getCombinedTracks_(additionalMixPlaylists);
    additionalMixTracks = getRandomTracks_(additionalMixTracks, 20);
  
    const dailyJams = Source.getPlaylistTracks('1zl8x9E1JxcwbA0InkkL39');
  
    // Mix tracks for focused work and apply seasonal variations
    let focusedWorkTracks = mixTracks_([additionalMixTracks, combinedTracks, dailyJams]);
    focusedWorkTracks = applySeasonalTracks_(focusedWorkTracks, isSpookySeason, isFestiveSeason);
  
    // Finalize tracks
    focusedWorkTracks = deduplicateTracks_(focusedWorkTracks);
    focusedWorkTracks = filterOutBannedTracks_(focusedWorkTracks);
    Selector.keepFirst(focusedWorkTracks, 150);
  
    // Save to focused work playlist
    Playlist.saveWithReplace({
      id: '36lwTTY2kPm1YpgXQaGdOX',
      name: 'focused work',
      tracks: focusedWorkTracks
    });
  }
  
  function getCurrentSeason_(today, seasonPlaylists) {
    const month = today.getMonth();
    if (month === 11 || month === 0 || month === 1) return seasonPlaylists.summer;
    if (month >= 2 && month <= 4) return seasonPlaylists.autumn;
    if (month >= 5 && month <= 7) return seasonPlaylists.winter;
    return seasonPlaylists.spring;
  }
  
  function getRandomTracks_(tracks, count) {
    Selector.keepRandom(tracks, count);
    return tracks;
  }
  
  function getCombinedTracks_(playlists, initialTracks = []) {
    return playlists.reduce((tracks, playlist) => {
      const playlistTracks = Source.getPlaylistTracks(playlist.name, playlist.id, playlist.limit || 0);
      return Combiner.push(tracks, playlistTracks);
    }, initialTracks);
  }
  
  function filterTracks_(tracks, filterCriteria) {
    Filter.rangeTracks(tracks, { meta: { features: filterCriteria } });
    return tracks;
  }
  
  function deduplicateTracks_(tracks) {
    Filter.dedupTracks(tracks);
    return tracks;
  }
  
  function mixTracks_(trackGroups) {
    return Combiner.mixinMulti({
      source: trackGroups,
      inRow: [1, 1, 1]
    });
  }
  
  function applySeasonalTracks_(focusedWorkTracks, isSpookySeason, isFestiveSeason) {
    const spooky = Source.getPlaylistTracks('spooky', '6LKVyqtd1fhB4BDvjJbf6k');
    const christmas = Source.getPlaylistTracks('christmas', '7lPKDMgdVzfWMmhs6kCtkj');
    if (isSpookySeason) focusedWorkTracks = Combiner.alternate('min', focusedWorkTracks, spooky);
    if (isFestiveSeason) focusedWorkTracks = Combiner.alternate('min', focusedWorkTracks, christmas);
    return focusedWorkTracks;
  }
  
  function filterOutBannedTracks_(tracks) {
    const bannedTracks = Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt');
    Filter.removeTracks(tracks, bannedTracks);
    return tracks;
  }
  
  
  //Discover Weekly Archive and Daily Jams. Updates Daily.
  async function updateArchives() {
    // Get all tracks in parallel.
    const [
      savedTracks,
      archiveTracks,
      discoverweeklyTracks,
      dailyjamsexisting,
      dailyjams,
    ] = await Promise.all([
      Source.getSavedTracks(),
      Source.getPlaylistTracks('Discover Weekly Archive', '1yLjDzSM5NEEQ5yGc5ZRhp'),
      Source.getPlaylistTracks('', '78CmSGx8iaHMxGwN9OknSv'),
      Source.getPlaylistTracks('', '1zl8x9E1JxcwbA0InkkL39'),
    ]);
    // Filter out saved tracks from the Discover Weekly playlist.
    Filter.removeTracks(discoverweeklyTracks, savedTracks);
    // Combine the Discover Weekly playlist with the Discover Weekly Archive playlist.
    const discoverWeeklyArchiveTracks = Combiner.push(archiveTracks, discoverweeklyTracks);
    // Deduplicate the Discover Weekly Archive playlist.
    Filter.dedupTracks(discoverWeeklyArchiveTracks);
    // Save the Discover Weekly Archive playlist.
    await Playlist.saveWithUpdate({
      id: '1yLjDzSM5NEEQ5yGc5ZRhp',
      name: 'Discover Weekly Archive',
      tracks: discoverWeeklyArchiveTracks,
    });
    // Filter out saved tracks from the Daily Jams playlist.
    Filter.removeTracks(dailyjams, savedTracks);
    // Combine the Daily Jams playlist with the Daily Jams Archive playlist.
    const dailyjamsarchive = Combiner.push(dailyjamsexisting, dailyjams);
    // Deduplicate the Daily Jams Archive playlist.
    Filter.dedupTracks(dailyjamsarchive);
    // Save the Daily Jams Archive playlist.
    await Playlist.saveWithUpdate({
      id: '78CmSGx8iaHMxGwN9OknSv',
      name: 'Daily Jams Archive',
      tracks: dailyjamsarchive,
    });
  }
  
  // Update my Hottest 100 Shortlist. Updates on the 15th.
  async function updateHottest100Shortlist() {
    // Constant for the playlist ID
    const PLAYLIST_ID = '5Otvdwpoipe7o1lDOy4oFN';
  
    // Fetch data asynchronously from various sources in parallel
    const [
      savedTracks,
      longTopTracks,
      mediumTopTracks,
      shortTopTracks,
      shortlistTracks,
    ] = await Promise.all([
      Cache.read('SavedTracks'),
      Source.getTopTracks('long'),
      Source.getTopTracks('medium'),
      Source.getTopTracks('short'),
      Source.getPlaylistTracks('Hottest 100 Shortlist', PLAYLIST_ID),
    ]);
    // Combine all top tracks
    const topTracks = Combiner.push(longTopTracks, shortTopTracks, mediumTopTracks);
    // Filter top tracks to include only singles and albums released between 2022-12-01 and 2023-11-30
    Filter.rangeTracks(topTracks, {
      album: {
        album_type: ['single', 'album'],
        release_date: { startDate: new Date('2023.12.01'), endDate: new Date('2024.11.30') },
      },
    });
    // Combine top tracks with shortlist tracks
    const hottest100tracks = Combiner.push(shortlistTracks, topTracks);
    // Remove saved tracks from the combined list
    Filter.removeTracks(hottest100tracks, savedTracks, true);
    // Deduplicate tracks
    Filter.dedupTracks(hottest100tracks);
    // Sort tracks by artist popularity in descending order
    Order.sort(hottest100tracks, 'artist.popularity', 'desc');
    // Save the updated playlist
    await Playlist.saveWithUpdate({
      id: PLAYLIST_ID,
      name: 'Hottest 100 Shortlist',
      tracks: hottest100tracks,
    });
  }
  // chill. Updates every Sunday
  async function updateChill() {
    // Get all tracks in parallel.
    const [
      savedTracks,
      savedAlbums,
      otherTracks,
      spotifyTracks,
      bannedTracks,
      danceableTracks,
      chillarchive,
    ] = await Promise.all([
      Source.getSavedTracks(500),
      Source.getSavedAlbumTracks(5),
      Source.getTracks([
        { name: 'Dad Kinda Music', id: '3WkChrZw4PCcYdZsA6nJpt' },
      ]),
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
      Source.getPlaylistTracks('danceable', '2XHd5kjFiMof9c4nMvQxDw'),
      Source.getPlaylistTracks('chill archive', '3GH1J6lUCU3AVxIIsnrtuu'),
    ]);
    // Combine all tracks.
    const allTracks = Combiner.push(
      savedTracks,
      savedAlbums,
      otherTracks,
      spotifyTracks,
      chillarchive,
    );
    // Filter out danceable and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(danceableTracks, bannedTracks));
    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);
    // Sort the tracks by energy in ascending order.
    Order.sort(allTracks, 'features.energy', 'asc');
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '15ERnHHMNvXQeDfOntAvla',
      name: 'chill',
      tracks: allTracks,
    });
  }
  
  // danceable. Updates every Friday
  async function updateDanceable() {
    // Get all tracks in parallel.
    const [
      happyTracks,
      savedTracks,
      savedAlbums,
      savedTopTracks,
      spotifyTracks,
      dancearchive,
    ] = await Promise.all([
      Source.getPlaylistTracks('happy', '04z4EQ0AC9a7cjtdcKnDpn'),
      Cache.read('SavedTracks'),
      Source.getSavedAlbumTracks(5),
      Combiner.push(happyTracks, savedTracks, savedAlbums),
  
      Source.getPlaylistTracks('dance archive', '4MTDcFBPppZfdoI2airnF3'),
    ]);
    // Combine all tracks.
    const allTracks = Combiner.push(dancearchive, savedTopTracks, spotifyTracks);
    // Filter out banned tracks.
    Filter.removeTracks(allTracks, bannedTracks);
    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);
    // Sort the tracks by tempo in ascending order.
    Order.sort(allTracks, 'features.tempo', 'asc');
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '2XHd5kjFiMof9c4nMvQxDw',
      name: 'danceable',
      tracks: allTracks,
    });
  }
  // high energy. Updates every Saturday
  async function updateHighEnergy() {
    // Get all tracks in parallel.
    const [
      dancearchive,
      savedTracks,
      savedAlbums,
      spotifyTracks,
      bannedTracks,
    ] = await Promise.all([
      Source.getPlaylistTracks('dance archive', '4MTDcFBPppZfdoI2airnF3'),
      Cache.read('SavedTracks'),
      Source.getSavedAlbumTracks(5),
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
    ]);
    // Combine all tracks.
    const allTracks = Combiner.push(dancearchive, savedTracks, savedAlbums, spotifyTracks);
    // Filter out banned tracks.
    Filter.removeTracks(allTracks, bannedTracks);
    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);
    // Sort the tracks by tempo in ascending order.
    Order.sort(allTracks, 'features.tempo', 'asc');
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '7hE7I816kRsniDpo1sjQXz',
      name: 'high energy',
      tracks: allTracks,
    });
  }
  
  // happy. Updates every Wednesday
  async function updateHappyMix() {
    // Get all tracks in parallel.
    const [
      moodyTracks,
      bannedTracks,
      happyarchive,
      spotifytracks,
      savedTracks,
    ] = await Promise.all([
      Source.getPlaylistTracks('moody', '70kt2ckF3xi5OjhbgJpoKF'),
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
      Source.getPlaylistTracks('happy archive', '3gQWnCKY8bmgbIMd64bvf0'),
      Cache.read('SavedTracks'),
    ]);
    // Filter the saved tracks to only include happy tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.7, max: 1.0 },
        anger: { min: 0.0, max: 0.3 },
        happiness: { min: 0.7, max: 1.0 },
        sadness: { min: 0.0, max: 0.3 },
      },
    });
    // Combine all of the happy tracks.
    const allTracks = Combiner.push(spotifytracks, savedTracks, happyarchive);
    // Filter out moody and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(moodyTracks, bannedTracks));
    // Alternate the happy tracks with the happy archive.
    const tracks = Combiner.alternate('max', allTracks, happyarchive);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);
    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '04z4EQ0AC9a7cjtdcKnDpn',
      name: 'happy',
      tracks: tracks,
    });
  }
  // moody.  Updates every Thursday
  async function updateMoodyMix() {
    // Get all tracks in parallel.
    const [
      happyTracks,
      bannedTracks,
      moodyarchive,
      savedTracks,
    ] = await Promise.all([
      Source.getPlaylistTracks('happy', '04z4EQ0AC9a7cjtdcKnDpn'),
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
      Source.getPlaylistTracks('moody archive', '2UnkdvvsmB3LvwW0hQ93Qr'),
      Cache.read('SavedTracks'),
    ]);
    // Filter the saved tracks to only include moody tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.0, max: 0.3 },
        anger: { min: 0.3, max: 1.0 },
        happiness: { min: 0.7, max: 0.3 },
        sadness: { min: 0.5, max: 1.0 },
      },
    });
    // Combine all of the moody tracks.
    const allTracks = Combiner.push(savedTracks, moodyarchive);
    // Filter out happy and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(happyTracks, bannedTracks));
    // Combine the moody tracks with the moody archive.
    const tracks = Combiner.push(allTracks, moodyarchive);
    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '70kt2ckF3xi5OjhbgJpoKF',
      name: 'moody',
      tracks: tracks,
    });
  }
  // romantic. Updates every Saturday
  async function updateRomanticMix() {
    // Get all tracks in parallel.
    const [bannedTracks, romanticarchive, romanticTracks] = await Promise.all([
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
      Source.getPlaylistTracks('romantic archive', '2Iho7W6TYn4eufLQZ5GZyx'),
    ]);
    // Filter out banned tracks.
    Filter.removeTracks(romanticTracks, bannedTracks);
    // Combine all of the romantic tracks.
    const tracks = Combiner.push(romanticTracks, romanticarchive);
    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '5fiEC1THLqYh1DJHV8mleq',
      name: 'romantic',
      tracks: tracks,
    });
  }
  // sad.  Updates every Thursday
  async function updateSadMix() {
    // Get all tracks in parallel.
    const [
      sadarchive,
      happyTracks,
      bannedTracks,
      savedTracks,
      spotifytracks,
    ] = await Promise.all([
      Source.getPlaylistTracks('', '6QyTU1QD9mP7WIx0SSmnXL'),
      Source.getPlaylistTracks('happy', '04z4EQ0AC9a7cjtdcKnDpn'),
      Source.getPlaylistTracks('banned', '4Ep4JuDSqaIvd2OzraWRSt'),
      Cache.read('SavedTracks'),
    ]);
    // Filter the saved tracks to only include sad tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.0, max: 0.3 },
        happiness: { min: 0.7, max: 0.3 },
        sadness: { min: 0.5, max: 1.0 },
      },
    });
    // Combine all of the sad tracks.
    const allTracks = Combiner.push(spotifytracks, savedTracks);
    // Filter out happy and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(happyTracks, bannedTracks));
    // Combine the sad tracks with the sad archive.
    const tracks = Combiner.push(allTracks, sadarchive);
    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);
    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);
    // Save the playlist.
    await Playlist.saveWithReplace({
      id: '2UIGoKlpYbwpdTTVdwXKcr',
      name: 'SAD 😥',
      tracks: tracks,
    });
  }
  