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
        <button type="button" className="group buttonCanvas ">
          <IconQuestionMark className=" group-hover:text-gray-300 transition-all duration-300 " />
        </button>
      </DialogTrigger>
      <DialogContent className="h-[50vh] md:lg:w-[60vw] w-[90vw]  bg-popover/80 backdrop-blur-md text-white">
        <DialogHeader>
          <DialogTitle className="text-3xl">
            Tutorial de como pintar
          </DialogTitle>
          <div className="mt-8 text-start flex flex-col gap-2">
            <p>Es muy sencillo:</p>
            <ol>
              <li className="font-bold">mueves con el click izquierdo</li>
              <li className="font-bold">scroll para zoom </li>
              <li className="font-bold">click derecho para pintar</li>
              <li className="font-bold">DISFRUTA Y CHILLEA</li>
            </ol>
            <p className="mt-8">
              Si te preguntas porque no he hecho que con espacio puedas
              rellenar, basicamente es porque no hay limite de pixeles jejeje,
            </p>

            {/* <p className="mt-8">
              Musica hecha por{" "}
              <a className="border-b-2 border-white" href="https://markox.dev/">
                Markox
              </a>{" "}
              en 15 minutos. Es una bestia
            </p> */}
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
