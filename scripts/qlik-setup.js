#!/usr/bin/env node

/**
 * Qlik Setup Script
 * Fetches Assistant ID and Knowledge Base ID from Qlik tenant
 */

const https = require('https');
const url = require('url');

// Configuration from environment
const QLIK_TENANT_URL = 'https://innovoco2.us.qlikcloud.com';
const QLIK_API_KEY = 'eyJhbGciOiJFUzM4NCIsImtpZCI6ImU2NjQzNTM2LTJlNWMtNDZmZi1iYmMyLTcxNThiYjRhYzIwNSIsInR5cCI6IkpXVCJ9.eyJzdWJUeXBlIjoidXNlciIsInRlbmFudElkIjoiSC14WWVUVV96d2hsODRPLVJseUNEb1ZpLTRBUlJoT2siLCJqdGkiOiJlNjY0MzUzNi0yZTVjLTQ2ZmYtYmJjMi03MTU4YmI0YWMyMDUiLCJhdWQiOiJxbGlrLmFwaSIsImlzcyI6InFsaWsuYXBpL2FwaS1rZXlzIiwic3ViIjoiNjhiMGI4MWQ1OTNhY2E1ZWM2MTllOWZiIn0.NGQnAsvgqFIaTyTG1H1pXbTKXndxoOj5KgTU-_qofN5pFo8HabRgFMqmY_G58gJW5nX5UoIJ-Y0z1UOEmUw3BYFXglPel1Yizo6ZSdOycvvjhIOv0r8ddOMvDfur-zkO';

