import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useState, useCallback, useEffect } from "react";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import googleMapApi from "../../utils/googleMapApi";

const containerStyle = {
  width: "120%",
  height: "120vh",
  transform: " scale(1.2)",
};

function MembersMap({ members }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBeawM8HzUy5PhrWyAjdWueZtuUtmhT9E4",
  });
  const [map, setMap] = useState(null);
<<<<<<< HEAD
  // const onLoad = useCallback(function callback(map) {
  //   const bounds = new window.google.maps.LatLngBounds(userCenter);
  //   map.fitBounds(bounds);

  //   setMap(map);
  // }, []);

=======
>>>>>>> d5c1856
  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);
  const [userCenter, setUserCenter] = useState(null);
  const [shownMember, setShownMember] = useState(null);
  const [markerClusterer, setMarkerClusterer] = useState(null);
  const [locationText, setLocationText] = useState("");

<<<<<<< HEAD
  //獲取使用者位置
=======
>>>>>>> d5c1856
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const initialUserCenter = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserCenter(initialUserCenter);
      },
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
        if (
          window.google &&
          window.google.maps &&
          member?.location?.geopoint?._lat &&
          member?.location?.geopoint?._long
        ) {
          const marker = new window.google.maps.Marker({
            position: {
              lat: member.location.geopoint._lat,
              lng: member.location.geopoint._long,
            },
            label,
          });

          marker.addListener("click", () => {
            setShownMember(member);
          });

          return marker;
        }
      });

      const clusterer = new MarkerClusterer({ markers, map });
      if (!markerClusterer) {
        setMarkerClusterer(clusterer);
      }
    }
  }, [isLoaded, members, map]);

  useEffect(() => {
    if (shownMember?.location?.geopoint) {
      const { latitude, longitude } = shownMember.location.geopoint;
      googleMapApi.getLocation(latitude, longitude).then((location) => {
        setLocationText(location);
      });
    }
  }, [shownMember]);

  return isLoaded && userCenter && setShownMember && markerClusterer ? (
    <div className="relative max-h-screen min-w-full overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userCenter}
        zoom={3}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        <MarkerF position={userCenter}></MarkerF>
      </GoogleMap>
      {shownMember && (
        <div className="z-1000 fixed right-6 top-6 flex h-[calc(100%-3rem)] w-80 flex-col items-center overflow-hidden rounded-2xl bg-gray100 p-6 shadow">
          <div className="absolute bottom-0  flex h-[calc(82%)] w-[calc(100%)] flex-col items-center  bg-white p-6 "></div>
          <div className=" relative z-10 flex h-full flex-col items-center justify-center">
            <div className="mt-4 box-content h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-xl border-5 border-white">
              <img
                src={shownMember?.profilePicture}
                alt=""
                className="h-36 w-36 rounded-xl object-cover"
              />
            </div>

            <h2 className="mt-3 text-center text-xl font-semibold text-black">{`${shownMember?.name}, 27`}</h2>
            <p className=" mt-3 text-sm   ">{`${
              locationText?.country && locationText?.city
                ? locationText.country + "," + locationText.city
                : "Private"
            }`}</p>

            <div className="my-5 w-full  border-1 border-gray300" />

            <div className="mr-auto">
              <small className="pr-2 text-xs font-semibold">Speak</small>
              <small className="pr-2 text-xs">
                {shownMember?.nativeLanguage}
              </small>

              <small className="pr-2 text-xs font-semibold">Learning</small>
              <small className="pr-2 text-xs">
                {shownMember?.learningLanguage?.learningLanguage}
              </small>
            </div>

            <p className="  text-l  my-3 font-light  leading-6">
              {shownMember?.mainTopic}
            </p>

            <div className="mt-auto flex w-full flex-col gap-3">
              <Link
                className="flex h-10 w-full items-center justify-center rounded-xl bg-purple100 p-3"
                to={`/community/${shownMember?.id}`}
              >
                <i className="fa-solid fa-user text-l pr-2 text-purple500"></i>
                <p className=" text-l text-purple500 ">View Profile</p>
              </Link>

              <button className="mt-auto flex h-10 items-center justify-center rounded-xl bg-purple100 p-3">
                <i className="fa-solid fa-comment text-l pr-2 text-purple500"></i>
                <p className=" text-l text-purple500 "> Message</p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : (
    <div className="flex h-screen min-w-full items-center justify-center overflow-hidden pb-10">
      <ReactLoading
        type="spin"
        color="#9d6cff"
        height={"7.5%"}
        width={"7.5%"}
      />
    </div>
  );
}

export default MembersMap;
