const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Theme class mappings
const themeClassMappings = {
  // Background colors
  'bg-white': 'bg-white dark:bg-gray-900',
  'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
  'bg-gray-100': 'bg-gray-100 dark:bg-gray-800',
  'bg-gray-200': 'bg-gray-200 dark:bg-gray-700',
  'bg-slate-50': 'bg-slate-50 dark:bg-gray-900',

  // Text colors
  'text-gray-900': 'text-gray-900 dark:text-gray-100',
  'text-gray-800': 'text-gray-800 dark:text-gray-200',
  'text-gray-700': 'text-gray-700 dark:text-gray-300',
  'text-gray-600': 'text-gray-600 dark:text-gray-400',
  'text-gray-500': 'text-gray-500 dark:text-gray-400',
  'text-black': 'text-gray-900 dark:text-gray-100',

  // Border colors
  'border-gray-200': 'border-gray-200 dark:border-gray-700',
  'border-gray-300': 'border-gray-300 dark:border-gray-600',
  'border-gray-100': 'border-gray-100 dark:border-gray-800',

  // Hover states
  'hover:bg-gray-50': 'hover:bg-gray-50 dark:hover:bg-gray-800',
  'hover:bg-gray-100': 'hover:bg-gray-100 dark:hover:bg-gray-700',
  'hover:bg-gray-200': 'hover:bg-gray-200 dark:hover:bg-gray-600',
  'hover:text-gray-900': 'hover:text-gray-900 dark:hover:text-gray-100',
  'hover:text-gray-700': 'hover:text-gray-700 dark:hover:text-gray-300',

  // Focus states
  'focus:bg-white': 'focus:bg-white dark:focus:bg-gray-800',
  'focus:border-gray-300': 'focus:border-gray-300 dark:focus:border-gray-600',
};

// Files to process
const filesToProcess = [
  'app/**/*.tsx',
  'components/**/*.tsx',
];

function fixThemeClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file already has dark mode classes
  const hasDarkMode = content.includes('dark:');

  if (!hasDarkMode) {
    console.log(`Processing: ${filePath}`);

    // Replace standalone classes with theme-aware versions
    Object.entries(themeClassMappings).forEach(([oldClass, newClass]) => {
      // Create regex to match the class in className strings
      const regex = new RegExp(`className=["'\`]([^"'\`]*\\b${oldClass}\\b[^"'\`]*)["'\`]`, 'g');

      if (regex.test(content)) {
        content = content.replace(regex, (match, classString) => {
          // Only replace if the dark variant isn't already there
          if (!classString.includes('dark:')) {
            const newClassString = classString.replace(
              new RegExp(`\\b${oldClass}\\b`, 'g'),
              newClass
            );
            modified = true;
            return match.replace(classString, newClassString);
          }
          return match;
        });
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, content);
      console.log(`  ✓ Fixed theme classes in ${filePath}`);
      return true;
    }
  }

  return false;
}

function processFiles() {
  let totalFixed = 0;

  filesToProcess.forEach(pattern => {
    const files = glob.sync(pattern, {
      cwd: path.join(__dirname, '..'),
      absolute: true,
    });

    files.forEach(file => {
      if (fixThemeClasses(file)) {
        totalFixed++;
      }
    });
  });

  console.log(`\n✅ Fixed theme classes in ${totalFixed} files`);
}

// Run the fixes
processFiles();