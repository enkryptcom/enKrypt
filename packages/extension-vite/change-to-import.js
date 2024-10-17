import fs from 'fs'
import path from 'path'

function replaceRequireWithImport(filePath) {
  let fileContent = fs.readFileSync(filePath, 'utf8')
  const requireRegex = /(\w+):\s*require\(([^)]+)\)/g
  let match
  const imports = []

  // Find all require statements in object literals
  while ((match = requireRegex.exec(fileContent)) !== null) {
    const variableName = match[1]
    const modulePath = match[2]
    imports.push(`import ${variableName} from ${modulePath};`)
    fileContent = fileContent.replace(match[0], `${variableName}`)
  }

  // Add imports at the top of the file
  if (imports.length > 0) {
    fileContent = `${imports.join('\n')}\n${fileContent}`
    fs.writeFileSync(filePath, fileContent, 'utf8')
  }
}

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file)
    if (fs.lstatSync(fullPath).isDirectory()) {
      processDirectory(fullPath)
    } else if (fullPath.endsWith('.ts')) {
      replaceRequireWithImport(fullPath)
    }
  })
}

const targetDirectory = './src' // Change this to your target directory
processDirectory(targetDirectory)
