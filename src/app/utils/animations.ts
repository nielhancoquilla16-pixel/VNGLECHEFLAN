// Animation Variants
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  }
};

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const fadeInDown = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4 }
  }
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

export const slideInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.5 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4 }
  }
};

// Page transition variants
export const pageTransition = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    x: 20,
    transition: { duration: 0.3, ease: 'easeIn' }
  }
};

// Bounce animation
export const bounceIn = {
  hidden: { opacity: 0, scale: 0.3 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: { duration: 0.2 }
};

export const hoverLift = {
  y: -5,
  transition: { duration: 0.2 }
};

export const tapScale = {
  scale: 0.95
};

// Rotation animation
export const rotate = {
  rotate: 360,
  transition: { duration: 0.5 }
};

// Pulse animation
export const pulse = {
  scale: [1, 1.05, 1],
  transition: { 
    duration: 0.6,
    repeat: Infinity,
    repeatDelay: 1
  }
};

// Shake animation (for errors)
export const shake = {
  x: [0, -10, 10, -10, 10, 0],
  transition: { duration: 0.4 }
};

// Loading spinner
export const spinnerVariants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

// Badge pulse (for notifications)
export const badgePulse = {
  scale: [1, 1.2, 1],
  opacity: [1, 0.8, 1],
  transition: {
    duration: 1,
    repeat: Infinity,
    ease: 'easeInOut'
  }
};

// Slide modal
export const modalVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    y: 50
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: { duration: 0.2 }
  }
};

// Backdrop
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Counter animation
export const counterVariants = {
  initial: { scale: 1 },
  animate: { 
    scale: [1, 1.3, 1],
    transition: { duration: 0.3 }
  }
};

// Notification slide in
export const notificationSlide = {
  hidden: { x: 400, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Card flip
export const flipVariants = {
  front: {
    rotateY: 0,
    transition: { duration: 0.6 }
  },
  back: {
    rotateY: 180,
    transition: { duration: 0.6 }
  }
};

// Scroll reveal
export const scrollReveal = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.6,
      ease: 'easeOut'
    }
  }
};

// Utility function for viewport animation
export const getViewportVariant = () => ({
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6 }
  }
});
