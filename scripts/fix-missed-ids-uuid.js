const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // Change any field ending in Id or _id that is INTEGER to UUID
    // Matches: someId: { type: DataTypes.INTEGER } or some_id: { ... type: DataTypes.INTEGER }
    const idColRegex = /([a-zA-Z0-9_]+(?:Id|_id)):\s*{\s*([^}]*?)type:\s*DataTypes\.INTEGER/gs;
    if (idColRegex.test(content)) {
        content = content.replace(idColRegex, "$1: {\n$2type: DataTypes.UUID");
        changed = true;
    }

    // also find inline types: e.g. some_id: DataTypes.INTEGER
    const inlineRegex = /([a-zA-Z0-9_]+(?:Id|_id)):\s*DataTypes\.INTEGER/gs;
    if (inlineRegex.test(content)) {
        content = content.replace(inlineRegex, "$1: DataTypes.UUID");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated missings IDs/FKs to UUID in ${file}`);
    }
}
