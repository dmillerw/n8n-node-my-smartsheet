import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class SmartsheetApi implements ICredentialType {
	name = 'smartsheetApi';
	displayName = 'Smartsheet API';
	documentationUrl = 'https://smartsheet.redoc.ly/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		}
	];

	// This allows the credential to be used by other parts of n8n
	// stating how this credential is injected as part of the request
	// An example is the Http Request node that can make generic calls
	// reusing this credential
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '={{"Bearer " + $credentials.apiKey}}',
			},
		},
	};

	// The block below tells how this credential can be tested
	test: ICredentialTestRequest = {
		request: {
			url: 'https://api.smartsheet.com/2.0/sheets',
			method: 'GET',
			headers: {
				Authorization: 'Bearer {{$credentials.apiKey}}',
				'Content-Type': 'application/json',
			},
			json: true,
		},
	};
}
