import Flex from "@react-css/flex";
import axios from "axios";
import { nanoid } from "nanoid";
import { useEffect, useLayoutEffect } from "react";

import { useState } from "react";
import { useNavigate, Navigate, useParams } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";

import useUnload from "./BeforeUnload";

import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

import "./Common.scss";
import "./Writer.scss";
import { Markdown } from "./Markdown";
import CommonInput from "./CommonInput";

export default function Writer(props) {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [_id, set_id] = useState("");
  const [title, setTitle] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [thumbURL, setThumbURL] = useState("");
  const [md, setMd] = useState("");
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();
  const params = useParams();
  useLayoutEffect(() => {
    async function setLoginInfo() {
      await onSilentRefresh().then(
        () => {},
        () => {
          setLoggedIn("NO");
          return;
        }
      );
      onGetAuth().then(
        () => {
          setLoggedIn("YES");
        },
        () => {
          setLoggedIn("NO");
        }
      );
    }

    async function getMd() {
      await axios.get("/api/post/" + params.postURL).then(
        (res) => {
          set_id(res.data._id);
          setTitle(res.data.title);
          setNewTitle(res.data.title);
          setMd(res.data.content);
          if (res.data.category) {
            setSelectedCategory(res.data.category);
          }
          setThumbURL(() => res.data.thumbnailURL);

          res.data.images?.forEach((eachImage) => {
            const imageData = {
              imageLocation: eachImage.imageLocation,
              imageName: eachImage.imageName,
              isThumb: eachImage.imageLocation === res.data.thumbnailURL,
            };
            setImages((prevImages) => prevImages.concat(imageData));
          });

          /* ?????????????????? ????????? ????????? ?????? ???????????? images??? ?????? */
          let thereIsThumbAndMd = false; // ???????????? ????????? ????????? ?????? ???????????? ?????? ?????????
          res.data.images.forEach((eachImage) => {
            if (eachImage.imageLocation === res.data.thumbnailURL) {
              thereIsThumbAndMd = true; // ?????????????????? ????????? ?????? ???????????? ????????????
            }
          });
          if (!thereIsThumbAndMd) {
            const token = res.data.thumbnailURL?.split("/");

            if (token) {
              setImages((images) => {
                const newCond = [
                  {
                    imageLocation: res.data.thumbnailURL,
                    imageName: token[token.length - 1],
                    isThumb: true,
                  },
                ].concat(images);
                return newCond;
              });
            }
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }

    async function getCategories() {
      const data = (await axios.get("/api/category/getCategories")).data
        .categories;
      setCategories(data);
      if (!props.isEdit) {
        setSelectedCategory(data[0]._id);
      }
    }

    async function importArticle() {
      const naverArticle = await axios
        .post("/api/import", {
          clubID: params.clubID,
          articleNumber: params.articleNumber,
        })
        .then(({ data }) => ({
          importTitle: data.title,
          images: data.images,
          mdContent: data.mdContent,
        }))
        .then(({ importTitle, mdContent, images }) => {
          setTitle(() => importTitle);
          images.forEach((image, index) => {
            image.isThumb = index === 0 ? true : false;
            setImages((prevImages) => prevImages.concat(image));
          });
          setMd(mdContent);
        });
    }

    setLoginInfo();
    getCategories();
    if (props.isEdit) {
      getMd();
    } else if (props.isImport) {
      importArticle();
    }
  }, [params.postURL, props.isEdit, props.isImport, props.importURL]);

  const handleImageInput = async (e) => {
    const formData = new FormData();
    formData.append("filename", e.target.files[0].name);
    formData.append("img", e.target.files[0]);

    axios
      .post("/api/publish/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then(
        (res) => {
          setImages((images) => {
            const newCond = images.concat({
              imageLocation: res.data.imageLocation,
              imageName: res.data.imageName,
              isThumb: images.length === 0 ? true : false,
            });
            if (images.length === 0) {
              setThumbURL(res.data.imageLocation);
            }
            return newCond;
          });
        },
        (err) => {
          alert("????????? ????????? ??????");
        }
      );
  };

  const handleThumb = (e) => {
    const srcUrl = e.target.src;
    images.forEach((eachImage, n) => {
      if (eachImage.isThumb) {
        setImages((original) => {
          const newCond = [].concat(original);
          newCond[n].isThumb = false;
          return newCond;
        });
      }
      if (eachImage.imageLocation === srcUrl) {
        setImages((original) => {
          const newCond = [].concat(original);
          newCond[n].isThumb = true;
          return newCond;
        });
        setThumbURL(eachImage.imageLocation);
      }
    });
  };

  const handleSetValue = (e) => {
    setMd(e.target.value);
  };

  const handleSetTab = (e) => {
    if (e.keyCode === 9) {
      e.preventDefault();
      let val = e.target.value;
      let start = e.target.selectionStart;
      let end = e.target.selectionEnd;
      e.target.value = val.substring(0, start) + "\t" + val.substring(end);
      e.target.selectionStart = e.target.selectionEnd = start + 1;
      handleSetValue(e);
      return false; //  prevent focus
    }
  };

  const handleUpload = async () => {
    if (!title) {
      alert("????????? ????????????");
      return;
    }
    const imageBlacklist = [];
    const imageWhitelist = [];
    images.forEach((eachImage) => {
      if (
        !md.includes(eachImage.imageLocation) &&
        thumbURL !== eachImage.imageLocation
      ) {
        imageBlacklist.push({ Key: eachImage.imageName });
      } else {
        imageWhitelist.push({
          imageLocation: eachImage.imageLocation,
          imageName: eachImage.imageName,
        });
      }
    });
    axios
      .post(`/api/publish/${props.isEdit ? "edit" : ""}`, {
        _id: _id,
        title: title,
        newTitle: props.isEdit ? newTitle : null,
        content: md,
        thumbnailURL: thumbURL,
        imageWhitelist: imageWhitelist,
        imageBlacklist: imageBlacklist,
        category: selectedCategory,
      })
      .then(
        (res) => {
          // removeBeforeUnload();
          navigate("/");
        },
        (err) => {
          console.error(err);
          console.error("Post Upload Error");
        }
      );
  };

  useUnload((e) => {
    e.preventDefault();
    e.returnValue = "";
  });

  const mdErrorHandler = ({ error, resetErrorBoundary }) => {
    return (
      <div role="alert">
        <p>???????????? ?????? ???????????????.</p>
        <p>??????????????? ????????? ??????: {md[md.length - 1]}</p>
        <button className="writer-button" onClick={() => resetErrorBoundary()}>
          ?????? ??????
        </button>
      </div>
    );
  };

  const saveTempData = () => {
    localStorage.setItem(
      "tempData",
      JSON.stringify({ title: title, images: images, md: md })
    );
    alert("?????? ?????? ???????????????");
  };

  const LoadTempData = () => {
    const tempData = JSON.parse(localStorage.getItem("tempData"));
    if (tempData) {
      setTitle(tempData.title);
      setImages(tempData.images);
      setMd(tempData.md);

      alert("?????? ?????? ???????????? ??????????????????");
    } else {
      alert("????????? ???????????? ????????????");
    }
  };
  const removeTempData = () => {
    localStorage.removeItem("tempData");
    alert("?????? ?????? ???????????? ???????????????.");
  };

  /* https://velog.io/@hwanieee/textarea-%EC%9E%90%EB%8F%99-%EB%86%92%EC%9D%B4-%EC%A1%B0%EC%A0%88
   */
  const autoResizeTextarea = () => {
    let textarea = document.querySelector(".inputTextArea");

    if (textarea) {
      textarea.style.height = "auto";
      let height = textarea.scrollHeight; // ??????
      textarea.style.height = `${height + 8}px`;
    }
  };

  if (isLoggedIn === "NO") {
    return <Navigate replace to="/" />;
  } else if (isLoggedIn === "PENDING") {
    return <div>???????????????</div>;
  } else {
    return (
      <>
        <Flex column className="writer-container">
          <Flex row justifySpaceBetween>
            <CommonInput
              placeholder="??????"
              value={props.isEdit ? newTitle : title}
              onInput={(e) => {
                if (props.isEdit) {
                  setNewTitle(e.target.value);
                } else {
                  setTitle(e.target.value);
                }
              }}
              style={{ width: "60%" }}
            />
            <button onClick={saveTempData} className="writer-button">
              ?????? ??????
            </button>
            <button onClick={LoadTempData} className="writer-button small-text">
              ?????? ??????<br></br>????????????
            </button>
            <button
              onClick={removeTempData}
              className="writer-button small-text"
            >
              ?????? ?????????<br></br>?????????
            </button>
            <select
              onChange={(e) => {
                setSelectedCategory(e.target.value);
              }}
              defaultValue={selectedCategory}
              key={selectedCategory}
            >
              {categories?.map((eachCategory) => (
                <option key={eachCategory._id} value={eachCategory._id}>
                  {eachCategory.name}
                </option>
              ))}
            </select>
            <button onClick={handleUpload} className="writer-button">
              ?????????
            </button>
          </Flex>
          <textarea
            placeholder="????????? URL"
            className="inputThumbnailArea"
            value={thumbURL}
            onInput={(e) => {
              setThumbURL(e.target.value);
            }}
          />
          <div>
            <div className="imageGroup">
              {images.map((eachImage) => (
                <Flex column key={nanoid()} className="uploadedImageBox">
                  <img
                    src={eachImage.imageLocation}
                    className="uploadedImage"
                    alt={eachImage.imageLocation}
                    onClick={handleThumb}
                  />
                  <pre disabled>{eachImage.imageLocation}</pre>
                  {eachImage.isThumb && <p>??????</p>}
                </Flex>
              ))}
            </div>
          </div>
          <input type="file" accept="image/*" onChange={handleImageInput} />
          <div className="inputAndMd">
            <textarea
              placeholder="????????? ???????????????"
              className="inputMdArea"
              value={md}
              onChange={(e) => {
                handleSetValue(e);
                autoResizeTextarea();
              }}
              onKeyDown={(e) => {
                handleSetTab(e);
                autoResizeTextarea();
              }}
            />
            <div className="showTextArea">
              <ErrorBoundary
                FallbackComponent={mdErrorHandler}
                onReset={() => {
                  setMd((prevMd) => prevMd.slice(0, prevMd.length - 1));
                }}
              >
                <Markdown md={md} />
              </ErrorBoundary>
            </div>
          </div>
        </Flex>
      </>
    );
  }
}
