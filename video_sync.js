//Based on: https://labelstud.io/guide/ts+video.html.
function updateVideoSync(v, r, t) {
  //v is the video object.    
  //r is an array with two elements descriping the timeSeries selection start & end: [start,end].    
  var sTrim = parseInt(document.getElementsByName('videoStart')[0].value) / 1000;
  var eTrim = parseInt(document.getElementsByName('videoEnd')[0].value) / 1000;
  var videoSyncChoice = document.getElementById('videoSyncChoice');
  var trimmedDuration = v.duration - (sTrim + eTrim);
  var tsPointFactor = 1;
  switch (videoSyncChoice.value) {
    case "end":
      tsPointFactor = (r()[1] - t[0]) / (t.slice(-1)[0] - t[0]); break;
    case "midpoint":
      tsPointFactor = ((r()[0] / 2 + r()[1] / 2) - t[0]) / (t.slice(-1)[0] - t[0]); break;
    default:
      //start:
      tsPointFactor = (r()[0] - t[0]) / (t.slice(-1)[0] - t[0]);
  }
  v.currentTime = sTrim + trimmedDuration * tsPointFactor
}
function onVideoSyncChoice() {
  updateVideoSync(v, r, t);
}
setTimeout(function () {
  //the videoSyncChoice element is used as singleton to ensure tht script is only run once!.    
  var videoSyncChoice = document.getElementById('videoSyncChoice');
  if (videoSyncChoice === null) {
    v = document.getElementsByTagName('video')[0];
    //setup video sync for modifications to the video trim parameters:
    document.getElementsByName('videoStart')[0].onchange = function () { v.currentTime = parseInt(document.getElementsByName('videoStart')[0].value) / 1000; };
    document.getElementsByName('videoEnd')[0].onchange = function () { v.currentTime = v.duration - parseInt(document.getElementsByName('videoEnd')[0].value) / 1000; };
    //create and Insert the sync choice element after the video.       
    videoSyncChoice = document.createElement('select');
    videoSyncChoice.id = "videoSyncChoice";
    videoSyncChoice.onchange = onVideoSyncChoice;
    videoSyncChoice.innerHTML = '<option value="start">Sync Video to selection range start</option><option value="midpoint">Sync Video to selection range mid point</option><option value="end">Sync Video to selection range end</option>'
    v.parentElement.appendChild(videoSyncChoice);
  }
  //Setup the sync with the timeline selection:
  ts = Htx.annotationStore.selected.names.get('ts');
  t = ts.data.ms;
  w = parseInt(t.length * (5 / v.duration));
  l = t.length - w;
  ts.updateTR([t[0], t[w]], 1.001);
  r = $ => ts.brushRange.map(n => (+n).toFixed(2));
  _ = r();
  updateVideoSync(v, r, t);
  setInterval($ => r().some((n, i) => n !== _[i]) && (_ = r()) && (updateVideoSync(v, r, t)), 300);
  console.log('video is loaded, starting to sync with time series');
}, 2000);
