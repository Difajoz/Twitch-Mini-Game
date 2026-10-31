// Original synth loop, generated locally. No samples or external audio.
export function startMusic(context: AudioContext) {
  const notes = [0, 7, 12, 7, 3, 10, 15, 10, 5, 12, 17, 12, 3, 10, 15, 7];
  const active = new Set<OscillatorNode>(); let beat = 0;
  const play = () => {
    const now = context.currentTime;
    const note = (frequency: number, duration: number, volume: number, type: OscillatorType) => {
      const osc = context.createOscillator(), gain = context.createGain(); osc.type = type;
      osc.frequency.setValueAtTime(frequency, now); gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + .012); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
      osc.connect(gain); gain.connect(context.destination); active.add(osc);
      osc.onended = () => { active.delete(osc); osc.disconnect(); gain.disconnect(); };
      osc.start(now); osc.stop(now + duration + .02);
    };
    note(220 * 2 ** (notes[beat % 16] / 12), .19, .018, 'triangle');
    if (beat % 2 === 0) note(55 * 2 ** ([0, 3, 5, 3][Math.floor(beat / 4) % 4] / 12), .25, .025, 'sine');
    if (beat % 4 === 0) note(65, .09, .035, 'sine');
    beat++;
  };
  play(); const timer = setInterval(play, 125);
  return () => { clearInterval(timer); active.forEach(osc => { try { osc.stop(); } catch {} }); active.clear(); };
}
