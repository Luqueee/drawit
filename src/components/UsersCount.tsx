"use client";

import { useCanvasStore } from "@/stores/canvas.store";

export const UsersCount: React.FC = () => {
  const { users } = useCanvasStore((state) => state);

  return (
    <div className="bg-popover rounded-full size-[40px] flex items-center justify-center ">
      <p className="text-white text-xl select-none">{users}</p>
    </div>
  );
};
