import axios from "axios";
import { useEffect, useState } from "react";
import Flex from "@react-css/flex";

import "./Curator.scss";
import { Card } from "./Card";
import CommonButton from "./CommonButton";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(0);
  const [canLoadMoreSitemap, setCanLoadMoreSitemap] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!fetched) {
      axios.get("/api/getSitemap").then((res) => {
        console.log(res.data);
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
  }, [fetched]);

  useEffect(() => {
    if (!fetched) {
      return;
    }
    window.scroll({
      top: 0,
    });
    axios.get(`/api/getSitemap/more/${moreSitemapCount}`).then((res) => {
      console.log(res.data);
      const newPosts = res.data.sitemap;
      setSitemap(newPosts);
      setCanLoadMoreSitemap(res.data.canLoadMoreSitemap);
    });
  }, [moreSitemapCount]);

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
        {(canLoadMoreSitemap || moreSitemapCount) && (
          <div className="buttom-navigator">
            {moreSitemapCount > 0 && (
              <CommonButton
                style={{ marginTop: "2em" }}
                onClick={() => setMoreSitemapCount((prev) => prev - 1)}
              >
                이전
              </CommonButton>
            )}
            {canLoadMoreSitemap && (
              <CommonButton
                onClick={() => setMoreSitemapCount((prev) => prev + 1)}
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
