import { motion, useTransform, useMotionTemplate } from "framer-motion";

const DotPattern = ({ style, isHovered, mouseX, mouseY }) => {
  // Transform mouse movement into a subtle pattern shift
  const moveX = useTransform(mouseX, [-500, 500], [5, -5]);
  const moveY = useTransform(mouseY, [-500, 500], [5, -5]);
  
  // Correctly format the patternTransform string
  const patternTransform = useMotionTemplate`translate(${moveX}, ${moveY})`;

  return (
    <motion.svg
      className="dot-pattern"
      aria-hidden="true"
      style={style}
    >
      <defs>
        <motion.pattern
          id="dot-pattern-id"
          patternTransform={patternTransform}
          x="0"
          y="0"
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <motion.circle 
            cx="2" cy="2" r="1.2" 
            animate={{ fill: isHovered ? "#3483FA" : "rgba(0, 0, 0, 0.1)" }}
            transition={{ duration: 0.4 }}
          />
        </motion.pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-pattern-id)" />
    </motion.svg>
  );
};

export default DotPattern;