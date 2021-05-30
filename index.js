const { serverSideTx, hocTypes } = require('@hoctail/patch-interface')

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
      Delete: 'action',
      Number: 'number',
    })
    cmds.onEvent('update of "Add"', poke_add)
    cmds.onEvent('update of "Delete"', poke_delete)
    if (!cmds.records.size) {
      cmds.insertRecordData({ Number: 1 })
    }
    // trigger event now
    // const rec = Array.from(cmds.records.values())[0]
    // rec.set('Add', new Date())
    // console.log('updated', rec.object())
  })
}

function poke_delete (hoc, data, tx) {
  console.log('poke_delete')
  const number = data.new.Number
  serverSideTx(hoc, store => {
    const { schema } = store.system
    const pokemons = schema.table('pokemons')
    const idsToDel = Array.from(pokemons.records.keys()).slice(-number)
    idsToDel.forEach(id => pokemons.deleteRecord(id))
  }, { id: data.schema })
}

async function poke_add (hoc, data, tx) {
  console.log('poke_add')
  const number = data.new.Number
  const Pokedex = require('pokedex-promise-v2')
  const pokedex = new Pokedex()

  const offset = hoc.sql('select count(1) from pokemons')[0].count
  
  const list = await pokedex.getPokemonsList({
    limit: number,
    offset: offset
  })
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
  poke_add,
  poke_delete,
}
