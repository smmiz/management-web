// scripts/build-data.js

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const xlsx = require('xlsx');
const { v2: cloudinary } = require('cloudinary');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// --- Configuración ---
const GITHUB_EXCEL_URL = process.env.GITHUB_EXCEL_URL; // ej: 'https://raw.githubusercontent.com/user/repo/main/models.xlsx'
const DATA_FILE_PATH = path.join(process.cwd(), 'public/data/models.json');

// Configuración de Cloudinary desde variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- Funciones de Ayuda ---

/**
 * Procesa una hoja del archivo Excel y la convierte en un array de objetos.
 * @param {xlsx.WorkSheet} sheet - La hoja de trabajo de la librería xlsx.
 * @param {string} gender - 'woman' o 'man' para procesar campos específicos.
 * @returns {Array<Object>} - Un array con los datos de los modelos.
 */
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
    } else { // man
      modelData.chest = row['Pecho'];
      modelData.waist = row['Cintura'];
    }
    
    return modelData;
  });
}

/**
 * Obtiene las URLs de las imágenes de un modelo desde Cloudinary.
 * @param {string} slug - El identificador único del modelo.
 * @returns {Promise<{coverUrl: string, portfolioUrls: string[]}>}
 */
async function getCloudinaryImages(slug) {
  try {
    // Obtener imagen de portada
    const coverResult = await cloudinary.search
      .expression(`folder:models/${slug}/cover`)
      .sort_by('public_id', 'desc')
      .max_results(1)
      .execute();
    const coverUrl = coverResult.resources[0]?.secure_url || null;

    // Obtener imágenes del portafolio
    const portfolioResult = await cloudinary.search
      .expression(`folder:models/${slug}/portfolio`)
      .sort_by('public_id', 'asc')
      .max_results(50) // Límite de 50 imágenes por portafolio
      .execute();
    const portfolioUrls = portfolioResult.resources.map(res => res.secure_url);

    return { coverUrl, portfolioUrls };
  } catch (error) {
    console.error(`Error fetching images for slug ${slug}:`, error);
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
    // 1. Descargar el archivo Excel desde GitHub
    console.log('1/4 - Descargando archivo Excel desde GitHub...');
    const response = await axios.get(GITHUB_EXCEL_URL, { responseType: 'arraybuffer' });
    const workbook = xlsx.read(response.data, { type: 'buffer' });

    // 2. Procesar las hojas del Excel
    console.log('2/4 - Procesando hojas de Excel...');
    const womenSheet = workbook.Sheets['Mujeres'];
    const menSheet = workbook.Sheets['Hombres'];
    
    if (!womenSheet || !menSheet) {
      throw new Error("El archivo Excel debe contener las hojas 'Mujeres' y 'Hombres'");
    }

    const womenData = processSheet(womenSheet, 'woman');
    const menData = processSheet(menSheet, 'man');
    let allModels = [...womenData, ...menData];

    // 3. Enriquecer los datos con imágenes de Cloudinary
    console.log('3/4 - Obteniendo URLs de imágenes desde Cloudinary...');
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

    // 4. Guardar los datos combinados en un archivo JSON
    console.log('4/4 - Guardando datos en public/data/models.json...');
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(enrichedModels, null, 2));

    console.log('--- ¡Éxito! El archivo models.json ha sido generado. ---');

  } catch (error) {
    console.error('--- ¡Error durante la construcción de datos! ---');
    console.error(error.message);
    process.exit(1); // Termina el proceso con un código de error
  }
}

buildData();
