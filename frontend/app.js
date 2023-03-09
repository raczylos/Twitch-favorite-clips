// Layout-sc-1xcs6mc-0 hTjGax

function getClipId() {
    // const clipUrl = window.location.href
    let clipUrl = window.location.href;
    let clipId = clipUrl.match(/[^/]*$/)[0];
    
    return clipId;
}

  

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

async function addButton() {
    const clipId = getClipId();
    console.log("clipId", clipId)
    if (!clipId) return;
    const userId = 'test2' //to change

    
    //check if clip is already in fav list
    const response = await isUserClipInFavorites(userId, clipId);
    const container = await waitForElm(".Layout-sc-1xcs6mc-0.jJplWu")

    if(response.result) {
        removeFromFavoriteButton(userId, clipId, container)
    } else {
        addToFavoriteButton(userId, clipId, container)
    }

}
  
async function addToFavoriteButton(userId, clipId, container) {
    

    
    const favoriteButton = document.createElement("button");
    
    favoriteButton.innerText = "Add to favorite";
    favoriteButton.classList.add('button', 'add-to-favorite-button');

    favoriteButton.addEventListener("click", () => {
      console.log(`Adding clip ${clipId} to favorites!`);
      sendClipToServer(userId, clipId)
        .then(response => {
            console.log(response)
            // remove existing button
            favoriteButton.remove();
            // replace it with new remove button
            removeFromFavoriteButton(userId, clipId)

        })
        .catch(error => console.error(error));
      // daj alert na górze ze dodało klip
      // dodaj klip do popupu we wtyczce moze na start sam link
      // finalnie ma dodać podgląd klipu (obrazek), tytuł, autora klipu, nick streamera, moze czas klipu (ale pewnie wszystko sie nie zmieści)
      
    });
    // debugger;
   
    // console.log("container", container)

    container.appendChild(favoriteButton)
}

async function removeFromFavoriteButton(userId, clipId, container, popup = false) {
    
    const removeFromFavorite = document.createElement("button");
    
    removeFromFavorite.innerText = "remove from favorite";
    removeFromFavorite.classList.add('button', 'remove-from-favorite-button');

    removeFromFavorite.addEventListener("click", () => {
        console.log(`Removing clip ${clipId} from favorites!`);
        removeClip(userId, clipId)
          .then(response => {
            console.log(response)
            // remove existing button
            removeFromFavorite.remove();
            // replace it with new add button
            addToFavoriteButton(userId, clipId);
          })
          .catch(error => console.error(error));
    });

    container.appendChild(removeFromFavorite)

}


async function isUserClipInFavorites(userId, clipId) {
    const url = 'http://127.0.0.1:5000/is_user_clip_in_favorites?user_id=' + userId + '&clip_id=' + clipId;

    const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
    });
    
    return await response.json();
}




async function sendClipToServer(userId, clipId) {
    const url = 'http://127.0.0.1:5000/add_clip_to_favorites?user_id=' + userId + '&clip_id=' + clipId;
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
      
    });
    return response.json();
}

async function removeClip(userId, clipId) {
    const url = 'http://127.0.0.1:5000/remove_clip_from_favorites?user_id=' + userId + '&clip_id=' + clipId;
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
      
    });
    return response.json();
}

async function getFavoriteClips(userId) {

    const url = 'http://127.0.0.1:5000/favorite_clips/' + userId;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
    const clips = await response.json();
    return clips;
}


async function displayFavoriteClips(userId) {
    
    const favoriteClips = await getFavoriteClips(userId);
    console.log(favoriteClips)
    
    const clipsContainer = document.getElementById("clips-container")
    favoriteClips.reverse().forEach((clip, index) => {
        const clipContainer = document.createElement('div');

        
        const clipLink = document.createElement('a');
        clipLink.href = clip.clip_url
        clipLink.classList.add('clip-img');
        clipLink.target = '_blank'; //open in new card

        
        const clipTitle = document.createElement('h3');
        clipTitle.textContent = clip.clip_title;
    
        const clipThumbnail = document.createElement('img');
        clipThumbnail.src = clip.thumbnail_url;
        
        
        
        clipLink.appendChild(clipThumbnail)
        clipContainer.appendChild(clipTitle);
        clipContainer.appendChild(clipLink);

        removeClipInPopup(userId, clip.clip_id, clipContainer)
        
        clipsContainer.appendChild(clipContainer);
    });

  
}

async function removeClipInPopup(userId, clipId, container) {
    
    const removeFromFavorite = document.createElement("button");
    
    removeFromFavorite.innerText = "X";
    removeFromFavorite.classList.add('button', 'remove-from-favorite-button');

    removeFromFavorite.addEventListener("click", () => {
        console.log(`Removing clip ${clipId} from favorites!`);
        removeClip(userId, clipId)
          .then(response => {
            console.log(response)
            // remove existing button
            container.remove();
            // replace it with new add button
            addToFavoriteButton(userId, clipId);
          })
          .catch(error => console.error(error));
    });

    container.appendChild(removeFromFavorite)

}

addButton()
displayFavoriteClips("test2")


