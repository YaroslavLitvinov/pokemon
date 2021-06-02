const Pokedex = require('pokedex-promise-v2')
const pokedex = new Pokedex()

function main (api) {
  let table
  api.stx(store => {
    const { schema } = store.system
    const pokemons = api.ensureTableExist(schema, 'pokemons', {
      Name: 'singleLine',
    })
    const cmds = api.ensureTableExist(schema, 'cmds', {
      Add: 'action',
      Delete: 'action',
      Number: 'number',
    })
    cmds.column('Add').setAction(poke_add)
    //cmds.column('Add').setAction(e => hoc.require('pokemon').poke_add(e))
    cmds.column('Delete').setAction(e => hoc.require('pokemon').poke_delete(e))
    if (!cmds.records.size) {
      cmds.insertRecordData({ Number: 1 })
    }
  })
}

function poke_delete (event) {
  event.stx(({ root }) => {
    const number = root.triggerRecord().column('Number').value
    const { schema } = root.system
    const pokemons = schema.table('pokemons')
    const idsToDel = Array.from(pokemons.records.keys()).slice(-number)
    idsToDel.forEach(id => pokemons.deleteRecord(id))
  })
}

async function poke_add (event) {
  let numer, offset
  event.stx(({ root }) => {
    number = root.triggerRecord().column('Number').value
    offset = root.triggerSchema().table('pokemons').records.size
  })

  const list = await pokedex.getPokemonsList({
    limit: number,
    offset: offset
  })
  event.stx(({ root }) => {
    const pokemons = root.system.schema.table('pokemons')
    list.results.forEach(({ name, url }) => {
      console.log('add pokemon', name)
      if (!pokemons.findRecordByValues({ Name: name }) ) {
	pokemons.insertRecordData({
	  Name: name
	})
      }
    })
  })
}

module.exports = {
  main,
  poke_add,
  poke_delete,
}
