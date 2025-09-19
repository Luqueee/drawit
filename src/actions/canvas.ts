"use server"
import { auth, signIn } from "@/auth";
import { envs } from "@/env";
import axios from "axios";
import { redirect } from "next/navigation";

const API_URL = envs.API_URL
export const createPixelsAction = async ({
    pixels
}: {
    pixels: { x: number; y: number; color: number }[]
}) => {
    const session = await auth()
    // console.log("Session in createPixelAction:", session);
    if (!session) {

        console.error("No session, cannot create pixel")
        return signIn("google")
    }

    // console.log("Creating pixels:", pixels);

    await axios.post(`${API_URL}/pixels`, { pixels }, {
        headers: {
            Authorization: `Bearer ${session.accessToken}`
        }
    }).catch((error) => {
        console.error("Error creating pixels:", error);
    })

    return
}