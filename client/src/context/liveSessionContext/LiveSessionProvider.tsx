import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { LiveSessionContext, type LiveSessionContextType } from "./LiveSessionContext";
import { getSocket } from "../../services/socket";
import {
  initialLiveSessionState,
  liveSessionReducer,
  type ParticipantPatch,
  type SessionRollInput,
} from "../../state/liveSession/liveSessionReducer";
import type {
  MemberPresence,
  PresenceStatus,
} from "../../types/session";
import type {
  EncounterDTO,
  EncounterParticipantDTO,
  ParticipantAbilityScore,
  SpellSlotLevel,
} from "../../types/encounter";
import type { Campaign } from "../../types/campaigns";
import type {
  PresenceChangedPayload,
  RollLoggedPayload,
  SessionEndedPayload,
  SessionStartedPayload,
} from "../../../../shared/socketEvents";

type Props = {
  campaign: Campaign;
  children: ReactNode;
};

const newId = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const presenceFromUserIds = (
  campaign: Campaign,
  connectedUserIds: string[],
): MemberPresence[] => {
  const connected = new Set(connectedUserIds);
  return campaign.members.map((m) => ({
    userId: m.userId,
    status: connected.has(m.userId) ? "connected" : "offline",
  }));
};

const seedEncounter = (campaignSessionId: string): EncounterDTO => {
  const now = new Date().toISOString();
  return {
    id: newId("enc"),
    name: "Goblin Ambush",
    status: "active",
    round: 1,
    currentTurnIndex: 0,
    campaignSessionId,
    startedAt: now,
    updatedAt: now,
    endedAt: null,
  };
};

const goblinBossAbilities: ParticipantAbilityScore[] = [
  { name: "str", score: 15 },
  { name: "dex", score: 14 },
  { name: "con", score: 12 },
  { name: "int", score: 10 },
  { name: "wis", score: 8 },
  { name: "cha", score: 10 },
];

const wizardSpellSlots: SpellSlotLevel[] = [
  { level: 1, total: 4, used: 1 },
  { level: 2, total: 3, used: 0 },
  { level: 3, total: 2, used: 0 },
];

const goblinBossSpellSlots: SpellSlotLevel[] = [
  { level: 1, total: 3, used: 0 },
  { level: 2, total: 1, used: 0 },
];

const goblinScoutAbilities: ParticipantAbilityScore[] = [
  { name: "str", score: 8 },
  { name: "dex", score: 14 },
  { name: "con", score: 10 },
  { name: "int", score: 10 },
  { name: "wis", score: 8 },
  { name: "cha", score: 8 },
];

const seedParticipants = (
  encounterId: string,
  campaign: Campaign,
): EncounterParticipantDTO[] => {
  const now = new Date().toISOString();
  const players: EncounterParticipantDTO[] = campaign.members
    .filter((m) => m.role === "player")
    .slice(0, 4)
    .map((m, idx) => ({
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "pc",
      name: m.user.displayName,
      sortOrder: 18 - idx * 2,
      maxHp: 28 + idx * 4,
      currentHp: 28 + idx * 4,
      tempHp: 0,
      armorClass: 15 + (idx % 3),
      attacks: [],
      conditions: [],
      isVisible: true,
      acHidden: false,
      typeHidden: false,
      abilityScores: null,
      spellAbility: null,
      proficiencyBonus: 2,
      spellSlots: idx === 0 ? wizardSpellSlots : null,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    }));

  const monsters: EncounterParticipantDTO[] = [
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Boss",
      sortOrder: 17,
      maxHp: 21,
      currentHp: 21,
      tempHp: 0,
      armorClass: 17,
      attacks: [],
      conditions: [],
      isVisible: true,
      acHidden: true,
      typeHidden: false,
      abilityScores: goblinBossAbilities,
      spellAbility: "wis",
      proficiencyBonus: 2,
      spellSlots: goblinBossSpellSlots,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Scout A",
      sortOrder: 14,
      maxHp: 7,
      currentHp: 7,
      tempHp: 0,
      armorClass: 13,
      attacks: [],
      conditions: [],
      isVisible: true,
      acHidden: true,
      typeHidden: false,
      abilityScores: goblinScoutAbilities,
      spellAbility: null,
      proficiencyBonus: 2,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: newId("p"),
      encounterId,
      characterId: null,
      type: "monster",
      name: "Goblin Scout B",
      sortOrder: 12,
      maxHp: 7,
      currentHp: 7,
      tempHp: 0,
      armorClass: 13,
      attacks: [],
      conditions: [],
      isVisible: false,
      acHidden: true,
      typeHidden: true,
      abilityScores: goblinScoutAbilities,
      spellAbility: null,
      proficiencyBonus: 2,
      deathSaveSuccesses: 0,
      deathSaveFailures: 0,
      createdAt: now,
      updatedAt: now,
    },
  ];

  return [...players, ...monsters].sort((a, b) => b.sortOrder - a.sortOrder);
};

