const buttonStyles = "rounded-full bg-gray-300 w-16 h-16";
const iconStyles = { color: "white" };

const Header = () => {
  return (
    <div className="flex w-28 flex-col items-center gap-4  p-6 ">
      <button className={buttonStyles}>
        <i className="fa-solid fa-user text-xl text-white"></i>
      </button>
      <button className={buttonStyles}>
        <i className="fa-solid fa-user-group text-xl text-white"></i>
      </button>
      <button className={buttonStyles}>
        <i className="fa-solid fa-message text-xl text-white"></i>
      </button>
      <button className={buttonStyles}>
        <i className="fa-solid fa-book-open text-xl text-white"></i>
      </button>
    </div>
  );
};

export default Header;
