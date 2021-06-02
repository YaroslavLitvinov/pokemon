await hoctail.wait(() => {

  function ensureTableExist (schema, name, columns) {
    let table = schema.table(name)
    if (!table) {
      table = schema.addTable(name)
      for (const name in columns) {
	table.ensureColumn(hocTypes.Json, name, columns[name])
      }
    }
    return table
  }

  
  require('pokemon').main({
    ensureTableExist
  })
})
