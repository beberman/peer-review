// Load service account credentials and id

const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const Logger = require('firebase-functions/logger');
Logger.debug('environment is: ' + process.env.NODE_ENV);


const secretClient = new SecretManagerServiceClient();

const projectId = process.env.GCLOUD_PROJECT;
Logger.debug('GCP_PROJECT: ' + projectId);

async function getSecret(secretName) {
  try {
    // Access the latest version of the secret
    const [version] = await secretClient.accessSecretVersion({
      name: `projects/${projectId}/secrets/${secretName}/versions/latest`,
    });

    // Convert the payload to a string
    return version.payload.data.toString('utf8');
  } catch (error) {
    Logger.error(`Error fetching secret "${secretName}":`, error.message);
    throw new Error(`Failed to retrieve secret: ${secretName}`);
  }
}


async function getCredentials() {
	
	if (process.env.NODE_ENV === 'development') {
		const fs = require('fs');
		const path = require('path');
		Logger.debug("loading credentials from file");
		const credentials = JSON.parse(
			fs.readFileSync(path.join(__dirname, '../sheets-permission.json')));
		const spreadsheetId = process.env.SPREADSHEET_ID;
		const jwtSecret = process.env.JWT_SECRET;
		return {
			credentials,
			spreadsheetId,
			jwtSecret,
		};
	} else {
		Logger.debug("loading credentials from secret manager");
		const credentials = JSON.parse(await getSecret('GOOGLE_CREDENTIALS'));
		const spreadsheetId = await getSecret('SPREADSHEET_ID');
		const jwtSecret = await getSecret('JWT_SECRET');
		return {
			credentials,
			spreadsheetId,
			jwtSecret,
		};
	}
}


let configVariables ={};
let initializationPromise = null;

async function initializeConfigVariables () {
	if (!initializationPromise) {
		initializationPromise = (async () => {
			const {credentials, spreadsheetId, jwtSecret} = await getCredentials();
			configVariables = {
				credentials,
				spreadsheetId,
				jwtSecret,
			};

			Logger.debug('Credentials: ' + JSON.stringify(configVariables.credentials));
			Logger.debug('spreadsheetId: ' + configVariables.spreadsheetId);
			Logger.debug('jwtSecret: ' + configVariables.jwtSecret);
		})()
		.catch((error) => {
			Logger.error('Error initializing config variables: ' + error.message);
			configVariables = {}
		});
	}
	return initializationPromise;
}
		

function getConfigVariable(variable) {
	if (!configVariables) {
		Logger.error('Config variables not initialized');
		return null;
	}
	if (!configVariables.hasOwnProperty(variable)) {
		Logger.error('Variable not found: ' + variable);
		return null;
	}
	return configVariables[variable];
}
module.exports = {
	initializeConfigVariables,
	getConfigVariable,
};

