import api from "../../utils/firebaseApi";
import { useEffect, useRef } from "react";
import useWebRTCStore from "../../zustand/webRTCStore";
import useAuthStore from "../../zustand/AuthStore";

const Video = ({
  chatroomId,
  userVideoRoleRef,
  chatPartner,
  setIsVideoOpen,
}) => {
  const { user } = useAuthStore();
  const { webRTCInfo, setWebRTCInfo } = useWebRTCStore();
  const localStreamRef = useRef(new MediaStream());
  const remoteStreamRef = useRef(new MediaStream());

  const configuration = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      {
        urls: "turn:turn1.l.google.com:19305?transport=udp",
        username: "webrtc",
        credential: "secret",
      },
      {
        urls: "turn:turn1.l.google.com:19305?transport=tcp",
        username: "webrtc",
        credential: "secret",
      },
    ],
  };
  const peerConnection = useRef(new RTCPeerConnection(configuration));

  useEffect(() => {
    const startVideoCall = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        // audio: true,
      });

      stream
        .getTracks()
        .forEach((track) => peerConnection.current.addTrack(track, stream));

      peerConnection.current.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current.srcObject = remoteStream;
      };

      try {
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            // 將 ICE candidate 通知給對方，這裡使用你的 API 來傳送 candidate
            api
              .sendIceCandidateToRemote(
                chatroomId,
                user.id,
                chatPartner.id,
                event.candidate,
                userVideoRoleRef.current,
              )
              .then(() => {
                console.log("send ice candidate to remote");
              });
          }
        };

        if (userVideoRoleRef.current === "offer") {
          if (!webRTCInfo?.[0]?.offer) {
            console.log(peerConnection.current);
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            api.sendOffer(chatroomId, user.id, chatPartner.id, offer);
            console.log("offerer send offer");
            console.log(peerConnection.current);
          }
          if (
            webRTCInfo?.[0]?.answer &&
            !webRTCInfo?.[0]?.answerIceCandidates
          ) {
            console.log("offerer get remote answer");
            const answer = new RTCSessionDescription(webRTCInfo[0].answer);
            await peerConnection.current.setRemoteDescription(answer);
            console.log(peerConnection.current);
          }
          if (
            webRTCInfo[0]?.answerIceCandidates &&
            peerConnection.current.iceConnectionState !== "connected"
          ) {
            // webRTCInfo[0].answerIceCandidates.forEach((candidate) => {
            peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].answerIceCandidates),
            );
            console.log(peerConnection.current);
            // });
          }
        }

        if (
          userVideoRoleRef.current === "answer" &&
          peerConnection.current.iceConnectionState !== "disconnected"
        ) {
          console.log(peerConnection.current);
          if (webRTCInfo[0]?.offer && !webRTCInfo[0]?.answer) {
            console.log(peerConnection.current);
            const offer = new RTCSessionDescription(webRTCInfo[0].offer);
            await peerConnection.current.setRemoteDescription(offer);

            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            api.sendAnswer(chatroomId, user.id, chatPartner.id, answer);
            console.log("answerer send answer");
            console.log(peerConnection.current);
          }
          if (webRTCInfo[0]?.offerIceCandidates) {
            // webRTCInfo[0].offerIceCandidates.forEach((candidate) => {

            peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].offerIceCandidates),
            );
            console.log(peerConnection.current);
            // });
          }
        }

        localStreamRef.current.srcObject = stream;
      } catch (error) {
        console.error("Error starting video call:", error);
      }
    };

    startVideoCall();

    return () => {
      handleEndVideoCall;
    };
  }, [webRTCInfo]);

  const handleEndVideoCall = async () => {
    await api.deleteWebRTCData(chatroomId, user.id, chatPartner.id);
    console.log("delete webrtc data");
    setIsVideoOpen(false);
    console.log("set isVideoOpen to false");
    setWebRTCInfo(null);
    console.log("set webrtcInfo to null");
    peerConnection.current.close();

    // if (
    //   !peerConnection.current ||
    //   peerConnection.current.connectionState === "closed"
    // ) {
    //   peerConnection.current = new RTCPeerConnection(configuration);
    // }

    console.log("close connectioin");
    if (localStreamRef.current && localStreamRef.current.srcObject) {
      localStreamRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      localStreamRef.current.srcObject = null;
    }
    console.log("close local tracks");

    if (remoteStreamRef.current && remoteStreamRef.current.srcObject) {
      remoteStreamRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteStreamRef.current.srcObject = null;
    }
    console.log("close remote tracks");
  };

  return (
    <div className="relative z-10 ml-28 flex h-screen max-h-screen flex-grow  flex-col items-center justify-center bg-black">
      <h1 className="p-5 text-left text-white ">{chatPartner.name}</h1>
      <div className="flex flex-grow items-center justify-center">
        <div className="flex  flex-grow flex-col overflow-hidden ">
          <video
            autoPlay
            playsInline
            muted={false}
            ref={remoteStreamRef}
          ></video>
        </div>
        <div className="flex flex-grow flex-col overflow-hidden ">
          <video
            autoPlay
            playsInline
            muted={false}
            ref={localStreamRef}
          ></video>
        </div>
      </div>

      <div className="flex h-32 w-full items-center justify-center pb-10">
        <div className=" flex h-32 w-full items-center justify-center gap-3">
          <button
            className=" h-16 w-16 rounded-full bg-neutral-700"
            onClick={handleEndVideoCall}
          >
            <i className="fa-solid fa-volume-high text-xl text-white"></i>
          </button>
          <button
            className=" h-16 w-16 rounded-full bg-neutral-700 "
            onClick={handleEndVideoCall}
          >
            <i className="fa-solid fa-microphone text-xl text-white"></i>
          </button>
          <button
            className=" h-16 w-16 rounded-full bg-neutral-700 "
            onClick={handleEndVideoCall}
          >
            <i className="fa-solid fa-video text-xl text-white"></i>
          </button>
          <button
            className=" rotate-120 h-16 w-16 transform rounded-full bg-red-500"
            onClick={handleEndVideoCall}
          >
            <i className="fa-solid fa-phone  text-xl text-white"></i>
          </button>
        </div>
        <button
          className="fixed right-5 h-16 w-16 rounded-full "
          onClick={handleEndVideoCall}
        >
          <i className="fa-solid fa-down-left-and-up-right-to-center text-2xl text-white"></i>
        </button>
      </div>
    </div>
  );
};

export default Video;
