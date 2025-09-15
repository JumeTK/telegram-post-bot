const fs = require('fs').promises;
const data = require('./data.json');

async function addLineSpaces() {
  const updatedData = data.map(post => {
    const lines = post.text.split('\n');
    // Assuming structure: title\n[description lines]\nርቀት\nህብረ ክዋክብት
    const title = lines[0]; // <b>Title</b>
    const description = lines.slice(1, -2).join('\n'); // All lines except title and last two
    const subtitles = lines.slice(-2); // Last two lines (ርቀት, ህብረ ክዋክብት)
    const newText = `${title}\n\n${description}\n\n${subtitles.join('\n')}`;
    return { ...post, text: newText };
  });

  await fs.writeFile('data.json', JSON.stringify(updatedData, null, 2));
  console.log('Updated data.json with line spaces');
}

addLineSpaces().catch(err => console.error(err));
