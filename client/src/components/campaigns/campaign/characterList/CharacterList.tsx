import type { Character } from "../../../../types/characters/characters";

function CharacterList({ characters }: { characters: Character[] }) {
  return (
    <div>
      <h1>Character List</h1>
      <ul>
        {characters.map((character) => <li key={character.id}>{character.name}</li>)}
      </ul>
    </div>
  );
}

export default CharacterList;