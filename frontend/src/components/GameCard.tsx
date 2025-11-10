import { motion } from "framer-motion";

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  gradient: string;
  accentColor: string;
  badge: string;
}

const GameCard = ({ title, description, image, gradient, accentColor, badge }: GameCardProps) => (
  <motion.article
    whileHover={{ y: -12, rotate: -1 }}
    whileTap={{ scale: 0.97 }}
    className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-[28px] bg-gradient-to-br ${gradient} p-6 shadow-xl shadow-primary/20 transition-transform`}
  >
    <div className="absolute inset-0 bg-white/30 mix-blend-soft-light" />
    <div className="relative flex items-start justify-between gap-4">
      <div>
        <h3 className="text-2xl font-extrabold drop-shadow-md" style={{ color: accentColor }}>
          {title}
        </h3>
        <p className="mt-3 max-w-[18rem] text-sm font-semibold text-slate-700">
          {description}
        </p>
      </div>
      <motion.img
        src={image}
        alt=""
        className="w-24 shrink-0 drop-shadow-bubbly"
        initial={{ y: -8 }}
        animate={{ y: 8 }}
        transition={{ duration: 5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
    </div>
    <div className="relative mt-6 flex items-center justify-between">
      <span
        className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-md shadow-secondary/30"
        style={{ backgroundColor: accentColor }}
      >
        {badge}
      </span>
      <span className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Play now →
      </span>
    </div>
  </motion.article>
);

export default GameCard;
