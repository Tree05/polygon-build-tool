const staticCacheName = "site-static-v7";
const dynamicCacheName = "site-dynamic-v6";
const CACHE_LIMIT = 15;
const assets = [
    "./",
    "./index.html",
    "./scripts/main.js",
    // "./scripts/desmos-api.js",
    "./styles.css",
    "./icons/thumbnail-512.png",
    "https://www.desmos.com/api/v1.7/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6",
];

console.log("hi");

// cache size limit function
const limitCacheSize = (name, size) => {
    caches.open(name).then((cache) => {
        cache.keys().then((keys) => {
            if (keys.length > size) {
                cache.delete(keys[0]).then(limitCacheSize(name, size));
            }
        });
    });
};

// install service worker
self.addEventListener("install", (event) => {
    console.log("service worker has been installed");

    event.waitUntil(
        caches
            .open(staticCacheName)
            .then((cache) => {
                console.log("chaching all assets");
                cache
                    .addAll(assets)
                    .then((a) => console.log(a))
                    .catch((error) => console.error(error));
            })
            .catch((error) => console.error(error))
    );
});

// activate event
self.addEventListener("activate", (event) => {
    console.log("service worker has been activated");

    event.waitUntil(
        caches.keys().then((keys) => {
            //console.log(keys);
            return Promise.all(
                keys
                    .filter((key) => key !== staticCacheName && key !== dynamicCacheName)
                    .map((key) => caches.delete(key))
            );
        })
    );
});
// aaaaa

// fetch event
self.addEventListener("fetch", (event) => {
    // console.log("fetch event", event);

    event.respondWith(
        caches
            .match(event.request)
            .then((cacheRes) => {
                console.log(cacheRes);
                return (
                    cacheRes ||
                    fetch(event.request).then(async (fetchRes) => {
                        const cache = await caches.open(dynamicCacheName);
                        cache.put(event.request.url, fetchRes.clone());
                        // check cached items size
                        limitCacheSize(dynamicCacheName, CACHE_LIMIT);
                        return fetchRes;
                    })
                );
            })
            .catch(() => {
                if (event.request.url.indexOf(".html") > -1) {
                    return caches.match("/pages/fallback.html");
                }
            })
    );
});
