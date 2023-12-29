import api from "../../utils/firebaseApi";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import bgImage from "./bg.jpg";
import { Checkbox } from "@nextui-org/react";
import googleMapApi from "../../utils/googleMapApi";

const Signin = () => {
  const { login, isLogin } = useAuthStore();
  const [isRegistering, setRegistering] = useState(false);
  const [isNextPage, setIsNextPage] = useState(false);
  const [location, setLocation] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [firstPageFormData, setFirstPageFormData] = useState({
    email: "",
    password: "",
    name: "",
    birthdate: "",
  });
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
  }, [isLogin]);

  const handleGoogleLogin = async function () {
    const user = await api.loginWithGoogle();
    login(user);
    navigate("/community");
  };

  const handleNativeLogin = async () => {
    try {
      const user = await api.nativeSignin(
        emailRef.current.value,
        passwordRef.current.value,
      );
      login(user);
      navigate("/community");
    } catch {
      (e) => {
        console.log(e);
        alert("登入失敗");
      };
    }
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

      const user = await api.nativeSignin(
        userEmailAndPassword.email,
        userEmailAndPassword.password,
      );
      login(user);
      navigate(`/community`);
    } catch {
      (e) => {
        console.log(e);
        alert("註冊失敗");
      };
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      googleMapApi.getLocation(latitude, longitude).then((location) => {
        setLocation({
          lat: latitude,
          lng: longitude,
          city: location.city,
          country: location.country,
        });
      });
      setIsFetchingLocation(false);
    });
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
    <div className="flex h-full min-h-screen w-full bg-purple500" src={bgImage}>
      {!isRegistering ? (
        <div className=" l-28 mx-auto flex  h-full min-h-screen w-2/3 flex-col items-center justify-center rounded-[30px] bg-gray100">
          <p className="mb-8 mr-2 text-3xl font-semibold tracking-wide">
            Sign in
          </p>
          <div className="mb-4 flex flex-col gap-2">
            <label htmlFor="email" className=" text-black ">
              Email
            </label>
            <input
              type="text"
              id="email"
              ref={emailRef}
              placeholder="Enter your email"
              defaultValue="albert@gmail.com"
              className="w-72 rounded-lg px-4 py-2 text-black"
            />
          </div>

          <div className="mb-5 flex flex-col gap-2">
            <label htmlFor="password" className=" text-black">
              Password
            </label>
            <input
              type="text"
              id="password"
              ref={passwordRef}
              defaultValue="aaaaaa"
              placeholder="Enter your password"
              className="k w-72 rounded-lg px-4 py-2 text-black"
            />
          </div>

          <button
            onClick={handleNativeLogin}
            className=" my-4 mb-6 w-72 rounded-lg border-2 bg-purple500 px-4 py-2 text-white"
          >
            Sign in
          </button>

          <p className="text-gray700">or login with</p>
          <div className="my-5 flex gap-3">
            <button onClick={handleGoogleLogin} className="flex  items-center ">
              <i className="fa-brands fa-google text-3xl text-purple500"></i>
            </button>

            <button
              onClick={handleGoogleLogin}
              disabled
              className="flex  items-center"
            >
              <i className="fa-brands fa-facebook text-3xl text-purple500"></i>
            </button>
          </div>

          <div className=" mb-5 flex">
            <p className="pr-2 text-gray700">Don't have an account yet?</p>
            <button
              onClick={() => setRegistering(true)}
              className="font-semibold underline "
            >
              Create one
            </button>
          </div>
        </div>
      ) : (
        <div className=" l-28 relative mx-auto flex h-full min-h-screen w-2/3 flex-col items-center justify-center rounded-[30px] bg-gray100 p-24">
          {!isNextPage ? (
            <div className="flex flex-col items-center justify-center">
              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="email">Email</label>
                <input
                  type="text"
                  className="w-72 rounded-lg px-4 py-2 text-black"
                  ref={emailRef}
                  placeholder="Email"
                />
              </div>
              <div className="mb-4 flex flex-col gap-2">
                <label htmlFor="password">Password</label>
                <input
                  type="text"
                  className="w-72 rounded-lg px-4 py-2 text-black"
                  ref={passwordRef}
                  placeholder="Password"
                />
              </div>
              <div className="mb-4 flex flex-col gap-2">
                <p>Name</p>
                <input
                  type="text"
                  className="w-72 rounded-lg px-4 py-2 text-black"
                  ref={nameRef}
                  placeholder="Name"
                />
              </div>
              <div className="mb-7 flex flex-col gap-2">
                <p> BirthDate</p>
                <input
                  name="birthdate"
                  type="date"
                  min="1930-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  ref={birthdateRef}
                  className="w-72 rounded-lg px-4 py-2 text-black"
                />
              </div>
              <div className="my-3 flex gap-4">
                <p> Location</p>
                <button
                  onClick={() => {
                    getLocation();
                    setIsFetchingLocation(true);
                  }}
                  className="text-purple500 underline"
                >
                  {location
                    ? `${location.country},${location?.city ?? ""}`
                    : isFetchingLocation
                      ? "Fetching..."
                      : "Get Location"}
                </button>
              </div>
              <button
                disabled={
                  !emailRef.current?.value ||
                  !passwordRef.current?.value ||
                  !nameRef.current?.value ||
                  !birthdateRef.current?.value ||
                  !location
                }
                onClick={() => {
                  handleNextPage();
                }}
                className=" my-4 mb-6 w-72 rounded-lg border-2 bg-purple500 px-4 py-2 text-white"
              >
                Next
              </button>
            </div>
          ) : (
            <div className=" flex flex-col items-center justify-center gap-2">
              <button
                onClick={() => {
                  setIsNextPage(false);
                  setLocation(null);
                }}
                className="text-1xl absolute left-16 top-12"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div className="mb-4 flex w-full flex-col gap-2">
                <small> My native language</small>
                <select
                  ref={nativeLanguageRef}
                  className=" rounded-lg px-4 py-2 text-black"
                >
                  <option>English</option>
                  <option>繁體中文</option> <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="mb-4 flex  w-full flex-col gap-2">
                <small> I can also speak fluently</small>
                <select
                  ref={alsoSpeakRef}
                  className="rounded-lg px-4 py-2 text-black"
                >
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="mb-4 flex w-full flex-col gap-2">
                <small> I am learning</small>
                <div className="flex w-full">
                  <select
                    ref={learningLanguageRef}
                    className="mr-2  w-full rounded-lg px-4 py-2 text-black"
                  >
                    <option>English</option>
                    <option>繁體中文</option>
                    <option>Français</option>
                    <option>Español</option>
                  </select>
                  <select
                    ref={learningLanguageLevelRef}
                    className=" rounded-lg px-4 py-2 text-black"
                  >
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>
              <div className="mb-4 flex w-full flex-col">
                <small className="mb-2">Translate received messages into</small>
                <select
                  ref={translateRef}
                  className=" rounded-lg px-4 py-2 text-black"
                >
                  <option>English</option>
                  <option>繁體中文</option>
                  <option>Français</option>
                  <option>Español</option>
                </select>
              </div>
              <div className="l ">
                <small className="mb-2"> Communication style</small>

                <div className=" flex">
                  <label className="mr-3">
                    <Checkbox
                      size="sm"
                      type="checkbox"
                      value="textAndVoice"
                      color="default"
                      onChange={() => handleCheckboxChange("textAndVoice")}
                    >
                      text and voice messages
                    </Checkbox>
                  </label>
                  <label className="mr-3">
                    <Checkbox
                      size="sm"
                      type="checkbox"
                      value="voiceAndVideo"
                      color="default"
                      onChange={() => handleCheckboxChange("voiceAndVideo")}
                    >
                      voice or video calls
                    </Checkbox>
                  </label>
                  <label className="mr-3">
                    <Checkbox
                      size="sm"
                      type="checkbox"
                      value="meetings"
                      color="default"
                      onChange={() => handleCheckboxChange("meetings")}
                    >
                      in-person meetings
                    </Checkbox>
                  </label>
                </div>
              </div>

              <button
                onClick={handleNativeRegister}
                className=" my-6 mb-7 w-72 rounded-lg border-2 bg-purple500 px-4 py-2 text-white"
              >
                Submit
              </button>
            </div>
          )}
          <div className="mb-4 flex">
            <p className="pr-2 text-gray700"> Have you created an account?</p>

            <button
              onClick={() => setRegistering(false)}
              className="font-semibold underline "
            >
              Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signin;
