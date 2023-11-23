const APIController = (function() {
    const clientId = '0ff466d7cd3f468992a9d5aefbcc6edc';
    const clientSecret = '325b665a30ed4c2b998a3c72c8a8c82d';

    const _getToken = async () => {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        return (await response.json()).access_token;
    }

    const _getAuthors = async (token) => {
        const response = await fetch(`https://api.spotify.com/v1/artists?ids=6kAWuZfb9I2pqrAgErMupz%2C6eUKZXaKkcviH0Ku9w2n3V%2C66CXWjxzNUsdJxJ2JdwvnR%2C6qqNVTkY8uBg9cP3Jd7DAH%2C06HL4z0CvFAxyc27GXpf02%2C3TVXtAsR1Inumwj472S9r4%2C53XhwfbYqKCa1cC15pYq2q%2C3WrFJ7ztbogyGnTHbHJFl2%2C7dGJo4pcD2V6oG8kP0tJRR%2C1uNFoZAHBGtllmzznpCI3s%2C1Xyo4u8uXC1ZmMpatF05PJ%2C2TjH3yhwPkVDvc6U5GWwQ8`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        return (await response.json()).artists;
    }

    const _getAlbumByAuthor = async (token, authorId) => {
        const response = await fetch(`https://api.spotify.com/v1/artists/${authorId}/albums`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        return (await response.json()).items;
    }

    const _getTracks = async (token, albumId) => {
        console.log(albumId);
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        return (await response.json()).items;
    }

    const _getTrack = async (token, trackEndPoint) => {
        const result = await fetch(`https://api.spotify.com/v1/tracks/${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });
        return (await result.json());
    }

    return {
        getToken(){return _getToken();},
        getAuthors(token){return _getAuthors(token);},
        getAlbumByAuthor(token, authorId){return _getAlbumByAuthor(token, authorId);},
        getTracks(token, albumId){return _getTracks(token, albumId);},
        getTrack(token, trackEndPoint){return _getTrack(token, trackEndPoint);}
    }
})();

const UIController = (function() {
    const DOMElements = {
        selectAuthor: '#select_author',
        selectAlbum: '#select_album',
        selectTrack: '#select_track',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
    }
    return {
        inputField() {
            return {
                author: document.querySelector(DOMElements.selectAuthor),
                album: document.querySelector(DOMElements.selectAlbum),
                tracks: document.querySelector(DOMElements.selectTrack),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },
        createAuthor(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectAuthor).insertAdjacentHTML('beforeend', html);
        }, 
        createAlbum(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectAlbum).insertAdjacentHTML('beforeend', html);
        },
        createTrack(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectTrack).insertAdjacentHTML('beforeend', html);
        },
        createTrackDetail(img, title, artist) {
            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            detailDiv.innerHTML = '';
            const html = 
            `
            <div class="detail col-sm-12">
                <div >
                    <img src="${img}" alt="">        
                </div>
                <div>
                    <label for="track">${title} - ${artist}</label>
                </div> 
            </div>
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.inputField().songDetail.innerHTML = '';
        },

        resetAlbum() {
            this.inputField().album.innerHTML = '';
            this.inputField().tracks.innerHTML = '';
            this.inputField().songDetail.innerHTML = '';
        },

        resetTrackDetail(){
            this.inputField().songDetail.innerHTML = '';
        },

        setStoredToken(value){
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken(){
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {
    const DOMInputs = UICtrl.inputField();

    const loadAuthors = async () => {
        const token = await APICtrl.getToken();
        UICtrl.setStoredToken(token);
        const authors = await APICtrl.getAuthors(token);
        authors.forEach(element => UICtrl.createAuthor(element.name, element.id));
    }

    DOMInputs.author.addEventListener('change', async () => {
        //reseta o artista para aparecer o primeiro
        UICtrl.resetAlbum();
        const token = UICtrl.getStoredToken().token;
        const authorSelect = UICtrl.inputField().author;
        const authorId = authorSelect.options[authorSelect.selectedIndex].value;
        const album = await APICtrl.getAlbumByAuthor(token, authorId);
        album.forEach(p => UICtrl.createAlbum(p.name, p.id));
    });

    DOMInputs.album.addEventListener('change', async () => {
        //reseta o album para aparecer o primeiro
        UICtrl.resetTracks();
        const token = UICtrl.getStoredToken().token;
        const albumSelect = UICtrl.inputField().album;
        const albumId = albumSelect.options[albumSelect.selectedIndex].value;
        const tracks = await APICtrl.getTracks(token, albumId);
        tracks.forEach(el => UICtrl.createTrack(el.name, el.id));
    });

    DOMInputs.submit.addEventListener('click', async (e) => {
        //imprime os detalhes da musica escolhida
        e.preventDefault();
        UICtrl.resetTrackDetail();
        const token = UICtrl.getStoredToken().token;
        const trackSelect = UICtrl.inputField().tracks;
        const trackEndpoint = trackSelect.options[trackSelect.selectedIndex].value;
        console.log(trackEndpoint);
        const track = await APICtrl.getTrack(token, trackEndpoint);
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);
    });    

    return {
        init() {
            console.log('App is starting');
            loadAuthors();
        }
    }

})(UIController, APIController);

APPController.init();