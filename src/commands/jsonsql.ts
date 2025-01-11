import fs from 'fs';
import { toSQL } from '../core/jsontosql';
import { JsonToSQL } from '../core/ai';
import { loadConfig } from '../config/loadConfig';

export async function handleJsonsqlCommand(options: { file?: string, out?: string, args: string[] }): Promise<void> {
  // Get the file path: prioritize the --file parameter, if not present use the last argument in the command line
  let jsonFilePath = options.file || options.args[options.args.length - 1];
  if (!jsonFilePath || !jsonFilePath.endsWith('.json')) {
    console.error('No valid JSON file provided. Please provide a valid JSON file path.');
    return;
  }
  const nueConfig = await loadConfig();
  // Determine the output path for the SQL file
  let outputFilePath = options.out || jsonFilePath.replace(/\.json$/, '.sql');
  try {

    let sql = '';
    if (nueConfig?.aiConfig && nueConfig.jsonsql?.ai) {
      sql = await JsonToSQL(fs.readFileSync(jsonFilePath, 'utf-8'));
    } else {
      // Read the JSON file
      const json = fs.readFileSync(jsonFilePath, 'utf-8');
      console.log(`JSON file read: ${json}`);
      sql = toSQL('table', JSON.parse(json));  // Assuming toSQL function is used to convert JSON to SQL
    }
    // Write the SQL to the file
    fs.writeFileSync(outputFilePath, sql);
    console.log(`SQL file created: ${outputFilePath}`);
  } catch (error) {
    console.error('Error processing the file:', error);
  }
}

