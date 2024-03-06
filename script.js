var videoID = "dQw4w9WgXcQ";
var player;
var typed3;
var playing;
var room_id = "base32";

function println(phrases, next = null, typeSpeed = 40, loop = false) {
	if (typed3) {
		typed3.destroy();
	}
	typed3 = new Typed(".text", {
		strings: phrases,
		typeSpeed: typeSpeed,
		backSpeed: 0,
		smartBackspace: true,
		loop: false,
		shuffle: false,
		cursorChar: "",
		onComplete: () => {
			if (next) {
				next();
			}
		},
	});
}

function start() {
	phrases = [
		"What are you doing here?",
		"Haven't seen you in a while",
		'Can you click <button onclick="dia_1()">this</button> for me',
	];
	println(phrases);
}

function dia_1() {
	phrases = [
		"Thanks.",
		"now",
		"<p class='magic_text'>Drag this to the end </p><br> <input class='game_range' max=100 value=0 type='range' oninput='dia_3(this)'>",
	];
	println(phrases);
}

function dia_3(elm) {
	// console.log(elm.value);
	document.querySelector(".magic_text").style.backgroundPosition = `-${elm.value}% 50%`;
	if (elm.value != 100) return;
	phrases = [
		"Great job",
		"By the way",
		"I got something for you",
		"Let's see",
		"ah found it",
		"gimme a second ",
		"I'll tell you when it loads",
		" ",
	];
	println(phrases, dia_4, 60);
}

function dia_4() {
	phrases = [".", "..", "...", "still loading"];
	println(phrases, null, 40, true);
	matrix.getMessages(room_id);
	load_player();
}

function dia_5() {
	document.body.classList.add("shaky");
	phrases = [
		"oh no",
		"It's gigantic.",
		"lemme get this thing out",
		"You have no idea how much effort I put into this.",
		".....",
	];
	println(
		phrases,
		() => {
			setTimeout(() => {
				// typed3.stop();
				player.setVolume(50);
				player.playVideo();
				setTimeout(() => {
					failed();
				}, 3000);
			}, 100);
		},
		50,
		true
	);
}

async function load_player() {
	player = new YT.Player("player", {
		// height: window.innerHeight / 1.3,
		// width: window.innerWidth / 1.3,
		videoId: videoID,
		playerVars: {
			autoplay: 0,
			controls: 0,
			modestbranding: 1,
			loop: 0,
			playlist: videoID,
		},
		events: {
			onReady: () => {
				dia_5();
			},
			onStateChange: show,
		},
	});
}

function show(event) {
	if (event.data != YT.PlayerState.PLAYING) return;
	loop = setInterval(() => {
		if (player && player.getCurrentTime) {
			var currentTime = player.getCurrentTime();
			if (currentTime >= 0 && playing != 1) {
				clearInterval(loop);
				playing = 1;
				play();
				document.body.classList.remove("shaky");
				particles();
			}
		}
	}, 500);
}

function failed() {
	if (player.playerInfo.duration <= 0) {
		document.body.classList.remove("shaky");
		phrases = [
			"this not suppose to happen",
			"you can just click <a href='https://youtu.be/o-YBDTqX_ZU'> here </a>. please open a <a href='https://github.com/psw01/secret/issues'> issue </a> if you can ):",
		];
		println(phrases, () => {
			document.body.classList.remove("shaky");
		});
	}
}

function play() {
	document.querySelector("#player").style.display = "block";
	document.querySelector(".comment-box").style.visibility = "visible";
	document.body.style.color = "#eff871";
	comments();
	phrases = [
		"Did it work?",
		"Looks like it",
		"yikes",
		"You got rick rolled",
		"(: (: (:",
		"it's too dark in here",
		"lemme turn the lights on 💡",
	];
	println(
		phrases,
		() => {
			document.body.style.animationName = "lights";
			// document.querySelector("#comment-section").style.animationName = "lights";
		},
		100
	);
}

start();
// particles();
// dia_4();
// play();
