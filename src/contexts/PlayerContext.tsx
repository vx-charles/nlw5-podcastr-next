import { createContext, useState, ReactNode, useContext } from 'react'

type Episode = {
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  url: string;
}

type PlayerContextData = {
  episodeList: Episode[];
  currentEpisodeIndex: number;
  isPlaying: boolean;
  isLooping: boolean;
  isShuffling: boolean;
  play: (episode: Episode) => void; // tipagem do tipo "função" e "void" é sem retorno.
  playList: (list: Episode[], index: number) => void;
  setPlayingState: (state: boolean) => void;
  togglePlay: () => void; // não recebe parâmetro e não tem retorno
  toggleLoop: () => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  clearPlayerState: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
}

export const PlayerContext = createContext({} as PlayerContextData) // só pra definir o formato dos dados, então pode deixar só com aspas.

type PlayerContextProviderProps = {
  children: ReactNode; // PlayerContextProviderProps = nome do componente + props. ReactNode - propriedade do react que aceitaria qualquer coisa como conteúdo.
}

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
  const [episodeList, setEpisodeList] = useState([])
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  function play(episode: Episode) {
    setEpisodeList([episode])
    setCurrentEpisodeIndex(0) // força o valor para "0" caso ainda não esteja tocando no momento.
    setIsPlaying(true)
  }

  function playList(list: Episode[], index: number) {
    setEpisodeList(list)
    setCurrentEpisodeIndex(index)
    setIsPlaying(true)
  }

  function togglePlay() {
    setIsPlaying(!isPlaying)
  }

  function toggleLoop() {
    setIsLooping(!isLooping)
  }

  function toggleShuffle() {
    setIsShuffling(!isShuffling)
  }

  function setPlayingState(state: boolean) {
    setIsPlaying(state)
  }

  function clearPlayerState() { // limpar o player, como se nunca tivesse tocado um episódio.
    setEpisodeList([])
    setCurrentEpisodeIndex(0)
  }

  const hasPrevious = currentEpisodeIndex > 0
  const hasNext = isShuffling || (currentEpisodeIndex + 1) < episodeList.length

  function playNext() {
    if (isShuffling) {
      const nextRandomEpisodeIndex = Math.floor(Math.random() * episodeList.length)
      setCurrentEpisodeIndex(nextRandomEpisodeIndex)
    } else if (hasNext) { 
      setCurrentEpisodeIndex(currentEpisodeIndex + 1)
    }
  }

  function playPrevious() {
    if(hasPrevious) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1)
    }
  }

  return (
    <PlayerContext.Provider value={{
      episodeList,
      currentEpisodeIndex,
      play,
      playList,
      playNext,
      playPrevious,
      isPlaying,
      togglePlay,
      isLooping,
      isShuffling,
      toggleLoop,
      setPlayingState,
      hasNext,
      hasPrevious,
      toggleShuffle,
      clearPlayerState
    }}
    >
      {children}
    </PlayerContext.Provider>
  )
}

// função que retorna o context do player, que traz as importações do context.
export const usePlayer = () => {
  return useContext(PlayerContext)
}