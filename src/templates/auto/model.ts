/* jshint indent: 2 */
import { Sequelize, DataTypes as SequelizeDataTypes } from 'sequelize';

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
        <% if (field.defaultValue) { %>
        defaultValue: <% if (typeof field.defaultValue === 'string') { %>'<%= field.defaultValue %>'<% } else { %><%= field.defaultValue %><% } %>,
        <% } %>
        <% if (field.comment) { %>comment: '<%= field.comment %>',<% } %>
      },
      <% }); %>
    },
    {
      tableName: '<%= tableName %>',
      timestamps: true,
      <% if (indexes.length > 0) { %>
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
  return table;
}
