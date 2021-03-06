var express = require('express');
var router = express.Router();
var Stream = require('node-rtsp-stream');

var streamObj = new Stream({
  name: 'name',
  streamUrl: 'rtsp://nextk.synology.me/vod/fa_test',
  wsPort: 9999,
  ffmpegOptions: { // options ffmpeg flags
    '-stats': '', // an option with no neccessary value uses a blank string
    '-r': 30 // options with required values specify the value after the key
  }
});

streamObj.on('exitWithError', () => {
  streamObj.stop();
});


/* GET home page. */
router.get('/', function(req, res, next) {
  streamObj.startMpeg1Stream();
  res.render('index', { title: 'RTSP Stream Demo' });
});

/*router.get('/playStream', function(req, res, next) {
  var streamObj = new Stream({
    name: 'name',
    streamUrl: 'rtsp://nextk.synology.me/vod/fa_test',
    wsPort: 9999,
    ffmpegOptions: { // options ffmpeg flags
      '-stats': '', // an option with no neccessary value uses a blank string
      '-r': 30 // options with required values specify the value after the key
    }
  });
  
  streamObj.on('exitWithError', () => {
    streamObj.stop();
  });
  
  res.write('OK');
});*/

module.exports = router;
