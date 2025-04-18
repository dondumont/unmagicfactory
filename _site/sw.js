const version = '20250409221652';
const cacheName = `static::${version}`;

const buildContentBlob = () => {
  return ["/swig-n'-sealed/2025/01/29/SNS40.html","/swig-n'-sealed/2025/01/29/SNS39.html","/swig-n'-sealed/2024/11/06/SNS38.html","/swig-n'-sealed/2024/07/25/SNS37.html","/swig-n'-sealed/2024/07/25/SNS36.html","/swig-n'-sealed/2024/01/15/SNS35.html","/swig-n'-sealed/2024/01/15/SNS34.html","/swig-n'-sealed/2023/10/19/SNS33.html","/swig-n'-sealed/2023/07/26/SNS32.html","/swig-n'-sealed/2023/07/26/SNS31.html","/about/","/calendar/","/discord/","/feed.xml","/css/main.css","/patreon/","/posts/","/assets/styles.css","/subscribe/","/manifest.json","/assets/search.json","/redirects.json","/sitemap.xml","/robots.txt","/index.html","/page/2/index.html","/page/3/index.html","/page/4/index.html","/page/5/index.html","/page/6/index.html","/css/main.css.map","/assets/styles.css.map","/assets/logo.svg", "/assets/default-offline-image.png", "/assets/scripts/fetch.js"
  ]
}

const updateStaticCache = () => {
  return caches.open(cacheName).then(cache => {
    return cache.addAll(buildContentBlob());
  });
};

const clearOldCache = () => {
  return caches.keys().then(keys => {
    // Remove caches whose name is no longer valid.
    return Promise.all(
      keys
        .filter(key => {
          return key !== cacheName;
        })
        .map(key => {
          console.log(`Service Worker: removing cache ${key}`);
          return caches.delete(key);
        })
    );
  });
};

self.addEventListener("install", event => {
  event.waitUntil(
    updateStaticCache().then(() => {
      console.log(`Service Worker: cache updated to version: ${cacheName}`);
    })
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(clearOldCache());
});

self.addEventListener("fetch", event => {
  let request = event.request;
  let url = new URL(request.url);

  // Only deal with requests from the same domain.
  if (url.origin !== location.origin) {
    return;
  }

  // Always fetch non-GET requests from the network.
  if (request.method !== "GET") {
    event.respondWith(fetch(request));
    return;
  }

  // Default url returned if page isn't cached
  let offlineAsset = "/offline/";

  if (request.url.match(/\.(jpe?g|png|gif|svg)$/)) {
    // If url requested is an image and isn't cached, return default offline image
    offlineAsset = "/assets/default-offline-image.png";
  }

  // For all urls request image from network, then fallback to cache, then fallback to offline page
  event.respondWith(
    fetch(request).catch(async () => {
      return (await caches.match(request)) || caches.match(offlineAsset);
    })
  );
  return;
});
