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
  const streamRef = useRef(null);
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
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: true,
      });

      streamRef.current
        .getTracks()
        .forEach((track) =>
          peerConnection.current.addTrack(track, streamRef.current),
        );

      peerConnection.current.ontrack = (event) => {
        const [remoteStream] = event.streams;
        remoteStreamRef.current.srcObject = remoteStream;
      };
      peerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          api.sendIceCandidateToRemote(
            chatroomId,
            user.id,
            chatPartner.id,
            event.candidate,
            userVideoRoleRef.current,
          );
          peerConnection.current.onicecandidate = null;
        }
      };

      try {
        if (userVideoRoleRef.current === "offer") {
          if (!webRTCInfo?.[0]) {
            await api.setVideoStatus(chatroomId, user.id, chatPartner.id, {
              isConnecting: true,
            });
          }

          if (webRTCInfo[0] && !webRTCInfo[0]?.offer) {
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            await api.sendOffer(chatroomId, user.id, chatPartner.id, offer);
          }

          if (
            webRTCInfo[0].answer &&
            !peerConnection.current.currentRemoteDescription
          ) {
            const answer = new RTCSessionDescription(webRTCInfo[0].answer);
            await peerConnection.current.setRemoteDescription(answer);
          }

          if (webRTCInfo[0]?.answerIceCandidates) {
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].answerIceCandidates),
            );
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
            await peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].offerIceCandidates),
            );
          }
        }

        localStreamRef.current.srcObject = streamRef.current;
      } catch (error) {
        console.error("Error starting video call:", error);
      }
    };

    startVideoCall();
  }, [webRTCInfo]);

  const handleEndVideoCall = async () => {
    peerConnection.current.close();

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
              width={640}
              height={480}
            ></video>
          </div>
          <div className="flex flex-grow flex-col overflow-hidden ">
            <video
              autoPlay
              playsInline
              muted={false}
              ref={localStreamRef}
              width={640}
              height={480}
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
