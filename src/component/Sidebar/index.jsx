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
  const { isVideoOpen } = useVideoStore();
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.split("/")[1];
    const categoryMap = {
      profile: "profile",
      community: "community",
      chatrooms: "chatrooms",
      learning: "learning",
    };

    if (categoryMap[path]) {
      setCurrentCategory(categoryMap[path]);
    }
  }, [location.pathname]);

  const links = [
    {
      to: `/profile/${user?.id}`,
      icon: "fa-solid fa-user",
      category: "profile",
    },
    { to: "/community", icon: "fa-solid fa-globe", category: "community" },
    { to: "/chatrooms", icon: "fa-solid fa-message", category: "chatrooms" },
    { to: "/learning", icon: "fa-solid fa-book-open", category: "learning" },
  ];

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
            />
          </div>
        </div>
        {links.map(({ to, icon, category }, index) => (
          <Link key={index} className={`${LinkStyles}`} to={to}>
            <i
              className={`fa-solid ${icon} ${iconStyles} ${
                currentCategory === category && "text-purple500"
              }`}
            ></i>
          </Link>
        ))}
      </div>
    )
  );
};

export default Header;
