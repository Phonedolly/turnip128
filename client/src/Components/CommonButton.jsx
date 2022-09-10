import { motion } from "framer-motion";

import "./Common.scss";

export default function CommonButton(props) {
  return (
    <motion.button
      className="common-button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 1.0 }}
      {...props}
    >
      {props.children}
    </motion.button>
  );
}
