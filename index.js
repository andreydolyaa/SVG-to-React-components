import fs from "fs";
import path from "path";

const folderPath = "./feather";
const outputFolder = "FeatherIconsReactComponents";
let progress = 0;
let filesList = null;

function run() {
  createOutputFolder();
  filesList = fs.readdirSync(folderPath);
  readFolderContents();
  createIndex();
}

function readFolderContents() {
  filesList.forEach((file) => {
    const filePath = path.join(folderPath, file);
    iterateSVGs(filePath);
  });
}

function iterateSVGs(filePath) {
  fs.readFile(filePath, "utf8", (error, data) => {
    if (error) console.error(`Error reading ${filePath}: `, error);
    else createReactComponent(filePath, data);
  });
}

function createOutputFolder() {
  fs.mkdir(outputFolder, (error) => {
    if (error) console.error("Failed to create folder: ", outputFolder);
    else console.log(`Folder - ${outputFolder} created successfully`);
  });
}

function createReactComponent(filePath, data) {
  const name = trimComponentName(filePath);
  const content = createFileContent(name, data);
  writeComponentToFile(name, content);
}

function trimComponentName(file) {
  const result = file.replace(".svg", "");
  const removedPath = result.replace("feather\\", "");
  const sections = removedPath.split("-");
  for (let i = 0; i < sections.length; i++)
    sections[i] = sections[i].charAt(0).toUpperCase() + sections[i].slice(1);
  return sections.join("");
}

function createFileContent(fileName, data) {
  const fileContent = modifySVG(data, fileName);
  return `
  export const ${fileName} = () => {
    return ${fileContent};
  };
  `;
}

function writeComponentToFile(name, content) {
  fs.writeFile(`./${outputFolder}/${name}.js`, content, (error) => {
    if (error) console.error("Error while creating file: ", error);
    else {
      progress++;
      console.log(
        `[ %${((progress / 287) * 100).toFixed(2)} ] ${name}.js created successfuly`
      );
    }
  });
}

function modifySVG(data, fileName) {
  const modified = data.split(" ");
  for (let i = 0; i < modified.length; i++) {
    if (modified[i] === 'stroke-width="2"') modified[i] = 'strokeWidth="1.5"';
    if (modified[i] === 'stroke-linecap="round"') modified[i] = 'strokeLinecap="round"';
    if (modified[i] === 'stroke-linejoin="round"') modified[i] = 'strokeLinejoin="round"';
    if (modified[i] === 'class="feather')
      modified[i] = `className="icon-${fileName.toLowerCase()}`;
  }
  return modified.join(" ");
}

function createIndex() {
  let content = "";
  filesList.forEach((file, index) => {
    const cleanFile = trimComponentName(file);
    content += `import { ${cleanFile} } from "./${cleanFile}.js"\n`;
    if (index === filesList.length - 1 || index === filesList.length) {
      content += `\nexport const iconsMapping = { ${filesList.map(
        (x) => "\n" + trimComponentName(x)
      )} }`;
    }
  });
  writeToIndexFile(content);
}

function writeToIndexFile(content) {
  fs.writeFile(`./${outputFolder}/index.js`, content, (error) => {
    if (error) console.error("Error while creating file: ", error);
    else console.log("index.js file created");
  });
}

run();
