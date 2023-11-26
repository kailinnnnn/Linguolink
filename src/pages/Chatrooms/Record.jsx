import useAuthStore from "../../zustand/AuthStore";
import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";

const Record = ({ chatPartner, chatroomId }) => {
  const { user } = useAuthStore();
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [recordedTime, setRecordedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const recordedBlobRef = useRef(null);

  const startRecording = async () => {
    //navigator 是瀏覽器提供的一個全局對象，代表了瀏覽器的狀態和功能。在這個上下文中，navigator.mediaDevices.getUserMedia 是一個 Web API，它允許網頁訪問使用者的媒體設備，例如攝像頭和麥克風
    //獲取錄音權限
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setStream(audioStream);
    //當我創建一個MediaRecorder 並帶入stream(音訊流) 他就會在後台不斷收到的音頻流不斷拆分成小塊然後在小塊可用時不斷觸發ondataavailable事件
    //存在mediaRecorderRef.current讓我們可以在其他地方使用
    mediaRecorderRef.current = new MediaRecorder(audioStream);
    //Blob是二進制數據的容器，可以用來存儲二進制數據，並且允許你對二進制數據進行操作。Blob對象通常表示一個不可變的二進制數據，例如一張圖片的數據或者一段音樂的數據。File接口基於Blob，繼承了Blob的功能並且擴展支持了用戶系統上的本地文件。
    //ondataavailable在音頻流可用時會自動被觸發不用呼叫
    mediaRecorderRef.current.ondataavailable = (event) => {
      //只要持續錄音MediaRecorde就會持續將音頻流分成小塊所以會有越來越多小塊 然後不斷觸發ondataavailable事件 所以Blob就被不斷被更新變越來越多數句
      if (event.data.size > 0) {
        const blob = new Blob([event.data], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        recordedBlobRef.current = blob;
        audioRef.current.src = url;
        audioRef.current.controls = true;
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // 更新錄音時間
    let startTime = Date.now();
    const updateRecordedTime = () => {
      setRecordedTime(Math.floor((Date.now() - startTime) / 1000));
      if (isRecording) {
        requestAnimationFrame(updateRecordedTime);
      }
    };

    updateRecordedTime();
  };

  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    setRecordedTime(0);

    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
  };

  const handleSubmit = () => {
    stopRecording();
    const blob = recordedBlobRef.current;
    if (!blob) {
      return;
    }

    api.uploadFile(blob).then((recordUrl) => {
      api.sendMessage(
        chatroomId,
        user.id,
        chatPartner.id,
        "",
        "",
        "",
        "",
        "",
        recordUrl,
      );
    });
  };

  return (
    <div>
      <div
        className="bg-gray-500"
        onClick={() => {
          setIsRecordOpen(!isRecordOpen);
        }}
      >
        <i className="fa-solid fa-microphone text-xl text-white"></i>
      </div>

      {isRecordOpen && (
        <div>
          <button onClick={() => setIsRecordOpen(!isRecordOpen)}>
            <i className="fa-solid fa-xmark text-gray text-xl"></i>
          </button>
          {isRecording ? (
            <button className="bg-gray-500" onClick={stopRecording}>
              <i className="fa-solid fa-stop text-xl text-white"></i>
            </button>
          ) : (
            <button className="bg-gray-500" onClick={startRecording}>
              <i className="fa-solid fa-play text-xl text-white"></i>
            </button>
          )}
          <p>{recordedTime}</p>
          <audio ref={audioRef} />

          <button onClick={handleSubmit} className="bg-gray-500">
            <i className="fa-solid fa-paper-plane text-xl text-white"></i>
          </button>
        </div>
      )}
    </div>
  );
};

export default Record;
