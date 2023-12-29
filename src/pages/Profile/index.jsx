import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import googleMapApi from "../../utils/googleMapApi";
import profileMapImage from "./profileMap.avif";

const buttonStyles = "rounded-xl bg-gray-300 py-3 px-5 w-full text-left ";
const titleStyles = "text-xl font-semibold text-black mr-5 whitespace-nowrap";
const Profile = () => {
  const { logout, user, isLogin, setUser } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("aboutMe");
  const [editingBlock, setEditingBlock] = useState(null);
  const [inputPhoto, setInputPhoto] = useState(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const nameRef = useRef();
  const birthdateRef = useRef();
  const topicRef = useRef();
  const partnerQualitiesRef = useRef();
  const goalsRef = useRef();
  const mainTopicRef = useRef();
  const styleMappings = {
    meetings: { text: "In-Person Meetings", icon: "fa-solid fa-coffee" },
    textAndVoice: {
      text: "Text and Voice Messages",
      icon: "fa-solid fa-comment",
    },
    voiceAndVideo: { text: "Voice or Video Calls", icon: "fa-solid fa-video" },
  };

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/signin");
    }
  }, []);

  const updateLocation = () => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      googleMapApi.getLocation(latitude, longitude).then((location) => {
        api.updateUser(user.id, {
          location: {
            lat: latitude,
            lng: longitude,
            city: location.city,
            country: location.country,
          },
        });
      });
      setIsFetchingLocation(false);
    });
  };

  const handleAddPhoto = (e, index, num) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setInputPhoto({ index, selectedFile });
      api.uploadFile(selectedFile).then((url) => {
        api.uploadUserPhoto(user.id, { url, num });
        user.photos[index].url = url;
      });
      api.getUser(user.id).then((user) => {
        setUser(user);
      });
    }
  };

  const handleUpdateProfilePicture = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      api.uploadFile(selectedFile).then((url) => {
        api.uploadUserProfilePicture(user.id, url);
        const newUser = { ...user, profilePicture: url };
        setUser(newUser);
        setEditingBlock(null);
      });
    }
  };

  const handleDeletePhoto = (photo) => {
    api.deleteUserPhoto(user.id, photo.num);
    const newUser = {
      ...user,
      photos: user.photos.map((item) => {
        if (item.num === photo.num) {
          item.url = "";
        }
        return item;
      }),
    };
    setUser(newUser);
  };

  const handleSaveChanges = (changes) => {
    api.updateUser(user.id, changes);
    const newUser = { ...user, ...changes };
    setUser(newUser);
    setEditingBlock(null);
  };

  return (
    isLogin &&
    user && (
      <div className="ml-24 flex h-full w-full flex-wrap bg-white p-4">
        <div className="relative flex w-full flex-col items-center justify-center">
          <div className="h-56 overflow-hidden rounded-t-xl">
            <img
              src={profileMapImage}
              alt=""
              className=" rounded-t-xl object-cover"
            />
          </div>
          <div className="absolute top-[9.5rem] z-10 flex h-44 w-full flex-col items-center justify-center">
            <div className="relative box-content flex h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-full border-8 border-white">
              {user.profilePicture && (
                <img
                  src={user.profilePicture}
                  alt=""
                  className="h-36 w-36 rounded-full object-cover"
                />
              )}
              <label className="absolute -bottom-2 -right-6">
                <input
                  id="fileInput"
                  type="file"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    setEditingBlock("profilePiture");
                    handleUpdateProfilePicture(e);
                  }}
                  accept="image/*"
                  src={user.profilePicture}
                />
                <p className="flex items-center justify-center text-purple500">
                  <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                </p>
              </label>
            </div>

            <div className="relative mt-3 flex w-full items-center justify-center">
              <p className="whitespace-nowrap text-3xl font-semibold ">
                {user.name}
                {user.age}
              </p>
              <Link
                to={`community/${user.id}`}
                className="absolute right-4 flex h-10 items-center justify-center whitespace-nowrap rounded-xl bg-purple100 p-3"
              >
                <p className=" text-l text-purple500 ">Preview Profile</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="relative mb-6  mt-36 w-full border-1 border-gray300" />
        <aside className="flex w-1/5 flex-col gap-5 p-5 pt-0">
          <button
            onClick={() => {
              setSelectedCategory("aboutMe");
            }}
            className={`${buttonStyles} ${
              selectedCategory === "aboutMe"
                ? "bg-purple300 text-white "
                : "hover:bg-gray100"
            }`}
          >
            About Me
          </button>
          <button
            onClick={() => {
              setSelectedCategory("language");
            }}
            className={`${buttonStyles} ${
              selectedCategory === "language"
                ? "bg-purple300 text-white"
                : "hover:bg-gray100"
            }`}
          >
            Language
          </button>
          <button
            onClick={() => {
              setSelectedCategory("learningStyle");
            }}
            className={`${buttonStyles} ${
              selectedCategory === "learningStyle"
                ? "bg-purple300 text-white"
                : "hover:bg-gray100"
            }`}
          >
            Communication Style
          </button>
          <button
            onClick={() => {
              setSelectedCategory("mainTopic");
            }}
            className={`${buttonStyles} ${
              selectedCategory === "mainTopic"
                ? "bg-purple300 text-white"
                : "hover:bg-gray100"
            }`}
          >
            Topic
          </button>
          <button
            onClick={() => {
              setSelectedCategory("logout");
              logout();
              navigate("/signin");
            }}
            className={`${buttonStyles} ${
              selectedCategory === "logout"
                ? "bg-purple300 text-white"
                : "hover:bg-gray100"
            }`}
          >
            Logout
          </button>
        </aside>
        <section className="w-4/5 rounded-xl bg-gray100 px-16 py-14 ">
          {selectedCategory === "aboutMe" && (
            <div className="flex flex-col ">
              <div className="flex">
                <p className={`${titleStyles} `}> Name</p>

                <input
                  disabled={editingBlock !== "name"}
                  defaultValue={user.name}
                  ref={nameRef}
                  className="max-w-fit"
                />
                {editingBlock === "name" ? (
                  <>
                    <button
                      onClick={() => setEditingBlock(null)}
                      className="ml-5 text-gray500 "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveChanges({ name: nameRef.current.value });
                      }}
                      className="ml-3 text-purple500 "
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingBlock("name")}>
                    <p className="flex items-center justify-center text-purple500">
                      <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                    </p>
                  </button>
                )}
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />

              <div className="flex">
                <p className={titleStyles}> LinguoLink ID</p>
                <p>{user.id}</p>
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />
              <div className="flex">
                <p className={titleStyles}> Birthdate</p>

                <input
                  name="birthdate"
                  type="date"
                  defaultValue={user.birthdate}
                  min="1930-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  disabled={editingBlock !== "birthdate"}
                  ref={birthdateRef}
                />
                {editingBlock === "birthdate" ? (
                  <>
                    <button
                      onClick={() => setEditingBlock(null)}
                      className="ml-5 text-gray500 "
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveChanges({
                          birthdate: birthdateRef.current.value,
                        });
                      }}
                      className="ml-3 text-purple500 "
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingBlock("birthdate")}>
                    <p className="flex items-center justify-center text-purple500">
                      <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                    </p>
                  </button>
                )}
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />
              <div className="flex">
                <p className={titleStyles}> Location</p>
                <p>{`${user.location?.placename?.country},${user.location?.placename?.city}`}</p>
                <button
                  onClick={() => {
                    updateLocation();
                    setIsFetchingLocation(true);
                  }}
                >
                  <div className="flex items-center justify-center text-purple500 ">
                    {isFetchingLocation ? (
                      "Fetching..."
                    ) : (
                      <p>
                        <i className="fa-solid fa-arrow-rotate-right text-s p-1 "></i>
                        Update
                      </p>
                    )}
                  </div>
                </button>
              </div>
              <div className="relative my-7  w-full border-1 border-gray300" />
              <div className="flex flex-col">
                <div className="flex items-center justify-center">
                  {" "}
                  <p className={`${titleStyles} m-0`}> About Me</p>
                  {editingBlock === "aboutMe" ? (
                    <>
                      <button
                        onClick={() => setEditingBlock(null)}
                        className=" text-gray500 "
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleSaveChanges({
                            aboutMe: {
                              topic: topicRef.current.value,
                              partnerQualities:
                                partnerQualitiesRef.current.value,
                              goals: goalsRef.current.value,
                            },
                          });
                        }}
                        className="ml-3 mr-auto text-purple500"
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingBlock("aboutMe")}
                      className="mr-auto"
                    >
                      <p className="flex items-center justify-center text-purple500">
                        <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                      </p>
                    </button>
                  )}
                </div>

                <div>
                  {" "}
                  <p className="mb-4 mt-5 font-semibold">
                    What topics would you like to chat about?
                  </p>
                  <input
                    disabled={editingBlock !== "aboutMe"}
                    defaultValue={
                      user.aboutMe?.topic
                        ? user.aboutMe.topic
                        : "Content not added yet"
                    }
                    ref={topicRef}
                    className="w-full"
                  />
                  <p className="mb-4 mt-5 font-semibold">
                    What qualities do you look for in a suitable LinguoLink
                    partner?
                  </p>
                  <input
                    disabled={editingBlock !== "aboutMe"}
                    defaultValue={
                      user.aboutMe?.partnerQualities
                        ? user.aboutMe.partnerQualities
                        : "Content not added yet"
                    }
                    ref={partnerQualitiesRef}
                    className="w-full"
                  />
                  <p className="mb-4 mt-5 font-semibold">
                    What are your language learning goals?
                  </p>
                  <input
                    disabled={editingBlock !== "aboutMe"}
                    defaultValue={
                      user.aboutMe?.goals
                        ? user.aboutMe.goals
                        : "Content not added yet"
                    }
                    ref={goalsRef}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="relative my-7  w-full border-1 border-gray300" />

              <div className="flex flex-wrap">
                <p className={`${titleStyles} mb-7 w-full`}> Photos</p>
                <div />
                <div className="flex flex-wrap gap-5">
                  {user?.photos?.map((photo, index) =>
                    photo.url !== "" ? (
                      <div className="relative  w-72" key={index}>
                        <div className=" h-48 min-h-fit  w-72 min-w-fit overflow-visible rounded-xl ">
                          <img
                            src={photo.url}
                            alt=""
                            className="h-48 w-72 rounded-xl object-cover"
                          />
                        </div>

                        <button
                          className="absolute -right-1 bottom-0 h-7 w-7 rounded-full border-3 border-white bg-purple500"
                          onClick={() => {
                            handleDeletePhoto(photo);
                          }}
                        >
                          <i className="fa-solid fa-xmark text-white"></i>
                        </button>
                      </div>
                    ) : (
                      <label
                        className="flex h-48 w-72 items-center justify-center rounded-xl bg-gray300"
                        key={index}
                      >
                        <input
                          id="fileInput"
                          type="file"
                          style={{ display: "none" }}
                          onChange={(e) => handleAddPhoto(e, index, photo.num)}
                          accept="image/*"
                        />
                        <i className="fa-solid fa-plus text-xl"></i>
                      </label>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
          {selectedCategory === "language" && (
            <>
              <div className="flex items-center">
                <p className={`${titleStyles} `}> My Native Language</p>
                <p className="mr-3">{user?.nativeLanguage}</p>
                <p className="flex items-center justify-center text-purple500">
                  <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                </p>
                <div />
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />
              <div className="flex items-center">
                <p className={`${titleStyles} `}> I can also speak fluently</p>
                <p className="mr-3">{user.alsoSpeak}</p>
                <p className="flex items-center justify-center text-purple500">
                  <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                </p>
                <div />
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />
              <div className="flex items-center">
                <p className={`${titleStyles} `}> I am learning</p>
                <p className="mr-3">
                  {user?.learningLanguage.learningLanguage}
                </p>
                <p className="flex items-center justify-center text-purple500">
                  <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                </p>
                <div />
              </div>
              <div className="relative my-8  w-full border-1 border-gray300" />
              <div className="flex items-center">
                <p className={`${titleStyles} `}>
                  {" "}
                  Translate received messages into
                </p>
                <p className="mr-3">{user?.translate}</p>
                <p className="flex items-center justify-center text-purple500">
                  <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                </p>
                <div />
              </div>
            </>
          )}
          {selectedCategory === "learningStyle" && (
            <>
              <div className="">
                <div className="flex ">
                  <p className={`${titleStyles} `}> Communication Style</p>
                  <p className="mr-auto flex items-center justify-center text-purple500">
                    <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                  </p>
                </div>
                <div />
                {Object.entries(user.communicationStyle).map(
                  ([style, value]) => {
                    return (
                      value && (
                        <p key={style} className="mb-4 mt-5 ">
                          <i
                            className={`${styleMappings[style].icon} mr-2 text-purple500`}
                          ></i>
                          {styleMappings[style].text}
                        </p>
                      )
                    );
                  },
                )}
              </div>
            </>
          )}
          {selectedCategory === "mainTopic" && (
            <>
              <div>
                <div className="flex  items-center ">
                  <p className={`${titleStyles} `}> My Topics</p>

                  {editingBlock === "mainTopic" ? (
                    <>
                      <button
                        onClick={() => setEditingBlock(null)}
                        className=" text-gray500 "
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          handleSaveChanges({
                            mainTopic: mainTopicRef.current.value,
                          });
                        }}
                        className="ml-3 text-purple500 "
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditingBlock("mainTopic")}>
                      <p className="flex items-center justify-center text-purple500">
                        <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                      </p>
                    </button>
                  )}
                </div>

                <input
                  disabled={editingBlock !== "mainTopic"}
                  defaultValue={user.mainTopic}
                  ref={mainTopicRef}
                  className="mb-4 mt-5 max-w-fit"
                />
              </div>
            </>
          )}
        </section>
      </div>
    )
  );
};

export default Profile;
