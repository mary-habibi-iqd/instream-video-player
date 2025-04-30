/**
 * @description The video element holding the content
 * @type {HTMLVideoElement}
 */
let videoElement;

/**
 * @description Tracks whether there are ads loaded - initially set to false
 * @default
 * @type {boolean}
 */
let adsLoaded = false;

/**
 * @description The container for the ads that sits over the video element with content.
 * @type {HTMLElement}
 */
let adContainer;

/**
 * @description This class represents a container for displaying ads.
 * @type {object}
 */
let adDisplayContainer;

/**
 * @description AdsLoader allows clients to request ads from ad servers.
 * @type {object}
 */
let adsLoader;

/**
 * @description Provides the outer public API to the publisher.
 * @type {object}
 */
let adsManager;

/**
 * @description Tracks if the video is muted
 * @type {boolean}
 */
let isMuted = false;

window.addEventListener("load", () => {
    videoElement = document.getElementById("video-element");
    videoElement.addEventListener("play", function (event) {
        loadAds(event);
    });

    const playButton = document.getElementById("play-button");
    playButton.addEventListener("click", () => {
        videoElement.play();
        updatePlayPauseButton();
    });

    // Custom control event listeners
    const playPauseButton = document.getElementById("play-pause-button");
    const muteButton = document.getElementById("mute-button");
    const volumeSlider = document.getElementById("volume-slider");
    const replayButton = document.getElementById("replay-button");

    playPauseButton.addEventListener("click", togglePlayPause);
    muteButton.addEventListener("click", toggleMute);
    volumeSlider.addEventListener("input", adjustVolume);
    replayButton.addEventListener("click", replayVideo);

    initializeIMA();
});

window.addEventListener("resize", () => {
    console.log("window resized");
    if (adsManager) {
        const width = videoElement.clientWidth;
        const height = videoElement.clientHeight;
        adsManager.resize(width, height, google.ima.ViewMode.NORMAL);
    }
});

/**
 * Toggles play/pause state and updates button icon
 */
function togglePlayPause() {
    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
    updatePlayPauseButton();
}

/**
 * Updates the play/pause button icon
 */
function updatePlayPauseButton() {
    const playPauseButton = document.getElementById("play-pause-button");
    playPauseButton.textContent = videoElement.paused ? "▶️" : "⏸️";
}

/**
 * Toggles mute state and updates button icon
 */
function toggleMute() {
    isMuted = !isMuted;
    videoElement.muted = isMuted;
    const muteButton = document.getElementById("mute-button");
    muteButton.textContent = isMuted ? "🔇" : "🔊";
}

/**
 * Adjusts volume based on slider input
 */
function adjustVolume() {
    const volumeSlider = document.getElementById("volume-slider");
    videoElement.volume = volumeSlider.value;
    videoElement.muted = volumeSlider.value == 0;
    isMuted = videoElement.muted;
    const muteButton = document.getElementById("mute-button");
    muteButton.textContent = isMuted ? "🔇" : "🔊";
}

/**
 * Replays the video from the beginning
 */
function replayVideo() {
    videoElement.currentTime = 0;
    videoElement.play();
    updatePlayPauseButton();
}

function initializeIMA() {
    console.log("initializing IMA");

    adContainer = document.getElementById("ad-container");

    adContainer.addEventListener("click", adContainerClick);

    adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, videoElement);

    adsLoader = new google.ima.AdsLoader(adDisplayContainer);

    adsLoader.addEventListener(
        google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded,
        false
    );
    adsLoader.addEventListener(
        google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdError,
        false
    );

    videoElement.addEventListener("ended", function () {
        if (adsLoader) {
            adsLoader.contentComplete();
        }
    });

    const adsRequest = new google.ima.AdsRequest();
    //adsRequest.adTagUrl = `https://pubads.g.doubleclick.net/gampad/ads?iu=/183/iqd_videoplayer/videoplayer&description_url=${encodeURIComponent(window.location.href)}&cust_params=kw%3Dmary_testplayer&ad_rule=0&tfcd=0&pmad=2&pos=pre&npa=0&sz=16x9%7C480x360%7C640x360%7C640x480&gdfp_req=1&output=vast&env=vp&unviewed_position_start=1&impl=s&correlator=${Date.now()}`;

    adsRequest.adTagUrl =
        "https://pubads.g.doubleclick.net/gampad/ads?" +
        "iu=/183/iqd_videoplayer/videoplayer" +
        "&description_url=" + encodeURIComponent(window.location.href) +
        "&cust_params=kw%3Dmary_testplayer" +
        "&ad_rule=1" +
        "&tfcd=0" +
        "&npa=0" +
        "&sz=16x9%7C480x360%7C640x360%7C640x480" +
        "&gdfp_req=1" +
        "&output=vast" +
        "&env=vp" +
        "&unviewed_position_start=1" +
        "&impl=s" +
        "&correlator=" + Date.now();

    console.log("adTagUrl: ", adsRequest.adTagUrl);



    adsRequest.linearAdSlotWidth = videoElement.clientWidth;
    adsRequest.linearAdSlotHeight = videoElement.clientHeight;
    adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
    adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

    adsLoader.requestAds(adsRequest);
}

function adContainerClick(event) {
    if (adsManager && adsManager.getCurrentAd()) {
        return; // Let IMA handle ad clicks
    }
    console.log("ad container clicked");
    if (videoElement.paused) {
        videoElement.play();
    } else {
        videoElement.pause();
    }
    updatePlayPauseButton();
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
    adsManager = adsManagerLoadedEvent.getAdsManager(videoElement);
    adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, onAdError);
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
        onContentPauseRequested
    );
    adsManager.addEventListener(
        google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
        onContentResumeRequested
    );
    adsManager.addEventListener(google.ima.AdEvent.Type.LOADED, onAdLoaded);
}

function onAdLoaded(adEvent) {
    var ad = adEvent.getAd();
    if (!ad.isLinear()) {
        videoElement.play();
        updatePlayPauseButton();
    }
}

function onContentPauseRequested() {
    videoElement.pause();
    updatePlayPauseButton();
}

function onContentResumeRequested() {
    videoElement.play();
    updatePlayPauseButton();
}

function onAdError(adErrorEvent) {
    console.log(adErrorEvent.getError());
    if (adsManager) {
        adsManager.destroy();
    }
    videoElement.play();
    updatePlayPauseButton();
}

function loadAds(event) {
    if (adsLoaded) {
        return;
    }
    adsLoaded = true;

    event.preventDefault();

    console.log("loading ads");

    videoElement.load();
    adDisplayContainer.initialize();

    const width = videoElement.clientWidth;
    const height = videoElement.clientHeight;
    try {
        adsManager.init(width, height, google.ima.ViewMode.NORMAL);
        adsManager.start();
    } catch (adError) {
        console.log("AdsManager could not be started");
        videoElement.play();
        updatePlayPauseButton();
    }
}