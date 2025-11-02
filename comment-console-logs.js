#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else if (fullPath.match(/\.(ts|tsx)$/)) {
      arrayOfFiles.push(fullPath);
    }
  });
  
  return arrayOfFiles;
}

function commentConsoleLogs(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let modified = false;
  const newLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    // 跳過已經註解的行
    if (trimmed.startsWith('//')) {
      newLines.push(line);
      continue;
    }
    
    // 檢查是否包含 console.log
    if (trimmed.includes('console.log(') || trimmed.includes('console.error(') || 
        trimmed.includes('console.warn(') || trimmed.includes('console.info(')) {
      
      // 獲取縮排
      const indent = line.match(/^(\s*)/)[1];
      
      // 單行 console.log
      if (trimmed.endsWith(')') || trimmed.endsWith(');')) {
        newLines.push(indent + '// ' + trimmed);
        modified = true;
      } 
      // 多行 console.log 開始
      else {
        newLines.push(indent + '// ' + trimmed);
        modified = true;
        
        // 繼續註解直到找到結束的 )
        let bracketCount = (trimmed.match(/\(/g) || []).length - (trimmed.match(/\)/g) || []).length;
        i++;
        
        while (i < lines.length && bracketCount > 0) {
          const nextLine = lines[i];
          const nextIndent = nextLine.match(/^(\s*)/)[1];
          const nextTrimmed = nextLine.trim();
          
          bracketCount += (nextTrimmed.match(/\(/g) || []).length - (nextTrimmed.match(/\)/g) || []).length;
          
          if (nextTrimmed) {
            newLines.push(nextIndent + '// ' + nextTrimmed);
          } else {
            newLines.push(nextLine);
          }
          i++;
        }
        i--; // 調整回去因為外層循環會 i++
      }
      continue;
    }
    
    newLines.push(line);
  }
  
  if (modified) {
    fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
    return true;
  }
  return false;
}

// 主程序
const srcDir = path.join(__dirname, 'src');

console.log('掃描文件中...');
const files = getAllFiles(srcDir);
let modifiedCount = 0;
let totalFiles = files.length;

console.log(`找到 ${totalFiles} 個文件，開始註解 console.log...`);

files.forEach(file => {
  try {
    if (commentConsoleLogs(file)) {
      modifiedCount++;
      console.log(`✓ ${path.relative(srcDir, file)}`);
    }
  } catch (error) {
    console.error(`✗ ${path.relative(srcDir, file)}: ${error.message}`);
  }
});

console.log(`\n完成! 修改了 ${modifiedCount} 個文件`);

