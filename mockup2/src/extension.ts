import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
	const configPath = path.join(
		vscode.workspace.workspaceFolders
			? vscode.workspace.workspaceFolders[0].uri.fsPath
			: '',
		'openai-config.json'
	);


	if (!fs.existsSync(configPath)) {
		const defaultConfig = { apiKey: '' };
		fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
		vscode.window.showInformationMessage('Created OpenAI config file in the workspace.');
	}

	// Register command to update API key via the config file
	let updateApiKeyCommand = vscode.commands.registerCommand('extension.updateOpenAIKey', async () => {
		const newApiKey = await vscode.window.showInputBox({ prompt: 'Enter your new OpenAI API key' });

		if (newApiKey) {
			let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
			config.apiKey = newApiKey;
			fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
			vscode.window.showInformationMessage('OpenAI API key updated in config file.');
		}
	});

	// Register Inline Completion Provider
	let provider = vscode.languages.registerInlineCompletionItemProvider('*', {
		async provideInlineCompletionItems(document, position, context, token) {
			const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
			const apiKey = config.apiKey;

			console.log("API Key:", apiKey);  // Debugging: Check if the key is being read

			if (!apiKey) {
				vscode.window.showErrorMessage("Please provide your OpenAI API key in the config file.");
				return;
			}

			try {
				// Fetch completion from GPT-4
				const completionText = await getCompletion(document.getText(), apiKey);
				console.log("Completion Text:", completionText);  // Debugging: Check if completion is fetched

				const completionItem = new vscode.InlineCompletionItem(completionText);
				completionItem.range = new vscode.Range(position, position);
				return [completionItem];
			} catch (error) {
				console.error("Error fetching completion:", error);  // Debugging: Check for API errors
				vscode.window.showErrorMessage("Error fetching completion from OpenAI API.");
				return;
			}
		}
	});

	context.subscriptions.push(updateApiKeyCommand, provider);
}

async function getCompletion(text: string, apiKey: string): Promise<string> {
	console.log("Calling OpenAI API...");  // Debugging: Check if API call is triggered
	const response = 'dummy';  // Replace with actual API call in the future

	// check if response is valid



	return response;
}

export function deactivate() { }

