import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Curator.scss";
import { Card } from "./Card";
import CommonButton from "./CommonButton";

export default function Curator(props) {
  const params = useParams();
  console.log(params);
  const navigate = useNavigate();
  const [sitemap, setSitemap] = useState([]);
  const [moreIndex, setmoreIndex] = useState(
    params.moreIndex ? Number(params.moreIndex) : 0
  );
  const [canLoadMoreSitemap, setCanLoadMoreSitemap] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    document.querySelector("title").innerHTML = "Stardue128";
    if (!fetched) {
      if (props.mode === "recent-navigator") {
        axios
          .get(`/api/getRecentSitemaps/${Number(params.moreIndex) ?? 0}`)
          .then((res) => {
            console.log(res);

            setData(res.data);
          });
      } else if (props.mode === "category-navigator") {
        axios
          .post(`/api/getCategorySitemap`,{categoryName: params.categoryName, moreIndex: params.moreIndex})
          .then((res) => {
            console.log(res.data);

            setData(res.data);
          });
      }
    }
  }, [fetched, params.moreIndex, props.mode]);

  const setData=(data)=>{
    setSitemap(data.sitemap);
    setCanLoadMoreSitemap(data.canLoadMoreSitemap);
    setTimeout(() => {
      setFetched(true);
    }, 600);

    scroll();
  }

  const scroll = () => {
    const scrollY = sessionStorage.getItem("scrollY") ?? 0;
    if (scrollY) {
      setTimeout(() => {
        window.scroll({
          behavior: "smooth",
          top: scrollY,
        });
      }, 700);
    }
  };

  const handleGoToMoreIndex = (offset) => {
    const goToOffset = Number(params.moreIndex ?? 0) + offset;
    sessionStorage.removeItem("scrollY");
    if (goToOffset === 0) {
      navigate(`/`);
    } else {
      navigate(
        `/${props.mode === "category-navigator" ? "category" : ""}${goToOffset}`
      );
    }

    window.scroll({
      top: 0,
    });
  };

  /* Scroll Restoration */
  /* Source: https://stackoverflow.com/questions/71292957/react-router-v6-preserve-scroll-position */
  useEffect(() => {
    const save = () => {
      setTimeout(() => {
        sessionStorage.setItem("scrollY", window.scrollY);
      }, 100);
    };

    document.addEventListener("scroll", save);

    return () => document.removeEventListener("scroll", save);
  }, []);

  if (fetched) {
    return (
      <>
        <div className="curator-container">
          {sitemap.map((each) => {
            return (
              <Card
                title={each.title}
                image={each.thumbnailURL}
                url={"/post/" + each.postURL}
                postDate={each.postDate}
                key={each.title}
              />
            );
          })}
        </div>
        {!!(canLoadMoreSitemap || moreIndex) && (
          <div className="buttom-navigator">
            {moreIndex > 0 && (
              <CommonButton
                style={{ marginTop: "2em" }}
                onClick={() => {
                  setmoreIndex((prev) => prev - 1);
                  handleGoToMoreIndex(-1);
                }}
              >
                이전
              </CommonButton>
            )}
            {!!canLoadMoreSitemap && (
              <CommonButton
                onClick={() => {
                  handleGoToMoreIndex(1);
                }}
                style={{ marginTop: "2em" }}
              >
                다음
              </CommonButton>
            )}
          </div>
        )}
      </>
    );
  }
}
