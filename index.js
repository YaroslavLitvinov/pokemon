const { serverSideTx, hocTypes } = require('@hoctail/patch-interface')

function ensureTableExist (schema, name, columns) {
  let table = schema.table(name)
  if (!table) {
    table = schema.addTable(name)
    for (const name in columns) {
      table.addColumn(hocTypes.Json, name, columns[name])
    }
  }
  return table
}

function main () {
  let table
  console.log('main')
  serverSideTx(hoc, store => {
    const { schema } = store.system

    const pokemons = ensureTableExist(schema, 'pokemons', {
      Name: 'singleLine',
    })
    
    const cmds = ensureTableExist(schema, 'cmds', {
      Add: 'action',
    })
    cmds.onEvent('update of "Add"', poke_action)
    if (!cmds.records.size) {
      cmds.insertRecordData({})
    }
    const rec = Array.from(cmds.records.values())[0]
    rec.set('Add', new Date())
    console.log('updated', rec.object())
  })
}

async function poke_action (hoc, data, tx) {
  console.log('poke_action')
  const Pokedex = require('pokedex-promise-v2')
  const pokedex = new Pokedex()

  const offset = hoc.sql('select count(1) from pokemons')[0].count
  
  const list = await pokedex.getPokemonsList({
    limit: 1,
    offset: offset
  })
  console.log(offset, 'pokemons', JSON.stringify(list))
  
  serverSideTx(hoc, store => {
    const { schema } = store.system
    const pokemons = schema.table('pokemons')
    list.results.forEach(({ name, url }) => {
      console.log('add pokemon', name)
      if (!pokemons.findRecordByValues({ Name: name }) ) {
	pokemons.insertRecordData({
	  Name: name
	})
      }
    })
  }, { id: data.schema })
}

module.exports = {
  main,
  poke_action,
}
