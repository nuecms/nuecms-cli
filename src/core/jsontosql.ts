// Modules
import * as Utils from '../utils/type';


type SQLType = 'BOOLEAN' | 'TEXT' | 'INT' | 'DATE' | 'TIMESTAMP';

interface Lang {
  create: (name: string) => string;
  close: () => string;
  id: (name: string, type: string) => string;
  property: (name: string, type: string) => string;
  primary: (id: string) => string;
  foreign: (key: string, table: string, refKey: string) => string;
}

interface ProcessOptions {
  tableName?: string;
  parentTableName?: string;
  parentTableId?: string;
  parentTableIdType?: keyof typeof types;
  tableId?: string;
}

// Type Mapping
const types: { [key: string]: string } = {
  boolean: 'BOOLEAN',
  string: 'TEXT',
  number: 'INT',
  date: 'DATE',
  timestamp: 'TIMESTAMP',
  regexp: 'TEXT',
  undefined: 'TEXT',
  null: 'TEXT',
  uuid: 'CHAR(36)', // Added UUID mapping
};

const lang = {
  create: function (name: string): string {
    return `CREATE TABLE ${name} (`;
  },

  close: function (): string {
    return ');';
  },

  id: function (name: string, value: string): string {
    return `  ${name}_id ${value},`;
  },

  property: function (name: string, value: string): string {
    return `  ${name} ${value},`;
  },

  primary: function (id: string): string {
    return `  PRIMARY KEY (${id}),`;
  },

  foreign: function (key1: string, table: string, key2: string): string {
    return `  FOREIGN KEY (${key1}) REFERENCES ${table}(${key2}),`;
  },
};



// Add a helper function to check UUID format
function isUUID(value: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof value === 'string' && uuidRegex.test(value);
}

function processObject(obj: any, options: ProcessOptions): string[] {
  const { tableName, parentTableName, parentTableId, parentTableIdType, tableId } = options;

  // In-memory storage
  const keys = Object.keys(obj);
  const output: string[] = [];
  const tables: string[] = [];

  // Table variables
  let id: string | null = null;
  let idType = 'string';

  // Initialize Table
  output.push(lang.create(tableName as string));

  if (parentTableName) {
    output.push(lang.property(`${parentTableName}_${parentTableId}`, types[parentTableIdType || 'string']));
  }

  if (tableId && obj[tableId]) {
    id = tableId;
    idType = typeof obj[tableId];
  } else {
    // Obtain ID
    for (let i = 0; i < keys.length; i++) {
      if (keys[i].toLowerCase() === 'id' || keys[i].toLowerCase().indexOf('_id') > -1) {
        id = keys[i];
        idType = typeof obj[keys[i]];
        break;
      }
    }

    if (!id) {
      id = 'id';
      idType = parentTableIdType ? String(parentTableIdType) : idType;
      output.push(lang.property(id, types[idType]));
    }
  }

  // Create table properties
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = obj[key];
    let type: string;
    if (isUUID(value)) {
      type = 'uuid'; // Recognize as UUID type
    } else {
      type = Utils.isTimestamp(value) ? 'timestamp' : Utils.stringType(value).toLowerCase();
    }


    if (type === 'function') {
      continue;
    }

    // pojo
    if (type === 'object' && !Array.isArray(value)) {
      tables.push('');
      tables.push(processObject(value, {
        parentTableName: tableName,
        parentTableId: id!,
        parentTableIdType: idType,
        tableName: `${tableName}_${key}`
      }).join('\n'));
      continue;
    }

    // array
    if (type === 'object' || type === 'array') {
      if (typeof value[0] === 'object') {
        tables.push('');
        tables.push(processObject(value[0], {
          parentTableName: tableName,
          parentTableId: id!,
          parentTableIdType: idType,
          tableName: `${tableName}_${key}`
        }).join('\n'));
        continue;
      }

      tables.push('');
      tables.push(processObject({
        value: typeof value[0]
      }, {
        parentTableName: tableName,
        parentTableId: id!,
        parentTableIdType: idType,
        tableName: `${tableName}_${key}`
      }).join('\n'));

      continue;
    }

    output.push(lang.property(key, types[type]));
  }

  // Handle table keys
  output.push(lang.primary(id!));

  if (parentTableName) {
    output.push(lang.foreign(`${parentTableName}_id`, parentTableName, parentTableId!));
  }

  output[output.length - 1] = Utils.arrayLastItem<any>(output).substr(0, Utils.arrayLastItem<any>(output).length - 1);

  output.push(lang.close());

  return output.concat(tables);
}

export function toSQL(tableName: string, object: any, options: ProcessOptions): string {
  if (typeof tableName !== 'string') {
    object = tableName;
    tableName = 'generic';
  }

  return processObject(object, {
    tableName: tableName,
    ...options
  }).join('\n');
}
