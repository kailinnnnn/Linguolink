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
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("send ice candidate to remote");
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

      try {
        if (userVideoRoleRef.current === "offer") {
          if (!webRTCInfo?.[0]) {
            await api.setVideoStatus(chatroomId, user.id, chatPartner.id, {
              isConnecting: true,
            });
            console.log("offerer set video status");
            return;
          }

          if (webRTCInfo[0] && !webRTCInfo[0]?.offer) {
            const offer = await peerConnection.current.createOffer();
            console.log("create offer");
            await peerConnection.current.setLocalDescription(offer);
            console.log("set local description");
            await api.sendOffer(chatroomId, user.id, chatPartner.id, offer);
            console.log("offerer send offer");
            return;
          }

          if (
            webRTCInfo[0].answer &&
            !peerConnection.current.currentRemoteDescription
          ) {
            console.log(peerConnection.current.currentRemoteDescription);
            console.log("offerer get remote answer");
            const answer = new RTCSessionDescription(webRTCInfo[0].answer);
            await peerConnection.current.setRemoteDescription(answer);
            return;
          }

          if (
            webRTCInfo[0]?.answerIceCandidates
            // !peerConnection.current.currentRemoteDescription
          ) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].answerIceCandidates),
            );
            console.log(peerConnection.current);
          }
        }

        if (userVideoRoleRef.current === "answer") {
          if (
            webRTCInfo?.[0]?.offer &&
            !peerConnection.current.currentRemoteDescription &&
            !peerConnection.current.currentLocalDescription
          ) {
            const offer = new RTCSessionDescription(webRTCInfo[0].offer);
            await peerConnection.current.setRemoteDescription(offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            api.sendAnswer(chatroomId, user.id, chatPartner.id, answer);
          }

          if (webRTCInfo[0]?.offerIceCandidates) {
            console.log(2);
            // webRTCInfo[0].offerIceCandidates.forEach((candidate) => {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].offerIceCandidates),
            );
            console.log(peerConnection.current);
            // });
          }
        }
        // console.log(localStreamRef.current, localStreamRef.current.srcObject);

        if (localStreamRef.current) {
          localStreamRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error starting video call:", error);
      }
    };

    startVideoCall();
  }, [webRTCInfo]);

  const handleEndVideoCall = async () => {
    console.log(localStreamRef?.current?.srcObject?.getTracks());
    if (localStreamRef.current && localStreamRef.current.srcObject) {
      localStreamRef.current.srcObject.getTracks().forEach((track) => {
        track.stop();
      });
      localStreamRef.current = null;
      console.log("stop local stream");
    }
    console.log(remoteStreamRef?.current?.srcObject?.getTracks());
    if (remoteStreamRef.current && remoteStreamRef.current.srcObject) {
      remoteStreamRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
      remoteStreamRef.current = null;
      console.log("stop remote stream");
    }
    // peerConnection.current.close();

    await api.setVideoStatus(chatroomId, user.id, chatPartner.id, {
      isConnecting: false,
    });
    await api.deleteWebRTCData(chatroomId, user.id, chatPartner.id);

    setIsVideoOpen(false);

    setWebRTCInfo(null);

    if (userVideoRoleRef.current === "offer") {
      userVideoRoleRef.current = "answer";
    }
  };

  useEffect(() => {
    return () => {
      handleEndVideoCall();
      console.log("video call end");
    };
  }, []);

  return (
    chatPartner && (
      <div className="relative z-10 flex h-screen max-h-screen flex-grow  flex-col items-center justify-center bg-[#000000]">
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
            <button className=" bg-neutral-700 h-16 w-16 rounded-full" disabled>
              <i className="fa-solid fa-volume-high text-xl text-white"></i>
            </button>
            <button
              className=" bg-neutral-700 h-16 w-16 rounded-full "
              disabled
            >
              <i className="fa-solid fa-microphone text-xl text-white"></i>
            </button>
            <button
              className=" bg-neutral-700 h-16 w-16 rounded-full "
              disabled
            >
              <i className="fa-solid fa-video text-xl text-white"></i>
            </button>
            <button
              className=" rotate-120 ml-3 h-16 w-16 transform rounded-full bg-[#FF0000]"
              onClick={() => {
                setIsVideoOpen(false);
              }}
            >
              <i className="fa-solid fa-phone  text-xl text-white"></i>
            </button>
          </div>
          <button className="fixed right-5 h-16 w-16 rounded-full " disabled>
            <i className="fa-solid fa-down-left-and-up-right-to-center text-2xl text-white"></i>
          </button>
        </div>
      </div>
    )
  );
};

export default Video;
