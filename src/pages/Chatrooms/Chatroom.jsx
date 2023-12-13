import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useWebRTCStore from "../../zustand/webRTCStore";
import MessageList from "./MessageList";
import Record from "./Record";
import Video from "./Video";

const Chatroom = ({
  chatPartner,
  setChatPartner,
  isVideoOpen,
  setIsVideoOpen,
}) => {
  const chatroomId = useParams().id;
  const { user } = useAuthStore();
  const { webRTCInfo } = useWebRTCStore();
  const [chatroomData, setChatroomData] = useState(null);
  const [isMenuOpenArray, setIsMenuOpenArray] = useState(
    Array(chatroomData?.messages?.length || 0).fill(false),
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isSaveWordOpen, setIsSaveWordOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const [inputCategory, setInputCategory] = useState("message");
  const [selectedImage, setSelectedImage] = useState(null);
  const messageRef = useRef();
  const revisedRef = useRef();
  const commentRef = useRef();
  const toReviseSentRef = useRef();
  const toCommentSentRef = useRef();
  const fileInputRef = useRef(null);
  const userVideoRoleRef = useRef("answer");
  const preStoredWordsRef = useRef(null);
  const noteRef = useRef(null);
  const menuRef = useRef(null);
  const menuIndexRef = useRef(null);

  useEffect(() => {
    if (chatroomId) {
      const unsubChatroom = api.listenChatroom(chatroomId, (chatroomData) => {
        setChatroomData(chatroomData);
      });

      return () => {
        unsubChatroom;
      };
    }
  }, [chatroomId]);

  useEffect(() => {
    if (chatroomData) {
      const chatPartner = chatroomData.participants.find(
        (participant) => participant.id !== user.id,
      );
      api.getUser(chatPartner.id).then((chatPartner) => {
        setChatPartner(chatPartner);
      });
    }
  }, [chatroomData]);

  useEffect(() => {
    if (
      userVideoRoleRef.current === "answer" &&
      webRTCInfo?.[0]?.offer &&
      webRTCInfo?.[0].status?.isConnecting &&
      !webRTCInfo?.[0]?.offerIceCandidates &&
      !webRTCInfo?.[0]?.answerIceCandidates &&
      !webRTCInfo?.[0]?.answer
    ) {
      setIsVideoOpen(true);
    }

    if (!webRTCInfo?.[0]?.status?.isConnecting) {
      setIsVideoOpen(false);
    }
  }, [webRTCInfo]);

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
        messageRef.current.value = "";
      } else {
        await api.sendMessage(
          chatroomId,
          user.id,
          chatPartner.id,
          messageRef?.current?.value,
          toReviseSentRef.current?.textContent,
          revisedRef.current?.value,

          commentRef.current?.value,
        );
        messageRef.current.value = "";
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleReviseMessage = async () => {
    await api.addUserRevised(
      chatPartner.id,
      toReviseSentRef.current.textContent,
      toCommentSentRef.current?.textContent,
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
        toCommentSentRef.current?.textContent,
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
    const date = timestamp.toDate();

    const options = {
      hour: "numeric",
      minute: "numeric",
      hour12: false, // 使用 24 小時制
    };

    const formattedTime = new Intl.DateTimeFormat("default", options).format(
      date,
    );
    return formattedTime;
  };
  const handleSaveWord = () => {
    setIsSaveWordOpen(!isSaveWordOpen);
    const data = {
      word: preStoredWordsRef.current.value,
      note: noteRef.current.value,
    };
    api.storeWord(user.id, data);
  };

  return (
    <div
      className={` flex  w-3/4   ${
        isVideoOpen && "fixed w-[calc((100vw-96px))]"
      }`}
    >
      {/* <MessageList /> */}
      {!isVideoOpen && chatPartner && (
        <div className="relative flex  h-full max-h-full w-full">
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
              <p className="flex-grow font-semibold text-black">
                {chatPartner.name}
              </p>
            )}
            <button className=" ">
              <i className="fa-solid fa-phone text-xl text-gray500 hover:text-purple500"></i>
            </button>
            {!isVideoOpen && (
              <button className="" onClick={handleVideoCall}>
                <i className="fa-solid fa-video text-main ml-6 text-xl text-gray500 hover:text-purple500"></i>
              </button>
            )}

            <button className="bg-gray-500">
              <i className="fa-solid  fa-ellipsis-vertical text-xl text-white"></i>
            </button>
          </header>
          <div className=" my-[104px]  max-h-[calc(100vh-218px)] w-full overflow-hidden overflow-y-auto px-6">
            {chatPartner &&
              chatroomData &&
              chatroomData.messages.map((message, index) => {
                const isCurrentUser = message.sender === user.id;
                const messageClass = isCurrentUser
                  ? "bg-purple500 text-white py-3 px-4"
                  : "bg-gray300 text-black py-3 px-4";

                const createdAt = timestampToTime(message.createdAt);

                return (
                  <div className="relative mt-4 flex rounded-xl" key={index}>
                    {message.sender !== user.id && (
                      <div className="mr-3 h-10 min-h-[2.5rem] w-10 min-w-[2.5rem] overflow-hidden rounded-full">
                        <img
                          src={chatPartner?.profilePicture}
                          className="h-full w-full object-cover"
                          alt=""
                        />
                      </div>
                    )}
                    <div
                      className={`${
                        message.sender === user.id &&
                        "ml-auto   flex-col overflow-hidden rounded-xl"
                      } max-w-[60%]`}
                    >
                      <div
                        key={index}
                        ref={() => (menuIndexRef.current = index)}
                        className={` relative flex w-fit items-center rounded-xl  bg-white ${
                          message.sender == user.id ? "ml-auto" : "mr-auto"
                        } `}
                      >
                        <div
                          className="overflow-hidden rounded-xl"
                          onClick={() => {
                            if (message.sender !== user.id) {
                              const newIsMenuOpenArray = [...isMenuOpenArray];
                              newIsMenuOpenArray[index] =
                                !newIsMenuOpenArray[index];
                              setIsMenuOpenArray(newIsMenuOpenArray);
                              setSelectedMessage(message);
                              console.log(selectedMessage);
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
                            <img src={message.imageUrl} className="w-72" />
                          )}
                          {message.content && (
                            <p className={messageClass}>{message.content}</p>
                          )}
                          {message.revised && (
                            <div className="bg-gray100 p-4">
                              <p className="mb-1 text-xs"> Revised</p>
                              <p className="text-red-500">
                                <i className="fa-solid fa-xmark pr-[0.6rem] text-red500"></i>
                                {message.toReviseSent}
                              </p>
                              <div className="mb-2 mt-2  border-1 border-gray300" />
                              <p className=" text-green-500">
                                <i className="fa-solid fa-check pr-[0.6rem] text-green500"></i>
                                {message.revised}
                              </p>
                            </div>
                          )}
                          {message.comment && (
                            <div className={`p-4 ${messageClass}`}>
                              <p className="mb-1 text-xs ">comment</p>
                              <p>{message.comment}</p>
                            </div>
                          )}
                        </div>
                        {isMenuOpenArray[index] && (
                          <div className=" ml-3 h-full">
                            <div className="relative ">
                              {" "}
                              <i
                                className="fa-solid fa-ellipsis text-gray500"
                                onClick={() => {
                                  setIsMenuOpen(!isMenuOpen);
                                }}
                              ></i>
                              {isMenuOpen && !isSaveWordOpen ? (
                                <div
                                  className="text-slate-200 absolute left-[2rem] top-0 z-10 flex flex-col rounded-xl bg-purple100 px-4 py-3"
                                  ref={menuRef}
                                >
                                  <button className=" px-3 py-2 hover:text-purple500">
                                    Copy
                                  </button>
                                  <button
                                    className="px-3 py-2 hover:text-purple500"
                                    onClick={() => {
                                      setInputCategory("revise");
                                      setIsMenuOpen(!isMenuOpen);

                                      const newIsMenuOpenArray = [
                                        ...isMenuOpenArray,
                                      ];
                                      newIsMenuOpenArray[index] =
                                        !newIsMenuOpenArray[index];
                                      setIsMenuOpenArray(newIsMenuOpenArray);
                                    }}
                                  >
                                    Revise
                                  </button>
                                  <button
                                    className="px-3 py-2 hover:text-purple500"
                                    onClick={() => {
                                      setInputCategory("comment");
                                      setIsMenuOpen(!isMenuOpen);

                                      const newIsMenuOpenArray = [
                                        ...isMenuOpenArray,
                                      ];
                                      newIsMenuOpenArray[index] =
                                        !newIsMenuOpenArray[index];
                                      setIsMenuOpenArray(newIsMenuOpenArray);
                                    }}
                                  >
                                    Comment
                                  </button>
                                  <button
                                    className="px-3 py-2 hover:text-purple500"
                                    onClick={() => {
                                      setIsSaveWordOpen(!isSaveWordOpen);
                                    }}
                                  >
                                    Save
                                  </button>
                                  <button className="px-3 py-2 hover:text-purple500">
                                    Tramslate
                                  </button>
                                </div>
                              ) : (
                                isSaveWordOpen && (
                                  <div className="text-slate-200 absolute -top-3 left-[2rem] z-10 flex flex-col rounded-xl  bg-purple100 p-4 shadow">
                                    {/* <button className="flex ">
                                    <i class="fa-solid fa-arrow-left mr-auto "></i>
                                  </button> */}
                                    <div>
                                      <small className="mb-2 ml-1 flex">
                                        Collection
                                      </small>
                                      <input
                                        ref={preStoredWordsRef}
                                        defaultValue={
                                          selectedMessage.content !== "" &&
                                          selectedMessage.content !== null
                                            ? selectedMessage?.content
                                            : selectedMessage?.comment !== "" &&
                                                selectedMessage.comment !== null
                                              ? selectedMessage?.comment
                                              : selectedMessage?.revised
                                        }
                                        className=" mb-3 h-8 rounded-lg pl-3  focus:border-2   focus:border-purple300 focus:outline-none  focus:ring-purple300"
                                      />
                                    </div>
                                    <div>
                                      {" "}
                                      <small className="mb-2 ml-1 flex">
                                        Note
                                      </small>
                                      <input
                                        ref={noteRef}
                                        className="h-8 rounded-lg  pl-3  placeholder-gray500  focus:border-2   focus:border-purple300 focus:outline-none  focus:ring-purple300"
                                      />
                                    </div>
                                    <div className="mt-3">
                                      <button
                                        className="w-1/2 px-3 py-2 text-gray500"
                                        onClick={() => {
                                          setIsSaveWordOpen(!isSaveWordOpen);
                                          setIsMenuOpen(!isMenuOpen);
                                          const newIsMenuOpenArray = [
                                            ...isMenuOpenArray,
                                          ];
                                          newIsMenuOpenArray[index] =
                                            !newIsMenuOpenArray[index];
                                          setIsMenuOpenArray(
                                            newIsMenuOpenArray,
                                          );
                                        }}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="w-1/2 px-3 py-2 text-purple500"
                                        onClick={() => {
                                          handleSaveWord();
                                          setIsMenuOpen(!isMenuOpen);

                                          const newIsMenuOpenArray = [
                                            ...isMenuOpenArray,
                                          ];
                                          newIsMenuOpenArray[index] =
                                            !newIsMenuOpenArray[index];
                                          setIsMenuOpenArray(
                                            newIsMenuOpenArray,
                                          );
                                        }}
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <small
                        className={`mt-1 text-gray500  ${
                          message.sender === user.id
                            ? "ml-auto text-right"
                            : "ml-auto text-left"
                        }`}
                        onClick={() => console.log(message.sender, user.id)}
                      >
                        {createdAt}
                      </small>
                    </div>
                  </div>
                );
              })}
          </div>

          <footer className="fixed bottom-0 z-10 flex  w-[calc((100vw-96px)*0.725)] flex-wrap  items-center border-t-2 border-gray300 bg-white p-6">
            {inputCategory === "revise" && (
              <div className="flex w-full flex-wrap ">
                <div className=" flex w-full flex-wrap">
                  <p className="pb-3 pl-5 pt-0 font-semibold">Correction</p>
                  <button
                    onClick={() => setInputCategory("message")}
                    className="ml-auto pb-3 pr-5 pt-0 "
                  >
                    <i className="fa-solid fa-xmark text-gray text-xl"></i>
                  </button>
                </div>

                <div className="flex w-full gap-5">
                  <div className="mb-5 flex w-[calc(50%-0.5rem)] flex-grow flex-col justify-between gap-3 rounded-xl bg-gray100 p-5">
                    <small>Original Meaning</small>
                    <p ref={toReviseSentRef} className="text-gray700">
                      {selectedMessage.content !== "" &&
                      selectedMessage.content !== null
                        ? selectedMessage?.content
                        : selectedMessage?.comment !== "" &&
                            selectedMessage.comment !== null
                          ? selectedMessage?.comment
                          : selectedMessage?.revised}
                    </p>
                  </div>
                  <div className="mb-5 flex w-[calc(50%-0.5rem)] flex-grow flex-col gap-3 rounded-xl bg-gray100 p-5">
                    <small>Revise</small>
                    <input
                      type="text"
                      name=""
                      id=""
                      ref={revisedRef}
                      className="flex-grow  whitespace-pre-wrap   bg-gray100 focus:border-2  focus:border-purple300 focus:outline-none focus:ring-purple300"
                      defaultValue={
                        selectedMessage.content !== "" &&
                        selectedMessage.content !== null
                          ? selectedMessage?.content
                          : selectedMessage?.comment !== "" &&
                              selectedMessage.comment !== null
                            ? selectedMessage?.comment
                            : selectedMessage?.revised
                      }
                    />
                  </div>
                </div>
                <div className="flex w-full">
                  <input
                    type="text"
                    ref={commentRef}
                    className="h-10 w-full max-w-full flex-1 flex-grow rounded-xl bg-gray100 pl-5  focus:border-2   focus:border-purple300 focus:outline-none  focus:ring-purple300"
                    placeholder="Type your message here... "
                  />
                  <button
                    onClick={() => {
                      handleSendMessage();
                      handleReviseMessage();
                      setInputCategory("message");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <i className="fa-solid fa-paper-plane text-xl text-purple500"></i>
                  </button>
                </div>
              </div>
            )}

            {selectedImage && (
              <div className="flex w-full">
                <div className="w-60 overflow-hidden rounded-xl pb-5">
                  <img
                    src={URL.createObjectURL(selectedImage)}
                    className="w-60 rounded-xl "
                  />
                </div>

                <button
                  onClick={() => setSelectedImage(null)}
                  className="mb-auto ml-auto p-3 pt-0"
                >
                  <i className="fa-solid fa-xmark "></i>
                </button>
              </div>
            )}
            {inputCategory === "comment" && (
              <div className="flex w-full flex-wrap ">
                <div className="flex w-full flex-wrap ">
                  <p className=" pl-5 pt-0 font-semibold">Comment</p>
                  <button
                    onClick={() => setInputCategory("message")}
                    className="ml-auto pr-3 pt-0 "
                  >
                    <i className="fa-solid fa-xmark text-gray text-xl"></i>
                  </button>
                </div>

                <p ref={toCommentSentRef} className=" rounded-xl p-5 pt-2">
                  {selectedMessage.content !== "" &&
                  selectedMessage.content !== null
                    ? selectedMessage?.content
                    : selectedMessage?.comment !== "" &&
                        selectedMessage.comment !== null
                      ? selectedMessage?.comment
                      : selectedMessage?.revised}
                </p>

                <div className="flex w-full">
                  <input
                    type="text"
                    ref={commentRef}
                    className="h-10 w-full max-w-full flex-1 flex-grow rounded-xl bg-gray100 pl-5  focus:border-2   focus:border-purple300 focus:outline-none  focus:ring-purple300"
                    placeholder="Type your comment here... "
                  />
                  <button
                    onClick={() => {
                      handleSendMessage();
                      setInputCategory("message");
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                  >
                    <i className="fa-solid fa-paper-plane text-xl text-purple500"></i>
                  </button>
                </div>
              </div>
            )}

            {inputCategory === "message" && (
              <>
                <button
                  className="mr-4 "
                  onClick={() => {
                    setInputCategory("record");
                  }}
                >
                  <i className="fa-solid fa-microphone text-xl text-gray500 hover:text-purple500"></i>
                </button>
                <button className="mr-4 ">
                  <i className="fa-solid fa-camera text-xl text-gray500 hover:text-purple500"></i>
                </button>
                <label className="mr-4 cursor-pointer">
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
                    className="fa-solid fa-image text-xl text-gray500 hover:text-purple500"
                    // onClick={() => fileInputRef.current.click()}
                  ></i>
                </label>

                <input
                  type="text"
                  ref={messageRef}
                  className="h-10 w-full max-w-full flex-1 rounded-full bg-gray100 pl-5  focus:outline-none "
                  placeholder="Type your message here... "
                />

                <button
                  onClick={handleSendMessage}
                  // disabled={messageRef.current?.value === ""}
                  className="flex h-10 w-10 items-center justify-center rounded-full"
                >
                  <i
                    className={`fa-solid fa-paper-plane text-xl text-purple500`}
                  ></i>
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
