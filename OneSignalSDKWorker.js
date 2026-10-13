/* First Due Fitness service worker.
 *
 * 1) OneSignal's push worker (v16). This line has to stay first.
 * 2) A small offline cache: the app shell, icons and workout-card images are
 *    kept on the device so a Wi-Fi hiccup (or a slow TV connection) doesn't
 *    blank the screen mid-workout.
 */
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

var SHELL_CACHE = "fdf-shell-v24";   // bump this to force a fresh app shell
var IMG_CACHE = "fdf-img-v1";        // card + icon images, kept across versions
var SCOPE_URL = new URL("./", self.location.href);
var SHELL_FILES = [
  "index.html",
  "manifest.json",
  "card-timers.json",
  "icons/icon-32.png",
  "icons/icon-180.png",
  "icons/icon-512.png"
];
var NAV_TIMEOUT_MS = 4000;
var JSON_TIMEOUT_MS = 3000;

function abs(path){ return new URL(path, SCOPE_URL).href; }

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(SHELL_CACHE).then(function(cache){
      return Promise.all(SHELL_FILES.map(function(f){
        // "reload" skips the browser's HTTP cache so we store the latest copy.
        return fetch(new Request(abs(f), { cache: "reload" }))
          .then(function(r){ if(r && r.ok) return cache.put(abs(f), r); })
          .catch(function(){});
      }));
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys
        .filter(function(k){ return k.indexOf("fdf-") === 0 && k !== SHELL_CACHE && k !== IMG_CACHE; })
        .map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

// Pages and card-timers.json: try the network first so edits show up straight
// away, but if it is slow (a laggy TV) or down, fall back to the saved copy.
function networkFirst(request, cacheName, key, timeoutMs){
  return caches.open(cacheName).then(function(cache){
    return new Promise(function(resolve){
      var settled = false;
      function settle(resp){ if(!settled && resp){ settled = true; resolve(resp); } }
      var timer = setTimeout(function(){
        cache.match(key).then(settle);   // slow network: serve the saved copy
      }, timeoutMs);
      fetch(request).then(function(resp){
        clearTimeout(timer);
        if(resp && resp.ok) cache.put(key, resp.clone());
        settle(resp);
      }).catch(function(){
        clearTimeout(timer);
        cache.match(key).then(function(hit){ settle(hit || Response.error()); });
      });
    });
  });
}

// Images and the manifest: show the saved copy instantly, refresh it quietly.
function staleWhileRevalidate(event, cacheName){
  return caches.open(cacheName).then(function(cache){
    return cache.match(event.request).then(function(cached){
      var network = fetch(event.request).then(function(resp){
        if(resp && resp.ok) cache.put(event.request, resp.clone());
        return resp;
      }).catch(function(){ return null; });
      if(cached){
        event.waitUntil(network);
        return cached;
      }
      return network.then(function(resp){ return resp || Response.error(); });
    });
  });
}

self.addEventListener("fetch", function(event){
  var req = event.request;
  if(req.method !== "GET") return;
  var url = new URL(req.url);
  if(url.origin !== self.location.origin) return;                 // GitHub API, CDNs: leave alone
  if(url.pathname.indexOf(SCOPE_URL.pathname) !== 0) return;      // outside this app
  if(/OneSignalSDK/i.test(url.pathname)) return;                  // never touch the push worker

  if(req.mode === "navigate"){
    event.respondWith(networkFirst(req, SHELL_CACHE, abs("index.html"), NAV_TIMEOUT_MS));
    return;
  }
  var rel = url.pathname.slice(SCOPE_URL.pathname.length);
  if(rel.indexOf("cards/") === 0 || rel.indexOf("icons/") === 0){
    event.respondWith(staleWhileRevalidate(event, IMG_CACHE));
  } else if(rel === "manifest.json"){
    event.respondWith(staleWhileRevalidate(event, SHELL_CACHE));
  } else if(rel === "card-timers.json"){
    event.respondWith(networkFirst(req, SHELL_CACHE, url.origin + url.pathname, JSON_TIMEOUT_MS));
  }
});

// The page sends the current card + thumbnail URLs; download any we don't have
// yet (one at a time, so it never hogs the connection) and drop deleted ones.
function precacheCards(urls){
  return caches.open(IMG_CACHE).then(function(cache){
    var wanted = {};
    var chain = Promise.resolve();
    urls.forEach(function(u){
      var full = new URL(u, self.location.href).href;
      wanted[full] = true;
      chain = chain.then(function(){
        return cache.match(full).then(function(hit){
          if(hit) return;
          return fetch(full)
            .then(function(r){ if(r && r.ok) return cache.put(full, r); })
            .catch(function(){});
        });
      });
    });
    return chain.then(function(){
      return cache.keys().then(function(reqs){
        return Promise.all(reqs.filter(function(r){
          var u = new URL(r.url);
          return u.pathname.indexOf(SCOPE_URL.pathname + "cards/") === 0 &&
                 !wanted[u.origin + u.pathname];
        }).map(function(r){ return cache.delete(r); }));
      });
    });
  });
}

self.addEventListener("message", function(event){
  var d = event.data;
  if(!d || d.type !== "precache-cards" || !Array.isArray(d.urls)) return;
  event.waitUntil(precacheCards(d.urls));
});
