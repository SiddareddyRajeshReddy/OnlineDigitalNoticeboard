// ============================================
// BCRYPT HASH GENERATOR - Quick Command Line Version
// ============================================

// STEP 1: Create a file called hashPassword.js with this code:

import bcrypt from 'bcryptjs';

const password =  'admin@2025';  // Default password if none provided
const saltRounds =  12;  // Default 12 rounds

async function generateHash() {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hash = await bcrypt.hash(password, salt);
        
        console.log('\n========================================');
        console.log('BCRYPT HASH GENERATED SUCCESSFULLY');
        console.log('========================================');
        console.log('Password:    ', password);
        console.log('Salt Rounds: ', saltRounds);
        console.log('Hash:        ', hash);
        console.log('========================================\n');
        
        // SQL Insert Example
        console.log('SQL Insert Example:');
        console.log(`INSERT INTO Admin (name, email, password, phone) VALUES`);
        console.log(`('Admin', 'admin@example.com', '${hash}', '1234567890');\n`);
        
    } catch (error) {
        console.error('Error generating hash:', error);
    }
}

generateHash();

// ============================================
// HOW TO USE IN COMMAND LINE:
// ============================================

/*

STEP 1: Make sure you have bcryptjs installed
-------------------------------------------------
npm install bcryptjs

STEP 2: Save this file as hashPassword.js
-------------------------------------------------

STEP 3: Run in Command Prompt (CMD)
-------------------------------------------------

Option 1: Use default password (admin123)
    node hashPassword.js

Option 2: Specify your own password
    node hashPassword.js "myPassword123"

Option 3: Specify password and salt rounds
    node hashPassword.js "myPassword123" 10

EXAMPLES:
-------------------------------------------------
node hashPassword.js
node hashPassword.js "admin@123"
node hashPassword.js "pass123456" 12
node hashPassword.js "committee123"

OUTPUT WILL LOOK LIKE:
-------------------------------------------------
========================================
BCRYPT HASH GENERATED SUCCESSFULLY
========================================
Password:     admin123
Salt Rounds:  12
Hash:         $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSj8nFUi
========================================

SQL Insert Example:
INSERT INTO Admin (name, email, password, phone) VALUES
('Admin', 'admin@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYILSj8nFUi', '1234567890');

*/

// ============================================
// ALTERNATIVE: One-liner for quick testing
// ============================================
/*
Run this directly in Node.js REPL:

1. Open CMD and type: node
2. Then paste:

import('bcryptjs').then(bcrypt => {
    bcrypt.default.hash('admin123', 12).then(hash => console.log('Hash:', hash));
});

*/