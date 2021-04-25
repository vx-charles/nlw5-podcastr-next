import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router'
import Image from 'next/image'
import Head from 'next/head'
import Link from 'next/link'

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss'
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
}

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
  const router = useRouter(); // pega o slug após o episode/

  if (router.isFallback) { // quando a página está em carregamento, é um valor booleano.
    return <p>Carregando...</p>
  }

  const { play } = usePlayer()

  return (
    <div className={styles.episode}>

      <Head>
        <title>{episode.title} | Podcastr</title>
      </Head>


      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }} // converte em HTML caso tenha algum script
      />
    </div>

  )
}

export const getStaticPaths: GetStaticPaths = async () => { // gera de forma estática no momento da build as páginas
  const { data } = await api.get('episodes', {
    params: {
      _limit: 2,
      _sort: 'published_at',
      _order: 'desc'
    }
  })

  const paths = data.map(episode => {
    return {
      params: {
        slug: episode.id
      }
    }
  })

  return {
    paths,
    fallback: 'blocking', // fallback - determina o comportamento de quando uma pessoa acessa a página que não foi gerado estaticamente. fallback: false - retorna na página 404. fallback: true - faz a requisição da chamada API pelo lado do cliente, no browser. fallback: blocking - roda requisição no node.js, só vai navegar na página quando os dados tiverem sido carregados.
  }
  // Incremental static regeneration - gerar novas páginas conforme as pessoas vão acessando e regerar páginas obsoletar com o revalidate.
}

export const getStaticProps: GetStaticProps = async (ctx) => { // método que executa pelo lado do client.
  const { slug } = ctx.params // slug é o mesmo nome do arquivo que está lá dentro de pages do next.js
  console.log(slug)
  const { data } = await api.get(`/episodes/${slug}`)

  const episode = {
    id: data.id,
    title: data.title,
    description: data.description,
    thumbnail: data.thumbnail,
    members: data.members,
    publishedAt: format(parseISO(data.published_at), 'd MMM yy', { locale: ptBR }),
    duration: Number(data.file.duration),
    durationAsString: convertDurationToTimeString(Number(data.file.duration)),
    url: data.file.url,
  }

  return {
    props: {
      episode
    },
    revalidate: 60 * 60 * 24, // 24 horas
  }
}