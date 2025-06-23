// components/PortfolioGallery.js
import Image from 'next/image';
import styles from '@/styles/ModelProfile.module.css'; // Usamos los estilos del perfil

const PortfolioGallery = ({ imageUrls }) => {
  if (!imageUrls || imageUrls.length === 0) {
    return <p>No hay imágenes en el portafolio.</p>;
  }

  return (
    // Usamos Flexbox para este layout
    <div className={styles.portfolioGrid}>
      {imageUrls.map((url, index) => (
        <div key={index} className={styles.portfolioImageWrapper}>
          <Image
            src={url}
            alt={`Imagen de portafolio ${index + 1}`}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        </div>
      ))}
    </div>
  );
};

export default PortfolioGallery;
