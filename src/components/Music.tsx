"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pause, Play, Volume2Icon, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Slider } from "./ui/slider";
import { Howl } from "howler";

import { envs } from "@/env";
import { useMusicStore } from "@/stores/music.store";
const MAX_VOLUME = 1;
const STEP = 0.05;

export const MusicConfig = () => {
  const { volume, setVolume, muted, setMuted } = useMusicStore();
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const loadAudio = () => {
    if (!soundRef.current) {
      soundRef.current = new Howl({
        src: [`${envs.API_URL}/music`],
        html5: true,
        format: ["mp3"],
        volume,
        onplay: () => setIsPlaying(true),
        onend: () => setIsPlaying(false),
      });
    }

    soundRef.current.mute(muted);
  };

  useEffect(() => {
    loadAudio();
  }, []);

  useEffect(() => {
    soundRef.current?.volume(volume);
  }, [volume]);

  useEffect(() => {
    soundRef.current?.mute(muted);
  }, [muted]);

  useEffect(() => {
    console.log("isPlaying", isPlaying, muted);
    if (isPlaying) {
      soundRef.current?.play();
    } else {
      soundRef.current?.pause();
    }
  }, [isPlaying]);

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger className="buttonCanvas">
          <Volume2Icon />
        </PopoverTrigger>
        <PopoverContent align="start" side="left">
          <div className="flex items-center gap-4">
            <Slider
              onValueChange={(value) => setVolume(value[0])}
              defaultValue={[volume]}
              max={MAX_VOLUME}
              step={STEP}
            />
            <p className="text-xl font-bold">
              {Math.floor((100 * volume) / MAX_VOLUME)}
            </p>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <button onClick={toggleAudio}>
              {!isPlaying ? <Play /> : <Pause />}
            </button>
            <button onClick={() => setMuted(!muted)}>
              <VolumeX />
            </button>
          </div>
        </PopoverContent>
      </Popover>
      <button className="buttonCanvas" onClick={toggleAudio}>
        {!isPlaying ? <Play /> : <Pause />}
      </button>
    </>
  );
};
