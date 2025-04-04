self.addEventListener('install', (event) => {
    console.log("Service Worker Installed");
});

self.addEventListener('activate', (event) => {
    console.log("Service Worker Activated");
});

self.addEventListener('fetch', (event) => {
    // YouTubeへのアクセスを監視
    const url = new URL(event.request.url);

    if (url.hostname.includes('youtube.com')) {
        // ローカルストレージを参照してタスクの進行状況を確認
        event.respondWith(
            caches.match(event.request).then((response) => {
                // タスクが完了していない場合、Googleにリダイレクト
                if (!localStorage.getItem('tasks') || !JSON.parse(localStorage.getItem('tasks')).every(task => task.checked)) {
                    return Response.redirect('https://www.google.com');
                }
                return response || fetch(event.request);
            })
        );
    } else {
        event.respondWith(fetch(event.request));
    }
});
