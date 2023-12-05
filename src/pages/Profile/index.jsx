import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import googleMapApi from "../../utils/googleMapApi";
import profileMapImage from "./profileMap.avif";

const buttonStyles = "rounded-xl bg-gray-300 py-3 px-5 w-full text-left";
const titleStyles = "text-xl font-semibold text-black mr-5 whitespace-nowrap";
const Profile = () => {
  const { logout, user, isLogin, setUser } = useAuthStore();
  const [selectedCategory, setSelectedCategory] = useState("aboutMe");
  const [locationText, setLocationText] = useState(null);
  const [editingBlock, setEditingBlock] = useState(null);
  const [inputPhoto, setInputPhoto] = useState(null);
  const nameRef = useRef();
  const birthdateRef = useRef();
  const topicRef = useRef();
  const partnerQualitiesRef = useRef();
  const goalsRef = useRef();
  const photoInputRef = useRef();
  const styleMappings = {
    meetings: { text: "In-Person Meetings", icon: "fa-solid fa-coffee" },
    textAndVoice: {
      text: "Text and Voice Messages",
      icon: "fa-solid fa-comment",
    },
    voiceAndVideo: { text: "Voice or Video Calls", icon: "fa-solid fa-video" },
  };
  const navigate = useNavigate();
  // useEffect(() => {
  //   if (!user) {
  //     alert("Please login first");
  //     navigate("/signin");
  //   }
  //   getLocation();
  //   console.log(user);
  // }, [user]);

  const getLocation = () => {
    const { latitude, longitude } = location;
    googleMapApi.getLocation(latitude, longitude).then((location) => {
      console.log(location);
      setLocationText(location);
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
      setEditingBlock(null);
      api.uploadFile(selectedFile).then((url) => {
        api.uploadUserProfilePicture(user.id, url);
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: url,
        }));
      });
    }
  };

  useEffect(() => {
    console.log(user);
  }, [user]);
  return (
    isLogin &&
    user && (
      <div className="ml-24 flex flex-wrap p-4">
        <div className="relative flex flex-col items-center justify-center">
          <div className="h-56 overflow-hidden rounded-t-xl">
            <img
              src={profileMapImage}
              alt=""
              className=" rounded-t-xl object-cover"
            />
          </div>
          <div className="absolute top-[9.5rem] z-10 flex h-44 w-full flex-col items-center justify-center">
            <div className="relative box-content flex h-36 min-h-fit w-36 min-w-fit overflow-visible rounded-full border-8 border-white">
              <img
                src={user.profilePicture}
                alt=""
                className="h-36 w-36 rounded-full object-cover"
              />
              {editingBlock !== "profilePiture" && (
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
                  />
                  <p className="text-purple500 flex items-center justify-center">
                    <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                  </p>
                </label>
              )}
            </div>

            <div className="relative mt-3 flex w-full items-center justify-center">
              <p className="whitespace-nowrap text-3xl font-semibold ">
                {user.name}
                {user.age}
              </p>
              <Link
                to={`community/${user.id}`}
                className="bg-purple100 absolute right-4 flex h-10 items-center justify-center whitespace-nowrap rounded-xl p-3"
              >
                <p className=" text-purple500 text-l ">Preview Profile</p>
              </Link>
            </div>
          </div>
        </div>
        <div className="border-1 border-gray300  relative mb-6 mt-36 w-full" />
        <aside className="flex w-1/5 flex-col gap-5 p-5 pt-0">
          <button
            onClick={() => {
              setSelectedCategory("aboutMe");
            }}
            className={`${buttonStyles} bg-purple300 text-white`}
          >
            About Me
          </button>
          <button
            onClick={() => {
              setSelectedCategory("language");
            }}
            className={buttonStyles}
          >
            Language
          </button>
          <button
            onClick={() => {
              setSelectedCategory("learningStyle");
            }}
            className={buttonStyles}
          >
            Communication Style
          </button>
          <button
            onClick={() => {
              setSelectedCategory("topic");
            }}
            className={buttonStyles}
          >
            Topic
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/signin");
            }}
            className={buttonStyles}
          >
            Logout
          </button>
        </aside>
        <section className="bg-gray100 w-4/5 rounded-xl px-16 py-14 ">
          {selectedCategory === "aboutMe" && (
            <div className="flex flex-col ">
              <div className="flex">
                <p className={`${titleStyles} `}> Name</p>

                <input
                  disabled={editingBlock !== "name"}
                  value={user.name}
                  ref={nameRef}
                  className="w-fit"
                />
                {editingBlock === "name" ? (
                  <>
                    <button onClick={() => setEditingBlock(null)}>
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveChanges({ name: nameRef.current.value });
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingBlock("name")}>
                    <p className="text-purple500 flex items-center justify-center">
                      <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                    </p>
                  </button>
                )}
              </div>
              <div className="border-1 border-gray300  relative my-8 w-full" />

              <div className="flex">
                <p className={titleStyles}> LinguoLink ID</p>
                <p>{user.id}</p>
              </div>
              <div className="border-1 border-gray300  relative my-8 w-full" />
              <div className="flex">
                <p className={titleStyles}> Birthdate</p>

                <input
                  name="birthdate"
                  type="date"
                  value={user.birthdate}
                  min="1930-01-01"
                  max={new Date().toISOString().split("T")[0]}
                  disabled={editingBlock !== "birthdate"}
                  ref={birthdateRef}
                />
                {editingBlock === "birthdate" ? (
                  <>
                    <button onClick={() => setEditingBlock(null)}>
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        handleSaveChanges({
                          birthdate: birthdateRef.current.value,
                        });
                      }}
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditingBlock("birthdate")}>
                    <p className="text-purple500 flex items-center justify-center">
                      <i className="fa-solid fa-pen p-1 text-xs"></i>Edit
                    </p>
                  </button>
                )}
              </div>
              <div className="border-1 border-gray300  relative my-8 w-full" />
              <div className="flex">
                <p className={titleStyles}> Location</p>

                {locationText && (
                  <p>{`${user.locationText.country},${user.locationText.city}`}</p>
                )}

                <button onClick={getLocation}>
                  <p className="text-purple500 flex items-center justify-center ">
                    <i className="fa-solid fa-arrow-rotate-right text-s p-1 "></i>
                    Update
                  </p>
                </button>
              </div>
              <div className="border-1 border-gray300  relative my-7 w-full" />
              <div className="flex flex-col">
                <div className="flex items-center justify-center">
                  {" "}
                  <p className={`${titleStyles} m-0`}> About Me</p>
                  {editingBlock === "aboutMe" ? (
                    <>
                      <button onClick={() => setEditingBlock(null)}>
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
                      >
                        Save
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setEditingBlock("aboutMe")}
                      className="mr-auto"
                    >
                      <p className="text-purple500 flex items-center justify-center">
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
                    value={
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
                    value={
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
                    value={
                      user.aboutMe?.goals
                        ? user.aboutMe.goals
                        : "Content not added yet"
                    }
                    ref={goalsRef}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="border-1 border-gray300  relative my-7 w-full" />

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

                        <button className="bg-purple500 border-3 absolute -right-1 bottom-0 h-7 w-7 rounded-full border-white">
                          <i className="fa-solid fa-xmark text-white"></i>
                        </button>
                      </div>
                    ) : inputPhoto?.index === index ? (
                      <div key={index}>
                        <img
                          src={URL.createObjectURL(inputPhoto.selectedFile)}
                          alt=""
                          className="h-32 w-32"
                        />
                        <button>
                          <i className="fa-solid fa-xmark"></i>
                        </button>
                      </div>
                    ) : (
                      <label className="bg-gray300 flex h-48 w-72 items-center justify-center rounded-xl">
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
              <div>
                My Native Language
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                <p>{user.nativeLanguage}</p>
              </div>
              <div>
                I can also speak fluently
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                <p>{user.alsoSpeak}</p>
              </div>
              <div>
                I am learning
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                <p>{user.learningLanguage}</p>
              </div>
              <div>
                Translate received messages into
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                <p>{user.translate}</p>
              </div>
            </>
          )}
          {selectedCategory === "learningStyle" && (
            <>
              <div>
                Communication Style
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                {Object.entries(user.communicationStyle).map(
                  ([style, value]) => {
                    return (
                      value && (
                        <p key={style}>
                          <i className={styleMappings[style].icon}></i>
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
                My Topics
                <button>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
                <div />
                {user.mainTopic ? (
                  <p>{user.mainTopic}</p>
                ) : (
                  <p>Topics not added yet</p>
                )}
              </div>
            </>
          )}
        </section>
        \
      </div>
    )
  );
};

export default Profile;
