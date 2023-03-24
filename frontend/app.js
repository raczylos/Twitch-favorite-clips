// Layout-sc-1xcs6mc-0 hTjGax
// Layout-sc-1xcs6mc-0 faJCen

function getClipId() {
	// const clipUrl = window.location.href
	let clipUrl = window.location.href;
	let clipId = clipUrl.match(/[^/]*$/)[0];

	return clipId;
}

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

async function addButton() {
	const clipId = getClipId();
	console.log("clipId", clipId);
	// if (!clipId) return;
	const userId = "test2"; //to change

	//check if clip is already in fav list
	const response = await isUserClipInFavorites(userId, clipId);
	const container1 = await waitForElm(".Layout-sc-1xcs6mc-0.jJplWu");

	// const container2 = await waitForElm(".Layout-sc-1xcs6mc-0.faJCen");

	const publishButton = await waitForElm("button.ScCoreButtonPrimary-sc-ocjdkq-1");

	publishButton.addEventListener("click", async function () {
		const inputElement = await waitForElm(".ScInputBase-sc-vu7u7d-0.ScInput-sc-19xfhag-0.gXVFsI.iXedIZ.InjectLayout-sc-1i43xsx-0.gWmDFd.tw-input");

		console.log("inputElement", inputElement);
		const clipUrl = inputElement.value;

		const clipId = clipUrl.split("/")[3];

		console.log("clipUrl", clipUrl);
		console.log("clipId123", clipId);
	});

	if (response.result) {
		removeFromFavoriteButton(userId, clipId, container1);
	} else {
		addToFavoriteButton(userId, clipId, container1);
	}
}

async function addToFavoriteButton(userId, clipId, container) {
	const favoriteButton = document.createElement("button");

	favoriteButton.innerText = "Add to favorite";
	favoriteButton.classList.add("button", "add-to-favorite-button");

	favoriteButton.addEventListener("click", () => {
		console.log(`Adding clip ${clipId} to favorites!`);
		sendClipToServer(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				favoriteButton.remove();
				// replace it with new remove button
				removeFromFavoriteButton(userId, clipId, container);
			})
			.catch((error) => console.error(error));
	});

	// console.log("container", container)

	container.appendChild(favoriteButton);
}

async function removeFromFavoriteButton(userId, clipId, container) {
	const removeFromFavorite = document.createElement("button");

	removeFromFavorite.innerText = "remove from favorite";
	removeFromFavorite.classList.add("button", "remove-from-favorite-button");

	removeFromFavorite.addEventListener("click", () => {
		console.log(`Removing clip ${clipId} from favorites!`);
		removeClip(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				removeFromFavorite.remove();
				// replace it with new add button
				addToFavoriteButton(userId, clipId, container);
			})
			.catch((error) => console.error(error));
	});

	container.appendChild(removeFromFavorite);
}

async function isUserClipInFavorites(userId, clipId) {
	const url = `http://127.0.0.1:5000/is_user_clip_in_favorites?user_id=${userId}&clip_id=${clipId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});

	return await response.json();
}

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

async function getAuthorizeCode() {
	const url = `http://127.0.0.1:5000/authorize`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const code = await response.json();
	return code;
}

async function getUserAccessToken(code) {
	const url = `http://127.0.0.1:5000/get_user_token?code=${code}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const accessToken = await response.json();
	return accessToken;
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

	displayFavoriteClips("test2", searchQuery);
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

addButton();

let currentPage = 1;
const clipsPerPage = 8;

let totalPages;

getClipCount("test2").then((clipCount) => {
	totalPages = Math.ceil(clipCount / clipsPerPage);
	displayPagination(totalPages);
	loadPage();
});

const searchButton = document.getElementById("search-button");
searchButton.addEventListener("click", async () => {
	event.preventDefault();
	currentPage = 1;

	const searchQuery = document.getElementById("search-input");
	let clipCount = await searchFavoriteClipCount("test2", searchQuery.value);
	let totalPages = Math.ceil(clipCount / clipsPerPage);

	displayPagination(totalPages, searchQuery.value);
	loadPage(searchQuery.value);
});

const resetButton = document.getElementById("reset-button");
resetButton.addEventListener("click", async () => {
	event.preventDefault();
	currentPage = 1;
	displayPagination(totalPages);
	loadPage();
});

const clientId = "h8qj5gj9exsfa49izsqdx98qe6lo4m";
// const redirectUri = "client_credentials";
const redirectUri = "http://localhost:5000/authorize";

const responseType = "code";
const scope = "user:read:email";

const clientSecret = "ebydp8cbzebweqqkbbbm0h1knqttkq";

async function login(code) {
	// const code = await getAuthorizeCode()
	const access_token = await getUserAccessToken(code);
	console.log("access_token", access_token);
}

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", () => {
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

