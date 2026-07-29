/**
 * Brawl Stars API — прямые запросы через RoyaleAPI-прокси.
 * Бэкенд не нужен: браузер → bsproxy.royaleapi.dev → Brawl Stars API.
 * Токен привязан к IP 45.79.218.79 (сервер RoyaleAPI), запросы через
 * их прокси-домен идут именно с этого IP — поэтому всё работает.
 */

const BASE = "https://bsproxy.royaleapi.dev/v1";
const TOKEN =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9." +
  "eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjBiYjc3MDk1LTQ0Y2EtNDFmZi04NmE0LTdkMDIyMmQwM2E5YyIsImlhdCI6MTc4NTE4MDUyMywic3ViIjoiZGV2ZWxvcGVyLzAyOWI3NTAyLTE3MDMtNGI1OS04Y2Q1LWNjMzc4NzYxYzZkMCIsInNjb3BlcyI6WyJicmF3bHN0YXJzIl0sImxpbWl0cyI6W3sidGllciI6ImRldmVsb3Blci9zaWx2ZXIiLCJ0eXBlIjoidGhyb3R0bGluZyJ9LHsiY2lkcnMiOlsiNDUuNzkuMjE4Ljc5Il0sInR5cGUiOiJjbGllbnQifV19." +
  "Wf78VtleHMRmbpVbjQZLFYB8MEkUscaIMrGECfLyJsQikbCor-DHaVi58rIX-JLIXqovaTB6bUXRFasRW-haew";

const CLUB_TAG = "#29QLUYOPO";

const PROFILE_ICON = "https://cdn.brawlify.com/profile-icons/regular/{id}.png";
const BRAWLER_IMG  = "https://cdn.brawlify.com/brawlers/borderless/{id}.png";
const CLUB_BADGE   = "https://cdn.brawlify.com/club-badges/regular/{id}.png";

const TYPE_MAP = {
  open:       "Открытый",
  inviteOnly: "По приглашению",
  closed:     "Закрытый",
};

function encodeTag(tag) {
  const t = tag.trim().startsWith("#") ? tag.trim() : "#" + tag.trim();
  return "%23" + t.slice(1).toUpperCase();
}

function colorFromName(nameColor) {
  if (!nameColor) return "#f4efe1";
  const hex = nameColor.replace("0x", "");
  return "#" + (hex.length === 8 ? hex.slice(2) : hex).toLowerCase();
}

function stripColorTags(text) {
  return (text || "").replace(/<c\d+>|<\/c>/gi, "");
}

async function brawlFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`Brawl API ${res.status}: ${path}`);
  return res.json();
}

function transformClub(data) {
  const members = data.members || [];
  return {
    tag:              data.tag,
    name:             data.name,
    description:      stripColorTags(data.description || ""),
    type:             TYPE_MAP[data.type] || data.type || "",
    trophies:         data.trophies || 0,
    members:          members.length,
    maxMembers:       30,
    requiredTrophies: data.requiredTrophies || 0,
    badge:            CLUB_BADGE.replace("{id}", data.badgeId || 8000000),
    membersList:      members.map((m, i) => ({
      rank:     i + 1,
      tag:      m.tag,
      name:     m.name,
      color:    colorFromName(m.nameColor),
      role:     m.role || "member",
      trophies: m.trophies || 0,
      icon:     PROFILE_ICON.replace("{id}", (m.icon || {}).id || 28000000),
    })),
  };
}

function transformPlayer(data) {
  const brawlers = data.brawlers || [];
  const maxed    = brawlers.filter(b => b.power === 11).length;
  const sorted   = [...brawlers].sort((a, b) => (b.trophies || 0) - (a.trophies || 0));
  return {
    tag:    data.tag,
    name:   data.name,
    color:  colorFromName(data.nameColor),
    icon:   PROFILE_ICON.replace("{id}", (data.icon || {}).id || 28000000),
    stats: {
      trophies: data.trophies        || 0,
      record:   data.highestTrophies || 0,
      expLevel: data.expLevel        || 0,
      wins3v3:  data["3vs3Victories"]|| 0,
      soloWins: data.soloVictories   || 0,
      duoWins:  data.duoVictories    || 0,
    },
    brawlersCount: brawlers.length,
    maxedInfo:     `${maxed} на 11 ур.`,
    brawlers:      sorted.map(b => ({
      id:       b.id,
      name:     b.name,
      level:    b.power || 1,
      trophies: b.trophies || 0,
      img:      BRAWLER_IMG.replace("{id}", b.id),
    })),
  };
}

export async function getClub(tag = CLUB_TAG) {
  const data = await brawlFetch(`/clubs/${encodeTag(tag)}`);
  return transformClub(data);
}

export async function getPlayer(tag) {
  const data = await brawlFetch(`/players/${encodeTag(tag)}`);
  return transformPlayer(data);
}

export const numberFmt = (n) =>
  (n ?? 0).toLocaleString("ru-RU").replace(/\u00A0/g, " ");
