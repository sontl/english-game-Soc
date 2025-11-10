interface GameCardProps {
  title: string;
  description: string;
}

const GameCard = ({ title, description }: GameCardProps) => (
  <article className="flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-white/80 via-white to-secondary/40 p-5 shadow-xl transition-transform hover:-translate-y-1">
    <div>
      <h3 className="text-2xl font-extrabold text-primary drop-shadow">{title}</h3>
      <p className="mt-2 text-base text-slate-700">{description}</p>
    </div>
    <span className="mt-4 inline-block rounded-full bg-primary px-4 py-2 text-center text-white">
      Play now
    </span>
  </article>
);

export default GameCard;
