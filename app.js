const fs = require('fs')
const fetch = require('node-fetch')
const neatCsv = require('neat-csv')
const JSON5 = require('json5')

/*
Clear all tables
TRUNCATE stock_layouts, compartments, locations, location_presets,
compartment_types, location_types, products, categories, category_types, inventories, inventory_statuses, inventory_status_types,
inventory_kinds, inventory_kind_types,
units_of_measure, unit_of_measure_types,
product_masters, product_inventory_options, stock_layout_inventory_options,
inventory_option_counts, final_inventory_counts RESTART IDENTITY;
*/

const DATA_DIRECTORY = 'data/'
const HASURA_GRAPHQL_URL = 'https://barbara-white-mice.herokuapp.com/v1/graphql'

async function populateTable(tableName, fileContent) {
  const rows = await neatCsv(fileContent)
  const body = `{"query": "mutation { insert_${tableName}(objects: ${JSON5.stringify(
    rows,
    { quote: '"' }
  )
    .replace(/\w+:""/g, '') // remove keys if value empty
    .replace(/"(\d+(\.\d+)?)"/g, '$1') // unquote numbers
    .replace(/"/g, '\\"')}) { affected_rows } }"}` // escape quotes

  return fetch(HASURA_GRAPHQL_URL, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => {
      if (res.status !== 200 && res.status !== 201) {
        throw new Error('Fail')
      }
      return res.json()
    })
    .then((resData) => {
      console.log(tableName)
      console.log(body)
      console.log(resData)
    })
    .catch((err) => {
      console.log(err)
    })
}

const filenames = fs.readdirSync(DATA_DIRECTORY)
filenames.reduce(async (lastPopulateTable, filename) => {
  const fileContent = fs.readFileSync(`${DATA_DIRECTORY}/${filename}`, 'utf-8')
  // nnn_table_name.csv => table_name
  const tableName = filename.slice(4, -4)
  if (lastPopulateTable) await lastPopulateTable
  return populateTable(tableName, fileContent)
}, null)
