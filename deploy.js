await hoctail.wait(() => {
  const { serverSideTx, hocTypes } = require('@hoctail/patch-interface')
  
  require('pokemon').main({
    ensureTableExist (schema, name, columns) {
      let table = schema.table(name)
      if (!table) {
	table = schema.addTable(name)
	for (const name in columns) {
	  table.ensureColumn(hocTypes.Json, name, columns[name])
	}
      }
      return table
    },
    stx (cb) {
      serverSideTx(hoc, ({ store }) => {
	cb(store)
      })
    },
  })
})
