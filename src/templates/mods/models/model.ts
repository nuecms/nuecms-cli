// Sequelize model for {{moduleName}}
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../../database'; // Assuming the database instance is in src/database/index.ts

// Define attribute interface
interface {{moduleName}}Attributes {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define creation attribute interface
interface {{moduleName}}CreationAttributes extends Optional<{{moduleName}}Attributes, 'id'> {}

// Define model class
class {{moduleName}} extends Model<{{moduleName}}Attributes, {{moduleName}}CreationAttributes>
  implements {{moduleName}}Attributes {
  public id!: number;
  public name!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

// Initialize model
{{moduleName}}.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: '{{moduleName}}',
    timestamps: true,
  }
);

export default {{moduleName}};
