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
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

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
  const localPeerConnection = useRef(new RTCPeerConnection(configuration));
  const remotePeerConnection = useRef(new RTCPeerConnection(configuration));

  useEffect(() => {
    const startVideoCall = async () => {
      // 獲取本地媒體流
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current.srcObject = stream;

      // 添加本地媒體流到本地 RTCPeerConnection 實例
      stream
        .getTracks()
        .forEach((track) =>
          localPeerConnection.current.addTrack(track, stream),
        );

      localPeerConnection.current.onicecandidate = (event) => {
        if (event.candidate) {
          console.log("ICE Candidate:", event.candidate);
          // 將 ICE candidate 通知給對方，這裡使用你的 API 來傳送 candidate
          api.sendIceCandidateToRemote(
            chatroomId,
            user.id,
            chatPartner.id,
            event.candidate,
          );
        }
      };
      console.log(userVideoRoleRef.current);
      try {
        if (userVideoRoleRef.current === "offer") {
          console.log("into offer part");
          if (!webRTCInfo?.[0]?.offer) {
            console.log("send offer");
            // 創建 offer 並設置為本地 RTCPeerConnection 的本地描述
            const offer = await localPeerConnection.current.createOffer();
            await localPeerConnection.current.setLocalDescription(offer);
            // 將 offer 通知給對方，這裡使用你的 API 來傳送 offer
            api.sendOffer(chatroomId, user.id, chatPartner.id, offer);
          }
          if (webRTCInfo?.[0]?.answer && !webRTCInfo?.[0]?.iceCandidates) {
            console.log("offerer get remote answer");
            const answer = new RTCSessionDescription(webRTCInfo[0].answer);
            await localPeerConnection.current.setRemoteDescription(answer);
            console.log(localPeerConnection.current);
          }
        }
        if (userVideoRoleRef.current === "answer") {
          console.log("into answer part");
          // 接收遠端的offer 並設置為本地 RTCPeerConnection 的遠端描述
          if (webRTCInfo[0]?.offer && !webRTCInfo[0]?.answer) {
            const offer = new RTCSessionDescription(webRTCInfo[0].offer);
            await remotePeerConnection.current.setRemoteDescription(offer);
            // 創建 answer 並設置為本地 RTCPeerConnection 的本地描述
            console.log("send answer");
            console.log(remotePeerConnection.current);
            const answer = await remotePeerConnection.current.createAnswer();
            await remotePeerConnection.current.setLocalDescription(answer);
            console.log(remotePeerConnection.current);
            // 將 answer 通知給對方
            api.sendAnswer(chatroomId, user.id, chatPartner.id, answer);
          }
        }

        // 監聽對方 ICE candidate 事件，發送至本地，從這步驟開始，WebRTC peer-to-peer（點對點）連線，不再通過資料庫，而是直接進行通話
        api.onRemoteIceCandidate(chatroomId, (candidate) => {
          // 將對方的 ICE candidate 添加到本地 RTCPeerConnection
          remotePeerConnection.current.addIceCandidate(
            new RTCIceCandidate(candidate),
          );
        });

        //ontrack event 當遠端媒體流被添加到 RTCPeerConnection 時觸發，是實際的媒體數據開始傳輸的時機。
        localPeerConnection.current.ontrack = (event) => {
          setLocalStream(event.streams[0]);
        };

        remotePeerConnection.current.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
        };
      } catch (error) {
        console.error("Error starting video call:", error);
      }
    };

    startVideoCall();
  });

  const handleEndVideoCall = () => {
    setWebRTCInfo(null);
    setIsVideoOpen(!isVideoOpen);
    localPeerConnection.current.close();
    remotePeerConnection.current.close();
    // 重置本地媒體流

    localStreamRef.current.srcObject
      .getTracks()
      .forEach((track) => track.stop());
    localStreamRef.current.srcObject = null;

    // 重置遠端媒體流

    remoteStreamRef.current.srcObject
      ?.getTracks()
      .forEach((track) => track.stop());
    remoteStreamRef.current.srcObject = null;

    api.deleteWebRTCData(chatroomId, user.id, chatPartner.id);
  };

  return (
    <div>
      <h1>Video Chat Room</h1>
      <video autoPlay playsInline muted={true} ref={remoteStreamRef}></video>
      <video autoPlay playsInline muted={true} ref={localStreamRef}></video>
      <button onClick={handleEndVideoCall}>End Video Call</button>
    </div>
  );
};

export default Video;
