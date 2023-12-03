import api from "../../utils/firebaseApi";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../zustand/AuthStore";
import googleMapApi from "../../utils/googleMapApi";

const buttonStyles = "rounded-full bg-gray-300 w-8 h-8";
const Profile = () => {
  const { logout, user, isLogin, setUser } = useAuthStore();
  // const {
  //   id,
  //   name,
  //   birthdate,
  //   location,
  //   nativeLanguage,
  //   alsoSpeak,
  //   learningLanguage,
  //   translate,
  //   communicationStyle,
  //   profilePicture,
  //   aboutMe,
  // } = user;
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
  useEffect(() => {
    if (!user) {
      alert("Please login first");
      navigate("/signin");
    }
    getLocation();
  }, []);

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

  return (
    isLogin && (
      <div className="ml-28 ">
        <div>
          <img src="" alt="" />
        </div>
        <h1>My Profile</h1>
        <Link to={`community/${user.id}`}>Preview Profile</Link>
        <div />
        <aside>
          <button
            onClick={() => {
              setSelectedCategory("aboutMe");
            }}
          >
            About Me
          </button>
          <button
            onClick={() => {
              setSelectedCategory("language");
            }}
          >
            Language
          </button>
          <button
            onClick={() => {
              setSelectedCategory("learningStyle");
            }}
          >
            Communication Style
          </button>
          <button
            onClick={() => {
              setSelectedCategory("topic");
            }}
          >
            Topic
          </button>
          <button
            className={buttonStyles}
            onClick={() => {
              logout;
              navigate("/signin");
            }}
          >
            Logout
          </button>
        </aside>
        {selectedCategory === "aboutMe" && (
          <div>
            <div>
              <img src={user.profilePicture} alt="" className="h-36 w-36" />
              {editingBlock !== "profilePiture" && (
                <label>
                  <input
                    id="fileInput"
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      setEditingBlock("profilePiture");
                      handleUpdateProfilePicture(e);
                    }}
                    accept="image/*"
                  />{" "}
                  Edit
                  <i className="fa-solid fa-pen"></i>
                </label>
              )}
            </div>
            <div>
              Name
              <input
                disabled={editingBlock !== "name"}
                value={user.name}
                ref={nameRef}
              />
              {editingBlock === "name" ? (
                <>
                  <button onClick={() => setEditingBlock(null)}>Cancel</button>
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
                  <i className="fa-solid fa-pen"></i>
                  Edit
                </button>
              )}
            </div>

            <div>
              LinguoLink ID<p>{user.id}</p>
            </div>

            <div>
              Birthdate
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
                  <button onClick={() => setEditingBlock(null)}>Cancel</button>
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
                  <i className="fa-solid fa-pen"></i>
                  Edit
                </button>
              )}
            </div>

            <div>
              Location
              {locationText && (
                <p>{`${user.locationText.country},${user.locationText.city}`}</p>
              )}
              <button onClick={getLocation}>
                <i className="fa-solid fa-arrow-rotate-right"></i>Update
              </button>
            </div>

            <div>
              About Me
              {editingBlock === "aboutMe" ? (
                <>
                  <button onClick={() => setEditingBlock(null)}>Cancel</button>
                  <button
                    onClick={() => {
                      handleSaveChanges({
                        aboutMe: {
                          topic: topicRef.current.value,
                          partnerQualities: partnerQualitiesRef.current.value,
                          goals: goalsRef.current.value,
                        },
                      });
                    }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <button onClick={() => setEditingBlock("aboutMe")}>
                  <i className="fa-solid fa-pen"></i>Edit
                </button>
              )}
              <div />
              <p>What topics would you like to chat about?</p>
              <input
                disabled={editingBlock !== "aboutMe"}
                // value={aboutMe.topic ? aboutMe.topic : "Content not added yet"}
                ref={topicRef}
              />
              <p>
                What qualities do you look for in a suitable LinguoLink partner?
              </p>
              <input
                disabled={editingBlock !== "aboutMe"}
                // value={
                //   aboutMe.partnerQualities
                //     ? aboutMe.partnerQualities
                //     : "Content not added yet"
                // }
                ref={partnerQualitiesRef}
              />
              <p>What are your language learning goals?</p>
              <input
                disabled={editingBlock !== "aboutMe"}
                // value={aboutMe.goals ? aboutMe.goals : "Content not added yet"}
                ref={goalsRef}
              />
            </div>

            <div>
              Photos
              <div />
              <div>
                {user.photos.map((photo, index) =>
                  photo.url !== "" ? (
                    <div key={index}>
                      <img src={photo.url} alt="" />
                      <button>
                        <i className="fa-solid fa-xmark"></i>
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
                    <label>
                      <input
                        id="fileInput"
                        type="file"
                        style={{ display: "none" }}
                        onChange={(e) => handleAddPhoto(e, index, photo.num)}
                        accept="image/*"
                      />
                      <i className="fa-solid fa-plus"></i>
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
              {Object.entries(user.communicationStyle).map(([style, value]) => {
                return (
                  value && (
                    <p key={style}>
                      <i className={styleMappings[style].icon}></i>
                      {styleMappings[style].text}
                    </p>
                  )
                );
              })}
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
      </div>
    )
  );
};

export default Profile;
