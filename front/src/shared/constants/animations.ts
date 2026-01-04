export const ANIMATIONS = {
 // Transitions de base
 transition: {
  DEFAULT: { duration: 0.2, ease: "easeOut" } as const,
  SPRING: { type: "spring", stiffness: 300, damping: 30 } as const,
  SLOW: { duration: 0.4, ease: "easeInOut" } as const,
 },

 // Variants pour les conteneurs (stagger children)
 container: {
  hidden: { opacity: 0 },
  show: {
   opacity: 1,
   transition: {
    staggerChildren: 0.1,
   },
  },
 },

 // Fade In (Simple opacité)
 fadeIn: {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
 },

 // Slide Up (pour les cartes, listes)
 slideUp: {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
 },

 // Scale In (pour les Modales, Popovers)
 scaleIn: {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
 },

 // Slide In Right (pour les Drawers ou Toasts)
 slideInRight: {
  hidden: { x: "100%", opacity: 0 },
  show: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.3 } },
 }
} as const;
