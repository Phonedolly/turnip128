import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Flex from "@react-css/flex";

import Nothing from "../Images/nothing.jpg";
export const Card = (props) => (
  <>
    <motion.div
      className="box"
      whileHover={{ scale: 1.02}}
    >
      <Flex column>
        <Link to={props.url}>
          <img
            src={props.image ?? Nothing}
            alt="썸네일"
            className="postThumb"
          ></img>
          <h2 className="postTitle">{props.title}</h2>
          <p className=" postDate">{props.postDate}</p>
        </Link>
      </Flex>
    </motion.div>
  </>
);
