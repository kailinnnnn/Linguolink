import { Link } from "react-router-dom";
const LinkStyles =
  "rounded-full bg-gray-300 w-16 h-16 flex items-center justify-center";
const iconStyles = "block text-xl text-white";

const Header = () => {
  return (
    <div className="flex w-28 flex-col items-center gap-4  p-6 ">
      <Link className={LinkStyles} to={`/profile`}>
        <i className={`fa-solid fa-user ${iconStyles}`}></i>
      </Link>
      <Link className={LinkStyles} to={`/community`}>
        <i className={`fa-solid fa-user-group ${iconStyles}`}></i>
      </Link>
      <Link className={LinkStyles}>
        <i
          className={`fa-solid fa-message ${iconStyles}`}
          to={`/chatrooms`}
        ></i>
      </Link>
      <Link className={LinkStyles}>
        <i className={`fa-solid fa-book-open ${iconStyles}`}></i>
      </Link>
    </div>
  );
};

export default Header;
