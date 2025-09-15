import { IconQuestionMark } from "@tabler/icons-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export const HowTo = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="bg-gray-300 group hover:cursor-pointer hover:bg-gray-500 transition-all duration-300 border-2 border-gray-500 rounded-full size-[40px] flex items-center justify-center"
        >
          <IconQuestionMark className="text-gray-700 group-hover:text-gray-300 transition-all duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="h-fit md:lg:w-[60vw] w-[90vw] bg-white/50 backdrop-blur-md text-slate-600">
        <DialogHeader>
          <DialogTitle>Como Pintar</DialogTitle>
          <DialogDescription className="mt-8 text-start flex flex-col gap-2">
            <p>Es muy sencillo:</p>
            <p className="font-bold">mueves con el click izquierdo</p>
            <p className="font-bold">scroll para zoom </p>
            <p className="font-bold">click derecho para pintar</p>
            <p className="font-bold">DISFRUTA Y CHILLEA</p>
            <p>
              Si te preguntas porque no he hecho que con espacio puedas
              rellenar, basicamente es porque no hay limite de pixeles jejeje,
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
