import axios from "axios";
import { useEffect, useState } from "react";
import Flex from "@react-css/flex";

import "./Curator.scss";
import { Card } from "./Card";
import CommonButton from "./CommonButton";

export default function Curator() {
  const [sitemap, setSitemap] = useState([]);
  const [moreSitemapCount, setMoreSitemapCount] = useState(0);
  const [canMoreSitemap, setCanMoreSitemap] = useState(true);
  const [fetched, setFetched] = useState(false);

  useEffect(() => {
    if (!fetched) {
      axios.get("/api/getSitemap").then((res) => {
        setSitemap(res.data);
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

  const handleMorePosts = () => {
    if (!canMoreSitemap) {
      return;
    }
    axios.get("/api/getSitemap/more/" + moreSitemapCount).then(
      (res) => {
        const morePosts = res.data.morePosts;
        setMoreSitemapCount(() => moreSitemapCount + 1);
        setSitemap((prev) => {
          return prev.concat(morePosts);
        });
        if (res.data.canMoreSitemap === false) {
          setCanMoreSitemap(() => false);
        }
      },
      () => {
        alert("데이터 로드 실패");
      }
    );
  };

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
        {canMoreSitemap && (
          <Flex column>
            <CommonButton onClick={handleMorePosts}>더보기</CommonButton>
          </Flex>
        )}
      </>
    );
  }
}
