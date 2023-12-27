import { useState, useEffect } from "react";
import useAuthStore from "../../zustand/AuthStore";

const Learning = () => {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("correction");
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="ml-24 min-h-full w-[calc(100%-6rem)] bg-gray100 p-10">
      <header
        className={`fixed top-0 z-50 flex w-full  flex-wrap   py-6 ${
          scrollPosition > 0
            ? "bg-gray100"
            : "border-b-2 border-gray300 bg-gray100"
        }`}
      >
        {scrollPosition === 0 && (
          <h1 className={` mb-3 w-full pl-2 text-2xl font-semibold text-black`}>
            Learning
          </h1>
        )}

        <div
          className={`flex items-center justify-center ${
            scrollPosition > 0 && "mt-2"
          }`}
        >
          <button
            onClick={() => setCategory("correction")}
            className={`${
              category === "correction"
                ? "border-purple500 bg-purple500 text-white"
                : "border-gray500 text-gray500"
            } mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem] `}
          >
            <p className="pb-px">Correction</p>
          </button>
          <button
            onClick={() => setCategory("collection")}
            className={`${
              category === "collection"
                ? "border-purple500 bg-purple500 text-white"
                : "border-gray500 text-gray500"
            }  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p className="pb-px"> Collection</p>
          </button>

          <input
            type="text"
            placeholder="     Search correction or collection"
            className="text-gray ml-auto h-10 w-72 rounded-full bg-white"
          />
        </div>
      </header>

      <main
        className={`${scrollPosition === 0 ? "mt-[92px]" : "mt-10"} flex 
        flex-wrap  gap-5 pt-6`}
      >
        {category === "collection" &&
          user?.collections?.map((word, i) => {
            return (
              <div
                className=" h-fit w-fit  max-w-xs rounded-2xl  bg-white p-5"
                key={i}
              >
                <p className="font-semibold text-gray700">{word.word}</p>
                <div className="mb-5 mt-4  border-1 border-gray300" />
                <p className=" text-gray700">{word.note}</p>
              </div>
            );
          })}

        {category === "correction" &&
          user?.revised?.map((sent, i) => {
            return (
              <div
                className=" h-fit w-fit  max-w-xs rounded-2xl  bg-white p-5"
                key={i}
              >
                <p className="text-gray700">
                  <i className="fa-solid fa-xmark pr-2 text-red500"></i>
                  {sent.wrongSentence}
                </p>
                <div className="mb-5 mt-4  border-1 border-gray300" />
                <p className=" text-gray700">
                  <i className="fa-solid fa-check pr-2 text-green500"></i>
                  {sent.correctedSentence}
                </p>
              </div>
            );
          })}
      </main>
    </div>
  );
};

export default Learning;
