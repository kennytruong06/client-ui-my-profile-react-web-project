const NOTES = [523.25, 659.25, 783.99];

export function playChime() {
    try {
        const Context = window.AudioContext ?? window.webkitAudioContext;
        const audio = new Context();
        NOTES.forEach((frequency, index) => {
            const oscillator = audio.createOscillator();
            const gain = audio.createGain();
            const startAt = audio.currentTime + index * 0.22;
            oscillator.frequency.value = frequency;
            gain.gain.setValueAtTime(0.0001, startAt);
            gain.gain.exponentialRampToValueAtTime(0.25, startAt + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.9);
            oscillator.connect(gain).connect(audio.destination);
            oscillator.start(startAt);
            oscillator.stop(startAt + 1);
        });
    } catch {
        return;
    }
}
