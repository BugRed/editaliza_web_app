"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useAuth } from "./useAuth";
import {
  ArtistProfile,
  SEEDED_PROFILES,
  ArtWork,
  UserBadge,
  calculatePortfolioCompleteness,
} from "../lib/user-profiles";
import { IEdital, PlainEditalSummaryData } from "../types/Edital";
import { ArtistRankResult, ProfileLevel, TerritoryScope } from "@/shared/lib/artistrank";

export interface ProposerProfile {
  id: number;
  name: string;
  handle: string;
  email: string;
  imgUrl: string;
  bio: string;
  city: string;
  state: string;
  cnpj: string;
  userType: "PROPOSER";
  listEdital: number[];
}

export interface PublishEditalPayload {
  title: string;
  description: string;
  endDate?: string | null;
  inscriptionLink?: string;
  completeEditalLink?: string;
  imgCoverUrl?: string;
  territoryScope: TerritoryScope;
  city?: string | null;
  state?: string | null;
  requiredLanguages: string[];
  acceptedLanguages: string[];
  requiresPortfolio: boolean;
  requiresCnpj: boolean;
  requiresTechnicalFormation: boolean;
  minExperienceYears: number;
  targetProfileLevels: ProfileLevel[];
  plainSummary?: PlainEditalSummaryData;
}

export interface ActiveEditalModalData {
  edital: IEdital;
  proposerName: string;
  rank?: ArtistRankResult;
}

interface SocialStoreContextType {
  profiles: ArtistProfile[];
  currentProfile: ArtistProfile;
  proposers: ProposerProfile[];
  currentProposer: ProposerProfile | null;
  isProposer: boolean;
  profilesLoading: boolean;
  rankingVersion: number;
  getProfileById: (id: number) => ArtistProfile | undefined;
  updateCurrentProfile: (updates: Partial<ArtistProfile>) => Promise<void>;
  updateCurrentProposer: (updates: Partial<ProposerProfile>) => Promise<void>;
  publishEdital: (
    payload: PublishEditalPayload
  ) => Promise<{ success: boolean; error?: string; edital?: IEdital }>;
  addArtWorkToCurrentProfile: (work: Omit<ArtWork, "id">) => Promise<void>;
  removeArtWorkFromCurrentProfile: (workId: string) => Promise<void>;
  addBadgeToCurrentProfile: (badge: Omit<UserBadge, "id">) => Promise<void>;
  removeBadgeFromCurrentProfile: (badgeId: string) => Promise<void>;
  savedEditalIds: number[];
  toggleSaveEdital: (editalId: number) => void;
  isEditalSaved: (editalId: number) => boolean;
  likedEditalIds: number[];
  toggleLikeEdital: (editalId: number) => void;
  isEditalLiked: (editalId: number) => boolean;
  activeEditalModal: ActiveEditalModalData | null;
  openEditalModal: (
    edital: IEdital,
    proposerName: string,
    rank?: ArtistRankResult
  ) => void;
  closeEditalModal: () => void;
}

const SocialStoreContext = createContext<SocialStoreContextType | undefined>(
  undefined
);

function normalizeProposer(raw: Record<string, unknown>): ProposerProfile {
  let listEdital: number[] = [];
  if (Array.isArray(raw.listEdital)) {
    listEdital = raw.listEdital.map(Number).filter(Number.isFinite);
  } else if (typeof raw.listEdital === "string") {
    try {
      const parsed = JSON.parse(raw.listEdital);
      if (Array.isArray(parsed)) {
        listEdital = parsed.map(Number).filter(Number.isFinite);
      }
    } catch {
      listEdital = [];
    }
  }

  const name = String(raw.name ?? "Propositor");
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 18);

  return {
    id: Number(raw.id),
    name,
    handle: raw.handle ? String(raw.handle) : `@${slug || "propositor"}`,
    email: String(raw.email ?? ""),
    imgUrl: String(raw.imgUrl || "/images/edital_ocupacao_1794791581648.jpg"),
    bio: String(
      raw.bio ||
        "Instituição propositora de editais e chamadas culturais no Editaliza."
    ),
    city: String(raw.city ?? ""),
    state: String(raw.state ?? ""),
    cnpj: String(raw.cnpj ?? ""),
    userType: "PROPOSER",
    listEdital,
  };
}

