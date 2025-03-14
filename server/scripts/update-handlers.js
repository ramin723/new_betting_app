import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.join(__dirname, '..', 'api');

// الگوهای جایگزینی
const replacements = [
  {
    from: /import\s*{\s*[^}]*eventHandler[^}]*}\s*from\s*['"]h3['"]/g,
    to: `import { defineEventHandler, createError, getQuery } from 'h3'`
  },
  {
    from: /export\s+default\s+eventHandler/g,
    to: 'export default defineEventHandler'
  },
  {
    from: /import\s+.*\s+from\s+['"]\.\.\/\.\.\/\.\.\/middleware\/auth['"];?\s*/g,
    to: `import { useAuth } from '../../../middleware/auth';`
  },
  {
    from: /import\s+.*\s+from\s+['"]\.\.\/\.\.\/\.\.\/middleware\/access-control['"];?\s*/g,
    to: `import { checkResourceAccess, requireAdmin } from '../../../middleware/access-control';`
  },
  {
    from: /await\s+auth\.useAuth/g,
    to: 'await useAuth'
  },
  {
    from: /await\s+accessControl\.(checkResourceAccess|requireAdmin)/g,
    to: 'await $1'
  }
];

// تابع بازگشتی برای پیمایش دایرکتوری‌ها
const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.js')) {
      updateFile(fullPath);
    }
  }
};

// به‌روزرسانی محتوای فایل
const updateFile = (filePath) => {
  console.log(`Processing: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  
  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }
  
  fs.writeFileSync(filePath, content, 'utf8');
};

// شروع پردازش
console.log('Starting API handlers update...');
processDirectory(API_DIR);
console.log('API handlers update completed!'); 