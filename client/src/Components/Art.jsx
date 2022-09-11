import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

import { Markdown } from "./Markdown";

import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

import "./Art.scss";
import "./GitHubMarkdownToMe.scss";
import CommonButton from "./CommonButton";

export default function Art() {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [md, setMd] = useState(null);
  const [bgImageURL, setBgImageURL] = useState("");
  const [title, setTitle] = useState("");
  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    function getContent() {
      axios.get("/api/post/" + params.postURL).then(
        (res) => {
          setTimeout(() => {
            setBgImageURL(res.data.thumbnailURL);
            setTitle(res.data.title);
            setMd(res.data.content);
            setTimeout(() => {
              window.scroll({ top: 0 });
            }, 100);
          }, 500);

          document.querySelector("title").innerHTML = res.data.title;
        },
        (err) => {
          setMd("데이터를 불러오는데 실패했습니다");
        }
      );
    }

    async function setLoginInfo() {
      if ((await onSilentRefresh()) && (await onGetAuth())) {
        setLoggedIn("YES");
      } else {
        setLoggedIn("NO");
      }
    }
    getContent();
    setLoginInfo();
  }, [params.postURL]);

  if (md)
    return (
      <>
        <motion.div
          initial={{ y: window.innerHeight / 2, opacity: 0 }}
          animate={{ y: "0", opacity: 1 }}
          exit={{
            y: window.innerHeight / 2,
            opacity: 0,
          }}
        >
          <div className="common-container">
            <div className="art-hero">
              <h1>{title}</h1>
            </div>
            <Markdown md={md} />
          </div>
          {isLoggedIn === "YES" && (
            <CommonButton
              onClick={() => {
                navigate("/post/" + params.postURL + "/edit");
              }}
            >
              수정하기
            </CommonButton>
          )}
        </motion.div>
      </>
    );
}
