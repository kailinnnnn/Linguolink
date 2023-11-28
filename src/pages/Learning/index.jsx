import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const Learning = () => {
  const { user } = useAuthStore();
  const [mainState, setMainState] = useState("savedWords");
  console.log(user);

  return (
    <div>
      <header>
        <button onClick={() => setMainState("savedWords")}>更正紀錄</button>
        <button onClick={() => setMainState("revised")}>單詞片語</button>
      </header>
      <main>
        {user ? (
          mainState === "revised" ? (
            user?.revised?.map((sent) => {
              <div>
                <h1>{sent.correctedSentence}</h1>
                <h2>{sent.wrongSentence}</h2>
              </div>;
            })
          ) : user.savedWords ? (
            user.savedWords.map((sent) => {
              <div>
                <h1>{sent.correctedSentence}</h1>
                <h2>{sent.wrongSentence}</h2>
              </div>;
            })
          ) : (
            <h1>請先儲存單字</h1>
          )
        ) : (
          <h1>請先登入</h1>
        )}
      </main>
    </div>
  );
};

export default Learning;
