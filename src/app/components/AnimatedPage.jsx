import { motion } from 'motion/react';
import { pageTransition } from '../utils/animations';

export function AnimatedPage({ children, className = '' }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
