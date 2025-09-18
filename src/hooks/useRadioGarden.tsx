"use client";

import { RadioSearchResponse, Result } from "@/@types/radioGarden";
import { envs } from "@/env";
import axios from "axios";
import { useState } from "react";
const fallbackRadio =
  "http://radio.garden/api/ara/content/listen/DAGbKjpw/channel.mp3";
export const useRadioGarden = () => {
  const client = axios.create({
    baseURL: envs.API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const [radios, setRadios] = useState<Result[]>([]);
  const [radioUrl, setRadioUrl] = useState<string>(fallbackRadio);
  const [radioName, setRadioName] = useState<string>("");
  const searchRadios = async (searchTerm: string) => {
    try {
      const response = await client.get<RadioSearchResponse>(
        `/radiogarden/${searchTerm}`
      );

      console.log("searchRadios response:", response.data);
      setRadios((prev) => response.data.results);
      //   return response.data;
    } catch (error) {
      console.error("Error searching radios:", error);
      return null;
    }
  };

  const getRadioStreamUrl = (idx: number) => {
    const selectedRadio = radios[idx];
    setRadioName(selectedRadio.title || "Unknown Radio");
    return setRadioUrl(selectedRadio?.url || fallbackRadio);
  };

  return {
    radios,
    radioUrl,
    radioName,

    searchRadios,
    getRadioStreamUrl,
  };
};
