const fs = require('fs');
const path = require('path');

const targetDirs = [
    'web/app/(admin)',
    'web/app/(owner)',
    'web/app/(tenant)'
];

const textReplacements = [
    { search: /Student Hub/g, replace: 'Student Overview' },
    { search: /Identity Hub/g, replace: 'Your Profile' },
    { search: /Operational Hub/g, replace: 'Quick Links' },
    { search: /Live Activity Matrix/g, replace: 'Recent Activity' },
    { search: /Security Node Card/g, replace: 'Safety Information' },
    { search: /System Governance Panel/g, replace: 'Manage Platform' },
    { search: /Archive Hub/g, replace: 'Home' },
    { search: /Asset Network Hub/g, replace: 'Hostels Network' },
    { search: /System Control Node/g, replace: 'Admin Dashboard' }
];

const tailwindReplacements = [
    { search: /\bbg-white\b(?! dark:bg-gray-900)/g, replace: 'bg-white dark:bg-gray-900' },
    { search: /\bbg-gray-50\b(?! dark:bg-gray-950)/g, replace: 'bg-gray-50 dark:bg-gray-950' },
    { search: /\btext-gray-900\b(?! dark:text-white)/g, replace: 'text-gray-900 dark:text-white' },
    { search: /\btext-gray-500\b(?! dark:text-gray-400)/g, replace: 'text-gray-500 dark:text-gray-400' },
    { search: /\btext-gray-400\b(?! dark:text-gray-500)/g, replace: 'text-gray-400 dark:text-gray-500' },
    { search: /\border-gray-100\b(?! dark:border-gray-800)/g, replace: 'border-gray-100 dark:border-gray-800' },
    { search: /\border-gray-200\b(?! dark:border-gray-800)/g, replace: 'border-gray-200 dark:border-gray-800' }
];

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            for (const { search, replace } of textReplacements) {
                if (content.match(search)) {
                    content = content.replace(search, replace);
                    modified = true;
                }
            }

            for (const { search, replace } of tailwindReplacements) {
                if (content.match(search)) {
                    content = content.replace(search, replace);
                    modified = true;
                }
            }

            if (modified) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

for (const dir of targetDirs) {
    const fullDirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(fullDirPath)) {
        processDirectory(fullDirPath);
    }
}

console.log('Refactor complete.');
