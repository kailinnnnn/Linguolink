import useAuthStore from "../../zustand/AuthStore";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import useVideoStore from "../../zustand/VideoStore";

const LinkStyles = ` rounded-full bg-gray-300 w-16 h-16 flex items-center justify-center `;
const iconStyles = "block text-xl text-gray500 ";

const Header = () => {
  const { user, isLogin } = useAuthStore();
  const [currentCategory, setCurrentCategory] = useState("community");
  const { isVideoOpen, setIsVideoOpen } = useVideoStore();
  const location = useLocation();

  useEffect(() => {
    // 根據路徑進行相應的處理
    const path = location.pathname.split("/")[1];
    switch (path) {
      case "profile":
        setCurrentCategory("profile");
        break;
      case "community":
        setCurrentCategory("community");
        break;
      case "chatrooms":
        setCurrentCategory("chatrooms");
        break;
      case "learning":
        setCurrentCategory("learning");
        break;
      default:
        break;
    }
  }, [location.pathname]);

  return (
    user &&
    isLogin && (
      <div
        className={` fixed flex h-full w-24 flex-col items-center  p-3 ${
          isVideoOpen ? "bg-[#000000]" : ""
        }`}
      >
        <div className="my-3 flex h-12 w-12 items-center justify-center rounded-full border-2 border-gray300">
          <div className=" h-10 w-10 overflow-hidden rounded-full">
            <img
              src={user.profilePicture}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
        </div>
        <Link className={`${LinkStyles}`} to={`/profile/${user?.id}`}>
          <i
            className={`fa-solid fa-user  ${iconStyles} ${
              currentCategory === "profile" && "text-purple500"
            }`}
          ></i>
        </Link>
        <Link className={`${LinkStyles} `} to={`/community`}>
          <i
            className={`fa-solid fa-globe ${iconStyles}${
              currentCategory === "community" && "text-purple500"
            }`}
          ></i>
        </Link>

        <Link className={LinkStyles} to={`/chatrooms`}>
          <i
            className={`fa-solid fa-message ${iconStyles} ${
              currentCategory === "chatrooms" && "text-purple500"
            }`}
          ></i>
        </Link>

        <Link className={LinkStyles} to={`/learning`}>
          <i
            className={`fa-solid fa-book-open ${iconStyles} ${
              currentCategory === "learning" && "text-purple500"
            }`}
          ></i>
        </Link>
        {/* <p className="font-courgette">LinguoLink</p> */}
      </div>
    )
  );
};

export default Header;
