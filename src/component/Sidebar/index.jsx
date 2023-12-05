import { Link } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import { useState } from "react";
import { Divider } from "@nextui-org/react";

const LinkStyles = ` rounded-full bg-gray-300 w-16 h-16 flex items-center justify-center `;
const iconStyles = "block text-xl text-gray500 ";

const Header = () => {
  const { user } = useAuthStore();
  const [currentCategory, setCurrentCategory] = useState("community");
  return (
    user && (
      <div className=" fixed flex h-full w-24 flex-col items-center  p-3">
        <div className="border-gray300 my-3 flex h-12 w-12 items-center justify-center rounded-full border-2">
          <div className=" h-10 w-10 overflow-hidden rounded-full">
            <img
              src={user.profilePicture}
              className="h-full w-full object-cover"
              alt=""
            />
          </div>
        </div>
        <Link
          className={`${LinkStyles}`}
          to={`/profile/${user?.id}`}
          onClick={() => {
            setCurrentCategory("profile");
          }}
        >
          <i
            className={`fa-solid fa-user  ${iconStyles} ${
              currentCategory === "profile" && "text-purple500"
            }`}
          ></i>
        </Link>
        <Link
          className={`${LinkStyles} `}
          to={`/community`}
          onClick={() => {
            setCurrentCategory("community");
          }}
        >
          <i
            className={`fa-solid fa-globe ${iconStyles}${
              currentCategory === "community" && "text-purple500"
            }`}
          ></i>
        </Link>

        <Link
          className={LinkStyles}
          to={`/chatrooms`}
          onClick={() => {
            setCurrentCategory("chatrooms");
          }}
        >
          <i
            className={`fa-solid fa-message ${iconStyles} ${
              currentCategory === "chatrooms" && "text-purple500"
            }`}
          ></i>
        </Link>

        <Link
          className={LinkStyles}
          to={`/learning`}
          onClick={() => {
            setCurrentCategory("learning");
          }}
        >
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
