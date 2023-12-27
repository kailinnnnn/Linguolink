import { forwardRef } from "react";
import useVideoStore from "../../zustand/VideoStore";

const Header = forwardRef((props, ref) => {
  const { chatPartner } = props;
  const { isVideoOpen, setIsVideoOpen } = useVideoStore();
  const handleVideoCall = async () => {
    setIsVideoOpen(true);
    ref.current = "offer";
  };

  return (
    <header className="fixed top-0 z-10 flex h-20  w-[calc((100vw-96px)*0.725)] items-center border-b-2 border-gray300 bg-white p-6 ">
      <div
        className="mr-4  flex h-10 min-h-fit w-10 min-w-fit items-center overflow-visible rounded-full border-white"
        onMouseOver={() => {}}
      >
        <img
          src={chatPartner.profilePicture}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
        />
      </div>
      {chatPartner && (
        <p className="flex-grow font-semibold text-black">{chatPartner.name}</p>
      )}
      <button className=" ">
        <i className="fa-solid fa-phone text-xl text-gray500 hover:text-purple500"></i>
      </button>
      {!isVideoOpen && (
        <button onClick={handleVideoCall}>
          <i className="fa-solid fa-video text-main ml-6 text-xl text-gray500 hover:text-purple500"></i>
        </button>
      )}

      <button className="bg-gray-500">
        <i className="fa-solid  fa-ellipsis-vertical text-xl text-white"></i>
      </button>
    </header>
  );
});

export default Header;
