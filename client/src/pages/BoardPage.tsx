import Board from "../components/Board/Board";
import { mockBoard } from "../state/mockBoard";

export default function BoardPage() {
  return (
    <>
      <header className="board-header">
        <h1>{mockBoard.title}</h1>
      </header>

      <Board board={mockBoard} />
    </>
  );
}