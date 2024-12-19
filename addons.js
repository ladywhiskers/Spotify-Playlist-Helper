//everynoise
const Release = (function () {
    const URL_BASE = 'http://everynoise.com/new_releases_by_genre.cgi';
    return {
        getTracks: getTracks,
    };

    function getTracks(params) {
        return getAlbums(params).reduce((tracks, album) => {
            return Combiner.push(tracks, album.tracks.items);
        }, []);
    }

    function getAlbums(params) {
        params.date = params.date ? params.date.replace(/-/g, '') : '';
        params.region = params.region || 'AU';
        params.type = params.type || 'album,single';

        let template = `%s?genre=%s&region=%s&date=%s&hidedupes=on`;
        let url = Utilities.formatString(template, URL_BASE, params.genre, params.region, params.date);

        let albumIds = parseAlbumIds(url, params.genre);
        let albums = SpotifyRequest.getFullObjByIds('albums', albumIds, 20);
        return albums.filter((album) => params.type.includes(album.album_type));
    }

    function parseAlbumIds(url, genre) {
        let albumsIds = [];
        let cheerio = createCherio(url);
        let rootId = genre.replace(/[- ]/g, '');
        let root = cheerio(`#${rootId}`).next();
        cheerio('.albumbox', '', root).each((index, node) => {
            let uri = cheerio('a[href^="spotify:album:"]', '', node).attr('href');
            let id = uri.split(':')[2];
            albumsIds.push(id);
        });
        return albumsIds;
    }

    function createCherio(url) {
        let content = CustomUrlFetchApp.fetch(url).getContentText();
        return Cheerio.load(content);
    }
})();

//web interface
//https://github.com/Chimildic/goofy/discussions/9

 const  Helper  =  ( function  ( )  { 
  return  { 
    parseId : parseId , 
  } ;

  function parseId(string) {
    let pattern = '[open.spotify.com|spotify]+[\/|:](track|playlist|album|artist|show|episode|concert|user)[\/|:]([^?/#& ]+)';
    let [fullMatch, type, id] = string.match(new RegExp(pattern, 'i')) || [];
    return id;
  }
})();
function checkCurPlaying(values) {
  let content = '';
  let playback = {};

  if (values.text.trackURI.length != 0) {
    playback.item = SpotifyRequest.getFullObjByIds('tracks', [Helper.parseId(values.text.trackURI)], 50)[0];
  } else {
    playback = RecentTracks.getPlayback(); 
      if  ( playback . isEmpty ( ) )  { 
         content  =  'There is no playing track and no link to the track of interest has been inserted' ; 
         return  content ; 
      } 
  }
    
  let playlists = [];
    
  Playlist.getPlaylistArray().forEach(p => {if (p.owner.id == User.id) {
    let tracks = Source.getPlaylistTracks('', p.id);
    let tracksMap = tracks.map((item) => item.id);
    if (tracksMap.includes(playback.item.id)) {
      playlists.push(tracks[0].origin.name);
    }
  }
 });

if  ( playlists . length  ==  0 )  { 
  content  =  '\n'  +  '🎵'  +  ` ${ playback . item . artists [ 0 ] . name } - ${ playback . item . name } `  +  '🎵' +  ' MISSING from playlists:' ; 
}  else  { 
  content  =  '\n'  +  '🎵'  +  ` ${playback.item.artists[0].name} - ${playback.item.name}` + '🎵'+ ' есть в плейлистах:' + '\n' + playlists.map((item) => item).join('***');
}

return  content ; 
}
// ver 0.1
const OpenOpus = (function () {
  // https://wiki.openopus.org/wiki/Using_the_Open_Opus_API

  const BaseUrl = 'https://api.openopus.org'

  function post(path, payload) {
    return CustomUrlFetchApp.fetch(url(path), {
      method: 'post',
      payload: payload
    })
  }

  function url(path) {
    return BaseUrl + path
  }

  return {
    Works: {
      getListRandomWorks(payload) {
        return post('/dyn/work/random', payload)
      },
    },
  }
})()