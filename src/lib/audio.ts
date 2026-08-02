import { ASSETS } from '../game/constants';

// ---------------------------------------------------------------------------
// AudioManager — lazy-loaded BGM + SFX with mute toggles.
// Audio files are .m4a, which browsers play via HTMLAudioElement.
// Each clip is created on demand and cached so replay is instant.
// ---------------------------------------------------------------------------

type ClipName =
  | 'click'
  | 'babyCry'
  | 'teenCry'
  | 'adultCry'
  | 'gachaSpin'
  | 'gachaDrop';

const CLIP_PATH: Record<ClipName, string> = {
  click: ASSETS.audio.click,
  babyCry: ASSETS.audio.babyCry,
  teenCry: ASSETS.audio.teenCry,
  adultCry: ASSETS.audio.adultCry,
  gachaSpin: ASSETS.audio.gachaSpin,
  gachaDrop: ASSETS.audio.gachaDrop,
};

class AudioManager {
  private bgm: HTMLAudioElement | null = null;
  private bgmUrl: string | null = null;
  private clips: Partial<Record<ClipName, HTMLAudioElement>> = {};
  private bgmOn = true;
  private sfxOn = true;
  private started = false;

  setBgmOn(on: boolean) {
    this.bgmOn = on;
    if (this.bgm) {
      this.bgm.muted = !on;
      if (on && this.started) void this.bgm.play().catch(() => {});
    }
  }

  setSfxOn(on: boolean) {
    this.sfxOn = on;
  }

  /** Must be called from a user gesture to satisfy autoplay policies. */
  unlock() {
    if (this.started) return;
    this.started = true;
    if (this.bgm && this.bgmOn) void this.bgm.play().catch(() => {});
  }

  playBgm(url: string) {
    if (this.bgmUrl === url && this.bgm) {
      if (this.bgmOn && this.started) void this.bgm.play().catch(() => {});
      return;
    }
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.src = '';
    }
    this.bgmUrl = url;
    this.bgm = new Audio(url);
    this.bgm.loop = true;
    this.bgm.volume = 0.45;
    this.bgm.muted = !this.bgmOn;
    if (this.started && this.bgmOn) void this.bgm.play().catch(() => {});
  }

  stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
    }
  }

  private clip(name: ClipName): HTMLAudioElement {
    let el = this.clips[name];
    if (!el) {
      el = new Audio(CLIP_PATH[name]);
      el.volume = 0.6;
      this.clips[name] = el;
    }
    return el;
  }

  playSfx(name: ClipName) {
    if (!this.sfxOn) return;
    const el = this.clip(name);
    el.currentTime = 0;
    void el.play().catch(() => {});
  }
}

export const audio = new AudioManager();
