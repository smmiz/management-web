// Archivo: pages/index.js

import fs from 'fs';
import path from 'path';
import Head from 'next/head';
import ModelCard from '@/components/ModelCard';
import styles from '@/styles/Home.module.css';

export default function HomePage({ models }) {
  return (
    <>
      <Head>
        <title>Modelos | Agencia</title>
        <meta name="description" content="Nuestra lista de modelos profesionales." />
      </Head>
      
      <h1 className={styles.title}>Nuestros Modelos</h1>

      <div className={styles.gridContainer}>
        {/* MODIFICACIÓN: Pasamos el 'index' al componente ModelCard */}
        {models.map((model, index) => (
          <ModelCard key={model.slug} model={model} index={index} />
        ))}
      </div>
    </>
  );
}

// La función getStaticProps se mantiene igual
export async function getStaticProps() {
  const filePath = path.join(process.cwd(), 'public/data/models.json');
  try {
    const jsonData = fs.readFileSync(filePath);
    const models = JSON.parse(jsonData);

    // Solo pasamos los modelos que tienen una imagen de portada
    const filteredModels = models.filter(model => model.coverImageUrl);

    return {
      props: {
        models: filteredModels,
      },
    };
  } catch (error) {
    console.error("No se pudo leer el archivo models.json. Asegúrate de ejecutar 'npm run build:data' primero.", error);
    return {
        props: {
            models: []
        }
    }
  }
}
