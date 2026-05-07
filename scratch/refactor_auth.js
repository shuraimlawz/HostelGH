const fs = require('fs');
const path = require('path');

const targetDirs = [
    'web/app/(public)/auth',
    'web/components/auth'
];

const textReplacements = [
    // Reset Password / General auth errors
    { search: /PROTOCOL ERROR: PASSWORDS MISMATCH/g, replace: 'Passwords do not match' },
    { search: /SECURITY BREACH: PASSWORD LENGTH < 8/g, replace: 'Password must be at least 8 characters' },
    { search: /Credential Registry Updated/g, replace: 'Password successfully updated' },
    { search: /TRANSMISSION ERROR: EXPIRED TOKEN/g, replace: 'Invalid or expired token' },
    { search: /Registry Update Failed/g, replace: 'Failed to update password' },
    { search: /Security Gateway/g, replace: 'Authentication' },
    { search: /Credential Reset/g, replace: 'Reset Password' },
    { search: /Establishing a new secure baseline for your identity session./g, replace: 'Please enter your new password below.' },
    { search: /Registry Synchronized/g, replace: 'Password Updated' },
    { search: /Your access credentials have been successfully re-encrypted./g, replace: 'Your password has been successfully reset. You can now log in.' },
    { search: /Proceed to Terminal/g, replace: 'Return to Login' },
    { search: /New Passkey/g, replace: 'New Password' },
    { search: /Verify Passkey/g, replace: 'Confirm Password' },
    { search: /UPDATING REGISTRY\.\.\./g, replace: 'UPDATING...' },
    { search: /Establish Access/g, replace: 'Reset Password' },
    { search: /HUB OVERVIEW/g, replace: 'BACK TO HOME' },
    { search: /ACCESSING VAULT\.\.\./g, replace: 'LOADING...' },

    // Login / Register / Forgot Password forms
    { search: /Identity Uplink/g, replace: 'Sign In' },
    { search: /Passkey/g, replace: 'Password' },
    { search: /Authentication/g, replace: 'Login' },
    { search: /Transmit Recovery Request/g, replace: 'Send Recovery Email' },
    { search: /A recovery protocol has been dispatched to your designated terminal./g, replace: 'A password reset link has been sent to your email.' },
    { search: /Account Recovery Protocol/g, replace: 'Forgot Password' },
    { search: /Re-establish terminal access to your assets./g, replace: 'Enter your email to receive a password reset link.' },
    { search: /Recovery Request Successful/g, replace: 'Email Sent' },
    { search: /Return to Gateway/g, replace: 'Back to Login' }
];

const tailwindReplacements = [
    { search: /\bbg-white\b(?! dark:bg-gray-950| dark:bg-gray-900)/g, replace: 'bg-white dark:bg-gray-950' },
    { search: /\bbg-gray-50\b(?! dark:bg-gray-900)/g, replace: 'bg-gray-50 dark:bg-gray-900' },
    { search: /\btext-gray-900\b(?! dark:text-white)/g, replace: 'text-gray-900 dark:text-white' },
    { search: /\btext-gray-500\b(?! dark:text-gray-400)/g, replace: 'text-gray-500 dark:text-gray-400' },
    { search: /\btext-gray-400\b(?! dark:text-gray-500)/g, replace: 'text-gray-400 dark:text-gray-500' },
    { search: /\border-gray-100\b(?! dark:border-gray-800)/g, replace: 'border-gray-100 dark:border-gray-800' },
    { search: /\bshadow-2xl\b(?! dark:shadow-none)/g, replace: 'shadow-2xl dark:shadow-none' }
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

console.log('Auth refactor complete.');