// Helper function to make HTTPS requests
function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(QLIK_TENANT_URL + path);

    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.path,
      method: method,
      headers: {
        'Authorization': `Bearer ${QLIK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonData);
          } else {
            reject(new Error(`API Error (${res.statusCode}): ${JSON.stringify(jsonData)}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function listAssistants() {
  console.log('🔍 Fetching Assistants...\n');
  try {
    const response = await makeRequest('/api/v1/assistants');

    if (response.data && response.data.length > 0) {
      console.log(`Found ${response.data.length} assistant(s):\n`);

      response.data.forEach((assistant, index) => {
        console.log(`Assistant ${index + 1}:`);
        console.log(`  ID: ${assistant.id}`);
        console.log(`  Name: ${assistant.name}`);
        console.log(`  Description: ${assistant.description || 'N/A'}`);
        console.log(`  Created: ${assistant.createdAt}`);
        console.log(`  Updated: ${assistant.updatedAt}`);
        console.log('');
      });

      return response.data;
    } else {
      console.log('No assistants found. You need to create one first.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching assistants:', error.message);
    return [];
  }
}

async function listKnowledgeBases() {
  console.log('📚 Fetching Knowledge Bases...\n');
  try {
    const response = await makeRequest('/api/v1/knowledgebases');

    if (response.data && response.data.length > 0) {
      console.log(`Found ${response.data.length} knowledge base(s):\n`);

      response.data.forEach((kb, index) => {
        console.log(`Knowledge Base ${index + 1}:`);
        console.log(`  ID: ${kb.id}`);
        console.log(`  Name: ${kb.name}`);
        console.log(`  Description: ${kb.description || 'N/A'}`);
        console.log(`  Created: ${kb.createdAt}`);
        console.log(`  Updated: ${kb.updatedAt}`);
        console.log('');
      });

      return response.data;
    } else {
      console.log('No knowledge bases found. You need to create one first.');
      return [];
    }
  } catch (error) {
    console.error('Error fetching knowledge bases:', error.message);
    return [];
  }
}

async function createAssistant(name, description, knowledgeBaseId) {
  console.log('🤖 Creating new assistant...\n');
  try {
    const payload = {
      name: name,
      description: description,
      knowledgebases: knowledgeBaseId ? [knowledgeBaseId] : []
    };

    const response = await makeRequest('/api/v1/assistants', 'POST', payload);

    console.log('Assistant created successfully!');
    console.log(`  ID: ${response.id}`);
    console.log(`  Name: ${response.name}`);
    console.log('');

    return response;
  } catch (error) {
    console.error('Error creating assistant:', error.message);
    return null;
  }
}

async function createKnowledgeBase(name, description) {
  console.log('📖 Creating new knowledge base...\n');
  try {
    const payload = {
      name: name,
      description: description
    };

    const response = await makeRequest('/api/v1/knowledgebases', 'POST', payload);

    console.log('Knowledge base created successfully!');
    console.log(`  ID: ${response.id}`);
    console.log(`  Name: ${response.name}`);
    console.log('');

    return response;
  } catch (error) {
    console.error('Error creating knowledge base:', error.message);
    return null;
  }
}

async function main() {
  console.log('====================================');
  console.log('     Qlik Assistant Setup Tool      ');
  console.log('====================================\n');

  console.log('Tenant URL:', QLIK_TENANT_URL);
  console.log('API Key:', QLIK_API_KEY.substring(0, 50) + '...\n');

  // Step 1: List existing assistants
  const assistants = await listAssistants();

  // Step 2: List existing knowledge bases
  const knowledgeBases = await listKnowledgeBases();

  // Step 3: Create if needed
  let selectedAssistant = null;
  let selectedKnowledgeBase = null;

  if (assistants.length === 0) {
    console.log('📋 No assistants found. Creating default assistant...\n');

    // First create a knowledge base if none exist
    if (knowledgeBases.length === 0) {
      console.log('📋 No knowledge bases found. Creating default knowledge base...\n');
      selectedKnowledgeBase = await createKnowledgeBase(
        'Stellar Insurance Knowledge Base',
        'Knowledge base for insurance policy analysis and claims processing'
      );
    } else {
      selectedKnowledgeBase = knowledgeBases[0];
    }

    // Create assistant with knowledge base
    selectedAssistant = await createAssistant(
      'Stellar Policy Assistant',
      'AI assistant for insurance policy analysis and claims support',
      selectedKnowledgeBase ? selectedKnowledgeBase.id : null
    );
  } else {
    selectedAssistant = assistants[0];
    selectedKnowledgeBase = knowledgeBases[0];
  }

  // Step 4: Output configuration
  console.log('\n====================================');
  console.log('      CONFIGURATION SUMMARY         ');
  console.log('====================================\n');

  if (selectedAssistant) {
    console.log('✅ Assistant Configuration:');
    console.log(`   QLIK_ASSISTANT_ID=${selectedAssistant.id}`);
  }

  if (selectedKnowledgeBase) {
    console.log('✅ Knowledge Base Configuration:');
    console.log(`   QLIK_KNOWLEDGE_BASE_ID=${selectedKnowledgeBase.id}`);
  }

  console.log('\n📝 Update your .env.local file with these values:');
  console.log('');
  console.log('QLIK_TENANT_URL=' + QLIK_TENANT_URL);
  console.log('QLIK_API_KEY=' + QLIK_API_KEY);
  if (selectedAssistant) {
    console.log('QLIK_ASSISTANT_ID=' + selectedAssistant.id);
  }
  if (selectedKnowledgeBase) {
    console.log('QLIK_KNOWLEDGE_BASE_ID=' + selectedKnowledgeBase.id);
  }

  console.log('\n====================================');
  console.log('         Setup Complete!            ');
  console.log('====================================\n');

  // Additional instructions
  if (!selectedKnowledgeBase || (selectedKnowledgeBase && !selectedKnowledgeBase.datasources)) {
    console.log('⚠️  Next Steps:');
    console.log('1. Add data sources to your knowledge base');
    console.log('2. Visit: ' + QLIK_TENANT_URL);
    console.log('3. Navigate to Knowledge Bases > ' + (selectedKnowledgeBase ? selectedKnowledgeBase.name : 'Your KB'));
    console.log('4. Add documents, web pages, or databases as data sources');
    console.log('5. Sync the data sources to index the content');
  }
}

// Run the script
main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});