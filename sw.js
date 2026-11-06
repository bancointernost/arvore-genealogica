/* Árvore Genealógica — service worker
   - página: busca sempre a versão nova na internet; sem internet, abre a última guardada
   - dados da família (Firebase) NÃO passam por aqui: continuam sempre online */
var VERSAO = 'arvore-v22';
var BASICO = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', function(e){
  e.waitUntil(caches.open(VERSAO).then(function(c){ return c.addAll(BASICO); }).catch(function(){}));
});
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(ks){
    return Promise.all(ks.filter(function(k){ return k !== VERSAO; }).map(function(k){ return caches.delete(k); }));
  }).then(function(){ return self.clients.claim(); }));
});
self.addEventListener('message', function(e){ if(e.data === 'pular') self.skipWaiting(); });
self.addEventListener('fetch', function(e){
  var req = e.request, url = new URL(req.url);
  if(req.method !== 'GET' || url.origin !== self.location.origin) return;
  if(req.mode === 'navigate'){
    e.respondWith(fetch(req).then(function(r){
      var copy = r.clone(); caches.open(VERSAO).then(function(c){ c.put('./index.html', copy); }); return r;
    }).catch(function(){ return caches.match('./index.html'); }));
    return;
  }
  e.respondWith(caches.match(req).then(function(hit){
    var net = fetch(req).then(function(r){ if(r.ok){ var copy = r.clone(); caches.open(VERSAO).then(function(c){ c.put(req, copy); }); } return r; });
    return hit || net;
  }));
});
