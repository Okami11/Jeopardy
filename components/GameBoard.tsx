'use client';

import { UseSocketReturn } from '@/hooks/useSocket';
import { Category } from '@/lib/gameData';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function GameBoard({ socketHook, isHost }: Props) {
  const { gameState, myPlayerId, selectClue } = socketHook;
  if (!gameState || !gameState.roundData) return null;

  const { roundData, usedClues, lastCorrectPlayerId, phase } = gameState;
  const myPlayer = myPlayerId ? gameState.players[myPlayerId] : null;

  const canSelect = isHost || myPlayerId === lastCorrectPlayerId || (!lastCorrectPlayerId);

  function handleSelectClue(catId: string, clueId: string) {
    if (!canSelect || usedClues.includes(clueId)) return;
    selectClue(catId, clueId);
  }

  const { categories, values } = roundData;
  const round = gameState.currentRound;

  return (
    <div className="w-full h-full">
      {/* Round banner */}
      <div className="text-center mb-4">
        <span className="font-display text-lg text-yellow-400/70 tracking-widest uppercase">
          {round === 1 ? '⚔️ League of Legends' : '🌸 Anime & Manga'}
        </span>
      </div>

      {/* Board grid */}
      <div
        className="grid gap-2 w-full"
        style={{
          gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
        }}
      >
        {/* Category headers */}
        {categories.map((cat: Category) => (
          <div key={cat.id} className="category-header">
            <span className="font-display text-sm md:text-base lg:text-lg font-bold text-white text-center leading-tight uppercase tracking-wide">
              {cat.name}
            </span>
          </div>
        ))}

        {/* Clue cells */}
        {values.map((value: number) =>
          categories.map((cat: Category) => {
            const clue = cat.clues.find((c) => c.value === value);
            if (!clue) return <div key={`${cat.id}-${value}`} />;

            const used = usedClues.includes(clue.id);
            const isDD = clue.isDailyDouble;

            return (
              <button
                key={`${cat.id}-${clue.id}`}
                className={`board-cell aspect-video flex items-center justify-center
                  ${used ? 'used' : ''}
                  ${isDD && !used ? 'daily-double' : ''}
                `}
                onClick={() => handleSelectClue(cat.id, clue.id)}
                disabled={used || phase !== 'board'}
                title={isDD && !used ? 'Daily Double!' : undefined}
              >
                {!used && (
                  <span className="dollar-value">
                    ${value.toLocaleString()}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Turn indicator */}
      {lastCorrectPlayerId && gameState.players[lastCorrectPlayerId] && (
        <div className="mt-4 text-center text-sm text-[#a0b0e0]">
          {gameState.players[lastCorrectPlayerId].avatar}{' '}
          <strong className="text-yellow-400">
            {gameState.players[lastCorrectPlayerId].name}
          </strong>{' '}
          picks the next clue
        </div>
      )}
    </div>
  );
}
