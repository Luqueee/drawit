"use client";

import { Pixel, User } from "@/@types/pixel";
import { useState } from "react";
import axios from "axios";
import { envs } from "@/env";
import { useSession } from "next-auth/react";
export const usePixelData = () => {
  const { data: session } = useSession();
  const [pixelData, setPixelData] = useState<Pixel | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [pixelExist, setPixelExist] = useState<boolean>(false);
  const fetchPixelData = async (x: number, y: number) => {
    const { data } = await axios.get<{
      pixel: Pixel;
      user: User;
      found: boolean;
    }>(`${envs.API_URL}/pixels?x=${x}&y=${y}`, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });

    // console.log(data);
    setPixelExist(data.found);

    if (!data.found) {
      cleanData();
    }

    if (data.user && data.pixel) {
      setPixelData(data.pixel);
      setUserData(data.user);
    }
  };

  const cleanData = () => {
    setPixelData(null);
    setUserData(null);
  };

  return {
    pixelData,
    userData,
    cleanData,
    fetchPixelData,
  };
};
