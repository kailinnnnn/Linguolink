import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const Learning = () => {
  const { user } = useAuthStore();
  const [category, setCategory] = useState("correction");
  console.log(user);

  useEffect(() => {
    console.log(category);
  }, [category]);

  return (
    <div className="bg-gray100 ml-24 min-h-full w-full p-10">
      <header className="fixed top-0 z-50 mt-6 flex h-24  w-full  flex-wrap ">
        <h1 className="mb-4 w-full pl-2 text-2xl font-semibold text-black">
          Learning
        </h1>

        <div className="flex items-center justify-center">
          <button
            onClick={() => setCategory("correction")}
            className={`${
              category === "correction"
                ? "bg-purple500 border-purple500 text-white"
                : "border-gray500 text-gray500"
            } text-darkGray  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p>Correction</p>
          </button>
          <button
            onClick={() => setCategory("collection")}
            className={`${
              category === "collection"
                ? "bg-purple500 border-purple500 text-white"
                : "border-gray500 text-gray500"
            } text-darkGray  mr-2 h-10 w-fit rounded-full border-2 px-6 py-[0.35rem]`}
          >
            <p> Collection</p>
          </button>

          <input
            type="text"
            placeholder="     Search member or topic"
            className="text-gray ml-auto h-11 w-72 rounded-full bg-white"
          />
        </div>
      </header>
      <div className="border-1 border-gray300  mb-5 mt-24 w-full" />
      <main className="flex flex-wrap gap-5 ">
        {category === "collection" &&
          user?.collections?.map((word, i) => {
            console.log(word);
            return (
              <div className=" h-fit w-fit  max-w-xs rounded-2xl  bg-white p-5">
                <p className="text-gray700 font-semibold">{word.word}</p>
                <div className="border-1 border-gray300  mb-5 mt-4" />
                <p className=" text-gray700">{word.note}</p>
              </div>
            );
          })}

        {category === "correction" &&
          user.revised.map((sent) => {
            console.log(sent);
            return (
              <div className=" h-fit w-fit  max-w-xs rounded-2xl  bg-white p-5">
                <p className="text-gray700">
                  <i className="fa-solid fa-xmark text-red500 pr-2"></i>
                  {sent.wrongSentence}
                </p>
                <div className="border-1 border-gray300  mb-5 mt-4" />
                <p className=" text-gray700">
                  <i className="fa-solid fa-check text-green500 pr-2"></i>
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
