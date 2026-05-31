import { motion, useTransform, useMotionTemplate, MotionValue } from "framer-motion";

interface DotPatternProps {
  style?: React.CSSProperties;
  isHovered?: boolean;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}

const DotPattern = ({ style, isHovered, mouseX, mouseY }: DotPatternProps) => {
  const moveX = useTransform(mouseX ?? new MotionValue(0), [-500, 500], [5, -5]);
  const moveY = useTransform(mouseY ?? new MotionValue(0), [-500, 500], [5, -5]);
  const patternTransform = useMotionTemplate`translate(${moveX}, ${moveY})`;

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full z-0 pointer-events-none [mask-image:linear-gradient(to_bottom,black_0%,black_92%,transparent_100%)]"
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
