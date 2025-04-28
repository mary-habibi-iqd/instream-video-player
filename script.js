/**
 * @description The video element holding the content
 * @type {HTMLVideoElement}
 */
let videoElement;

/**
 * @description tracks whether there are ads loaded - initially set to false
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
 * @description This class represents a container for displaying ads. The SDK will automatically create structures inside the containerElement parameter to house video and overlay ads.
 * @type {object}
 */
let adDisplayContainer;

/**
 * @description AdsLoader allows clients to request ads from ad servers. To do so, users must register for the AdsManagerLoadedEvent event and then request ads.
 * @type {object}
 */
let adsLoader;

/**
 * @description Provides the outer public API to the publisher and communicates with the inner instance of ads manager.
 * @type {object}
 */
let adsManager;

window.addEventListener("load", ()=> {
  videoElement = document.getElementById("video-element");
  videoElement.addEventListener("play", function (event) {
    loadAds(event);
  });

  /**
   * The playbutton sitting under the video element.
   * @type {HTMLButtonElement}
   */
  const playButton = document.getElementById("play-button");
  playButton.addEventListener("click", () => {
    videoElement.play();
  });

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
 * Initializes the the IMA API.
 *
 * - Adds click event for the ad-container
 * - Instantiates the IMA AdDisplayContainer class
 * - Instantiates the IMA AdsLoader class
 *   - Adds Eventlistener for "onloaded" and "error" to adsloader
 * - Instantiates the IMA Adsrequest and
 *   requests an ad with the given url
 * - Loads the Ad with the adsloader object
 *
 * @returns {void}
 */
function initializeIMA() {
  console.log("initializing IMA");

  adContainer = document.getElementById("ad-container");

  adContainer.addEventListener("click", adContainerClick);

  adDisplayContainer = new google.ima.AdDisplayContainer(
    adContainer,
    videoElement
  );

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

  // Let the AdsLoader know when the video has ended
  videoElement.addEventListener("ended", function () {
    adsLoader.contentComplete();
  });

  /**
   * @description A class for specifying properties of the ad request.
   * @type {object}
   * @constant
   */
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl =
    "https://pubads.g.doubleclick.net/gampad/ads?" +
    "iu=/183/ariva/videoplayer" +
    "&description_url=http%3A%2F%2Fwww.google.de" +
    "&cust_params=kw%3Dtest_mary_ulf" +
    "&tfcd=0" +
    "&npa=0" +
    "&sz=16x9%7C480x360%7C640x360%7C640x480" +
    "&gdfp_req=1" +
    "&output=vast" +
    "&env=vp" +
    "&unviewed_position_start=1" +
    "&impl=s" +
    "&correlator=";

  // Specify the linear and nonlinear slot sizes. This helps the SDK to
  // select the correct creative if multiple are returned.
  adsRequest.linearAdSlotWidth = videoElement.clientWidth;
  adsRequest.linearAdSlotHeight = videoElement.clientHeight;
  adsRequest.nonLinearAdSlotWidth = videoElement.clientWidth;
  adsRequest.nonLinearAdSlotHeight = videoElement.clientHeight / 3;

  // Pass the request to the adsLoader to request ads
  adsLoader.requestAds(adsRequest);
}

/**
 * Callback to Clicks
 *
 * Toggles play and pause on the videoElement
 *
 * @param {InputEvent} event
 *
 * @returns {void}
 */
function adContainerClick(event) {
  console.log("ad container clicked");
  if (videoElement.paused) {
    videoElement.play();
  } else {
    videoElement.pause();
  }
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  // Instantiate the AdsManager from the adsLoader response and pass it the video element
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
  }
}
function onContentPauseRequested() {
  videoElement.pause();
}

function onContentResumeRequested() {
  videoElement.play();
}

function onAdError(adErrorEvent) {
  // Handle the error logging.
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
}

function loadAds(event) {
  // Prevent this function from running on if there are already ads loaded
  if (adsLoaded) {
    return;
  }
  adsLoaded = true;

  // Prevent triggering immediate playback when ads are loading
  event.preventDefault();

  console.log("loading ads");

  // Initialize the container. Must be done via a user action on mobile devices.
  videoElement.load();
  adDisplayContainer.initialize();

  const width = videoElement.clientWidth;
  const height = videoElement.clientHeight;
  try {
    adsManager.init(width, height, google.ima.ViewMode.NORMAL);
    adsManager.start();
  } catch (adError) {
    // Play the video without ads, if an error occurs
    console.log("AdsManager could not be started");
    videoElement.play();
  }
}
