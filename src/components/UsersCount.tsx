"use client";

import { useCanvasProvider } from "./board/CanvasProvider";

export const UsersCount: React.FC = () => {
  const { users } = useCanvasProvider();

  return (
    <div className="bg-popover rounded-full size-[40px] flex items-center justify-center ">
      <p className="text-white text-xl select-none">{users}</p>
    </div>
  );
};
