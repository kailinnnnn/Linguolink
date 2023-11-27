import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import useWebRTCStore from "../../zustand/webRTCStore";
import Record from "./Record";
import Video from "./Video";

const Chatroom = () => {
  const chatroomId = useParams().id;
  const { user } = useAuthStore();
  const { webRTCInfo, setWebRTCInfo } = useWebRTCStore();
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
  const messageRef = useRef();
  const revisedRef = useRef();
  const commentRef = useRef();
  const toReviseSentRef = useRef();
  const fileInputRef = useRef(null);
  const userVideoRoleRef = useRef("answer");
  const preStoredWordsRef = useRef(null);
  const noteRef = useRef(null);

  useEffect(() => {
    const unsubChatroom = api.listenChatroom(chatroomId, (chatroomData) => {
      setChatroomData(chatroomData);
    });

    return () => {
      unsubChatroom();
    };
  }, [chatroomId]);

  useEffect(() => {
    if (chatroomData) {
      const chatPartnerId = chatroomData.participants.find(
        (participantId) => participantId !== user.id,
      );
      api.getUser(chatPartnerId).then((chatPartner) => {
        setChatPartner(chatPartner);
      });
    }
  }, [chatroomData]);

  useEffect(() => {
    console.log(userVideoRoleRef.current);
    if (
      userVideoRoleRef.current === "answer" &&
      webRTCInfo?.[0]?.offer &&
      !webRTCInfo?.[0]?.answer
    ) {
      console.log(" setIsVideoOpen(true)");
      setIsVideoOpen(true);
    }
  }, [webRTCInfo]);

  const handleSendMessage = async () => {
    await api.sendMessage(
      chatroomId,
      user.id,
      chatPartner.id,
      messageRef.current.value,
      toReviseSentRef.current?.textContent,
      revisedRef.current?.value,
      commentRef.current?.value,
    );
  };
  const handleReviseMessage = async () => {
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

  const handleSaveWord = () => {
    console.log(1);
    setIsSaveWordOpen(!isSaveWordOpen);
    const word = {
      word: preStoredWordsRef.current.value,
      note: noteRef.current.value,
    };
    api.storeWord(user.id, word);
  };

  return (
    <div className="ml-28 h-full w-full ">
      <header className="fixed top-0 z-10 flex w-4/5 max-w-full bg-white">
        {chatPartner && <p className="mr-auto block ">{chatPartner.name}</p>}{" "}
        <button className="bg-gray-500">
          <i className="fa-solid fa-phone text-xl text-white"></i>
        </button>
        {!isVideoOpen && (
          <button className="bg-gray-500" onClick={handleVideoCall}>
            <i className="fa-solid fa-video text-xl text-white"></i>
          </button>
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
        <button className="bg-gray-500">
          <i className="fa-solid  fa-ellipsis-vertical text-xl text-white"></i>
        </button>
      </header>
      <div className="mb-20 mt-20 w-full">
        {chatroomData &&
          chatroomData.messages.map((message, index) => {
            const isCurrentUser = message.sender === user.id;
            const messageClass = isCurrentUser
              ? "bg-blue-500 text-white ml-auto"
              : "bg-gray-300 text-black";

            return (
              <div
                key={index}
                className={`mt-4 w-fit rounded p-2 ${messageClass} relative`}
                onClick={() => {
                  const newIsMenuOpenArray = [...isMenuOpenArray];
                  newIsMenuOpenArray[index] = !newIsMenuOpenArray[index];
                  setIsMenuOpenArray(newIsMenuOpenArray);
                  setSelectedMessage(message);
                }}
              >
                <div className="flex items-center">
                  {message.recordUrl && (
                    <audio src={message.recordUrl} controls />
                  )}
                  {message.imageUrl && (
                    <img src={message.imageUrl} className="h-32 w-48" />
                  )}
                  <p>{message.content}</p>
                  {message.toReviseSent && <p>{message.toReviseSent}</p>}
                  {message.revised && <p>{message.revised}</p>}
                  {message.comment && <p>評論{message.comment}</p>}
                  {isMenuOpenArray[index] && (
                    <div className="absolute left-16 z-10 flex w-24 flex-col bg-gray-500 text-slate-200">
                      <button>複製</button>
                      <button onClick={() => setIsReviseOpen(!isReviseOpen)}>
                        修正
                      </button>
                      <button onClick={() => setIsCommentOpen(!isCommentOpen)}>
                        回覆
                      </button>
                      <button
                        onClick={() => setIsSaveWordOpen(!isSaveWordOpen)}
                      >
                        儲存單字
                      </button>
                      <button>翻譯</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        {isReviseOpen && (
          <div>
            <button onClick={() => setIsReviseOpen(!isReviseOpen)}>
              <i className="fa-solid fa-xmark text-gray text-xl"></i>
            </button>
            <p>更正</p>
            <div>
              <p>原意</p>
              <p ref={toReviseSentRef}>
                {selectedMessage?.content !== ""
                  ? selectedMessage?.content
                  : selectedMessage?.comment !== ""
                    ? selectedMessage?.comment
                    : selectedMessage?.revised}
              </p>
            </div>
            <div>
              <p>修正</p>
              <input type="text" name="" id="" ref={revisedRef} />
            </div>
            <div>
              <input type="text" ref={commentRef} />
              <button
                onClick={() => {
                  handleSendMessage();
                  handleReviseMessage();
                  setIsReviseOpen(false);
                }}
              >
                <i className="fa-solid fa-paper-plane text-xl text-white"></i>
              </button>
            </div>
          </div>
        )}
        {isCommentOpen && (
          <div>
            <p>回覆</p>
            <button onClick={() => setIsCommentOpen(!isCommentOpen)}>
              <i className="fa-solid fa-xmark text-gray text-xl"></i>
            </button>
            <p>
              {
                <p ref={toReviseSentRef}>
                  {selectedMessage?.content !== ""
                    ? selectedMessage?.content
                    : selectedMessage?.comment !== ""
                      ? selectedMessage?.comment
                      : selectedMessage?.revised}
                </p>
              }
            </p>
            <div>
              <input type="text" ref={commentRef} className="mb-24" />
              <button
                onClick={() => {
                  handleSendMessage();
                }}
              >
                <i className="fa-solid fa-paper-plane text-xl text-white"></i>
              </button>
            </div>
          </div>
        )}
        {isSaveWordOpen && (
          <div>
            <label>
              <input
                type="text"
                defaultValue={selectedMessage?.content}
                ref={preStoredWordsRef}
              />
            </label>
            <label>
              備注：
              <input type="text" ref={noteRef} />
            </label>
            <button onClick={handleSaveWord}>Submit</button>
          </div>
        )}
      </div>
      <footer className="fixed bottom-0 mt-10 flex  w-4/5 items-center bg-white">
        <Record chatroomId={chatroomId} chatPartner={chatPartner} />

        <button className="bg-gray-500">
          <i className="fa-solid fa-camera text-xl text-white"></i>
        </button>
        <label className="bg-gray-500">
          <input
            type="file"
            style={{ display: "none" }}
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
          />
          <i
            className="fa-solid fa-image text-xl text-white"
            onClick={() => fileInputRef.current.click()}
          ></i>
        </label>
        <input type="text" ref={messageRef} className="max-w-full flex-1" />
        <button onClick={handleSendMessage} className="bg-gray-500">
          <i className="fa-solid fa-paper-plane text-xl text-white"></i>
        </button>
      </footer>
    </div>
  );
};

export default Chatroom;

//
