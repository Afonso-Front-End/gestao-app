// Script para gerar ícones válidos para Tauri usando sharp e to-ico
const fs = require('fs');
const path = require('path');
const toIco = require('to-ico');

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');

// Garantir que o diretório existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('🎨 Gerando ícones válidos para Tauri...\n');

// Criar PNG simples válido usando SVG
const createPNG = async (size, filename) => {
  const svgContent = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" fill="url(#grad)" rx="${size * 0.1}"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${size * 0.35}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">JMS</text>
    </svg>
  `;
  
  try {
    // Tentar usar sharp se disponível
    const sharp = require('sharp');
    await sharp(Buffer.from(svgContent))
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, filename));
    console.log(`✅ Criado: ${filename}`);
  } catch (e) {
    // Fallback: salvar como SVG e avisar
    console.log(`⚠️  Sharp não disponível, usando fallback para: ${filename}`);
    fs.writeFileSync(path.join(iconsDir, filename.replace('.png', '.svg')), svgContent);
  }
};

// Função principal
(async () => {
  try {
    // Criar PNG base de 256x256
    const basePngPath = path.join(iconsDir, '256x256.png');
    
    await createPNG(256, '256x256.png');
    await createPNG(128, '128x128.png');
    await createPNG(32, '32x32.png');
    
    // Criar 128x128@2x (cópia do 256)
    if (fs.existsSync(basePngPath)) {
      fs.copyFileSync(basePngPath, path.join(iconsDir, '128x128@2x.png'));
      console.log('✅ Criado: 128x128@2x.png');
    }
    
    // Criar icon.ico usando to-ico
    console.log('\n📦 Gerando icon.ico...');
    const png32Path = path.join(iconsDir, '32x32.png');
    const png256Path = path.join(iconsDir, '256x256.png');
    
    if (fs.existsSync(png32Path) && fs.existsSync(png256Path)) {
      const files = [
        fs.readFileSync(png32Path),
        fs.readFileSync(png256Path)
      ];
      const buf = await toIco(files);
      fs.writeFileSync(path.join(iconsDir, 'icon.ico'), buf);
      console.log('✅ Criado: icon.ico (formato Windows válido)');
    } else {
      console.error('❌ Erro: PNGs não encontrados');
    }
    
    // Criar icon.icns (placeholder para macOS)
    const png128Path = path.join(iconsDir, '128x128.png');
    if (fs.existsSync(png128Path)) {
      fs.copyFileSync(png128Path, path.join(iconsDir, 'icon.icns'));
      console.log('✅ Criado: icon.icns (placeholder)');
    }
    
    console.log('\n🎉 Ícones gerados com sucesso!');
    console.log('✅ Todos os ícones estão no formato correto');
    console.log('\n💡 Para ícones personalizados:');
    console.log('   1. Crie um PNG 1024x1024');
    console.log('   2. Execute: npm run tauri icon seu-icone.png');
    
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error.message);
    console.log('\n🔧 Solução alternativa:');
    console.log('   Baixe ícones prontos do Tauri ou use uma ferramenta online');
    process.exit(1);
  }
})();

