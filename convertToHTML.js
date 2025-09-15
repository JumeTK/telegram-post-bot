const fs = require('fs').promises;
const data = require('./data.json');

async function convertToHTML() {
  const updatedData = data.map(post => {
    let text = post.text;
    // Replace **text** with <b>text</b>
    text = text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
    // Remove escaping for parentheses
    text = text.replace(/\\([()])/g, '$1');
    return { ...post, text };
  });

  await fs.writeFile('data.json', JSON.stringify(updatedData, null, 2));
  console.log('Converted data.json to HTML formatting');
}

convertToHTML().catch(err => console.error(err));
