import useAuthStore from "../../zustand/AuthStore";
import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";

const Record = ({ chatPartner, chatroomId, setInputCategory }) => {
  const { user } = useAuthStore();
  const [recordedTime, setRecordedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const audioRef = useRef(new Audio());
  const recordedBlobRef = useRef(null);

  const startRecording = async () => {
    setAudioUrl(null);
    const audioStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    setStream(audioStream);
    mediaRecorderRef.current = new MediaRecorder(audioStream);
    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        const blob = new Blob([event.data], { type: "audio/wav" });
        const url = URL.createObjectURL(blob);
        recordedBlobRef.current = blob;
        setAudioUrl(url);
      }
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);

    // 更新錄音時間
    // let startTime = Date.now();
    // const updateRecordedTime = () => {
    //   setRecordedTime(Math.floor((Date.now() - startTime) / 1000));
    //   if (isRecording) {
    //     requestAnimationFrame(updateRecordedTime);
    //   }
    // };

    // updateRecordedTime();
  };

  const stopRecording = () => {
    setAudioUrl(null);
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
    <div className="flex w-full">
      <button
        onClick={() => {
          stopRecording();
          setInputCategory("message");
        }}
      >
        <i className="fa-solid fa-xmark text-gray text-xl"></i>
      </button>
      {isRecording ? (
        <>
          <button className="bg-gray-500" onClick={stopRecording}>
            <i className="fa-solid fa-stop text-xl text-white"></i>
          </button>
          <p className="w-full">In recording, click to stop recording. </p>
        </>
      ) : (
        <>
          <button
            className="bg-gray-500"
            onClick={() => {
              setAudioUrl(null);
              startRecording();
            }}
          >
            <i className="fa-solid  fa-circle text-xl text-white"></i>
          </button>
          {!audioUrl && (
            <p className="w-full">
              In holding, start recording. <br />
              You can listen again before submitting the voice message.
            </p>
          )}
          <audio
            src={audioUrl}
            controls={audioUrl !== null}
            className="h-5 w-full"
          />
        </>
      )}

      {/* <p>{recordedTime}</p> */}

      <button onClick={handleSubmit} className="bg-gray-500">
        <i className="fa-solid fa-paper-plane text-xl text-white"></i>
      </button>
    </div>
  );
};

export default Record;
