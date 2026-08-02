import { useEffect } from 'react';
import { GameProvider, useGame } from './lib/gameState';
import { audio } from './lib/audio';
import { SCREEN_BGM } from './game/constants';
import HomeScreen from './screens/HomeScreen';
import GameScreen from './screens/GameScreen';
import GachaScreen from './screens/GachaScreen';
import GardenScreen from './screens/GardenScreen';

function GameShell() {
  const { screen, state } = useGame();

  // Switch BGM whenever the screen changes.
  useEffect(() => {
    audio.playBgm(SCREEN_BGM[screen] ?? SCREEN_BGM.home);
  }, [screen]);

  // Keep audio mute toggles in sync.
  useEffect(() => {
    audio.setBgmOn(state.bgmOn);
  }, [state.bgmOn]);
  useEffect(() => {
    audio.setSfxOn(state.sfxOn);
  }, [state.sfxOn]);

  // Unlock audio on first user interaction (browser autoplay policy).
  useEffect(() => {
    const unlock = () => {
      audio.unlock();
      audio.playBgm(SCREEN_BGM.home);
    };
    window.addEventListener('pointerdown', unlock, { once: true });
    return () => window.removeEventListener('pointerdown', unlock);
  }, []);

  return (
    <div className="relative mx-auto h-screen w-full max-w-[480px] overflow-hidden bg-stone-50 shadow-2xl sm:h-[100dvh]">
      {screen === 'home' && <HomeScreen />}
      {screen === 'game' && <GameScreen />}
      {screen === 'gacha' && <GachaScreen />}
      {screen === 'garden' && <GardenScreen />}
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <GameShell />
    </GameProvider>
  );
}
