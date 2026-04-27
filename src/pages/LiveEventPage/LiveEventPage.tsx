import { memo, useCallback, useState, useEffect, useRef, type CSSProperties, type PointerEvent, type UIEvent, type WheelEvent } from 'react'
import { createPortal } from 'react-dom'
import './LiveEventPage.css'

import iconAoVivo from '../../assets/iconAoVivo.png'
import iconStreaming from '../../assets/iconStreaming.svg'
import iconCampoEvento from '../../assets/iconCampoEvento.svg'
import iconMercadoChevron from '../../assets/iconMercadoChevron.svg'
import reiAntecipaFutebol from '../../assets/reiAntecipaFutebol.png'
import substituicaoGarantida from '../../assets/substituicaoGarantida.png'
import multiplaTurbinada from '../../assets/multiplaTurbinada.png'
import streamingFutebol from '../../assets/streamingFutebol.png'
import iconFutebol from '../../assets/iconFutebol.png'
import iconEstatistica from '../../assets/iconEstatistica.png'
import avatarFutebol from '../../assets/avatarFutebol.png'
import arrascaetaProps from '../../assets/arrascaetaProps.png'
import pedroProps from '../../assets/pedroProps.png'
import depayProps from '../../assets/depayProps.png'
import yuriProps from '../../assets/yuriProps.png'
import flacoLopezProps from '../../assets/flacoLopezProps.png'

export interface LiveEventMatch {
  id?: string
  time?: string
  currentTime?: string
  homeTeam: { name: string; icon: string; score: number }
  awayTeam: { name: string; icon: string; score: number }
  odds: { home: string; draw?: string; away: string }
  doubleChanceOdds?: { homeOrDraw: string; homeOrAway: string; awayOrDraw: string }
  bothTeamsScoreOdds?: { yes: string; no: string }
  totalGoalsOdds?: { line: number; under: string; over: string }
  totalCornersOdds?: { line: number; under: string; over: string }
  totalPointsOdds?: { line: number; under: string; over: string }
  handicapOdds?: { line: number; home: string; away: string }
  q3TotalOdds?: { line: number; under: string; over: string }
  q4TotalOdds?: { line: number; under: string; over: string }
  extraBets?: number
}

export interface LiveEventPageProps {
  isOpen: boolean
  onClose: () => void
  match?: LiveEventMatch
  matches?: LiveEventMatch[]
  selectedIndex?: number
  currentTimes?: Record<string, string>
  leagueName: string
  leagueFlag?: string
  sport: string
  currentTime?: string
}

export interface LiveEventOpenPayload {
  matches: LiveEventMatch[]
  selectedIndex: number
  leagueName: string
  leagueFlag?: string
  sport: string
  currentTimes: Record<string, string>
}

interface LiveEventContentProps {
  match: LiveEventMatch
  leagueName: string
  currentTime: string
  isExpanded: boolean
  onRequestClose: () => void
  onRequestExpand: () => void
  onRequestCollapse: () => void
  onCompactPullChange: (distance: number) => void
  onCompactPullEnd: () => void
}

type TabId = 'transmissao' | 'campo'
type DetailTabId = 'destaques' | 'criar-aposta' | 'times' | 'jogadores'

const detailTabs: Array<{ id: DetailTabId; label: string }> = [
  { id: 'destaques', label: 'Destaques' },
  { id: 'criar-aposta', label: 'Criar Aposta' },
  { id: 'times', label: 'Times' },
  { id: 'jogadores', label: 'Jogadores' },
]

interface ShotOutcome {
  label: string
  odd: string
  labelParts?: [string, string]
}

interface PlayerShotMarket {
  id: string
  player: string
  team: string
  image?: string
  outcomes: ShotOutcome[]
}

interface TotalGoalsMarketRow {
  id: string
  under: ShotOutcome
  over: ShotOutcome
}

interface ThreeWayMarketRow {
  id: string
  options: ShotOutcome[]
}

const shotOutcomes = (values: Array<[string, string]>): ShotOutcome[] =>
  values.map(([label, odd]) => ({ label, odd }))

const doubleChanceDisplayNames: Record<string, string> = {
  Internacional: 'Inter',
  Bragantino: 'Braga',
  'Red Bull Bragantino': 'Braga',
  'Atlético Madrid': 'Atl. Madrid',
  'Boca Juniors': 'Boca',
  'Argentinos Jrs': 'Argentinos',
  'River Plate': 'River',
  'New York City': 'NYC',
  'Chicago Fire': 'Chicago',
  Panathinaikos: 'Panath.',
}

const teamGlowColors: Record<string, string> = {
  Flamengo: '#e31b23',
  Cruzeiro: '#2f6dff',
  Internacional: '#d71920',
  Inter: '#2d7dff',
  Bragantino: '#f4f4f4',
  'Red Bull Bragantino': '#f4f4f4',
  Vasco: '#f4f4f4',
  Corinthians: '#f4f4f4',
  Palmeiras: '#1f9f55',
  Fluminense: '#8d1230',
  Botafogo: '#f4f4f4',
  'Atl. Mineiro': '#f4f4f4',
  'Atlético-MG': '#f4f4f4',
  'São Paulo': '#e63232',
  Mirassol: '#ffd23a',
  Barcelona: '#a31745',
  Bayern: '#dc052d',
  PSG: '#2d5eff',
  'Real Madrid': '#f4f4f4',
  Liverpool: '#d00027',
  Arsenal: '#ef0107',
  Chelsea: '#034694',
  'Manchester City': '#6cabdd',
}

function getTeamGlowColor(teamName: string): string {
  const trimmedName = teamName.trim()
  if (teamGlowColors[trimmedName]) return teamGlowColors[trimmedName]

  let hash = 0
  for (let i = 0; i < trimmedName.length; i++) {
    hash = (hash * 31 + trimmedName.charCodeAt(i)) >>> 0
  }

  return `hsl(${hash % 360} 72% 58%)`
}

function getTeamGlowStyle(teamName: string): CSSProperties {
  return {
    ['--live-event-team-glow' as string]: getTeamGlowColor(teamName),
  } as CSSProperties
}

function getDoubleChanceDisplayName(teamName: string): string {
  const trimmedName = teamName.trim()

  if (doubleChanceDisplayNames[trimmedName]) {
    return doubleChanceDisplayNames[trimmedName]
  }

  const [firstWord] = trimmedName.split(/\s+/)
  if (trimmedName.length > 10 && firstWord.length >= 4 && firstWord.length <= 9) {
    return firstWord
  }

  return trimmedName
}

