import { Link } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
const LinkStyles =
  "rounded-full bg-gray-300 w-16 h-16 flex items-center justify-center";
const iconStyles = "block text-xl text-white";

const Header = () => {
  const { user } = useAuthStore();
  return (
    <div className="fixed flex w-28 flex-col items-center  gap-4 p-6 ">
      <Link className={LinkStyles} to={`/profile/${user?.id}`}>
        <i className={`fa-solid fa-user ${iconStyles}`}></i>
      </Link>
      <Link className={LinkStyles} to={`/community`}>
        <i className={`fa-solid fa-globe ${iconStyles}`}></i>
      </Link>
      <Link className={LinkStyles} to={`/chatrooms`}>
        <i className={`fa-solid fa-message ${iconStyles}`}></i>
      </Link>
      <Link className={LinkStyles} to={`/learning`}>
        <i className={`fa-solid fa-book-open ${iconStyles}`}></i>
      </Link>
    </div>
  );
};

export default Header;
