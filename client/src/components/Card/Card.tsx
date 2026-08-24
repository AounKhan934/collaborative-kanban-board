import type { Card as CardType } from "../../types/board";

type CardProps = {
  card: CardType;
};

export default function Card({ card }: CardProps) {
  return (
    <div className="card">
      <h3>{card.title}</h3>
      <p>{card.description}</p>
    </div>
  );
}