export const LiveSessionProvider = ({ campaign, children }: Props) => {
  const [state, dispatch] = useReducer(liveSessionReducer, initialLiveSessionState);

  const campaignRef = useRef(campaign);
  useEffect(() => {
    campaignRef.current = campaign;
  }, [campaign]);

  useEffect(() => {
    const socket = getSocket();

    const join = () => {
      socket.emit("campaign:join", campaign.id, (response) => {
        if (!response.ok) {
          console.error(`campaign:join failed: ${response.errorCode}`);
          return;
        }
        if (response.activeSession) {
          dispatch({ type: "HYDRATE_SESSION", session: response.activeSession });
        }
      });
    };

    join();
    socket.on("connect", join);

    const handleRollLogged = (payload: RollLoggedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "ROLL_LOGGED", roll: payload.roll });
    };

    const handleSessionStarted = (payload: SessionStartedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "START_SESSION", session: payload.session });
    };

    const handleSessionEnded = (payload: SessionEndedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({ type: "END_SESSION" });
    };

    const handlePresenceChanged = (payload: PresenceChangedPayload) => {
      if (payload.campaignId !== campaign.id) return;
      dispatch({
        type: "REPLACE_PRESENCE",
        presence: presenceFromUserIds(campaignRef.current, payload.userIds),
      });
    };

    socket.on("roll_logged", handleRollLogged);
    socket.on("session_started", handleSessionStarted);
    socket.on("session_ended", handleSessionEnded);
    socket.on("presence_changed", handlePresenceChanged);

    return () => {
      socket.off("connect", join);
      socket.off("roll_logged", handleRollLogged);
      socket.off("session_started", handleSessionStarted);
      socket.off("session_ended", handleSessionEnded);
      socket.off("presence_changed", handlePresenceChanged);
      socket.emit("campaign:leave", campaign.id);
    };
  }, [campaign.id]);

  const startSession = useCallback(() => {
    getSocket().emit("session:start", { campaignId: campaign.id }, (response) => {
      if (!response.ok) {
        console.error(`session:start failed: ${response.errorCode}`);
      }
    });
  }, [campaign.id]);

  const endSession = useCallback(() => {
    const sessionId = state.session?.id;
    if (!sessionId) return;
    getSocket().emit(
      "session:end",
      { campaignId: campaign.id, sessionId },
      (response) => {
        if (!response.ok) {
          console.error(`session:end failed: ${response.errorCode}`);
        }
      },
    );
  }, [campaign.id, state.session?.id]);

  const startEncounter = useCallback(() => {
    if (!state.session) return;
    const encounter = seedEncounter(state.session.id);
    const participants = seedParticipants(encounter.id, campaign);
    dispatch({ type: "START_ENCOUNTER", encounter, participants });
  }, [state.session, campaign]);

  const endEncounter = useCallback(() => {
    dispatch({ type: "END_ENCOUNTER" });
  }, []);

  const advanceTurn = useCallback(() => {
    dispatch({ type: "ADVANCE_TURN" });
  }, []);

  const adjustHp = useCallback((participantId: string, delta: number) => {
    dispatch({ type: "ADJUST_HP", participantId, delta });
  }, []);

  const grantTempHp = useCallback((participantId: string, amount: number) => {
    dispatch({ type: "GRANT_TEMP_HP", participantId, amount });
  }, []);

  const toggleCondition = useCallback(
    (participantId: string, condition: string) => {
      dispatch({ type: "TOGGLE_CONDITION", participantId, condition });
    },
    [],
  );

  const setVisibility = useCallback(
    (participantId: string, isVisible: boolean) => {
      dispatch({ type: "SET_VISIBILITY", participantId, isVisible });
    },
    [],
  );

  const setAcHidden = useCallback(
    (participantId: string, acHidden: boolean) => {
      dispatch({ type: "SET_AC_HIDDEN", participantId, acHidden });
    },
    [],
  );

  const recordDeathSave = useCallback(
    (participantId: string, outcome: "success" | "failure") => {
      dispatch({ type: "RECORD_DEATH_SAVE", participantId, outcome });
    },
    [],
  );

  const resetDeathSaves = useCallback((participantId: string) => {
    dispatch({ type: "RESET_DEATH_SAVES", participantId });
  }, []);

  const updateParticipant = useCallback(
    (participantId: string, patch: ParticipantPatch) => {
      dispatch({ type: "UPDATE_PARTICIPANT", participantId, patch });
    },
    [],
  );

  const logRoll = useCallback(
    (roll: SessionRollInput) => {
      getSocket().emit("roll:log", { campaignId: campaign.id, ...roll });
    },
    [campaign.id],
  );

  const presenceFor = useCallback(
    (userId: string): PresenceStatus =>
      state.presence.find((p) => p.userId === userId)?.status ?? "offline",
    [state.presence],
  );

  const activeParticipant = useMemo(() => {
    if (!state.encounter || state.participants.length === 0) return null;
    return state.participants[state.encounter.currentTurnIndex] ?? null;
  }, [state.encounter, state.participants]);

  const connectedCount = useMemo(
    () => state.presence.filter((p) => p.status === "connected").length,
    [state.presence],
  );

  const value = useMemo<LiveSessionContextType>(
    () => ({
      session: state.session,
      encounter: state.encounter,
      participants: state.participants,
      presence: state.presence,
      events: state.events,
      rolls: state.rolls,

      presenceFor,
      activeParticipant,
      connectedCount,

      startSession,
      endSession,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      logRoll,
    }),
    [
      state,
      presenceFor,
      activeParticipant,
      connectedCount,
      startSession,
      endSession,
      startEncounter,
      endEncounter,
      advanceTurn,
      adjustHp,
      grantTempHp,
      toggleCondition,
      setVisibility,
      setAcHidden,
      recordDeathSave,
      resetDeathSaves,
      updateParticipant,
      logRoll,
    ],
  );

  return (
    <LiveSessionContext.Provider value={value}>
      {children}
    </LiveSessionContext.Provider>
  );
};
