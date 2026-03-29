import { CharacterSheet } from "../../components/characters/CharacterSheet";

export const CharacterPage = () => {
  return (
    <div className="min-h-screen py-4">
      {/* Site header / logo */}
      <div className="cs-site-header">
        <span className="cs-site-logo">Dungeons & Dragons</span>
      </div>

      <CharacterSheet />
    </div>
  );
};

export default CharacterPage;
