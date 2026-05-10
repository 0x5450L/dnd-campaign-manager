import { useParams, useNavigate } from "react-router-dom";
import { useCampaigns } from "../../hooks/useCampaigns";
import { useAuth } from "../../hooks/useAuth";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Campaign } from "../../types/campaigns";
import type { Character, CharacterType } from "../../types/characters/characters";
import CommonInput from "../../components/ui/inputs/CommonInput";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import CreateInvite from "../../components/campaigns/campaign/CreateInvite";
import CommonButton from "../../components/ui/buttons/CommonButton";
import { useSSE } from "../../hooks/useSSE";
import { CharacterSheet } from "../../components/characters/CharacterSheet";
import CharactersSidebar from "../../components/campaigns/campaign/characterList/CharactersSidebar";
import { deleteCharacter, getCampaignCharacters } from "../../services/api/characters";

type SheetMode =
  | { kind: "closed" }
  | { kind: "edit"; characterId: string }
  | { kind: "create"; type: CharacterType };

function CampaignPage() {
  const { id } = useParams();
  const { deleteCampaign, fetchCampaign, updateCampaign, message, fetchCampaigns, isLoading } = useCampaigns();
  const { subscribe } = useSSE();

  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [originalCampaign, setOriginalCampaign] = useState<Campaign | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [sheetMode, setSheetMode] = useState<SheetMode>({ kind: "closed" });
  const [isCharactersSidebarOpen, setIsCharactersSidebarOpen] = useState(false);
  const [characterToDelete, setCharacterToDelete] = useState<Character | null>(null);

  const isDM = user?.id === campaign?.dmId;

  const myCharacter = useMemo(
    () => characters.find((c) => c.userId === user?.id && c.type === "player") ?? null,
    [characters, user?.id],
  );

  const hasChanges =
    campaign &&
    originalCampaign &&
    (campaign.name !== originalCampaign.name ||
      campaign.description !== originalCampaign.description ||
      campaign.setting !== originalCampaign.setting ||
      campaign.imageUrl !== originalCampaign.imageUrl);

  useEffect(() => {
    if (id) {
      fetchCampaign(id)
        .then((data) => {
          setCampaign(data);
          setOriginalCampaign(data);
        })
        .catch((error) => console.error("Error fetching campaign:", error));
    }
  }, [id, fetchCampaign]);

  useEffect(() => {
    const unsubscribe = subscribe("member_joined", (data: unknown) => {
      if ((data as { campaignId: string }).campaignId === id) {
        fetchCampaign(id as string).then((data) => {
          if (data) {
            setCampaign(data);
            setOriginalCampaign(data);
          }
        });
      }
    });
    return unsubscribe;
  }, [id, subscribe, fetchCampaign]);

  const refetchCharacters = useCallback(() => {
    if (!id) return;
    getCampaignCharacters(id)
      .then((res) => setCharacters(res.characters))
      .catch((error) => console.error("Error fetching characters:", error));
  }, [id]);

  useEffect(() => {
    refetchCharacters();
  }, [refetchCharacters]);

  useEffect(() => {
    if (!id) return;

    const matchesCampaign = (data: unknown) =>
      (data as { campaignId?: string }).campaignId === id;

    const unsubCreated = subscribe("character_created", (data) => {
      if (matchesCampaign(data)) refetchCharacters();
    });

    const unsubUpdated = subscribe("character_updated", (data) => {
      if (matchesCampaign(data)) refetchCharacters();
    });

    const unsubDeleted = subscribe("character_deleted", (data) => {
      if (!matchesCampaign(data)) return;
      const { characterId } = data as { characterId: string };
      setCharacters((prev) => prev.filter((c) => c.id !== characterId));
    });

    return () => {
      unsubCreated();
      unsubUpdated();
      unsubDeleted();
    };
  }, [id, subscribe, refetchCharacters]);

  const handleSave = async () => {
    if (!campaign || !hasChanges) return;
    const updated = await updateCampaign(campaign.id, {
      name: campaign.name,
      description: campaign.description,
      setting: campaign.setting,
      imageUrl: campaign.imageUrl,
    });
    if (updated) {
      setOriginalCampaign({ ...campaign, ...updated });
    }
    fetchCampaigns();
  };

  const handleDeleteCampaign = () => {
    if (!id) return;
    deleteCampaign(id);
  };

  const handleOpenMyCharacter = () => {
    if (myCharacter) {
      setSheetMode({ kind: "edit", characterId: myCharacter.id });
    } else {
      setSheetMode({ kind: "create", type: "player" });
    }
  };

  const handleOpenCharacterFromSidebar = (character: Character) => {
    setSheetMode({ kind: "edit", characterId: character.id });
  };

  const handleCreateNpc = () => {
    setSheetMode({ kind: "create", type: "npc" });
  };

  const handleCharacterSaved = (saved: Character) => {
    setCharacters((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
    });
  };

  const handleConfirmDeleteCharacter = async () => {
    if (!characterToDelete) return;
    const target = characterToDelete;
    setCharacterToDelete(null);
    try {
      await deleteCharacter(target.id);
      setCharacters((prev) => prev.filter((c) => c.id !== target.id));
    } catch (error) {
      console.error("Error deleting character:", error);
    }
  };

  if (!campaign) {
    return (
      <div className="max-w-3xl mx-auto p-6 flex flex-col gap-4">
        {message ? (
          <p className="text-red-400">{message}</p>
        ) : (
          <p className="text-gray-400">Campaign not found.</p>
        )}
        <CommonButton onClick={() => navigate("/campaigns")} variant="secondary" size="sm">
          Back to campaigns
        </CommonButton>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-53px)] h-100% max-w-3xl mx-auto p-6 flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <CommonButton onClick={() => navigate("/campaigns")} variant="secondary" size="sm">
          &larr; To Campaigns
        </CommonButton>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {isDM ? (
            <CommonButton onClick={() => setIsCharactersSidebarOpen(true)} size="sm">
              Characters ({characters.length})
            </CommonButton>
          ) : (
            <CommonButton onClick={handleOpenMyCharacter} size="sm">
              {myCharacter ? "My Character" : "Create Character"}
            </CommonButton>
          )}

          {isDM && (
            <>
              {hasChanges && (
                <CommonButton onClick={handleSave} size="sm">
                  Save
                </CommonButton>
              )}
              <CommonButton onClick={() => setShowDeleteConfirm(true)} variant="decline" size="sm">
                Delete Campaign
              </CommonButton>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <p className="text-amber-400 m-auto">Loading campaign...</p>
      ) : (
        <>
          <div className="flex flex-col gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <CommonInput
              type="text"
              name="name"
              value={campaign.name}
              disabled={!isDM}
              onChange={(value) => setCampaign({ ...campaign, name: value })}
              inputClassName="text-2xl font-bold text-amber-400"
              validator={(value) => {
                if (!value?.trim()) {
                  return { errorMessage: "name is required", validatedValue: value };
                }
                return { errorMessage: null, validatedValue: value };
              }}
            />

            <p className="text-sm text-gray-400 mt-1">DM: {campaign.dm.displayName}</p>

            {(campaign.description || isDM) && (
              <CommonInput
                type="text"
                name="description"
                value={campaign.description}
                disabled={!isDM}
                onChange={(value) => setCampaign({ ...campaign, description: value })}
              >
                Description
              </CommonInput>
            )}

            {(campaign.setting || isDM) && (
              <CommonInput
                type="text"
                name="setting"
                value={campaign.setting}
                disabled={!isDM}
                onChange={(value) => setCampaign({ ...campaign, setting: value })}
              >
                Setting
              </CommonInput>
            )}

            {(campaign.imageUrl || isDM) && (
              <CommonInput
                type="text"
                name="imageUrl"
                value={campaign.imageUrl}
                disabled={!isDM}
                onChange={(value) => setCampaign({ ...campaign, imageUrl: value })}
              >
                Image URL
              </CommonInput>
            )}
          </div>

          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <h2 className="text-lg font-semibold text-gray-200 mb-3">Members ({campaign.members.length})</h2>
            <ul className="flex flex-col gap-2">
              {campaign.members.map((member) => (
                <li key={member.id} className="flex items-center justify-between bg-gray-700/30 px-4 py-2 rounded-lg">
                  <span className="text-gray-300">{member.user.displayName}</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      member.role === "dm" ? "bg-amber-600/20 text-amber-300" : "bg-blue-600/20 text-blue-300"
                    }`}
                  >
                    {member.role}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <CreateInvite campaignId={campaign.id} />
        </>
      )}

      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete Campaign"
          message="Are you sure you want to delete this campaign? This action cannot be undone."
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteCampaign}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      {characterToDelete && (
        <ConfirmDialog
          title="Delete character"
          message={`Are you sure you want to delete "${characterToDelete.name || "this character"}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleConfirmDeleteCharacter}
          onCancel={() => setCharacterToDelete(null)}
        />
      )}

      {isDM && (
        <CharactersSidebar
          isOpen={isCharactersSidebarOpen}
          onClose={() => setIsCharactersSidebarOpen(false)}
          characters={characters}
          dmId={campaign.dmId}
          onOpenCharacter={handleOpenCharacterFromSidebar}
          onCreateNpc={handleCreateNpc}
          onDeleteCharacter={(c) => setCharacterToDelete(c)}
        />
      )}

      <CharacterSheet
        isOpen={sheetMode.kind !== "closed"}
        characterId={sheetMode.kind === "edit" ? sheetMode.characterId : undefined}
        defaultType={sheetMode.kind === "create" ? sheetMode.type : "player"}
        campaignId={campaign.id}
        onSaved={handleCharacterSaved}
        onClose={() => setSheetMode({ kind: "closed" })}
      />
    </div>
  );
}

export default CampaignPage;
