export default function createIcon(address: string, options: any = {}): string {
  try {
    if (!address || typeof address !== 'string') {
      throw new Error('Invalid address provided');
    }
    
    // Use the address as seed for blockies
    const seed = address.toLowerCase();
    
    // Simple blockies implementation
    const size = options.size || 8;
    const scale = options.scale || 4;
    const color = options.color || '#000000';
    const bgcolor = options.bgcolor || '#FFFFFF';
    
    // Generate a simple pattern based on the address
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash + seed.charCodeAt(i)) & 0xffffffff;
    }
    
    const pattern = [];
    for (let i = 0; i < size * size; i++) {
      hash = ((hash << 13) - hash) & 0xffffffff;
      pattern.push(hash % 2);
    }
    
    // Create SVG with proper encoding
    let svg = `<svg width="${size * scale}" height="${size * scale}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="${size * scale}" height="${size * scale}" fill="${bgcolor}"/>`;
    
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        if (pattern[i * size + j]) {
          svg += `<rect x="${j * scale}" y="${i * scale}" width="${scale}" height="${scale}" fill="${color}"/>`;
        }
      }
    }
    
    svg += '</svg>';
    
    // Use a more robust base64 encoding
    let base64;
    if (typeof btoa !== 'undefined') {
      base64 = btoa(svg);
    } else {
      // Fallback for environments where btoa is not available
      base64 = Buffer.from(svg, 'utf8').toString('base64');
    }
    
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('Error creating Massa identicon:', error);
    // Return a default icon - a simple white square
    const defaultSvg = '<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><rect width="32" height="32" fill="#FFFFFF"/></svg>';
    let defaultBase64;
    if (typeof btoa !== 'undefined') {
      defaultBase64 = btoa(defaultSvg);
    } else {
      defaultBase64 = Buffer.from(defaultSvg, 'utf8').toString('base64');
    }
    return `data:image/svg+xml;base64,${defaultBase64}`;
  }
} 