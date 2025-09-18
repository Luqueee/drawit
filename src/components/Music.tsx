"use client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Pause, Play, Volume2Icon, VolumeX } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Slider } from "./ui/slider";
import { Howl } from "howler";

import { useMusicStore } from "@/stores/music.store";
import { useRadioGarden } from "@/hooks/useRadioGarden";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { IconRadio } from "@tabler/icons-react";
import { useDebouncedSync } from "@/hooks/useDebounce";
import { Input } from "./ui/input";
import { useIsMobile } from "@/hooks/use-window";
const MAX_VOLUME = 1;
const STEP = 0.02;

export const MusicConfig = () => {
  const { volume, setVolume, muted, setMuted } = useMusicStore();
  const isMobile = useIsMobile();
  const soundRef = useRef<Howl | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { searchRadios, getRadioStreamUrl, radioName, radios, radioUrl } =
    useRadioGarden();
  const [searchTerm, setSearchTerm] = useState<string>("flaixbac");
  const [currentRadioIndex, setCurrentRadioIndex] = useState<number>(-1);

  useEffect(() => {
    void searchRadios(searchTerm);
  }, []);

  useEffect(() => {
    soundRef.current?.volume(volume);
  }, [volume]);

  useEffect(() => {
    soundRef.current?.mute(muted);
  }, [muted]);

  const loadNextRadio = useCallback(() => {
    if (radios.length > 0) {
      const nextIndex = (currentRadioIndex + 1) % radios.length;
      setCurrentRadioIndex(nextIndex);
      getRadioStreamUrl(nextIndex);
    }
  }, [currentRadioIndex, radios, getRadioStreamUrl]);

  useEffect(() => {
    console.log("radioUrl changed", radioUrl, searchTerm);

    const stopAndUnloadCurrentStream = () => {
      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.unload();
        soundRef.current = null;
      }
    };

    stopAndUnloadCurrentStream();

    if (radioUrl) {
      console.log("Creating new Howl instance with URL:", radioUrl);
      setTimeout(() => {
        soundRef.current = new Howl({
          src: [radioUrl],
          html5: true,
          format: ["mp3"],
          volume,
          mute: muted,
          onload: () => {
            console.log("Howl loaded successfully");
            if (isPlaying) {
              soundRef.current?.play();
            }
          },
          onloaderror: () => {
            console.log("Error loading radio, trying next one");
            loadNextRadio();
          },
          onplay: () => setIsPlaying(true),
        });
      }, 100);
    }

    return stopAndUnloadCurrentStream;
  }, [radioUrl]);

  useEffect(() => {
    console.log("isPlaying", isPlaying, muted);
    soundRef.current?.volume(volume);

    if (isPlaying) {
      soundRef.current?.play();
    } else {
      soundRef.current?.pause();
    }
  }, [isPlaying]);

  const toggleAudio = () => {
    setIsPlaying((prev) => !prev);
  };

  const selectRadio = (idx: number) => {
    soundRef.current?.stop();
    setCurrentRadioIndex(idx);
    getRadioStreamUrl(idx);
  };

  useDebouncedSync(searchTerm, () => searchRadios(searchTerm), 1000);

  return (
    <>
      {/* Rest of the UI code unchanged */}
      {!isMobile && (
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
      )}
      <button className="buttonCanvas" onClick={toggleAudio}>
        {!isPlaying ? <Play /> : <Pause />}
      </button>
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="group buttonCanvas ">
            <IconRadio className=" group-hover:text-gray-300 transition-all duration-300 " />
          </button>
        </DialogTrigger>
        <DialogContent className="md:lg:h-[50vh] h-[80vh] flex flex-col gap-4  overflow-hidden md:lg:w-[60vw] w-[90vw] bg-popover/80 backdrop-blur-md text-white">
          <DialogHeader className="h-fit ">
            <DialogTitle className="text-3xl">Selecciona la radio</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            placeholder="Buscar radios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === " ") {
                e.stopPropagation();
              }
            }}
            className="h-10"
            // className="w-full px-3 py-2 mt-2 mb-4 text-black bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-1 overflow-y-scroll pr-4 h-full section">
            {radios.map((radio, idx) => (
              <button
                key={`${radio.title}-${idx}`}
                className={`my-2 hover:cursor-pointer p-2 rounded-lg text-start border transition-all duration-300  ${
                  currentRadioIndex === idx && radio.title == radioName
                    ? "bg-zinc-900 border-transparent"
                    : " bg-transparent border-zinc-700"
                }`}
                onClick={() => selectRadio(idx)}
              >
                {radio.title}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
