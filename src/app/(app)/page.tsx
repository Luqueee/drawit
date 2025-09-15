import User from "@/components/auth/User";
import Canvas from "@/components/board/Canvas";
import { HowTo } from "@/components/HowTo";
import { Leaderboard } from "@/components/Leaderboard";

export default function Home() {
  return (
    <div>
      <div className="fixed py-2 px-4 gap-2 top-1 right-1 z-50 flex flex-col items-end text-black ">
        <User />
        <HowTo />
        {/* <Leaderboard /> */}
      </div>
      <div className="w-screen h-[100dvh]">
        <Canvas
          width={3000}
          height={1080}
          initialScale={8} // prueba zoom inicial grande
          initRandomPoints={800} // puntos de prueba
        />
      </div>
    </div>
  );
}
