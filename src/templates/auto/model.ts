/* jshint indent: 2 */
import { Sequelize, DataTypes as SequelizeDataTypes } from 'sequelize';
import { format } from '#shared/format';

export default function (sequelize: Sequelize, DataTypes: typeof SequelizeDataTypes) {
  const table = sequelize.define(
    '<%= useName %>',
    {
      <% _.forEach(fields, function(field) { %>
      <%= field.name %>: {
        type: <%= field.type %>,
        allowNull: <%= field.allowNull ? 'true' : 'false' %>,
        <% if (field.primaryKey) { %>primaryKey: true,<% } %>
        <% if (field.autoIncrement) { %>autoIncrement: true,<% } %>
        <% if (field.defaultValue) { %>defaultValue: <%= field.defaultValue %>,<% } %>
        <% if (field.comment) { %>comment: '<%= field.comment %>',<% } %>
        <% if (field.get) { %>
        get() {
          return format(this.getDataValue('<%= field.name %>'), '<%= field.format %>');
        },
        <% } %>
      },
      <% }); %>
    },
    {
      tableName: '<%= tableName %>',
      timestamps: true,
      <% if (indexes && indexes.length > 0) { %>
      indexes: [
        <% _.forEach(indexes, function(index) { %>
        {
          fields: [
            <% _.forEach(index.fields, function(field) { %>
            { name: '<%= field.attribute %>' },
            <% }); %>
          ],
          name: '<%= index.name %>',
          <% if (index.unique) { %>unique: true,<% } %>
        },
        <% }); %>
      ],
      <% } %>
    }
  );

  <% if (relations && relations.length > 0) { %>
  table.associate = (models: any) => {
    <% _.forEach(relations, function(relation) { %>
    table.<%= relation.type %>(models.<%= relation.model %>, {
      as: '<%= relation.as %>',
      <% if (relation.through) { %>through: <%= relation.through %>,<% } %>
      foreignKey: '<%= relation.foreignKey %>'
      <% if (relation.otherKey) { %>,
      otherKey: '<%= relation.otherKey %>'<% } %>
    });
    <% }); %>
  };
  <% } %>

  return table;
}
