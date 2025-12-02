// Script para gerar ícones básicos do Tauri
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');

// Garantir que o diretório existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('📦 Gerando ícones placeholder para Tauri...\n');

// Criar PNG mínimo válido (1x1 azul) - apenas para compilar
// Este é um PNG válido de 1x1 pixel
const minimalPNG = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
  0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
  0x49, 0x48, 0x44, 0x52, // "IHDR"
  0x00, 0x00, 0x00, 0x01, // Width: 1
  0x00, 0x00, 0x00, 0x01, // Height: 1
  0x08, 0x02, 0x00, 0x00, 0x00, // bit depth, color type, compression, filter, interlace
  0x90, 0x77, 0x53, 0xDE, // CRC
  0x00, 0x00, 0x00, 0x0C, // IDAT chunk length
  0x49, 0x44, 0x41, 0x54, // "IDAT"
  0x08, 0x99, 0x63, 0x60, 0x60, 0xF8, 0x0F, 0x00, 0x00, 0x01, 0x00, 0x01, // Compressed data (azul)
  0x9D, 0xB1, 0x2E, 0x44, // CRC
  0x00, 0x00, 0x00, 0x00, // IEND chunk length
  0x49, 0x45, 0x4E, 0x44, // "IEND"
  0xAE, 0x42, 0x60, 0x82  // CRC
]);

// Arquivos necessários
const files = [
  '32x32.png',
  '128x128.png',
  '128x128@2x.png',
  'icon.ico',
  'icon.icns'
];

files.forEach(filename => {
  fs.writeFileSync(path.join(iconsDir, filename), minimalPNG);
  console.log(`✅ Criado: ${filename}`);
});

console.log('\n🎉 Ícones placeholder gerados com sucesso!');
console.log('⚠️  Estes são ícones temporários mínimos.');
console.log('📝 Para ícones personalizados reais, use:');
console.log('   npm run tauri icon caminho/para/seu-icone.png');
console.log('\n💡 Requisitos do ícone:');
console.log('   - Formato: PNG');
console.log('   - Tamanho recomendado: 1024x1024 ou maior');
console.log('   - Fundo transparente (opcional mas recomendado)');

