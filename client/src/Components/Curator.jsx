import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import "./Curator.scss";
import { Card } from "./Card";
import CommonButton from "./CommonButton";

export default function Curator() {
  const params = useParams();
  const navigate = useNavigate();
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(
    params.moreSitemapCount ? Number(params.moreSitemapCount) : 0
  );
  const [canLoadMoreSitemap, setCanLoadMoreSitemap] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    document.querySelector("title").innerHTML = "Stardue128";
    if (!fetched) {
      axios
        .get(
          `/api/getSitemap/${
            params.moreSitemapCount ? Number(params.moreSitemapCount) : 0
          }`
        )
        .then((res) => {
          setSitemap(res.data.sitemap);
          setCanLoadMoreSitemap(res.data.canLoadMoreSitemap);
          setTimeout(() => {
            setFetched(true);
          }, 600);

          const scrollY = sessionStorage.getItem("scrollY") ?? 0;
          if (scrollY) {
            setTimeout(() => {
              window.scroll({
                behavior: "smooth",
                top: scrollY,
              });
            }, 700);
          }
        });
    }
  }, [fetched, params.moreSitemapCount]);

  const handleGoToMoreSitemap = (offset) => {
    const goToOffset = Number(params.moreSitemapCount ?? 0) + offset;
    sessionStorage.removeItem("scrollY");
    if (goToOffset === 0) {
      navigate(`/`);
    } else {
      navigate(`/${goToOffset}`);
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
        {!!(canLoadMoreSitemap || moreSitemapCount) && (
          <div className="buttom-navigator">
            {moreSitemapCount > 0 && (
              <CommonButton
                style={{ marginTop: "2em" }}
                onClick={() => {
                  setMoreSitemapCount((prev) => prev - 1);
                  handleGoToMoreSitemap(-1);
                }}
              >
                이전
              </CommonButton>
            )}
            {!!canLoadMoreSitemap && (
              <CommonButton
                onClick={() => {
                  handleGoToMoreSitemap(1);
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
