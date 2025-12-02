// Script para gerar ícones básicos do Tauri
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, 'src-tauri', 'icons');

// Garantir que o diretório existe
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Criar ícones PNG básicos (placeholders)
const sizes = [32, 128, 256, 512];

sizes.forEach(size => {
  const canvas = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#3b82f6"/>
  <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.4}" fill="white" text-anchor="middle" dy=".3em" font-weight="bold">JMS</text>
</svg>`;
  
  const filename = size === 128 ? '128x128.png' : `${size}x${size}.png`;
  fs.writeFileSync(path.join(iconsDir, filename), canvas);
  console.log(`✅ Criado: ${filename}`);
});

// Criar 128x128@2x
fs.copyFileSync(
  path.join(iconsDir, '256x256.png'),
  path.join(iconsDir, '128x128@2x.png')
);
console.log('✅ Criado: 128x128@2x.png');

// Criar icon.ico (cópia do 32x32)
fs.copyFileSync(
  path.join(iconsDir, '32x32.png'),
  path.join(iconsDir, 'icon.ico')
);
console.log('✅ Criado: icon.ico');

// Criar icon.icns (cópia do 128x128)
fs.copyFileSync(
  path.join(iconsDir, '128x128.png'),
  path.join(iconsDir, 'icon.icns')
);
console.log('✅ Criado: icon.icns');

console.log('\n🎉 Ícones placeholder gerados com sucesso!');
console.log('📝 Para ícones personalizados, use: npm run tauri icon seu-icone.png');

