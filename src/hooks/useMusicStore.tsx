"use client";

import { useMusicStore } from "@/stores/music.store";

export const useMusic = () => {
  const { muted, setMuted, setVolume, volume } = useMusicStore(
    (state) => state
  );

  return { muted, setMuted, setVolume, volume };
};
