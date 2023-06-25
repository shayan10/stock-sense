import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

const initializePlaidClient = (): PlaidApi => {
    
  const {PLAID_CLIENT_ID, PLAID_CLIENT_SECRET} = process.env;

  if (!PLAID_CLIENT_ID || !PLAID_CLIENT_SECRET) {
    throw new Error("Plaid Credentials undefined");
  }

  const configuration = new Configuration({
      basePath: PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
          'PLAID-SECRET': PLAID_CLIENT_SECRET,
        },
      },
    });
    
  const client = new PlaidApi(configuration);
  return client;
}

export default initializePlaidClient;