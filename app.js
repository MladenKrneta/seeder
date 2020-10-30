const neatCsv = require("neat-csv");
const csv = require("csv-parser");
const fs = require("fs");
const fetch = require("node-fetch");
const Papa = require("papaparse");

// Clear all tables

// TRUNCATE stock_layouts, compartments, locations, location_presets,
// compartment_types, location_types, products, categories, category_types, inventories, inventory_statuses, inventory_status_types,
// inventory_kinds, inventory_kind_types,
// units_of_measure, unit_of_measure_types,
// product_masters, product_inventory_options, stock_layout_inventory_options,
// inventory_option_counts, final_inventory_counts RESTART IDENTITY;

const dir = "./Data/";
const URL = "https://barbara-white-mice.herokuapp.com/v1/graphql";

fs.readdir(dir, function (err, filenames) {
  if (err) {
    onError(err);
    return;
  }
  filenames.forEach(function (filename) {
    const content = fs.readFileSync(dir + filename, "utf-8");
    if (err) {
      console.error(err);
      return;
    }
    const table = filename.slice(4, -4); // instead of 0 put number of starting strings
    let products = [];
    fs.createReadStream(dir + filename)
      .pipe(csv())
      .on("data", (data) => products.push(data))
      .on("end", () => {
        console.log(products);
        const keys = Object.keys(products[0]);

        let items = "";
        products.forEach((element) => {
          items = items + "{";
          keys.forEach((key) => {
            if (element[key]) {
              if (parseFloat(element[key])) {
                items = items + key + " : " + element[key] + ",";
              } else {
                items = items + key + ' : "' + element[key] + '",';
              }
            }
          });
          items = items.slice(0, -1);
          items = items + "}";
        });

        const kveri = {
          query: `
    mutation {
      insert_${table}(objects: [ ${items} ]) { 
        affected_rows
      }
    }
    `,
        };
        //console.log(kveri);
          fetch(URL, {
            method: "POST",
            body: JSON.stringify(kveri),
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then((res) => {
              if (res.status !== 200 && res.status !== 201) {
                throw new Error("Fail");
              }
              return res.json();
            })
            .then((resData) => {
              console.log(resData);
            })
            .catch((err) => {
              console.log(err);
            });

          console.log(response);

      });
    // products = []
    //console.log("Filenemae : " + filename)
    //console.log("file content : " +content);
    //console.log("neatCsv parsed file content : ");
    //console.log(products)

    // const keys = Object.keys(products[0]);

    // let items = "";
    // products.forEach((element) => {
    //   items = items + "{";
    //   keys.forEach((key) => {
    //     if (element[key]) {
    //       if (parseFloat(element[key])) {
    //         items = items + key + " : " + element[key] + ",";
    //       } else {
    //         items = items + key + ' : "' + element[key] + '",';
    //       }
    //     }
    //   });
    //   items = items.slice(0, -1);
    //   items = items + "}";
    // });

    // const kveri = {
    //   query: `
    // mutation {
    //   insert_${table}(objects: [ ${items} ]) {
    //     affected_rows
    //   }
    // }
    // `,
    // };
    // //console.log(kveri);

    // return fetch(URL, {
    //   method: "POST",
    //   body: JSON.stringify(kveri),
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    // })
    //   .then((res) => {
    //     if (res.status !== 200 && res.status !== 201) {
    //       setTimeout(()=>{console.log('responses not 200')},1000)
    //       throw new Error("Fail");
    //     }
    //     setTimeout(()=>{console.log('responses are 200 or 2001')},1000)
    //     return res.json();
    //   })
    //   .then((resData) => {
    //     setTimeout(()=>{console.log('log response data')},1000)
    //     console.log(resData);
    //   })
    //   .catch((err) => {
    //     setTimeout(()=>{console.log('error timeout wait log')},1000)
    //     console.log(err);
    //   });
  });
});

/* readFiles(
  dir,
  function (filename, content) {
    fs.readFile(dir + filename, async (err, data) => {
      console.log("Files : " + filename)
      if (err) {
        console.error(err);
        return;
      }

      const table = filename.slice(4, -4); // instead of 0 put number of starting strings
      const products = await neatCsv(data);
      const keys = Object.keys(products[0]);

      let items = "";
      products.forEach((element) => {
        items = items + "{";
        keys.forEach((key) => {
          if (element[key]) {
            if (parseFloat(element[key])) {
              items = items + key + " : " + element[key] + ",";
            } else {
              items = items + key + ' : "' + element[key] + '",';
            }
          }
        });
        items = items.slice(0, -1);
        items = items + "}";
      });

      const kveri = {
        query: `
      mutation {
        insert_${table}(objects: [ ${items} ]) { 
          affected_rows
        }
      }
      `,
      };
      console.log(kveri);

      fetch(URL, {
        method: "POST",
        body: JSON.stringify(kveri),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Fail");
          }
          return res.json();
        })
        .then((resData) => {
          console.log(resData);
        })
        .catch((err) => {
          console.log(err);
        });

      setTimeout(() => {
        console.log("waiting...");
      }, 1000);
    });
  },
  function (err) {
    throw err;
  }
);
 */
