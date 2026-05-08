// GitHub Upload Script for Noor Al Imaan Project
// This script helps upload files to GitHub using Node.js and GitHub API

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration - UPDATE THESE VALUES
const GITHUB_TOKEN = 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN';
const REPO_OWNER = 'mahifeysal69-lang';
const REPO_NAME = 'noor-al-imaan';
const BASE_PATH = __dirname;

// Files to upload
const filesToUpload = [
    'standalone.html',
    'database-schema-final.sql',
    'database-schema-fixed.sql',
    'database-schema.sql',
    'supabase_setup.sql',
    'SUPABASE_SETUP.md',
    'server.js',
    'package.json',
    '.gitignore',
    'README.md',
    'GITHUB_SETUP.md'
];

// Function to read file content
function readFileContent(filePath) {
    try {
        return fs.readFileSync(path.join(BASE_PATH, filePath), 'utf8');
    } catch (error) {
        console.error(`Error reading file ${filePath}:`, error.message);
        return null;
    }
}

// Function to create GitHub API request
function makeGitHubRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.github.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'User-Agent': 'NoorAlImaan-Upload-Script',
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    resolve(body);
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Function to get base64 encoded content
function getBase64Content(content) {
    return Buffer.from(content).toString('base64');
}

// Main upload function
async function uploadToGitHub() {
    console.log('🚀 Starting GitHub upload for Noor Al Imaan project...\n');

    // Check if token is provided
    if (GITHUB_TOKEN === 'YOUR_GITHUB_PERSONAL_ACCESS_TOKEN') {
        console.log('❌ ERROR: Please update GITHUB_TOKEN in this script with your GitHub Personal Access Token');
        console.log('📝 Instructions:');
        console.log('1. Go to GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)');
        console.log('2. Generate new token with "repo" permissions');
        console.log('3. Copy the token and update GITHUB_TOKEN variable in this script');
        console.log('4. Run this script again: node upload-to-github.js\n');
        return;
    }

    try {
        // Get repository info
        console.log('📋 Checking repository...');
        const repoInfo = await makeGitHubRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}`);
        
        if (repoInfo.message === 'Not Found') {
            console.log('❌ Repository not found. Please create it first at:');
            console.log(`   https://github.com/new?repository_name=${REPO_NAME}&owner=${REPO_OWNER}`);
            return;
        }

        console.log(`✅ Repository found: ${repoInfo.full_name}\n`);

        // Get current files in repository
        console.log('📁 Getting current repository files...');
        const repoContents = await makeGitHubRequest('GET', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/`);
        
        // Upload each file
        for (const file of filesToUpload) {
            console.log(`📤 Processing: ${file}`);
            
            const content = readFileContent(file);
            if (content === null) {
                console.log(`   ⚠️  Skipping ${file} (file not found)`);
                continue;
            }

            // Check if file already exists
            const existingFile = repoContents.find(item => item.name === file);
            const sha = existingFile ? existingFile.sha : null;

            const fileData = {
                message: `Update ${file}`,
                content: getBase64Content(content),
                branch: 'main'
            };

            if (sha) {
                fileData.sha = sha;
                console.log(`   🔄 Updating existing file...`);
            } else {
                console.log(`   ➕ Creating new file...`);
            }

            try {
                const result = await makeGitHubRequest('PUT', `/repos/${REPO_OWNER}/${REPO_NAME}/contents/${file}`, fileData);
                console.log(`   ✅ ${file} uploaded successfully`);
            } catch (error) {
                console.log(`   ❌ Error uploading ${file}:`, error.message || error);
            }
        }

        console.log('\n🎉 Upload process completed!');
        console.log(`🌐 View your repository: https://github.com/${REPO_OWNER}/${REPO_NAME}`);
        console.log('\n📊 Summary:');
        console.log(`   - Total files processed: ${filesToUpload.length}`);
        console.log(`   - Repository: ${REPO_OWNER}/${REPO_NAME}`);
        console.log('   - Branch: main');

    } catch (error) {
        console.error('❌ Upload failed:', error.message || error);
        
        if (error.message && error.message.includes('401')) {
            console.log('\n🔑 Authentication error. Please check your GitHub token.');
        }
    }
}

// Alternative: Manual upload instructions
function showManualInstructions() {
    console.log('\n📋 MANUAL UPLOAD INSTRUCTIONS');
    console.log('================================');
    console.log('Since automated upload requires a GitHub token, here\'s how to upload manually:\n');
    
    console.log('1️⃣  Go to: https://github.com/mahifeysal69-lang/noor-al-imaan');
    console.log('2️⃣  Click "Add file" → "Upload files"');
    console.log('3️⃣  Drag and drop these files:');
    
    filesToUpload.forEach(file => {
        const exists = fs.existsSync(path.join(BASE_PATH, file));
        const status = exists ? '✅' : '❌';
        console.log(`   ${status} ${file}`);
    });
    
    console.log('\n4️⃣  Add commit message: "Initial commit - Noor Al Imaan Registration System"');
    console.log('5️⃣  Click "Commit changes"');
    console.log('\n📁 Important files:');
    console.log('   • standalone.html - Main registration form');
    console.log('   • database-schema-final.sql - Database schema');
    console.log('   • README.md - Project documentation');
    console.log('   • .gitignore - Git ignore rules');
    console.log('   • server.js - Development server');
}

// Check for command line arguments
const args = process.argv.slice(2);
if (args.includes('--manual')) {
    showManualInstructions();
} else if (args.includes('--help')) {
    console.log('GitHub Upload Script for Noor Al Imaan');
    console.log('');
    console.log('Usage:');
    console.log('  node upload-to-github.js          # Try automated upload');
    console.log('  node upload-to-github.js --manual   # Show manual instructions');
    console.log('  node upload-to-github.js --help    # Show this help');
    console.log('');
    console.log('Requirements for automated upload:');
    console.log('• GitHub Personal Access Token with "repo" permissions');
    console.log('• Update GITHUB_TOKEN variable in this script');
} else {
    uploadToGitHub();
}

module.exports = { uploadToGitHub, showManualInstructions };