const teamShotMarkets: Record<string, PlayerShotMarket[]> = {
  Flamengo: [
    { id: 'flamengo-arrascaeta', player: 'Arrascaeta', team: 'Flamengo', image: arrascaetaProps, outcomes: shotOutcomes([['0.5+', '1.55x'], ['1.5+', '2.05x'], ['2.5+', '3.80x']]) },
    { id: 'flamengo-pedro', player: 'Pedro', team: 'Flamengo', image: pedroProps, outcomes: shotOutcomes([['1.0+', '1.45x'], ['2.0+', '1.95x'], ['3.0+', '3.55x']]) },
  ],
  Cruzeiro: [
    { id: 'cruzeiro-matheus-pereira', player: 'Matheus Pereira', team: 'Cruzeiro', outcomes: shotOutcomes([['0.5+', '1.72x'], ['1.5+', '2.45x'], ['2.5+', '5.20x']]) },
    { id: 'cruzeiro-kaio-jorge', player: 'Kaio Jorge', team: 'Cruzeiro', outcomes: shotOutcomes([['0.5+', '1.82x'], ['1.5+', '2.65x'], ['2.5+', '5.80x']]) },
  ],
  Vasco: [
    { id: 'vasco-vegetti', player: 'Vegetti', team: 'Vasco', outcomes: shotOutcomes([['0.5+', '1.62x'], ['1.5+', '2.28x'], ['2.5+', '4.75x']]) },
    { id: 'vasco-payet', player: 'Payet', team: 'Vasco', outcomes: shotOutcomes([['0.5+', '1.95x'], ['1.5+', '3.10x'], ['2.5+', '7.00x']]) },
  ],
  Corinthians: [
    { id: 'corinthians-memphis', player: 'Memphis Depay', team: 'Corinthians', image: depayProps, outcomes: shotOutcomes([['1.0+', '1.62x'], ['2.0+', '2.18x'], ['3.0+', '4.10x']]) },
    { id: 'corinthians-yuri', player: 'Yuri Alberto', team: 'Corinthians', image: yuriProps, outcomes: shotOutcomes([['1.0+', '1.58x'], ['2.0+', '2.12x'], ['3.0+', '3.95x']]) },
  ],
  Internacional: [
    { id: 'internacional-alan-patrick', player: 'Alan Patrick', team: 'Internacional', outcomes: shotOutcomes([['0.5+', '1.78x'], ['1.5+', '2.55x'], ['2.5+', '5.60x']]) },
    { id: 'internacional-valencia', player: 'Enner Valencia', team: 'Internacional', outcomes: shotOutcomes([['0.5+', '1.66x'], ['1.5+', '2.32x'], ['2.5+', '4.90x']]) },
  ],
  Bragantino: [
    { id: 'bragantino-sasha', player: 'Eduardo Sasha', team: 'Bragantino', outcomes: shotOutcomes([['0.5+', '1.82x'], ['1.5+', '2.72x'], ['2.5+', '6.00x']]) },
    { id: 'bragantino-jhon-jhon', player: 'Jhon Jhon', team: 'Bragantino', outcomes: shotOutcomes([['0.5+', '2.05x'], ['1.5+', '3.30x'], ['2.5+', '8.00x']]) },
  ],
  Mirassol: [
    { id: 'mirassol-negueba', player: 'Negueba', team: 'Mirassol', outcomes: shotOutcomes([['0.5+', '2.10x'], ['1.5+', '3.55x'], ['2.5+', '8.50x']]) },
    { id: 'mirassol-reinaldo', player: 'Reinaldo', team: 'Mirassol', outcomes: shotOutcomes([['0.5+', '2.22x'], ['1.5+', '3.80x'], ['2.5+', '9.00x']]) },
  ],
  'São Paulo': [
    { id: 'sao-paulo-calleri', player: 'Calleri', team: 'São Paulo', outcomes: shotOutcomes([['0.5+', '1.62x'], ['1.5+', '2.24x'], ['2.5+', '4.65x']]) },
    { id: 'sao-paulo-luciano', player: 'Luciano', team: 'São Paulo', outcomes: shotOutcomes([['0.5+', '1.84x'], ['1.5+', '2.78x'], ['2.5+', '6.20x']]) },
  ],
  Palmeiras: [
    { id: 'palmeiras-flaco', player: 'Flaco Lopez', team: 'Palmeiras', image: flacoLopezProps, outcomes: shotOutcomes([['1.0+', '1.42x'], ['2.0+', '1.88x'], ['3.0+', '3.25x']]) },
    { id: 'palmeiras-veiga', player: 'Raphael Veiga', team: 'Palmeiras', outcomes: shotOutcomes([['0.5+', '1.74x'], ['1.5+', '2.48x'], ['2.5+', '5.40x']]) },
  ],
  Fluminense: [
    { id: 'fluminense-cano', player: 'Cano', team: 'Fluminense', outcomes: shotOutcomes([['0.5+', '1.70x'], ['1.5+', '2.40x'], ['2.5+', '5.10x']]) },
    { id: 'fluminense-arias', player: 'Arias', team: 'Fluminense', outcomes: shotOutcomes([['0.5+', '1.88x'], ['1.5+', '2.90x'], ['2.5+', '6.75x']]) },
  ],
  Botafogo: [
    { id: 'botafogo-igor-jesus', player: 'Igor Jesus', team: 'Botafogo', outcomes: shotOutcomes([['0.5+', '1.68x'], ['1.5+', '2.35x'], ['2.5+', '5.00x']]) },
    { id: 'botafogo-savarino', player: 'Savarino', team: 'Botafogo', outcomes: shotOutcomes([['0.5+', '1.92x'], ['1.5+', '3.05x'], ['2.5+', '7.25x']]) },
  ],
  'Atl. Mineiro': [
    { id: 'atletico-mg-hulk', player: 'Hulk', team: 'Atl. Mineiro', outcomes: shotOutcomes([['0.5+', '1.48x'], ['1.5+', '2.02x'], ['2.5+', '4.10x']]) },
    { id: 'atletico-mg-paulinho', player: 'Paulinho', team: 'Atl. Mineiro', outcomes: shotOutcomes([['0.5+', '1.70x'], ['1.5+', '2.48x'], ['2.5+', '5.40x']]) },
  ],
  'Atlético-MG': [
    { id: 'atletico-mg-hulk-alt', player: 'Hulk', team: 'Atlético-MG', outcomes: shotOutcomes([['0.5+', '1.48x'], ['1.5+', '2.02x'], ['2.5+', '4.10x']]) },
    { id: 'atletico-mg-paulinho-alt', player: 'Paulinho', team: 'Atlético-MG', outcomes: shotOutcomes([['0.5+', '1.70x'], ['1.5+', '2.48x'], ['2.5+', '5.40x']]) },
  ],
  Barcelona: [
    { id: 'barcelona-lewandowski', player: 'Lewandowski', team: 'Barcelona', outcomes: shotOutcomes([['0.5+', '1.38x'], ['1.5+', '1.78x'], ['2.5+', '3.10x']]) },
    { id: 'barcelona-raphinha', player: 'Raphinha', team: 'Barcelona', outcomes: shotOutcomes([['0.5+', '1.66x'], ['1.5+', '2.28x'], ['2.5+', '4.60x']]) },
  ],
  Bayern: [
    { id: 'bayern-kane', player: 'Harry Kane', team: 'Bayern', outcomes: shotOutcomes([['0.5+', '1.32x'], ['1.5+', '1.70x'], ['2.5+', '2.95x']]) },
    { id: 'bayern-musiala', player: 'Musiala', team: 'Bayern', outcomes: shotOutcomes([['0.5+', '1.78x'], ['1.5+', '2.70x'], ['2.5+', '6.00x']]) },
  ],
  PSG: [
    { id: 'psg-dembele', player: 'Dembélé', team: 'PSG', outcomes: shotOutcomes([['0.5+', '1.62x'], ['1.5+', '2.24x'], ['2.5+', '4.85x']]) },
    { id: 'psg-ramos', player: 'Gonçalo Ramos', team: 'PSG', outcomes: shotOutcomes([['0.5+', '1.58x'], ['1.5+', '2.20x'], ['2.5+', '4.70x']]) },
  ],
  Inter: [
    { id: 'inter-lautaro', player: 'Lautaro Martínez', team: 'Inter', outcomes: shotOutcomes([['0.5+', '1.50x'], ['1.5+', '2.08x'], ['2.5+', '4.35x']]) },
    { id: 'inter-thuram', player: 'Thuram', team: 'Inter', outcomes: shotOutcomes([['0.5+', '1.72x'], ['1.5+', '2.52x'], ['2.5+', '5.70x']]) },
  ],
}

