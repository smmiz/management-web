// scripts/build-data.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('xlsx');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Configuración ---
const GITHUB_EXCEL_URL = process.env.GITHUB_EXCEL_URL;
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/models.json');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- Funciones de Ayuda ---

/**
 * Inserta parámetros de optimización en una URL de Cloudinary.
 * @param {string} url - La URL original de Cloudinary.
 * @returns {string} - La nueva URL con optimizaciones.
 */
function getOptimizedCloudinaryUrl(url) {
    if (!url) return null;
    // Parámetros:
    // w_1000: Ancho máximo de 1000px
    // q_auto: Calidad automática
    // f_auto: Formato automático (servirá WebP a navegadores compatibles)
    const optimizationParams = 'w_1000,q_auto,f_auto';
    return url.replace('/upload/', `/upload/${optimizationParams}/`);
}


function processSheet(sheet, gender) {
  const jsonData = xlsx.utils.sheet_to_json(sheet);
  
  return jsonData.map(row => {
    const modelData = {
      gender: gender,
      name: row['Nombre'],
      lastName: row['Apellido'],
      nationality: row['Nacionalidad'],
      instagram: row['Instagram'],
      tiktok: row['TikTok'],
      slug: row['slug'],
      hairColor: row['Color de Cabello'],
      eyeColor: row['Color de Ojos'],
      height: row['Estatura'],
      shoeSize: row['Talla de Zapato'],
    };

    if (gender === 'woman') {
      modelData.bust = row['Busto'];
      modelData.waist = row['Cintura'];
      modelData.hips = row['Cadera'];
    } else {
      modelData.chest = row['Pecho'];
      modelData.waist = row['Cintura'];
    }
    
    return modelData;
  });
}

async function getCloudinaryImages(slug) {
  try {
    const coverResult = await cloudinary.search
      .expression(`folder:models/${slug}/cover`)
      .sort_by('public_id', 'desc')
      .max_results(1)
      .execute();

    // MODIFICACIÓN: Optimizamos la URL de la portada
    const coverUrl = getOptimizedCloudinaryUrl(coverResult.resources[0]?.secure_url);

    const portfolioResult = await cloudinary.search
      .expression(`folder:models/${slug}/portfolio`)
      .sort_by('public_id', 'asc')
      .max_results(50)
      .execute();

    // MODIFICACIÓN: Optimizamos cada URL del portafolio
    const portfolioUrls = portfolioResult.resources.map(res => getOptimizedCloudinaryUrl(res.secure_url));

    return { coverUrl, portfolioUrls };
  } catch (error) {
    console.error(`Error fetching images for slug ${slug}:`, error.message);
    return { coverUrl: null, portfolioUrls: [] };
  }
}


// --- Lógica Principal ---

async function buildData() {
  console.log('--- Iniciando la construcción de datos de modelos ---');

  if (!GITHUB_EXCEL_URL) {
    console.error('Error: La variable de entorno GITHUB_EXCEL_URL no está definida.');
    process.exit(1);
  }

  try {
    console.log('1/4 - Descargando archivo Excel desde GitHub...');
    const response = await axios.get(GITHUB_EXCEL_URL, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(response.data, { type: 'buffer' });

    console.log('2/4 - Procesando hojas de Excel...');
    const womenSheet = workbook.Sheets['Mujeres'];
    const menSheet = workbook.Sheets['Hombres'];
    
    if (!womenSheet || !menSheet) {
      throw new Error("El archivo Excel debe contener las hojas 'Mujeres' y 'Hombres'");
    }

    const womenData = processSheet(womenSheet, 'woman');
    const menData = processSheet(menSheet, 'man');
    let allModels = [...womenData, ...menData];

    console.log('3/4 - Obteniendo y optimizando URLs de imágenes desde Cloudinary...');
    const enrichedModels = [];
    for (const model of allModels) {
      if (!model.slug) {
        console.warn(`Saltando modelo sin slug: ${model.name}`);
        continue;
      }
      console.log(`      -> Procesando slug: ${model.slug}`);
      const { coverUrl, portfolioUrls } = await getCloudinaryImages(model.slug);
      enrichedModels.push({
        ...model,
        coverImageUrl: coverUrl,
        portfolioImageUrls: portfolioUrls,
      });
    }

    console.log('4/4 - Guardando datos en public/data/models.json...');
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(enrichedModels, null, 2));

    console.log('--- ¡Éxito! El archivo models.json ha sido generado. ---');

  } catch (error) {
    console.error('--- ¡Error durante la construcción de datos! ---');
    console.error(error.message);
    process.exit(1);
  }
}

buildData();
