// Archivo: pages/models/[slug].js

import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import Image from 'next/image';
import PortfolioGallery from '@/components/PortfolioGallery';
import styles from '@/styles/ModelProfile.module.css';

export default function ModelProfile({ model }) {
  if (!model) {
    return <div>Modelo no encontrado.</div>;
  }
  
  const { name, lastName, nationality, height, bust, waist, hips, chest, shoeSize, hairColor, eyeColor, instagram, tiktok, portfolioImageUrls, coverImageUrl } = model;

  return (
    <>
      <Head>
        <title>{name} {lastName} | Perfil de Modelo</title>
        <meta name="description" content={`Portafolio y medidas de ${name} ${lastName}.`} />
      </Head>

      <div className={styles.profileContainer}>
        <div className={styles.mainInfo}>
            <div className={styles.coverImageWrapper}>
                <Image
                    src={coverImageUrl}
                    alt={`Foto de ${name} ${lastName}`}
                    fill
                    style={{ objectFit: 'cover' }}
                    // MODIFICACIÓN: Nos aseguramos de que la propiedad 'priority' esté aquí
                    // para cargar la imagen principal del perfil de inmediato.
                    priority
                />
            </div>
            <div className={styles.details}>
                <h1 className={styles.name}>{name} {lastName}</h1>
                <p className={styles.nationality}>{nationality}</p>
                <h2 className={styles.sectionTitle}>Medidas</h2>
                <div className={styles.measurementsGrid}>
                    <span>Estatura</span> <span>{height} cm</span>
                    {chest && <><span>Pecho</span> <span>{chest} cm</span></>}
                    {bust && <><span>Busto</span> <span>{bust} cm</span></>}
                    <span>Cintura</span> <span>{waist} cm</span>
                    {hips && <><span>Cadera</span> <span>{hips} cm</span></>}
                    <span>Calzado</span> <span>{shoeSize}</span>
                    <span>Color de Cabello</span> <span>{hairColor}</span>
                    <span>Color de Ojos</span> <span>{eyeColor}</span>
                </div>
                <h2 className={styles.sectionTitle}>Redes Sociales</h2>
                <div className={styles.socialLinks}>
                    {instagram && <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer">Instagram</a>}
                    {tiktok && <a href={`https://tiktok.com/@${tiktok}`} target="_blank" rel="noopener noreferrer">TikTok</a>}
                </div>
            </div>
        </div>

        <div className={styles.portfolioSection}>
            <h2 className={styles.sectionTitle}>Portafolio</h2>
            <PortfolioGallery imageUrls={portfolioImageUrls} />
        </div>
      </div>
    </>
  );
}


// Las funciones getStaticPaths y getStaticProps se mantienen igual
export async function getStaticPaths() {
  const filePath = path.join(process.cwd(), 'public/data/models.json');
  const jsonData = fs.readFileSync(filePath);
  const models = JSON.parse(jsonData);

  const paths = models.map((model) => ({
    params: { slug: model.slug },
  }));

  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const { slug } = params;
  const filePath = path.join(process.cwd(), 'public/data/models.json');
  const jsonData = fs.readFileSync(filePath);
  const models = JSON.parse(jsonData);

  const model = models.find((m) => m.slug === slug) || null;

  return {
    props: {
      model,
    },
  };
}
