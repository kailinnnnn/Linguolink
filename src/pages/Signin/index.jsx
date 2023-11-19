import api from "../../utils/api";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";

const Signin = () => {
  const { setUser, logout, user } = useAuthStore();
  const [isRegistering, setRegistering] = useState(false);
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();

  const handleGoogleLogin = async function () {
    const user = await api.loginWithGoogle();
    setUser(user);
    console.log(user);
    navigate("/");
  };

  const handleNativeLogin = async () => {
    const user = await api.nativeSignin(
      emailRef.current.value,
      passwordRef.current.value,
    );
    console.log(user);
    setUser(user);
  };

  const handleNativeRegister = () => {
    console.log(emailRef.current.value, passwordRef.current.value);
    api.nativeRegister(
      emailRef.current.value,
      passwordRef.current.value,
      nameRef.current.value,
    );
  };

  return (
    <>
      {!user ? (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <label htmlFor="email" className="mr-2">
              帳號
            </label>
            <input
              type="text"
              id="email"
              className="border-2 p-1"
              ref={emailRef}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="mr-2">
              密碼
            </label>
            <input
              type="text"
              id="password"
              className="border-2 p-1"
              ref={passwordRef}
            />
          </div>

          <button
            onClick={handleNativeLogin}
            className="w-56 bg-gray-300 px-4 py-2"
          >
            登入
          </button>
          <button onClick={handleGoogleLogin} className="flex items-center">
            <img className=" h-12 w-12" src="/src/pages/Signin/google.png" />
            Login with Google
          </button>
          <div>
            還沒有帳號嗎？
            <button onClick={() => setRegistering(true)}>註冊</button>
          </div>
        </div>
      ) : (
        <p>{user.name}</p>
      )}

      {isRegistering && (
        <div>
          註冊帳密名
          <input type="text" className="border border-black" ref={emailRef} />
          <input
            type="text"
            className="border border-black"
            ref={passwordRef}
          />
          <input type="text" className="border border-black" ref={nameRef} />
          <input
            name="birthdate"
            type="date"
            min="1930-01-01"
            max={new Date().toISOString().split("T")[0]}
          />
          <select name="" id="">
            <option>Beginner"</option>
            <option>Intermediate</option> <option>Advanced</option>
          </select>
          <button onClick={handleNativeRegister}>Submit</button>
          <div>
            有帳號了嗎？
            <button onClick={() => setRegistering(false)}>登入</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
