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

async function addButton(userId) {
	const clipId = getClipId();
	console.log("clipId", clipId);
	// if (!clipId) return;
	if (!userId) {
	}

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
		console.log("clipId", clipId);
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
				removeFromFavoriteButton(userId, clipId, container);
			})
			.catch((error) => console.error(error));
	});

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

async function getUsername(accessToken) {
	if (!accessToken) {
		return null;
	}
	const userInfo = await getUserInfo(accessToken);
	if (userInfo.status === 401) {
		// const refreshToken = localStorage.getItem("refreshToken");

		chrome.storage.local.get(["refreshToken"]).then(async (result) => {
			console.log("Value currently is " + result.refreshToken);
			refreshToken = result.refreshToken;

			const newTokens = await refreshAccessToken(refreshToken);
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
		if(username) {
			addButton(userId);
		}
	});
});
