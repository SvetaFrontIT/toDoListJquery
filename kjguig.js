const albumsList = $('.js-album-list');
const gallery = $('.js-gallery');

//LOGIC
function getAlbums() {
    const request = sendAlbumsRequest();
    request.then((response) => {
        renderAlbums(response);
        getFirstAlbum()
    });
}

function getFirstAlbum() {
    const album = $('.js-album:first');
    getPhotos(album.attr('id'))
}


function getPhotos(albumID) {
    const photos = sendPhotosRequest(albumID);
    photos.then((response) => {
        renderPhotos(response);
    });
}

function createAlbumEventListener() {
    albumsList.click((event) => {
        if (event.target.classList.contains('js-album')) {
            clearGallery();
            getPhotos(event.target.id);
        }
    });
}

//HTML
function getAlbumItem(album) {
    return `<a href="#" class="list-group-item list-group-item-action list-group-item-primary js-album" id="${album.id}">${album.title}</a>`
}

function getPhotoItem(photo) {
    return `<div class="card" album-id = "${photo.albumId} "id="${photo.id}"><img src="${photo.url}" class="card-img-top" alt="..."></div>`;
}

//REQUESTS

function sendAlbumsRequest() {
    return new Promise((resolve, reject) => {
        $.ajax('https://jsonplaceholder.typicode.com/albums', {
            success: (data) => {
                resolve(data);
            },
            error: (errorThrown) => {
                reject(new Error(errorThrown));
            },
        });
    });
}

function sendPhotosRequest(albumID) {
    return new Promise((resolve, reject) => {
        $.ajax(`https://jsonplaceholder.typicode.com/photos?albumId=${albumID}`, {
            success: (data) => {
                resolve(data);
            },
            error: (errorThrown) => {
                reject(new Error(errorThrown));
            },
        });
    });
}


//RENDER
function renderAlbums(response) {
    const album = response.map(album => getAlbumItem(album));
    albumsList.html(album.join(''));
}

function renderPhotos(response) {
    const photos = response.map(photo => getPhotoItem(photo));
    gallery.html(photos.join(''));
}

//CLEAR
function clearGallery() {
    gallery.html('');
}


//INIT

init();

function init() {
    getAlbums();
    createAlbumEventListener();
}