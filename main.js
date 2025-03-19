//Daily Playlists
async function updateDailyPlaylists() {
  console.log("Starting updateDailyPlaylists");
  try {
    const results = await Promise.allSettled([
      // Use Promise.allSettled
      updateHeardLikedandForgotten_(),
      songsToLike_(),
      updateDiscoverDaily_(),
      updateFocusedWork_(),
    ]);
    console.log("Finished updateDailyPlaylists");

    // Check for rejections
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Error in daily playlist update (index ${index}):`,
          result.reason
        );
      }
    });
    return true;
  } catch (error) {
    console.error("Error in updateDailyPlaylists:", error);
    return false;
  }
}

function getCurrentSeason_(today, seasonPlaylists) {
  const currentSeasonName = Season.getCurrentSeason(today);
  return seasonPlaylists[currentSeasonName];
}

async function filterOutBannedTracks_(tracks) {
  console.log("Starting filterOutBannedTracks_");
  try {
    if (!tracks) {
      console.error("filterOutBannedTracks_: tracks is undefined");
      return [];
    }

    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    const quarantinedPlaylistId = UserProperties.getProperty(
      "QUARANTINED_PLAYLIST_ID"
    );

    const bannedTracksPromises = [
      Source.getPlaylistTracks("banned", bannedPlaylistId),
      Source.getPlaylistTracks("Quarantined", quarantinedPlaylistId),
    ];

    const bannedTracksResults = await Promise.all(bannedTracksPromises);
    const allBannedTracks = bannedTracksResults.flat().filter(Boolean); // Filter out any false values

    if (allBannedTracks.length === 0) {
      console.warn("filterOutBannedTracks_: No banned tracks found.");
      return tracks;
    }

    Filter.removeTracks(tracks, allBannedTracks);
    console.log(
      `filterOutBannedTracks_: Removed ${allBannedTracks.length} banned tracks.`
    );
    console.log("Finished filterOutBannedTracks_");
    return tracks;
  } catch (error) {
    console.error("Error in filterOutBannedTracks_:", error);
    return [];
  }
}

async function getRandomTracks_(tracks, limit) {
  console.log("Starting getRandomTracks_");
  try {
    if (!tracks) {
      console.error("getRandomTracks_: tracks is undefined");
      return []; // Return empty array
    }
    Selector.keepRandom(tracks, limit);
    console.log(`getRandomTracks_: Kept ${limit} random tracks.`);
    console.log("Finished getRandomTracks_");
    return tracks;
  } catch (error) {
    console.error("Error in getRandomTracks_:", error);
    return []; // Return empty array
  }
}

async function getCombinedTracks_(corePlaylists, existingTracks = []) {
  console.log("Starting getCombinedTracks_");
  try {
    const playlistTracksPromises = corePlaylists.map(async (playlist) => {
      if (playlist.id) {
        const tracks = await Source.getPlaylistTracks(
          playlist.name,
          playlist.id,
          "",
          playlist.limit
        );
        if (tracks === false) {
          console.error(
            `getCombinedTracks_: Failed to get tracks for playlist: ${playlist.name}`
          );
          return []; // Return empty array if getting tracks fails
        }
        return tracks;
      } else {
        console.warn(
          `getCombinedTracks_: Playlist ID not defined for: ${playlist.name}`
        );
        return [];
      }
    });

    const playlistTracksArrays = await Promise.all(playlistTracksPromises);
    const allPlaylistTracks = playlistTracksArrays.flat();

    const combinedTracks = Combiner.push(existingTracks, allPlaylistTracks);
    console.log(
      `getCombinedTracks_: Combined ${allPlaylistTracks.length} tracks from ${corePlaylists.length} playlists.`
    );
    console.log("Finished getCombinedTracks_");
    return combinedTracks;
  } catch (error) {
    console.error("Error in getCombinedTracks_:", error);
    return []; // Return empty array
  }
}

async function filterTracks_(tracks, filterParams) {
  console.log("Starting filterTracks_");
  try {
    if (!tracks) {
      console.error("filterTracks_: tracks is undefined");
      return []; // Return empty array
    }
    // Use RangeTracks.rangeTracks to filter tracks based on the provided parameters.
    Filter.rangeTracks(tracks, { features: filterParams });
    console.log(
      `filterTracks_: Filtered tracks based on parameters: ${JSON.stringify(
        filterParams
      )}`
    );
    console.log("Finished filterTracks_");
    return tracks;
  } catch (error) {
    console.error("Error in filterTracks_:", error);
    return []; // Return empty array
  }
}

async function mixTracks_(trackArrays) {
  console.log("Starting mixTracks_");
  try {
    if (!trackArrays || !Array.isArray(trackArrays)) {
      console.error("mixTracks_: trackArrays is undefined or not an array");
      return []; // Return empty array
    }
    // Flatten the array of arrays into a single array
    const allTracks = trackArrays.flat();

    // Shuffle the combined array to mix the tracks
    Order.shuffle(allTracks);
    console.log(`mixTracks_: Mixed ${allTracks.length} tracks.`);
    console.log("Finished mixTracks_");
    return allTracks;
  } catch (error) {
    console.error("Error in mixTracks_:", error);
    return []; // Return empty array
  }
}

//Songs To Like
// main.gs (Updated)
async function songsToLike_() {
  console.log("Starting songsToLike_");
  try {
    // Retrieve saved tracks
    const savedTracks = Source.getSavedTracks();
    if (!savedTracks) {
      console.error("songsToLike_: savedTracks is undefined");
      return []; // Return empty array
    }

    // Retrieve playlist IDs from config
    const plexPlaylistId = UserProperties.getProperty("PLEX_PLAYLIST_ID");
    const allPlexTracksId = UserProperties.getProperty("ALL_PLEX_TRACKS_ID");
    const plexToLikePlaylistId = UserProperties.getProperty(
      "PLEX_TO_LIKE_PLAYLIST_ID"
    );
    const spotifyLikePlaylistId = UserProperties.getProperty(
      "SPOTIFY_LIKE_PLAYLIST_ID"
    );

    // Retrieve playlist tracks using Promise.allSettled
    const playlistPromises = [
      Source.getPlaylistTracks("savedPlexTracks", plexPlaylistId),
      Source.getPlaylistTracks("allPlexTracks", allPlexTracksId),
    ];

    const playlistResults = await Promise.allSettled(playlistPromises);

    // Handle rejections and extract tracks
    const savedPlexTracks =
      playlistResults[0].status === "fulfilled" ? playlistResults[0].value : [];
    const allPlexTracks =
      playlistResults[1].status === "fulfilled" ? playlistResults[1].value : [];

    playlistResults.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `Error in songsToLike_ (playlist index ${index}):`,
          result.reason
        );
      }
    });

    if (savedPlexTracks.length === 0) {
      console.error("songsToLike_: savedPlexTracks is empty");
    }
    if (allPlexTracks.length === 0) {
      console.error("songsToLike_: allPlexTracks is empty");
    }

    // Create sets of track IDs for quick lookups
    const savedPlexTrackIds = new Set(
      savedPlexTracks.map((trackItem) => trackItem.id)
    );
    const allPlexTrackIds = new Set(
      allPlexTracks.map((trackItem) => trackItem.id)
    );

    // Filter out tracks in allPlexTracks from savedTracks
    const tracksToLikeInPlex = savedTracks.filter(
      (trackItem) => !allPlexTrackIds.has(trackItem.id)
    );

    // Filter out tracks in savedTracks from savedPlexTracks
    const tracksToLikeOnSpotify = savedPlexTracks.filter(
      (trackItem) => !savedPlexTrackIds.has(trackItem.id)
    );

    // Save the "Plex to like" playlist
    await Playlist.saveWithReplace({
      id: plexToLikePlaylistId,
      name: "Plex to like",
      tracks: tracksToLikeInPlex,
    });
    console.log(
      `songsToLike_: Saved ${tracksToLikeInPlex.length} tracks to Plex to like`
    );

    // Save the "Songs to like on Spotify" playlist
    await Playlist.saveWithReplace({
      id: spotifyLikePlaylistId,
      name: "🎵 Songs to like on Spotify",
      tracks: tracksToLikeOnSpotify,
    });
    console.log(
      `songsToLike_: Saved ${tracksToLikeOnSpotify.length} tracks to Songs to like on Spotify`
    );

    console.log("Finished songsToLike_");
    return true;
  } catch (error) {
    console.error("Error in songsToLike_:", error);
    return []; // Return empty array
  }
}

// Pool of Memory - change year
// main.gs (Updated)
async function updatePoolOfMemory() {
  console.log("Starting updatePoolOfMemory");
  try {
    // Constants
    const filename = UserProperties.getProperty("POOL_OF_MEMORY_FILENAME");
    const year = new Date().getFullYear();
    const playlistId = UserProperties.getProperty("POOL_OF_MEMORY_PLAYLIST_ID");

    // Get existing memory tracks from cache
    let memoryTracks = Cache.read(filename);
    if (!memoryTracks) {
      console.warn(
        "updatePoolOfMemory: No existing memory tracks found in cache."
      );
      memoryTracks = []; // Initialize as an empty array if not found
    }

    // Fetch new tracks from Last.fm
    console.log(`updatePoolOfMemory: Fetching Last.fm tracks for ${year}`);
    const lastfmTracks = await Lastfm.getCustomTop({
      user: "ladywhiskers94", // thisisbritt
      from: `${year}-01-01`,
      to: `${year}-12-31`,
      count: 1000,
      offset: 60,
      minPlayed: 10,
    });

    if (!lastfmTracks) {
      console.error("updatePoolOfMemory: Failed to fetch Last.fm tracks.");
      return false; // Or handle it differently, e.g., return memoryTracks
    }

    // Combine tracks
    memoryTracks = Combiner.push(memoryTracks, lastfmTracks);
    console.log(
      `updatePoolOfMemory: Combined ${lastfmTracks.length} new Last.fm tracks with existing memory tracks.`
    );

    // Remove duplicate tracks
    Filter.dedupTracks(memoryTracks);
    console.log("updatePoolOfMemory: Removed duplicate tracks.");

    // Filter tracks based on popularity and duration
    Filter.rangeTracks(memoryTracks, {
      meta: {
        popularity: { min: 5 },
        duration_ms: { min: 120000 },
      },
    });
    console.log(
      "updatePoolOfMemory: Filtered tracks based on popularity and duration."
    );

    // Compress and write the updated memory tracks to cache
    Cache.compressTracks(memoryTracks);
    Cache.write(filename, memoryTracks);
    console.log(
      `updatePoolOfMemory: Compressed and wrote ${memoryTracks.length} tracks to cache.`
    );

    // Save the updated memory tracks as a playlist
    await Playlist.saveWithUpdate({
      id: playlistId,
      name: "Pool of Memory",
      tracks: memoryTracks,
    });
    console.log(
      `updatePoolOfMemory: Saved ${memoryTracks.length} tracks to playlist.`
    );

    console.log("Finished updatePoolOfMemory");
    return true;
  } catch (error) {
    console.error("Error in updatePoolOfMemory:", error);
    return false;
  }
}
//Heard, Liked, Forgotten
async function updateHeardLikedandForgotten_() {
  console.log("Starting updateHeardLikedandForgotten_");
  try {
    // Retrieve playlist ID from config
    const playlistId = UserProperties.getProperty(
      "HEARD_LIKED_FORGOTTEN_PLAYLIST_ID"
    );
    const recentTracksLimit = UserProperties.getProperty("RECENT_TRACKS_LIMIT");
    const startDateForgotten = UserProperties.getProperty(
      "START_DATE_FORGOTTEN"
    );
    const daysAgoForgotten = UserProperties.getProperty("DAYS_AGO_FORGOTTEN");
    const maxTracksForgotten = UserProperties.getProperty(
      "MAX_TRACKS_FORGOTTEN"
    );

    // Get recent tracks
    const recentTracks = RecentTracks.get(recentTracksLimit);
    if (!recentTracks) {
      console.error("updateHeardLikedandForgotten_: recentTracks is undefined");
      return [];
    }

    // Get saved tracks and pool of memory tracks
    const savedTracksCache = Cache.read("SavedTracks");
    const poolOfMemoryCache = Cache.read("PoolofMemory");
    if (!savedTracksCache) {
      console.error(
        "updateHeardLikedandForgotten_: savedTracksCache is undefined"
      );
      return [];
    }
    if (!poolOfMemoryCache) {
      console.error(
        "updateHeardLikedandForgotten_: poolOfMemoryCache is undefined"
      );
      return [];
    }
    let savedTracks = Combiner.push(savedTracksCache, poolOfMemoryCache);

    // Get banned tracks
    const bannedTracks = await Source.getPlaylistTracks(
      "banned",
      UserProperties.getProperty("BANNED_PLAYLIST_ID")
    );
    if (!bannedTracks) {
      console.error("updateHeardLikedandForgotten_: bannedTracks is undefined");
      return [];
    }

    // Get liked tracks
    const likedTracks = await Source.getSavedTracks();
    if (!likedTracks) {
      console.error("updateHeardLikedandForgotten_: likedTracks is undefined");
      return [];
    }

    // Find tracks
    let tracks = await findTracks_(
      savedTracks,
      recentTracks,
      bannedTracks,
      likedTracks,
      startDateForgotten,
      daysAgoForgotten,
      maxTracksForgotten
    );
    if (!tracks) {
      console.error("updateHeardLikedandForgotten_: tracks is undefined");
      return [];
    }

    // Remove saved tracks
    Filter.removeTracks(tracks, savedTracks, true);

    // Save playlist
    await Playlist.saveWithReplace({
      id: playlistId,
      name: "heard, liked, then forgotten",
      tracks: tracks,
    });
    console.log(
      `updateHeardLikedandForgotten_: Saved ${tracks.length} tracks to playlist.`
    );

    console.log("Finished updateHeardLikedandForgotten_");
    return true;
  } catch (error) {
    console.error("Error in updateHeardLikedandForgotten_:", error);
    return [];
  }
}

async function findTracks_(
  savedTracks,
  recentTracks,
  bannedTracks,
  likedTracks,
  startDateForgotten,
  daysAgoForgotten,
  maxTracksForgotten
) {
  console.log("Starting findTracks_");
  try {
    // Set start and end dates
    let startDate = new Date(startDateForgotten);
    let endDate = Filter.getDateRel(daysAgoForgotten, "endDay");

    // Filter by date range
    Filter.rangeDateAbs(savedTracks, startDate, endDate);

    // Remove recent and banned tracks
    Filter.removeTracks(savedTracks, Combiner.push(recentTracks, bannedTracks));

    // Deduplicate tracks
    Filter.dedupTracks(savedTracks);

    // Remove unavailable tracks
    Filter.removeUnavailable(savedTracks, "AU");

    // Match Latin only
    Filter.matchLatinOnly(savedTracks);

    // Remove liked tracks
    Filter.removeTracks(savedTracks, likedTracks, true);

    // Limit the number of tracks
    savedTracks = Selector.sliceFirst(savedTracks, maxTracksForgotten);
    console.log(`findTracks_: Found ${savedTracks.length} tracks.`);

    console.log("Finished findTracks_");
    return savedTracks;
  } catch (error) {
    console.error("Error in findTracks_:", error);
    return false; // Changed from [] to false
  }
}

//Pulling new songs from my Release Radar,  Discover Weekly, Daily Mixes, triple j's New Music Hitlist, triple j Unearthed, and The Needle / Australia. Updates daily.
// utils.gs.js (Updated updateDiscoverDaily_)

/**
 * Updates the "Discover Daily" playlist by fetching tracks from various sources,
 * filtering them, and saving the result to the playlist.
 */
async function updateDiscoverDaily_() {
  console.log("Starting updateDiscoverDaily_");
  try {
    // Retrieve saved tracks and banned tracks from cache and playlists.
    const savedTracks = Cache.read("SavedTracks");
    if (!savedTracks) {
      console.error("updateDiscoverDaily_: savedTracks is undefined");
      return false;
    }

    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    if (!bannedPlaylistId) {
      console.error("updateDiscoverDaily_: BANNED_PLAYLIST_ID is undefined");
      return false;
    }

    const bannedTracks = await Source.getPlaylistTracks(
      "banned",
      bannedPlaylistId
    );
    if (!bannedTracks) {
      console.error("updateDiscoverDaily_: bannedTracks is undefined");
      return false;
    }

    // Define an array of track sources.
    const trackSources = [
      { name: "dailyjams", id: "78CmSGx8iaHMxGwN9OknSv" },
      { name: "Discover Weekly Archive", id: "1yLjDzSM5NEEQ5yGc5ZRhp" },
      {
        name: "The Needle / Australia - Emerging",
        id: "2xQ33augU2OmdZQVijYecH",
      },
      {
        name: "The Needle / Australia - Current",
        id: "2mjbz0gH1KwFWj5Sku7LJI",
      },
      { name: "triple js New Music Hitlist", id: "7vFQNWXoblEJXpbnTuyz76" },
      {
        name: "triple j Unearthed Best New Music",
        id: "78d1cKN9xYtKialnOYkI92",
      },
      { name: "The Sound of Canberra Indie", id: "6NtolKQzqsuJxnDi5NgBkH" },
      { name: "Top from neighbors", id: "0gKuGvhISOaY8uieM7ywsY" },
      { name: "Release Radar Archive", id: "5AY0ForsC3aIc5Uf3A1m7w" },
      { name: "Canberra New Music", id: "31A9GAJDWkQFAY4gV9Co0h" },
      { name: "plex songs", id: "2X7gTHAOwM1n1f5XqeRTYd" },
      { name: "weekly exploration", id: "2CNDphbrMuTQLOyeGzC5rT" },
    ];

    // Retrieve tracks from specified sources.
    const tracks = await Source.getTracks(trackSources);
    if (!tracks) {
      console.error("updateDiscoverDaily_: tracks is undefined");
      return false;
    }

    // Remove saved and banned tracks from the retrieved tracks.
    Filter.removeTracks(tracks, Combiner.push(savedTracks, bannedTracks));

    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);

    // Randomly select 10 tracks from the retrieved tracks.
    const discoverDailyLimit = UserProperties.getProperty(
      "DISCOVER_DAILY_LIMIT"
    );
    Selector.keepRandom(tracks, discoverDailyLimit || 10);

    // Save the resulting tracks to the "Discover Daily" playlist.
    const discoverDailyPlaylistId = UserProperties.getProperty(
      "DISCOVER_DAILY_PLAYLIST_ID"
    );
    if (!discoverDailyPlaylistId) {
      console.error(
        "updateDiscoverDaily_: DISCOVER_DAILY_PLAYLIST_ID is undefined"
      );
      return false;
    }

    await Playlist.saveWithReplace({
      id: discoverDailyPlaylistId,
      name: "Discover Daily",
      tracks: tracks,
    });
    console.log(
      `updateDiscoverDaily_: Saved ${tracks.length} tracks to playlist.`
    );

    console.log("Finished updateDiscoverDaily_");
    return true;
  } catch (error) {
    console.error("Error in updateDiscoverDaily_:", error);
    return false;
  }
}

//Focused Work
async function updateFocusedWork_() {
  console.log("Starting updateFocusedWork_");
  try {
    const today = new Date();

    // Define seasonal playlists and determine current season
    const seasonPlaylists = {
      summer: {
        name: "Season: Summer",
        id: "2h10grHRIER0b6M8CITsCO",
        limit: 100,
      },
      autumn: {
        name: "Season: Autumn",
        id: "2137grXLE1vCOO2MucbkiU",
        limit: 100,
      },
      winter: {
        name: "Season: Winter",
        id: "73aUH1Sv8w28usXnPLIjV7",
        limit: 100,
      },
      spring: {
        name: "Season: Spring",
        id: "4N97YkOZec45LFTPu7FT6e",
        limit: 100,
      },
    };

    const currentSeason = getCurrentSeason_(today, seasonPlaylists);
    const isSpookySeason = today.getMonth() === 9;
    const isFestiveSeason = today.getMonth() === 11;

    // Retrieve and prepare core tracks
    const memoryTracks = Cache.read("PoolofMemory");
    if (!memoryTracks) {
      console.error("updateFocusedWork_: memoryTracks is undefined");
      return false;
    }
    const savedAlbumTracks = await getRandomTracks_(
      Source.getSavedAlbumTracks(5),
      20
    );
    if (!savedAlbumTracks) {
      console.error("updateFocusedWork_: savedAlbumTracks is undefined");
      return false;
    }
    const topTracks = await Source.getPlaylistTracks(
      "Top Tracks (Last 3 months)",
      "6AyRqWJ3YzVQbYXQZjQZg5",
      "",
      10
    );
    if (topTracks === false) {
      console.error("updateFocusedWork_: topTracks is false");
    }
    const dailyTracks = await Source.getPlaylistTracks(
      "Discover Daily",
      "7aPZj5UPndnpHD7anj2AtU",
      "",
      10
    );
    if (dailyTracks === false) {
      console.error("updateFocusedWork_: dailyTracks is false");
    }

    // Compile seasonal and memory tracks
    const corePlaylists = [
      {
        name: "heard, liked, then forgotten",
        id: UserProperties.getProperty("HEARD_LIKED_FORGOTTEN_PLAYLIST_ID"),
        limit: 100,
      },
      { name: "happy", id: "04z4EQ0AC9a7cjtdcKnDpn", limit: 100 },
      { name: "gay", id: "4CHdd4KMQABX3inKKEiDMV", limit: 50 },
      {
        name: "Top Tracks (All Time)",
        id: "4YWHWAECe9R5nIxIUDlkAj",
        limit: 100,
      },
      currentSeason,
    ];

    let allTracks = memoryTracks.concat(
      savedAlbumTracks,
      ...(topTracks === false ? [] : [topTracks]), // Changed this line
      ...(dailyTracks === false ? [] : [dailyTracks]) // Changed this line
    );
    let combinedTracks = await getCombinedTracks_(corePlaylists, allTracks);
    if (!combinedTracks) {
      console.error("updateFocusedWork_: combinedTracks is undefined");
      return false;
    }
    combinedTracks = await filterTracks_(combinedTracks, {
      tempo: { min: 60, max: 120 },
    });
    if (!combinedTracks) {
      console.error("updateFocusedWork_: filterTracks_ returned undefined");
      return false;
    }
    combinedTracks = deduplicateTracks_(combinedTracks);
    if (!combinedTracks) {
      console.error(
        "updateFocusedWork_: deduplicateTracks_ returned undefined"
      );
      return false;
    }

    // Additional mixes and daily jams
    const additionalMixPlaylists = [
      {
        name: "Instrumental Soundtracks I dig",
        id: "5qqdXcHnly1RuBnpkZzueE",
        limit: 10,
      },
    ];

    let additionalMixTracks = await getCombinedTracks_(additionalMixPlaylists);
    if (!additionalMixTracks) {
      console.error("updateFocusedWork_: additionalMixTracks is undefined");
      return false;
    }
    additionalMixTracks = await getRandomTracks_(additionalMixTracks, 20);
    if (!additionalMixTracks) {
      console.error("updateFocusedWork_: additionalMixTracks is undefined");
      return false;
    }

    const dailyJams = await Source.getPlaylistTracks(
      "",
      "1zl8x9E1JxcwbA0InkkL39"
    );
    if (!dailyJams) {
      console.error("updateFocusedWork_: dailyJams is undefined");
      return false;
    }

    let focusedWorkTracks = await mixTracks_([
      additionalMixTracks,
      combinedTracks,
      dailyJams,
    ]);
    if (!focusedWorkTracks) {
      console.error("updateFocusedWork_: focusedWorkTracks is undefined");
      return false;
    }
    focusedWorkTracks = await Source.applySeasonalTracks(
      focusedWorkTracks,
      isSpookySeason,
      isFestiveSeason
    );
    if (!focusedWorkTracks) {
      console.error(
        "updateFocusedWork_: applySeasonalTracks returned undefined"
      );
      return false;
    }

    // Finalize tracks
    focusedWorkTracks = deduplicateTracks_(focusedWorkTracks);
    if (!focusedWorkTracks) {
      console.error(
        "updateFocusedWork_: deduplicateTracks_ returned undefined"
      );
      return false;
    }
    focusedWorkTracks = await filterOutBannedTracks_(focusedWorkTracks);
    if (!Array.isArray(focusedWorkTracks)) {
      console.error(
        "updateFocusedWork_: filterOutBannedTracks_ returned false"
      );
      return false;
    }
    Selector.keepFirst(focusedWorkTracks, 150);

    // Save to focused work playlist
    Playlist.saveWithReplace({
      id: "36lwTTY2kPm1YpgXQaGdOX",
      name: "focused work",
      tracks: focusedWorkTracks,
    });
    console.log("Finished updateFocusedWork_");
    return true;
  } catch (error) {
    console.error("Error in updateFocusedWork_:", error);
    return false;
  }
}

function deduplicateTracks_(tracks) {
  console.log("Starting deduplicateTracks_");
  try {
    if (!tracks) {
      console.error("deduplicateTracks_: tracks is undefined");
      return false;
    }
    Filter.dedupTracks(tracks);
    console.log("Finished deduplicateTracks_");
    return tracks;
  } catch (error) {
    console.error("Error in deduplicateTracks_:", error);
    return false;
  }
}

//Discover Weekly Archive and Daily Jams. Updates Daily.
// utils.gs.js (Improved updateArchives)

/**
 * Updates the Discover Weekly Archive and Daily Jams Archive playlists.
 * This function retrieves the current Discover Weekly and Daily Jams playlists,
 * removes saved tracks from them, combines them with their respective archive playlists,
 * deduplicates the combined playlists, and then saves the updated archive playlists.
 */
async function updateArchives() {
  console.log("Starting updateArchives");
  try {
    // Retrieve playlist IDs from UserProperties
    const discoverWeeklyArchiveId = UserProperties.getProperty(
      "DISCOVER_WEEKLY_ARCHIVE_ID"
    );
    const dailyJamsArchiveId = UserProperties.getProperty(
      "DAILY_JAMS_ARCHIVE_ID"
    );
    const dailyJamsId = UserProperties.getProperty("DAILY_JAMS_ID");

    // Check if playlist IDs are defined
    if (!discoverWeeklyArchiveId || !dailyJamsArchiveId || !dailyJamsId) {
      console.error(
        "updateArchives: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled to handle potential rejections
    const [
      savedTracksResult,
      archiveTracksResult,
      discoverweeklyTracksResult,
      dailyjamsExistingResult,
      dailyjamsResult,
    ] = await Promise.allSettled([
      Source.getSavedTracks(),
      Source.getPlaylistTracks(
        "Discover Weekly Archive",
        discoverWeeklyArchiveId
      ),
      Source.getPlaylistTracks("Discover Weekly", dailyJamsId),
      Source.getPlaylistTracks("Daily Jams Archive", dailyJamsArchiveId),
      Source.getPlaylistTracks("Daily Jams", "78CmSGx8iaHMxGwN9OknSv"), //hardcoded id
    ]);

    // Handle rejections and extract tracks
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];
    const archiveTracks =
      archiveTracksResult.status === "fulfilled"
        ? archiveTracksResult.value
        : [];
    const discoverweeklyTracks =
      discoverweeklyTracksResult.status === "fulfilled"
        ? discoverweeklyTracksResult.value
        : [];
    const dailyjamsExisting =
      dailyjamsExistingResult.status === "fulfilled"
        ? dailyjamsExistingResult.value
        : [];
    const dailyjams =
      dailyjamsResult.status === "fulfilled" ? dailyjamsResult.value : [];

    // Log any rejections
    [
      savedTracksResult,
      archiveTracksResult,
      discoverweeklyTracksResult,
      dailyjamsExistingResult,
      dailyjamsResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateArchives: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Filter out saved tracks from the Discover Weekly playlist.
    Filter.removeTracks(discoverweeklyTracks, savedTracks);

    // Combine the Discover Weekly playlist with the Discover Weekly Archive playlist.
    const discoverWeeklyArchiveTracks = Combiner.push(
      archiveTracks,
      discoverweeklyTracks
    );

    // Deduplicate the Discover Weekly Archive playlist.
    Filter.dedupTracks(discoverWeeklyArchiveTracks);

    // Save the Discover Weekly Archive playlist.
    await Playlist.saveWithUpdate({
      id: discoverWeeklyArchiveId,
      name: "Discover Weekly Archive",
      tracks: discoverWeeklyArchiveTracks,
    });
    console.log(
      `updateArchives: Updated Discover Weekly Archive with ${discoverWeeklyArchiveTracks.length} tracks.`
    );

    // Filter out saved tracks from the Daily Jams playlist.
    Filter.removeTracks(dailyjams, savedTracks);

    // Combine the Daily Jams playlist with the Daily Jams Archive playlist.
    const dailyjamsarchive = Combiner.push(dailyjamsExisting, dailyjams);

    // Deduplicate the Daily Jams Archive playlist.
    Filter.dedupTracks(dailyjamsarchive);

    // Save the Daily Jams Archive playlist.
    await Playlist.saveWithUpdate({
      id: dailyJamsArchiveId,
      name: "Daily Jams Archive",
      tracks: dailyjamsarchive,
    });
    console.log(
      `updateArchives: Updated Daily Jams Archive with ${dailyjamsarchive.length} tracks.`
    );

    console.log("Finished updateArchives");
    return true;
  } catch (error) {
    console.error("Error in updateArchives:", error);
    return false;
  }
}
// main.gs.js (Updated updateHottest100Shortlist)

// Update my Hottest 100 Shortlist. Updates on the 15th.
async function updateHottest100Shortlist() {
  console.log("Starting updateHottest100Shortlist");
  try {
    // Constants
    const PLAYLIST_ID =
      UserProperties.getProperty("HOTTEST_100_SHORTLIST_ID") ||
      "5Otvdwpoipe7o1lDOy4oFN"; // Added default ID and config retrieval
    const START_DATE = "2023-12-01"; // Changed to string format for consistency
    const END_DATE = "2024-11-30"; // Changed to string format for consistency
    const CURRENT_YEAR = new Date().getFullYear();

    // Fetch data asynchronously from various sources in parallel
    const [
      savedTracks,
      longTopTracks,
      mediumTopTracks,
      shortTopTracks,
      shortlistTracks,
    ] = await Promise.all([
      Cache.read("SavedTracks"),
      Source.getTopTracks("long"),
      Source.getTopTracks("medium"),
      Source.getTopTracks("short"),
      Source.getPlaylistTracks("Hottest 100 Shortlist", PLAYLIST_ID),
    ]);

    if (!savedTracks) {
      console.error("updateHottest100Shortlist: savedTracks is undefined");
      return false;
    }
    if (!longTopTracks) {
      console.error("updateHottest100Shortlist: longTopTracks is undefined");
      return false;
    }
    if (!mediumTopTracks) {
      console.error("updateHottest100Shortlist: mediumTopTracks is undefined");
      return false;
    }
    if (!shortTopTracks) {
      console.error("updateHottest100Shortlist: shortTopTracks is undefined");
      return false;
    }
    if (shortlistTracks === false) {
      console.error("updateHottest100Shortlist: shortlistTracks is false");
      return false;
    }

    // Combine all top tracks
    const topTracks = Combiner.push(
      longTopTracks,
      shortTopTracks,
      mediumTopTracks
    );

    // Filter top tracks to include only singles and albums released within the specified date range
    Filter.rangeTracks(topTracks, {
      album: {
        album_type: ["single", "album"],
        release_date: {
          startDate: new Date(START_DATE),
          endDate: new Date(END_DATE),
        },
      },
    });

    // Combine top tracks with shortlist tracks
    const hottest100tracks = Combiner.push(shortlistTracks, topTracks);

    // Remove saved tracks from the combined list
    Filter.removeTracks(hottest100tracks, savedTracks, true);

    // Deduplicate tracks
    Filter.dedupTracks(hottest100tracks);

    // Sort tracks by artist popularity in descending order
    Order.sort(hottest100tracks, "artist.popularity", "desc");

    // Save the updated playlist
    await Playlist.saveWithUpdate({
      id: PLAYLIST_ID,
      name: `Hottest 100 Shortlist ${CURRENT_YEAR}`, // Added year to playlist name
      tracks: hottest100tracks,
    });

    console.log(
      `updateHottest100Shortlist: Updated Hottest 100 Shortlist with ${hottest100tracks.length} tracks.`
    );
    console.log("Finished updateHottest100Shortlist");
    return true;
  } catch (error) {
    console.error("Error in updateHottest100Shortlist:", error);
    return false;
  }
}

// chill. Updates every Sunday
async function updateChill() {
  console.log("Starting updateChill");
  try {
    // Retrieve playlist IDs from UserProperties
    const chillPlaylistId = UserProperties.getProperty("CHILL_PLAYLIST_ID");
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    const danceablePlaylistId = UserProperties.getProperty(
      "DANCEABLE_PLAYLIST_ID"
    );
    const chillArchivePlaylistId = UserProperties.getProperty(
      "CHILL_ARCHIVE_PLAYLIST_ID"
    );
    const dadKindaMusicPlaylistId = UserProperties.getProperty(
      "DAD_KINDA_MUSIC_PLAYLIST_ID"
    );

    // Check if playlist IDs are defined
    if (
      !chillPlaylistId ||
      !bannedPlaylistId ||
      !danceablePlaylistId ||
      !chillArchivePlaylistId ||
      !dadKindaMusicPlaylistId
    ) {
      console.error(
        "updateChill: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      savedTracksResult,
      savedAlbumsResult,
      otherTracksResult,
      bannedTracksResult,
      danceableTracksResult,
      chillArchiveResult,
    ] = await Promise.allSettled([
      Source.getSavedTracks(500),
      Source.getSavedAlbumTracks(5),
      Source.getPlaylistTracks("Dad Kinda Music", dadKindaMusicPlaylistId),
      Source.getPlaylistTracks("banned", bannedPlaylistId),
      Source.getPlaylistTracks("danceable", danceablePlaylistId),
      Source.getPlaylistTracks("chill archive", chillArchivePlaylistId),
    ]);

    // Handle rejections and extract tracks
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];
    const savedAlbums =
      savedAlbumsResult.status === "fulfilled" ? savedAlbumsResult.value : [];
    const otherTracks =
      otherTracksResult.status === "fulfilled" ? otherTracksResult.value : [];
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];
    const danceableTracks =
      danceableTracksResult.status === "fulfilled"
        ? danceableTracksResult.value
        : [];
    const chillArchive =
      chillArchiveResult.status === "fulfilled" ? chillArchiveResult.value : [];

    // Log any rejections
    [
      savedTracksResult,
      savedAlbumsResult,
      otherTracksResult,
      bannedTracksResult,
      danceableTracksResult,
      chillArchiveResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateChill: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Combine all tracks.
    const allTracks = Combiner.push(
      savedTracks,
      savedAlbums,
      otherTracks,
      chillArchive
    );

    // Filter out danceable and banned tracks.
    Filter.removeTracks(
      allTracks,
      Combiner.push(danceableTracks, bannedTracks)
    );

    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);

    // Sort the tracks by energy in ascending order.
    Order.sort(allTracks, "features.energy", "asc");

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: chillPlaylistId,
      name: "chill",
      tracks: allTracks,
    });
    console.log(`updateChill: Updated chill with ${allTracks.length} tracks.`);

    console.log("Finished updateChill");
    return true;
  } catch (error) {
    console.error("Error in updateChill:", error);
    return false;
  }
}

// danceable. Updates every Friday
async function updateDanceable() {
  console.log("Starting updateDanceable");
  try {
    // Retrieve playlist IDs from UserProperties
    const danceablePlaylistId = UserProperties.getProperty(
      "DANCEABLE_PLAYLIST_ID"
    );
    const happyPlaylistId = UserProperties.getProperty("HAPPY_PLAYLIST_ID");
    const danceArchivePlaylistId = UserProperties.getProperty(
      "DANCE_ARCHIVE_PLAYLIST_ID"
    );

    // Check if playlist IDs are defined
    if (!danceablePlaylistId || !happyPlaylistId || !danceArchivePlaylistId) {
      console.error(
        "updateDanceable: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      happyTracksResult,
      savedTracksResult,
      savedAlbumsResult,
      danceArchiveResult,
    ] = await Promise.allSettled([
      Source.getPlaylistTracks("happy", happyPlaylistId),
      Cache.read("SavedTracks"),
      Source.getSavedAlbumTracks(5),
      Source.getPlaylistTracks("dance archive", danceArchivePlaylistId),
    ]);

    // Handle rejections and extract tracks
    const happyTracks =
      happyTracksResult.status === "fulfilled" ? happyTracksResult.value : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];
    const savedAlbums =
      savedAlbumsResult.status === "fulfilled" ? savedAlbumsResult.value : [];
    const danceArchive =
      danceArchiveResult.status === "fulfilled" ? danceArchiveResult.value : [];

    // Log any rejections
    [
      happyTracksResult,
      savedTracksResult,
      savedAlbumsResult,
      danceArchiveResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateDanceable: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Combine all tracks.
    const allTracks = Combiner.push(
      danceArchive,
      savedTracks,
      savedAlbums,
      happyTracks
    );

    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);

    // Sort the tracks by tempo in ascending order.
    Order.sort(allTracks, "features.tempo", "asc");

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: danceablePlaylistId,
      name: "danceable",
      tracks: allTracks,
    });
    console.log(
      `updateDanceable: Updated danceable with ${allTracks.length} tracks.`
    );

    console.log("Finished updateDanceable");
    return true;
  } catch (error) {
    console.error("Error in updateDanceable:", error);
    return false;
  }
}

// high energy. Updates every Saturday
async function updateHighEnergy() {
  console.log("Starting updateHighEnergy");
  try {
    // Retrieve playlist IDs from UserProperties
    const danceArchivePlaylistId = UserProperties.getProperty(
      "DANCE_ARCHIVE_PLAYLIST_ID"
    );
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");

    // Check if playlist IDs are defined
    if (!danceArchivePlaylistId || !bannedPlaylistId) {
      console.error(
        "updateHighEnergy: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      danceArchiveResult,
      savedTracksResult,
      savedAlbumsResult,
      bannedTracksResult,
    ] = await Promise.allSettled([
      Source.getPlaylistTracks("dance archive", danceArchivePlaylistId),
      Cache.read("SavedTracks"),
      Source.getSavedAlbumTracks(5),
      Source.getPlaylistTracks("banned", bannedPlaylistId),
    ]);

    // Handle rejections and extract tracks
    const danceArchive =
      danceArchiveResult.status === "fulfilled" ? danceArchiveResult.value : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];
    const savedAlbums =
      savedAlbumsResult.status === "fulfilled" ? savedAlbumsResult.value : [];
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];

    // Log any rejections
    [
      danceArchiveResult,
      savedTracksResult,
      savedAlbumsResult,
      bannedTracksResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateHighEnergy: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Combine all tracks.
    const allTracks = Combiner.push(danceArchive, savedTracks, savedAlbums);

    // Filter out banned tracks.
    Filter.removeTracks(allTracks, bannedTracks);

    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);

    // Sort the tracks by tempo in ascending order.
    Order.sort(allTracks, "features.tempo", "asc");

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: "7hE7I816kRsniDpo1sjQXz",
      name: "high energy",
      tracks: allTracks,
    });
    console.log(
      `updateHighEnergy: Updated high energy with ${allTracks.length} tracks.`
    );

    console.log("Finished updateHighEnergy");
    return true;
  } catch (error) {
    console.error("Error in updateHighEnergy:", error);
    return false;
  }
}

// happy. Updates every Wednesday
async function updateHappyMix() {
  console.log("Starting updateHappyMix");
  try {
    // Retrieve playlist IDs from UserProperties
    const moodyPlaylistId = UserProperties.getProperty("MOODY_PLAYLIST_ID");
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    const happyArchivePlaylistId = UserProperties.getProperty(
      "HAPPY_ARCHIVE_PLAYLIST_ID"
    );

    // Check if playlist IDs are defined
    if (!moodyPlaylistId || !bannedPlaylistId || !happyArchivePlaylistId) {
      console.error(
        "updateHappyMix: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      moodyTracksResult,
      bannedTracksResult,
      happyArchiveResult,
      savedTracksResult,
    ] = await Promise.allSettled([
      Source.getPlaylistTracks("moody", moodyPlaylistId),
      Source.getPlaylistTracks("banned", bannedPlaylistId),
      Source.getPlaylistTracks("happy archive", happyArchivePlaylistId),
      Cache.read("SavedTracks"),
    ]);

    // Handle rejections and extract tracks
    const moodyTracks =
      moodyTracksResult.status === "fulfilled" ? moodyTracksResult.value : [];
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];
    const happyArchive =
      happyArchiveResult.status === "fulfilled" ? happyArchiveResult.value : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];

    // Log any rejections
    [
      moodyTracksResult,
      bannedTracksResult,
      happyArchiveResult,
      savedTracksResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateHappyMix: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

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
    const allTracks = Combiner.push(savedTracks, happyArchive);

    // Filter out moody and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(moodyTracks, bannedTracks));

    // Alternate the happy tracks with the happy archive.
    const tracks = Combiner.alternate("max", allTracks, happyArchive);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);

    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: "04z4EQ0AC9a7cjtdcKnDpn",
      name: "happy",
      tracks: tracks,
    });
    console.log(`updateHappyMix: Updated happy with ${tracks.length} tracks.`);

    console.log("Finished updateHappyMix");
    return true;
  } catch (error) {
    console.error("Error in updateHappyMix:", error);
    return false;
  }
}

// moody.  Updates every Thursday
async function updateMoodyMix() {
  console.log("Starting updateMoodyMix");
  try {
    // Retrieve playlist IDs from UserProperties
    const happyPlaylistId = UserProperties.getProperty("HAPPY_PLAYLIST_ID");
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    const moodyArchivePlaylistId = UserProperties.getProperty(
      "MOODY_ARCHIVE_PLAYLIST_ID"
    );

    // Check if playlist IDs are defined
    if (!happyPlaylistId || !bannedPlaylistId || !moodyArchivePlaylistId) {
      console.error(
        "updateMoodyMix: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      happyTracksResult,
      bannedTracksResult,
      moodyArchiveResult,
      savedTracksResult,
    ] = await Promise.allSettled([
      Source.getPlaylistTracks("happy", happyPlaylistId),
      Source.getPlaylistTracks("banned", bannedPlaylistId),
      Source.getPlaylistTracks("moody archive", moodyArchivePlaylistId),
      Cache.read("SavedTracks"),
    ]);

    // Handle rejections and extract tracks
    const happyTracks =
      happyTracksResult.status === "fulfilled" ? happyTracksResult.value : [];
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];
    const moodyArchive =
      moodyArchiveResult.status === "fulfilled" ? moodyArchiveResult.value : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];

    // Log any rejections
    [
      happyTracksResult,
      bannedTracksResult,
      moodyArchiveResult,
      savedTracksResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateMoodyMix: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Filter the saved tracks to only include moody tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.0, max: 0.3 },
        anger: { min: 0.3, max: 1.0 },
        happiness: { min: 0.0, max: 0.3 },
        sadness: { min: 0.5, max: 1.0 },
      },
    });

    // Combine all of the moody tracks.
    const allTracks = Combiner.push(savedTracks, moodyArchive);

    // Filter out happy and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(happyTracks, bannedTracks));

    // Combine the moody tracks with the moody archive.
    const tracks = Combiner.push(allTracks, moodyArchive);

    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: "70kt2ckF3xi5OjhbgJpoKF",
      name: "moody",
      tracks: tracks,
    });
    console.log(`updateMoodyMix: Updated moody with ${tracks.length} tracks.`);

    console.log("Finished updateMoodyMix");
    return true;
  } catch (error) {
    console.error("Error in updateMoodyMix:", error);
    return false;
  }
}

// romantic. Updates every Saturday
async function updateRomanticMix() {
  console.log("Starting updateRomanticMix");
  try {
    // Retrieve playlist IDs from UserProperties
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");
    const romanticArchivePlaylistId = UserProperties.getProperty(
      "ROMANTIC_ARCHIVE_PLAYLIST_ID"
    );

    // Check if playlist IDs are defined
    if (!bannedPlaylistId || !romanticArchivePlaylistId) {
      console.error(
        "updateRomanticMix: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [bannedTracksResult, romanticArchiveResult, savedTracksResult] =
      await Promise.allSettled([
        Source.getPlaylistTracks("banned", bannedPlaylistId),
        Source.getPlaylistTracks("romantic archive", romanticArchivePlaylistId),
        Cache.read("SavedTracks"),
      ]);

    // Handle rejections and extract tracks
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];
    const romanticArchive =
      romanticArchiveResult.status === "fulfilled"
        ? romanticArchiveResult.value
        : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];

    // Log any rejections
    [bannedTracksResult, romanticArchiveResult, savedTracksResult].forEach(
      (result, index) => {
        if (result.status === "rejected") {
          console.error(
            `updateRomanticMix: Error fetching tracks (index ${index}):`,
            result.reason
          );
        }
      }
    );

    // Filter the saved tracks to only include romantic tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.5, max: 1.0 },
        energy: { min: 0.2, max: 0.7 },
        danceability: { min: 0.3, max: 0.8 },
      },
    });

    // Combine all of the romantic tracks.
    const allTracks = Combiner.push(savedTracks, romanticArchive);

    // Filter out banned tracks.
    Filter.removeTracks(allTracks, bannedTracks);

    // Deduplicate the tracks.
    Filter.dedupTracks(allTracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(allTracks, 100);

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: "5fiEC1THLqYh1DJHV8mleq",
      name: "romantic",
      tracks: allTracks,
    });
    console.log(
      `updateRomanticMix: Updated romantic with ${allTracks.length} tracks.`
    );

    console.log("Finished updateRomanticMix");
    return true;
  } catch (error) {
    console.error("Error in updateRomanticMix:", error);
    return false;
  }
}

// sad.  Updates every Thursday
async function updateSadMix() {
  console.log("Starting updateSadMix");
  try {
    // Retrieve playlist IDs from UserProperties
    const sadArchivePlaylistId = UserProperties.getProperty(
      "SAD_ARCHIVE_PLAYLIST_ID"
    );
    const happyPlaylistId = UserProperties.getProperty("HAPPY_PLAYLIST_ID");
    const bannedPlaylistId = UserProperties.getProperty("BANNED_PLAYLIST_ID");

    // Check if playlist IDs are defined
    if (!sadArchivePlaylistId || !happyPlaylistId || !bannedPlaylistId) {
      console.error(
        "updateSadMix: One or more playlist IDs are undefined in UserProperties."
      );
      return false;
    }

    // Get all tracks in parallel using Promise.allSettled
    const [
      sadArchiveResult,
      happyTracksResult,
      bannedTracksResult,
      savedTracksResult,
    ] = await Promise.allSettled([
      Source.getPlaylistTracks("", sadArchivePlaylistId),
      Source.getPlaylistTracks("happy", happyPlaylistId),
      Source.getPlaylistTracks("banned", bannedPlaylistId),
      Cache.read("SavedTracks"),
    ]);

    // Handle rejections and extract tracks
    const sadArchive =
      sadArchiveResult.status === "fulfilled" ? sadArchiveResult.value : [];
    const happyTracks =
      happyTracksResult.status === "fulfilled" ? happyTracksResult.value : [];
    const bannedTracks =
      bannedTracksResult.status === "fulfilled" ? bannedTracksResult.value : [];
    const savedTracks =
      savedTracksResult.status === "fulfilled" ? savedTracksResult.value : [];

    // Log any rejections
    [
      sadArchiveResult,
      happyTracksResult,
      bannedTracksResult,
      savedTracksResult,
    ].forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          `updateSadMix: Error fetching tracks (index ${index}):`,
          result.reason
        );
      }
    });

    // Filter the saved tracks to only include sad tracks.
    Filter.rangeTracks(savedTracks, {
      features: {
        valence: { min: 0.0, max: 0.4 },
        happiness: { min: 0.0, max: 0.4 },
        sadness: { min: 0.5, max: 1.0 },
      },
    });

    // Combine all of the sad tracks.
    const allTracks = Combiner.push(savedTracks);

    // Filter out happy and banned tracks.
    Filter.removeTracks(allTracks, Combiner.push(happyTracks, bannedTracks));

    // Combine the sad tracks with the sad archive.
    const tracks = Combiner.push(allTracks, sadArchive);

    // Deduplicate the tracks.
    Filter.dedupTracks(tracks);

    // Keep a random sample of 100 tracks.
    Selector.keepRandom(tracks, 100);

    // Save the playlist.
    await Playlist.saveWithReplace({
      id: "2UIGoKlpYbwpdTTVdwXKcr",
      name: "SAD 😥",
      tracks: tracks,
    });
    console.log(`updateSadMix: Updated SAD 😥 with ${tracks.length} tracks.`);

    console.log("Finished updateSadMix");
    return true;
  } catch (error) {
    console.error("Error in updateSadMix:", error);
    return false;
  }
}
