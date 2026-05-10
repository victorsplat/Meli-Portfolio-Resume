import { motion, AnimatePresence } from "framer-motion";
import { IoArrowUp } from "react-icons/io5";

const BackToTop = ({ visible }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          className="fixed bottom-8 right-8 w-[50px] h-[50px] rounded-full bg-[#2D3277] text-white border-none cursor-pointer flex items-center justify-center shadow-lg z-[100] outline-none"
          onClick={scrollToTop}
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.8 }}
          whileHover={{ scale: 1.1, backgroundColor: "#2968c8" }}
          whileTap={{ scale: 0.9, backgroundColor: "#1d4ed8" }}
          aria-label="Back to top"
        >
          <IoArrowUp size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default BackToTop;
