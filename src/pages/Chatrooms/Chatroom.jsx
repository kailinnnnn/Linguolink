import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useWebRTCStore from "../../zustand/webRTCStore";
import MessageList from "./MessageList";
import Record from "./Record";
import Video from "./Video";

const Chatroom = () => {
  const chatroomId = useParams().id;
  const { user } = useAuthStore();
  const { webRTCInfo } = useWebRTCStore();
  const [chatroomData, setChatroomData] = useState(null);
  const [chatPartner, setChatPartner] = useState(null);
  const [isMenuOpenArray, setIsMenuOpenArray] = useState(
    Array(chatroomData?.messages?.length || 0).fill(false),
  );
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isSaveWordOpen, setIsSaveWordOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [inputCategory, setInputCategory] = useState("message");
  const [selectedImage, setSelectedImage] = useState(null);
  const messageRef = useRef();
  const revisedRef = useRef();
  const commentRef = useRef();
  const toReviseSentRef = useRef();
  const fileInputRef = useRef(null);
  const userVideoRoleRef = useRef("answer");
  const preStoredWordsRef = useRef(null);
  const noteRef = useRef(null);
  const menuRef = useRef(null);
  const menuIndexRef = useRef(null);

  useEffect(() => {
    const unsubChatroom = api.listenChatroom(chatroomId, (chatroomData) => {
      setChatroomData(chatroomData);
    });

    return () => {
      unsubChatroom;
    };
  }, [chatroomId]);

  useEffect(() => {
    if (chatroomData) {
      const chatPartner = chatroomData.participants.find(
        (participant) => participant.id !== user.id,
      );
      api.getUser(chatPartner.id).then((chatPartner) => {
        setChatPartner(chatPartner);
      });
      console.log(chatroomData);
    }
  }, [chatroomData]);

  useEffect(() => {
    if (
      userVideoRoleRef.current === "answer" &&
      webRTCInfo?.[0]?.offer &&
      !webRTCInfo?.[0]?.offerIceCandidates &&
      !webRTCInfo?.[0]?.answerIceCandidates &&
      !webRTCInfo?.[0]?.answer
    ) {
      setIsVideoOpen(true);
    }

    if (
      userVideoRoleRef.current === "answer" &&
      webRTCInfo?.length === 1 &&
      webRTCInfo?.[0] === "answer"
    ) {
      setIsVideoOpen(false);
    }
  }, [webRTCInfo]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     console.log(1);
  //     if (menuRef.current && !menuRef.current.contains(event.target)) {
  //       setIsMenuOpenArray((prevArray) => {
  //         const newArray = [...prevArray];
  //         newArray[menuIndexRef.current] = false;
  //         return newArray;
  //       });
  //     }
  //   };
  //   document.addEventListener("click", handleClickOutside);
  //   return () => {
  //     document.removeEventListener("click", handleClickOutside);
  //   };
  // }, []);

  const handleSendMessage = async () => {
    try {
      if (selectedImage) {
        await api.uploadFile(selectedImage).then((imageUrl) => {
          api.sendMessage(
            chatroomId,
            user.id,
            chatPartner.id,
            messageRef.current.value === "" ? null : messageRef.current.value,
            toReviseSentRef.current?.textContent,
            revisedRef.current?.value,
            commentRef.current?.value,
            imageUrl,
          );
        });
        setSelectedImage(null);
      } else {
        console.log("send message");
        console.log(toReviseSentRef.current?.textContent);
        console.log(revisedRef.current?.value);
        await api.sendMessage(
          chatroomId,
          user.id,
          chatPartner.id,
          messageRef?.current?.value,
          toReviseSentRef.current?.textContent,
          revisedRef.current?.value,
          commentRef.current?.value,
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleReviseMessage = async () => {
    console.log("revise message");
    await api.addUserRevised(
      chatPartner.id,
      toReviseSentRef.current.textContent,
      revisedRef.current.value,
      chatroomId,
    );
  };
  const handleFileUpload = () => {
    const selectedFile = fileInputRef.current.files[0];
    //先存進storage獲取url後 再呼叫sendMessage把url存進資料庫
    api.uploadFile(selectedFile).then((imageUrl) => {
      api.sendMessage(
        chatroomId,
        user.id,
        chatPartner.id,
        messageRef.current.value,
        toReviseSentRef.current?.textContent,
        revisedRef.current?.value,
        commentRef.current?.value,
        imageUrl,
      );
    });
  };

  const handleVideoCall = async () => {
    setIsVideoOpen(true);
    userVideoRoleRef.current = "offer";
  };

  const timestampToTime = (timestamp) => {
    const date = timestamp.toDate().toLocaleTimeString();
    return date;
  };

  const handleSaveWord = () => {
    setIsSaveWordOpen(!isSaveWordOpen);
    const word = {
      word: preStoredWordsRef.current.value,
      note: noteRef.current.value,
    };
    api.storeWord(user.id, word);
  };

  return (
    <div className="ml-28 flex w-full ">
      <MessageList />
      {!isVideoOpen && (
        <div className="ml-28 flex h-full w-full  flex-grow">
          <header className="fixed top-0 z-10 flex  w-4/5 flex-grow bg-white">
            {chatPartner && (
              <p className="mr-auto flex-grow">{chatPartner.name}</p>
            )}
            <button className="ml-auto bg-gray-500">
              <i className="fa-solid fa-phone text-xl text-white"></i>
            </button>
            {!isVideoOpen && (
              <button className="bg-gray-500" onClick={handleVideoCall}>
                <i className="fa-solid fa-video text-xl text-white"></i>
              </button>
            )}

            <button className="bg-gray-500">
              <i className="fa-solid  fa-ellipsis-vertical text-xl text-white"></i>
            </button>
          </header>
          <div className="mb-20 mt-20 w-full">
            {chatPartner &&
              chatroomData &&
              chatroomData.messages.map((message, index) => {
                const isCurrentUser = message.sender === user.id;
                const messageClass = isCurrentUser
                  ? "bg-blue-500 text-white p-4"
                  : "bg-gray-300 text-black p-4";

                const createdAt = timestampToTime(message.createdAt);

                return (
                  <div
                    className="mt-4 flex overflow-hidden rounded-xl"
                    key={index}
                  >
                    {message.sender !== user.id && (
                      <div className="mr-3 h-10 w-10 overflow-hidden rounded-full">
                        <img
                          src={chatPartner?.profilePicture}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      </div>
                    )}
                    <div
                      className={
                        message.sender === user.id &&
                        "ml-auto flex-col overflow-hidden  rounded-xl"
                      }
                    >
                      <div
                        key={index}
                        ref={() => (menuIndexRef.current = index)}
                        className={` relative w-fit overflow-hidden rounded-xl  bg-white ${
                          message.sender == user.id ? "ml-auto" : "mr-auto"
                        } `}
                        onClick={() => {
                          if (message.sender !== user.id) {
                            const newIsMenuOpenArray = [...isMenuOpenArray];
                            newIsMenuOpenArray[index] =
                              !newIsMenuOpenArray[index];
                            setIsMenuOpenArray(newIsMenuOpenArray);
                            setSelectedMessage(message);
                          }
                        }}
                      >
                        {message.recordUrl && (
                          <audio
                            src={message.recordUrl}
                            controls
                            className={messageClass}
                          />
                        )}
                        {message.imageUrl && (
                          <img src={message.imageUrl} className="w-48" />
                        )}
                        {message.content && (
                          <p className={messageClass}>{message.content}</p>
                        )}
                        {message.revised && (
                          <div className="p-4">
                            <p className=" text-xs"> Revised</p>
                            <p className="text-red-500">
                              <i className="fa-solid fa-xmark pr-2 text-red-500"></i>
                              {message.toReviseSent}
                            </p>
                            <p className=" text-green-500">
                              <i className="fa-solid fa-check pr-1 text-green-500"></i>
                              {message.revised}
                            </p>
                          </div>
                        )}
                        {message.comment && (
                          <div className={`p-4 ${messageClass}`}>
                            <p className=" text-xs">comment</p>
                            <p>{message.comment}</p>
                          </div>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-xs text-gray-400 ${
                          message.sender === user.id
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {createdAt}
                      </p>
                    </div>
                    {isMenuOpenArray[index] && (
                      <div
                        className="relative left-5 z-10 flex flex-col gap-2 bg-gray-500 p-4 text-slate-200"
                        ref={menuRef}
                      >
                        <button>Copy</button>
                        <button onClick={() => setInputCategory("revise")}>
                          Revise
                        </button>
                        <button onClick={() => setInputCategory("comment")}>
                          Comment
                        </button>
                        <button
                          onClick={() => setIsSaveWordOpen(!isSaveWordOpen)}
                        >
                          Save
                        </button>
                        <button>Tramslate</button>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <footer className="fixed bottom-0 mt-10 flex  w-4/5  flex-wrap items-center bg-white">
            {inputCategory === "revise" && (
              <div className="flex w-full flex-wrap ">
                <div className="flex w-full flex-wrap ">
                  <p className=" p-3 ">Correction</p>
                  <button
                    onClick={() => setInputCategory("message")}
                    className="ml-auto p-3 "
                  >
                    <i className="fa-solid fa-xmark text-graytext-xl"></i>
                  </button>
                </div>

                <div className="mb-2 w-1/2 pl-3">
                  <p>Original Meaning</p>
                  <p ref={toReviseSentRef}>
                    {selectedMessage?.content !== ""
                      ? selectedMessage?.content
                      : selectedMessage?.comment !== ""
                        ? selectedMessage?.comment
                        : selectedMessage?.revised}
                  </p>
                </div>
                <div className="mb-2 flex w-1/2 flex-col pr-3">
                  <p>Revise</p>
                  <input
                    type="text"
                    name=""
                    id=""
                    ref={revisedRef}
                    className="flex-grow bg-gray-100"
                  />
                </div>
                <div className="flex w-full">
                  <input
                    type="text"
                    ref={commentRef}
                    className="flex-grow bg-gray-100"
                  />
                  <button
                    onClick={() => {
                      handleSendMessage();
                      handleReviseMessage();
                      setInputCategory("message");
                    }}
                    className="bg-gray-500"
                  >
                    <i className="fa-solid fa-paper-plane text-xl text-white"></i>
                  </button>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="flex w-full">
                <img
                  src={URL.createObjectURL(selectedImage)}
                  className="w-48 p-5"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="mb-auto ml-auto p-3"
                >
                  <i className="fa-solid fa-xmark text-x"></i>
                </button>
              </div>
            )}
            {inputCategory === "comment" && (
              <div className="flex w-full flex-wrap ">
                <div className="flex w-full flex-wrap ">
                  <p className=" p-3 ">Comment</p>
                  <button
                    onClick={() => setInputCategory("message")}
                    className="ml-auto p-3 "
                  >
                    <i className="fa-solid fa-xmark text-graytext-xl"></i>
                  </button>
                </div>

                <p ref={toReviseSentRef} className=" mb-3 ml-3">
                  {selectedMessage?.content !== ""
                    ? selectedMessage?.content
                    : selectedMessage?.comment !== ""
                      ? selectedMessage?.comment
                      : selectedMessage?.revised}
                </p>

                <div className="flex w-full">
                  <input
                    type="text"
                    ref={commentRef}
                    className="flex-grow bg-gray-100"
                  />
                  <button
                    onClick={() => {
                      handleSendMessage();
                      setInputCategory("message");
                    }}
                    className="bg-gray-500"
                  >
                    <i className="fa-solid fa-paper-plane text-xl text-white"></i>
                  </button>
                </div>
              </div>
            )}

            {inputCategory === "message" && (
              <>
                <div
                  className="bg-gray-500"
                  onClick={() => {
                    setInputCategory("record");
                  }}
                >
                  <i className="fa-solid fa-microphone text-xl text-white"></i>
                </div>
                <button className="bg-gray-500">
                  <i className="fa-solid fa-camera text-xl text-white"></i>
                </button>
                <label className="bg-gray-500">
                  <input
                    type="file"
                    style={{ display: "none" }}
                    ref={fileInputRef}
                    onClick={(e) => {
                      e.target.value = null;
                    }}
                    onChange={(e) => {
                      if (e.target.files.length > 0) {
                        setSelectedImage(e.target.files[0]);
                      }
                    }}
                    // onChange={handleFileUpload}
                    accept="image/*"
                  />
                  <i
                    className="fa-solid fa-image text-xl text-white"
                    // onClick={() => fileInputRef.current.click()}
                  ></i>
                </label>

                <input
                  type="text"
                  ref={messageRef}
                  className="max-w-full flex-1 "
                />

                <button onClick={handleSendMessage} className="bg-gray-500">
                  <i className="fa-solid fa-paper-plane text-xl text-white"></i>
                </button>
              </>
            )}
            {inputCategory === "record" && (
              <Record
                chatroomId={chatroomId}
                chatPartner={chatPartner}
                setInputCategory={setInputCategory}
              />
            )}
          </footer>
        </div>
      )}
      {isVideoOpen && (
        <Video
          chatroomId={chatroomId}
          chatPartner={chatPartner}
          userVideoRoleRef={userVideoRoleRef}
          setIsVideoOpen={setIsVideoOpen}
          isVideoOpen={isVideoOpen}
        />
      )}
    </div>
  );
};

export default Chatroom;

//
