import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const Learning = () => {
  const { user } = useAuthStore();
  const [mainState, setMainState] = useState("savedWords");
  console.log(user);

  return (
    <div className="ml-28">
      <header>
        <button onClick={() => setMainState("savedWords")}>單詞片語</button>
        <button onClick={() => setMainState("revised")}>更正紀錄</button>
      </header>
      <main>
        {user ? (
          mainState === "savedWords" ? (
            user?.savedWords?.map((word, i) => {
              console.log(word);
              return (
                <div key={i}>
                  <h1>{word.word}</h1>
                  <h1>{word.note}</h1>
                </div>
              );
            })
          ) : user.revised ? (
            user.revised.map((sent) => {
              <div>
                <h1>{sent.correctedSentence}</h1>
                <h2>{sent.wrongSentence}</h2>
              </div>;
            })
          ) : (
            <h1>尚未有被修正的句子</h1>
          )
        ) : (
          <h1>請先登入</h1>
        )}
      </main>
    </div>
  );
};

export default Learning;
