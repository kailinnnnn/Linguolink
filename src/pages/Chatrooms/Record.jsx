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
  };

  const stopRecording = () => {
    setAudioUrl(null);
    mediaRecorderRef.current?.stop();
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
    <div className="flex w-full items-center justify-center">
      <button
        onClick={() => {
          stopRecording();
          setInputCategory("message");
        }}
      >
        <i className="fa-solid fa-xmark  mr-4 text-2xl"></i>
      </button>
      {isRecording ? (
        <>
          <button
            className="mr-4 h-10  w-10 rounded-full bg-gray500"
            onClick={stopRecording}
          >
            <i className="fa-solid fa-stop text-xl text-white"></i>
          </button>
          <p className="w-full leading-6  text-gray700">
            In recording, click to stop recording{" "}
          </p>
        </>
      ) : (
        <>
          <button
            className="min-h-10 min-w-10  max-w-10 mr-4 flex h-10 max-h-10 w-10 items-center justify-center rounded-full bg-red500"
            onClick={() => {
              setAudioUrl(null);
              startRecording();
            }}
          >
            <div className="h-5  w-5 rounded-full bg-white"></div>
          </button>
          {!audioUrl && (
            <p className="w-full leading-6 text-gray700">
              In holding, start recording <br />
              You can listen again before submitting the voice message
            </p>
          )}
          <audio
            src={audioUrl}
            controls={audioUrl !== null}
            className="mr-5 h-5 w-full"
          />
        </>
      )}

      <button onClick={handleSubmit} className="">
        <i className="fa-solid fa-paper-plane text-xl text-purple500"></i>
      </button>
    </div>
  );
};

export default Record;
