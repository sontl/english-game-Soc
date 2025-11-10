import { motion } from "framer-motion";

const floatingElements = [
  {
    src: "/assets/decor/sun.svg",
    className: "left-[-3rem] top-6 w-32 md:w-40",
    duration: 14,
    delay: 0
  },
  {
    src: "/assets/decor/cloud-1.svg",
    className: "right-[-5rem] top-16 w-52 md:w-64",
    duration: 18,
    delay: 1.4
  },
  {
    src: "/assets/decor/cloud-2.svg",
    className: "left-10 bottom-28 w-60 md:w-72",
    duration: 20,
    delay: 0.8
  },
  {
    src: "/assets/decor/balloon.svg",
    className: "right-8 bottom-[-2rem] w-20 md:w-28",
    duration: 10,
    delay: 0.6
  },
  {
    src: "/assets/decor/star.svg",
    className: "left-1/2 top-1/3 w-16 md:w-20 -translate-x-1/2",
    duration: 12,
    delay: 1.1
  }
];

const AnimatedBackdrop = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/30" />
    {floatingElements.map((element) => (
      <motion.img
        key={element.src}
        src={element.src}
        alt=""
        className={`absolute ${element.className}`}
        initial={{ y: -12 }}
        animate={{ y: 12 }}
        transition={{
          duration: element.duration,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: element.delay
        }}
      />
    ))}
    <motion.img
      src="/assets/decor/rainbow.svg"
      alt=""
      className="absolute left-1/2 bottom-[-6rem] w-[22rem] -translate-x-1/2 opacity-80 md:w-[28rem]"
      initial={{ rotate: -2 }}
      animate={{ rotate: 2 }}
      transition={{ duration: 16, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
    />
    <div className="absolute inset-x-0 bottom-[-20%] h-[30%] bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
  </div>
);

export default AnimatedBackdrop;
