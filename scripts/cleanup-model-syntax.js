const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix double commas
    if (content.includes(',,')) {
        content = content.replace(/,,/g, ',');
        changed = true;
    }

    // Fix `defaultValue: DataTypes.UUIDV4\n\nprimaryKey:` or similar issues if any
    // Some `autoIncrement: true` might be trailing
    const autoIncLeftovers = /autoIncrement:\s*true,?/g;
    if (content.includes('UUID') && autoIncLeftovers.test(content)) {
        // only remove autoIncrement where it's next to a UUID id column
        // wait, just completely remove all autoIncrement from the files if we are moving away from INTEGER IDs entirely
        // actually let's just do it generally inside id blocks
        const idBlock = /id:\s*{([^}]+)}/g;
        content = content.replace(idBlock, (match, inner) => {
            return `id: {` + inner.replace(/autoIncrement:\s*true,?/g, '') + `}`;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Cleaned up ${file}`);
    }
}
