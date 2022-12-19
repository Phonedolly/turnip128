import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Flex from "@react-css/flex";

import Nothing from "../Images/nothing.jpg";
import styles from "./Card.module.scss";

export const Card = (props) => (
  <>
    {props.mode === "curator" ? (
      <motion.div className={styles.box} whileHover={{ scale: 1.02 }}>
        <Flex column>
          <Link to={props.url}>
            <img
              src={props.thumbnail || Nothing}
              alt="썸네일"
              className={styles.thumb}
            ></img>
            <h2 className={styles.title}>{props.title}</h2>
            <p className={styles.postDate}>{props.postDate}</p>
          </Link>
        </Flex>
      </motion.div>
    ) : (
      <motion.div
        className={`${styles.box} ${styles.forArticle}`}
        whileHover={{ scale: 1.02 }}
      >
        <Flex column>
          <a href={props.ogLinkURL} target="_blank">
            {props.ogThumbnail ? (
              <img
                src={props.ogThumbnail ?? Nothing}
                alt="썸네일"
                className={styles.thumb}
              ></img>
            ) : (
              <></>
            )}
            <h2 className={styles.title}>{props.title}</h2>
            <p className={styles.summary}>{props.ogLinkSummary}</p>
            <p className={styles.ogLinkRepresentativeUrl}>
              {props.ogLinkRepresentativeUrl}
            </p>
          </a>
        </Flex>
      </motion.div>
    )}
  </>
);
