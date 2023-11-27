import api from "../../utils/firebaseApi";
import { useEffect, useRef } from "react";
import useWebRTCStore from "../../zustand/webRTCStore";
import useAuthStore from "../../zustand/AuthStore";

const Video = ({
  chatroomId,
  userVideoRoleRef,
  chatPartner,
  setIsVideoOpen,
  isVideoOpen,
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
        audio: true,
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
            console.log("ICE Candidate:", event.candidate);
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
            const offer = await peerConnection.current.createOffer();
            await peerConnection.current.setLocalDescription(offer);
            api.sendOffer(chatroomId, user.id, chatPartner.id, offer);
          }
          if (webRTCInfo?.[0]?.answer && !webRTCInfo?.[0]?.iceCandidates) {
            console.log("offerer get remote answer");
            const answer = new RTCSessionDescription(webRTCInfo[0].answer);
            await peerConnection.current.setRemoteDescription(answer);
          }
          if (webRTCInfo[0]?.answerIceCandidates) {
            // webRTCInfo[0].answerIceCandidates.forEach((candidate) => {
            peerConnection.current.addIceCandidate(
              new RTCIceCandidate(webRTCInfo[0].answerIceCandidates),
            );
            // });
          }
        }

        if (userVideoRoleRef.current === "answer") {
          if (webRTCInfo[0]?.offer && !webRTCInfo[0]?.answer) {
            const offer = new RTCSessionDescription(webRTCInfo[0].offer);
            await peerConnection.current.setRemoteDescription(offer);
            const answer = await peerConnection.current.createAnswer();
            await peerConnection.current.setLocalDescription(answer);
            api.sendAnswer(chatroomId, user.id, chatPartner.id, answer);
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
    setWebRTCInfo(null);
    peerConnection.current.close();

    localStreamRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());
    localStreamRef.current.srcObject = null;

    remoteStreamRef.current.srcObject
      ?.getTracks()
      .forEach((track) => track.stop());
    remoteStreamRef.current.srcObject = null;

    setIsVideoOpen(false);
  };

  return (
    <div>
      <h1>Video Chat Room</h1>
      <video autoPlay playsInline muted={false} ref={remoteStreamRef}></video>
      <video autoPlay playsInline muted={false} ref={localStreamRef}></video>
      <button onClick={handleEndVideoCall}>End Video Call</button>
    </div>
  );
};

export default Video;