function slugifyTeamName(teamName: string): string {
  return teamName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildFallbackShotMarkets(teamName: string): PlayerShotMarket[] {
  const slug = slugifyTeamName(teamName)
  const mappedPlayers = Array.from(
    new Set((TEAM_EVENTS[teamName] ?? []).map((event) => event.player))
  )
  const [primaryPlayer = 'Jogador', secondaryPlayer = 'Atacante'] = mappedPlayers

  return [
    { id: `${slug}-principal`, player: primaryPlayer, team: teamName, outcomes: shotOutcomes([['0.5+', '1.78x'], ['1.5+', '2.60x'], ['2.5+', '5.75x']]) },
    { id: `${slug}-atacante`, player: secondaryPlayer, team: teamName, outcomes: shotOutcomes([['0.5+', '1.88x'], ['1.5+', '2.85x'], ['2.5+', '6.40x']]) },
  ]
}

const supplementalShotOutcomes = [
  shotOutcomes([['0.5+', '1.78x'], ['1.5+', '2.60x'], ['2.5+', '5.75x']]),
  shotOutcomes([['0.5+', '1.88x'], ['1.5+', '2.85x'], ['2.5+', '6.40x']]),
  shotOutcomes([['0.5+', '2.05x'], ['1.5+', '3.25x'], ['2.5+', '7.50x']]),
  shotOutcomes([['0.5+', '2.22x'], ['1.5+', '3.70x'], ['2.5+', '8.80x']]),
]

function normalizePlayerName(playerName: string): string {
  return slugifyTeamName(playerName.replace(/\s+/g, ' '))
}

function hasPlayer(rows: PlayerShotMarket[], playerName: string): boolean {
  const normalizedPlayer = normalizePlayerName(playerName)
  return rows.some((row) => normalizePlayerName(row.player) === normalizedPlayer)
}

function buildSupplementalShotMarket(teamName: string, playerName: string, index: number): PlayerShotMarket {
  return {
    id: `${slugifyTeamName(teamName)}-${normalizePlayerName(playerName)}-${index}`,
    player: playerName,
    team: teamName,
    outcomes: supplementalShotOutcomes[index % supplementalShotOutcomes.length],
  }
}

function getTeamShotMarketRows(teamName: string): PlayerShotMarket[] {
  const rows = [...(teamShotMarkets[teamName] ?? buildFallbackShotMarkets(teamName))]
  const mappedPlayers = Array.from(new Set((TEAM_EVENTS[teamName] ?? []).map((event) => event.player)))
  const fallbackPlayers = FALLBACK_PLAYERS.map((player) => `${player}`)
  const candidates = [...mappedPlayers, ...fallbackPlayers]

  for (const playerName of candidates) {
    if (rows.length >= 4) break
    if (hasPlayer(rows, playerName)) continue
    rows.push(buildSupplementalShotMarket(teamName, playerName, rows.length))
  }

  return rows.slice(0, 4)
}

function getShotsOnGoalRows(match: LiveEventMatch, isExpanded: boolean): PlayerShotMarket[] {
  const rows = [
    ...getTeamShotMarketRows(match.homeTeam.name),
    ...getTeamShotMarketRows(match.awayTeam.name),
  ]
  return rows.slice(0, isExpanded ? 8 : 4)
}

function formatMarketLine(line: number): string {
  return Number.isInteger(line) ? `${line}.0` : `${line}`
}

function getTotalGoalsRows(match: LiveEventMatch, isExpanded: boolean): TotalGoalsMarketRow[] {
  const currentLine = match.totalGoalsOdds?.line ?? 2.5
  const lines = [2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5]
  const normalizedLines = lines.includes(currentLine) ? lines : [currentLine, ...lines]
  const visibleLines = normalizedLines.slice(0, isExpanded ? 8 : 4)
  const underFallbackOdds = ['1.42x', '1.78x', '2.15x', '2.65x', '3.10x', '3.80x', '4.60x', '5.40x']
  const overFallbackOdds = ['2.70x', '1.98x', '1.62x', '1.38x', '1.24x', '1.16x', '1.10x', '1.06x']

  return visibleLines.map((line, index) => {
    const isCurrentLine = line === currentLine && match.totalGoalsOdds
    const underOdd = isCurrentLine ? match.totalGoalsOdds!.under : underFallbackOdds[index]
    const overOdd = isCurrentLine ? match.totalGoalsOdds!.over : overFallbackOdds[index]
    const formattedLine = formatMarketLine(line)

    return {
      id: `total-goals-${formattedLine}`,
      under: { label: `Menos de ${formattedLine}`, odd: underOdd },
      over: { label: `Mais de ${formattedLine}`, odd: overOdd },
    }
  })
}

function buildLineMarketRows(
  market: { line: number; under: string; over: string } | undefined,
  lines: number[],
  underFallbackOdds: string[],
  overFallbackOdds: string[],
  underLabel: string,
  overLabel: string
): TotalGoalsMarketRow[] {
  const currentLine = market?.line ?? lines[0]
  const normalizedLines = lines.includes(currentLine) ? lines : [currentLine, ...lines]

  return normalizedLines.slice(0, 4).map((line, index) => {
    const isCurrentLine = line === currentLine && market
    const formattedLine = formatMarketLine(line)

    return {
      id: `${underLabel}-${formattedLine}`,
      under: {
        label: `${underLabel} ${formattedLine}`,
        odd: isCurrentLine ? market.under : underFallbackOdds[index],
      },
      over: {
        label: `${overLabel} ${formattedLine}`,
        odd: isCurrentLine ? market.over : overFallbackOdds[index],
      },
    }
  })
}

function getTotalCornersRows(match: LiveEventMatch): TotalGoalsMarketRow[] {
  return buildLineMarketRows(
    match.totalCornersOdds,
    [8.5, 9.5, 10.5, 11.5],
    ['1.70x', '1.88x', '2.10x', '2.45x'],
    ['2.05x', '1.86x', '1.66x', '1.48x'],
    'Menos de',
    'Mais de'
  )
}

function getTotalCardsRows(): TotalGoalsMarketRow[] {
  return buildLineMarketRows(
    undefined,
    [3.5, 4.5, 5.5, 6.5],
    ['1.62x', '1.88x', '2.25x', '2.85x'],
    ['2.18x', '1.82x', '1.58x', '1.34x'],
    'Menos de',
    'Mais de'
  )
}

function getDoubleChanceRows(match: LiveEventMatch): ThreeWayMarketRow[] {
  const homeDisplayName = getDoubleChanceDisplayName(match.homeTeam.name)
  const awayDisplayName = getDoubleChanceDisplayName(match.awayTeam.name)

  return [
    {
      id: 'double-chance-main',
      options: [
        {
          label: `${match.homeTeam.name} ou Empate`,
          labelParts: [homeDisplayName, 'Empate'],
          odd: match.doubleChanceOdds?.homeOrDraw ?? '1.30x',
        },
        {
          label: `${match.homeTeam.name} ou ${match.awayTeam.name}`,
          labelParts: [homeDisplayName, awayDisplayName],
          odd: match.doubleChanceOdds?.homeOrAway ?? '1.28x',
        },
        {
          label: `Empate ou ${match.awayTeam.name}`,
          labelParts: ['Empate', awayDisplayName],
          odd: match.doubleChanceOdds?.awayOrDraw ?? '1.65x',
        },
      ],
    },
  ]
}

function parseLiveTime(timeStr: string): { prefix: string; totalSeconds: number } | null {
  const match = timeStr.match(/^(.+?)\s+(\d+):(\d+)$/)
  if (!match) return null
  return {
    prefix: match[1],
    totalSeconds: parseInt(match[2]) * 60 + parseInt(match[3]),
  }
}

function formatLiveTime(prefix: string, totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${prefix} ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function getLiveEventMatchKey(match: LiveEventMatch, index: number): string {
  return match.id ?? `${match.homeTeam.name}-${match.awayTeam.name}-${index}`
}

function getLiveEventMatchTime(match: LiveEventMatch, index: number, currentTimes: Record<string, string> | undefined, fallback?: string): string {
  const key = getLiveEventMatchKey(match, index)
  return currentTimes?.[key] ?? match.currentTime ?? fallback ?? match.time ?? 'Ao vivo'
}

function PauseIcon() {
  return (
    <svg className="live-event-page__stream-icon" viewBox="0 0 12 12" aria-hidden="true">
      <rect x="3" y="2.25" width="2" height="7.5" rx="0.5" fill="currentColor" />
      <rect x="7" y="2.25" width="2" height="7.5" rx="0.5" fill="currentColor" />
    </svg>
  )
}

function MuteIcon() {
  return (
    <svg className="live-event-page__stream-icon" viewBox="0 0 12 12" aria-hidden="true">
      <path
        d="M5.6 2.3 3.4 4.1H1.7a.5.5 0 0 0-.5.5v2.8a.5.5 0 0 0 .5.5h1.7l2.2 1.8a.4.4 0 0 0 .65-.31V2.6a.4.4 0 0 0-.65-.3Z"
        fill="currentColor"
      />
      <path
        d="m8 4.5 2.5 3M10.5 4.5 8 7.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

function FullscreenIcon() {
  return (
    <svg className="live-event-page__stream-icon live-event-page__stream-icon--lg" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

function CloseStreamIcon() {
  return (
    <svg className="live-event-page__stream-icon live-event-page__stream-icon--lg" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="m4.5 4.5 7 7M11.5 4.5l-7 7"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}

interface MatchEvent {
  type: 'yellow' | 'red' | 'goal'
  player: string
  minute: number
}

// Events ordered by minute; include enough goals per team to cover any realistic score
const TEAM_EVENTS: Record<string, MatchEvent[]> = {
  // Brasil
  'Flamengo':         [{ type: 'yellow', player: 'Arrascaeta', minute: 20 }, { type: 'goal', player: 'Pedro', minute: 38 }, { type: 'goal', player: 'Gabigol', minute: 57 }, { type: 'goal', player: 'De La Cruz', minute: 72 }],
  'Cruzeiro':         [{ type: 'goal', player: 'Matheus Pereira', minute: 7 }, { type: 'yellow', player: 'Zé Ivaldo', minute: 31 }, { type: 'goal', player: 'Kaique Rocha', minute: 65 }, { type: 'goal', player: 'Eduardo', minute: 80 }],
  'Internacional':    [{ type: 'yellow', player: 'Thiago Maia', minute: 14 }, { type: 'goal', player: 'Valencia', minute: 42 }, { type: 'goal', player: 'Wesley', minute: 58 }, { type: 'goal', player: 'Bernabei', minute: 74 }],
  'Bragantino':       [{ type: 'goal', player: 'Jhon Jhon', minute: 9 }, { type: 'yellow', player: 'Laquintana', minute: 33 }, { type: 'goal', player: 'Vinicinho', minute: 61 }, { type: 'goal', player: 'Sasha', minute: 79 }],
  'Mirassol':         [{ type: 'yellow', player: 'Lucas Ramon', minute: 22 }, { type: 'goal', player: 'Cristian', minute: 41 }, { type: 'goal', player: 'Reinaldo', minute: 60 }, { type: 'goal', player: 'Negueba', minute: 75 }],
  'Palmeiras':        [{ type: 'goal', player: 'Flaco López', minute: 18 }, { type: 'yellow', player: 'Aníbal Moreno', minute: 35 }, { type: 'goal', player: 'Estêvão', minute: 54 }, { type: 'goal', player: 'Raphael Veiga', minute: 70 }],
  'Fluminense':       [{ type: 'yellow', player: 'Felipe Melo', minute: 19 }, { type: 'goal', player: 'Cano', minute: 36 }, { type: 'goal', player: 'Arias', minute: 58 }, { type: 'goal', player: 'Keno', minute: 74 }],
  'São Paulo':        [{ type: 'yellow', player: 'Luiz Gustavo', minute: 27 }, { type: 'goal', player: 'Calleri', minute: 43 }, { type: 'goal', player: 'André Silva', minute: 62 }, { type: 'goal', player: 'Luciano', minute: 77 }],
  'Corinthians':      [{ type: 'yellow', player: 'André Ramalho', minute: 22 }, { type: 'goal', player: 'Memphis', minute: 49 }, { type: 'goal', player: 'Romero', minute: 64 }, { type: 'goal', player: 'Yuri Alberto', minute: 81 }],
  'Grêmio':           [{ type: 'yellow', player: 'Kannemann', minute: 16 }, { type: 'goal', player: 'Soteldo', minute: 32 }, { type: 'goal', player: 'Cristaldo', minute: 55 }, { type: 'goal', player: 'Arezo', minute: 71 }],
  'Atlético-MG':      [{ type: 'goal', player: 'Hulk', minute: 24 }, { type: 'yellow', player: 'Otávio', minute: 40 }, { type: 'goal', player: 'Paulinho', minute: 58 }, { type: 'goal', player: 'Vargas', minute: 75 }],
  'Atl. Mineiro':     [{ type: 'goal', player: 'Hulk', minute: 24 }, { type: 'yellow', player: 'Otávio', minute: 40 }, { type: 'goal', player: 'Paulinho', minute: 58 }, { type: 'goal', player: 'Vargas', minute: 75 }],
  'Botafogo':         [{ type: 'goal', player: 'Tiquinho Soares', minute: 13 }, { type: 'yellow', player: 'Marçal', minute: 44 }, { type: 'goal', player: 'Savarino', minute: 60 }, { type: 'goal', player: 'Igor Jesus', minute: 78 }],
  'Vasco':            [{ type: 'yellow', player: 'Hugo Moura', minute: 19 }, { type: 'goal', player: 'Vegetti', minute: 37 }, { type: 'goal', player: 'Payet', minute: 56 }, { type: 'goal', player: 'Léo', minute: 73 }],
  'Athletico-PR':     [{ type: 'goal', player: 'Cuello', minute: 8 }, { type: 'yellow', player: 'Thiago Heleno', minute: 41 }, { type: 'goal', player: 'Canobbio', minute: 59 }, { type: 'goal', player: 'Pablo', minute: 76 }],
  'Fortaleza':        [{ type: 'yellow', player: 'Titi', minute: 31 }, { type: 'goal', player: 'Moisés', minute: 47 }, { type: 'goal', player: 'Lucero', minute: 63 }, { type: 'goal', player: 'Pochettino', minute: 80 }],
  'Bahia':            [{ type: 'goal', player: 'Everaldo', minute: 17 }, { type: 'yellow', player: 'Rezende', minute: 38 }, { type: 'goal', player: 'Cauly', minute: 60 }, { type: 'goal', player: 'Biel', minute: 77 }],
  'Santos':           [{ type: 'goal', player: 'Guilherme', minute: 11 }, { type: 'yellow', player: 'João Paulo', minute: 37 }, { type: 'goal', player: 'Soteldo', minute: 53 }, { type: 'goal', player: 'Morelos', minute: 70 }],
  // Europa — Champions / Top
  'PSG':              [{ type: 'goal', player: 'Dembélé', minute: 12 }, { type: 'yellow', player: 'Nuno Mendes', minute: 28 }, { type: 'goal', player: 'Vitinha', minute: 47 }, { type: 'goal', player: 'Ramos', minute: 67 }],
  'Lyon':             [{ type: 'yellow', player: 'Tolisso', minute: 18 }, { type: 'goal', player: 'Lacazette', minute: 35 }, { type: 'goal', player: 'Cherki', minute: 55 }, { type: 'goal', player: 'Nuamah', minute: 73 }],
  'Newcastle':        [{ type: 'yellow', player: 'Bruno Guimarães', minute: 21 }, { type: 'goal', player: 'Isak', minute: 39 }, { type: 'goal', player: 'Gordon', minute: 58 }, { type: 'goal', player: 'Wilson', minute: 76 }],
  'Napoli':           [{ type: 'goal', player: 'Kvaratskhelia', minute: 10 }, { type: 'yellow', player: 'Lobotka', minute: 34 }, { type: 'goal', player: 'Lukaku', minute: 52 }, { type: 'goal', player: 'Di Lorenzo', minute: 69 }],
  'Barcelona':        [{ type: 'goal', player: 'Lewandowski', minute: 15 }, { type: 'yellow', player: 'Koundé', minute: 32 }, { type: 'goal', player: 'Yamal', minute: 53 }, { type: 'goal', player: 'Raphinha', minute: 71 }],
  'Bayern':           [{ type: 'goal', player: 'Harry Kane', minute: 7 }, { type: 'yellow', player: 'Goretzka', minute: 30 }, { type: 'goal', player: 'Musiala', minute: 50 }, { type: 'goal', player: 'Sané', minute: 68 }],
  'Real Madrid':      [{ type: 'goal', player: 'Vini Jr', minute: 14 }, { type: 'yellow', player: 'Camavinga', minute: 36 }, { type: 'goal', player: 'Bellingham', minute: 54 }, { type: 'goal', player: 'Mbappé', minute: 72 }],
  'Manchester City':  [{ type: 'goal', player: 'Haaland', minute: 11 }, { type: 'yellow', player: 'Rodri', minute: 29 }, { type: 'goal', player: 'De Bruyne', minute: 49 }, { type: 'goal', player: 'Foden', minute: 66 }],
  'Man. City':        [{ type: 'goal', player: 'Haaland', minute: 11 }, { type: 'yellow', player: 'Rodri', minute: 29 }, { type: 'goal', player: 'De Bruyne', minute: 49 }, { type: 'goal', player: 'Foden', minute: 66 }],
  'Arsenal':          [{ type: 'yellow', player: 'Partey', minute: 23 }, { type: 'goal', player: 'Saka', minute: 41 }, { type: 'goal', player: 'Havertz', minute: 60 }, { type: 'goal', player: 'Martinelli', minute: 78 }],
  'Liverpool':        [{ type: 'goal', player: 'Salah', minute: 9 }, { type: 'yellow', player: 'Mac Allister', minute: 33 }, { type: 'goal', player: 'Núñez', minute: 51 }, { type: 'goal', player: 'Diaz', minute: 70 }],
  'Chelsea':          [{ type: 'yellow', player: 'Caicedo', minute: 17 }, { type: 'goal', player: 'Palmer', minute: 38 }, { type: 'goal', player: 'Jackson', minute: 57 }, { type: 'goal', player: 'Nkunku', minute: 74 }],
  'Inter':            [{ type: 'goal', player: 'Thuram', minute: 16 }, { type: 'yellow', player: 'Barella', minute: 37 }, { type: 'goal', player: 'Lautaro', minute: 55 }, { type: 'goal', player: 'Çalhanoğlu', minute: 73 }],
  'Milan':            [{ type: 'yellow', player: 'Tomori', minute: 20 }, { type: 'goal', player: 'Giroud', minute: 40 }, { type: 'goal', player: 'Leão', minute: 59 }, { type: 'goal', player: 'Pulisic', minute: 76 }],
  'Juventus':         [{ type: 'goal', player: 'Vlahović', minute: 13 }, { type: 'yellow', player: 'Bremer', minute: 35 }, { type: 'goal', player: 'Yildiz', minute: 53 }, { type: 'goal', player: 'Chiesa', minute: 70 }],
  'Atlético Madrid':  [{ type: 'yellow', player: 'Koke', minute: 24 }, { type: 'goal', player: 'Griezmann', minute: 44 }, { type: 'goal', player: 'Morata', minute: 62 }, { type: 'goal', player: 'Riquelme', minute: 79 }],
  'Borussia Dortmund':[{ type: 'goal', player: 'Füllkrug', minute: 18 }, { type: 'yellow', player: 'Hummels', minute: 39 }, { type: 'goal', player: 'Brandt', minute: 57 }, { type: 'goal', player: 'Adeyemi', minute: 74 }],
  'Aston Villa':      [{ type: 'yellow', player: 'McGinn', minute: 21 }, { type: 'goal', player: 'Watkins', minute: 38 }, { type: 'goal', player: 'Bailey', minute: 56 }, { type: 'goal', player: 'Rogers', minute: 73 }],
  'Brighton':         [{ type: 'goal', player: 'Welbeck', minute: 14 }, { type: 'yellow', player: 'Estupiñán', minute: 34 }, { type: 'goal', player: 'João Pedro', minute: 52 }, { type: 'goal', player: 'Mitoma', minute: 69 }],
  'West Ham':         [{ type: 'yellow', player: 'Soucek', minute: 23 }, { type: 'goal', player: 'Bowen', minute: 42 }, { type: 'goal', player: 'Paquetá', minute: 60 }, { type: 'goal', player: 'Kudus', minute: 77 }],
  'Nottingham':       [{ type: 'goal', player: 'Wood', minute: 16 }, { type: 'yellow', player: 'Yates', minute: 35 }, { type: 'goal', player: 'Hudson-Odoi', minute: 54 }, { type: 'goal', player: 'Awoniyi', minute: 72 }],
  'Leeds':            [{ type: 'yellow', player: 'Ampadu', minute: 19 }, { type: 'goal', player: 'Piroe', minute: 38 }, { type: 'goal', player: 'Rutter', minute: 57 }, { type: 'goal', player: 'James', minute: 74 }],
  'Burnley':          [{ type: 'goal', player: 'Foster', minute: 21 }, { type: 'yellow', player: 'O\'Shea', minute: 41 }, { type: 'goal', player: 'Rodríguez', minute: 60 }, { type: 'goal', player: 'Brownhill', minute: 76 }],
  'Getafe':           [{ type: 'yellow', player: 'Mauro Arambarri', minute: 25 }, { type: 'goal', player: 'Mayoral', minute: 44 }, { type: 'goal', player: 'Greenwood', minute: 62 }, { type: 'goal', player: 'Latasa', minute: 78 }],
  'Elche':            [{ type: 'goal', player: 'Pere Milla', minute: 18 }, { type: 'yellow', player: 'Bigas', minute: 39 }, { type: 'goal', player: 'Boyé', minute: 57 }, { type: 'goal', player: 'Mojica', minute: 75 }],
  'Alavés':           [{ type: 'yellow', player: 'Tenaglia', minute: 20 }, { type: 'goal', player: 'Samu Omorodion', minute: 41 }, { type: 'goal', player: 'Carlos Vicente', minute: 59 }, { type: 'goal', player: 'Rioja', minute: 76 }],
  'Espanyol':         [{ type: 'goal', player: 'Joselu', minute: 13 }, { type: 'yellow', player: 'Calero', minute: 33 }, { type: 'goal', player: 'Puado', minute: 52 }, { type: 'goal', player: 'Bare', minute: 71 }],
  'Mallorca':         [{ type: 'yellow', player: 'Antonio Raíllo', minute: 22 }, { type: 'goal', player: 'Muriqi', minute: 40 }, { type: 'goal', player: 'Larin', minute: 60 }, { type: 'goal', player: 'Darder', minute: 76 }],
  'Levante':          [{ type: 'goal', player: 'Iborra', minute: 16 }, { type: 'yellow', player: 'Postigo', minute: 36 }, { type: 'goal', player: 'Bouldini', minute: 55 }, { type: 'goal', player: 'Brugué', minute: 72 }],
  'B. Leverkusen':    [{ type: 'goal', player: 'Wirtz', minute: 12 }, { type: 'yellow', player: 'Tah', minute: 32 }, { type: 'goal', player: 'Boniface', minute: 50 }, { type: 'goal', player: 'Grimaldo', minute: 68 }],
  'Wolfsburg':        [{ type: 'yellow', player: 'Arnold', minute: 24 }, { type: 'goal', player: 'Wind', minute: 43 }, { type: 'goal', player: 'Wimmer', minute: 60 }, { type: 'goal', player: 'Majer', minute: 77 }],
  'Eintracht':        [{ type: 'goal', player: 'Ekitiké', minute: 17 }, { type: 'yellow', player: 'Koch', minute: 38 }, { type: 'goal', player: 'Marmoush', minute: 56 }, { type: 'goal', player: 'Knauff', minute: 73 }],
  'Augsburg':         [{ type: 'yellow', player: 'Gouweleeuw', minute: 23 }, { type: 'goal', player: 'Demirović', minute: 42 }, { type: 'goal', player: 'Tietz', minute: 60 }, { type: 'goal', player: 'Vargas', minute: 77 }],
  'Hamburger':        [{ type: 'goal', player: 'Glatzel', minute: 15 }, { type: 'yellow', player: 'Schonlau', minute: 35 }, { type: 'goal', player: 'Königsdörffer', minute: 54 }, { type: 'goal', player: 'Selke', minute: 71 }],
  'Benfica':          [{ type: 'goal', player: 'Di María', minute: 14 }, { type: 'yellow', player: 'Otamendi', minute: 35 }, { type: 'goal', player: 'Pavlidis', minute: 52 }, { type: 'goal', player: 'Schjelderup', minute: 70 }],
  'Ajax':             [{ type: 'yellow', player: 'Henderson', minute: 20 }, { type: 'goal', player: 'Brobbey', minute: 39 }, { type: 'goal', player: 'Berghuis', minute: 56 }, { type: 'goal', player: 'Tahirović', minute: 73 }],
  'Fenerbahçe':       [{ type: 'goal', player: 'Dzeko', minute: 12 }, { type: 'yellow', player: 'İrfan Can', minute: 32 }, { type: 'goal', player: 'Tadić', minute: 51 }, { type: 'goal', player: 'En-Nesyri', minute: 69 }],
  'Porto':            [{ type: 'yellow', player: 'Otávio', minute: 22 }, { type: 'goal', player: 'Galeno', minute: 41 }, { type: 'goal', player: 'Taremi', minute: 59 }, { type: 'goal', player: 'Pepê', minute: 76 }],
  'Panathinaikos':    [{ type: 'yellow', player: 'Maksimović', minute: 24 }, { type: 'goal', player: 'Ioannidis', minute: 43 }, { type: 'goal', player: 'Mancini', minute: 61 }, { type: 'goal', player: 'Bakasetas', minute: 78 }],
  'Dinamo':           [{ type: 'goal', player: 'Petković', minute: 16 }, { type: 'yellow', player: 'Šutalo', minute: 37 }, { type: 'goal', player: 'Baturina', minute: 55 }, { type: 'goal', player: 'Špikić', minute: 73 }],
  // América do Sul
  'Boca Juniors':     [{ type: 'goal', player: 'Cavani', minute: 11 }, { type: 'yellow', player: 'Fabra', minute: 31 }, { type: 'goal', player: 'Merentiel', minute: 49 }, { type: 'goal', player: 'Janson', minute: 68 }],
  'Argentinos Jrs':   [{ type: 'yellow', player: 'Hauche', minute: 25 }, { type: 'goal', player: 'Verón', minute: 44 }, { type: 'goal', player: 'Cabrera', minute: 62 }, { type: 'goal', player: 'Castro', minute: 79 }],
  'Racing':           [{ type: 'goal', player: 'Maravilla Martínez', minute: 13 }, { type: 'yellow', player: 'Sigali', minute: 33 }, { type: 'goal', player: 'Solari', minute: 52 }, { type: 'goal', player: 'Quintero', minute: 70 }],
  'River Plate':      [{ type: 'yellow', player: 'Pérez', minute: 21 }, { type: 'goal', player: 'Borja', minute: 40 }, { type: 'goal', player: 'Colidio', minute: 58 }, { type: 'goal', player: 'Lanzini', minute: 75 }],
  'San Lorenzo':      [{ type: 'goal', player: 'Cuello', minute: 17 }, { type: 'yellow', player: 'Romaña', minute: 38 }, { type: 'goal', player: 'Adam Bareiro', minute: 56 }, { type: 'goal', player: 'Ferro', minute: 74 }],
  'Córdoba':          [{ type: 'yellow', player: 'Galván', minute: 23 }, { type: 'goal', player: 'Garro', minute: 42 }, { type: 'goal', player: 'Bustos', minute: 60 }, { type: 'goal', player: 'Requena', minute: 77 }],
  // MLS
  'Inter Miami':      [{ type: 'goal', player: 'Messi', minute: 11 }, { type: 'yellow', player: 'Busquets', minute: 30 }, { type: 'goal', player: 'Suárez', minute: 49 }, { type: 'goal', player: 'Alba', minute: 68 }],
  'Whitecaps':        [{ type: 'yellow', player: 'Cubas', minute: 22 }, { type: 'goal', player: 'White', minute: 41 }, { type: 'goal', player: 'Gauld', minute: 59 }, { type: 'goal', player: 'Vite', minute: 76 }],
  'Cincinnati':       [{ type: 'goal', player: 'Boupendza', minute: 14 }, { type: 'yellow', player: 'Miazga', minute: 34 }, { type: 'goal', player: 'Acosta', minute: 52 }, { type: 'goal', player: 'Vázquez', minute: 70 }],
  'Chicago Fire':     [{ type: 'yellow', player: 'Souquet', minute: 25 }, { type: 'goal', player: 'Shaqiri', minute: 43 }, { type: 'goal', player: 'Cuypers', minute: 61 }, { type: 'goal', player: 'Haile-Selassie', minute: 78 }],
  'Nashville':        [{ type: 'goal', player: 'Mukhtar', minute: 13 }, { type: 'yellow', player: 'Zimmerman', minute: 33 }, { type: 'goal', player: 'Surridge', minute: 51 }, { type: 'goal', player: 'Bunbury', minute: 69 }],
  'New York City':    [{ type: 'yellow', player: 'Martins', minute: 20 }, { type: 'goal', player: 'Talles Magno', minute: 39 }, { type: 'goal', player: 'Wolf', minute: 57 }, { type: 'goal', player: 'Rodríguez', minute: 74 }],
}

// Generic player names used for unmapped teams
const FALLBACK_PLAYERS = ['Silva', 'Rodríguez', 'Martínez', 'García', 'López', 'Müller', 'Schmidt', 'Smith', 'Johnson']

function getTeamEvents(teamName: string, score: number): MatchEvent[] {
  const mapped = TEAM_EVENTS[teamName]
  const allEvents = mapped
    ? mapped.slice().sort((a, b) => a.minute - b.minute)
    : buildFallbackEvents(teamName, score)
  let goalsAdded = 0
  const result: MatchEvent[] = []
  for (const event of allEvents) {
    if (event.type === 'goal') {
      if (goalsAdded < score) {
        result.push(event)
        goalsAdded++
      }
    } else {
      result.push(event)
    }
  }
  return result
}

function buildFallbackEvents(teamName: string, score: number): MatchEvent[] {
  // deterministic seed from team name so the same team always gets the same names
  let seed = 0
  for (let i = 0; i < teamName.length; i++) seed = (seed * 31 + teamName.charCodeAt(i)) >>> 0
  const pick = (offset: number) => FALLBACK_PLAYERS[(seed + offset) % FALLBACK_PLAYERS.length]
  const events: MatchEvent[] = [{ type: 'yellow', player: pick(0), minute: 18 + (seed % 10) }]
  const goals = Math.max(score, 0)
  const baseMinute = 25
  for (let i = 0; i < goals; i++) {
    events.push({ type: 'goal', player: pick(i + 1), minute: baseMinute + i * 18 })
  }
  return events.sort((a, b) => a.minute - b.minute)
}

function LiveEventContent({
  onRequestClose,
  onRequestExpand,
  onRequestCollapse,
  onCompactPullChange,
  onCompactPullEnd,
  isExpanded,
  match,
  leagueName,
  currentTime,
}: LiveEventContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>('transmissao')
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTabId>('destaques')
  const [scrolledOddsRows, setScrolledOddsRows] = useState<Record<string, boolean>>({})
  const [isResultMarketOpen, setIsResultMarketOpen] = useState(true)
  const [isShotsMarketOpen, setIsShotsMarketOpen] = useState(true)
  const [isTotalGoalsMarketOpen, setIsTotalGoalsMarketOpen] = useState(true)
  const [isCornersMarketOpen, setIsCornersMarketOpen] = useState(true)
  const [isCardsMarketOpen, setIsCardsMarketOpen] = useState(true)
  const [isDoubleChanceMarketOpen, setIsDoubleChanceMarketOpen] = useState(true)
  const [isShotsExpanded, setIsShotsExpanded] = useState(false)
  const [displayTime, setDisplayTime] = useState(currentTime)
  const scrollRef = useRef<HTMLDivElement>(null)
  const dragStartYRef = useRef<number | null>(null)
  const isResettingCompactScrollRef = useRef(false)
  const compactScrollResetTimerRef = useRef<number | null>(null)
  const compactPullGestureRef = useRef<{
    startX: number
    startY: number
    isPulling: boolean
  } | null>(null)
  const allShotsOnGoalRows = getShotsOnGoalRows(match, true)
  const primaryShotsOnGoalRows = allShotsOnGoalRows.slice(0, 4)
  const extraShotsOnGoalRows = allShotsOnGoalRows.slice(4, 8)
  const totalGoalsRows = getTotalGoalsRows(match, false)
  const totalCornersRows = getTotalCornersRows(match)
  const totalCardsRows = getTotalCardsRows()
  const doubleChanceRows = getDoubleChanceRows(match)

  const handlePlayerOddsWheel = useCallback((event: WheelEvent<HTMLDivElement>) => {
    const horizontalDelta = getHorizontalWheelDelta(event.deltaX, event.deltaY, event.shiftKey)

    if (horizontalDelta === 0) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.scrollLeft += horizontalDelta
  }, [])

  const handleContentScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (isResettingCompactScrollRef.current) return

    const scrollTop = event.currentTarget.scrollTop

    if (isExpanded) {
      if (scrollTop <= LIVE_EVENT_COLLAPSE_SCROLL_THRESHOLD) {
        onRequestCollapse()
      }
      return
    }

    if (scrollTop >= LIVE_EVENT_EXPAND_SCROLL_THRESHOLD) {
      onRequestExpand()
    }
  }, [isExpanded, onRequestCollapse, onRequestExpand])

  useEffect(() => {
    const syncTimer = window.setTimeout(() => setDisplayTime(currentTime), 0)
    const parsed = parseLiveTime(currentTime)
    if (!parsed) return () => window.clearTimeout(syncTimer)
    let totalSeconds = parsed.totalSeconds
    const interval = setInterval(() => {
      totalSeconds += 1
      setDisplayTime(formatLiveTime(parsed.prefix, totalSeconds))
    }, 1000)
    return () => {
      window.clearTimeout(syncTimer)
      clearInterval(interval)
    }
  }, [currentTime])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsResultMarketOpen(true)
      setIsShotsMarketOpen(true)
      setIsTotalGoalsMarketOpen(true)
      setIsCornersMarketOpen(true)
      setIsCardsMarketOpen(true)
      setIsDoubleChanceMarketOpen(true)
      setIsShotsExpanded(false)
      setScrolledOddsRows({})
      scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, 0)

    return () => window.clearTimeout(timer)
  }, [match])

  useEffect(() => () => {
    if (compactScrollResetTimerRef.current !== null) {
      window.clearTimeout(compactScrollResetTimerRef.current)
      compactScrollResetTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!isExpanded) {
      isResettingCompactScrollRef.current = true
      scrollRef.current?.scrollTo({ top: 0, left: 0, behavior: 'auto' })

      if (compactScrollResetTimerRef.current !== null) {
        window.clearTimeout(compactScrollResetTimerRef.current)
      }

      compactScrollResetTimerRef.current = window.setTimeout(() => {
        isResettingCompactScrollRef.current = false
        compactScrollResetTimerRef.current = null
      }, LIVE_EVENT_TRANSITION_MS)
    }
  }, [isExpanded])

  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement || !isMobileTouchScreen()) return

    const handleTouchStart = (event: globalThis.TouchEvent) => {
      if (isExpanded || event.touches.length !== 1) {
        compactPullGestureRef.current = null
        return
      }

      const touch = event.touches[0]
      if (!touch) return

      compactPullGestureRef.current = {
        startX: touch.clientX,
        startY: touch.clientY,
        isPulling: false,
      }
    }

    const handleTouchMove = (event: globalThis.TouchEvent) => {
      const gesture = compactPullGestureRef.current
      const touch = event.touches[0]
      if (!gesture || !touch || isExpanded) return

      const dx = touch.clientX - gesture.startX
      const dy = touch.clientY - gesture.startY
      const atScrollTop = scrollElement.scrollTop <= LIVE_EVENT_PULL_TOP_THRESHOLD

      if (!gesture.isPulling) {
        const hasDownwardIntent = dy >= LIVE_EVENT_PULL_START_THRESHOLD && Math.abs(dy) > Math.abs(dx)
        if (!atScrollTop || !hasDownwardIntent) return
        gesture.isPulling = true
      }

      event.preventDefault()
      event.stopPropagation()
      scrollElement.scrollTop = 0
      onCompactPullChange(getCompactPullDistance(dy))
    }

    const finishCompactPull = () => {
      const wasPulling = compactPullGestureRef.current?.isPulling
      compactPullGestureRef.current = null
      if (wasPulling) onCompactPullEnd()
    }

    scrollElement.addEventListener('touchstart', handleTouchStart, { passive: true })
    scrollElement.addEventListener('touchmove', handleTouchMove, { passive: false })
    scrollElement.addEventListener('touchend', finishCompactPull)
    scrollElement.addEventListener('touchcancel', finishCompactPull)

    return () => {
      scrollElement.removeEventListener('touchstart', handleTouchStart)
      scrollElement.removeEventListener('touchmove', handleTouchMove)
      scrollElement.removeEventListener('touchend', finishCompactPull)
      scrollElement.removeEventListener('touchcancel', finishCompactPull)
    }
  }, [isExpanded, onCompactPullChange, onCompactPullEnd])

  const handleCloseHandlePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    dragStartYRef.current = event.clientY
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handleCloseHandlePointerUp = (event: PointerEvent<HTMLSpanElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const dragStartY = dragStartYRef.current
    dragStartYRef.current = null
    const dragDistance = dragStartY === null ? 0 : event.clientY - dragStartY

    if (Math.abs(dragDistance) <= 8) {
      onRequestClose()
      return
    }

    if (dragDistance >= 32) {
      if (isExpanded) {
        onRequestCollapse()
      } else {
        onRequestClose()
      }
    } else if (dragDistance <= -32 && !isExpanded) {
      onRequestExpand()
    }
  }

  const handleCloseHandlePointerCancel = () => {
    dragStartYRef.current = null
  }

  const handleTopAreaClick = () => {
    onRequestClose()
  }

  return (
    <div
      className="live-event-page__content"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Scrollable content */}
      <div
        className="live-event-page__scroll"
        ref={scrollRef}
        onScroll={handleContentScroll}
      >
        <div className="live-event-page__scroll-body">
        <button
          type="button"
          className="live-event-page__top-close-area"
          aria-label="Fechar evento"
          onClick={handleTopAreaClick}
        >
          <span
            className="live-event-page__drag-handle"
            onClick={(event) => event.stopPropagation()}
            onPointerDown={handleCloseHandlePointerDown}
            onPointerUp={handleCloseHandlePointerUp}
            onPointerCancel={handleCloseHandlePointerCancel}
          >
            <span />
          </span>
        </button>

        {/* ── Match card ── */}
        <div className="live-event-page__match-card">

          {/* League name */}
          <span className="live-event-page__league-name">{leagueName}</span>

          {/* Live row */}
          <div className="live-event-page__live-row">
            <div className="live-event-page__tag-aovivo">
              <div className="live-event-page__tag-icon-wrapper">
                <img src={iconAoVivo} alt="" className="live-event-page__tag-icon" />
              </div>
              <span>Ao Vivo</span>
            </div>
            <span className="live-event-page__match-time">{displayTime}</span>
          </div>

          {/* Confronto — logos + placar */}
          <div className="live-event-page__confronto">

            {/* Home */}
            <div className="live-event-page__team-block live-event-page__team-block--home">
              <div className="live-event-page__team-info">
                <div className="live-event-page__logo-container">
                  {match.homeTeam.icon ? (
                    <>
                      <span
                        className="live-event-page__logo-glow"
                        style={getTeamGlowStyle(match.homeTeam.name)}
                        aria-hidden="true"
                      />
                      <img src={match.homeTeam.icon} alt={match.homeTeam.name} className="live-event-page__logo" />
                    </>
                  ) : (
                    <div className="live-event-page__logo-placeholder" />
                  )}
                </div>
                <span className="live-event-page__team-name">{match.homeTeam.name}</span>
              </div>
              <div className="live-event-page__score">{match.homeTeam.score}</div>
            </div>

            <div className="live-event-page__score-separator">:</div>

            {/* Away */}
            <div className="live-event-page__team-block live-event-page__team-block--away">
              <div className="live-event-page__score">{match.awayTeam.score}</div>
              <div className="live-event-page__team-info">
                <div className="live-event-page__logo-container">
                  {match.awayTeam.icon ? (
                    <>
                      <span
                        className="live-event-page__logo-glow"
                        style={getTeamGlowStyle(match.awayTeam.name)}
                        aria-hidden="true"
                      />
                      <img src={match.awayTeam.icon} alt={match.awayTeam.name} className="live-event-page__logo" />
                    </>
                  ) : (
                    <div className="live-event-page__logo-placeholder" />
                  )}
                </div>
                <span className="live-event-page__team-name">{match.awayTeam.name}</span>
              </div>
            </div>
          </div>

          {/* Eventos da partida */}
          <div className="live-event-page__events">
            <div className="live-event-page__events-side live-event-page__events-side--home">
              {getTeamEvents(match.homeTeam.name, match.homeTeam.score).map((event, i) => (
                <div key={i} className="live-event-page__event">
                  {event.type === 'goal' ? (
                    <img src={iconFutebol} alt="" className="live-event-page__event-ball" />
                  ) : (
                    <div className={`live-event-page__event-icon live-event-page__event-icon--${event.type}`} />
                  )}
                  <span className="live-event-page__event-text">
                    {event.player} {event.minute}'
                  </span>
                </div>
              ))}
            </div>
            <div className="live-event-page__events-side live-event-page__events-side--away">
              {getTeamEvents(match.awayTeam.name, match.awayTeam.score).map((event, i) => (
                <div key={i} className="live-event-page__event">
                  <span className="live-event-page__event-text">
                    {event.player} {event.minute}'
                  </span>
                  {event.type === 'goal' ? (
                    <img src={iconFutebol} alt="" className="live-event-page__event-ball" />
                  ) : (
                    <div className={`live-event-page__event-icon live-event-page__event-icon--${event.type}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats link */}
          <button className="live-event-page__stats-btn">
            <span>Ver mais estatísticas</span>
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="live-event-page__tabs">
          <button
            className={`live-event-page__tab${activeTab === 'transmissao' ? ' live-event-page__tab--active' : ''}`}
            onClick={() => setActiveTab('transmissao')}
          >
            <img src={iconStreaming} alt="" className="live-event-page__tab-icon" />
            <span>Transmissão</span>
          </button>
          <button
            className={`live-event-page__tab${activeTab === 'campo' ? ' live-event-page__tab--active' : ''}`}
            onClick={() => setActiveTab('campo')}
          >
            <img src={iconCampoEvento} alt="" className="live-event-page__tab-field-icon" />
            <span>Campo</span>
          </button>
        </div>

        {/* ── Streaming / Campo ── */}
        {activeTab === 'transmissao' ? (
          <div className="live-event-page__streaming">
            {/* TODO: substituir por player real */}
            <img src={streamingFutebol} alt="Transmissão ao vivo" className="live-event-page__stream-img" />
            <div className="live-event-page__live-badge">LIVE</div>
            <button className="live-event-page__stream-btn live-event-page__stream-btn--top-right" aria-label="Fechar">
              <CloseStreamIcon />
            </button>
            <div className="live-event-page__stream-controls">
              <button className="live-event-page__stream-btn" aria-label="Pausar">
                <PauseIcon />
              </button>
              <button className="live-event-page__stream-btn" aria-label="Mudo">
                <MuteIcon />
              </button>
            </div>
            <button className="live-event-page__stream-btn live-event-page__stream-btn--fullscreen" aria-label="Tela cheia">
              <FullscreenIcon />
            </button>
          </div>
        ) : (
          <div className="live-event-page__campo">
            {/* TODO: adicionar visão do campo */}
            <span className="live-event-page__campo-label">Visão do Campo</span>
            <span className="live-event-page__campo-sub">Em breve</span>
          </div>
        )}

        <div className="live-event-page__detail-tabs" aria-label="Navegação do evento">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              className={`live-event-page__detail-tab${activeDetailTab === tab.id ? ' live-event-page__detail-tab--active' : ''}`}
              onClick={() => setActiveDetailTab(tab.id)}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ── Market card (Resultado Final) ── */}
        <div className={`live-event-page__market-card${isResultMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Resultado final - Pagamento Antecipado</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isResultMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isResultMarketOpen}
                onClick={() => setIsResultMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isResultMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Pag. Antecipado</span>
              <span className="live-event-page__market-tag-badge">
                <img src={reiAntecipaFutebol} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isResultMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              <div className="live-event-page__market-odds">
                <button className="live-event-page__market-odd">
                  <span>{match.homeTeam.name}</span>
                  <strong>{match.odds.home}</strong>
                </button>
                {match.odds.draw && (
                  <button className="live-event-page__market-odd">
                    <span>Empate</span>
                    <strong>{match.odds.draw}</strong>
                  </button>
                )}
                <button className="live-event-page__market-odd">
                  <span>{match.awayTeam.name}</span>
                  <strong>{match.odds.away}</strong>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Market card (Finalizações ao Gol) ── */}
        <div className={`live-event-page__market-card live-event-page__market-card--player-props${isShotsMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Finalizações ao Gol</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isShotsMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isShotsMarketOpen}
                onClick={() => setIsShotsMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isShotsMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Substituição Garantida</span>
              <span className="live-event-page__market-tag-badge">
                <img src={substituicaoGarantida} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isShotsMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              <div className="live-event-page__player-market">
                <div className="live-event-page__player-list">
                  {primaryShotsOnGoalRows.map((row) => (
                    <div key={row.id} className="live-event-page__player-row">
                      <div className="live-event-page__player-visual">
                        <div className="live-event-page__player-avatar-wrap">
                          <img src={row.image ?? avatarFutebol} alt="" className="live-event-page__player-avatar" />
                        </div>
                        <span className="live-event-page__player-stat-icon">
                          <img src={iconEstatistica} alt="" />
                        </span>
                      </div>
                      <div className="live-event-page__player-copy">
                        <strong>{row.player}</strong>
                        <span>{row.team}</span>
                      </div>
                    </div>
                  ))}
                  <div className={`live-event-page__player-extra${isShotsExpanded ? ' live-event-page__player-extra--open' : ''}`}>
                    <div className="live-event-page__player-extra-inner">
                      {extraShotsOnGoalRows.map((row) => (
                        <div key={row.id} className="live-event-page__player-row">
                          <div className="live-event-page__player-visual">
                            <div className="live-event-page__player-avatar-wrap">
                              <img src={row.image ?? avatarFutebol} alt="" className="live-event-page__player-avatar" />
                            </div>
                            <span className="live-event-page__player-stat-icon">
                              <img src={iconEstatistica} alt="" />
                            </span>
                          </div>
                          <div className="live-event-page__player-copy">
                            <strong>{row.player}</strong>
                            <span>{row.team}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="live-event-page__player-odds-list">
                  {primaryShotsOnGoalRows.map((row) => (
                    <div
                      key={row.id}
                      className={`live-event-page__player-odds-row${scrolledOddsRows[row.id] ? ' live-event-page__player-odds-row--scrolled' : ''}`}
                      onWheel={handlePlayerOddsWheel}
                      onScroll={(event) => {
                        const isScrolled = event.currentTarget.scrollLeft > 0
                        setScrolledOddsRows((current) => (
                          current[row.id] === isScrolled ? current : { ...current, [row.id]: isScrolled }
                        ))
                      }}
                    >
                      {row.outcomes.map((outcome) => (
                        <button key={outcome.label} className="live-event-page__player-odd">
                          <span>{outcome.label}</span>
                          <strong>{outcome.odd}</strong>
                        </button>
                      ))}
                    </div>
                  ))}
                  <div className={`live-event-page__player-extra live-event-page__player-extra--odds${isShotsExpanded ? ' live-event-page__player-extra--open' : ''}`}>
                    <div className="live-event-page__player-extra-inner">
                      {extraShotsOnGoalRows.map((row) => (
                        <div
                          key={row.id}
                          className={`live-event-page__player-odds-row${scrolledOddsRows[row.id] ? ' live-event-page__player-odds-row--scrolled' : ''}`}
                          onWheel={handlePlayerOddsWheel}
                          onScroll={(event) => {
                            const isScrolled = event.currentTarget.scrollLeft > 0
                            setScrolledOddsRows((current) => (
                              current[row.id] === isScrolled ? current : { ...current, [row.id]: isScrolled }
                            ))
                          }}
                        >
                          {row.outcomes.map((outcome) => (
                            <button key={outcome.label} className="live-event-page__player-odd">
                              <span>{outcome.label}</span>
                              <strong>{outcome.odd}</strong>
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="live-event-page__market-more"
                aria-expanded={isShotsExpanded}
                onClick={() => setIsShotsExpanded((current) => !current)}
              >
                <span>{isShotsExpanded ? 'Ver Menos' : 'Ver Mais'}</span>
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-more-icon${isShotsExpanded ? ' live-event-page__market-more-icon--expanded' : ''}`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ── Market card (Total de Gols) ── */}
        <div className={`live-event-page__market-card${isTotalGoalsMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Total de Gols</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isTotalGoalsMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isTotalGoalsMarketOpen}
                onClick={() => setIsTotalGoalsMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isTotalGoalsMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isTotalGoalsMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              <div className="live-event-page__total-goals-list">
                {totalGoalsRows.map((row) => (
                  <div key={row.id} className="live-event-page__total-goals-row">
                    <button className="live-event-page__market-odd">
                      <span>{row.under.label}</span>
                      <strong>{row.under.odd}</strong>
                    </button>
                    <button className="live-event-page__market-odd">
                      <span>{row.over.label}</span>
                      <strong>{row.over.odd}</strong>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Market card (Total de Escanteios) ── */}
        <div className={`live-event-page__market-card${isCornersMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Total de Escanteios</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isCornersMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isCornersMarketOpen}
                onClick={() => setIsCornersMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isCornersMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isCornersMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              <div className="live-event-page__total-goals-list">
                {totalCornersRows.map((row) => (
                  <div key={row.id} className="live-event-page__total-goals-row">
                    <button className="live-event-page__market-odd">
                      <span>{row.under.label}</span>
                      <strong>{row.under.odd}</strong>
                    </button>
                    <button className="live-event-page__market-odd">
                      <span>{row.over.label}</span>
                      <strong>{row.over.odd}</strong>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Market card (Total de Cartões) ── */}
        <div className={`live-event-page__market-card${isCardsMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Total de Cartões</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isCardsMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isCardsMarketOpen}
                onClick={() => setIsCardsMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isCardsMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isCardsMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              <div className="live-event-page__total-goals-list">
                {totalCardsRows.map((row) => (
                  <div key={row.id} className="live-event-page__total-goals-row">
                    <button className="live-event-page__market-odd">
                      <span>{row.under.label}</span>
                      <strong>{row.under.odd}</strong>
                    </button>
                    <button className="live-event-page__market-odd">
                      <span>{row.over.label}</span>
                      <strong>{row.over.odd}</strong>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Market card (Dupla Chance) ── */}
        <div className={`live-event-page__market-card${isDoubleChanceMarketOpen ? '' : ' live-event-page__market-card--closed'}`}>
          <div className="live-event-page__market-header">
            <span className="live-event-page__market-title">Dupla Chance</span>
            <div className="live-event-page__market-actions">
              <div className="live-event-page__market-ca-box">
                <span className="live-event-page__market-ca">CA</span>
              </div>
              <button
                type="button"
                className="live-event-page__market-toggle"
                aria-label={isDoubleChanceMarketOpen ? 'Recolher mercado' : 'Expandir mercado'}
                aria-expanded={isDoubleChanceMarketOpen}
                onClick={() => setIsDoubleChanceMarketOpen((current) => !current)}
              >
                <img
                  src={iconMercadoChevron}
                  alt=""
                  className={`live-event-page__market-chevron${isDoubleChanceMarketOpen ? '' : ' live-event-page__market-chevron--closed'}`}
                />
              </button>
            </div>
          </div>

          <div className="live-event-page__market-tags">
            <div className="live-event-page__market-tag">
              <span>Múltipla Turbinada</span>
              <span className="live-event-page__market-tag-badge">
                <img src={multiplaTurbinada} alt="" className="live-event-page__market-tag-img" />
              </span>
            </div>
          </div>

          <div className={`live-event-page__market-collapse${isDoubleChanceMarketOpen ? ' live-event-page__market-collapse--open' : ''}`}>
            <div className="live-event-page__market-collapse-inner">
              {doubleChanceRows.map((row) => (
                <div key={row.id} className="live-event-page__market-odds">
                  {row.options.map((option) => (
                    <button key={option.label} className="live-event-page__market-odd">
                      {option.labelParts ? (
                        <span className="live-event-page__market-odd-label live-event-page__market-odd-label--split" aria-label={option.label}>
                          <span>{option.labelParts[0]}</span>
                          <span className="live-event-page__market-odd-label-separator">ou</span>
                          <span>{option.labelParts[1]}</span>
                        </span>
                      ) : (
                        <span className="live-event-page__market-odd-label">{option.label}</span>
                      )}
                      <strong>{option.odd}</strong>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>
      </div>
    </div>
  )
}

const MemoLiveEventContent = memo(LiveEventContent, (previous, next) => (
  previous.match === next.match
  && previous.leagueName === next.leagueName
  && previous.currentTime === next.currentTime
  && previous.isExpanded === next.isExpanded
))

const LIVE_EVENT_COMPACT_SIDE_MARGIN = 24
const LIVE_EVENT_COMPACT_TOP = 80
const LIVE_EVENT_TRANSITION_MS = 300
const LIVE_EVENT_EXPAND_SCROLL_THRESHOLD = 8
const LIVE_EVENT_COLLAPSE_SCROLL_THRESHOLD = 1
const LIVE_EVENT_PULL_TOP_THRESHOLD = 1
const LIVE_EVENT_PULL_START_THRESHOLD = 6
const LIVE_EVENT_PULL_RESISTANCE = 0.56
const LIVE_EVENT_MAX_COMPACT_PULL = 132
const getHorizontalWheelDelta = (deltaX: number, deltaY: number, shiftKey: boolean) => {
  if (Math.abs(deltaX) >= Math.abs(deltaY)) return deltaX
  return shiftKey ? deltaY : 0
}

const isMobileTouchScreen = () => (
  typeof window !== 'undefined'
  && (
    window.matchMedia?.('(hover: none) and (pointer: coarse)').matches
    || navigator.maxTouchPoints > 0
  )
)

const getCompactPullDistance = (distance: number) => (
  Math.min(LIVE_EVENT_MAX_COMPACT_PULL, Math.max(0, distance * LIVE_EVENT_PULL_RESISTANCE))
)

interface SheetMetrics {
  viewportWidth: number
  viewportHeight: number
  compactScale: number
}

function measureSheetMetrics(): SheetMetrics {
  if (typeof window === 'undefined') {
    return {
      viewportWidth: 390,
      viewportHeight: 844,
      compactScale: 342 / 390,
    }
  }

  const viewportWidth = window.visualViewport?.width ?? window.innerWidth ?? 390
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight ?? 844
  const availableWidth = Math.max(1, viewportWidth - LIVE_EVENT_COMPACT_SIDE_MARGIN * 2)
  const availableHeight = Math.max(1, viewportHeight - LIVE_EVENT_COMPACT_TOP)
  const compactScale = Math.min(
    1,
    availableWidth / viewportWidth,
    availableHeight / viewportHeight
  )

  return {
    viewportWidth,
    viewportHeight,
    compactScale,
  }
}

export function LiveEventPage({
  isOpen,
  onClose,
  match,
  matches,
  selectedIndex = 0,
  currentTimes,
  leagueName,
  currentTime,
}: LiveEventPageProps) {
  const eventMatches = matches?.length ? matches : match ? [match] : []
  const selectedMatchIndex = Math.min(Math.max(selectedIndex, 0), Math.max(eventMatches.length - 1, 0))
  const selectedMatch = eventMatches[selectedMatchIndex]
  const [isClosing, setIsClosing] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [compactPullY, setCompactPullY] = useState(0)
  const [isCompactPulling, setIsCompactPulling] = useState(false)
  const [sheetMetrics, setSheetMetrics] = useState<SheetMetrics>(() => measureSheetMetrics())
  const closeTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (isOpen && !isClosing) {
        if (closeTimerRef.current !== null) {
          window.clearTimeout(closeTimerRef.current)
          closeTimerRef.current = null
        }
        setSheetMetrics(measureSheetMetrics())
        setIsExpanded(false)
        setCompactPullY(0)
        setIsCompactPulling(false)
        setShouldRender(true)
        setIsClosing(false)
      } else if (shouldRender && !isClosing) {
        setIsClosing(true)
        setIsExpanded(false)
        setCompactPullY(0)
        setIsCompactPulling(false)
        closeTimerRef.current = window.setTimeout(() => {
          setShouldRender(false)
          setIsClosing(false)
          closeTimerRef.current = null
        }, LIVE_EVENT_TRANSITION_MS)
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [isOpen, shouldRender, isClosing])

  useEffect(() => () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!shouldRender) return

    const scrollY = window.scrollY
    const previousBodyOverflow = document.body.style.overflow
    const previousBodyPosition = document.body.style.position
    const previousBodyTop = document.body.style.top
    const previousBodyWidth = document.body.style.width
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.documentElement.style.overflow = 'hidden'
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow
      document.body.style.overflow = previousBodyOverflow
      document.body.style.position = previousBodyPosition
      document.body.style.top = previousBodyTop
      document.body.style.width = previousBodyWidth
      window.scrollTo(0, scrollY)
    }
  }, [shouldRender])

  useEffect(() => {
    if (!shouldRender) return

    const updateSheetMetrics = () => setSheetMetrics(measureSheetMetrics())

    updateSheetMetrics()
    window.addEventListener('resize', updateSheetMetrics)
    window.visualViewport?.addEventListener('resize', updateSheetMetrics)

    return () => {
      window.removeEventListener('resize', updateSheetMetrics)
      window.visualViewport?.removeEventListener('resize', updateSheetMetrics)
    }
  }, [shouldRender])

  const requestClose = useCallback(() => {
    if (isClosing) return
    setIsClosing(true)
    setIsExpanded(false)
    setCompactPullY(0)
    setIsCompactPulling(false)
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current)
    }
    closeTimerRef.current = window.setTimeout(() => {
      setShouldRender(false)
      setIsClosing(false)
      closeTimerRef.current = null
      onClose()
    }, LIVE_EVENT_TRANSITION_MS)
  }, [isClosing, onClose])

  const requestExpand = useCallback(() => {
    setCompactPullY(0)
    setIsCompactPulling(false)
    setIsExpanded(true)
  }, [])

  const requestCollapse = useCallback(() => {
    setCompactPullY(0)
    setIsCompactPulling(false)
    setIsExpanded(false)
  }, [])

  const handleCompactPullChange = useCallback((distance: number) => {
    if (isExpanded || isClosing) return
    setIsCompactPulling(true)
    setCompactPullY(distance)
  }, [isClosing, isExpanded])

  const handleCompactPullEnd = useCallback(() => {
    setIsCompactPulling(false)
    setCompactPullY(0)
  }, [])

  if (!shouldRender || !selectedMatch) return null

  const selectedMatchTime = getLiveEventMatchTime(
    selectedMatch,
    selectedMatchIndex,
    currentTimes,
    selectedMatchIndex === selectedIndex ? currentTime : undefined
  )
  const pageClasses = [
    'live-event-page',
    isClosing ? 'live-event-page--closing' : '',
    isExpanded ? 'live-event-page--expanded' : '',
    isCompactPulling ? 'live-event-page--compact-pulling' : '',
  ].filter(Boolean).join(' ')
  const rootStyle = {
    ['--live-event-sheet-width' as string]: `${sheetMetrics.viewportWidth}px`,
    ['--live-event-sheet-height' as string]: `${sheetMetrics.viewportHeight}px`,
    ['--live-event-compact-scale' as string]: String(sheetMetrics.compactScale),
    ['--live-event-compact-pull-y' as string]: `${compactPullY}px`,
  } as CSSProperties

  return createPortal(
    <div className={pageClasses} style={rootStyle}>
      <div className="live-event-page__overlay" onClick={requestClose} />
      <div className="live-event-page__sheet-layer">
        <div className="live-event-page__sheet-slide">
          <div className="live-event-page__sheet-center">
            <div className="live-event-page__sheet-scale">
              <MemoLiveEventContent
                match={selectedMatch}
                leagueName={leagueName}
                currentTime={selectedMatchTime}
                isExpanded={isExpanded}
                onRequestClose={requestClose}
                onRequestExpand={requestExpand}
                onRequestCollapse={requestCollapse}
                onCompactPullChange={handleCompactPullChange}
                onCompactPullEnd={handleCompactPullEnd}
              />
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
