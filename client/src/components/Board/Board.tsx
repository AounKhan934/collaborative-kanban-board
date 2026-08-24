import type { Board as BoardType } from "../../types/board";
import Column from "../Column/Column";

type BoardProps = {
  board: BoardType;
};

export default function Board({ board }: BoardProps) {
  return (
    <main className="board">
      {board.columns.map((column) => (
        <Column key={column.id} column={column} />
      ))}
    </main>
  );
}