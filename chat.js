class MessageRetriever {
	constructor() {
		this.serverURL = "https://matrix.cactus.chat:8448";
		this.guestAccessToken = null;
		this.guestUserId = null;
		this.roomId = null;
		this.messages = [];
	}

	async getMessages(roomName) {
		await this.getRoomId(roomName);
		await this.registerAsGuest();
		await this.change_name("name");
		await this.joinRoomAsGuest();
		return await this.fetchMessages();
	}

	async getRoomId(roomName) {
		const response = await fetch(
			// `${this.serverURL}/_matrix/client/r0/directory/room/%23comments_cactus.chat_${roomName}%3Acactus.chat`
			`${this.serverURL}/_matrix/client/r0/directory/room/%23comments_${roomName}_section1%3Acactus.chat`
		);
		const data = await response.json();
		this.roomId = data["room_id"];
	}

	async registerAsGuest() {
		const response = await fetch(`${this.serverURL}/_matrix/client/r0/register?kind=guest`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});
		const { access_token: guestAccessToken, user_id: guestUserId } = await response.json();
		console.log(guestUserId);

		this.guestAccessToken = guestAccessToken;
		this.guestUserId = guestUserId;
	}

	async joinRoomAsGuest() {
		await fetch(`${this.serverURL}/_matrix/client/r0/join/${encodeURIComponent(this.roomId)}`, {
			method: "POST",
			headers: {
				Authorization: `Bearer ${this.guestAccessToken}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({}),
		});
	}

	async writeComment(messageBody) {
		const txnId = Date.now();
		await fetch(
			`${this.serverURL}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/send/m.room.message/${txnId}`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${this.guestAccessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					msgtype: "m.text",
					body: messageBody,
				}),
			}
		);
	}

	async fetchMessages() {
		console.log("fetching comments");
		this.messages = [];
		const response = await fetch(
			`${this.serverURL}/_matrix/client/r0/rooms/${encodeURIComponent(this.roomId)}/messages?dir=b&limit=75`,
			{
				headers: {
					Authorization: `Bearer ${this.guestAccessToken}`,
					"Content-Type": "application/json",
				},
			}
		);

		const data = await response.json();
		for (const item in data.chunk) {
			if (Object.hasOwnProperty.call(data.chunk, item)) {
				const msg = data.chunk[item];
				if (msg["type"] === "m.room.message" && msg["content"]["body"]) {
					this.messages.push(msg["content"]["body"]);
				}
			}
		}
		console.log("finished");
		return this.messages;
	}

	async change_name(name) {
		const response = await fetch(
			`${this.serverURL}/_matrix/client/r0/profile/${encodeURIComponent(this.guestUserId)}/displayname`,
			{
				method: "PUT",
				headers: {
					Authorization: `Bearer ${this.guestAccessToken}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					displayname: name,
				}),
			}
		);
	}
}
const matrix = new MessageRetriever();

async function comments() {
	document.querySelector(".comments").style.visibility = "visible";
	texts = matrix.messages;
	console.log(texts);
	const commentSection = document.querySelector(".comments");
	delayBetweenDrops = 2500;
	for (let i = 0; i < texts.length; i++) {
		setTimeout(() => {
			comment = document.createElement("span");
			comment.innerText = texts[i].length > 77 ? texts[i].slice(0, 77) + "..." : texts[i];
			comment.style.left = `${Math.random() * 90}dvw`;
			comment.className = "drop_comment";

			commentSection.append(comment);
		}, i * delayBetweenDrops);
	}
}

document.querySelector("#comment-section").addEventListener("submit", (e) => {
	e.preventDefault();
	matrix.writeComment(e.target[0].value);
	e.target[0].value = "";
	e.target.style.visibility = "hidden";
});
