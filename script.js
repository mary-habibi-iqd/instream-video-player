
// Basic video player functionality
document.addEventListener('DOMContentLoaded', function () {
    const videoElement = document.getElementById('video-element');
    const playPauseButton = document.getElementById('play-pause-button');
    const muteButton = document.getElementById('mute-button');
    const volumeSlider = document.getElementById('volume-slider');
    const replayButton = document.getElementById('replay-button');
    const mainPlayButton = document.getElementById('play-button');
    const progressBar = document.getElementById('progress-bar');
    const progressContainer = document.getElementById('progress-container');
    const currentTimeDisplay = document.getElementById('current-time');
    const durationDisplay = document.getElementById('duration');

    // Initial state
    let isPlaying = false;

    // Format time in MM:SS
    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        seconds = Math.floor(seconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Play/Pause functionality
    function togglePlayPause() {
        if (videoElement.paused) {
            videoElement.play();
            playPauseButton.innerHTML = '<span class="icon">⏸</span>';
            mainPlayButton.style.display = 'none';
            isPlaying = true;
        } else {
            videoElement.pause();
            playPauseButton.innerHTML = '<span class="icon">▶</span>';
            isPlaying = false;
        }
    }

    // Mute/Unmute functionality
    function toggleMute() {
        videoElement.muted = !videoElement.muted;
        muteButton.innerHTML = videoElement.muted ?
            '<span class="icon">🔇</span>' :
            '<span class="icon">🔊</span>';
        volumeSlider.value = videoElement.muted ? 0 : videoElement.volume;
    }

    // Volume control
    function updateVolume() {
        videoElement.volume = volumeSlider.value;
        videoElement.muted = (volumeSlider.value === 0);
        muteButton.innerHTML = (volumeSlider.value === 0) ?
            '<span class="icon">🔇</span>' :
            '<span class="icon">🔊</span>';
    }

    // Replay functionality
    function replayVideo() {
        videoElement.currentTime = 0;
        if (!isPlaying) {
            togglePlayPause();
        }
    }

    // Update progress bar
    function updateProgress() {
        const progress = (videoElement.currentTime / videoElement.duration) * 100;
        progressBar.style.width = `${progress}%`;

        // Update time display
        currentTimeDisplay.textContent = formatTime(videoElement.currentTime);
        durationDisplay.textContent = formatTime(videoElement.duration);
    }

    // Seek functionality
    function seek(e) {
        const rect = progressContainer.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / progressContainer.offsetWidth;
        videoElement.currentTime = pos * videoElement.duration;
    }

    // Load metadata
    videoElement.addEventListener('loadedmetadata', function () {
        durationDisplay.textContent = formatTime(videoElement.duration);
    });

    // Event listeners
    playPauseButton.addEventListener('click', togglePlayPause);
    muteButton.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', updateVolume);
    replayButton.addEventListener('click', replayVideo);
    mainPlayButton.addEventListener('click', togglePlayPause);
    videoElement.addEventListener('timeupdate', updateProgress);
    progressContainer.addEventListener('click', seek);

    videoElement.addEventListener('ended', function () {
        playPauseButton.innerHTML = '<span class="icon">▶</span>';
        mainPlayButton.style.display = 'block';
        isPlaying = false;
    });
});
