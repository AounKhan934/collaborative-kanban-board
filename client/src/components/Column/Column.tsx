import type { Column as ColumnType } from "../../types/board";
import Card from "../Card/Card";

type ColumnProps = {
  column: ColumnType;
};

export default function Column({ column }: ColumnProps) {
  return (
    <section className="column">
      <h2>{column.title}</h2>

      <div className="cards">
        {column.cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </section>
  );
}