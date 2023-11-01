// const base_url = "https://twitch-favorite-clips-api.onrender.com/"
const base_url = "http://127.0.0.1:5000/"

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
	const url = `${base_url}add_clip_to_favorites?user_id=${userId}&clip_id=${clipId}`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return response.json();
}

async function removeClip(userId, clipId) {
	const url = `${base_url}remove_clip_from_favorites?user_id=${userId}&clip_id=${clipId}`;
	const response = await fetch(url, {
		method: "DELETE",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return response.json();
}

async function getFavoriteClips(userId, page, clipsPerPage) {
	const url = `${base_url}favorite_clips/${userId}?page=${page}&clips_per_page=${clipsPerPage}`;

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
	const url = `${base_url}favorite_clips/count/${userId}`;

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
	const url = `${base_url}client_id`;

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
	const url = `${base_url}favorite_clips/search?query=${query}&page=${page}&clips_per_page=${clipsPerPage}&user_id=${userId}`;

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
	const url = `${base_url}favorite_clips/search/count/${userId}?query=${query}`;

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
	const url = `${base_url}get_user_tokens?code=${code}`;

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
	const url = `${base_url}refresh_access_token?refresh_token=${refreshToken}`;

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
	const url = `${base_url}get_user_info?access_token=${accessToken}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		},
	});
	const userInfo = await response.json();
	return userInfo;
}

async function loadPage(searchQuery) {
	showSpinner();

	let clipCount;
	if (searchQuery) {
		clipCount = await searchFavoriteClipCount(userId, searchQuery);
	} else {
		clipCount = await getClipCount(userId);
	}

	totalPages = Math.ceil(clipCount / clipsPerPage);

	//prevent situation when we delete all clips in last page then we update current page to previous page (totalPage)
	if (currentPage > totalPages) {
		currentPage = totalPages;
	}

	document.getElementById("clips-container").innerHTML = ""; // clear container

	await displayFavoriteClips(userId, searchQuery);

	displayPagination(totalPages, searchQuery);

	hideSpinner();

	const prevItem = document.getElementById("prev-btn-li");
	const nextItem = document.getElementById("next-btn-li");

	console.log("currentPage", currentPage, "totalPages", totalPages);
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

				// displayPagination(totalPages, searchQuery);
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
		// displayPagination(totalPages);
	});

	nextButton.addEventListener("click", () => {
		const prevPaginationItem = document.getElementById("li-" + currentPage);
		prevPaginationItem.classList.remove("active");

		currentPage++;

		const currentPaginationItem = document.getElementById("li-" + currentPage);
		currentPaginationItem.classList.add("active");

		loadPage(searchQuery);
		// displayPagination(totalPages);
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

	hideSpinner();
}

async function displayFavoriteClips(userId, searchQuery) {
	let favoriteClips;
	const clipsContainer = document.getElementById("clips-container");

	if (currentPage === 0) {
		const noClipsMsg = document.createElement("h2");
		noClipsMsg.textContent = "No clips found :(";

		noClipsMsg.style.margin = "auto";
		clipsContainer.appendChild(noClipsMsg);
		return;
	}

	if (searchQuery) {
		console.log("searchFavoriteClips", currentPage, clipsPerPage);
		favoriteClips = await searchFavoriteClips(userId, searchQuery, currentPage, clipsPerPage);
	} else {
		favoriteClips = await getFavoriteClips(userId, currentPage, clipsPerPage);
	}
	console.log("favoriteClips", favoriteClips);

	favoriteClips.forEach((clip, index) => {
		const clipContainer = document.createElement("div");
		clipContainer.classList.add("card", "clip-container");

		const clipLink = document.createElement("a");
		clipLink.href = clip.clip_url;
		clipLink.target = "_blank"; //open in new cards
		clipLink.classList.add("mb-0", "clip-img");

		const clipThumbnail = document.createElement("img");
		clipThumbnail.src = clip.thumbnail_url;

		const clipTitle = document.createElement("h4");
		clipTitle.textContent = clip.clip_title;
		clipTitle.classList.add("card-title", "clip-title");

		clipLink.appendChild(clipThumbnail);
		clipContainer.appendChild(clipTitle);
		clipContainer.appendChild(clipLink);

		const cardBody = document.createElement("div");
		cardBody.classList.add("card-body");

		clipBroadcaster(clip.broadcaster_name, cardBody);
		clipDuration(clip.clip_duration, cardBody);
		

		removeClipInPopup(userId, clip.clip_id, clipContainer, cardBody);
		copyToClipboard(clipContainer, clip.clip_url, cardBody);

		clipsContainer.appendChild(clipContainer);
	});
}

function clipDuration(clipDuration, cardBody) {
	let clipDurationContainer = document.createElement("div");
	clipDurationContainer.classList.add("clip-duration");

	let durationIcon = document.createElement("span");
	durationIcon.classList.add("bi", "bi-clock");

	let durationText = document.createElement("span");
	durationText.classList.add("duration-text");
	durationText.textContent = clipDuration + "s";

	clipDurationContainer.appendChild(durationIcon);
	clipDurationContainer.appendChild(durationText);

	cardBody.appendChild(clipDurationContainer);
}

function clipBroadcaster(clipBroadcaster, cardBody) {
	let clipBroadcasterContainer = document.createElement("div");
	clipBroadcasterContainer.classList.add("clip-broadcaster");

	let broadcasterIcon = document.createElement("span");
	broadcasterIcon.classList.add("bi", "bi-broadcast");

	let broadcasterText = document.createElement("span");
	broadcasterText.classList.add("broadcaster-text");
	broadcasterText.textContent = clipBroadcaster;

	clipBroadcasterContainer.appendChild(broadcasterIcon);
	clipBroadcasterContainer.appendChild(broadcasterText);

	cardBody.appendChild(clipBroadcasterContainer);
}

function copyToClipboard(clipContainer, url, cardBody) {
	const copyToClipboardButton = document.createElement("button");
	const icon = document.createElement("i");
	icon.classList.add("fa-regular", "fa-copy");

	copyToClipboardButton.setAttribute("data-bs-toggle", "tooltip");
	copyToClipboardButton.setAttribute("data-bs-placement", "top");
	copyToClipboardButton.setAttribute("data-bs-original-title", "Copy to clipboard");

	copyToClipboardButton.appendChild(icon);

	copyToClipboardButton.classList.add("button", "copy-to-clipboard-button");

	clipContainer.appendChild(cardBody);
	cardBody.appendChild(copyToClipboardButton);
	//init tooltip
	let tooltip = new bootstrap.Tooltip(copyToClipboardButton);

	//change tooltip title when button is clicked
	copyToClipboardButton.addEventListener("click", () => {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				copyToClipboardButton.setAttribute("data-bs-original-title", "Copied");

				tooltip.show();

				console.log("URL copied to clipboard!");
			})
			.catch((err) => {
				console.error("Error copying URL to clipboard: ", err);
			});
	});

	//change tooltip title to original one when tooltip disappear
	tooltip._element.addEventListener("hidden.bs.tooltip", function () {
		copyToClipboardButton.setAttribute("data-bs-original-title", "Copy to clipboard");
	});

	//hide tooltip after button click on mouseleave
	tooltip._element.addEventListener("mouseleave", function () {
		tooltip.hide();
	});
}


async function removeClipInPopup(userId, clipId, clipContainer, cardBody) {
	const removeFromFavoriteButton = document.createElement("button");

	removeFromFavoriteButton.innerText = "X";
	removeFromFavoriteButton.classList.add("button", "remove-from-favorite-button-in-popup");

	removeFromFavoriteButton.addEventListener("click", () => {
		console.log("removeFromFavoriteButton.addEventListener");
		const confirmationModal = document.getElementById("confirmationModal");
		const confirmationDeleteButton = document.getElementById("confirmationDeleteButton");

		const confirmationDeleteButtonClickHandler = () => {
			console.log("confirmationDeleteButton.addEventListener");
			console.log(`Removing clip ${clipId} from favorites!`);
			removeClip(userId, clipId)
				.then((response) => {
					console.log(response);
					// remove existing button
					clipContainer.remove();
					// location.reload();
					modal.hide();
					loadPage();
				})
				.catch((error) => console.error(error));
		};

		confirmationDeleteButton.addEventListener("click", confirmationDeleteButtonClickHandler);

		confirmationModal.addEventListener("hidden.bs.modal", function () {
			confirmationDeleteButton.removeEventListener("click", confirmationDeleteButtonClickHandler);
		});

		const modal = new bootstrap.Modal(confirmationModal);
		modal.show();
	});

	clipContainer.appendChild(cardBody);
	cardBody.appendChild(removeFromFavoriteButton);
}

function searchClickHandler() {
	const searchButton = document.getElementById("search-button");

	searchButton.addEventListener("click", async () => {
		console.log("searchButton.addEventListener");
		event.preventDefault();
		currentPage = 1;

		const searchQuery = document.getElementById("search-input");

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
		// displayPagination(totalPages);
		loadPage();
	});
}



async function refreshAccessToken(refreshToken) {
	document.querySelector(".show-when-logged-out").style.display = "none";
	document.querySelector(".show-when-logged-in").style.display = "none";

	const newTokens = await getNewRefreshedTokens(refreshToken);

	console.log(newTokens)
	if (newTokens.status === 401 || newTokens.status === 400) {
		console.log("in refreshAccessToken error 401 or 400")
		logout()
		hideSpinner();
		initPage();
		return null;
	} else {
		await chrome.storage.local
			.set({
				accessToken: newTokens.access_token,
				refreshToken: newTokens.refresh_token,
			})
			.then(() => {
				console.log("new accessToken is set to " + newTokens.access_token);
				console.log("new refreshToken is set to " + newTokens.refresh_token);
			});
	
		const newAccessToken = newTokens.access_token;
	
		return newAccessToken;
	}
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
	console.log("code2", code)
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

function logout() {
	chrome.storage.local.remove(["accessToken", "refreshToken"], () => {
		console.log("Access token and refresh token removed.");
	});
}

function logoutButtonHandler() {
	const logoutButton = document.querySelector("#logout-button");

	logoutButton.addEventListener("click", () => {
		console.log("logout");
		logout();
		initPage();
	});
}

function hideSpinner() {
	const spinnerWrapper = document.getElementById("spinner-wrapper");
	const spinner = spinnerWrapper.querySelector(".spinner-border"); 

	if (spinner) {
		spinnerWrapper.remove();
	}
}

function showSpinner() {
	const spinnerWrapperExists = document.querySelector("#spinner-wrapper");
	console.log("spinnerWrapperExists", spinnerWrapperExists);
	if (spinnerWrapperExists) {
		return
	}

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
					console.log("code1", code)
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
const clipsPerPage = 9;

let totalPages;

let userId;

async function initPage(accessToken) {
	showSpinner();
	document.querySelector(".show-when-logged-out").style.display = "none";
	document.querySelector(".show-when-logged-in").style.display = "none";

	let username = await getUsername(accessToken);

	if (!username) {
		hideSpinner();
		document.querySelector(".show-when-logged-out").style.display = "block";
		document.querySelector(".show-when-logged-in").style.display = "none";
		loginViaTwitch();
		return;
	} 
	userId = username;

	loadPage();
	// hideSpinner();
	document.querySelector(".show-when-logged-out").style.display = "none";
	document.querySelector(".show-when-logged-in").style.display = "block";

}

let accessToken;

// loginViaTwitch();
searchClickHandler();
resetClickHandler();
logoutButtonHandler();

chrome.storage.local.get(["accessToken"]).then((result) => {
	accessToken = result.accessToken;
	initPage(accessToken);
});
