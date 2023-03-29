// Layout-sc-1xcs6mc-0 hTjGax
// Layout-sc-1xcs6mc-0 faJCen

// function getClipId() {
// 	// const clipUrl = window.location.href
// 	let clipUrl = window.location.href;
// 	let clipId = clipUrl.match(/[^/]*$/)[0];

// 	return clipId;
// }

function waitForElm(selector) {
	return new Promise((resolve) => {
		if (document.querySelector(selector)) {
			return resolve(document.querySelector(selector));
		}

		const observer = new MutationObserver((mutations) => {
			if (document.querySelector(selector)) {
				resolve(document.querySelector(selector));
				observer.disconnect();
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
		});
	});
}

// async function addButton() {
// 	const clipId = getClipId();
// 	console.log("clipId", clipId);
// 	// if (!clipId) return;

// 	// const userId = "test2"; //to change

// 	//check if clip is already in fav list
// 	const response = await isUserClipInFavorites(userId, clipId);
// 	const container1 = await waitForElm(".Layout-sc-1xcs6mc-0.jJplWu");

// 	// const container2 = await waitForElm(".Layout-sc-1xcs6mc-0.faJCen");

// 	const publishButton = await waitForElm("button.ScCoreButtonPrimary-sc-ocjdkq-1");

// 	publishButton.addEventListener("click", async function () {
// 		const inputElement = await waitForElm(".ScInputBase-sc-vu7u7d-0.ScInput-sc-19xfhag-0.gXVFsI.iXedIZ.InjectLayout-sc-1i43xsx-0.gWmDFd.tw-input");

// 		console.log("inputElement", inputElement);
// 		const clipUrl = inputElement.value;

// 		const clipId = clipUrl.split("/")[3];

// 		console.log("clipUrl", clipUrl);
// 		console.log("clipId", clipId);
// 	});

// 	if (response.result) {
// 		removeFromFavoriteButton(userId, clipId, container1);
// 	} else {
// 		addToFavoriteButton(userId, clipId, container1);
// 	}
// }

// async function addToFavoriteButton(userId, clipId, container) {
// 	const favoriteButton = document.createElement("button");

// 	favoriteButton.innerText = "Add to favorite";
// 	favoriteButton.classList.add("button", "add-to-favorite-button");

// 	favoriteButton.addEventListener("click", () => {
// 		console.log(`Adding clip ${clipId} to favorites!`);
// 		sendClipToServer(userId, clipId)
// 			.then((response) => {
// 				console.log(response);
// 				// remove existing button
// 				favoriteButton.remove();
// 				// replace it with new remove button
// 				removeFromFavoriteButton(userId, clipId, container);
// 			})
// 			.catch((error) => console.error(error));
// 	});

// 	// console.log("container", container)

// 	container.appendChild(favoriteButton);
// }

// async function removeFromFavoriteButton(userId, clipId, container) {
// 	const removeFromFavorite = document.createElement("button");

// 	removeFromFavorite.innerText = "remove from favorite";
// 	removeFromFavorite.classList.add("button", "remove-from-favorite-button");

// 	removeFromFavorite.addEventListener("click", () => {
// 		console.log(`Removing clip ${clipId} from favorites!`);
// 		removeClip(userId, clipId)
// 			.then((response) => {
// 				console.log(response);
// 				// remove existing button
// 				removeFromFavorite.remove();
// 				// replace it with new add button
// 				addToFavoriteButton(userId, clipId, container);
// 			})
// 			.catch((error) => console.error(error));
// 	});

// 	container.appendChild(removeFromFavorite);
// }

// async function isUserClipInFavorites(userId, clipId) {
// 	const url = `http://127.0.0.1:5000/is_user_clip_in_favorites?user_id=${userId}&clip_id=${clipId}`;

// 	const response = await fetch(url, {
// 		method: "GET",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 	});

// 	return await response.json();
// }

async function sendClipToServer(userId, clipId) {
	const url = `http://127.0.0.1:5000/add_clip_to_favorites?user_id=${userId}&clip_id=${clipId}`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return response.json();
}

async function removeClip(userId, clipId) {
	const url = `http://127.0.0.1:5000/remove_clip_from_favorites?user_id=${userId}&clip_id=${clipId}`;
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return response.json();
}

async function getFavoriteClips(userId, page, perPage) {
	const url = `http://127.0.0.1:5000/favorite_clips/${userId}?page=${page}&per_page=${perPage}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const clips = await response.json();
	return clips;
}

async function getClipCount(userId) {
	const url = `http://127.0.0.1:5000/favorite_clips/count/${userId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const clipCount = await response.json();
	return clipCount.value;
}

async function getClientId() {
	const url = `http://127.0.0.1:5000/client_id`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const client_id = await response.json();
	return client_id;
}

async function searchFavoriteClips(userId, query) {
	const url = `http://127.0.0.1:5000/favorite_clips/search?query=${query}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const clips = await response.json();
	return clips;
}

async function searchFavoriteClipCount(userId, query) {
	const url = `http://127.0.0.1:5000/favorite_clips/search/count/${userId}?query=${query}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const clipCount = await response.json();
	return clipCount.value;
}


async function getUserTokens(code) {
	const url = `http://127.0.0.1:5000/get_user_tokens?code=${code}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const tokens = await response.json();
	return tokens;
}

async function refreshAccessToken(refreshToken) {
	const url = `http://127.0.0.1:5000/refresh_access_token?refresh_token=${refreshToken}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const newTokens = await response.json();
	return newTokens;
}

async function getUserInfo(accessToken) {
	const url = `http://127.0.0.1:5000/get_user_info?access_token=${accessToken}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const userInfo = await response.json();
	return userInfo;
}

function loadPage(searchQuery) {
	document.getElementById("clips-container").innerHTML = ""; // clear container

	const prevItem = document.getElementById("prev-btn-li");
	const nextItem = document.getElementById("next-btn-li");

	prevItem.disabled = currentPage === 1;
	nextItem.disabled = currentPage === totalPages;
	if (currentPage === 1) {
		prevItem.classList.add("disabled");
	} else {
		prevItem.classList.remove("disabled");
	}

	if (currentPage === totalPages) {
		nextItem.classList.add("disabled");
	} else {
		nextItem.classList.remove("disabled");
	}

	displayFavoriteClips(userId, searchQuery);
}

function displayPagination(totalPages, searchQuery) {
	const paginationContainer = document.getElementById("pagination-container");
	// paginationContainer.innerHTML = ""; // clear pagination

	const paginationList = document.getElementsByClassName("pagination")[0];
	paginationList.innerHTML = "";

	const prevButton = document.createElement("button");
	prevButton.innerHTML = `<span aria-hidden="true">&laquo;</span>`;
	prevButton.classList.add("page-link");
	// prevButton.disabled = currentPage === 1;
	prevButton.id = "prev-btn";

	const nextButton = document.createElement("button");
	nextButton.innerHTML = `<span aria-hidden="true">&raquo;</span>`;
	nextButton.classList.add("page-link");
	// nextButton.disabled = currentPage === totalPages;
	nextButton.id = "next-btn";

	for (let i = 1; i <= totalPages; i++) {
		const pageButton = document.createElement("button");
		pageButton.innerText = i;
		pageButton.classList.add("page-link");

		pageButton.addEventListener("click", () => {
			const prevPaginationItem = document.getElementById("li-" + currentPage);
			prevPaginationItem.classList.remove("active");

			currentPage = i;
			listItem.classList.add("active");
			loadPage(searchQuery);
		});
		const listItem = document.createElement("li");
		listItem.classList.add("page-item");
		listItem.id = "li-" + i;
		listItem.appendChild(pageButton);

		// add active state to first element in pagination
		if (i === 1) {
			listItem.classList.add("active");
		}

		paginationList.appendChild(listItem);
	}

	prevButton.addEventListener("click", () => {
		const prevPaginationItem = document.getElementById("li-" + currentPage);
		prevPaginationItem.classList.remove("active");

		currentPage--;

		const currentPaginationItem = document.getElementById("li-" + currentPage);
		currentPaginationItem.classList.add("active");

		loadPage(searchQuery);
	});

	nextButton.addEventListener("click", () => {
		const prevPaginationItem = document.getElementById("li-" + currentPage);
		prevPaginationItem.classList.remove("active");

		currentPage++;

		const currentPaginationItem = document.getElementById("li-" + currentPage);
		currentPaginationItem.classList.add("active");

		loadPage(searchQuery);
	});

	const paginationListItemPrev = document.createElement("li");
	paginationListItemPrev.classList.add("page-item");
	if (currentPage === 1) {
		paginationListItemPrev.classList.add("disabled");
	}

	// paginationListItemPrev.classList.remove("disabled")
	paginationListItemPrev.id = "prev-btn-li";
	paginationListItemPrev.appendChild(prevButton);

	const paginationListItemNext = document.createElement("li");
	paginationListItemNext.classList.add("page-item");
	paginationListItemNext.id = "next-btn-li";
	paginationListItemNext.appendChild(nextButton);

	paginationList.prepend(paginationListItemPrev);
	paginationList.appendChild(paginationListItemNext);

	paginationContainer.appendChild(paginationList);
}

async function displayFavoriteClips(userId, searchQuery) {
	let favoriteClips;

	if (searchQuery) {
		favoriteClips = await searchFavoriteClips(userId, searchQuery);
	} else {
		favoriteClips = await getFavoriteClips(userId, currentPage, clipsPerPage);
	}

	if (!favoriteClips || favoriteClips.length === 0) {
		document.write("<h1>You don't add any clip to favorite!</h1>");
		return;
	}
	const clipsContainer = document.getElementById("clips-container");
	favoriteClips.forEach((clip, index) => {
		const clipContainer = document.createElement("div");
		clipContainer.classList.add("clip-container");

		const clipLink = document.createElement("a");
		clipLink.href = clip.clip_url;
		clipLink.classList.add("clip-img");
		clipLink.target = "_blank"; //open in new card

		const clipTitle = document.createElement("h3");
		clipTitle.textContent = clip.clip_title;

		const clipThumbnail = document.createElement("img");
		clipThumbnail.src = clip.thumbnail_url;

		clipLink.appendChild(clipThumbnail);
		clipContainer.appendChild(clipTitle);
		clipContainer.appendChild(clipLink);

		removeClipInPopup(userId, clip.clip_id, clipContainer);

		clipsContainer.appendChild(clipContainer);
	});
}

async function removeClipInPopup(userId, clipId, container) {
	const removeFromFavorite = document.createElement("button");

	removeFromFavorite.innerText = "X";
	removeFromFavorite.classList.add("button", "remove-from-favorite-button");

	removeFromFavorite.addEventListener("click", () => {
		console.log(`Removing clip ${clipId} from favorites!`);
		removeClip(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				container.remove();
				// replace it with new add button
				addToFavoriteButton(userId, clipId);
			})
			.catch((error) => console.error(error));
	});

	container.appendChild(removeFromFavorite);
}

function searchClickHandler() {
	const searchButton = document.getElementById("search-button");
	searchButton.addEventListener("click", async () => {
		event.preventDefault();
		currentPage = 1;

		const searchQuery = document.getElementById("search-input");
		let clipCount = await searchFavoriteClipCount(userId, searchQuery.value);
		let totalPages = Math.ceil(clipCount / clipsPerPage);

		displayPagination(totalPages, searchQuery.value);
		loadPage(searchQuery.value);
	});
}

function resetClickHandler() {
	const resetButton = document.getElementById("reset-button");
	resetButton.addEventListener("click", async () => {
		event.preventDefault();
		const searchQuery = document.getElementById("search-input");
		searchQuery.value = ""
		currentPage = 1;
		displayPagination(totalPages);
		loadPage();
	});
}

async function getUsername(accessToken) {
	
	if(!accessToken){
		return null
	}
	const userInfo = await getUserInfo(accessToken)
	if(userInfo.status === 401){
		// const refreshToken = localStorage.getItem("refreshToken");

		chrome.storage.local.get(["refreshToken"]).then(async (result) => {
			console.log("Value currently is " + result.refreshToken);
			refreshToken = result.refreshToken
			
			const newTokens = await refreshAccessToken(refreshToken);
			if(newTokens.status === 401) {
				// localStorage.removeItem("accessToken")
				// localStorage.removeItem("refreshToken")
				return 
			}
			
			// localStorage.setItem("accessToken", newTokens.access_token);
			// localStorage.setItem("refreshToken", newTokens.refresh_token);
	
			chrome.storage.local.set({accessToken: newTokens.access_token}).then(() => {
				console.log("accessToken is set to " + newTokens.access_token);
			});
	
			chrome.storage.local.set({refreshToken: newTokens.refresh_token}).then(() => {
				console.log("refreshToken is set to " + newTokens.refresh_token);
			});
	
			const newAccessToken = newTokens.access_token
			return await getUsername(newAccessToken)
		});

	}
	
	const username = userInfo.display_name
	return username
	
}



async function login(code) {
	// const code = await getAuthorizeCode()
	const tokens = await getUserTokens(code);
	console.log(tokens);
	if(tokens){
		// localStorage.setItem('accessToken', tokens.access_token);
		// localStorage.setItem('refreshToken', tokens.refresh_token);
		chrome.storage.local.set({accessToken: tokens.access_token}).then(() => {
			console.log("accessToken is set to " + tokens.access_token);
		});

		chrome.storage.local.set({refreshToken: tokens.refresh_token}).then(() => {
			console.log("refreshToken is set to " + tokens.refresh_token);
		});

		initPage(tokens.access_token)
	}
}

function hideSpinner() {
	const spinnerWrapper = document.getElementById("spinner-wrapper");
	const spinner = spinnerWrapper.querySelector(".spinner-border");
  
	if (spinner) {
	  spinnerWrapper.remove()
	}
}
  
function showSpinner() {
	const spinnerWrapper = document.createElement("div");
	spinnerWrapper.id = "spinner-wrapper";

	const spinner = document.createElement("div");
	spinner.id = "spinner"
	spinner.classList.add("spinner-border");
	spinner.setAttribute("role", "status");
  
	const spinnerText = document.createElement("span");
	spinnerText.classList.add("sr-only");
	spinnerText.innerText = "Loading...";
  
	spinner.appendChild(spinnerText);
	spinnerWrapper.appendChild(spinner);
  
	document.body.appendChild(spinnerWrapper);
}
  

function loginViaTwitch() {
	const loginButton = document.getElementById("login-button");
	loginButton.addEventListener("click", async () => {
		const clientId = await getClientId()
		const redirectUri = "http://localhost:5000/authorize";
	
		const responseType = "code";
		const scope = "user:read:email";
	
		const popupWindow = window.open(
			`https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`,
			"_blank",
			"width=500,height=600"
		);
	
		const authorizationHook = (tabId, changeInfo, tab) => {
			if (tab.url.indexOf(redirectUri) >= 0) {
				if (tab.url.indexOf("code=") >= 0) {
					let url = tab.url;
					let code = url.substring(url.indexOf("code=") + 5, url.indexOf("&scope"));
					login(code);
					popupWindow.close();
					
					chrome.tabs.onUpdated.removeListener(authorizationHook);
				}
			}
		};
	
		chrome.tabs.onUpdated.addListener(authorizationHook);
	});
}



// const accessToken = localStorage.getItem('accessToken');



let currentPage = 1;
const clipsPerPage = 8;

let totalPages;

let userId

function initPage(accessToken) {
	showSpinner();
	loginViaTwitch()
	document.querySelector('.show-when-logged-out').style.display = 'none';
	document.querySelector('.show-when-logged-in').style.display = 'none';
	
	getUsername(accessToken).then((username) => {
		console.log("username", username)
		if(!username){
			hideSpinner();
			document.querySelector('.show-when-logged-out').style.display = 'block';
			document.querySelector('.show-when-logged-in').style.display = 'none';
			
			return null
		}
		
	
		userId = username
		
		searchClickHandler()
		resetClickHandler()

		getClipCount(userId).then((clipCount) => {
			totalPages = Math.ceil(clipCount / clipsPerPage);
			displayPagination(totalPages);
			loadPage();
			hideSpinner();
			document.querySelector('.show-when-logged-out').style.display = 'none';
			document.querySelector('.show-when-logged-in').style.display = 'block';
		});
	
	})
}


let accessToken
  
chrome.storage.local.get(["accessToken"]).then((result) => {
	console.log("Value currently is " + result.accessToken);
	accessToken = result.accessToken
	initPage(accessToken)
});


// addButton();
