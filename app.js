const neatCsv = require("neat-csv");
const fs = require("fs");
const fetch = require("node-fetch");

const dir = "D:/OneDrive/TeamFolders/WhiteMice/03 Data/Data Model Seeder Load/";
const URL = "https://barbara-white-mice.herokuapp.com/v1/graphql";

function readFiles(dirname, onFileContent, onError) {
  fs.readdir(dirname, function (err, filenames) {
    if (err) {
      onError(err);
      return;
    }
    filenames.forEach(function (filename) {
      fs.readFile(dirname + filename, "utf-8", function (err, content) {
        if (err) {
          onError(err);
          return;
        }
        onFileContent(filename, content);
      });
    });
  });
}

readFiles(
  dir,
  function (filename, content) {
    fs.readFile(dir + filename, async (err, data) => {
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
          if(element[key]){
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
    });
  },
  function (err) {
    throw err;
  }
);
