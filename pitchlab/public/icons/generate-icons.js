// Run with: node generate-icons.js
const { createCanvas } = require('canvas');
const fs = require('fs');

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const c = canvas.getContext('2d');
  const s = size;

  // Background
  c.fillStyle = '#060810';
  c.fillRect(0, 0, s, s);

  // Outer ring
  c.strokeStyle = '#00e5ff';
  c.lineWidth = s * 0.04;
  c.beginPath();
  c.arc(s/2, s/2, s * 0.42, 0, Math.PI * 2);
  c.stroke();

  // Strike zone box
  const zx = s * 0.28, zy = s * 0.22, zw = s * 0.44, zh = s * 0.5;
  c.strokeStyle = '#1e3a5f';
  c.lineWidth = s * 0.025;
  c.strokeRect(zx, zy, zw, zh);

  // Grid lines
  c.strokeStyle = '#1a2a3a';
  c.lineWidth = s * 0.015;
  [1,2].forEach(i => {
    c.beginPath(); c.moveTo(zx + (zw/3)*i, zy); c.lineTo(zx + (zw/3)*i, zy+zh); c.stroke();
    c.beginPath(); c.moveTo(zx, zy + (zh/3)*i); c.lineTo(zx+zw, zy + (zh/3)*i); c.stroke();
  });

  // Pitch dot — cyan strike
  c.fillStyle = '#00e5ffcc';
  c.beginPath();
  c.arc(s * 0.5, s * 0.52, s * 0.08, 0, Math.PI * 2);
  c.fill();
  c.strokeStyle = '#00e5ff';
  c.lineWidth = s * 0.015;
  c.stroke();

  // PITCHLAB text
  c.fillStyle = '#00e5ff';
  c.font = `bold ${s * 0.1}px monospace`;
  c.textAlign = 'center';
  c.fillText('PITCH', s/2 - s*0.07, s * 0.88);
  c.fillStyle = '#c8d8f0';
  c.fillText('LAB', s/2 + s*0.14, s * 0.88);

  return canvas.toBuffer('image/png');
}

try {
  [192, 512].forEach(size => {
    fs.writeFileSync(`icon-${size}.png`, drawIcon(size));
    console.log(`Created icon-${size}.png`);
  });
} catch(e) {
  console.log('canvas module not available, using SVG fallback');
}
