const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // 1. Change internal integer PKs to UUID
    const pkRegex = /([a-zA-Z_0-9]+):\s*{\s*([^}]*?)type:\s*DataTypes\.INTEGER([^}]*?)primaryKey:\s*true/gs;
    if (pkRegex.test(content)) {
        content = content.replace(pkRegex, (match, fieldName, beforeType, afterType) => {
            // Remove autoIncrement
            let cleanAfterType = afterType.replace(/autoIncrement:\s*true,?\s*/g, '');
            let cleanBeforeType = beforeType.replace(/autoIncrement:\s*true,?\s*/g, '');
            return `${fieldName}: {
${cleanBeforeType}type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,${cleanAfterType}primaryKey: true`;
        });
        changed = true;
    }

    // Handle cases where primaryKey is before type
    const pkRegex2 = /([a-zA-Z_0-9]+):\s*{\s*([^}]*?)primaryKey:\s*true([^}]*?)type:\s*DataTypes\.INTEGER/gs;
    if (pkRegex2.test(content)) {
        content = content.replace(pkRegex2, (match, fieldName, beforePk, afterPk) => {
            let cleanBeforePk = beforePk.replace(/autoIncrement:\s*true,?\s*/g, '');
            let cleanAfterPk = afterPk.replace(/autoIncrement:\s*true,?\s*/g, '');
            return `${fieldName}: {
${cleanBeforePk}primaryKey: true${cleanAfterPk}type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4`;
        });
        changed = true;
    }

    // 2. Change references to UUID
    const refRegex = /type:\s*DataTypes\.INTEGER([^}]*?references:\s*{)/isg;
    if (refRegex.test(content)) {
        content = content.replace(refRegex, "type: DataTypes.UUID$1");
        changed = true;
    }
    const refRegex2 = /references:\s*{[^}]*?}[^}]*?type:\s*DataTypes\.INTEGER/isg;
    if (refRegex2.test(content)) {
        content = content.replace(refRegex2, (match) => match.replace("DataTypes.INTEGER", "DataTypes.UUID"));
        changed = true;
    }

    // 3. Change any field ending in Id or _id that is INTEGER to UUID
    const idColRegex = /([a-zA-Z0-9]+[I_]d):\s*{\s*([^}]*?)type:\s*DataTypes\.INTEGER/gs;
    if (idColRegex.test(content)) {
        content = content.replace(idColRegex, "$1: {\n$2type: DataTypes.UUID");
        changed = true;
    }

    // Clean up any remaining autoIncrement near UUIDs just in case
    const autoIncRegex = /(type:\s*DataTypes\.UUID(?:V4)?[\s\S]{0,100}?)autoIncrement:\s*true,?/g;
    if (autoIncRegex.test(content)) {
        content = content.replace(autoIncRegex, "$1");
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated all IDs/FKs to UUID in ${file}`);
    }
}
