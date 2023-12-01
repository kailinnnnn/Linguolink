import api from "../../utils/firebaseApi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import googleIcon from "./google.avif";

const Signin = () => {
  const { user, login, isLogin } = useAuthStore();
  const [isRegistering, setRegistering] = useState(false);
  const [isNextPage, setIsNextPage] = useState(false);
  const [location, setLocation] = useState(null);
  const [firstPageFormData, setFirstPageFormData] = useState({});
  const navigate = useNavigate();
  const emailRef = useRef();
  const passwordRef = useRef();
  const nameRef = useRef();
  const birthdateRef = useRef();
  const nativeLanguageRef = useRef();
  const learningLanguageRef = useRef();
  const learningLanguageLevelRef = useRef();
  const alsoSpeakRef = useRef();
  const translateRef = useRef();
  const communicationStyleRef = useRef({
    textAndVoice: false,
    voiceAndVideo: false,
    meetings: false,
  });

  useEffect(() => {
    if (isLogin) {
      navigate("/community");
    }
  }, []);

  const handleGoogleLogin = async function () {
    const user = await api.loginWithGoogle();
    login(user);
    navigate("/community");
  };

  const handleNativeLogin = async () => {
    const user = await api.nativeSignin(
      emailRef.current.value,
      passwordRef.current.value,
    );
    login(user);
    navigate("/community");
  };

  const handleNativeRegister = async () => {
    try {
      const { email, password, name, birthdate } = firstPageFormData;

      const userEmailAndPassword = await api.nativeRegister(
        email,
        password,
        name,
        birthdate,
        location,
        nativeLanguageRef.current.value,
        alsoSpeakRef.current.value,
        learningLanguageRef.current.value,
        learningLanguageLevelRef.current.value,
        translateRef.current.value,
        communicationStyleRef.current,
      );
      console.log(userEmailAndPassword);
      const user = await api.nativeSignin(
        userEmailAndPassword.email,
        userEmailAndPassword.password,
      );
      login(user);
      navigate(`/profile/${user.id}`);
    } catch {
      (e) => {
        console.log(e);
        alert("註冊失敗");
      };
    }
  };

  const getLocation = () => {
    const apiKey = "AIzaSyBeawM8HzUy5PhrWyAjdWueZtuUtmhT9E4"; // 將 YOUR_GOOGLE_MAPS_API_KEY 替換為你的 API 金鑰

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // 使用 Google Maps API 進行反向地理編碼
        fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`,
        )
          .then((response) => response.json())
          .then((data) => {
            const addressComponents = data.results[0].address_components;
            console.log(addressComponents);
            let city, country;
            for (const component of addressComponents) {
              if (component.types.includes("administrative_area_level_1")) {
                city = component.long_name;
              }
              if (component.types.includes("country")) {
                country = component.long_name;
              }
            }

            setLocation({ lat: latitude, lng: longitude, city, country });
          })
          .catch((error) => {
            console.error("發生錯誤：", error);
          });
      },
      (error) => {
        console.error("獲取地理位置失敗：", error.message);
      },
    );
  };

  const handleNextPage = () => {
    setFirstPageFormData({
      email: emailRef.current.value,
      password: passwordRef.current.value,
      name: nameRef.current.value,
      birthdate: birthdateRef.current.value,
    });
    setIsNextPage(true);
  };

  const handleCheckboxChange = (value) => {
    communicationStyleRef.current[value] =
      !communicationStyleRef.current[value];
  };

  return (
    <>
      {!isRegistering ? (
        <div className="ml-28 flex flex-col items-center">
          <div className="mb-4">
            <label htmlFor="email" className="mr-2">
              Email
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
              Password
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
            Sign in
          </button>
          <button onClick={handleGoogleLogin} className="flex items-center">
            <img className=" h-12 w-12" src={googleIcon} />
            Login with Google
          </button>
          <div>
            Don't have an account yet?
            <button onClick={() => setRegistering(true)}>Create one</button>
          </div>
        </div>
      ) : (
        <div className="ml-28 ">
          Sign up
          {!isNextPage ? (
            <div>
              <div>
                <input
                  type="text"
                  className="border border-black"
                  ref={emailRef}
                  placeholder="Email"
                />
              </div>
              <div>
                <input
                  type="text"
                  className="border border-black"
                  ref={passwordRef}
                  placeholder="Password"
                />
              </div>
              <div>
                Name
                <input
                  type="text"
                  className="border border-black"
                  ref={nameRef}
                />
              </div>
              <div>
                BirthDate
                <input
                  name="birthdate"
                  type="date"
                  min="1930-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  ref={birthdateRef}
                />
              </div>
              <div>
                Location
                <button onClick={getLocation}>
                  {location
                    ? `${location.country},${location?.city ?? ""}`
                    : "Get location"}
                </button>
              </div>
              <button onClick={handleNextPage}>Next</button>
            </div>
          ) : (
            <div>
              <button onClick={() => setIsNextPage(false)}>
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div>
                My native language
                <select ref={nativeLanguageRef}>
                  <option>English</option>
                  <option>繁體中文</option> <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                I can also speak fluently.
                <select ref={alsoSpeakRef}>
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                I am learning
                <select ref={learningLanguageRef}>
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
                <select ref={learningLanguageLevelRef}>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>
              <div>
                Translate received messages into
                <select ref={translateRef}>
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div>
                Communication style
                <label>
                  <input
                    type="checkbox"
                    value="textAndVoice"
                    onChange={() => handleCheckboxChange("textAndVoice")}
                  />
                  text and voice messages
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="voiceAndVideo"
                    onChange={() => handleCheckboxChange("voiceAndVideo")}
                  />
                  voice or video calls
                </label>
                <label>
                  <input
                    type="checkbox"
                    value="meetings"
                    onChange={() => handleCheckboxChange("meetings")}
                  />
                  in-person meetings
                </label>
              </div>

              <button onClick={handleNativeRegister}>Submit</button>
            </div>
          )}
          <div>
            Have you created an account?
            <button onClick={() => setRegistering(false)}>Login</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Signin;
