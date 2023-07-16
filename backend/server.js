const express = require('express');
const multer = require('multer');
const cors = require('cors');
const csvtojson = require('csvtojson');
const fs = require('fs');
const _ = require('lodash');
const morgan = require('morgan'); // Import morgan

const upload = multer({ dest: 'uploads/' });

const app = express();

if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
}

if (!fs.existsSync('./dictionary')) {
    fs.mkdirSync('./dictionary');
}

app.use(cors());
app.use(morgan('combined')); // Use morgan as middleware

app.post('/upload', upload.single('file'), (req, res) => {
    const converter = csvtojson({
      delimiter: ',',
      headers: ['word', 'definition'],
    });
  
    converter
      .fromFile(req.file.path)
      .then((jsonObj) => {
        fs.unlinkSync(req.file.path); // Delete the CSV file now that we're done with it
  
        let units = _.chunk(jsonObj, 40); // Split words into units of 40
        units.forEach((unit, index) => {
          // Write each unit to a new JSON file
          fs.writeFileSync(`./dictionary/unit_${index + 1}.json`, JSON.stringify(unit, null, 2));
        });
  
        res.json({ message: 'File uploaded and processed successfully' }); // Send response here
      })
      .catch((err) => {
        console.log('Error during CSV to JSON conversion:', err);
        res.status(500).json({ error: 'Error occurred while converting CSV to JSON.' }); // Send error response here
      });
  });
  

app.get('/dictionary/:unit', (req, res) => {
    const unit = req.params.unit;

    fs.readFile(`dictionary/${unit}.json`, (err, data) => {
        if (err) {
            res.status(500).send('Error occurred while reading file.');
            return;
        }
        res.json(JSON.parse(data));
    });
});

app.get('/dictionary', (req, res) => {
    fs.readdir('./dictionary', (err, files) => {
        if (err) {
            res.status(500).send('Error occurred while reading directory.');
            return;
        }
        res.json(files.map(file => file.replace('.json', ''))); // Remove file extension
    });
});

app.delete('/dictionary/:unit/:index', (req, res) => {
    const unit = req.params.unit;
    const index = parseInt(req.params.index);

    fs.readFile(`./dictionary/${unit}.json`, 'utf8', (err, data) => {
        if (err) {
            console.log('Error during reading JSON file:', err);
            res.status(500).json({ error: 'Error occurred while reading JSON file.' });
            return;
        }

        let words = JSON.parse(data);

        // Check if index is valid
        if (index < 0 || index >= words.length) {
            res.status(400).json({ error: 'Invalid word index.' });
            return;
        }

        // Remove word from array
        words.splice(index, 1);

        // Write changes back to file
        fs.writeFile(`./dictionary/${unit}.json`, JSON.stringify(words, null, 2), (err) => {
            if (err) {
                console.log('Error during writing JSON file:', err);
                res.status(500).json({ error: 'Error occurred while writing JSON file.' });
                return;
            }

            res.json({ message: 'Word deleted successfully.' });
        });
    });
});

app.listen(5000, () => {
    console.log('Server is running on port 5000');
});
