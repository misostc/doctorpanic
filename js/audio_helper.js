
// js/audio_helper.js

const AudioHelper = {
    audioInstances: {}, // Stores Audio objects by ID

    preload: function(id, path, volume = 1, loop = false) {
        if (this.audioInstances[id]) {
            console.warn(`Audio with ID ${id} already preloaded.`);
            return;
        }
        const audio = new Audio('../'+ path);
        audio.volume = volume;
        audio.loop = loop;
        audio.preload = 'auto'; // Suggest to preload
        this.audioInstances[id] = audio;
        console.log(`Preloaded audio: ${id} from ${path}`);
    },

    play: function(id) {
        const audio = this.audioInstances[id];
        if (audio) {
            audio.currentTime = 0; // Rewind to start
            audio.play().catch(e => console.error(`Error playing audio ${id}:`, e));
            console.log(`Playing audio: ${id}`);
        } else {
            console.warn(`Audio with ID ${id} not preloaded.`);
        }
    },

    loop: function(id) {
        const audio = this.audioInstances[id];
        if (audio) {
            audio.loop = true;
            audio.currentTime = 0; // Rewind to start
            audio.play().catch(e => console.error(`Error looping audio ${id}:`, e));
            console.log(`Looping audio: ${id}`);
        } else {
            console.warn(`Audio with ID ${id} not preloaded.`);
        }
    },

    stop: function(id) {
        const audio = this.audioInstances[id];
        if (audio) {
            audio.pause();
            audio.currentTime = 0; // Reset to start
            audio.loop = false; // Ensure loop is off when stopped
            console.log(`Stopped audio: ${id}`);
        } else {
            // If no ID is provided, stop all playing audio
            if (id === undefined) {
                for (const key in this.audioInstances) {
                    if (this.audioInstances[key].paused === false) {
                        this.audioInstances[key].pause();
                        this.audioInstances[key].currentTime = 0;
                        this.audioInstances[key].loop = false;
                        console.log(`Stopped all audio: ${key}`);
                    }
                }
            } else {
                console.warn(`Audio with ID ${id} not found for stopping.`);
            }
        }
    },

    // Stop all currently playing sounds
    stopAll: function() {
        for (const id in this.audioInstances) {
            const audio = this.audioInstances[id];
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
                audio.loop = false;
                console.log(`Stopped all audio: ${id}`);
            }
        }
    }
};
