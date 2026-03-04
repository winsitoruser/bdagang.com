const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.js') && f !== 'index.js');

for (const file of files) {
    const filePath = path.join(modelsDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    let changed = false;

    // Replace INTEGER with UUID for model: 'users'
    const regex = /type:\s*DataTypes\.INTEGER,\s*([^\}]*?references:\s*{\s*model:\s*'users',\s*key:\s*'id')/gs;
    if (regex.test(content)) {
        content = content.replace(regex, "type: DataTypes.UUID,\n      $1");
        changed = true;
    }

    const regex2 = /type:\s*DataTypes\.INTEGER([^}]*?model:\s*'users',\s*key:\s*'id')/gs;
    if (regex2.test(content)) {
        content = content.replace(regex2, "type: DataTypes.UUID$1");
        changed = true;
    }

    const regex3 = /references:\s*{\s*model:\s*'users',\s*key:\s*'id'\s*}[^}]*?type:\s*DataTypes\.INTEGER/gs;
    if (regex3.test(content)) {
        content = content.replace(regex3, function (match) {
            return match.replace("DataTypes.INTEGER", "DataTypes.UUID");
        });
        changed = true;
    }

    // Custom case: `DataTypes.INTEGER` with `model: 'Users'` (capital U) or other variations
    const regex4 = /type:\s*DataTypes\.INTEGER,([^\}]*?model:\s*(?:'|")users(?:'|"))/ig;
    if (regex4.test(content)) {
        content = content.replace(regex4, "type: DataTypes.UUID,$1");
        changed = true;
    }

    // And some might only be `ownerId` or `managerId` etc without references: block directly if associations are defined outside
    // Let's do a more robust approach: Find all columns referencing Users
    // In `Branch.js: managerId: { type: DataTypes.INTEGER }
    // To avoid breaking anything unrelated, we will rely on our replacements and run the generate-migration. 

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}

// Special cases that might not use explicitly inline `references:` block
// (some models define in `associate` but inline type INTEGER.
// e.g. Branch.managerId, Store.ownerId
const specificReplacements = [
    { file: 'Branch.js', find: /managerId:\s*{\s*type:\s*DataTypes\.INTEGER/gs, replace: "managerId: {\n    type: DataTypes.UUID" },
    { file: 'Store.js', find: /ownerId:\s*{\s*type:\s*DataTypes\.INTEGER/gs, replace: "ownerId: {\n    type: DataTypes.UUID" }
];

for (const s of specificReplacements) {
    const p = path.join(modelsDir, s.file);
    if (fs.existsSync(p)) {
        let c = fs.readFileSync(p, 'utf8');
        if (s.find.test(c)) {
            c = c.replace(s.find, s.replace);
            fs.writeFileSync(p, c, 'utf8');
            console.log(`Updated implicit column in ${s.file}`);
        }
    }
}
