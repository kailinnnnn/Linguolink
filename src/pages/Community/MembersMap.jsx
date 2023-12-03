import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MarkerClusterer,
  SuperClusterAlgorithm,
} from "@googlemaps/markerclusterer";
import { isGetAccessor } from "typescript";

const containerStyle = {
  width: "100vw",
  height: "100vh",
};

function MembersMap({ members }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBeawM8HzUy5PhrWyAjdWueZtuUtmhT9E4",
  });
  const [map, setMap] = useState(null);
  const onLoad = useCallback(function callback(map) {
    console.log(userCenter);
    const bounds = new window.google.maps.LatLngBounds(userCenter);
    map.fitBounds(bounds);

    setMap(map);
  }, []);
  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);
  const [userCenter, setUserCenter] = useState(null);
  const [shownMember, setShownMember] = useState(null);
  const [markerClusterer, setMarkerClusterer] = useState(null);

  //獲取使用者位置
  useEffect(() => {
    //瀏覽器提供的獲取使用者位置的API
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialUserCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCenter(initialUserCenter);
      },
      // 若未開啟位置追蹤，則跳出提示'允許存取使用者位置來使用此功能'
      () => {
        Swal.fire({
          position: "middle",
          text: "允許存取使用者位置來使用此功能",
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      },
    );
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const markers = members.map((member, i) => {
        const label = member.name;
        console.log(member);
        // 在使用地圖 API 之前，檢查 window.google 是否已經定義
        if (window.google && window.google.maps) {
          // 創建 Google 地圖標記實例
          console.log(member);
          const marker = new window.google.maps.Marker({
            position: { lat: member.location._lat, lng: member.location._long },
            label,
          });
          console.log(member);
          // 當標記被點擊時，打開信息窗口
          marker.addListener("click", () => {
            setShownMember(member);
          });

          return marker;
        }
        return null; // 處理 Google Maps API 尚未載入的情況
      });

      const clusterer = new MarkerClusterer({ markers, map });
      if (!markerClusterer) {
        setMarkerClusterer(clusterer);
      }
    }
  }, [isLoaded, members, markerClusterer]);

  return isLoaded && userCenter ? (
    <div className="-z-10 mt-5">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userCenter}
        zoom={10}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <MarkerF
          position={userCenter} //使用者位置，帶入經緯度
          // icon={{
          //   url: require("../../Assets/CarIcon.svg").default,
          //   scaledSize: new window.google.maps.Size(50, 35),
          //   origin: new window.google.maps.Point(0, 0),
          //   anchor: new window.google.maps.Point(15, 15),
          // }}
        ></MarkerF>
      </GoogleMap>
      {shownMember && (
        <Link
          className="z-1000 fixed right-3 top-12 flex h-full w-96 flex-col items-center  bg-white"
          to={`/community/${shownMember.id}`}
        >
          <div className="flex h-36 w-36 items-center justify-center bg-gray-300">
            <i className={`fa-solid fa-user block text-8xl text-white`}></i>
          </div>

          <h2>{`${shownMember.name},${shownMember.age}`}</h2>
          <p>{shownMember.description}</p>
          <Link
            className="items -center r ounded-full flex h-8 w-8 justify-center bg-gray-300"
            to={``}
          >
            <i className="fa-solid fa-comment text-xl text-white"></i>
          </Link>
        </Link>
      )}
    </div>
  ) : (
    <></>
  );
}

export default MembersMap;

// //   infoWindow.setContent(label);
// //   infoWindow.open(map, marker);
// const infoWindow = new window.google.maps.InfoWindow({
//   content: "",
//   disableAutoPan: true,
// });
