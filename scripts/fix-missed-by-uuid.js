const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // Change any field ending in By or _by that is INTEGER to UUID
    // Matches: createdBy: { type: DataTypes.INTEGER } or created_by: { ... type: DataTypes.INTEGER }
    const byColRegex = /([a-zA-Z0-9_]+(?:By|_by)):\s*{\s*([^}]*?)type:\s*DataTypes\.INTEGER/gs;
    if (byColRegex.test(content)) {
        content = content.replace(byColRegex, "$1: {\n$2type: DataTypes.UUID");
        changed = true;
    }

    // inline By/_by
    const inlineByRegex = /([a-zA-Z0-9_]+(?:By|_by)):\s*DataTypes\.INTEGER/gs;
    if (inlineByRegex.test(content)) {
        content = content.replace(inlineByRegex, "$1: DataTypes.UUID");
        changed = true;
    }

    // Change explicitly anything else that is INTEGER referencing users / employees / anything else that is UUID
    // Now that we made all PKs UUID, literally every foreign key must be UUID.
    // Is it safe to just convert all references that are currently INTEGER to UUID?
    // Yes, because we converted all primary keys to UUID.
    const allRefRegex = /type:\s*DataTypes\.INTEGER,([^}]+references:\s*{)/g;
    if (allRefRegex.test(content)) {
        content = content.replace(allRefRegex, "type: DataTypes.UUID,$1");
        changed = true;
    }
    const allRefRegex2 = /references:\s*{([^}]+)}[^}]*?type:\s*DataTypes\.INTEGER/g;
    if (allRefRegex2.test(content)) {
        content = content.replace(allRefRegex2, (match) => { return match.replace("DataTypes.INTEGER", "DataTypes.UUID"); });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated missings By/_by or ALL FKs to UUID in ${file}`);
    }
}
