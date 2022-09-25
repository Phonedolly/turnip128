import axios from "axios";
import { useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import React from "react";
import { motion } from "framer-motion";

import { Markdown } from "./Markdown";

import { onGetAuth, onSilentRefresh } from "../Util/LoginTools";

import "./Art.scss";
import "./GitHubMarkdownToMe.scss";
import CommonButton from "./CommonButton";
import { useEffect } from "react";

export default function Art() {
  const [isLoggedIn, setLoggedIn] = useState("PENDING");
  const [md, setMd] = useState(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [scrollInit, setScrollInit] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  useLayoutEffect(() => {
    function getContent() {
      axios.get("/api/post/" + params.postURL).then(
        (res) => {
          document.querySelector("title").innerHTML = res.data.title;
          setTitle(res.data.title);
          setDate(res.data.createdAt.split("T")[0]);
          setMd(res.data.content);
        },
        (err) => {
          setMd("데이터를 불러오는데 실패했습니다");
        }
      );
    }

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
    getContent();
    setLoginInfo();
  }, [params.postURL]);

  useEffect(() => {
    if (!md || !title || !date) {
      return;
    }
    // window.scroll({ top: 0 });
    // setScrollInit(true);
    // setTimeout(() => {
    //   window.scroll({ top: 0 });
    // }, 500);
  }, [md, title, date]);

  if (md)
    return (
      <>
        <div>
          <div className="common-container">
            <div className="art-hero">
              <h1 className="art-hero-title">{title}</h1>
              <p className="art-hero-date">{date}</p>
            </div>
            <Markdown md={md} />
            {isLoggedIn === "YES" && (
              <div className="edit-button-container">
                <CommonButton
                  onClick={() => {
                    navigate("/post/" + params.postURL + "/edit");
                  }}
                  className="art-edit-button common-button"
                >
                  수정하기
                </CommonButton>
              </div>
            )}
          </div>
        </div>
      </>
    );
}
