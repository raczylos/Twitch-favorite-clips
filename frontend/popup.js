// Layout-sc-1xcs6mc-0 hTjGax
// Layout-sc-1xcs6mc-0 faJCen



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

async function getFavoriteClips(userId, page, clipsPerPage) {
	const url = `http://127.0.0.1:5000/favorite_clips/${userId}?page=${page}&clips_per_page=${clipsPerPage}`;

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

async function searchFavoriteClips(userId, query, page, clipsPerPage) {
	const url = `http://127.0.0.1:5000/favorite_clips/search?query=${query}&page=${page}&clips_per_page=${clipsPerPage}&user_id=${userId}`;

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

async function getNewRefreshedTokens(refreshToken) {
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

	displayFavoriteClips(userId, searchQuery);

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
}

function createPagination(totalPages, paginationList, searchQuery) {
	const MAX_PAGES_BEFORE_CURRENT = 2;
	const MAX_PAGES_AFTER_CURRENT = 2;
	const MAX_PAGES = MAX_PAGES_BEFORE_CURRENT + MAX_PAGES_AFTER_CURRENT + 1;

	let pagesToAdd = [];

	if (totalPages > MAX_PAGES) {
		const start = Math.max(1, currentPage - MAX_PAGES_BEFORE_CURRENT);
		const end = Math.min(totalPages, currentPage + MAX_PAGES_AFTER_CURRENT);
		if (start > 1) {
			pagesToAdd.push(1);
			if (start > 2) {
				pagesToAdd.push("...");
			}
		}
		for (let i = start; i <= end; i++) {
			pagesToAdd.push(i);
		}
		if (end < totalPages) {
			if (end < totalPages - 1) {
				pagesToAdd.push("...");
			}
			pagesToAdd.push(totalPages);
		}
	} else {
		for (let i = 1; i <= totalPages; i++) {
			pagesToAdd.push(i);
		}
	}

	for (let i = 0; i < pagesToAdd.length; i++) {
		const page = pagesToAdd[i];
		const pageButton = document.createElement("button");
		pageButton.innerText = page;
		pageButton.classList.add("page-link");
		
		if (page === "...") {
			pageButton.disabled = true;
		} else {
			pageButton.addEventListener("click", () => {
				const prevPaginationItem = document.getElementById("li-" + currentPage);
				prevPaginationItem.classList.remove("active");

				currentPage = page;
				listItem.classList.add("active");
				loadPage(searchQuery);

				displayPagination(totalPages, searchQuery);
			});
		}

		const listItem = document.createElement("li");
		listItem.classList.add("page-item");
		listItem.id = "li-" + page;
		if (page === currentPage) {
			listItem.classList.add("active");
		}
		listItem.appendChild(pageButton);
		paginationList.appendChild(listItem);
	}
}

function displayPagination(totalPages, searchQuery) {
	const paginationContainer = document.getElementById("pagination-container");

	const paginationList = document.getElementsByClassName("pagination")[0];
	paginationList.innerHTML = ""; //clear pagination

	createPagination(totalPages, paginationList, searchQuery);

	if (totalPages === 0) {
		return;
	}

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

	prevButton.addEventListener("click", () => {
		const prevPaginationItem = document.getElementById("li-" + currentPage);
		prevPaginationItem.classList.remove("active");

		currentPage--;

		const currentPaginationItem = document.getElementById("li-" + currentPage);
		currentPaginationItem.classList.add("active");

		loadPage(searchQuery);
		displayPagination(totalPages);
	});

	nextButton.addEventListener("click", () => {
		const prevPaginationItem = document.getElementById("li-" + currentPage);
		prevPaginationItem.classList.remove("active");

		currentPage++;

		const currentPaginationItem = document.getElementById("li-" + currentPage);
		currentPaginationItem.classList.add("active");

		loadPage(searchQuery);
		displayPagination(totalPages);
	});

	const paginationListItemPrev = document.createElement("li");
	paginationListItemPrev.classList.add("page-item");
	if (currentPage === 1) {
		paginationListItemPrev.classList.add("disabled");
	}

	paginationListItemPrev.id = "prev-btn-li";
	paginationListItemPrev.appendChild(prevButton);

	const paginationListItemNext = document.createElement("li");
	paginationListItemNext.classList.add("page-item");

	if (currentPage === totalPages) {
		paginationListItemNext.classList.add("disabled");
	}

	paginationListItemNext.id = "next-btn-li";
	paginationListItemNext.appendChild(nextButton);

	paginationList.prepend(paginationListItemPrev);
	paginationList.appendChild(paginationListItemNext);

	paginationContainer.appendChild(paginationList);
}

async function displayFavoriteClips(userId, searchQuery) {
	let favoriteClips;

	if (searchQuery) {
		console.log("searchFavoriteClips", currentPage, clipsPerPage);
		favoriteClips = await searchFavoriteClips(userId, searchQuery, currentPage, clipsPerPage);
	} else {
		favoriteClips = await getFavoriteClips(userId, currentPage, clipsPerPage);
	}
	console.log("favoriteClips", favoriteClips);

	const clipsContainer = document.getElementById("clips-container");

	if (!favoriteClips || favoriteClips.length === 0) {
		const noClipsMsg = document.createElement("h2");
		noClipsMsg.textContent = "No clips found :(";

		noClipsMsg.style.margin = "auto";

		clipsContainer.appendChild(noClipsMsg);
		return;
	}

	favoriteClips.forEach((clip, index) => {
		const clipContainer = document.createElement("div");
		clipContainer.classList.add("clip-container");

		const clipLink = document.createElement("a");
		clipLink.href = clip.clip_url;
		clipLink.classList.add("clip-img");
		clipLink.target = "_blank"; //open in new card

		const clipTitle = document.createElement("h4");
		clipTitle.textContent = clip.clip_title;
		clipTitle.classList.add("clip-title");

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
	removeFromFavorite.classList.add("button", "remove-from-favorite-button-in-popup");

	removeFromFavorite.addEventListener("click", () => {
		console.log(`Removing clip ${clipId} from favorites!`);
		removeClip(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				container.remove();
				location.reload();
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
		console.log("clipCount", clipCount);
		console.log("totalPages", totalPages);
		displayPagination(totalPages, searchQuery.value);
		loadPage(searchQuery.value);
	});
}

function resetClickHandler() {
	const resetButton = document.getElementById("reset-button");
	resetButton.addEventListener("click", async () => {
		event.preventDefault();
		const searchQuery = document.getElementById("search-input");
		searchQuery.value = "";
		currentPage = 1;
		displayPagination(totalPages);
		loadPage();
	});
}

async function refreshAccessToken(refreshToken) {
	document.querySelector(".show-when-logged-out").style.display = "none";
	document.querySelector(".show-when-logged-in").style.display = "none";

	const newTokens = await getNewRefreshedTokens(refreshToken);

	if (newTokens.status === 401) {
		chrome.storage.local.remove(["accessToken", "refreshToken"], function () {
			let error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
		});
		hideSpinner();
		return null;
	}
	await chrome.storage.local
		.set({
			accessToken: newTokens.access_token,
			refreshToken: newTokens.refresh_token,
		})
		.then(() => {
			console.log("new accessToken is set to " + newTokens.access_token);
			console.log("new refreshToken is set to " + newTokens.refresh_token);
		});

	// const newAccessToken = newTokens.access_token;

	return newTokens;
}

async function getUsername(accessToken) {
	if (!accessToken) {
		return null;
	}
	const userInfo = await getUserInfo(accessToken);
	console.log("userInfo", userInfo);
	if (userInfo.status === 401) {
		// const refreshToken = localStorage.getItem("refreshToken");
		chrome.storage.local.get(["refreshToken"]).then(async (result) => {
			let refreshToken = result.refreshToken;
			showSpinner();
			const newAccessToken = await refreshAccessToken(refreshToken);
			if (newAccessToken) {
				hideSpinner();
				initPage(newAccessToken);
				// location.reload()
				return null;
			}
		});
	}

	const username = userInfo.display_name;

	return username;
}

async function login(code) {
	// const code = await getAuthorizeCode()
	const tokens = await getUserTokens(code);
	console.log(tokens);
	if (tokens) {
		// localStorage.setItem('accessToken', tokens.access_token);
		// localStorage.setItem('refreshToken', tokens.refresh_token);
		chrome.storage.local.set({ accessToken: tokens.access_token }).then(() => {
			console.log("accessToken is set to " + tokens.access_token);
		});

		chrome.storage.local.set({ refreshToken: tokens.refresh_token }).then(() => {
			console.log("refreshToken is set to " + tokens.refresh_token);
		});

		initPage(tokens.access_token);
	}
}

function hideSpinner() {
	const spinnerWrapper = document.getElementById("spinner-wrapper");
	const spinner = spinnerWrapper.querySelector(".spinner-border");

	if (spinner) {
		spinnerWrapper.remove();
	}
}

function showSpinner() {
	const spinnerWrapper = document.createElement("div");
	spinnerWrapper.id = "spinner-wrapper";

	const spinner = document.createElement("div");
	spinner.id = "spinner";
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
	loginButton.classList.add("btn");
	loginButton.classList.add("btn-primary");
	loginButton.addEventListener("click", async () => {
		const clientId = await getClientId();
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

let currentPage = 1;
const clipsPerPage = 3;

let totalPages;

let userId;

function initPage(accessToken) {
	showSpinner();
	loginViaTwitch();
	document.querySelector(".show-when-logged-out").style.display = "none";
	document.querySelector(".show-when-logged-in").style.display = "none";

	getUsername(accessToken).then((username) => {
		console.log("username", username);
		if (!username) {
			hideSpinner();
			document.querySelector(".show-when-logged-out").style.display = "block";
			document.querySelector(".show-when-logged-in").style.display = "none";

			return null;
		}

		userId = username;

		searchClickHandler();
		resetClickHandler();

		getClipCount(userId).then((clipCount) => {
			totalPages = Math.ceil(clipCount / clipsPerPage);
			displayPagination(totalPages);
			loadPage();
			hideSpinner();
			document.querySelector(".show-when-logged-out").style.display = "none";
			document.querySelector(".show-when-logged-in").style.display = "block";
		});
	});
}

let accessToken;

chrome.storage.local.get(["accessToken"]).then((result) => {
	accessToken = result.accessToken;
	initPage(accessToken);
});


