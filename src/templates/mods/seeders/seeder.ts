// Seeder up for {{moduleName}}
import { QueryInterface, DataTypes } from 'sequelize';


export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable('{{prefix}}_{{moduleName}}', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER
      },
      title: {
        type: DataTypes.STRING
      },
      content: {
        type: DataTypes.TEXT
      },
      category_id: {
        type: DataTypes.INTEGER
      },
      status: {
        type: DataTypes.INTEGER
      },
      poster: {
        type: DataTypes.STRING
      },
      create_time: {
        type: DataTypes.DATE
      },
      view_total: {
        type: DataTypes.INTEGER
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE
      }
    })
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable('{{prefix}}_{{moduleName}}')
  }
}
