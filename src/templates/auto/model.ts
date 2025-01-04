/* jshint indent: 2 */
export default function (sequelize: any, DataTypes: any) {
  const table = sequelize.define(
    '<%= tableName %>',
    {
      <% _.forEach(fields, function(field) { %>
      <%= field.name %>: {
        type: DataTypes.<%= field.type %>,
        <% if (field.allowNull) { %>allowNull: true,<% } else { %>allowNull: false,<% } %>
        <% if (field.primaryKey) { %>primaryKey: true,<% } %>
        <% if (field.autoIncrement) { %>autoIncrement: true,<% } %>
        <% if (field.defaultValue) { %>defaultValue: <%= field.defaultValue %>,<% } %>
        <% if (field.comment) { %>comment: '<%= field.comment %>',<% } %>
      },
      <% }); %>
    },
    {
      <% if (indexes.length > 0) { %>
      indexes: [
        <% _.forEach(indexes, function(index) { %>
        {
          fields: [
            <% _.forEach(index.fields, function(field) { %>
            { attribute: '<%= field.attribute %>' },
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
  // table.sync({ force: true });
  return table;
}
