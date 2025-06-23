// Archivo: components/ModelCard.js

import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

// MODIFICACIÓN: Aceptamos 'index' como prop
const ModelCard = ({ model, index }) => {
  return (
    <Link href={`/models/${model.slug}`} className={styles.card}>
      <div className={styles.cardImageWrapper}>
        <Image
          src={model.coverImageUrl}
          alt={`Foto de portada de ${model.name} ${model.lastName}`}
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          // AÑADIDO: Damos prioridad a las primeras 4 imágenes de la galería.
          // Esto las cargará inmediatamente en lugar de esperar al scroll.
          priority={index < 4}
        />
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{model.name} {model.lastName}</h3>
      </div>
    </Link>
  );
};

export default ModelCard;
