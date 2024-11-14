const fs = require('fs');

// Check if the filename is provided in the command line args
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('WHERE IS THE .cal FILE?! HUH??');
  process.exit(1);
}

const filename = args[0];

// Read the .cal file
fs.readFile(filename, 'utf8', (err, data) => {
  if (err) {
    console.error(`I CANNOT READ THE DAMN FILE: ${err.message}`);
    process.exit(1);
  }

  if (!data.trim()) {
    console.error('Error: THE FILE HAS NOTHING IN IT.');
    process.exit(1);
  }

  // Process the file content
  processFile(data);
});

function processFile(data) {
  let inStartBlock = false;
  let hasStart = false;
  let hasEnd = false;

  const lines = data.split('\n');

  for (let line of lines) {
    line = line.trim();

    // Ignore comments (lines starting with #)
    if (line.startsWith('#') || line.length === 0) {
      continue;
    }

    // Handle start and end blocks
    if (line.startsWith('start')) {
      if (hasStart) {
        console.error('Error: WHY ANOTHER START BLOCK?');
        process.exit(1);
      }
      inStartBlock = true;
      hasStart = true;
      continue;
    }

    if (line.startsWith('end')) {
      if (!hasStart) {
        console.error('Error: END BLOCK BEFORE START BLOCK!?');
        process.exit(1);
      }
      hasEnd = true;
      break;
    }

    if (inStartBlock) {
      try {
        processLine(line);
      } catch (error) {
        console.error(`I CANT PROCESS A LINE: ${line}`);
        console.error(error.message);
        process.exit(1);
      }
    }
  }

  if (!hasStart) {
    console.error('Error: WHEN IS IT GOING TO START?');
    process.exit(1);
  }

  if (!hasEnd) {
    console.error('Error: NEVER-ENDING PAIN.');
    process.exit(1);
  }
}

function processLine(line) {
  if (line.startsWith('print')) {
    const expression = line.slice(5).trim(); // Extract the expression after 'print'
    if (!expression) {
      throw new Error('Error: THERE IS NO EXPRESSION PROVIDED AFTER PRINTING SOMETHING.');
    }

    const result = evaluateExpression(expression);
    console.log(result);
  } else if (line) {
    // If the line contains a calculation (not a print statement), evaluate it silently
    const result = evaluateExpression(line);
    // I could choose to handle results here, if i need it (e.g., store in variables) but since this is calc, a calculator but a programming language instead. nah
  }
}

function evaluateExpression(expression) {
  try {
    // Safely evaluate the expression using JavaScript's eval function
    // Ensure it only allows valid mathematical expressions
    const result = eval(expression);
    if (result === Infinity || result === -Infinity || isNaN(result)) {
      throw new Error('Error: INVAILD MAFF OPERATION (e.g., division by zero).');
    }
    return result;
  } catch (error) {
    throw new Error(`Error: BAD EXPRESSION: ${expression}`);
  }
}
