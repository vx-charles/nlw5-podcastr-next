import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider'

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import 'rc-slider/assets/index.css';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null) // boa prática é sempre iniciar como nulo, já que caso o episode retorne null, é bom já deixar a ref nulo.
  const [progress, setProgress] = useState(0)

  const { // import do context
    episodeList,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState
  } = usePlayer()

  useEffect(() => {
    if (!audioRef.current) { // buscar o valor dentro da ref da tag audio.
      return;
    }

    if (isPlaying) {
      audioRef.current.play() // .current - tem todos os elementos e funções da tag audio.
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying]) // a função vai disparar quando o isPlaying tiver seu valor alterado.

  function setupProgressListener() { // ouvir o progresso do player quando o evento acontecer.
    audioRef.current.currentTime = 0 // sempre mudar de som pra outro, colocar o player na estaca "0".
    
    audioRef.current.addEventListener('timeupdate', () => { // timeupdate - dispara várias vezes enquanto o áudio está tocando.
      setProgress(Math.floor(audioRef.current.currentTime)) // retorna o tempo atual do player.
    }) 
  }

  function handleSeek(amount: number) { // recebe o parâmetro a duração na hora que arrastou o slide do tempo
    audioRef.current.currentTime = amount // mostra a duração onde arrastou o slide nos números do tempo
    setProgress(amount) // mantém na variável progresso o tanto que percorreu o slide.
  }

  function handleEpisodeEnded() {
    if(hasNext) {
      playNext()
    } else {
      clearPlayerState() // limpa o estado se não tiver episódio.
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong> {/* {episode?.title} -> episode? -> verifica se tem algum valor no episode para daí então mostrar o valor do title. */}
      </header>

      { episode ? (
        <div className={styles.currentEpisode}>
          <Image width={592} height={592} src={episode.thumbnail} objectFit="cover" />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um podcast para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={episode.duration}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361' }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
        </div>

        {episode && ( // "episode &&" pega a resposta do "if" e "episode ||" pega a resposta do "else".
          <audio
            src={episode.url}
            ref={audioRef} // todo elemento HTML recebe esse atributo ref, então pode usar sem problema.
            loop={isLooping}
            autoPlay // pega o audio e já toca
            onEnded={handleEpisodeEnded} // quando o áudio chega no final, ele executa a função
            onPlay={() => setPlayingState(true)}
            onPause={() => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener} // dispara assim que o player conseguiu carregar os dados do episodio.
          />
        )}

        <div className={styles.buttons}>
          <button
            type="button"
            disabled={!episode || episodeList.length === 1} // caso a lista de episódios só tenha 1
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button>
          <button type="button" disabled={!episode || !hasPrevious} onClick={playPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying
              ? <img src="/pause.svg" alt="pausar" />
              : <img src="/play.svg" alt="Tocar" />
            }
          </button>
          <button type="button" disabled={!episode || !hasNext} onClick={playNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button>
        </div>
      </footer>

    </div>
  )
}