export function SocialStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, token } = useAuth();
  const [profiles, setProfiles] = useState<ArtistProfile[]>(SEEDED_PROFILES);
  const [proposers, setProposers] = useState<ProposerProfile[]>([]);
  const [proposerSavedIds, setProposerSavedIds] = useState<number[]>([]);
  const [proposerLikedIds, setProposerLikedIds] = useState<number[]>([]);
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [rankingVersion, setRankingVersion] = useState(0);
  const [activeEditalModal, setActiveEditalModal] =
    useState<ActiveEditalModalData | null>(null);

  const fetchProposers = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch("/api/proposers", {
        cache: "no-store",
        headers,
      });
      if (!res.ok) return;
      const data = (await res.json()) as Array<Record<string, unknown>>;
      if (Array.isArray(data)) {
        setProposers(data.map(normalizeProposer));
      }
    } catch (err) {
      console.error("Falha ao buscar propositores do banco:", err);
    }
  }, [token]);

  useEffect(() => {
    let active = true;
    const fetchAll = async () => {
      setProfilesLoading(true);
      try {
        const headers: Record<string, string> = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const [artistsRes, proposersRes] = await Promise.all([
          fetch("/api/artists", { cache: "no-store", headers }),
          fetch("/api/proposers", { cache: "no-store", headers }),
        ]);

        if (artistsRes.ok) {
          const data = (await artistsRes.json()) as ArtistProfile[];
          if (active && Array.isArray(data) && data.length > 0) {
            setProfiles(data);
          }
        }
        if (proposersRes.ok) {
          const propData = (await proposersRes.json()) as Array<
            Record<string, unknown>
          >;
          if (active && Array.isArray(propData)) {
            setProposers(propData.map(normalizeProposer));
          }
        }
      } catch (err) {
        console.error("Falha ao buscar perfis do banco:", err);
      } finally {
        if (active) setProfilesLoading(false);
      }
    };

    fetchAll();
    return () => {
      active = false;
    };
  }, [token]);

  const isProposer = user?.userType === "PROPOSER";
  const currentUserId = user?.id ?? 1;

  const currentProfile = useMemo(
    () =>
      profiles.find((p) => p.id === currentUserId) ||
      profiles.find((p) => p.email === user?.email) ||
      profiles[0],
    [profiles, currentUserId, user?.email]
  );

  const currentProposer = useMemo(() => {
    if (!isProposer) return null;
    const found =
      proposers.find((p) => p.id === currentUserId) ||
      proposers.find((p) => p.email === user?.email);
    if (found) return found;
    if (user) {
      return {
        id: user.id,
        name: user.name || "Propositor",
        handle: `@${(user.name || "propositor")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "")
          .slice(0, 16)}`,
        email: user.email,
        imgUrl: "/images/edital_ocupacao_1794791581648.jpg",
        bio: "Instituição propositora cadastrada no Editaliza.",
        city: "",
        state: "",
        cnpj: "",
        userType: "PROPOSER" as const,
        listEdital: [],
      };
    }
    return null;
  }, [isProposer, proposers, currentUserId, user]);

  const savedEditalIds = useMemo(
    () =>
      isProposer ? proposerSavedIds : currentProfile?.savedEditalIds ?? [],
    [isProposer, proposerSavedIds, currentProfile]
  );
  const likedEditalIds = useMemo(
    () =>
      isProposer ? proposerLikedIds : currentProfile?.likedEditalIds ?? [],
    [isProposer, proposerLikedIds, currentProfile]
  );

  const getProfileById = useCallback(
    (id: number) => profiles.find((p) => p.id === id),
    [profiles]
  );

  const persistArtistPatch = useCallback(
    async (artistId: number, updates: Partial<ArtistProfile>) => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(`/api/artists/${artistId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = (await res.json()) as ArtistProfile;
          setProfiles((prev) =>
            prev.map((p) => (p.id === artistId ? updated : p))
          );
          setRankingVersion((v) => v + 1);
        }
      } catch (err) {
        console.error("Erro ao persistir perfil no banco:", err);
      }
    },
    [token]
  );

  const updateCurrentProfile = useCallback(
    async (updates: Partial<ArtistProfile>) => {
      if (isProposer) return;
      const targetId = currentProfile.id;
      setProfiles((prev) =>
        prev.map((p) => {
          if (p.id !== targetId) return p;
          const nextCore = updates.coreLanguages ?? p.coreLanguages;
          const nextSupport = (
            updates.supportLanguages ?? p.supportLanguages
          ).filter((t) => !nextCore.includes(t));
          const mergedTags = Array.from(new Set([...nextCore, ...nextSupport]));
          const nextProfile: ArtistProfile = {
            ...p,
            ...updates,
            coreLanguages: nextCore,
            supportLanguages: nextSupport,
            tags:
              updates.coreLanguages || updates.supportLanguages
                ? mergedTags
                : updates.tags ?? p.tags,
          };
          nextProfile.portfolioCompleteness =
            calculatePortfolioCompleteness(nextProfile);
          return nextProfile;
        })
      );
      await persistArtistPatch(targetId, updates);
    },
    [isProposer, currentProfile.id, persistArtistPatch]
  );

  const updateCurrentProposer = useCallback(
    async (updates: Partial<ProposerProfile>) => {
      if (!currentProposer) return;
      const targetId = currentProposer.id;
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch(`/api/proposers/${targetId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = normalizeProposer(
            (await res.json()) as Record<string, unknown>
          );
          setProposers((prev) => {
            const exists = prev.some((p) => p.id === targetId);
            return exists
              ? prev.map((p) => (p.id === targetId ? updated : p))
              : [...prev, updated];
          });
          setRankingVersion((v) => v + 1);
        }
      } catch (err) {
        console.error("Erro ao atualizar propositor no banco:", err);
      }
    },
    [currentProposer, token]
  );

  const publishEdital = useCallback(
    async (payload: PublishEditalPayload) => {
      try {
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
        const res = await fetch("/api/editals", {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) {
          return {
            success: false,
            error: data?.error || "Não foi possível publicar o edital.",
          };
        }
        setRankingVersion((v) => v + 1);
        await fetchProposers();
        return { success: true, edital: data as IEdital };
      } catch (err) {
        console.error("Erro ao publicar edital:", err);
        return { success: false, error: "Erro de conexão ao publicar edital." };
      }
    },
    [token, fetchProposers]
  );

  const addArtWorkToCurrentProfile = useCallback(
    async (work: Omit<ArtWork, "id">) => {
      const newWork: ArtWork = {
        ...work,
        id: `w-${Date.now()}`,
      };
      await updateCurrentProfile({
        works: [newWork, ...currentProfile.works],
      });
    },
    [currentProfile.works, updateCurrentProfile]
  );

  const removeArtWorkFromCurrentProfile = useCallback(
    async (workId: string) => {
      await updateCurrentProfile({
        works: currentProfile.works.filter((w) => w.id !== workId),
      });
    },
    [currentProfile.works, updateCurrentProfile]
  );

  const addBadgeToCurrentProfile = useCallback(
    async (badge: Omit<UserBadge, "id">) => {
      const newBadge: UserBadge = {
        ...badge,
        id: `badge-${Date.now()}`,
      };
      await updateCurrentProfile({
        badges: [newBadge, ...currentProfile.badges],
      });
    },
    [currentProfile.badges, updateCurrentProfile]
  );

  const removeBadgeFromCurrentProfile = useCallback(
    async (badgeId: string) => {
      await updateCurrentProfile({
        badges: currentProfile.badges.filter((b) => b.id !== badgeId),
      });
    },
    [currentProfile.badges, updateCurrentProfile]
  );

  const toggleSaveEdital = useCallback(
    (editalId: number) => {
      if (isProposer) {
        setProposerSavedIds((prev) =>
          prev.includes(editalId)
            ? prev.filter((id) => id !== editalId)
            : [...prev, editalId]
        );
        return;
      }
      const exists = savedEditalIds.includes(editalId);
      const updatedList = exists
        ? savedEditalIds.filter((id) => id !== editalId)
        : [...savedEditalIds, editalId];
      void updateCurrentProfile({ savedEditalIds: updatedList });
    },
    [isProposer, savedEditalIds, updateCurrentProfile]
  );

  const toggleLikeEdital = useCallback(
    (editalId: number) => {
      if (isProposer) {
        setProposerLikedIds((prev) =>
          prev.includes(editalId)
            ? prev.filter((id) => id !== editalId)
            : [...prev, editalId]
        );
        return;
      }
      const exists = likedEditalIds.includes(editalId);
      const updatedList = exists
        ? likedEditalIds.filter((id) => id !== editalId)
        : [...likedEditalIds, editalId];
      void updateCurrentProfile({ likedEditalIds: updatedList });
    },
    [isProposer, likedEditalIds, updateCurrentProfile]
  );

  const isEditalSaved = useCallback(
    (editalId: number) => savedEditalIds.includes(editalId),
    [savedEditalIds]
  );

  const isEditalLiked = useCallback(
    (editalId: number) => likedEditalIds.includes(editalId),
    [likedEditalIds]
  );

  const openEditalModal = useCallback(
    (edital: IEdital, proposerName: string, rank?: ArtistRankResult) => {
      setActiveEditalModal({ edital, proposerName, rank });
    },
    []
  );

  const closeEditalModal = useCallback(() => {
    setActiveEditalModal(null);
  }, []);

  return (
    <SocialStoreContext.Provider
      value={{
        profiles,
        currentProfile,
        proposers,
        currentProposer,
        isProposer,
        profilesLoading,
        rankingVersion,
        getProfileById,
        updateCurrentProfile,
        updateCurrentProposer,
        publishEdital,
        addArtWorkToCurrentProfile,
        removeArtWorkFromCurrentProfile,
        addBadgeToCurrentProfile,
        removeBadgeFromCurrentProfile,
        savedEditalIds,
        toggleSaveEdital,
        isEditalSaved,
        likedEditalIds,
        toggleLikeEdital,
        isEditalLiked,
        activeEditalModal,
        openEditalModal,
        closeEditalModal,
      }}
    >
      {children}
    </SocialStoreContext.Provider>
  );
}

export function useSocialStore() {
  const ctx = useContext(SocialStoreContext);
  if (!ctx) {
    throw new Error(
      "useSocialStore deve ser usado dentro de SocialStoreProvider"
    );
  }
  return ctx;
}
