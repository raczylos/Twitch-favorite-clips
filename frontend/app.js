async function addClip(userId, clipId) {
	const url = `http://127.0.0.1:5000/add_clip_to_favorites?user_id=${userId}&clip_id=${clipId}`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
	});
	return response.json();
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

function getClipId() {
	// const clipUrl = window.location.href
	let clipUrl = window.location.href;
	let clipId = clipUrl.match(/[^/]*$/)[0];

	return clipId;
}

async function refreshAccessToken(refreshToken) {
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

async function addButtonOnCreatedClip(userId) {
	const clipId = getClipId();
	// if (!clipId) return;

	//check if clip is already in fav list
	const isClipInFavorites = await isUserClipInFavorites(userId, clipId);

	const container = await waitForElm(".Layout-sc-1xcs6mc-0.jJplWu");

	const addClipButtonStyle = "add-to-favorite-button-in-created-clip";
	const removeClipButtonStyle = "remove-from-favorite-button-in-created-clip";

	if (isClipInFavorites.result) {
		removeFromFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
	} else {
		addToFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
	}
}

async function addButtonWhenCreatingClip(userId) {
	//check if clip is already in fav list
	const publishButton = await waitForElm("button.ScCoreButtonPrimary-sc-ocjdkq-1");

	publishButton.addEventListener("click", async function () {
		const inputElement = await waitForElm(".ScInputBase-sc-vu7u7d-0.ScInput-sc-19xfhag-0.gXVFsI.iXedIZ.InjectLayout-sc-1i43xsx-0.gWmDFd.tw-input");

		console.log("inputElement", inputElement);
		const clipUrl = inputElement.value;

		const clipId = clipUrl.split("/")[3];

		console.log("clipUrl", clipUrl);
		console.log("clipId", clipId);

		const container = await waitForElm(".Layout-sc-1xcs6mc-0.faJCen");
		container.classList.add("add-to-favorite-button-container");
		// const container = await waitForElm(".Layout-sc-1xcs6mc-0.dphleo.clips-sidebar-info");
		const isClipInFavorites = await isUserClipInFavorites(userId, clipId);

		const addClipButtonStyle = "add-to-favorite-button-when-creating-clip";
		const removeClipButtonStyle = "remove-from-favorite-button-when-creating-clip";

		if (isClipInFavorites.result) {
			removeFromFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
		} else {
			addToFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
		}
	});
}

async function addToFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle) {
	const favoriteButton = document.createElement("button");

	favoriteButton.innerText = "Add to favorite";
	favoriteButton.classList.add("button", addClipButtonStyle);

	favoriteButton.addEventListener("click", () => {
		if (!userId) {
			alert("Please login in the extension popup to add clip to favorite and then refresh the page.");

			return;
		}

		console.log(`Adding clip ${clipId} to favorites!`);
		addClip(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				favoriteButton.remove();
				// replace it with new remove button
				removeFromFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
			})
			.catch((error) => console.error(error));
	});

	container.appendChild(favoriteButton);
}

async function removeFromFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle) {
	const removeFromFavorite = document.createElement("button");

	removeFromFavorite.innerText = "remove from favorite";
	removeFromFavorite.classList.add("button", removeClipButtonStyle);

	removeFromFavorite.addEventListener("click", () => {
		console.log(`Removing clip ${clipId} from favorites!`);
		removeClip(userId, clipId)
			.then((response) => {
				console.log(response);
				// remove existing button
				removeFromFavorite.remove();
				// replace it with new add button
				addToFavoriteButton(userId, clipId, container, addClipButtonStyle, removeClipButtonStyle);
			})
			.catch((error) => console.error(error));
	});

	container.appendChild(removeFromFavorite);
}

async function getUsername(accessToken) {
	if (!accessToken) {
		return null;
	}
	const userInfo = await getUserInfo(accessToken);
	if (userInfo.status === 401) {
		console.log("Status 401");
		// const refreshToken = localStorage.getItem("refreshToken");

		chrome.storage.local.get(["refreshToken"]).then(async (result) => {
			console.log("Value currently is " + result.refreshToken);
			refreshToken = result.refreshToken;

			const newTokens = await refreshAccessToken(refreshToken);
			console.log("newTokens", newTokens);
			if (newTokens.status === 401) {
				// localStorage.removeItem("accessToken")
				// localStorage.removeItem("refreshToken")
				chrome.storage.local.remove(["accessToken", "refreshToken"], function () {
					let error = chrome.runtime.lastError;
					if (error) {
						console.error(error);
					}
				});
				return;
			}

			chrome.storage.local
				.set({
					accessToken: newTokens.access_token,
					refreshToken: newTokens.refresh_token,
				})
				.then(() => {
					console.log("accessToken is set to " + newTokens.access_token);
					console.log("refreshToken is set to " + newTokens.refresh_token);
				});

			const newAccessToken = newTokens.access_token;
			return await getUsername(newAccessToken);
		});
	}

	const username = userInfo.display_name;
	return username;
}

chrome.storage.local.get(["accessToken"]).then((result) => {
	let accessToken = result.accessToken;
	getUsername(accessToken).then((username) => {
		let userId = username;
		if (username) {
			if (window.location.href === "https://clips.twitch.tv/create") {
				addButtonWhenCreatingClip(userId);
			} else {
				addButtonOnCreatedClip(userId);
			}
		}
	});
});
